'use client';

/**
 * =====================================
 * STEPS/STEPPER COMPONENT
 * =====================================
 *
 * Multi-step progress indicator.
 * Linear/Raycast/Vercel aesthetic.
 */

import React from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/cn';

// =====================================
// TYPES
// =====================================

export type StepStatus = 'completed' | 'current' | 'upcoming';

export interface StepItem {
  /** Step key */
  key: string;
  /** Step title */
  title: string;
  /** Step description */
  description?: string;
  /** Step icon (optional, shows number by default) */
  icon?: React.ReactNode;
  /** Disabled state */
  disabled?: boolean;
}

// =====================================
// STEPS PROPS
// =====================================

export interface StepsProps {
  /** Step items */
  items: StepItem[];
  /** Current step key */
  current: string;
  /** Direction */
  direction?: 'horizontal' | 'vertical';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Click handler for steps */
  onChange?: (key: string) => void;
  /** Allow clicking on completed steps only */
  clickableOnlyCompleted?: boolean;
  /** Additional class names */
  className?: string;
}

const sizeClasses = {
  sm: {
    circle: 'h-6 w-6 text-xs',
    title: 'text-xs',
    description: 'text-xs',
    connector: 'h-0.5',
    verticalConnector: 'w-0.5 h-8',
  },
  md: {
    circle: 'h-8 w-8 text-sm',
    title: 'text-sm',
    description: 'text-xs',
    connector: 'h-0.5',
    verticalConnector: 'w-0.5 h-12',
  },
  lg: {
    circle: 'h-10 w-10 text-base',
    title: 'text-base',
    description: 'text-sm',
    connector: 'h-1',
    verticalConnector: 'w-1 h-16',
  },
};

// =====================================
// STEPS COMPONENT
// =====================================

export function Steps({
  items,
  current,
  direction = 'horizontal',
  size = 'md',
  onChange,
  clickableOnlyCompleted = true,
  className,
}: StepsProps) {
  const sizes = sizeClasses[size];
  const currentIndex = items.findIndex((item) => item.key === current);

  const getStatus = (index: number): StepStatus => {
    if (index < currentIndex) return 'completed';
    if (index === currentIndex) return 'current';
    return 'upcoming';
  };

  const isClickable = (item: StepItem, index: number): boolean => {
    if (item.disabled) return false;
    if (!onChange) return false;
    if (clickableOnlyCompleted) {
      return index < currentIndex;
    }
    return true;
  };

  const handleClick = (item: StepItem, index: number) => {
    if (isClickable(item, index)) {
      onChange?.(item.key);
    }
  };

  return (
    <nav aria-label="İlerleme" className={className}>
      <ol
        className={cn(
          'flex',
          direction === 'horizontal' ? 'items-center' : 'flex-col'
        )}
      >
        {items.map((item, index) => {
          const status = getStatus(index);
          const clickable = isClickable(item, index);
          const isLast = index === items.length - 1;

          return (
            <li
              key={item.key}
              className={cn(
                'relative flex',
                direction === 'horizontal'
                  ? 'flex-1 items-center'
                  : 'items-start pb-8 last:pb-0'
              )}
            >
              {/* Step indicator */}
              <div
                className={cn(
                  'flex flex-col',
                  direction === 'horizontal' ? 'items-center' : 'items-start'
                )}
              >
                <button
                  onClick={() => handleClick(item, index)}
                  disabled={!clickable}
                  className={cn(
                    'relative z-10 flex items-center justify-center rounded-full',
                    'font-medium transition-all duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2',
                    sizes.circle,

                    // Completed
                    status === 'completed' && [
                      'bg-slate-900 text-white',
                      clickable && 'hover:bg-slate-700 cursor-pointer',
                    ],

                    // Current
                    status === 'current' && [
                      'bg-white border-2 border-slate-900 text-slate-900',
                    ],

                    // Upcoming
                    status === 'upcoming' && [
                      'bg-white border-2 border-slate-300 text-slate-400',
                    ],

                    // Disabled
                    item.disabled && 'opacity-50 cursor-not-allowed'
                  )}
                  aria-current={status === 'current' ? 'step' : undefined}
                >
                  {status === 'completed' ? (
                    <CheckIcon className="h-4 w-4" />
                  ) : item.icon ? (
                    item.icon
                  ) : (
                    index + 1
                  )}
                </button>

                {/* Title and description */}
                <div
                  className={cn(
                    direction === 'horizontal'
                      ? 'mt-2 text-center'
                      : 'ml-3 -mt-1'
                  )}
                >
                  <p
                    className={cn(
                      'font-medium',
                      sizes.title,
                      status === 'upcoming' ? 'text-slate-400' : 'text-slate-900'
                    )}
                  >
                    {item.title}
                  </p>
                  {item.description && (
                    <p
                      className={cn(
                        'mt-0.5 text-slate-500',
                        sizes.description
                      )}
                    >
                      {item.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div
                  className={cn(
                    direction === 'horizontal'
                      ? cn('flex-1 mx-4', sizes.connector)
                      : cn('absolute left-4 top-8 -translate-x-1/2', sizes.verticalConnector),
                    status === 'completed' || status === 'current'
                      ? 'bg-slate-900'
                      : 'bg-slate-200'
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// =====================================
// SIMPLE STEPS (Just circles, no text)
// =====================================

export interface SimpleStepsProps {
  /** Total number of steps */
  total: number;
  /** Current step (1-indexed) */
  current: number;
  /** Click handler */
  onChange?: (step: number) => void;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional class names */
  className?: string;
}

const simpleSizeClasses = {
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5',
  lg: 'h-3 w-3',
};

export function SimpleSteps({
  total,
  current,
  onChange,
  size = 'md',
  className,
}: SimpleStepsProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {Array.from({ length: total }).map((_, index) => {
        const step = index + 1;
        const isCompleted = step < current;
        const isCurrent = step === current;

        return (
          <button
            key={step}
            onClick={() => onChange?.(step)}
            disabled={!onChange || step > current}
            className={cn(
              'rounded-full transition-all duration-200',
              simpleSizeClasses[size],
              isCompleted && 'bg-slate-900',
              isCurrent && 'bg-slate-900 ring-2 ring-slate-300',
              step > current && 'bg-slate-200',
              onChange && step <= current && 'cursor-pointer hover:opacity-80',
              (!onChange || step > current) && 'cursor-default'
            )}
            aria-label={`Adım ${step}`}
            aria-current={isCurrent ? 'step' : undefined}
          />
        );
      })}
    </div>
  );
}

// =====================================
// PROGRESS STEPS (Linear progress bar)
// =====================================

export interface ProgressStepsProps {
  /** Total number of steps */
  total: number;
  /** Current step (1-indexed) */
  current: number;
  /** Show step numbers */
  showNumbers?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional class names */
  className?: string;
}

const progressSizeClasses = {
  sm: 'h-1',
  md: 'h-1.5',
  lg: 'h-2',
};

export function ProgressSteps({
  total,
  current,
  showNumbers = false,
  size = 'md',
  className,
}: ProgressStepsProps) {
  const progress = ((current - 1) / (total - 1)) * 100;

  return (
    <div className={cn('w-full', className)}>
      {showNumbers && (
        <div className="flex justify-between mb-2 text-xs text-slate-500">
          <span>Adım {current}</span>
          <span>{total} adım</span>
        </div>
      )}
      <div
        className={cn(
          'w-full bg-slate-200 rounded-full overflow-hidden',
          progressSizeClasses[size]
        )}
      >
        <div
          className="bg-slate-900 h-full transition-all duration-300 rounded-full"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
}

export default Steps;
