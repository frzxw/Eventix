import { useCallback, useEffect } from 'react';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import type { EventsListFilters } from '@/lib/queryKeys';
import { queryKeys } from '@/lib/queryKeys';
import { apiClient } from '@/lib/services/api-client';
import type { Event } from '@/lib/types';

export type EventsListResponse = {
  events: Event[];
  total: number;
  page: number;
  totalPages: number;
};

const EVENTS_STALE_TIME = 1000 * 60 * 5;
const EVENTS_GC_TIME = 1000 * 60 * 15;

type FeaturedEventsOptions = {
  enabled?: boolean;
};

export function useFeaturedEventsQuery(options?: FeaturedEventsOptions) {
  const queryClient = useQueryClient();

  const primeDetailCache = useCallback(
    (events: Event[]) => {
      events.forEach((event) => {
        const relatedEvents = events.filter((item) => item.id !== event.id).slice(0, 4);
        queryClient.setQueryData(
          queryKeys.events.detail(event.id),
          (existing: { event: Event; relatedEvents: Event[] } | undefined) => ({
            event,
            relatedEvents: existing?.relatedEvents?.length ? existing.relatedEvents : relatedEvents,
          }),
        );
      });
    },
    [queryClient],
  );

  const query = useQuery<Event[], Error>({
    queryKey: queryKeys.events.featured(),
    queryFn: async () => {
      const response = await apiClient.events.getFeatured();
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data ?? [];
    },
    enabled: options?.enabled ?? true,
    placeholderData: keepPreviousData,
    staleTime: EVENTS_STALE_TIME,
    gcTime: EVENTS_GC_TIME,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (query.data?.length) {
      primeDetailCache(query.data);
    }
  }, [primeDetailCache, query.data]);

  return query;
}

type EventsQueryOptions = EventsListFilters & {
  enabled?: boolean;
};

export function useEventsQuery(filters: EventsQueryOptions) {
  const queryClient = useQueryClient();
  const { enabled = true, ...queryFilters } = filters;

  const primeDetailCache = useCallback(
    (payload: EventsListResponse) => {
      if (!payload.events?.length) {
        return;
      }
      payload.events.forEach((event) => {
        const relatedEvents = payload.events.filter((item) => item.id !== event.id).slice(0, 4);
        queryClient.setQueryData(
          queryKeys.events.detail(event.id),
          (existing: { event: Event; relatedEvents: Event[] } | undefined) => ({
            event,
            relatedEvents: existing?.relatedEvents?.length ? existing.relatedEvents : relatedEvents,
          }),
        );
      });
    },
    [queryClient],
  );

  const query = useQuery<EventsListResponse, Error>({
    queryKey: queryKeys.events.list(queryFilters),
    queryFn: async () => {
      const response = await apiClient.events.getAll(queryFilters);
      if (response.error) {
        throw new Error(response.error);
      }
      if (response.data) {
        return response.data;
      }
      return {
        events: [],
        total: 0,
        page: queryFilters.page ?? 1,
        totalPages: 1,
      };
    },
    enabled,
    placeholderData: keepPreviousData,
    staleTime: EVENTS_STALE_TIME,
    gcTime: EVENTS_GC_TIME,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (query.data) {
      primeDetailCache(query.data);
    }
  }, [primeDetailCache, query.data]);

  return query;
}
