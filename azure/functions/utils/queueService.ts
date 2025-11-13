import { randomUUID } from 'crypto';
import { redis } from './redisClient';
import {
  HOLD_TTL_SECONDS,
  acquireHold,
  claimHold,
  releaseHold,
} from './holdService';

export type QueueSelection = {
  categoryId: string;
  quantity: number;
};

export type QueueJoinRequest = {
  eventId: string;
  selections: QueueSelection[];
  requesterId?: string;
  correlationId?: string;
  traceId?: string;
};

export type QueueEntryStatus = 'queued' | 'ready' | 'expired' | 'cancelled';

export type QueueEntry = {
  queueId: string;
  eventId: string;
  selections: QueueSelection[];
  requesterId?: string;
  correlationId?: string;
  traceId?: string;
  status: QueueEntryStatus;
  createdAtIso: string;
  readyAtIso?: string;
  cancelledAtIso?: string;
  lastAttemptEpoch?: number;
  holdToken?: string;
  holdId?: string;
  holdExpiresAt?: string;
  message?: string;
};

export type QueueJoinResult = {
  queueId: string;
  position: number;
  etaSeconds: number;
};

export type QueueStatusResponse = {
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

export type QueueClaimResult = {
  success: boolean;
  holdToken?: string;
  holdExpiresAt?: string;
  holdId?: string;
  reason?: string;
  status?: string;
};

const QUEUE_ENTRY_PREFIX = 'queue:entry:';
const QUEUE_INDEX_PREFIX = 'queue:index:';
const QUEUE_ENTRY_TTL_SECONDS = Math.max(600, parseInt(process.env.QUEUE_ENTRY_TTL_SECONDS ?? '3600', 10));
const QUEUE_RETRY_COOLDOWN_SECONDS = Math.max(3, parseInt(process.env.QUEUE_RETRY_COOLDOWN_SECONDS ?? '5', 10));

function entryKey(queueId: string): string {
  return `${QUEUE_ENTRY_PREFIX}${queueId}`;
}

function indexKey(eventId: string): string {
  return `${QUEUE_INDEX_PREFIX}${eventId}`;
}

function calculateEtaSeconds(position: number): number {
  const base = 45;
  const eta = base * Math.max(position - 1, 0);
  return Math.max(30, Math.min(15 * 60, eta + base));
}

async function saveEntry(entry: QueueEntry): Promise<void> {
  await redis.set(entryKey(entry.queueId), JSON.stringify(entry), 'EX', QUEUE_ENTRY_TTL_SECONDS);
}

async function loadEntry(queueId: string): Promise<QueueEntry | null> {
  const raw = await redis.get(entryKey(queueId));
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as QueueEntry;
  } catch {
    return null;
  }
}

async function removeFromQueueIndex(eventId: string, queueId: string): Promise<void> {
  await redis.zrem(indexKey(eventId), queueId).catch(() => undefined);
}

async function getQueueRank(eventId: string, queueId: string): Promise<number | null> {
  const rank = await redis.zrank(indexKey(eventId), queueId);
  return typeof rank === 'number' ? rank : null;
}

async function attemptPromoteEntry(entry: QueueEntry, rank: number): Promise<QueueEntry> {
  if (entry.status !== 'queued') {
    return entry;
  }

  if (rank > 0) {
    return entry;
  }

  const nowEpoch = Math.floor(Date.now() / 1000);
  if (entry.lastAttemptEpoch && nowEpoch - entry.lastAttemptEpoch < QUEUE_RETRY_COOLDOWN_SECONDS) {
    return entry;
  }

  entry.lastAttemptEpoch = nowEpoch;
  const holdResult = await acquireHold({
    eventId: entry.eventId,
    requesterId: entry.requesterId,
    traceId: entry.correlationId || entry.traceId,
    entries: entry.selections.map((selection) => ({
      eventId: entry.eventId,
      categoryId: selection.categoryId,
      quantity: selection.quantity,
    })),
  });

  if (holdResult.success && holdResult.holdToken && holdResult.expiresAt) {
    entry.status = 'ready';
    entry.holdToken = holdResult.holdToken;
    entry.holdId = holdResult.holdToken;
    entry.holdExpiresAt = holdResult.expiresAt;
    entry.readyAtIso = new Date().toISOString();
    entry.message = undefined;
    await removeFromQueueIndex(entry.eventId, entry.queueId);
  } else {
    entry.message = holdResult.error ?? entry.message;
  }

  await saveEntry(entry);
  return entry;
}

