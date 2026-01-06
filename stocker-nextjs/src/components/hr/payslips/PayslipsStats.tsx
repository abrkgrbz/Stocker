'use client';

import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import {
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';
import type { PayslipDto } from '@/lib/api/services/hr.types';

interface PayslipsStatsProps {
  payslips: PayslipDto[];
  loading?: boolean;
}

export function PayslipsStats({ payslips, loading = false }: PayslipsStatsProps) {
  const totalPayslips = payslips.length;
  const pendingPayslips = payslips.filter((p) => p.status === 'Pending' || p.status === 'Draft').length;
  const paidPayslips = payslips.filter((p) => p.status === 'Paid').length;
  const totalNetSalary = payslips.reduce((sum, p) => sum + (p.netSalary || 0), 0);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(value);

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
      value: totalPayslips,
      subtitle: 'Tüm Bordrolar',
      icon: CurrencyDollarIcon,
      color: '#7c3aed',
    },
    {
      title: 'Bekleyen',
      value: pendingPayslips,
      subtitle: 'Onay Bekliyor',
      icon: ClockIcon,
      color: '#f59e0b',
    },
    {
      title: 'Ödenen',
      value: paidPayslips,
      subtitle: `${totalPayslips > 0 ? ((paidPayslips / totalPayslips) * 100).toFixed(0) : 0}% Ödendi`,
      icon: CheckCircleIcon,
      color: '#10b981',
    },
    {
      title: 'Toplam Net',
      value: formatCurrency(totalNetSalary),
      subtitle: 'Net Maaş Toplamı',
      icon: BanknotesIcon,
      color: '#3b82f6',
      isFormatted: true,
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
                  value={stat.isFormatted ? stat.value : stat.value}
                  formatter={stat.isFormatted ? () => stat.value : undefined}
                  valueStyle={{ color: '#1f2937', fontWeight: 'bold', fontSize: stat.isFormatted ? '1.25rem' : '1.75rem' }}
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
