'use client';

import React from 'react';
import { Row, Col, Statistic } from 'antd';
import { TeamOutlined, UserOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { AnimatedCard } from '../shared/AnimatedCard';
import { formatCurrency, formatPercent } from '@/lib/crm';

interface MetricsOverviewProps {
  totalCustomers: number;
  activeCustomers: number;
  totalRevenue: number;
  avgCustomerValue: number;
  loading?: boolean;
}

export function MetricsOverview({
  totalCustomers,
  activeCustomers,
  totalRevenue,
  avgCustomerValue,
  loading = false,
}: MetricsOverviewProps) {
  const activationRate = totalCustomers > 0 ? (activeCustomers / totalCustomers) * 100 : 0;

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={6}>
        <AnimatedCard loading={loading} delay={0}>
          <Statistic
            title="Toplam Müşteri"
            value={totalCustomers}
            prefix={<TeamOutlined />}
            valueStyle={{ color: '#1890ff' }}
            suffix={
              <span className="text-sm text-green-500 ml-2">
                <ArrowUpOutlined /> 12%
              </span>
            }
          />
          <div className="mt-2 text-xs text-gray-500">Son aya göre artış</div>
        </AnimatedCard>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <AnimatedCard loading={loading} delay={0.1}>
          <Statistic
            title="Aktif Müşteri"
            value={activeCustomers}
            prefix={<UserOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
          <div className="mt-2 text-xs text-gray-500">
            {formatPercent(activationRate)} aktivasyon oranı
          </div>
        </AnimatedCard>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <AnimatedCard loading={loading} delay={0.2}>
          <Statistic
            title="Toplam Ciro"
            value={totalRevenue}
            prefix="₺"
            precision={2}
            valueStyle={{ color: '#722ed1' }}
            suffix={
              <span className="text-sm text-green-500 ml-2">
                <ArrowUpOutlined /> 8%
              </span>
            }
          />
          <div className="mt-2 text-xs text-gray-500">Bu ayki toplam</div>
        </AnimatedCard>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <AnimatedCard loading={loading} delay={0.3}>
          <Statistic
            title="Ort. Müşteri Değeri"
            value={avgCustomerValue}
            prefix="₺"
            precision={2}
            valueStyle={{ color: '#fa8c16' }}
          />
          <div className="mt-2 text-xs text-gray-500">Müşteri başına ortalama</div>
        </AnimatedCard>
      </Col>
    </Row>
  );
}
