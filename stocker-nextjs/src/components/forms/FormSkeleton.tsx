'use client';

import React from 'react';
import { Skeleton } from 'antd';

interface FormSkeletonProps {
  /** Number of form sections to show */
  sections?: number;
  /** Number of fields per section */
  fieldsPerSection?: number;
  /** Whether to show the header section */
  showHeader?: boolean;
  /** Whether to show stats section */
  showStats?: boolean;
  /** Custom class name */
  className?: string;
}

/**
 * Skeleton loader for inventory-style forms with header and sections
 */
export function FormSkeleton({
  sections = 3,
  fieldsPerSection = 3,
  showHeader = true,
  showStats = false,
  className = '',
}: FormSkeletonProps) {
  return (
    <div className={`bg-white border border-slate-200 rounded-xl ${className}`}>
      {/* Header Skeleton */}
      {showHeader && (
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Icon placeholder */}
            <div className="flex-shrink-0">
              <Skeleton.Avatar active size={64} shape="circle" />
            </div>
            {/* Title and subtitle */}
            <div className="flex-1 space-y-2">
              <Skeleton.Input active size="large" style={{ width: 300, height: 32 }} />
              <Skeleton.Input active size="small" style={{ width: 200, height: 20 }} />
            </div>
            {/* Status toggle placeholders */}
            <div className="flex-shrink-0 flex items-center gap-4">
              <Skeleton.Button active size="small" style={{ width: 100, height: 32 }} />
              <Skeleton.Button active size="small" style={{ width: 80, height: 32 }} />
            </div>
          </div>
        </div>
      )}

      {/* Form Body Skeleton */}
      <div className="px-8 py-6 space-y-8">
        {/* Stats Section */}
        {showStats && (
          <div className="mb-8">
            <Skeleton.Input active size="small" style={{ width: 120, height: 16, marginBottom: 16 }} />
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-slate-50 rounded-lg p-4">
                  <Skeleton.Input active size="small" style={{ width: 60, height: 12, marginBottom: 8 }} />
                  <Skeleton.Input active size="large" style={{ width: 80, height: 24 }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Form Sections */}
        {Array.from({ length: sections }).map((_, sectionIndex) => (
          <div key={sectionIndex} className="mb-8">
            {/* Section Title */}
            <div className="pb-2 mb-4 border-b border-slate-100">
              <Skeleton.Input active size="small" style={{ width: 150, height: 14 }} />
            </div>
            {/* Section Fields - Grid Layout */}
            <div className="grid grid-cols-12 gap-4">
              {Array.from({ length: fieldsPerSection }).map((_, fieldIndex) => {
                // Vary column spans for realistic look
                const colSpan = fieldIndex === 0 ? 'col-span-4' : fieldIndex === 1 ? 'col-span-4' : 'col-span-4';
                return (
                  <div key={fieldIndex} className={colSpan}>
                    {/* Label */}
                    <Skeleton.Input
                      active
                      size="small"
                      style={{ width: 80, height: 14, marginBottom: 8 }}
                    />
                    {/* Input */}
                    <Skeleton.Input
                      active
                      style={{ width: '100%', height: 40 }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface FormLoadingOverlayProps {
  /** Whether the overlay is visible */
  loading: boolean;
  /** Loading message to display */
  message?: string;
  /** Children to render behind the overlay */
  children: React.ReactNode;
  /** Custom class name */
  className?: string;
}

/**
 * Loading overlay for forms during submission
 * Renders children with a semi-transparent overlay and spinner when loading
 */
export function FormLoadingOverlay({
  loading,
  message = 'Kaydediliyor...',
  children,
  className = '',
}: FormLoadingOverlayProps) {
  return (
    <div className={`relative ${className}`}>
      {children}
      {loading && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] rounded-xl flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl shadow-lg border border-slate-200">
            <div className="w-10 h-10 border-3 border-slate-200 border-t-slate-700 rounded-full animate-spin" />
            <span className="text-sm font-medium text-slate-600">{message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default FormSkeleton;
