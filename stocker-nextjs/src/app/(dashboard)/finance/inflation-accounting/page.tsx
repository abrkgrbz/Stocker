'use client';

/**
 * Enflasyon Muhasebesi (Inflation Accounting) Page
 * VUK Geçici 33. Madde - Enflasyon düzeltmesi işlemleri
 * ROFM (Reel Olmayan Finansman Maliyeti) hesaplama
 * Monochrome design system following DESIGN_SYSTEM.md
 */

import React, { useState } from 'react';
import { Table, Select, Tabs, Tag, Progress, Modal, Descriptions, Button, Spin, Empty, Alert, InputNumber } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  DocumentTextIcon,
  ArrowPathIcon,
  CalculatorIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  ScaleIcon,
  DocumentChartBarIcon,
  PlusIcon,
  EyeIcon,
  PencilSquareIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

// Table styles for monochrome design
const tableClassName = "[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50";

// Types
type AdjustmentStatus = 'draft' | 'calculating' | 'completed' | 'approved' | 'posted';
type AccountType = 'monetary' | 'non-monetary';
type AssetCategory = 'fixed-assets' | 'inventory' | 'equity' | 'depreciation' | 'other';

interface InflationIndex {
  id: number;
  year: number;
  month: number;
  yiUfe: number; // Yİ-ÜFE endeksi
  previousMonth: number;
  monthlyChange: number;
  yearlyChange: number;
  cumulativeChange: number;
}

interface InflationAdjustment {
  id: number;
  period: string;
  year: number;
  month: number;
  status: AdjustmentStatus;
  // Indexes
  baseIndex: number;
  currentIndex: number;
  adjustmentCoefficient: number;
  // Summary
  totalAssets: number;
  adjustedAssets: number;
  adjustmentDifference: number;
  // Details
  monetaryAssets: number;
  nonMonetaryAssets: number;
  monetaryLiabilities: number;
  nonMonetaryLiabilities: number;
  // ROFM
  rofmAmount: number;
  // Meta
  calculatedAt?: string;
  approvedAt?: string;
  postedAt?: string;
  createdAt: string;
}

interface AccountAdjustment {
  id: number;
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  category: AssetCategory;
  originalAmount: number;
  acquisitionDate: string;
  baseIndex: number;
  currentIndex: number;
  coefficient: number;
  adjustedAmount: number;
  adjustmentDifference: number;
}

// Status configurations
const statusConfig: Record<AdjustmentStatus, { label: string; color: string; icon: React.ReactNode }> = {
  draft: { label: 'Taslak', color: 'default', icon: <ClockIcon className="w-4 h-4" /> },
  calculating: { label: 'Hesaplanıyor', color: 'processing', icon: <CalculatorIcon className="w-4 h-4" /> },
  completed: { label: 'Tamamlandı', color: 'blue', icon: <CheckCircleIcon className="w-4 h-4" /> },
  approved: { label: 'Onaylandı', color: 'green', icon: <CheckCircleIcon className="w-4 h-4" /> },
  posted: { label: 'Muhasebeleşti', color: 'purple', icon: <DocumentDuplicateIcon className="w-4 h-4" /> },
};

// Category configurations
const categoryConfig: Record<AssetCategory, { label: string; color: string }> = {
  'fixed-assets': { label: 'Duran Varlıklar', color: 'blue' },
  'inventory': { label: 'Stoklar', color: 'green' },
  'equity': { label: 'Özkaynaklar', color: 'purple' },
  'depreciation': { label: 'Amortismanlar', color: 'orange' },
  'other': { label: 'Diğer', color: 'default' },
};

// Month names
const monthNames = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

