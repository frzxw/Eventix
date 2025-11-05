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

export function CheckoutPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<BookingStep>(1);
  const [ticketSelections, setTicketSelections] = useState<TicketSelection[]>([]);
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
        <h1 className="text-3xl mb-4" style={{ fontWeight: 'var(--font-weight-medium)' }}>Unable to load event</h1>
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

  const handleStep1Continue = (selections: TicketSelection[]) => {
    setTicketSelections(selections);
    setCurrentStep(2);
  };

  const handleStep2Continue = (info: AttendeeInfo) => {
    setAttendeeInfo(info);
    setCurrentStep(3);
  };

  const handleStep1Back = () => {
    navigate(`/event/${eventId}`);
  };

  const handleStep2Back = () => {
    setCurrentStep(1);
  };

  const handleStep3Back = () => {
    setCurrentStep(2);
  };

  const handleComplete = (orderId: string) => {
    // Navigate to order confirmation page with orderId (backend will be queried there)
    navigate(`/order-confirmation?orderId=${encodeURIComponent(orderId)}`);
  };

  return (
    <>
      {currentStep === 1 && (
        <BookingStep1
          event={event}
          onContinue={handleStep1Continue}
          onBack={handleStep1Back}
        />
      )}
      
      {currentStep === 2 && (
        <BookingStep2
          event={event}
          selections={ticketSelections}
          onContinue={handleStep2Continue}
          onBack={handleStep2Back}
        />
      )}
      
      {currentStep === 3 && attendeeInfo && (
        <BookingStep3
          event={event}
          selections={ticketSelections}
          attendeeInfo={attendeeInfo}
          onComplete={handleComplete}
          onBack={handleStep3Back}
        />
      )}
    </>
  );
}
