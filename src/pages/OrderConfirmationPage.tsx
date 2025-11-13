import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle2, Download, Mail, Calendar, MapPin, Ticket, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface OrderDetails {
  orderId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  venueName: string;
  venueCity: string;
  tickets: Array<{
    category: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  email: string;
  confirmationSentAt: string;
}

export function OrderConfirmationPage() {
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);

  useEffect(() => {
    // In a real app, this would fetch order details from the backend
    // For now, we'll get it from localStorage or URL params
    const storedOrder = localStorage.getItem('lastOrder');
    if (storedOrder) {
      setOrderDetails(JSON.parse(storedOrder));
    } else {
      // If no order found, redirect to home after 2 seconds
      const timeout = setTimeout(() => {
        navigate('/');
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [navigate]);

  if (!orderDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass rounded-3xl border border-[var(--border-glass)] px-10 py-12 text-center">
          <LoadingSpinner size="lg" message="Finalizing your confirmation" />
        </div>
      </div>
    );
  }

  const handleDownloadTickets = () => {
    // In a real app, this would download the PDF tickets
    console.log('Downloading tickets for order:', orderDetails.orderId);
    navigate('/my-tickets');
  };

  const handleViewTickets = () => {
    navigate('/my-tickets');
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 mb-6"
          >
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </motion.div>
          <h1 className="mb-3">Order Confirmed!</h1>
          <p className="text-[var(--text-secondary)]">
            Your tickets have been confirmed and sent to your email
          </p>
        </motion.div>

        {/* Order Details Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="relative rounded-3xl overflow-hidden mb-6"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--surface-glass)]/80 to-[var(--surface-glass)]/40 backdrop-blur-xl border border-[var(--border-glass)]" />
          <div className="relative p-8">
            {/* Order ID */}
            <div className="mb-6 pb-6 border-b border-[var(--border-default)]">
              <p className="text-sm text-[var(--text-tertiary)] mb-1">Order ID</p>
              <p style={{ fontWeight: 'var(--font-weight-semibold)' }} className="text-[var(--primary-400)]">
                {orderDetails.orderId}
              </p>
            </div>

            {/* Event Details */}
            <div className="mb-6 pb-6 border-b border-[var(--border-default)]">
              <h2 className="mb-4">Event Details</h2>
              <p style={{ fontWeight: 'var(--font-weight-medium)' }} className="mb-3">
                {orderDetails.eventTitle}
              </p>
              <div className="space-y-2 text-sm text-[var(--text-secondary)]">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(orderDetails.eventDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}{' '}
                    at {orderDetails.eventTime}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {orderDetails.venueName}, {orderDetails.venueCity}
                  </span>
                </div>
              </div>
            </div>

            {/* Tickets */}
            <div className="mb-6 pb-6 border-b border-[var(--border-default)]">
              <h3 className="mb-4">Your Tickets</h3>
              <div className="space-y-3">
                {orderDetails.tickets.map((ticket, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-xl bg-[var(--surface-glass)]/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--primary-500)]/20 to-[var(--primary-600)]/20 border border-[var(--primary-500)]/30 flex items-center justify-center">
                        <Ticket className="w-5 h-5 text-[var(--primary-400)]" />
                      </div>
                      <div>
                        <p style={{ fontWeight: 'var(--font-weight-medium)' }}>{ticket.category}</p>
                        <p className="text-sm text-[var(--text-secondary)]">Quantity: {ticket.quantity}</p>
                      </div>
                    </div>
                    <p style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                      Rp {(ticket.price * ticket.quantity).toLocaleString('id-ID')}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between">
              <p style={{ fontWeight: 'var(--font-weight-semibold)' }}>Total Paid</p>
              <p style={{ fontWeight: 'var(--font-weight-bold)' }} className="text-[var(--primary-400)]">
                Rp {orderDetails.totalAmount.toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Email Confirmation Notice */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="relative rounded-2xl overflow-hidden mb-6"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20" />
          <div className="relative p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <p style={{ fontWeight: 'var(--font-weight-medium)' }} className="mb-1">
                Confirmation Email Sent
              </p>
              <p className="text-sm text-[var(--text-secondary)]">
                A confirmation email with your tickets has been sent to{' '}
                <span className="text-[var(--text-primary)]">{orderDetails.email}</span>. Please check your
                inbox and spam folder.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button
            onClick={handleViewTickets}
            className="flex-1 h-12 bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)] hover:from-[var(--primary-600)] hover:to-[var(--primary-700)] text-white"
          >
            <Ticket className="w-5 h-5 mr-2" />
            View My Tickets
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button
            onClick={handleDownloadTickets}
            variant="outline"
            className="flex-1 h-12 border-[var(--border-default)] hover:bg-[var(--surface-glass)]/50"
          >
            <Download className="w-5 h-5 mr-2" />
            Download Tickets
          </Button>
        </motion.div>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-center mt-8"
        >
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            Back to Home
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
