import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EventDetail } from '../components/events/EventDetail';
import { apiClient } from '@/lib/services/api-client';
import { mapApiEvent } from '@/lib/mappers/events';
import type { Event } from '@/lib/types';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!eventId) return;
      setLoading(true);
      setError(null);
      const res = await apiClient.events.getById(eventId);
      if (!mounted) return;
      if (res.error) setError(res.error);
      if (res.data) setEvent(mapApiEvent(res.data));
      setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, [eventId]);

  if (loading) return <LoadingSpinner fullScreen message="Loading event..." />;
  if (error) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl mb-4" style={{ fontWeight: 'var(--font-weight-medium)' }}>
          Unable to load event
        </h1>
        <p className="text-[var(--text-secondary)] mb-6">{error}</p>
        <button
          onClick={() => navigate('/')}
          className="text-[var(--primary-400)] hover:text-[var(--primary-300)] transition-smooth"
        >
          Return to Home
        </button>
      </div>
    );
  }
  if (!event) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl mb-4" style={{ fontWeight: 'var(--font-weight-medium)' }}>
          Event Not Found
        </h1>
        <p className="text-[var(--text-secondary)] mb-6">
          The event you're looking for doesn't exist.
        </p>
        <button
          onClick={() => navigate('/')}
          className="text-[var(--primary-400)] hover:text-[var(--primary-300)] transition-smooth"
        >
          Return to Home
        </button>
      </div>
    );
  }

  const handleSelectTickets = () => {
    navigate(`/event/${eventId}/checkout`);
  };

  return <EventDetail event={event} onSelectTickets={handleSelectTickets} />;
}
