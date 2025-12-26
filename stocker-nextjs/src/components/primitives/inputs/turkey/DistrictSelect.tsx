'use client';

/**
 * =====================================
 * TURKEY DISTRICT SELECT COMPONENT
 * =====================================
 *
 * District (ilçe) select linked to a city.
 */

import React, { Fragment, useState, useMemo } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/cn';
import { getDistrictsByCity, hasDistrictsData } from './data/districts';
import { getCityByName } from './data/cities';

export interface DistrictSelectProps {
  /** Selected city (code or name based on cityValueType) */
  cityCode: string | null;
  /** How to interpret cityCode - 'code' for plate code, 'name' for city name */
  cityValueType?: 'code' | 'name';
  /** Selected district name */
  value: string | null;
  /** Change handler */
  onChange: (district: string | null) => void;
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
  /** Allow custom district (when data not available) */
  allowCustom?: boolean;
  /** Additional class names */
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 text-sm',
  md: 'h-10 text-sm',
  lg: 'h-12 text-base',
};

export function DistrictSelect({
  cityCode,
  cityValueType = 'code',
  value,
  onChange,
  placeholder = 'İlçe seçiniz...',
  disabled = false,
  error = false,
  errorMessage,
  size = 'md',
  fullWidth = true,
  allowCustom = true,
  className,
}: DistrictSelectProps) {
  const [query, setQuery] = useState('');

  // Convert city name to code if needed
  const resolvedCityCode = useMemo(() => {
    if (!cityCode) return null;
    if (cityValueType === 'name') {
      const city = getCityByName(cityCode);
      return city?.code || null;
    }
    return cityCode;
  }, [cityCode, cityValueType]);

  const districts = useMemo(() => {
    if (!resolvedCityCode) return [];
    return getDistrictsByCity(resolvedCityCode);
  }, [resolvedCityCode]);

  const hasData = resolvedCityCode ? hasDistrictsData(resolvedCityCode) : false;

  const filteredDistricts = useMemo(() => {
    if (query === '') return districts;
    const lowerQuery = query.toLowerCase();
    return districts.filter((district) =>
      district.toLowerCase().includes(lowerQuery)
    );
  }, [districts, query]);

  const handleChange = (district: string | null) => {
    onChange(district);
    setQuery('');
  };

  const isDisabled = disabled || !resolvedCityCode;
  const showAsInput = !hasData && allowCustom && resolvedCityCode;

  // If no district data and custom allowed, show simple input
  if (showAsInput) {
    return (
      <div className={cn('relative', fullWidth && 'w-full')}>
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value || null)}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            'w-full rounded-md px-3 outline-none transition-all duration-200',
            'bg-slate-50 border border-slate-300',
            'hover:border-slate-400',
            'focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:bg-white',
            'placeholder:text-slate-400',
            sizeClasses[size],
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            disabled && 'opacity-50 cursor-not-allowed bg-slate-100',
            className
          )}
        />
        {errorMessage && <p className="mt-1 text-xs text-red-600">{errorMessage}</p>}
      </div>
    );
  }

  return (
    <div className={cn('relative', fullWidth && 'w-full')}>
      <Combobox value={value} onChange={handleChange} disabled={isDisabled}>
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
                isDisabled && 'opacity-50 cursor-not-allowed bg-slate-100',
                className
              )}
              displayValue={(district: string | null) => district || ''}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={!resolvedCityCode ? 'Önce il seçiniz' : placeholder}
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
              {filteredDistricts.length === 0 ? (
                <div className="relative cursor-default select-none py-2 px-4 text-slate-500">
                  <div className="flex items-center gap-2">
                    <MagnifyingGlassIcon className="h-4 w-4" />
                    <span>
                      {query === '' ? 'İlçe bulunamadı' : 'Sonuç bulunamadı'}
                    </span>
                  </div>
                </div>
              ) : (
                filteredDistricts.map((district) => (
                  <Combobox.Option
                    key={district}
                    value={district}
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
                        <span className={cn('block truncate', selected && 'font-medium')}>
                          {district}
                        </span>
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

export default DistrictSelect;
