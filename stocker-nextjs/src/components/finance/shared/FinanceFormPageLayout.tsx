'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Button, Spinner } from '@/components/primitives';

interface FinanceFormPageLayoutProps {
  /** Page title displayed in header */
  title: string;
  /** Subtitle/description displayed below title */
  subtitle: string;
  /** Path to navigate when cancel is clicked */
  cancelPath: string;
  /** Loading state for save button */
  loading?: boolean;
  /** Callback when save button is clicked */
  onSave: () => void;
  /** Form content to render */
  children: React.ReactNode;
  /** Optional: Custom content to render after title (e.g., status tag) */
  titleExtra?: React.ReactNode;
  /** Optional: Show loading spinner for data fetch */
  isDataLoading?: boolean;
  /** Optional: Error state for data fetch */
  dataError?: boolean;
  /** Optional: Error message for data fetch */
  errorMessage?: string;
  /** Optional: Error description for data fetch */
  errorDescription?: string;
  /** Optional: Extra actions to render before cancel/save buttons (e.g., delete button) */
  extraActions?: React.ReactNode;
  /** Optional: Save button text (default: "Kaydet") */
  saveButtonText?: string;
}

/**
 * Reusable Finance Form Page Layout
 *
 * Features:
 * - Glass effect sticky header with blur
 * - Centered content with max-w-4xl
 * - Back button, title, subtitle
 * - Cancel and Save buttons
 * - Premium slate theme styling
 * - Loading and error states for edit pages
 */
export function FinanceFormPageLayout({
  title,
  subtitle,
  cancelPath,
  loading = false,
  onSave,
  children,
  titleExtra,
  isDataLoading = false,
  dataError = false,
  errorMessage = 'Kayıt Bulunamadı',
  errorDescription = 'İstenen kayıt bulunamadı veya bir hata oluştu.',
  extraActions,
  saveButtonText = 'Kaydet',
}: FinanceFormPageLayoutProps) {
  const router = useRouter();

  // Loading state
  if (isDataLoading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Error state
  if (dataError) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">{errorMessage}</h3>
          <p className="text-red-600 mb-4">{errorDescription}</p>
          <Button variant="secondary" onClick={() => router.push(cancelPath)}>
            Geri Dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Glass Effect Sticky Header */}
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-slate-900">
                  {title}
                </h1>
                {titleExtra}
              </div>
              <p className="text-sm text-slate-400">{subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {extraActions}
            <Button variant="secondary" onClick={() => router.push(cancelPath)}>
              Vazgeç
            </Button>
            <Button
              variant="primary"
              loading={loading}
              onClick={onSave}
            >
              {saveButtonText}
            </Button>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-8 py-8 max-w-4xl mx-auto">
        {children}
      </div>
    </div>
  );
}
