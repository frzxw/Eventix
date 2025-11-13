import { HttpRequest, HttpResponseInit } from '@azure/functions';
import {
  claimQueueHold,
  enqueueQueueRequest,
  getQueueStatus,
  leaveQueue,
} from '../utils/queueService';

function ok(body: any): HttpResponseInit {
  return { status: 200, jsonBody: body };
}

function notFound(message: string): HttpResponseInit {
  return { status: 404, jsonBody: { success: false, error: 'NOT_FOUND', message } };
}

function badRequest(message: string): HttpResponseInit {
  return { status: 400, jsonBody: { success: false, error: 'BAD_REQUEST', message } };
}

function serverError(message: string): HttpResponseInit {
  return { status: 500, jsonBody: { success: false, error: 'SERVER_ERROR', message } };
}

function getQueueIdFromPath(req: HttpRequest): string | undefined {
  try {
    const url = new URL(req.url);
    const parts = url.pathname.split('/').filter(Boolean);
    return parts.length > 0 ? parts[parts.length - 1] : undefined;
  } catch {
    return undefined;
  }
}

type QueueJoinBody = {
  eventId: string;
  selections: Array<{ categoryId: string; quantity: number }>;
  requesterId?: string;
  correlationId?: string;
  traceId?: string;
};

type QueueClaimBody = {
  queueId?: string;
  claimToken?: string;
  correlationId?: string;
};

function normalizeCorrelationId(req: HttpRequest, fallback?: string): string | undefined {
  return req.headers.get('x-correlation-id') ?? fallback;
}

function isValidSelections(selections: QueueJoinBody['selections']): boolean {
  if (!Array.isArray(selections) || selections.length === 0) {
    return false;
  }
  return selections.every(
    (item) =>
      item && typeof item.categoryId === 'string' && item.categoryId.length > 0 && typeof item.quantity === 'number' && item.quantity > 0
  );
}

export async function joinQueueHandler(req: HttpRequest): Promise<HttpResponseInit> {
  try {
    const body = (await req.json()) as QueueJoinBody;
    const correlationId = normalizeCorrelationId(req, body?.correlationId);

    if (!body?.eventId || !isValidSelections(body.selections)) {
      return badRequest('Invalid queue join payload');
    }

    const result = await enqueueQueueRequest({
      eventId: body.eventId,
      selections: body.selections,
      requesterId: body.requesterId,
      correlationId,
      traceId: body.traceId ?? correlationId,
    });

    return ok({
      status: 'queued',
      queueId: result.queueId,
      position: result.position,
      etaSeconds: result.etaSeconds,
      correlationId,
      retryAfterSeconds: 5,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error joining queue';
    return serverError(message);
  }
}

export async function queueStatusHandler(req: HttpRequest): Promise<HttpResponseInit> {
  try {
    const queueId = getQueueIdFromPath(req);
    if (!queueId) {
      return badRequest('queueId required');
    }

    const status = await getQueueStatus(queueId);
    if (!status) {
      return notFound('Queue entry not found');
    }

    return ok(status);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error fetching queue status';
    return serverError(message);
  }
}

export async function queueLeaveHandler(req: HttpRequest): Promise<HttpResponseInit> {
  try {
    const queueId = getQueueIdFromPath(req);
    if (!queueId) {
      return badRequest('queueId required');
    }

    const result = await leaveQueue(queueId, 'user_cancelled');
    if (!result) {
      return notFound('Queue entry not found');
    }

    return ok({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error leaving queue';
    return serverError(message);
  }
}

export async function queueClaimHandler(req: HttpRequest): Promise<HttpResponseInit> {
  try {
    const body = (await req.json()) as QueueClaimBody;
    const correlationId = normalizeCorrelationId(req, body?.correlationId);

    if (!body?.queueId) {
      return badRequest('queueId is required to claim a hold');
    }

    const result = await claimQueueHold(body.queueId);
    if (!result.success) {
      return ok({
        success: false,
        reason: result.reason,
        status: result.status,
        correlationId,
      });
    }

    return ok({
      success: true,
      holdId: result.holdId,
      holdToken: result.holdToken,
      holdExpiresAt: result.holdExpiresAt,
      correlationId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error claiming queue hold';
    return serverError(message);
  }
}
