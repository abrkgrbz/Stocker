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
              <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${stat.bgGradient} p-4 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100`}>
                <div className="flex items-center gap-3">
                  {/* Compact icon without redundant background icon */}
                  <div className={`flex-shrink-0 inline-flex p-2.5 rounded-lg bg-gradient-to-br ${stat.gradient} shadow-md`}>
                    <Icon className="text-xl text-white" />
                  </div>

                  {/* Content in horizontal layout */}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-600 mb-0.5">
                      {stat.title}
                    </div>

                    <div className="flex items-baseline gap-2">
                      <div className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </div>
                      <span className="text-xs font-semibold text-green-600 flex items-center gap-0.5">
                        {stat.change.startsWith('+') && <ArrowUpOutlined className="text-[10px]" />}
                        {stat.change}
                      </span>
                    </div>

                    <div className="mt-0.5 text-[11px] text-gray-500">
                      {stat.subtitle}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </Col>
        );
      })}
    </Row>
  );
}
