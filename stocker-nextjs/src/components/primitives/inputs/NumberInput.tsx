'use client';

/**
 * =====================================
 * NUMBER INPUT COMPONENT
 * =====================================
 *
 * Enterprise number input with formatting.
 * Supports currency, percentage, and custom formatting.
 * Linear/Raycast/Vercel aesthetic.
 */

import React, { forwardRef, useState, useCallback, useEffect } from 'react';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/cn';

// =====================================
// NUMBER INPUT PROPS
// =====================================

export interface NumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'size'> {
  /** Current value */
  value?: number | null;
  /** Change handler */
  onChange?: (value: number | null) => void;
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Step increment */
  step?: number;
  /** Decimal places */
  precision?: number;
  /** Format type */
  format?: 'number' | 'currency' | 'percentage';
  /** Currency code (for currency format) */
  currency?: string;
  /** Locale for formatting */
  locale?: string;
  /** Show increment/decrement buttons */
  showControls?: boolean;
  /** Prefix text */
  prefix?: string;
  /** Suffix text */
  suffix?: string;
  /** Error state */
  error?: boolean;
  /** Error message */
  errorMessage?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Full width */
  fullWidth?: boolean;
}

const sizeClasses = {
  sm: 'h-8 text-sm px-2.5',
  md: 'h-10 text-sm px-3',
  lg: 'h-12 text-base px-4',
};

// =====================================
// FORMATTING UTILITIES
// =====================================

function formatNumber(
  value: number | null,
  options: {
    format: 'number' | 'currency' | 'percentage';
    precision?: number;
    currency?: string;
    locale?: string;
  }
): string {
  if (value === null || value === undefined || isNaN(value)) return '';

  const { format, precision = 2, currency = 'TRY', locale = 'tr-TR' } = options;

  try {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat(locale, {
          style: 'currency',
          currency,
          minimumFractionDigits: precision,
          maximumFractionDigits: precision,
        }).format(value);

      case 'percentage':
        return new Intl.NumberFormat(locale, {
          style: 'percent',
          minimumFractionDigits: precision,
          maximumFractionDigits: precision,
        }).format(value / 100);

      default:
        return new Intl.NumberFormat(locale, {
          minimumFractionDigits: 0,
          maximumFractionDigits: precision,
        }).format(value);
    }
  } catch {
    return String(value);
  }
}

