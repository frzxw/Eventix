import { motion } from 'motion/react';
import { Hero } from '../components/home/Hero';
import { PromoCarousel } from '../components/home/PromoCarousel';
import { EventCarousel } from '../components/home/EventCarousel';
import { CategoryGrid } from '../components/home/CategoryGrid';
import { EventCard } from '../components/events/EventCard';
import { SEOHead } from '../components/SEOHead';
import { EventGridSkeleton } from '../components/loading';
import { mockEvents, getFeaturedEvents } from '../lib/mock-data';
import type { Event } from '../lib/types';
import { useNavigate } from 'react-router-dom';
import { useFeaturedEventsQuery, useEventsQuery } from '@/lib/hooks/useEvents';

export function HomePage() {
  const navigate = useNavigate();
  const featuredQuery = useFeaturedEventsQuery();
  const eventsQuery = useEventsQuery({ limit: 12, page: 1, sort: 'date' });

  const featuredEvents: Event[] = featuredQuery.data && featuredQuery.data.length > 0
    ? featuredQuery.data
    : getFeaturedEvents();

  const allEvents: Event[] = eventsQuery.isError
    ? mockEvents
    : eventsQuery.data?.events ?? [];

  const isLoading = featuredQuery.isPending || eventsQuery.isPending;

  const error = eventsQuery.isError
    ? eventsQuery.error instanceof Error
      ? eventsQuery.error.message
      : 'Unable to fetch events.'
    : featuredQuery.isError
    ? featuredQuery.error instanceof Error
      ? featuredQuery.error.message
      : 'Unable to fetch featured events.'
    : null;

  const handleEventClick = (eventId: string) => {
    navigate(`/event/${eventId}`);
  };

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/discover?category=${categoryId}`);
  };

  return (
    <div>
      <SEOHead
        title="Eventix - Premium Online Ticketing Platform | Concert, Festival & Theater Tickets"
        description="Discover and book tickets to the best concerts, festivals, theater shows, and live entertainment in Indonesia. Secure booking, instant delivery, best prices guaranteed."
        keywords="event tickets, concert tickets, festival tickets, theater tickets, live entertainment, Indonesia tickets, Jakarta events, online booking"
      />
      <Hero />
      
      <PromoCarousel />
      
      <EventCarousel
        title="Featured Events"
        events={featuredEvents.length > 0 ? featuredEvents : getFeaturedEvents()}
        onEventClick={handleEventClick}
      />
      
      <CategoryGrid onCategoryClick={handleCategoryClick} />

      <section className="py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-6 sm:mb-8"
          >
            <h2 className="text-2xl sm:text-3xl" style={{ fontWeight: 'var(--font-weight-medium)' }}>
              All Events
            </h2>
          </motion.div>

          {isLoading ? (
            <EventGridSkeleton count={8} />
          ) : allEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {allEvents.slice(0, 8).map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.05 }}
                >
                  <EventCard
                    event={event}
                    onClick={() => handleEventClick(event.id)}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="glass rounded-3xl border border-[var(--border-glass)] p-12 text-center">
              <p className="text-xl mb-2" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                {error ?? 'No events available right now'}
              </p>
              <p className="text-[var(--text-secondary)]">
                Please check back soon while we refresh the lineup.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
