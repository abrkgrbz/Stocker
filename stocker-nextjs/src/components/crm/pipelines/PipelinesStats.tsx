'use client';

import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import type { Pipeline } from '@/lib/api/services/crm.service';

interface PipelinesStatsProps {
  pipelines: Pipeline[];
  loading?: boolean;
}

export function PipelinesStats({ pipelines, loading = false }: PipelinesStatsProps) {
  const total = pipelines.length;
  const active = pipelines.filter((p) => p.isActive).length;
  const totalDeals = pipelines.reduce((sum, p) => sum + (p.dealCount || 0), 0);
  const totalValue = pipelines.reduce((sum, p) => sum + (p.totalValue || 0), 0);

  const activeRate = total > 0 ? ((active / total) * 100).toFixed(0) : '0';

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
            title={<span className="text-gray-500 text-sm">Toplam Pipeline</span>}
            value={total}
            valueStyle={{ color: '#1f2937', fontWeight: 'bold', fontSize: '2rem' }}
          />
          <div className="text-xs text-gray-400 mt-2">Kayıtlı Satış Süreçleri</div>
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <Card className="h-full border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <Statistic
            title={<span className="text-gray-500 text-sm">Aktif Pipeline</span>}
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
            title={<span className="text-gray-500 text-sm">Toplam Fırsat</span>}
            value={totalDeals}
            valueStyle={{ color: '#1f2937', fontWeight: 'bold', fontSize: '2rem' }}
          />
          <div className="text-xs text-gray-400 mt-2">Tüm Süreçlerde</div>
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <Card className="h-full border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <Statistic
            title={<span className="text-gray-500 text-sm">Toplam Değer</span>}
            value={totalValue}
            precision={2}
            prefix="₺"
            valueStyle={{ color: '#1f2937', fontWeight: 'bold', fontSize: '2rem' }}
          />
          <div className="text-xs text-gray-400 mt-2">Tüm Fırsatların Değeri</div>
        </Card>
      </Col>
    </Row>
  );
}
