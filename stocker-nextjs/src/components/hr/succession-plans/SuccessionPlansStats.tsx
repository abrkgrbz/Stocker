'use client';

import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import {
  StarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import type { SuccessionPlanDto } from '@/lib/api/services/hr.types';

interface SuccessionPlansStatsProps {
  plans: SuccessionPlanDto[];
  loading?: boolean;
}

export function SuccessionPlansStats({ plans, loading = false }: SuccessionPlansStatsProps) {
  const totalPlans = plans.length;
  const criticalPositions = plans.filter((p) => p.isCriticalPosition).length;
  const activePlans = plans.filter((p) => p.status === 'Active' || p.status === 'UnderReview').length;
  const readyCandidates = plans.filter((p) => p.hasReadyCandidate).length;

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
      title: 'Toplam Plan',
      value: totalPlans,
      subtitle: 'Yedekleme Planları',
      icon: StarIcon,
      color: '#7c3aed',
    },
    {
      title: 'Kritik Pozisyon',
      value: criticalPositions,
      subtitle: 'Yüksek Öncelikli',
      icon: ExclamationTriangleIcon,
      color: '#ef4444',
    },
    {
      title: 'Aktif Plan',
      value: activePlans,
      subtitle: 'Devam Eden',
      icon: ClockIcon,
      color: '#3b82f6',
    },
    {
      title: 'Hazır Aday',
      value: readyCandidates,
      subtitle: `${totalPlans > 0 ? ((readyCandidates / totalPlans) * 100).toFixed(0) : 0}% Kapsama`,
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
