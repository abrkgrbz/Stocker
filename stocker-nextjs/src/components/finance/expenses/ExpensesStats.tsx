'use client';

import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import type { ExpenseSummaryDto } from '@/lib/api/services/finance.types';
import dayjs from 'dayjs';

interface ExpensesStatsProps {
  expenses: ExpenseSummaryDto[];
  totalCount: number;
  loading?: boolean;
}

export function ExpensesStats({ expenses, totalCount, loading = false }: ExpensesStatsProps) {
  const totalAmount = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const paidExpenses = expenses.filter((e) => e.status === 'Paid');
  const paidAmount = paidExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const pendingExpenses = expenses.filter((e) => e.status === 'Pending' || e.status === 'Approved');
  const pendingAmount = pendingExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  // This month's expenses
  const thisMonth = dayjs().startOf('month');
  const thisMonthExpenses = expenses.filter((e) => dayjs(e.expenseDate).isAfter(thisMonth));
  const thisMonthAmount = thisMonthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  if (loading) {
    return (
      <Row gutter={[16, 16]}>
        {[0, 1, 2, 3].map((i) => (
          <Col xs={24} sm={12} md={6} key={i}>
            <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />
          </Col>
        ))}
      </Row>
    );
  }

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} md={6}>
        <Card className="h-full border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <Statistic
            title={<span className="text-gray-500 text-sm">Toplam Gider</span>}
            value={totalCount}
            valueStyle={{ color: '#1f2937', fontWeight: 'bold', fontSize: '2rem' }}
          />
          <div className="text-xs text-gray-400 mt-2">Tüm gider kayıtları</div>
        </Card>
      </Col>

      <Col xs={24} sm={12} md={6}>
        <Card className="h-full border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <Statistic
            title={<span className="text-gray-500 text-sm">Toplam Tutar</span>}
            value={totalAmount}
            valueStyle={{ color: '#ef4444', fontWeight: 'bold', fontSize: '1.5rem' }}
            formatter={() => formatCurrency(totalAmount)}
          />
          <div className="text-xs text-red-600 mt-2">{expenses.length} gider kaydı</div>
        </Card>
      </Col>

      <Col xs={24} sm={12} md={6}>
        <Card className="h-full border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <Statistic
            title={<span className="text-gray-500 text-sm">Bu Ay</span>}
            value={thisMonthAmount}
            valueStyle={{ color: '#f59e0b', fontWeight: 'bold', fontSize: '1.5rem' }}
            formatter={() => formatCurrency(thisMonthAmount)}
          />
          <div className="text-xs text-amber-600 mt-2">{thisMonthExpenses.length} gider</div>
        </Card>
      </Col>

      <Col xs={24} sm={12} md={6}>
        <Card className="h-full border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <Statistic
            title={<span className="text-gray-500 text-sm">Bekleyen</span>}
            value={pendingAmount}
            valueStyle={{ color: '#3b82f6', fontWeight: 'bold', fontSize: '1.5rem' }}
            formatter={() => formatCurrency(pendingAmount)}
          />
          <div className="text-xs text-blue-600 mt-2">{pendingExpenses.length} onay bekliyor</div>
        </Card>
      </Col>
    </Row>
  );
}
