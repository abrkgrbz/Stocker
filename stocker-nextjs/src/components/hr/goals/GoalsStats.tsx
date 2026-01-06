'use client';

import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
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
      title: 'Toplam Hedef',
      value: totalGoals,
      subtitle: 'Kayıtlı Hedefler',
      icon: CursorArrowRaysIcon,
      color: '#7c3aed',
    },
    {
      title: 'Devam Eden',
      value: inProgressGoals,
      subtitle: 'Aktif Hedefler',
      icon: ClockIcon,
      color: '#3b82f6',
    },
    {
      title: 'Tamamlanan',
      value: completedGoals,
      subtitle: `${totalGoals > 0 ? ((completedGoals / totalGoals) * 100).toFixed(0) : 0}% Tamamlama`,
      icon: CheckCircleIcon,
      color: '#10b981',
    },
    {
      title: 'Gecikmiş',
      value: overdueGoals,
      subtitle: 'Süresi Geçmiş',
      icon: ExclamationCircleIcon,
      color: '#ef4444',
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
