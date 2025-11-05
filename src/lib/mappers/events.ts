import type { Event, TicketCategoryInfo } from "../types";

function toNumber(n: any, fallback = 0): number {
  const v = typeof n === "string" ? parseFloat(n) : n;
  return Number.isFinite(v) ? Number(v) : fallback;
}

function parseTags(tags: any): string[] {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.filter((t) => typeof t === "string");
  if (typeof tags === "string") {
    try {
      const arr = JSON.parse(tags);
      return Array.isArray(arr) ? arr.filter((t) => typeof t === "string") : [];
    } catch {
      return [];
    }
  }
  return [];
}

function mapTicketCategory(cat: any): TicketCategoryInfo | null {
  if (!cat) return null;
  const id = cat.id || cat.category_id || cat.categoryId || cat.name;
  const price = toNumber(cat.price, 0);
  const total = toNumber(cat.quantity_total ?? cat.total, 0);
  const sold = toNumber(cat.quantity_sold ?? cat.sold, 0);
  const available = toNumber(
    cat.quantity_available ?? cat.available ?? Math.max(total - sold, 0),
    0
  );
  const displayName = cat.displayName || cat.name || "GENERAL";
  const name = (cat.name || "GENERAL").toUpperCase();
  const status: TicketCategoryInfo["status"] = available <= 0
    ? "sold-out"
    : available / Math.max(total || available, 1) < 0.15
    ? "low-stock"
    : "available";

  return {
    id: String(id ?? displayName),
    name: name as any,
    displayName: String(displayName),
    price,
    currency: (cat.currency || "IDR").toString(),
    available,
    total: Math.max(total || available, available),
    status,
    benefits: Array.isArray(cat.benefits) ? cat.benefits : undefined,
  };
}

export function mapApiEvent(input: any): Event {
  const venueName = input.venue_name || input.venue?.name || "";
  const venueCity = input.venue_city || input.venue?.city || "";
  const venueAddress = input.venue_address || input.venue?.address || "";

  // ticket categories from various shapes
  const rawCats: any[] = Array.isArray(input.ticketCategories)
    ? input.ticketCategories
    : Array.isArray(input.ticket_categories)
    ? input.ticket_categories
    : [];
  const ticketCategories = rawCats
    .map(mapTicketCategory)
    .filter((x): x is TicketCategoryInfo => !!x);

  const prices = ticketCategories.map((c) => c.price);
  const min = prices.length ? Math.min(...prices) : 0;
  const max = prices.length ? Math.max(...prices) : 0;

  return {
    id: String(input.id || input.eventId || input.event_id || ""),
    title: String(input.title || input.name || "Untitled Event"),
    artist: String(input.artist || input.organizer_name || input.organizer || ""),
    category: (input.category || "other") as any,
    date: String(input.date || input.start_date || new Date().toISOString().slice(0, 10)),
    time: String(input.time || input.start_time || "19:00"),
    venue: {
      name: String(venueName),
      city: String(venueCity),
      address: String(venueAddress),
      capacity: toNumber(input.venue_capacity || input.capacity, 0),
    },
    image: String(input.image_url || input.image || ""),
    description: String(input.description || ""),
    ticketCategories,
    pricing: { min, max, currency: String(input.currency || "IDR") },
    featured: Boolean(input.is_featured ?? input.featured ?? false),
    tags: parseTags(input.tags),
  };
}

export function mapApiEvents(list: any[] | undefined | null): Event[] {
  if (!Array.isArray(list)) return [];
  return list.map(mapApiEvent);
}
