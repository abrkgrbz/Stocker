'use client';

/**
 * =====================================
 * STATUS BADGE COMPONENT
 * =====================================
 *
 * Reusable status badge for inventory list pages.
 * Follows Stocker monochrome design system.
 */

import React from 'react';
import { cn } from '@/lib/cn';
import {
  CheckCircleIcon,
  XCircleIcon,
  StarIcon,
  ExclamationTriangleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

export type StatusBadgeVariant =
  | 'active'
  | 'inactive'
  | 'default'
  | 'warning'
  | 'danger'
  | 'expired'
  | 'expiring'
  | 'count';

export interface StatusBadgeProps {
  /** Badge variant determines styling */
  variant: StatusBadgeVariant;
  /** Text to display */
  children?: React.ReactNode;
  /** Show icon before text */
  showIcon?: boolean;
  /** Custom icon override */
  icon?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md';
}

const variantStyles: Record<StatusBadgeVariant, string> = {
  active: 'bg-slate-900 text-white',
  inactive: 'bg-slate-200 text-slate-600',
  default: 'bg-amber-100 text-amber-800',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  expired: 'bg-red-100 text-red-700',
  expiring: 'bg-amber-100 text-amber-700',
  count: 'bg-slate-100 text-slate-700',
};

const variantIcons: Record<StatusBadgeVariant, React.ReactNode> = {
  active: <CheckCircleIcon className="w-3.5 h-3.5" />,
  inactive: <XCircleIcon className="w-3.5 h-3.5" />,
  default: <StarIcon className="w-3.5 h-3.5" />,
  warning: <ExclamationTriangleIcon className="w-3.5 h-3.5" />,
  danger: <ExclamationTriangleIcon className="w-3.5 h-3.5" />,
  expired: <ClockIcon className="w-3.5 h-3.5" />,
  expiring: <ClockIcon className="w-3.5 h-3.5" />,
  count: null,
};

const defaultLabels: Record<StatusBadgeVariant, string> = {
  active: 'Aktif',
  inactive: 'Pasif',
  default: 'Varsayılan',
  warning: 'Uyarı',
  danger: 'Kritik',
  expired: 'Süresi Dolmuş',
  expiring: 'Süresi Dolacak',
  count: '',
};

/**
 * StatusBadge component for displaying status indicators in tables and lists.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <StatusBadge variant="active" />
 * <StatusBadge variant="inactive" />
 *
 * // With custom text
 * <StatusBadge variant="warning">Düşük Stok</StatusBadge>
 *
 * // With icon
 * <StatusBadge variant="active" showIcon />
 *
 * // Count badge
 * <StatusBadge variant="count">24</StatusBadge>
 * ```
 */
export function StatusBadge({
  variant,
  children,
  showIcon = false,
  icon,
  className,
  size = 'md',
}: StatusBadgeProps) {
  const displayIcon = icon || (showIcon ? variantIcons[variant] : null);
  const displayText = children ?? defaultLabels[variant];

  const sizeStyles = size === 'sm'
    ? 'px-2 py-0.5 text-xs'
    : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md font-medium',
        sizeStyles,
        variantStyles[variant],
        className
      )}
    >
      {displayIcon}
      {displayText}
    </span>
  );
}

/**
 * Convenience component for Active/Inactive status
 */
export function ActiveStatusBadge({ isActive, showIcon = false }: { isActive: boolean; showIcon?: boolean }) {
  return (
    <StatusBadge variant={isActive ? 'active' : 'inactive'} showIcon={showIcon} />
  );
}

/**
 * Convenience component for count badges
 */
export function CountBadge({ count, className }: { count: number | string; className?: string }) {
  return (
    <StatusBadge variant="count" className={className}>
      {count}
    </StatusBadge>
  );
}

export default StatusBadge;
