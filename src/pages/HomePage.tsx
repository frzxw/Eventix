import { motion } from 'motion/react';
import { Hero } from '../components/home/Hero';
import { PromoCarousel } from '../components/home/PromoCarousel';
import { EventCarousel } from '../components/home/EventCarousel';
import { CategoryGrid } from '../components/home/CategoryGrid';
import { EventCard } from '../components/events/EventCard';
import { SEOHead } from '../components/SEOHead';
import { mockEvents, getFeaturedEvents } from '../lib/mock-data';
import { useNavigate } from 'react-router-dom';

export function HomePage() {
  const navigate = useNavigate();
  const featuredEvents = getFeaturedEvents();

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
        events={featuredEvents}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {mockEvents.slice(0, 8).map((event, index) => (
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