export async function enqueueQueueRequest(payload: QueueJoinRequest): Promise<QueueJoinResult> {
  const queueId = randomUUID();
  const entry: QueueEntry = {
    queueId,
    eventId: payload.eventId,
    selections: payload.selections,
    requesterId: payload.requesterId,
    correlationId: payload.correlationId,
    traceId: payload.traceId,
    status: 'queued',
    createdAtIso: new Date().toISOString(),
  };

  await saveEntry(entry);
  await redis.zadd(indexKey(payload.eventId), Date.now(), queueId);
  const rank = await getQueueRank(payload.eventId, queueId);
  const position = (rank ?? 0) + 1;
  const etaSeconds = calculateEtaSeconds(position);
  return { queueId, position, etaSeconds };
}

export async function getQueueStatus(queueId: string): Promise<QueueStatusResponse | null> {
  let entry = await loadEntry(queueId);
  if (!entry) {
    return null;
  }

  if (entry.status === 'queued') {
    const rank = await getQueueRank(entry.eventId, entry.queueId);
    if (rank === null) {
      entry.status = 'expired';
      entry.message = entry.message ?? 'Queue entry no longer active';
      await saveEntry(entry);
      return {
        status: 'expired',
        queueId: entry.queueId,
        correlationId: entry.correlationId,
        message: entry.message,
      };
    }

    entry = await attemptPromoteEntry(entry, rank);
    if (entry.status === 'ready') {
      return {
        status: 'ready',
        queueId: entry.queueId,
        holdId: entry.holdId,
        holdToken: entry.holdToken,
        holdExpiresAt: entry.holdExpiresAt,
        correlationId: entry.correlationId,
      };
    }

    const currentRank = await getQueueRank(entry.eventId, entry.queueId);
    const position = (currentRank ?? rank) + 1;
    const etaSeconds = calculateEtaSeconds(position);
    entry.message = undefined;
    await saveEntry(entry);

    return {
      status: 'queued',
      queueId: entry.queueId,
      position,
      etaSeconds,
      correlationId: entry.correlationId,
    };
  }

  if (entry.status === 'ready') {
    if (entry.holdExpiresAt && new Date(entry.holdExpiresAt).getTime() <= Date.now()) {
      entry.status = 'expired';
      entry.message = 'Hold expired';
      await saveEntry(entry);
      return {
        status: 'expired',
        queueId: entry.queueId,
        correlationId: entry.correlationId,
        message: entry.message,
      };
    }

    return {
      status: 'ready',
      queueId: entry.queueId,
      holdId: entry.holdId,
      holdToken: entry.holdToken,
      holdExpiresAt: entry.holdExpiresAt,
      correlationId: entry.correlationId,
    };
  }

  return {
    status: entry.status,
    queueId: entry.queueId,
    correlationId: entry.correlationId,
    message: entry.message,
  };
}

export async function leaveQueue(queueId: string, reason = 'user_cancelled'): Promise<QueueStatusResponse | null> {
  const entry = await loadEntry(queueId);
  if (!entry) {
    return null;
  }

  await removeFromQueueIndex(entry.eventId, entry.queueId);

  if (entry.holdToken && entry.status === 'ready') {
    await releaseHold(entry.holdToken, reason, 'cancelled').catch(() => undefined);
  }

  entry.status = 'cancelled';
  entry.cancelledAtIso = new Date().toISOString();
  entry.message = reason;
  await saveEntry(entry);

  return {
    status: 'cancelled',
    queueId: entry.queueId,
    correlationId: entry.correlationId,
    message: reason,
  };
}

export async function claimQueueHold(queueId: string): Promise<QueueClaimResult> {
  const entry = await loadEntry(queueId);
  if (!entry) {
    return { success: false, reason: 'QUEUE_NOT_FOUND' };
  }

  if (entry.status !== 'ready' || !entry.holdToken) {
    return { success: false, reason: 'QUEUE_NOT_READY', status: entry.status };
  }

  const claimResult = await claimHold(entry.holdToken, {
    extendTtlSeconds: HOLD_TTL_SECONDS,
  });

  if (!claimResult.success) {
    if (claimResult.error === 'HOLD_EXPIRED' || claimResult.status === 'HOLD_EXPIRED') {
      entry.status = 'expired';
      entry.message = 'Hold expired';
      await saveEntry(entry);
    }

    return {
      success: false,
      reason: claimResult.error ?? 'claim_failed',
      status: claimResult.status,
    };
  }

  if (claimResult.expiresAt) {
    entry.holdExpiresAt = claimResult.expiresAt;
    await saveEntry(entry);
  }

  return {
    success: true,
    holdId: entry.holdId,
    holdToken: entry.holdToken,
    holdExpiresAt: entry.holdExpiresAt,
  };
}
