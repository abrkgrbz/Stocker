'use client';

/**
 * =====================================
 * TURKEY PHONE INPUT COMPONENT
 * =====================================
 *
 * Turkish phone number input with formatting.
 * Format: 0 (5XX) XXX XX XX or +90 (5XX) XXX XX XX
 */

import React, { forwardRef, useState, useCallback } from 'react';
import { cn } from '@/lib/cn';

export interface PhoneInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'size'> {
  /** Current value (unformatted) */
  value?: string;
  /** Change handler (receives unformatted value) */
  onChange?: (value: string) => void;
  /** Show country code prefix */
  showCountryCode?: boolean;
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

/**
 * Format phone number for display
 * Input: 5321234567 -> Output: (532) 123 45 67
 */
function formatPhoneNumber(value: string): string {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');

  // Remove leading 0 or 90
  let cleaned = digits;
  if (cleaned.startsWith('90')) {
    cleaned = cleaned.slice(2);
  } else if (cleaned.startsWith('0')) {
    cleaned = cleaned.slice(1);
  }

  // Limit to 10 digits
  cleaned = cleaned.slice(0, 10);

  // Format as (5XX) XXX XX XX
  if (cleaned.length === 0) return '';
  if (cleaned.length <= 3) return `(${cleaned}`;
  if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
  if (cleaned.length <= 8) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8)}`;
}

/**
 * Extract raw digits from formatted value
 */
function extractDigits(value: string): string {
  const digits = value.replace(/\D/g, '');
  // Remove leading 0 or 90
  if (digits.startsWith('90')) return digits.slice(2);
  if (digits.startsWith('0')) return digits.slice(1);
  return digits.slice(0, 10);
}

/**
 * Validate Turkish phone number
 */
export function isValidTurkishPhone(value: string): boolean {
  const digits = extractDigits(value);
  // Must be 10 digits starting with 5 (mobile)
  return digits.length === 10 && digits.startsWith('5');
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      value = '',
      onChange,
      showCountryCode = true,
      error = false,
      errorMessage,
      size = 'md',
      fullWidth = true,
      className,
      disabled,
      placeholder = '(5XX) XXX XX XX',
      ...props
    },
    ref
  ) => {
    const [displayValue, setDisplayValue] = useState(() => formatPhoneNumber(value));

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;
        const digits = extractDigits(input);
        const formatted = formatPhoneNumber(digits);

        setDisplayValue(formatted);
        onChange?.(digits);
      },
      [onChange]
    );

    // Sync with external value changes
    React.useEffect(() => {
      setDisplayValue(formatPhoneNumber(value));
    }, [value]);

    return (
      <div className={cn('relative', fullWidth && 'w-full')}>
        <div className="relative flex">
          {showCountryCode && (
            <span
              className={cn(
                'inline-flex items-center px-3 rounded-l-md border border-r-0',
                'bg-slate-100 border-slate-300 text-slate-600 text-sm',
                error && 'border-red-500',
                disabled && 'opacity-50'
              )}
            >
              +90
            </span>
          )}
          <input
            ref={ref}
            type="tel"
            inputMode="numeric"
            value={displayValue}
            onChange={handleChange}
            disabled={disabled}
            placeholder={placeholder}
            className={cn(
              'outline-none transition-all duration-200 flex-1',
              'bg-slate-50 border border-slate-300',
              'text-slate-900',
              'hover:border-slate-400',
              'focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:bg-white',
              'placeholder:text-slate-400',
              sizeClasses[size],
              showCountryCode ? 'rounded-r-md' : 'rounded-md',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
              disabled && 'opacity-50 cursor-not-allowed bg-slate-100',
              fullWidth && 'w-full',
              className
            )}
            {...props}
          />
        </div>
        {errorMessage && (
          <p className="mt-1 text-xs text-red-600">{errorMessage}</p>
        )}
      </div>
    );
  }
);

PhoneInput.displayName = 'PhoneInput';

export default PhoneInput;
