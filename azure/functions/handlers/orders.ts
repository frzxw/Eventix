import { HttpRequest, HttpResponseInit } from '@azure/functions';
import { randomUUID } from 'crypto';
import prisma from '../prisma';
import { extractTokenFromHeader, verifyAccessToken } from '../utils/auth';
import { generateTicketQRCode } from '../utils/qrcode';
import { uploadBufferToBlob } from '../utils/storage';

function ok(body: any): HttpResponseInit { return { status: 200, jsonBody: body }; }
function created(body: any): HttpResponseInit { return { status: 201, jsonBody: body }; }
function badRequest(message: string): HttpResponseInit { return { status: 400, jsonBody: { success: false, error: 'BAD_REQUEST', message } }; }
function unauthorized(message: string): HttpResponseInit { return { status: 401, jsonBody: { success: false, error: 'UNAUTHORIZED', message } }; }
function notFound(message: string): HttpResponseInit { return { status: 404, jsonBody: { success: false, error: 'NOT_FOUND', message } }; }
function fail(message: string): HttpResponseInit { return { status: 500, jsonBody: { success: false, error: 'SERVER_ERROR', message } }; }

type CreateOrderBody = {
  eventId: string;
  tickets: Array<{ categoryId: string; quantity: number }>;
  attendeeInfo: { firstName: string; lastName: string; email: string; phone: string };
};

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
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

    // Compute subtotal and basic fees
    let subtotal = 0;
    for (const item of body.tickets) {
      const cat = categories.find((c: any) => c.id === item.categoryId)!;
      subtotal += Number(cat.price) * item.quantity;
    }
    const serviceFee = roundCurrency(subtotal * 0.05);
    const tax = roundCurrency((subtotal + serviceFee) * 0.1);
    const totalAmount = roundCurrency(subtotal + serviceFee + tax);

    const orderNumber = `EVX-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    const holdToken = randomUUID();

    const orderItemsData = body.tickets.map(({ categoryId, quantity }) => {
      const cat = categories.find((c) => c.id === categoryId)!;
      return {
        categoryId,
        quantity,
        unitPrice: Number(cat.price),
      };
    });

    const order = await prisma.order.create({
      data: {
        orderNumber,
        holdToken,
        userId: userPayload.sub,
        eventId: body.eventId,
        status: 'pending',
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
      },
    });

    return created({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
      paymentUrl: null,
    });
  } catch (e: any) {
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

    if (order.status === 'confirmed' || order.paymentStatus === 'confirmed' || order.paymentStatus === 'completed') {
      const mapped = mapOrder(order);
      return ok({ success: true, order: mapped, tickets: mapped.tickets });
    }

    // For now, create a single ticket; later, iterate stored order items
    const ticketNumberBase = `TKT-${order.orderNumber}`;
    const ticketPayloads: Array<{
      id: string;
      ticketNumber: string;
      orderId: string;
      eventId: string;
      categoryId: string;
      qrCodeData: string;
      qrCodeUrl: string | null;
      barcodeData: string;
      status: string;
    }> = [];

    for (const item of order.orderItems) {
      if (!item.categoryId || !item.category) continue;

      for (let i = 0; i < item.quantity; i++) {
        const ticketId = randomUUID();
        const ticketNumber = `${ticketNumberBase}-${item.category.name}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
        const { qrCodeData, qrCodeBuffer } = await generateTicketQRCode(ticketNumber, order.eventId, order.id);

        let qrUrl: string | null = null;
        try {
          const blobName = `${ticketNumber}.png`;
          const container = process.env.QR_CODES_CONTAINER || 'qr-codes';
          const url = await uploadBufferToBlob(qrCodeBuffer, container, blobName);
          if (url) qrUrl = url;
        } catch {
          qrUrl = null;
        }

        ticketPayloads.push({
          id: ticketId,
          ticketNumber,
          orderId: order.id,
          eventId: order.eventId,
          categoryId: item.categoryId,
          qrCodeData,
          qrCodeUrl: qrUrl,
          barcodeData: ticketNumber,
          status: 'valid',
        });
      }
    }

    await prisma.$transaction([
      prisma.order.update({
        where: { id: order.id },
        data: { status: 'confirmed', paymentStatus: 'completed', paidAt: new Date() } as any,
      }),
      ...order.orderItems.map((item) =>
        prisma.ticketCategory.update({
          where: { id: item.categoryId },
          data: { quantitySold: { increment: item.quantity } },
        })
      ),
      ...ticketPayloads.map((ticket) =>
        prisma.ticket.create({
          data: {
            id: ticket.id,
            ticketNumber: ticket.ticketNumber,
            orderId: ticket.orderId,
            eventId: ticket.eventId,
            categoryId: ticket.categoryId,
            qrCodeData: ticket.qrCodeData,
            qrCodeUrl: ticket.qrCodeUrl ?? undefined,
            barcodeData: ticket.barcodeData,
            status: ticket.status,
          } as any,
        })
      ),
    ]);

    const updated = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        event: true,
        orderItems: { include: { category: true } },
        tickets: true,
      },
    });

    const mapped = updated ? mapOrder(updated) : mapOrder(order);

    return ok({ success: true, order: mapped, tickets: mapped.tickets });
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
