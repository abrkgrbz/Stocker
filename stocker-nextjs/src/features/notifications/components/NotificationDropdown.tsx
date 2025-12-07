'use client';

import React from 'react';
import { Segmented, Empty } from 'antd';
import { CheckOutlined, BellOutlined, ArrowRightOutlined } from '@ant-design/icons';
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
  return (
    <div
      className="w-[420px] overflow-hidden"
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.8)',
      }}
    >
      {/* Glass Effect Header */}
      <div
        className="p-5"
        style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(236, 72, 153, 0.08) 100%)',
          borderBottom: '1px solid rgba(139, 92, 246, 0.1)',
        }}
      >
        {/* Title Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
              }}
            >
              <BellOutlined className="text-white text-lg" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 m-0">Bildirimler</h3>
              {unreadCount > 0 && (
                <p className="text-xs text-gray-500 m-0 mt-0.5">
                  {unreadCount} okunmamış bildirim
                </p>
              )}
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={onMarkAllAsRead}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-violet-600 hover:text-violet-700 bg-violet-50 hover:bg-violet-100 rounded-lg transition-all duration-200"
            >
              <CheckOutlined className="text-[10px]" />
              Tümünü Okundu İşaretle
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div
          className="p-1 rounded-xl"
          style={{
            background: 'rgba(255, 255, 255, 0.7)',
            border: '1px solid rgba(139, 92, 246, 0.1)',
          }}
        >
          <Segmented
            value={filterType}
            onChange={onFilterChange}
            options={[
              { label: 'Tümü', value: 'all' },
              { label: 'Okunmamış', value: 'unread' },
              { label: 'Okunmuş', value: 'read' },
            ]}
            block
            className="notification-segmented"
            style={{
              background: 'transparent',
            }}
          />
        </div>
      </div>

      {/* Notifications List */}
      <div
        className="overflow-y-auto custom-scrollbar"
        style={{
          maxHeight: '400px',
        }}
      >
        <NotificationList onNotificationClick={onNotificationClick} />
      </div>

      {/* Modern Footer */}
      <div
        className="p-4"
        style={{
          background: 'linear-gradient(180deg, rgba(249, 250, 251, 0.8) 0%, rgba(243, 244, 246, 0.9) 100%)',
          borderTop: '1px solid rgba(0, 0, 0, 0.04)',
        }}
      >
        <Link
          href="/notifications"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 text-sm font-medium text-gray-700 hover:text-violet-600 bg-white hover:bg-violet-50 rounded-xl transition-all duration-200 group"
          style={{
            border: '1px solid rgba(0, 0, 0, 0.06)',
          }}
        >
          Tüm Bildirimleri Görüntüle
          <ArrowRightOutlined className="text-xs opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
        </Link>
      </div>

      {/* Custom Styles */}
      <style jsx global>{`
        .notification-segmented .ant-segmented-item {
          border-radius: 10px !important;
          font-size: 13px !important;
          font-weight: 500 !important;
          color: #6b7280 !important;
          transition: all 0.2s ease !important;
        }
        .notification-segmented .ant-segmented-item-selected {
          background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%) !important;
          color: white !important;
          box-shadow: 0 4px 12px -2px rgba(139, 92, 246, 0.4) !important;
        }
        .notification-segmented .ant-segmented-thumb {
          display: none !important;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.4);
        }
      `}</style>
    </div>
  );
}
