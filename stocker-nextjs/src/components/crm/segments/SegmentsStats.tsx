'use client';

import React from 'react';
import { Row, Col } from 'antd';
import { ApartmentOutlined, RocketOutlined, TeamOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import type { CustomerSegment } from '@/lib/api/services/crm.service';

interface SegmentsStatsProps {
  segments: CustomerSegment[];
  loading?: boolean;
}

export function SegmentsStats({ segments, loading = false }: SegmentsStatsProps) {
  const total = segments.length;
  const active = segments.filter((s) => s.isActive).length;
  const dynamic = segments.filter((s) => s.type === 'Dynamic').length;
  const totalCustomers = segments.reduce((sum, s) => sum + (s.memberCount || 0), 0);

  const stats = [
    {
      title: 'Toplam Segment',
      value: total.toLocaleString('tr-TR'),
      icon: ApartmentOutlined,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      change: '+8%',
      subtitle: 'Son aya göre',
    },
    {
      title: 'Aktif Segment',
      value: active.toLocaleString('tr-TR'),
      icon: RocketOutlined,
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100',
      change: `${total > 0 ? ((active / total) * 100).toFixed(0) : 0}%`,
      subtitle: 'Aktif oran',
    },
    {
      title: 'Dinamik Segment',
      value: dynamic.toLocaleString('tr-TR'),
      icon: ApartmentOutlined,
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
      change: `${total > 0 ? ((dynamic / total) * 100).toFixed(0) : 0}%`,
      subtitle: 'Otomatik güncelleme',
    },
    {
      title: 'Toplam Müşteri',
      value: totalCustomers.toLocaleString('tr-TR'),
      icon: TeamOutlined,
      gradient: 'from-orange-500 to-orange-600',
      bgGradient: 'from-orange-50 to-orange-100',
      change: '+22%',
      subtitle: 'Segmentlerde',
    },
  ];

  if (loading) {
    return (
      <Row gutter={16}>
        {[0, 1, 2, 3].map((i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
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
          <Col xs={24} sm={12} lg={6} key={stat.title}>
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
