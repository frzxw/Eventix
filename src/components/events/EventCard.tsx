import { Calendar, MapPin, Tag, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { Badge } from '../ui/badge';
import type { Event } from '../../lib/types';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface EventCardProps {
  event: Event;
  onClick?: () => void;
}

export function EventCard({ event, onClick }: EventCardProps) {
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const eventYear = eventDate.getFullYear();

  const availableTickets = event.ticketCategories.reduce((sum, cat) => sum + cat.available, 0);
  const totalTickets = event.ticketCategories.reduce((sum, cat) => sum + cat.total, 0);
  const availabilityPercentage = (availableTickets / totalTickets) * 100;

  return (
    <motion.article
      onClick={onClick}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="group glass rounded-2xl overflow-hidden border border-[var(--border-glass)] hover:bg-[var(--surface-glass-hover)] hover:border-[var(--border-hover)] cursor-pointer focus-ring h-full flex flex-col hover:shadow-2xl hover:shadow-[var(--primary-500)]/10"
      tabIndex={0}
      role="button"
      aria-label={`View ${event.title} event details`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[var(--background-secondary)]">
        <motion.div
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <ImageWithFallback
            src={event.image}
            alt={`${event.title} event cover`}
            className="w-full h-full object-cover"
          />
        </motion.div>
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <Badge className="glass border-[var(--border-glass)] capitalize backdrop-blur-md">
            {event.category}
          </Badge>
        </div>

        {/* Featured Badge */}
        {event.featured && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-gradient-to-r from-[var(--primary-500)] to-[var(--accent-500)] border-0 text-white">
              Featured
            </Badge>
          </div>
        )}

        {/* Availability Indicator */}
        {availabilityPercentage < 30 && availabilityPercentage > 0 && (
          <div className="absolute bottom-3 left-3">
            <Badge variant="destructive" className="glass border-[var(--error-border)] bg-[var(--error-bg)] backdrop-blur-md">
              {availabilityPercentage < 10 ? 'Selling Out' : 'Selling Fast'}
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        {/* Title & Artist */}
        <h3 className="mb-2 line-clamp-1" style={{ fontWeight: 'var(--font-weight-medium)' }}>
          {event.title}
        </h3>
        <p className="text-[var(--text-secondary)] mb-4 line-clamp-1">
          {event.artist}
        </p>

        {/* Event Details */}
        <div className="space-y-2 mb-4 flex-1">
          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
            <Calendar className="w-4 h-4 text-[var(--primary-500)] shrink-0" aria-hidden="true" />
            <span className="text-sm">
              {formattedDate} {eventYear} • {event.time}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
            <MapPin className="w-4 h-4 text-[var(--accent-500)] shrink-0" aria-hidden="true" />
            <span className="text-sm line-clamp-1">
              {event.venue.name}, {event.venue.city}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
            <Users className="w-4 h-4 text-[var(--success)] shrink-0" aria-hidden="true" />
            <span className="text-sm">
              {availableTickets.toLocaleString()} tickets available
            </span>
          </div>
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--border-default)]">
          <div>
            <span className="text-xs text-[var(--text-tertiary)] block">From</span>
            <span className="text-xl" style={{ fontWeight: 'var(--font-weight-medium)' }}>
              {event.pricing.currency} {event.pricing.min.toLocaleString('id-ID')}
            </span>
          </div>
          <motion.div
            whileHover={{ x: 5 }}
            transition={{ duration: 0.2 }}
            className="text-sm text-[var(--primary-500)] group-hover:text-[var(--primary-600)] transition-smooth flex items-center gap-1"
            style={{ fontWeight: 'var(--font-weight-medium)' }}
          >
            View Details
            <motion.span
              animate={{ x: [0, 3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              aria-hidden="true"
            >
              →
            </motion.span>
          </motion.div>
        </div>

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-[var(--border-default)]" aria-label="Event tags">
            {event.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-1 rounded-md bg-[var(--surface-glass)] text-[var(--text-tertiary)] border border-[var(--border-default)]"
              >
                <Tag className="w-3 h-3 inline mr-1" aria-hidden="true" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.article>
  );
}
