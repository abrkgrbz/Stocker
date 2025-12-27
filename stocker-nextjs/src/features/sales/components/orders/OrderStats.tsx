'use client';

/**
 * OrderStats Component
 * Displays order statistics in a grid of cards
 * Feature-Based Architecture - Smart Component
 */

import React, { useMemo } from 'react';
import { Skeleton } from 'antd';
import {
  ShoppingCartIcon,
  ClockIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import type { SalesOrderListItem } from '../../types';

interface OrderStatsProps {
  orders: SalesOrderListItem[];
  totalCount: number;
  isLoading?: boolean;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  isLoading?: boolean;
}

function StatCard({ title, value, icon, iconBg, iconColor, isLoading }: StatCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-500 uppercase tracking-wide">{title}</span>
          {isLoading ? (
            <Skeleton.Input active size="small" style={{ width: 80, marginTop: 8 }} />
          ) : (
            <div className="text-2xl font-semibold text-slate-900">{value}</div>
          )}
        </div>
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: iconBg, color: iconColor }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

export function OrderStats({ orders, totalCount, isLoading }: OrderStatsProps) {
  const stats = useMemo(() => {
    const draft = orders.filter((o) => o.status === 'Draft').length;
    const pending = orders.filter((o) =>
      ['Approved', 'Confirmed', 'Shipped'].includes(o.status)
    ).length;
    const totalValue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    return { total: totalCount, draft, pending, totalValue };
  }, [orders, totalCount]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <StatCard
        title="Toplam Sipariş"
        value={stats.total}
        icon={<ShoppingCartIcon className="w-5 h-5" />}
        iconBg="#6366f115"
        iconColor="#6366f1"
        isLoading={isLoading}
      />
      <StatCard
        title="Taslak"
        value={stats.draft}
        icon={<ClockIcon className="w-5 h-5" />}
        iconBg={stats.draft > 0 ? '#f59e0b15' : '#64748b15'}
        iconColor={stats.draft > 0 ? '#f59e0b' : '#64748b'}
        isLoading={isLoading}
      />
      <StatCard
        title="İşlemde"
        value={stats.pending}
        icon={<CheckCircleIcon className="w-5 h-5" />}
        iconBg="#3b82f615"
        iconColor="#3b82f6"
        isLoading={isLoading}
      />
      <StatCard
        title="Toplam Tutar"
        value={formatCurrency(stats.totalValue)}
        icon={<CurrencyDollarIcon className="w-5 h-5" />}
        iconBg="#10b98115"
        iconColor="#10b981"
        isLoading={isLoading}
      />
    </div>
  );
}
