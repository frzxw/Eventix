import { HttpRequest, HttpResponseInit } from '@azure/functions';
import {
  HOLD_TTL_SECONDS,
  acquireHold,
  extendHold as extendHoldService,
} from '../utils/holdService';
import { enqueueQueueRequest } from '../utils/queueService';

function ok(body: any): HttpResponseInit {
  return { status: 200, jsonBody: body };
}

function badRequest(message: string): HttpResponseInit {
  return { status: 400, jsonBody: { status: 'rejected', reason: 'BAD_REQUEST', message } };
}

function serverError(message: string): HttpResponseInit {
  return {
    status: 500,
    jsonBody: { status: 'rejected', reason: 'SERVER_ERROR', message },
  };
}

function normalizeCorrelationId(req: HttpRequest, fallback?: string): string | undefined {
  return req.headers.get('x-correlation-id') ?? fallback;
}

type HoldAttemptBody = {
  eventId: string;
  selections: Array<{ categoryId: string; quantity: number }>;
  requesterId?: string;
  correlationId?: string;
  traceId?: string;
};

type HoldExtendBody = {
  holdToken?: string;
  extendSeconds?: number;
  correlationId?: string;
};

function isValidSelections(selections: HoldAttemptBody['selections']): boolean {
  if (!Array.isArray(selections) || selections.length === 0) {
    return false;
  }

  return selections.every(
    (item) =>
      item && typeof item.categoryId === 'string' && item.categoryId.length > 0 && typeof item.quantity === 'number' && item.quantity > 0
  );
}

export async function attemptHoldHandler(req: HttpRequest): Promise<HttpResponseInit> {
  try {
    const body = (await req.json()) as HoldAttemptBody;
    const correlationId = normalizeCorrelationId(req, body?.correlationId);

    if (!body?.eventId || !isValidSelections(body.selections)) {
      return badRequest('Invalid hold request payload');
    }

    const holdResult = await acquireHold({
      eventId: body.eventId,
      requesterId: body.requesterId,
      traceId: body.traceId ?? correlationId,
      entries: body.selections.map((selection) => ({
        eventId: body.eventId,
        categoryId: selection.categoryId,
        quantity: selection.quantity,
      })),
    });

    if (holdResult.success && holdResult.holdToken) {
      const expiresAt = holdResult.expiresAt ?? new Date(Date.now() + HOLD_TTL_SECONDS * 1000).toISOString();
      const expiresInSeconds = holdResult.expiresAtEpoch
        ? Math.max(1, holdResult.expiresAtEpoch - Math.floor(Date.now() / 1000))
        : HOLD_TTL_SECONDS;

      return ok({
        status: 'acquired',
        holdId: holdResult.holdToken,
        holdToken: holdResult.holdToken,
        expiresAt,
        expiresInSeconds,
        correlationId,
      });
    }

    if (holdResult.error === 'INSUFFICIENT_STOCK') {
      const queueResult = await enqueueQueueRequest({
        eventId: body.eventId,
        selections: body.selections,
        requesterId: body.requesterId,
        correlationId,
        traceId: body.traceId ?? correlationId,
      });

      return ok({
        status: 'queued',
        queueId: queueResult.queueId,
        position: queueResult.position,
        etaSeconds: queueResult.etaSeconds,
        correlationId,
        retryAfterSeconds: 5,
      });
    }

    return ok({
      status: 'rejected',
      reason: holdResult.error ?? 'UNKNOWN_ERROR',
      correlationId,
      detail: holdResult.categoryId ? `category:${holdResult.categoryId}` : undefined,
      retryable: holdResult.error === 'HOLD_ALREADY_EXISTS',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error during hold attempt';
    return serverError(message);
  }
}

export async function extendHoldHandler(req: HttpRequest): Promise<HttpResponseInit> {
  try {
    const body = (await req.json()) as HoldExtendBody;
    const correlationId = normalizeCorrelationId(req, body?.correlationId);

    if (!body?.holdToken) {
      return badRequest('holdToken is required');
    }

    const result = await extendHoldService(body.holdToken, body.extendSeconds);
    if (!result.success) {
      return ok({
        success: false,
        reason: result.reason ?? 'EXTEND_FAILED',
        status: result.status,
        correlationId,
      });
    }

    return ok({
      success: true,
      holdId: result.holdToken,
      holdToken: result.holdToken,
      holdExpiresAt: result.holdExpiresAt,
      correlationId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error extending hold';
    return serverError(message);
  }
}
