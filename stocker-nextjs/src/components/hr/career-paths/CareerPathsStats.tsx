'use client';

import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import {
  RocketLaunchIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import type { CareerPathDto } from '@/lib/api/services/hr.types';

interface CareerPathsStatsProps {
  careerPaths: CareerPathDto[];
  loading?: boolean;
}

export function CareerPathsStats({ careerPaths, loading = false }: CareerPathsStatsProps) {
  const totalPaths = careerPaths.length;
  const activePaths = careerPaths.filter((p) => p.status === 'Active' || p.status === 'OnTrack').length;
  const completedPaths = careerPaths.filter((p) => p.status === 'Completed').length;
  const readyForPromotion = careerPaths.filter((p) => p.readyForPromotion).length;

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
      value: totalPaths,
      subtitle: 'Kariyer Planları',
      icon: RocketLaunchIcon,
      color: '#7c3aed',
    },
    {
      title: 'Aktif Plan',
      value: activePaths,
      subtitle: 'Devam Eden',
      icon: ClockIcon,
      color: '#3b82f6',
    },
    {
      title: 'Tamamlanan',
      value: completedPaths,
      subtitle: `${totalPaths > 0 ? ((completedPaths / totalPaths) * 100).toFixed(0) : 0}% Başarı`,
      icon: CheckCircleIcon,
      color: '#10b981',
    },
    {
      title: 'Terfi Hazır',
      value: readyForPromotion,
      subtitle: 'Terfi Bekleyen',
      icon: ArrowTrendingUpIcon,
      color: '#f59e0b',
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
