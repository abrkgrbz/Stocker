'use client';

import React from 'react';
import { Segmented } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import NotificationList from './NotificationList';
import { Notification } from '../types/notification.types';

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
  return (
    <div className="w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Bildirimler
          </h3>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={onMarkAllAsRead}
              className="text-sm text-violet-600 hover:text-violet-700 flex items-center gap-1"
            >
              <CheckOutlined />
              Tümünü Okundu İşaretle
            </button>
          )}
        </div>

        {/* Filter */}
        <Segmented
          value={filterType}
          onChange={onFilterChange}
          options={[
            { label: 'Tümü', value: 'all' },
            { label: 'Okunmamış', value: 'unread' },
            { label: 'Okunmuş', value: 'read' },
          ]}
          block
        />
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        <NotificationList onNotificationClick={onNotificationClick} />
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
        <a href="/notifications" className="text-sm text-violet-600 hover:text-violet-700">
          Tüm Bildirimleri Görüntüle
        </a>
      </div>
    </div>
  );
}
