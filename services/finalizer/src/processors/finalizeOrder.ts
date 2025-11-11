import { randomUUID } from "crypto";
import type { PoolClient } from "pg";
import { FINALIZE_HOLD_LUA } from "./luaScripts";
import { redis } from "../lib/redisClient";
import { withTransaction } from "../lib/db";
import { logger } from "../config/logger";

const HOLD_KEY_PREFIX = "holds:";
const HOLD_EXPIRATION_ZSET_KEY = "holds:expiration-index";

let finalizeHoldSha: string | undefined;

async function ensureFinalizeScriptLoaded() {
  if (!finalizeHoldSha) {
    finalizeHoldSha = (await redis.script("LOAD", FINALIZE_HOLD_LUA)) as string;
  }
}

function buildInventoryKey(eventId: string, categoryId: string): string {
  return `inventory:${eventId}:${categoryId}`;
}

function buildHoldKey(holdToken: string): string {
  return `${HOLD_KEY_PREFIX}${holdToken}`;
}

type FinalizationItem = {
  categoryId: string;
  quantity: number;
};

type FinalizationMessage = {
  orderId: string;
  holdToken: string;
  eventId: string;
  paymentMethod: string;
  paymentReference?: string;
  items: FinalizationItem[];
};

async function generateTickets(client: PoolClient, payload: FinalizationMessage) {
  for (const item of payload.items) {
    for (let i = 0; i < item.quantity; i += 1) {
      const ticketId = randomUUID();
      const ticketNumber = `TKT-${randomUUID().split("-")[0].toUpperCase()}-${Math.floor(Math.random() * 10_000)}`;
      const qrCodeData = randomUUID();
      await client.query(
        `INSERT INTO tickets (id, ticket_number, order_id, event_id, category_id, qr_code_data, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, 'valid', NOW())
         ON CONFLICT (ticket_number) DO NOTHING`,
        [ticketId, ticketNumber, payload.orderId, payload.eventId, item.categoryId, qrCodeData]
      );
    }
  }
}

async function applyDatabaseFinalization(payload: FinalizationMessage) {
  return withTransaction(async (client) => {
    const orderResult = await client.query(
      `SELECT status FROM orders WHERE id = $1 FOR UPDATE`,
      [payload.orderId]
    );

    if (orderResult.rowCount === 0) {
      throw new Error(`Order ${payload.orderId} not found`);
    }

    const currentStatus = orderResult.rows[0].status as string;
    if (currentStatus === "confirmed" || currentStatus === "completed") {
      return { alreadyFinalized: true };
    }

    await client.query(
      `UPDATE orders
         SET status = 'confirmed',
             payment_status = 'completed',
             payment_method = $2,
             payment_reference = $3,
             paid_at = NOW(),
             updated_at = NOW()
       WHERE id = $1`,
      [payload.orderId, payload.paymentMethod, payload.paymentReference]
    );

    for (const item of payload.items) {
      await client.query(
        `UPDATE ticket_categories
           SET quantity_sold = quantity_sold + $2,
               updated_at = NOW()
         WHERE id = $1`,
        [item.categoryId, item.quantity]
      );
    }

    await generateTickets(client, payload);

    return { alreadyFinalized: false };
  });
}

async function finalizeInventory(payload: FinalizationMessage) {
  await ensureFinalizeScriptLoaded();
  const inventoryKeys = payload.items.map((item) => buildInventoryKey(payload.eventId, item.categoryId));
  const holdKey = buildHoldKey(payload.holdToken);
  const keys = [...inventoryKeys, holdKey, HOLD_EXPIRATION_ZSET_KEY];
  const luaPayload = {
    holdToken: payload.holdToken,
    orderId: payload.orderId,
    paymentReference: payload.paymentReference,
    finalizedAtIso: new Date().toISOString(),
    retainSeconds: 1_800,
  };

  const raw = await redis.evalsha(
    finalizeHoldSha as string,
    keys.length,
    ...keys,
    JSON.stringify(luaPayload),
    inventoryKeys.length.toString()
  );

  const result = JSON.parse(typeof raw === "string" ? raw : (raw as Buffer).toString());
  if (!result.success) {
    throw new Error(`Failed to finalize hold: ${result.error}`);
  }
}

export async function processFinalizationMessage(payload: FinalizationMessage) {
  logger.info({ orderId: payload.orderId, holdToken: payload.holdToken }, "Processing finalization message");

  const dbResult = await applyDatabaseFinalization(payload);

  if (!dbResult.alreadyFinalized) {
    await finalizeInventory(payload);
    logger.info({ orderId: payload.orderId }, "Order finalized successfully");
  } else {
    logger.info({ orderId: payload.orderId }, "Order already finalized, skipping inventory update");
  }
}
