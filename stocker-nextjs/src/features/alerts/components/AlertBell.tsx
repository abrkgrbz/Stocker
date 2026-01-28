'use client';

/**
 * AlertBell Component
 * Shows notification bell with unread count badge
 * Opens alert dropdown on click
 */

import React, { useState } from 'react';
import { Badge, Popover, Button, Tooltip, Empty, Spin } from 'antd';
import { BellIcon } from '@heroicons/react/24/outline'; // Using same icon set as layout
import { useUnreadAlertCount, useAlerts, useMarkAlertAsRead, useMarkAllAlertsAsRead, useDismissAlert } from '../hooks/useAlerts';
import { AlertItem } from './AlertItem';
import type { AlertFilterParams } from '../types';
import { CheckCheck } from 'lucide-react'; // Using Lucide for smaller icons inside popover if needed, or stick to Heroicons

interface AlertBellProps {
  className?: string;
}

export function AlertBell({ className = '' }: AlertBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: unreadCount = 0 } = useUnreadAlertCount();

  const filterParams: AlertFilterParams = {
    limit: 10,
    includeDismissed: false,
  };
  const { data: alerts, isLoading } = useAlerts(isOpen ? filterParams : undefined);

  const markAsReadMutation = useMarkAlertAsRead();
  const markAllAsReadMutation = useMarkAllAlertsAsRead();
  const dismissMutation = useDismissAlert();

  const handleMarkAsRead = (id: number) => {
    markAsReadMutation.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleDismiss = (id: number) => {
    dismissMutation.mutate(id);
  };

  const content = (
    <div className="w-80 sm:w-96">
      <div className="flex items-center justify-between mb-4 px-1">
        <h4 className="font-semibold text-base m-0">Bildirimler</h4>
        {unreadCount > 0 && (
          <Button
            type="text"
            size="small"
            className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1"
            onClick={handleMarkAllAsRead}
            loading={markAllAsReadMutation.isPending}
            icon={<CheckCheck className="w-3 h-3" />}
          >
            Tümünü Oku
          </Button>
        )}
      </div>

      <div className="max-h-[400px] overflow-y-auto -mx-4 px-4 custom-scrollbar">
        {isLoading ? (
          <div className="py-8 text-center flex justify-center">
            <Spin />
          </div>
        ) : alerts && alerts.length > 0 ? (
          <div className="flex flex-col gap-1">
            {alerts.map((alert) => (
              <AlertItem
                key={alert.id}
                alert={alert}
                onMarkAsRead={handleMarkAsRead}
                onDismiss={handleDismiss}
                compact
              />
            ))}
          </div>
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Bildirim bulunmuyor" />
        )}
      </div>

      {alerts && alerts.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-100 text-center">
          <Button type="link" size="small" href="/notifications">
            Tümünü Gör
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      open={isOpen}
      onOpenChange={setIsOpen}
      placement="bottomRight"
      arrow={false}
      overlayClassName="alert-popover"
    >
      <div className={className}>
        <Tooltip title="Bildirimler">
          <button
            type="button"
            className="
                relative w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-150
                text-slate-500 hover:bg-slate-100 hover:text-slate-700
                "
          >
            <Badge count={unreadCount} size="small" offset={[-2, 2]}>
              <BellIcon className="w-[18px] h-[18px]" strokeWidth={1.75} />
            </Badge>
          </button>
        </Tooltip>
      </div>
    </Popover>
  );
}