// Mock Yİ-ÜFE Data (TÜİK)
const mockIndexes: InflationIndex[] = [
  { id: 1, year: 2024, month: 12, yiUfe: 3245.67, previousMonth: 3189.45, monthlyChange: 1.76, yearlyChange: 44.38, cumulativeChange: 2145.67 },
  { id: 2, year: 2024, month: 11, yiUfe: 3189.45, previousMonth: 3134.21, monthlyChange: 1.76, yearlyChange: 46.12, cumulativeChange: 2089.45 },
  { id: 3, year: 2024, month: 10, yiUfe: 3134.21, previousMonth: 3067.89, monthlyChange: 2.16, yearlyChange: 48.45, cumulativeChange: 2034.21 },
  { id: 4, year: 2024, month: 9, yiUfe: 3067.89, previousMonth: 3012.34, monthlyChange: 1.84, yearlyChange: 51.23, cumulativeChange: 1967.89 },
  { id: 5, year: 2024, month: 8, yiUfe: 3012.34, previousMonth: 2945.67, monthlyChange: 2.26, yearlyChange: 52.78, cumulativeChange: 1912.34 },
  { id: 6, year: 2024, month: 7, yiUfe: 2945.67, previousMonth: 2878.90, monthlyChange: 2.32, yearlyChange: 54.12, cumulativeChange: 1845.67 },
  { id: 7, year: 2024, month: 6, yiUfe: 2878.90, previousMonth: 2812.45, monthlyChange: 2.36, yearlyChange: 55.89, cumulativeChange: 1778.90 },
  { id: 8, year: 2024, month: 5, yiUfe: 2812.45, previousMonth: 2756.78, monthlyChange: 2.02, yearlyChange: 57.34, cumulativeChange: 1712.45 },
  { id: 9, year: 2024, month: 4, yiUfe: 2756.78, previousMonth: 2689.12, monthlyChange: 2.52, yearlyChange: 59.67, cumulativeChange: 1656.78 },
  { id: 10, year: 2024, month: 3, yiUfe: 2689.12, previousMonth: 2623.45, monthlyChange: 2.50, yearlyChange: 62.12, cumulativeChange: 1589.12 },
  { id: 11, year: 2024, month: 2, yiUfe: 2623.45, previousMonth: 2567.89, monthlyChange: 2.16, yearlyChange: 64.78, cumulativeChange: 1523.45 },
  { id: 12, year: 2024, month: 1, yiUfe: 2567.89, previousMonth: 2248.94, monthlyChange: 14.19, yearlyChange: 67.45, cumulativeChange: 1467.89 },
];

// Mock Adjustment Data
const mockAdjustments: InflationAdjustment[] = [
  {
    id: 1,
    period: 'Aralık 2024',
    year: 2024,
    month: 12,
    status: 'completed',
    baseIndex: 100,
    currentIndex: 3245.67,
    adjustmentCoefficient: 32.46,
    totalAssets: 15000000,
    adjustedAssets: 48690000,
    adjustmentDifference: 33690000,
    monetaryAssets: 3500000,
    nonMonetaryAssets: 11500000,
    monetaryLiabilities: 2800000,
    nonMonetaryLiabilities: 4200000,
    rofmAmount: 1250000,
    calculatedAt: '2024-12-28T14:30:00',
    createdAt: '2024-12-25T09:00:00',
  },
  {
    id: 2,
    period: 'Kasım 2024',
    year: 2024,
    month: 11,
    status: 'approved',
    baseIndex: 100,
    currentIndex: 3189.45,
    adjustmentCoefficient: 31.89,
    totalAssets: 14500000,
    adjustedAssets: 46240500,
    adjustmentDifference: 31740500,
    monetaryAssets: 3200000,
    nonMonetaryAssets: 11300000,
    monetaryLiabilities: 2600000,
    nonMonetaryLiabilities: 4000000,
    rofmAmount: 1180000,
    calculatedAt: '2024-11-28T15:00:00',
    approvedAt: '2024-11-29T10:00:00',
    createdAt: '2024-11-25T09:00:00',
  },
  {
    id: 3,
    period: 'Ekim 2024',
    year: 2024,
    month: 10,
    status: 'posted',
    baseIndex: 100,
    currentIndex: 3134.21,
    adjustmentCoefficient: 31.34,
    totalAssets: 14200000,
    adjustedAssets: 44503640,
    adjustmentDifference: 30303640,
    monetaryAssets: 3000000,
    nonMonetaryAssets: 11200000,
    monetaryLiabilities: 2500000,
    nonMonetaryLiabilities: 3800000,
    rofmAmount: 1120000,
    calculatedAt: '2024-10-28T14:00:00',
    approvedAt: '2024-10-29T11:00:00',
    postedAt: '2024-10-30T09:00:00',
    createdAt: '2024-10-25T09:00:00',
  },
];

