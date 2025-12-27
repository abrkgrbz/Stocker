'use client';

import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import { formatCurrency } from '@/lib/crm/formatters';
import type { Customer } from '@/lib/api/services/crm.service';

interface CustomersStatsProps {
  customers: Customer[];
  totalCount: number;
  loading?: boolean;
}

export function CustomersStats({ customers, totalCount, loading = false }: CustomersStatsProps) {
  const activeCustomers = customers.filter((c) => c.isActive).length;
  const totalRevenue = customers.reduce((sum, c) => sum + (c.totalPurchases || 0), 0);
  const activationRate = totalCount > 0 ? (activeCustomers / totalCount) * 100 : 0;

  if (loading) {
    return (
      <Row gutter={[16, 16]}>
        {[0, 1, 2].map((i) => (
          <Col xs={24} sm={8} key={i}>
            <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />
          </Col>
        ))}
      </Row>
    );
  }

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={8}>
        <Card className="h-full border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <Statistic
            title={<span className="text-gray-500 text-sm">Toplam Müşteri</span>}
            value={totalCount}
            valueStyle={{ color: '#1f2937', fontWeight: 'bold', fontSize: '2rem' }}
          />
          <div className="text-xs text-gray-400 mt-2">Kayıtlı Müşteriler</div>
        </Card>
      </Col>

      <Col xs={24} sm={8}>
        <Card className="h-full border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <Statistic
            title={<span className="text-gray-500 text-sm">Aktif Müşteri</span>}
            value={activeCustomers}
            valueStyle={{ color: '#1f2937', fontWeight: 'bold', fontSize: '2rem' }}
          />
          <div className="text-xs font-medium mt-2" style={{ color: '#10b981' }}>
            {activationRate.toFixed(1)}% Aktivasyon Oranı
          </div>
        </Card>
      </Col>

      <Col xs={24} sm={8}>
        <Card className="h-full border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <Statistic
            title={<span className="text-gray-500 text-sm">Toplam Ciro</span>}
            value={totalRevenue}
            prefix="₺"
            valueStyle={{ color: '#1f2937', fontWeight: 'bold', fontSize: '2rem' }}
            formatter={(value) => `${Number(value).toLocaleString('tr-TR')}`}
          />
          <div className="text-xs text-gray-400 mt-2">Toplam Satış Tutarı</div>
        </Card>
      </Col>
    </Row>
  );
}
