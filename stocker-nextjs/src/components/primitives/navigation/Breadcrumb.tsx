'use client';

/**
 * =====================================
 * BREADCRUMB COMPONENT
 * =====================================
 *
 * Navigation breadcrumb trail.
 * Linear/Raycast/Vercel aesthetic.
 */

import React from 'react';
import Link from 'next/link';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/cn';

// =====================================
// TYPES
// =====================================

export interface BreadcrumbItem {
  /** Label text */
  label: string;
  /** Link href (optional - last item typically has no href) */
  href?: string;
  /** Icon */
  icon?: React.ReactNode;
}

// =====================================
// BREADCRUMB PROPS
// =====================================

export interface BreadcrumbProps {
  /** Breadcrumb items */
  items: BreadcrumbItem[];
  /** Show home icon as first item */
  showHome?: boolean;
  /** Home href */
  homeHref?: string;
  /** Separator icon */
  separator?: React.ReactNode;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Max items to show (will collapse middle items) */
  maxItems?: number;
  /** Additional class names */
  className?: string;
}

const sizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

const iconSizeClasses = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

// =====================================
// BREADCRUMB COMPONENT
// =====================================

export function Breadcrumb({
  items,
  showHome = true,
  homeHref = '/',
  separator,
  size = 'md',
  maxItems,
  className,
}: BreadcrumbProps) {
  const defaultSeparator = (
    <ChevronRightIcon
      className={cn('text-slate-400 flex-shrink-0', iconSizeClasses[size])}
    />
  );

  const separatorElement = separator || defaultSeparator;

  // Handle collapsing
  let displayItems = items;
  let hasCollapsed = false;

  if (maxItems && items.length > maxItems) {
    const firstItems = items.slice(0, 1);
    const lastItems = items.slice(-(maxItems - 2));
    displayItems = [...firstItems, { label: '...', href: undefined }, ...lastItems];
    hasCollapsed = true;
  }

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className={cn('flex items-center gap-2', sizeClasses[size])}>
        {/* Home icon */}
        {showHome && (
          <>
            <li>
              <Link
                href={homeHref}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <HomeIcon className={iconSizeClasses[size]} />
                <span className="sr-only">Ana Sayfa</span>
              </Link>
            </li>
            <li aria-hidden="true">{separatorElement}</li>
          </>
        )}

        {/* Breadcrumb items */}
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          const isCollapsedIndicator = hasCollapsed && item.label === '...';

          return (
            <React.Fragment key={`${item.label}-${index}`}>
              <li className="flex items-center gap-1.5">
                {item.icon && (
                  <span className="text-slate-400">{item.icon}</span>
                )}

                {isCollapsedIndicator ? (
                  <span className="text-slate-400">...</span>
                ) : item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={cn(
                      isLast
                        ? 'text-slate-900 font-medium'
                        : 'text-slate-500'
                    )}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {item.label}
                  </span>
                )}
              </li>

              {!isLast && (
                <li aria-hidden="true">{separatorElement}</li>
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

// =====================================
// SIMPLE BREADCRUMB (String array input)
// =====================================

export interface SimpleBreadcrumbProps {
  /** Path segments */
  segments: string[];
  /** Base path */
  basePath?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional class names */
  className?: string;
}

export function SimpleBreadcrumb({
  segments,
  basePath = '',
  size = 'md',
  className,
}: SimpleBreadcrumbProps) {
  const items: BreadcrumbItem[] = segments.map((segment, index) => {
    const pathSegments = segments.slice(0, index + 1);
    const href = `${basePath}/${pathSegments.join('/')}`;

    return {
      label: segment,
      href: index < segments.length - 1 ? href : undefined,
    };
  });

  return <Breadcrumb items={items} size={size} className={className} />;
}

export default Breadcrumb;
