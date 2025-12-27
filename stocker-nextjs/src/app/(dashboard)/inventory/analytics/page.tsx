'use client';

import React, { useState, useMemo } from 'react';
import {
  Select,
  Spin,
  DatePicker,
  Tabs,
  Table,
  Progress,
  Space,
  Tag,
  Button,
  Tooltip,
  Empty,
} from 'antd';
import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  ArrowTrendingUpIcon,
  BuildingStorefrontIcon,
  ChartBarIcon,
  ChartPieIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InboxIcon,
  InformationCircleIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import dayjs from 'dayjs';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ComposedChart,
  Line,
  Treemap,
} from 'recharts';
import {
  useInventoryDashboard,
  useStockValuation,
  useInventoryKPIs,
  useWarehouses,
  useCategories,
} from '@/lib/api/hooks/useInventory';

const { RangePicker } = DatePicker;

// Monochrome color palette (matching dashboard)
const MONOCHROME_COLORS = ['#1e293b', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0', '#f1f5f9'];

// Utility functions
const formatCurrency = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return '₺0';
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatNumber = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return '0';
  return new Intl.NumberFormat('tr-TR').format(value);
};

const formatPercentage = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return '%0';
  return `%${value.toFixed(1)}`;
};

const formatCompactNumber = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
};

