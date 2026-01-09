'use client';

import React from 'react';
import {
  DocumentTextIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import type { JobApplicationDto } from '@/lib/api/services/hr.types';

interface JobApplicationsStatsProps {
  applications: JobApplicationDto[];
  loading?: boolean;
}

export function JobApplicationsStats({ applications, loading = false }: JobApplicationsStatsProps) {
  const totalApplications = applications.length;
  const newApplications = applications.filter((a) => a.status === 'New' || a.status === 'Screening').length;
  const inProgressApplications = applications.filter((a) =>
    a.status === 'Interview' || a.status === 'Assessment' || a.status === 'Reference' || a.status === 'Offer'
  ).length;
  const hiredApplications = applications.filter((a) => a.status === 'Hired').length;

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
      title: 'Toplam Basvuru',
      value: totalApplications,
      subtitle: 'Gelen Basvurular',
      icon: DocumentTextIcon,
    },
    {
      title: 'Yeni Basvurular',
      value: newApplications,
      subtitle: 'Inceleme Bekliyor',
      icon: UserGroupIcon,
    },
    {
      title: 'Surecte',
      value: inProgressApplications,
      subtitle: 'Mulakat/Degerlendirme',
      icon: ClockIcon,
    },
    {
      title: 'Ise Alinan',
      value: hiredApplications,
      subtitle: `${totalApplications > 0 ? ((hiredApplications / totalApplications) * 100).toFixed(0) : 0}% Basarili`,
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
