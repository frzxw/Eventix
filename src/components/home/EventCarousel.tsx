import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { EventCard } from '../events/EventCard';
import type { Event } from '../../lib/types';
import { useState, useRef, useEffect } from 'react';

interface EventCarouselProps {
  title: string;
  events: Event[];
  onEventClick?: (eventId: string) => void;
}

export function EventCarousel({ title, events, onEventClick }: EventCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [events]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
    setTimeout(checkScroll, 300);
  };

  if (events.length === 0) return null;

  return (
    <section className="py-8 sm:py-12" aria-labelledby="carousel-title">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-6 sm:mb-8"
        >
          <h2 id="carousel-title" className="text-2xl sm:text-3xl" style={{ fontWeight: 'var(--font-weight-medium)' }}>
            {title}
          </h2>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className="glass-hover rounded-xl transition-smooth focus-ring disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className="glass-hover rounded-xl transition-smooth focus-ring disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" aria-hidden="true" />
            </Button>
          </div>
        </motion.div>

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="overflow-x-auto overflow-y-hidden -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 pb-4 scrollbar-hide"
          style={{ scrollbarWidth: 'none' }}
        >
          <div 
            className="flex gap-4 sm:gap-6" 
            role="list"
            aria-label={`${title} events`}
          >
            {events.map((event) => (
              <div 
                key={event.id} 
                className="shrink-0 w-[280px] sm:w-[320px] lg:w-[360px]"
                role="listitem"
              >
                <EventCard event={event} onClick={() => onEventClick?.(event.id)} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
