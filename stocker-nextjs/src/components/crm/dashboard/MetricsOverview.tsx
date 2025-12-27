'use client';

import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import { UserGroupIcon, UserIcon, CurrencyDollarIcon, TrophyIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
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

  const metrics = [
    {
      title: 'Toplam Müşteri',
      value: totalCustomers.toLocaleString('tr-TR'),
      icon: UserGroupIcon,
      subtitle: activationRate > 0 ? `${formatPercent(activationRate)} aktivasyon` : 'Son aya göre artış',
    },
    {
      title: 'Aktif Müşteri',
      value: activeCustomers.toLocaleString('tr-TR'),
      icon: UserIcon,
      subtitle: 'Aktif müşteri sayısı',
    },
    {
      title: 'Toplam Gelir',
      value: formatCurrency(totalRevenue),
      icon: CurrencyDollarIcon,
      subtitle: 'Bu ayki toplam',
    },
    {
      title: 'Ortalama Değer',
      value: formatCurrency(avgCustomerValue),
      icon: TrophyIcon,
      subtitle: 'Müşteri başına',
    },
  ];

  if (loading) {
    return (
      <Row gutter={[16, 16]}>
        {[0, 1, 2, 3].map((i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <Card loading className="h-32" />
          </Col>
        ))}
      </Row>
    );
  }

  return (
    <Row gutter={[16, 16]}>
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Col xs={24} sm={12} lg={6} key={metric.title}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card
                className="hover:shadow-lg transition-shadow duration-300 h-full border-slate-200"
                bordered
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-3 rounded-lg bg-slate-100">
                    <Icon className="w-5 h-5 text-slate-600" />
                  </div>
                </div>

                <Statistic
                  title={<span className="text-slate-500 font-normal text-sm">{metric.title}</span>}
                  value={metric.value}
                  valueStyle={{ fontSize: 24, fontWeight: 600, color: '#0f172a' }}
                />

                <div className="mt-2 text-xs text-slate-400">
                  {metric.subtitle}
                </div>
              </Card>
            </motion.div>
          </Col>
        );
      })}
    </Row>
  );
}