// Mock Account Adjustments
const mockAccountAdjustments: AccountAdjustment[] = [
  {
    id: 1, accountCode: '253', accountName: 'Tesis, Makine ve Cihazlar', accountType: 'non-monetary',
    category: 'fixed-assets', originalAmount: 5000000, acquisitionDate: '2020-01-15',
    baseIndex: 534.12, currentIndex: 3245.67, coefficient: 6.08, adjustedAmount: 30400000, adjustmentDifference: 25400000
  },
  {
    id: 2, accountCode: '254', accountName: 'Taşıtlar', accountType: 'non-monetary',
    category: 'fixed-assets', originalAmount: 2500000, acquisitionDate: '2021-06-20',
    baseIndex: 1023.45, currentIndex: 3245.67, coefficient: 3.17, adjustedAmount: 7925000, adjustmentDifference: 5425000
  },
  {
    id: 3, accountCode: '257', accountName: 'Birikmiş Amortismanlar (-)', accountType: 'non-monetary',
    category: 'depreciation', originalAmount: -1800000, acquisitionDate: '2020-01-15',
    baseIndex: 534.12, currentIndex: 3245.67, coefficient: 6.08, adjustedAmount: -10944000, adjustmentDifference: -9144000
  },
  {
    id: 4, accountCode: '150', accountName: 'İlk Madde ve Malzeme', accountType: 'non-monetary',
    category: 'inventory', originalAmount: 3200000, acquisitionDate: '2024-09-01',
    baseIndex: 3067.89, currentIndex: 3245.67, coefficient: 1.06, adjustedAmount: 3392000, adjustmentDifference: 192000
  },
  {
    id: 5, accountCode: '500', accountName: 'Sermaye', accountType: 'non-monetary',
    category: 'equity', originalAmount: 10000000, acquisitionDate: '2018-05-10',
    baseIndex: 345.67, currentIndex: 3245.67, coefficient: 9.39, adjustedAmount: 93900000, adjustmentDifference: 83900000
  },
];

