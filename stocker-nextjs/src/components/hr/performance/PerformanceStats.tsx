'use client';

import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import {
  TrophyIcon,
  StarIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import type { PerformanceReviewDto } from '@/lib/api/services/hr.types';

interface PerformanceStatsProps {
  reviews: PerformanceReviewDto[];
  loading?: boolean;
}

export function PerformanceStats({ reviews, loading = false }: PerformanceStatsProps) {
  const totalReviews = reviews.length;
  const avgScore = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + (r.overallScore || 0), 0) / reviews.length)
    : 0;
  const pendingReviews = reviews.filter((r) => r.status === 'Draft' || r.status === 'InProgress').length;
  const completedReviews = reviews.filter((r) => r.status === 'Completed').length;

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
      title: 'Toplam Değerlendirme',
      value: totalReviews,
      subtitle: 'Kayıtlı Değerlendirmeler',
      icon: TrophyIcon,
      color: '#7c3aed',
    },
    {
      title: 'Ortalama Puan',
      value: `${avgScore.toFixed(1)}/10`,
      subtitle: 'Genel Ortalama',
      icon: StarIcon,
      color: '#f59e0b',
      isText: true,
    },
    {
      title: 'Devam Eden',
      value: pendingReviews,
      subtitle: 'Aktif Değerlendirmeler',
      icon: ClockIcon,
      color: '#3b82f6',
    },
    {
      title: 'Tamamlanan',
      value: completedReviews,
      subtitle: 'Bitmiş Değerlendirmeler',
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