function parseNumber(value: string, locale: string = 'tr-TR'): number | null {
  if (!value || value.trim() === '') return null;

  // Remove currency symbols, percentage signs, and whitespace
  let cleaned = value.replace(/[₺$€£%\s]/g, '');

  // Handle locale-specific decimal/thousand separators
  if (locale === 'tr-TR') {
    // Turkish: 1.234,56 -> 1234.56
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else {
    // English: 1,234.56 -> 1234.56
    cleaned = cleaned.replace(/,/g, '');
  }

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
}

// =====================================
// NUMBER INPUT COMPONENT
// =====================================

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      value,
      onChange,
      min,
      max,
      step = 1,
      precision = 2,
      format = 'number',
      currency = 'TRY',
      locale = 'tr-TR',
      showControls = false,
      prefix,
      suffix,
      error = false,
      errorMessage,
      size = 'md',
      fullWidth = true,
      className,
      disabled,
      placeholder,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [displayValue, setDisplayValue] = useState('');

    // Update display value when value prop changes
    useEffect(() => {
      if (!isFocused) {
        setDisplayValue(
          formatNumber(value ?? null, { format, precision, currency, locale })
        );
      }
    }, [value, format, precision, currency, locale, isFocused]);

    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
        // Show raw number on focus for easier editing
        if (value !== null && value !== undefined) {
          setDisplayValue(String(value));
        }
        onFocus?.(e);
      },
      [value, onFocus]
    );

    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        // Format on blur
        const parsed = parseNumber(displayValue, locale);
        if (parsed !== null) {
          // Apply constraints
          let constrained = parsed;
          if (min !== undefined) constrained = Math.max(constrained, min);
          if (max !== undefined) constrained = Math.min(constrained, max);
          onChange?.(constrained);
        } else {
          onChange?.(null);
        }
        onBlur?.(e);
      },
      [displayValue, locale, min, max, onChange, onBlur]
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;

      // Allow digits, decimal separator (comma for TR, dot for EN), and minus sign
      // Filter out invalid characters but allow intermediate states like "123," or "123."
      const allowedPattern = locale === 'tr-TR'
        ? /^-?[\d.,]*$/
        : /^-?[\d,.]*$/;

      if (!allowedPattern.test(inputValue) && inputValue !== '') {
        return; // Don't update if invalid characters
      }

      setDisplayValue(inputValue);

      // Parse and emit value on each change (for controlled components)
      // Allow intermediate states like "123," to pass through without emitting
      const parsed = parseNumber(inputValue, locale);
      if (parsed !== null) {
        onChange?.(parsed);
      } else if (inputValue === '' || inputValue === '-') {
        onChange?.(null);
      }
      // Don't call onChange for intermediate states like "123," - wait for blur
    };

    const handleIncrement = () => {
      const current = value ?? 0;
      const newValue = current + step;
      if (max === undefined || newValue <= max) {
        onChange?.(newValue);
      }
    };

    const handleDecrement = () => {
      const current = value ?? 0;
      const newValue = current - step;
      if (min === undefined || newValue >= min) {
        onChange?.(newValue);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleIncrement();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleDecrement();
      }
    };

    return (
      <div className={cn('relative', fullWidth && 'w-full')}>
        <div className="relative flex">
          {/* Prefix */}
          {prefix && (
            <span
              className={cn(
                'inline-flex items-center px-3 rounded-l-md border border-r-0',
                'bg-slate-100 border-slate-300 text-slate-600 text-sm',
                error && 'border-red-500',
                disabled && 'opacity-50'
              )}
            >
              {prefix}
            </span>
          )}

          {/* Input */}
          <input
            ref={ref}
            type="text"
            inputMode="decimal"
            value={displayValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            className={cn(
              'outline-none transition-all duration-200 flex-1 text-right',
              'bg-slate-50 border border-slate-300',
              'text-slate-900',
              'hover:border-slate-400',
              'focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:bg-white',
              'placeholder:text-slate-400',
              'font-mono',
              sizeClasses[size],
              !prefix && 'rounded-l-md',
              !suffix && !showControls && 'rounded-r-md',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
              disabled && 'opacity-50 cursor-not-allowed bg-slate-100',
              className
            )}
            {...props}
          />

          {/* Suffix */}
          {suffix && !showControls && (
            <span
              className={cn(
                'inline-flex items-center px-3 rounded-r-md border border-l-0',
                'bg-slate-100 border-slate-300 text-slate-600 text-sm',
                error && 'border-red-500',
                disabled && 'opacity-50'
              )}
            >
              {suffix}
            </span>
          )}

          {/* Controls */}
          {showControls && (
            <div className="flex flex-col border border-l-0 border-slate-300 rounded-r-md overflow-hidden">
              <button
                type="button"
                onClick={handleIncrement}
                disabled={disabled || (max !== undefined && (value ?? 0) >= max)}
                className={cn(
                  'flex-1 px-2 bg-slate-100 hover:bg-slate-200',
                  'text-slate-600 hover:text-slate-900',
                  'transition-colors duration-150',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'focus:outline-none focus:ring-1 focus:ring-inset focus:ring-slate-900'
                )}
                tabIndex={-1}
              >
                <ChevronUpIcon className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={handleDecrement}
                disabled={disabled || (min !== undefined && (value ?? 0) <= min)}
                className={cn(
                  'flex-1 px-2 bg-slate-100 hover:bg-slate-200',
                  'text-slate-600 hover:text-slate-900',
                  'transition-colors duration-150',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'focus:outline-none focus:ring-1 focus:ring-inset focus:ring-slate-900',
                  'border-t border-slate-300'
                )}
                tabIndex={-1}
              >
                <ChevronDownIcon className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>

        {/* Error message */}
        {errorMessage && (
          <p className="mt-1 text-xs text-red-600">{errorMessage}</p>
        )}
      </div>
    );
  }
);

NumberInput.displayName = 'NumberInput';

// =====================================
// CONVENIENCE VARIANTS
// =====================================

export interface CurrencyInputProps extends Omit<NumberInputProps, 'format'> {
  /** Show currency symbol in value */
  showCurrencySymbol?: boolean;
}

export function CurrencyInput({
  showCurrencySymbol = false,
  placeholder = '0',
  precision = 0,
  ...props
}: CurrencyInputProps) {
  return (
    <NumberInput
      format={showCurrencySymbol ? 'currency' : 'number'}
      precision={precision}
      placeholder={placeholder}
      {...props}
    />
  );
}

export interface PercentageInputProps extends Omit<NumberInputProps, 'format' | 'min' | 'max'> {
  allowNegative?: boolean;
  allowOver100?: boolean;
}

export function PercentageInput({
  allowNegative = false,
  allowOver100 = false,
  ...props
}: PercentageInputProps) {
  return (
    <NumberInput
      format="percentage"
      min={allowNegative ? undefined : 0}
      max={allowOver100 ? undefined : 100}
      {...props}
    />
  );
}

export default NumberInput;
