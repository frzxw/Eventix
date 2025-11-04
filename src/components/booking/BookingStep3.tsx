import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  CreditCard, 
  Building2, 
  Smartphone, 
  ChevronLeft, 
  Check,
  Calendar,
  MapPin,
  Users,
  Shield,
  Lock,
  AlertCircle
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Checkbox } from '../ui/checkbox';
import type { Event } from '../../lib/types';
import type { TicketSelection } from './BookingStep1';
import type { AttendeeInfo } from './BookingStep2';
import { formatCurrency } from '../../lib/utils';
import { toast } from 'sonner@2.0.3';

interface BookingStep3Props {
  event: Event;
  selections: TicketSelection[];
  attendeeInfo: AttendeeInfo;
  onComplete: (orderId: string) => void;
  onBack: () => void;
}

type PaymentMethod = 'credit-card' | 'bank-transfer' | 'e-wallet';

export function BookingStep3({ event, selections, attendeeInfo, onComplete, onBack }: BookingStep3Props) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit-card');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const totalTickets = selections.reduce((sum, sel) => sum + sel.quantity, 0);
  const subtotal = selections.reduce((sum, sel) => sum + sel.pricePerTicket * sel.quantity, 0);
  const serviceFee = subtotal * 0.05; // 5% service fee
  const total = subtotal + serviceFee;

  const handlePayment = async () => {
    if (!agreedToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      const orderId = `ORD-${Date.now()}`;
      toast.success('Payment successful! Redirecting to your tickets...');
      onComplete(orderId);
    }, 2000);
  };

  return (
    <div className="min-h-screen pb-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="mb-6 glass-hover transition-smooth focus-ring rounded-full px-4"
            onClick={onBack}
          >
            ← Back
          </Button>
          
          {/* Progress Indicator */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2 opacity-60">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[var(--primary-500)] to-[var(--accent-500)] flex items-center justify-center text-white text-sm">
                ✓
              </div>
              <span className="text-sm hidden sm:inline">Tickets</span>
            </div>
            <div className="h-px flex-1 bg-[var(--border-default)]" />
            <div className="flex items-center gap-2 opacity-60">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[var(--primary-500)] to-[var(--accent-500)] flex items-center justify-center text-white text-sm">
                ✓
              </div>
              <span className="text-sm hidden sm:inline">Details</span>
            </div>
            <div className="h-px flex-1 bg-[var(--border-default)]" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[var(--primary-500)] to-[var(--accent-500)] flex items-center justify-center text-white text-sm" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                3
              </div>
              <span className="text-sm" style={{ fontWeight: 'var(--font-weight-medium)' }}>Payment</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl mb-3" style={{ fontWeight: 'var(--font-weight-medium)' }}>
            Complete Your Purchase
          </h1>
          <p className="text-[var(--text-secondary)] text-lg">
            Choose your payment method and confirm your order
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Methods */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Method Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="glass rounded-3xl border border-[var(--border-glass)] p-6 sm:p-8"
            >
              <h3 className="text-xl mb-6" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                Payment Method
              </h3>

              <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
                <div className="space-y-3">
                  <PaymentMethodOption
                    value="credit-card"
                    icon={<CreditCard className="w-5 h-5" />}
                    title="Credit/Debit Card"
                    description="Visa, Mastercard, American Express"
                    selected={paymentMethod === 'credit-card'}
                  />
                  <PaymentMethodOption
                    value="bank-transfer"
                    icon={<Building2 className="w-5 h-5" />}
                    title="Bank Transfer"
                    description="Transfer via ATM, mobile banking, or internet banking"
                    selected={paymentMethod === 'bank-transfer'}
                  />
                  <PaymentMethodOption
                    value="e-wallet"
                    icon={<Smartphone className="w-5 h-5" />}
                    title="E-Wallet"
                    description="GoPay, OVO, DANA, LinkAja"
                    selected={paymentMethod === 'e-wallet'}
                  />
                </div>
              </RadioGroup>
            </motion.div>

            {/* Payment Details based on method */}
            {paymentMethod === 'credit-card' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="glass rounded-3xl border border-[var(--border-glass)] p-6 sm:p-8"
              >
                <h3 className="text-xl mb-6" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                  Card Details
                </h3>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="cardNumber" className="mb-2">Card Number</Label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        className="glass-input pl-10"
                        maxLength={19}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry" className="mb-2">Expiry Date</Label>
                      <Input
                        id="expiry"
                        placeholder="MM/YY"
                        className="glass-input"
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv" className="mb-2">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        type="password"
                        className="glass-input"
                        maxLength={4}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="cardName" className="mb-2">Cardholder Name</Label>
                    <Input
                      id="cardName"
                      placeholder="John Doe"
                      className="glass-input"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {paymentMethod === 'bank-transfer' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="glass rounded-3xl border border-[var(--border-glass)] p-6 sm:p-8"
              >
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-[var(--warning-bg)] border border-[var(--warning-border)] text-[var(--warning)]">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p style={{ fontWeight: 'var(--font-weight-medium)' }} className="mb-1">
                      Payment Instructions
                    </p>
                    <p className="text-[var(--text-secondary)]">
                      After clicking "Confirm Payment", you'll receive bank account details via email. 
                      Please complete the transfer within 24 hours to secure your tickets.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {paymentMethod === 'e-wallet' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="glass rounded-3xl border border-[var(--border-glass)] p-6 sm:p-8"
              >
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {['GoPay', 'OVO', 'DANA', 'LinkAja'].map((wallet) => (
                    <button
                      key={wallet}
                      className="p-4 rounded-2xl glass border border-[var(--border-glass)] hover:border-[var(--primary-500)]/30 hover:bg-[var(--surface-glass-hover)] transition-smooth text-center"
                    >
                      <p className="text-sm" style={{ fontWeight: 'var(--font-weight-medium)' }}>{wallet}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Terms and Conditions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex items-start gap-3"
            >
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                className="mt-1"
              />
              <Label htmlFor="terms" className="text-sm text-[var(--text-secondary)] cursor-pointer">
                I agree to the{' '}
                <a href="#" className="text-[var(--primary-500)] hover:text-[var(--primary-400)] transition-smooth underline">
                  Terms and Conditions
                </a>{' '}
                and{' '}
                <a href="#" className="text-[var(--primary-500)] hover:text-[var(--primary-400)] transition-smooth underline">
                  Privacy Policy
                </a>
              </Label>
            </motion.div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="glass rounded-3xl border border-[var(--border-glass)] p-6 sticky top-24"
            >
              <h3 className="text-lg mb-6" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                Order Summary
              </h3>

              {/* Event Info */}
              <div className="mb-6 pb-6 border-b border-[var(--border-default)]">
                <p className="text-sm text-[var(--text-tertiary)] uppercase tracking-wide mb-2">Event</p>
                <h4 className="mb-3" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                  {event.title}
                </h4>
                <div className="space-y-2 text-sm text-[var(--text-secondary)]">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(event.date).toLocaleDateString('en-US', { 
                        weekday: 'short',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{event.venue.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{totalTickets} {totalTickets === 1 ? 'Ticket' : 'Tickets'}</span>
                  </div>
                </div>
              </div>

              {/* Ticket Breakdown */}
              <div className="space-y-3 mb-6 pb-6 border-b border-[var(--border-default)]">
                {selections.map((selection) => (
                  <div key={selection.categoryId} className="flex justify-between items-start text-sm">
                    <div className="flex-1">
                      <p style={{ fontWeight: 'var(--font-weight-medium)' }}>
                        {selection.displayName}
                      </p>
                      <p className="text-xs text-[var(--text-tertiary)]">
                        {selection.quantity} × {formatCurrency(selection.pricePerTicket)}
                      </p>
                    </div>
                    <p style={{ fontWeight: 'var(--font-weight-medium)' }}>
                      {formatCurrency(selection.pricePerTicket * selection.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Service Fee</span>
                  <span>{formatCurrency(serviceFee)}</span>
                </div>
              </div>

              {/* Total */}
              <div className="pt-4 border-t border-[var(--border-default)] mb-6">
                <div className="flex justify-between items-center">
                  <span style={{ fontWeight: 'var(--font-weight-medium)' }}>Total</span>
                  <span className="text-2xl bg-gradient-to-r from-[var(--primary-400)] to-[var(--accent-400)] bg-clip-text text-transparent" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>

              {/* Security Badge */}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--surface-glass)] border border-[var(--border-default)] text-sm text-[var(--text-secondary)]">
                <Shield className="w-4 h-4 text-[var(--success)]" />
                <span>Secure SSL encrypted payment</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-6 left-0 right-0 z-40 px-4 sm:px-6 lg:px-8"
      >
        <div className="container mx-auto max-w-6xl">
          <div className="glass-strong backdrop-blur-2xl border border-[var(--border-glass)] rounded-full shadow-2xl shadow-[var(--primary-500)]/10">
            <div className="px-6 sm:px-8 py-4 sm:py-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <Button
                  variant="outline"
                  onClick={onBack}
                  disabled={isProcessing}
                  className="glass-hover rounded-full px-6"
                >
                  <ChevronLeft className="w-5 h-5 mr-2" />
                  Back
                </Button>
                
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="hidden sm:block text-right">
                    <p className="text-xs text-[var(--text-tertiary)]">Total Amount</p>
                    <p className="text-xl" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                      {formatCurrency(total)}
                    </p>
                  </div>
                  
                  <Button
                    size="lg"
                    onClick={handlePayment}
                    disabled={!agreedToTerms || isProcessing}
                    className="w-full sm:w-auto bg-gradient-to-r from-[var(--primary-500)] to-[var(--accent-500)] hover:opacity-90 transition-all duration-300 text-white shadow-xl shadow-[var(--primary-500)]/20 rounded-full px-8 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5 mr-2" />
                        Confirm Payment
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

interface PaymentMethodOptionProps {
  value: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  selected: boolean;
}

function PaymentMethodOption({ value, icon, title, description, selected }: PaymentMethodOptionProps) {
  return (
    <label
      className={`
        flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300
        ${selected 
          ? 'border-[var(--primary-500)] bg-[var(--primary-500)]/5' 
          : 'border-[var(--border-glass)] hover:border-[var(--border-glass-hover)] hover:bg-[var(--surface-glass-hover)]'
        }
      `}
    >
      <RadioGroupItem value={value} className="flex-shrink-0" />
      <div className="flex items-center gap-3 flex-1">
        <div className={`
          w-10 h-10 rounded-xl flex items-center justify-center
          ${selected ? 'bg-[var(--primary-500)] text-white' : 'bg-[var(--surface-glass)] text-[var(--text-secondary)]'}
        `}>
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-sm" style={{ fontWeight: 'var(--font-weight-medium)' }}>
            {title}
          </p>
          <p className="text-xs text-[var(--text-tertiary)]">
            {description}
          </p>
        </div>
      </div>
      {selected && (
        <Check className="w-5 h-5 text-[var(--primary-500)] flex-shrink-0" />
      )}
    </label>
  );
}
