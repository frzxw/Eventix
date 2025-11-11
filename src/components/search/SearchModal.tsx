import { useEffect, useRef, useState } from 'react';
import { Search, X, Calendar, MapPin, TrendingUp, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { mockEvents } from '../../lib/mock-data';
import { apiClient } from '../../lib/services/api-client';
import { SEARCH as SEARCH_CONFIG } from '../../lib/constants';
import { Button } from '../ui/button';
import type { Event } from '../../lib/types';
import { SearchResultsSkeleton } from '../loading';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Event[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingSearches] = useState(['Concerts', 'Festivals', 'Jakarta', 'Comedy Shows']);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      // Load recent searches from localStorage
      const saved = localStorage.getItem('recentSearches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const trimmed = query.trim();

    if (!trimmed || trimmed.length < SEARCH_CONFIG.MIN_QUERY_LENGTH) {
      setResults([]);
      setIsSearching(false);
      setSearchError(null);
      return;
    }

    let isCurrent = true;
    setIsSearching(true);
    setSearchError(null);

    const timeoutId = window.setTimeout(async () => {
      const response = await apiClient.events.search(trimmed);

      if (!isCurrent) {
        return;
      }

      if (response.data) {
        setResults(response.data);
        setSearchError(null);
      } else {
        const fallback = mockEvents
          .filter((event) =>
            event.title.toLowerCase().includes(trimmed.toLowerCase()) ||
            event.artist.toLowerCase().includes(trimmed.toLowerCase()) ||
            event.venue.city.toLowerCase().includes(trimmed.toLowerCase()) ||
            event.category.toLowerCase().includes(trimmed.toLowerCase())
          )
          .slice(0, 5);
        setResults(fallback);
        setSearchError(response.error ?? null);
      }

      setIsSearching(false);
    }, SEARCH_CONFIG.DEBOUNCE_DELAY_MS);

    return () => {
      isCurrent = false;
      window.clearTimeout(timeoutId);
    };
  }, [query]);

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    // Save to recent searches
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
    
    navigate(`/discover?search=${encodeURIComponent(searchQuery)}`);
    onClose();
  };

  const handleEventClick = (eventId: string) => {
    navigate(`/event/${eventId}`);
    onClose();
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="container mx-auto px-4 pt-20 max-w-3xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input */}
          <div className="glass rounded-3xl border border-[var(--border-glass)] overflow-hidden shadow-2xl">
            <div className="flex items-center gap-4 p-6 border-b border-[var(--border-default)]">
              <Search className="w-6 h-6 text-[var(--primary-500)] flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && query.trim()) {
                    handleSearch(query);
                  }
                }}
                placeholder="Search events, artists, venues..."
                className="flex-1 bg-transparent border-none outline-none text-lg text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full hover:bg-[var(--surface-glass-hover)] flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Search Results */}
            <div className="max-h-[60vh] overflow-y-auto">
              {query.trim() ? (
                <div className="p-4">
                  {isSearching ? (
                    <SearchResultsSkeleton />
                  ) : results.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide px-2 mb-3">
                        Search Results
                      </p>
                      {results.map((event) => (
                        <motion.button
                          key={event.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          onClick={() => handleEventClick(event.id)}
                          className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-[var(--surface-glass-hover)] transition-smooth text-left group"
                        >
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                            <img
                              src={event.image}
                              alt={event.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm truncate" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                              {event.title}
                            </h4>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(event.date).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </span>
                              <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {event.venue.city}
                              </span>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Search className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-3" />
                      <p className="text-[var(--text-secondary)]">
                        {searchError ? searchError : `No results found for "${query}"`}
                      </p>
                      <p className="text-sm text-[var(--text-tertiary)] mt-1">
                        Try different keywords
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 space-y-6">
                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5" />
                          Recent Searches
                        </p>
                        <button
                          onClick={clearRecentSearches}
                          className="text-xs text-[var(--primary-500)] hover:text-[var(--primary-400)] transition-smooth"
                        >
                          Clear
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {recentSearches.map((search, index) => (
                          <motion.button
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => {
                              setQuery(search);
                              handleSearch(search);
                            }}
                            className="px-4 py-2 rounded-full glass border border-[var(--border-glass)] hover:border-[var(--primary-500)]/30 hover:bg-[var(--surface-glass-hover)] transition-smooth text-sm"
                          >
                            {search}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trending Searches */}
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide mb-3 flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5" />
                      Trending Searches
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {trendingSearches.map((search, index) => (
                        <motion.button
                          key={index}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => {
                            setQuery(search);
                            handleSearch(search);
                          }}
                          className="px-4 py-2 rounded-full glass border border-[var(--border-glass)] hover:border-[var(--primary-500)]/30 hover:bg-[var(--surface-glass-hover)] transition-smooth text-sm"
                        >
                          {search}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
