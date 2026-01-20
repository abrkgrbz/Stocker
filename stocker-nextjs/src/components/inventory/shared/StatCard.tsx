'use client';

/**
 * =====================================
 * STAT CARD COMPONENT
 * =====================================
 *
 * Reusable stats card for inventory list page dashboards.
 * Follows Stocker monochrome design system.
 */

import React from 'react';
import { cn } from '@/lib/cn';

export type StatCardVariant = 'default' | 'highlight' | 'success' | 'warning' | 'danger';

export interface StatCardProps {
  /** Main value to display */
  value: number | string;
  /** Label text below value */
  label: string;
  /** Icon component */
  icon: React.ReactNode;
  /** Card style variant */
  variant?: StatCardVariant;
  /** Optional subtitle or secondary info */
  subtitle?: string;
  /** Additional CSS classes */
  className?: string;
  /** Click handler */
  onClick?: () => void;
}

const variantStyles: Record<StatCardVariant, { card: string; iconBg: string; iconColor: string; valueColor: string }> = {
  default: {
    card: 'bg-white border-slate-200',
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-600',
    valueColor: 'text-slate-900',
  },
  highlight: {
    card: 'bg-white border-slate-200',
    iconBg: 'bg-slate-900',
    iconColor: 'text-white',
    valueColor: 'text-slate-900',
  },
  success: {
    card: 'bg-white border-slate-200',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    valueColor: 'text-emerald-600',
  },
  warning: {
    card: 'bg-white border-slate-200',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    valueColor: 'text-amber-600',
  },
  danger: {
    card: 'bg-white border-slate-200',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    valueColor: 'text-red-600',
  },
};

/**
 * StatCard component for displaying KPI metrics in inventory dashboards.
 *
 * @example
 * ```tsx
 * import { CubeIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
 *
 * // Default stat card
 * <StatCard
 *   icon={<CubeIcon className="w-5 h-5" />}
 *   value={1234}
 *   label="Toplam Ürün"
 * />
 *
 * // Highlighted variant
 * <StatCard
 *   icon={<CubeIcon className="w-5 h-5" />}
 *   value={1234}
 *   label="Toplam Ürün"
 *   variant="highlight"
 * />
 *
 * // Warning variant with subtitle
 * <StatCard
 *   icon={<ExclamationTriangleIcon className="w-5 h-5" />}
 *   value={15}
 *   label="Düşük Stok"
 *   subtitle="Dikkat gerektirir"
 *   variant="warning"
 * />
 * ```
 */
export function StatCard({
  value,
  label,
  icon,
  variant = 'default',
  subtitle,
  className,
  onClick,
}: StatCardProps) {
  const styles = variantStyles[variant];

  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      onClick={onClick}
      className={cn(
        'border rounded-xl p-5 text-left transition-all',
        styles.card,
        onClick && 'hover:border-slate-300 hover:shadow-sm cursor-pointer',
        className
      )}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center',
            styles.iconBg
          )}
        >
          <span className={styles.iconColor}>{icon}</span>
        </div>
      </div>
      <div className={cn('text-2xl font-bold', styles.valueColor)}>
        {typeof value === 'number' ? value.toLocaleString('tr-TR') : value}
      </div>
      <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
        {label}
      </div>
      {subtitle && (
        <div className="text-xs text-slate-400 mt-1">{subtitle}</div>
      )}
    </Component>
  );
}

/**
 * StatCardGrid wrapper for consistent grid layout
 */
export function StatCardGrid({
  children,
  columns = 4,
  className,
}: {
  children: React.ReactNode;
  columns?: 2 | 3 | 4 | 5 | 6;
  className?: string;
}) {
  const colClasses: Record<number, string> = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-5',
    6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
  };

  return (
    <div className={cn('grid gap-6 mb-8', colClasses[columns], className)}>
      {children}
    </div>
  );
}

export default StatCard;
