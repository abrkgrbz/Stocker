'use client';

/**
 * =====================================
 * SKELETON COMPONENT
 * =====================================
 *
 * Loading placeholder with animation.
 * Linear/Raycast/Vercel aesthetic.
 */

import React from 'react';
import { cn } from '@/lib/cn';

// =====================================
// SKELETON PROPS
// =====================================

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Width (CSS value) */
  width?: string | number;
  /** Height (CSS value) */
  height?: string | number;
  /** Shape variant */
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  /** Animation type */
  animation?: 'pulse' | 'wave' | 'none';
}

// =====================================
// SKELETON COMPONENT
// =====================================

export function Skeleton({
  width,
  height,
  variant = 'text',
  animation = 'pulse',
  className,
  style,
  ...props
}: SkeletonProps) {
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%]',
    none: '',
  };

  // Default dimensions based on variant
  const defaultHeight = variant === 'text' ? '1em' : undefined;
  const defaultWidth = variant === 'circular' ? height : undefined;

  return (
    <div
      className={cn(
        'bg-slate-200',
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={{
        width: width ?? defaultWidth,
        height: height ?? defaultHeight,
        ...style,
      }}
      {...props}
    />
  );
}

// =====================================
// SKELETON TEXT (Multiple lines)
// =====================================

export interface SkeletonTextProps {
  /** Number of lines */
  lines?: number;
  /** Line spacing */
  spacing?: 'sm' | 'md' | 'lg';
  /** Last line width percentage */
  lastLineWidth?: string;
  /** Animation type */
  animation?: 'pulse' | 'wave' | 'none';
  /** Additional class names */
  className?: string;
}

const spacingClasses = {
  sm: 'space-y-1',
  md: 'space-y-2',
  lg: 'space-y-3',
};

export function SkeletonText({
  lines = 3,
  spacing = 'md',
  lastLineWidth = '70%',
  animation = 'pulse',
  className,
}: SkeletonTextProps) {
  return (
    <div className={cn(spacingClasses[spacing], className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          height="1em"
          width={index === lines - 1 ? lastLineWidth : '100%'}
          animation={animation}
        />
      ))}
    </div>
  );
}

// =====================================
// SKELETON AVATAR
// =====================================

export interface SkeletonAvatarProps {
  /** Size in pixels */
  size?: number | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Animation type */
  animation?: 'pulse' | 'wave' | 'none';
  /** Additional class names */
  className?: string;
}

const avatarSizes = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
};

export function SkeletonAvatar({
  size = 'md',
  animation = 'pulse',
  className,
}: SkeletonAvatarProps) {
  const pixelSize = typeof size === 'number' ? size : avatarSizes[size];

  return (
    <Skeleton
      variant="circular"
      width={pixelSize}
      height={pixelSize}
      animation={animation}
      className={className}
    />
  );
}

// =====================================
// SKELETON CARD
// =====================================

export interface SkeletonCardProps {
  /** Show avatar */
  hasAvatar?: boolean;
  /** Number of text lines */
  lines?: number;
  /** Show action button */
  hasAction?: boolean;
  /** Animation type */
  animation?: 'pulse' | 'wave' | 'none';
  /** Additional class names */
  className?: string;
}

export function SkeletonCard({
  hasAvatar = true,
  lines = 2,
  hasAction = false,
  animation = 'pulse',
  className,
}: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'p-4 rounded-lg border border-slate-200 bg-white',
        className
      )}
    >
      <div className="flex items-start gap-3">
        {hasAvatar && <SkeletonAvatar size="md" animation={animation} />}

        <div className="flex-1 min-w-0">
          <Skeleton
            variant="text"
            height="1.25em"
            width="60%"
            animation={animation}
          />
          <div className="mt-2">
            <SkeletonText lines={lines} animation={animation} />
          </div>
        </div>

        {hasAction && (
          <Skeleton
            variant="rounded"
            width={80}
            height={32}
            animation={animation}
          />
        )}
      </div>
    </div>
  );
}

// =====================================
// SKELETON TABLE ROW
// =====================================

export interface SkeletonTableRowProps {
  /** Number of columns */
  columns?: number;
  /** Animation type */
  animation?: 'pulse' | 'wave' | 'none';
  /** Additional class names */
  className?: string;
}

export function SkeletonTableRow({
  columns = 4,
  animation = 'pulse',
  className,
}: SkeletonTableRowProps) {
  return (
    <tr className={className}>
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="px-4 py-3">
          <Skeleton
            variant="text"
            height="1em"
            width={index === 0 ? '80%' : `${60 + Math.random() * 30}%`}
            animation={animation}
          />
        </td>
      ))}
    </tr>
  );
}

// =====================================
// SKELETON TABLE
// =====================================

export interface SkeletonTableProps {
  /** Number of rows */
  rows?: number;
  /** Number of columns */
  columns?: number;
  /** Animation type */
  animation?: 'pulse' | 'wave' | 'none';
  /** Additional class names */
  className?: string;
}

export function SkeletonTable({
  rows = 5,
  columns = 4,
  animation = 'pulse',
  className,
}: SkeletonTableProps) {
  return (
    <div className={cn('overflow-hidden rounded-lg border border-slate-200', className)}>
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            {Array.from({ length: columns }).map((_, index) => (
              <th key={index} className="px-4 py-3 text-left">
                <Skeleton
                  variant="text"
                  height="0.75em"
                  width="60%"
                  animation={animation}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {Array.from({ length: rows }).map((_, index) => (
            <SkeletonTableRow
              key={index}
              columns={columns}
              animation={animation}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// =====================================
// SKELETON LIST
// =====================================

export interface SkeletonListProps {
  /** Number of items */
  items?: number;
  /** Show avatar */
  hasAvatar?: boolean;
  /** Animation type */
  animation?: 'pulse' | 'wave' | 'none';
  /** Additional class names */
  className?: string;
}

export function SkeletonList({
  items = 5,
  hasAvatar = true,
  animation = 'pulse',
  className,
}: SkeletonListProps) {
  return (
    <div className={cn('divide-y divide-slate-100', className)}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 py-3">
          {hasAvatar && <SkeletonAvatar size="sm" animation={animation} />}
          <div className="flex-1">
            <Skeleton
              variant="text"
              height="1em"
              width={`${50 + Math.random() * 30}%`}
              animation={animation}
            />
            <Skeleton
              variant="text"
              height="0.875em"
              width={`${30 + Math.random() * 20}%`}
              animation={animation}
              className="mt-1"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
