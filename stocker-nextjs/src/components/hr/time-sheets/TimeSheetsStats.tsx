'use client';

import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import {
  ClockIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import type { TimeSheetDto } from '@/lib/api/services/hr.types';

interface TimeSheetsStatsProps {
  timeSheets: TimeSheetDto[];
  loading?: boolean;
}

export function TimeSheetsStats({ timeSheets, loading = false }: TimeSheetsStatsProps) {
  const totalTimeSheets = timeSheets.length;
  const pendingTimeSheets = timeSheets.filter((t) => t.status === 'Submitted').length;
  const approvedTimeSheets = timeSheets.filter((t) => t.status === 'Approved').length;
  const totalHours = timeSheets.reduce((sum, t) => sum + (t.totalWorkHours || 0), 0);

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
      title: 'Toplam Puantaj',
      value: totalTimeSheets,
      subtitle: 'Kayıtlı Puantajlar',
      icon: DocumentTextIcon,
      color: '#7c3aed',
    },
    {
      title: 'Bekleyen',
      value: pendingTimeSheets,
      subtitle: 'Onay Bekleyen',
      icon: ExclamationCircleIcon,
      color: '#f59e0b',
    },
    {
      title: 'Onaylanan',
      value: approvedTimeSheets,
      subtitle: 'Onaylanmış Puantajlar',
      icon: CheckCircleIcon,
      color: '#10b981',
    },
    {
      title: 'Toplam Saat',
      value: `${totalHours.toFixed(0)}`,
      subtitle: 'Toplam Çalışma Saati',
      icon: ClockIcon,
      color: '#3b82f6',
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
