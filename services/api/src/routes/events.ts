import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { pool } from "../lib/db";
import { logger } from "../config/logger";

const DEFAULT_EVENT_IMAGE = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80";

const listQuerySchema = z.object({
  category: z.string().trim().min(1).optional(),
  city: z.string().trim().min(1).optional(),
  search: z.string().trim().min(1).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
  sort: z.enum(["date", "newest"]).optional(),
});

const eventIdParamsSchema = z.object({
  eventId: z.string().min(1),
});

const searchQuerySchema = z.object({
  query: z.string().trim().min(1),
  limit: z.coerce.number().int().min(1).max(20).optional(),
});

type TicketStatus = "available" | "low-stock" | "sold-out" | "waitlist";

type TicketCategoryResponse = {
  id: string;
  name: string;
  displayName: string;
  price: number;
  currency: string;
  available: number;
  total: number;
  status: TicketStatus;
  benefits: string[];
};

type EventResponse = {
  id: string;
  title: string;
  artist: string;
  category: string;
  date: string;
  time: string;
  venue: {
    name: string;
    address: string | null;
    city: string;
    capacity: number;
  };
  image: string | null;
  description: string;
  ticketCategories: TicketCategoryResponse[];
  pricing: {
    min: number;
    max: number;
    currency: string;
  };
  featured: boolean;
  tags: string[];
};

type QueryFilters = {
  id?: string;
  category?: string;
  city?: string;
  search?: string;
  isFeatured?: boolean;
  excludeId?: string;
  minPrice?: number;
  maxPrice?: number;
};

type QueryOptions = {
  filters: QueryFilters;
  page: number;
  limit: number;
  sort?: "date" | "newest";
  includeTotal?: boolean;
};

function deriveTicketStatus(available: number, total: number): TicketStatus {
  if (available <= 0) {
    return "sold-out";
  }

  if (total <= 0) {
    return "available";
  }

  const ratio = available / total;
  if (ratio <= 0.05) {
    return "waitlist";
  }

  if (ratio <= 0.2) {
    return "low-stock";
  }

  return "available";
}

function mapTicketCategory(raw: any): TicketCategoryResponse {
  const total = Number(raw.quantityTotal ?? raw.quantity_total ?? 0);
  const sold = Number(raw.quantitySold ?? raw.quantity_sold ?? 0);
  const available = Math.max(total - sold, 0);
  const benefitsRaw = raw.benefits;
  let benefits: string[] = [];
  if (typeof benefitsRaw === "string" && benefitsRaw.trim().length > 0) {
    try {
      const parsed = JSON.parse(benefitsRaw);
      if (Array.isArray(parsed)) {
        benefits = parsed.filter((item): item is string => typeof item === "string");
      }
    } catch (error) {
      logger.warn({ err: error }, "Failed to parse ticket category benefits JSON");
    }
  }

  return {
    id: raw.id,
    name: raw.name,
    displayName: raw.displayName ?? raw.display_name ?? raw.name,
    price: Number(raw.price ?? 0),
    currency: raw.currency ?? "IDR",
    available,
    total,
    status: deriveTicketStatus(available, total),
    benefits,
  };
}

function mapEventRow(row: any): EventResponse {
  const ticketCategoriesRaw = Array.isArray(row.ticket_categories) ? row.ticket_categories : [];
  const ticketCategories = ticketCategoriesRaw.map(mapTicketCategory);
  const prices = ticketCategories
    .map((category: TicketCategoryResponse) => category.price)
    .filter((price: number) => !Number.isNaN(price));
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

  const tagsRaw = row.tags;
  let tags: string[] = [];
  if (typeof tagsRaw === "string" && tagsRaw.trim().length > 0) {
    try {
      const parsed = JSON.parse(tagsRaw);
      if (Array.isArray(parsed)) {
        tags = parsed.filter((item): item is string => typeof item === "string");
      }
    } catch (error) {
      logger.warn({ err: error }, "Failed to parse event tags JSON");
    }
  }

  const eventDate = row.date instanceof Date ? row.date : new Date(row.date);
  const dateString = Number.isNaN(eventDate.getTime()) ? new Date().toISOString().split("T")[0] : eventDate.toISOString().split("T")[0];

  return {
    id: row.id,
    title: row.title,
    artist: row.artist ?? "TBA",
    category: row.category,
    date: dateString,
    time: row.time ?? "19:00",
    venue: {
      name: row.venue_name,
      address: row.venue_address ?? row.venue_city,
      city: row.venue_city,
      capacity: Number(row.venue_capacity ?? 0),
    },
    image: row.image_url ?? row.banner_image_url ?? DEFAULT_EVENT_IMAGE,
    description: row.description ?? "",
    ticketCategories,
    pricing: {
      min: minPrice,
      max: maxPrice,
      currency: ticketCategories[0]?.currency ?? "IDR",
    },
    featured: Boolean(row.is_featured),
    tags,
  };
}

