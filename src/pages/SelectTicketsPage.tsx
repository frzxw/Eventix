import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookingStep1, type TicketSelection } from '../components/booking/BookingStep1';
import { BookingStep2, type AttendeeInfo } from '../components/booking/BookingStep2';
import { BookingStep3, type PaymentMethod } from '../components/booking/BookingStep3';
import { EventDetailSkeleton } from '../components/loading';
import { useEvent } from '../lib/hooks/useEvent';

type BookingStep = 1 | 2 | 3;

export function SelectTicketsPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<BookingStep>(1);
  const [selections, setSelections] = useState<TicketSelection[]>([]);
  const [attendeeInfo, setAttendeeInfo] = useState<AttendeeInfo | null>(null);
  const { event, isLoading, error } = useEvent(eventId);

  if (isLoading) {
    return <EventDetailSkeleton />;
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl mb-4" style={{ fontWeight: 'var(--font-weight-medium)' }}>
          Event Not Found
        </h1>
        <p className="text-[var(--text-secondary)] mb-6">
          {error ?? 'The event you&rsquo;re looking for doesn&rsquo;t exist.'}
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
    navigate('/my-tickets', { state: { orderId, eventId } });
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

  const handleCheckout = async (_paymentMethod: PaymentMethod) => {
    console.warn('Checkout flow is not available on SelectTicketsPage');
    return { success: false, error: 'Checkout is not available in this flow. Please use the main checkout.' };
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
          onCheckout={handleCheckout}
        />
      )}
    </>
  );
}
