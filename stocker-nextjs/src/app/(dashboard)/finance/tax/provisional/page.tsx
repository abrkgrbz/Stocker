'use client';

/**
 * Geçici Vergi Beyannamesi (Provisional Tax Declaration) Page
 * Türkiye mevzuatına uygun üç aylık geçici vergi beyannamesi yönetimi
 * GİB e-Beyanname sistemine uyumlu
 * Monochrome design system following DESIGN_SYSTEM.md
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { Table, Select, Tabs, Tag, Progress, Modal, Descriptions, Spin, Empty } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  DocumentTextIcon,
  ArrowPathIcon,
  PlusIcon,
  EyeIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  CalculatorIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusCircleIcon,
} from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

// Table styles for monochrome design
const tableClassName = "[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50";

// Types
type DeclarationStatus = 'draft' | 'calculating' | 'ready' | 'submitted' | 'accepted' | 'rejected' | 'paid';
type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';
type TaxpayerType = 'kurumlar' | 'gelir';

interface ProvisionalTaxDeclaration {
  id: number;
  period: string;
  year: number;
  quarter: Quarter;
  taxpayerType: TaxpayerType;
  status: DeclarationStatus;
  // Income Statement
  grossRevenue: number;
  costOfSales: number;
  grossProfit: number;
  operatingExpenses: number;
  operatingProfit: number;
  financialIncome: number;
  financialExpenses: number;
  profitBeforeTax: number;
  // Tax Calculation
  previousPeriodLoss: number;
  taxableIncome: number;
  taxRate: number;
  calculatedTax: number;
  previousPeriodTax: number;
  taxPayable: number;
  // Meta
  dueDate: string;
  submittedAt?: string;
  acceptedAt?: string;
  receiptNumber?: string;
  createdAt: string;
}

interface IncomeStatementLine {
  id: number;
  code: string;
  description: string;
  currentPeriod: number;
  previousPeriod: number;
  variance: number;
  variancePercent: number;
}

// Status configurations
const statusConfig: Record<DeclarationStatus, { label: string; color: string; icon: React.ReactNode }> = {
  draft: { label: 'Taslak', color: 'default', icon: <ClockIcon className="w-4 h-4" /> },
  calculating: { label: 'Hesaplanıyor', color: 'processing', icon: <CalculatorIcon className="w-4 h-4" /> },
  ready: { label: 'Hazır', color: 'blue', icon: <CheckCircleIcon className="w-4 h-4" /> },
  submitted: { label: 'Gönderildi', color: 'cyan', icon: <PaperAirplaneIcon className="w-4 h-4" /> },
  accepted: { label: 'Kabul Edildi', color: 'green', icon: <CheckCircleIcon className="w-4 h-4" /> },
  rejected: { label: 'Reddedildi', color: 'red', icon: <ExclamationTriangleIcon className="w-4 h-4" /> },
  paid: { label: 'Ödendi', color: 'purple', icon: <BanknotesIcon className="w-4 h-4" /> },
};

// Quarter configurations
const quarterConfig: Record<Quarter, { label: string; months: string; dueMonth: string }> = {
  Q1: { label: '1. Çeyrek', months: 'Ocak - Şubat - Mart', dueMonth: 'Mayıs 17' },
  Q2: { label: '2. Çeyrek', months: 'Nisan - Mayıs - Haziran', dueMonth: 'Ağustos 17' },
  Q3: { label: '3. Çeyrek', months: 'Temmuz - Ağustos - Eylül', dueMonth: 'Kasım 17' },
  Q4: { label: '4. Çeyrek', months: 'Ekim - Kasım - Aralık', dueMonth: 'Şubat 17' },
};

// Mock data
const mockDeclarations: ProvisionalTaxDeclaration[] = [
  {
    id: 1,
    period: '2024-Q4',
    year: 2024,
    quarter: 'Q4',
    taxpayerType: 'kurumlar',
    status: 'paid',
    grossRevenue: 12500000,
    costOfSales: 8750000,
    grossProfit: 3750000,
    operatingExpenses: 1250000,
    operatingProfit: 2500000,
    financialIncome: 150000,
    financialExpenses: 350000,
    profitBeforeTax: 2300000,
    previousPeriodLoss: 0,
    taxableIncome: 2300000,
    taxRate: 25,
    calculatedTax: 575000,
    previousPeriodTax: 425000,
    taxPayable: 150000,
    dueDate: '2025-02-17',
    submittedAt: '2025-02-10',
    acceptedAt: '2025-02-10',
    receiptNumber: 'GV2024Q40001234',
    createdAt: '2025-01-15',
  },
  {
    id: 2,
    period: '2025-Q1',
    year: 2025,
    quarter: 'Q1',
    taxpayerType: 'kurumlar',
    status: 'draft',
    grossRevenue: 0,
    costOfSales: 0,
    grossProfit: 0,
    operatingExpenses: 0,
    operatingProfit: 0,
    financialIncome: 0,
    financialExpenses: 0,
    profitBeforeTax: 0,
    previousPeriodLoss: 0,
    taxableIncome: 0,
    taxRate: 25,
    calculatedTax: 0,
    previousPeriodTax: 0,
    taxPayable: 0,
    dueDate: '2025-05-17',
    createdAt: '2025-01-01',
  },
  {
    id: 3,
    period: '2024-Q3',
    year: 2024,
    quarter: 'Q3',
    taxpayerType: 'kurumlar',
    status: 'paid',
    grossRevenue: 11800000,
    costOfSales: 8260000,
    grossProfit: 3540000,
    operatingExpenses: 1180000,
    operatingProfit: 2360000,
    financialIncome: 120000,
    financialExpenses: 280000,
    profitBeforeTax: 2200000,
    previousPeriodLoss: 0,
    taxableIncome: 2200000,
    taxRate: 25,
    calculatedTax: 550000,
    previousPeriodTax: 300000,
    taxPayable: 250000,
    dueDate: '2024-11-17',
    submittedAt: '2024-11-10',
    acceptedAt: '2024-11-10',
    receiptNumber: 'GV2024Q30001234',
    createdAt: '2024-10-01',
  },
];

const mockIncomeStatement: IncomeStatementLine[] = [
  { id: 1, code: '600', description: 'Yurt İçi Satışlar', currentPeriod: 11500000, previousPeriod: 10800000, variance: 700000, variancePercent: 6.48 },
  { id: 2, code: '601', description: 'Yurt Dışı Satışlar', currentPeriod: 1000000, previousPeriod: 1000000, variance: 0, variancePercent: 0 },
  { id: 3, code: '610', description: 'Satıştan İadeler (-)', currentPeriod: -150000, previousPeriod: -120000, variance: -30000, variancePercent: 25 },
  { id: 4, code: '611', description: 'Satış İskontoları (-)', currentPeriod: -100000, previousPeriod: -80000, variance: -20000, variancePercent: 25 },
  { id: 5, code: '620', description: 'Satılan Mamul Maliyeti (-)', currentPeriod: -8750000, previousPeriod: -8260000, variance: -490000, variancePercent: 5.93 },
  { id: 6, code: '630', description: 'Araştırma Geliştirme Giderleri (-)', currentPeriod: -250000, previousPeriod: -200000, variance: -50000, variancePercent: 25 },
  { id: 7, code: '631', description: 'Pazarlama Satış Dağıtım Gid. (-)', currentPeriod: -500000, previousPeriod: -480000, variance: -20000, variancePercent: 4.17 },
  { id: 8, code: '632', description: 'Genel Yönetim Giderleri (-)', currentPeriod: -500000, previousPeriod: -500000, variance: 0, variancePercent: 0 },
  { id: 9, code: '640', description: 'Faiz Gelirleri', currentPeriod: 150000, previousPeriod: 120000, variance: 30000, variancePercent: 25 },
  { id: 10, code: '660', description: 'Kısa Vadeli Borçlanma Giderleri (-)', currentPeriod: -350000, previousPeriod: -280000, variance: -70000, variancePercent: 25 },
];

export default function ProvisionalTaxPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedDeclaration, setSelectedDeclaration] = useState<ProvisionalTaxDeclaration | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  const formatPercent = (rate: number) => {
    return `%${rate.toFixed(2)}`;
  };

  // Calculate yearly totals
  const yearlyTotals = mockDeclarations
    .filter((dec) => dec.year === selectedYear || dec.year === selectedYear - 1)
    .reduce(
      (acc, dec) => {
        acc.totalTax += dec.calculatedTax;
        acc.totalPaid += dec.taxPayable;
        if (dec.status === 'paid') {
          acc.paidCount++;
        }
        return acc;
      },
      { totalTax: 0, totalPaid: 0, paidCount: 0 }
    );

  // Current quarter info
  const currentQuarter = 'Q1';
  const currentDueDate = '17 Mayıs 2025';

  const columns: ColumnsType<ProvisionalTaxDeclaration> = [
    {
      title: 'Dönem',
      key: 'period',
      width: 160,
      fixed: 'left',
      render: (_, record) => (
        <div>
          <div className="text-sm font-medium text-slate-900">{record.period}</div>
          <div className="text-xs text-slate-500">{quarterConfig[record.quarter].months}</div>
        </div>
      ),
    },
    {
      title: 'Matrah',
      dataIndex: 'taxableIncome',
      key: 'taxableIncome',
      width: 150,
      align: 'right',
      render: (value) => (
        <span className={`text-sm ${value > 0 ? 'text-slate-900' : 'text-slate-400'}`}>
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      title: 'Oran',
      dataIndex: 'taxRate',
      key: 'taxRate',
      width: 80,
      align: 'center',
      render: (value) => <span className="text-sm text-slate-600">{formatPercent(value)}</span>,
    },
    {
      title: 'Hesaplanan Vergi',
      dataIndex: 'calculatedTax',
      key: 'calculatedTax',
      width: 140,
      align: 'right',
      render: (value) => (
        <span className="text-sm text-blue-600 font-medium">{formatCurrency(value)}</span>
      ),
    },
    {
      title: 'Önceki Dönem',
      dataIndex: 'previousPeriodTax',
      key: 'previousPeriodTax',
      width: 130,
      align: 'right',
      render: (value) => (
        <span className="text-sm text-slate-500">-{formatCurrency(value)}</span>
      ),
    },
    {
      title: 'Ödenecek',
      dataIndex: 'taxPayable',
      key: 'taxPayable',
      width: 130,
      align: 'right',
      render: (value) => (
        <span className={`text-sm font-semibold ${value > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      title: 'Son Tarih',
      key: 'dueDate',
      width: 120,
      render: (_, record) => {
        const isOverdue = dayjs(record.dueDate).isBefore(dayjs(), 'day') &&
                          !['accepted', 'paid', 'submitted'].includes(record.status);
        const daysLeft = dayjs(record.dueDate).diff(dayjs(), 'day');

        return (
          <div>
            <div className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-slate-700'}`}>
              {dayjs(record.dueDate).format('DD.MM.YYYY')}
            </div>
            {!['accepted', 'paid', 'submitted'].includes(record.status) && record.status !== 'draft' && (
              <div className={`text-xs ${isOverdue ? 'text-red-500' : daysLeft <= 7 ? 'text-amber-500' : 'text-slate-500'}`}>
                {isOverdue ? `${Math.abs(daysLeft)} gün gecikmiş` : `${daysLeft} gün kaldı`}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Durum',
      key: 'status',
      width: 130,
      render: (_, record) => {
        const config = statusConfig[record.status];
        return (
          <Tag color={config.color} className="flex items-center gap-1 w-fit">
            {config.icon}
            <span>{config.label}</span>
          </Tag>
        );
      },
    },
    {
      title: '',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setSelectedDeclaration(record);
              setIsDetailModalOpen(true);
            }}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
            title="Detay"
          >
            <EyeIcon className="w-4 h-4 text-slate-500" />
          </button>
          {record.status === 'ready' && (
            <button
              className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
              title="GİB'e Gönder"
            >
              <PaperAirplaneIcon className="w-4 h-4 text-blue-500" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const incomeStatementColumns: ColumnsType<IncomeStatementLine> = [
    {
      title: 'Hesap Kodu',
      dataIndex: 'code',
      key: 'code',
      width: 100,
      render: (value) => <span className="font-mono text-sm">{value}</span>,
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
      render: (value) => <span className="text-sm text-slate-900">{value}</span>,
    },
    {
      title: 'Cari Dönem',
      dataIndex: 'currentPeriod',
      key: 'currentPeriod',
      width: 150,
      align: 'right',
      render: (value) => (
        <span className={`text-sm font-medium ${value >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      title: 'Önceki Dönem',
      dataIndex: 'previousPeriod',
      key: 'previousPeriod',
      width: 150,
      align: 'right',
      render: (value) => (
        <span className={`text-sm ${value >= 0 ? 'text-slate-500' : 'text-red-400'}`}>
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      title: 'Değişim',
      key: 'variance',
      width: 120,
      align: 'right',
      render: (_, record) => (
        <div className="flex items-center justify-end gap-1">
          {record.variance > 0 ? (
            <ArrowTrendingUpIcon className="w-4 h-4 text-emerald-500" />
          ) : record.variance < 0 ? (
            <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
          ) : (
            <MinusCircleIcon className="w-4 h-4 text-slate-400" />
          )}
          <span className={`text-xs ${
            record.variance > 0 ? 'text-emerald-600' : record.variance < 0 ? 'text-red-600' : 'text-slate-400'
          }`}>
            {record.variancePercent > 0 ? '+' : ''}{record.variancePercent.toFixed(1)}%
          </span>
        </div>
      ),
    },
  ];

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const yearOptions = [2023, 2024, 2025].map(year => ({ value: year, label: year.toString() }));

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Page Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
          <CalculatorIcon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Geçici Vergi Beyannamesi</h1>
              <p className="text-sm text-slate-500">Üç aylık geçici kurumlar/gelir vergisi beyannamesi yönetimi</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className="p-2.5 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <ArrowPathIcon className={`w-5 h-5 text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <Link
                href="/finance/tax/provisional/new"
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Yeni Beyanname</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CalendarDaysIcon className="w-5 h-5 text-amber-500" />
            <span className="text-xs text-slate-500">Cari Dönem</span>
          </div>
          <div className="text-xl font-bold text-amber-600">{currentQuarter} 2025</div>
          <div className="text-xs text-slate-500 mt-1">Son tarih: {currentDueDate}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CalculatorIcon className="w-5 h-5 text-blue-500" />
            <span className="text-xs text-slate-500">Hesaplanan Vergi</span>
          </div>
          <div className="text-xl font-bold text-blue-600">{formatCurrency(yearlyTotals.totalTax)}</div>
          <div className="text-xs text-slate-500 mt-1">Yıllık toplam</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <BanknotesIcon className="w-5 h-5 text-emerald-500" />
            <span className="text-xs text-slate-500">Ödenen Vergi</span>
          </div>
          <div className="text-xl font-bold text-emerald-600">{formatCurrency(yearlyTotals.totalPaid)}</div>
          <div className="text-xs text-slate-500 mt-1">Yıllık toplam</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircleIcon className="w-5 h-5 text-purple-500" />
            <span className="text-xs text-slate-500">Vergi Oranı</span>
          </div>
          <div className="text-xl font-bold text-purple-600">%25</div>
          <div className="text-xs text-slate-500 mt-1">Kurumlar Vergisi</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Yıl:</span>
            <Select
              value={selectedYear}
              onChange={(value) => setSelectedYear(value)}
              options={yearOptions}
              className="w-24"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Durum:</span>
            <Select
              placeholder="Tümü"
              allowClear
              value={statusFilter}
              onChange={(value) => setStatusFilter(value)}
              className="w-40"
              options={Object.entries(statusConfig).map(([key, value]) => ({
                value: key,
                label: value.label,
              }))}
            />
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <Tabs
          defaultActiveKey="declarations"
          items={[
            {
              key: 'declarations',
              label: (
                <span className="flex items-center gap-2">
                  <DocumentTextIcon className="w-4 h-4" />
                  Beyannameler
                </span>
              ),
              children: (
                <>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                      <Spin size="large" />
                    </div>
                  ) : mockDeclarations.length === 0 ? (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={<span className="text-slate-500">Beyanname bulunmuyor</span>}
                    />
                  ) : (
                    <Table
                      columns={columns}
                      dataSource={mockDeclarations}
                      rowKey="id"
                      pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Toplam ${total} beyanname`,
                      }}
                      scroll={{ x: 1200 }}
                      className={tableClassName}
                    />
                  )}
                </>
              ),
            },
            {
              key: 'income-statement',
              label: (
                <span className="flex items-center gap-2">
                  <BanknotesIcon className="w-4 h-4" />
                  Gelir Tablosu
                </span>
              ),
              children: (
                <div>
                  <div className="mb-4">
                    <p className="text-sm text-slate-500">
                      2024 Q4 dönemi özet gelir tablosu (TDHP formatında)
                    </p>
                  </div>
                  <Table
                    columns={incomeStatementColumns}
                    dataSource={mockIncomeStatement}
                    rowKey="id"
                    pagination={false}
                    className={tableClassName}
                    summary={() => (
                      <Table.Summary fixed>
                        <Table.Summary.Row className="bg-blue-50">
                          <Table.Summary.Cell index={0}></Table.Summary.Cell>
                          <Table.Summary.Cell index={1}>
                            <span className="font-semibold text-blue-900">Dönem Karı/Zararı</span>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={2} align="right">
                            <span className="font-semibold text-blue-600">{formatCurrency(2300000)}</span>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={3} align="right">
                            <span className="font-semibold text-blue-400">{formatCurrency(2200000)}</span>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={4} align="right">
                            <span className="font-semibold text-emerald-600">+4.55%</span>
                          </Table.Summary.Cell>
                        </Table.Summary.Row>
                      </Table.Summary>
                    )}
                  />
                </div>
              ),
            },
            {
              key: 'tax-calculation',
              label: (
                <span className="flex items-center gap-2">
                  <CalculatorIcon className="w-4 h-4" />
                  Vergi Hesaplama
                </span>
              ),
              children: (
                <div className="space-y-6">
                  <div className="mb-4">
                    <p className="text-sm text-slate-500">
                      2024 Q4 dönemi geçici vergi hesaplaması
                    </p>
                  </div>

                  {/* Tax Calculation Steps */}
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <tbody className="divide-y divide-slate-100">
                        <tr>
                          <td className="p-4 text-sm text-slate-600 w-1/2">Ticari Bilanço Karı</td>
                          <td className="p-4 text-sm font-medium text-right">{formatCurrency(2300000)}</td>
                        </tr>
                        <tr className="bg-slate-50">
                          <td className="p-4 text-sm text-slate-600">Kanunen Kabul Edilmeyen Giderler (+)</td>
                          <td className="p-4 text-sm font-medium text-right text-red-600">+{formatCurrency(150000)}</td>
                        </tr>
                        <tr>
                          <td className="p-4 text-sm text-slate-600">İstisnalar ve İndirimler (-)</td>
                          <td className="p-4 text-sm font-medium text-right text-emerald-600">-{formatCurrency(150000)}</td>
                        </tr>
                        <tr className="bg-slate-50">
                          <td className="p-4 text-sm text-slate-600">Geçmiş Yıl Zararları (-)</td>
                          <td className="p-4 text-sm font-medium text-right text-emerald-600">-{formatCurrency(0)}</td>
                        </tr>
                        <tr className="bg-blue-50">
                          <td className="p-4 text-sm font-semibold text-blue-900">Vergi Matrahı</td>
                          <td className="p-4 text-lg font-bold text-right text-blue-600">{formatCurrency(2300000)}</td>
                        </tr>
                        <tr>
                          <td className="p-4 text-sm text-slate-600">Kurumlar Vergisi Oranı</td>
                          <td className="p-4 text-sm font-medium text-right">%25</td>
                        </tr>
                        <tr className="bg-slate-50">
                          <td className="p-4 text-sm font-semibold text-slate-900">Hesaplanan Geçici Vergi</td>
                          <td className="p-4 text-lg font-bold text-right text-slate-900">{formatCurrency(575000)}</td>
                        </tr>
                        <tr>
                          <td className="p-4 text-sm text-slate-600">Önceki Dönemlerde Ödenen (-)</td>
                          <td className="p-4 text-sm font-medium text-right text-amber-600">-{formatCurrency(425000)}</td>
                        </tr>
                        <tr className="bg-emerald-50">
                          <td className="p-4 text-sm font-semibold text-emerald-900">Ödenecek Geçici Vergi</td>
                          <td className="p-4 text-xl font-bold text-right text-emerald-600">{formatCurrency(150000)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <strong>Geçici Vergi Mahsubu:</strong> Yıllık Kurumlar Vergisi Beyannamesi verildiğinde,
                        yıl içinde ödenen geçici vergiler hesaplanan kurumlar vergisinden mahsup edilir.
                        Fazla ödeme varsa iade alınabilir veya diğer vergi borçlarına mahsup edilebilir.
                      </div>
                    </div>
                  </div>
                </div>
              ),
            },
            {
              key: 'calendar',
              label: (
                <span className="flex items-center gap-2">
                  <CalendarDaysIcon className="w-4 h-4" />
                  Beyanname Takvimi
                </span>
              ),
              children: (
                <div className="space-y-4">
                  <p className="text-sm text-slate-500 mb-4">
                    2025 yılı Geçici Vergi Beyannamesi dönemleri ve son tarihleri
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(quarterConfig).map(([quarter, config]) => {
                      const isCurrentQuarter = quarter === currentQuarter;
                      const isPastQuarter = ['Q4'].includes(quarter) && selectedYear === 2024;

                      return (
                        <div
                          key={quarter}
                          className={`border rounded-lg p-4 ${
                            isPastQuarter
                              ? 'border-emerald-200 bg-emerald-50'
                              : isCurrentQuarter
                              ? 'border-amber-200 bg-amber-50'
                              : 'border-slate-200 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <span className="text-lg font-semibold text-slate-900">{config.label}</span>
                              <div className="text-xs text-slate-500">{config.months}</div>
                            </div>
                            {isPastQuarter && (
                              <CheckCircleIcon className="w-6 h-6 text-emerald-500" />
                            )}
                            {isCurrentQuarter && (
                              <ClockIcon className="w-6 h-6 text-amber-500" />
                            )}
                          </div>
                          <div className="text-sm text-slate-600">
                            <strong>Son Tarih:</strong> {config.dueMonth} {quarter === 'Q4' ? selectedYear + 1 : selectedYear}
                          </div>
                          {isCurrentQuarter && (
                            <div className="mt-3">
                              <Progress
                                percent={35}
                                size="small"
                                strokeColor="#f59e0b"
                                showInfo={false}
                              />
                              <div className="text-xs text-amber-600 mt-1">Dönem devam ediyor</div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                    <h4 className="text-sm font-medium text-slate-900 mb-2">Geçici Vergi Kuralları</h4>
                    <ul className="text-xs text-slate-600 space-y-1">
                      <li>• Geçici vergi üçer aylık dönemler halinde hesaplanır</li>
                      <li>• Beyanname, dönem sonunu takip eden 2. ayın 17'sine kadar verilir</li>
                      <li>• Ödeme, beyanname verme süresinin son günüdür</li>
                      <li>• 4. dönem geçici vergisi takip eden yılın Şubat ayında verilir</li>
                      <li>• Yıllık beyannamede geçici vergiler mahsup edilir</li>
                      <li>• 2024 yılı için Kurumlar Vergisi oranı %25'tir</li>
                    </ul>
                  </div>
                </div>
              ),
            },
          ]}
        />
      </div>

      {/* Detail Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <CalculatorIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <div className="text-lg font-semibold">Geçici Vergi Detayı</div>
              <div className="text-sm text-slate-500">{selectedDeclaration?.period}</div>
            </div>
          </div>
        }
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={null}
        width={700}
      >
        {selectedDeclaration && (
          <div className="space-y-6 mt-6">
            {/* Status */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <div className="text-xs text-slate-500 mb-1">Durum</div>
                <Tag color={statusConfig[selectedDeclaration.status].color} className="flex items-center gap-1 w-fit">
                  {statusConfig[selectedDeclaration.status].icon}
                  <span>{statusConfig[selectedDeclaration.status].label}</span>
                </Tag>
              </div>
              {selectedDeclaration.receiptNumber && (
                <div className="text-right">
                  <div className="text-xs text-slate-500 mb-1">Makbuz No</div>
                  <div className="font-mono text-sm">{selectedDeclaration.receiptNumber}</div>
                </div>
              )}
            </div>

            {/* Income Statement Summary */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                <span className="text-sm font-medium text-slate-700">Gelir Tablosu Özeti</span>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Brüt Satışlar</span>
                  <span className="text-sm font-medium">{formatCurrency(selectedDeclaration.grossRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Satışların Maliyeti</span>
                  <span className="text-sm font-medium text-red-600">-{formatCurrency(selectedDeclaration.costOfSales)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100">
                  <span className="text-sm font-medium text-slate-900">Brüt Kar</span>
                  <span className="text-sm font-medium">{formatCurrency(selectedDeclaration.grossProfit)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Faaliyet Giderleri</span>
                  <span className="text-sm font-medium text-red-600">-{formatCurrency(selectedDeclaration.operatingExpenses)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100">
                  <span className="text-sm font-medium text-slate-900">Faaliyet Karı</span>
                  <span className="text-sm font-medium">{formatCurrency(selectedDeclaration.operatingProfit)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Finansal Gelirler/Giderler (Net)</span>
                  <span className="text-sm font-medium text-red-600">
                    {formatCurrency(selectedDeclaration.financialIncome - selectedDeclaration.financialExpenses)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100 bg-blue-50 -mx-4 px-4 py-2">
                  <span className="text-sm font-semibold text-blue-900">Vergi Öncesi Kar</span>
                  <span className="text-sm font-semibold text-blue-600">{formatCurrency(selectedDeclaration.profitBeforeTax)}</span>
                </div>
              </div>
            </div>

            {/* Tax Calculation */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                <span className="text-sm font-medium text-slate-700">Vergi Hesaplaması</span>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Vergi Matrahı</span>
                  <span className="text-sm font-medium">{formatCurrency(selectedDeclaration.taxableIncome)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Vergi Oranı</span>
                  <span className="text-sm font-medium">{formatPercent(selectedDeclaration.taxRate)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100">
                  <span className="text-sm font-medium text-slate-900">Hesaplanan Vergi</span>
                  <span className="text-sm font-medium text-blue-600">{formatCurrency(selectedDeclaration.calculatedTax)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Önceki Dönem Ödemeleri</span>
                  <span className="text-sm font-medium text-amber-600">-{formatCurrency(selectedDeclaration.previousPeriodTax)}</span>
                </div>
              </div>
            </div>

            {/* Grand Total */}
            <div className="bg-emerald-900 text-white rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Ödenecek Geçici Vergi</span>
                <span className="text-xl font-bold">{formatCurrency(selectedDeclaration.taxPayable)}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
