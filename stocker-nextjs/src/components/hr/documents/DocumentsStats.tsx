'use client';

import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import {
  DocumentIcon,
  ShieldCheckIcon,
  ClockIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import type { EmployeeDocumentDto } from '@/lib/api/services/hr.types';

interface DocumentsStatsProps {
  documents: EmployeeDocumentDto[];
  loading?: boolean;
}

export function DocumentsStats({ documents, loading = false }: DocumentsStatsProps) {
  const totalDocuments = documents.length;
  const verifiedDocuments = documents.filter((d) => d.isVerified).length;
  const expiringSoonDocuments = documents.filter((d) => d.isExpiringSoon && !d.isExpired).length;
  const expiredDocuments = documents.filter((d) => d.isExpired).length;

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
      title: 'Toplam Belge',
      value: totalDocuments,
      subtitle: 'Kayıtlı Belgeler',
      icon: DocumentIcon,
      color: '#3b82f6',
    },
    {
      title: 'Doğrulanmış',
      value: verifiedDocuments,
      subtitle: `${totalDocuments > 0 ? ((verifiedDocuments / totalDocuments) * 100).toFixed(0) : 0}% Onaylı`,
      icon: ShieldCheckIcon,
      color: '#10b981',
    },
    {
      title: 'Süresi Dolacak',
      value: expiringSoonDocuments,
      subtitle: 'Yakın Tarih',
      icon: ClockIcon,
      color: '#f59e0b',
    },
    {
      title: 'Süresi Dolmuş',
      value: expiredDocuments,
      subtitle: 'Yenilenmeli',
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
