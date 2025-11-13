import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  bookingQueueClient,
  HoldAttemptPayload,
  HoldAttemptResult,
  HoldClaimResponse,
  QueueStatus,
  SelectionInput,
} from '../services/bookingQueueClient';
import { bookings } from '../services/api-client';
import { azureMonitoring } from '../services/azure-monitoring';
import { BOOKING_QUEUE } from '../constants';
import { logger } from '../services/logger';

export type BookingStage =
  | 'idle'
  | 'trying-hold'
  | 'in-queue'
  | 'ready-with-hold'
  | 'expired'
  | 'error';

export type BookingCheckoutPayload = {
  eventId: string;
  attendee: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  selections: SelectionInput[];
  paymentMethod: string;
};

export type BookingStateSnapshot = {
  stage: BookingStage;
  eventId?: string;
  selections: SelectionInput[];
  queueId?: string;
  queuePosition?: number;
  queueEtaSeconds?: number;
  holdId?: string;
  holdToken?: string;
  holdExpiresAt?: string;
  correlationId?: string;
  requesterId?: string;
  isRealtimeActive: boolean;
  error?: string;
  lastUpdated: number;
};

export type BookingActions = {
  start: (input: { eventId: string; selections: SelectionInput[]; requesterId?: string }) => void;
  cancelQueue: () => Promise<void>;
  extendHold: () => Promise<void>;
  reset: () => void;
  checkout: (payload: BookingCheckoutPayload) => Promise<{ success: boolean; orderId?: string; error?: string }>;
};

export type BookingStateMachine = {
  state: BookingStateSnapshot;
  actions: BookingActions;
  isLoading: boolean;
  isCheckoutPending: boolean;
  isExtending: boolean;
  queueStatus?: QueueStatus | null;
  startError?: string;
};

const STORAGE_KEY = 'eventix.booking.session';

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
};

const safeSessionStorage = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return window.sessionStorage;
  } catch (error) {
    logger.warn('Session storage unavailable', { error });
    return null;
  }
};

const defaultState = (): BookingStateSnapshot => ({
  stage: 'idle',
  selections: [],
  isRealtimeActive: false,
  lastUpdated: Date.now(),
});

const loadInitialState = (): BookingStateSnapshot => {
  const storage = safeSessionStorage();
  if (!storage) {
    return defaultState();
  }

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultState();
    }
    const parsed = JSON.parse(raw) as BookingStateSnapshot;
    if (parsed.holdExpiresAt && new Date(parsed.holdExpiresAt).getTime() < Date.now()) {
      return defaultState();
    }
    return {
      ...defaultState(),
      ...parsed,
    };
  } catch (error) {
    logger.warn('Failed to parse stored booking state', { error });
    return defaultState();
  }
};

const persistState = (state: BookingStateSnapshot) => {
  const storage = safeSessionStorage();
  if (!storage) {
    return;
  }

  if (state.stage === 'idle') {
    storage.removeItem(STORAGE_KEY);
    return;
  }

  const snapshot: BookingStateSnapshot = {
    ...state,
    lastUpdated: Date.now(),
  };

  storage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
};

function calculatePollIntervalSeconds(position?: number, etaSeconds?: number): number {
  if (position && position > 20) {
    return Math.min(BOOKING_QUEUE.MAX_POLL_INTERVAL_MS, BOOKING_QUEUE.POLL_INTERVAL_MS * 3);
  }
  if (etaSeconds && etaSeconds < 60) {
    return Math.max(BOOKING_QUEUE.POLL_INTERVAL_MS / 2, 2000);
  }
  return BOOKING_QUEUE.POLL_INTERVAL_MS;
}

