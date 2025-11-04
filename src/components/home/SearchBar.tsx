import { useState } from 'react';
import { Search, MapPin, Calendar, Music } from 'lucide-react';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';

interface SearchBarProps {
  onSearch?: (query: string) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'artist' | 'venue' | 'date'>('all');
  const [searchValue, setSearchValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchValue);
  };

  return (
    <div className="glass rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-[var(--border-glass)] max-w-4xl mx-auto">
      {/* Search Type Tabs */}
      <div className="flex gap-2 mb-3 sm:mb-4 overflow-x-auto pb-2 -mx-1 px-1" role="tablist" aria-label="Search type">
        <SearchTab
          active={activeTab === 'all'}
          onClick={() => setActiveTab('all')}
          icon={<Search className="w-4 h-4" />}
          label="All Events"
        />
        <SearchTab
          active={activeTab === 'artist'}
          onClick={() => setActiveTab('artist')}
          icon={<Music className="w-4 h-4" />}
          label="Artist"
        />
        <SearchTab
          active={activeTab === 'venue'}
          onClick={() => setActiveTab('venue')}
          icon={<MapPin className="w-4 h-4" />}
          label="Venue"
        />
        <SearchTab
          active={activeTab === 'date'}
          onClick={() => setActiveTab('date')}
          icon={<Calendar className="w-4 h-4" />}
          label="Date"
        />
      </div>

      {/* Search Input */}
      <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3" role="search">
        <div className="flex-1 relative">
          <Search 
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)] pointer-events-none" 
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder={getPlaceholder(activeTab)}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full h-12 sm:h-14 pl-12 pr-4 bg-[var(--surface-glass)] border border-[var(--border-default)] rounded-xl sm:rounded-2xl text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-smooth focus:outline-none focus:border-[var(--primary-500)] focus:ring-2 focus:ring-[var(--ring-primary)]"
            aria-label="Search events"
          />
        </div>
        <Button
          type="submit"
          size="lg"
          className="h-12 sm:h-14 px-6 sm:px-8 bg-gradient-to-r from-[var(--primary-500)] to-[var(--accent-500)] hover:opacity-90 transition-smooth rounded-xl sm:rounded-2xl focus-ring shrink-0"
        >
          <span className="hidden sm:inline">Search</span>
          <Search className="w-5 h-5 sm:hidden" aria-hidden="true" />
        </Button>
      </form>

      {/* Popular Searches */}
      <div className="mt-4 flex flex-wrap gap-2" role="list" aria-label="Popular searches">
        <span className="text-sm text-[var(--text-tertiary)]">Popular:</span>
        <PopularTag onSearch={(query) => navigate(`/discover?search=${encodeURIComponent(query)}`)}>Rock Concerts</PopularTag>
        <PopularTag onSearch={(query) => navigate(`/discover?search=${encodeURIComponent(query)}`)}>Comedy Shows</PopularTag>
        <PopularTag onSearch={(query) => navigate(`/discover?search=${encodeURIComponent(query)}`)}>Music Festivals</PopularTag>
        <PopularTag onSearch={(query) => navigate(`/discover?search=${encodeURIComponent(query)}`)}>Theater</PopularTag>
      </div>
    </div>
  );
}

interface SearchTabProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

function SearchTab({ active, onClick, icon, label }: SearchTabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="tab"
      aria-selected={active}
      className={`
        flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl transition-smooth focus-ring whitespace-nowrap
        ${active 
          ? 'bg-gradient-to-r from-[var(--primary-500)] to-[var(--accent-500)] text-white' 
          : 'bg-[var(--surface-glass)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-glass-hover)]'
        }
      `}
    >
      {icon}
      <span className="text-sm sm:text-base">{label}</span>
    </button>
  );
}

interface PopularTagProps {
  children: React.ReactNode;
  onSearch: (query: string) => void;
}

function PopularTag({ children, onSearch }: PopularTagProps) {
  return (
    <button
      type="button"
      onClick={() => onSearch(String(children))}
      className="text-sm px-3 py-1 rounded-lg bg-[var(--surface-glass)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-glass-hover)] transition-smooth focus-ring"
      role="listitem"
    >
      {children}
    </button>
  );
}

function getPlaceholder(tab: 'all' | 'artist' | 'venue' | 'date'): string {
  switch (tab) {
    case 'artist':
      return 'Search for artists, bands, performers...';
    case 'venue':
      return 'Search for venues, stadiums, theaters...';
    case 'date':
      return 'Search by date or date range...';
    default:
      return 'Search events, artists, venues, cities...';
  }
}
