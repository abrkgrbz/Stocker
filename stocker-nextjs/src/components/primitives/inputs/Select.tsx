'use client';

/**
 * =====================================
 * ENTERPRISE SELECT COMPONENT
 * =====================================
 *
 * Accessible dropdown select using Headless UI Listbox.
 * Features:
 * - Keyboard navigation
 * - Search/filter option
 * - Multi-select support
 * - Custom option rendering
 */

import React, { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/cn';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  description?: string;
}

export interface SelectProps {
  /** Selected value */
  value: string | null;
  /** Change handler */
  onChange: (value: string) => void;
  /** Options list */
  options: SelectOption[];
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
  /** Additional class names */
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 text-sm px-2.5',
  md: 'h-10 text-sm px-3',
  lg: 'h-12 text-base px-4',
};

export function Select({
  value,
  onChange,
  options,
  placeholder = 'Seçiniz...',
  disabled = false,
  error = false,
  errorMessage,
  size = 'md',
  fullWidth = true,
  className,
}: SelectProps) {
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={cn('relative', fullWidth && 'w-full')}>
      <Listbox value={value} onChange={onChange} disabled={disabled}>
        <div className="relative">
          <Listbox.Button
            className={cn(
              'relative w-full cursor-pointer rounded-md text-left outline-none',
              'bg-slate-50 border border-slate-300',
              'hover:border-slate-400',
              'focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:bg-white',
              'transition-all duration-200',
              sizeClasses[size],
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
              disabled && 'opacity-50 cursor-not-allowed bg-slate-100',
              className
            )}
          >
            <span className={cn('block truncate pr-8', !selectedOption && 'text-slate-400')}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
            </span>
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options
              className={cn(
                'absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md',
                'bg-white py-1 shadow-lg ring-1 ring-black/5',
                'focus:outline-none text-sm'
              )}
            >
              {options.map((option) => (
                <Listbox.Option
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className={({ active, selected }) =>
                    cn(
                      'relative cursor-pointer select-none py-2 pl-10 pr-4',
                      active && 'bg-slate-100',
                      selected && 'bg-slate-50',
                      option.disabled && 'opacity-50 cursor-not-allowed'
                    )
                  }
                >
                  {({ selected }) => (
                    <>
                      <div className="flex items-center gap-2">
                        {option.icon && <span className="flex-shrink-0">{option.icon}</span>}
                        <span className={cn('block truncate', selected && 'font-medium')}>
                          {option.label}
                        </span>
                      </div>
                      {option.description && (
                        <p className="text-xs text-slate-500 mt-0.5 ml-0">{option.description}</p>
                      )}
                      {selected && (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-900">
                          <CheckIcon className="h-4 w-4" aria-hidden="true" />
                        </span>
                      )}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
      {errorMessage && <p className="mt-1 text-xs text-red-600">{errorMessage}</p>}
    </div>
  );
}

/**
 * Multi-select variant
 */
export interface MultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
}

export function MultiSelect({
  value,
  onChange,
  options,
  placeholder = 'Seçiniz...',
  disabled = false,
  error = false,
  errorMessage,
  size = 'md',
  fullWidth = true,
  className,
}: MultiSelectProps) {
  const selectedOptions = options.filter((opt) => value.includes(opt.value));

  return (
    <div className={cn('relative', fullWidth && 'w-full')}>
      <Listbox value={value} onChange={onChange} disabled={disabled} multiple>
        <div className="relative">
          <Listbox.Button
            className={cn(
              'relative w-full cursor-pointer rounded-md text-left outline-none',
              'bg-slate-50 border border-slate-300',
              'hover:border-slate-400',
              'focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:bg-white',
              'transition-all duration-200 min-h-[40px] py-1.5',
              size === 'sm' && 'min-h-[32px] text-sm px-2.5',
              size === 'md' && 'min-h-[40px] text-sm px-3',
              size === 'lg' && 'min-h-[48px] text-base px-4',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
              disabled && 'opacity-50 cursor-not-allowed bg-slate-100',
              className
            )}
          >
            <span className="flex flex-wrap gap-1 pr-8">
              {selectedOptions.length > 0 ? (
                selectedOptions.map((opt) => (
                  <span
                    key={opt.value}
                    className="inline-flex items-center px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-xs"
                  >
                    {opt.label}
                  </span>
                ))
              ) : (
                <span className="text-slate-400">{placeholder}</span>
              )}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
            </span>
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options
              className={cn(
                'absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md',
                'bg-white py-1 shadow-lg ring-1 ring-black/5',
                'focus:outline-none text-sm'
              )}
            >
              {options.map((option) => (
                <Listbox.Option
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className={({ active }) =>
                    cn(
                      'relative cursor-pointer select-none py-2 pl-10 pr-4',
                      active && 'bg-slate-100',
                      value.includes(option.value) && 'bg-slate-50',
                      option.disabled && 'opacity-50 cursor-not-allowed'
                    )
                  }
                >
                  <>
                    <span className={cn('block truncate', value.includes(option.value) && 'font-medium')}>
                      {option.label}
                    </span>
                    {value.includes(option.value) && (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-900">
                        <CheckIcon className="h-4 w-4" aria-hidden="true" />
                      </span>
                    )}
                  </>
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
      {errorMessage && <p className="mt-1 text-xs text-red-600">{errorMessage}</p>}
    </div>
  );
}

export default Select;
