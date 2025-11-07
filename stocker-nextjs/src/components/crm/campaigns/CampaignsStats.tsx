'use client';

import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import type { Campaign } from '@/lib/api/services/crm.service';

interface CampaignsStatsProps {
  campaigns: Campaign[];
  loading?: boolean;
}

export function CampaignsStats({ campaigns, loading = false }: CampaignsStatsProps) {
  const total = campaigns.length;
  const active = campaigns.filter((c) => c.status === 'InProgress').length;
  const totalBudget = campaigns.reduce((sum, c) => sum + (c.budgetedCost || 0), 0);
  const totalLeads = campaigns.reduce((sum, c) => sum + (c.actualLeads || 0), 0);

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
            title={<span className="text-gray-500 text-sm">Toplam Kampanya</span>}
            value={total}
            valueStyle={{ color: '#1f2937', fontWeight: 'bold', fontSize: '2rem' }}
          />
          <div className="text-xs text-gray-400 mt-2">Kayıtlı Kampanyalar</div>
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <Card className="h-full border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <Statistic
            title={<span className="text-gray-500 text-sm">Aktif Kampanya</span>}
            value={active}
            valueStyle={{ color: '#1f2937', fontWeight: 'bold', fontSize: '2rem' }}
          />
          <div className="text-xs font-medium mt-2" style={{ color: Number(activeRate) > 50 ? '#10b981' : '#f59e0b' }}>
            {activeRate}% Devam Ediyor
          </div>
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <Card className="h-full border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <Statistic
            title={<span className="text-gray-500 text-sm">Toplam Bütçe</span>}
            value={totalBudget}
            precision={2}
            prefix="₺"
            valueStyle={{ color: '#1f2937', fontWeight: 'bold', fontSize: '2rem' }}
          />
          <div className="text-xs text-gray-400 mt-2">Tüm Kampanyaların Bütçesi</div>
        </Card>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <Card className="h-full border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <Statistic
            title={<span className="text-gray-500 text-sm">Toplam Lead</span>}
            value={totalLeads}
            valueStyle={{ color: '#1f2937', fontWeight: 'bold', fontSize: '2rem' }}
          />
          <div className="text-xs text-gray-400 mt-2">Oluşturulan Potansiyel Müşteriler</div>
        </Card>
      </Col>
    </Row>
  );
}
