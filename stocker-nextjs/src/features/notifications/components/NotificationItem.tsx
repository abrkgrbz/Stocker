'use client';

import React from 'react';
import { Notification, NotificationType } from '../types/notification.types';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  InfoCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
} from '@ant-design/icons';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onMarkAsUnread: (id: string) => void;
  onDelete: (id: string) => void;
  onClick?: (notification: Notification) => void;
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return <CheckCircleOutlined className="text-green-500" />;
    case 'warning':
      return <WarningOutlined className="text-yellow-500" />;
    case 'error':
      return <CloseCircleOutlined className="text-red-500" />;
    default:
      return <InfoCircleOutlined className="text-blue-500" />;
  }
};

const getNotificationBg = (type: NotificationType, isRead: boolean) => {
  if (isRead) return 'bg-gray-50 dark:bg-gray-800';

  switch (type) {
    case 'success':
      return 'bg-green-50 dark:bg-green-900/10';
    case 'warning':
      return 'bg-yellow-50 dark:bg-yellow-900/10';
    case 'error':
      return 'bg-red-50 dark:bg-red-900/10';
    default:
      return 'bg-blue-50 dark:bg-blue-900/10';
  }
};

export default function NotificationItem({
  notification,
  onMarkAsRead,
  onMarkAsUnread,
  onDelete,
  onClick,
}: NotificationItemProps) {
  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    if (onClick) {
      onClick(notification);
    }
  };

  return (
    <div
      className={`p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
        getNotificationBg(notification.type, notification.isRead)
      } ${onClick || notification.link ? 'cursor-pointer' : ''}`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="text-xl mt-0.5">
          {getNotificationIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h4 className={`text-sm font-semibold ${
                notification.isRead
                  ? 'text-gray-700 dark:text-gray-300'
                  : 'text-gray-900 dark:text-white'
              }`}>
                {notification.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {notification.message}
              </p>
            </div>

            {/* Unread indicator */}
            {!notification.isRead && (
              <div className="w-2 h-2 bg-violet-600 rounded-full flex-shrink-0 mt-1.5" />
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatDistanceToNow(new Date(notification.createdAt), {
                addSuffix: true,
                locale: tr,
              })}
            </span>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  notification.isRead
                    ? onMarkAsUnread(notification.id)
                    : onMarkAsRead(notification.id);
                }}
                className="text-xs text-violet-600 hover:text-violet-700 font-medium"
              >
                {notification.isRead ? 'Okunmadı işaretle' : 'Okundu işaretle'}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(notification.id);
                }}
                className="text-red-600 hover:text-red-700"
              >
                <DeleteOutlined className="text-sm" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
