'use client';

/**
 * =====================================
 * ENTERPRISE SPINNER COMPONENT
 * =====================================
 *
 * Loading indicators with multiple variants.
 */

import React from 'react';
import { cn } from '@/lib/cn';

export interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'white' | 'slate';
  className?: string;
}

const sizeClasses = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

const colorClasses = {
  primary: 'text-slate-900',
  white: 'text-white',
  slate: 'text-slate-400',
};

export function Spinner({ size = 'md', color = 'primary', className }: SpinnerProps) {
  return (
    <svg
      className={cn('animate-spin', sizeClasses[size], colorClasses[color], className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

export interface LoadingScreenProps {
  message?: string;
  showSpinner?: boolean;
}

export function LoadingScreen({ message = 'Yükleniyor...', showSpinner = true }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        {showSpinner && <Spinner size="xl" />}
        <p className="text-sm font-medium text-slate-600">{message}</p>
      </div>
    </div>
  );
}

export interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingState({ message, size = 'md', className }: LoadingStateProps) {
  const spinnerSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md';
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm';
  const padding = size === 'sm' ? 'py-4' : size === 'lg' ? 'py-12' : 'py-8';

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', padding, className)}>
      <Spinner size={spinnerSize} color="slate" />
      {message && <p className={cn('text-slate-500', textSize)}>{message}</p>}
    </div>
  );
}

export default Spinner;
