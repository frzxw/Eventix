import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Button } from './button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './command';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { countries } from '../../lib/countries';
import { cn } from './utils';

export interface CountrySelectProps {
  value?: string;
  onChange?: (countryCode: string) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function CountrySelect({
  value = '',
  onChange,
  className,
  placeholder = 'Select country',
  disabled = false,
}: CountrySelectProps) {
  const [open, setOpen] = React.useState(false);
  const selectedCountry = countries.find(c => c.code === value);

  const handleSelect = (countryCode: string) => {
    onChange?.(countryCode);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Select country"
          disabled={disabled}
          className={cn('w-full justify-between glass hover:bg-[var(--surface-glass-hover)]', className)}
        >
          {selectedCountry ? (
            <span className="flex items-center gap-2 truncate">
              <span className="text-lg" aria-hidden="true">{selectedCountry.flag}</span>
              <span>{selectedCountry.name}</span>
            </span>
          ) : (
            <span className="text-[var(--text-tertiary)]">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full min-w-[300px] p-0 glass border-[var(--border-glass)]">
        <Command className="bg-transparent">
          <CommandInput placeholder="Search country..." />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {countries.map((country) => (
                <CommandItem
                  key={country.code}
                  value={country.code}
                  onSelect={() => handleSelect(country.code)}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === country.code ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <span className="mr-2 text-lg" aria-hidden="true">{country.flag}</span>
                  <span className="flex-1">{country.name}</span>
                  <span className="text-[var(--text-tertiary)] text-sm">{country.dialCode}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
