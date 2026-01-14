'use client';

/**
 * Depreciation Page (Amortisman)
 * VUK ve TFRS uyumlu amortisman yönetimi
 * Monochrome design system following DESIGN_SYSTEM.md
 */

import React, { useState } from 'react';
import { Table, Select, Spin, Empty, Progress, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  CalculatorIcon,
  ArrowPathIcon,
  DocumentChartBarIcon,
  CalendarIcon,
  BuildingOffice2Icon,
  TruckIcon,
  ComputerDesktopIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

// Table styles for monochrome design
const tableClassName = "[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50";

// Types
type IconType = React.FC<React.SVGProps<SVGSVGElement>>;

interface FixedAsset {
  id: number;
  assetCode: string;
  assetName: string;
  category: string;
  categoryIcon: IconType;
  acquisitionDate: string;
  acquisitionCost: number;
  usefulLife: number;
  depreciationMethod: 'linear' | 'declining' | 'units';
  accumulatedDepreciation: number;
  netBookValue: number;
  yearlyDepreciation: number;
  monthlyDepreciation: number;
  depreciationRate: number;
  status: 'active' | 'fully_depreciated' | 'disposed';
}

// Category icons
const categoryIcons: Record<string, IconType> = {
  'Binalar': BuildingOffice2Icon,
  'Taşıtlar': TruckIcon,
  'Demirbaşlar': ComputerDesktopIcon,
  'Makine ve Teçhizat': WrenchScrewdriverIcon,
};

// Depreciation method labels
const methodLabels: Record<string, string> = {
  linear: 'Normal (Eşit Paylar)',
  declining: 'Azalan Bakiyeler',
  units: 'Üretim Miktarı',
};

// Status configurations
const statusConfig = {
  active: { label: 'Aktif', color: 'green' },
  fully_depreciated: { label: 'Tam Amortisman', color: 'blue' },
  disposed: { label: 'Elden Çıkarılmış', color: 'default' },
};

// Mock data
const mockAssets: FixedAsset[] = [
  {
    id: 1,
    assetCode: 'BIN-001',
    assetName: 'Merkez Ofis Binası',
    category: 'Binalar',
    categoryIcon: BuildingOffice2Icon,
    acquisitionDate: '2020-01-15',
    acquisitionCost: 5000000,
    usefulLife: 50,
    depreciationMethod: 'linear',
    accumulatedDepreciation: 500000,
    netBookValue: 4500000,
    yearlyDepreciation: 100000,
    monthlyDepreciation: 8333.33,
    depreciationRate: 2,
    status: 'active',
  },
  {
    id: 2,
    assetCode: 'TAS-001',
    assetName: 'Ford Transit Van',
    category: 'Taşıtlar',
    categoryIcon: TruckIcon,
    acquisitionDate: '2022-06-01',
    acquisitionCost: 850000,
    usefulLife: 5,
    depreciationMethod: 'linear',
    accumulatedDepreciation: 425000,
    netBookValue: 425000,
    yearlyDepreciation: 170000,
    monthlyDepreciation: 14166.67,
    depreciationRate: 20,
    status: 'active',
  },
  {
    id: 3,
    assetCode: 'DMB-001',
    assetName: 'Sunucu Sistemi',
    category: 'Demirbaşlar',
    categoryIcon: ComputerDesktopIcon,
    acquisitionDate: '2021-03-15',
    acquisitionCost: 250000,
    usefulLife: 4,
    depreciationMethod: 'declining',
    accumulatedDepreciation: 234375,
    netBookValue: 15625,
    yearlyDepreciation: 62500,
    monthlyDepreciation: 5208.33,
    depreciationRate: 50,
    status: 'active',
  },
  {
    id: 4,
    assetCode: 'MAK-001',
    assetName: 'CNC Torna Tezgahı',
    category: 'Makine ve Teçhizat',
    categoryIcon: WrenchScrewdriverIcon,
    acquisitionDate: '2019-09-01',
    acquisitionCost: 1200000,
    usefulLife: 10,
    depreciationMethod: 'linear',
    accumulatedDepreciation: 640000,
    netBookValue: 560000,
    yearlyDepreciation: 120000,
    monthlyDepreciation: 10000,
    depreciationRate: 10,
    status: 'active',
  },
  {
    id: 5,
    assetCode: 'DMB-002',
    assetName: 'Ofis Mobilyaları',
    category: 'Demirbaşlar',
    categoryIcon: ComputerDesktopIcon,
    acquisitionDate: '2018-01-01',
    acquisitionCost: 120000,
    usefulLife: 5,
    depreciationMethod: 'linear',
    accumulatedDepreciation: 120000,
    netBookValue: 0,
    yearlyDepreciation: 0,
    monthlyDepreciation: 0,
    depreciationRate: 20,
    status: 'fully_depreciated',
  },
];

export default function DepreciationPage() {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [isLoading, setIsLoading] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  // Generate year options
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => ({
    value: currentYear - i,
    label: `${currentYear - i}`,
  }));

  // Calculate totals
  const totals = mockAssets.reduce(
    (acc, asset) => {
      acc.acquisitionCost += asset.acquisitionCost;
      acc.accumulatedDepreciation += asset.accumulatedDepreciation;
      acc.netBookValue += asset.netBookValue;
      acc.yearlyDepreciation += asset.yearlyDepreciation;
      return acc;
    },
    { acquisitionCost: 0, accumulatedDepreciation: 0, netBookValue: 0, yearlyDepreciation: 0 }
  );

  const columns: ColumnsType<FixedAsset> = [
    {
      title: 'Varlık',
      key: 'asset',
      fixed: 'left',
      width: 250,
      render: (_, record) => {
        const Icon = record.categoryIcon;
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <Icon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-900">{record.assetName}</div>
              <div className="text-xs text-slate-500">{record.assetCode} • {record.category}</div>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Edinim',
      key: 'acquisition',
      width: 150,
      render: (_, record) => (
        <div>
          <div className="text-sm font-medium text-slate-900">{formatCurrency(record.acquisitionCost)}</div>
          <div className="text-xs text-slate-500">{dayjs(record.acquisitionDate).format('DD.MM.YYYY')}</div>
        </div>
      ),
    },
    {
      title: 'Yöntem',
      key: 'method',
      width: 140,
      render: (_, record) => (
        <div>
          <div className="text-xs text-slate-600">{methodLabels[record.depreciationMethod]}</div>
          <div className="text-xs text-slate-500">%{record.depreciationRate} • {record.usefulLife} yıl</div>
        </div>
      ),
    },
    {
      title: 'Birikmiş Amortisman',
      key: 'accumulated',
      width: 160,
      align: 'right',
      render: (_, record) => {
        const percentage = (record.accumulatedDepreciation / record.acquisitionCost) * 100;
        return (
          <div>
            <div className="text-sm font-medium text-slate-900">{formatCurrency(record.accumulatedDepreciation)}</div>
            <Progress
              percent={percentage}
              size="small"
              showInfo={false}
              strokeColor="#475569"
              className="mt-1"
            />
          </div>
        );
      },
    },
    {
      title: 'Net Defter Değeri',
      dataIndex: 'netBookValue',
      key: 'netBookValue',
      width: 140,
      align: 'right',
      render: (value) => (
        <span className={`text-sm font-semibold ${value > 0 ? 'text-slate-900' : 'text-slate-400'}`}>
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      title: 'Yıllık Amortisman',
      dataIndex: 'yearlyDepreciation',
      key: 'yearlyDepreciation',
      width: 130,
      align: 'right',
      render: (value) => (
        <span className="text-sm text-blue-600">{formatCurrency(value)}</span>
      ),
    },
    {
      title: 'Durum',
      key: 'status',
      width: 120,
      render: (_, record) => {
        const config = statusConfig[record.status];
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
  ];

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  // Group by category for summary
  const categoryTotals = mockAssets.reduce((acc, asset) => {
    if (!acc[asset.category]) {
      acc[asset.category] = { count: 0, netBookValue: 0, yearlyDepreciation: 0, icon: asset.categoryIcon };
    }
    acc[asset.category].count += 1;
    acc[asset.category].netBookValue += asset.netBookValue;
    acc[asset.category].yearlyDepreciation += asset.yearlyDepreciation;
    return acc;
  }, {} as Record<string, { count: number; netBookValue: number; yearlyDepreciation: number; icon: IconType }>);

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
              <h1 className="text-2xl font-bold text-slate-900">Amortisman Yönetimi</h1>
              <p className="text-sm text-slate-500">VUK ve TFRS uyumlu duran varlık amortismanları</p>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={selectedYear}
                onChange={(value) => setSelectedYear(value)}
                options={yearOptions}
                size="large"
                className="w-28 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
              />
              <button
                onClick={handleRefresh}
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
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="text-xs text-slate-500 mb-1">Toplam Maliyet</div>
              <div className="text-xl font-bold text-slate-900">{formatCurrency(totals.acquisitionCost)}</div>
              <div className="text-xs text-slate-500 mt-1">{mockAssets.length} varlık</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="text-xs text-slate-500 mb-1">Birikmiş Amortisman</div>
              <div className="text-xl font-bold text-red-600">{formatCurrency(totals.accumulatedDepreciation)}</div>
              <div className="text-xs text-slate-500 mt-1">
                %{((totals.accumulatedDepreciation / totals.acquisitionCost) * 100).toFixed(1)} itfa
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="text-xs text-slate-500 mb-1">Net Defter Değeri</div>
              <div className="text-xl font-bold text-emerald-600">{formatCurrency(totals.netBookValue)}</div>
              <div className="text-xs text-slate-500 mt-1">aktif değer</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="text-xs text-slate-500 mb-1">{selectedYear} Yılı Amortisman</div>
              <div className="text-xl font-bold text-blue-600">{formatCurrency(totals.yearlyDepreciation)}</div>
              <div className="text-xs text-slate-500 mt-1">yıllık gider</div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <DocumentChartBarIcon className="w-4 h-4 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Kategori Bazında Özet</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(categoryTotals).map(([category, data]) => {
                const Icon = data.icon;
                return (
                  <div key={category} className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className="w-5 h-5 text-slate-600" />
                      <span className="text-sm font-medium text-slate-900">{category}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs text-slate-500">Varlık Sayısı</span>
                        <span className="text-xs font-medium text-slate-700">{data.count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-slate-500">Net Değer</span>
                        <span className="text-xs font-medium text-slate-700">{formatCurrency(data.netBookValue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-slate-500">Yıllık Amor.</span>
                        <span className="text-xs font-medium text-blue-600">{formatCurrency(data.yearlyDepreciation)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Assets Table */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <CalendarIcon className="w-4 h-4 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Duran Varlık Listesi</h3>
            </div>

            {mockAssets.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={<span className="text-slate-500">Duran varlık bulunmuyor</span>}
              />
            ) : (
              <Table
                columns={columns}
                dataSource={mockAssets}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Toplam ${total} varlık`,
                }}
                scroll={{ x: 1300 }}
                className={tableClassName}
              />
            )}
          </div>

          {/* Info Section */}
          <div className="mt-8 bg-slate-100 border border-slate-200 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Amortisman Yöntemleri</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600">
              <div>
                <h4 className="font-medium text-slate-800 mb-2">Normal (Eşit Paylar)</h4>
                <p>
                  VUK madde 315&apos;e göre en yaygın kullanılan yöntem. Maliyet bedeli,
                  faydalı ömre bölünerek her yıl eşit tutarda gider kaydedilir.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-slate-800 mb-2">Azalan Bakiyeler</h4>
                <p>
                  VUK madde 315/b&apos;ye göre, normal amortisman oranının 2 katı uygulanır.
                  İlk yıllarda daha yüksek gider kaydedilir.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-slate-800 mb-2">Üretim Miktarı</h4>
                <p>
                  Üretim adetine göre amortisman hesaplanır. Makine ve ekipman için
                  kullanım yoğunluğuna göre daha adil bir dağılım sağlar.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
