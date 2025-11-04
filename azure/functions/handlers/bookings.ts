/**
 * Bookings API Handlers
 * Handles order creation, retrieval, and management
 */

import { Context, HttpRequest } from "@azure/functions";
import { mockEvents } from "../../src/lib/mock-data";
import type { Order, CartItem } from "../../src/lib/types";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// In-memory storage (replace with database in production)
const orders: Map<string, Order> = new Map();

/**
 * POST /api/bookings
 * Create a new booking
 * Request body: {
 *   eventId: string;
 *   items: CartItem[];
 *   customerDetails: { firstName, lastName, email, phone, country }
 *   promoCode?: string;
 * }
 */
export async function createBooking(context: Context, req: HttpRequest): Promise<void> {
  try {
    if (req.method !== "POST") {
      context.res = { status: 405, body: { success: false, error: "Method not allowed" } };
      return;
    }

    const { eventId, items, customerDetails, promoCode } = req.body;

    // Validation
    if (!eventId || !items || !customerDetails) {
      context.res = {
        status: 400,
        body: { success: false, error: "Missing required fields: eventId, items, customerDetails" },
      };
      return;
    }

    // Find event
    const event = mockEvents.find((e) => e.id === eventId);
    if (!event) {
      context.res = {
        status: 404,
        body: { success: false, error: "Event not found" },
      };
      return;
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems: Order["tickets"] = [];

    for (const item of items) {
      const category = event.ticketCategories.find((c) => c.id === item.categoryId);
      if (!category) {
        context.res = {
          status: 400,
          body: { success: false, error: `Ticket category ${item.categoryId} not found` },
        };
        return;
      }

      if (item.quantity > category.available) {
        context.res = {
          status: 400,
          body: { success: false, error: `Not enough tickets available for ${category.displayName}` },
        };
        return;
      }

      const itemTotal = category.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        categoryId: item.categoryId,
        categoryName: category.displayName,
        quantity: item.quantity,
        pricePerTicket: category.price,
      });
    }

    // Calculate fees and taxes
    const serviceFee = subtotal * 0.05; // 5% service fee
    const processingFee = 15000; // Fixed processing fee (150k IDR)
    const totalFees = serviceFee + processingFee;
    const taxAmount = (subtotal + totalFees) * 0.1; // 10% tax (simplified)

    // Apply promo code (simplified)
    let discount = 0;
    if (promoCode === "WELCOME10") {
      discount = subtotal * 0.1; // 10% discount
    } else if (promoCode === "EARLYBIRD15") {
      discount = subtotal * 0.15; // 15% discount
    }

    // Calculate total
    const total = subtotal + totalFees + taxAmount - discount;

    // Create order
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const order: Order = {
      id: orderId,
      eventId,
      eventTitle: event.title,
      tickets: orderItems,
      subtotal,
      fees: {
        service: serviceFee,
        processing: processingFee,
      },
      taxes: taxAmount,
      discount,
      total,
      currency: "IDR",
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    // Store order (in production: save to database)
    orders.set(orderId, order);

    context.res = {
      status: 201,
      body: {
        success: true,
        data: {
          ...order,
          paymentUrl: `${process.env.PAYMENT_GATEWAY_URL || "https://midtrans.com"}/pay/${orderId}`,
        },
      } as ApiResponse<Order>,
    };
  } catch (error: any) {
    context.log.error("createBooking error:", error);
    context.res = {
      status: 500,
      body: { success: false, error: "Failed to create booking" },
    };
  }
}

/**
 * GET /api/bookings/:id
 * Get booking details by ID
 */
export async function getBooking(context: Context, req: HttpRequest): Promise<void> {
  try {
    const urlParts = req.url.split("/");
    const bookingId = urlParts[urlParts.length - 1]?.split("?")[0];

    if (!bookingId) {
      context.res = {
        status: 400,
        body: { success: false, error: "Booking ID is required" },
      };
      return;
    }

    const order = orders.get(bookingId);
    if (!order) {
      context.res = {
        status: 404,
        body: { success: false, error: "Booking not found" },
      };
      return;
    }

    context.res = {
      status: 200,
      body: { success: true, data: order } as ApiResponse<Order>,
    };
  } catch (error: any) {
    context.log.error("getBooking error:", error);
    context.res = {
      status: 500,
      body: { success: false, error: "Failed to fetch booking" },
    };
  }
}

/**
 * GET /api/orders
 * Get all orders for a user (simplified - returns all orders in production would filter by user)
 * Query params: userId?, status?, page?, limit?
 */
export async function getUserOrders(context: Context, req: HttpRequest): Promise<void> {
  try {
    const { userId, status, page = "1", limit = "10" } = req.query;

    let userOrders = Array.from(orders.values());

    // Filter by status if provided
    if (status) {
      userOrders = userOrders.filter((o) => o.status === status);
    }

    // Pagination
    const pageNum = parseInt(page as string) || 1;
    const pageSize = parseInt(limit as string) || 10;
    const start = (pageNum - 1) * pageSize;
    const paginated = userOrders.slice(start, start + pageSize);

    context.res = {
      status: 200,
      body: {
        success: true,
        data: paginated,
        total: userOrders.length,
        page: pageNum,
        totalPages: Math.ceil(userOrders.length / pageSize),
      } as ApiResponse<Order[]>,
    };
  } catch (error: any) {
    context.log.error("getUserOrders error:", error);
    context.res = {
      status: 500,
      body: { success: false, error: "Failed to fetch orders" },
    };
  }
}

/**
 * Export orders storage for testing
 */
export function getOrdersStorage() {
  return orders;
}
