'use client';

import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import type { InvoiceSummaryDto } from '@/lib/api/services/finance.types';

interface InvoicesStatsProps {
  invoices: InvoiceSummaryDto[];
  totalCount: number;
  loading?: boolean;
}

export function InvoicesStats({ invoices, totalCount, loading = false }: InvoicesStatsProps) {
  const salesInvoices = invoices.filter((i) => i.invoiceType === 'Sales');
  const purchaseInvoices = invoices.filter((i) => i.invoiceType === 'Purchase');
  const totalSalesAmount = salesInvoices.reduce((sum, i) => sum + (i.totalAmount || 0), 0);
  const totalPurchaseAmount = purchaseInvoices.reduce((sum, i) => sum + (i.totalAmount || 0), 0);
  const paidInvoices = invoices.filter((i) => i.status === 'Paid').length;
  const overdueInvoices = invoices.filter((i) => i.status === 'Overdue').length;

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
            title={<span className="text-gray-500 text-sm">Toplam Fatura</span>}
            value={totalCount}
            valueStyle={{ color: '#1f2937', fontWeight: 'bold', fontSize: '2rem' }}
          />
          <div className="text-xs text-gray-400 mt-2">Tüm Faturalar</div>
        </Card>
      </Col>

      <Col xs={24} sm={12} md={6}>
        <Card className="h-full border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <Statistic
            title={<span className="text-gray-500 text-sm">Satış Tutarı</span>}
            value={totalSalesAmount}
            valueStyle={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.5rem' }}
            formatter={() => formatCurrency(totalSalesAmount)}
          />
          <div className="text-xs text-emerald-600 mt-2">{salesInvoices.length} satış faturası</div>
        </Card>
      </Col>

      <Col xs={24} sm={12} md={6}>
        <Card className="h-full border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <Statistic
            title={<span className="text-gray-500 text-sm">Alış Tutarı</span>}
            value={totalPurchaseAmount}
            valueStyle={{ color: '#ef4444', fontWeight: 'bold', fontSize: '1.5rem' }}
            formatter={() => formatCurrency(totalPurchaseAmount)}
          />
          <div className="text-xs text-red-600 mt-2">{purchaseInvoices.length} alış faturası</div>
        </Card>
      </Col>

      <Col xs={24} sm={12} md={6}>
        <Card className="h-full border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <Statistic
            title={<span className="text-gray-500 text-sm">Durum</span>}
            value={paidInvoices}
            valueStyle={{ color: '#1f2937', fontWeight: 'bold', fontSize: '2rem' }}
          />
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-emerald-600">{paidInvoices} ödendi</span>
            <span className="text-xs text-slate-300">|</span>
            <span className="text-xs text-red-600">{overdueInvoices} gecikmiş</span>
          </div>
        </Card>
      </Col>
    </Row>
  );
}
