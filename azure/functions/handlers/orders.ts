import { HttpRequest, HttpResponseInit } from '@azure/functions';
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

    // Compute subtotal and basic fees
    let subtotal = 0;
    for (const item of body.tickets) {
      const cat = categories.find((c: any) => c.id === item.categoryId)!;
      subtotal += Number(cat.price) * item.quantity;
    }
    const serviceFee = Math.round(subtotal * 0.05 * 100) / 100;
    const tax = Math.round((subtotal + serviceFee) * 0.1 * 100) / 100;
    const totalAmount = Math.round((subtotal + serviceFee + tax) * 100) / 100;

    const orderNumber = `EVX-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: userPayload.sub,
        eventId: body.eventId,
        status: 'pending',
        attendeeFirstName: body.attendeeInfo.firstName,
        attendeeLastName: body.attendeeInfo.lastName,
        attendeeEmail: body.attendeeInfo.email,
        attendeePhone: body.attendeeInfo.phone,
        subtotal,
        serviceFee,
        tax,
        totalAmount,
        currency: 'IDR',
      } as any,
      select: { id: true, orderNumber: true, totalAmount: true },
    });

    return created({ success: true, orderId: order.id, orderNumber: order.orderNumber, totalAmount: order.totalAmount, paymentUrl: null });
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

    const order = await prisma.order.findUnique({ where: { id }, include: { event: true } });
    if (!order) return notFound('Order not found');

    // For now, create a single ticket; later, iterate stored order items
    const ticketNumberBase = `TKT-${order.orderNumber}`;
    const ticketsToCreate: any[] = [];

    const ticketNumber = `${ticketNumberBase}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    const { qrCodeData, qrCodeBuffer } = await generateTicketQRCode(ticketNumber, order.eventId, order.id);

    let qrUrl: string | null = null;
    try {
      const blobName = `${ticketNumber}.png`;
      const container = process.env.QR_CODES_CONTAINER || 'qr-codes';
      const url = await uploadBufferToBlob(qrCodeBuffer, container, blobName);
      if (url) qrUrl = url;
    } catch {}

    ticketsToCreate.push({
      ticketNumber,
      orderId: order.id,
      eventId: order.eventId,
      categoryId: undefined,
      qrCodeData,
      qrCodeUrl: qrUrl,
      status: 'valid',
    });

    await prisma.$transaction([
      prisma.order.update({ where: { id: order.id }, data: { status: 'confirmed', paymentStatus: 'confirmed' } as any }),
      prisma.ticket.create({ data: ticketsToCreate[0] as any }),
    ]);

    return ok({ success: true, order: { id: order.id, status: 'confirmed' }, tickets: [ticketsToCreate[0]] });
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
