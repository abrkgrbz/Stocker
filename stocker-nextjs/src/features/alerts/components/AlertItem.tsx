'use client';

/**
 * AlertItem Component
 * Individual alert item in the dropdown or list
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  InformationCircleIcon,
  BellIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  XCircleIcon,
  XMarkIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import type { Alert, AlertSeverity } from '../types';
import { alertSeverityConfig, alertCategoryConfig } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

// Type for Heroicons components
type HeroIcon = React.ComponentType<React.SVGProps<SVGSVGElement>>;

interface AlertItemProps {
  alert: Alert;
  onMarkAsRead: (id: number) => void;
  onDismiss: (id: number) => void;
  compact?: boolean;
}

const severityIcons: Record<AlertSeverity, HeroIcon> = {
  Info: InformationCircleIcon,
  Low: BellIcon,
  Medium: ExclamationTriangleIcon,
  High: ExclamationCircleIcon,
  Critical: XCircleIcon,
};

export function AlertItem({ alert, onMarkAsRead, onDismiss, compact = false }: AlertItemProps) {
  const router = useRouter();
  const severityConfig = alertSeverityConfig[alert.severity] ?? alertSeverityConfig.Info;
  const categoryConfig = alertCategoryConfig[alert.category] ?? alertCategoryConfig.System;
  const SeverityIcon = severityIcons[alert.severity] ?? InformationCircleIcon;

  const handleClick = () => {
    if (!alert.isRead) {
      onMarkAsRead(alert.id);
    }
    if (alert.actionUrl) {
      router.push(alert.actionUrl);
    }
  };

  const timeAgo = formatDistanceToNow(new Date(alert.createdAt), {
    addSuffix: true,
    locale: tr,
  });

  return (
    <div
      className={`group relative flex gap-3 p-4 hover:bg-slate-50 transition-colors cursor-pointer ${
        !alert.isRead ? 'bg-blue-50/50' : ''
      }`}
      onClick={handleClick}
    >
      {/* Severity Icon */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-full ${severityConfig?.bgColor ?? 'bg-slate-50'} flex items-center justify-center`}>
        <SeverityIcon className={`w-5 h-5 ${severityConfig?.color ?? 'text-slate-600'}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium ${severityConfig?.color ?? 'text-slate-600'}`}>
              {categoryConfig?.label ?? 'Bildirim'}
            </span>
            {!alert.isRead && (
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            )}
          </div>
          <span className="text-xs text-slate-400 whitespace-nowrap">{timeAgo}</span>
        </div>

        {/* Title */}
        <h4 className={`mt-1 text-sm font-medium text-slate-900 ${compact ? 'truncate' : ''}`}>
          {alert.title}
        </h4>

        {/* Message */}
        {!compact && (
          <p className="mt-1 text-sm text-slate-600 line-clamp-2">{alert.message}</p>
        )}

        {/* Action Button */}
        {alert.actionLabel && alert.actionUrl && (
          <div className="mt-2">
            <span className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-800">
              {alert.actionLabel}
              <svg className="ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons (visible on hover) */}
      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!alert.isRead && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead(alert.id);
            }}
            className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Okundu olarak işaretle"
          >
            <CheckIcon className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss(alert.id);
          }}
          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Bildirimi kaldır"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
