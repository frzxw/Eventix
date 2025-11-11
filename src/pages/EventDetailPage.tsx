import { useNavigate, useParams } from 'react-router-dom';
import { EventDetail } from '../components/events/EventDetail';
import { EventDetailSkeleton } from '../components/loading';
import { useEvent } from '../lib/hooks/useEvent';

export function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { event, isLoading, error } = useEvent(eventId);

  if (isLoading) {
    return (
      <EventDetailSkeleton />
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl mb-4" style={{ fontWeight: 'var(--font-weight-medium)' }}>
          Event Not Found
        </h1>
        <p className="text-[var(--text-secondary)] mb-6">
          {error ?? "The event you're looking for doesn't exist."}
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
