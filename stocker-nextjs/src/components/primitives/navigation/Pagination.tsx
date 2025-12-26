'use client';

/**
 * =====================================
 * PAGINATION COMPONENT
 * =====================================
 *
 * Standalone pagination component.
 * Linear/Raycast/Vercel aesthetic.
 */

import React, { useMemo } from 'react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/cn';

// =====================================
// PAGINATION PROPS
// =====================================

export interface PaginationProps {
  /** Current page (1-indexed) */
  page: number;
  /** Total number of pages */
  totalPages: number;
  /** Page change handler */
  onChange: (page: number) => void;
  /** Show first/last buttons */
  showFirstLast?: boolean;
  /** Number of sibling pages to show */
  siblings?: number;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Disabled state */
  disabled?: boolean;
  /** Additional class names */
  className?: string;
}

const sizeClasses = {
  sm: {
    button: 'h-7 min-w-7 text-xs',
    icon: 'h-3 w-3',
  },
  md: {
    button: 'h-9 min-w-9 text-sm',
    icon: 'h-4 w-4',
  },
  lg: {
    button: 'h-11 min-w-11 text-base',
    icon: 'h-5 w-5',
  },
};

// =====================================
// PAGINATION RANGE HELPER
// =====================================

function getPaginationRange(
  page: number,
  totalPages: number,
  siblings: number
): (number | 'ellipsis')[] {
  const range: (number | 'ellipsis')[] = [];

  // Always show first page
  range.push(1);

  // Calculate start and end of sibling range
  const leftSibling = Math.max(2, page - siblings);
  const rightSibling = Math.min(totalPages - 1, page + siblings);

  // Add left ellipsis if needed
  if (leftSibling > 2) {
    range.push('ellipsis');
  }

  // Add sibling pages
  for (let i = leftSibling; i <= rightSibling; i++) {
    if (i !== 1 && i !== totalPages) {
      range.push(i);
    }
  }

  // Add right ellipsis if needed
  if (rightSibling < totalPages - 1) {
    range.push('ellipsis');
  }

  // Always show last page (if more than 1 page)
  if (totalPages > 1) {
    range.push(totalPages);
  }

  return range;
}

// =====================================
// PAGINATION COMPONENT
// =====================================

export function Pagination({
  page,
  totalPages,
  onChange,
  showFirstLast = false,
  siblings = 1,
  size = 'md',
  disabled = false,
  className,
}: PaginationProps) {
  const sizes = sizeClasses[size];

  const range = useMemo(
    () => getPaginationRange(page, totalPages, siblings),
    [page, totalPages, siblings]
  );

  if (totalPages <= 1) {
    return null;
  }

  const canGoPrevious = page > 1;
  const canGoNext = page < totalPages;

  const buttonBase = cn(
    'inline-flex items-center justify-center rounded-md font-medium',
    'transition-colors duration-200',
    'focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-1',
    disabled && 'opacity-50 pointer-events-none',
    sizes.button
  );

  const navButton = cn(
    buttonBase,
    'text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed'
  );

  const pageButton = (isActive: boolean) =>
    cn(
      buttonBase,
      'px-3',
      isActive
        ? 'bg-slate-900 text-white'
        : 'text-slate-600 hover:bg-slate-100'
    );

  return (
    <nav
      aria-label="Sayfalama"
      className={cn('flex items-center gap-1', className)}
    >
      {/* First page */}
      {showFirstLast && (
        <button
          onClick={() => onChange(1)}
          disabled={!canGoPrevious || disabled}
          className={navButton}
          aria-label="İlk sayfa"
        >
          <ChevronDoubleLeftIcon className={sizes.icon} />
        </button>
      )}

      {/* Previous page */}
      <button
        onClick={() => onChange(page - 1)}
        disabled={!canGoPrevious || disabled}
        className={navButton}
        aria-label="Önceki sayfa"
      >
        <ChevronLeftIcon className={sizes.icon} />
      </button>

      {/* Page numbers */}
      {range.map((item, index) => {
        if (item === 'ellipsis') {
          return (
            <span
              key={`ellipsis-${index}`}
              className={cn(
                'inline-flex items-center justify-center text-slate-400',
                sizes.button
              )}
            >
              ...
            </span>
          );
        }

        const isActive = item === page;
        return (
          <button
            key={item}
            onClick={() => onChange(item)}
            disabled={disabled}
            className={pageButton(isActive)}
            aria-label={`Sayfa ${item}`}
            aria-current={isActive ? 'page' : undefined}
          >
            {item}
          </button>
        );
      })}

      {/* Next page */}
      <button
        onClick={() => onChange(page + 1)}
        disabled={!canGoNext || disabled}
        className={navButton}
        aria-label="Sonraki sayfa"
      >
        <ChevronRightIcon className={sizes.icon} />
      </button>

      {/* Last page */}
      {showFirstLast && (
        <button
          onClick={() => onChange(totalPages)}
          disabled={!canGoNext || disabled}
          className={navButton}
          aria-label="Son sayfa"
        >
          <ChevronDoubleRightIcon className={sizes.icon} />
        </button>
      )}
    </nav>
  );
}

// =====================================
// PAGINATION INFO
// =====================================

export interface PaginationInfoProps {
  /** Current page */
  page: number;
  /** Items per page */
  pageSize: number;
  /** Total items */
  total: number;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional class names */
  className?: string;
}

const infoSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

export function PaginationInfo({
  page,
  pageSize,
  total,
  size = 'md',
  className,
}: PaginationInfoProps) {
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <p className={cn('text-slate-600', infoSizeClasses[size], className)}>
      <span className="font-medium">{start}</span>
      {' - '}
      <span className="font-medium">{end}</span>
      {' / '}
      <span className="font-medium">{total}</span>
      {' kayıt'}
    </p>
  );
}

// =====================================
// PAGINATION WITH INFO (Combined)
// =====================================

export interface PaginationWithInfoProps extends Omit<PaginationProps, 'totalPages'> {
  /** Items per page */
  pageSize: number;
  /** Total items */
  total: number;
  /** Page size options */
  pageSizeOptions?: number[];
  /** Page size change handler */
  onPageSizeChange?: (pageSize: number) => void;
}

export function PaginationWithInfo({
  page,
  pageSize,
  total,
  onChange,
  pageSizeOptions,
  onPageSizeChange,
  size = 'md',
  disabled = false,
  className,
  ...paginationProps
}: PaginationWithInfoProps) {
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-4',
        className
      )}
    >
      <div className="flex items-center gap-4">
        <PaginationInfo
          page={page}
          pageSize={pageSize}
          total={total}
          size={size}
        />

        {pageSizeOptions && onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className={cn('text-slate-600', infoSizeClasses[size])}>
              Sayfa başına:
            </span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              disabled={disabled}
              className={cn(
                'rounded border-slate-300 bg-white',
                'focus:border-slate-900 focus:ring-slate-900',
                infoSizeClasses[size]
              )}
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        onChange={onChange}
        size={size}
        disabled={disabled}
        {...paginationProps}
      />
    </div>
  );
}

export default Pagination;
