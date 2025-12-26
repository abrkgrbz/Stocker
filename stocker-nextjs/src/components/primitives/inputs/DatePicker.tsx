'use client';

/**
 * =====================================
 * DATE PICKER COMPONENT
 * =====================================
 *
 * Enterprise date picker with native input.
 * Uses native date input for better mobile support.
 * Linear/Raycast/Vercel aesthetic.
 */

import React, { forwardRef, useState, useCallback } from 'react';
import { CalendarIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/cn';

// =====================================
// DATE UTILITIES
// =====================================

function formatDate(date: Date | null, locale: string = 'tr-TR'): string {
  if (!date) return '';
  return date.toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function toInputDateString(date: Date | null): string {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseInputDate(value: string): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

// =====================================
// DATE PICKER PROPS
// =====================================

export interface DatePickerProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'size' | 'type'> {
  /** Current value */
  value?: Date | null;
  /** Change handler */
  onChange?: (date: Date | null) => void;
  /** Minimum date */
  minDate?: Date;
  /** Maximum date */
  maxDate?: Date;
  /** Locale for display formatting */
  locale?: string;
  /** Show clear button */
  showClear?: boolean;
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
  sm: 'h-8 text-sm pl-9 pr-8',
  md: 'h-10 text-sm pl-10 pr-10',
  lg: 'h-12 text-base pl-12 pr-12',
};

const iconSizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

// =====================================
// DATE PICKER COMPONENT
// =====================================

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  (
    {
      value,
      onChange,
      minDate,
      maxDate,
      locale = 'tr-TR',
      showClear = true,
      error = false,
      errorMessage,
      size = 'md',
      fullWidth = true,
      className,
      disabled,
      placeholder = 'Tarih seçiniz',
      ...props
    },
    ref
  ) => {
    const [showNativeInput, setShowNativeInput] = useState(false);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const date = parseInputDate(e.target.value);
        onChange?.(date);
      },
      [onChange]
    );

    const handleClear = useCallback(() => {
      onChange?.(null);
    }, [onChange]);

    const displayValue = value ? formatDate(value, locale) : '';
    const inputValue = toInputDateString(value ?? null);

    return (
      <div className={cn('relative', fullWidth && 'w-full')}>
        <div className="relative">
          {/* Calendar icon */}
          <CalendarIcon
            className={cn(
              'absolute top-1/2 -translate-y-1/2 left-3 text-slate-400 pointer-events-none',
              iconSizeClasses[size]
            )}
          />

          {/* Display input (formatted) */}
          <input
            type="text"
            value={displayValue}
            readOnly
            placeholder={placeholder}
            disabled={disabled}
            onClick={() => !disabled && setShowNativeInput(true)}
            className={cn(
              'w-full rounded-md outline-none transition-all duration-200 cursor-pointer',
              'bg-slate-50 border border-slate-300',
              'text-slate-900',
              'hover:border-slate-400',
              'focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:bg-white',
              'placeholder:text-slate-400',
              sizeClasses[size],
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
              disabled && 'opacity-50 cursor-not-allowed bg-slate-100',
              className
            )}
          />

          {/* Native date input (overlaid, triggered on click) */}
          <input
            ref={ref}
            type="date"
            value={inputValue}
            onChange={handleChange}
            min={minDate ? toInputDateString(minDate) : undefined}
            max={maxDate ? toInputDateString(maxDate) : undefined}
            disabled={disabled}
            onBlur={() => setShowNativeInput(false)}
            className={cn(
              'absolute inset-0 opacity-0 cursor-pointer',
              showNativeInput ? 'pointer-events-auto' : 'pointer-events-none',
              disabled && 'cursor-not-allowed'
            )}
            {...props}
          />

          {/* Clear button */}
          {showClear && value && !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className={cn(
                'absolute top-1/2 -translate-y-1/2 right-3 p-0.5 rounded',
                'text-slate-400 hover:text-slate-600',
                'focus:outline-none focus:ring-2 focus:ring-slate-900',
                'transition-colors duration-200',
                iconSizeClasses[size]
              )}
              tabIndex={-1}
            >
              <XMarkIcon className="h-full w-full" />
            </button>
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

DatePicker.displayName = 'DatePicker';

// =====================================
// DATE RANGE PICKER
// =====================================

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface DateRangePickerProps {
  /** Current value */
  value?: DateRange;
  /** Change handler */
  onChange?: (range: DateRange) => void;
  /** Minimum date */
  minDate?: Date;
  /** Maximum date */
  maxDate?: Date;
  /** Locale for display formatting */
  locale?: string;
  /** Start date placeholder */
  startPlaceholder?: string;
  /** End date placeholder */
  endPlaceholder?: string;
  /** Error state */
  error?: boolean;
  /** Error message */
  errorMessage?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Full width */
  fullWidth?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Additional class names */
  className?: string;
}

export function DateRangePicker({
  value = { start: null, end: null },
  onChange,
  minDate,
  maxDate,
  locale = 'tr-TR',
  startPlaceholder = 'Başlangıç',
  endPlaceholder = 'Bitiş',
  error = false,
  errorMessage,
  size = 'md',
  fullWidth = true,
  disabled = false,
  className,
}: DateRangePickerProps) {
  const handleStartChange = (date: Date | null) => {
    onChange?.({ ...value, start: date });
  };

  const handleEndChange = (date: Date | null) => {
    onChange?.({ ...value, end: date });
  };

  return (
    <div className={cn('space-y-2', fullWidth && 'w-full', className)}>
      <div className="flex items-center gap-2">
        <DatePicker
          value={value.start}
          onChange={handleStartChange}
          minDate={minDate}
          maxDate={value.end || maxDate}
          locale={locale}
          placeholder={startPlaceholder}
          error={error}
          size={size}
          fullWidth
          disabled={disabled}
        />
        <span className="text-slate-400 text-sm shrink-0">—</span>
        <DatePicker
          value={value.end}
          onChange={handleEndChange}
          minDate={value.start || minDate}
          maxDate={maxDate}
          locale={locale}
          placeholder={endPlaceholder}
          error={error}
          size={size}
          fullWidth
          disabled={disabled}
        />
      </div>
      {errorMessage && (
        <p className="text-xs text-red-600">{errorMessage}</p>
      )}
    </div>
  );
}

export default DatePicker;
