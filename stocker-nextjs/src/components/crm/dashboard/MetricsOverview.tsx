'use client';

import React from 'react';
import { Row, Col } from 'antd';
import { TeamOutlined, UserOutlined, DollarOutlined, ArrowUpOutlined, TrophyOutlined } from '@ant-design/icons';
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
      icon: TeamOutlined,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      change: '+12%',
      changeColor: 'text-green-600',
      subtitle: 'Son aya göre artış',
    },
    {
      title: 'Aktif Müşteri',
      value: activeCustomers.toLocaleString('tr-TR'),
      icon: UserOutlined,
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100',
      change: formatPercent(activationRate),
      changeColor: 'text-gray-600',
      subtitle: 'Aktivasyon oranı',
    },
    {
      title: 'Toplam Gelir',
      value: formatCurrency(totalRevenue),
      icon: DollarOutlined,
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
      change: '+24%',
      changeColor: 'text-green-600',
      subtitle: 'Bu ayki toplam',
    },
    {
      title: 'Ortalama Değer',
      value: formatCurrency(avgCustomerValue),
      icon: TrophyOutlined,
      gradient: 'from-orange-500 to-orange-600',
      bgGradient: 'from-orange-50 to-orange-100',
      change: '+8%',
      changeColor: 'text-green-600',
      subtitle: 'Müşteri başına',
    },
  ];

  if (loading) {
    return (
      <Row gutter={[16, 16]}>
        {[0, 1, 2, 3].map((i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
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
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${metric.bgGradient} p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100`}>
                {/* Background icon */}
                <div className="absolute top-4 right-4 opacity-10">
                  <Icon className="text-6xl" />
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${metric.gradient} mb-4 shadow-md`}>
                    <Icon className="text-2xl text-white" />
                  </div>

                  <div className="text-sm font-medium text-gray-600 mb-1">
                    {metric.title}
                  </div>

                  <div className="flex items-baseline gap-2">
                    <div className="text-3xl font-bold text-gray-900">
                      {metric.value}
                    </div>
                    <span className={`text-sm font-semibold ${metric.changeColor} flex items-center gap-1`}>
                      {metric.change.startsWith('+') && <ArrowUpOutlined className="text-xs" />}
                      {metric.change}
                    </span>
                  </div>

                  <div className="mt-2 text-xs text-gray-500">
                    {metric.subtitle}
                  </div>
                </div>

                {/* Hover gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${metric.gradient} opacity-0 hover:opacity-5 transition-opacity duration-300`} />
              </div>
            </motion.div>
          </Col>
        );
      })}
    </Row>
  );
}
