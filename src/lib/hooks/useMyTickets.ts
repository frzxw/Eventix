import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { azureApi } from '@/lib/services/azure-api';
import { mockEvents } from '@/lib/mock-data';
import type { Ticket } from '@/lib/types';

type ApiTicket = {
  id: string;
  ticketNumber: string;
  status: string;
  eventId: string;
  orderId: string;
  categoryId?: string | null;
  qrCodeUrl?: string | null;
  qrCodeData?: string | null;
  barcodeData?: string | null;
  createdAt?: string | Date | null;
  event?: {
    id: string;
    title: string;
    date: string | Date;
    venueName?: string | null;
    venueCity?: string | null;
  } | null;
  category?: {
    id: string;
    name?: string | null;
    displayName?: string | null;
  } | null;
  order?: {
    id: string;
    orderNumber?: string | null;
    attendeeFirstName?: string | null;
    attendeeLastName?: string | null;
    attendeeEmail?: string | null;
  } | null;
};

type UseMyTicketsResult = {
  tickets: Ticket[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
};

export function useMyTickets(): UseMyTicketsResult {
  const { isAuthenticated } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    if (!isAuthenticated) {
      setTickets([]);
      setError('Sign in to view your tickets.');
      setIsLoading(false);
      return () => {
        cancelled = true;
      };
    }

    const loadTickets = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await azureApi.getMyTickets();
        if (cancelled) return;

        const payload = Array.isArray(response?.tickets) ? (response.tickets as ApiTicket[]) : [];
        if (payload.length === 0) {
          setTickets([]);
          return;
        }

        const mapped = payload
          .map((ticket) => mapApiTicket(ticket))
          .filter((item): item is Ticket => Boolean(item));

        setTickets(mapped);
      } catch (error) {
        console.error('Failed to load tickets from API', error);
        if (cancelled) return;
        setError('Unable to load tickets right now. Showing sample tickets.');
        setTickets(createMockTickets());
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadTickets();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, refreshToken]);

  const refresh = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  return {
    tickets,
    isLoading,
    error,
    refresh,
  };
}

function mapApiTicket(ticket: ApiTicket): Ticket | null {
  const event = ticket.event ?? null;
  const order = ticket.order ?? null;
  const category = ticket.category ?? null;

  const eventDate = event?.date ? new Date(event.date) : new Date();
  if (Number.isNaN(eventDate.getTime())) {
    return null;
  }

  const eventTime = eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  const venueParts = [event?.venueName, event?.venueCity].filter((part): part is string => Boolean(part));
  const attendeeName = [order?.attendeeFirstName, order?.attendeeLastName]
    .filter((part): part is string => Boolean(part?.trim()))
    .join(' ');

  return {
    id: ticket.id,
    ticketNumber: ticket.ticketNumber,
    orderId: ticket.orderId,
    orderNumber: order?.orderNumber ?? undefined,
    eventId: ticket.eventId,
    eventTitle: event?.title ?? 'Upcoming Event',
    eventDate: eventDate.toISOString(),
    eventTime,
    venue: venueParts.join(', ') || 'Venue TBA',
    category: category?.displayName || category?.name || 'General Admission',
    qrCode: ticket.qrCodeUrl ?? undefined,
    qrCodeUrl: ticket.qrCodeUrl ?? undefined,
    qrCodeData: ticket.qrCodeData ?? undefined,
    barcode: ticket.barcodeData || ticket.ticketNumber || ticket.id,
    customerName: attendeeName || order?.attendeeEmail || 'Ticket Holder',
    status: isTicketStatus(ticket.status),
    createdAt: normaliseCreatedAt(ticket.createdAt),
  };
}

function isTicketStatus(status: string | undefined): Ticket['status'] {
  switch (status) {
    case 'valid':
    case 'used':
    case 'cancelled':
    case 'transferred':
      return status;
    default:
      return 'valid';
  }
}

function normaliseCreatedAt(createdAt: ApiTicket['createdAt']): string | undefined {
  if (!createdAt) return undefined;
  if (typeof createdAt === 'string') return createdAt;
  if (createdAt instanceof Date) return createdAt.toISOString();
  return undefined;
}

function createMockTickets(): Ticket[] {
  const fallbackEvent = mockEvents[0];
  if (!fallbackEvent) {
    return [];
  }

  const dateTime = `${fallbackEvent.date}T${fallbackEvent.time ?? '19:00'}`;
  const parsedDate = new Date(dateTime);

  return [
    {
      id: 'mock-ticket-1',
      ticketNumber: 'TKT-MOCK-1',
      orderId: 'ORD-MOCK-1',
      orderNumber: 'EVX-MOCK-1',
      eventId: fallbackEvent.id,
      eventTitle: fallbackEvent.title,
      eventDate: Number.isNaN(parsedDate.getTime()) ? new Date().toISOString() : parsedDate.toISOString(),
      eventTime: fallbackEvent.time,
      venue: `${fallbackEvent.venue.name}, ${fallbackEvent.venue.city}`,
      category: fallbackEvent.ticketCategories[0]?.displayName ?? 'General Admission',
      qrCode: undefined,
      qrCodeUrl: undefined,
      qrCodeData: undefined,
      barcode: 'MOCKBARCODE1',
      customerName: 'Demo User',
      status: 'valid',
      createdAt: new Date().toISOString(),
    },
  ];
}
