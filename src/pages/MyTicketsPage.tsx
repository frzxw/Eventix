import { motion } from 'motion/react';
import { useLocation } from 'react-router-dom';
import { WalletTicket } from '../components/tickets/WalletTicket';
import { mockEvents } from '../lib/mock-data';
import type { Ticket } from '../lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Ticket as TicketIcon, Clock, CheckCircle2 } from 'lucide-react';

export function MyTicketsPage() {
  const location = useLocation();
  const orderId = location.state?.orderId || 'ORD-1234567890';
  const eventId = location.state?.eventId || 'evt-001';
  
  const event = mockEvents.find((e) => e.id === eventId) || mockEvents[0];

  // Mock tickets for demonstration - mix of upcoming, past, and used
  const mockTickets: Ticket[] = [
    {
      id: 'TKT-2025-001',
      orderId: orderId,
      eventId: event.id,
      eventTitle: event.title,
      eventDate: event.date,
      eventTime: event.time,
      venue: event.venue.name,
      category: 'VIP Package',
      seat: 'A12',
      qrCode: '',
      barcode: 'EVT2025071500001',
      customerName: 'Budi Santoso',
      status: 'valid',
    },
    // You can add more tickets here for demonstration
  ];

  const upcomingTickets = mockTickets.filter(t => {
    const ticketDate = new Date(t.eventDate);
    const today = new Date();
    return ticketDate >= today && t.status === 'valid';
  });

  const pastTickets = mockTickets.filter(t => {
    const ticketDate = new Date(t.eventDate);
    const today = new Date();
    return ticketDate < today || t.status === 'used';
  });

  return (
    <div className="min-h-screen pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl py-8 sm:py-12">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 sm:mb-12"
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl mb-3" style={{ fontWeight: 'var(--font-weight-medium)' }}>
            My Tickets
          </h1>
          <p className="text-[var(--text-secondary)] text-sm sm:text-base max-w-2xl">
            Manage and view all your event tickets in one place
          </p>
        </motion.div>

        {/* Tabs for organizing tickets */}
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

            {/* Upcoming Tickets */}
            <TabsContent value="upcoming" className="mt-0">
              {upcomingTickets.length > 0 ? (
                <div className="space-y-6">
                  {upcomingTickets.map((ticket, index) => (
                    <motion.div
                      key={ticket.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                    >
                      <WalletTicket
                        ticket={ticket}
                        onAddToWallet={() => console.log('Add to wallet', ticket.id)}
                        onAddToCalendar={() => console.log('Add to calendar', ticket.id)}
                        onShare={() => console.log('Share ticket', ticket.id)}
                      />
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
                    You don't have any upcoming events. Explore events and book your next experience!
                  </p>
                  <a
                    href="/discover"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-gradient-to-r from-[var(--primary-500)] to-[var(--accent-500)] text-white hover:opacity-90 transition-all duration-300 shadow-xl shadow-[var(--primary-500)]/20"
                  >
                    Browse Events
                  </a>
                </motion.div>
              )}
            </TabsContent>

            {/* Past Tickets */}
            <TabsContent value="past" className="mt-0">
              {pastTickets.length > 0 ? (
                <div className="space-y-6">
                  {pastTickets.map((ticket, index) => (
                    <motion.div
                      key={ticket.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                      className="opacity-75"
                    >
                      <WalletTicket
                        ticket={ticket}
                        onAddToWallet={() => console.log('Add to wallet', ticket.id)}
                        onAddToCalendar={() => console.log('Add to calendar', ticket.id)}
                        onShare={() => console.log('Share ticket', ticket.id)}
                      />
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
                    Your attended events will appear here
                  </p>
                </motion.div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
