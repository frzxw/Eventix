import { useQuery } from '@tanstack/react-query';
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

type FeaturedEventsOptions = {
  enabled?: boolean;
};

export function useFeaturedEventsQuery(options?: FeaturedEventsOptions) {
  return useQuery<Event[]>({
    queryKey: queryKeys.events.featured(),
    queryFn: async () => {
      const response = await apiClient.events.getFeatured();
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data ?? [];
    },
    enabled: options?.enabled ?? true,
    placeholderData: (previousData: Event[] | undefined) => previousData,
  });
}

type EventsQueryOptions = EventsListFilters & {
  enabled?: boolean;
};

export function useEventsQuery(filters: EventsQueryOptions) {
  const { enabled = true, ...queryFilters } = filters;

  return useQuery<EventsListResponse>({
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
    placeholderData: (previousData: EventsListResponse | undefined) => previousData,
  });
}
