import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { createHold } from "../inventory/holdService";
import type { HoldAcquisitionResult } from "../inventory/types";

const createHoldSchema = z.object({
  eventId: z.string().min(1),
  requesterId: z.string().optional(),
  selections: z
    .array(
      z.object({
        categoryId: z.string().min(1),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
});

type CreateHoldBody = z.infer<typeof createHoldSchema>;

type HoldResponseCategory = {
  categoryId: string;
  available: number;
  pending: number;
  total: number;
  status: "available" | "low-stock" | "almost-sold-out" | "sold-out" | "reserved-by-user";
  reservedQuantity: number;
};

function deriveStockStatus(available: number, total: number): HoldResponseCategory["status"] {
  if (available <= 0) {
    return "sold-out";
  }
  if (total <= 0) {
    return "available";
  }
  const ratio = available / total;
  if (ratio <= 0.05) {
    return "almost-sold-out";
  }
  if (ratio <= 0.2) {
    return "low-stock";
  }
  return "available";
}

function mapHoldResult(
  body: CreateHoldBody,
  result: HoldAcquisitionResult
): { holdToken: string; expiresAt: string; expiresAtEpoch: number; categories: HoldResponseCategory[] } {
  const categories: HoldResponseCategory[] = (result.entries ?? []).map((entry) => {
    const selection = body.selections.find((s) => s.categoryId === entry.categoryId);
    const reservedQuantity = selection?.quantity ?? 0;
    const status = reservedQuantity > 0 ? "reserved-by-user" : deriveStockStatus(entry.available, entry.total);
    return {
      categoryId: entry.categoryId,
      available: entry.available,
      pending: entry.pending,
      total: entry.total,
      status,
      reservedQuantity,
    };
  });

  return {
    holdToken: result.holdToken as string,
    expiresAt: result.expiresAt as string,
    expiresAtEpoch: result.expiresAtEpoch as number,
    categories,
  };
}

function mapHoldError(result: HoldAcquisitionResult) {
  const base = { success: false, error: result.error };
  switch (result.error) {
    case "INSUFFICIENT_STOCK":
      return {
        ...base,
        statusCode: 409,
        message: "Requested quantity exceeds available stock",
        categoryId: result.categoryId,
        available: result.available,
      };
    case "INVALID_QUANTITY":
      return {
        ...base,
        statusCode: 400,
        message: "Quantity must be greater than zero",
        categoryId: result.categoryId,
      };
    default:
      return {
        ...base,
        statusCode: 409,
        message: "Unable to place hold on inventory",
      };
  }
}

export async function inventoryRoutes(app: FastifyInstance) {
  app.post(
    "/v1/inventory/holds",
    async (request: FastifyRequest<{ Body: CreateHoldBody }>, reply: FastifyReply) => {
    const body = createHoldSchema.parse(request.body);
    const result = await createHold({
      eventId: body.eventId,
      requesterId: body.requesterId,
      entries: body.selections.map((selection) => ({
        eventId: body.eventId,
        categoryId: selection.categoryId,
        quantity: selection.quantity,
      })),
      traceId: request.headers["x-trace-id"] as string | undefined,
    });

      if (!result.success) {
        const errorPayload = mapHoldError(result);
        return reply
          .status(errorPayload.statusCode)
          .send({ success: false, error: errorPayload.message, details: errorPayload });
      }

      const payload = mapHoldResult(body, result);
      return reply.status(201).send({ success: true, data: payload });
    }
  );
}
