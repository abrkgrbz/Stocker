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
  const entityKey = entityType === 'activityStatus' ? 'activities' : entityType;
  const color = (CRM_COLORS as any)[entityKey]?.[status] || 'default';
  const label = (CRM_STATUS_LABELS as any)[entityType]?.[status] || status;

  return <Tag color={color}>{label}</Tag>;
}
