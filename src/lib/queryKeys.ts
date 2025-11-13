export type EventsListFilters = {
  category?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  search?: string;
  sort?: 'date' | 'newest';
};

export const queryKeys = {
  events: {
    root: ['events'] as const,
    featured: () => ['events', 'featured'] as const,
    list: (filters: EventsListFilters) => ['events', 'list', filters] as const,
    detail: (eventId?: string) => ['events', 'detail', eventId ?? 'unknown'] as const,
  },
  auth: {
    root: ['auth'] as const,
    profile: () => ['auth', 'profile'] as const,
  },
} as const;
