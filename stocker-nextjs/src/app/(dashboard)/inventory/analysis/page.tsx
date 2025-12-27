'use client';

import React, { useState, useMemo } from 'react';
import {
  Table,
  Tag,
  Button,
  Space,
  Select,
  Tabs,
  Progress,
  Tooltip,
  Badge,
  Alert,
  Spin,
  Empty,
} from 'antd';
import {
  ArrowPathIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  ChartPieIcon,
  CurrencyDollarIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import type { ColumnsType } from 'antd/es/table';
import {
  useAbcXyzAnalysis,
  useInventoryTurnoverAnalysis,
  useDeadStockAnalysis,
  useInventoryHealthScore,
  useCategories,
  useWarehouses,
  useBrands,
} from '@/lib/api/hooks/useInventory';
import type {
  AbcXyzAnalysisSummaryDto,
  ProductAbcXyzDto,
  AbcXyzMatrixCellDto,
  InventoryTurnoverDto,
  DeadStockItemDto,
  InventoryHealthScoreDto,
  AbcClass,
  XyzClass,
  AbcXyzClass,
} from '@/lib/api/services/inventory.types';

// Monochrome color palette for charts
const MONOCHROME_COLORS = ['#1e293b', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0', '#f1f5f9'];

// ABC/XYZ class color helpers - monochrome slate palette
const getAbcColor = (abcClass: AbcClass) => {
  switch (abcClass) {
    case 'A': return '#1e293b';
    case 'B': return '#475569';
    case 'C': return '#94a3b8';
    default: return '#cbd5e1';
  }
};

const getXyzColor = (xyzClass: XyzClass) => {
  switch (xyzClass) {
    case 'X': return '#1e293b';
    case 'Y': return '#64748b';
    case 'Z': return '#94a3b8';
    default: return '#cbd5e1';
  }
};

const getMatrixCellColor = (combinedClass: AbcXyzClass) => {
  const colorMap: Record<AbcXyzClass, string> = {
    AX: '#1e293b',
    AY: '#334155',
    AZ: '#475569',
    BX: '#475569',
    BY: '#64748b',
    BZ: '#94a3b8',
    CX: '#64748b',
    CY: '#94a3b8',
    CZ: '#cbd5e1',
  };
  return colorMap[combinedClass] || '#e2e8f0';
};

const getPriorityBadge = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case 'critical':
    case 'yüksek':
    case 'high':
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-900 text-white">{priority}</span>;
    case 'medium':
    case 'orta':
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-500 text-white">{priority}</span>;
    case 'low':
    case 'düşük':
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-300 text-slate-700">{priority}</span>;
    default:
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-200 text-slate-600">{priority}</span>;
  }
};

const getHealthScoreColor = (score: number) => {
  if (score >= 80) return '#1e293b';
  if (score >= 60) return '#475569';
  if (score >= 40) return '#64748b';
  return '#94a3b8';
};

const getTrendIcon = (trend: string) => {
  switch (trend?.toLowerCase()) {
    case 'improving':
    case 'up':
      return <ArrowTrendingUpIcon className="w-4 h-4 text-slate-700" />;
    case 'declining':
    case 'down':
      return <FallOutlined className="text-slate-400" />;
    default:
      return <span className="text-slate-400">→</span>;
  }
};

// Helper functions
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(value || 0);
};

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('tr-TR').format(value || 0);
};

