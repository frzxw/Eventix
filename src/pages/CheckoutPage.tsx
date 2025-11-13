import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookingStep1, type TicketSelection } from '../components/booking/BookingStep1';
import { BookingStep2, type AttendeeInfo } from '../components/booking/BookingStep2';
import { BookingStep3, type PaymentMethod } from '../components/booking/BookingStep3';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useEvent } from '../lib/hooks/useEvent';
import { useBookingStateMachine } from '../lib/hooks/useBookingStateMachine';
import { QueueModal } from '../components/booking/QueueModal';
import { toast } from 'sonner';

type BookingStep = 1 | 2 | 3;

export function CheckoutPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { event, isLoading, error } = useEvent(eventId);
  const booking = useBookingStateMachine();

  const [currentStep, setCurrentStep] = useState<BookingStep>(1);
  const [ticketSelections, setTicketSelections] = useState<TicketSelection[]>([]);
  const [attendeeInfo, setAttendeeInfo] = useState<AttendeeInfo | null>(null);

  const handleStep1Continue = (selections: TicketSelection[]) => {
    setTicketSelections(selections);
    if (!event) return;
    booking.actions.start({
      eventId: event.id,
      selections: selections.map((selection) => ({
        categoryId: selection.categoryId,
        quantity: selection.quantity,
      })),
    });
  };

  const handleStep2Continue = (info: AttendeeInfo) => {
    setAttendeeInfo(info);
    setCurrentStep(3);
  };

  const handleStep1Back = () => {
    booking.actions.reset();
    navigate(`/event/${eventId}`);
  };

  const handleStep2Back = () => {
    setCurrentStep(1);
  };

  const handleStep3Back = () => {
    setCurrentStep(2);
  };

  const handleComplete = (orderId: string) => {
    if (!event) {
      return;
    }
    // Store order details in localStorage for the confirmation page
    if (attendeeInfo) {
      const totalAmount = ticketSelections.reduce((sum, selection) => {
        const category = event.ticketCategories.find((cat) => cat.id === selection.categoryId);
        return sum + (category ? category.price * selection.quantity : 0);
      }, 0);

      const orderDetails = {
        orderId,
        eventTitle: event.title,
        eventDate: event.date,
        eventTime: event.time,
        venueName: event.venue.name,
        venueCity: event.venue.city,
        tickets: ticketSelections.map((selection) => {
          const category = event.ticketCategories.find((cat) => cat.id === selection.categoryId);
          return {
            category: category?.name || '',
            quantity: selection.quantity,
            price: category?.price || 0,
          };
        }),
        totalAmount,
        email: attendeeInfo.email,
        confirmationSentAt: new Date().toISOString(),
      };

      localStorage.setItem('lastOrder', JSON.stringify(orderDetails));
    }

    // Navigate to order confirmation page
    navigate('/order-confirmation');
  };

  const handleCheckout = async (paymentMethod: PaymentMethod) => {
    if (!event || !attendeeInfo) {
      const errorMessage = 'Missing attendee information.';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }

    const result = await booking.actions.checkout({
      eventId: event.id,
      attendee: {
        firstName: attendeeInfo.firstName,
        lastName: attendeeInfo.lastName,
        email: attendeeInfo.email,
        phone: attendeeInfo.phone,
      },
      selections: ticketSelections.map((selection) => ({
        categoryId: selection.categoryId,
        quantity: selection.quantity,
      })),
      paymentMethod,
    });

    if (result.success && result.orderId) {
      handleComplete(result.orderId);
    } else if (result.error) {
      toast.error(result.error);
    }
    return result;
  };

  const hasSelections = ticketSelections.length > 0;

  useEffect(() => {
    if (!isLoading && booking.state.stage === 'ready-with-hold' && hasSelections) {
      setCurrentStep((step) => (step < 2 ? 2 : step));
    }
  }, [booking.state.stage, hasSelections, isLoading]);

  useEffect(() => {
    if (booking.state.stage === 'expired') {
      toast.error('Your ticket hold expired. Please select tickets again.');
      setCurrentStep(1);
    }
  }, [booking.state.stage]);

  useEffect(() => {
    if (booking.state.stage === 'error' && booking.startError) {
      toast.error(booking.startError);
    }
  }, [booking.state.stage, booking.startError]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" message="Loading checkout flow" />
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

  return (
    <>
      {currentStep === 1 && (
        <BookingStep1
          event={event}
          onContinue={handleStep1Continue}
          onBack={handleStep1Back}
          isProcessing={booking.isLoading || booking.state.stage === 'trying-hold'}
          errorMessage={booking.startError}
        />
      )}
      
      {currentStep === 2 && (
        <BookingStep2
          event={event}
          selections={ticketSelections}
          onContinue={handleStep2Continue}
          onBack={handleStep2Back}
          holdInfo={{
            holdId: booking.state.holdId,
            holdExpiresAt: booking.state.holdExpiresAt,
            onExtend: booking.actions.extendHold,
            isExtending: booking.isExtending,
          }}
        />
      )}
      
      {currentStep === 3 && attendeeInfo && (
        <BookingStep3
          event={event}
          selections={ticketSelections}
          attendeeInfo={attendeeInfo}
          onComplete={handleComplete}
          onBack={handleStep3Back}
          onCheckout={handleCheckout}
          isCheckoutPending={booking.isCheckoutPending}
          holdInfo={{
            holdId: booking.state.holdId,
            holdExpiresAt: booking.state.holdExpiresAt,
            onExtend: booking.actions.extendHold,
            isExtending: booking.isExtending,
          }}
        />
      )}

      <QueueModal
        open={booking.state.stage === 'in-queue'}
        stage={booking.state.stage}
        queuePosition={booking.state.queuePosition}
        etaSeconds={booking.state.queueEtaSeconds}
        queueId={booking.state.queueId}
        correlationId={booking.state.correlationId}
        isRealtimeActive={booking.state.isRealtimeActive}
        onCancel={() => booking.actions.cancelQueue()}
        onContinue={event ? () => setCurrentStep(2) : undefined}
        queueStatusUrl="/queue"
      />
    </>
  );
}
