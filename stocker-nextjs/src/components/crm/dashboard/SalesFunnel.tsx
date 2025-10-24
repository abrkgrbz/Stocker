'use client';

import React from 'react';
import { Typography, Space, Progress } from 'antd';
import { AnimatedCard } from '../shared/AnimatedCard';

const { Text } = Typography;

interface SalesFunnelProps {
  totalLeads: number;
  qualifiedLeads: number;
  openDeals: number;
  wonDeals: number;
  loading?: boolean;
}

export function SalesFunnel({
  totalLeads,
  qualifiedLeads,
  openDeals,
  wonDeals,
  loading = false,
}: SalesFunnelProps) {
  const qualifiedPercent = totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0;
  const dealsPercent = totalLeads > 0 ? (openDeals / totalLeads) * 100 : 0;
  const wonPercent = totalLeads > 0 ? (wonDeals / totalLeads) * 100 : 0;

  return (
    <AnimatedCard title="Satış Hunisi" loading={loading}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div>
          <div className="flex justify-between mb-2">
            <Text>Potansiyel Müşteriler</Text>
            <Text strong>{totalLeads}</Text>
          </div>
          <Progress percent={100} strokeColor="#1890ff" showInfo={false} />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <Text>Nitelikli Leads</Text>
            <Text strong>{qualifiedLeads}</Text>
          </div>
          <Progress
            percent={qualifiedPercent}
            strokeColor="#52c41a"
            showInfo={false}
          />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <Text>Açık Fırsatlar</Text>
            <Text strong>{openDeals}</Text>
          </div>
          <Progress
            percent={dealsPercent}
            strokeColor="#fa8c16"
            showInfo={false}
          />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <Text>Kazanılan Anlaşmalar</Text>
            <Text strong>{wonDeals}</Text>
          </div>
          <Progress
            percent={wonPercent}
            strokeColor="#722ed1"
            showInfo={false}
          />
        </div>
      </Space>
    </AnimatedCard>
  );
}
