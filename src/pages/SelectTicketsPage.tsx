import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookingStep1, type TicketSelection } from '../components/booking/BookingStep1';
import { BookingStep2, type AttendeeInfo } from '../components/booking/BookingStep2';
import { BookingStep3 } from '../components/booking/BookingStep3';
import { apiClient } from '@/lib/services/api-client';
import { mapApiEvent } from '@/lib/mappers/events';
import type { Event } from '@/lib/types';
import { LoadingSpinner } from '@/components/LoadingSpinner';

type BookingStep = 1 | 2 | 3;

export function SelectTicketsPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<BookingStep>(1);
  const [selections, setSelections] = useState<TicketSelection[]>([]);
  const [attendeeInfo, setAttendeeInfo] = useState<AttendeeInfo | null>(null);
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

  const handleStep1Continue = (ticketSelections: TicketSelection[]) => {
    setSelections(ticketSelections);
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStep2Continue = (info: AttendeeInfo) => {
    setAttendeeInfo(info);
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleComplete = (orderId: string) => {
    navigate(`/order-confirmation?orderId=${encodeURIComponent(orderId)}`);
  };

  const handleBackToEvent = () => {
    navigate(`/event/${eventId}`);
  };

  const handleBackToStep1 = () => {
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToStep2 = () => {
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {currentStep === 1 && (
        <BookingStep1
          event={event}
          onContinue={handleStep1Continue}
          onBack={handleBackToEvent}
        />
      )}
      {currentStep === 2 && attendeeInfo === null && (
        <BookingStep2
          event={event}
          selections={selections}
          onContinue={handleStep2Continue}
          onBack={handleBackToStep1}
        />
      )}
      {currentStep === 3 && attendeeInfo && (
        <BookingStep3
          event={event}
          selections={selections}
          attendeeInfo={attendeeInfo}
          onComplete={handleComplete}
          onBack={handleBackToStep2}
        />
      )}
    </>
  );
}
