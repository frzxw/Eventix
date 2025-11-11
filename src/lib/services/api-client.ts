/**
 * Eventix API Client
 * Frontend service for communicating with Azure Functions backend
 * 
 * Usage:
 * import { apiClient } from '@/lib/services/api-client';
 * 
 * // Get events
 * const { data, error } = await apiClient.events.getAll();
 * 
 * // Get specific event
 * const event = await apiClient.events.getById('evt-001');
 * 
 * // Create booking
 * const booking = await apiClient.bookings.create({
 *   eventId: 'evt-001',
 *   items: [...],
 *   customerDetails: {...}
 * });
 */

import { API } from "@/lib/constants";
import type { Event } from "@/lib/types";

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  total?: number;
  page?: number;
  totalPages?: number;
};

const API_BASE_URL = API.BASE_URL.replace(/\/$/, "");

/**
 * Make API request
 */
async function request<T>(
  endpoint: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    body?: Record<string, unknown>;
    headers?: Record<string, string>;
    _retry?: number;
  } = {}
): Promise<{ data?: T; error?: string }> {
  try {
    // Lazy imports to avoid circular deps
    const { getAccessToken, getRefreshToken, setTokens, clearTokens } = await import("@/lib/auth");

    const accessToken = getAccessToken();

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    // Attempt to parse JSON safely
    let result: any = null;
    try { result = await response.json(); } catch {}

    // Handle unauthorized: try refresh once, then retry original request
    if (response.status === 401 && endpoint !== "/auth/refresh-token" && !(options._retry)) {
      const rt = getRefreshToken();
      if (rt) {
        const refreshRes = await request<{ token?: string; accessToken?: string; refreshToken?: string }>(
          "/auth/refresh-token",
          { method: "POST", body: { refreshToken: rt }, _retry: 1 }
        );
        if (refreshRes.data && (refreshRes.data.token || refreshRes.data.accessToken) && refreshRes.data.refreshToken) {
          const newAccess = (refreshRes.data.accessToken || refreshRes.data.token) as string;
          setTokens({ accessToken: newAccess, refreshToken: refreshRes.data.refreshToken });
          // retry original request once
          return request<T>(endpoint, { ...options, _retry: 1 });
        } else {
          clearTokens();
          return { error: "Unauthorized" };
        }
      }
    }

    // If backend uses { success, data, error }
    if (result && typeof result === "object" && ("success" in result || "data" in result)) {
      if (!response.ok || result.success === false) {
        return { error: result.error || result.message || `HTTP ${response.status}` };
      }
      return { data: (result.data ?? result) as T };
    }

    // Fallback: if response.ok and result exists, return it; else error
    if (response.ok) {
      return { data: result as T };
    }
    return { error: `HTTP ${response.status}` };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Events API
 */
export const events = {
  /**
   * GET /api/events
   */
  async getAll(params?: {
    category?: string;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
    search?: string;
    sort?: "date" | "newest";
  }): Promise<{ data?: { events: Event[]; total: number; page: number; totalPages: number }; error?: string }> {
    const query = new URLSearchParams();
    if (params?.category) query.append("category", params.category);
    if (params?.city) query.append("city", params.city);
    if (params?.minPrice) query.append("minPrice", params.minPrice.toString());
    if (params?.maxPrice) query.append("maxPrice", params.maxPrice.toString());
    if (params?.page) query.append("page", params.page.toString());
    if (params?.limit) query.append("limit", params.limit.toString());
    if (params?.search) query.append("search", params.search);
    if (params?.sort) query.append("sort", params.sort);

    const queryString = query.toString();
    const path = queryString.length > 0 ? `/events?${queryString}` : "/events";

    return request<{ events: Event[]; total: number; page: number; totalPages: number }>(path);
  },

  /**
   * GET /api/events/:id
   */
  async getById(id: string): Promise<{ data?: { event: Event; relatedEvents: Event[] }; error?: string }> {
    return request<{ event: Event; relatedEvents: Event[] }>(`/events/${id}`);
  },

  /**
   * GET /api/events/featured
   */
  async getFeatured(): Promise<{ data?: Event[]; error?: string }> {
    const response = await request<{ events: Event[] }>("/events/featured");
    if (response.error) {
      return { error: response.error };
    }
    return { data: response.data?.events ?? [] };
  },

  /**
   * GET /api/search
   */
  async search(query: string): Promise<{ data?: Event[]; error?: string }> {
    if (!query || query.length < 2) {
      return { data: [] };
    }
    const response = await request<{ events: Event[] }>(`/search?q=${encodeURIComponent(query)}`);
    if (response.error) {
      return { error: response.error };
    }
    return { data: response.data?.events ?? [] };
  },
};

/**
 * Bookings API
 */
export const bookings = {
  /**
   * POST /api/bookings
   */
  async create(data: {
    eventId: string;
    items: { categoryId: string; quantity: number }[];
    customerDetails: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      country: string;
    };
    promoCode?: string;
  }): Promise<{ data?: any; error?: string }> {
    return request("/orders/create", {
      method: "POST",
      body: data,
    });
  },

  /**
   * GET /api/bookings/:id
   */
  async getById(id: string): Promise<{ data?: any; error?: string }> {
    return request(`/orders/${id}`);
  },

  /**
   * GET /api/orders
   */
  async getOrders(params?: {
    userId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data?: { orders: any[]; total: number; page: number; totalPages: number }; error?: string }> {
    const query = new URLSearchParams();
    if (params?.userId) query.append("userId", params.userId);
    if (params?.status) query.append("status", params.status);
    if (params?.page) query.append("page", params.page.toString());
    if (params?.limit) query.append("limit", params.limit.toString());

    const queryString = query.toString();
    const path = queryString.length > 0 ? `/orders/my-orders?${queryString}` : "/orders/my-orders";
    return request<{ orders: any[]; total: number; page: number; totalPages: number }>(path);
  },
};

/**
 * Tickets API
 */
export const tickets = {
  /**
   * GET /api/tickets/:orderId
   */
  async getByOrderId(orderId: string): Promise<{ data?: any[]; error?: string }> {
    return request(`/tickets/${orderId}`);
  },

  /**
   * POST /api/tickets/:orderId/validate
   */
  async validate(ticketId: string): Promise<{ data?: any; error?: string }> {
    return request(`/tickets/${ticketId}/validate`, {
      method: "POST",
      body: { ticketId },
    });
  },
};

/**
 * Authentication API
 */
export const auth = {
  /**
   * POST /api/auth/login
   */
  async login(email: string, password: string): Promise<{ data?: any; error?: string }> {
    const res = await request<any>("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    if (res.data) {
      // Normalize token fields for consumers
      const mapped = {
        ...res.data,
        accessToken: res.data.accessToken ?? res.data.token,
      };
      return { data: mapped };
    }
    return res;
  },

  /**
   * POST /api/auth/signup
   */
  async signup(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<{ data?: any; error?: string }> {
    const res = await request<any>("/auth/signup", {
      method: "POST",
      body: data,
    });
    if (res.data) {
      const mapped = {
        ...res.data,
        accessToken: res.data.accessToken ?? res.data.token,
      };
      return { data: mapped };
    }
    return res;
  },

  /**
   * POST /api/auth/refresh-token
   */
  async refresh(refreshToken: string): Promise<{ data?: { accessToken: string; refreshToken: string }; error?: string }> {
    const res = await request<any>("/auth/refresh-token", {
      method: "POST",
      body: { refreshToken },
    });
    if (res.data && (res.data.accessToken || res.data.token) && res.data.refreshToken) {
      return {
        data: {
          accessToken: res.data.accessToken ?? res.data.token,
          refreshToken: res.data.refreshToken,
        },
      };
    }
    return res as any;
  },
};

/**
 * Combined API client
 */
export const apiClient = {
  events,
  bookings,
  tickets,
  auth,
};

export default apiClient;
