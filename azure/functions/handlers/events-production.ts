/**
 * Events API Handlers - Production (Prisma + Azure SQL)
 */

import { HttpRequest, HttpResponseInit } from '@azure/functions';
import prisma from '../prisma';

type SortOption = 'date' | 'popularity';

function ok(body: any): HttpResponseInit { return { status: 200, jsonBody: body }; }
function badRequest(message: string): HttpResponseInit { return { status: 400, jsonBody: { success: false, error: 'BAD_REQUEST', message } }; }
function notFound(message: string): HttpResponseInit { return { status: 404, jsonBody: { success: false, error: 'NOT_FOUND', message } }; }
function fail(message: string): HttpResponseInit { return { status: 500, jsonBody: { success: false, error: 'SERVER_ERROR', message } }; }

/**
 * GET /api/events
 * Query: category?, city?, date?, search?, page?, limit?, sort? (date|popularity)
 */
export async function listEventsHandler(req: HttpRequest): Promise<HttpResponseInit> {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get('category') || undefined;
    const city = url.searchParams.get('city') || undefined;
    const date = url.searchParams.get('date') || undefined; // ISO date or yyyy-mm-dd
    const search = url.searchParams.get('search') || undefined;
    const sort = (url.searchParams.get('sort') as SortOption) || 'date';
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '12', 10)));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (category && category !== 'all') where.category = category;
  if (city) where.venueCity = { equals: city };
    if (date) {
      const start = new Date(date);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      where.date = { gte: start, lt: end };
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { venueCity: { contains: search } },
      ];
    }

  const orderBy = sort === 'popularity' ? ({ viewCount: 'desc' as const }) : ({ date: 'asc' as const });

    const [total, events] = await Promise.all([
      prisma.event.count({ where }),
      prisma.event.findMany({ where, orderBy, skip, take: limit, select: {
        id: true, title: true, description: true, category: true, date: true, year: true,
        venueName: true, venueCity: true, imageUrl: true, bannerImageUrl: true, isFeatured: true, viewCount: true,
      }}),
    ]);

    return ok({ success: true, events, total, page, totalPages: Math.ceil(total / limit) });
  } catch (e: any) {
    return fail(`Failed to list events: ${e?.message || 'Unknown error'}`);
  }
}

/**
 * GET /api/events/:id
 */
export async function getEventHandler(req: HttpRequest): Promise<HttpResponseInit> {
  try {
    const path = new URL(req.url).pathname;
    const id = path.split('/').pop();
    if (!id) return badRequest('Event ID is required');

    const event = await prisma.event.findUnique({
      where: { id },
      include: { ticketCategories: true },
    });
    if (!event) return notFound('Event not found');

    // Simple related events: same category, upcoming, exclude self
    const related = await prisma.event.findMany({
      where: { category: event.category, id: { not: id } },
      orderBy: { date: 'asc' },
      take: 6,
      select: { id: true, title: true, date: true, venueCity: true, imageUrl: true, isFeatured: true },
    });

    return ok({ success: true, event, ticketCategories: event.ticketCategories, relatedEvents: related });
  } catch (e: any) {
    return fail(`Failed to fetch event: ${e?.message || 'Unknown error'}`);
  }
}

/**
 * GET /api/events/featured
 */
export async function featuredEventsHandler(): Promise<HttpResponseInit> {
  try {
    const events = await prisma.event.findMany({
      where: { isFeatured: true },
      orderBy: { date: 'asc' },
      take: 12,
      select: { id: true, title: true, date: true, venueCity: true, imageUrl: true, isFeatured: true },
    });
    return ok({ success: true, events });
  } catch (e: any) {
    return fail(`Failed to fetch featured events: ${e?.message || 'Unknown error'}`);
  }
}

/**
 * GET /api/search?q=term
 */
export async function searchEventsHandler(req: HttpRequest): Promise<HttpResponseInit> {
  try {
    const url = new URL(req.url);
    const q = (url.searchParams.get('q') || '').trim();
    if (!q || q.length < 2) {
      return ok({ success: true, events: [], total: 0 });
    }

    const events = await prisma.event.findMany({
      where: {
        OR: [
          { title: { contains: q } },
          { description: { contains: q } },
          { venueCity: { contains: q } },
          { venueName: { contains: q } },
        ],
      },
      orderBy: { date: 'asc' },
      take: 25,
      select: { id: true, title: true, date: true, venueCity: true, venueName: true, imageUrl: true, isFeatured: true },
    });

    return ok({ success: true, events, total: events.length });
  } catch (e: any) {
    return fail(`Failed to search events: ${e?.message || 'Unknown error'}`);
  }
}