export function useBookingStateMachine(): BookingStateMachine {
  const queryClient = useQueryClient();
  const [state, setState] = useState<BookingStateSnapshot>(() => loadInitialState());
  const stateRef = useRef(state);
  const [startError, setStartError] = useState<string | undefined>(undefined);

  useEffect(() => {
    stateRef.current = state;
    persistState(state);
  }, [state]);

  const clearState = useCallback(() => {
    setState(defaultState());
    setStartError(undefined);
  }, []);

  const applyHoldResult = useCallback((result: HoldAttemptResult, correlationId: string, _payload: HoldAttemptPayload) => {
    if (result.status === 'acquired') {
      setState((prev) => ({
        ...prev,
        stage: 'ready-with-hold',
        holdId: result.holdId,
        holdToken: result.holdToken,
        holdExpiresAt: result.expiresAt,
        queueId: undefined,
        queuePosition: undefined,
        queueEtaSeconds: undefined,
        correlationId,
        lastUpdated: Date.now(),
        isRealtimeActive: false,
        error: undefined,
      }));
      azureMonitoring.trackEvent('hold_acquired', {
        correlationId,
        holdId: result.holdId,
      });
      queryClient.invalidateQueries({ queryKey: ['queue-status'] });
      return;
    }

    if (result.status === 'queued') {
      setState((prev) => ({
        ...prev,
        stage: 'in-queue',
        queueId: result.queueId,
        queuePosition: result.position,
        queueEtaSeconds: result.etaSeconds,
        correlationId,
        lastUpdated: Date.now(),
        isRealtimeActive: prev.isRealtimeActive,
        error: undefined,
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      stage: 'error',
      error: result.reason || 'hold_rejected',
      correlationId,
      lastUpdated: Date.now(),
    }));
    setStartError(result.detail || result.reason || 'Unable to acquire hold');
  }, [queryClient]);

  const startMutation = useMutation({
    mutationFn: async (payload: HoldAttemptPayload) => {
      const initial = await bookingQueueClient.attemptHold(payload);
      if (initial.status === 'acquired' || initial.status === 'queued') {
        return initial;
      }

      const fallback = await bookingQueueClient.joinQueue(payload);
      return fallback;
    },
    onMutate: (variables) => {
      setStartError(undefined);
      setState((prev) => ({
        ...prev,
        stage: 'trying-hold',
        eventId: variables.eventId,
        selections: variables.selections,
        requesterId: variables.requesterId,
        correlationId: variables.correlationId,
        lastUpdated: Date.now(),
        error: undefined,
      }));
    },
    onSuccess: (result, variables) => {
      applyHoldResult(result, variables.correlationId, variables);
    },
    onError: (error, variables) => {
      const message = error instanceof Error ? error.message : 'hold_failed';
      setStartError(message);
      setState((prev) => ({
        ...prev,
        stage: 'error',
        correlationId: variables.correlationId,
        error: message,
        lastUpdated: Date.now(),
      }));
    },
  });

  const start = useCallback((input: { eventId: string; selections: SelectionInput[]; requesterId?: string }) => {
    if (!input.eventId || input.selections.length === 0) {
      setStartError('selection_required');
      return;
    }

    const correlationId = generateId();
    const payload: HoldAttemptPayload = {
      ...input,
      correlationId,
    };

    startMutation.mutate(payload);
  }, [startMutation]);

  const queueStatusQuery = useQuery({
    queryKey: ['queue-status', state.queueId],
    queryFn: async () => {
      if (!state.queueId || !state.correlationId) {
        return null;
      }
      return bookingQueueClient.getQueueStatus(state.queueId, state.correlationId);
    },
    enabled: state.stage === 'in-queue' && !!state.queueId,
    refetchInterval: () => {
      if (state.stage !== 'in-queue') {
        return false;
      }
      if (state.isRealtimeActive) {
        return false;
      }
      return calculatePollIntervalSeconds(state.queuePosition, state.queueEtaSeconds);
    },
    refetchIntervalInBackground: true,
  });

  const handleQueueStatus = useCallback(async (status: QueueStatus) => {
    const current = stateRef.current;
    if (!current.queueId || status.queueId !== current.queueId) {
      return;
    }

    if (status.status === 'queued') {
      setState((prev) => ({
        ...prev,
        queuePosition: status.position ?? prev.queuePosition,
        queueEtaSeconds: status.etaSeconds ?? prev.queueEtaSeconds,
        lastUpdated: Date.now(),
      }));
      return;
    }

    if (status.status === 'ready') {
      if (status.holdToken && status.holdExpiresAt) {
        setState((prev) => ({
          ...prev,
          stage: 'ready-with-hold',
          holdId: status.holdId ?? prev.holdId,
          holdToken: status.holdToken,
          holdExpiresAt: status.holdExpiresAt,
          lastUpdated: Date.now(),
          queuePosition: 0,
          queueEtaSeconds: 0,
          isRealtimeActive: prev.isRealtimeActive,
          error: undefined,
        }));
        azureMonitoring.trackEvent('hold_acquired', {
          correlationId: current.correlationId || '',
          holdId: status.holdId || '',
        });
        return;
      }

      const claim: HoldClaimResponse = await bookingQueueClient.claimHold(
        status.queueId,
        current.correlationId || generateId(),
      );

      if (claim.success && claim.holdToken && claim.holdExpiresAt) {
        setState((prev) => ({
          ...prev,
          stage: 'ready-with-hold',
          holdId: claim.holdId,
          holdToken: claim.holdToken,
          holdExpiresAt: claim.holdExpiresAt,
          lastUpdated: Date.now(),
          queuePosition: 0,
          queueEtaSeconds: 0,
          isRealtimeActive: prev.isRealtimeActive,
          error: undefined,
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        stage: 'error',
        error: claim.reason || 'claim_failed',
        lastUpdated: Date.now(),
      }));
      return;
    }

    if (status.status === 'expired' || status.status === 'cancelled') {
      setState((prev) => ({
        ...prev,
        stage: 'expired',
        holdId: undefined,
        holdToken: undefined,
        holdExpiresAt: undefined,
        queueId: undefined,
        queuePosition: undefined,
        queueEtaSeconds: undefined,
        error: status.message || 'queue_expired',
        lastUpdated: Date.now(),
      }));
      azureMonitoring.trackEvent('hold_expired', {
        correlationId: current.correlationId || '',
        queueId: status.queueId,
      });
    }
  }, []);

  useEffect(() => {
    if (queueStatusQuery.data) {
      handleQueueStatus(queueStatusQuery.data);
    }
  }, [queueStatusQuery.data, handleQueueStatus]);

  useEffect(() => {
    if (state.stage !== 'in-queue' || !state.queueId) {
      return;
    }

    const subscription = bookingQueueClient.subscribeToQueue(
      state.queueId,
      (status) => handleQueueStatus(status),
      () => {
        setState((prev) => ({
          ...prev,
          isRealtimeActive: false,
        }));
      },
    );

    if (subscription.isRealtime) {
      setState((prev) => ({
        ...prev,
        isRealtimeActive: true,
      }));
    }

    return () => subscription.stop();
  }, [state.stage, state.queueId, handleQueueStatus]);

  useEffect(() => {
    if (state.stage !== 'ready-with-hold' || !state.holdExpiresAt) {
      return;
    }

    const expiresAt = new Date(state.holdExpiresAt).getTime();
    const timeout = expiresAt - Date.now();
    if (timeout <= 0) {
      setState((prev) => ({
        ...prev,
        stage: 'expired',
        error: 'hold_expired',
        holdToken: undefined,
        holdId: undefined,
        holdExpiresAt: undefined,
      }));
      azureMonitoring.trackEvent('hold_expired', {
        correlationId: state.correlationId || '',
        holdId: state.holdId || '',
      });
      return;
    }

    const timer = setTimeout(() => {
      setState((prev) => ({
        ...prev,
        stage: 'expired',
        error: 'hold_expired',
        holdToken: undefined,
        holdId: undefined,
        holdExpiresAt: undefined,
      }));
      azureMonitoring.trackEvent('hold_expired', {
        correlationId: state.correlationId || '',
        holdId: state.holdId || '',
      });
    }, timeout);

    return () => clearTimeout(timer);
  }, [state.stage, state.holdExpiresAt, state.correlationId, state.holdId]);

  const cancelQueue = useCallback(async () => {
    if (!state.queueId || !state.correlationId) {
      clearState();
      return;
    }
    await bookingQueueClient.leaveQueue(state.queueId, state.correlationId);
    clearState();
  }, [state.queueId, state.correlationId, clearState]);

  const extendMutation = useMutation({
    mutationFn: async () => {
      if (!state.holdToken || !state.correlationId) {
        throw new Error('hold_not_active');
      }
      return bookingQueueClient.extendHold(state.holdToken, state.correlationId);
    },
    onSuccess: (result) => {
      if (result.success && result.holdExpiresAt) {
        setState((prev) => ({
          ...prev,
          holdExpiresAt: result.holdExpiresAt,
          lastUpdated: Date.now(),
        }));
      }
    },
    onError: (error) => {
      logger.error('Hold extend failed', { error });
    },
  });

  const extendHold = useCallback(async () => {
    try {
      await extendMutation.mutateAsync();
    } catch (error) {
      logger.error('Hold extend mutation failed', { error });
    }
  }, [extendMutation]);

  const checkoutMutation = useMutation({
    mutationFn: async (payload: BookingCheckoutPayload & { holdToken: string; correlationId: string; idempotencyKey: string }) => {
      azureMonitoring.trackEvent('checkout_attempt', {
        correlationId: payload.correlationId,
        holdId: stateRef.current.holdId || '',
      });

      const items = payload.selections.map((selection) => ({
        categoryId: selection.categoryId,
        quantity: selection.quantity,
      }));

      const response = await bookings.create(
        {
          eventId: payload.eventId,
          holdToken: payload.holdToken,
          items,
          customerDetails: {
            firstName: payload.attendee.firstName,
            lastName: payload.attendee.lastName,
            email: payload.attendee.email,
            phone: payload.attendee.phone,
            country: 'ID',
          },
          payment: {
            method: payload.paymentMethod,
          },
        },
        {
          idempotencyKey: payload.idempotencyKey,
          correlationId: payload.correlationId,
        },
      );

      return response;
    },
  });

  const checkout = useCallback(async (payload: BookingCheckoutPayload) => {
    if (checkoutMutation.isPending) {
      return { success: false, error: 'checkout_in_progress' };
    }
    const current = stateRef.current;
    if (current.stage !== 'ready-with-hold' || !current.holdToken || !current.correlationId) {
      return { success: false, error: 'hold_not_ready' };
    }

    const idempotencyKey = generateId();

    try {
      const response = await checkoutMutation.mutateAsync({
        ...payload,
        holdToken: current.holdToken,
        correlationId: current.correlationId,
        idempotencyKey,
      });

      if (response.error) {
        azureMonitoring.trackEvent('checkout_failed', {
          correlationId: current.correlationId,
          holdId: current.holdId || '',
        });
        return { success: false, error: response.error };
      }

      azureMonitoring.trackEvent('checkout_success', {
        correlationId: current.correlationId,
        holdId: current.holdId || '',
      });
      clearState();
      return { success: true, orderId: (response.data as any)?.orderId || generateId() };
    } catch (error) {
      logger.error('Checkout mutation failed', { error });
      azureMonitoring.trackEvent('checkout_failed', {
        correlationId: current.correlationId,
        holdId: current.holdId || '',
      });
      return { success: false, error: error instanceof Error ? error.message : 'checkout_failed' };
    }
  }, [checkoutMutation, clearState]);

  const reset = useCallback(() => {
    clearState();
  }, [clearState]);

  return useMemo(() => ({
    state,
    actions: {
      start,
      cancelQueue,
      extendHold,
      reset,
      checkout,
    },
    isLoading: startMutation.isPending || extendMutation.isPending,
    isCheckoutPending: checkoutMutation.isPending,
    isExtending: extendMutation.isPending,
    queueStatus: queueStatusQuery.data ?? undefined,
    startError,
  }), [
    state,
    start,
    cancelQueue,
    extendHold,
    reset,
    checkout,
    startMutation.isPending,
    extendMutation.isPending,
    checkoutMutation.isPending,
    queueStatusQuery.data,
    startError,
  ]);
}
