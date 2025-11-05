import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EventCard } from '../components/events/EventCard';
import { FilterSidebar } from '../components/events/FilterSidebar';
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
import { apiClient } from '@/lib/services/api-client';
import { mapApiEvents } from '@/lib/mappers/events';
import type { Event } from '@/lib/types';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export function DiscoverPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const eventsPerPage = 9;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);

  // Handle category from URL params
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');
    const pageParam = parseInt(searchParams.get('page') || '1', 10);
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
    if (searchParam) {
      setSearchQuery(searchParam);
    }
    if (!Number.isNaN(pageParam) && pageParam > 0) {
      setCurrentPage(pageParam);
    }
  }, [searchParams]);

  // Fetch events
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      // Use server-side pagination for both search and category filters
      const res = await apiClient.events.getAll({
        category: selectedCategory || undefined,
        search: searchQuery || undefined,
        page: currentPage,
        limit: eventsPerPage,
      });
      if (!mounted) return;
      if (res.error) setError(res.error);
      // Support both array and object shapes
      const payload: any = res.data;
      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.events)
        ? payload.events
        : Array.isArray(payload?.data)
        ? payload.data
        : [];
      setEvents(mapApiEvents(list));
      const tp = (Array.isArray(payload) ? undefined : (payload?.totalPages || payload?.total_pages));
      const t = (Array.isArray(payload) ? undefined : (payload?.total || payload?.total_count));
      if (tp) setTotalPages(Number(tp)); else setTotalPages( Math.max(1, Math.ceil((t ?? list.length) / eventsPerPage)) );
      if (typeof t === 'number') setTotal(t); else setTotal(list.length);
      setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, [selectedCategory, searchQuery, currentPage]);

  const handleEventClick = (eventId: string) => {
    navigate(`/event/${eventId}`);
  };

  const filteredEvents = events;

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
                {filteredEvents.length > 0 
                  ? `Found ${filteredEvents.length} event${filteredEvents.length !== 1 ? 's' : ''} for "${searchQuery}"`
                  : `No results for "${searchQuery}"`
                }
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
            <FilterSidebar />
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
                  onClose={() => setShowMobileFilters(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Events Grid with Pagination */}
          <div className="lg:col-span-3 space-y-8">
            {loading && (
              <LoadingSpinner message="Loading events..." />
            )}
            {!loading && error && (
              <div className="glass rounded-3xl border border-[var(--border-glass)] p-8 text-center text-[var(--text-secondary)]">
                {error}
              </div>
            )}
            {filteredEvents.length === 0 ? (
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
                    : selectedCategory
                    ? `No events found in the ${selectedCategory} category`
                    : "Try adjusting your filters"}
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory(null);
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
                  {filteredEvents
                    .slice(
                      (currentPage - 1) * eventsPerPage,
                      currentPage * eventsPerPage
                    )
                    .map((event, index) => (
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
                            const next = currentPage - 1;
                            setCurrentPage(next);
                            const sp = new URLSearchParams(window.location.search);
                            sp.set('page', String(next));
                            navigate(`/discover?${sp.toString()}`, { replace: true });
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

                    {Array.from(
                      { length: totalPages },
                      (_, i) => i + 1
                    ).map((page) => {
                      const totalPagesLocal = totalPages;
                    
                      if (
                        page === 1 ||
                        page === totalPagesLocal ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => {
                                setCurrentPage(page);
                                const sp = new URLSearchParams(window.location.search);
                                sp.set('page', String(page));
                                navigate(`/discover?${sp.toString()}`, { replace: true });
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
                            const next = currentPage + 1;
                            setCurrentPage(next);
                            const sp = new URLSearchParams(window.location.search);
                            sp.set('page', String(next));
                            navigate(`/discover?${sp.toString()}`, { replace: true });
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
