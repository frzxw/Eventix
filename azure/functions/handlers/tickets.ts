/**
 * Tickets API Handler
 * Handles ticket retrieval and QR code generation
 */

import { Context, HttpRequest } from "@azure/functions";
import type { Ticket } from "../../src/lib/types";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Mock tickets storage
const ticketsStorage: Map<string, Ticket[]> = new Map();

/**
 * Generate a mock ticket for demonstration
 */
function generateMockTicket(orderId: string, eventId: string, categoryName: string, index: number): Ticket {
  const ticketId = `TKT-${orderId}-${index + 1}`;
  return {
    id: ticketId,
    orderId,
    eventId,
    eventTitle: "Event Title", // Would be retrieved from database
    eventDate: "2025-07-15",
    eventTime: "14:00",
    venue: "Jakarta International Expo",
    category: categoryName,
    qrCode: generateQRCode(ticketId),
    barcode: generateBarcode(ticketId),
    customerName: "Customer Name", // Would be from order details
    status: "valid",
  };
}

/**
 * Generate SVG QR Code (mock)
 */
function generateQRCode(ticketId: string): string {
  // In production, use a QR code library like 'qrcode'
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="white"/>
      <g fill="black">
        <rect x="10" y="10" width="20" height="20"/>
        <rect x="50" y="10" width="20" height="20"/>
        <rect x="90" y="10" width="20" height="20"/>
        <rect x="10" y="50" width="20" height="20"/>
        <rect x="50" y="50" width="20" height="20"/>
        <rect x="90" y="50" width="20" height="20"/>
      </g>
      <text x="50%" y="85%" text-anchor="middle" font-family="monospace" font-size="10">${ticketId}</text>
    </svg>
  `)}`;
}

/**
 * Generate mock barcode
 */
function generateBarcode(ticketId: string): string {
  // Mock barcode - in production would use barcode library
  return ticketId.split("").map((c) => (c.charCodeAt(0) % 10).toString()).join("");
}

/**
 * GET /api/tickets/:orderId
 * Get all tickets for an order
 */
export async function getTickets(context: Context, req: HttpRequest): Promise<void> {
  try {
    const urlParts = req.url.split("/");
    const orderId = urlParts[urlParts.length - 1]?.split("?")[0];

    if (!orderId) {
      context.res = {
        status: 400,
        body: { success: false, error: "Order ID is required" },
      };
      return;
    }

    // Check if tickets already generated
    let tickets = ticketsStorage.get(orderId);

    // If not, generate mock tickets
    if (!tickets) {
      // Generate 3 mock tickets for demonstration
      tickets = [
        generateMockTicket(orderId, "evt-001", "General Admission", 0),
        generateMockTicket(orderId, "evt-001", "General Admission", 1),
        generateMockTicket(orderId, "evt-001", "General Admission", 2),
      ];

      ticketsStorage.set(orderId, tickets);
    }

    context.res = {
      status: 200,
      body: {
        success: true,
        data: tickets,
      } as ApiResponse<Ticket[]>,
    };
  } catch (error: any) {
    context.log.error("getTickets error:", error);
    context.res = {
      status: 500,
      body: { success: false, error: "Failed to fetch tickets" },
    };
  }
}

/**
 * POST /api/tickets/:orderId/validate
 * Validate a ticket (check QR code)
 * Used by event organizers/scanners
 */
export async function validateTicket(context: Context, req: HttpRequest): Promise<void> {
  try {
    if (req.method !== "POST") {
      context.res = { status: 405, body: { success: false, error: "Method not allowed" } };
      return;
    }

    const { ticketId } = req.body;

    if (!ticketId) {
      context.res = {
        status: 400,
        body: { success: false, error: "Ticket ID is required" },
      };
      return;
    }

    // Find ticket
    let foundTicket: Ticket | undefined;
    for (const tickets of Array.from(ticketsStorage.values())) {
      foundTicket = tickets.find((t) => t.id === ticketId);
      if (foundTicket) break;
    }

    if (!foundTicket) {
      context.res = {
        status: 404,
        body: { success: false, error: "Ticket not found" },
      };
      return;
    }

    // Check if already used
    if (foundTicket.status === "used") {
      context.res = {
        status: 400,
        body: { success: false, error: "Ticket already used" },
      };
      return;
    }

    // Mark as used
    foundTicket.status = "used";

    context.res = {
      status: 200,
      body: {
        success: true,
        data: {
          message: "Ticket validated successfully",
          ticket: foundTicket,
        },
      },
    };
  } catch (error: any) {
    context.log.error("validateTicket error:", error);
    context.res = {
      status: 500,
      body: { success: false, error: "Failed to validate ticket" },
    };
  }
}

/**
 * Export tickets storage for testing
 */
export function getTicketsStorage() {
  return ticketsStorage;
}
