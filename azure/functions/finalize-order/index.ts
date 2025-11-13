import { InvocationContext } from '@azure/functions';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import prisma from '../prisma';
import { generateTicketQRCode } from '../utils/qrcode';
import { uploadBufferToBlob } from '../utils/storage';
import { finalizeHold } from '../utils/holdService';

type FinalizeOrderMessage = {
  orderId: string;
  userId?: string | null;
  paymentReference?: string | null;
  requestedAt?: string;
  holdToken?: string | null;
  eventId?: string | null;
};

type TicketPayload = {
  id: string;
  ticketNumber: string;
  orderId: string;
  eventId: string;
  categoryId: string;
  qrCodeData: string;
  qrCodeUrl: string | null;
  barcodeData: string;
};

export async function run(message: unknown, context: InvocationContext): Promise<void> {
  const payload = normalizeMessage(message);
  if (!payload?.orderId) {
    context.log('FinalizeOrder: skipping message without orderId');
    return;
  }

  context.log(`FinalizeOrder: processing order ${payload.orderId}`);

  const order = await prisma.order.findUnique({
    where: { id: payload.orderId },
    include: {
      orderItems: { include: { category: true } },
      tickets: true,
      event: true,
    },
  });

  if (!order) {
    context.log(`FinalizeOrder: order ${payload.orderId} not found`);
    return;
  }

  if (order.paymentStatus === 'completed' || order.status === 'confirmed') {
    context.log(`FinalizeOrder: order ${payload.orderId} already completed`);
    return;
  }

  if (!order.orderItems.length) {
    context.log(`FinalizeOrder: order ${payload.orderId} has no items`);
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'cancelled', paymentStatus: 'failed' } as any,
    });
    return;
  }

  const ticketNumberBase = `TKT-${order.orderNumber}`;
  const tickets: TicketPayload[] = [];

  for (const item of order.orderItems) {
    if (!item.categoryId || !item.category) {
      continue;
    }

    for (let i = 0; i < item.quantity; i++) {
      const ticketId = randomUUID();
      const ticketNumber = `${ticketNumberBase}-${item.category.name}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
      const { qrCodeData, qrCodeBuffer } = await generateTicketQRCode(ticketNumber, order.eventId, order.id);

      let qrUrl: string | null = null;
      try {
        const blobName = `${ticketNumber}.png`;
        const container = process.env.QR_CODES_CONTAINER || 'qr-codes';
        const url = await uploadBufferToBlob(qrCodeBuffer, container, blobName);
        if (url) {
          qrUrl = url;
        }
      } catch (error) {
        context.log(`FinalizeOrder: failed to upload QR for ticket ${ticketNumber}: ${error}`);
      }

      tickets.push({
        id: ticketId,
        ticketNumber,
        orderId: order.id,
        eventId: order.eventId,
        categoryId: item.categoryId,
        qrCodeData,
        qrCodeUrl: qrUrl,
        barcodeData: ticketNumber,
      });
    }
  }

  const now = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: {
        status: 'confirmed',
        paymentStatus: 'completed',
        paidAt: now,
        expiresAt: null,
      } as any,
    });

    for (const item of order.orderItems) {
      const category = await tx.ticketCategory.findUnique({
        where: { id: item.categoryId },
        select: { id: true, quantityTotal: true, quantitySold: true },
      });

      if (!category) {
        throw new Error(`Category ${item.categoryId} missing during finalization`);
      }

      if (category.quantityTotal - category.quantitySold < item.quantity) {
        throw new Error(`Insufficient inventory for category ${item.categoryId} during finalization`);
      }

      await tx.ticketCategory.update({
        where: { id: item.categoryId },
        data: {
          quantitySold: { increment: item.quantity },
        },
      });
    }

    for (const ticket of tickets) {
      await tx.ticket.create({
        data: {
          id: ticket.id,
          ticketNumber: ticket.ticketNumber,
          orderId: ticket.orderId,
          eventId: ticket.eventId,
          categoryId: ticket.categoryId,
          qrCodeData: ticket.qrCodeData,
          qrCodeUrl: ticket.qrCodeUrl ?? undefined,
          barcodeData: ticket.barcodeData,
          status: 'valid',
        } as any,
      });
    }
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

  const holdToken = order.holdToken || payload.holdToken || null;
  if (holdToken) {
    try {
      await finalizeHold(holdToken, {
        orderId: order.id,
        paymentReference: payload.paymentReference ?? undefined,
      });
    } catch (error) {
      context.log(`FinalizeOrder: failed to finalize hold ${holdToken}: ${error}`);
    }
  } else {
    context.log(`FinalizeOrder: order ${order.id} has no hold token to finalize`);
  }

  context.log(`FinalizeOrder: completed order ${payload.orderId}`);
}

function normalizeMessage(message: unknown): FinalizeOrderMessage | null {
  if (!message) {
    return null;
  }

  if (typeof message === 'string') {
    try {
      return JSON.parse(message) as FinalizeOrderMessage;
    } catch {
      return null;
    }
  }

  if (typeof message === 'object' && 'body' in (message as Record<string, unknown>)) {
    const body = (message as Record<string, unknown>).body;
    if (typeof body === 'string') {
      try {
        return JSON.parse(body) as FinalizeOrderMessage;
      } catch {
        return null;
      }
    }
    if (typeof body === 'object' && body !== null) {
      return body as FinalizeOrderMessage;
    }
  }

  if (typeof message === 'object' && message !== null) {
    return message as FinalizeOrderMessage;
  }

  return null;
}
