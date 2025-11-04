/**
 * Events API Handlers
 * Handles event listing, searching, and details
 */

import { Context, HttpRequest } from "@azure/functions";
import { mockEvents } from "../../src/lib/mock-data";
import type { Event } from "../../src/lib/types";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  total?: number;
  page?: number;
}

/**
 * GET /api/events
 * List all events with optional filtering
 * Query params: category?, city?, minPrice?, maxPrice?, page?, limit?
 */
export async function getEvents(context: Context, req: HttpRequest): Promise<void> {
  try {
    const { category, city, minPrice, maxPrice, page = "1", limit = "12" } = req.query;

    let filtered = [...mockEvents];

    // Filter by category
    if (category && category !== "all") {
      filtered = filtered.filter((e) => e.category === category);
    }

    // Filter by city
    if (city) {
      filtered = filtered.filter((e) => e.venue.city.toLowerCase() === city.toLowerCase());
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      const min = minPrice ? parseInt(minPrice as string) : 0;
      const max = maxPrice ? parseInt(maxPrice as string) : Infinity;
      filtered = filtered.filter((e) => e.pricing.min >= min && e.pricing.max <= max);
    }

    // Pagination
    const pageNum = parseInt(page as string) || 1;
    const pageSize = parseInt(limit as string) || 12;
    const start = (pageNum - 1) * pageSize;
    const paginated = filtered.slice(start, start + pageSize);

    context.res = {
      status: 200,
      body: {
        success: true,
        data: paginated,
        total: filtered.length,
        page: pageNum,
        totalPages: Math.ceil(filtered.length / pageSize),
      } as ApiResponse<Event[]>,
    };
  } catch (error: any) {
    context.log.error("getEvents error:", error);
    context.res = {
      status: 500,
      body: { success: false, error: "Failed to fetch events" },
    };
  }
}

/**
 * GET /api/events/:id
 * Get event details by ID
 */
export async function getEventById(context: Context, req: HttpRequest): Promise<void> {
  try {
    // Extract ID from URL
    const urlParts = req.url.split("/");
    const eventId = urlParts[urlParts.length - 1]?.split("?")[0];

    if (!eventId) {
      context.res = {
        status: 400,
        body: { success: false, error: "Event ID is required" },
      };
      return;
    }

    const event = mockEvents.find((e) => e.id === eventId);

    if (!event) {
      context.res = {
        status: 404,
        body: { success: false, error: "Event not found" },
      };
      return;
    }

    context.res = {
      status: 200,
      body: { success: true, data: event } as ApiResponse<Event>,
    };
  } catch (error: any) {
    context.log.error("getEventById error:", error);
    context.res = {
      status: 500,
      body: { success: false, error: "Failed to fetch event" },
    };
  }
}

/**
 * GET /api/events/featured
 * Get featured events only
 */
export async function getFeaturedEvents(context: Context, req: HttpRequest): Promise<void> {
  try {
    const featured = mockEvents.filter((e) => e.featured);

    context.res = {
      status: 200,
      body: {
        success: true,
        data: featured,
      } as ApiResponse<Event[]>,
    };
  } catch (error: any) {
    context.log.error("getFeaturedEvents error:", error);
    context.res = {
      status: 500,
      body: { success: false, error: "Failed to fetch featured events" },
    };
  }
}

/**
 * GET /api/search
 * Search events by query
 * Query params: q (search term)
 */
export async function searchEvents(context: Context, req: HttpRequest): Promise<void> {
  try {
    const query = req.query.q as string;

    if (!query || query.trim().length < 2) {
      context.res = {
        status: 200,
        body: { success: true, data: [] } as ApiResponse<Event[]>,
      };
      return;
    }

    const lowercaseQuery = query.toLowerCase();
    const results = mockEvents.filter(
      (event) =>
        event.title.toLowerCase().includes(lowercaseQuery) ||
        event.artist.toLowerCase().includes(lowercaseQuery) ||
        event.venue.city.toLowerCase().includes(lowercaseQuery) ||
        event.venue.name.toLowerCase().includes(lowercaseQuery) ||
        event.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery))
    );

    context.res = {
      status: 200,
      body: {
        success: true,
        data: results,
        total: results.length,
      } as ApiResponse<Event[]>,
    };
  } catch (error: any) {
    context.log.error("searchEvents error:", error);
    context.res = {
      status: 500,
      body: { success: false, error: "Failed to search events" },
    };
  }
}
