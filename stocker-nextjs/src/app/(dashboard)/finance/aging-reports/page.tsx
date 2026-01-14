'use client';

/**
 * Aging Reports Page (Yaşlandırma Raporları)
 * Vade bazlı alacak ve borç analizi
 * Monochrome design system following DESIGN_SYSTEM.md
 */

import React, { useState } from 'react';
import { Table, Select, Spin, Empty, Progress } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  CalendarIcon,
  ArrowPathIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  DocumentArrowDownIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

// Table styles for monochrome design
const tableClassName = "[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50";

// Types
type ReportType = 'receivables' | 'payables';
type AgingPeriod = 'current' | '1-30' | '31-60' | '61-90' | '90+';

interface AgingItem {
  id: number;
  accountCode: string;
  accountName: string;
  current: number;
  days1to30: number;
  days31to60: number;
  days61to90: number;
  days90plus: number;
  total: number;
  lastTransactionDate: string;
  creditLimit?: number;
}

// Mock data
const mockReceivables: AgingItem[] = [
  {
    id: 1,
    accountCode: '120.001',
    accountName: 'ABC Ticaret Ltd. Şti.',
    current: 45000,
    days1to30: 32000,
    days31to60: 15000,
    days61to90: 8000,
    days90plus: 5000,
    total: 105000,
    lastTransactionDate: '2025-01-10',
    creditLimit: 150000,
  },
  {
    id: 2,
    accountCode: '120.002',
    accountName: 'XYZ Holding A.Ş.',
    current: 120000,
    days1to30: 0,
    days31to60: 25000,
    days61to90: 0,
    days90plus: 0,
    total: 145000,
    lastTransactionDate: '2025-01-12',
    creditLimit: 200000,
  },
  {
    id: 3,
    accountCode: '120.003',
    accountName: 'Mega Yapı İnşaat',
    current: 0,
    days1to30: 45000,
    days31to60: 30000,
    days61to90: 20000,
    days90plus: 35000,
    total: 130000,
    lastTransactionDate: '2024-11-15',
    creditLimit: 100000,
  },
  {
    id: 4,
    accountCode: '120.004',
    accountName: 'Deniz Lojistik',
    current: 75000,
    days1to30: 12000,
    days31to60: 0,
    days61to90: 0,
    days90plus: 0,
    total: 87000,
    lastTransactionDate: '2025-01-08',
    creditLimit: 120000,
  },
  {
    id: 5,
    accountCode: '120.005',
    accountName: 'Star Elektronik',
    current: 28000,
    days1to30: 18000,
    days31to60: 12000,
    days61to90: 5000,
    days90plus: 0,
    total: 63000,
    lastTransactionDate: '2024-12-28',
    creditLimit: 80000,
  },
];

const mockPayables: AgingItem[] = [
  {
    id: 1,
    accountCode: '320.001',
    accountName: 'Global Tedarik A.Ş.',
    current: 85000,
    days1to30: 42000,
    days31to60: 0,
    days61to90: 0,
    days90plus: 0,
    total: 127000,
    lastTransactionDate: '2025-01-11',
  },
  {
    id: 2,
    accountCode: '320.002',
    accountName: 'Merkez Dağıtım Ltd.',
    current: 35000,
    days1to30: 28000,
    days31to60: 15000,
    days61to90: 0,
    days90plus: 0,
    total: 78000,
    lastTransactionDate: '2025-01-05',
  },
  {
    id: 3,
    accountCode: '320.003',
    accountName: 'Endüstri Makina',
    current: 0,
    days1to30: 55000,
    days31to60: 25000,
    days61to90: 18000,
    days90plus: 12000,
    total: 110000,
    lastTransactionDate: '2024-10-20',
  },
];

