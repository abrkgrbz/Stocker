'use client';

/**
 * TargetStatistics Component
 * Displays summary statistics for sales targets
 * Feature-Based Architecture - Smart Component
 */

import React from 'react';
import { Skeleton } from 'antd';
import { StatCard } from '@/components/ui/enterprise-page';
import { AimOutlined, DollarOutlined, RiseOutlined, TeamOutlined } from '@ant-design/icons';
import { useSalesTargetStatistics } from '../../hooks';

interface TargetStatisticsProps {
  className?: string;
}

export function TargetStatistics({ className }: TargetStatisticsProps) {
  const { data: stats, isLoading } = useSalesTargetStatistics();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading || !stats) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-slate-200 p-4">
            <Skeleton active paragraph={{ rows: 1 }} />
          </div>
        ))}
      </div>
    );
  }

  const overallProgress = stats.totalTargetAmount > 0
    ? Math.round((stats.totalAchievedAmount / stats.totalTargetAmount) * 100)
    : 0;

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      <StatCard
        label="Toplam Hedef"
        value={formatCurrency(stats.totalTargetAmount)}
        icon={<AimOutlined />}
        iconColor="#6366f1"
      />
      <StatCard
        label="Toplam Gerçekleşen"
        value={formatCurrency(stats.totalAchievedAmount)}
        icon={<DollarOutlined />}
        iconColor="#10b981"
        trend={{
          value: overallProgress - 100,
          isPositive: overallProgress >= 100,
        }}
      />
      <StatCard
        label="Genel Başarı"
        value={`%${Math.round(stats.averageProgress)}`}
        icon={<RiseOutlined />}
        iconColor="#f59e0b"
      />
      <StatCard
        label="Hedefi Aşanlar"
        value={`${stats.achievedCount} / ${stats.totalTargets}`}
        icon={<TeamOutlined />}
        iconColor="#3b82f6"
      />
    </div>
  );
}
