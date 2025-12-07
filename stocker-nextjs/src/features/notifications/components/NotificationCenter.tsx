'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Dropdown } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { useNotifications } from '../hooks/useNotifications';
import NotificationDropdown from './NotificationDropdown';
import NotificationBadge from './NotificationBadge';
import { NotificationFilter, Notification } from '../types/notification.types';

export default function NotificationCenter() {
  const {
    unreadCount,
    fetchUnreadCount,
    markAllAsRead,
    setFilter,
  } = useNotifications();

  const [open, setOpen] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (open) {
      const filter: NotificationFilter = {};
      if (filterType === 'unread') filter.isRead = false;
      if (filterType === 'read') filter.isRead = true;
      setFilter(filter);
    }
  }, [open, filterType, setFilter]);

  const handleMarkAllAsRead = useCallback(async () => {
    await markAllAsRead();
  }, [markAllAsRead]);

  const handleFilterChange = useCallback((value: string) => {
    setFilterType(value as any);
  }, []);

  const handleNotificationClick = useCallback((notification: Notification) => {
    if (notification.link) {
      window.location.href = notification.link;
    }
    setOpen(false);
  }, []);

  return (
    <Dropdown
      dropdownRender={() => (
        <NotificationDropdown
          unreadCount={unreadCount}
          filterType={filterType}
          onFilterChange={handleFilterChange}
          onMarkAllAsRead={handleMarkAllAsRead}
          onNotificationClick={handleNotificationClick}
        />
      )}
      trigger={['click']}
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
    >
      <button
        type="button"
        className="relative w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 group"
        style={{
          background: open ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)' : 'rgba(243, 244, 246, 0.8)',
          border: open ? '1px solid rgba(139, 92, 246, 0.2)' : '1px solid transparent',
        }}
      >
        <NotificationBadge count={unreadCount}>
          <BellOutlined
            className={`text-lg transition-all duration-200 ${
              open
                ? 'text-violet-600'
                : 'text-gray-500 group-hover:text-violet-600'
            }`}
            style={{
              transform: unreadCount > 0 ? 'rotate(-12deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease',
            }}
          />
        </NotificationBadge>

        {/* Hover ring effect */}
        <span
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{
            boxShadow: '0 0 0 2px rgba(139, 92, 246, 0.1)',
          }}
        />
      </button>
    </Dropdown>
  );
}
