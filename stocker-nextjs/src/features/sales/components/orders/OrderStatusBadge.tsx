'use client';

/**
 * OrderStatusBadge Component
 * Displays order status with appropriate styling
 * Feature-Based Architecture - Presentational Component
 */

import React from 'react';
import { Tag } from 'antd';
import type { SalesOrderStatus } from '../../types';

interface OrderStatusBadgeProps {
  status: SalesOrderStatus | string;
  size?: 'small' | 'default';
}

const statusConfig: Record<string, { color: string; label: string; bgColor: string }> = {
  Draft: { color: '#64748b', label: 'Taslak', bgColor: '#64748b15' },
  Approved: { color: '#3b82f6', label: 'Onaylı', bgColor: '#3b82f615' },
  Confirmed: { color: '#06b6d4', label: 'Onaylandı', bgColor: '#06b6d415' },
  Shipped: { color: '#8b5cf6', label: 'Gönderildi', bgColor: '#8b5cf615' },
  Delivered: { color: '#6366f1', label: 'Teslim Edildi', bgColor: '#6366f115' },
  Completed: { color: '#10b981', label: 'Tamamlandı', bgColor: '#10b98115' },
  Cancelled: { color: '#ef4444', label: 'İptal', bgColor: '#ef444415' },
};

const colorMap: Record<string, string> = {
  '#10b981': 'green',
  '#ef4444': 'red',
  '#3b82f6': 'blue',
  '#06b6d4': 'cyan',
  '#8b5cf6': 'purple',
  '#6366f1': 'geekblue',
  '#64748b': 'default',
};

export function OrderStatusBadge({ status, size = 'default' }: OrderStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.Draft;
  const antColor = colorMap[config.color] || 'default';

  return (
    <Tag color={antColor} className={size === 'small' ? 'text-xs' : ''}>
      {config.label}
    </Tag>
  );
}

export { statusConfig as orderStatusConfig };
