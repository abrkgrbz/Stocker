'use client';

import React from 'react';
import { BellOutlined } from '@ant-design/icons';
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
      <div className="p-12 flex flex-col items-center justify-center">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
          style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
          }}
        >
          <div className="animate-spin">
            <BellOutlined className="text-xl text-violet-500" />
          </div>
        </div>
        <p className="text-sm text-gray-500 m-0">Bildirimler yükleniyor...</p>
      </div>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div className="p-12 flex flex-col items-center justify-center">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{
            background: 'linear-gradient(135deg, rgba(156, 163, 175, 0.1) 0%, rgba(156, 163, 175, 0.05) 100%)',
          }}
        >
          <BellOutlined className="text-2xl text-gray-300" />
        </div>
        <h4 className="text-sm font-medium text-gray-700 m-0 mb-1">Bildirim Yok</h4>
        <p className="text-xs text-gray-400 m-0 text-center">
          Henüz bir bildiriminiz bulunmuyor.<br />
          Yeni bildirimler burada görünecek.
        </p>
      </div>
    );
  }

  return (
    <div>
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
