import { useState } from 'react';
import { motion } from 'motion/react';
import { Minus, Plus, Check, AlertCircle, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import type { Event, TicketCategoryInfo } from '../../lib/types';

interface CategorySelectorProps {
  event: Event;
  onContinue?: (selections: TicketSelection[]) => void;
  onBack?: () => void;
}

export interface TicketSelection {
  categoryId: string;
  categoryName: string;
  displayName: string;
  quantity: number;
  pricePerTicket: number;
}

export function CategorySelector({ event, onContinue, onBack }: CategorySelectorProps) {
  const [selections, setSelections] = useState<Map<string, number>>(new Map());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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
    onContinue?.(ticketSelections);
  };

  const totalTickets = Array.from(selections.values()).reduce((sum, qty) => sum + qty, 0);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-8 pb-40">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          className="mb-4 glass-hover transition-smooth focus-ring"
          onClick={onBack}
        >
          ← Back to Event
        </Button>
        <h1 className="text-3xl sm:text-4xl mb-2" style={{ fontWeight: 'var(--font-weight-medium)' }}>
          Select Tickets
        </h1>
        <p className="text-[var(--text-secondary)]">{event.title}</p>
      </div>

      {/* Category Selection */}
      <div className="space-y-4 mb-8" role="radiogroup" aria-label="Ticket categories">
        {event.ticketCategories.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <CategoryOption
              category={category}
              quantity={selections.get(category.id) || 0}
              isSelected={selectedCategory === category.id}
              onSelect={() => setSelectedCategory(category.id)}
              onIncrement={() => updateQuantity(category.id, 1)}
              onDecrement={() => updateQuantity(category.id, -1)}
            />
          </motion.div>
        ))}
      </div>

      {/* Summary & Continue */}
      <div className="fixed bottom-4 left-0 right-0 z-40 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <div className="glass rounded-2xl border border-[var(--border-glass)] p-6 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-[var(--text-tertiary)]">Total Tickets</p>
            <p className="text-2xl" style={{ fontWeight: 'var(--font-weight-medium)' }}>
              {totalTickets}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-[var(--text-tertiary)]">Subtotal</p>
            <p className="text-2xl" style={{ fontWeight: 'var(--font-weight-medium)' }}>
              IDR {calculateSubtotal(event, selections).toLocaleString('id-ID')}
            </p>
          </div>
        </div>
        <Button
          onClick={handleContinue}
          disabled={totalTickets === 0}
          className="w-full h-12 bg-gradient-to-r from-[var(--primary-500)] to-[var(--accent-500)] hover:opacity-90 transition-smooth focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to Checkout
        </Button>
        <p className="text-xs text-[var(--text-tertiary)] text-center mt-3">
          Tickets are held for 10 minutes during checkout
        </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CategoryOptionProps {
  category: TicketCategoryInfo;
  quantity: number;
  isSelected: boolean;
  onSelect: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
}

function CategoryOption({
  category,
  quantity,
  isSelected,
  onSelect,
  onIncrement,
  onDecrement,
}: CategoryOptionProps) {
  const isAvailable = category.status === 'available' || category.status === 'low-stock';
  const isLowStock = category.status === 'low-stock';
  const isSoldOut = category.status === 'sold-out';
  const isWaitlist = category.status === 'waitlist';

  return (
    <motion.div
      role="radio"
      aria-checked={isSelected}
      aria-label={`${category.displayName} - IDR ${category.price.toLocaleString('id-ID')}`}
      tabIndex={isAvailable ? 0 : -1}
      onClick={isAvailable ? onSelect : undefined}
      onKeyDown={(e) => {
        if (isAvailable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onSelect();
        }
      }}
      whileHover={isAvailable ? { scale: 1.02, y: -4 } : {}}
      whileTap={isAvailable ? { scale: 0.98 } : {}}
      transition={{ duration: 0.2 }}
      className={`
        glass rounded-2xl border transition-smooth p-6
        ${isAvailable ? 'cursor-pointer hover:bg-[var(--surface-glass-hover)]' : 'opacity-60 cursor-not-allowed'}
        ${isSelected ? 'border-[var(--primary-500)] bg-[var(--surface-glass-active)] shadow-lg shadow-[var(--primary-500)]/20' : 'border-[var(--border-glass)]'}
        focus-ring
      `}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 style={{ fontWeight: 'var(--font-weight-medium)' }}>
              {category.displayName}
            </h3>
            {isSoldOut && (
              <Badge variant="destructive" className="text-xs">
                Sold Out
              </Badge>
            )}
            {isWaitlist && (
              <Badge className="text-xs bg-[var(--warning-bg)] border-[var(--warning-border)] text-[var(--warning)]">
                <Clock className="w-3 h-3 mr-1" />
                Waitlist
              </Badge>
            )}
            {isLowStock && !isSoldOut && (
              <Badge className="text-xs bg-[var(--warning-bg)] border-[var(--warning-border)] text-[var(--warning)]">
                <AlertCircle className="w-3 h-3 mr-1" />
                Low Stock
              </Badge>
            )}
          </div>
          <p className="text-sm text-[var(--text-tertiary)] mb-3">
            {isAvailable
              ? `${category.available} of ${category.total} available`
              : isSoldOut
              ? 'No tickets available'
              : 'Join waitlist'}
          </p>
          {category.benefits && category.benefits.length > 0 && (
            <ul className="text-sm text-[var(--text-secondary)] space-y-1">
              {category.benefits.map((benefit, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[var(--success)] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="text-right ml-4">
          <p className="text-2xl" style={{ fontWeight: 'var(--font-weight-medium)' }}>
            IDR {category.price.toLocaleString('id-ID')}
          </p>
          <p className="text-sm text-[var(--text-tertiary)]">per ticket</p>
        </div>
      </div>

      {/* Quantity Selector */}
      {isAvailable && (
        <div className="flex items-center justify-between pt-4 border-t border-[var(--border-default)]">
          <span className="text-sm text-[var(--text-secondary)]">Quantity</span>
          <div className="flex items-center gap-3" role="group" aria-label="Ticket quantity">
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDecrement();
              }}
              disabled={quantity === 0}
              className="h-10 w-10 rounded-xl glass-hover transition-smooth focus-ring disabled:opacity-30"
              aria-label="Decrease quantity"
              role="spinbutton"
              aria-valuenow={quantity}
              aria-valuemin={0}
              aria-valuemax={Math.min(category.available, 10)}
            >
              <Minus className="w-4 h-4" aria-hidden="true" />
            </Button>
            <span
              className="w-12 text-center"
              style={{ fontWeight: 'var(--font-weight-medium)' }}
              aria-live="polite"
            >
              {quantity}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onIncrement();
              }}
              disabled={quantity >= Math.min(category.available, 10)}
              className="h-10 w-10 rounded-xl glass-hover transition-smooth focus-ring disabled:opacity-30"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function calculateSubtotal(event: Event, selections: Map<string, number>): number {
  let total = 0;
  selections.forEach((quantity, categoryId) => {
    const category = event.ticketCategories.find((c) => c.id === categoryId);
    if (category) {
      total += category.price * quantity;
    }
  });
  return total;
}
