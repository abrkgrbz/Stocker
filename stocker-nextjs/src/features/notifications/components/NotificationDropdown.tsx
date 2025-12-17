'use client';

import React from 'react';
import { Check, Settings, ChevronRight } from 'lucide-react';
import NotificationList from './NotificationList';
import { Notification } from '../types/notification.types';
import Link from 'next/link';

interface NotificationDropdownProps {
  unreadCount: number;
  filterType: 'all' | 'unread' | 'read';
  onFilterChange: (value: string) => void;
  onMarkAllAsRead: () => void;
  onNotificationClick: (notification: Notification) => void;
}

export default function NotificationDropdown({
  unreadCount,
  filterType,
  onFilterChange,
  onMarkAllAsRead,
  onNotificationClick,
}: NotificationDropdownProps) {
  const tabs = [
    { key: 'all', label: 'Tümü' },
    { key: 'unread', label: 'Okunmamış' },
    { key: 'read', label: 'Okunmuş' },
  ];

  return (
    <div className="w-[400px] bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-900">Bildirimler</h3>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-medium bg-slate-900 text-white rounded">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllAsRead}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
              >
                <Check className="w-3 h-3" />
                Tümünü Oku
              </button>
            )}
            <button
              type="button"
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
            >
              <Settings className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Tabs - Border Bottom Style */}
        <div className="flex items-center gap-1 mt-3 -mb-3">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onFilterChange(tab.key)}
              className={`
                px-3 py-2 text-xs font-medium transition-colors relative
                ${filterType === tab.key
                  ? 'text-slate-900'
                  : 'text-slate-500 hover:text-slate-700'
                }
              `}
            >
              {tab.label}
              {filterType === tab.key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-[380px] overflow-y-auto">
        <NotificationList onNotificationClick={onNotificationClick} />
      </div>

      {/* Footer */}
      <Link
        href="/notifications"
        className="flex items-center justify-center gap-1.5 px-4 py-3 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-t border-slate-100 transition-colors group"
      >
        Tüm Bildirimleri Gör
        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
      </Link>
    </div>
  );
}
