'use client';

import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import {
  ShieldCheckIcon,
  CheckCircleIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import type { PositionDto } from '@/lib/api/services/hr.types';

interface PositionsStatsProps {
  positions: PositionDto[];
  loading?: boolean;
}

export function PositionsStats({ positions, loading = false }: PositionsStatsProps) {
  const totalPositions = positions.length;
  const activePositions = positions.filter((p) => p.isActive).length;
  const totalEmployees = positions.reduce((sum, p) => sum + (p.filledPositions || 0), 0);

  if (loading) {
    return (
      <Row gutter={[16, 16]}>
        {[0, 1, 2].map((i) => (
          <Col xs={24} sm={8} key={i}>
            <div className="h-24 bg-gray-100 rounded-lg animate-pulse" />
          </Col>
        ))}
      </Row>
    );
  }

  const stats = [
    {
      title: 'Toplam Pozisyon',
      value: totalPositions,
      subtitle: 'Kayıtlı Pozisyonlar',
      icon: ShieldCheckIcon,
      color: '#8b5cf6',
    },
    {
      title: 'Aktif Pozisyon',
      value: activePositions,
      subtitle: `${totalPositions > 0 ? ((activePositions / totalPositions) * 100).toFixed(1) : 0}% Aktif Oran`,
      icon: CheckCircleIcon,
      color: '#10b981',
    },
    {
      title: 'Toplam Çalışan',
      value: totalEmployees,
      subtitle: 'Pozisyonlarda Görevli',
      icon: UsersIcon,
      color: '#3b82f6',
    },
  ];

  return (
    <Row gutter={[16, 16]}>
      {stats.map((stat, index) => (
        <Col xs={24} sm={8} key={index}>
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