export default function AgingReportsPage() {
  const [reportType, setReportType] = useState<ReportType>('receivables');
  const [isLoading, setIsLoading] = useState(false);

  const data = reportType === 'receivables' ? mockReceivables : mockPayables;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  // Calculate totals
  const totals = data.reduce(
    (acc, item) => ({
      current: acc.current + item.current,
      days1to30: acc.days1to30 + item.days1to30,
      days31to60: acc.days31to60 + item.days31to60,
      days61to90: acc.days61to90 + item.days61to90,
      days90plus: acc.days90plus + item.days90plus,
      total: acc.total + item.total,
    }),
    { current: 0, days1to30: 0, days31to60: 0, days61to90: 0, days90plus: 0, total: 0 }
  );

  // Calculate aging distribution percentages
  const agingDistribution = [
    { label: 'Güncel', value: totals.current, color: 'bg-emerald-500' },
    { label: '1-30 Gün', value: totals.days1to30, color: 'bg-blue-500' },
    { label: '31-60 Gün', value: totals.days31to60, color: 'bg-amber-500' },
    { label: '61-90 Gün', value: totals.days61to90, color: 'bg-orange-500' },
    { label: '90+ Gün', value: totals.days90plus, color: 'bg-red-500' },
  ];

  const overdueTotal = totals.days31to60 + totals.days61to90 + totals.days90plus;
  const overduePercentage = totals.total > 0 ? ((overdueTotal / totals.total) * 100).toFixed(1) : '0';

  const columns: ColumnsType<AgingItem> = [
    {
      title: 'Hesap',
      key: 'account',
      fixed: 'left',
      width: 250,
      render: (_, record) => (
        <div>
          <div className="text-sm font-medium text-slate-900">{record.accountName}</div>
          <div className="text-xs text-slate-500">{record.accountCode}</div>
        </div>
      ),
    },
    {
      title: 'Güncel',
      dataIndex: 'current',
      key: 'current',
      align: 'right',
      width: 120,
      render: (amount) => (
        <span className="text-sm text-emerald-600 font-medium">{formatCurrency(amount)}</span>
      ),
    },
    {
      title: '1-30 Gün',
      dataIndex: 'days1to30',
      key: 'days1to30',
      align: 'right',
      width: 120,
      render: (amount) => (
        <span className="text-sm text-blue-600">{formatCurrency(amount)}</span>
      ),
    },
    {
      title: '31-60 Gün',
      dataIndex: 'days31to60',
      key: 'days31to60',
      align: 'right',
      width: 120,
      render: (amount) => (
        <span className={`text-sm ${amount > 0 ? 'text-amber-600 font-medium' : 'text-slate-400'}`}>
          {formatCurrency(amount)}
        </span>
      ),
    },
    {
      title: '61-90 Gün',
      dataIndex: 'days61to90',
      key: 'days61to90',
      align: 'right',
      width: 120,
      render: (amount) => (
        <span className={`text-sm ${amount > 0 ? 'text-orange-600 font-medium' : 'text-slate-400'}`}>
          {formatCurrency(amount)}
        </span>
      ),
    },
    {
      title: '90+ Gün',
      dataIndex: 'days90plus',
      key: 'days90plus',
      align: 'right',
      width: 120,
      render: (amount) => (
        <span className={`text-sm ${amount > 0 ? 'text-red-600 font-bold' : 'text-slate-400'}`}>
          {formatCurrency(amount)}
        </span>
      ),
    },
    {
      title: 'Toplam',
      dataIndex: 'total',
      key: 'total',
      align: 'right',
      width: 130,
      render: (amount) => (
        <span className="text-sm font-bold text-slate-900">{formatCurrency(amount)}</span>
      ),
    },
    {
      title: 'Risk',
      key: 'risk',
      width: 100,
      render: (_, record) => {
        const overdueAmount = record.days31to60 + record.days61to90 + record.days90plus;
        const riskPercentage = record.total > 0 ? (overdueAmount / record.total) * 100 : 0;

        let riskLevel = 'Düşük';
        let riskColor = 'bg-emerald-100 text-emerald-700';

        if (riskPercentage > 50) {
          riskLevel = 'Yüksek';
          riskColor = 'bg-red-100 text-red-700';
        } else if (riskPercentage > 25) {
          riskLevel = 'Orta';
          riskColor = 'bg-amber-100 text-amber-700';
        }

        return (
          <span className={`px-2 py-1 text-xs font-medium rounded ${riskColor}`}>
            {riskLevel}
          </span>
        );
      },
    },
  ];

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Page Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
          <CalendarIcon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Yaşlandırma Raporları</h1>
              <p className="text-sm text-slate-500">Vade bazlı alacak ve borç analizi</p>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={reportType}
                onChange={(value) => setReportType(value)}
                size="large"
                className="w-40 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
                options={[
                  { value: 'receivables', label: 'Alacaklar' },
                  { value: 'payables', label: 'Borçlar' },
                ]}
              />
              <button
                onClick={handleRefresh}
                className="p-2.5 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <ArrowPathIcon className={`w-5 h-5 text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <button className="p-2.5 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors">
                <DocumentArrowDownIcon className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                {reportType === 'receivables' ? (
                  <ArrowTrendingUpIcon className="w-5 h-5 text-emerald-500" />
                ) : (
                  <ArrowTrendingDownIcon className="w-5 h-5 text-red-500" />
                )}
                <span className="text-xs text-slate-500">
                  Toplam {reportType === 'receivables' ? 'Alacak' : 'Borç'}
                </span>
              </div>
              <div className="text-2xl font-bold text-slate-900">{formatCurrency(totals.total)}</div>
              <div className="text-xs text-slate-500 mt-1">{data.length} hesap</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-xs text-slate-500">Güncel</span>
              </div>
              <div className="text-2xl font-bold text-emerald-600">{formatCurrency(totals.current)}</div>
              <div className="text-xs text-slate-500 mt-1">
                {totals.total > 0 ? ((totals.current / totals.total) * 100).toFixed(1) : 0}%
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />
                <span className="text-xs text-slate-500">Vadesi Geçmiş</span>
              </div>
              <div className="text-2xl font-bold text-amber-600">{formatCurrency(overdueTotal)}</div>
              <div className="text-xs text-slate-500 mt-1">{overduePercentage}%</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-xs text-slate-500">90+ Gün Gecikmiş</span>
              </div>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(totals.days90plus)}</div>
              <div className="text-xs text-slate-500 mt-1">
                {totals.total > 0 ? ((totals.days90plus / totals.total) * 100).toFixed(1) : 0}%
              </div>
            </div>
          </div>

          {/* Aging Distribution Chart */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <ChartBarIcon className="w-4 h-4 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Yaşlandırma Dağılımı</h3>
            </div>

            {/* Stacked Bar */}
            <div className="h-8 rounded-lg overflow-hidden flex mb-4">
              {agingDistribution.map((item, index) => {
                const percentage = totals.total > 0 ? (item.value / totals.total) * 100 : 0;
                if (percentage === 0) return null;
                return (
                  <div
                    key={index}
                    className={`${item.color} transition-all`}
                    style={{ width: `${percentage}%` }}
                    title={`${item.label}: ${formatCurrency(item.value)} (${percentage.toFixed(1)}%)`}
                  />
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4">
              {agingDistribution.map((item, index) => {
                const percentage = totals.total > 0 ? (item.value / totals.total) * 100 : 0;
                return (
                  <div key={index} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="text-xs text-slate-600">
                      {item.label}: {formatCurrency(item.value)} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Aging Table */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <FunnelIcon className="w-4 h-4 text-slate-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {reportType === 'receivables' ? 'Alacak' : 'Borç'} Detayları
                </h3>
              </div>
            </div>

            {data.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span className="text-slate-500">
                    {reportType === 'receivables' ? 'Alacak' : 'Borç'} kaydı bulunmuyor
                  </span>
                }
              />
            ) : (
              <Table
                columns={columns}
                dataSource={data}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Toplam ${total} hesap`,
                }}
                scroll={{ x: 1200 }}
                className={tableClassName}
                summary={() => (
                  <Table.Summary fixed>
                    <Table.Summary.Row className="bg-slate-100 font-semibold">
                      <Table.Summary.Cell index={0}>
                        <span className="text-slate-900 font-bold">TOPLAM</span>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="right">
                        <span className="text-emerald-600">{formatCurrency(totals.current)}</span>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2} align="right">
                        <span className="text-blue-600">{formatCurrency(totals.days1to30)}</span>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={3} align="right">
                        <span className="text-amber-600">{formatCurrency(totals.days31to60)}</span>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={4} align="right">
                        <span className="text-orange-600">{formatCurrency(totals.days61to90)}</span>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={5} align="right">
                        <span className="text-red-600">{formatCurrency(totals.days90plus)}</span>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={6} align="right">
                        <span className="text-slate-900 font-bold">{formatCurrency(totals.total)}</span>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={7}></Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                )}
              />
            )}
          </div>

          {/* Info Section */}
          <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-amber-900 mb-3">Yaşlandırma Raporu Hakkında</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-amber-700">
              <div>
                <h4 className="font-medium text-amber-800 mb-1">Vade Kategorileri</h4>
                <ul className="space-y-1">
                  <li>• <strong>Güncel:</strong> Vadesi henüz gelmemiş bakiyeler</li>
                  <li>• <strong>1-30 Gün:</strong> Yeni gecikmiş, düşük risk</li>
                  <li>• <strong>31-60 Gün:</strong> Dikkat gerektiren gecikme</li>
                  <li>• <strong>61-90 Gün:</strong> Yüksek risk, aksiyon gerekli</li>
                  <li>• <strong>90+ Gün:</strong> Kritik gecikme, tahsilat riski</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-amber-800 mb-1">Öneriler</h4>
                <ul className="space-y-1">
                  <li>• 30 günü aşan gecikmelerde müşteriyle iletişime geçin</li>
                  <li>• 60 günü aşan alacaklar için tahsilat planı oluşturun</li>
                  <li>• 90+ gün gecikmeli alacaklar için şüpheli alacak karşılığı ayırın</li>
                  <li>• Düzenli raporlama ile nakit akışını optimize edin</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
