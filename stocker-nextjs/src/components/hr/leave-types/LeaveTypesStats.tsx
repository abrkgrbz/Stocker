'use client';

import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import {
  DocumentTextIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import type { LeaveTypeDto } from '@/lib/api/services/hr.types';

interface LeaveTypesStatsProps {
  leaveTypes: LeaveTypeDto[];
  loading?: boolean;
}

export function LeaveTypesStats({ leaveTypes, loading = false }: LeaveTypesStatsProps) {
  const totalTypes = leaveTypes.length;
  const activeTypes = leaveTypes.filter((lt) => lt.isActive).length;
  const paidTypes = leaveTypes.filter((lt) => lt.isPaid).length;

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
      title: 'Toplam Tür',
      value: totalTypes,
      subtitle: 'Kayıtlı İzin Türleri',
      icon: DocumentTextIcon,
      color: '#7c3aed',
    },
    {
      title: 'Aktif Tür',
      value: activeTypes,
      subtitle: `${totalTypes > 0 ? ((activeTypes / totalTypes) * 100).toFixed(1) : 0}% Aktif Oran`,
      icon: CheckCircleIcon,
      color: '#10b981',
    },
    {
      title: 'Ücretli İzin',
      value: paidTypes,
      subtitle: 'Ücretli İzin Türleri',
      icon: CurrencyDollarIcon,
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
