'use client';

/**
 * Sales Territories Stats Component
 * Dashboard-style statistics cards for territories overview
 */

import React from 'react';
import { Spin } from 'antd';
import {
  GlobeAltIcon,
  CheckCircleIcon,
  UserGroupIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { StatCard } from '@/components/ui/enterprise-page';
import type { SalesTerritoryListDto } from '@/lib/api/services/sales.service';

interface TerritoriesStatsProps {
  territories: SalesTerritoryListDto[];
  totalCount: number;
  loading?: boolean;
}

export function TerritoriesStats({ territories, totalCount, loading = false }: TerritoriesStatsProps) {
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

  const activeCount = territories.filter((t) => t.status === 'Active').length;
  const totalSalesReps = territories.reduce((sum, t) => sum + (t.activeAssignmentCount || 0), 0);
  const totalCustomers = territories.reduce((sum, t) => sum + (t.customerCount || 0), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Toplam Bölge"
        value={totalCount}
        icon={<GlobeAltIcon className="w-5 h-5" />}
        iconColor="#6366f1"
      />
      <StatCard
        label="Aktif Bölge"
        value={activeCount}
        icon={<CheckCircleIcon className="w-5 h-5" />}
        iconColor="#10b981"
      />
      <StatCard
        label="Satış Temsilcisi"
        value={totalSalesReps}
        icon={<UserGroupIcon className="w-5 h-5" />}
        iconColor="#f59e0b"
      />
      <StatCard
        label="Toplam Müşteri"
        value={totalCustomers}
        icon={<UserIcon className="w-5 h-5" />}
        iconColor="#3b82f6"
      />
    </div>
  );
}
