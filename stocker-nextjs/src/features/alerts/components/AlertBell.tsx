'use client';

/**
 * AlertBell Component
 * Shows notification bell with unread count badge
 * Opens alert dropdown on click
 */

import React, { useState, useRef, useEffect } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { BellAlertIcon } from '@heroicons/react/24/solid';
import { useUnreadAlertCount, useAlerts, useMarkAlertAsRead, useMarkAllAlertsAsRead, useDismissAlert } from '../hooks/useAlerts';
import { AlertItem } from './AlertItem';
import type { AlertFilterParams } from '../types';

interface AlertBellProps {
  className?: string;
}

export function AlertBell({ className = '' }: AlertBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: unreadCount = 0 } = useUnreadAlertCount();

  const filterParams: AlertFilterParams = {
    limit: 10,
    includeDismissed: false,
  };
  const { data: alerts, isLoading } = useAlerts(isOpen ? filterParams : undefined);

  const markAsReadMutation = useMarkAlertAsRead();
  const markAllAsReadMutation = useMarkAllAlertsAsRead();
  const dismissMutation = useDismissAlert();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = (id: number) => {
    markAsReadMutation.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleDismiss = (id: number) => {
    dismissMutation.mutate(id);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        aria-label={`Bildirimler ${unreadCount > 0 ? `(${unreadCount} okunmamış)` : ''}`}
      >
        {unreadCount > 0 ? (
          <BellAlertIcon className="w-6 h-6 text-blue-600" />
        ) : (
          <BellIcon className="w-6 h-6" />
        )}

        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 flex items-center justify-center text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 max-h-[500px] bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900">Bildirimler</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={markAllAsReadMutation.isPending}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
              >
                Tümünü Okundu İşaretle
              </button>
            )}
          </div>

          {/* Alert List */}
          <div className="max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-slate-500">
                <div className="animate-spin w-6 h-6 border-2 border-slate-300 border-t-blue-600 rounded-full mx-auto"></div>
                <p className="mt-2 text-sm">Yükleniyor...</p>
              </div>
            ) : alerts && alerts.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {alerts.map((alert) => (
                  <AlertItem
                    key={alert.id}
                    alert={alert}
                    onMarkAsRead={handleMarkAsRead}
                    onDismiss={handleDismiss}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <BellIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">Bildirim bulunmuyor</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {alerts && alerts.length > 0 && (
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-200">
              <a
                href="/notifications"
                className="block text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Tüm Bildirimleri Gör
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
