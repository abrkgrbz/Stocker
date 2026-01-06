'use client';

import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
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
      title: 'Toplam İşlem',
      value: totalActions,
      subtitle: 'Disiplin İşlemleri',
      icon: ExclamationTriangleIcon,
      color: '#ef4444',
    },
    {
      title: 'Soruşturmada',
      value: investigationActions,
      subtitle: 'Aktif Soruşturma',
      icon: MagnifyingGlassIcon,
      color: '#3b82f6',
    },
    {
      title: 'Bekleyen',
      value: pendingActions,
      subtitle: 'İnceleme Bekliyor',
      icon: ClockIcon,
      color: '#f59e0b',
    },
    {
      title: 'Sonuçlanan',
      value: closedActions,
      subtitle: 'Kapatılmış',
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
