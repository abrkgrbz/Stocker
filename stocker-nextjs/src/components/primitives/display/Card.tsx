'use client';

/**
 * =====================================
 * CARD COMPONENT
 * =====================================
 *
 * Enterprise card with header, body, footer.
 * Linear/Raycast/Vercel aesthetic.
 */

import React, { forwardRef } from 'react';
import { cn } from '@/lib/cn';

// =====================================
// CARD PROPS
// =====================================

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Card variant */
  variant?: 'default' | 'outlined' | 'elevated' | 'ghost';
  /** Padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Hover effect */
  hoverable?: boolean;
  /** Clickable card */
  clickable?: boolean;
  /** Selected state */
  selected?: boolean;
  /** Loading state */
  loading?: boolean;
}

const variantClasses = {
  default: 'bg-white border border-slate-200',
  outlined: 'bg-transparent border border-slate-300',
  elevated: 'bg-white shadow-md border border-slate-100',
  ghost: 'bg-transparent',
};

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

// =====================================
// CARD COMPONENT
// =====================================

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      hoverable = false,
      clickable = false,
      selected = false,
      loading = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg transition-all duration-200',
          variantClasses[variant],
          paddingClasses[padding],
          hoverable && 'hover:border-slate-300 hover:shadow-sm',
          clickable && 'cursor-pointer active:scale-[0.99]',
          selected && 'ring-2 ring-slate-900 border-slate-900',
          loading && 'animate-pulse',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// =====================================
// CARD HEADER
// =====================================

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Title text */
  title?: React.ReactNode;
  /** Subtitle text */
  subtitle?: React.ReactNode;
  /** Action element (right side) */
  action?: React.ReactNode;
  /** With bottom border */
  bordered?: boolean;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ title, subtitle, action, bordered = false, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-start justify-between gap-4',
          bordered && 'pb-4 mb-4 border-b border-slate-100',
          className
        )}
        {...props}
      >
        {(title || subtitle || children) && (
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className="text-base font-semibold text-slate-900 truncate">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="mt-0.5 text-sm text-slate-500 truncate">{subtitle}</p>
            )}
            {children}
          </div>
        )}
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

// =====================================
// CARD BODY
// =====================================

export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('flex-1', className)} {...props}>
        {children}
      </div>
    );
  }
);

CardBody.displayName = 'CardBody';

// =====================================
// CARD FOOTER
// =====================================

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** With top border */
  bordered?: boolean;
  /** Alignment */
  align?: 'left' | 'center' | 'right' | 'between';
}

const alignClasses = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
  between: 'justify-between',
};

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ bordered = false, align = 'right', className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center gap-2',
          alignClasses[align],
          bordered && 'pt-4 mt-4 border-t border-slate-100',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

// =====================================
// STAT CARD (Common pattern)
// =====================================

export interface StatCardProps {
  /** Label text */
  label: string;
  /** Value to display */
  value: React.ReactNode;
  /** Change indicator (percentage or description) */
  change?: {
    value: number | string;
    type: 'increase' | 'decrease' | 'neutral';
  };
  /** Icon */
  icon?: React.ReactNode;
  /** Additional class names */
  className?: string;
}

export function StatCard({ label, value, change, icon, className }: StatCardProps) {
  return (
    <Card className={cn('flex items-start gap-4', className)}>
      {icon && (
        <div className="p-2 rounded-lg bg-slate-100 text-slate-600">{icon}</div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-500 truncate">{label}</p>
        <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
        {change && (
          <p
            className={cn(
              'mt-1 text-sm',
              change.type === 'increase' && 'text-green-600',
              change.type === 'decrease' && 'text-red-600',
              change.type === 'neutral' && 'text-slate-500'
            )}
          >
            {change.type === 'increase' && '↑ '}
            {change.type === 'decrease' && '↓ '}
            {change.value}
          </p>
        )}
      </div>
    </Card>
  );
}

export default Card;
