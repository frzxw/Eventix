import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/services/api-client';
import { queryKeys } from '@/lib/queryKeys';
import type { Event } from '@/lib/types';
import { mockEvents } from '@/lib/mock-data';
import type { EventsListResponse } from './useEvents';

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

const EVENT_DETAIL_STALE_TIME = 1000 * 60 * 5;
const EVENT_DETAIL_GC_TIME = 1000 * 60 * 15;

export function useEvent(eventId?: string): UseEventResult {
  const queryClient = useQueryClient();

  const getCachedSnapshot = useCallback((): EventDetailResponse | null => {
    if (!eventId) {
      return null;
    }

    const cachedLists = queryClient.getQueriesData<EventsListResponse>({ queryKey: queryKeys.events.root });
    for (const [, data] of cachedLists) {
      if (!data?.events?.length) {
        continue;
      }
      const match = data.events.find((item) => item.id === eventId);
      if (match) {
        const related = data.events.filter((item) => item.id !== eventId).slice(0, 4);
        return { event: match, relatedEvents: related };
      }
    }

    return null;
  }, [eventId, queryClient]);

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
  enabled: !!eventId,
    retry: 1,
    initialData: () => getCachedSnapshot() ?? undefined,
    placeholderData: (previousData: EventDetailResponse | undefined) => previousData ?? getCachedSnapshot() ?? undefined,
    staleTime: EVENT_DETAIL_STALE_TIME,
    gcTime: EVENT_DETAIL_GC_TIME,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
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
  isLoading: eventId ? detailQuery.isPending : false,
    error,
    refetch: async () => {
      await detailQuery.refetch();
    },
  };
}
