'use client';

import React from 'react';
import { Button } from 'antd';
import { DocumentTextIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface FormDraftBannerProps {
  /** Whether there's a saved draft */
  hasDraft: boolean;
  /** Callback to load the draft */
  onLoadDraft: () => void;
  /** Callback to discard the draft */
  onDiscardDraft: () => void;
  /** Last save timestamp */
  lastSaved?: Date | null;
  /** Additional class name */
  className?: string;
}

/**
 * Banner component to show when there's a saved draft
 */
export function FormDraftBanner({
  hasDraft,
  onLoadDraft,
  onDiscardDraft,
  lastSaved,
  className = '',
}: FormDraftBannerProps) {
  if (!hasDraft) return null;

  const formatTime = (date: Date | null | undefined) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
    }).format(date);
  };

  return (
    <div className={`bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
            <DocumentTextIcon className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-amber-800">
              Kaydedilmemiş taslak bulundu
            </p>
            {lastSaved && (
              <p className="text-xs text-amber-600">
                Son kayıt: {formatTime(lastSaved)}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="small"
            onClick={onLoadDraft}
            className="!bg-amber-600 !border-amber-600 !text-white hover:!bg-amber-700"
          >
            Taslağı Yükle
          </Button>
          <Button
            type="text"
            size="small"
            icon={<XMarkIcon className="w-4 h-4" />}
            onClick={onDiscardDraft}
            className="!text-amber-600 hover:!text-amber-800"
          >
            İptal
          </Button>
        </div>
      </div>
    </div>
  );
}

interface FormAutoSaveIndicatorProps {
  /** Last auto-save timestamp */
  lastAutoSave: Date | null;
  /** Whether auto-save is active */
  isActive?: boolean;
  /** Additional class name */
  className?: string;
}

/**
 * Small indicator showing auto-save status
 */
export function FormAutoSaveIndicator({
  lastAutoSave,
  isActive = true,
  className = '',
}: FormAutoSaveIndicatorProps) {
  if (!isActive) return null;

  const formatTime = (date: Date | null) => {
    if (!date) return 'Henüz kaydedilmedi';
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return 'Az önce';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} dk önce`;

    return new Intl.DateTimeFormat('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className={`flex items-center gap-2 text-xs text-slate-400 ${className}`}>
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      <span>Otomatik kayıt: {formatTime(lastAutoSave)}</span>
    </div>
  );
}

export default FormDraftBanner;
