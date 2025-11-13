import React, { ReactNode } from 'react';
import { describe, expect, it, beforeEach, beforeAll, afterAll, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useBookingStateMachine } from '../useBookingStateMachine';
import type { BookingCheckoutPayload } from '../useBookingStateMachine';
import type { QueueStatus, HoldAttemptResult } from '@/lib/services/bookingQueueClient';

vi.mock('@/lib/services/bookingQueueClient', async () => {
  const actual = await vi.importActual<typeof import('@/lib/services/bookingQueueClient')>(
    '@/lib/services/bookingQueueClient'
  );
  return {
    ...actual,
    bookingQueueClient: {
      attemptHold: vi.fn<[], Promise<HoldAttemptResult>>(),
      joinQueue: vi.fn<[], Promise<HoldAttemptResult>>(),
      getQueueStatus: vi.fn().mockResolvedValue(null),
      leaveQueue: vi.fn(),
      extendHold: vi.fn(),
      claimHold: vi.fn(),
  subscribeToQueue: vi.fn().mockReturnValue({ stop: vi.fn(), isRealtime: false }),
    },
  };
});

vi.mock('@/lib/services/api-client', () => ({
  bookings: {
    create: vi.fn().mockResolvedValue({ data: { orderId: 'ord-123' } }),
  },
}));

import { bookingQueueClient } from '@/lib/services/bookingQueueClient';
import { bookings } from '@/lib/services/api-client';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return { queryClient, wrapper };
};

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));
const originalConsoleError = console.error;

beforeAll(() => {
  vi.spyOn(console, 'error').mockImplementation((...args: Parameters<typeof console.error>) => {
    const [message] = args;
    if (typeof message === 'string' && message.includes('not wrapped in act')) {
      return;
    }
    originalConsoleError(...args);
  });
});

afterAll(() => {
  vi.restoreAllMocks();
});

