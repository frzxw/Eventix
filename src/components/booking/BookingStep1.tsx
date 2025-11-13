import { useState } from 'react';
import { motion } from 'motion/react';
import { Minus, Plus, Check, AlertCircle, Users, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import type { Event, TicketCategoryInfo } from '../../lib/types';
import { formatCurrency } from '../../lib/utils';

interface BookingStep1Props {
  event: Event;
  onContinue: (selections: TicketSelection[]) => void;
  onBack: () => void;
  isProcessing?: boolean;
  errorMessage?: string;
}

export interface TicketSelection {
  categoryId: string;
  categoryName: string;
  displayName: string;
  quantity: number;
  pricePerTicket: number;
}

export function BookingStep1({ event, onContinue, onBack, isProcessing, errorMessage }: BookingStep1Props) {
  const [selections, setSelections] = useState<Map<string, number>>(new Map());

  const updateQuantity = (categoryId: string, delta: number) => {
    const category = event.ticketCategories.find((c) => c.id === categoryId);
    if (!category) return;

    const currentQty = selections.get(categoryId) || 0;
    const newQty = Math.max(0, Math.min(currentQty + delta, Math.min(category.available, 10)));

    const newSelections = new Map(selections);
    if (newQty === 0) {
      newSelections.delete(categoryId);
    } else {
      newSelections.set(categoryId, newQty);
    }
    setSelections(newSelections);
  };

  const handleContinue = () => {
    const ticketSelections: TicketSelection[] = [];
    selections.forEach((quantity, categoryId) => {
      const category = event.ticketCategories.find((c) => c.id === categoryId);
      if (category && quantity > 0) {
        ticketSelections.push({
          categoryId,
          categoryName: category.name,
          displayName: category.displayName,
          quantity,
          pricePerTicket: category.price,
        });
      }
    });
    if (ticketSelections.length === 0) {
      return;
    }
    onContinue(ticketSelections);
  };

  const totalTickets = Array.from(selections.values()).reduce((sum, qty) => sum + qty, 0);
  const totalAmount = Array.from(selections.entries()).reduce((sum, [categoryId, quantity]) => {
    const category = event.ticketCategories.find((c) => c.id === categoryId);
    return sum + (category ? category.price * quantity : 0);
  }, 0);

  return (
    <div className="min-h-screen pb-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="mb-6 glass-hover transition-smooth focus-ring rounded-full px-4"
            onClick={onBack}
          >
            ← Back to Event
          </Button>
          
          {/* Progress Indicator */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[var(--primary-500)] to-[var(--accent-500)] flex items-center justify-center text-white text-sm" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                1
              </div>
              <span className="text-sm" style={{ fontWeight: 'var(--font-weight-medium)' }}>Select Tickets</span>
            </div>
            <div className="h-px flex-1 bg-[var(--border-default)]" />
            <div className="flex items-center gap-2 opacity-40">
              <div className="w-8 h-8 rounded-full border-2 border-[var(--border-default)] flex items-center justify-center text-sm">
                2
              </div>
              <span className="text-sm hidden sm:inline">Details</span>
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
            Choose Your Experience
          </h1>
          <p className="text-[var(--text-secondary)] text-lg">{event.title}</p>
        </div>

        {/* Ticket Categories */}
        <div className="grid gap-6 mb-8">
          {event.ticketCategories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <TicketCategoryCard
                category={category}
                quantity={selections.get(category.id) || 0}
                onIncrement={() => updateQuantity(category.id, 1)}
                onDecrement={() => updateQuantity(category.id, -1)}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      {totalTickets > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-0 right-0 z-40 px-4 sm:px-6 lg:px-8"
        >
          <div className="container mx-auto max-w-5xl">
            <div className="glass-strong backdrop-blur-2xl border border-[var(--border-glass)] rounded-full shadow-2xl shadow-[var(--primary-500)]/10">
              <div className="px-6 sm:px-8 py-4 sm:py-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide mb-1">
                        Total Tickets
                      </p>
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-[var(--primary-500)]" />
                        <span className="text-2xl" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                          {totalTickets}
                        </span>
                      </div>
                    </div>
                    <div className="h-12 w-px bg-[var(--border-default)]" />
                    <div>
                      <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide mb-1">
                        Total Amount
                      </p>
                      <p className="text-2xl bg-gradient-to-r from-[var(--primary-400)] to-[var(--accent-400)] bg-clip-text text-transparent" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                        {formatCurrency(totalAmount)}
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    size="lg"
                    onClick={handleContinue}
                    disabled={Boolean(isProcessing)}
                    className="w-full sm:w-auto bg-gradient-to-r from-[var(--primary-500)] to-[var(--accent-500)] hover:opacity-90 transition-all duration-300 text-white shadow-xl shadow-[var(--primary-500)]/20 rounded-full px-8"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" aria-hidden="true" />
                        Securing hold...
                      </>
                    ) : (
                      <>
                        Continue to Details
                        <ChevronRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
                {errorMessage && (
                  <p className="mt-3 text-xs text-[var(--error)]" aria-live="polite">
                    {errorMessage}
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

interface TicketCategoryCardProps {
  category: TicketCategoryInfo;
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

function TicketCategoryCard({ category, quantity, onIncrement, onDecrement }: TicketCategoryCardProps) {
  const isAvailable = category.status === 'available' || category.status === 'low-stock';
  const isSoldOut = category.status === 'sold-out';
  const isLowStock = category.status === 'low-stock';
  const stockPercentage = (category.available / category.total) * 100;

  return (
    <div 
      className={`
        glass rounded-3xl border transition-all duration-300 relative
        ${quantity > 0 
          ? 'border-[var(--primary-500)]/50 shadow-xl shadow-[var(--primary-500)]/10' 
          : 'border-[var(--border-glass)]'
        }
        ${isSoldOut ? 'opacity-60' : ''}
      `}
    >
      {/* Status Badge - Positioned Absolutely */}
      <div className="absolute top-6 right-6 z-10">
        {isSoldOut ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Badge variant="secondary" className="bg-[var(--error-bg)] text-[var(--error)] border-[var(--error-border)] px-4 py-2 text-sm">
              Sold Out
            </Badge>
          </motion.div>
        ) : isLowStock ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
            }}
            transition={{ duration: 0.3 }}
          >
            <Badge 
              variant="secondary" 
              className="bg-[var(--warning-bg)] text-[var(--warning)] border-[var(--warning-border)] flex items-center gap-2 px-4 py-2 text-sm animate-neon-glow"
            >
              <AlertCircle className="w-4 h-4" />
              Selling Out
            </Badge>
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Badge 
              variant="secondary" 
              className="bg-[var(--success-bg)] text-[var(--success)] border-[var(--success-border)] px-4 py-2 text-sm shadow-lg shadow-[var(--success)]/20"
              style={{
                boxShadow: '0 0 15px rgba(34, 197, 94, 0.2)'
              }}
            >
              Available
            </Badge>
          </motion.div>
        )}
      </div>

      <div className="p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Category Info */}
          <div className="flex-1">
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-2xl sm:text-3xl" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                  {category.displayName}
                </h3>
                {category.name === 'VVIP' && (
                  <Sparkles className="w-5 h-5 text-[var(--accent-500)]" />
                )}
              </div>
              <p className="text-3xl sm:text-4xl bg-gradient-to-r from-[var(--primary-400)] to-[var(--accent-400)] bg-clip-text text-transparent" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                {formatCurrency(category.price)}
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-2 mb-4">
              {category.benefits?.map((benefit, index) => (
                <div key={index} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                  <Check className="w-4 h-4 text-[var(--primary-500)] mt-0.5 flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            {/* Stock Progress Bar */}
            {isAvailable && (
              <div className="mt-4">
                <div className="h-2 bg-[var(--surface-glass)] rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${100 - stockPercentage}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full ${
                      stockPercentage < 20 
                        ? 'bg-gradient-to-r from-red-500 to-orange-500' 
                        : stockPercentage < 50
                        ? 'bg-gradient-to-r from-orange-500 to-yellow-500'
                        : 'bg-gradient-to-r from-[var(--primary-500)] to-[var(--accent-500)]'
                    }`}
                  />
                </div>
                <p className="text-xs text-[var(--text-tertiary)] mt-2">
                  {category.available.toLocaleString()} of {category.total.toLocaleString()} tickets available
                </p>
              </div>
            )}
          </div>

          {/* Quantity Selector */}
          <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-4">
            {isAvailable ? (
              <>
                <div className="flex items-center gap-3 glass rounded-full p-2 border border-[var(--border-glass)]">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={onDecrement}
                    disabled={quantity === 0}
                    className="rounded-full h-10 w-10 hover:bg-[var(--surface-glass-hover)] disabled:opacity-30"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="text-xl w-12 text-center" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                    {quantity}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={onIncrement}
                    disabled={quantity >= Math.min(category.available, 10)}
                    className="rounded-full h-10 w-10 hover:bg-[var(--surface-glass-hover)] disabled:opacity-30"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {quantity > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="px-4 py-2 rounded-full bg-[var(--success-bg)] border border-[var(--success-border)] text-[var(--success)] text-sm flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span style={{ fontWeight: 'var(--font-weight-medium)' }}>
                      {formatCurrency(category.price * quantity)}
                    </span>
                  </motion.div>
                )}
              </>
            ) : (
              <div className="text-center text-[var(--text-tertiary)]">
                <p className="text-sm">Not Available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
