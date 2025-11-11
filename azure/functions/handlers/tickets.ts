import { HttpRequest, HttpResponseInit } from '@azure/functions';
import prisma from '../prisma';
import { extractTokenFromHeader, verifyAccessToken } from '../utils/auth';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { generateQRCodeBuffer } from '../utils/qrcode';

function ok(body: any): HttpResponseInit { return { status: 200, jsonBody: body }; }
function badRequest(message: string): HttpResponseInit { return { status: 400, jsonBody: { success: false, error: 'BAD_REQUEST', message } }; }
function unauthorized(message: string): HttpResponseInit { return { status: 401, jsonBody: { success: false, error: 'UNAUTHORIZED', message } }; }
function notFound(message: string): HttpResponseInit { return { status: 404, jsonBody: { success: false, error: 'NOT_FOUND', message } }; }
function fail(message: string): HttpResponseInit { return { status: 500, jsonBody: { success: false, error: 'SERVER_ERROR', message } }; }

/**
 * GET /api/tickets/my-tickets
 */
export async function myTicketsHandler(req: HttpRequest): Promise<HttpResponseInit> {
  try {
    const auth = extractTokenFromHeader(req.headers.get('authorization') || undefined);
    const userPayload = auth ? verifyAccessToken(auth) : null;
    if (!userPayload) return unauthorized('Authentication required');

    const tickets = await prisma.ticket.findMany({
      where: { order: { userId: userPayload.sub } } as any,
      orderBy: { createdAt: 'desc' as const },
      select: {
        id: true,
        ticketNumber: true,
        status: true,
        eventId: true,
        orderId: true,
        categoryId: true,
        qrCodeUrl: true,
        qrCodeData: true,
        barcodeData: true,
        createdAt: true,
      },
    });

    if (tickets.length === 0) {
      return ok({ success: true, tickets: [] });
    }

    const eventIds = Array.from(new Set(tickets.map((ticket) => ticket.eventId).filter(Boolean)));
    const categoryIds = Array.from(new Set(tickets.map((ticket) => ticket.categoryId).filter(Boolean)));
    const orderIds = Array.from(new Set(tickets.map((ticket) => ticket.orderId).filter(Boolean)));

    const [events, categories, orders] = await Promise.all([
      eventIds.length > 0
        ? prisma.event.findMany({
            where: { id: { in: eventIds } },
            select: {
              id: true,
              title: true,
              date: true,
              venueName: true,
              venueCity: true,
            },
          })
        : Promise.resolve([]),
      categoryIds.length > 0
        ? prisma.ticketCategory.findMany({
            where: { id: { in: categoryIds } },
            select: {
              id: true,
              name: true,
              displayName: true,
            },
          })
        : Promise.resolve([]),
      orderIds.length > 0
        ? prisma.order.findMany({
            where: { id: { in: orderIds } },
            select: {
              id: true,
              orderNumber: true,
              attendeeFirstName: true,
              attendeeLastName: true,
              attendeeEmail: true,
            },
          })
        : Promise.resolve([]),
    ]);

    const eventMap = new Map(events.map((event) => [event.id, event]));
    const categoryMap = new Map(categories.map((category) => [category.id, category]));
    const orderMap = new Map(orders.map((order) => [order.id, order]));

    const enrichedTickets = tickets.map((ticket) => {
      const event = eventMap.get(ticket.eventId);
      const category = ticket.categoryId ? categoryMap.get(ticket.categoryId) : undefined;
      const order = orderMap.get(ticket.orderId);

      return {
        ...ticket,
        createdAt: ticket.createdAt instanceof Date ? ticket.createdAt.toISOString() : ticket.createdAt,
        event: event
          ? {
              id: event.id,
              title: event.title,
              date: event.date instanceof Date ? event.date.toISOString() : event.date,
              venueName: event.venueName,
              venueCity: event.venueCity,
            }
          : null,
        category: category
          ? {
              id: category.id,
              name: category.name,
              displayName: category.displayName ?? category.name,
            }
          : null,
        order: order
          ? {
              id: order.id,
              orderNumber: order.orderNumber,
              attendeeFirstName: order.attendeeFirstName,
              attendeeLastName: order.attendeeLastName,
              attendeeEmail: order.attendeeEmail,
            }
          : null,
      };
    });

    return ok({ success: true, tickets: enrichedTickets });
  } catch (e: any) {
    return fail(`Failed to fetch tickets: ${e?.message || 'Unknown error'}`);
  }
}

/**
 * POST /api/tickets/:id/transfer
 */
