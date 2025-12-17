'use client';

import React from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import NotificationItem from './NotificationItem';

interface NotificationListProps {
  onNotificationClick?: (notification: any) => void;
}

export default function NotificationList({ onNotificationClick }: NotificationListProps) {
  const {
    notifications,
    isLoading,
    markAsRead,
    markAsUnread,
    deleteNotification,
  } = useNotifications();

  if (isLoading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center">
        <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin mb-3" />
        <p className="text-xs text-slate-400">Yükleniyor...</p>
      </div>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div className="py-12 flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center mb-3">
          <Bell className="w-5 h-5 text-slate-400" strokeWidth={1.5} />
        </div>
        <p className="text-sm font-medium text-slate-600 mb-1">Hepsi tamam!</p>
        <p className="text-xs text-slate-400">Bildiriminiz bulunmuyor</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onMarkAsRead={markAsRead}
          onMarkAsUnread={markAsUnread}
          onDelete={deleteNotification}
          onClick={onNotificationClick}
        />
      ))}
    </div>
  );
}
