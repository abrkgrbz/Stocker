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
      <div className="cursor-pointer">
        <NotificationBadge count={unreadCount}>
          <BellOutlined className="text-xl text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors" />
        </NotificationBadge>
      </div>
    </Dropdown>
  );
}
