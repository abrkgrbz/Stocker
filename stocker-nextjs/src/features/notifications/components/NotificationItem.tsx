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
  EyeOutlined,
  EyeInvisibleOutlined,
} from '@ant-design/icons';
import { Tooltip } from 'antd';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onMarkAsUnread: (id: string) => void;
  onDelete: (id: string) => void;
  onClick?: (notification: Notification) => void;
}

const typeConfig: Record<NotificationType, {
  icon: React.ReactNode;
  gradient: string;
  bgLight: string;
  borderColor: string;
  iconBg: string;
}> = {
  success: {
    icon: <CheckCircleOutlined />,
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    bgLight: 'rgba(16, 185, 129, 0.06)',
    borderColor: 'rgba(16, 185, 129, 0.15)',
    iconBg: 'rgba(16, 185, 129, 0.1)',
  },
  warning: {
    icon: <WarningOutlined />,
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    bgLight: 'rgba(245, 158, 11, 0.06)',
    borderColor: 'rgba(245, 158, 11, 0.15)',
    iconBg: 'rgba(245, 158, 11, 0.1)',
  },
  error: {
    icon: <CloseCircleOutlined />,
    gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    bgLight: 'rgba(239, 68, 68, 0.06)',
    borderColor: 'rgba(239, 68, 68, 0.15)',
    iconBg: 'rgba(239, 68, 68, 0.1)',
  },
  info: {
    icon: <InfoCircleOutlined />,
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    bgLight: 'rgba(59, 130, 246, 0.06)',
    borderColor: 'rgba(59, 130, 246, 0.15)',
    iconBg: 'rgba(59, 130, 246, 0.1)',
  },
};

export default function NotificationItem({
  notification,
  onMarkAsRead,
  onMarkAsUnread,
  onDelete,
  onClick,
}: NotificationItemProps) {
  const config = typeConfig[notification.type] || typeConfig.info;

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
      className={`relative group transition-all duration-200 ${
        onClick || notification.link ? 'cursor-pointer' : ''
      }`}
      onClick={handleClick}
      style={{
        background: notification.isRead ? 'transparent' : config.bgLight,
        borderBottom: '1px solid rgba(0, 0, 0, 0.04)',
      }}
    >
      {/* Unread Indicator Bar */}
      {!notification.isRead && (
        <div
          className="absolute left-0 top-0 bottom-0 w-1"
          style={{ background: config.gradient }}
        />
      )}

      <div className="p-4 pl-5">
        <div className="flex items-start gap-3.5">
          {/* Icon Container */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
            style={{
              background: notification.isRead ? 'rgba(156, 163, 175, 0.1)' : config.iconBg,
              color: notification.isRead ? '#9ca3af' : undefined,
            }}
          >
            {!notification.isRead ? (
              <span
                style={{
                  background: config.gradient,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {config.icon}
              </span>
            ) : (
              config.icon
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4
                    className={`text-sm m-0 leading-snug ${
                      notification.isRead
                        ? 'font-medium text-gray-600'
                        : 'font-semibold text-gray-900'
                    }`}
                  >
                    {notification.title}
                  </h4>
                  {!notification.isRead && (
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: config.gradient }}
                    />
                  )}
                </div>
                <p
                  className={`text-sm mt-1 mb-0 leading-relaxed ${
                    notification.isRead ? 'text-gray-500' : 'text-gray-600'
                  }`}
                >
                  {notification.message}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-gray-400 font-medium">
                {formatDistanceToNow(new Date(notification.createdAt), {
                  addSuffix: true,
                  locale: tr,
                })}
              </span>

              {/* Actions - Show on hover */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Tooltip title={notification.isRead ? 'Okunmadı işaretle' : 'Okundu işaretle'}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      notification.isRead
                        ? onMarkAsUnread(notification.id)
                        : onMarkAsRead(notification.id);
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-violet-600 hover:bg-violet-50 transition-all duration-200"
                  >
                    {notification.isRead ? (
                      <EyeInvisibleOutlined className="text-sm" />
                    ) : (
                      <EyeOutlined className="text-sm" />
                    )}
                  </button>
                </Tooltip>
                <Tooltip title="Sil">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(notification.id);
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                  >
                    <DeleteOutlined className="text-sm" />
                  </button>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hover Effect */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, rgba(139, 92, 246, 0.02) 0%, transparent 100%)',
        }}
      />
    </div>
  );
}
