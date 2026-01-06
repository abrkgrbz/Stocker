'use client';

import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
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
      <Row gutter={[16, 16]}>
        {[0, 1, 2, 3].map((i) => (
          <Col xs={12} sm={6} key={i}>
            <div className="h-24 bg-gray-100 rounded-lg animate-pulse" />
          </Col>
        ))}
      </Row>
    );
  }

  const stats = [
    {
      title: 'Toplam Mülakat',
      value: totalInterviews,
      subtitle: 'Planlanan Görüşmeler',
      icon: UserGroupIcon,
      color: '#7c3aed',
    },
    {
      title: 'Planlanmış',
      value: scheduledInterviews,
      subtitle: 'Bekleyen',
      icon: ClockIcon,
      color: '#3b82f6',
    },
    {
      title: 'Bugün',
      value: todayInterviews,
      subtitle: 'Günün Mülakatları',
      icon: CalendarIcon,
      color: '#f59e0b',
    },
    {
      title: 'Tamamlanan',
      value: completedInterviews,
      subtitle: `${totalInterviews > 0 ? ((completedInterviews / totalInterviews) * 100).toFixed(0) : 0}% Tamamlandı`,
      icon: CheckCircleIcon,
      color: '#10b981',
    },
  ];

  return (
    <Row gutter={[16, 16]}>
      {stats.map((stat, index) => (
        <Col xs={12} sm={6} key={index}>
          <Card className="h-full border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <Statistic
                  title={<span className="text-gray-500 text-sm">{stat.title}</span>}
                  value={stat.value}
                  valueStyle={{ color: '#1f2937', fontWeight: 'bold', fontSize: '1.75rem' }}
                />
                <div className="text-xs mt-1" style={{ color: stat.color }}>
                  {stat.subtitle}
                </div>
              </div>
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}15` }}
              >
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
