'use client';

import React from 'react';
import { Empty, Spin } from 'antd';
import { useNotifications } from '../hooks/useNotifications';
import NotificationItem from './NotificationItem';
import InlineLoader from '@/components/InlineLoader';

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
      <div className="p-8 flex justify-center">
        <InlineLoader text="Bildirimler yükleniyor..." />
      </div>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div className="p-8">
        <Empty
          description="Henüz bildiriminiz yok"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
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
