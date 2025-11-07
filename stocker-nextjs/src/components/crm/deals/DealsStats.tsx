'use client';

import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import { formatCurrency } from '@/lib/crm';

interface DealsStatsProps {
  totalDeals: number;
  totalAmount: number;
  wonDeals: number;
  wonAmount: number;
  loading?: boolean;
}

export function DealsStats({
  totalDeals,
  totalAmount,
  wonDeals,
  wonAmount,
  loading = false,
}: DealsStatsProps) {
  const winRate = totalDeals > 0 ? ((wonDeals / totalDeals) * 100).toFixed(1) : '0';

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
            title={<span className="text-gray-500 text-sm">Açık Fırsatlar</span>}
            value={totalDeals}
            valueStyle={{ color: '#1f2937', fontWeight: 'bold', fontSize: '2rem' }}
          />
          <div className="text-xs text-gray-400 mt-2">Aktif Pipeline</div>
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <Card className="h-full border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <Statistic
            title={<span className="text-gray-500 text-sm">Toplam Değer</span>}
            value={totalAmount}
            prefix="₺"
            valueStyle={{ color: '#1f2937', fontWeight: 'bold', fontSize: '2rem' }}
            formatter={(value) => `${Number(value).toLocaleString('tr-TR')}`}
          />
          <div className="text-xs text-gray-400 mt-2">Potansiyel Gelir</div>
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <Card className="h-full border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <Statistic
            title={<span className="text-gray-500 text-sm">Kazanılan</span>}
            value={wonDeals}
            valueStyle={{ color: '#1f2937', fontWeight: 'bold', fontSize: '2rem' }}
          />
          <div className="text-xs text-gray-400 mt-2">Başarılı Anlaşma</div>
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <Card className="h-full border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <Statistic
            title={<span className="text-gray-500 text-sm">Kazanma Oranı</span>}
            value={winRate}
            suffix="%"
            valueStyle={{ color: '#10b981', fontWeight: 'bold', fontSize: '2rem' }}
          />
          <div className="text-xs font-medium mt-2" style={{ color: Number(winRate) > 50 ? '#10b981' : '#f59e0b' }}>
            {Number(winRate) > 50 ? 'Mükemmel Başarı' : 'Gelişebilir'}
          </div>
        </Card>
      </Col>
    </Row>
  );
}
