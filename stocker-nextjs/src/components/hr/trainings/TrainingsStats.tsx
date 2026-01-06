'use client';

import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import {
  BookOpenIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import type { TrainingDto } from '@/lib/api/services/hr.types';
import { TrainingStatus } from '@/lib/api/services/hr.types';

interface TrainingsStatsProps {
  trainings: TrainingDto[];
  loading?: boolean;
}

export function TrainingsStats({ trainings, loading = false }: TrainingsStatsProps) {
  const totalTrainings = trainings.length;
  const activeTrainings = trainings.filter(
    (t) => t.status === TrainingStatus.InProgress || t.status === TrainingStatus.Scheduled
  ).length;
  const completedTrainings = trainings.filter((t) => t.status === TrainingStatus.Completed).length;
  const totalParticipants = trainings.reduce((sum, t) => sum + (t.currentParticipants || 0), 0);

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
      title: 'Toplam Eğitim',
      value: totalTrainings,
      subtitle: 'Kayıtlı Eğitimler',
      icon: BookOpenIcon,
      color: '#7c3aed',
    },
    {
      title: 'Aktif Eğitim',
      value: activeTrainings,
      subtitle: 'Devam Eden / Planlanan',
      icon: ClockIcon,
      color: '#3b82f6',
    },
    {
      title: 'Tamamlanan',
      value: completedTrainings,
      subtitle: `${totalTrainings > 0 ? ((completedTrainings / totalTrainings) * 100).toFixed(0) : 0}% Tamamlama`,
      icon: CheckCircleIcon,
      color: '#10b981',
    },
    {
      title: 'Toplam Katılımcı',
      value: totalParticipants,
      subtitle: 'Tüm Eğitimler',
      icon: UserGroupIcon,
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
