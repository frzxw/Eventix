import { redis } from "../lib/redisClient";
import { config } from "../config/environment";
import { logger } from "../config/logger";
import { getTelemetryClient } from "../telemetry/applicationInsights";
import { RELEASE_HOLD_LUA } from "./luaScripts";

const HOLD_KEY_PREFIX = "holds:";
const HOLD_EXPIRATION_ZSET_KEY = "holds:expiration-index";

let releaseHoldSha: string | undefined;

async function ensureReleaseScriptLoaded() {
  if (!releaseHoldSha) {
    releaseHoldSha = (await redis.script("LOAD", RELEASE_HOLD_LUA)) as string;
  }
}

function buildHoldKey(token: string): string {
  return `${HOLD_KEY_PREFIX}${token}`;
}

function buildInventoryKey(eventId: string, categoryId: string): string {
  return `inventory:${eventId}:${categoryId}`;
}

async function fetchExpiredTokens(nowEpoch: number, limit: number): Promise<string[]> {
  return redis.zrangebyscore(
    HOLD_EXPIRATION_ZSET_KEY,
    0,
    nowEpoch,
    "LIMIT",
    0,
    limit
  );
}

type HoldEntry = {
  eventId: string;
  categoryId: string;
  quantity: number;
};

async function releaseHold(token: string, entries: HoldEntry[]) {
  await ensureReleaseScriptLoaded();
  const inventoryKeys = entries.map((entry) => buildInventoryKey(entry.eventId, entry.categoryId));
  const holdKey = buildHoldKey(token);
  const keys = [...inventoryKeys, holdKey, HOLD_EXPIRATION_ZSET_KEY];
  const payload = {
    holdToken: token,
    reason: "hold-expired",
    releaseStatus: "expired",
    releasedAtIso: new Date().toISOString(),
    retainSeconds: config.hold.retainSeconds,
  };

  const raw = await redis.evalsha(
    releaseHoldSha as string,
    keys.length,
    ...keys,
    JSON.stringify(payload),
    inventoryKeys.length.toString()
  );

  const result = JSON.parse(typeof raw === "string" ? raw : (raw as Buffer).toString());
  if (!result.success) {
    throw new Error(`Failed to release hold ${token}: ${result.error}`);
  }
}

export async function runHoldCleanup() {
  const nowEpoch = Math.floor(Date.now() / 1000);
  const tokens = await fetchExpiredTokens(nowEpoch, config.hold.scanLimit);
  if (tokens.length === 0) {
    logger.info("No expired holds detected");
    return;
  }

  logger.info({ tokens }, "Releasing expired holds");

  const telemetryClient = getTelemetryClient();
  const stats = {
    total: tokens.length,
    released: 0,
    skipped: 0,
    errors: 0,
  };

  for (const token of tokens) {
    const holdKey = buildHoldKey(token);
    const [entriesJson, status] = await redis.hmget(holdKey, "entries", "status");
    if (!entriesJson) {
      await redis.zrem(HOLD_EXPIRATION_ZSET_KEY, token);
      stats.skipped += 1;
      continue;
    }

    if (status !== "held") {
      await redis.zrem(HOLD_EXPIRATION_ZSET_KEY, token);
      stats.skipped += 1;
      continue;
    }

    const entries = JSON.parse(entriesJson) as HoldEntry[];
    try {
      await releaseHold(token, entries);
      stats.released += 1;
    } catch (error) {
      logger.error({ err: error, token }, "Failed to release hold");
      stats.errors += 1;
    }
  }

  logger.info({ stats }, "Expired hold release batch complete");

  if (telemetryClient) {
    telemetryClient.trackEvent({
      name: "HoldCleanupRun",
      properties: {
        total: stats.total.toString(),
        released: stats.released.toString(),
        skipped: stats.skipped.toString(),
        errors: stats.errors.toString(),
      },
      measurements: {
        released: stats.released,
        skipped: stats.skipped,
        errors: stats.errors,
      },
    });
  }
}
