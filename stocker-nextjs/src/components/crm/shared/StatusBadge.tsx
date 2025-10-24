'use client';

import React from 'react';
import { Tag } from 'antd';
import { CRM_COLORS, CRM_STATUS_LABELS } from '@/lib/crm';

type EntityType = 'leads' | 'deals' | 'customers' | 'activityStatus';

interface StatusBadgeProps {
  status: string;
  entityType: EntityType;
}

export function StatusBadge({ status, entityType }: StatusBadgeProps) {
  const color = CRM_COLORS[entityType === 'activityStatus' ? 'activities' : entityType]?.[status as keyof typeof CRM_COLORS.leads] || 'default';
  const label = CRM_STATUS_LABELS[entityType]?.[status as keyof typeof CRM_STATUS_LABELS.leads] || status;

  return <Tag color={color}>{label}</Tag>;
}
