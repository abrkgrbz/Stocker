'use client';

/**
 * Leads Stats Component
 * Monochrome Enterprise Design - Clean Black/White/Gray
 */

import React from 'react';
import { Row, Col } from 'antd';
import { UserAddOutlined, StarOutlined, RocketOutlined, CheckCircleOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
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
      change: '+18%',
      changePositive: true,
      subtitle: 'Bu ay',
    },
    {
      title: 'Yeni Lead',
      value: newLeads.toLocaleString('tr-TR'),
      icon: RocketOutlined,
      change: '+32%',
      changePositive: true,
      subtitle: 'İşleme hazır',
    },
    {
      title: 'Nitelikli Lead',
      value: qualifiedLeads.toLocaleString('tr-TR'),
      icon: CheckCircleOutlined,
      change: `${qualificationRate.toFixed(1)}%`,
      changePositive: qualificationRate > 20,
      subtitle: 'Nitelik oranı',
    },
    {
      title: 'Ortalama Puan',
      value: `${avgScore}/100`,
      icon: StarOutlined,
      change: '+5 puan',
      changePositive: true,
      subtitle: 'Lead kalitesi',
    },
  ];

  if (loading) {
    return (
      <Row gutter={[16, 16]}>
        {[0, 1, 2, 3].map((i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <div className="h-24 bg-slate-100 rounded-lg animate-pulse" />
          </Col>
        ))}
      </Row>
    );
  }

  return (
    <Row gutter={[16, 16]}>
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Col xs={24} sm={12} lg={6} key={stat.title}>
            <div className="bg-white border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors">
              {/* Icon - Top Left, Small, Gray */}
              <div className="flex items-start justify-between mb-3">
                <Icon className="text-lg text-slate-400" />
              </div>

              {/* Value - Large & Bold */}
              <div className="text-3xl font-bold text-slate-900 mb-1">
                {stat.value}
              </div>

              {/* Title & Trend */}
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-medium text-slate-500 tracking-wide">
                  {stat.title}
                </span>
                <span className={`text-xs font-medium flex items-center gap-0.5 ${
                  stat.changePositive ? 'text-emerald-600' : 'text-red-500'
                }`}>
                  {stat.changePositive ? (
                    <ArrowUpOutlined className="text-[10px]" />
                  ) : (
                    <ArrowDownOutlined className="text-[10px]" />
                  )}
                  {stat.change}
                </span>
              </div>

              {/* Subtitle */}
              <div className="text-[11px] text-slate-400 mt-1">
                {stat.subtitle}
              </div>
            </div>
          </Col>
        );
      })}
    </Row>
  );
}
