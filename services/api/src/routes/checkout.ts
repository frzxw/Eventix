import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { randomUUID } from "crypto";
import { z } from "zod";
import { claimHold, markHoldCommitted, releaseHold } from "../inventory/holdService";
import { withTransaction } from "../lib/db";
import { sendFinalizationMessage, type FinalizationMessage } from "../lib/serviceBus";
import { config } from "../config/environment";

const checkoutSchema = z.object({
  holdToken: z.string().uuid(),
  eventId: z.string().min(1),
  customer: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(5),
  }),
  items: z
    .array(
      z.object({
        categoryId: z.string().min(1),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
  payment: z.object({
    method: z.string().min(1),
    reference: z.string().optional(),
  }),
});

type CheckoutBody = z.infer<typeof checkoutSchema>;

type CheckoutResponsePayload = {
  orderId: string;
  orderNumber: string;
  currency: string;
  totals: {
    subtotal: number;
    serviceFee: number;
    tax: number;
    total: number;
  };
  customer: CheckoutBody["customer"];
  holdToken: string;
  holdExpiresAt: string;
};

class IdempotencyConflictError extends Error {
  constructor() {
    super("Idempotent request is already being processed");
  }
}

function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const token = randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
  return `EVX-${year}-${token}`;
}

export async function checkoutRoutes(app: FastifyInstance) {
  app.post(
    "/v1/checkout",
    async (request: FastifyRequest<{ Body: CheckoutBody }>, reply: FastifyReply) => {
      const idempotencyKeyHeader = request.headers["idempotency-key"];
      if (!idempotencyKeyHeader || typeof idempotencyKeyHeader !== "string") {
        return reply.status(400).send({ success: false, error: "Missing Idempotency-Key header" });
      }

      const body = checkoutSchema.parse(request.body);

      const holdClaim = await claimHold(body.holdToken, {
        orderReference: idempotencyKeyHeader,
        extendTtlSeconds: config.hold.ttlSeconds,
      });

      if (!holdClaim.success) {
        const status = holdClaim.error === "HOLD_EXPIRED" ? 410 : 409;
        return reply.status(status).send({ success: false, error: holdClaim.error, details: holdClaim });
      }

      try {
        const transactionResult = await withTransaction(async (client) => {
          const idempotencyRow = await client.query(
            "SELECT status, response_payload FROM api_idempotency WHERE idempotency_key = $1 FOR UPDATE",
            [idempotencyKeyHeader]
          );

          if ((idempotencyRow.rowCount ?? 0) > 0) {
            const row = idempotencyRow.rows[0];
            if (row.status === "completed" && row.response_payload) {
              const payload =
                typeof row.response_payload === "string"
                  ? (JSON.parse(row.response_payload) as CheckoutResponsePayload)
                  : (row.response_payload as CheckoutResponsePayload);
              return {
                reused: true,
                payload,
              };
            }
            if (row.status === "in_progress") {
              throw new IdempotencyConflictError();
            }
            await client.query(
              `UPDATE api_idempotency
                 SET status = 'in_progress', updated_at = NOW(), request_fingerprint = $2, hold_token = $3, expires_at = NOW() + ($4 || ' seconds')::interval
               WHERE idempotency_key = $1`,
              [
                idempotencyKeyHeader,
                JSON.stringify(body),
                body.holdToken,
                config.idempotency.ttlSeconds.toString(),
              ]
            );
          } else {
            await client.query(
              `INSERT INTO api_idempotency (idempotency_key, status, created_at, expires_at, request_fingerprint, hold_token)
               VALUES ($1, 'in_progress', NOW(), NOW() + ($4 || ' seconds')::interval, $2, $3)`,
              [
                idempotencyKeyHeader,
                JSON.stringify(body),
                body.holdToken,
                config.idempotency.ttlSeconds.toString(),
              ]
            );
          }

          const categoryIds = body.items.map((item) => item.categoryId);
          const categoriesResult = await client.query(
            `SELECT id, price, currency FROM ticket_categories WHERE id = ANY($1::text[]) AND event_id = $2 FOR UPDATE`,
            [categoryIds, body.eventId]
          );

          if (categoriesResult.rowCount !== body.items.length) {
            throw new Error("One or more ticket categories could not be locked for checkout");
          }

          let subtotal = 0;
          let currency = categoriesResult.rows[0].currency as string;
          const lineItems = categoriesResult.rows.map((row: { id: string; price: string; currency: string }) => {
            const requested = body.items.find((item) => item.categoryId === row.id);
            if (!requested) {
              throw new Error("Missing requested quantity for category");
            }
            const unitPrice = Number(row.price);
            if (currency && row.currency !== currency) {
              throw new Error("Ticket categories in checkout request must share the same currency");
            }
            subtotal += unitPrice * requested.quantity;
            currency = row.currency as string;
            return {
              categoryId: row.id as string,
              quantity: requested.quantity,
              unitPrice,
            };
          });

          const serviceFee = 0;
          const tax = 0;
          const discount = 0;
          const total = subtotal + serviceFee + tax - discount;

          const userIdHeader = request.headers["x-user-id"];
          const userId = typeof userIdHeader === "string" && userIdHeader.length > 0 ? userIdHeader : null;

          const generatedOrderNumber = generateOrderNumber();

          const orderResult = await client.query(
            `
              INSERT INTO orders (
                hold_token,
                event_id,
                order_number,
                user_id,
                status,
                subtotal,
                service_fee,
                processing_fee,
                tax,
                discount,
                total_amount,
                currency,
                attendee_first_name,
                attendee_last_name,
                attendee_email,
                attendee_phone,
                created_at,
                updated_at
              ) VALUES (
                $1, $2, $3, $4, 'pending_payment', $5, $6, 0, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW()
              )
              ON CONFLICT (hold_token) DO UPDATE SET
                subtotal = EXCLUDED.subtotal,
                service_fee = EXCLUDED.service_fee,
                tax = EXCLUDED.tax,
                discount = EXCLUDED.discount,
                total_amount = EXCLUDED.total_amount,
                currency = EXCLUDED.currency,
                attendee_first_name = EXCLUDED.attendee_first_name,
                attendee_last_name = EXCLUDED.attendee_last_name,
                attendee_email = EXCLUDED.attendee_email,
                attendee_phone = EXCLUDED.attendee_phone,
                updated_at = NOW()
              RETURNING id, order_number
            `,
            [
              body.holdToken,
              body.eventId,
              generatedOrderNumber,
              userId,
              subtotal,
              serviceFee,
              tax,
              discount,
              total,
              currency,
              body.customer.firstName,
              body.customer.lastName,
              body.customer.email,
              body.customer.phone,
            ]
          );

          const orderId = orderResult.rows[0].id as string;
          const orderNumber = orderResult.rows[0].order_number as string;

          for (const item of lineItems) {
            await client.query(
              `INSERT INTO order_items (order_id, category_id, quantity, unit_price, created_at, updated_at)
               VALUES ($1, $2, $3, $4, NOW(), NOW())
               ON CONFLICT (order_id, category_id) DO UPDATE SET quantity = EXCLUDED.quantity, unit_price = EXCLUDED.unit_price, updated_at = NOW()`,
              [orderId, item.categoryId, item.quantity, item.unitPrice]
            );
          }

          const responsePayload: CheckoutResponsePayload = {
            orderId,
            orderNumber,
            currency,
            totals: {
              subtotal,
              serviceFee,
              tax,
              total,
            },
            customer: body.customer,
            holdToken: body.holdToken,
            holdExpiresAt:
              holdClaim.expiresAt ?? new Date(Date.now() + config.hold.ttlSeconds * 1000).toISOString(),
          };

          return {
            reused: false,
            payload: responsePayload,
          };
        });

        if (transactionResult.reused) {
          return reply.status(200).send({ success: true, data: transactionResult.payload });
        }

        let holdCommitted = false;
        try {
          await markHoldCommitted(body.holdToken, transactionResult.payload.orderId);
          holdCommitted = true;

          const finalizationPayload: FinalizationMessage = {
            orderId: transactionResult.payload.orderId,
            holdToken: body.holdToken,
            eventId: body.eventId,
            items: body.items,
            paymentMethod: body.payment.method,
            paymentReference: body.payment.reference,
          };

          await sendFinalizationMessage(finalizationPayload, {
            correlationId: body.holdToken,
          });

          await withTransaction(async (client) => {
            await client.query(
              `UPDATE api_idempotency
                 SET status = 'completed', response_payload = $2::jsonb, completed_at = NOW(), updated_at = NOW()
               WHERE idempotency_key = $1`,
              [idempotencyKeyHeader, JSON.stringify(transactionResult.payload)]
            );
          });
        } catch (error) {
          await withTransaction(async (client) => {
            await client.query(
              `UPDATE api_idempotency
                 SET status = 'failed', updated_at = NOW()
               WHERE idempotency_key = $1`,
              [idempotencyKeyHeader]
            );
          });

          if (holdCommitted) {
            try {
              await releaseHold(body.holdToken, "checkout_failed", "cancelled");
            } catch (releaseError) {
              request.log.error({ err: releaseError }, "Failed to roll back hold after checkout failure");
            }
          }

          throw error;
        }

        return reply.status(202).send({ success: true, data: transactionResult.payload });
      } catch (error) {
        if (error instanceof IdempotencyConflictError) {
          return reply.status(409).send({ success: false, error: error.message });
        }

        request.log.error({ err: error }, "Checkout processing failed");
        return reply.status(500).send({ success: false, error: "Checkout failed" });
      }
    }
  );
}
