'use client';

import React from 'react';
import { Row, Col, Statistic } from 'antd';
import { TeamOutlined, UserOutlined, RiseOutlined } from '@ant-design/icons';
import { AnimatedCard } from '../shared/AnimatedCard';
import { formatCurrency } from '@/lib/crm/formatters';
import type { Customer } from '@/lib/api/services/crm.service';

interface CustomersStatsProps {
  customers: Customer[];
  totalCount: number;
  loading?: boolean;
}

export function CustomersStats({ customers, totalCount, loading = false }: CustomersStatsProps) {
  const activeCustomers = customers.filter((c) => c.status === 'Active').length;
  const totalRevenue = customers.reduce((sum, c) => sum + (c.totalPurchases || 0), 0);

  return (
    <Row gutter={16}>
      <Col xs={24} sm={8}>
        <AnimatedCard loading={loading} delay={0}>
          <Statistic
            title="Toplam Müşteri"
            value={totalCount}
            prefix={<TeamOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </AnimatedCard>
      </Col>
      <Col xs={24} sm={8}>
        <AnimatedCard loading={loading} delay={0.1}>
          <Statistic
            title="Aktif Müşteri"
            value={activeCustomers}
            prefix={<UserOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
        </AnimatedCard>
      </Col>
      <Col xs={24} sm={8}>
        <AnimatedCard loading={loading} delay={0.2}>
          <Statistic
            title="Toplam Ciro"
            value={formatCurrency(totalRevenue)}
            suffix={<RiseOutlined />}
            valueStyle={{ color: '#722ed1' }}
          />
        </AnimatedCard>
      </Col>
    </Row>
  );
}