function buildWhere(filters: QueryFilters) {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filters.id) {
    params.push(filters.id);
    conditions.push(`e.id = $${params.length}`);
  }

  if (filters.excludeId) {
    params.push(filters.excludeId);
    conditions.push(`e.id <> $${params.length}`);
  }

  if (filters.category) {
    params.push(filters.category);
    conditions.push(`e.category = $${params.length}`);
  }

  if (filters.city) {
    params.push(filters.city);
    conditions.push(`LOWER(e.venue_city) = LOWER($${params.length})`);
  }

  if (filters.isFeatured) {
    conditions.push(`e.is_featured = true`);
  }

  if (filters.search) {
    params.push(`%${filters.search}%`);
    const idx = params.length;
    conditions.push(`(e.title ILIKE $${idx} OR e.description ILIKE $${idx} OR e.artist ILIKE $${idx} OR e.venue_city ILIKE $${idx})`);
  }

  if (typeof filters.minPrice === "number" && typeof filters.maxPrice === "number") {
    params.push(filters.minPrice);
    const minIdx = params.length;
    params.push(filters.maxPrice);
    const maxIdx = params.length;
    conditions.push(
      `EXISTS (
        SELECT 1 FROM ticket_categories tc_price
        WHERE tc_price.event_id = e.id
        AND tc_price.price BETWEEN $${minIdx} AND $${maxIdx}
      )`
    );
  } else if (typeof filters.minPrice === "number") {
    params.push(filters.minPrice);
    const minIdx = params.length;
    conditions.push(
      `EXISTS (
        SELECT 1 FROM ticket_categories tc_min
        WHERE tc_min.event_id = e.id
        AND tc_min.price >= $${minIdx}
      )`
    );
  } else if (typeof filters.maxPrice === "number") {
    params.push(filters.maxPrice);
    const maxIdx = params.length;
    conditions.push(
      `EXISTS (
        SELECT 1 FROM ticket_categories tc_max
        WHERE tc_max.event_id = e.id
        AND tc_max.price <= $${maxIdx}
      )`
    );
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  return { whereClause, params };
}

async function queryEvents(options: QueryOptions) {
  const { whereClause, params } = buildWhere(options.filters);
  const orderBy = options.sort === "newest" ? "e.created_at DESC" : "e.date ASC";
  const offset = (options.page - 1) * options.limit;

  const paramsWithPaging = [...params, options.limit, offset];
  const sql = `
    SELECT
      e.id,
      e.title,
      e.artist,
      e.category,
      e.date,
      e.time,
      e.description,
      e.venue_name,
      e.venue_address,
      e.venue_city,
      e.venue_capacity,
      e.image_url,
      e.banner_image_url,
      e.tags,
      e.is_featured,
      COALESCE(
        json_agg(
          json_build_object(
            'id', tc.id,
            'name', tc.name,
            'displayName', tc.display_name,
            'price', tc.price,
            'currency', tc.currency,
            'quantityTotal', tc.quantity_total,
            'quantitySold', tc.quantity_sold,
            'benefits', tc.benefits
          ) ORDER BY tc.sort_order
        ) FILTER (WHERE tc.id IS NOT NULL),
        '[]'::json
      ) AS ticket_categories
    FROM events e
    LEFT JOIN ticket_categories tc ON tc.event_id = e.id
    ${whereClause}
    GROUP BY e.id
    ORDER BY ${orderBy}
    LIMIT $${params.length + 1} OFFSET $${params.length + 2};
  `;

  const { rows } = await pool.query(sql, paramsWithPaging);
  const events = rows.map(mapEventRow);

  if (!options.includeTotal) {
    return { events };
  }

  const countSql = `SELECT COUNT(*)::int AS total FROM events e ${whereClause};`;
  const { rows: countRows } = await pool.query(countSql, params);
  const total = countRows[0]?.total ?? 0;
  const totalPages = Math.max(Math.ceil(total / options.limit), 1);

  return { events, total, totalPages };
}

export async function eventsRoutes(app: FastifyInstance) {
  app.get(
    "/v1/events",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const parsed = listQuerySchema.parse(request.query ?? {});
        const page = parsed.page ?? 1;
        const limit = parsed.limit ?? 12;

        const { events, total = 0, totalPages = 1 } = await queryEvents({
          filters: {
            category: parsed.category,
            city: parsed.city,
            search: parsed.search,
            minPrice: parsed.minPrice,
            maxPrice: parsed.maxPrice,
          },
          page,
          limit,
          sort: parsed.sort,
          includeTotal: true,
        });

        return reply.send({
          success: true,
          data: {
            events,
            total,
            page,
            totalPages,
          },
        });
      } catch (error) {
        logger.error({ err: error }, "Failed to fetch events");
        return reply.status(500).send({ success: false, error: "Failed to fetch events" });
      }
    }
  );

  app.get(
    "/v1/events/featured",
    async (_request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { events } = await queryEvents({
          filters: { isFeatured: true },
          page: 1,
          limit: 8,
          sort: "date",
        });

        return reply.send({ success: true, data: { events } });
      } catch (error) {
        logger.error({ err: error }, "Failed to fetch featured events");
        return reply.status(500).send({ success: false, error: "Failed to fetch featured events" });
      }
    }
  );

  app.get(
    "/v1/events/:eventId",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { eventId } = eventIdParamsSchema.parse(request.params);
        const { events } = await queryEvents({
          filters: { id: eventId },
          page: 1,
          limit: 1,
        });

        const event = events[0];
        if (!event) {
          return reply.status(404).send({ success: false, error: "Event not found" });
        }

        const relatedResult = await queryEvents({
          filters: {
            category: event.category,
            excludeId: event.id,
          },
          page: 1,
          limit: 4,
        });

        return reply.send({
          success: true,
          data: {
            event,
            relatedEvents: relatedResult.events,
          },
        });
      } catch (error) {
        logger.error({ err: error }, "Failed to fetch event by id");
        return reply.status(500).send({ success: false, error: "Failed to fetch event" });
      }
    }
  );

  app.get(
    "/v1/events/search",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const parsed = searchQuerySchema.parse(request.query ?? {});
        const { events } = await queryEvents({
          filters: { search: parsed.query },
          page: 1,
          limit: parsed.limit ?? 5,
        });

        return reply.send({ success: true, data: { events } });
      } catch (error) {
        logger.error({ err: error }, "Failed to search events");
        return reply.status(500).send({ success: false, error: "Failed to search events" });
      }
    }
  );
}
