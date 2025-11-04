/**
 * Utility Functions
 * Common helpers used throughout the application
 */

/**
 * Format currency value
 */
export function formatCurrency(
  amount: number,
  currency: string = 'IDR',
  locale: string = 'id-ID'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format date
 */
export function formatDate(
  date: string | Date,
  format: 'short' | 'long' | 'full' = 'long',
  locale: string = 'id-ID'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
    case 'long':
      return dateObj.toLocaleDateString(locale, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    case 'full':
      return dateObj.toLocaleDateString(locale, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    default:
      return dateObj.toLocaleDateString(locale);
  }
}

/**
 * Format time
 */
export function formatTime(time: string, locale: string = 'id-ID'): string {
  const [hours, minutes] = time.split(':');
  const date = new Date();
  date.setHours(parseInt(hours, 10));
  date.setMinutes(parseInt(minutes, 10));

  return date.toLocaleTimeString(locale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Calculate availability percentage
 */
export function calculateAvailability(available: number, total: number): number {
  if (total === 0) return 0;
  return (available / total) * 100;
}

/**
 * Get stock status based on availability
 */
export function getStockStatus(
  available: number,
  total: number
): 'available' | 'low-stock' | 'sold-out' {
  if (available === 0) return 'sold-out';
  const percentage = calculateAvailability(available, total);
  if (percentage < 30) return 'low-stock';
  return 'available';
}

/**
 * Truncate text to specified length
 */
export function truncate(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Generate random ID
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate email
 */
export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Validate phone number
 */
export function isValidPhone(phone: string): boolean {
  const regex = /^\+?[\d\s\-()]+$/;
  return regex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

/**
 * Format card number for display (mask)
 */
export function formatCardNumber(cardNumber: string, mask: boolean = true): string {
  const cleaned = cardNumber.replace(/\s/g, '');
  if (mask && cleaned.length > 4) {
    const lastFour = cleaned.slice(-4);
    return `•••• •••• •••• ${lastFour}`;
  }
  return cleaned.replace(/(\d{4})/g, '$1 ').trim();
}

/**
 * Calculate time remaining
 */
export function getTimeRemaining(targetDate: string | Date): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
} {
  const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
  const now = new Date();
  const total = target.getTime() - now.getTime();

  if (total <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }

  return {
    total,
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / 1000 / 60) % 60),
    seconds: Math.floor((total / 1000) % 60),
  };
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Generate slug from string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Check if date is in the past
 */
export function isPastDate(date: string | Date): boolean {
  const checkDate = typeof date === 'string' ? new Date(date) : date;
  return checkDate < new Date();
}

/**
 * Group array by key
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const group = String(item[key]);
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

/**
 * Sort array by key
 */
export function sortBy<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Calculate ticket hold expiry time
 */
export function getTicketHoldExpiry(minutes: number = 10): Date {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + minutes);
  return expiry;
}

/**
 * Format number with thousands separator
 */
export function formatNumber(num: number, locale: string = 'id-ID'): string {
  return new Intl.NumberFormat(locale).format(num);
}
