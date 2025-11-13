import { API, BOOKING_QUEUE } from '../constants';
import { logger } from './logger';
import { azureMonitoring } from './azure-monitoring';

export type SelectionInput = {
  categoryId: string;
  quantity: number;
};

export type HoldAttemptPayload = {
  eventId: string;
  selections: SelectionInput[];
  requesterId?: string;
  correlationId: string;
  traceId?: string;
};

export type HoldAttemptResult =
  | {
      status: 'acquired';
      holdId: string;
      holdToken: string;
      expiresAt: string;
      expiresInSeconds?: number;
      correlationId: string;
    }
  | {
      status: 'queued';
      queueId: string;
      position: number;
      etaSeconds?: number;
      retryAfterSeconds?: number;
      correlationId: string;
    }
  | {
      status: 'rejected';
      reason: string;
      detail?: string;
      retryable?: boolean;
      correlationId: string;
    };

export type QueueStatus = {
  status: 'queued' | 'ready' | 'expired' | 'cancelled';
  queueId: string;
  position?: number;
  etaSeconds?: number;
  holdId?: string;
  holdToken?: string;
  holdExpiresAt?: string;
  correlationId?: string;
  message?: string;
};

export type HoldClaimResponse = {
  success: boolean;
  holdId?: string;
  holdToken?: string;
  holdExpiresAt?: string;
  correlationId?: string;
  retryAfterSeconds?: number;
  reason?: string;
};

export type HoldExtendResponse = {
  success: boolean;
  holdId?: string;
  holdToken?: string;
  holdExpiresAt?: string;
  correlationId?: string;
  reason?: string;
};

export type QueueSubscription = {
  stop: () => void;
  isRealtime: boolean;
};

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

const HOLD_ENDPOINT = BOOKING_QUEUE.HOLD_API_URL.replace(/\/$/, '');
const QUEUE_ENDPOINT = BOOKING_QUEUE.QUEUE_API_URL.replace(/\/$/, '');

function withTimeout(signal?: AbortSignal, timeoutMs: number = API.TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const cleanup = () => clearTimeout(timeoutId);
  if (signal) {
    signal.addEventListener('abort', () => controller.abort(), { once: true });
  }
  return { signal: controller.signal, cleanup };
}

async function parseJson<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch (error) {
    logger.warn('Failed to parse JSON response from booking queue API', { error });
    return null;
  }
}

function buildUrl(base: string, pathSegments: string[], query?: Record<string, string | undefined>) {
  const url = new URL(base);
  const pathname = [...url.pathname.split('/').filter(Boolean), ...pathSegments].join('/');
  url.pathname = `/${pathname}`;
  Object.entries(query || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, value);
    }
  });
  return url.toString();
}

class BookingQueueClient {
  async attemptHold(payload: HoldAttemptPayload): Promise<HoldAttemptResult> {
    const { signal, cleanup } = withTimeout(undefined, API.TIMEOUT_MS);
    try {
      const response = await fetch(HOLD_ENDPOINT, {
        method: 'POST',
        headers: {
          ...DEFAULT_HEADERS,
          'x-correlation-id': payload.correlationId,
        },
        body: JSON.stringify({
          eventId: payload.eventId,
          selections: payload.selections,
          requesterId: payload.requesterId,
          traceId: payload.traceId,
        }),
        signal,
      });

      const result = await parseJson<HoldAttemptResult>(response);
      if (!response.ok || !result) {
        logger.warn('Hold attempt failed', {
          status: response.status,
          correlationId: payload.correlationId,
        });
        return {
          status: 'rejected',
          reason: 'hold_failed',
          detail: `HTTP ${response.status}`,
          correlationId: payload.correlationId,
        };
      }

      if (result.status === 'acquired') {
        azureMonitoring.trackEvent('hold_acquired', {
          correlationId: payload.correlationId,
          holdId: result.holdId,
        });
      } else if (result.status === 'queued') {
        azureMonitoring.trackEvent('queue_join', {
          correlationId: payload.correlationId,
          queueId: result.queueId,
        });
      }

      return result;
    } catch (error) {
      logger.logApiError(error, HOLD_ENDPOINT, 'POST');
      return {
        status: 'rejected',
        reason: 'network_error',
        detail: error instanceof Error ? error.message : 'unknown',
        retryable: true,
        correlationId: payload.correlationId,
      };
    } finally {
      cleanup();
    }
  }

