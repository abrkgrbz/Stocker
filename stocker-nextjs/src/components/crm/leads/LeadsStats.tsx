'use client';

import React from 'react';
import { Row, Col } from 'antd';
import { UserAddOutlined, StarOutlined, RocketOutlined, CheckCircleOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
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
  const qualificationRate = leads.length > 0 ? (qualifiedLeads / leads.length) * 100 : 0;

  const stats = [
    {
      title: 'Toplam Lead',
      value: leads.length.toLocaleString('tr-TR'),
      icon: UserAddOutlined,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      change: '+18%',
      subtitle: 'Bu ay',
    },
    {
      title: 'Yeni Lead',
      value: newLeads.toLocaleString('tr-TR'),
      icon: RocketOutlined,
      gradient: 'from-cyan-500 to-cyan-600',
      bgGradient: 'from-cyan-50 to-cyan-100',
      change: '+32%',
      subtitle: 'İşleme hazır',
    },
    {
      title: 'Nitelikli Lead',
      value: qualifiedLeads.toLocaleString('tr-TR'),
      icon: CheckCircleOutlined,
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100',
      change: `${qualificationRate.toFixed(1)}%`,
      subtitle: 'Nitelik oranı',
    },
    {
      title: 'Ortalama Puan',
      value: `${avgScore}/100`,
      icon: StarOutlined,
      gradient: 'from-yellow-500 to-yellow-600',
      bgGradient: 'from-yellow-50 to-yellow-100',
      change: '+5 puan',
      subtitle: 'Lead kalitesi',
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
