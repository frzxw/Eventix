import { Calendar, MapPin, Clock, Download, Share2, Smartphone, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import type { Ticket } from '../../lib/types';
import { generateQRCode } from '../../lib/mock-data';

interface WalletTicketProps {
  ticket: Ticket;
  onAddToWallet?: () => void;
  onAddToCalendar?: () => void;
  onShare?: () => void;
}

export function WalletTicket({ ticket, onAddToWallet, onAddToCalendar, onShare }: WalletTicketProps) {
  const qrCode = generateQRCode(ticket.id);
  
  // Parse date for better formatting
  const eventDate = new Date(ticket.eventDate);
  const dayOfWeek = eventDate.toLocaleDateString('en-US', { weekday: 'short' });
  const day = eventDate.getDate();
  const month = eventDate.toLocaleDateString('en-US', { month: 'short' });
  const year = eventDate.getFullYear();
  const fullMonth = eventDate.toLocaleDateString('en-US', { month: 'long' });

  return (
    <article 
      className="glass rounded-3xl border border-[var(--border-glass)] overflow-hidden shadow-2xl shadow-black/10" 
      aria-label={`Ticket for ${ticket.eventTitle}`}
    >
      {/* Header with gradient and Status */}
      <div className="relative bg-gradient-to-br from-[var(--primary-500)] via-[var(--primary-600)] to-[var(--accent-500)] p-6 sm:p-8 overflow-hidden">
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3" />
        </div>

        <div className="relative z-10">
          {/* Status Badge */}
          <div className="flex justify-end mb-4">
            <Badge
              className={`
                ${
                  ticket.status === 'valid'
                    ? 'bg-white/20 border-white/40 text-white backdrop-blur-sm'
                    : ticket.status === 'used'
                    ? 'bg-gray-500/20 border-gray-500/50 text-gray-300'
                    : 'bg-red-500/20 border-red-500/50 text-red-300'
                }
              `}
            >
              {ticket.status.toUpperCase()}
            </Badge>
          </div>

          {/* Event Title */}
          <h2 className="text-2xl sm:text-3xl mb-2 text-white" style={{ fontWeight: 'var(--font-weight-medium)' }}>
            {ticket.eventTitle}
          </h2>
          
          {/* Venue */}
          <div className="flex items-center gap-2 text-white/90 mb-6">
            <MapPin className="w-4 h-4" aria-hidden="true" />
            <span className="text-sm sm:text-base">{ticket.venue}</span>
          </div>

          {/* Date & Time - Modern Visual Cards */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* Date Card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center gap-4">
              {/* Calendar Icon Date */}
              <div className="flex-shrink-0 w-14 h-14 bg-white/20 rounded-xl flex flex-col items-center justify-center border border-white/30">
                <span className="text-[10px] uppercase text-white/80 leading-none mb-0.5">{month}</span>
                <span className="text-2xl text-white leading-none" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                  {day}
                </span>
              </div>
              
              {/* Date Details */}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase text-white/70 tracking-wide mb-0.5">Date</p>
                <p className="text-sm text-white truncate" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                  {dayOfWeek}, {day} {fullMonth}
                </p>
                <p className="text-xs text-white/80">{year}</p>
              </div>
            </div>

            {/* Time Card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center gap-4">
              {/* Clock Icon */}
              <div className="flex-shrink-0 w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center border border-white/30">
                <Clock className="w-7 h-7 text-white" aria-hidden="true" />
              </div>
              
              {/* Time Details */}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase text-white/70 tracking-wide mb-0.5">Time</p>
                <p className="text-lg text-white" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                  {ticket.eventTime}
                </p>
                <p className="text-xs text-white/80">WIB</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Body */}
      <div className="p-6 sm:p-8">
        {/* QR Code Section */}
        <div className="mb-8 flex flex-col items-center">
          <div className="p-6 bg-white rounded-3xl mb-4 shadow-lg">
            <img
              src={qrCode}
              alt={`QR code for ticket ${ticket.id}`}
              className="w-48 h-48 sm:w-56 sm:h-56"
            />
          </div>
          <div className="text-center">
            <p className="text-sm text-[var(--text-secondary)] mb-1">
              Show this QR code at the entrance
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--surface-glass)] border border-[var(--border-default)] mt-2">
              <span className="text-xs text-[var(--text-tertiary)] font-mono">
                {ticket.barcode}
              </span>
            </div>
          </div>
        </div>

        {/* Ticket Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 pb-8 border-b border-[var(--border-default)]">
          <DetailCard label="Ticket ID" value={ticket.id} />
          <DetailCard label="Order ID" value={ticket.orderId} />
          <DetailCard label="Category" value={ticket.category} highlight />
          {ticket.seat && <DetailCard label="Seat" value={ticket.seat} highlight />}
          <DetailCard label="Attendee Name" value={ticket.customerName} className="sm:col-span-2" />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <Button
            variant="outline"
            onClick={onAddToWallet}
            className="glass-hover transition-smooth focus-ring rounded-xl h-12"
          >
            <Smartphone className="w-4 h-4 mr-2" aria-hidden="true" />
            Add to Wallet
          </Button>
          <Button
            variant="outline"
            onClick={onAddToCalendar}
            className="glass-hover transition-smooth focus-ring rounded-xl h-12"
          >
            <Calendar className="w-4 h-4 mr-2" aria-hidden="true" />
            Add to Calendar
          </Button>
          <Button
            variant="outline"
            onClick={onShare}
            className="glass-hover transition-smooth focus-ring rounded-xl h-12"
          >
            <Share2 className="w-4 h-4 mr-2" aria-hidden="true" />
            Share
          </Button>
        </div>

        {/* Important Info */}
        <div className="p-5 rounded-2xl bg-[var(--surface-glass)] border border-[var(--border-default)]">
          <h3 className="text-sm mb-3 flex items-center gap-2" style={{ fontWeight: 'var(--font-weight-medium)' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary-500)]" />
            Important Information
          </h3>
          <ul className="text-xs text-[var(--text-secondary)] space-y-2">
            <li className="flex items-start gap-2">
              <ChevronRight className="w-3 h-3 mt-0.5 text-[var(--primary-500)] flex-shrink-0" />
              <span>Arrive 30 minutes before event start time</span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="w-3 h-3 mt-0.5 text-[var(--primary-500)] flex-shrink-0" />
              <span>Valid photo ID required for entry</span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="w-3 h-3 mt-0.5 text-[var(--primary-500)] flex-shrink-0" />
              <span>Screenshot or printed ticket accepted</span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="w-3 h-3 mt-0.5 text-[var(--primary-500)] flex-shrink-0" />
              <span>No refunds or exchanges permitted</span>
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="w-3 h-3 mt-0.5 text-[var(--primary-500)] flex-shrink-0" />
              <span>This ticket is non-transferable</span>
            </li>
          </ul>
        </div>

        {/* Support */}
        <div className="mt-6 text-center">
          <p className="text-xs text-[var(--text-tertiary)]">
            Need help? Contact support at{' '}
            <a 
              href="mailto:support@eventix.id" 
              className="text-[var(--primary-500)] hover:text-[var(--primary-400)] transition-smooth underline decoration-dotted underline-offset-2 focus-ring rounded"
            >
              support@eventix.id
            </a>
          </p>
        </div>
      </div>
    </article>
  );
}

interface DetailCardProps {
  label: string;
  value: string;
  highlight?: boolean;
  className?: string;
}

function DetailCard({ label, value, highlight = false, className = '' }: DetailCardProps) {
  return (
    <div className={`p-4 rounded-xl ${highlight ? 'bg-[var(--surface-glass)] border border-[var(--border-default)]' : 'bg-transparent'} ${className}`}>
      <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide mb-1.5">
        {label}
      </p>
      <p className={`${highlight ? 'text-base' : 'text-sm'} text-[var(--text-primary)]`} style={{ fontWeight: 'var(--font-weight-medium)' }}>
        {value}
      </p>
    </div>
  );
}
