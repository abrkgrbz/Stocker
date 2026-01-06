'use client';

import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import {
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import type { AttendanceDto } from '@/lib/api/services/hr.types';
import { AttendanceStatus } from '@/lib/api/services/hr.types';

interface AttendanceStatsProps {
  attendances: AttendanceDto[];
  loading?: boolean;
}

export function AttendanceStats({ attendances, loading = false }: AttendanceStatsProps) {
  const totalRecords = attendances.length;
  const presentCount = attendances.filter((a) => a.status === AttendanceStatus.Present).length;
  const lateCount = attendances.filter((a) => a.status === AttendanceStatus.Late).length;
  const absentCount = attendances.filter((a) => a.status === AttendanceStatus.Absent).length;

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
      title: 'Toplam Kayıt',
      value: totalRecords,
      subtitle: 'Yoklama Kayıtları',
      icon: ClockIcon,
      color: '#7c3aed',
    },
    {
      title: 'Mevcut',
      value: presentCount,
      subtitle: `${totalRecords > 0 ? ((presentCount / totalRecords) * 100).toFixed(1) : 0}% Devam Oranı`,
      icon: CheckCircleIcon,
      color: '#10b981',
    },
    {
      title: 'Geç Kalan',
      value: lateCount,
      subtitle: 'Geç Gelen Kayıtlar',
      icon: ExclamationTriangleIcon,
      color: '#f59e0b',
    },
    {
      title: 'Yok',
      value: absentCount,
      subtitle: 'Devamsız Kayıtlar',
      icon: XCircleIcon,
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
