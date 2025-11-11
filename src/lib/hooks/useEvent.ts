import { useCallback, useEffect, useRef, useState } from 'react';
import { apiClient } from '../services/api-client';
import type { Event } from '../types';
import { mockEvents } from '../mock-data';

interface UseEventResult {
  event: Event | null;
  relatedEvents: Event[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useEvent(eventId?: string): UseEventResult {
  const [event, setEvent] = useState<Event | null>(null);
  const [relatedEvents, setRelatedEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(eventId));
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchEvent = useCallback(async () => {
    if (!eventId) {
      if (isMountedRef.current) {
        setEvent(null);
        setRelatedEvents([]);
        setError(null);
        setIsLoading(false);
      }
      return;
    }

    if (isMountedRef.current) {
      setIsLoading(true);
      setError(null);
    }

    const response = await apiClient.events.getById(eventId);

    if (!isMountedRef.current) {
      return;
    }

    if (response.data) {
      setEvent(response.data.event);
      setRelatedEvents(response.data.relatedEvents ?? []);
      setError(null);
    } else {
      const fallback = mockEvents.find((item) => item.id === eventId) ?? null;
      if (fallback) {
        setEvent(fallback);
        setRelatedEvents(mockEvents.filter((item) => item.id !== eventId).slice(0, 4));
        setError(response.error ?? null);
      } else {
        setEvent(null);
        setRelatedEvents([]);
        setError(response.error ?? 'Event not found');
      }
    }

    setIsLoading(false);
  }, [eventId]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  return {
    event,
    relatedEvents,
    isLoading,
    error,
    refetch: fetchEvent,
  };
}
