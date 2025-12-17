'use client';

import React from 'react';
import { Notification } from '../types/notification.types';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Tooltip } from 'antd';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onMarkAsUnread: (id: string) => void;
  onDelete: (id: string) => void;
  onClick?: (notification: Notification) => void;
}

const typeConfig: Record<string, {
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}> = {
  success: {
    icon: <CheckCircle2 className="w-4 h-4" strokeWidth={1.75} />,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  warning: {
    icon: <AlertTriangle className="w-4 h-4" strokeWidth={1.75} />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
  error: {
    icon: <XCircle className="w-4 h-4" strokeWidth={1.75} />,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  info: {
    icon: <Info className="w-4 h-4" strokeWidth={1.75} />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
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
      className={`
        relative group px-4 py-3 transition-colors
        ${onClick || notification.link ? 'cursor-pointer' : ''}
        ${notification.isRead ? 'bg-white' : 'bg-slate-50'}
        hover:bg-slate-50
      `}
      onClick={handleClick}
    >
      {/* Unread Indicator */}
      {!notification.isRead && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-slate-900" />
      )}

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={`
            w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
            ${notification.isRead ? 'bg-slate-100 text-slate-400' : `${config.bgColor} ${config.color}`}
          `}
        >
          {config.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p
                className={`text-sm leading-snug mb-0.5 ${
                  notification.isRead
                    ? 'font-medium text-slate-600'
                    : 'font-semibold text-slate-900'
                }`}
              >
                {notification.title}
              </p>
              <p
                className={`text-sm leading-relaxed ${
                  notification.isRead ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                {notification.message}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-2">
            <span className="text-[11px] text-slate-400">
              {formatDistanceToNow(new Date(notification.createdAt), {
                addSuffix: true,
                locale: tr,
              })}
            </span>

            {/* Actions - Show on hover */}
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <Tooltip title={notification.isRead ? 'Okunmadı işaretle' : 'Okundu işaretle'}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    notification.isRead
                      ? onMarkAsUnread(notification.id)
                      : onMarkAsRead(notification.id);
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  {notification.isRead ? (
                    <EyeOff className="w-3.5 h-3.5" strokeWidth={1.75} />
                  ) : (
                    <Eye className="w-3.5 h-3.5" strokeWidth={1.75} />
                  )}
                </button>
              </Tooltip>
              <Tooltip title="Sil">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(notification.id);
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
