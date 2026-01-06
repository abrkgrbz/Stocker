'use client';

import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import {
  ShieldCheckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import type { CertificationDto } from '@/lib/api/services/hr.types';

interface CertificationsStatsProps {
  certifications: CertificationDto[];
  loading?: boolean;
}

export function CertificationsStats({ certifications, loading = false }: CertificationsStatsProps) {
  const totalCertifications = certifications.length;
  const validCertifications = certifications.filter((c) => !c.isExpired && !c.isExpiringSoon).length;
  const expiringCertifications = certifications.filter((c) => c.isExpiringSoon && !c.isExpired).length;
  const expiredCertifications = certifications.filter((c) => c.isExpired).length;

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
      title: 'Toplam Sertifika',
      value: totalCertifications,
      subtitle: 'Kayıtlı Sertifikalar',
      icon: ShieldCheckIcon,
      color: '#7c3aed',
    },
    {
      title: 'Geçerli',
      value: validCertifications,
      subtitle: `${totalCertifications > 0 ? ((validCertifications / totalCertifications) * 100).toFixed(0) : 0}% Aktif`,
      icon: CheckCircleIcon,
      color: '#10b981',
    },
    {
      title: 'Yakında Dolacak',
      value: expiringCertifications,
      subtitle: 'Yenilenmeli',
      icon: ExclamationTriangleIcon,
      color: '#f59e0b',
    },
    {
      title: 'Süresi Dolmuş',
      value: expiredCertifications,
      subtitle: 'Geçersiz',
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
