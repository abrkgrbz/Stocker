'use client';

import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import {
  BellIcon,
  CheckCircleIcon,
  MapPinIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import type { AnnouncementDto } from '@/lib/api/services/hr.types';

interface AnnouncementsStatsProps {
  announcements: AnnouncementDto[];
  loading?: boolean;
}

export function AnnouncementsStats({ announcements, loading = false }: AnnouncementsStatsProps) {
  const totalAnnouncements = announcements.length;
  const publishedAnnouncements = announcements.filter((a) => a.isPublished).length;
  const pinnedAnnouncements = announcements.filter((a) => a.isPinned).length;
  const requireAck = announcements.filter((a) => a.requiresAcknowledgment).length;

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
      title: 'Toplam Duyuru',
      value: totalAnnouncements,
      subtitle: 'Kayıtlı Duyurular',
      icon: BellIcon,
      color: '#7c3aed',
    },
    {
      title: 'Yayında',
      value: publishedAnnouncements,
      subtitle: `${totalAnnouncements > 0 ? ((publishedAnnouncements / totalAnnouncements) * 100).toFixed(0) : 0}% Yayında`,
      icon: CheckCircleIcon,
      color: '#10b981',
    },
    {
      title: 'Sabitlenmiş',
      value: pinnedAnnouncements,
      subtitle: 'Öne Çıkan',
      icon: MapPinIcon,
      color: '#f59e0b',
    },
    {
      title: 'Onay Gerekli',
      value: requireAck,
      subtitle: 'Okundu Onayı',
      icon: EyeIcon,
      color: '#3b82f6',
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
