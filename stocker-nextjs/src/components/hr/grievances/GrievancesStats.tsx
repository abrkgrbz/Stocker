'use client';

import React from 'react';
import {
  ExclamationCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import type { GrievanceDto } from '@/lib/api/services/hr.types';

interface GrievancesStatsProps {
  grievances: GrievanceDto[];
  loading?: boolean;
}

export function GrievancesStats({ grievances, loading = false }: GrievancesStatsProps) {
  const totalGrievances = grievances.length;
  const openGrievances = grievances.filter((g) => g.status === 'Open' || g.status === 'UnderReview').length;
  const investigatingGrievances = grievances.filter((g) => g.status === 'Investigating' || g.status === 'PendingResolution').length;
  const resolvedGrievances = grievances.filter((g) => g.status === 'Resolved' || g.status === 'Closed').length;

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
      title: 'Toplam Sikayet',
      value: totalGrievances,
      subtitle: 'Kayitli Sikayetler',
      icon: ExclamationCircleIcon,
    },
    {
      title: 'Acik',
      value: openGrievances,
      subtitle: 'Bekleyen',
      icon: ClockIcon,
    },
    {
      title: 'Incelemede',
      value: investigatingGrievances,
      subtitle: 'Aktif Sorusturma',
      icon: MagnifyingGlassIcon,
    },
    {
      title: 'Cozumlenen',
      value: resolvedGrievances,
      subtitle: `${totalGrievances > 0 ? ((resolvedGrievances / totalGrievances) * 100).toFixed(0) : 0}% Sonuclanan`,
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
