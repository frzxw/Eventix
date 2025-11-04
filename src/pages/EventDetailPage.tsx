import { useParams, useNavigate } from 'react-router-dom';
import { EventDetail } from '../components/events/EventDetail';
import { mockEvents } from '../lib/mock-data';

export function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  
  const event = mockEvents.find((e) => e.id === eventId);

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
