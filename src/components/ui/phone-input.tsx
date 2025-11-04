import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Button } from './button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './command';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Input } from './input';
import { countries } from '../../lib/countries';
import { cn } from './utils';

export interface PhoneInputProps {
  value?: string;
  defaultCountry?: string;
  onChange?: (value: string, countryCode: string) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function PhoneInput({
  value = '',
  defaultCountry = 'ID',
  onChange,
  className,
  placeholder = 'Enter phone number',
  disabled = false,
}: PhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = React.useState(
    countries.find(c => c.code === defaultCountry) || countries[0]
  );
  const [phoneNumber, setPhoneNumber] = React.useState(value);
  const [open, setOpen] = React.useState(false);

  const handleCountryChange = (countryCode: string) => {
    const country = countries.find(c => c.code === countryCode);
    if (country) {
      setSelectedCountry(country);
      onChange?.(phoneNumber, country.code);
    }
    setOpen(false);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/[^\d]/g, ''); // Only allow digits
    setPhoneNumber(newValue);
    onChange?.(newValue, selectedCountry.code);
  };

  return (
    <div className={cn('flex gap-2', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Select country"
            disabled={disabled}
            className="w-[140px] justify-between glass hover:bg-[var(--surface-glass-hover)]"
          >
            <span className="flex items-center gap-2 truncate">
              <span className="text-lg" aria-hidden="true">{selectedCountry.flag}</span>
              <span className="text-sm">{selectedCountry.dialCode}</span>
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-0 glass border-[var(--border-glass)]">
          <Command className="bg-transparent">
            <CommandInput placeholder="Search country..." />
            <CommandList>
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup>
                {countries.map((country) => (
                  <CommandItem
                    key={country.code}
                    value={country.code}
                    onSelect={() => handleCountryChange(country.code)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        selectedCountry.code === country.code ? 'opacity-100' : 'opacity-0'
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

      <Input
        type="tel"
        value={phoneNumber}
        onChange={handlePhoneChange}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 glass"
      />
    </div>
  );
}