// Custom tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-sm">
        <p className="font-medium text-slate-900 mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm text-slate-600">
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString('tr-TR') : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function InventoryAnalyticsPage() {
  // State
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | undefined>(undefined);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);
  const [trendDays, setTrendDays] = useState<number>(30);
  const [kpiDateRange, setKpiDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'day'),
    dayjs(),
  ]);

  // Data fetching
  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    refetch: refetchDashboard,
  } = useInventoryDashboard(selectedWarehouseId, trendDays);

  const {
    data: valuationData,
    isLoading: valuationLoading,
  } = useStockValuation(selectedWarehouseId, selectedCategoryId);

  const {
    data: kpisData,
    isLoading: kpisLoading,
  } = useInventoryKPIs(
    kpiDateRange[0].format('YYYY-MM-DD'),
    kpiDateRange[1].format('YYYY-MM-DD'),
    selectedWarehouseId
  );

  const { data: warehouses = [] } = useWarehouses();
  const { data: categories = [] } = useCategories();

  const isLoading = dashboardLoading || valuationLoading || kpisLoading;

  // Extract data
  const kpis = dashboardData?.kpis;
  const byCategory = dashboardData?.byCategory || [];
  const byWarehouse = dashboardData?.byWarehouse || [];
  const movementTrend = dashboardData?.movementTrend || [];
  const topProducts = dashboardData?.topProductsByValue || [];
  const alerts = dashboardData?.alerts || [];

  // Valuation data
  const valuationSummary = valuationData?.summary;
  const valuationByCategory = valuationData?.byCategory || [];
  const valuationByWarehouse = valuationData?.byWarehouse || [];
  const valuationProducts = valuationData?.products || [];

  // Movement trend data transformation
  const movementTrendData = useMemo(() => {
    return movementTrend.map(m => ({
      date: dayjs(m.date).format('DD/MM'),
      giren: m.inbound,
      cikan: m.outbound,
      net: m.netChange,
      girenDeger: m.inboundValue,
      cikanDeger: m.outboundValue,
    }));
  }, [movementTrend]);

  // Category distribution data
  const categoryData = useMemo(() => {
    if (valuationByCategory.length > 0) {
      return valuationByCategory.map((c, index) => ({
        name: c.categoryName,
        value: c.totalValue,
        quantity: c.totalQuantity,
        productCount: c.productCount,
        percentage: c.percentageOfTotal,
        fill: MONOCHROME_COLORS[index % MONOCHROME_COLORS.length],
      }));
    }
    return byCategory.map((c, index) => ({
      name: c.categoryName,
      value: c.stockValue,
      quantity: c.totalQuantity,
      productCount: c.productCount,
      percentage: 0,
      fill: MONOCHROME_COLORS[index % MONOCHROME_COLORS.length],
    }));
  }, [valuationByCategory, byCategory]);

  // Warehouse distribution data
  const warehouseData = useMemo(() => {
    if (valuationByWarehouse.length > 0) {
      return valuationByWarehouse.map((w, index) => ({
        name: w.warehouseName,
        code: w.warehouseCode,
        value: w.totalValue,
        quantity: w.totalQuantity,
        productCount: w.productCount,
        percentage: w.percentageOfTotal,
        fill: MONOCHROME_COLORS[index % MONOCHROME_COLORS.length],
      }));
    }
    return byWarehouse.map((w, index) => ({
      name: w.warehouseName,
      code: '',
      value: w.stockValue,
      quantity: w.totalQuantity,
      productCount: w.productCount,
      percentage: 0,
      fill: MONOCHROME_COLORS[index % MONOCHROME_COLORS.length],
    }));
  }, [valuationByWarehouse, byWarehouse]);

  // Top products data
  const topProductsData = useMemo(() => {
    if (valuationProducts.length > 0) {
      return valuationProducts.slice(0, 15).map(p => ({
        name: p.productName.length > 25 ? p.productName.substring(0, 25) + '...' : p.productName,
        fullName: p.productName,
        code: p.productCode,
        category: p.categoryName,
        value: p.totalValue,
        quantity: p.quantity,
        unitCost: p.unitCost,
        percentage: p.percentageOfTotal,
      }));
    }
    return topProducts.slice(0, 15).map(p => ({
      name: p.productName.length > 25 ? p.productName.substring(0, 25) + '...' : p.productName,
      fullName: p.productName,
      code: p.productCode,
      category: p.categoryName,
      value: p.totalValue,
      quantity: p.totalQuantity,
      unitCost: 0,
      percentage: 0,
    }));
  }, [valuationProducts, topProducts]);

  // Valuation treemap data
  const treemapData = useMemo(() => {
    return categoryData.map(c => ({
      name: c.name,
      size: c.value,
      productCount: c.productCount,
    }));
  }, [categoryData]);

  // Render Overview Tab
  const renderOverview = () => (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-3">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 h-full">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              <CurrencyDollarIcon className="w-4 h-4 mr-2" />
              Toplam Stok Değeri
            </p>
            <div className="text-3xl font-bold text-slate-900">
              {formatCurrency(valuationData?.totalValue || kpis?.totalStockValue || 0)}
            </div>
            {valuationSummary?.valueChangePercent !== undefined && (
              <div className="mt-2">
                <Tag className={valuationSummary.valueChangePercent >= 0 ? '!bg-slate-900 !text-white !border-slate-900' : '!bg-slate-400 !text-white !border-slate-400'}>
                  {valuationSummary.valueChangePercent >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  {formatPercentage(Math.abs(valuationSummary.valueChangePercent))} önceki aya göre
                </Tag>
              </div>
            )}
          </div>
        </div>
        <div className="col-span-3">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 h-full">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              <Squares2X2Icon className="w-4 h-4 mr-2" />
              Toplam Ürün Sayısı
            </p>
            <div className="text-3xl font-bold text-slate-900">
              {formatNumber(valuationData?.totalProducts || kpis?.totalProducts || 0)}
            </div>
            <p className="text-sm text-slate-500 mt-2">{valuationData?.totalSKUs || 0} farklı SKU</p>
          </div>
        </div>
        <div className="col-span-3">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 h-full">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              <InboxIcon className="w-4 h-4 mr-2" />
              Toplam Miktar
            </p>
            <div className="text-3xl font-bold text-slate-900">
              {formatNumber(valuationData?.totalQuantity || kpis?.totalStockQuantity || 0)}
            </div>
            <p className="text-sm text-slate-500 mt-2">adet</p>
          </div>
        </div>
        <div className="col-span-3">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 h-full">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              <ChartBarIcon className="w-4 h-4 mr-2" />
              Ortalama Birim Maliyet
            </p>
            <div className="text-3xl font-bold text-slate-900">
              {formatCurrency(valuationSummary?.averageUnitCost || 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-12 gap-6">
        {/* Stock Movement Trend */}
        <div className="col-span-8">
          <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
            <div className="flex items-center justify-between mb-5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                <ChartBarIcon className="w-4 h-4 mr-2" />
                Stok Hareket Trendi
              </p>
              <Select
                value={trendDays}
                onChange={setTrendDays}
                style={{ width: 120 }}
                className="[&_.ant-select-selector]:!border-slate-300"
                options={[
                  { label: 'Son 7 Gün', value: 7 },
                  { label: 'Son 14 Gün', value: 14 },
                  { label: 'Son 30 Gün', value: 30 },
                  { label: 'Son 90 Gün', value: 90 },
                ]}
              />
            </div>
            {movementTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={movementTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                  <YAxis yAxisId="left" stroke="#94a3b8" fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={12} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="giren" name="Giren" fill="#1e293b" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="left" dataKey="cikan" name="Çıkan" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="net" name="Net Değişim" stroke="#475569" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="Veri bulunamadı" />
            )}
          </div>
        </div>

        {/* Alert Summary */}
        <div className="col-span-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
            <div className="flex items-center justify-between mb-5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                Uyarılar
              </p>
              <Link href="/inventory/stock-alerts" className="text-xs text-slate-500 hover:text-slate-900">
                Tümü →
              </Link>
            </div>
            <div className="h-[280px] overflow-auto">
              {alerts.length > 0 ? (
                <div className="space-y-3">
                  {alerts.slice(0, 8).map((alert, index) => (
                    <div key={index} className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-start gap-3">
                        {alert.severity === 'Critical' ? (
                          <ExclamationCircleIcon className="w-4 h-4 text-slate-900" />
                        ) : alert.severity === 'High' ? (
                          <ExclamationTriangleIcon className="w-4 h-4 text-slate-600" />
                        ) : (
                          <InformationCircleIcon className="w-4 h-4 text-slate-400" />
                        )}
                        <div>
                          <p className="font-medium text-slate-900 text-sm">{alert.productName || alert.alertType}</p>
                          <p className="text-xs text-slate-500">{alert.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Empty description="Aktif uyarı yok" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-12 gap-6">
        {/* Category Distribution */}
        <div className="col-span-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">
              <ChartPieIcon className="w-4 h-4 mr-2" />
              Kategorilere Göre Dağılım
            </p>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${formatPercentage((percent || 0) * 100)})`}
                    labelLine={false}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="Veri bulunamadı" />
            )}
          </div>
        </div>

        {/* Warehouse Distribution */}
        <div className="col-span-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">
              <BuildingStorefrontIcon className="w-4 h-4 mr-2" />
              Depolara Göre Dağılım
            </p>
            {warehouseData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={warehouseData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tickFormatter={(value) => formatCompactNumber(value)} stroke="#94a3b8" fontSize={12} />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="value" name="Değer" radius={[0, 4, 4, 0]}>
                    {warehouseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="Veri bulunamadı" />
            )}
          </div>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">
          <CurrencyDollarIcon className="w-4 h-4 mr-2" />
          En Değerli Ürünler (Top 15)
        </p>
        <Table
          dataSource={topProductsData}
          columns={[
            {
              title: 'Ürün Kodu',
              dataIndex: 'code',
              key: 'code',
              width: 120,
            },
            {
              title: 'Ürün Adı',
              dataIndex: 'fullName',
              key: 'fullName',
              ellipsis: true,
            },
            {
              title: 'Kategori',
              dataIndex: 'category',
              key: 'category',
              width: 150,
              render: (text) => text || '-',
            },
            {
              title: 'Miktar',
              dataIndex: 'quantity',
              key: 'quantity',
              width: 100,
              align: 'right' as const,
              render: (value) => formatNumber(value),
            },
            {
              title: 'Birim Maliyet',
              dataIndex: 'unitCost',
              key: 'unitCost',
              width: 130,
              align: 'right' as const,
              render: (value) => formatCurrency(value),
            },
            {
              title: 'Toplam Değer',
              dataIndex: 'value',
              key: 'value',
              width: 150,
              align: 'right' as const,
              render: (value) => (
                <span className="font-bold text-slate-900">{formatCurrency(value)}</span>
              ),
            },
            {
              title: 'Oran',
              dataIndex: 'percentage',
              key: 'percentage',
              width: 100,
              render: (value) => (
                <Progress
                  percent={value}
                  size="small"
                  format={() => formatPercentage(value)}
                  strokeColor="#1e293b"
                />
              ),
            },
          ]}
          rowKey="code"
          pagination={false}
          size="small"
          scroll={{ x: 900 }}
          className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs"
        />
      </div>
    </div>
  );

  // Render Valuation Tab
  const renderValuation = () => (
    <div className="space-y-6">
      {/* Valuation Summary Cards */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-3">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              <ArrowTrendingUpIcon className="w-4 h-4 mr-2" />
              En Yüksek Değerli Ürün
            </p>
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(valuationSummary?.highestValueProduct || 0)}
            </div>
          </div>
        </div>
        <div className="col-span-3">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              <FallOutlined className="mr-2" />
              En Düşük Değerli Ürün
            </p>
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(valuationSummary?.lowestValueProduct || 0)}
            </div>
          </div>
        </div>
        <div className="col-span-3">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              <ChartBarIcon className="w-4 h-4 mr-2" />
              Medyan Ürün Değeri
            </p>
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(valuationSummary?.medianProductValue || 0)}
            </div>
          </div>
        </div>
        <div className="col-span-3">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              <ClockIcon className="w-4 h-4 mr-2" />
              Tarih
            </p>
            <div className="text-2xl font-bold text-slate-900">
              {valuationData?.asOfDate ? dayjs(valuationData.asOfDate).format('DD/MM/YYYY') : '-'}
            </div>
          </div>
        </div>
      </div>

      {/* Treemap */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">
          <Squares2X2Icon className="w-4 h-4 mr-2" />
          Kategori Bazlı Stok Değeri (Treemap)
        </p>
        {treemapData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <Treemap
              data={treemapData}
              dataKey="size"
              aspectRatio={4 / 3}
              stroke="#fff"
              fill="#1e293b"
              content={({ x, y, width, height, name, size }: any) => (
                <g>
                  <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    style={{
                      fill: MONOCHROME_COLORS[treemapData.findIndex(d => d.name === name) % MONOCHROME_COLORS.length],
                      stroke: '#fff',
                      strokeWidth: 2,
                    }}
                  />
                  {width > 80 && height > 40 && (
                    <>
                      <text
                        x={x + width / 2}
                        y={y + height / 2 - 8}
                        textAnchor="middle"
                        fill="#fff"
                        fontSize={12}
                        fontWeight="bold"
                      >
                        {name}
                      </text>
                      <text
                        x={x + width / 2}
                        y={y + height / 2 + 8}
                        textAnchor="middle"
                        fill="#fff"
                        fontSize={10}
                      >
                        {formatCurrency(size as number)}
                      </text>
                    </>
                  )}
                </g>
              )}
            />
          </ResponsiveContainer>
        ) : (
          <Empty description="Veri bulunamadı" />
        )}
      </div>

      {/* Category Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">
          <ChartPieIcon className="w-4 h-4 mr-2" />
          Kategori Bazlı Detaylı Rapor
        </p>
        <Table
          dataSource={categoryData}
          columns={[
            {
              title: 'Kategori',
              dataIndex: 'name',
              key: 'name',
            },
            {
              title: 'Ürün Sayısı',
              dataIndex: 'productCount',
              key: 'productCount',
              align: 'right' as const,
              render: (value) => formatNumber(value),
            },
            {
              title: 'Toplam Miktar',
              dataIndex: 'quantity',
              key: 'quantity',
              align: 'right' as const,
              render: (value) => formatNumber(value),
            },
            {
              title: 'Toplam Değer',
              dataIndex: 'value',
              key: 'value',
              align: 'right' as const,
              render: (value) => (
                <span className="font-bold text-slate-900">{formatCurrency(value)}</span>
              ),
              sorter: (a, b) => a.value - b.value,
              defaultSortOrder: 'descend' as const,
            },
            {
              title: 'Oran',
              dataIndex: 'percentage',
              key: 'percentage',
              width: 150,
              render: (value) => (
                <Progress
                  percent={value}
                  size="small"
                  format={() => formatPercentage(value)}
                  strokeColor="#1e293b"
                />
              ),
            },
          ]}
          rowKey="name"
          pagination={false}
          size="small"
          className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs"
          summary={(pageData) => {
            const totalValue = pageData.reduce((sum, row) => sum + row.value, 0);
            const totalQuantity = pageData.reduce((sum, row) => sum + row.quantity, 0);
            const totalProducts = pageData.reduce((sum, row) => sum + row.productCount, 0);
            return (
              <Table.Summary.Row className="bg-slate-50">
                <Table.Summary.Cell index={0}>
                  <span className="font-bold text-slate-900">TOPLAM</span>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">
                  <span className="font-bold text-slate-900">{formatNumber(totalProducts)}</span>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} align="right">
                  <span className="font-bold text-slate-900">{formatNumber(totalQuantity)}</span>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3} align="right">
                  <span className="font-bold text-slate-900">{formatCurrency(totalValue)}</span>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4}>
                  <span className="font-bold text-slate-900">%100</span>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }}
        />
      </div>
    </div>
  );

  // Render KPIs Tab
  const renderKPIs = () => (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center gap-4">
          <p className="text-sm font-medium text-slate-700">Rapor Dönemi:</p>
          <RangePicker
            value={kpiDateRange}
            onChange={(dates) => {
              if (dates && dates[0] && dates[1]) {
                setKpiDateRange([dates[0], dates[1]]);
              }
            }}
            format="DD/MM/YYYY"
            className="[&_.ant-picker-input_input]:!text-slate-700"
          />
        </div>
      </div>

      {/* KPI Cards */}
      {kpisData && (
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-3">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                <ArrowDownOutlined className="mr-2" />
                Toplam Giriş
              </p>
              <div className="text-3xl font-bold">
                {formatNumber(kpisData.totalInboundQuantity || 0)}
              </div>
              <div className="text-sm text-slate-400 mt-2">
                {kpisData.totalInboundMovements || 0} hareket
              </div>
            </div>
          </div>
          <div className="col-span-3">
            <div className="bg-slate-700 border border-slate-600 rounded-xl p-5 text-white">
              <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                <ArrowUpOutlined className="mr-2" />
                Toplam Çıkış
              </p>
              <div className="text-3xl font-bold">
                {formatNumber(kpisData.totalOutboundQuantity || 0)}
              </div>
              <div className="text-sm text-slate-400 mt-2">
                {kpisData.totalOutboundMovements || 0} hareket
              </div>
            </div>
          </div>
          <div className="col-span-3">
            <div className="bg-slate-500 border border-slate-400 rounded-xl p-5 text-white">
              <p className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
                <ArrowPathIcon className="w-4 h-4 mr-2" />
                Stok Devir Oranı
              </p>
              <div className="text-3xl font-bold">
                {(kpisData.inventoryTurnoverRatio || 0).toFixed(2)}x
              </div>
              <div className="text-sm text-slate-300 mt-2">
                ~{kpisData.daysOfInventory || 0} gün stok
              </div>
            </div>
          </div>
          <div className="col-span-3">
            <div className="bg-slate-300 border border-slate-200 rounded-xl p-5">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
                <SwapOutlined className="mr-2" />
                Günlük Ort. Hareket
              </p>
              <div className="text-3xl font-bold text-slate-900">
                {(kpisData.averageMovementsPerDay || 0).toFixed(1)}
              </div>
              <div className="text-sm text-slate-600 mt-2">
                Stoksuzluk: %{(kpisData.stockoutRate || 0).toFixed(1)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-12 gap-6">
        {/* Turnover by Category */}
        {kpisData?.turnoverByCategory && kpisData.turnoverByCategory.length > 0 && (
          <div className="col-span-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">
                <ChartBarIcon className="w-4 h-4 mr-2" />
                Kategorilere Göre Devir Hızı
              </p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={kpisData.turnoverByCategory.map((c) => ({
                    name: c.categoryName,
                    turnover: c.turnoverRatio,
                    days: c.daysOfInventory,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <RechartsTooltip />
                  <Bar dataKey="turnover" name="Devir Oranı" radius={[4, 4, 0, 0]}>
                    {kpisData.turnoverByCategory.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={MONOCHROME_COLORS[index % MONOCHROME_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Turnover Rate Dashboard */}
        {kpisData?.inventoryTurnoverRatio !== undefined && (
          <div className="col-span-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">
                <ArrowPathIcon className="w-4 h-4 mr-2" />
                Stok Devir Performansı
              </p>
              <div className="text-center py-8">
                <Progress
                  type="dashboard"
                  percent={Math.min(kpisData.inventoryTurnoverRatio * 10, 100)}
                  format={() => (
                    <div>
                      <div className="text-2xl font-bold text-slate-900">
                        {kpisData.inventoryTurnoverRatio?.toFixed(2)}x
                      </div>
                      <div className="text-xs text-slate-500">Devir Hızı</div>
                    </div>
                  )}
                  strokeColor="#1e293b"
                  trailColor="#e2e8f0"
                />
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <div className="text-sm text-slate-500">Doluluk Oranı</div>
                    <div className="text-lg font-bold text-slate-900">
                      %{((kpisData.fillRate || 0) * 100).toFixed(1)}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <div className="text-sm text-slate-500">Fire Oranı</div>
                    <div className="text-lg font-bold text-slate-900">
                      %{((kpisData.shrinkageRate || 0) * 100).toFixed(1)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const tabItems = [
    {
      key: 'overview',
      label: (
        <span>
          <Squares2X2Icon className="w-4 h-4" /> Genel Bakış
        </span>
      ),
      children: renderOverview(),
    },
    {
      key: 'valuation',
      label: (
        <span>
          <CurrencyDollarIcon className="w-4 h-4" /> Stok Değerleme
        </span>
      ),
      children: renderValuation(),
    },
    {
      key: 'kpis',
      label: (
        <span>
          <ChartBarIcon className="w-4 h-4" /> KPI Raporu
        </span>
      ),
      children: renderKPIs(),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <Spin spinning={isLoading}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Envanter Analitikleri</h1>
            <p className="text-sm text-slate-500 mt-1">Stok değerleme, hareket analizi ve performans metrikleri</p>
          </div>
          <Space>
            <Select
              placeholder="Tüm Depolar"
              allowClear
              style={{ width: 180 }}
              value={selectedWarehouseId}
              onChange={setSelectedWarehouseId}
              options={warehouses.map((w: any) => ({
                label: w.name,
                value: w.id,
              }))}
              className="[&_.ant-select-selector]:!border-slate-300"
            />
            <Select
              placeholder="Tüm Kategoriler"
              allowClear
              style={{ width: 180 }}
              value={selectedCategoryId}
              onChange={setSelectedCategoryId}
              options={categories.map((c: any) => ({
                label: c.name,
                value: c.id,
              }))}
              className="[&_.ant-select-selector]:!border-slate-300"
            />
            <Tooltip title="Yenile">
              <Button
                icon={<ArrowPathIcon className="w-4 h-4" spin={isLoading} />}
                onClick={() => refetchDashboard()}
                className="!border-slate-300 !text-slate-600 hover:!text-slate-900"
              />
            </Tooltip>
            <Button icon={<ArrowDownTrayIcon className="w-4 h-4" />} className="!border-slate-300 !text-slate-600 hover:!text-slate-900">
              Rapor İndir
            </Button>
          </Space>
        </div>

        {/* Tabs */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <Tabs
            items={tabItems}
            size="large"
            className="[&_.ant-tabs-tab]:!text-slate-600 [&_.ant-tabs-tab-active_.ant-tabs-tab-btn]:!text-slate-900 [&_.ant-tabs-ink-bar]:!bg-slate-900"
          />
        </div>
      </Spin>
    </div>
  );
}
