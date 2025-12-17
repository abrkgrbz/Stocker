'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Spin, Alert } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';

interface CrmFormPageLayoutProps {
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
 * Reusable CRM Form Page Layout
 *
 * Features:
 * - Glass effect sticky header with blur
 * - Centered content with max-w-4xl
 * - Back button, title, subtitle
 * - Cancel and Save buttons
 * - Premium black theme styling
 * - Loading and error states for edit pages
 */
export function CrmFormPageLayout({
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
}: CrmFormPageLayoutProps) {
  const router = useRouter();

  // Loading state
  if (isDataLoading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  // Error state
  if (dataError) {
    return (
      <div className="p-8">
        <Alert
          message={errorMessage}
          description={errorDescription}
          type="error"
          showIcon
          action={
            <Button onClick={() => router.push(cancelPath)}>
              Geri Dön
            </Button>
          }
        />
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
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.back()}
              type="text"
              className="text-slate-500 hover:text-slate-800"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-slate-900 m-0">
                  {title}
                </h1>
                {titleExtra}
              </div>
              <p className="text-sm text-slate-400 m-0">{subtitle}</p>
            </div>
          </div>
          <Space>
            {extraActions}
            <Button onClick={() => router.push(cancelPath)}>
              Vazgeç
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={loading}
              onClick={onSave}
              className="!bg-slate-900 !border-slate-900 hover:!bg-slate-800"
            >
              {saveButtonText}
            </Button>
          </Space>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-8 py-8 max-w-4xl mx-auto">
        {children}
      </div>
    </div>
  );
}
