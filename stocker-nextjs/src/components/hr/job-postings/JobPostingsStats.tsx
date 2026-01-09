'use client';

import React from 'react';
import {
  DocumentTextIcon,
  CheckCircleIcon,
  UserGroupIcon,
  BriefcaseIcon,
} from '@heroicons/react/24/outline';
import type { JobPostingDto } from '@/lib/api/services/hr.types';

interface JobPostingsStatsProps {
  postings: JobPostingDto[];
  loading?: boolean;
}

export function JobPostingsStats({ postings, loading = false }: JobPostingsStatsProps) {
  const totalPostings = postings.length;
  const publishedPostings = postings.filter((jp) => jp.status === 'Published').length;
  const totalApplications = postings.reduce((sum, jp) => sum + (jp.totalApplications || 0), 0);
  const totalHired = postings.reduce((sum, jp) => sum + (jp.hiredCount || 0), 0);

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
      title: 'Toplam İlan',
      value: totalPostings,
      subtitle: 'Kayıtlı İlanlar',
      icon: DocumentTextIcon,
    },
    {
      title: 'Yayında',
      value: publishedPostings,
      subtitle: `${totalPostings > 0 ? ((publishedPostings / totalPostings) * 100).toFixed(0) : 0}% Aktif`,
      icon: CheckCircleIcon,
    },
    {
      title: 'Toplam Başvuru',
      value: totalApplications,
      subtitle: 'Gelen Başvurular',
      icon: UserGroupIcon,
    },
    {
      title: 'İşe Alınan',
      value: totalHired,
      subtitle: 'Başarılı Eşleşme',
      icon: BriefcaseIcon,
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
