/**
 * TypeScript Type Definitions for Ticketing System
 */

export type EventCategory = 'concert' | 'festival' | 'theater' | 'comedy' | 'sports' | 'other';
export type TicketCategory = 'CAT1' | 'CAT2' | 'CAT3' | 'VIP' | 'VVIP' | 'STANDING' | 'GENERAL';
export type TicketStatus = 'available' | 'low-stock' | 'sold-out' | 'waitlist';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Event {
  id: string;
  title: string;
  artist: string;
  category: EventCategory;
  date: string;
  time: string;
  venue: {
    name: string;
    city: string;
    address: string;
    capacity: number;
  };
  image: string;
  description: string;
  ticketCategories: TicketCategoryInfo[];
  pricing: {
    min: number;
    max: number;
    currency: string;
  };
  featured: boolean;
  tags: string[];
}

export interface TicketCategoryInfo {
  id: string;
  name: TicketCategory;
  displayName: string;
  price: number;
  currency: string;
  available: number;
  total: number;
  status: TicketStatus;
  benefits?: string[];
}

export interface CartItem {
  eventId: string;
  categoryId: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  eventId: string;
  eventTitle: string;
  tickets: {
    categoryId: string;
    categoryName: string;
    quantity: number;
    pricePerTicket: number;
  }[];
  subtotal: number;
  fees: {
    service: number;
    processing: number;
  };
  taxes: number;
  discount: number;
  total: number;
  currency: string;
  status: BookingStatus;
  createdAt: string;
}

export interface CustomerDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
}

export interface PaymentDetails {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  orderId: string;
  orderNumber?: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime?: string;
  venue: string;
  category: string;
  seat?: string;
  qrCode?: string;
  qrCodeUrl?: string;
  qrCodeData?: string;
  barcode: string;
  customerName: string;
  status: 'valid' | 'used' | 'cancelled' | 'transferred';
  createdAt?: string;
}

export interface FilterOptions {
  dateRange?: {
    start: string;
    end: string;
  };
  location?: string[];
  category?: EventCategory[];
  priceRange?: {
    min: number;
    max: number;
  };
  availability?: TicketStatus[];
}

export interface SearchQuery {
  query?: string;
  artist?: string;
  venue?: string;
  city?: string;
  date?: string;
}
