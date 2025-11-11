import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Hero } from '../components/home/Hero';
import { PromoCarousel } from '../components/home/PromoCarousel';
import { EventCarousel } from '../components/home/EventCarousel';
import { CategoryGrid } from '../components/home/CategoryGrid';
import { EventCard } from '../components/events/EventCard';
import { SEOHead } from '../components/SEOHead';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { mockEvents, getFeaturedEvents } from '../lib/mock-data';
import { apiClient } from '../lib/services/api-client';
import type { Event } from '../lib/types';
import { useNavigate } from 'react-router-dom';

export function HomePage() {
  const navigate = useNavigate();
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadEvents = async () => {
      setIsLoading(true);
      setError(null);

      const [featuredResponse, allResponse] = await Promise.all([
        apiClient.events.getFeatured(),
        apiClient.events.getAll({ limit: 12, sort: 'date' }),
      ]);

      if (!isMounted) {
        return;
      }

      if (featuredResponse.data && featuredResponse.data.length > 0) {
        setFeaturedEvents(featuredResponse.data);
      } else {
        setFeaturedEvents(getFeaturedEvents());
        if (featuredResponse.error) {
          setError((prev) => prev ?? featuredResponse.error ?? null);
        }
      }

      if (allResponse.data) {
        setAllEvents(allResponse.data.events);
      } else {
        setAllEvents(mockEvents);
        if (allResponse.error) {
          setError((prev) => prev ?? allResponse.error ?? null);
        }
      }

      setIsLoading(false);
    };

    loadEvents();

    return () => {
      isMounted = false;
    };
  }, []);

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
            <div className="py-12">
              <LoadingSpinner message="Fetching the latest events" />
            </div>
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
