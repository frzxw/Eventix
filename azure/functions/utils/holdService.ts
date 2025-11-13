import { randomUUID } from 'crypto';
import { redis, loadScript } from './redisClient';
import { ACQUIRE_HOLD_LUA, CLAIM_HOLD_LUA, RELEASE_HOLD_LUA, FINALIZE_HOLD_LUA } from './holdLuaScripts';

export const HOLD_TTL_SECONDS = Math.max(60, parseInt(process.env.HOLD_TTL_SECONDS ?? '600', 10));
const HOLD_KEY_PREFIX = 'holds:';
const HOLD_EXPIRATION_ZSET_KEY = 'holds:expiration-index';

let acquireHoldSha: string | undefined;
let claimHoldSha: string | undefined;
let releaseHoldSha: string | undefined;
let finalizeHoldSha: string | undefined;

export type HoldEntry = {
  eventId: string;
  categoryId: string;
  quantity: number;
};

export type HoldRequest = {
  eventId: string;
  requesterId?: string;
  traceId?: string;
  entries: HoldEntry[];
};

export type HoldAcquisitionResult = {
  success: boolean;
  holdToken?: string;
  expiresAt?: string;
  expiresAtEpoch?: number;
  error?: string;
  categoryId?: string;
  available?: number;
  entries?: Array<{
    categoryId: string;
    available: number;
    pending: number;
    total: number;
  }>;
};

export type HoldClaimResult = {
  success: boolean;
  error?: string;
  status?: string;
  entries?: HoldEntry[];
  expiresAt?: string;
  expiresAtEpoch?: number;
};

async function ensureScriptsLoaded(): Promise<void> {
  if (!acquireHoldSha) {
    acquireHoldSha = await loadScript(ACQUIRE_HOLD_LUA);
  }
  if (!claimHoldSha) {
    claimHoldSha = await loadScript(CLAIM_HOLD_LUA);
  }
  if (!releaseHoldSha) {
    releaseHoldSha = await loadScript(RELEASE_HOLD_LUA);
  }
  if (!finalizeHoldSha) {
    finalizeHoldSha = await loadScript(FINALIZE_HOLD_LUA);
  }
}

function buildInventoryKey(entry: HoldEntry): string {
  return `inventory:${entry.eventId}:${entry.categoryId}`;
}

function buildHoldKey(token: string): string {
  return `${HOLD_KEY_PREFIX}${token}`;
}

export async function acquireHold(request: HoldRequest): Promise<HoldAcquisitionResult> {
  await ensureScriptsLoaded();

  if (request.entries.length === 0) {
    throw new Error('Hold request must include at least one category entry');
  }

  const inconsistentEvent = request.entries.some((entry) => entry.eventId !== request.eventId);
  if (inconsistentEvent) {
    throw new Error('All hold entries must reference the same event');
  }

  const holdToken = randomUUID();
  const createdAt = new Date();
  const ttlSeconds = HOLD_TTL_SECONDS;
  const expiresAt = new Date(createdAt.getTime() + ttlSeconds * 1000);

  const payload = {
    holdToken,
    ttlSeconds,
    createdAtIso: createdAt.toISOString(),
    expiresAtIso: expiresAt.toISOString(),
    expiresAtEpoch: Math.floor(expiresAt.getTime() / 1000),
    metadata: {
      eventId: request.eventId,
      requesterId: request.requesterId,
    },
    entries: request.entries,
    traceId: request.traceId,
  };

  const inventoryKeys = request.entries.map(buildInventoryKey);
  const holdKey = buildHoldKey(holdToken);
  const keys = [...inventoryKeys, holdKey, HOLD_EXPIRATION_ZSET_KEY];

  const raw = await redis.evalsha(
    acquireHoldSha as string,
    keys.length,
    ...keys,
    JSON.stringify(payload)
  );

  const result = JSON.parse(typeof raw === 'string' ? raw : (raw as Buffer).toString()) as HoldAcquisitionResult;
  return result;
}

export async function claimHold(
  holdToken: string,
  options: { orderReference?: string; extendTtlSeconds?: number }
): Promise<HoldClaimResult> {
  await ensureScriptsLoaded();
  const holdKey = buildHoldKey(holdToken);
  const nowEpoch = Math.floor(Date.now() / 1000);

  const payload = {
    holdToken,
    orderReference: options.orderReference,
    nextStatus: 'checkout_pending',
    nowEpoch,
    extendTtlSeconds: options.extendTtlSeconds,
  };

  const raw = await redis.evalsha(
    claimHoldSha as string,
    1,
    holdKey,
    JSON.stringify(payload)
  );

  const result = JSON.parse(typeof raw === 'string' ? raw : (raw as Buffer).toString()) as HoldClaimResult;
  return result;
}

export async function markHoldCommitted(holdToken: string, orderReference: string): Promise<void> {
  const holdKey = buildHoldKey(holdToken);
  await redis.hset(holdKey, 'status', 'checkout_committed', 'orderReference', orderReference);
}

export async function releaseHold(
  holdToken: string,
  reason: string,
  newStatus: 'expired' | 'cancelled'
): Promise<boolean> {
  await ensureScriptsLoaded();
  const hold = await getHold(holdToken);
  if (!hold) {
    return false;
  }

  const inventoryKeys = hold.entries.map(buildInventoryKey);
  const holdKey = buildHoldKey(holdToken);
  const keys = [...inventoryKeys, holdKey, HOLD_EXPIRATION_ZSET_KEY];
  const payload = {
    holdToken,
    reason,
    releaseStatus: newStatus,
    releasedAtIso: new Date().toISOString(),
    retainSeconds: 300,
  };

  const raw = await redis.evalsha(
    releaseHoldSha as string,
    keys.length,
    ...keys,
    JSON.stringify(payload),
    inventoryKeys.length.toString()
  );

  const result = JSON.parse(typeof raw === 'string' ? raw : (raw as Buffer).toString());
  return result.success === true;
}

export async function finalizeHold(
  holdToken: string,
  options: { orderId: string; paymentReference?: string }
): Promise<boolean> {
  await ensureScriptsLoaded();
  const hold = await getHold(holdToken);
  if (!hold) {
    return false;
  }

  const inventoryKeys = hold.entries.map(buildInventoryKey);
  const holdKey = buildHoldKey(holdToken);
  const keys = [...inventoryKeys, holdKey, HOLD_EXPIRATION_ZSET_KEY];
  const payload = {
    holdToken,
    orderId: options.orderId,
    paymentReference: options.paymentReference,
    finalizedAtIso: new Date().toISOString(),
    retainSeconds: 1_800,
  };

  const raw = await redis.evalsha(
    finalizeHoldSha as string,
    keys.length,
    ...keys,
    JSON.stringify(payload),
    inventoryKeys.length.toString()
  );

  const result = JSON.parse(typeof raw === 'string' ? raw : (raw as Buffer).toString());
  return result.success === true;
}

export async function getHold(holdToken: string): Promise<{ entries: HoldEntry[]; status: string; expiresAtEpoch: number } | null> {
  const holdKey = buildHoldKey(holdToken);
  const response = await redis.hmget(holdKey, 'entries', 'status', 'expiresAtEpoch');
  if (!response || !response[0]) {
    return null;
  }
  return {
    entries: JSON.parse(response[0]) as HoldEntry[],
    status: response[1] as string,
    expiresAtEpoch: response[2] ? Number(response[2]) : 0,
  };
}
