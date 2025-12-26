'use client';

/**
 * =====================================
 * TURKEY IBAN INPUT COMPONENT
 * =====================================
 *
 * Turkish IBAN input with formatting and validation.
 * Format: TR00 0000 0000 0000 0000 0000 00 (26 chars)
 */

import React, { forwardRef, useState, useCallback } from 'react';
import { cn } from '@/lib/cn';

export interface IBANInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  /** Current value (unformatted) */
  value?: string;
  /** Change handler (receives unformatted value) */
  onChange?: (value: string) => void;
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
 * Format IBAN for display
 * Input: TR123456789012345678901234 -> TR12 3456 7890 1234 5678 9012 34
 */
function formatIBAN(value: string): string {
  // Remove spaces and convert to uppercase
  let cleaned = value.replace(/\s/g, '').toUpperCase();

  // Ensure TR prefix
  if (!cleaned.startsWith('TR') && cleaned.length > 0) {
    // If starts with digits, add TR
    if (/^\d/.test(cleaned)) {
      cleaned = 'TR' + cleaned;
    }
  }

  // Limit to 26 characters
  cleaned = cleaned.slice(0, 26);

  // Format with spaces every 4 characters
  const parts: string[] = [];
  for (let i = 0; i < cleaned.length; i += 4) {
    parts.push(cleaned.slice(i, i + 4));
  }

  return parts.join(' ');
}

/**
 * Extract clean IBAN (no spaces)
 */
function extractIBAN(value: string): string {
  return value.replace(/\s/g, '').toUpperCase().slice(0, 26);
}

/**
 * Validate Turkish IBAN format
 */
export function isValidTurkishIBAN(iban: string): boolean {
  const cleaned = extractIBAN(iban);

  // Must be 26 characters, start with TR
  if (!/^TR\d{24}$/.test(cleaned)) return false;

  // IBAN checksum validation (mod 97)
  // Move first 4 chars to end and convert letters to numbers (A=10, B=11, etc.)
  const rearranged = cleaned.slice(4) + cleaned.slice(0, 4);
  const numeric = rearranged.replace(/[A-Z]/g, (char) =>
    (char.charCodeAt(0) - 55).toString()
  );

  // Mod 97 check (use BigInt for large numbers)
  try {
    return BigInt(numeric) % BigInt(97) === BigInt(1);
  } catch {
    return false;
  }
}

export const IBANInput = forwardRef<HTMLInputElement, IBANInputProps>(
  (
    {
      value = '',
      onChange,
      error = false,
      errorMessage,
      size = 'md',
      fullWidth = true,
      className,
      disabled,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      placeholder: _placeholder,
      ...props
    },
    ref
  ) => {
    const [displayValue, setDisplayValue] = useState(() => formatIBAN(value));

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;
        const cleaned = extractIBAN(input);
        const formatted = formatIBAN(cleaned);

        setDisplayValue(formatted);
        onChange?.(cleaned);
      },
      [onChange]
    );

    React.useEffect(() => {
      setDisplayValue(formatIBAN(value));
    }, [value]);

    // Validation
    const cleanValue = extractIBAN(displayValue);
    const hasValidationError = cleanValue.length === 26 && !isValidTurkishIBAN(cleanValue);
    const showError = error || hasValidationError;
    const displayErrorMessage = errorMessage || (hasValidationError ? 'Geçersiz IBAN' : undefined);

    return (
      <div className={cn('relative', fullWidth && 'w-full')}>
        <div className="relative flex">
          <span
            className={cn(
              'inline-flex items-center px-3 rounded-l-md border border-r-0',
              'bg-slate-100 border-slate-300 text-slate-600 text-sm font-mono',
              showError && 'border-red-500',
              disabled && 'opacity-50'
            )}
          >
            TR
          </span>
          <input
            ref={ref}
            type="text"
            value={displayValue.startsWith('TR') ? displayValue.slice(2).trim() : displayValue}
            onChange={(e) => {
              const withTR = 'TR' + e.target.value.replace(/^TR\s*/i, '');
              handleChange({ ...e, target: { ...e.target, value: withTR } } as React.ChangeEvent<HTMLInputElement>);
            }}
            disabled={disabled}
            placeholder="00 0000 0000 0000 0000 0000 00"
            className={cn(
              'outline-none transition-all duration-200 flex-1 rounded-r-md',
              'bg-slate-50 border border-slate-300',
              'hover:border-slate-400',
              'focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:bg-white',
              'placeholder:text-slate-400',
              'font-mono tracking-wider',
              sizeClasses[size],
              showError && 'border-red-500 focus:border-red-500 focus:ring-red-500',
              disabled && 'opacity-50 cursor-not-allowed bg-slate-100',
              fullWidth && 'w-full',
              className
            )}
            {...props}
          />
        </div>
        {displayErrorMessage && (
          <p className="mt-1 text-xs text-red-600">{displayErrorMessage}</p>
        )}
      </div>
    );
  }
);

IBANInput.displayName = 'IBANInput';

export default IBANInput;