  async getQueueStatus(queueId: string, correlationId: string): Promise<QueueStatus | null> {
    const endpoint = buildUrl(QUEUE_ENDPOINT, ['status', queueId], { correlationId });
    const { signal, cleanup } = withTimeout(undefined, API.TIMEOUT_MS);
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          ...DEFAULT_HEADERS,
          'x-correlation-id': correlationId,
        },
        signal,
      });

      if (!response.ok) {
        logger.warn('Queue status request failed', { status: response.status, queueId, correlationId });
        return null;
      }

      const result = await parseJson<QueueStatus>(response);
      return result ?? null;
    } catch (error) {
      logger.logApiError(error, endpoint, 'GET');
      return null;
    } finally {
      cleanup();
    }
  }

  async joinQueue(payload: HoldAttemptPayload): Promise<HoldAttemptResult> {
    const endpoint = buildUrl(QUEUE_ENDPOINT, ['join'], undefined);
    const { signal, cleanup } = withTimeout(undefined, API.TIMEOUT_MS);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          ...DEFAULT_HEADERS,
          'x-correlation-id': payload.correlationId,
        },
        body: JSON.stringify(payload),
        signal,
      });

      const result = await parseJson<HoldAttemptResult>(response);
      if (!response.ok || !result) {
        logger.warn('Queue join failed', {
          status: response.status,
          correlationId: payload.correlationId,
        });
        return {
          status: 'rejected',
          reason: 'queue_join_failed',
          detail: `HTTP ${response.status}`,
          correlationId: payload.correlationId,
        };
      }

      if (result.status === 'queued') {
        azureMonitoring.trackEvent('queue_join', {
          correlationId: payload.correlationId,
          queueId: result.queueId,
        });
      }

      return result;
    } catch (error) {
      logger.logApiError(error, endpoint, 'POST');
      return {
        status: 'rejected',
        reason: 'network_error',
        detail: error instanceof Error ? error.message : 'unknown',
        retryable: true,
        correlationId: payload.correlationId,
      };
    } finally {
      cleanup();
    }
  }

  async leaveQueue(queueId: string, correlationId: string): Promise<boolean> {
    const endpoint = buildUrl(QUEUE_ENDPOINT, ['leave', queueId], undefined);
    const { signal, cleanup } = withTimeout(undefined, API.TIMEOUT_MS);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          ...DEFAULT_HEADERS,
          'x-correlation-id': correlationId,
        },
        signal,
      });
      if (!response.ok) {
        logger.warn('Queue leave failed', { status: response.status, queueId, correlationId });
        return false;
      }
      return true;
    } catch (error) {
      logger.logApiError(error, endpoint, 'POST');
      return false;
    } finally {
      cleanup();
    }
  }

  async claimHold(queueId: string, correlationId: string, claimToken?: string): Promise<HoldClaimResponse> {
    const endpoint = buildUrl(QUEUE_ENDPOINT, ['claim'], undefined);
    const { signal, cleanup } = withTimeout(undefined, API.TIMEOUT_MS);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          ...DEFAULT_HEADERS,
          'x-correlation-id': correlationId,
        },
        body: JSON.stringify({ queueId, claimToken, correlationId }),
        signal,
      });

      const result = await parseJson<HoldClaimResponse>(response);
      if (!response.ok || !result) {
        logger.warn('Hold claim failed', { status: response.status, queueId, correlationId });
        return {
          success: false,
          reason: `HTTP ${response.status}`,
          correlationId,
        };
      }

      if (result.success && result.holdId) {
        azureMonitoring.trackEvent('hold_acquired', {
          correlationId,
          holdId: result.holdId,
        });
      }

      return result;
    } catch (error) {
      logger.logApiError(error, endpoint, 'POST');
      return {
        success: false,
        reason: error instanceof Error ? error.message : 'unknown',
        correlationId,
      };
    } finally {
      cleanup();
    }
  }

  async extendHold(holdToken: string, correlationId: string): Promise<HoldExtendResponse> {
    const endpoint = buildUrl(HOLD_ENDPOINT, ['extend'], undefined);
    const { signal, cleanup } = withTimeout(undefined, API.TIMEOUT_MS);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          ...DEFAULT_HEADERS,
          'x-correlation-id': correlationId,
        },
        body: JSON.stringify({ holdToken, correlationId }),
        signal,
      });

      const result = await parseJson<HoldExtendResponse>(response);
      if (!response.ok || !result) {
        logger.warn('Hold extend failed', { status: response.status, correlationId });
        return {
          success: false,
          reason: `HTTP ${response.status}`,
          correlationId,
        };
      }

      return result;
    } catch (error) {
      logger.logApiError(error, endpoint, 'POST');
      return {
        success: false,
        reason: error instanceof Error ? error.message : 'unknown',
        correlationId,
      };
    } finally {
      cleanup();
    }
  }

  subscribeToQueue(queueId: string, onStatus: (status: QueueStatus) => void, onError?: (error: Error) => void): QueueSubscription {
    if (!BOOKING_QUEUE.REALTIME_URL) {
      return { stop: () => undefined, isRealtime: false };
    }

    try {
      const url = new URL(BOOKING_QUEUE.REALTIME_URL);
      url.searchParams.set('queueId', queueId);
      url.searchParams.set('hub', BOOKING_QUEUE.REALTIME_HUB);
      const socket = new WebSocket(url.toString());

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data as string);
          if (payload && payload.status) {
            onStatus(payload as QueueStatus);
          }
        } catch (error) {
          logger.warn('Failed to parse realtime queue payload', { error });
        }
      };

      socket.onerror = () => {
        socket.close();
        if (onError) {
          onError(new Error('Queue realtime connection error'));
        }
      };

      socket.onclose = () => {
        if (onError) {
          onError(new Error('Queue realtime connection closed'));
        }
      };

      return {
        stop: () => socket.close(),
        isRealtime: true,
      };
    } catch (error) {
      if (onError) {
        onError(error as Error);
      }
      logger.warn('Failed to initialize realtime queue subscription', { error });
      return { stop: () => undefined, isRealtime: false };
    }
  }
}

export const bookingQueueClient = new BookingQueueClient();
