import { motion } from 'motion/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { Ticket as TicketIcon, Clock, CheckCircle2, RefreshCcw, AlertCircle } from 'lucide-react';
import { WalletTicket } from '../components/tickets/WalletTicket';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { useMyTickets } from '../lib/hooks/useMyTickets';
import { useAuth } from '../context/AuthContext';
import { StatusNotice } from '../components/common/StatusNotice';
import { TicketListSkeleton } from '../components/loading';

export function MyTicketsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { tickets, isLoading, error, refresh } = useMyTickets();
  const highlightedOrderId = location.state?.orderId as string | undefined;

  const upcomingTickets = useMemo(() => {
    const now = Date.now();
    return tickets.filter((ticket) => {
      const eventTime = new Date(ticket.eventDate).getTime();
      if (Number.isNaN(eventTime)) {
        return false;
      }
      const isFuture = eventTime >= now;
      return isFuture && ticket.status === 'valid';
    });
  }, [tickets]);

  const pastTickets = useMemo(() => {
    const now = Date.now();
    return tickets.filter((ticket) => {
      const eventTime = new Date(ticket.eventDate).getTime();
      if (Number.isNaN(eventTime)) {
        return true;
      }
      const isPast = eventTime < now;
      const isInactive = ticket.status === 'used' || ticket.status === 'cancelled' || ticket.status === 'transferred';
      return isPast || isInactive;
    });
  }, [tickets]);

  const upcomingContent = (
    <>
      {upcomingTickets.length > 0 ? (
        <div className="space-y-6">
          {upcomingTickets.map((ticket, index) => (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + index * 0.08 }}
            >
              <WalletTicket ticket={ticket} />
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="glass rounded-3xl border border-[var(--border-glass)] p-12 text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--surface-glass)] flex items-center justify-center">
            <TicketIcon className="w-10 h-10 text-[var(--text-tertiary)]" />
          </div>
          <h3 className="text-xl mb-2" style={{ fontWeight: 'var(--font-weight-medium)' }}>
            No Upcoming Events
          </h3>
          <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
            You don&rsquo;t have any upcoming events. Explore events and book your next experience!
          </p>
          <Button
            onClick={() => navigate('/discover')}
            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-gradient-to-r from-[var(--primary-500)] to-[var(--accent-500)] text-white hover:opacity-90 transition-all duration-300 shadow-xl shadow-[var(--primary-500)]/20"
          >
            Browse Events
          </Button>
        </motion.div>
      )}
    </>
  );

  const pastContent = (
    <>
      {pastTickets.length > 0 ? (
        <div className="space-y-6">
          {pastTickets.map((ticket, index) => (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + index * 0.08 }}
              className="opacity-75"
            >
              <WalletTicket ticket={ticket} />
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="glass rounded-3xl border border-[var(--border-glass)] p-12 text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--surface-glass)] flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-[var(--text-tertiary)]" />
          </div>
          <h3 className="text-xl mb-2" style={{ fontWeight: 'var(--font-weight-medium)' }}>
            No Past Events
          </h3>
          <p className="text-[var(--text-secondary)] max-w-md mx-auto">
            Your attended events will appear here.
          </p>
        </motion.div>
      )}
    </>
  );

  return (
    <div className="min-h-screen pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 sm:mb-12"
        >
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl mb-3" style={{ fontWeight: 'var(--font-weight-medium)' }}>
              My Tickets
            </h1>
            <p className="text-[var(--text-secondary)] text-sm sm:text-base max-w-2xl">
              Manage and view all your event tickets in one place.
            </p>
            {highlightedOrderId && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-xs text-[var(--primary-400)] mt-2"
              >
                Order {highlightedOrderId} has been added to your wallet.
              </motion.p>
            )}
          </div>
        </motion.div>

        {isAuthenticated && !isLoading && error && (
          <div className="mb-8">
            <StatusNotice
              icon={AlertCircle}
              tone="error"
              title="We couldn’t refresh your tickets"
              description={error}
              actionLabel="Try Again"
              onAction={refresh}
              actionDisabled={isLoading}
            />
          </div>
        )}

        {!isAuthenticated ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="glass rounded-3xl border border-[var(--border-glass)] p-12 text-center"
          >
            <h3 className="text-xl mb-2" style={{ fontWeight: 'var(--font-weight-medium)' }}>
              Sign in to view your tickets
            </h3>
            <p className="text-[var(--text-secondary)] max-w-md mx-auto mb-6">
              Log in with your Eventix account to access your upcoming and past tickets.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center justify-center">
              <Button onClick={() => navigate('/auth/login')} className="rounded-full px-6" size="lg">
                Go to Login
              </Button>
              <Button
                variant="outline"
                className="rounded-full px-6"
                size="lg"
                onClick={refresh}
                disabled={isLoading}
              >
                <RefreshCcw className="mr-2 h-4 w-4" aria-hidden="true" />
                Refresh
              </Button>
            </div>
          </motion.div>
        ) : isLoading ? (
          <TicketListSkeleton items={3} />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Tabs defaultValue="upcoming" className="w-full">
              <TabsList className="glass border border-[var(--border-glass)] p-1 rounded-full mb-8 w-full sm:w-auto">
                <TabsTrigger
                  value="upcoming"
                  className="rounded-full data-[state=active]:bg-[var(--surface-glass-active)] data-[state=active]:border data-[state=active]:border-[var(--border-glass)] transition-all duration-300 px-6"
                >
                  <TicketIcon className="w-4 h-4 mr-2" />
                  Upcoming
                  {upcomingTickets.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-[var(--primary-500)] text-white text-xs">
                      {upcomingTickets.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="past"
                  className="rounded-full data-[state=active]:bg-[var(--surface-glass-active)] data-[state=active]:border data-[state=active]:border-[var(--border-glass)] transition-all duration-300 px-6"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Past Events
                  {pastTickets.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-[var(--text-tertiary)] text-white text-xs">
                      {pastTickets.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="mt-0">
                {upcomingContent}
              </TabsContent>

              <TabsContent value="past" className="mt-0">
                {pastContent}
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </div>
    </div>
  );
}
