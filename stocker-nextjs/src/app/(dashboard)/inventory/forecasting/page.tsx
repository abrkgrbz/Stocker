'use client';

import React, { useState } from 'react';
import {
  Table,
  Button,
  Space,
  Select,
  Tabs,
  Progress,
  Tooltip,
  Badge,
  Alert,
  Modal,
  Descriptions,
  Spin,
  Empty,
  Tag,
} from 'antd';
import {
  ArrowDownIcon,
  ArrowPathIcon,
  ArrowUpIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  MinusIcon,
  ShoppingCartIcon,
} from '@heroicons/react/24/outline';
import type { ColumnsType } from 'antd/es/table';
import {
  useForecastSummary,
  useStockoutRiskProducts,
  useReorderSuggestions,
  useBulkStockOptimizations,
  useProductForecast,
  useDemandAnalysis,
  useSafetyStockCalculation,
  useStockOptimization,
  useGenerateReorderSuggestions,
  useProcessReorderSuggestion,
  useCategories,
  useWarehouses,
} from '@/lib/api/hooks/useInventory';
import type {
  ProductForecastDto,
  ReorderSuggestionDto,
  StockOptimizationDto,
  StockForecastFilterDto,
  ReorderSuggestionStatus,
  SafetyStockCalculationDto,
} from '@/lib/api/services/inventory.types';
import { ForecastingMethod } from '@/lib/api/services/inventory.types';

