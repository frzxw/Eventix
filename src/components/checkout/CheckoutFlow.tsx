import { useState } from 'react';
import { Check, ChevronRight, CreditCard, User as UserIcon, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { PhoneInput } from '../ui/phone-input';
import { CountrySelect } from '../ui/country-select';
import { OrderSummary } from '../booking/OrderSummary';
import type { Event, CustomerDetails, PaymentDetails } from '../../lib/types';
import type { TicketSelection } from '../booking/CategorySelector';

interface CheckoutFlowProps {
  event: Event;
  selections: TicketSelection[];
  onComplete?: (orderId: string) => void;
  onBack?: () => void;
}

type CheckoutStep = 'details' | 'payment' | 'confirmation';

export function CheckoutFlow({ event, selections, onComplete, onBack }: CheckoutFlowProps) {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('details');
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: 'ID',
  });
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  });
  const [orderId, setOrderId] = useState<string>('');

  const steps: { id: CheckoutStep; label: string; icon: React.ReactNode }[] = [
    { id: 'details', label: 'Your Details', icon: <UserIcon className="w-5 h-5" /> },
    { id: 'payment', label: 'Payment', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'confirmation', label: 'Confirmation', icon: <CheckCircle2 className="w-5 h-5" /> },
  ];

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep('payment');
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate payment processing
    const newOrderId = `ORD-${Date.now()}`;
    setOrderId(newOrderId);
    setCurrentStep('confirmation');
  };

  const handleComplete = () => {
    onComplete?.(orderId);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-3xl mx-auto" role="progressbar" aria-valuenow={getStepNumber(currentStep)} aria-valuemin={1} aria-valuemax={3}>
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-12 h-12 rounded-xl flex items-center justify-center transition-smooth border-2
                    ${
                      currentStep === step.id
                        ? 'bg-gradient-to-r from-[var(--primary-500)] to-[var(--accent-500)] border-transparent text-white'
                        : getStepNumber(currentStep) > index + 1
                        ? 'bg-[var(--success)] border-[var(--success)] text-white'
                        : 'glass border-[var(--border-default)] text-[var(--text-tertiary)]'
                    }
                  `}
                >
                  {getStepNumber(currentStep) > index + 1 ? (
                    <Check className="w-5 h-5" aria-hidden="true" />
                  ) : (
                    step.icon
                  )}
                </div>
                <span
                  className={`text-sm mt-2 ${
                    currentStep === step.id ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'
                  }`}
                  style={{ fontWeight: currentStep === step.id ? 'var(--font-weight-medium)' : 'var(--font-weight-normal)' }}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 bg-[var(--border-default)] mx-4 mt-[-24px]" aria-hidden="true">
                  <div
                    className="h-full bg-gradient-to-r from-[var(--primary-500)] to-[var(--accent-500)] transition-smooth"
                    style={{
                      width: getStepNumber(currentStep) > index + 1 ? '100%' : '0%',
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {currentStep === 'details' && (
            <DetailsStep
              details={customerDetails}
              onChange={setCustomerDetails}
              onSubmit={handleDetailsSubmit}
              onBack={onBack}
            />
          )}
          {currentStep === 'payment' && (
            <PaymentStep
              details={paymentDetails}
              onChange={setPaymentDetails}
              onSubmit={handlePaymentSubmit}
              onBack={() => setCurrentStep('details')}
            />
          )}
          {currentStep === 'confirmation' && (
            <ConfirmationStep
              orderId={orderId}
              event={event}
              customerDetails={customerDetails}
              onComplete={handleComplete}
            />
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <OrderSummary event={event} selections={selections} className="sticky top-24" />
        </div>
      </div>
    </div>
  );
}

interface DetailsStepProps {
  details: CustomerDetails;
  onChange: (details: CustomerDetails) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack?: () => void;
}

function DetailsStep({ details, onChange, onSubmit, onBack }: DetailsStepProps) {
  return (
    <div className="glass rounded-2xl border border-[var(--border-glass)] p-6 sm:p-8">
      <h2 className="text-2xl mb-6" style={{ fontWeight: 'var(--font-weight-medium)' }}>
        Your Details
      </h2>
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              type="text"
              required
              value={details.firstName}
              onChange={(e) => onChange({ ...details, firstName: e.target.value })}
              className="glass border-[var(--border-default)] focus-ring"
              aria-required="true"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              type="text"
              required
              value={details.lastName}
              onChange={(e) => onChange({ ...details, lastName: e.target.value })}
              className="glass border-[var(--border-default)] focus-ring"
              aria-required="true"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            required
            value={details.email}
            onChange={(e) => onChange({ ...details, email: e.target.value })}
            className="glass border-[var(--border-default)] focus-ring"
            placeholder="your.email@example.com"
            aria-required="true"
          />
          <p className="text-xs text-[var(--text-tertiary)]">
            Tickets will be sent to this email address
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <PhoneInput
            value={details.phone}
            defaultCountry={details.country}
            onChange={(phone, countryCode) => onChange({ ...details, phone, country: countryCode })}
            placeholder="Enter phone number"
          />
          <p className="text-xs text-[var(--text-tertiary)]">
            For order updates and notifications
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Country *</Label>
          <CountrySelect
            value={details.country}
            onChange={(countryCode) => onChange({ ...details, country: countryCode })}
          />
        </div>

        <div className="flex gap-3 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1 glass-hover transition-smooth focus-ring"
          >
            Back
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-gradient-to-r from-[var(--primary-500)] to-[var(--accent-500)] hover:opacity-90 transition-smooth focus-ring"
          >
            Continue to Payment
            <ChevronRight className="w-5 h-5 ml-2" aria-hidden="true" />
          </Button>
        </div>
      </form>
    </div>
  );
}

interface PaymentStepProps {
  details: PaymentDetails;
  onChange: (details: PaymentDetails) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

function PaymentStep({ details, onChange, onSubmit, onBack }: PaymentStepProps) {
  return (
    <div className="glass rounded-2xl border border-[var(--border-glass)] p-6 sm:p-8">
      <h2 className="text-2xl mb-6" style={{ fontWeight: 'var(--font-weight-medium)' }}>
        Payment Information
      </h2>
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="cardNumber">Card Number *</Label>
          <Input
            id="cardNumber"
            type="text"
            required
            value={details.cardNumber}
            onChange={(e) => onChange({ ...details, cardNumber: e.target.value })}
            className="glass border-[var(--border-default)] focus-ring"
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            aria-required="true"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cardholderName">Cardholder Name *</Label>
          <Input
            id="cardholderName"
            type="text"
            required
            value={details.cardholderName}
            onChange={(e) => onChange({ ...details, cardholderName: e.target.value })}
            className="glass border-[var(--border-default)] focus-ring"
            placeholder="JOHN DOE"
            aria-required="true"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="expiryDate">Expiry Date *</Label>
            <Input
              id="expiryDate"
              type="text"
              required
              value={details.expiryDate}
              onChange={(e) => onChange({ ...details, expiryDate: e.target.value })}
              className="glass border-[var(--border-default)] focus-ring"
              placeholder="MM/YY"
              maxLength={5}
              aria-required="true"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cvv">CVV *</Label>
            <Input
              id="cvv"
              type="text"
              required
              value={details.cvv}
              onChange={(e) => onChange({ ...details, cvv: e.target.value })}
              className="glass border-[var(--border-default)] focus-ring"
              placeholder="123"
              maxLength={4}
              aria-required="true"
            />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[var(--surface-glass)] border border-[var(--border-default)]">
          <p className="text-sm text-[var(--text-secondary)]">
            <strong className="text-[var(--text-primary)]">🔒 Secure Payment</strong>
            <br />
            Your payment information is encrypted and secure. We never store your full card details.
          </p>
        </div>

        <div className="flex gap-3 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1 glass-hover transition-smooth focus-ring"
          >
            Back
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-gradient-to-r from-[var(--primary-500)] to-[var(--accent-500)] hover:opacity-90 transition-smooth focus-ring"
          >
            Complete Purchase
            <ChevronRight className="w-5 h-5 ml-2" aria-hidden="true" />
          </Button>
        </div>
      </form>
    </div>
  );
}

interface ConfirmationStepProps {
  orderId: string;
  event: Event;
  customerDetails: CustomerDetails;
  onComplete: () => void;
}

function ConfirmationStep({ orderId, event, customerDetails, onComplete }: ConfirmationStepProps) {
  return (
    <div className="glass rounded-2xl border border-[var(--border-glass)] p-6 sm:p-8 text-center">
      <div className="mb-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[var(--success)] to-[var(--success)] bg-opacity-20 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10 text-[var(--success)]" aria-hidden="true" />
        </div>
        <h2 className="text-3xl mb-2" style={{ fontWeight: 'var(--font-weight-medium)' }}>
          Booking Confirmed!
        </h2>
        <p className="text-[var(--text-secondary)]">
          Your tickets have been sent to {customerDetails.email}
        </p>
      </div>

      <div className="p-6 rounded-xl bg-[var(--surface-glass)] border border-[var(--border-default)] text-left mb-6">
        <p className="text-sm text-[var(--text-tertiary)] mb-1">Order Number</p>
        <p className="text-xl mb-4" style={{ fontWeight: 'var(--font-weight-medium)' }}>
          {orderId}
        </p>
        <p className="text-sm text-[var(--text-tertiary)] mb-1">Event</p>
        <p style={{ fontWeight: 'var(--font-weight-medium)' }}>{event.title}</p>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          {new Date(event.date).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}{' '}
          at {event.time}
        </p>
      </div>

      <div className="space-y-3 mb-6 text-sm text-left">
        <div className="flex items-start gap-2">
          <Check className="w-5 h-5 text-[var(--success)] shrink-0 mt-0.5" aria-hidden="true" />
          <span>Tickets sent to your email with QR codes</span>
        </div>
        <div className="flex items-start gap-2">
          <Check className="w-5 h-5 text-[var(--success)] shrink-0 mt-0.5" aria-hidden="true" />
          <span>Added to your account for easy access</span>
        </div>
        <div className="flex items-start gap-2">
          <Check className="w-5 h-5 text-[var(--success)] shrink-0 mt-0.5" aria-hidden="true" />
          <span>Can be added to Apple Wallet or Google Pay</span>
        </div>
      </div>

      <Button
        onClick={onComplete}
        className="w-full h-12 bg-gradient-to-r from-[var(--primary-500)] to-[var(--accent-500)] hover:opacity-90 transition-smooth focus-ring"
      >
        View My Tickets
      </Button>
    </div>
  );
}

function getStepNumber(step: CheckoutStep): number {
  const steps: CheckoutStep[] = ['details', 'payment', 'confirmation'];
  return steps.indexOf(step) + 1;
}
