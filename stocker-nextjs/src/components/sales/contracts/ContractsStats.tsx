'use client';

/**
 * Customer Contracts Stats Component
 * Dashboard-style statistics cards for contracts overview
 */

import React from 'react';
import { Spin } from 'antd';
import { FileTextOutlined, CheckCircleOutlined, ClockCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { StatCard } from '@/components/ui/enterprise-page';
import type { CustomerContractListDto } from '@/lib/api/services/sales.service';

interface ContractsStatsProps {
  contracts: CustomerContractListDto[];
  totalCount: number;
  loading?: boolean;
}

export function ContractsStats({ contracts, totalCount, loading = false }: ContractsStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-center h-24">
            <Spin size="small" />
          </div>
        ))}
      </div>
    );
  }

  const activeCount = contracts.filter((c) => c.status === 'Active').length;
  const pendingCount = contracts.filter((c) => c.status === 'Draft' || c.status === 'PendingApproval').length;
  const expiringCount = contracts.filter((c) => {
    if (c.status !== 'Active') return false;
    const endDate = new Date(c.endDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  }).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Toplam Sözleşme"
        value={totalCount}
        icon={<FileTextOutlined />}
        iconColor="#6366f1"
      />
      <StatCard
        label="Aktif Sözleşme"
        value={activeCount}
        icon={<CheckCircleOutlined />}
        iconColor="#10b981"
      />
      <StatCard
        label="Bekleyen"
        value={pendingCount}
        icon={<ClockCircleOutlined />}
        iconColor="#f59e0b"
      />
      <StatCard
        label="30 Gün İçinde Sona Erecek"
        value={expiringCount}
        icon={<WarningOutlined />}
        iconColor="#ef4444"
      />
    </div>
  );
}
