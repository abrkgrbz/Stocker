'use client';

import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import {
  GiftIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import type { EmployeeBenefitDto } from '@/lib/api/services/hr.types';

interface EmployeeBenefitsStatsProps {
  benefits: EmployeeBenefitDto[];
  loading?: boolean;
}

export function EmployeeBenefitsStats({ benefits, loading = false }: EmployeeBenefitsStatsProps) {
  const totalBenefits = benefits.length;
  const activeBenefits = benefits.filter((b) => b.status === 'Active').length;
  const pendingBenefits = benefits.filter((b) => b.status === 'Pending').length;
  const expiredBenefits = benefits.filter((b) => b.status === 'Expired' || b.status === 'Cancelled').length;

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
      title: 'Toplam Yan Hak',
      value: totalBenefits,
      subtitle: 'Kayıtlı Yan Haklar',
      icon: GiftIcon,
      color: '#7c3aed',
    },
    {
      title: 'Aktif',
      value: activeBenefits,
      subtitle: `${totalBenefits > 0 ? ((activeBenefits / totalBenefits) * 100).toFixed(0) : 0}% Aktif`,
      icon: CheckCircleIcon,
      color: '#10b981',
    },
    {
      title: 'Bekleyen',
      value: pendingBenefits,
      subtitle: 'Onay Bekliyor',
      icon: ClockIcon,
      color: '#3b82f6',
    },
    {
      title: 'Sona Eren',
      value: expiredBenefits,
      subtitle: 'İptal/Süresi Dolmuş',
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
