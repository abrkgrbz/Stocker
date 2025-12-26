'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Dropdown } from 'antd';
import { Bell } from 'lucide-react';
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
      popupRender={() => (
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
        className={`
          relative w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-150
          ${open
            ? 'bg-slate-100 text-slate-900'
            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
          }
        `}
      >
        <NotificationBadge count={unreadCount}>
          <Bell className="w-[18px] h-[18px]" strokeWidth={1.75} />
        </NotificationBadge>
      </button>
    </Dropdown>
  );
}
