'use client';

import React from 'react';
import {
  CursorArrowRaysIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import type { PerformanceGoalDto } from '@/lib/api/services/hr.types';

interface GoalsStatsProps {
  goals: PerformanceGoalDto[];
  loading?: boolean;
}

export function GoalsStats({ goals, loading = false }: GoalsStatsProps) {
  const totalGoals = goals.length;
  const completedGoals = goals.filter((g) => g.status === 'Completed').length;
  const inProgressGoals = goals.filter((g) => g.status === 'InProgress').length;
  const overdueGoals = goals.filter((g) => g.isOverdue).length;

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
      title: 'Toplam Hedef',
      value: totalGoals,
      subtitle: 'Kayitli Hedefler',
      icon: CursorArrowRaysIcon,
    },
    {
      title: 'Devam Eden',
      value: inProgressGoals,
      subtitle: 'Aktif Hedefler',
      icon: ClockIcon,
    },
    {
      title: 'Tamamlanan',
      value: completedGoals,
      subtitle: `${totalGoals > 0 ? ((completedGoals / totalGoals) * 100).toFixed(0) : 0}% Tamamlama`,
      icon: CheckCircleIcon,
    },
    {
      title: 'Geckimis',
      value: overdueGoals,
      subtitle: 'Suresi Gecmis',
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
