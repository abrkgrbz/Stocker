'use client';

/**
 * Withholding Report (Stopaj/Tevkifat Raporu) Page
 * Türkiye KDV Tevkifat detaylı raporu
 * Monochrome design system following DESIGN_SYSTEM.md
 */

import React, { useState } from 'react';
import { Select, Spin, Table, Empty } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ArrowPathIcon,
  DocumentTextIcon,
  CalculatorIcon,
  ScaleIcon,
  BanknotesIcon,
  ChartPieIcon,
} from '@heroicons/react/24/outline';
import { useWithholdingReport } from '@/lib/api/hooks/useFinance';
import type { WithholdingReportItemDto } from '@/lib/api/services/finance.types';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

// Table styles for monochrome design
const tableClassName = "[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50";

// Month names in Turkish
const monthNames = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

// Withholding rate configurations
const withholdingRates = [
  { key: '2_10', label: '2/10', description: 'Kısmi tevkifat', percentage: '20%' },
  { key: '3_10', label: '3/10', description: 'Kısmi tevkifat', percentage: '30%' },
  { key: '5_10', label: '5/10', description: 'Kısmi tevkifat', percentage: '50%' },
  { key: '7_10', label: '7/10', description: 'Kısmi tevkifat', percentage: '70%' },
  { key: '9_10', label: '9/10', description: 'Tam tevkifat', percentage: '90%' },
];

