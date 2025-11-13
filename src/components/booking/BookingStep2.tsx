import { useState } from 'react';
import { motion } from 'motion/react';
import { User, Mail, ChevronRight, ChevronLeft, Users, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { PhoneInput } from '../ui/phone-input';
import type { Event } from '../../lib/types';
import type { TicketSelection } from './BookingStep1';
import { formatCurrency } from '../../lib/utils';
import { HoldBadge } from './HoldBadge';

interface BookingStep2Props {
  event: Event;
  selections: TicketSelection[];
  onContinue: (attendeeInfo: AttendeeInfo) => void;
  onBack: () => void;
  holdInfo?: {
    holdId?: string;
    holdExpiresAt?: string;
    onExtend?: () => Promise<void> | void;
    isExtending?: boolean;
  };
}

export interface AttendeeInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  additionalAttendees: {
    firstName: string;
    lastName: string;
  }[];
}

export function BookingStep2({ event, selections, onContinue, onBack, holdInfo }: BookingStep2Props) {
  const totalTickets = selections.reduce((sum, sel) => sum + sel.quantity, 0);
  const totalAmount = selections.reduce((sum, sel) => sum + sel.pricePerTicket * sel.quantity, 0);

  const [formData, setFormData] = useState<AttendeeInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    additionalAttendees: Array(totalTickets - 1).fill({ firstName: '', lastName: '' })
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateForm()) {
      onContinue(formData);
    }
  };

  return (
    <div className="min-h-screen pb-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-8">
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
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[var(--primary-500)] to-[var(--accent-500)] flex items-center justify-center text-white text-sm" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                2
              </div>
              <span className="text-sm" style={{ fontWeight: 'var(--font-weight-medium)' }}>Attendee Details</span>
            </div>
            <div className="h-px flex-1 bg-[var(--border-default)]" />
            <div className="flex items-center gap-2 opacity-40">
              <div className="w-8 h-8 rounded-full border-2 border-[var(--border-default)] flex items-center justify-center text-sm">
                3
              </div>
              <span className="text-sm hidden sm:inline">Payment</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl mb-3" style={{ fontWeight: 'var(--font-weight-medium)' }}>
            Attendee Information
          </h1>
          <p className="text-[var(--text-secondary)] text-lg">
            Please provide details for all attendees
          </p>
          <p className="text-sm text-[var(--text-tertiary)] mt-2">
            Booking for {event.title} at {event.venue.name}, {event.venue.city}
          </p>
          {holdInfo?.holdId && holdInfo.holdExpiresAt && (
            <div className="mt-6">
              <HoldBadge
                holdId={holdInfo.holdId}
                expiresAt={holdInfo.holdExpiresAt}
                onExtend={holdInfo.onExtend}
                isExtending={holdInfo.isExtending}
              />
            </div>
          )}
        </div>

        {/* Order Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass rounded-3xl border border-[var(--border-glass)] p-6 mb-8"
        >
          <h3 className="text-sm uppercase text-[var(--text-tertiary)] tracking-wide mb-4">
            Order Summary
          </h3>
          <div className="space-y-3">
            {selections.map((selection) => (
              <div key={selection.categoryId} className="flex justify-between items-center">
                <div>
                  <p className="text-sm" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                    {selection.displayName}
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    {selection.quantity} × {formatCurrency(selection.pricePerTicket)}
                  </p>
                </div>
                <p className="text-sm" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                  {formatCurrency(selection.pricePerTicket * selection.quantity)}
                </p>
              </div>
            ))}
            <div className="pt-3 border-t border-[var(--border-default)] flex justify-between items-center">
              <p style={{ fontWeight: 'var(--font-weight-medium)' }}>Total</p>
              <p className="text-xl bg-gradient-to-r from-[var(--primary-400)] to-[var(--accent-400)] bg-clip-text text-transparent" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                {formatCurrency(totalAmount)}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Primary Attendee Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="glass rounded-3xl border border-[var(--border-glass)] p-6 sm:p-8 mb-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[var(--primary-500)] to-[var(--accent-500)] flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                Primary Attendee
              </h3>
              <p className="text-sm text-[var(--text-tertiary)]">This is who we&rsquo;ll contact about the order</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="firstName" className="mb-2 flex items-center gap-2">
                First Name <span className="text-[var(--error)]">*</span>
              </Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="John"
                className={`glass-input ${errors.firstName ? 'border-[var(--error)]' : ''}`}
              />
              {errors.firstName && (
                <p className="text-xs text-[var(--error)] mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.firstName}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="lastName" className="mb-2 flex items-center gap-2">
                Last Name <span className="text-[var(--error)]">*</span>
              </Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Doe"
                className={`glass-input ${errors.lastName ? 'border-[var(--error)]' : ''}`}
              />
              {errors.lastName && (
                <p className="text-xs text-[var(--error)] mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.lastName}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="email" className="mb-2 flex items-center gap-2">
                Email Address <span className="text-[var(--error)]">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john.doe@email.com"
                  className={`glass-input pl-10 ${errors.email ? 'border-[var(--error)]' : ''}`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-[var(--error)] mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="phone" className="mb-2 flex items-center gap-2">
                Phone Number <span className="text-[var(--error)]">*</span>
              </Label>
              <PhoneInput
                value={formData.phone}
                onChange={(value) => setFormData({ ...formData, phone: value })}
                className={errors.phone ? 'border-[var(--error)]' : ''}
              />
              {errors.phone && (
                <p className="text-xs text-[var(--error)] mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.phone}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Additional Attendees (if more than 1 ticket) */}
        {totalTickets > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="glass rounded-3xl border border-[var(--border-glass)] p-6 sm:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-[var(--surface-glass)] border border-[var(--border-glass)] flex items-center justify-center">
                <Users className="w-5 h-5 text-[var(--primary-500)]" />
              </div>
              <div>
                <h3 className="text-lg" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                  Additional Attendees
                </h3>
                <p className="text-sm text-[var(--text-tertiary)]">
                  {totalTickets - 1} more {totalTickets - 1 === 1 ? 'person' : 'people'} (Optional)
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {formData.additionalAttendees.map((_, index) => (
                <div key={index} className="p-4 rounded-2xl bg-[var(--surface-glass)] border border-[var(--border-default)]">
                  <p className="text-sm text-[var(--text-tertiary)] mb-3">Attendee {index + 2}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      placeholder="First Name"
                      value={formData.additionalAttendees[index]?.firstName || ''}
                      onChange={(e) => {
                        const newAttendees = [...formData.additionalAttendees];
                        newAttendees[index] = { ...newAttendees[index], firstName: e.target.value };
                        setFormData({ ...formData, additionalAttendees: newAttendees });
                      }}
                      className="glass-input"
                    />
                    <Input
                      placeholder="Last Name"
                      value={formData.additionalAttendees[index]?.lastName || ''}
                      onChange={(e) => {
                        const newAttendees = [...formData.additionalAttendees];
                        newAttendees[index] = { ...newAttendees[index], lastName: e.target.value };
                        setFormData({ ...formData, additionalAttendees: newAttendees });
                      }}
                      className="glass-input"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Fixed Bottom Bar */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-6 left-0 right-0 z-40 px-4 sm:px-6 lg:px-8"
      >
        <div className="container mx-auto max-w-4xl">
          <div className="glass-strong backdrop-blur-2xl border border-[var(--border-glass)] rounded-full shadow-2xl shadow-[var(--primary-500)]/10">
            <div className="px-6 sm:px-8 py-4 sm:py-5">
              <div className="flex items-center justify-between gap-4">
                <Button
                  variant="outline"
                  onClick={onBack}
                  className="glass-hover rounded-full px-6"
                >
                  <ChevronLeft className="w-5 h-5 mr-2" />
                  Back
                </Button>
                
                <Button
                  size="lg"
                  onClick={handleContinue}
                  className="bg-gradient-to-r from-[var(--primary-500)] to-[var(--accent-500)] hover:opacity-90 transition-all duration-300 text-white shadow-xl shadow-[var(--primary-500)]/20 rounded-full px-8"
                >
                  Continue to Payment
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
