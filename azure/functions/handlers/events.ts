import { HttpRequest, HttpResponseInit } from '@azure/functions';
import prisma from '../prisma';

type SortOption = 'date' | 'popularity';

function ok(body: any): HttpResponseInit { return { status: 200, jsonBody: body }; }
function badRequest(message: string): HttpResponseInit { return { status: 400, jsonBody: { success: false, error: 'BAD_REQUEST', message } }; }
function notFound(message: string): HttpResponseInit { return { status: 404, jsonBody: { success: false, error: 'NOT_FOUND', message } }; }
function fail(message: string): HttpResponseInit { return { status: 500, jsonBody: { success: false, error: 'SERVER_ERROR', message } }; }

const EVENT_SUMMARY_SELECT = {
  id: true,
  title: true,
  artist: true,
  category: true,
  date: true,
  time: true,
  description: true,
  venueName: true,
  venueCity: true,
  venueAddress: true,
  venueCapacity: true,
  imageUrl: true,
  bannerImageUrl: true,
  tags: true,
  isFeatured: true,
  ticketCategories: {
    orderBy: { sortOrder: 'asc' as const },
    select: {
      id: true,
      name: true,
      displayName: true,
      price: true,
      currency: true,
      quantityTotal: true,
      quantitySold: true,
      benefits: true,
    },
  },
} as const;

export async function listEventsHandler(req: HttpRequest): Promise<HttpResponseInit> {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get('category') || undefined;
    const city = url.searchParams.get('city') || undefined;
    const date = url.searchParams.get('date') || undefined;
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
    const [total, eventsRaw] = await Promise.all([
      prisma.event.count({ where }),
      prisma.event.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: EVENT_SUMMARY_SELECT,
      }),
    ]);

    const events = eventsRaw.map(transformEventSummary);

    return ok({ success: true, events, total, page, totalPages: Math.ceil(total / limit) });
  } catch (e: any) {
    return fail(`Failed to list events: ${e?.message || 'Unknown error'}`);
  }
}

export async function getEventHandler(req: HttpRequest): Promise<HttpResponseInit> {
  try {
    const path = new URL(req.url).pathname;
    const id = path.split('/').pop();
    if (!id) return badRequest('Event ID is required');

    const event = await prisma.event.findUnique({
      where: { id },
      select: {
        ...EVENT_SUMMARY_SELECT,
        venueCapacity: true,
        tags: true,
      },
    });
    if (!event) return notFound('Event not found');

    const relatedRaw = await prisma.event.findMany({
      where: { category: event.category, id: { not: id } },
      orderBy: { date: 'asc' },
      take: 6,
      select: EVENT_SUMMARY_SELECT,
    });

    return ok({ success: true, event: transformEventDetail(event), relatedEvents: relatedRaw.map(transformEventSummary) });
  } catch (e: any) {
    return fail(`Failed to fetch event: ${e?.message || 'Unknown error'}`);
  }
}

export async function featuredEventsHandler(): Promise<HttpResponseInit> {
  try {
    const events = await prisma.event.findMany({
      where: { isFeatured: true },
      orderBy: { date: 'asc' },
      take: 12,
      select: EVENT_SUMMARY_SELECT,
    });
    return ok({ success: true, events: events.map(transformEventSummary) });
  } catch (e: any) {
    return fail(`Failed to fetch featured events: ${e?.message || 'Unknown error'}`);
  }
}

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
      select: EVENT_SUMMARY_SELECT,
    });

    return ok({ success: true, events: events.map(transformEventSummary), total: events.length });
  } catch (e: any) {
    return fail(`Failed to search events: ${e?.message || 'Unknown error'}`);
  }
}

function transformEventSummary(event: any) {
  return transformEvent(event);
}

function transformEventDetail(event: any) {
  return transformEvent(event);
}

function transformEvent(event: any) {
  const ticketCategories = Array.isArray(event.ticketCategories)
    ? event.ticketCategories.map(mapTicketCategory)
    : [];

  const pricing = derivePricing(ticketCategories, event);

  return {
    id: event.id,
    title: event.title,
    artist: event.artist ?? '',
    category: event.category,
    date: event.date instanceof Date ? event.date.toISOString() : event.date,
    time: event.time ?? '',
    venue: {
      name: event.venueName,
      city: event.venueCity,
      address: event.venueAddress ?? '',
      capacity: typeof event.venueCapacity === 'number' ? event.venueCapacity : 0,
    },
    image: event.imageUrl ?? '',
    bannerImage: event.bannerImageUrl ?? event.imageUrl ?? '',
    description: event.description ?? '',
    ticketCategories,
    pricing,
    featured: Boolean(event.isFeatured),
    tags: parseStringArray(event.tags),
  };
}

function mapTicketCategory(category: any) {
  const total = typeof category.quantityTotal === 'number' ? category.quantityTotal : 0;
  const sold = typeof category.quantitySold === 'number' ? category.quantitySold : 0;
  const available = Math.max(total - sold, 0);
  const ratio = total > 0 ? available / total : 0;
  const status = available === 0 ? 'sold-out'
    : ratio <= 0.1 ? 'low-stock'
    : 'available';

  return {
    id: category.id,
    name: category.name ?? category.displayName ?? 'GENERAL',
    displayName: category.displayName ?? category.name ?? 'General Admission',
    price: Number(category.price ?? 0),
    currency: category.currency ?? 'IDR',
    available,
    total,
    status,
    benefits: parseStringArray(category.benefits),
  };
}

function derivePricing(ticketCategories: any[], _event: any) {
  if (ticketCategories.length === 0) {
    return {
      min: 0,
      max: 0,
      currency: 'IDR',
    };
  }

  const prices = ticketCategories.map((category) => category.price ?? 0);
  const currency = ticketCategories.find((category) => category.currency)?.currency ?? 'IDR';

  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
    currency,
  };
}

function parseStringArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string');
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed)
        ? parsed.filter((item): item is string => typeof item === 'string')
        : [];
    } catch {
      return value.split(',').map((item) => item.trim()).filter(Boolean);
    }
  }
  return [];
}
