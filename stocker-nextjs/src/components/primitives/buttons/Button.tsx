'use client';

/**
 * =====================================
 * ENTERPRISE BUTTON COMPONENT
 * =====================================
 *
 * Base button component with enterprise styling.
 */

import React, { forwardRef } from 'react';
import { cn } from '@/lib/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'link';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
}

const sizeClasses = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2.5',
};

const variantClasses = {
  primary: 'bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 disabled:bg-slate-300 disabled:text-slate-500',
  secondary: 'bg-white text-slate-900 border border-slate-300 hover:bg-slate-50 hover:border-slate-400 active:bg-slate-100 disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 active:bg-slate-200 disabled:text-slate-400',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:bg-red-200 disabled:text-red-400',
  link: 'bg-transparent text-slate-900 underline underline-offset-4 hover:text-slate-700 active:text-slate-950 disabled:text-slate-400 disabled:no-underline px-0 h-auto',
};

const Spinner = ({ className }: { className?: string }) => (
  <svg className={cn('animate-spin', className)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, icon, iconRight, fullWidth = false, className, disabled, children, ...props }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-md',
          'transition-all duration-200 outline-none',
          'focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2',
          sizeClasses[size],
          variantClasses[variant],
          isDisabled && 'cursor-not-allowed',
          loading && 'cursor-wait',
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <Spinner className="w-4 h-4" />
            <span>{children}</span>
          </>
        ) : (
          <>
            {icon && <span className="flex-shrink-0">{icon}</span>}
            {children}
            {iconRight && <span className="flex-shrink-0">{iconRight}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
