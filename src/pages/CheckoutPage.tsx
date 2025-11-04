import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookingStep1, type TicketSelection } from '../components/booking/BookingStep1';
import { BookingStep2, type AttendeeInfo } from '../components/booking/BookingStep2';
import { BookingStep3 } from '../components/booking/BookingStep3';
import { mockEvents } from '../lib/mock-data';

type BookingStep = 1 | 2 | 3;

export function CheckoutPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  
  const event = mockEvents.find((e) => e.id === eventId);
  
  const [currentStep, setCurrentStep] = useState<BookingStep>(1);
  const [ticketSelections, setTicketSelections] = useState<TicketSelection[]>([]);
  const [attendeeInfo, setAttendeeInfo] = useState<AttendeeInfo | null>(null);

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
