'use client';

import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import {
  DocumentTextIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import type { JobApplicationDto } from '@/lib/api/services/hr.types';

interface JobApplicationsStatsProps {
  applications: JobApplicationDto[];
  loading?: boolean;
}

export function JobApplicationsStats({ applications, loading = false }: JobApplicationsStatsProps) {
  const totalApplications = applications.length;
  const newApplications = applications.filter((a) => a.status === 'New' || a.status === 'Screening').length;
  const inProgressApplications = applications.filter((a) =>
    a.status === 'Interview' || a.status === 'Assessment' || a.status === 'Reference' || a.status === 'Offer'
  ).length;
  const hiredApplications = applications.filter((a) => a.status === 'Hired').length;

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
      title: 'Toplam Başvuru',
      value: totalApplications,
      subtitle: 'Gelen Başvurular',
      icon: DocumentTextIcon,
      color: '#7c3aed',
    },
    {
      title: 'Yeni Başvurular',
      value: newApplications,
      subtitle: 'İnceleme Bekliyor',
      icon: UserGroupIcon,
      color: '#3b82f6',
    },
    {
      title: 'Süreçte',
      value: inProgressApplications,
      subtitle: 'Mülakat/Değerlendirme',
      icon: ClockIcon,
      color: '#f59e0b',
    },
    {
      title: 'İşe Alınan',
      value: hiredApplications,
      subtitle: `${totalApplications > 0 ? ((hiredApplications / totalApplications) * 100).toFixed(0) : 0}% Başarılı`,
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