// Monochrome color palette
const MONOCHROME_COLORS = ['#1e293b', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0', '#f1f5f9'];

// Risk level helpers
const getRiskLevel = (daysUntilStockout: number, leadTime: number) => {
  if (daysUntilStockout <= 0) return { color: 'red', text: 'Stokta Yok', icon: <ExclamationCircleIcon className="w-4 h-4" />, className: 'bg-slate-900 text-white' };
  if (daysUntilStockout < leadTime) return { color: 'red', text: 'Yüksek Risk', icon: <ExclamationTriangleIcon className="w-4 h-4" />, className: 'bg-slate-700 text-white' };
  if (daysUntilStockout < leadTime * 2) return { color: 'orange', text: 'Orta Risk', icon: <ClockIcon className="w-4 h-4" />, className: 'bg-slate-400 text-white' };
  return { color: 'green', text: 'Düşük Risk', icon: <CheckCircleIcon className="w-4 h-4" />, className: 'bg-slate-200 text-slate-700' };
};

const getTrendIcon = (trend: number) => {
  if (trend > 0.05) return <ArrowUpIcon className="w-4 h-4 text-slate-700" />;
  if (trend < -0.05) return <ArrowDownIcon className="w-4 h-4 text-slate-500" />;
  return <MinusIcon className="w-4 h-4 text-slate-400" />;
};

// Status badge classes (monochrome)
const getStatusBadgeClass = (status: ReorderSuggestionStatus) => {
  switch (status) {
    case 'Pending': return 'bg-slate-100 text-slate-600';
    case 'Approved': return 'bg-slate-900 text-white';
    case 'Rejected': return 'bg-slate-300 text-slate-700';
    case 'Ordered': return 'bg-slate-700 text-white';
    case 'Expired': return 'bg-slate-200 text-slate-500';
    default: return 'bg-slate-100 text-slate-600';
  }
};

const getStatusText = (status: ReorderSuggestionStatus) => {
  switch (status) {
    case 'Pending': return 'Beklemede';
    case 'Approved': return 'Onaylandı';
    case 'Rejected': return 'Reddedildi';
    case 'Ordered': return 'Sipariş Verildi';
    case 'Expired': return 'Süresi Doldu';
    default: return status;
  }
};

export default function ForecastingPage() {
  const [activeTab, setActiveTab] = useState('summary');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>();
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | undefined>();
  const [forecastDays, setForecastDays] = useState(30);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  // Queries
  const { data: categories } = useCategories();
  const { data: warehouses } = useWarehouses();

  const filter: StockForecastFilterDto = {
    categoryId: selectedCategoryId,
    warehouseId: selectedWarehouseId,
    forecastDays,
    method: ForecastingMethod.ExponentialSmoothing,
  };

  const { data: forecastSummary, isLoading: summaryLoading, refetch: refetchSummary } = useForecastSummary(filter);
  const { data: riskProducts, isLoading: riskLoading } = useStockoutRiskProducts(7, selectedWarehouseId);
  const { data: suggestions, isLoading: suggestionsLoading, refetch: refetchSuggestions } = useReorderSuggestions({
    categoryId: selectedCategoryId,
    warehouseId: selectedWarehouseId,
    status: 'Pending' as ReorderSuggestionStatus,
    pageSize: 50,
  });
  const { data: optimizations, isLoading: optimizationsLoading } = useBulkStockOptimizations(selectedCategoryId, selectedWarehouseId);

  // Detail queries (only when modal is open)
  const { data: productForecastRaw } = useProductForecast(selectedProductId || 0, selectedWarehouseId, forecastDays);
  const productForecast = productForecastRaw as ProductForecastDto | undefined;
  const { data: demandAnalysis } = useDemandAnalysis(selectedProductId || 0, selectedWarehouseId);
  const { data: safetyStockRaw } = useSafetyStockCalculation(selectedProductId || 0);
  const safetyStock = safetyStockRaw as SafetyStockCalculationDto | undefined;
  const { data: optimizationRaw } = useStockOptimization(selectedProductId || 0);
  const optimization = optimizationRaw as StockOptimizationDto | undefined;

  // Mutations
  const generateSuggestions = useGenerateReorderSuggestions();
  const processSuggestion = useProcessReorderSuggestion();

  // Columns for risk products table
  const riskColumns: ColumnsType<ProductForecastDto> = [
    {
      title: 'Ürün',
      key: 'product',
      render: (_, record) => (
        <div>
          <span className="font-medium text-slate-900">{record.productCode}</span>
          <br />
          <span className="text-xs text-slate-500">{record.productName}</span>
        </div>
      ),
    },
    {
      title: 'Kategori',
      dataIndex: 'categoryName',
      key: 'categoryName',
    },
    {
      title: 'Mevcut Stok',
      key: 'stock',
      render: (_, record) => (
        <div>
          <span className="text-slate-700">{record.availableStock.toFixed(0)}</span>
          {record.reservedStock > 0 && (
            <span className="text-xs text-slate-400 ml-1">
              ({record.reservedStock.toFixed(0)} rezerve)
            </span>
          )}
        </div>
      ),
    },
    {
      title: 'Günlük Talep',
      dataIndex: 'averageDailyDemand',
      key: 'averageDailyDemand',
      render: (value: number) => value.toFixed(1),
    },
    {
      title: 'Stok Bitiş',
      key: 'stockout',
      render: (_, record) => {
        const risk = getRiskLevel(record.estimatedDaysUntilStockout, record.leadTimeDays);
        return (
          <Space>
            <Tag color={risk.color} icon={risk.icon}>
              {record.estimatedDaysUntilStockout} gün
            </Tag>
          </Space>
        );
      },
    },
    {
      title: 'Risk',
      key: 'risk',
      render: (_, record) => {
        const risk = getRiskLevel(record.estimatedDaysUntilStockout, record.leadTimeDays);
        return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${risk.className}`}>{risk.text}</span>;
      },
    },
    {
      title: 'Önerilen Sipariş',
      key: 'suggestion',
      render: (_, record) => (
        <div>
          <span className="font-medium text-slate-900">{record.suggestedReorderQuantity.toFixed(0)}</span>
          {record.suggestedOrderDate && (
            <span className="text-xs text-slate-500 block">
              {new Date(record.suggestedOrderDate).toLocaleDateString('tr-TR')}
            </span>
          )}
        </div>
      ),
    },
    {
      title: '',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          className="!text-slate-600 hover:!text-slate-900"
          onClick={() => {
            setSelectedProductId(record.productId);
            setDetailModalVisible(true);
          }}
        >
          Detay
        </Button>
      ),
    },
  ];

  // Columns for suggestions table
  const suggestionColumns: ColumnsType<ReorderSuggestionDto> = [
    {
      title: 'Ürün',
      key: 'product',
      render: (_, record) => (
        <div>
          <span className="font-medium text-slate-900">{record.productCode}</span>
          <br />
          <span className="text-xs text-slate-500">{record.productName}</span>
        </div>
      ),
    },
    {
      title: 'Mevcut Stok',
      dataIndex: 'availableStock',
      key: 'availableStock',
      render: (value: number) => value.toFixed(0),
    },
    {
      title: 'Önerilen Miktar',
      dataIndex: 'suggestedQuantity',
      key: 'suggestedQuantity',
      render: (value: number) => <span className="font-medium text-slate-900">{value.toFixed(0)}</span>,
    },
    {
      title: 'Tahmini Maliyet',
      key: 'cost',
      render: (_, record) => (
        <span className="text-slate-700">{record.estimatedCost.toLocaleString('tr-TR')} {record.currency}</span>
      ),
    },
    {
      title: 'Stok Bitiş',
      key: 'stockout',
      render: (_, record) => (
        record.estimatedDaysUntilStockout !== undefined ? (
          <Tag color={record.estimatedDaysUntilStockout <= 7 ? 'red' : 'orange'}>
            {record.estimatedDaysUntilStockout} gün
          </Tag>
        ) : '-'
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: ReorderSuggestionStatus) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(status)}`}>{getStatusText(status)}</span>
      ),
    },
    {
      title: 'İşlem',
      key: 'actions',
      render: (_, record) => (
        record.status === 'Pending' && (
          <Space>
            <Button
              type="primary"
              size="small"
              className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
              onClick={() => processSuggestion.mutate({
                id: record.id,
                dto: { newStatus: 'Approved' as ReorderSuggestionStatus }
              })}
              loading={processSuggestion.isPending}
            >
              Onayla
            </Button>
            <Button
              size="small"
              danger
              onClick={() => processSuggestion.mutate({
                id: record.id,
                dto: { newStatus: 'Rejected' as ReorderSuggestionStatus, reason: 'Manuel red' }
              })}
              loading={processSuggestion.isPending}
            >
              Reddet
            </Button>
          </Space>
        )
      ),
    },
  ];

  // Columns for optimizations table
  const optimizationColumns: ColumnsType<StockOptimizationDto> = [
    {
      title: 'Ürün',
      key: 'product',
      render: (_, record) => (
        <div>
          <span className="font-medium text-slate-900">{record.productCode}</span>
          <br />
          <span className="text-xs text-slate-500">{record.productName}</span>
        </div>
      ),
    },
    {
      title: 'Mevcut Min',
      dataIndex: 'currentMinStock',
      key: 'currentMinStock',
      render: (value: number) => value.toFixed(0),
    },
    {
      title: 'Önerilen Min',
      dataIndex: 'recommendedMinStock',
      key: 'recommendedMinStock',
      render: (value: number, record) => (
        <span className={value !== record.currentMinStock ? 'text-slate-700' : 'text-slate-700'}>
          {value.toFixed(0)}
        </span>
      ),
    },
    {
      title: 'Mevcut Reorder',
      dataIndex: 'currentReorderLevel',
      key: 'currentReorderLevel',
      render: (value: number) => value.toFixed(0),
    },
    {
      title: 'Önerilen Reorder',
      dataIndex: 'recommendedReorderLevel',
      key: 'recommendedReorderLevel',
      render: (value: number, record) => (
        <span className={value !== record.currentReorderLevel ? 'text-slate-700' : 'text-slate-700'}>
          {value.toFixed(0)}
        </span>
      ),
    },
    {
      title: 'Envanter Azalma',
      key: 'reduction',
      render: (_, record) => (
        record.inventoryReductionPercent > 0 ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-900 text-white">{record.inventoryReductionPercent.toFixed(1)}%</span>
        ) : (
          <Tag color="orange">{Math.abs(record.inventoryReductionPercent).toFixed(1)}% artış</Tag>
        )
      ),
    },
    {
      title: 'Yıllık Tasarruf',
      dataIndex: 'estimatedAnnualSavings',
      key: 'estimatedAnnualSavings',
      render: (value: number) => (
        value > 0 ? (
          <span className="text-slate-900 font-medium">{value.toLocaleString('tr-TR')} TRY</span>
        ) : '-'
      ),
    },
  ];

  // Tab items
  const tabItems = [
    {
      key: 'summary',
      label: (
        <span className="flex items-center gap-2">
          <ChartBarIcon className="w-4 h-4" />
          Özet
        </span>
      ),
      children: (
        <>
          {summaryLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spin size="large" />
            </div>
          ) : forecastSummary ? (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-12 gap-6 mb-6">
                <div className="col-span-12 sm:col-span-6 lg:col-span-3">
                  <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                        <ChartBarIcon className="w-5 h-5 text-slate-600" />
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mb-1">Analiz Edilen Ürün</p>
                    <p className="text-2xl font-bold text-slate-900">{forecastSummary.totalProductsAnalyzed}</p>
                  </div>
                </div>
                <div className="col-span-12 sm:col-span-6 lg:col-span-3">
                  <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                        <ShoppingCartIcon className="w-5 h-5 text-slate-600" />
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mb-1">Sipariş Gerekli</p>
                    <p className={`text-2xl font-bold ${forecastSummary.productsNeedingReorder > 0 ? 'text-slate-700' : 'text-slate-900'}`}>
                      {forecastSummary.productsNeedingReorder}
                    </p>
                  </div>
                </div>
                <div className="col-span-12 sm:col-span-6 lg:col-span-3">
                  <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                        <ExclamationTriangleIcon className="w-5 h-5 text-slate-600" />
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mb-1">Risk Altında</p>
                    <p className={`text-2xl font-bold ${forecastSummary.productsAtRisk > 0 ? 'text-slate-700' : 'text-slate-900'}`}>
                      {forecastSummary.productsAtRisk}
                    </p>
                  </div>
                </div>
                <div className="col-span-12 sm:col-span-6 lg:col-span-3">
                  <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                        <ExclamationCircleIcon className="w-5 h-5 text-slate-600" />
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mb-1">Stokta Yok</p>
                    <p className={`text-2xl font-bold ${forecastSummary.productsInStockout > 0 ? 'text-slate-700' : 'text-slate-900'}`}>
                      {forecastSummary.productsInStockout}
                    </p>
                  </div>
                </div>
              </div>

              {/* Risk Distribution & Forecast Values */}
              <div className="grid grid-cols-12 gap-6 mb-6">
                <div className="col-span-12 lg:col-span-6">
                  <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">Risk Dağılımı</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-slate-500 mb-1">Yüksek Risk</p>
                        <p className="text-xl font-bold text-slate-900 mb-2">{forecastSummary.highRiskProducts}</p>
                        <Progress
                          percent={forecastSummary.totalProductsAnalyzed > 0
                            ? Math.round((forecastSummary.highRiskProducts / forecastSummary.totalProductsAnalyzed) * 100)
                            : 0}
                          strokeColor={MONOCHROME_COLORS[0]}
                          size="small"
                          showInfo={false}
                        />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 mb-1">Orta Risk</p>
                        <p className="text-xl font-bold text-slate-700 mb-2">{forecastSummary.mediumRiskProducts}</p>
                        <Progress
                          percent={forecastSummary.totalProductsAnalyzed > 0
                            ? Math.round((forecastSummary.mediumRiskProducts / forecastSummary.totalProductsAnalyzed) * 100)
                            : 0}
                          strokeColor={MONOCHROME_COLORS[2]}
                          size="small"
                          showInfo={false}
                        />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 mb-1">Düşük Risk</p>
                        <p className="text-xl font-bold text-slate-500 mb-2">{forecastSummary.lowRiskProducts}</p>
                        <Progress
                          percent={forecastSummary.totalProductsAnalyzed > 0
                            ? Math.round((forecastSummary.lowRiskProducts / forecastSummary.totalProductsAnalyzed) * 100)
                            : 0}
                          strokeColor={MONOCHROME_COLORS[4]}
                          size="small"
                          showInfo={false}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-span-12 lg:col-span-6">
                  <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">Tahmin Değerleri</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-500 mb-1">{forecastDays} Günlük Talep Tahmini</p>
                        <p className="text-2xl font-bold text-slate-900">
                          {forecastSummary.totalForecastedDemandValue.toFixed(0)}
                          <span className="text-sm font-normal text-slate-500 ml-1">adet</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 mb-1">Önerilen Sipariş Değeri</p>
                        <p className="text-2xl font-bold text-slate-900">
                          {forecastSummary.totalSuggestedReorderValue.toFixed(0)}
                          <span className="text-sm font-normal text-slate-500 ml-1">adet</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Breakdown */}
              {forecastSummary.byCategory && forecastSummary.byCategory.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">Kategori Bazında Analiz</h3>
                  <Table
                    dataSource={forecastSummary.byCategory}
                    rowKey="categoryName"
                    pagination={false}
                    size="small"
                    className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs"
                    columns={[
                      { title: 'Kategori', dataIndex: 'categoryName', key: 'categoryName' },
                      { title: 'Ürün Sayısı', dataIndex: 'productCount', key: 'productCount' },
                      {
                        title: 'Sipariş Gerekli',
                        dataIndex: 'productsNeedingReorder',
                        key: 'productsNeedingReorder',
                        render: (value: number) => (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${value > 0 ? "bg-slate-700 text-white" : "bg-slate-200 text-slate-600"}`}>{value}</span>
                        ),
                      },
                      {
                        title: 'Tahmini Talep',
                        dataIndex: 'totalForecastedDemand',
                        key: 'totalForecastedDemand',
                        render: (value: number) => value.toFixed(0),
                      },
                    ]}
                  />
                </div>
              )}

              {/* Top Reorder Products */}
              {forecastSummary.topReorderProducts && forecastSummary.topReorderProducts.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">En Acil Siparişler</h3>
                  <Table
                    dataSource={forecastSummary.topReorderProducts}
                    columns={riskColumns}
                    rowKey="productId"
                    pagination={false}
                    size="small"
                    className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs"
                  />
                </div>
              )}
            </>
          ) : (
            <Empty description="Tahmin verisi bulunamadı" />
          )}
        </>
      ),
    },
    {
      key: 'risk',
      label: (
        <span className="flex items-center gap-2">
          <ExclamationTriangleIcon className="w-4 h-4" />
          Stok Tükenme Riski
          {riskProducts && riskProducts.length > 0 && (
            <Badge count={riskProducts.length} className="ml-2" />
          )}
        </span>
      ),
      children: (
        <>
          {riskProducts && riskProducts.length > 0 ? (
            <>
              <Alert
                message="Stok Tükenme Uyarısı"
                description={`${riskProducts.length} ürün önümüzdeki 7 gün içinde stok tükenme riski altında.`}
                type="warning"
                showIcon
                className="mb-4"
              />
              <Table
                dataSource={riskProducts}
                columns={riskColumns}
                rowKey="productId"
                loading={riskLoading}
                pagination={{ pageSize: 20 }}
                className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs"
              />
            </>
          ) : (
            <Empty description="Stok tükenme riski olan ürün bulunmamaktadır" />
          )}
        </>
      ),
    },
    {
      key: 'suggestions',
      label: (
        <span className="flex items-center gap-2">
          <ShoppingCartIcon className="w-4 h-4" />
          Sipariş Önerileri
          {suggestions?.pendingCount && suggestions.pendingCount > 0 && (
            <Badge count={suggestions.pendingCount} className="ml-2" />
          )}
        </span>
      ),
      children: (
        <>
          <div className="flex items-center gap-4 mb-4">
            <Button
              type="primary"
              icon={<ArrowPathIcon className="w-4 h-4" />}
              className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
              onClick={() => generateSuggestions.mutate({
                categoryId: selectedCategoryId,
                warehouseId: selectedWarehouseId,
              })}
              loading={generateSuggestions.isPending}
            >
              Önerileri Yeniden Oluştur
            </Button>
            {suggestions && (
              <div className="flex-1">
                <Space>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-slate-700 text-white">Bekleyen: {suggestions.pendingCount}</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-slate-900 text-white">Onaylanan: {suggestions.approvedCount}</span>
                  <Tag>Toplam Değer: {suggestions.totalPendingValue.toLocaleString('tr-TR')} TRY</Tag>
                </Space>
              </div>
            )}
          </div>

          <Table
            dataSource={suggestions?.items || []}
            columns={suggestionColumns}
            rowKey="id"
            loading={suggestionsLoading}
            pagination={{
              total: suggestions?.totalCount,
              pageSize: suggestions?.pageSize || 20,
              showTotal: (total) => `Toplam ${total} öneri`,
            }}
            className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs"
          />
        </>
      ),
    },
    {
      key: 'optimization',
      label: (
        <span className="flex items-center gap-2">
          <LightBulbIcon className="w-4 h-4" />
          Optimizasyon Önerileri
        </span>
      ),
      children: (
        <>
          {optimizationsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spin size="large" />
            </div>
          ) : optimizations && optimizations.length > 0 ? (
            <>
              <Alert
                message="Stok Optimizasyonu"
                description="Aşağıdaki tabloda ürünleriniz için önerilen stok seviyesi optimizasyonları gösterilmektedir."
                type="info"
                showIcon
                className="mb-4"
              />
              <Table
                dataSource={optimizations}
                columns={optimizationColumns}
                rowKey="productId"
                pagination={{ pageSize: 20 }}
                className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs"
                expandable={{
                  expandedRowRender: (record) => (
                    <div className="p-4">
                      <h5 className="text-sm font-medium text-slate-900 mb-2">Öneriler</h5>
                      <ul className="list-disc pl-5 text-sm text-slate-600">
                        {record.recommendations.map((rec: string, index: number) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  ),
                }}
              />
            </>
          ) : (
            <Empty description="Optimizasyon önerisi bulunamadı" />
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
            <ChartBarIcon className="w-4 h-4" />
            Stok Tahminleme & Otomatik Yeniden Sipariş
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Stok tükenme tahminleri ve otomatik sipariş önerilerini yönetin
          </p>
        </div>
        <Space size="middle">
          <Select
            placeholder="Kategori"
            allowClear
            style={{ width: 180 }}
            value={selectedCategoryId}
            onChange={setSelectedCategoryId}
          >
            {categories?.map((cat) => (
              <Select.Option key={cat.id} value={cat.id}>{cat.name}</Select.Option>
            ))}
          </Select>
          <Select
            placeholder="Depo"
            allowClear
            style={{ width: 180 }}
            value={selectedWarehouseId}
            onChange={setSelectedWarehouseId}
          >
            {warehouses?.map((wh) => (
              <Select.Option key={wh.id} value={wh.id}>{wh.name}</Select.Option>
            ))}
          </Select>
          <Select
            value={forecastDays}
            onChange={setForecastDays}
            style={{ width: 140 }}
          >
            <Select.Option value={7}>7 Gün</Select.Option>
            <Select.Option value={14}>14 Gün</Select.Option>
            <Select.Option value={30}>30 Gün</Select.Option>
            <Select.Option value={60}>60 Gün</Select.Option>
            <Select.Option value={90}>90 Gün</Select.Option>
          </Select>
          <Button
            icon={<ArrowPathIcon className="w-4 h-4" />}
            className="!border-slate-300 hover:!border-slate-400 !text-slate-600"
            onClick={() => {
              refetchSummary();
              refetchSuggestions();
            }}
          >
            Yenile
          </Button>
        </Space>
      </div>

      {/* Tabs Content */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          className="[&_.ant-tabs-tab]:!text-slate-600 [&_.ant-tabs-tab-active_.ant-tabs-tab-btn]:!text-slate-900 [&_.ant-tabs-ink-bar]:!bg-slate-900"
        />
      </div>

      {/* Product Detail Modal */}
      <Modal
        title={
          <span className="text-lg font-semibold text-slate-900">Ürün Tahmin Detayı</span>
        }
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedProductId(null);
        }}
        width={800}
        footer={null}
      >
        {selectedProductId && productForecast ? (
          <>
            <Descriptions bordered size="small" column={2} className="mb-4">
              <Descriptions.Item label="Ürün Kodu">{productForecast.productCode}</Descriptions.Item>
              <Descriptions.Item label="Ürün Adı">{productForecast.productName}</Descriptions.Item>
              <Descriptions.Item label="Mevcut Stok">{productForecast.currentStock.toFixed(0)}</Descriptions.Item>
              <Descriptions.Item label="Kullanılabilir">{productForecast.availableStock.toFixed(0)}</Descriptions.Item>
              <Descriptions.Item label="Günlük Ortalama Talep">{productForecast.averageDailyDemand.toFixed(2)}</Descriptions.Item>
              <Descriptions.Item label="Standart Sapma">{productForecast.demandStandardDeviation.toFixed(2)}</Descriptions.Item>
              <Descriptions.Item label="Stok Bitiş Süresi">
                <Tag color={productForecast.estimatedDaysUntilStockout <= 7 ? 'red' : 'orange'}>
                  {productForecast.estimatedDaysUntilStockout} gün
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trend">
                {getTrendIcon(productForecast.trendDirection)}
                <span className="ml-2">
                  {productForecast.trendDirection > 0.05 ? 'Artıyor' :
                    productForecast.trendDirection < -0.05 ? 'Azalıyor' : 'Sabit'}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Tahmin Doğruluğu">
                <Progress
                  percent={Math.round(productForecast.forecastAccuracy * 100)}
                  size="small"
                  strokeColor={MONOCHROME_COLORS[0]}
                  status={productForecast.forecastAccuracy > 0.8 ? 'success' : 'normal'}
                />
              </Descriptions.Item>
              <Descriptions.Item label="Yöntem">{productForecast.methodUsed}</Descriptions.Item>
            </Descriptions>

            {productForecast.needsReorder && (
              <Alert
                message="Sipariş Önerisi"
                description={
                  <div className="text-sm">
                    <p><strong>Önerilen Miktar:</strong> {productForecast.suggestedReorderQuantity.toFixed(0)}</p>
                    {productForecast.suggestedOrderDate && (
                      <p><strong>Önerilen Sipariş Tarihi:</strong> {new Date(productForecast.suggestedOrderDate).toLocaleDateString('tr-TR')}</p>
                    )}
                    <p><strong>Sebep:</strong> {productForecast.reorderReason}</p>
                  </div>
                }
                type="warning"
                showIcon
                className="mb-4"
              />
            )}

            {safetyStock && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4">
                <h4 className="text-sm font-medium text-slate-900 mb-3">Emniyet Stoğu Hesabı</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Mevcut Emniyet Stoğu</p>
                    <p className="text-xl font-bold text-slate-900">{safetyStock.currentSafetyStock.toFixed(0)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Önerilen Emniyet Stoğu</p>
                    <p className={`text-xl font-bold ${safetyStock.recommendedSafetyStock !== safetyStock.currentSafetyStock ? 'text-slate-700' : 'text-slate-900'}`}>
                      {safetyStock.recommendedSafetyStock.toFixed(0)}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">{safetyStock.formula}</p>
              </div>
            )}

            {optimization && optimization.recommendations.length > 0 && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <h4 className="text-sm font-medium text-slate-900 mb-3">Optimizasyon Önerileri</h4>
                <ul className="list-disc pl-5 text-sm text-slate-600">
                  {optimization.recommendations.map((rec: string, index: number) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center py-12">
            <Spin />
          </div>
        )}
      </Modal>
    </div>
  );
}
