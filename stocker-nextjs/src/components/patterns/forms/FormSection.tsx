'use client';

/**
 * =====================================
 * FORM SECTION COMPONENT
 * =====================================
 *
 * Groups form fields with a header following CustomerForm pattern.
 * Features:
 * - Uppercase tracking title
 * - Optional description
 * - 12-column grid layout for children
 */

import React from 'react';
import { cn } from '@/lib/cn';

export interface FormSectionProps {
  /** Section title */
  title: string;
  /** Optional description */
  description?: string;
  /** Form fields */
  children: React.ReactNode;
  /** Whether to use grid layout */
  useGrid?: boolean;
  /** Custom gap between grid items */
  gap?: 2 | 3 | 4 | 5 | 6;
  /** Additional class names */
  className?: string;
}

const gapClasses = {
  2: 'gap-2',
  3: 'gap-3',
  4: 'gap-4',
  5: 'gap-5',
  6: 'gap-6',
};

export function FormSection({
  title,
  description,
  children,
  useGrid = true,
  gap = 4,
  className,
}: FormSectionProps) {
  return (
    <div className={cn('mb-8', className)}>
      {/* Section Header */}
      <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
        {title}
      </h3>

      {/* Optional Description */}
      {description && (
        <p className="text-sm text-slate-500 mb-4">{description}</p>
      )}

      {/* Content */}
      {useGrid ? (
        <div className={cn('grid grid-cols-12', gapClasses[gap])}>
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  );
}

/**
 * Form Field Wrapper with label
 */
export interface FormFieldProps {
  /** Field label */
  label?: string;
  /** Required indicator */
  required?: boolean;
  /** Grid column span (1-12) */
  span?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  /** Error message */
  error?: string;
  /** Helper text */
  hint?: string;
  /** Field content */
  children: React.ReactNode;
  /** Additional class names */
  className?: string;
}

const spanClasses: Record<number, string> = {
  1: 'col-span-1',
  2: 'col-span-2',
  3: 'col-span-3',
  4: 'col-span-4',
  5: 'col-span-5',
  6: 'col-span-6',
  7: 'col-span-7',
  8: 'col-span-8',
  9: 'col-span-9',
  10: 'col-span-10',
  11: 'col-span-11',
  12: 'col-span-12',
};

export function FormField({
  label,
  required,
  span = 6,
  error,
  hint,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn(spanClasses[span], className)}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-slate-600 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      {/* Field */}
      {children}

      {/* Error message */}
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}

      {/* Hint text */}
      {hint && !error && (
        <p className="mt-1 text-xs text-slate-400">{hint}</p>
      )}
    </div>
  );
}

/**
 * Form Actions (Submit/Cancel buttons)
 */
export interface FormActionsProps {
  children: React.ReactNode;
  /** Alignment */
  align?: 'left' | 'center' | 'right' | 'between';
  /** Additional class names */
  className?: string;
}

const alignClasses = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
  between: 'justify-between',
};

export function FormActions({
  children,
  align = 'right',
  className,
}: FormActionsProps) {
  return (
    <div className={cn('flex items-center gap-3 pt-6 border-t border-slate-100', alignClasses[align], className)}>
      {children}
    </div>
  );
}

export default FormSection;
