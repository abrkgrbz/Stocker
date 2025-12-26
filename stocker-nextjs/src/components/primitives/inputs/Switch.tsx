'use client';

/**
 * =====================================
 * SWITCH/TOGGLE COMPONENT
 * =====================================
 *
 * Enterprise toggle switch.
 * Linear/Raycast/Vercel aesthetic.
 */

import React, { forwardRef } from 'react';
import { Switch as HeadlessSwitch } from '@headlessui/react';
import { cn } from '@/lib/cn';

// =====================================
// SWITCH PROPS
// =====================================

export interface SwitchProps {
  /** Checked state */
  checked: boolean;
  /** Change handler */
  onChange: (checked: boolean) => void;
  /** Label text */
  label?: string;
  /** Description text */
  description?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Label position */
  labelPosition?: 'left' | 'right';
  /** Additional class names */
  className?: string;
  /** Screen reader label */
  srLabel?: string;
}

const sizeClasses = {
  sm: {
    switch: 'h-5 w-9',
    thumb: 'h-3 w-3',
    translate: 'translate-x-4',
    label: 'text-sm',
    description: 'text-xs',
  },
  md: {
    switch: 'h-6 w-11',
    thumb: 'h-4 w-4',
    translate: 'translate-x-5',
    label: 'text-sm',
    description: 'text-xs',
  },
  lg: {
    switch: 'h-7 w-14',
    thumb: 'h-5 w-5',
    translate: 'translate-x-7',
    label: 'text-base',
    description: 'text-sm',
  },
};

// =====================================
// SWITCH COMPONENT
// =====================================

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      checked,
      onChange,
      label,
      description,
      disabled = false,
      size = 'md',
      labelPosition = 'right',
      className,
      srLabel,
    },
    ref
  ) => {
    const sizes = sizeClasses[size];

    const switchElement = (
      <HeadlessSwitch
        ref={ref}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className={cn(
          'relative inline-flex shrink-0 cursor-pointer rounded-full',
          'border-2 border-transparent transition-colors duration-200 ease-in-out',
          'focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2',
          checked ? 'bg-slate-900' : 'bg-slate-200',
          disabled && 'opacity-50 cursor-not-allowed',
          sizes.switch
        )}
      >
        {srLabel && <span className="sr-only">{srLabel}</span>}
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none inline-block rounded-full bg-white shadow-lg',
            'ring-0 transition duration-200 ease-in-out',
            checked ? sizes.translate : 'translate-x-1',
            sizes.thumb
          )}
        />
      </HeadlessSwitch>
    );

    if (!label && !description) {
      return <div className={className}>{switchElement}</div>;
    }

    return (
      <div
        className={cn(
          'flex items-start gap-3',
          labelPosition === 'left' && 'flex-row-reverse justify-end',
          className
        )}
      >
        {switchElement}
        <div className="flex flex-col">
          {label && (
            <span
              className={cn(
                'font-medium text-slate-900',
                disabled && 'opacity-50',
                sizes.label
              )}
            >
              {label}
            </span>
          )}
          {description && (
            <span className={cn('text-slate-500 mt-0.5', sizes.description)}>
              {description}
            </span>
          )}
        </div>
      </div>
    );
  }
);

Switch.displayName = 'Switch';

// =====================================
// TOGGLE ALIAS (Common naming alternative)
// =====================================

export const Toggle = Switch;
export type ToggleProps = SwitchProps;

export default Switch;
