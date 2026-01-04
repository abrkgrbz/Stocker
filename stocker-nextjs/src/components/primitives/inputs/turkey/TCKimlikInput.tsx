'use client';

/**
 * =====================================
 * TC KİMLİK NO INPUT COMPONENT
 * =====================================
 *
 * Turkish National ID number input with validation.
 * - 11 digits
 * - Cannot start with 0
 * - Checksum validation (optional)
 */

import React, { forwardRef, useState, useCallback } from 'react';
import { cn } from '@/lib/cn';

export interface TCKimlikInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'size'> {
  /** Current value */
  value?: string;
  /** Change handler */
  onChange?: (value: string) => void;
  /** Validate checksum */
  validateChecksum?: boolean;
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
 * Validate TC Kimlik No checksum
 * Algorithm:
 * - Sum of odd positions (1,3,5,7,9) * 7 - sum of even positions (2,4,6,8) mod 10 = 10th digit
 * - Sum of first 10 digits mod 10 = 11th digit
 */
export function validateTCKimlik(tcNo: string): boolean {
  if (!/^\d{11}$/.test(tcNo)) return false;
  if (tcNo[0] === '0') return false;

  const digits = tcNo.split('').map(Number);

  // First checksum (10th digit)
  const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
  const check1 = (oddSum * 7 - evenSum) % 10;
  if (check1 !== digits[9]) return false;

  // Second checksum (11th digit)
  const firstTenSum = digits.slice(0, 10).reduce((a, b) => a + b, 0);
  const check2 = firstTenSum % 10;
  if (check2 !== digits[10]) return false;

  return true;
}

/**
 * Basic format validation (11 digits, not starting with 0)
 */
export function isValidTCKimlikFormat(tcNo: string): boolean {
  return /^[1-9]\d{10}$/.test(tcNo);
}

export const TCKimlikInput = forwardRef<HTMLInputElement, TCKimlikInputProps>(
  (
    {
      value = '',
      onChange,
      validateChecksum = false,
      error = false,
      errorMessage,
      size = 'md',
      fullWidth = true,
      className,
      disabled,
      placeholder = 'TC Kimlik Numarası',
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState(value);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        // Only allow digits, max 11
        const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
        setInternalValue(digits);
        onChange?.(digits);
      },
      [onChange]
    );

    // Sync with external value changes
    React.useEffect(() => {
      setInternalValue(value);
    }, [value]);

    // Determine if there's a validation error
    const hasValidationError =
      internalValue.length === 11 &&
      (validateChecksum
        ? !validateTCKimlik(internalValue)
        : !isValidTCKimlikFormat(internalValue));

    const showError = error || hasValidationError;
    const displayErrorMessage =
      errorMessage ||
      (hasValidationError ? 'Geçersiz TC Kimlik Numarası' : undefined);

    return (
      <div className={cn('relative', fullWidth && 'w-full')}>
        <input
          ref={ref}
          type="text"
          inputMode="numeric"
          value={internalValue}
          onChange={handleChange}
          disabled={disabled}
          placeholder={placeholder}
          maxLength={11}
          className={cn(
            'outline-none transition-all duration-200 rounded-md',
            'bg-slate-50 border border-slate-300',
            'hover:border-slate-400',
            'focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:bg-white',
            'placeholder:text-slate-400',
            'tracking-wider', // Better readability for numbers
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
        {/* Character count indicator */}
        <span
          className={cn(
            'absolute right-3 top-1/2 -translate-y-1/2 text-xs',
            internalValue.length === 11 && !showError
              ? 'text-emerald-500'
              : 'text-slate-400'
          )}
        >
          {internalValue.length}/11
        </span>
      </div>
    );
  }
);

TCKimlikInput.displayName = 'TCKimlikInput';

export default TCKimlikInput;
