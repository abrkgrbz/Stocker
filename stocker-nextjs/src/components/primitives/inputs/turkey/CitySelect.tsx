'use client';

/**
 * =====================================
 * TURKEY CITY SELECT COMPONENT
 * =====================================
 *
 * Searchable city (il) select with Turkey's 81 provinces.
 */

import React, { Fragment, useState, useMemo } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/cn';
import { TURKEY_CITIES, type City } from './data/cities';

export interface CitySelectProps {
  /** Selected city (name or code based on valueType) */
  value: string | null;
  /** Change handler - returns name or code based on valueType */
  onChange: (value: string | null, city: City | null) => void;
  /** What to use as value - 'name' for city name, 'code' for plate code */
  valueType?: 'name' | 'code';
  /** Placeholder text */
  placeholder?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Error state */
  error?: boolean;
  /** Error message */
  errorMessage?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Full width */
  fullWidth?: boolean;
  /** Show plate code */
  showPlateCode?: boolean;
  /** Additional class names */
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 text-sm',
  md: 'h-10 text-sm',
  lg: 'h-12 text-base',
};

export function CitySelect({
  value,
  onChange,
  valueType = 'name',
  placeholder = 'İl seçiniz...',
  disabled = false,
  error = false,
  errorMessage,
  size = 'md',
  fullWidth = true,
  showPlateCode = true,
  className,
}: CitySelectProps) {
  const [query, setQuery] = useState('');

  const selectedCity = useMemo(
    () => {
      if (!value) return null;
      if (valueType === 'code') {
        return TURKEY_CITIES.find((city) => city.code === value) || null;
      }
      return TURKEY_CITIES.find((city) => city.name === value) || null;
    },
    [value, valueType]
  );

  const filteredCities = useMemo(() => {
    if (query === '') return TURKEY_CITIES;
    const lowerQuery = query.toLowerCase();
    return TURKEY_CITIES.filter(
      (city) =>
        city.name.toLowerCase().includes(lowerQuery) ||
        city.code.includes(query)
    );
  }, [query]);

  const handleChange = (city: City | null) => {
    const returnValue = city ? (valueType === 'code' ? city.code : city.name) : null;
    onChange(returnValue, city);
    setQuery('');
  };

  return (
    <div className={cn('relative', fullWidth && 'w-full')}>
      <Combobox value={selectedCity} onChange={handleChange} disabled={disabled}>
        <div className="relative">
          <div className="relative">
            <Combobox.Input
              className={cn(
                'w-full rounded-md pl-3 pr-10 outline-none transition-all duration-200',
                'bg-slate-50 border border-slate-300',
                'hover:border-slate-400',
                'focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:bg-white',
                'placeholder:text-slate-400',
                sizeClasses[size],
                error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
                disabled && 'opacity-50 cursor-not-allowed bg-slate-100',
                className
              )}
              displayValue={(city: City | null) =>
                city ? (showPlateCode ? `${city.code} - ${city.name}` : city.name) : ''
              }
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
            </Combobox.Button>
          </div>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setQuery('')}
          >
            <Combobox.Options
              className={cn(
                'absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md',
                'bg-white py-1 shadow-lg ring-1 ring-black/5',
                'focus:outline-none text-sm'
              )}
            >
              {filteredCities.length === 0 && query !== '' ? (
                <div className="relative cursor-default select-none py-2 px-4 text-slate-500">
                  <div className="flex items-center gap-2">
                    <MagnifyingGlassIcon className="h-4 w-4" />
                    <span>Sonuç bulunamadı</span>
                  </div>
                </div>
              ) : (
                filteredCities.map((city) => (
                  <Combobox.Option
                    key={city.code}
                    value={city}
                    className={({ active, selected }) =>
                      cn(
                        'relative cursor-pointer select-none py-2 pl-10 pr-4',
                        active && 'bg-slate-100',
                        selected && 'bg-slate-50'
                      )
                    }
                  >
                    {({ selected }) => (
                      <>
                        <div className="flex items-center gap-2">
                          {showPlateCode && (
                            <span className="w-6 text-slate-400 text-xs font-mono">
                              {city.code}
                            </span>
                          )}
                          <span className={cn('block truncate', selected && 'font-medium')}>
                            {city.name}
                          </span>
                          <span className="text-xs text-slate-400 ml-auto">
                            {city.region}
                          </span>
                        </div>
                        {selected && (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-900">
                            <CheckIcon className="h-4 w-4" aria-hidden="true" />
                          </span>
                        )}
                      </>
                    )}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
      {errorMessage && <p className="mt-1 text-xs text-red-600">{errorMessage}</p>}
    </div>
  );
}

export default CitySelect;
