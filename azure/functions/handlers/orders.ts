import { HttpRequest, HttpResponseInit } from '@azure/functions';
import { Prisma } from '@prisma/client';
import prisma from '../prisma';
import { extractTokenFromHeader, verifyAccessToken } from '../utils/auth';
import {
  HOLD_TTL_SECONDS,
  acquireHold,
  claimHold,
  markHoldCommitted,
  releaseHold,
  type HoldAcquisitionResult,
  type HoldClaimResult,
} from '../utils/holdService';
import { sendToFinalizationQueue } from '../utils/serviceBus';

function ok(body: any): HttpResponseInit { return { status: 200, jsonBody: body }; }
function created(body: any): HttpResponseInit { return { status: 201, jsonBody: body }; }
function badRequest(message: string): HttpResponseInit { return { status: 400, jsonBody: { success: false, error: 'BAD_REQUEST', message } }; }
function unauthorized(message: string): HttpResponseInit { return { status: 401, jsonBody: { success: false, error: 'UNAUTHORIZED', message } }; }
function notFound(message: string): HttpResponseInit { return { status: 404, jsonBody: { success: false, error: 'NOT_FOUND', message } }; }
function fail(message: string): HttpResponseInit { return { status: 500, jsonBody: { success: false, error: 'SERVER_ERROR', message } }; }
function conflict(message: string, extra?: Record<string, unknown>): HttpResponseInit {
  return {
    status: 409,
    jsonBody: {
      success: false,
      error: 'CONFLICT',
      message,
      ...(extra ?? {}),
    },
  };
}

type CreateOrderBody = {
  eventId: string;
  tickets: Array<{ categoryId: string; quantity: number }>;
  attendeeInfo: { firstName: string; lastName: string; email: string; phone: string };
};

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

function isSerializationConflict(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return error.code === 'P2034';
  }
  if (error instanceof Error) {
    return /serialization failure/i.test(error.message) || /deadlock detected/i.test(error.message);
  }
  return false;
}

