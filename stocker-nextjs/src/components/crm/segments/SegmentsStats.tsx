'use client';

import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import type { CustomerSegment } from '@/lib/api/services/crm.service';

interface SegmentsStatsProps {
  segments: CustomerSegment[];
  loading?: boolean;
}

export function SegmentsStats({ segments, loading = false }: SegmentsStatsProps) {
  const total = segments.length;
  const active = segments.filter((s) => s.isActive).length;
  const dynamic = segments.filter((s) => s.type === 'Dynamic').length;
  const totalCustomers = segments.reduce((sum, s) => sum + (s.memberCount || 0), 0);

  const activeRate = total > 0 ? ((active / total) * 100).toFixed(0) : '0';
  const dynamicRate = total > 0 ? ((dynamic / total) * 100).toFixed(0) : '0';

  if (loading) {
    return (
      <Row gutter={[16, 16]}>
        {[0, 1, 2, 3].map((i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />
          </Col>
        ))}
      </Row>
    );
  }

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={6}>
        <Card className="h-full border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <Statistic
            title={<span className="text-gray-500 text-sm">Toplam Segment</span>}
            value={total}
            valueStyle={{ color: '#1f2937', fontWeight: 'bold', fontSize: '2rem' }}
          />
          <div className="text-xs text-gray-400 mt-2">Kayıtlı Segmentler</div>
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <Card className="h-full border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <Statistic
            title={<span className="text-gray-500 text-sm">Aktif Segment</span>}
            value={active}
            valueStyle={{ color: '#1f2937', fontWeight: 'bold', fontSize: '2rem' }}
          />
          <div className="text-xs font-medium mt-2" style={{ color: Number(activeRate) > 50 ? '#10b981' : '#f59e0b' }}>
            {activeRate}% Aktif Oran
          </div>
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <Card className="h-full border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <Statistic
            title={<span className="text-gray-500 text-sm">Dinamik Segment</span>}
            value={dynamic}
            valueStyle={{ color: '#1f2937', fontWeight: 'bold', fontSize: '2rem' }}
          />
          <div className="text-xs text-gray-400 mt-2">Otomatik Güncellenen</div>
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <Card className="h-full border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <Statistic
            title={<span className="text-gray-500 text-sm">Toplam Müşteri</span>}
            value={totalCustomers}
            valueStyle={{ color: '#1f2937', fontWeight: 'bold', fontSize: '2rem' }}
          />
          <div className="text-xs text-gray-400 mt-2">Segmentlerdeki Müşteriler</div>
        </Card>
      </Col>
    </Row>
  );
}
