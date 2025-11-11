/**
 * Prisma Database Seed
 * Seeds initial event and promo code data
 * Run: npx prisma db seed
 */

import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

const events = [
  {
    title: 'Neon Waves Festival 2025',
    artist: 'Various Artists',
    description:
      "Experience three days of electronic music across 5 stages featuring the world's top DJs and emerging artists. Join us for an unforgettable journey through sound and light.",
    category: 'festival' as const,
    date: new Date('2025-07-15'),
    time: '14:00',
    venueName: 'Jakarta International Expo',
    venueAddress: 'Jl. Gatot Subroto, Jakarta Pusat, DKI Jakarta 10270',
    venueCity: 'Jakarta',
    venueCapacity: 50000,
    imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=600&fit=crop',
    bannerImageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=400&fit=crop',
    tags: JSON.stringify(['EDM', 'House', 'Techno', 'Multi-day']),
    isFeatured: true,
    ticketCategories: [
      {
        name: 'GENERAL',
        displayName: 'General Admission',
        price: new Decimal('2990000'),
        quantityTotal: 30000,
        benefits: JSON.stringify(['Access to all stages', 'Food court access', 'Standard amenities']),
      },
      {
        name: 'VIP',
        displayName: 'VIP Package',
        price: new Decimal('7490000'),
        quantityTotal: 2000,
        benefits: JSON.stringify(['Express entry', 'VIP viewing areas', 'Complimentary drinks', 'VIP lounge access', 'Exclusive merch']),
      },
      {
        name: 'VVIP',
        displayName: 'VVIP Ultra',
        price: new Decimal('14990000'),
        quantityTotal: 500,
        benefits: JSON.stringify(['All VIP benefits', 'Meet & greet', 'Backstage access', 'Premium parking', 'Concierge service']),
      },
    ],
  },
  {
    title: 'The Midnight Orchestra',
    artist: 'Jakarta Symphony Orchestra',
    description:
      'A mesmerizing evening of classical masterpieces performed by the renowned Jakarta Symphony Orchestra. Featuring works by Mozart, Beethoven, and contemporary composers.',
    category: 'theater' as const,
    date: new Date('2025-06-20'),
    time: '19:30',
    venueName: 'Teater Jakarta',
    venueAddress: 'Jl. Cikini Raya No.73, Jakarta Pusat 10330',
    venueCity: 'Jakarta',
    venueCapacity: 2500,
    imageUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800&h=600&fit=crop',
    bannerImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=400&fit=crop',
    tags: JSON.stringify(['Classical', 'Orchestra', 'Live Music']),
    isFeatured: true,
    ticketCategories: [
      {
        name: 'CAT3',
        displayName: 'Balcony',
        price: new Decimal('675000'),
        quantityTotal: 1000,
        benefits: JSON.stringify(['Balcony seating', 'Good acoustics']),
      },
      {
        name: 'CAT2',
        displayName: 'Mezzanine',
        price: new Decimal('1275000'),
        quantityTotal: 800,
        benefits: JSON.stringify(['Mezzanine level', 'Excellent view', 'Premium sound']),
      },
      {
        name: 'CAT1',
        displayName: 'Orchestra',
        price: new Decimal('2250000'),
        quantityTotal: 500,
        benefits: JSON.stringify(['Orchestra level', 'Best seats', 'Immersive experience', 'Intermission lounge']),
      },
    ],
  },
  {
    title: 'Stand-Up Comedy Night: Pandji Pragiwaksono',
    artist: 'Pandji Pragiwaksono',
    description:
      'Join comedy superstar Pandji Pragiwaksono for an evening of non-stop laughter. His unique blend of observational humor and storytelling will have you in stitches.',
    category: 'comedy' as const,
    date: new Date('2025-05-10'),
    time: '20:00',
    venueName: 'Balai Sarbini',
    venueAddress: 'Jl. Sisingamangaraja, Jakarta Selatan 12110',
    venueCity: 'Jakarta',
    venueCapacity: 400,
    imageUrl: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800&h=600&fit=crop',
    bannerImageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&h=400&fit=crop',
    tags: JSON.stringify(['Comedy', 'Stand-up', 'Entertainment']),
    isFeatured: false,
    ticketCategories: [
      {
        name: 'GENERAL',
        displayName: 'General Seating',
        price: new Decimal('525000'),
        quantityTotal: 250,
        benefits: JSON.stringify(['General admission', 'First come first serve']),
      },
      {
        name: 'VIP',
        displayName: 'VIP Table',
        price: new Decimal('1125000'),
        quantityTotal: 50,
        benefits: JSON.stringify(['Reserved table', 'Priority seating', 'Complimentary drink', 'Meet & greet opportunity']),
      },
    ],
  },
  {
    title: 'Rock Legends: The Phoenix',
    artist: 'The Phoenix',
    description:
      'The Phoenix returns with their greatest hits tour! Experience the raw energy and unforgettable anthems that defined a generation. Special guest appearances confirmed.',
    category: 'concert' as const,
    date: new Date('2025-08-22'),
    time: '19:00',
    venueName: 'Gelora Bung Karno Stadium',
    venueAddress: 'Jl. Pintu Satu Senayan, Jakarta Pusat 10270',
    venueCity: 'Jakarta',
    venueCapacity: 18000,
    imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop',
    bannerImageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=400&fit=crop',
    tags: JSON.stringify(['Rock', 'Live Music', 'Arena Show']),
    isFeatured: true,
    ticketCategories: [
      {
        name: 'STANDING',
        displayName: 'Standing Floor',
        price: new Decimal('1335000'),
        quantityTotal: 8000,
        benefits: JSON.stringify(['Standing room', 'Close to stage', 'High energy experience']),
      },
      {
        name: 'CAT2',
        displayName: 'Lower Bowl',
        price: new Decimal('1935000'),
        quantityTotal: 5000,
        benefits: JSON.stringify(['Seated section', 'Great view', 'Easy access to amenities']),
      },
      {
        name: 'CAT1',
        displayName: 'Premium Seats',
        price: new Decimal('3735000'),
        quantityTotal: 1000,
        benefits: JSON.stringify(['Best seats', 'Excellent sound', 'VIP entry', 'Commemorative poster']),
      },
      {
        name: 'VIP',
        displayName: 'VIP Experience',
        price: new Decimal('6735000'),
        quantityTotal: 200,
        benefits: JSON.stringify(['Soundcheck access', 'Meet & greet', 'Exclusive merch', 'Backstage tour', 'Premium parking']),
      },
    ],
  },
  {
    title: 'Jazz Under the Stars',
    artist: 'Indra Lesmana Trio',
    description:
      'An intimate evening of smooth jazz in an open-air setting. Indra Lesmana Trio brings their acclaimed blend of traditional and contemporary jazz to the scenic Taman Ismail Marzuki.',
    category: 'concert' as const,
    date: new Date('2025-06-05'),
    time: '20:30',
    venueName: 'Taman Ismail Marzuki',
    venueAddress: 'Jl. Cikini Raya No.73, Jakarta Pusat 10330',
    venueCity: 'Jakarta',
    venueCapacity: 1200,
    imageUrl: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800&h=600&fit=crop',
    bannerImageUrl: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=1200&h=400&fit=crop',
    tags: JSON.stringify(['Jazz', 'Outdoor', 'Live Music']),
    isFeatured: false,
    ticketCategories: [
      {
        name: 'GENERAL',
        displayName: 'Lawn Seating',
        price: new Decimal('825000'),
        quantityTotal: 700,
        benefits: JSON.stringify(['Lawn seating', 'Bring your own blanket', 'Relaxed atmosphere']),
      },
      {
        name: 'CAT1',
        displayName: 'Reserved Seating',
        price: new Decimal('1425000'),
        quantityTotal: 400,
        benefits: JSON.stringify(['Reserved chairs', 'Covered seating', 'Better view']),
      },
      {
        name: 'VIP',
        displayName: 'VIP Lounge',
        price: new Decimal('2625000'),
        quantityTotal: 100,
        benefits: JSON.stringify(['Premium seating', 'Complimentary drinks', 'Appetizers included', 'Artist meet & greet']),
      },
    ],
  },
  {
    title: 'Broadway Hits: Greatest Showman',
    artist: 'Teater Koma Ensemble',
    description:
      'A spectacular theatrical production celebrating the greatest hits from Broadway. Featuring talented performers and breathtaking choreography in an unforgettable show.',
    category: 'theater' as const,
    date: new Date('2025-09-12'),
    time: '19:00',
    venueName: 'Ciputra Artpreneur',
    venueAddress: 'Ciputra World 1, Jl. Prof. Dr. Satrio Kav. 3-5, Jakarta 12940',
    venueCity: 'Jakarta',
    venueCapacity: 1800,
    imageUrl: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&h=600&fit=crop',
    bannerImageUrl: 'https://images.unsplash.com/photo-1523821741446-edb94194c12b?w=1200&h=400&fit=crop',
    tags: JSON.stringify(['Musical', 'Theater', 'Broadway']),
    isFeatured: true,
    ticketCategories: [
      {
        name: 'CAT3',
        displayName: 'Upper Circle',
        price: new Decimal('975000'),
        quantityTotal: 600,
        benefits: JSON.stringify(['Upper level seating', 'Full stage view']),
      },
      {
        name: 'CAT2',
        displayName: 'Dress Circle',
        price: new Decimal('1725000'),
        quantityTotal: 600,
        benefits: JSON.stringify(['Mid-level seating', 'Excellent sightlines', 'Premium comfort']),
      },
      {
        name: 'CAT1',
        displayName: 'Stalls Premium',
        price: new Decimal('2775000'),
        quantityTotal: 400,
        benefits: JSON.stringify(['Best seats', 'Ground level', 'Closest to stage', 'Souvenir program']),
      },
    ],
  },
];

