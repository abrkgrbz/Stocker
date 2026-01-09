'use client';

import React from 'react';
import {
  GiftIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import type { EmployeeBenefitDto } from '@/lib/api/services/hr.types';

interface EmployeeBenefitsStatsProps {
  benefits: EmployeeBenefitDto[];
  loading?: boolean;
}

export function EmployeeBenefitsStats({ benefits, loading = false }: EmployeeBenefitsStatsProps) {
  const totalBenefits = benefits.length;
  const activeBenefits = benefits.filter((b) => b.status === 'Active').length;
  const pendingBenefits = benefits.filter((b) => b.status === 'Pending').length;
  const expiredBenefits = benefits.filter((b) => b.status === 'Expired' || b.status === 'Cancelled').length;

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: 'Toplam Yan Hak',
      value: totalBenefits,
      subtitle: 'Kayitli Yan Haklar',
      icon: GiftIcon,
    },
    {
      title: 'Aktif',
      value: activeBenefits,
      subtitle: `${totalBenefits > 0 ? ((activeBenefits / totalBenefits) * 100).toFixed(0) : 0}% Aktif`,
      icon: CheckCircleIcon,
    },
    {
      title: 'Bekleyen',
      value: pendingBenefits,
      subtitle: 'Onay Bekliyor',
      icon: ClockIcon,
    },
    {
      title: 'Sona Eren',
      value: expiredBenefits,
      subtitle: 'Iptal/Suresi Dolmus',
      icon: ExclamationCircleIcon,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                {stat.title}
              </p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs text-slate-400 mt-1">{stat.subtitle}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <stat.icon className="w-5 h-5 text-slate-600" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
