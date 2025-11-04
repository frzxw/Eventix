/**
 * SEO and Structured Data Helpers
 * Generates JSON-LD markup for search engines
 */

import type { Event } from './types';

interface OrganizationSchema {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  url: string;
  logo?: string;
  sameAs?: string[];
}

interface EventSchema {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  location: {
    '@type': string;
    name: string;
    address: {
      '@type': string;
      streetAddress: string;
      addressLocality: string;
      addressRegion?: string;
      postalCode?: string;
      addressCountry: string;
    };
  };
  image: string;
  offers: {
    '@type': string;
    price: number;
    priceCurrency: string;
    availability: string;
    url: string;
    validFrom: string;
  }[];
  performer?: {
    '@type': string;
    name: string;
  };
  organizer?: OrganizationSchema;
}

/**
 * Generate Organization structured data
 */
export function generateOrganizationSchema(): OrganizationSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Eventix',
    description: 'Premier online ticketing platform for concerts, festivals, theater, and live entertainment',
    url: 'https://eventix.example.com',
    logo: 'https://eventix.example.com/logo.png',
    sameAs: [
      'https://facebook.com/eventix',
      'https://twitter.com/eventix',
      'https://instagram.com/eventix',
    ],
  };
}

/**
 * Generate Event structured data
 */
export function generateEventSchema(event: Event): EventSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.description,
    startDate: `${event.date}T${event.time}`,
    location: {
      '@type': 'Place',
      name: event.venue.name,
      address: {
        '@type': 'PostalAddress',
        streetAddress: event.venue.address,
        addressLocality: event.venue.city,
        addressCountry: 'US',
      },
    },
    image: event.image,
    offers: event.ticketCategories.map((category) => ({
      '@type': 'Offer',
      price: category.price,
      priceCurrency: category.currency,
      availability:
        category.status === 'available'
          ? 'https://schema.org/InStock'
          : category.status === 'low-stock'
          ? 'https://schema.org/LimitedAvailability'
          : 'https://schema.org/SoldOut',
      url: `https://eventix.example.com/events/${event.id}`,
      validFrom: new Date().toISOString(),
    })),
    performer: {
      '@type': 'PerformingGroup',
      name: event.artist,
    },
  };
}

/**
 * Generate Breadcrumb structured data
 */
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Helper to inject structured data into page
 */
export function injectStructuredData(data: object): string {
  return JSON.stringify(data);
}