const promoCodes = [
  {
    code: 'WELCOME10',
    description: '10% welcome discount for new users',
    discountType: 'percentage' as const,
    discountValue: new Decimal('10'),
    maxUsageCount: null,
    maxUsagePerUser: 1,
    validFrom: new Date('2025-01-01'),
    validUntil: new Date('2025-12-31'),
  },
  {
    code: 'EARLYBIRD15',
    description: '15% early bird discount',
    discountType: 'percentage' as const,
    discountValue: new Decimal('15'),
    maxUsageCount: 100,
    maxUsagePerUser: 1,
    validFrom: new Date('2025-01-01'),
    validUntil: new Date('2025-06-30'),
  },
  {
    code: 'STUDENT20',
    description: '20% student discount',
    discountType: 'percentage' as const,
    discountValue: new Decimal('20'),
    maxUsageCount: null,
    maxUsagePerUser: 5,
    minimumOrderAmount: new Decimal('500000'),
    validFrom: new Date('2025-01-01'),
    validUntil: new Date('2025-12-31'),
  },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  console.log('Clearing existing data...');
  await prisma.ticket.deleteMany();
  await prisma.order.deleteMany();
  await prisma.ticketCategory.deleteMany();
  await prisma.event.deleteMany();
  await prisma.promoCode.deleteMany();

  // Seed events
  console.log('Creating events...');
  for (const eventData of events) {
    const { ticketCategories, ...eventInfo } = eventData;

    await prisma.event.create({
      data: {
        ...eventInfo,
        year: eventInfo.date.getFullYear(),
        ticketCategories: {
          createMany: {
            data: ticketCategories.map((cat, index) => ({
              ...cat,
              sortOrder: index,
            })),
          },
        },
      },
    });
  }

  console.log(`✅ Created ${events.length} events`);

  // Seed promo codes
  console.log('Creating promo codes...');
  for (const promoData of promoCodes) {
    await prisma.promoCode.create({
      data: promoData,
    });
  }

  console.log(`✅ Created ${promoCodes.length} promo codes`);

  console.log('✨ Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
