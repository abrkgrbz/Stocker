'use client';

/**
 * =====================================
 * PAGE LAYOUT COMPONENTS
 * =====================================
 *
 * Enterprise page layout patterns following
 * Linear/Raycast/Vercel design principles.
 *
 * Features:
 * - Page containers with max-width options
 * - Page headers with back navigation
 * - List page headers with icons
 * - Sticky action bars
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/cn';
import { Spinner } from '@/components/primitives/feedback';

// =====================================
// PAGE CONTAINER
// =====================================

export interface PageContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
  className?: string;
  withStickyBar?: boolean;
  noPadding?: boolean;
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  full: 'w-full',
};

export function PageContainer({
  children,
  maxWidth = '5xl',
  className,
  withStickyBar = false,
  noPadding = false,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        'min-h-screen bg-slate-50',
        withStickyBar && 'pb-20',
        className
      )}
    >
      <div
        className={cn(
          maxWidthClasses[maxWidth],
          'mx-auto',
          !noPadding && 'px-6 py-8'
        )}
      >
        {children}
      </div>
    </div>
  );
}

// =====================================
// PAGE HEADER
// =====================================

export interface PageHeaderProps {
  title: string;
  description?: string;
  backUrl?: string;
  onBack?: () => void;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  backUrl,
  onBack,
  actions,
  className,
}: PageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backUrl) {
      router.push(backUrl);
    }
  };

  const showBack = backUrl || onBack;

  return (
    <div className={cn('bg-white border-b border-slate-200', className)}>
      <div className="max-w-5xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {showBack && (
              <button
                onClick={handleBack}
                className={cn(
                  'p-2 -ml-2 text-slate-400 rounded-md',
                  'hover:text-slate-600 hover:bg-slate-100',
                  'transition-colors'
                )}
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
            )}
            <div>
              <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
              {description && (
                <p className="text-sm text-slate-500">{description}</p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex items-center gap-3">{actions}</div>
          )}
        </div>
      </div>
    </div>
  );
}

// =====================================
// LIST PAGE HEADER
// =====================================

export interface ListPageHeaderProps {
  icon: React.ReactNode;
  iconColor?: string;
  title: string;
  description?: string;
  itemCount?: number;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    loading?: boolean;
  };
  secondaryActions?: React.ReactNode;
  className?: string;
}

export function ListPageHeader({
  icon,
  iconColor = '#6366f1',
  title,
  description,
  itemCount,
  primaryAction,
  secondaryActions,
  className,
}: ListPageHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between mb-6', className)}>
      <div className="flex items-center gap-4">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${iconColor}15` }}
        >
          <span style={{ color: iconColor }} className="text-lg">
            {icon}
          </span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
            {itemCount !== undefined && (
              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                {itemCount}
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-slate-500">{description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {secondaryActions}
        {primaryAction && (
          <button
            onClick={primaryAction.onClick}
            disabled={primaryAction.loading}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium',
              'text-white bg-slate-900 rounded-md',
              'hover:bg-slate-800 transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {primaryAction.loading ? (
              <Spinner size="xs" color="white" />
            ) : (
              primaryAction.icon
            )}
            {primaryAction.label}
          </button>
        )}
      </div>
    </div>
  );
}

// =====================================
// STICKY ACTION BAR
// =====================================

export interface StickyActionBarProps {
  children: React.ReactNode;
  leftContent?: React.ReactNode;
  visible?: boolean;
  className?: string;
}

export function StickyActionBar({
  children,
  leftContent,
  visible = true,
  className,
}: StickyActionBarProps) {
  if (!visible) return null;

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50',
        className
      )}
    >
      <div className="max-w-5xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-500">{leftContent}</div>
          <div className="flex items-center gap-3">{children}</div>
        </div>
      </div>
    </div>
  );
}

// =====================================
// SECTION
// =====================================

export interface SectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Section({
  title,
  description,
  children,
  className,
}: SectionProps) {
  return (
    <section className={cn('mb-8', className)}>
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h2 className="text-sm font-medium text-slate-900">{title}</h2>
          )}
          {description && (
            <p className="text-xs text-slate-500 mt-0.5">{description}</p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

// =====================================
// LOADING STATE (Full Page)
// =====================================

export interface PageLoadingProps {
  message?: string;
}

export function PageLoading({ message = 'Yükleniyor...' }: PageLoadingProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-sm text-slate-500">{message}</p>
      </div>
    </div>
  );
}

// =====================================
// EMPTY STATE
// =====================================

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 text-center',
        className
      )}
    >
      {icon && (
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-medium text-slate-900 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 mb-4 max-w-sm">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className={cn(
            'inline-flex items-center px-4 py-2 text-sm font-medium rounded-md',
            'text-slate-700 bg-white border border-slate-300',
            'hover:bg-slate-50 transition-colors'
          )}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

// =====================================
// MODULE COLORS
// =====================================

export const MODULE_COLORS: Record<string, string> = {
  CORE: '#6366f1',
  INVENTORY: '#8b5cf6',
  SALES: '#10b981',
  PURCHASE: '#f59e0b',
  CRM: '#3b82f6',
  HR: '#ec4899',
  FINANCE: '#14b8a6',
  CMS: '#f97316',
  SETTINGS: '#64748b',
  DEPARTMENTS: '#8b5cf6',
  ROLES: '#6366f1',
  USERS: '#3b82f6',
};

export function getModuleColor(moduleCode: string): string {
  return MODULE_COLORS[moduleCode.toUpperCase()] || '#6366f1';
}

export default PageContainer;
