import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EventCard } from '../components/events/EventCard';
import { FilterSidebar, type FilterState } from '../components/events/FilterSidebar';
import { mockEvents } from '../lib/mock-data';
import { Button } from '../components/ui/button';
import { Filter } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../components/ui/pagination';
import { apiClient } from '../lib/services/api-client';
import { LoadingSpinner } from '../components/LoadingSpinner';
import type { Event, EventCategory } from '../lib/types';

const MAX_PRICE = 10000000;
const EVENT_CATEGORIES: EventCategory[] = ['concert', 'festival', 'theater', 'comedy', 'sports', 'other'];

function isEventCategory(value: string | null): value is EventCategory {
  return value !== null && EVENT_CATEGORIES.includes(value as EventCategory);
}

function createFilterState(category: EventCategory | null): FilterState {
  return {
    categories: category ? [category] : [],
    cities: [],
    priceRange: [0, MAX_PRICE],
    availability: ['available', 'low-stock'],
  };
}

function filterMockEvents(filters: FilterState, searchQuery: string): Event[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return mockEvents
    .filter((event) => {
      const matchesCategory = filters.categories.length === 0 || filters.categories.includes(event.category);
      const matchesCity = filters.cities.length === 0 || filters.cities.includes(event.venue.city);
      const matchesSearch = normalizedQuery.length === 0
        || event.title.toLowerCase().includes(normalizedQuery)
        || event.artist.toLowerCase().includes(normalizedQuery)
        || event.venue.city.toLowerCase().includes(normalizedQuery);
      const matchesPriceRange = filters.priceRange[0] <= event.pricing.max && filters.priceRange[1] >= event.pricing.min;
      const matchesAvailability = filters.availability.length === 0
        || event.ticketCategories.some((category) => filters.availability.includes(category.status));

      return matchesCategory && matchesCity && matchesSearch && matchesPriceRange && matchesAvailability;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function DiscoverPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 9;

  const categoryParam = searchParams.get('category');
  const initialCategory = useMemo(() => {
    return isEventCategory(categoryParam) ? categoryParam : null;
  }, [categoryParam]);
  const initialSearch = searchParams.get('search') ?? '';

  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [filters, setFilters] = useState<FilterState>(() => createFilterState(initialCategory));
  const [events, setEvents] = useState<Event[]>([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle category from URL params
  useEffect(() => {
    const searchParam = searchParams.get('search');
    const nextCategory = searchParams.get('category');

    setFilters((prev) => {
      if (isEventCategory(nextCategory)) {
        if (prev.categories.length === 1 && prev.categories[0] === nextCategory) {
          return prev;
        }
        return { ...prev, categories: [nextCategory] };
      }

      if (prev.categories.length === 0) {
        return prev;
      }

      return { ...prev, categories: [] };
    });

    setSearchQuery(searchParam ?? '');
    setCurrentPage(1);
  }, [searchParams]);

  const handleEventClick = (eventId: string) => {
    navigate(`/event/${eventId}`);
  };

  const handleFilterChange = (updated: FilterState) => {
    setFilters(updated);
    setCurrentPage(1);
  };

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const category = filters.categories[0];
    const city = filters.cities[0];
    const minPrice = filters.priceRange[0] > 0 ? filters.priceRange[0] : undefined;
    const maxPrice = filters.priceRange[1] < MAX_PRICE ? filters.priceRange[1] : undefined;

    const response = await apiClient.events.getAll({
      category,
      city,
      minPrice,
      maxPrice,
      search: searchQuery || undefined,
      page: currentPage,
      limit: eventsPerPage,
      sort: 'date',
    });

    if (response.data) {
      setEvents(response.data.events);
      setTotalEvents(response.data.total);
      setTotalPages(response.data.totalPages);
      setError(null);
    } else {
      const fallback = filterMockEvents(filters, searchQuery);
      const fallbackTotal = fallback.length;
      const paginatedFallback = fallback.slice(
        (currentPage - 1) * eventsPerPage,
        currentPage * eventsPerPage
      );
      setEvents(paginatedFallback);
      setTotalEvents(fallbackTotal);
      setTotalPages(Math.max(Math.ceil(fallbackTotal / eventsPerPage), 1));
      setError(response.error ?? 'Unable to fetch events. Showing sample data.');
    }

    setIsLoading(false);
  }, [filters, searchQuery, currentPage]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <section className="py-8 sm:py-12 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl" style={{ fontWeight: 'var(--font-weight-medium)' }}>
              Discover Events
            </h1>
            {searchQuery && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-[var(--text-secondary)] mt-2"
              >
                {totalEvents > 0 
                  ? `Found ${totalEvents} event${totalEvents !== 1 ? 's' : ''} for "${searchQuery}"`
                  : `No results for "${searchQuery}"`
                }
              </motion.p>
            )}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-[var(--warning)] mt-2"
              >
                {error}
              </motion.p>
            )}
          </div>
          <Button
            variant="outline"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="lg:hidden glass-hover transition-smooth focus-ring rounded-full"
          >
            <Filter className="w-4 h-4 mr-2" aria-hidden="true" />
            Filters
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Desktop Filters */}
          <div className="hidden lg:block">
            <FilterSidebar value={filters} onFilterChange={handleFilterChange} />
          </div>

          {/* Mobile Filters */}
          <AnimatePresence>
            {showMobileFilters && (
              <motion.div
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="lg:hidden fixed inset-0 z-50 bg-[var(--background-primary)] p-4 overflow-y-auto"
              >
                <FilterSidebar
                  isMobile
                  value={filters}
                  onClose={() => setShowMobileFilters(false)}
                  onFilterChange={handleFilterChange}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Events Grid with Pagination */}
          <div className="lg:col-span-3 space-y-8">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner message="Loading events" />
              </div>
            ) : events.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-3xl border border-[var(--border-glass)] p-12 text-center"
              >
                <p className="text-xl mb-2" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                  No events found
                </p>
                <p className="text-[var(--text-secondary)] mb-6">
                  {searchQuery 
                    ? `No events match your search for "${searchQuery}"`
                    : filters.categories[0]
                    ? `No events found in the ${filters.categories[0]} category`
                    : 'Try adjusting your filters'}
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery('');
                    setFilters(createFilterState(null));
                    setCurrentPage(1);
                    navigate('/discover');
                  }}
                  className="bg-gradient-to-r from-[var(--primary-500)] to-[var(--accent-500)] hover:opacity-90 rounded-full"
                >
                  Clear Filters
                </Button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                <AnimatePresence mode="wait">
                  {events.map((event, index) => (
                    <motion.div
                      key={`${event.id}-${currentPage}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <EventCard
                        event={event}
                        onClick={() => handleEventClick(event.id)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center">
                <Pagination>
                  <PaginationContent className="glass rounded-full p-2">
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => {
                          if (currentPage > 1) {
                            setCurrentPage(currentPage - 1);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }
                        }}
                        className={`rounded-full ${
                          currentPage === 1 
                            ? 'opacity-50 cursor-not-allowed pointer-events-none' 
                            : 'cursor-pointer hover:bg-[var(--surface-glass-hover)]'
                        }`}
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => {
                                setCurrentPage(page);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              isActive={currentPage === page}
                              className={`rounded-full cursor-pointer ${
                                currentPage === page
                                  ? 'bg-[var(--surface-glass-active)] text-[var(--text-primary)]'
                                  : 'hover:bg-[var(--surface-glass-hover)]'
                              }`}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }
                      return null;
                    })}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => {
                          if (currentPage < totalPages) {
                            setCurrentPage(currentPage + 1);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }
                        }}
                        className={`rounded-full ${
                          currentPage >= totalPages
                            ? 'opacity-50 cursor-not-allowed pointer-events-none'
                            : 'cursor-pointer hover:bg-[var(--surface-glass-hover)]'
                        }`}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
