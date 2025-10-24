'use client';

import React from 'react';
import { Row, Col } from 'antd';
import { TeamOutlined, UserOutlined, RiseOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
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
  const activationRate = totalCount > 0 ? (activeCustomers / totalCount) * 100 : 0;

  const stats = [
    {
      title: 'Toplam Müşteri',
      value: totalCount.toLocaleString('tr-TR'),
      icon: TeamOutlined,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      change: '+15%',
      subtitle: 'Son aya göre',
    },
    {
      title: 'Aktif Müşteri',
      value: activeCustomers.toLocaleString('tr-TR'),
      icon: UserOutlined,
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100',
      change: `${activationRate.toFixed(1)}%`,
      subtitle: 'Aktivasyon oranı',
    },
    {
      title: 'Toplam Ciro',
      value: formatCurrency(totalRevenue),
      icon: RiseOutlined,
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
      change: '+28%',
      subtitle: 'Bu ay',
    },
  ];

  if (loading) {
    return (
      <Row gutter={16}>
        {[0, 1, 2].map((i) => (
          <Col xs={24} sm={8} key={i}>
            <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
          </Col>
        ))}
      </Row>
    );
  }

  return (
    <Row gutter={16}>
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Col xs={24} sm={8} key={stat.title}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${stat.bgGradient} p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100`}>
                <div className="absolute top-4 right-4 opacity-10">
                  <Icon className="text-6xl" />
                </div>

                <div className="relative z-10">
                  <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${stat.gradient} mb-4 shadow-md`}>
                    <Icon className="text-2xl text-white" />
                  </div>

                  <div className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </div>

                  <div className="flex items-baseline gap-2">
                    <div className="text-3xl font-bold text-gray-900">
                      {stat.value}
                    </div>
                    <span className="text-sm font-semibold text-green-600 flex items-center gap-1">
                      {stat.change.startsWith('+') && <ArrowUpOutlined className="text-xs" />}
                      {stat.change}
                    </span>
                  </div>

                  <div className="mt-2 text-xs text-gray-500">
                    {stat.subtitle}
                  </div>
                </div>

                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 hover:opacity-5 transition-opacity duration-300`} />
              </div>
            </motion.div>
          </Col>
        );
      })}
    </Row>
  );
}
