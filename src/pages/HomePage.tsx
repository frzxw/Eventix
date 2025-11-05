import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Hero } from '../components/home/Hero';
import { PromoCarousel } from '../components/home/PromoCarousel';
import { EventCarousel } from '../components/home/EventCarousel';
import { CategoryGrid } from '../components/home/CategoryGrid';
import { EventCard } from '../components/events/EventCard';
import { SEOHead } from '../components/SEOHead';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/lib/services/api-client';
import { mapApiEvent, mapApiEvents } from '@/lib/mappers/events';
import type { Event } from '@/lib/types';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export function HomePage() {
  const navigate = useNavigate();
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      const [feat, all] = await Promise.all([
        apiClient.events.getFeatured(),
        apiClient.events.getAll({ limit: 12, page: 1 }),
      ]);
      if (!mounted) return;
      if (feat.error) setError(feat.error);
      if (all.error) setError(all.error);
      setFeaturedEvents(mapApiEvents(feat.data));
      setAllEvents(mapApiEvents(all.data));
      setLoading(false);
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleEventClick = (eventId: string) => {
    navigate(`/event/${eventId}`);
  };

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/discover?category=${categoryId}`);
  };

  if (loading) return <LoadingSpinner fullScreen message="Loading events..." />;
  if (error) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl mb-4" style={{ fontWeight: 'var(--font-weight-medium)' }}>Unable to load events</h1>
        <p className="text-[var(--text-secondary)]">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <SEOHead
        title="Eventix - Premium Online Ticketing Platform | Concert, Festival & Theater Tickets"
        description="Discover and book tickets to the best concerts, festivals, theater shows, and live entertainment in Indonesia. Secure booking, instant delivery, best prices guaranteed."
        keywords="event tickets, concert tickets, festival tickets, theater tickets, live entertainment, Indonesia tickets, Jakarta events, online booking"
      />
      <Hero />
      
      <PromoCarousel />
      
      {featuredEvents.length > 0 && (
        <EventCarousel
          title="Featured Events"
          events={featuredEvents}
          onEventClick={handleEventClick}
        />
      )}
      
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
        </div>
      </section>
    </div>
  );
}
