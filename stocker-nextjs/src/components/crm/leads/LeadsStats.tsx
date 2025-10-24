'use client';

import React from 'react';
import { Row, Col, Statistic } from 'antd';
import { UserAddOutlined, StarOutlined } from '@ant-design/icons';
import { AnimatedCard } from '../shared/AnimatedCard';
import type { Lead } from '@/lib/api/services/crm.service';

interface LeadsStatsProps {
  leads: Lead[];
  loading?: boolean;
}

export function LeadsStats({ leads, loading = false }: LeadsStatsProps) {
  const newLeads = leads.filter((l) => l.status === 'New').length;
  const qualifiedLeads = leads.filter((l) => l.status === 'Qualified').length;
  const avgScore =
    leads.length > 0 ? Math.round(leads.reduce((sum, l) => sum + l.score, 0) / leads.length) : 0;

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={6}>
        <AnimatedCard loading={loading} delay={0}>
          <Statistic title="Toplam" value={leads.length} prefix={<UserAddOutlined />} />
        </AnimatedCard>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <AnimatedCard loading={loading} delay={0.1}>
          <Statistic title="Yeni" value={newLeads} valueStyle={{ color: '#1890ff' }} />
        </AnimatedCard>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <AnimatedCard loading={loading} delay={0.2}>
          <Statistic title="Nitelikli" value={qualifiedLeads} valueStyle={{ color: '#52c41a' }} />
        </AnimatedCard>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <AnimatedCard loading={loading} delay={0.3}>
          <Statistic
            title="Ort. Puan"
            value={avgScore}
            prefix={<StarOutlined />}
            suffix="/ 100"
          />
        </AnimatedCard>
      </Col>
    </Row>
  );
}
