'use client';

import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
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
      title: 'Toplam Süreç',
      value: totalOnboardings,
      subtitle: 'Tüm Onboarding',
      icon: RocketLaunchIcon,
      color: '#7c3aed',
    },
    {
      title: 'Devam Eden',
      value: inProgressOnboardings,
      subtitle: 'Aktif Süreçler',
      icon: ClockIcon,
      color: '#3b82f6',
    },
    {
      title: 'Bu Ay Başlayan',
      value: newThisMonth,
      subtitle: 'Yeni Katılımlar',
      icon: UserPlusIcon,
      color: '#f59e0b',
    },
    {
      title: 'Tamamlanan',
      value: completedOnboardings,
      subtitle: `${totalOnboardings > 0 ? ((completedOnboardings / totalOnboardings) * 100).toFixed(0) : 0}% Başarı`,
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
