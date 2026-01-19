'use client';

/**
 * =====================================
 * TABLE EMPTY STATE COMPONENT
 * =====================================
 *
 * Reusable empty state for Ant Design Tables.
 * Follows monochrome design system with Heroicons.
 */

import React from 'react';
import { cn } from '@/lib/cn';
import { InboxIcon } from '@heroicons/react/24/outline';

export interface TableEmptyStateProps {
  /** Custom icon component */
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  /** Main title text */
  title?: string;
  /** Optional description text */
  description?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Empty state component for use with Ant Design Table's locale.emptyText prop.
 *
 * @example
 * ```tsx
 * import { TableEmptyState } from '@/components/primitives';
 * import { CubeIcon } from '@heroicons/react/24/outline';
 *
 * <Table
 *   locale={{
 *     emptyText: <TableEmptyState
 *       icon={CubeIcon}
 *       title="Ürün bulunamadı"
 *       description="Henüz ürün eklenmemiş veya filtrelere uygun kayıt yok."
 *     />
 *   }}
 * />
 * ```
 */
export function TableEmptyState({
  icon: Icon = InboxIcon,
  title = 'Kayıt bulunamadı',
  description,
  className,
}: TableEmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 text-center',
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
        <Icon className="w-6 h-6 text-slate-400" aria-hidden="true" />
      </div>
      <span className="text-sm font-medium text-slate-900">{title}</span>
      {description && (
        <span className="text-xs text-slate-500 mt-1 max-w-xs">{description}</span>
      )}
    </div>
  );
}

export default TableEmptyState;