async function withSerializationRetry<T>(handler: () => Promise<T>, maxAttempts = 3): Promise<T> {
  let attempt = 0;
  let lastError: unknown;
  while (attempt < maxAttempts) {
    try {
      return await handler();
    } catch (error) {
      lastError = error;
      if (!isSerializationConflict(error) || attempt === maxAttempts - 1) {
        throw error;
      }

      const backoffMs = 50 * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
      attempt += 1;
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Transaction failed after retries');
}

/**
 * POST /api/orders/create
 */
export async function createOrderHandler(req: HttpRequest): Promise<HttpResponseInit> {
  try {
    const auth = extractTokenFromHeader(req.headers.get('authorization') || undefined);
    const userPayload = auth ? verifyAccessToken(auth) : null;
    if (!userPayload) return unauthorized('Authentication required');

    const body = (await req.json()) as CreateOrderBody;
    if (!body?.eventId || !Array.isArray(body.tickets) || body.tickets.length === 0 || !body.attendeeInfo?.email) {
      return badRequest('Invalid request body');
    }

    // Load event and categories
    const event = await prisma.event.findUnique({ where: { id: body.eventId } });
    if (!event) return notFound('Event not found');

    const categoryIds = body.tickets.map((t) => t.categoryId);
    const categories = await prisma.ticketCategory.findMany({ where: { id: { in: categoryIds } } });
    if (categories.length !== categoryIds.length) return badRequest('One or more ticket categories not found');

    // Validate ticket quantities
    for (const ticket of body.tickets) {
      if (!ticket.categoryId || typeof ticket.quantity !== 'number' || ticket.quantity <= 0) {
        return badRequest('Invalid ticket selection');
      }
    }

    const holdResult = await acquireHold({
      eventId: body.eventId,
      requesterId: userPayload.sub,
      traceId: req.headers.get('x-trace-id') ?? undefined,
      entries: body.tickets.map((ticket) => ({
        eventId: body.eventId,
        categoryId: ticket.categoryId,
        quantity: ticket.quantity,
      })),
    });

    if (!holdResult.success || !holdResult.holdToken) {
      return respondHoldFailure(holdResult);
    }

    const holdToken = holdResult.holdToken;
    const holdExpiresAt = holdResult.expiresAt
      ? new Date(holdResult.expiresAt)
      : new Date(Date.now() + HOLD_TTL_SECONDS * 1000);

    // Compute subtotal and basic fees
    let subtotal = 0;
    for (const item of body.tickets) {
      const cat = categories.find((c: any) => c.id === item.categoryId)!;
      subtotal += Number(cat.price) * item.quantity;
    }
    const serviceFee = roundCurrency(subtotal * 0.05);
    const tax = roundCurrency((subtotal + serviceFee) * 0.1);
    const totalAmount = roundCurrency(subtotal + serviceFee + tax);

    const now = new Date();
    const orderNumber = `EVX-${now.getFullYear()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

    const orderItemsData = body.tickets.map(({ categoryId, quantity }) => {
      const cat = categories.find((c) => c.id === categoryId)!;
      return {
        categoryId,
        quantity,
        unitPrice: Number(cat.price),
      };
    });

    let order;
    try {
      order = await withSerializationRetry(() =>
        prisma.$transaction(async (tx) => {
          const categoryRecords = await tx.ticketCategory.findMany({
            where: { id: { in: categoryIds } },
            select: { id: true, quantityTotal: true, quantitySold: true },
          });

          const pendingOrders = await tx.order.findMany({
            where: {
              status: { in: ['pending_payment', 'processing'] },
              expiresAt: { gt: now },
              orderItems: {
                some: { categoryId: { in: categoryIds } },
              },
            },
            select: {
              orderItems: {
                where: { categoryId: { in: categoryIds } },
                select: { categoryId: true, quantity: true },
              },
            },
          });

          const pendingMap = new Map<string, number>();
          for (const pendingOrder of pendingOrders) {
            for (const item of pendingOrder.orderItems) {
              pendingMap.set(item.categoryId, (pendingMap.get(item.categoryId) ?? 0) + item.quantity);
            }
          }

          for (const item of orderItemsData) {
            const category = categoryRecords.find((cat) => cat.id === item.categoryId);
            if (!category) {
              throw new Error('CATEGORY_NOT_FOUND');
            }
            const pending = pendingMap.get(item.categoryId) ?? 0;
            const available = category.quantityTotal - category.quantitySold - pending;
            if (available < item.quantity) {
              throw new Error('INSUFFICIENT_CAPACITY');
            }
          }

          return tx.order.create({
            data: {
              orderNumber,
              holdToken,
              userId: userPayload.sub,
              eventId: body.eventId,
              status: 'pending_payment',
              attendeeFirstName: body.attendeeInfo.firstName,
              attendeeLastName: body.attendeeInfo.lastName,
              attendeeEmail: body.attendeeInfo.email,
              attendeePhone: body.attendeeInfo.phone,
              subtotal,
              serviceFee,
              processingFee: 0,
              tax,
              totalAmount,
              currency: 'IDR',
              paymentStatus: 'pending',
              expiresAt: holdExpiresAt,
              orderItems: {
                create: orderItemsData,
              },
            } as any,
            select: {
              id: true,
              orderNumber: true,
              totalAmount: true,
              status: true,
              paymentStatus: true,
              expiresAt: true,
            },
          });
        }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })
      );
    } catch (error) {
      await releaseHold(holdToken, 'order_creation_failed', 'cancelled').catch(() => undefined);
      throw error;
    }

    return created({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
      status: order.status,
      expiresAt: order.expiresAt,
      holdToken,
      paymentUrl: null,
    });
  } catch (e: any) {
    if (e?.message === 'INSUFFICIENT_CAPACITY') {
      return badRequest('Selected ticket quantity is no longer available');
    }
    return fail(`Failed to create order: ${e?.message || 'Unknown error'}`);
  }
}

/**
 * POST /api/orders/:id/confirm
 */
export async function confirmOrderHandler(req: HttpRequest): Promise<HttpResponseInit> {
  try {
    const auth = extractTokenFromHeader(req.headers.get('authorization') || undefined);
    const userPayload = auth ? verifyAccessToken(auth) : null;
    if (!userPayload) return unauthorized('Authentication required');

    const id = new URL(req.url).pathname.split('/').pop();
    if (!id) return badRequest('Order ID is required');

    const order = await prisma.order.findFirst({
      where: { id, userId: userPayload.sub },
      include: {
        event: true,
        orderItems: { include: { category: true } },
        tickets: true,
      },
    });
    if (!order) return notFound('Order not found');

    if (order.status === 'confirmed' || order.paymentStatus === 'completed') {
      const mapped = mapOrder(order);
      return ok({ success: true, order: mapped, tickets: mapped.tickets });
    }

    if (order.expiresAt && order.expiresAt < new Date()) {
      return badRequest('Order hold has expired. Please start a new checkout session.');
    }

    if (!order.orderItems.length) {
      return fail('Order has no items to finalize');
    }

    if (order.paymentStatus === 'processing') {
      return { status: 202, headers: { 'content-type': 'application/json' }, jsonBody: { success: true, orderId: order.id, status: order.status } };
    }

    if (!order.holdToken) {
      return fail('Order is missing hold reservation data');
    }

    const holdClaim = await claimHold(order.holdToken, {
      orderReference: order.id,
      extendTtlSeconds: HOLD_TTL_SECONDS,
    });

    if (!holdClaim.success) {
      return respondHoldClaimFailure(holdClaim);
    }

    const requestBody = (await req.json().catch(() => null)) as { paymentReference?: string } | null;
    const paymentReference = requestBody?.paymentReference ?? order.paymentReference ?? null;
    let orderUpdated = false;

    try {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'processing',
          paymentStatus: 'processing',
          paymentReference,
          paidAt: new Date(),
          expiresAt: null,
        },
      });
      orderUpdated = true;

      await markHoldCommitted(order.holdToken, order.id);

      await sendToFinalizationQueue({
        orderId: order.id,
        userId: order.userId,
        holdToken: order.holdToken,
        eventId: order.eventId,
        paymentReference,
        requestedAt: new Date().toISOString(),
      });
    } catch (error) {
      if (orderUpdated) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: 'pending_payment',
            paymentStatus: 'pending',
            paymentReference,
          },
        }).catch(() => undefined);
      }

      await releaseHold(order.holdToken, 'checkout_failed', 'cancelled').catch(() => undefined);
      throw error;
    }

    return { status: 202, headers: { 'content-type': 'application/json' }, jsonBody: { success: true, orderId: order.id, status: 'processing' } };
  } catch (e: any) {
    return fail(`Failed to confirm order: ${e?.message || 'Unknown error'}`);
  }
}

/**
 * GET /api/orders/my-orders
 */
export async function myOrdersHandler(req: HttpRequest): Promise<HttpResponseInit> {
  try {
    const auth = extractTokenFromHeader(req.headers.get('authorization') || undefined);
    const userPayload = auth ? verifyAccessToken(auth) : null;
    if (!userPayload) return unauthorized('Authentication required');

    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '10', 10)));
    const skip = (page - 1) * limit;

    const [total, orders] = await Promise.all([
      prisma.order.count({ where: { userId: userPayload.sub } }),
      prisma.order.findMany({
        where: { userId: userPayload.sub },
        orderBy: { createdAt: 'desc' as const },
        skip,
        take: limit,
        select: { id: true, orderNumber: true, status: true, totalAmount: true, currency: true, createdAt: true, eventId: true },
      }),
    ]);

    return ok({ success: true, orders, total, page, totalPages: Math.ceil(total / limit) });
  } catch (e: any) {
    return fail(`Failed to list orders: ${e?.message || 'Unknown error'}`);
  }
}

/**
 * GET /api/orders/:id
 */
export async function getOrderHandler(req: HttpRequest): Promise<HttpResponseInit> {
  try {
    const auth = extractTokenFromHeader(req.headers.get('authorization') || undefined);
    const userPayload = auth ? verifyAccessToken(auth) : null;
    if (!userPayload) return unauthorized('Authentication required');

    const id = new URL(req.url).pathname.split('/').pop();
    if (!id) return badRequest('Order ID is required');

    const order = await prisma.order.findFirst({
      where: { id, userId: userPayload.sub },
      include: {
        event: true,
        orderItems: { include: { category: true } },
        tickets: true,
      },
    });

    if (!order) return notFound('Order not found');

    return ok({ success: true, order: mapOrder(order) });
  } catch (e: any) {
    return fail(`Failed to fetch order: ${e?.message || 'Unknown error'}`);
  }
}

function respondHoldClaimFailure(result: HoldClaimResult): HttpResponseInit {
  if (result.error === 'HOLD_EXPIRED') {
    return {
      status: 410,
      jsonBody: {
        success: false,
        error: 'HOLD_EXPIRED',
        message: 'Ticket hold has expired. Please start a new checkout session.',
      },
    };
  }

  if (result.error === 'HOLD_NOT_FOUND') {
    return conflict('Ticket hold could not be located', {
      error: 'HOLD_NOT_FOUND',
    });
  }

  return conflict('Unable to claim ticket hold', {
    error: result.error ?? 'HOLD_CLAIM_FAILED',
    status: result.status,
  });
}

function respondHoldFailure(result: HoldAcquisitionResult): HttpResponseInit {
  if (result.error === 'INSUFFICIENT_STOCK') {
    return conflict('Requested quantity exceeds available stock', {
      error: 'INSUFFICIENT_STOCK',
      categoryId: result.categoryId,
      available: result.available,
    });
  }

  if (result.error === 'INVALID_QUANTITY') {
    return badRequest('Quantity must be greater than zero');
  }

  return conflict('Unable to reserve selected tickets', {
    error: result.error ?? 'HOLD_FAILED',
  });
}

function mapOrder(order: any) {
  const event = order.event
    ? {
        id: order.event.id,
        title: order.event.title,
        date: order.event.date instanceof Date ? order.event.date.toISOString() : order.event.date,
        time: order.event.time,
        venueName: order.event.venueName,
        venueCity: order.event.venueCity,
        venueAddress: order.event.venueAddress,
      }
    : null;

  const items = Array.isArray(order.orderItems)
    ? order.orderItems.map((item: any) => ({
        id: item.id,
        categoryId: item.categoryId,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        category: item.category
          ? {
              id: item.category.id,
              name: item.category.name,
              displayName: item.category.displayName ?? item.category.name,
            }
          : null,
      }))
    : [];

  const tickets = Array.isArray(order.tickets)
    ? order.tickets.map((ticket: any) => ({
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        status: ticket.status,
        categoryId: ticket.categoryId,
        qrCodeUrl: ticket.qrCodeUrl,
        qrCodeData: ticket.qrCodeData,
        barcodeData: ticket.barcodeData,
        createdAt: ticket.createdAt instanceof Date ? ticket.createdAt.toISOString() : ticket.createdAt,
      }))
    : [];

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    subtotal: Number(order.subtotal ?? 0),
    serviceFee: Number(order.serviceFee ?? 0),
    processingFee: Number(order.processingFee ?? 0),
    tax: Number(order.tax ?? 0),
    discount: Number(order.discount ?? 0),
    totalAmount: Number(order.totalAmount ?? 0),
    currency: order.currency,
    attendee: {
      firstName: order.attendeeFirstName,
      lastName: order.attendeeLastName,
      email: order.attendeeEmail,
      phone: order.attendeePhone,
    },
    event,
    items,
    tickets,
    createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : order.createdAt,
    updatedAt: order.updatedAt instanceof Date ? order.updatedAt.toISOString() : order.updatedAt,
    paidAt: order.paidAt instanceof Date ? order.paidAt.toISOString() : order.paidAt,
  };
}
