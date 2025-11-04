/**
 * Mock Data for Ticketing System - Indonesia
 * In production, this would come from your backend API
 */

import type { Event } from './types';

export const mockEvents: Event[] = [
  {
    id: 'evt-001',
    title: 'Neon Waves Festival 2025',
    artist: 'Various Artists',
    category: 'festival',
    date: '2025-07-15',
    time: '14:00',
    venue: {
      name: 'Jakarta International Expo',
      city: 'Jakarta',
      address: 'Jl. Gatot Subroto, Jakarta Pusat, DKI Jakarta 10270',
      capacity: 50000,
    },
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=600&fit=crop',
    description: 'Experience three days of electronic music across 5 stages featuring the world\'s top DJs and emerging artists. Join us for an unforgettable journey through sound and light.',
    ticketCategories: [
      {
        id: 'cat-001-1',
        name: 'GENERAL',
        displayName: 'General Admission',
        price: 2990000,
        currency: 'IDR',
        available: 15000,
        total: 30000,
        status: 'available',
        benefits: ['Access to all stages', 'Food court access', 'Standard amenities'],
      },
      {
        id: 'cat-001-2',
        name: 'VIP',
        displayName: 'VIP Package',
        price: 7490000,
        currency: 'IDR',
        available: 450,
        total: 2000,
        status: 'low-stock',
        benefits: ['Express entry', 'VIP viewing areas', 'Complimentary drinks', 'VIP lounge access', 'Exclusive merch'],
      },
      {
        id: 'cat-001-3',
        name: 'VVIP',
        displayName: 'VVIP Ultra',
        price: 14990000,
        currency: 'IDR',
        available: 0,
        total: 500,
        status: 'sold-out',
        benefits: ['All VIP benefits', 'Meet & greet', 'Backstage access', 'Premium parking', 'Concierge service'],
      },
    ],
    pricing: { min: 2990000, max: 14990000, currency: 'IDR' },
    featured: true,
    tags: ['EDM', 'House', 'Techno', 'Multi-day'],
  },
  {
    id: 'evt-002',
    title: 'The Midnight Orchestra',
    artist: 'Jakarta Symphony Orchestra',
    category: 'theater',
    date: '2025-06-20',
    time: '19:30',
    venue: {
      name: 'Teater Jakarta',
      city: 'Jakarta',
      address: 'Jl. Cikini Raya No.73, Jakarta Pusat 10330',
      capacity: 2500,
    },
    image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800&h=600&fit=crop',
    description: 'A mesmerizing evening of classical masterpieces performed by the renowned Jakarta Symphony Orchestra. Featuring works by Mozart, Beethoven, and contemporary composers.',
    ticketCategories: [
      {
        id: 'cat-002-1',
        name: 'CAT3',
        displayName: 'Balcony',
        price: 675000,
        currency: 'IDR',
        available: 800,
        total: 1000,
        status: 'available',
        benefits: ['Balcony seating', 'Good acoustics'],
      },
      {
        id: 'cat-002-2',
        name: 'CAT2',
        displayName: 'Mezzanine',
        price: 1275000,
        currency: 'IDR',
        available: 320,
        total: 800,
        status: 'available',
        benefits: ['Mezzanine level', 'Excellent view', 'Premium sound'],
      },
      {
        id: 'cat-002-3',
        name: 'CAT1',
        displayName: 'Orchestra',
        price: 2250000,
        currency: 'IDR',
        available: 45,
        total: 500,
        status: 'low-stock',
        benefits: ['Orchestra level', 'Best seats', 'Immersive experience', 'Intermission lounge'],
      },
    ],
    pricing: { min: 675000, max: 2250000, currency: 'IDR' },
    featured: true,
    tags: ['Classical', 'Orchestra', 'Live Music'],
  },
  {
    id: 'evt-003',
    title: 'Stand-Up Comedy Night: Pandji Pragiwaksono',
    artist: 'Pandji Pragiwaksono',
    category: 'comedy',
    date: '2025-05-10',
    time: '20:00',
    venue: {
      name: 'Balai Sarbini',
      city: 'Jakarta',
      address: 'Jl. Sisingamangaraja, Jakarta Selatan 12110',
      capacity: 400,
    },
    image: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800&h=600&fit=crop',
    description: 'Join comedy superstar Pandji Pragiwaksono for an evening of non-stop laughter. His unique blend of observational humor and storytelling will have you in stitches.',
    ticketCategories: [
      {
        id: 'cat-003-1',
        name: 'GENERAL',
        displayName: 'General Seating',
        price: 525000,
        currency: 'IDR',
        available: 180,
        total: 250,
        status: 'available',
        benefits: ['General admission', 'First come first serve'],
      },
      {
        id: 'cat-003-2',
        name: 'VIP',
        displayName: 'VIP Table',
        price: 1125000,
        currency: 'IDR',
        available: 8,
        total: 50,
        status: 'low-stock',
        benefits: ['Reserved table', 'Priority seating', 'Complimentary drink', 'Meet & greet opportunity'],
      },
    ],
    pricing: { min: 525000, max: 1125000, currency: 'IDR' },
    featured: false,
    tags: ['Comedy', 'Stand-up', 'Entertainment'],
  },
  {
    id: 'evt-004',
    title: 'Rock Legends: The Phoenix',
    artist: 'The Phoenix',
    category: 'concert',
    date: '2025-08-22',
    time: '19:00',
    venue: {
      name: 'Gelora Bung Karno Stadium',
      city: 'Jakarta',
      address: 'Jl. Pintu Satu Senayan, Jakarta Pusat 10270',
      capacity: 18000,
    },
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop',
    description: 'The Phoenix returns with their greatest hits tour! Experience the raw energy and unforgettable anthems that defined a generation. Special guest appearances confirmed.',
    ticketCategories: [
      {
        id: 'cat-004-1',
        name: 'STANDING',
        displayName: 'Standing Floor',
        price: 1335000,
        currency: 'IDR',
        available: 5000,
        total: 8000,
        status: 'available',
        benefits: ['Standing room', 'Close to stage', 'High energy experience'],
      },
      {
        id: 'cat-004-2',
        name: 'CAT2',
        displayName: 'Lower Bowl',
        price: 1935000,
        currency: 'IDR',
        available: 2800,
        total: 5000,
        status: 'available',
        benefits: ['Seated section', 'Great view', 'Easy access to amenities'],
      },
      {
        id: 'cat-004-3',
        name: 'CAT1',
        displayName: 'Premium Seats',
        price: 3735000,
        currency: 'IDR',
        available: 120,
        total: 1000,
        status: 'low-stock',
        benefits: ['Best seats', 'Excellent sound', 'VIP entry', 'Commemorative poster'],
      },
      {
        id: 'cat-004-4',
        name: 'VIP',
        displayName: 'VIP Experience',
        price: 6735000,
        currency: 'IDR',
        available: 0,
        total: 200,
        status: 'waitlist',
        benefits: ['Soundcheck access', 'Meet & greet', 'Exclusive merch', 'Backstage tour', 'Premium parking'],
      },
    ],
    pricing: { min: 1335000, max: 6735000, currency: 'IDR' },
    featured: true,
    tags: ['Rock', 'Live Music', 'Arena Show'],
  },
  {
    id: 'evt-005',
    title: 'Jazz Under the Stars',
    artist: 'Indra Lesmana Trio',
    category: 'concert',
    date: '2025-06-05',
    time: '20:30',
    venue: {
      name: 'Taman Ismail Marzuki',
      city: 'Jakarta',
      address: 'Jl. Cikini Raya No.73, Jakarta Pusat 10330',
      capacity: 1200,
    },
    image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800&h=600&fit=crop',
    description: 'An intimate evening of smooth jazz in an open-air setting. Indra Lesmana Trio brings their acclaimed blend of traditional and contemporary jazz to the scenic Taman Ismail Marzuki.',
    ticketCategories: [
      {
        id: 'cat-005-1',
        name: 'GENERAL',
        displayName: 'Lawn Seating',
        price: 825000,
        currency: 'IDR',
        available: 600,
        total: 700,
        status: 'available',
        benefits: ['Lawn seating', 'Bring your own blanket', 'Relaxed atmosphere'],
      },
      {
        id: 'cat-005-2',
        name: 'CAT1',
        displayName: 'Reserved Seating',
        price: 1425000,
        currency: 'IDR',
        available: 280,
        total: 400,
        status: 'available',
        benefits: ['Reserved chairs', 'Covered seating', 'Better view'],
      },
      {
        id: 'cat-005-3',
        name: 'VIP',
        displayName: 'VIP Lounge',
        price: 2625000,
        currency: 'IDR',
        available: 15,
        total: 100,
        status: 'low-stock',
        benefits: ['Premium seating', 'Complimentary drinks', 'Appetizers included', 'Artist meet & greet'],
      },
    ],
    pricing: { min: 825000, max: 2625000, currency: 'IDR' },
    featured: false,
    tags: ['Jazz', 'Outdoor', 'Live Music'],
  },
  {
    id: 'evt-006',
    title: 'Broadway Hits: Greatest Showman',
    artist: 'Teater Koma',
    category: 'theater',
    date: '2025-09-12',
    time: '19:00',
    venue: {
      name: 'Ciputra Artpreneur',
      city: 'Jakarta',
      address: 'Ciputra World 1, Jl. Prof. Dr. Satrio Kav. 3-5, Jakarta 12940',
      capacity: 1800,
    },
    image: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&h=600&fit=crop',
    description: 'A spectacular theatrical production celebrating the greatest hits from Broadway. Featuring talented performers and breathtaking choreography in an unforgettable show.',
    ticketCategories: [
      {
        id: 'cat-006-1',
        name: 'CAT3',
        displayName: 'Upper Circle',
        price: 975000,
        currency: 'IDR',
        available: 450,
        total: 600,
        status: 'available',
        benefits: ['Upper level seating', 'Full stage view'],
      },
      {
        id: 'cat-006-2',
        name: 'CAT2',
        displayName: 'Dress Circle',
        price: 1725000,
        currency: 'IDR',
        available: 380,
        total: 600,
        status: 'available',
        benefits: ['Mid-level seating', 'Excellent sightlines', 'Premium comfort'],
      },
      {
        id: 'cat-006-3',
        name: 'CAT1',
        displayName: 'Stalls Premium',
        price: 2775000,
        currency: 'IDR',
        available: 85,
        total: 400,
        status: 'low-stock',
        benefits: ['Best seats', 'Ground level', 'Closest to stage', 'Souvenir program'],
      },
    ],
    pricing: { min: 975000, max: 2775000, currency: 'IDR' },
    featured: true,
    tags: ['Musical', 'Theater', 'Broadway'],
  },
];

// Helper function to get events by category
export function getEventsByCategory(category: string): Event[] {
  if (category === 'all') return mockEvents;
  return mockEvents.filter((event) => event.category === category);
}

// Helper function to get featured events
export function getFeaturedEvents(): Event[] {
  return mockEvents.filter((event) => event.featured);
}

// Helper function to search events
export function searchEvents(query: string): Event[] {
  const lowercaseQuery = query.toLowerCase();
  return mockEvents.filter(
    (event) =>
      event.title.toLowerCase().includes(lowercaseQuery) ||
      event.artist.toLowerCase().includes(lowercaseQuery) ||
      event.venue.city.toLowerCase().includes(lowercaseQuery) ||
      event.venue.name.toLowerCase().includes(lowercaseQuery)
  );
}

// Generate QR code placeholder
export function generateQRCode(ticketId: string): string {
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="white"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="monospace" font-size="10">${ticketId}</text>
    </svg>
  `)}`;
}
