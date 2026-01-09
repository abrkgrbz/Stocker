'use client';

import React from 'react';
import {
  RocketLaunchIcon,
  ClockIcon,
  CheckCircleIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';
import type { OnboardingDto } from '@/lib/api/services/hr.types';

interface OnboardingsStatsProps {
  onboardings: OnboardingDto[];
  loading?: boolean;
}

export function OnboardingsStats({ onboardings, loading = false }: OnboardingsStatsProps) {
  const totalOnboardings = onboardings.length;
  const inProgressOnboardings = onboardings.filter((o) => o.status === 'InProgress').length;
  const completedOnboardings = onboardings.filter((o) => o.status === 'Completed').length;
  const newThisMonth = onboardings.filter((o) => {
    const startDate = new Date(o.startDate);
    const now = new Date();
    return startDate.getMonth() === now.getMonth() && startDate.getFullYear() === now.getFullYear();
  }).length;

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
      title: 'Toplam Surec',
      value: totalOnboardings,
      subtitle: 'Tum Onboarding',
      icon: RocketLaunchIcon,
    },
    {
      title: 'Devam Eden',
      value: inProgressOnboardings,
      subtitle: 'Aktif Surecler',
      icon: ClockIcon,
    },
    {
      title: 'Bu Ay Baslayan',
      value: newThisMonth,
      subtitle: 'Yeni Katilimlar',
      icon: UserPlusIcon,
    },
    {
      title: 'Tamamlanan',
      value: completedOnboardings,
      subtitle: `${totalOnboardings > 0 ? ((completedOnboardings / totalOnboardings) * 100).toFixed(0) : 0}% Basari`,
      icon: CheckCircleIcon,
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
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                {stat.title}
              </p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs text-slate-400 mt-1">{stat.subtitle}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <stat.icon className="w-5 h-5 text-slate-500" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
