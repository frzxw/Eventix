/**
 * Application Constants
 * Centralized configuration values
 */

// Pricing Configuration
export const PRICING = {
  SERVICE_FEE_PERCENTAGE: 0.1, // 10%
  PROCESSING_FEE: 5000, // Flat fee in IDR
  TAX_PERCENTAGE: 0.11, // 11% PPN (Indonesian tax)
  PROMO_DISCOUNT_PERCENTAGE: 0.15, // 15% for demo promo codes
  MAX_TICKETS_PER_TRANSACTION: 10,
} as const;

// Checkout Configuration
export const CHECKOUT = {
  TICKET_HOLD_DURATION_MINUTES: 10,
  SESSION_TIMEOUT_MINUTES: 15,
} as const;

// Pagination
export const PAGINATION = {
  EVENTS_PER_PAGE: 12,
  TICKETS_PER_PAGE: 10,
} as const;

// Search Configuration
export const SEARCH = {
  MIN_QUERY_LENGTH: 2,
  DEBOUNCE_DELAY_MS: 300,
  MAX_RESULTS: 50,
} as const;

// Stock Thresholds
export const STOCK = {
  LOW_STOCK_THRESHOLD: 0.3, // 30% of total capacity
  ALMOST_GONE_THRESHOLD: 0.1, // 10% of total capacity
} as const;

// Date Formats
export const DATE_FORMATS = {
  SHORT: 'MMM DD',
  LONG: 'MMMM DD, YYYY',
  WITH_DAY: 'ddd, MMM DD',
  FULL: 'dddd, MMMM DD, YYYY',
  TIME: 'HH:mm',
  DATETIME: 'MMMM DD, YYYY HH:mm',
} as const;

// API Configuration (for when backend is implemented)
export const API = {
  BASE_URL: process.env.REACT_APP_API_URL || 'https://api.eventix.example.com',
  TIMEOUT_MS: 30000,
  RETRY_ATTEMPTS: 3,
} as const;

// Feature Flags
export const FEATURES = {
  ENABLE_WAITLIST: true,
  ENABLE_PROMO_CODES: true,
  ENABLE_WALLET_INTEGRATION: true,
  ENABLE_SEAT_SELECTION: false, // Future feature
  ENABLE_GROUP_BOOKINGS: false, // Future feature
} as const;

// Contact Information
export const CONTACT = {
  SUPPORT_EMAIL: 'support@eventix.id',
  SALES_EMAIL: 'sales@eventix.id',
  PHONE: '+62 21 5000 1234',
  SUPPORT_HOURS: 'Mon-Sun, 24/7',
} as const;

// Social Media
export const SOCIAL = {
  FACEBOOK: 'https://facebook.com/eventix',
  TWITTER: 'https://twitter.com/eventix',
  INSTAGRAM: 'https://instagram.com/eventix',
  YOUTUBE: 'https://youtube.com/eventix',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  PAYMENT_ERROR: 'Payment failed. Please check your payment details and try again.',
  SOLD_OUT: 'Sorry, this event is sold out.',
  SESSION_EXPIRED: 'Your session has expired. Please start over.',
  GENERIC_ERROR: 'Something went wrong. Please try again.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  BOOKING_CONFIRMED: 'Booking confirmed! Check your email for tickets.',
  ADDED_TO_CART: 'Tickets added to cart.',
  PROMO_APPLIED: 'Promo code applied successfully.',
  TICKET_SENT: 'Tickets sent to your email.',
} as const;

// Validation Rules
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\+?[\d\s\-()]+$/,
  CARD_NUMBER_LENGTH: 16,
  CVV_LENGTH_MIN: 3,
  CVV_LENGTH_MAX: 4,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 50,
} as const;
