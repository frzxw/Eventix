import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/services/api-client';
import { queryKeys } from '@/lib/queryKeys';
import type { Event } from '@/lib/types';
import { mockEvents } from '@/lib/mock-data';

type EventDetailResponse = {
  event: Event;
  relatedEvents: Event[];
};

interface UseEventResult {
  event: Event | null;
  relatedEvents: Event[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useEvent(eventId?: string): UseEventResult {
  const detailQuery = useQuery<EventDetailResponse>({
    queryKey: queryKeys.events.detail(eventId),
    queryFn: async () => {
      if (!eventId) {
        throw new Error('Event ID is required');
      }
      const response = await apiClient.events.getById(eventId);
      if (!response.data || !response.data.event) {
        throw new Error(response.error ?? 'Event not found');
      }
      return response.data;
    },
    enabled: Boolean(eventId),
    retry: 1,
    placeholderData: (previousData: EventDetailResponse | undefined) => previousData,
  });

  const fallback = useMemo(() => {
    if (!eventId) {
      return null;
    }
    const event = mockEvents.find((item) => item.id === eventId);
    if (!event) {
      return null;
    }
    const related = mockEvents.filter((item) => item.id !== eventId).slice(0, 4);
    return { event, relatedEvents: related };
  }, [eventId]);

  const event = detailQuery.data?.event ?? (detailQuery.isError ? fallback?.event ?? null : null);
  const relatedEvents = detailQuery.data?.relatedEvents ?? (detailQuery.isError ? fallback?.relatedEvents ?? [] : []);

  const error = detailQuery.isError
    ? detailQuery.error instanceof Error
      ? detailQuery.error.message
      : 'Unable to load event.'
    : null;

  return {
    event,
    relatedEvents,
    isLoading: Boolean(eventId) ? detailQuery.isPending : false,
    error,
    refetch: async () => {
      await detailQuery.refetch();
    },
  };
}
