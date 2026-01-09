'use client';

import React from 'react';
import {
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import type { InterviewDto } from '@/lib/api/services/hr.types';

interface InterviewsStatsProps {
  interviews: InterviewDto[];
  loading?: boolean;
}

export function InterviewsStats({ interviews, loading = false }: InterviewsStatsProps) {
  const totalInterviews = interviews.length;
  const scheduledInterviews = interviews.filter((i) => i.status === 'Scheduled' || i.status === 'Confirmed').length;
  const completedInterviews = interviews.filter((i) => i.status === 'Completed').length;
  const todayInterviews = interviews.filter((i) => {
    const today = new Date().toDateString();
    return new Date(i.scheduledDateTime).toDateString() === today;
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
      title: 'Toplam Mulakat',
      value: totalInterviews,
      subtitle: 'Planlanan Gorusmeler',
      icon: UserGroupIcon,
    },
    {
      title: 'Planlanmis',
      value: scheduledInterviews,
      subtitle: 'Bekleyen',
      icon: ClockIcon,
    },
    {
      title: 'Bugun',
      value: todayInterviews,
      subtitle: 'Gunun Mulakatlari',
      icon: CalendarIcon,
    },
    {
      title: 'Tamamlanan',
      value: completedInterviews,
      subtitle: `${totalInterviews > 0 ? ((completedInterviews / totalInterviews) * 100).toFixed(0) : 0}% Tamamlandi`,
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
