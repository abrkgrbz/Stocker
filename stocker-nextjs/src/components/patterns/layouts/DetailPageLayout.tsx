'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Button, Spinner } from '@/components/primitives';

export interface DetailPageLayoutProps {
  /** Main title displayed in header */
  title: string;
  /** Subtitle/description displayed below title */
  subtitle?: string;
  /** Path to navigate when back button is clicked */
  backPath: string;
  /** Icon component to render in the header */
  icon?: React.ReactNode;
  /** Icon background color class (e.g., 'bg-violet-600') */
  iconBgColor?: string;
  /** Status badge component */
  statusBadge?: React.ReactNode;
  /** Action buttons to render in header */
  actions?: React.ReactNode;
  /** Page content */
  children: React.ReactNode;
  /** Loading state for data fetch */
  isLoading?: boolean;
  /** Error state for data fetch */
  isError?: boolean;
  /** Error message */
  errorMessage?: string;
  /** Error description */
  errorDescription?: string;
  /** Max width class (default: "max-w-7xl") */
  maxWidth?: 'max-w-5xl' | 'max-w-6xl' | 'max-w-7xl';
}

/**
 * Reusable Detail Page Layout
 *
 * Features:
 * - Glass effect sticky header with blur
 * - Back button with path navigation
 * - Icon, title, subtitle, status badge
 * - Custom action buttons
 * - Loading and error states
 * - Slate-50 background
 *
 * Used by HR and CRM modules for consistent detail page structure.
 */
export function DetailPageLayout({
  title,
  subtitle,
  backPath,
  icon,
  iconBgColor = 'bg-violet-600',
  statusBadge,
  actions,
  children,
  isLoading = false,
  isError = false,
  errorMessage = 'Kayit Bulunamadi',
  errorDescription = 'Istenen kayit bulunamadi veya bir hata olustu.',
  maxWidth = 'max-w-7xl',
}: DetailPageLayoutProps) {
  const router = useRouter();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">{errorMessage}</h3>
          <p className="text-red-600 mb-4">{errorDescription}</p>
          <Button variant="secondary" onClick={() => router.push(backPath)}>
            Geri Don
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Glass Effect Sticky Header */}
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(248, 250, 252, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className={`${maxWidth} mx-auto flex justify-between items-center`}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(backPath)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Geri
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-3">
              {icon && (
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBgColor}`}>
                  {icon}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-slate-900 m-0">{title}</h1>
                  {statusBadge}
                </div>
                {subtitle && (
                  <p className="text-sm text-slate-500 m-0">{subtitle}</p>
                )}
              </div>
            </div>
          </div>
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={`${maxWidth} mx-auto px-8 py-6`}>
        {children}
      </div>
    </div>
  );
}
