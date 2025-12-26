'use client';

/**
 * QuotationStatusBadge Component
 * Displays quotation status with appropriate styling
 * Feature-Based Architecture - Presentational Component
 */

import React from 'react';
import { Tag } from 'antd';
import type { QuotationStatus } from '../../types';

interface QuotationStatusBadgeProps {
  status: QuotationStatus | string;
  size?: 'small' | 'default';
}

const statusConfig: Record<string, { color: string; label: string; antColor: string }> = {
  Draft: { color: '#64748b', label: 'Taslak', antColor: 'default' },
  PendingApproval: { color: '#f59e0b', label: 'Onay Bekliyor', antColor: 'processing' },
  Approved: { color: '#06b6d4', label: 'Onaylandı', antColor: 'cyan' },
  Sent: { color: '#3b82f6', label: 'Gönderildi', antColor: 'blue' },
  Accepted: { color: '#10b981', label: 'Kabul Edildi', antColor: 'success' },
  Rejected: { color: '#ef4444', label: 'Reddedildi', antColor: 'error' },
  Expired: { color: '#f59e0b', label: 'Süresi Doldu', antColor: 'warning' },
  Cancelled: { color: '#64748b', label: 'İptal', antColor: 'default' },
  ConvertedToOrder: { color: '#6366f1', label: 'Siparişe Dönüştürüldü', antColor: 'geekblue' },
};

export function QuotationStatusBadge({ status, size = 'default' }: QuotationStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.Draft;

  return (
    <Tag color={config.antColor} className={size === 'small' ? 'text-xs' : ''}>
      {config.label}
    </Tag>
  );
}

export { statusConfig as quotationStatusConfig };
