'use client';

import React from 'react';
import { Row, Col } from 'antd';
import { ClockCircleOutlined, CalendarOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

interface ActivitiesStatsProps {
  scheduled: number;
  today: number;
  completed: number;
  overdue: number;
  loading?: boolean;
}

export function ActivitiesStats({
  scheduled,
  today,
  completed,
  overdue,
  loading = false,
}: ActivitiesStatsProps) {
  const stats = [
    {
      title: 'Zamanlanmış',
      value: scheduled.toLocaleString('tr-TR'),
      icon: ClockCircleOutlined,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      subtitle: 'Planlanan aktivite',
    },
    {
      title: 'Bugün',
      value: today.toLocaleString('tr-TR'),
      icon: CalendarOutlined,
      gradient: 'from-cyan-500 to-cyan-600',
      bgGradient: 'from-cyan-50 to-cyan-100',
      subtitle: 'Bugünün ajandası',
    },
    {
      title: 'Tamamlanan',
      value: completed.toLocaleString('tr-TR'),
      icon: CheckCircleOutlined,
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100',
      subtitle: 'Başarıyla tamamlandı',
    },
    {
      title: 'Gecikmiş',
      value: overdue.toLocaleString('tr-TR'),
      icon: WarningOutlined,
      gradient: 'from-red-500 to-red-600',
      bgGradient: 'from-red-50 to-red-100',
      subtitle: 'Dikkat gerektiren',
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
                  <div className="text-3xl font-bold text-gray-900">
                    {stat.value}
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
