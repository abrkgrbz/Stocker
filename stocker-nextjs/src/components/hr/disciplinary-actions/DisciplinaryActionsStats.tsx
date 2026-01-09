'use client';

import React from 'react';
import {
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import type { DisciplinaryActionDto } from '@/lib/api/services/hr.types';

interface DisciplinaryActionsStatsProps {
  actions: DisciplinaryActionDto[];
  loading?: boolean;
}

export function DisciplinaryActionsStats({ actions, loading = false }: DisciplinaryActionsStatsProps) {
  const totalActions = actions.length;
  const investigationActions = actions.filter((a) => a.status === 'UnderInvestigation').length;
  const pendingActions = actions.filter((a) => a.status === 'PendingReview' || a.status === 'Draft').length;
  const closedActions = actions.filter((a) => a.status === 'Closed' || a.status === 'Implemented').length;

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
      title: 'Toplam Islem',
      value: totalActions,
      subtitle: 'Disiplin Islemleri',
      icon: ExclamationTriangleIcon,
    },
    {
      title: 'Sorusturmada',
      value: investigationActions,
      subtitle: 'Aktif Sorusturma',
      icon: MagnifyingGlassIcon,
    },
    {
      title: 'Bekleyen',
      value: pendingActions,
      subtitle: 'Inceleme Bekliyor',
      icon: ClockIcon,
    },
    {
      title: 'Sonuclanan',
      value: closedActions,
      subtitle: 'Kapatilmis',
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
