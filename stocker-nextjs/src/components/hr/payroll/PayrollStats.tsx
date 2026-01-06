'use client';

import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import {
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';
import type { PayrollDto } from '@/lib/api/services/hr.types';
import { PayrollStatus } from '@/lib/api/services/hr.types';

interface PayrollStatsProps {
  payrolls: PayrollDto[];
  loading?: boolean;
}

const formatCurrency = (value?: number) => {
  if (!value) return '₺0';
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
};

export function PayrollStats({ payrolls, loading = false }: PayrollStatsProps) {
  const totalPayrolls = payrolls.length;
  const pendingPayrolls = payrolls.filter(
    (p) =>
      p.status === PayrollStatus.PendingApproval ||
      p.status === PayrollStatus.Draft ||
      p.status === PayrollStatus.Calculated
  ).length;
  const approvedPayrolls = payrolls.filter((p) => p.status === PayrollStatus.Approved).length;
  const totalAmount = payrolls.reduce((sum, p) => sum + (p.netSalary || 0), 0);

  if (loading) {
    return (
      <Row gutter={[16, 16]}>
        {[0, 1, 2, 3].map((i) => (
          <Col xs={12} sm={6} key={i}>
            <div className="h-24 bg-gray-100 rounded-lg animate-pulse" />
          </Col>
        ))}
      </Row>
    );
  }

  const stats = [
    {
      title: 'Toplam Bordro',
      value: totalPayrolls,
      subtitle: 'Kayıtlı Bordolar',
      icon: CurrencyDollarIcon,
      color: '#7c3aed',
    },
    {
      title: 'Bekleyen',
      value: pendingPayrolls,
      subtitle: 'Onay Bekleyen',
      icon: ClockIcon,
      color: '#f59e0b',
    },
    {
      title: 'Onaylanan',
      value: approvedPayrolls,
      subtitle: 'Onaylanmış Bordolar',
      icon: CheckCircleIcon,
      color: '#10b981',
    },
    {
      title: 'Toplam Net',
      value: formatCurrency(totalAmount),
      subtitle: 'Toplam Net Ödeme',
      icon: BanknotesIcon,
      color: '#3b82f6',
      isText: true,
    },
  ];

  return (
    <Row gutter={[16, 16]}>
      {stats.map((stat, index) => (
        <Col xs={12} sm={6} key={index}>
          <Card className="h-full border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <Statistic
                  title={<span className="text-gray-500 text-sm">{stat.title}</span>}
                  value={stat.isText ? undefined : stat.value}
                  formatter={stat.isText ? () => stat.value : undefined}
                  valueStyle={{ color: '#1f2937', fontWeight: 'bold', fontSize: stat.isText ? '1.25rem' : '1.75rem' }}
                />
                <div className="text-xs mt-1" style={{ color: stat.color }}>
                  {stat.subtitle}
                </div>
              </div>
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}15` }}
              >
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
