'use client';

/**
 * =====================================
 * EMPTY STATE COMPONENT
 * =====================================
 *
 * Empty state with icon, title, description, action.
 * Linear/Raycast/Vercel aesthetic.
 */

import React from 'react';
import {
  InboxIcon,
  DocumentIcon,
  FolderIcon,
  MagnifyingGlassIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/cn';

// =====================================
// EMPTY PROPS
// =====================================

export interface EmptyProps {
  /** Icon to display */
  icon?: React.ReactNode;
  /** Preset icon type */
  type?: 'default' | 'search' | 'document' | 'folder' | 'error';
  /** Title text */
  title?: string;
  /** Description text */
  description?: string;
  /** Action button/element */
  action?: React.ReactNode;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional class names */
  className?: string;
}

const sizeClasses = {
  sm: {
    icon: 'h-10 w-10',
    title: 'text-sm',
    description: 'text-xs',
    padding: 'py-6',
  },
  md: {
    icon: 'h-12 w-12',
    title: 'text-base',
    description: 'text-sm',
    padding: 'py-10',
  },
  lg: {
    icon: 'h-16 w-16',
    title: 'text-lg',
    description: 'text-base',
    padding: 'py-16',
  },
};

const presetIcons = {
  default: InboxIcon,
  search: MagnifyingGlassIcon,
  document: DocumentIcon,
  folder: FolderIcon,
  error: ExclamationCircleIcon,
};

const presetTitles = {
  default: 'Veri bulunamadı',
  search: 'Sonuç bulunamadı',
  document: 'Belge yok',
  folder: 'Klasör boş',
  error: 'Bir hata oluştu',
};

const presetDescriptions = {
  default: 'Henüz herhangi bir veri eklenmemiş.',
  search: 'Arama kriterlerinize uygun sonuç bulunamadı.',
  document: 'Bu bölümde henüz belge yok.',
  folder: 'Bu klasörde henüz dosya yok.',
  error: 'Bir sorun oluştu. Lütfen tekrar deneyin.',
};

// =====================================
// EMPTY COMPONENT
// =====================================

export function Empty({
  icon,
  type = 'default',
  title,
  description,
  action,
  size = 'md',
  className,
}: EmptyProps) {
  const sizes = sizeClasses[size];
  const IconComponent = presetIcons[type];
  const displayIcon = icon || <IconComponent className={cn(sizes.icon, 'text-slate-300')} />;
  const displayTitle = title ?? presetTitles[type];
  const displayDescription = description ?? presetDescriptions[type];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        sizes.padding,
        className
      )}
    >
      <div className="mb-4">{displayIcon}</div>

      {displayTitle && (
        <h3 className={cn('font-medium text-slate-900', sizes.title)}>
          {displayTitle}
        </h3>
      )}

      {displayDescription && (
        <p className={cn('mt-1 text-slate-500 max-w-sm', sizes.description)}>
          {displayDescription}
        </p>
      )}

      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// =====================================
// SEARCH EMPTY (Convenience export)
// =====================================

export interface SearchEmptyProps {
  /** Search query that returned no results */
  query?: string;
  /** Custom description */
  description?: string;
  /** Clear search action */
  onClear?: () => void;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional class names */
  className?: string;
}

export function SearchEmpty({
  query,
  description,
  onClear,
  size = 'md',
  className,
}: SearchEmptyProps) {
  return (
    <Empty
      type="search"
      title={query ? `"${query}" için sonuç bulunamadı` : 'Sonuç bulunamadı'}
      description={description}
      size={size}
      action={
        onClear && (
          <button
            onClick={onClear}
            className="text-sm text-slate-600 hover:text-slate-900 underline"
          >
            Aramayı temizle
          </button>
        )
      }
      className={className}
    />
  );
}

// =====================================
// ERROR EMPTY (Convenience export)
// =====================================

export interface ErrorEmptyProps {
  /** Error message */
  message?: string;
  /** Retry action */
  onRetry?: () => void;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional class names */
  className?: string;
}

export function ErrorEmpty({
  message,
  onRetry,
  size = 'md',
  className,
}: ErrorEmptyProps) {
  return (
    <Empty
      type="error"
      description={message}
      size={size}
      action={
        onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors"
          >
            Tekrar Dene
          </button>
        )
      }
      className={className}
    />
  );
}

export default Empty;
