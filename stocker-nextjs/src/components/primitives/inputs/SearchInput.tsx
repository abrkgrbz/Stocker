'use client';

/**
 * =====================================
 * SEARCH INPUT COMPONENT
 * =====================================
 *
 * Enterprise search input with debounce.
 * Linear/Raycast/Vercel aesthetic.
 */

import React, { forwardRef, useState, useEffect, useCallback, useRef } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/cn';

// =====================================
// DEBOUNCE HOOK
// =====================================

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// =====================================
// SEARCH INPUT PROPS
// =====================================

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size'> {
  /** Current value */
  value?: string;
  /** Change handler (receives debounced value) */
  onChange?: (value: string) => void;
  /** Immediate change handler (no debounce) */
  onChangeImmediate?: (value: string) => void;
  /** Debounce delay in ms */
  debounceMs?: number;
  /** Show clear button */
  showClear?: boolean;
  /** Loading state (show spinner) */
  loading?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Full width */
  fullWidth?: boolean;
  /** Additional class names */
  className?: string;
}

const sizeClasses = {
  sm: {
    input: 'h-8 text-sm pl-8 pr-8',
    icon: 'h-4 w-4 left-2.5',
    clear: 'h-4 w-4 right-2',
  },
  md: {
    input: 'h-10 text-sm pl-10 pr-10',
    icon: 'h-5 w-5 left-3',
    clear: 'h-5 w-5 right-3',
  },
  lg: {
    input: 'h-12 text-base pl-12 pr-12',
    icon: 'h-6 w-6 left-3.5',
    clear: 'h-6 w-6 right-3.5',
  },
};

// =====================================
// SEARCH INPUT COMPONENT
// =====================================

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      value: controlledValue,
      onChange,
      onChangeImmediate,
      debounceMs = 300,
      showClear = true,
      loading = false,
      size = 'md',
      fullWidth = true,
      className,
      placeholder = 'Ara...',
      disabled,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState(controlledValue || '');
    const inputRef = useRef<HTMLInputElement>(null);

    // Merge refs
    const mergedRef = useCallback(
      (node: HTMLInputElement | null) => {
        (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref]
    );

    // Sync controlled value
    useEffect(() => {
      if (controlledValue !== undefined) {
        setInternalValue(controlledValue);
      }
    }, [controlledValue]);

    // Debounced value
    const debouncedValue = useDebounce(internalValue, debounceMs);

    // Call onChange when debounced value changes
    useEffect(() => {
      onChange?.(debouncedValue);
    }, [debouncedValue, onChange]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInternalValue(newValue);
      onChangeImmediate?.(newValue);
    };

    const handleClear = () => {
      setInternalValue('');
      onChangeImmediate?.('');
      onChange?.('');
      inputRef.current?.focus();
    };

    const sizes = sizeClasses[size];
    const showClearButton = showClear && internalValue && !loading;

    return (
      <div className={cn('relative', fullWidth && 'w-full', className)}>
        {/* Search icon */}
        <MagnifyingGlassIcon
          className={cn(
            'absolute top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none',
            sizes.icon
          )}
        />

        {/* Input */}
        <input
          ref={mergedRef}
          type="search"
          value={internalValue}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'w-full rounded-md outline-none transition-all duration-200',
            'bg-slate-50 border border-slate-300',
            'hover:border-slate-400',
            'focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:bg-white',
            'placeholder:text-slate-400',
            // Hide default search cancel button
            '[&::-webkit-search-cancel-button]:hidden',
            '[&::-webkit-search-decoration]:hidden',
            sizes.input,
            disabled && 'opacity-50 cursor-not-allowed bg-slate-100'
          )}
          {...props}
        />

        {/* Loading spinner or clear button */}
        {loading ? (
          <div
            className={cn(
              'absolute top-1/2 -translate-y-1/2',
              sizes.clear
            )}
          >
            <svg
              className="animate-spin h-full w-full text-slate-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        ) : showClearButton ? (
          <button
            type="button"
            onClick={handleClear}
            className={cn(
              'absolute top-1/2 -translate-y-1/2 p-0.5 rounded',
              'text-slate-400 hover:text-slate-600',
              'focus:outline-none focus:ring-2 focus:ring-slate-900',
              'transition-colors duration-200',
              sizes.clear
            )}
            tabIndex={-1}
          >
            <XMarkIcon className="h-full w-full" />
          </button>
        ) : null}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';

export default SearchInput;
