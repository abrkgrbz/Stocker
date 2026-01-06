'use client';

import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import {
  ClockIcon,
  ExclamationCircleIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import type { OvertimeDto } from '@/lib/api/services/hr.types';

interface OvertimesStatsProps {
  overtimes: OvertimeDto[];
  loading?: boolean;
}

const formatCurrency = (value?: number) => {
  if (!value) return '₺0';
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
};

export function OvertimesStats({ overtimes, loading = false }: OvertimesStatsProps) {
  const totalOvertimes = overtimes.length;
  const pendingOvertimes = overtimes.filter((ot) => ot.status === 'Pending').length;
  const totalHours = overtimes.reduce((sum, ot) => sum + (ot.actualHours || ot.plannedHours || 0), 0);
  const totalAmount = overtimes
    .filter((ot) => ot.status === 'Approved' || ot.status === 'Completed')
    .reduce((sum, ot) => sum + (ot.calculatedAmount || 0), 0);

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
      title: 'Toplam Talep',
      value: totalOvertimes,
      subtitle: 'Kayıtlı Mesai Talepleri',
      icon: ClockIcon,
      color: '#7c3aed',
    },
    {
      title: 'Bekleyen',
      value: pendingOvertimes,
      subtitle: 'Onay Bekleyen',
      icon: ExclamationCircleIcon,
      color: '#f59e0b',
    },
    {
      title: 'Toplam Saat',
      value: `${totalHours.toFixed(1)}`,
      subtitle: 'Toplam Çalışma Saati',
      icon: CheckCircleIcon,
      color: '#3b82f6',
      isText: true,
    },
    {
      title: 'Toplam Tutar',
      value: formatCurrency(totalAmount),
      subtitle: 'Onaylanan Tutar',
      icon: CurrencyDollarIcon,
      color: '#10b981',
      isText: true,
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
                  value={stat.isText ? undefined : stat.value}
                  formatter={stat.isText ? () => stat.value : undefined}
                  valueStyle={{ color: '#1f2937', fontWeight: 'bold', fontSize: stat.isText ? '1.25rem' : '1.75rem' }}
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
