'use client';

/**
 * =====================================
 * CHECKBOX COMPONENT
 * =====================================
 *
 * Enterprise checkbox with group support.
 * Linear/Raycast/Vercel aesthetic.
 */

import React, { forwardRef, createContext, useContext } from 'react';
import { cn } from '@/lib/cn';

// =====================================
// CHECKBOX GROUP CONTEXT
// =====================================

interface CheckboxGroupContextType {
  values: string[];
  onChange: (value: string, checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const CheckboxGroupContext = createContext<CheckboxGroupContextType | null>(null);

// =====================================
// CHECKBOX PROPS
// =====================================

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange'> {
  /** Label text */
  label?: string;
  /** Description text */
  description?: string;
  /** Error state */
  error?: boolean;
  /** Error message */
  errorMessage?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Value for group usage */
  value?: string;
  /** Checked state (controlled) */
  checked?: boolean;
  /** Change handler */
  onChange?: (checked: boolean) => void;
}

const sizeClasses = {
  sm: {
    checkbox: 'h-4 w-4',
    label: 'text-sm',
    description: 'text-xs',
  },
  md: {
    checkbox: 'h-5 w-5',
    label: 'text-sm',
    description: 'text-xs',
  },
  lg: {
    checkbox: 'h-6 w-6',
    label: 'text-base',
    description: 'text-sm',
  },
};

// =====================================
// CHECKBOX COMPONENT
// =====================================

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      description,
      error = false,
      errorMessage,
      size = 'md',
      value,
      checked,
      onChange,
      disabled,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const groupContext = useContext(CheckboxGroupContext);
    const checkboxId = id || `checkbox-${Math.random().toString(36).slice(2, 9)}`;

    // Determine if checked from group context or prop
    const isChecked = groupContext
      ? value
        ? groupContext.values.includes(value)
        : false
      : checked;

    // Determine disabled state
    const isDisabled = disabled || groupContext?.disabled;

    // Use size from context or prop
    const currentSize = groupContext?.size || size;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (groupContext && value) {
        groupContext.onChange(value, e.target.checked);
      } else {
        onChange?.(e.target.checked);
      }
    };

    return (
      <div className={cn('relative flex items-start', className)}>
        <div className="flex h-6 items-center">
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            checked={isChecked}
            onChange={handleChange}
            disabled={isDisabled}
            className={cn(
              'rounded border-slate-300 bg-slate-50',
              'text-slate-900 transition-all duration-200',
              'focus:ring-2 focus:ring-slate-900 focus:ring-offset-0',
              'hover:border-slate-400',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-red-500 focus:ring-red-500',
              sizeClasses[currentSize].checkbox
            )}
            {...props}
          />
        </div>
        {(label || description) && (
          <div className="ml-3">
            {label && (
              <label
                htmlFor={checkboxId}
                className={cn(
                  'font-medium text-slate-900',
                  isDisabled && 'opacity-50 cursor-not-allowed',
                  sizeClasses[currentSize].label
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p
                className={cn(
                  'text-slate-500 mt-0.5',
                  sizeClasses[currentSize].description
                )}
              >
                {description}
              </p>
            )}
            {errorMessage && (
              <p className="mt-1 text-xs text-red-600">{errorMessage}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

// =====================================
// CHECKBOX GROUP PROPS
// =====================================

export interface CheckboxGroupProps {
  /** Group label */
  label?: string;
  /** Description text */
  description?: string;
  /** Selected values */
  value: string[];
  /** Change handler */
  onChange: (values: string[]) => void;
  /** Error state */
  error?: boolean;
  /** Error message */
  errorMessage?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Layout direction */
  direction?: 'horizontal' | 'vertical';
  /** Children (Checkbox components) */
  children: React.ReactNode;
  /** Additional class names */
  className?: string;
}

// =====================================
// CHECKBOX GROUP COMPONENT
// =====================================

export function CheckboxGroup({
  label,
  description,
  value,
  onChange,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  error: _error = false,
  errorMessage,
  disabled = false,
  size = 'md',
  direction = 'vertical',
  children,
  className,
}: CheckboxGroupProps) {
  const handleChange = (itemValue: string, checked: boolean) => {
    if (checked) {
      onChange([...value, itemValue]);
    } else {
      onChange(value.filter((v) => v !== itemValue));
    }
  };

  return (
    <CheckboxGroupContext.Provider
      value={{ values: value, onChange: handleChange, disabled, size }}
    >
      <fieldset className={className}>
        {label && (
          <legend className="text-sm font-medium text-slate-900 mb-2">
            {label}
          </legend>
        )}
        {description && (
          <p className="text-xs text-slate-500 mb-3">{description}</p>
        )}
        <div
          className={cn(
            'flex',
            direction === 'vertical' ? 'flex-col gap-3' : 'flex-row flex-wrap gap-6'
          )}
        >
          {children}
        </div>
        {errorMessage && (
          <p className="mt-2 text-xs text-red-600">{errorMessage}</p>
        )}
      </fieldset>
    </CheckboxGroupContext.Provider>
  );
}

export default Checkbox;
