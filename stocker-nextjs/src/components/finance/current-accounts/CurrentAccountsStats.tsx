'use client';

import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import type { CurrentAccountSummaryDto } from '@/lib/api/services/finance.types';

interface CurrentAccountsStatsProps {
  currentAccounts: CurrentAccountSummaryDto[];
  totalCount: number;
  loading?: boolean;
}

export function CurrentAccountsStats({ currentAccounts, totalCount, loading = false }: CurrentAccountsStatsProps) {
  const totalReceivables = currentAccounts.reduce((sum, ca) => sum + (ca.balance > 0 ? ca.balance : 0), 0);
  const totalPayables = currentAccounts.reduce((sum, ca) => sum + (ca.balance < 0 ? Math.abs(ca.balance) : 0), 0);
  const customerAccounts = currentAccounts.filter((ca) => ca.accountType === 'Customer').length;
  const vendorAccounts = currentAccounts.filter((ca) => ca.accountType === 'Supplier').length;

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
            title={<span className="text-gray-500 text-sm">Toplam Hesap</span>}
            value={totalCount}
            valueStyle={{ color: '#1f2937', fontWeight: 'bold', fontSize: '2rem' }}
          />
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-blue-600">{customerAccounts} müşteri</span>
            <span className="text-xs text-slate-300">|</span>
            <span className="text-xs text-orange-600">{vendorAccounts} tedarikçi</span>
          </div>
        </Card>
      </Col>

      <Col xs={24} sm={12} md={6}>
        <Card className="h-full border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <Statistic
            title={<span className="text-gray-500 text-sm">Toplam Alacak</span>}
            value={totalReceivables}
            valueStyle={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.5rem' }}
            formatter={() => formatCurrency(totalReceivables)}
          />
          <div className="text-xs text-emerald-600 mt-2">Müşterilerden alacaklar</div>
        </Card>
      </Col>

      <Col xs={24} sm={12} md={6}>
        <Card className="h-full border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <Statistic
            title={<span className="text-gray-500 text-sm">Toplam Borç</span>}
            value={totalPayables}
            valueStyle={{ color: '#ef4444', fontWeight: 'bold', fontSize: '1.5rem' }}
            formatter={() => formatCurrency(totalPayables)}
          />
          <div className="text-xs text-red-600 mt-2">Tedarikçilere borçlar</div>
        </Card>
      </Col>

      <Col xs={24} sm={12} md={6}>
        <Card className="h-full border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <Statistic
            title={<span className="text-gray-500 text-sm">Net Durum</span>}
            value={totalReceivables - totalPayables}
            valueStyle={{
              color: totalReceivables - totalPayables >= 0 ? '#10b981' : '#ef4444',
              fontWeight: 'bold',
              fontSize: '1.5rem',
            }}
            formatter={() => formatCurrency(totalReceivables - totalPayables)}
          />
          <div className="text-xs text-slate-500 mt-2">Alacak - Borç</div>
        </Card>
      </Col>
    </Row>
  );
}
