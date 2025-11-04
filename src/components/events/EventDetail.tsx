import { Calendar, MapPin, Clock, Users, Info, Share2, Heart } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import type { Event } from '../../lib/types';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface EventDetailProps {
  event: Event;
  onSelectTickets?: () => void;
}

export function EventDetail({ event, onSelectTickets }: EventDetailProps) {
  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const availableTickets = event.ticketCategories.reduce((sum, cat) => sum + cat.available, 0);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        className="mb-6 glass-hover transition-smooth focus-ring"
        onClick={() => window.history.back()}
      >
        ← Back to Events
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Image */}
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-[var(--background-secondary)]">
            <ImageWithFallback
              src={event.image}
              alt={`${event.title} event`}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge className="glass border-[var(--border-glass)] capitalize backdrop-blur-md">
                {event.category}
              </Badge>
              {event.featured && (
                <Badge className="bg-gradient-to-r from-[var(--primary-500)] to-[var(--accent-500)] border-0 text-white">
                  Featured
                </Badge>
              )}
            </div>
          </div>

          {/* Event Info */}
          <div className="glass rounded-2xl border border-[var(--border-glass)] p-6 sm:p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-3xl sm:text-4xl mb-2" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                  {event.title}
                </h1>
                <p className="text-xl text-[var(--text-secondary)]">{event.artist}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="glass-hover transition-smooth focus-ring rounded-xl"
                  aria-label="Share event"
                >
                  <Share2 className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="glass-hover transition-smooth focus-ring rounded-xl"
                  aria-label="Add to favorites"
                >
                  <Heart className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Key Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <DetailItem
                icon={<Calendar className="w-5 h-5" />}
                label="Date"
                value={formattedDate}
              />
              <DetailItem
                icon={<Clock className="w-5 h-5" />}
                label="Time"
                value={event.time}
              />
              <DetailItem
                icon={<MapPin className="w-5 h-5" />}
                label="Venue"
                value={event.venue.name}
              />
              <DetailItem
                icon={<Users className="w-5 h-5" />}
                label="Availability"
                value={`${availableTickets.toLocaleString()} tickets`}
              />
            </div>

            {/* Description */}
            <div className="pt-6 border-t border-[var(--border-default)]">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-5 h-5 text-[var(--primary-500)]" aria-hidden="true" />
                <h2 style={{ fontWeight: 'var(--font-weight-medium)' }}>About This Event</h2>
              </div>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                {event.description}
              </p>
            </div>

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="pt-6 border-t border-[var(--border-default)]">
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="glass border-[var(--border-default)]"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Venue Details */}
          <div className="glass rounded-2xl border border-[var(--border-glass)] p-6 sm:p-8">
            <h2 className="mb-4 flex items-center gap-2" style={{ fontWeight: 'var(--font-weight-medium)' }}>
              <MapPin className="w-5 h-5 text-[var(--accent-500)]" aria-hidden="true" />
              Venue Information
            </h2>
            <div className="space-y-2 text-[var(--text-secondary)]">
              <p className="text-[var(--text-primary)]" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                {event.venue.name}
              </p>
              <p>{event.venue.address}</p>
              <p>{event.venue.city}</p>
              <p className="pt-2 text-sm">
                Capacity: {event.venue.capacity.toLocaleString()} people
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar - Ticket Selection */}
        <div className="lg:col-span-1">
          <div className="glass rounded-2xl border border-[var(--border-glass)] p-6 sticky top-24">
            <h2 className="mb-4" style={{ fontWeight: 'var(--font-weight-medium)' }}>
              Select Tickets
            </h2>

            {/* Ticket Categories */}
            <div className="space-y-3 mb-6">
              {event.ticketCategories.map((category) => (
                <div
                  key={category.id}
                  className="p-4 rounded-xl bg-[var(--surface-glass)] border border-[var(--border-default)] transition-smooth"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p style={{ fontWeight: 'var(--font-weight-medium)' }}>
                        {category.displayName}
                      </p>
                      <p className="text-sm text-[var(--text-tertiary)]">
                        {category.available > 0
                          ? `${category.available} available`
                          : 'Sold out'}
                      </p>
                    </div>
                    <p style={{ fontWeight: 'var(--font-weight-medium)' }}>
                      IDR {category.price.toLocaleString('id-ID')}
                    </p>
                  </div>
                  {category.benefits && category.benefits.length > 0 && (
                    <ul className="text-xs text-[var(--text-tertiary)] space-y-1 mt-2">
                      {category.benefits.slice(0, 2).map((benefit, i) => (
                        <li key={i}>• {benefit}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <Button
              onClick={onSelectTickets}
              className="w-full h-12 bg-gradient-to-r from-[var(--primary-500)] to-[var(--accent-500)] hover:opacity-90 transition-smooth focus-ring text-lg"
              disabled={availableTickets === 0}
            >
              {availableTickets > 0 ? 'Choose Your Experience' : 'Sold Out'}
            </Button>

            {/* Additional Info */}
            <div className="mt-6 pt-6 border-t border-[var(--border-default)] space-y-2 text-sm text-[var(--text-tertiary)]">
              <p>✓ Instant ticket delivery</p>
              <p>✓ Secure payment processing</p>
              <p>✓ Customer support 24/7</p>
              <p>✓ Mobile wallet compatible</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DetailItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function DetailItem({ icon, label, value }: DetailItemProps) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--surface-glass)] border border-[var(--border-default)]">
      <div className="text-[var(--primary-500)] mt-0.5" aria-hidden="true">
        {icon}
      </div>
      <div>
        <p className="text-sm text-[var(--text-tertiary)] mb-1">{label}</p>
        <p style={{ fontWeight: 'var(--font-weight-medium)' }}>{value}</p>
      </div>
    </div>
  );
}