export async function transferTicketHandler(req: HttpRequest): Promise<HttpResponseInit> {
  try {
    const auth = extractTokenFromHeader(req.headers.get('authorization') || undefined);
    const userPayload = auth ? verifyAccessToken(auth) : null;
    if (!userPayload) return unauthorized('Authentication required');

    const id = new URL(req.url).pathname.split('/').pop();
    if (!id) return badRequest('Ticket ID is required');
    const body = (await req.json()) as { toEmail?: string };
    if (!body?.toEmail) return badRequest('toEmail is required');

    const ticket = await prisma.ticket.findUnique({ where: { id }, include: { order: true } });
    if (!ticket) return notFound('Ticket not found');
    if (ticket.order?.userId !== userPayload.sub) return unauthorized('Ticket does not belong to you');

    const updated = await prisma.ticket.update({
      where: { id },
      data: { transferredToEmail: body.toEmail, transferredAt: new Date(), status: 'transferred' } as any,
      select: { id: true, ticketNumber: true, status: true, transferredToEmail: true, transferredAt: true },
    });

    return ok({ success: true, ticket: updated });
  } catch (e: any) {
    return fail(`Failed to transfer ticket: ${e?.message || 'Unknown error'}`);
  }
}

/**
 * GET /api/tickets/:id/download
 */
export async function downloadTicketPdfHandler(req: HttpRequest): Promise<HttpResponseInit> {
  try {
    const id = new URL(req.url).pathname.split('/').pop();
    if (!id) return badRequest('Ticket ID is required');
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      select: {
        id: true,
        ticketNumber: true,
        status: true,
        eventId: true,
        orderId: true,
        categoryId: true,
        qrCodeData: true,
      },
    });
    if (!ticket) return notFound('Ticket not found');

    const [event, order, category] = await Promise.all([
      prisma.event.findUnique({
        where: { id: ticket.eventId },
        select: { id: true, title: true, date: true, venueName: true, venueCity: true },
      }),
      prisma.order.findUnique({
        where: { id: ticket.orderId },
        select: { id: true, attendeeFirstName: true, attendeeLastName: true, attendeeEmail: true },
      }) as any,
      prisma.ticketCategory?.findUnique?.({
        where: { id: ticket.categoryId },
        select: { id: true, name: true, price: true, currency: true },
      } as any) || Promise.resolve(null),
    ]);

    const qrPayload = ticket.qrCodeData || `EVENTIX:${ticket.ticketNumber}:${ticket.eventId}:${ticket.orderId}`;
    const qrPng = await generateQRCodeBuffer(qrPayload);

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]);
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const qrImage = await pdfDoc.embedPng(qrPng);

    const pad = 40;
    page.drawText('Eventix Ticket', { x: pad, y: height - pad - 12, size: 20, font: bold, color: rgb(0.35, 0.35, 0.9) });
    page.drawLine({ start: { x: pad, y: height - pad - 18 }, end: { x: width - pad, y: height - pad - 18 }, thickness: 1, color: rgb(0.85, 0.85, 0.95) });

    const yStart = height - pad - 60;
    let y = yStart;
    const textSize = 12;
    const lineGap = 18;

    const eventTitle = event?.title || 'Event';
    const when = event?.date ? new Date(event.date as any).toLocaleDateString('en-US') : '';
    const venue = [event?.venueName, event?.venueCity].filter(Boolean).join(', ');
    const attendee = [order?.attendeeFirstName, order?.attendeeLastName].filter(Boolean).join(' ') || order?.attendeeEmail || '';
    const catName = category?.name ? ` (${category.name})` : '';

    page.drawText(`Event: ${eventTitle}`, { x: pad, y, size: textSize + 1, font: bold }); y -= lineGap;
    if (when) { page.drawText(`When: ${when}`, { x: pad, y, size: textSize, font }); y -= lineGap; }
    if (venue) { page.drawText(`Venue: ${venue}`, { x: pad, y, size: textSize, font }); y -= lineGap; }
    if (attendee) { page.drawText(`Attendee: ${attendee}`, { x: pad, y, size: textSize, font }); y -= lineGap; }
    page.drawText(`Ticket: ${ticket.ticketNumber}${catName}`, { x: pad, y, size: textSize, font }); y -= lineGap * 1.5;

    const qrSize = 180;
    const qrX = pad;
    const qrY = y - qrSize;
    page.drawRectangle({ x: qrX - 10, y: qrY - 10, width: qrSize + 20, height: qrSize + 20, color: rgb(0.97, 0.97, 0.99) });
    page.drawImage(qrImage, { x: qrX, y: qrY, width: qrSize, height: qrSize });
    page.drawText('Please present this QR at entry', { x: qrX, y: qrY - 16, size: 10, font, color: rgb(0.3, 0.3, 0.3) });

    page.drawText('© Eventix — Secure, unique QR. Do not share.', { x: pad, y: 20, size: 9, font, color: rgb(0.45, 0.45, 0.45) });

    const pdfBytes = await pdfDoc.save();
    const filename = `Ticket-${ticket.ticketNumber}.pdf`;
    const headers = {
      'content-type': 'application/pdf',
      'content-disposition': `attachment; filename="${filename}"`,
      'cache-control': 'no-store',
    };
    return { status: 200, headers, body: Buffer.from(pdfBytes) as any };
  } catch (e: any) {
    return fail(`Failed to download ticket: ${e?.message || 'Unknown error'}`);
  }
}