export default function WithholdingReportPage() {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);

  // Fetch Withholding report
  const { data: report, isLoading, refetch } = useWithholdingReport(selectedYear, selectedMonth);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  // Generate year options
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => ({
    value: currentYear - i,
    label: `${currentYear - i}`,
  }));

  // Generate month options
  const monthOptions = monthNames.map((name, index) => ({
    value: index + 1,
    label: name,
  }));

  // Get withholding amounts from report
  const withholdingAmounts = {
    '2_10': report?.withholding2_10 || 0,
    '3_10': report?.withholding3_10 || 0,
    '5_10': report?.withholding5_10 || 0,
    '7_10': report?.withholding7_10 || 0,
    '9_10': report?.withholding9_10 || 0,
    total: report?.totalWithholding || 0,
  };

  const items = report?.items || [];

  const columns: ColumnsType<WithholdingReportItemDto> = [
    {
      title: 'Fatura',
      key: 'invoice',
      render: (_, record) => (
        <div>
          <div className="text-sm font-medium text-slate-900">{record.invoiceNumber}</div>
          <div className="text-xs text-slate-500">{dayjs(record.invoiceDate).format('DD MMM YYYY')}</div>
        </div>
      ),
    },
    {
      title: 'Cari Hesap',
      key: 'currentAccount',
      render: (_, record) => (
        <div>
          <div className="text-sm text-slate-900">{record.currentAccountName}</div>
          <div className="text-xs text-slate-500">{record.taxNumber}</div>
        </div>
      ),
    },
    {
      title: 'Tevkifat Kodu',
      dataIndex: 'withholdingCode',
      key: 'withholdingCode',
      render: (code) => (
        <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded">
          {code}
        </span>
      ),
    },
    {
      title: 'Oran',
      dataIndex: 'withholdingRate',
      key: 'withholdingRate',
      render: (rate) => (
        <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded">
          {rate}
        </span>
      ),
    },
    {
      title: 'Matrah',
      dataIndex: 'baseAmount',
      key: 'baseAmount',
      align: 'right',
      render: (amount) => (
        <span className="text-sm text-slate-600">{formatCurrency(amount)}</span>
      ),
    },
    {
      title: 'Tevkifat Tutarı',
      dataIndex: 'withholdingAmount',
      key: 'withholdingAmount',
      align: 'right',
      render: (amount) => (
        <span className="text-sm font-semibold text-slate-900">{formatCurrency(amount)}</span>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Page Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
          <ScaleIcon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Stopaj/Tevkifat Raporu</h1>
              <p className="text-sm text-slate-500">KDV Tevkifat uygulaması detaylı raporu</p>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={selectedYear}
                onChange={(value) => setSelectedYear(value)}
                options={yearOptions}
                size="large"
                className="w-28 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
              />
              <Select
                value={selectedMonth}
                onChange={(value) => setSelectedMonth(value)}
                options={monthOptions}
                size="large"
                className="w-32 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
              />
              <button
                onClick={() => refetch()}
                className="p-2.5 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <ArrowPathIcon className={`w-5 h-5 text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
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
          {/* Period Info */}
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <DocumentTextIcon className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-purple-900">
                  {monthNames[selectedMonth - 1]} {selectedYear} Dönemi Tevkifat Raporu
                </h3>
                <p className="text-xs text-purple-700">
                  Dönem: {dayjs(new Date(selectedYear, selectedMonth - 1, 1)).format('DD.MM.YYYY')} - {dayjs(new Date(selectedYear, selectedMonth, 0)).format('DD.MM.YYYY')}
                </p>
              </div>
            </div>
          </div>

          {/* Summary Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <BanknotesIcon className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Toplam Tevkifat</h3>
                <p className="text-3xl font-bold text-slate-900 mt-1">{formatCurrency(withholdingAmounts.total)}</p>
              </div>
            </div>
          </div>

          {/* Withholding by Rate */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                <ChartPieIcon className="w-4 h-4 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Oran Bazında Tevkifat</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {withholdingRates.map((rate) => {
                const amount = withholdingAmounts[rate.key as keyof typeof withholdingAmounts] || 0;
                const percentage = withholdingAmounts.total > 0
                  ? ((amount / withholdingAmounts.total) * 100).toFixed(1)
                  : '0';

                return (
                  <div key={rate.key} className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 text-xs font-bold bg-purple-100 text-purple-700 rounded">
                        {rate.label}
                      </span>
                      <span className="text-xs text-slate-500">({rate.percentage})</span>
                    </div>
                    <div className="text-xl font-bold text-slate-900">{formatCurrency(amount)}</div>
                    <div className="text-xs text-slate-500 mt-1">{rate.description}</div>
                    {withholdingAmounts.total > 0 && (
                      <div className="mt-2">
                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-400 mt-1">{percentage}%</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Withholding Items Table */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <DocumentTextIcon className="w-4 h-4 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Tevkifat Detayları</h3>
            </div>

            {items.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span className="text-slate-500">Bu dönemde tevkifat kaydı bulunmuyor</span>
                }
              />
            ) : (
              <Table
                columns={columns}
                dataSource={items}
                rowKey="invoiceId"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Toplam ${total} kayıt`,
                }}
                className={tableClassName}
              />
            )}
          </div>

          {/* Info Section */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">KDV Tevkifat Oranları Rehberi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-2">Kısmi Tevkifat (2/10, 3/10, 5/10, 7/10)</h4>
                <ul className="text-xs text-slate-500 space-y-1">
                  <li>• Yapım işleri ile bu işlerle birlikte ifa edilen mühendislik-mimarlık hizmetleri</li>
                  <li>• Etüt, plan-proje, danışmanlık, denetim hizmetleri</li>
                  <li>• Temizlik, çevre ve bahçe bakım hizmetleri</li>
                  <li>• Servis taşımacılığı hizmetleri</li>
                  <li>• Her türlü baskı ve basım hizmetleri</li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-2">Tam Tevkifat (9/10)</h4>
                <ul className="text-xs text-slate-500 space-y-1">
                  <li>• Hurda ve atık teslimi</li>
                  <li>• Metal, plastik, kağıt, cam hurda ve atıkları</li>
                  <li>• Pamuk, tiftik, yün gibi tekstil hammaddeleri</li>
                  <li>• Ağaç ve orman ürünleri</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 p-3 bg-amber-50 rounded-lg">
              <p className="text-xs text-amber-700">
                <span className="font-medium">Not:</span> Tevkifat uygulaması, alıcının belirli KDV oranında
                kesinti yaparak satıcı adına vergi dairesine ödemesidir. Satıcı faturasında
                tevkifat oranını belirtir ve net tutarı tahsil eder.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