export default function InventoryAnalysisPage() {
  const [activeTab, setActiveTab] = useState('abcxyz');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>();
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | undefined>();
  const [selectedBrandId, setSelectedBrandId] = useState<number | undefined>();
  const [analysisPeriodDays, setAnalysisPeriodDays] = useState(365);

  // Base data queries
  const { data: categories } = useCategories();
  const { data: warehouses } = useWarehouses();
  const { data: brands } = useBrands();

  // Analysis queries
  const abcXyzFilter = {
    categoryId: selectedCategoryId,
    warehouseId: selectedWarehouseId,
    brandId: selectedBrandId,
    analysisPeriodDays,
  };

  const { data: abcXyzData, isLoading: abcXyzLoading, refetch: refetchAbcXyz } = useAbcXyzAnalysis(abcXyzFilter);
  const { data: turnoverData, isLoading: turnoverLoading } = useInventoryTurnoverAnalysis({
    categoryId: selectedCategoryId,
    warehouseId: selectedWarehouseId,
    analysisPeriodDays,
  });
  const { data: deadStockData, isLoading: deadStockLoading } = useDeadStockAnalysis({
    categoryId: selectedCategoryId,
    warehouseId: selectedWarehouseId,
  });
  const { data: healthScore, isLoading: healthLoading, refetch: refetchHealth } = useInventoryHealthScore({
    warehouseId: selectedWarehouseId,
    categoryId: selectedCategoryId,
  });

  // ABC/XYZ Matrix Component
  const AbcXyzMatrix = ({ matrix }: { matrix: AbcXyzMatrixCellDto[] }) => {
    const matrixMap = useMemo(() => {
      const map: Record<string, AbcXyzMatrixCellDto> = {};
      matrix?.forEach((cell) => {
        map[cell.combinedClass] = cell;
      });
      return map;
    }, [matrix]);

    const renderCell = (abcClass: 'A' | 'B' | 'C', xyzClass: 'X' | 'Y' | 'Z') => {
      const combinedClass = `${abcClass}${xyzClass}` as AbcXyzClass;
      const cell = matrixMap[combinedClass];
      if (!cell) return null;

      return (
        <Tooltip
          title={
            <div className="text-sm">
              <p><span className="font-semibold">Strateji:</span> {cell.recommendedStrategy}</p>
              <p><span className="font-semibold">Öncelik:</span> {cell.managementPriority}</p>
              <p><span className="font-semibold">Toplam Gelir:</span> {formatCurrency(cell.totalRevenue)}</p>
              <p><span className="font-semibold">Stok Değeri:</span> {formatCurrency(cell.totalStockValue)}</p>
            </div>
          }
        >
          <div
            className="p-4 rounded-lg text-center text-white cursor-pointer transition-transform hover:scale-[1.02] min-h-[100px] flex flex-col justify-center"
            style={{ backgroundColor: getMatrixCellColor(combinedClass) }}
          >
            <span className="font-bold text-lg">{combinedClass}</span>
            <span className="text-sm">{cell.productCount} ürün</span>
            <span className="text-xs opacity-80">%{cell.productPercentage?.toFixed(1)}</span>
          </div>
        </Tooltip>
      );
    };

    return (
      <div className="p-4">
        <div className="grid grid-cols-4 gap-2 mb-2">
          <div></div>
          <div className="text-center">
            <span className="inline-block px-3 py-1 bg-slate-900 text-white text-xs font-medium rounded">X - Stabil</span>
          </div>
          <div className="text-center">
            <span className="inline-block px-3 py-1 bg-slate-600 text-white text-xs font-medium rounded">Y - Dalgalı</span>
          </div>
          <div className="text-center">
            <span className="inline-block px-3 py-1 bg-slate-400 text-white text-xs font-medium rounded">Z - Düzensiz</span>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 mb-2">
          <div className="flex items-center justify-center">
            <span className="inline-block px-3 py-1 bg-slate-900 text-white text-xs font-medium rounded">A - Yüksek Değer</span>
          </div>
          <div>{renderCell('A', 'X')}</div>
          <div>{renderCell('A', 'Y')}</div>
          <div>{renderCell('A', 'Z')}</div>
        </div>
        <div className="grid grid-cols-4 gap-2 mb-2">
          <div className="flex items-center justify-center">
            <span className="inline-block px-3 py-1 bg-slate-500 text-white text-xs font-medium rounded">B - Orta Değer</span>
          </div>
          <div>{renderCell('B', 'X')}</div>
          <div>{renderCell('B', 'Y')}</div>
          <div>{renderCell('B', 'Z')}</div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <div className="flex items-center justify-center">
            <span className="inline-block px-3 py-1 bg-slate-300 text-slate-700 text-xs font-medium rounded">C - Düşük Değer</span>
          </div>
          <div>{renderCell('C', 'X')}</div>
          <div>{renderCell('C', 'Y')}</div>
          <div>{renderCell('C', 'Z')}</div>
        </div>
      </div>
    );
  };

  // Health Score Gauge
  const HealthScoreGauge = ({ score, trend }: { score: number; trend: string }) => (
    <div className="text-center py-5">
      <Progress
        type="dashboard"
        percent={score}
        strokeColor={getHealthScoreColor(score)}
        format={(percent) => (
          <div>
            <div className="text-3xl font-bold" style={{ color: getHealthScoreColor(score) }}>
              {percent}
            </div>
            <div className="text-xs text-slate-500">
              {getTrendIcon(trend)} {trend}
            </div>
          </div>
        )}
        size={180}
      />
    </div>
  );

  // Product ABC/XYZ columns
  const productColumns: ColumnsType<ProductAbcXyzDto> = [
    {
      title: 'Ürün',
      key: 'product',
      width: 250,
      render: (_, record) => (
        <div>
          <span className="font-semibold text-slate-900">{record.productName}</span>
          <br />
          <span className="text-xs text-slate-500">{record.productCode}</span>
        </div>
      ),
    },
    {
      title: 'Kategori',
      dataIndex: 'categoryName',
      width: 120,
    },
    {
      title: 'ABC',
      dataIndex: 'abcClass',
      width: 60,
      render: (abcClass: AbcClass) => (
        <Tag style={{ backgroundColor: getAbcColor(abcClass), color: '#fff', border: 'none', fontWeight: 600 }}>
          {abcClass}
        </Tag>
      ),
    },
    {
      title: 'XYZ',
      dataIndex: 'xyzClass',
      width: 60,
      render: (xyzClass: XyzClass) => (
        <Tag style={{ backgroundColor: getXyzColor(xyzClass), color: '#fff', border: 'none', fontWeight: 600 }}>
          {xyzClass}
        </Tag>
      ),
    },
    {
      title: 'Kombine',
      dataIndex: 'combinedClass',
      width: 80,
      render: (combinedClass: AbcXyzClass) => (
        <Tag style={{ backgroundColor: getMatrixCellColor(combinedClass), color: '#fff', fontWeight: 600, border: 'none' }}>
          {combinedClass}
        </Tag>
      ),
    },
    {
      title: 'Toplam Gelir',
      dataIndex: 'totalRevenue',
      width: 130,
      render: (val: number) => formatCurrency(val),
      sorter: (a, b) => a.totalRevenue - b.totalRevenue,
    },
    {
      title: 'Gelir %',
      dataIndex: 'revenuePercentage',
      width: 90,
      render: (val: number) => `%${val?.toFixed(2)}`,
    },
    {
      title: 'CV',
      dataIndex: 'coefficientOfVariation',
      width: 80,
      render: (val: number) => `${(val * 100)?.toFixed(1)}%`,
      sorter: (a, b) => a.coefficientOfVariation - b.coefficientOfVariation,
    },
    {
      title: 'Stok Değeri',
      dataIndex: 'stockValue',
      width: 130,
      render: (val: number) => formatCurrency(val),
    },
    {
      title: 'Tahmini Gün',
      dataIndex: 'estimatedDaysOfStock',
      width: 100,
      render: (days: number) => (
        <Tag className={`border-none font-medium ${days < 7 ? 'bg-slate-900 text-white' : days < 14 ? 'bg-slate-500 text-white' : 'bg-slate-200 text-slate-700'}`}>
          {days?.toFixed(0)} gün
        </Tag>
      ),
    },
    {
      title: 'Strateji',
      dataIndex: 'managementStrategy',
      width: 200,
      ellipsis: true,
    },
  ];

  // Turnover columns
  const turnoverColumns: ColumnsType<InventoryTurnoverDto> = [
    {
      title: 'Ürün',
      key: 'product',
      width: 250,
      render: (_, record) => (
        <div>
          <span className="font-semibold text-slate-900">{record.productName}</span>
          <br />
          <span className="text-xs text-slate-500">{record.productCode}</span>
        </div>
      ),
    },
    {
      title: 'Kategori',
      dataIndex: 'categoryName',
      width: 120,
    },
    {
      title: 'Devir Hızı',
      dataIndex: 'inventoryTurnoverRatio',
      width: 100,
      render: (val: number) => val?.toFixed(2),
      sorter: (a, b) => a.inventoryTurnoverRatio - b.inventoryTurnoverRatio,
    },
    {
      title: 'Stok Günü',
      dataIndex: 'daysOfInventory',
      width: 100,
      render: (val: number) => `${val?.toFixed(0)} gün`,
    },
    {
      title: 'Kategori',
      dataIndex: 'turnoverCategory',
      width: 120,
      render: (category: string) => {
        const styleMap: Record<string, string> = {
          'Fast': 'bg-slate-900 text-white',
          'Hızlı': 'bg-slate-900 text-white',
          'Normal': 'bg-slate-500 text-white',
          'Slow': 'bg-slate-300 text-slate-700',
          'Yavaş': 'bg-slate-300 text-slate-700',
          'Very Slow': 'bg-slate-200 text-slate-600',
          'Çok Yavaş': 'bg-slate-200 text-slate-600',
        };
        return <Tag className={`border-none font-medium ${styleMap[category] || 'bg-slate-100 text-slate-600'}`}>{category}</Tag>;
      },
    },
    {
      title: 'SMM',
      dataIndex: 'costOfGoodsSold',
      width: 130,
      render: (val: number) => formatCurrency(val),
    },
    {
      title: 'Benchmark',
      dataIndex: 'industryBenchmark',
      width: 100,
      render: (val: number) => val?.toFixed(2),
    },
    {
      title: 'Performans',
      dataIndex: 'performanceVsBenchmark',
      width: 120,
      render: (val: number) => (
        <Tag className={`border-none font-medium ${val > 0 ? 'bg-slate-900 text-white' : val < 0 ? 'bg-slate-300 text-slate-700' : 'bg-slate-100 text-slate-600'}`}>
          {val > 0 ? '+' : ''}{val?.toFixed(1)}%
        </Tag>
      ),
    },
    {
      title: 'Durum',
      key: 'status',
      width: 120,
      render: (_, record) => {
        if (record.isOverstocked) return <Tag className="bg-slate-400 text-white border-none font-medium">Fazla Stok</Tag>;
        if (record.isUnderstocked) return <Tag className="bg-slate-900 text-white border-none font-medium">Yetersiz Stok</Tag>;
        return <Tag className="bg-slate-200 text-slate-700 border-none font-medium">Normal</Tag>;
      },
    },
  ];

  // Dead stock columns
  const deadStockColumns: ColumnsType<DeadStockItemDto> = [
    {
      title: 'Ürün',
      key: 'product',
      width: 250,
      render: (_, record) => (
        <div>
          <span className="font-semibold text-slate-900">{record.productName}</span>
          <br />
          <span className="text-xs text-slate-500">{record.productCode}</span>
        </div>
      ),
    },
    {
      title: 'Kategori',
      dataIndex: 'categoryName',
      width: 120,
    },
    {
      title: 'Mevcut Stok',
      dataIndex: 'currentStock',
      width: 100,
      render: (val: number) => formatNumber(val),
    },
    {
      title: 'Stok Değeri',
      dataIndex: 'stockValue',
      width: 130,
      render: (val: number) => formatCurrency(val),
      sorter: (a, b) => a.stockValue - b.stockValue,
    },
    {
      title: 'Son Satıştan Bu Yana',
      dataIndex: 'daysSinceLastSale',
      width: 150,
      render: (val: number) => `${val} gün`,
      sorter: (a, b) => a.daysSinceLastSale - b.daysSinceLastSale,
    },
    {
      title: 'Yaşlanma',
      dataIndex: 'agingCategory',
      width: 120,
      render: (category: string) => {
        const styleMap: Record<string, string> = {
          '30-60 days': 'bg-slate-200 text-slate-700',
          '60-90 days': 'bg-slate-400 text-white',
          '90-180 days': 'bg-slate-600 text-white',
          '180+ days': 'bg-slate-900 text-white',
          '30-60 gün': 'bg-slate-200 text-slate-700',
          '60-90 gün': 'bg-slate-400 text-white',
          '90-180 gün': 'bg-slate-600 text-white',
          '180+ gün': 'bg-slate-900 text-white',
        };
        return <Tag className={`border-none font-medium ${styleMap[category] || 'bg-slate-100 text-slate-600'}`}>{category}</Tag>;
      },
    },
    {
      title: 'Değer Kaybı',
      dataIndex: 'depreciationRate',
      width: 100,
      render: (val: number) => (
        <Tag className={`border-none font-medium ${val > 0.5 ? 'bg-slate-900 text-white' : val > 0.2 ? 'bg-slate-500 text-white' : 'bg-slate-200 text-slate-700'}`}>
          %{(val * 100)?.toFixed(0)}
        </Tag>
      ),
    },
    {
      title: 'Tahmini Kurtarma',
      dataIndex: 'estimatedRecoveryValue',
      width: 130,
      render: (val: number) => formatCurrency(val),
    },
    {
      title: 'Seçenekler',
      dataIndex: 'disposalOptions',
      width: 200,
      render: (options: string[]) => (
        <Space wrap>
          {options?.slice(0, 2).map((opt, idx) => (
            <Tag key={idx} className="text-xs bg-slate-100 text-slate-600 border-none">{opt}</Tag>
          ))}
          {options?.length > 2 && <Tag className="text-xs bg-slate-100 text-slate-600 border-none">+{options.length - 2}</Tag>}
        </Space>
      ),
    },
  ];

  const isLoading = abcXyzLoading || turnoverLoading || deadStockLoading || healthLoading;

  // Tab items configuration
  const tabItems = [
    {
      key: 'abcxyz',
      label: (
        <span className="flex items-center gap-2">
          <ChartPieIcon className="w-4 h-4" />
          ABC/XYZ Analizi
        </span>
      ),
      children: (
        <>
          {abcXyzLoading ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12">
              <Spin size="large" className="flex justify-center" />
            </div>
          ) : abcXyzData ? (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-12 gap-6 mb-6">
                <div className="col-span-12 sm:col-span-6 lg:col-span-2">
                  <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                        <DatabaseOutlined className="text-slate-600 text-lg" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{formatNumber(abcXyzData.totalProductsAnalyzed)}</div>
                    <div className="text-xs text-slate-500 mt-1">Toplam Ürün</div>
                  </div>
                </div>
                <div className="col-span-12 sm:col-span-6 lg:col-span-2">
                  <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                        <CurrencyDollarIcon className="w-5 h-5 text-slate-600" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{formatCurrency(abcXyzData.totalRevenue)}</div>
                    <div className="text-xs text-slate-500 mt-1">Toplam Gelir</div>
                  </div>
                </div>
                <div className="col-span-12 sm:col-span-6 lg:col-span-2">
                  <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                        <DatabaseOutlined className="text-slate-600 text-lg" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{formatCurrency(abcXyzData.totalStockValue)}</div>
                    <div className="text-xs text-slate-500 mt-1">Stok Değeri</div>
                  </div>
                </div>
                <div className="col-span-12 sm:col-span-6 lg:col-span-2">
                  <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                        <ThunderboltOutlined className="text-slate-600 text-lg" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{abcXyzData.averageInventoryTurnover?.toFixed(2)}</div>
                    <div className="text-xs text-slate-500 mt-1">Ort. Devir Hızı</div>
                  </div>
                </div>
                <div className="col-span-12 sm:col-span-6 lg:col-span-2">
                  <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
                        <span className="text-white font-bold">A</span>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                      {abcXyzData.classA?.productCount || 0}
                      <span className="text-sm font-normal text-slate-500 ml-1">({abcXyzData.classA?.productPercentage?.toFixed(1) || 0}%)</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">A Sınıfı Ürün</div>
                  </div>
                </div>
                <div className="col-span-12 sm:col-span-6 lg:col-span-2">
                  <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                        <ExclamationTriangleIcon className="w-5 h-5 text-slate-600" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{abcXyzData.highRiskProducts?.length || 0}</div>
                    <div className="text-xs text-slate-500 mt-1">Yüksek Riskli</div>
                  </div>
                </div>
              </div>

              {/* ABC/XYZ Matrix */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">ABC/XYZ Matrisi</h3>
                <AbcXyzMatrix matrix={abcXyzData.matrix} />
              </div>

              {/* ABC and XYZ Class Summaries */}
              <div className="grid grid-cols-12 gap-6 mb-6">
                <div className="col-span-12 lg:col-span-6">
                  <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">ABC Sınıfları (Değer Bazlı)</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="inline-flex items-center px-3 py-1 bg-slate-900 text-white text-xs font-medium rounded">A Sınıfı</span>
                        <span className="text-sm text-slate-600">
                          {abcXyzData.classA?.productCount} ürün - Gelir: %{abcXyzData.classA?.revenuePercentage?.toFixed(1)} - Stok: {formatCurrency(abcXyzData.classA?.totalStockValue || 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="inline-flex items-center px-3 py-1 bg-slate-500 text-white text-xs font-medium rounded">B Sınıfı</span>
                        <span className="text-sm text-slate-600">
                          {abcXyzData.classB?.productCount} ürün - Gelir: %{abcXyzData.classB?.revenuePercentage?.toFixed(1)} - Stok: {formatCurrency(abcXyzData.classB?.totalStockValue || 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="inline-flex items-center px-3 py-1 bg-slate-300 text-slate-700 text-xs font-medium rounded">C Sınıfı</span>
                        <span className="text-sm text-slate-600">
                          {abcXyzData.classC?.productCount} ürün - Gelir: %{abcXyzData.classC?.revenuePercentage?.toFixed(1)} - Stok: {formatCurrency(abcXyzData.classC?.totalStockValue || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-span-12 lg:col-span-6">
                  <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">XYZ Sınıfları (Talep Değişkenliği)</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="inline-flex items-center px-3 py-1 bg-slate-900 text-white text-xs font-medium rounded">X Sınıfı</span>
                        <span className="text-sm text-slate-600">
                          {abcXyzData.classX?.productCount} ürün - {abcXyzData.classX?.demandPattern} - Ort. CV: %{(abcXyzData.classX?.averageCoefficientOfVariation * 100)?.toFixed(1)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="inline-flex items-center px-3 py-1 bg-slate-600 text-white text-xs font-medium rounded">Y Sınıfı</span>
                        <span className="text-sm text-slate-600">
                          {abcXyzData.classY?.productCount} ürün - {abcXyzData.classY?.demandPattern} - Ort. CV: %{(abcXyzData.classY?.averageCoefficientOfVariation * 100)?.toFixed(1)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="inline-flex items-center px-3 py-1 bg-slate-400 text-white text-xs font-medium rounded">Z Sınıfı</span>
                        <span className="text-sm text-slate-600">
                          {abcXyzData.classZ?.productCount} ürün - {abcXyzData.classZ?.demandPattern} - Ort. CV: %{(abcXyzData.classZ?.averageCoefficientOfVariation * 100)?.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Strategic Recommendations */}
              {abcXyzData.strategicRecommendations?.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">Stratejik Öneriler</h3>
                  <div className="space-y-3">
                    {abcXyzData.strategicRecommendations.map((rec, idx) => (
                      <Alert
                        key={idx}
                        type={rec.priority === 'High' || rec.priority === 'Yüksek' ? 'warning' : 'info'}
                        showIcon
                        className="[&_.ant-alert-icon]:text-slate-600"
                        message={
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900">{rec.category}</span>
                            {getPriorityBadge(rec.priority)}
                          </div>
                        }
                        description={
                          <div className="mt-2">
                            <p className="text-slate-600">{rec.recommendation}</p>
                            <span className="text-slate-500 text-sm">Etki: {rec.impact}</span>
                            {rec.estimatedSavings && (
                              <Tag className="bg-slate-900 text-white border-none font-medium ml-2">
                                Tahmini Tasarruf: {formatCurrency(rec.estimatedSavings)}
                              </Tag>
                            )}
                          </div>
                        }
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Top A Products and High Risk Products */}
              <div className="grid grid-cols-12 gap-6 mb-6">
                <div className="col-span-12 lg:col-span-6">
                  <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">En Değerli Ürünler (A Sınıfı)</h3>
                    <Table
                      dataSource={abcXyzData.topAProducts}
                      columns={[
                        {
                          title: 'Ürün',
                          key: 'product',
                          render: (_, r) => <span className="font-medium text-slate-900">{r.productName}</span>,
                        },
                        {
                          title: 'Gelir',
                          dataIndex: 'totalRevenue',
                          render: (v) => formatCurrency(v),
                        },
                        {
                          title: 'Sınıf',
                          dataIndex: 'combinedClass',
                          render: (c: AbcXyzClass) => <Tag style={{ backgroundColor: getMatrixCellColor(c), color: '#fff', border: 'none', fontWeight: 600 }}>{c}</Tag>,
                        },
                      ]}
                      rowKey="productId"
                      pagination={false}
                      size="small"
                      className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100"
                    />
                  </div>
                </div>
                <div className="col-span-12 lg:col-span-6">
                  <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5 flex items-center gap-2">
                      <ExclamationTriangleIcon className="w-4 h-4 text-slate-600" />
                      Yüksek Riskli Ürünler
                    </h3>
                    <Table
                      dataSource={abcXyzData.highRiskProducts}
                      columns={[
                        {
                          title: 'Ürün',
                          key: 'product',
                          render: (_, r) => <span className="font-medium text-slate-900">{r.productName}</span>,
                        },
                        {
                          title: 'Stok Günü',
                          dataIndex: 'estimatedDaysOfStock',
                          render: (d) => <Tag className="bg-slate-900 text-white border-none font-medium">{d?.toFixed(0)} gün</Tag>,
                        },
                        {
                          title: 'Sınıf',
                          dataIndex: 'combinedClass',
                          render: (c: AbcXyzClass) => <Tag style={{ backgroundColor: getMatrixCellColor(c), color: '#fff', border: 'none', fontWeight: 600 }}>{c}</Tag>,
                        },
                      ]}
                      rowKey="productId"
                      pagination={false}
                      size="small"
                      className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100"
                    />
                  </div>
                </div>
              </div>

              {/* Full Product List */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">Tüm Ürünler - ABC/XYZ Sınıflandırması</h3>
                <Table
                  dataSource={[...(abcXyzData.topAProducts || []), ...(abcXyzData.highRiskProducts || [])]}
                  columns={productColumns}
                  rowKey="productId"
                  scroll={{ x: 1500 }}
                  pagination={{ pageSize: 10 }}
                  className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100"
                />
              </div>
            </>
          ) : (
            <Empty description="ABC/XYZ analiz verisi bulunamadı" />
          )}
        </>
      ),
    },
    {
      key: 'turnover',
      label: (
        <span className="flex items-center gap-2">
          <ChartBarIcon className="w-4 h-4" />
          Stok Devir Hızı
        </span>
      ),
      children: (
        <>
          {turnoverLoading ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12">
              <Spin size="large" className="flex justify-center" />
            </div>
          ) : turnoverData?.length ? (
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <Table
                dataSource={turnoverData}
                columns={turnoverColumns}
                rowKey="productId"
                scroll={{ x: 1400 }}
                pagination={{ pageSize: 15 }}
                className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100"
              />
            </div>
          ) : (
            <Empty description="Stok devir hızı verisi bulunamadı" />
          )}
        </>
      ),
    },
    {
      key: 'deadstock',
      label: (
        <span className="flex items-center gap-2">
          <ExclamationCircleIcon className="w-4 h-4" />
          Ölü Stok
        </span>
      ),
      children: (
        <>
          {deadStockLoading ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12">
              <Spin size="large" className="flex justify-center" />
            </div>
          ) : deadStockData ? (
            <>
              <div className="grid grid-cols-12 gap-6 mb-6">
                <div className="col-span-12 sm:col-span-6 lg:col-span-3">
                  <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                        <ExclamationTriangleIcon className="w-5 h-5 text-slate-600" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{formatNumber(deadStockData.totalDeadStockItems)}</div>
                    <div className="text-xs text-slate-500 mt-1">Toplam Ölü Stok</div>
                  </div>
                </div>
                <div className="col-span-12 sm:col-span-6 lg:col-span-3">
                  <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                        <CurrencyDollarIcon className="w-5 h-5 text-slate-600" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{formatCurrency(deadStockData.totalDeadStockValue)}</div>
                    <div className="text-xs text-slate-500 mt-1">Ölü Stok Değeri</div>
                  </div>
                </div>
                <div className="col-span-12 sm:col-span-6 lg:col-span-3">
                  <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                        <ChartPieIcon className="w-5 h-5 text-slate-600" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">%{deadStockData.deadStockPercentage?.toFixed(1)}</div>
                    <div className="text-xs text-slate-500 mt-1">Ölü Stok Oranı</div>
                  </div>
                </div>
                <div className="col-span-12 sm:col-span-6 lg:col-span-3">
                  <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
                        <CurrencyDollarIcon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{formatCurrency(deadStockData.potentialRecoveryValue)}</div>
                    <div className="text-xs text-slate-500 mt-1">Tahmini Kurtarma</div>
                  </div>
                </div>
              </div>

              {deadStockData.recommendations?.length > 0 && (
                <Alert
                  type="warning"
                  showIcon
                  icon={<BulbOutlined className="text-slate-600" />}
                  message={<span className="font-semibold text-slate-900">Öneriler</span>}
                  description={
                    <ul className="list-disc pl-5 mt-2 text-slate-600">
                      {deadStockData.recommendations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  }
                  className="mb-6 [&_.ant-alert-message]:text-slate-900"
                />
              )}

              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">Ölü Stok Listesi</h3>
                <Table
                  dataSource={deadStockData.items}
                  columns={deadStockColumns}
                  rowKey="productId"
                  scroll={{ x: 1600 }}
                  pagination={{ pageSize: 15 }}
                  className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100"
                />
              </div>
            </>
          ) : (
            <Empty description="Ölü stok verisi bulunamadı" />
          )}
        </>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
              <AreaChartOutlined className="text-white text-lg" />
            </div>
            Envanter Analizi
          </h1>
          <p className="text-slate-500 mt-1">ABC/XYZ Analizi, Devir Hızı ve Ölü Stok</p>
        </div>
        <Space>
          <Select
            allowClear
            placeholder="Kategori"
            className="w-44 [&_.ant-select-selector]:!border-slate-200 [&_.ant-select-selector]:!rounded-lg"
            value={selectedCategoryId}
            onChange={setSelectedCategoryId}
            options={categories?.map((c) => ({ value: c.id, label: c.name }))}
          />
          <Select
            allowClear
            placeholder="Depo"
            className="w-44 [&_.ant-select-selector]:!border-slate-200 [&_.ant-select-selector]:!rounded-lg"
            value={selectedWarehouseId}
            onChange={setSelectedWarehouseId}
            options={warehouses?.map((w) => ({ value: w.id, label: w.name }))}
          />
          <Select
            allowClear
            placeholder="Marka"
            className="w-36 [&_.ant-select-selector]:!border-slate-200 [&_.ant-select-selector]:!rounded-lg"
            value={selectedBrandId}
            onChange={setSelectedBrandId}
            options={brands?.map((b) => ({ value: b.id, label: b.name }))}
          />
          <Select
            value={analysisPeriodDays}
            onChange={setAnalysisPeriodDays}
            className="w-28 [&_.ant-select-selector]:!border-slate-200 [&_.ant-select-selector]:!rounded-lg"
            options={[
              { value: 90, label: '90 Gün' },
              { value: 180, label: '180 Gün' },
              { value: 365, label: '365 Gün' },
            ]}
          />
          <Button
            icon={<ArrowPathIcon className="w-4 h-4" />}
            onClick={() => {
              refetchAbcXyz();
              refetchHealth();
            }}
            className="!border-slate-200 !text-slate-600 hover:!text-slate-900 hover:!border-slate-300"
          >
            Yenile
          </Button>
        </Space>
      </div>

      {/* Health Score Summary */}
      {healthScore && (
        <div className="grid grid-cols-12 gap-6 mb-6">
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <HealthScoreGauge score={healthScore.overallScore} trend={healthScore.healthTrend} />
              <h4 className="text-center text-sm font-semibold text-slate-900 mt-2">Envanter Sağlığı</h4>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">Sağlık Puanları Detayı</h3>
              <div className="grid grid-cols-6 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: getHealthScoreColor(healthScore.turnoverScore) }}>
                    {healthScore.turnoverScore}<span className="text-sm text-slate-400">/100</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Devir Hızı</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: getHealthScoreColor(healthScore.stockoutScore) }}>
                    {healthScore.stockoutScore}<span className="text-sm text-slate-400">/100</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Stok Kesintisi</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: getHealthScoreColor(healthScore.deadStockScore) }}>
                    {healthScore.deadStockScore}<span className="text-sm text-slate-400">/100</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Ölü Stok</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: getHealthScoreColor(healthScore.accuracyScore) }}>
                    {healthScore.accuracyScore}<span className="text-sm text-slate-400">/100</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Doğruluk</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: getHealthScoreColor(healthScore.balanceScore) }}>
                    {healthScore.balanceScore}<span className="text-sm text-slate-400">/100</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Denge</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: getHealthScoreColor(healthScore.serviceLevel) }}>
                    {healthScore.serviceLevel?.toFixed(1)}<span className="text-sm text-slate-400">%</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Hizmet Seviyesi</div>
                </div>
              </div>
              {healthScore.improvementAreas?.length > 0 && (
                <Alert
                  type="info"
                  showIcon
                  icon={<BulbOutlined className="text-slate-600" />}
                  message={<span className="font-semibold text-slate-900">İyileştirme Alanları</span>}
                  description={
                    <ul className="list-disc pl-5 mt-2 text-slate-600">
                      {healthScore.improvementAreas.map((area, idx) => (
                        <li key={idx}>{area}</li>
                      ))}
                    </ul>
                  }
                  className="mt-4 [&_.ant-alert-message]:text-slate-900"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        className="[&_.ant-tabs-tab]:!text-slate-600 [&_.ant-tabs-tab-active_.ant-tabs-tab-btn]:!text-slate-900 [&_.ant-tabs-ink-bar]:!bg-slate-900 [&_.ant-tabs-nav]:!mb-6"
      />
    </div>
  );
}
