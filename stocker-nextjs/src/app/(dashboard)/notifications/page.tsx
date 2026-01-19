'use client';

import React, { useState, useEffect } from 'react';
import { Button, Empty, Dropdown, Spin } from 'antd';
import type { MenuProps } from 'antd';
import {
  BellIcon,
  CheckCircleIcon,
  CheckIcon,
  EllipsisVerticalIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  TrashIcon,
  TrophyIcon,
  BellAlertIcon,
} from '@heroicons/react/24/outline';
import { CRMService } from '@/lib/api/services/crm.service';
import type { NotificationDto } from '@/lib/api/services/crm.types';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/tr';

dayjs.extend(relativeTime);
dayjs.locale('tr');

type TabKey = 'all' | 'unread' | 'read';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState<TabKey>('all');

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const unreadOnly = activeTab === 'unread' ? true : activeTab === 'read' ? false : undefined;

      const response = await CRMService.getNotifications({
        unreadOnly,
        skip: 0,
        take: 50,
      });

      setNotifications(response.notifications);
      setUnreadCount(response.unreadCount);
    } catch (error) {
      showApiError(error, 'Bildirimler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [activeTab]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await CRMService.markNotificationAsRead(id);
      showSuccess('Bildirim okundu olarak işaretlendi');
      loadNotifications();
    } catch (error) {
      showApiError(error, 'Bildirim güncellenemedi');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await CRMService.markAllNotificationsAsRead();
      showSuccess('Tüm bildirimler okundu olarak işaretlendi');
      loadNotifications();
    } catch (error) {
      showApiError(error, 'Bildirimler güncellenemedi');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await CRMService.deleteNotification(id);
      showSuccess('Bildirim silindi');
      loadNotifications();
    } catch (error) {
      showApiError(error, 'Bildirim silinemedi');
    }
  };

  const getNotificationIcon = (type: string) => {
    const iconClasses = 'w-5 h-5';
    switch (type) {
      case 'Deal':
        return <TrophyIcon className={`${iconClasses} text-emerald-600`} />;
      case 'Task':
        return <CheckCircleIcon className={`${iconClasses} text-blue-600`} />;
      case 'Alert':
        return <ExclamationCircleIcon className={`${iconClasses} text-red-600`} />;
      case 'Workflow':
        return <InformationCircleIcon className={`${iconClasses} text-violet-600`} />;
      default:
        return <BellIcon className={`${iconClasses} text-slate-500`} />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, { text: string; color: string }> = {
      Deal: { text: 'Fırsat', color: 'bg-emerald-100 text-emerald-700' },
      Task: { text: 'Görev', color: 'bg-blue-100 text-blue-700' },
      Alert: { text: 'Uyarı', color: 'bg-red-100 text-red-700' },
      Workflow: { text: 'İş Akışı', color: 'bg-violet-100 text-violet-700' },
      Customer: { text: 'Müşteri', color: 'bg-cyan-100 text-cyan-700' },
    };
    return labels[type] || { text: type, color: 'bg-slate-100 text-slate-700' };
  };

  const getFilteredNotifications = () => {
    switch (activeTab) {
      case 'unread':
        return notifications.filter((n) => !n.isRead);
      case 'read':
        return notifications.filter((n) => n.isRead);
      default:
        return notifications;
    }
  };

  const filteredNotifications = getFilteredNotifications();
  const readCount = notifications.filter((n) => n.isRead).length;

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: 'all', label: 'Tümü', count: notifications.length },
    { key: 'unread', label: 'Okunmamış', count: unreadCount },
    { key: 'read', label: 'Okunmuş', count: readCount },
  ];

  const getDropdownItems = (notification: NotificationDto): MenuProps['items'] => {
    const items: MenuProps['items'] = [];

    if (!notification.isRead) {
      items.push({
        key: 'read',
        icon: <CheckIcon className="w-4 h-4" />,
        label: 'Okundu İşaretle',
        onClick: () => handleMarkAsRead(notification.id),
      });
    }

    items.push({
      key: 'delete',
      icon: <TrashIcon className="w-4 h-4" />,
      label: 'Sil',
      danger: true,
      onClick: () => handleDelete(notification.id),
    });

    return items;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Glass Effect Sticky Header */}
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <BellAlertIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-slate-900 m-0">Bildirimler</h1>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-slate-900 text-white rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 m-0">Tüm bildirimleri görüntüle ve yönet</p>
            </div>
          </div>
          {unreadCount > 0 && (
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              onClick={handleMarkAllAsRead}
              style={{
                background: '#1a1a1a',
                borderColor: '#1a1a1a',
                color: 'white',
              }}
            >
              Tümünü Okundu İşaretle
            </Button>
          )}
        </div>
      </div>

      {/* Page Content */}
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <div className="bg-white border border-slate-200 rounded-xl">
          {/* Tabs */}
          <div className="px-6 pt-4 border-b border-slate-100">
            <div className="flex items-center gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`
                    flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative
                    ${activeTab === tab.key
                      ? 'text-slate-900'
                      : 'text-slate-500 hover:text-slate-700'
                    }
                  `}
                >
                  {tab.label}
                  <span
                    className={`
                      px-1.5 py-0.5 text-xs font-medium rounded
                      ${activeTab === tab.key
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600'
                      }
                    `}
                  >
                    {tab.count}
                  </span>
                  {activeTab === tab.key && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications List */}
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Spin size="large" />
              </div>
            ) : filteredNotifications.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span className="text-slate-500">
                    {activeTab === 'unread'
                      ? 'Okunmamış bildirim yok'
                      : activeTab === 'read'
                      ? 'Okunmuş bildirim yok'
                      : 'Henüz bildirim yok'}
                  </span>
                }
                className="py-16"
              />
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map((notification) => {
                  const typeLabel = getTypeLabel(notification.type);
                  return (
                    <div
                      key={notification.id}
                      className={`
                        flex items-start gap-4 p-4 rounded-lg border transition-colors
                        ${notification.isRead
                          ? 'bg-white border-slate-200 hover:bg-slate-50'
                          : 'bg-blue-50/50 border-blue-100 hover:bg-blue-50'
                        }
                      `}
                    >
                      {/* Icon */}
                      <div
                        className={`
                          w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                          ${notification.isRead ? 'bg-slate-100' : 'bg-white'}
                        `}
                      >
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4
                                className={`
                                  text-sm m-0 truncate
                                  ${notification.isRead ? 'font-medium text-slate-700' : 'font-semibold text-slate-900'}
                                `}
                              >
                                {notification.title}
                              </h4>
                              <span
                                className={`px-2 py-0.5 text-xs font-medium rounded ${typeLabel.color}`}
                              >
                                {typeLabel.text}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 m-0 mb-1">{notification.message}</p>
                            <span className="text-xs text-slate-400">
                              {dayjs(notification.createdAt).fromNow()}
                            </span>
                          </div>

                          {/* Actions */}
                          <Dropdown
                            menu={{ items: getDropdownItems(notification) }}
                            trigger={['click']}
                            placement="bottomRight"
                          >
                            <Button
                              type="text"
                              icon={<EllipsisVerticalIcon className="w-4 h-4" />}
                              className="text-slate-400 hover:text-slate-600"
                            />
                          </Dropdown>
                        </div>
                      </div>

                      {/* Unread Indicator */}
                      {!notification.isRead && (
                        <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-4" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
