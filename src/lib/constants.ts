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

// API Configuration - Azure Functions Backend
const apiBaseUrl = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:7071/api';
const apiTimeoutMs = (import.meta as any).env?.VITE_API_TIMEOUT_MS || '30000';

export const API = {
  BASE_URL: apiBaseUrl,
  TIMEOUT_MS: parseInt(apiTimeoutMs),
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000,
  CIRCUIT_BREAKER_THRESHOLD: 5,
  CIRCUIT_BREAKER_TIMEOUT_MS: 60000,
} as const;

// Azure Storage Configuration
const storageAccountName = (import.meta as any).env?.VITE_STORAGE_ACCOUNT_NAME || 'eventixstorage';
const containerEvents = (import.meta as any).env?.VITE_STORAGE_CONTAINER_EVENTS || 'event-images';
const containerQrCodes = (import.meta as any).env?.VITE_STORAGE_CONTAINER_QR_CODES || 'qr-codes';
const cdnUrl = (import.meta as any).env?.VITE_STORAGE_CDN_URL || 'https://eventixcdn.azureedge.net';

export const AZURE_STORAGE = {
  ACCOUNT_NAME: storageAccountName,
  CONTAINER_EVENTS: containerEvents,
  CONTAINER_QR_CODES: containerQrCodes,
  CDN_URL: cdnUrl,
  MAX_FILE_SIZE_MB: 5,
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
} as const;

// Azure Application Insights Configuration
const appInsightsKey = (import.meta as any).env?.VITE_APPINSIGHTS_INSTRUMENTATION_KEY || '';
const appInsightsConnStr = (import.meta as any).env?.VITE_APPINSIGHTS_CONNECTION_STRING || '';
const enablePerformanceMonitoring = (import.meta as any).env?.VITE_ENABLE_PERFORMANCE_MONITORING !== 'false';

export const AZURE_APPINSIGHTS = {
  INSTRUMENTATION_KEY: appInsightsKey,
  CONNECTION_STRING: appInsightsConnStr,
  ENABLED: !!appInsightsKey,
  ENABLE_PERFORMANCE_MONITORING: enablePerformanceMonitoring,
  ENABLE_DEPENDENCY_TRACKING: true,
  ENABLE_AJAX_TRACKING: true,
  ENABLE_ERROR_TRACKING: true,
} as const;

// Authentication Configuration
const jwtExpiryMinutes = (import.meta as any).env?.VITE_JWT_EXPIRY_MINUTES || '15';
const jwtRefreshExpiryDays = (import.meta as any).env?.VITE_JWT_REFRESH_EXPIRY_DAYS || '7';
const sessionTimeoutMinutes = (import.meta as any).env?.VITE_SESSION_TIMEOUT_MINUTES || '30';
const rememberMeDurationDays = (import.meta as any).env?.VITE_REMEMBER_ME_DURATION_DAYS || '7';

export const AUTH = {
  JWT_EXPIRY_MINUTES: parseInt(jwtExpiryMinutes),
  JWT_REFRESH_EXPIRY_DAYS: parseInt(jwtRefreshExpiryDays),
  TOKEN_STORAGE_KEY: 'eventix_auth_token',
  REFRESH_TOKEN_STORAGE_KEY: 'eventix_refresh_token',
  USER_STORAGE_KEY: 'eventix_user',
  SESSION_TIMEOUT_MINUTES: parseInt(sessionTimeoutMinutes),
  REMEMBER_ME_DURATION_DAYS: parseInt(rememberMeDurationDays),
} as const;

// Payment Configuration
const paymentProvider = (import.meta as any).env?.VITE_PAYMENT_PROVIDER || 'midtrans';
const midtransClientKey = (import.meta as any).env?.VITE_MIDTRANS_CLIENT_KEY || '';
const midtransMerchantId = (import.meta as any).env?.VITE_MIDTRANS_MERCHANT_ID || '';
const midtransEnvironment = (import.meta as any).env?.VITE_MIDTRANS_ENVIRONMENT || 'sandbox';
const enablePayment = (import.meta as any).env?.VITE_ENABLE_PAYMENT !== 'false';

export const PAYMENT = {
  PROVIDER: paymentProvider,
  MIDTRANS_CLIENT_KEY: midtransClientKey,
  MIDTRANS_MERCHANT_ID: midtransMerchantId,
  MIDTRANS_ENVIRONMENT: midtransEnvironment,
  ENABLED: enablePayment,
} as const;

// Feature Flags (Vite Environment)
const enablePaymentFlag = (import.meta as any).env?.VITE_ENABLE_PAYMENT !== 'false';
const enableAnalytics = (import.meta as any).env?.VITE_ENABLE_ANALYTICS !== 'false';
const enableEmailNotifications = (import.meta as any).env?.VITE_ENABLE_EMAIL_NOTIFICATIONS !== 'false';
const enableSmsNotifications = (import.meta as any).env?.VITE_ENABLE_SMS_NOTIFICATIONS !== 'false';
const enableWalletIntegration = (import.meta as any).env?.VITE_ENABLE_WALLET_INTEGRATION !== 'false';

export const FEATURE_FLAGS = {
  ENABLE_PAYMENT: enablePaymentFlag,
  ENABLE_ANALYTICS: enableAnalytics,
  ENABLE_EMAIL_NOTIFICATIONS: enableEmailNotifications,
  ENABLE_SMS_NOTIFICATIONS: enableSmsNotifications,
  ENABLE_WALLET_INTEGRATION: enableWalletIntegration,
} as const;

// Environment
export const ENVIRONMENT = {
  NODE_ENV: (import.meta as any).env?.MODE,
  VITE_ENVIRONMENT: (import.meta as any).env?.VITE_ENVIRONMENT || 'development',
  IS_PRODUCTION: (import.meta as any).env?.MODE === 'production',
  IS_DEVELOPMENT: (import.meta as any).env?.MODE === 'development',
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
