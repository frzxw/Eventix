import { Ticket, Tag as TagIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useEffect, useState } from 'react';
import type { Event } from '../../lib/types';
import type { TicketSelection } from './CategorySelector';

interface OrderSummaryProps {
  event: Event;
  selections: TicketSelection[];
  promoCode?: string;
  onPromoCodeApply?: (code: string) => void;
  className?: string;
}

export function OrderSummary({
  event,
  selections,
  promoCode,
  onPromoCodeApply,
  className = '',
}: OrderSummaryProps) {
  const [promoInput, setPromoInput] = useState(promoCode ?? '');
  const [promoApplied, setPromoApplied] = useState(Boolean(promoCode));

  useEffect(() => {
    if (promoCode) {
      setPromoInput(promoCode);
      setPromoApplied(true);
    } else {
      setPromoApplied(false);
    }
  }, [promoCode]);

  const subtotal = selections.reduce(
    (sum, sel) => sum + sel.pricePerTicket * sel.quantity,
    0
  );

  const serviceFee = subtotal * 0.1; // 10% service fee (from PRICING.SERVICE_FEE_PERCENTAGE)
  const processingFee = 5000; // Flat processing fee in IDR (from PRICING.PROCESSING_FEE)
  const taxes = subtotal * 0.11; // 11% PPN tax in Indonesia (from PRICING.TAX_PERCENTAGE)
  const discount = promoApplied ? subtotal * 0.15 : 0; // 15% discount (from PRICING.PROMO_DISCOUNT_PERCENTAGE)
  const total = subtotal + serviceFee + processingFee + taxes - discount;

  const handlePromoApply = () => {
    if (promoInput.trim()) {
      setPromoApplied(true);
      onPromoCodeApply?.(promoInput);
    }
  };

  return (
    <div className={`glass rounded-2xl border border-[var(--border-glass)] p-6 ${className}`}>
      <h2 className="mb-6 flex items-center gap-2" style={{ fontWeight: 'var(--font-weight-medium)' }}>
        <Ticket className="w-5 h-5 text-[var(--primary-500)]" aria-hidden="true" />
        Order Summary
      </h2>

      {/* Event Info */}
      <div className="mb-6 pb-6 border-b border-[var(--border-default)]">
        <p style={{ fontWeight: 'var(--font-weight-medium)' }}>{event.title}</p>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          {new Date(event.date).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          })}{' '}
          • {event.time}
        </p>
        <p className="text-sm text-[var(--text-tertiary)] mt-1">
          {event.venue.name}, {event.venue.city}
        </p>
      </div>

      {/* Ticket Breakdown */}
      <div className="space-y-3 mb-6" role="list" aria-label="Selected tickets">
        {selections.map((selection, index) => (
          <div
            key={index}
            className="flex items-start justify-between text-sm"
            role="listitem"
          >
            <div className="flex-1">
              <p>{selection.displayName}</p>
              <p className="text-[var(--text-tertiary)]">
                {selection.quantity} × IDR {selection.pricePerTicket.toLocaleString('id-ID')}
              </p>
            </div>
            <p style={{ fontWeight: 'var(--font-weight-medium)' }}>
              IDR {(selection.pricePerTicket * selection.quantity).toLocaleString('id-ID')}
            </p>
          </div>
        ))}
      </div>

      {/* Promo Code */}
      <div className="mb-6 pb-6 border-b border-[var(--border-default)]">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <TagIcon
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]"
              aria-hidden="true"
            />
            <Input
              type="text"
              placeholder="Promo code"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value)}
              disabled={promoApplied}
              className="pl-10 glass border-[var(--border-default)] focus-ring"
              aria-label="Promo code input"
            />
          </div>
          <Button
            variant="outline"
            onClick={handlePromoApply}
            disabled={!promoInput.trim() || promoApplied}
            className="glass-hover transition-smooth focus-ring"
          >
            {promoApplied ? 'Applied' : 'Apply'}
          </Button>
        </div>
        {promoApplied && (
          <p className="text-sm text-[var(--success)] mt-2" role="status" aria-live="polite">
            ✓ Promo code applied: 15% off
          </p>
        )}
      </div>

      {/* Price Breakdown */}
      <div className="space-y-3 text-sm mb-6">
        <PriceRow label="Subtotal" value={subtotal} />
        <PriceRow label="Service fee" value={serviceFee} />
        <PriceRow label="Processing fee" value={processingFee} />
        <PriceRow label="Taxes" value={taxes} />
        {discount > 0 && (
          <PriceRow label="Discount" value={-discount} className="text-[var(--success)]" />
        )}
      </div>

      {/* Total */}
      <div className="pt-6 border-t border-[var(--border-default)] flex items-center justify-between">
        <span style={{ fontWeight: 'var(--font-weight-medium)' }}>Total</span>
        <span className="text-2xl" style={{ fontWeight: 'var(--font-weight-medium)' }}>
          IDR {total.toLocaleString('id-ID')}
        </span>
      </div>

      {/* Fee Transparency */}
      <div className="mt-4 p-3 rounded-xl bg-[var(--surface-glass)] border border-[var(--border-default)]">
        <p className="text-xs text-[var(--text-tertiary)]">
          <strong>Fee Transparency:</strong> Service fee covers platform costs, customer support, and secure payment processing. All fees are shown upfront with no hidden charges.
        </p>
      </div>
    </div>
  );
}

interface PriceRowProps {
  label: string;
  value: number;
  className?: string;
}

function PriceRow({ label, value, className = '' }: PriceRowProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <span className="text-[var(--text-secondary)]">{label}</span>
      <span>{value >= 0 ? '' : '-'}IDR {Math.abs(value).toLocaleString('id-ID')}</span>
    </div>
  );
}
