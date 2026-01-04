'use client';

/**
 * =====================================
 * ENTERPRISE INPUT COMPONENT
 * =====================================
 *
 * Base input component following CustomerForm styling pattern.
 * Features:
 * - Variants: default, borderless, filled
 * - Sizes: sm, md, lg
 * - Prefix/suffix support
 * - Error states with validation
 * - Full accessibility support
 */

import React, { forwardRef } from 'react';
import { cn } from '@/lib/cn';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  /** Visual variant */
  variant?: 'default' | 'borderless' | 'filled';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Error state */
  error?: boolean;
  /** Error message */
  errorMessage?: string;
  /** Left element (icon or text) */
  prefix?: React.ReactNode;
  /** Right element (icon or text) */
  suffix?: React.ReactNode;
  /** Full width */
  fullWidth?: boolean;
}

const sizeClasses = {
  sm: 'h-8 text-sm px-2.5',
  md: 'h-10 text-sm px-3',
  lg: 'h-12 text-base px-4',
};

const variantClasses = {
  default: `
    bg-slate-50 border border-slate-300 rounded-md
    text-slate-900
    hover:border-slate-400
    focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:bg-white
    placeholder:text-slate-400
  `,
  borderless: `
    bg-transparent border-0 border-b border-slate-200
    text-slate-900
    hover:border-slate-400
    focus:border-slate-900 focus:ring-0
    rounded-none
    placeholder:text-slate-400
  `,
  filled: `
    bg-slate-100 border border-transparent rounded-md
    text-slate-900
    hover:bg-slate-200
    focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900
    placeholder:text-slate-500
  `,
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = 'default',
      size = 'md',
      error = false,
      errorMessage,
      prefix,
      suffix,
      fullWidth = true,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const hasAddons = prefix || suffix;

    const inputElement = (
      <input
        ref={ref}
        disabled={disabled}
        className={cn(
          // Base styles
          'outline-none transition-all duration-200',
          sizeClasses[size],
          variantClasses[variant],
          // State styles
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
          disabled && 'opacity-50 cursor-not-allowed bg-slate-100',
          // Width
          fullWidth && 'w-full',
          // Addon adjustments
          prefix && 'pl-10',
          suffix && 'pr-10',
          className
        )}
        {...props}
      />
    );

    if (!hasAddons) {
      return (
        <div className={cn('relative', fullWidth && 'w-full')}>
          {inputElement}
          {errorMessage && (
            <p className="mt-1 text-xs text-red-600">{errorMessage}</p>
          )}
        </div>
      );
    }

    return (
      <div className={cn('relative', fullWidth && 'w-full')}>
        <div className="relative">
          {prefix && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              {prefix}
            </div>
          )}
          {inputElement}
          {suffix && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              {suffix}
            </div>
          )}
        </div>
        {errorMessage && (
          <p className="mt-1 text-xs text-red-600">{errorMessage}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
