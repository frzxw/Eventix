import { Filter, X, Calendar, MapPin, Banknote, Ticket } from 'lucide-react';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { useState } from 'react';
import type { EventCategory, TicketStatus } from '../../lib/types';

interface FilterSidebarProps {
  onFilterChange?: (filters: FilterState) => void;
  onClose?: () => void;
  isMobile?: boolean;
}

export interface FilterState {
  categories: EventCategory[];
  cities: string[];
  priceRange: [number, number];
  dateRange?: string;
  availability: TicketStatus[];
}

const categories: EventCategory[] = ['concert', 'festival', 'theater', 'comedy', 'sports'];
const cities = ['Jakarta', 'Bandung', 'Surabaya', 'Yogyakarta', 'Bali', 'Semarang'];
const availabilityOptions: TicketStatus[] = ['available', 'low-stock'];

export function FilterSidebar({ onFilterChange, onClose, isMobile }: FilterSidebarProps) {
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    cities: [],
    priceRange: [0, 10000000],
    availability: ['available', 'low-stock'],
  });

  const handleCategoryToggle = (category: EventCategory) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    const newFilters = { ...filters, categories: newCategories };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleCityToggle = (city: string) => {
    const newCities = filters.cities.includes(city)
      ? filters.cities.filter((c) => c !== city)
      : [...filters.cities, city];
    const newFilters = { ...filters, cities: newCities };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handlePriceChange = (value: number[]) => {
    const newFilters = { ...filters, priceRange: [value[0], value[1]] as [number, number] };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleAvailabilityToggle = (status: TicketStatus) => {
    const newAvailability = filters.availability.includes(status)
      ? filters.availability.filter((s) => s !== status)
      : [...filters.availability, status];
    const newFilters = { ...filters, availability: newAvailability };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleReset = () => {
    const resetFilters: FilterState = {
      categories: [],
      cities: [],
      priceRange: [0, 1000],
      availability: ['available', 'low-stock'],
    };
    setFilters(resetFilters);
    onFilterChange?.(resetFilters);
  };

  return (
    <aside
      className="glass rounded-2xl border border-[var(--border-glass)] p-6 h-fit sticky top-24"
      aria-label="Event filters"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-[var(--primary-500)]" aria-hidden="true" />
          <h2 style={{ fontWeight: 'var(--font-weight-medium)' }}>Filters</h2>
        </div>
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="glass-hover rounded-lg focus-ring"
            aria-label="Close filters"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {/* Category Filter */}
        <FilterSection
          icon={<Ticket className="w-4 h-4" />}
          title="Category"
          id="category-filter"
        >
          <div className="space-y-3" role="group" aria-labelledby="category-filter">
            {categories.map((category) => (
              <div key={category} className="flex items-center gap-2">
                <Checkbox
                  id={`category-${category}`}
                  checked={filters.categories.includes(category)}
                  onCheckedChange={() => handleCategoryToggle(category)}
                  className="focus-ring"
                />
                <Label
                  htmlFor={`category-${category}`}
                  className="capitalize cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-smooth"
                >
                  {category}
                </Label>
              </div>
            ))}
          </div>
        </FilterSection>

        {/* Location Filter */}
        <FilterSection
          icon={<MapPin className="w-4 h-4" />}
          title="Location"
          id="location-filter"
        >
          <div className="space-y-3" role="group" aria-labelledby="location-filter">
            {cities.map((city) => (
              <div key={city} className="flex items-center gap-2">
                <Checkbox
                  id={`city-${city}`}
                  checked={filters.cities.includes(city)}
                  onCheckedChange={() => handleCityToggle(city)}
                  className="focus-ring"
                />
                <Label
                  htmlFor={`city-${city}`}
                  className="cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-smooth"
                >
                  {city}
                </Label>
              </div>
            ))}
          </div>
        </FilterSection>

        {/* Price Range Filter */}
        <FilterSection
          icon={<Banknote className="w-4 h-4" />}
          title="Price Range"
          id="price-filter"
        >
          <div className="space-y-4" aria-labelledby="price-filter">
            <Slider
              value={filters.priceRange}
              onValueChange={handlePriceChange}
              min={0}
              max={10000000}
              step={100000}
              className="focus-ring"
              aria-label="Price range slider"
            />
            <div className="flex items-center justify-between text-sm text-[var(--text-secondary)]">
              <span>IDR {filters.priceRange[0].toLocaleString('id-ID')}</span>
              <span>IDR {filters.priceRange[1].toLocaleString('id-ID')}+</span>
            </div>
          </div>
        </FilterSection>

        {/* Availability Filter */}
        <FilterSection
          icon={<Calendar className="w-4 h-4" />}
          title="Availability"
          id="availability-filter"
        >
          <div className="space-y-3" role="group" aria-labelledby="availability-filter">
            {availabilityOptions.map((status) => (
              <div key={status} className="flex items-center gap-2">
                <Checkbox
                  id={`availability-${status}`}
                  checked={filters.availability.includes(status)}
                  onCheckedChange={() => handleAvailabilityToggle(status)}
                  className="focus-ring"
                />
                <Label
                  htmlFor={`availability-${status}`}
                  className="capitalize cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-smooth"
                >
                  {status.replace('-', ' ')}
                </Label>
              </div>
            ))}
          </div>
        </FilterSection>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-6 pt-6 border-t border-[var(--border-default)]">
        <Button
          variant="outline"
          onClick={handleReset}
          className="flex-1 glass-hover transition-smooth focus-ring"
        >
          Reset
        </Button>
        {isMobile && (
          <Button
            onClick={onClose}
            className="flex-1 bg-gradient-to-r from-[var(--primary-500)] to-[var(--accent-500)] hover:opacity-90 transition-smooth focus-ring"
          >
            Apply
          </Button>
        )}
      </div>
    </aside>
  );
}

interface FilterSectionProps {
  icon: React.ReactNode;
  title: string;
  id: string;
  children: React.ReactNode;
}

function FilterSection({ icon, title, id, children }: FilterSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-[var(--text-primary)]" id={id}>
        <span className="text-[var(--primary-500)]" aria-hidden="true">
          {icon}
        </span>
        <h3 style={{ fontWeight: 'var(--font-weight-medium)' }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}
