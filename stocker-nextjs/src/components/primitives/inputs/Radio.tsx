'use client';

/**
 * =====================================
 * RADIO COMPONENT
 * =====================================
 *
 * Enterprise radio button with group support.
 * Linear/Raycast/Vercel aesthetic.
 */

import React, { forwardRef, createContext, useContext } from 'react';
import { cn } from '@/lib/cn';

// =====================================
// RADIO GROUP CONTEXT
// =====================================

interface RadioGroupContextType {
  value: string | null;
  onChange: (value: string) => void;
  name: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const RadioGroupContext = createContext<RadioGroupContextType | null>(null);

// =====================================
// RADIO PROPS
// =====================================

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange'> {
  /** Label text */
  label?: string;
  /** Description text */
  description?: string;
  /** Error state */
  error?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Value for this radio option */
  value: string;
  /** Change handler (for standalone usage) */
  onChange?: (value: string) => void;
}

const sizeClasses = {
  sm: {
    radio: 'h-4 w-4',
    label: 'text-sm',
    description: 'text-xs',
  },
  md: {
    radio: 'h-5 w-5',
    label: 'text-sm',
    description: 'text-xs',
  },
  lg: {
    radio: 'h-6 w-6',
    label: 'text-base',
    description: 'text-sm',
  },
};

// =====================================
// RADIO COMPONENT
// =====================================

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      label,
      description,
      error = false,
      size = 'md',
      value,
      onChange,
      disabled,
      className,
      id,
      name,
      ...props
    },
    ref
  ) => {
    const groupContext = useContext(RadioGroupContext);
    const radioId = id || `radio-${value}-${Math.random().toString(36).slice(2, 9)}`;

    // Determine if checked from group context
    const isChecked = groupContext ? groupContext.value === value : props.checked;

    // Determine disabled state
    const isDisabled = disabled || groupContext?.disabled;

    // Use size from context or prop
    const currentSize = groupContext?.size || size;

    // Use name from context or prop
    const radioName = groupContext?.name || name;

    const handleChange = () => {
      if (groupContext) {
        groupContext.onChange(value);
      } else {
        onChange?.(value);
      }
    };

    return (
      <div className={cn('relative flex items-start', className)}>
        <div className="flex h-6 items-center">
          <input
            ref={ref}
            id={radioId}
            type="radio"
            name={radioName}
            value={value}
            checked={isChecked}
            onChange={handleChange}
            disabled={isDisabled}
            className={cn(
              'border-slate-300 bg-slate-50',
              'text-slate-900 transition-all duration-200',
              'focus:ring-2 focus:ring-slate-900 focus:ring-offset-0',
              'hover:border-slate-400',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-red-500 focus:ring-red-500',
              sizeClasses[currentSize].radio
            )}
            {...props}
          />
        </div>
        {(label || description) && (
          <div className="ml-3">
            {label && (
              <label
                htmlFor={radioId}
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
          </div>
        )}
      </div>
    );
  }
);

Radio.displayName = 'Radio';

// =====================================
// RADIO GROUP PROPS
// =====================================

export interface RadioGroupProps {
  /** Group name (required for form submission) */
  name: string;
  /** Group label */
  label?: string;
  /** Description text */
  description?: string;
  /** Selected value */
  value: string | null;
  /** Change handler */
  onChange: (value: string) => void;
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
  /** Children (Radio components) */
  children: React.ReactNode;
  /** Additional class names */
  className?: string;
}

// =====================================
// RADIO GROUP COMPONENT
// =====================================

export function RadioGroup({
  name,
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
}: RadioGroupProps) {
  return (
    <RadioGroupContext.Provider
      value={{ value, onChange, name, disabled, size }}
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
    </RadioGroupContext.Provider>
  );
}

export default Radio;
