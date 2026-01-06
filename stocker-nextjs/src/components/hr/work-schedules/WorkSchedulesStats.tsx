'use client';

import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import {
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import type { WorkScheduleDto } from '@/lib/api/services/hr.types';

interface WorkSchedulesStatsProps {
  schedules: WorkScheduleDto[];
  loading?: boolean;
}

export function WorkSchedulesStats({ schedules, loading = false }: WorkSchedulesStatsProps) {
  const totalSchedules = schedules.length;
  const workDays = schedules.filter((s) => s.isWorkDay).length;
  const holidays = schedules.filter((s) => s.isHoliday).length;

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
      title: 'Toplam Kayıt',
      value: totalSchedules,
      subtitle: 'Program Kayıtları',
      icon: CalendarIcon,
      color: '#7c3aed',
    },
    {
      title: 'Çalışma Günü',
      value: workDays,
      subtitle: `${totalSchedules > 0 ? ((workDays / totalSchedules) * 100).toFixed(1) : 0}% Oran`,
      icon: CheckCircleIcon,
      color: '#10b981',
    },
    {
      title: 'Tatil Günü',
      value: holidays,
      subtitle: 'Resmi Tatil',
      icon: XCircleIcon,
      color: '#f59e0b',
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