describe('useBookingStateMachine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('transitions to ready-with-hold when hold is acquired immediately', async () => {
    (bookingQueueClient.attemptHold as any).mockResolvedValue({
      status: 'acquired',
      holdId: 'hold-1',
      holdToken: 'token-1',
      expiresAt: new Date(Date.now() + 600000).toISOString(),
      correlationId: 'corr-1',
    });

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useBookingStateMachine(), { wrapper });

    await act(async () => {
      result.current.actions.start({
        eventId: 'evt-1',
        selections: [{ categoryId: 'cat-1', quantity: 2 }],
      });
      await flushPromises();
    });

    await waitFor(() => {
      expect(result.current.state.stage).toBe('ready-with-hold');
      expect(result.current.state.holdId).toBe('hold-1');
    });

    await act(async () => {
      await flushPromises();
    });
  });

  it('extends an active hold and updates expiry', async () => {
    const initialExpiry = new Date(Date.now() + 2 * 60 * 1000).toISOString();
    const extendedExpiry = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    (bookingQueueClient.attemptHold as any).mockResolvedValue({
      status: 'acquired',
      holdId: 'hold-extend',
      holdToken: 'token-extend',
      expiresAt: initialExpiry,
      correlationId: 'corr-extend',
    });

    (bookingQueueClient.extendHold as any).mockResolvedValue({
      success: true,
      holdId: 'hold-extend',
      holdToken: 'token-extend',
      holdExpiresAt: extendedExpiry,
      correlationId: 'corr-extend',
    });

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useBookingStateMachine(), { wrapper });

    act(() => {
      result.current.actions.start({
        eventId: 'evt-extend',
        requesterId: 'user-extend',
        selections: [{ categoryId: 'cat-extend', quantity: 1 }],
      });
    });

    await waitFor(() => {
      expect(result.current.state.stage).toBe('ready-with-hold');
      expect(result.current.state.holdToken).toBe('token-extend');
    });

    await act(async () => {
      await result.current.actions.extendHold();
    });

    expect(bookingQueueClient.extendHold).toHaveBeenCalledWith('token-extend', expect.any(String));
    expect(result.current.state.holdExpiresAt).toBe(extendedExpiry);
  });

  it('enters queue when hold not available then updates via queue status', async () => {
    (bookingQueueClient.attemptHold as any).mockResolvedValue({
      status: 'queued',
      queueId: 'queue-1',
      position: 5,
      etaSeconds: 120,
      correlationId: 'corr-queue',
    });

    const queueStatusCallbacks: ((status: QueueStatus) => void)[] = [];
    (bookingQueueClient.subscribeToQueue as any).mockImplementation((_queueId: string, onStatus: (status: QueueStatus) => void) => {
      queueStatusCallbacks.push(onStatus);
  return { stop: vi.fn(), isRealtime: false };
    });
    (bookingQueueClient.claimHold as any).mockResolvedValue({
      success: true,
      holdId: 'hold-queue',
      holdToken: 'token-queue',
      holdExpiresAt: new Date(Date.now() + 600000).toISOString(),
    });

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useBookingStateMachine(), { wrapper });

    await act(async () => {
      result.current.actions.start({
        eventId: 'evt-2',
        selections: [{ categoryId: 'cat-2', quantity: 1 }],
      });
      await flushPromises();
    });

    await waitFor(() => {
      expect(result.current.state.stage).toBe('in-queue');
    });

    await act(async () => {
      queueStatusCallbacks.forEach((cb) =>
        cb({ status: 'ready', queueId: 'queue-1', holdToken: 'token-ready', holdExpiresAt: new Date(Date.now() + 600000).toISOString() })
      );
      await flushPromises();
    });

    await waitFor(() => {
      expect(result.current.state.stage).toBe('ready-with-hold');
      expect(result.current.state.holdToken).toBeTruthy();
    });

    await act(async () => {
      await flushPromises();
    });
  });

  it('runs end-to-end queue -> claim -> checkout flow', async () => {
    const holdExpiresAt = new Date(Date.now() + 600000).toISOString();
    (bookingQueueClient.attemptHold as any).mockResolvedValue({
      status: 'queued',
      queueId: 'queue-e2e',
      position: 10,
      etaSeconds: 300,
      correlationId: 'corr-e2e',
    });

    let queueCallback: ((status: QueueStatus) => void) | undefined;
    (bookingQueueClient.subscribeToQueue as any).mockImplementation((_queueId: string, onStatus: (status: QueueStatus) => void) => {
      queueCallback = onStatus;
  return { stop: vi.fn(), isRealtime: false };
    });

    (bookingQueueClient.claimHold as any).mockResolvedValue({
      success: true,
      holdId: 'hold-e2e',
      holdToken: 'token-e2e',
      holdExpiresAt,
    });

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useBookingStateMachine(), { wrapper });

    await act(async () => {
      result.current.actions.start({
        eventId: 'evt-e2e',
        selections: [{ categoryId: 'vip', quantity: 2 }],
      });
      await flushPromises();
    });

    await waitFor(() => expect(result.current.state.stage).toBe('in-queue'));

    await act(async () => {
      queueCallback?.({ status: 'ready', queueId: 'queue-e2e', holdToken: 'token-e2e', holdExpiresAt });
      await flushPromises();
    });

    await waitFor(() => expect(result.current.state.stage).toBe('ready-with-hold'));

    const checkoutPayload: BookingCheckoutPayload = {
      eventId: 'evt-e2e',
      attendee: {
        firstName: 'Ayu',
        lastName: 'Santoso',
        email: 'ayu@example.com',
        phone: '+628123456789',
      },
      selections: [{ categoryId: 'vip', quantity: 2 }],
      paymentMethod: 'credit-card',
    };

    const checkoutResult = await result.current.actions.checkout(checkoutPayload);

    expect(bookings.create).toHaveBeenCalled();
    const [, options] = (bookings.create as any).mock.calls[0];
    expect(options?.idempotencyKey).toBeTruthy();
    expect(checkoutResult.success).toBe(true);
    expect(checkoutResult.orderId).toBe('ord-123');

    await act(async () => {
      await flushPromises();
    });
  });
});
