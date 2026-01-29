'use client';

import React, { useState } from 'react';
import { Button, Empty, Dropdown, Spin } from 'antd';
import type { MenuProps } from 'antd';
import {
  BellIcon,
  CheckCircleIcon,
  CheckIcon,
  EllipsisVerticalIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  TrashIcon,
  BellAlertIcon,
  ShoppingCartIcon,
  DocumentTextIcon,
  CubeIcon,
  UserIcon,
  CreditCardIcon,
  TruckIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import {
  useAlerts,
  useUnreadAlertCount,
  useMarkAlertAsRead,
  useMarkAllAlertsAsRead,
  useDismissAlert,
} from '@/features/alerts';
import type { Alert, AlertCategory, AlertSeverity } from '@/features/alerts';
import { alertSeverityConfig, alertCategoryConfig } from '@/features/alerts';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/tr';

dayjs.extend(relativeTime);
dayjs.locale('tr');

type TabKey = 'all' | 'unread' | 'read';

// Heroicon type
type HeroIcon = React.ComponentType<React.SVGProps<SVGSVGElement>>;

// Category icons mapping
const categoryIcons: Record<AlertCategory, HeroIcon> = {
  System: BellIcon,
  Order: ShoppingCartIcon,
  Quotation: DocumentTextIcon,
  Invoice: DocumentTextIcon,
  Contract: DocumentTextIcon,
  Payment: CreditCardIcon,
  Shipment: TruckIcon,
  Return: TruckIcon,
  Stock: CubeIcon,
  Warehouse: CubeIcon,
  Product: CubeIcon,
  Customer: UserIcon,
  Lead: UserIcon,
  Opportunity: UserIcon,
  Budget: CurrencyDollarIcon,
  Credit: CreditCardIcon,
  Employee: UserGroupIcon,
  Payroll: CurrencyDollarIcon,
};

// Severity icons mapping
const severityIcons: Record<AlertSeverity, HeroIcon> = {
  Info: InformationCircleIcon,
  Low: BellIcon,
  Medium: ExclamationTriangleIcon,
  High: ExclamationCircleIcon,
  Critical: XCircleIcon,
};

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('all');

  // Fetch alerts based on active tab
  const isReadFilter = activeTab === 'unread' ? false : activeTab === 'read' ? true : undefined;

  const { data: alerts = [], isLoading } = useAlerts({
    isRead: isReadFilter,
    limit: 50,
  });

  const { data: unreadCount = 0 } = useUnreadAlertCount();
  const markAsRead = useMarkAlertAsRead();
  const markAllAsRead = useMarkAllAlertsAsRead();
  const dismissAlert = useDismissAlert();

  const handleMarkAsRead = (id: number) => {
    markAsRead.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  const handleDismiss = (id: number) => {
    dismissAlert.mutate(id);
  };

  const getAlertIcon = (alert: Alert) => {
    const CategoryIcon = categoryIcons[alert.category] ?? BellIcon;
    const severityConfig = alertSeverityConfig[alert.severity] ?? alertSeverityConfig.Info;
    return (
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${alert.isRead ? 'bg-slate-100' : 'bg-white'}`}>
        <CategoryIcon className={`w-5 h-5 ${severityConfig.color}`} />
      </div>
    );
  };

  const readCount = alerts.filter((a) => a.isRead).length;
  const allCount = alerts.length;

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: 'all', label: 'Tümü', count: allCount },
    { key: 'unread', label: 'Okunmamış', count: unreadCount },
    { key: 'read', label: 'Okunmuş', count: readCount },
  ];

  const getDropdownItems = (alert: Alert): MenuProps['items'] => {
    const items: MenuProps['items'] = [];

    if (!alert.isRead) {
      items.push({
        key: 'read',
        icon: <CheckIcon className="w-4 h-4" />,
        label: 'Okundu İşaretle',
        onClick: () => handleMarkAsRead(alert.id),
      });
    }

    items.push({
      key: 'dismiss',
      icon: <TrashIcon className="w-4 h-4" />,
      label: 'Kaldır',
      danger: true,
      onClick: () => handleDismiss(alert.id),
    });

    return items;
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
            <BellAlertIcon className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-slate-900 m-0">Bildirimler</h1>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full">
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
            loading={markAllAsRead.isPending}
            className="bg-slate-900 border-slate-900 hover:bg-slate-800 hover:border-slate-800"
          >
            Tümünü Okundu İşaretle
          </Button>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        {/* Tabs */}
        <div className="px-6 pt-4 border-b border-slate-100">
          <div className="flex items-center gap-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  flex items-center gap-2 pb-4 text-sm font-medium transition-colors relative whitespace-nowrap
                  ${activeTab === tab.key
                    ? 'text-slate-900'
                    : 'text-slate-500 hover:text-slate-700'
                  }
                `}
              >
                {tab.label}
                <span
                  className={`
                    px-2 py-0.5 text-xs font-medium rounded-full
                    ${activeTab === tab.key
                      ? 'bg-slate-100 text-slate-900'
                      : 'bg-slate-50 text-slate-500'
                    }
                  `}
                >
                  {tab.count}
                </span>
                {activeTab === tab.key && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-t-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Alerts List */}
        <div className="divide-y divide-slate-100">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Spin size="large" />
            </div>
          ) : alerts.length === 0 ? (
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
            alerts.map((alert) => {
              const severityConfig = alertSeverityConfig[alert.severity] ?? alertSeverityConfig.Info;
              const categoryConfig = alertCategoryConfig[alert.category] ?? alertCategoryConfig.System;

              return (
                <div
                  key={alert.id}
                  className={`
                    flex items-start gap-4 p-6 transition-colors hover:bg-slate-50/50
                    ${alert.isRead ? 'opacity-75' : 'bg-blue-50/30'}
                  `}
                >
                  {/* Icon */}
                  {getAlertIcon(alert)}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4
                            className={`
                              text-sm m-0 truncate
                              ${alert.isRead ? 'font-medium text-slate-700' : 'font-semibold text-slate-900'}
                            `}
                          >
                            {alert.title}
                          </h4>
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded ${severityConfig.bgColor} ${severityConfig.color}`}
                          >
                            {categoryConfig.label}
                          </span>
                          {!alert.isRead && (
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                          )}
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">{alert.message}</p>
                        <div className="flex items-center gap-4 pt-1">
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <ClockIcon className="w-3 h-3" />
                            {dayjs(alert.createdAt).fromNow()}
                          </span>
                          {alert.actionUrl && alert.actionLabel && (
                            <a
                              href={alert.actionUrl}
                              className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                              onClick={(e) => {
                                if (!alert.isRead) {
                                  handleMarkAsRead(alert.id);
                                }
                              }}
                            >
                              {alert.actionLabel}
                              <ArrowRightIcon className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <Dropdown
                        menu={{ items: getDropdownItems(alert) }}
                        trigger={['click']}
                        placement="bottomRight"
                      >
                        <Button
                          type="text"
                          icon={<EllipsisVerticalIcon className="w-5 h-5" />}
                          className="text-slate-400 hover:text-slate-600 -mr-2"
                        />
                      </Dropdown>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
