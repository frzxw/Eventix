/**
 * Eventix Backend API - Main Router
 * Handles all HTTP routing for the ticketing platform
 * 
 * Routes:
 * - GET /api/events - List all events
 * - GET /api/events/:id - Get event details
 * - GET /api/events/featured - Get featured events
 * - GET /api/search - Search events
 * - POST /api/bookings - Create booking
 * - GET /api/bookings/:id - Get booking details
 * - GET /api/orders - Get user orders
 * - POST /api/auth/login - User login
 * - POST /api/auth/signup - User registration
 * - GET /api/tickets/:orderId - Get tickets for order
 */

import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

type RouteHandler = (req: HttpRequest, context: InvocationContext) => Promise<HttpResponseInit>;
type RouteHandlersMap = Record<string, RouteHandler>;

// Import production auth handlers (return HttpResponseInit)
import {
  signupHandler,
  loginHandler,
  verifyEmailHandler,
  forgotPasswordHandler,
  logoutHandler,
  refreshTokenHandler,
} from "./handlers/auth";
import {
  listEventsHandler,
  getEventHandler,
  featuredEventsHandler,
  searchEventsHandler,
} from "./handlers/events";
import {
  createOrderHandler,
  confirmOrderHandler,
  myOrdersHandler,
} from "./handlers/orders";
import {
  myTicketsHandler,
  transferTicketHandler,
  downloadTicketPdfHandler,
} from "./handlers/tickets";

// Route handlers map
const routeHandlers: RouteHandlersMap = {
  // Authentication
  "POST /api/auth/signup": adaptHandler(signupHandler),
  "POST /api/auth/login": adaptHandler(loginHandler),
  "POST /api/auth/verify-email": adaptHandler(verifyEmailHandler),
  "POST /api/auth/forgot-password": adaptHandler(forgotPasswordHandler),
  "POST /api/auth/logout": adaptHandler(logoutHandler),
  "POST /api/auth/refresh-token": adaptHandler(refreshTokenHandler),

  // Events
  "GET /api/events": adaptHandler(listEventsHandler),
  "GET /api/events/:id": adaptHandler(getEventHandler),
  "GET /api/events/featured": adaptHandler(featuredEventsHandler),
  "GET /api/search": adaptHandler(searchEventsHandler),

  // Orders
  "POST /api/orders/create": adaptHandler(createOrderHandler),
  "POST /api/orders/:id/confirm": adaptHandler(confirmOrderHandler),
  "GET /api/orders/my-orders": adaptHandler(myOrdersHandler),

  // Tickets
  "GET /api/tickets/my-tickets": adaptHandler(myTicketsHandler),
  "POST /api/tickets/:id/transfer": adaptHandler(transferTicketHandler),
  "GET /api/tickets/:id/download": adaptHandler(downloadTicketPdfHandler),
};

/**
 * Main HTTP Trigger Function
 */
export default async function (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log(`HTTP ${req.method} request for URL: ${req.url}`);

  try {
    // Extract route and method
    const [method, route] = extractMethodAndRoute(req);
    const routeKey = `${method} ${route}`;

    // Find matching handler
    const handler = findMatchingHandler(routeKey, routeHandlers);

    if (!handler) {
      return json(404, { success: false, error: "Route not found" });
    }

    // Execute handler
    return await handler(req, context);
  } catch (error: any) {
  context.log("API Error:", error);
    return json(500, { success: false, error: "Internal server error", message: error.message });
  }
}

/**
 * Extract HTTP method and route from request
 */
function extractMethodAndRoute(req: HttpRequest): [string, string] {
  const method = req.method || "GET";
  const pathSegments = req.url.split("?")[0].split("/").filter((s) => s);
  
  // Reconstruct route (remove domain part)
  let route = "/" + pathSegments.slice(pathSegments.indexOf("api")).join("/");
  if (!route.startsWith("/api")) {
    route = "/api" + route;
  }

  return [method, route];
}

/**
 * Find matching route handler with parameter support
 * Examples:
 *   "GET /api/events/:id" matches "GET /api/events/evt-001"
 */
function findMatchingHandler(routeKey: string, handlers: RouteHandlersMap): RouteHandler | null {
  // Exact match
  if (handlers[routeKey]) {
    return handlers[routeKey];
  }

  // Pattern match with parameters
  const [method, path] = routeKey.split(" ");
  const pathParts = path.split("/");

  for (const [pattern, handler] of Object.entries(handlers)) {
    const [patternMethod, patternPath] = pattern.split(" ");

    if (method !== patternMethod) continue;

    const patternParts = patternPath.split("/");
    if (pathParts.length !== patternParts.length) continue;

    let matches = true;
    for (let i = 0; i < patternParts.length; i++) {
      if (!patternParts[i].startsWith(":") && patternParts[i] !== pathParts[i]) {
        matches = false;
        break;
      }
    }

    if (matches) {
      return handler;
    }
  }

  return null;
}

/**
 * Extract URL parameters
 * Example: extractParams("/api/events/:id", "/api/events/evt-001") => { id: "evt-001" }
 */
export function extractParams(pattern: string, path: string): Record<string, string> {
  const patternParts = pattern.split("/");
  const pathParts = path.split("/");
  const params: Record<string, string> = {};

  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(":")) {
      const paramName = patternParts[i].slice(1);
      params[paramName] = pathParts[i];
    }
  }

  return params;
}

// --- Utilities ---

/**
 * Wrap a production handler (HttpRequest -> HttpResponseInit)
 * into an Azure Functions-compatible route handler using Context
 */
function adaptHandler(handler: (req: HttpRequest) => Promise<HttpResponseInit>): RouteHandler {
  return async (req) => {
    const result = await handler(req);
    const { status, headers, cookies, jsonBody, body } = result as any;
    return { status: status ?? 200, headers, cookies, body: jsonBody ?? body } as HttpResponseInit;
  };
}

function json<T>(status: number, body: T): HttpResponseInit {
  return { status, headers: { "content-type": "application/json" }, body: body as any };
}