export default function InflationAccountingPage() {
  const [activeTab, setActiveTab] = useState('adjustments');
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [selectedAdjustment, setSelectedAdjustment] = useState<InflationAdjustment | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [calculatorModalVisible, setCalculatorModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Calculator state
  const [calcOriginalAmount, setCalcOriginalAmount] = useState<number>(0);
  const [calcBaseIndex, setCalcBaseIndex] = useState<number>(100);
  const [calcCurrentIndex, setCalcCurrentIndex] = useState<number>(3245.67);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  const formatNumber = (value: number, decimals: number = 2) => {
    return new Intl.NumberFormat('tr-TR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);
  };

  const calculateAdjustment = () => {
    const coefficient = calcCurrentIndex / calcBaseIndex;
    const adjustedAmount = calcOriginalAmount * coefficient;
    const difference = adjustedAmount - calcOriginalAmount;
    return { coefficient, adjustedAmount, difference };
  };

  // Year options
  const yearOptions = Array.from({ length: 5 }, (_, i) => ({
    value: 2024 - i,
    label: `${2024 - i}`,
  }));

  // Index table columns
  const indexColumns: ColumnsType<InflationIndex> = [
    {
      title: 'Dönem',
      key: 'period',
      render: (_, record) => (
        <span className="text-sm font-medium text-slate-900">
          {monthNames[record.month - 1]} {record.year}
        </span>
      ),
    },
    {
      title: 'Yİ-ÜFE',
      dataIndex: 'yiUfe',
      key: 'yiUfe',
      align: 'right',
      render: (value) => (
        <span className="text-sm font-semibold text-slate-900">{formatNumber(value)}</span>
      ),
    },
    {
      title: 'Aylık Değişim',
      dataIndex: 'monthlyChange',
      key: 'monthlyChange',
      align: 'right',
      render: (value) => (
        <span className={`text-sm font-medium ${value > 0 ? 'text-red-600' : 'text-green-600'}`}>
          {value > 0 ? '+' : ''}{formatNumber(value)}%
        </span>
      ),
    },
    {
      title: 'Yıllık Değişim',
      dataIndex: 'yearlyChange',
      key: 'yearlyChange',
      align: 'right',
      render: (value) => (
        <span className={`text-sm font-medium ${value > 0 ? 'text-red-600' : 'text-green-600'}`}>
          {value > 0 ? '+' : ''}{formatNumber(value)}%
        </span>
      ),
    },
    {
      title: 'Kümülatif (2003=100)',
      dataIndex: 'cumulativeChange',
      key: 'cumulativeChange',
      align: 'right',
      render: (value) => (
        <span className="text-sm text-slate-600">{formatNumber(value)}%</span>
      ),
    },
  ];

  // Adjustment table columns
  const adjustmentColumns: ColumnsType<InflationAdjustment> = [
    {
      title: 'Dönem',
      key: 'period',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <CalendarDaysIcon className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-900">{record.period}</div>
            <div className="text-xs text-slate-500">Düzeltme Katsayısı: {formatNumber(record.adjustmentCoefficient)}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Orijinal Tutar',
      dataIndex: 'totalAssets',
      key: 'totalAssets',
      align: 'right',
      render: (value) => (
        <span className="text-sm text-slate-600">{formatCurrency(value)}</span>
      ),
    },
    {
      title: 'Düzeltilmiş Tutar',
      dataIndex: 'adjustedAssets',
      key: 'adjustedAssets',
      align: 'right',
      render: (value) => (
        <span className="text-sm font-semibold text-slate-900">{formatCurrency(value)}</span>
      ),
    },
    {
      title: 'Düzeltme Farkı',
      dataIndex: 'adjustmentDifference',
      key: 'adjustmentDifference',
      align: 'right',
      render: (value) => (
        <span className={`text-sm font-medium ${value > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {value > 0 ? '+' : ''}{formatCurrency(value)}
        </span>
      ),
    },
    {
      title: 'ROFM',
      dataIndex: 'rofmAmount',
      key: 'rofmAmount',
      align: 'right',
      render: (value) => (
        <span className="text-sm text-orange-600 font-medium">{formatCurrency(value)}</span>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const config = statusConfig[status as AdjustmentStatus];
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <div className="flex items-center gap-1">
          <Button
            type="text"
            size="small"
            icon={<EyeIcon className="w-4 h-4" />}
            onClick={() => {
              setSelectedAdjustment(record);
              setDetailModalVisible(true);
            }}
            className="!text-slate-600 hover:!text-slate-900"
          />
          {record.status === 'draft' && (
            <Button
              type="text"
              size="small"
              icon={<PencilSquareIcon className="w-4 h-4" />}
              className="!text-slate-600 hover:!text-slate-900"
            />
          )}
        </div>
      ),
    },
  ];

  // Account adjustment columns
  const accountColumns: ColumnsType<AccountAdjustment> = [
    {
      title: 'Hesap',
      key: 'account',
      render: (_, record) => (
        <div>
          <div className="text-sm font-medium text-slate-900">{record.accountCode} - {record.accountName}</div>
          <div className="flex items-center gap-2 mt-1">
            <Tag color={categoryConfig[record.category].color} className="!text-xs">
              {categoryConfig[record.category].label}
            </Tag>
            <span className="text-xs text-slate-500">
              {record.accountType === 'monetary' ? 'Parasal' : 'Parasal Olmayan'}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: 'Edinim Tarihi',
      dataIndex: 'acquisitionDate',
      key: 'acquisitionDate',
      render: (date) => (
        <span className="text-sm text-slate-600">{dayjs(date).format('DD MMM YYYY')}</span>
      ),
    },
    {
      title: 'Orijinal Tutar',
      dataIndex: 'originalAmount',
      key: 'originalAmount',
      align: 'right',
      render: (value) => (
        <span className="text-sm text-slate-600">{formatCurrency(value)}</span>
      ),
    },
    {
      title: 'Katsayı',
      dataIndex: 'coefficient',
      key: 'coefficient',
      align: 'center',
      render: (value) => (
        <span className="text-sm font-medium text-slate-900">{formatNumber(value)}</span>
      ),
    },
    {
      title: 'Düzeltilmiş Tutar',
      dataIndex: 'adjustedAmount',
      key: 'adjustedAmount',
      align: 'right',
      render: (value) => (
        <span className="text-sm font-semibold text-slate-900">{formatCurrency(value)}</span>
      ),
    },
    {
      title: 'Fark',
      dataIndex: 'adjustmentDifference',
      key: 'adjustmentDifference',
      align: 'right',
      render: (value) => (
        <span className={`text-sm font-medium ${value > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {value > 0 ? '+' : ''}{formatCurrency(value)}
        </span>
      ),
    },
  ];

  // Get latest index
  const latestIndex = mockIndexes[0];
  const latestAdjustment = mockAdjustments[0];

  // Tab items
  const tabItems = [
    {
      key: 'adjustments',
      label: (
        <span className="flex items-center gap-2">
          <DocumentChartBarIcon className="w-4 h-4" />
          Enflasyon Düzeltmeleri
        </span>
      ),
      children: (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Select
                value={selectedYear}
                onChange={setSelectedYear}
                options={yearOptions}
                className="w-32 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
              />
            </div>
            <Button
              type="primary"
              icon={<PlusIcon className="w-4 h-4" />}
              className="!bg-slate-900 hover:!bg-slate-800"
            >
              Yeni Düzeltme
            </Button>
          </div>

          {/* Table */}
          <Table
            columns={adjustmentColumns}
            dataSource={mockAdjustments}
            rowKey="id"
            pagination={false}
            className={tableClassName}
          />
        </div>
      ),
    },
    {
      key: 'accounts',
      label: (
        <span className="flex items-center gap-2">
          <ScaleIcon className="w-4 h-4" />
          Hesap Detayları
        </span>
      ),
      children: (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="text-xs font-medium text-blue-600 uppercase tracking-wider">Duran Varlıklar</div>
              <div className="text-xl font-bold text-blue-900 mt-1">
                {formatCurrency(mockAccountAdjustments.filter(a => a.category === 'fixed-assets').reduce((sum, a) => sum + a.adjustedAmount, 0))}
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="text-xs font-medium text-green-600 uppercase tracking-wider">Stoklar</div>
              <div className="text-xl font-bold text-green-900 mt-1">
                {formatCurrency(mockAccountAdjustments.filter(a => a.category === 'inventory').reduce((sum, a) => sum + a.adjustedAmount, 0))}
              </div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <div className="text-xs font-medium text-purple-600 uppercase tracking-wider">Özkaynaklar</div>
              <div className="text-xl font-bold text-purple-900 mt-1">
                {formatCurrency(mockAccountAdjustments.filter(a => a.category === 'equity').reduce((sum, a) => sum + a.adjustedAmount, 0))}
              </div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <div className="text-xs font-medium text-orange-600 uppercase tracking-wider">Amortismanlar</div>
              <div className="text-xl font-bold text-orange-900 mt-1">
                {formatCurrency(mockAccountAdjustments.filter(a => a.category === 'depreciation').reduce((sum, a) => sum + a.adjustedAmount, 0))}
              </div>
            </div>
          </div>

          {/* Account Table */}
          <Table
            columns={accountColumns}
            dataSource={mockAccountAdjustments}
            rowKey="id"
            pagination={false}
            className={tableClassName}
          />
        </div>
      ),
    },
    {
      key: 'indexes',
      label: (
        <span className="flex items-center gap-2">
          <ChartBarIcon className="w-4 h-4" />
          Yİ-ÜFE Endeksleri
        </span>
      ),
      children: (
        <div className="space-y-6">
          {/* Index Info */}
          <Alert
            type="info"
            showIcon
            message="TÜİK Yİ-ÜFE Endeksi"
            description="Yurt İçi Üretici Fiyat Endeksi (Yİ-ÜFE), enflasyon düzeltmesinde kullanılan resmi endekstir. Veriler TÜİK'ten alınmaktadır."
            className="!border-blue-200 !bg-blue-50"
          />

          {/* Latest Index Card */}
          <div className="bg-slate-900 text-white rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-400">Güncel Yİ-ÜFE Endeksi</div>
                <div className="text-3xl font-bold mt-1">{formatNumber(latestIndex.yiUfe)}</div>
                <div className="text-sm text-slate-400 mt-1">{monthNames[latestIndex.month - 1]} {latestIndex.year}</div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="text-xs text-slate-400">Aylık</div>
                    <div className={`text-lg font-semibold ${latestIndex.monthlyChange > 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {latestIndex.monthlyChange > 0 ? '+' : ''}{formatNumber(latestIndex.monthlyChange)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Yıllık</div>
                    <div className={`text-lg font-semibold ${latestIndex.yearlyChange > 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {latestIndex.yearlyChange > 0 ? '+' : ''}{formatNumber(latestIndex.yearlyChange)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Index Table */}
          <Table
            columns={indexColumns}
            dataSource={mockIndexes}
            rowKey="id"
            pagination={false}
            className={tableClassName}
          />
        </div>
      ),
    },
    {
      key: 'calculator',
      label: (
        <span className="flex items-center gap-2">
          <CalculatorIcon className="w-4 h-4" />
          Düzeltme Hesaplayıcı
        </span>
      ),
      children: (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
            <h3 className="text-lg font-semibold text-slate-900">Enflasyon Düzeltme Hesaplayıcı</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Orijinal Tutar (TL)</label>
                <InputNumber<number>
                  value={calcOriginalAmount}
                  onChange={(value) => setCalcOriginalAmount(value || 0)}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => Number(value?.replace(/,/g, '') || 0)}
                  className="w-full [&_.ant-input-number-input]:!text-right"
                  size="large"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Edinim Tarihi Endeksi</label>
                <InputNumber<number>
                  value={calcBaseIndex}
                  onChange={(value) => setCalcBaseIndex(value || 100)}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => Number(value?.replace(/,/g, '') || 0)}
                  className="w-full [&_.ant-input-number-input]:!text-right"
                  size="large"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Güncel Endeks (Yİ-ÜFE)</label>
                <InputNumber<number>
                  value={calcCurrentIndex}
                  onChange={(value) => setCalcCurrentIndex(value || 3245.67)}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => Number(value?.replace(/,/g, '') || 0)}
                  className="w-full [&_.ant-input-number-input]:!text-right"
                  size="large"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Düzeltme Katsayısı</label>
                <div className="h-10 flex items-center justify-end text-xl font-bold text-slate-900">
                  {formatNumber(calculateAdjustment().coefficient)}
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="border-t border-slate-200 pt-6 space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-600">Orijinal Tutar</span>
                <span className="text-lg font-semibold text-slate-900">{formatCurrency(calcOriginalAmount)}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <span className="text-sm text-green-700">Düzeltilmiş Tutar</span>
                <span className="text-xl font-bold text-green-700">{formatCurrency(calculateAdjustment().adjustedAmount)}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <span className="text-sm text-blue-700">Düzeltme Farkı</span>
                <span className="text-lg font-semibold text-blue-700">+{formatCurrency(calculateAdjustment().difference)}</span>
              </div>
            </div>

            {/* Formula */}
            <div className="bg-slate-100 rounded-lg p-4">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Formül</div>
              <div className="text-sm text-slate-700 font-mono">
                Düzeltilmiş Tutar = Orijinal Tutar × (Güncel Endeks ÷ Edinim Tarihi Endeksi)
              </div>
              <div className="text-sm text-slate-500 mt-2">
                {formatCurrency(calcOriginalAmount)} × ({formatNumber(calcCurrentIndex)} ÷ {formatNumber(calcBaseIndex)}) = {formatCurrency(calculateAdjustment().adjustedAmount)}
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Page Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
          <ArrowTrendingUpIcon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Enflasyon Muhasebesi</h1>
              <p className="text-sm text-slate-500">VUK Geçici 33. Madde - Enflasyon Düzeltmesi ve ROFM Hesaplaması</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                icon={<CalculatorIcon className="w-4 h-4" />}
                onClick={() => setCalculatorModalVisible(true)}
                className="!border-slate-300 !text-slate-700 hover:!border-slate-400"
              >
                Hızlı Hesaplama
              </Button>
              <Button
                icon={<ArrowPathIcon className="w-4 h-4" />}
                className="!border-slate-300 !text-slate-700 hover:!border-slate-400"
              >
                Endeks Güncelle
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <Alert
        type="warning"
        showIcon
        icon={<ExclamationTriangleIcon className="w-5 h-5" />}
        message="Enflasyon Düzeltmesi Hakkında"
        description={
          <div className="text-sm">
            <p className="mb-2">
              VUK Geçici Madde 33 uyarınca, 2024 yılı için enflasyon düzeltmesi zorunludur.
              Parasal olmayan kıymetler, edinim tarihi endeksi ile güncel Yİ-ÜFE endeksi oranında düzeltilir.
            </p>
            <p>
              <strong>ROFM (Reel Olmayan Finansman Maliyeti):</strong> Borçlanma maliyetlerinin enflasyondan arındırılmış kısmıdır.
            </p>
          </div>
        }
        className="mb-8 !border-amber-200 !bg-amber-50"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <ChartBarIcon className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{formatNumber(latestIndex.yiUfe)}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Güncel Yİ-ÜFE</div>
          <div className="text-xs text-slate-400 mt-1">{monthNames[latestIndex.month - 1]} {latestIndex.year}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <ArrowTrendingUpIcon className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-red-600">%{formatNumber(latestIndex.yearlyChange)}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Yıllık Enflasyon</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{formatCurrency(latestAdjustment.adjustmentDifference)}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Son Düzeltme Farkı</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <ScaleIcon className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-orange-600">{formatCurrency(latestAdjustment.rofmAmount)}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">ROFM Tutarı</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          className="[&_.ant-tabs-nav]:!mb-6"
        />
      </div>

      {/* Help Section */}
      <div className="mt-8 bg-white border border-slate-200 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Enflasyon Muhasebesi Rehberi</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-2">Parasal Olmayan Kıymetler</h4>
            <ul className="text-xs text-slate-500 space-y-1">
              <li>• Duran varlıklar (maddi, maddi olmayan)</li>
              <li>• Stoklar</li>
              <li>• Özkaynaklar (sermaye, yedekler)</li>
              <li>• Birikmiş amortismanlar</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-2">Parasal Kıymetler (Düzeltilmez)</h4>
            <ul className="text-xs text-slate-500 space-y-1">
              <li>• Kasa ve banka hesapları</li>
              <li>• Alacaklar ve borçlar</li>
              <li>• Finansal yatırımlar</li>
              <li>• Verilen/alınan avanslar</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-2">Düzeltme Hesaplama</h4>
            <ul className="text-xs text-slate-500 space-y-1">
              <li>• Düzeltme Katsayısı = Güncel Endeks ÷ Edinim Endeksi</li>
              <li>• Düzeltilmiş Tutar = Orijinal × Katsayı</li>
              <li>• Düzeltme Farkı 698 hesaba kaydedilir</li>
              <li>• ROFM gider yazılabilir (ihtiyari)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <DocumentChartBarIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <div className="text-lg font-semibold">Düzeltme Detayı</div>
              <div className="text-sm text-slate-500">{selectedAdjustment?.period}</div>
            </div>
          </div>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedAdjustment && (
          <div className="space-y-6 mt-4">
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Dönem">{selectedAdjustment.period}</Descriptions.Item>
              <Descriptions.Item label="Durum">
                <Tag color={statusConfig[selectedAdjustment.status].color}>
                  {statusConfig[selectedAdjustment.status].label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Baz Endeks">{formatNumber(selectedAdjustment.baseIndex)}</Descriptions.Item>
              <Descriptions.Item label="Güncel Endeks">{formatNumber(selectedAdjustment.currentIndex)}</Descriptions.Item>
              <Descriptions.Item label="Düzeltme Katsayısı" span={2}>
                <span className="text-lg font-bold text-slate-900">{formatNumber(selectedAdjustment.adjustmentCoefficient)}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Orijinal Tutar">{formatCurrency(selectedAdjustment.totalAssets)}</Descriptions.Item>
              <Descriptions.Item label="Düzeltilmiş Tutar">{formatCurrency(selectedAdjustment.adjustedAssets)}</Descriptions.Item>
              <Descriptions.Item label="Düzeltme Farkı" span={2}>
                <span className="text-lg font-bold text-green-600">+{formatCurrency(selectedAdjustment.adjustmentDifference)}</span>
              </Descriptions.Item>
              <Descriptions.Item label="ROFM Tutarı" span={2}>
                <span className="text-lg font-bold text-orange-600">{formatCurrency(selectedAdjustment.rofmAmount)}</span>
              </Descriptions.Item>
            </Descriptions>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-slate-700 mb-3">Varlıklar</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Parasal Varlıklar:</span>
                    <span className="font-medium">{formatCurrency(selectedAdjustment.monetaryAssets)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Parasal Olmayan:</span>
                    <span className="font-medium">{formatCurrency(selectedAdjustment.nonMonetaryAssets)}</span>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-slate-700 mb-3">Yükümlülükler</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Parasal Borçlar:</span>
                    <span className="font-medium">{formatCurrency(selectedAdjustment.monetaryLiabilities)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Parasal Olmayan:</span>
                    <span className="font-medium">{formatCurrency(selectedAdjustment.nonMonetaryLiabilities)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
