'use client';

/**
 * =====================================
 * VERGİ NO INPUT COMPONENT
 * =====================================
 *
 * Turkish Tax Number (Vergi Numarası) input.
 * - 10 digits for companies
 * - 11 digits for individuals (same as TC Kimlik No)
 */

import React, { forwardRef, useState, useCallback } from 'react';
import { cn } from '@/lib/cn';

export interface TaxNumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  /** Current value */
  value?: string;
  /** Change handler */
  onChange?: (value: string) => void;
  /** Type: company (10 digits) or individual (11 digits) */
  type?: 'company' | 'individual';
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
 * Validate company tax number (10 digits)
 * Uses mod 10 checksum algorithm
 */
export function validateCompanyTaxNumber(taxNo: string): boolean {
  if (!/^\d{10}$/.test(taxNo)) return false;

  const digits = taxNo.split('').map(Number);
  let sum = 0;

  for (let i = 0; i < 9; i++) {
    const v = (digits[i] + (9 - i)) % 10;
    sum += (v * Math.pow(2, 9 - i)) % 9 || 9;
  }

  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === digits[9];
}

/**
 * Basic format validation
 */
export function isValidTaxNumberFormat(taxNo: string, type: 'company' | 'individual'): boolean {
  const expectedLength = type === 'company' ? 10 : 11;
  const pattern = new RegExp(`^\\d{${expectedLength}}$`);
  return pattern.test(taxNo);
}

export const TaxNumberInput = forwardRef<HTMLInputElement, TaxNumberInputProps>(
  (
    {
      value = '',
      onChange,
      type = 'company',
      error = false,
      errorMessage,
      size = 'md',
      fullWidth = true,
      className,
      disabled,
      placeholder,
      ...props
    },
    ref
  ) => {
    const maxLength = type === 'company' ? 10 : 11;
    const defaultPlaceholder = type === 'company' ? 'Vergi Numarası (10 hane)' : 'TC Kimlik / Vergi No';

    const [internalValue, setInternalValue] = useState(value);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const digits = e.target.value.replace(/\D/g, '').slice(0, maxLength);
        setInternalValue(digits);
        onChange?.(digits);
      },
      [onChange, maxLength]
    );

    React.useEffect(() => {
      setInternalValue(value);
    }, [value]);

    // Validation
    const hasValidationError =
      internalValue.length === maxLength &&
      !isValidTaxNumberFormat(internalValue, type);

    const showError = error || hasValidationError;
    const displayErrorMessage =
      errorMessage || (hasValidationError ? 'Geçersiz vergi numarası' : undefined);

    return (
      <div className={cn('relative', fullWidth && 'w-full')}>
        <input
          ref={ref}
          type="text"
          inputMode="numeric"
          value={internalValue}
          onChange={handleChange}
          disabled={disabled}
          placeholder={placeholder || defaultPlaceholder}
          maxLength={maxLength}
          className={cn(
            'outline-none transition-all duration-200 rounded-md',
            'bg-slate-50 border border-slate-300',
            'hover:border-slate-400',
            'focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:bg-white',
            'placeholder:text-slate-400',
            'tracking-wider',
            sizeClasses[size],
            showError && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            disabled && 'opacity-50 cursor-not-allowed bg-slate-100',
            fullWidth && 'w-full',
            className
          )}
          {...props}
        />
        {displayErrorMessage && (
          <p className="mt-1 text-xs text-red-600">{displayErrorMessage}</p>
        )}
        <span
          className={cn(
            'absolute right-3 top-1/2 -translate-y-1/2 text-xs',
            internalValue.length === maxLength && !showError
              ? 'text-emerald-500'
              : 'text-slate-400'
          )}
        >
          {internalValue.length}/{maxLength}
        </span>
      </div>
    );
  }
);

TaxNumberInput.displayName = 'TaxNumberInput';

export default TaxNumberInput;
