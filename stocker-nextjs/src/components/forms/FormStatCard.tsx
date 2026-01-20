'use client';

import React from 'react';

interface FormStatCardProps {
  /** The statistic value */
  value: number | string;
  /** Label below the value */
  label: string;
  /** Format function for the value */
  format?: (value: number | string) => string;
  /** Color variant for the value */
  variant?: 'default' | 'success' | 'warning' | 'danger';
  /** Whether to show plus sign for positive numbers */
  showSign?: boolean;
  /** Custom class name for the value */
  valueClassName?: string;
  /** Custom class name */
  className?: string;
}

export function FormStatCard({
  value,
  label,
  format,
  variant = 'default',
  showSign = false,
  valueClassName,
  className = '',
}: FormStatCardProps) {
  const variantClasses = {
    default: 'text-slate-800',
    success: 'text-emerald-600',
    warning: 'text-amber-600',
    danger: 'text-red-600',
  };

  const formattedValue = format ? format(value) : value;
  const displayValue = showSign && typeof value === 'number' && value > 0
    ? `+${formattedValue}`
    : formattedValue;

  return (
    <div className={`p-4 bg-slate-50 rounded-lg border border-slate-200 text-center ${className}`}>
      <div className={`text-2xl font-semibold ${valueClassName || variantClasses[variant]}`}>
        {displayValue}
      </div>
      <div className="text-xs text-slate-500 mt-1">{label}</div>
    </div>
  );
}

interface FormStatGridProps {
  /** Stat items to display */
  stats: Array<{
    value: number | string;
    label: string;
    format?: (value: number | string) => string;
    variant?: 'default' | 'success' | 'warning' | 'danger';
    showSign?: boolean;
    valueClassName?: string;
  }>;
  /** Number of columns */
  columns?: 2 | 3 | 4 | 6;
  /** Custom class name */
  className?: string;
}

export function FormStatGrid({
  stats,
  columns = 4,
  className = '',
}: FormStatGridProps) {
  const colClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    6: 'grid-cols-6',
  };

  return (
    <div className={`grid ${colClasses[columns]} gap-4 ${className}`}>
      {stats.map((stat, index) => (
        <FormStatCard key={index} {...stat} />
      ))}
    </div>
  );
}

export default FormStatCard;
