'use client';

import React, { useState, useMemo } from 'react';
import {
  Button,
  Space,
  Select,
  DatePicker,
  Tabs,
  Table,
  Tag,
  Empty,
  Dropdown,
  message,
} from 'antd';
import {
  ArrowDownIcon,
  ArrowPathIcon,
  ArrowsRightLeftIcon,
  ArrowUpIcon,
  BoltIcon,
  ChartBarIcon,
  ChartPieIcon,
  CurrencyDollarIcon,
  DocumentIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  InboxIcon,
} from '@heroicons/react/24/outline';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import {
  useProducts,
  useWarehouses,
  useCategories,
  useStockMovements,
  useStockTransfers,
  useLowStockProducts,
} from '@/lib/api/hooks/useInventory';
import type { ProductDto, StockMovementDto, CategoryDto } from '@/lib/api/services/inventory.types';
import dayjs from 'dayjs';
import { exportToPDF, exportToExcel } from '@/lib/utils/export-utils';

const { RangePicker } = DatePicker;

// Monochrome color palette (matching dashboard)
const MONOCHROME_COLORS = ['#1e293b', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0', '#f1f5f9'];

// Custom tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-sm">
        <p className="font-medium text-slate-900 mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString('tr-TR') : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function InventoryReportsPage() {
  // Filters
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([
    dayjs().subtract(30, 'day'),
    dayjs(),
  ]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();

  // Data hooks
  const { data: products = [], refetch: refetchProducts, isLoading: productsLoading } = useProducts(true);
  const { data: warehouses = [] } = useWarehouses();
  const { data: categories = [] } = useCategories();
  const { data: movements = [] } = useStockMovements(
    undefined,
    selectedWarehouse,
    undefined,
    dateRange[0]?.toISOString(),
    dateRange[1]?.toISOString()
  );
  const { data: transfers = [] } = useStockTransfers(
    selectedWarehouse,
    undefined,
    undefined,
    dateRange[0]?.toISOString(),
    dateRange[1]?.toISOString()
  );
  const { data: lowStockProducts = [] } = useLowStockProducts();

  // ============= STOCK VALUE ANALYSIS =============
  const stockValueByCategory = useMemo(() => {
    const categoryMap = new Map<number, { name: string; value: number; count: number }>();

    products.forEach((product: ProductDto) => {
      const categoryId = product.categoryId || 0;
      const categoryName = categories.find((c: CategoryDto) => c.id === categoryId)?.name || 'Diğer';
      const stockValue = (product.unitPrice || 0) * product.totalStockQuantity;

      const existing = categoryMap.get(categoryId);
      if (existing) {
        existing.value += stockValue;
        existing.count += 1;
      } else {
        categoryMap.set(categoryId, { name: categoryName, value: stockValue, count: 1 });
      }
    });

    return Array.from(categoryMap.values())
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [products, categories]);

  const totalStockValue = useMemo(() => {
    return products.reduce(
      (sum: number, p: ProductDto) => sum + (p.unitPrice || 0) * p.totalStockQuantity,
      0
    );
  }, [products]);

  const totalStockQuantity = useMemo(() => {
    return products.reduce((sum: number, p: ProductDto) => sum + p.totalStockQuantity, 0);
  }, [products]);

  // ============= MOVEMENT ANALYSIS =============
  const movementsByType = useMemo(() => {
    const typeMap = new Map<string, number>();

    movements.forEach((m: StockMovementDto) => {
      const type = m.movementType;
      typeMap.set(type, (typeMap.get(type) || 0) + 1);
    });

    const typeLabels: Record<string, string> = {
      Purchase: 'Satın Alma',
      Sales: 'Satış',
      Transfer: 'Transfer',
      AdjustmentIncrease: 'Artış',
      AdjustmentDecrease: 'Azalış',
      PurchaseReturn: 'Alış İadesi',
      SalesReturn: 'Satış İadesi',
    };

    return Array.from(typeMap.entries()).map(([type, count]) => ({
      name: typeLabels[type] || type,
      value: count,
    }));
  }, [movements]);

  const movementTrend = useMemo(() => {
    const dayMap = new Map<string, { date: string; giren: number; cikan: number }>();

    // Initialize last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = dayjs().subtract(i, 'day').format('MM/DD');
      dayMap.set(date, { date, giren: 0, cikan: 0 });
    }

    movements.forEach((m: StockMovementDto) => {
      const date = dayjs(m.movementDate).format('MM/DD');
      const entry = dayMap.get(date);
      if (entry) {
        if (['Purchase', 'SalesReturn', 'AdjustmentIncrease', 'Found'].includes(m.movementType)) {
          entry.giren += m.quantity;
        } else {
          entry.cikan += m.quantity;
        }
      }
    });

    return Array.from(dayMap.values());
  }, [movements]);

  // ============= ABC ANALYSIS =============
  const abcAnalysis = useMemo(() => {
    const sortedProducts = [...products]
      .map((p: ProductDto) => ({
        ...p,
        stockValue: (p.unitPrice || 0) * p.totalStockQuantity,
      }))
      .sort((a, b) => b.stockValue - a.stockValue);

    const totalValue = sortedProducts.reduce((sum, p) => sum + p.stockValue, 0);
    let cumulative = 0;

    const classified = sortedProducts.map((p) => {
      cumulative += p.stockValue;
      const percentage = (cumulative / totalValue) * 100;
      let category: 'A' | 'B' | 'C';
      if (percentage <= 80) category = 'A';
      else if (percentage <= 95) category = 'B';
      else category = 'C';
      return { ...p, category, cumulativePercentage: percentage };
    });

    return {
      products: classified.slice(0, 20),
      summary: {
        A: classified.filter((p) => p.category === 'A').length,
        B: classified.filter((p) => p.category === 'B').length,
        C: classified.filter((p) => p.category === 'C').length,
      },
    };
  }, [products]);

  // ============= EXPORT HANDLERS =============
  const handleExport = (format: 'pdf' | 'excel', reportType: string) => {
    let data: any[] = [];
    let columns: any[] = [];
    let title = '';

    switch (reportType) {
      case 'stock-value':
        title = 'Stok Değeri Raporu';
        columns = [
          { key: 'name', header: 'Kategori' },
          { key: 'value', header: 'Değer (₺)', formatter: (v: number) => v.toLocaleString('tr-TR') },
          { key: 'count', header: 'Ürün Sayısı' },
        ];
        data = stockValueByCategory;
        break;
      case 'abc':
        title = 'ABC Analizi Raporu';
        columns = [
          { key: 'name', header: 'Ürün' },
          { key: 'code', header: 'Kod' },
          { key: 'stockValue', header: 'Stok Değeri', formatter: (v: number) => `₺${v.toLocaleString('tr-TR')}` },
          { key: 'category', header: 'Sınıf' },
        ];
        data = abcAnalysis.products;
        break;
      case 'movements':
        title = 'Stok Hareketleri Özeti';
        columns = [
          { key: 'name', header: 'Hareket Türü' },
          { key: 'value', header: 'Adet' },
        ];
        data = movementsByType;
        break;
    }

    if (format === 'pdf') {
      exportToPDF({
        columns,
        data,
        options: {
          title,
          filename: `${reportType}-${dayjs().format('YYYY-MM-DD')}`,
          summaryData: [
            { label: 'Rapor Tarihi', value: dayjs().format('DD/MM/YYYY HH:mm') },
            { label: 'Tarih Aralığı', value: `${dateRange[0]?.format('DD/MM/YYYY')} - ${dateRange[1]?.format('DD/MM/YYYY')}` },
          ],
        },
      });
    } else {
      exportToExcel({
        columns,
        data,
        options: {
          title,
          filename: `${reportType}-${dayjs().format('YYYY-MM-DD')}`,
          summaryData: [
            { label: 'Rapor Tarihi', value: dayjs().format('DD/MM/YYYY HH:mm') },
          ],
        },
      });
    }
  };

  // Tab items
  const tabItems = [
    {
      key: 'value',
      label: (
        <span>
          <CurrencyDollarIcon className="w-4 h-4" /> Stok Değeri
        </span>
      ),
      children: (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 h-full">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  <CurrencyDollarIcon className="w-4 h-4 mr-2" />
                  Toplam Stok Değeri
                </p>
                <div className="text-3xl font-bold text-slate-900">
                  ₺{totalStockValue.toLocaleString('tr-TR')}
                </div>
              </div>
            </div>
            <div className="col-span-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 h-full">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  <InboxIcon className="w-4 h-4 mr-2" />
                  Toplam Stok Miktarı
                </p>
                <div className="text-3xl font-bold text-slate-900">
                  {totalStockQuantity.toLocaleString('tr-TR')}
                </div>
              </div>
            </div>
            <div className="col-span-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 h-full">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  <ChartBarIcon className="w-4 h-4 mr-2" />
                  Ortalama Ürün Değeri
                </p>
                <div className="text-3xl font-bold text-slate-900">
                  ₺{products.length > 0 ? Math.round(totalStockValue / products.length).toLocaleString('tr-TR') : 0}
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Kategoriye Göre Stok Değeri
                  </p>
                  <Space>
                    <Button size="small" icon={<DocumentIcon className="w-4 h-4" />} onClick={() => handleExport('pdf', 'stock-value')} className="!border-slate-300 !text-slate-600 hover:!text-slate-900">
                      PDF
                    </Button>
                    <Button size="small" icon={<DocumentIcon className="w-4 h-4" />} onClick={() => handleExport('excel', 'stock-value')} className="!border-slate-300 !text-slate-600 hover:!text-slate-900">
                      Excel
                    </Button>
                  </Space>
                </div>
                {stockValueByCategory.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={stockValueByCategory} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" tickFormatter={(v) => `₺${(v / 1000).toFixed(0)}K`} stroke="#94a3b8" fontSize={12} />
                      <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11, fill: '#64748b' }} />
                      <RechartsTooltip
                        formatter={(value) => [`₺${(value ?? 0).toLocaleString('tr-TR')}`, 'Değer']}
                      />
                      <Bar dataKey="value" fill="#1e293b" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Empty description="Veri bulunamadı" />
                )}
              </div>
            </div>

            <div className="col-span-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">
                  Kategoriye Göre Dağılım
                </p>
                {stockValueByCategory.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={stockValueByCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
                      >
                        {stockValueByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={MONOCHROME_COLORS[index % MONOCHROME_COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Empty description="Veri bulunamadı" />
                )}
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'movements',
      label: (
        <span>
          <ArrowsRightLeftIcon className="w-4 h-4" /> Hareketler
        </span>
      ),
      children: (
        <div className="space-y-6">
          {/* Movement Summary */}
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 h-full">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  <ArrowsRightLeftIcon className="w-4 h-4 mr-2" />
                  Toplam Hareket
                </p>
                <div className="text-3xl font-bold text-slate-900">
                  {movements.length}
                </div>
              </div>
            </div>
            <div className="col-span-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 h-full">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  <ArrowUpIcon className="w-4 h-4 mr-2" />
                  Giriş Hareketleri
                </p>
                <div className="text-3xl font-bold text-slate-900">
                  {movements.filter((m: StockMovementDto) =>
                    ['Purchase', 'SalesReturn', 'AdjustmentIncrease'].includes(m.movementType)
                  ).length}
                </div>
              </div>
            </div>
            <div className="col-span-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 h-full">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  <ArrowDownIcon className="w-4 h-4 mr-2" />
                  Çıkış Hareketleri
                </p>
                <div className="text-3xl font-bold text-slate-900">
                  {movements.filter((m: StockMovementDto) =>
                    ['Sales', 'PurchaseReturn', 'AdjustmentDecrease'].includes(m.movementType)
                  ).length}
                </div>
              </div>
            </div>
          </div>

          {/* Movement Trend */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Hareket Trendi (Son 30 Gün)
              </p>
              <Space>
                <Button size="small" icon={<DocumentIcon className="w-4 h-4" />} onClick={() => handleExport('pdf', 'movements')} className="!border-slate-300 !text-slate-600 hover:!text-slate-900">
                  PDF
                </Button>
                <Button size="small" icon={<DocumentIcon className="w-4 h-4" />} onClick={() => handleExport('excel', 'movements')} className="!border-slate-300 !text-slate-600 hover:!text-slate-900">
                  Excel
                </Button>
              </Space>
            </div>
            {movementTrend.some(d => d.giren > 0 || d.cikan > 0) ? (
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={movementTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="giren"
                    name="Giren"
                    stackId="1"
                    stroke="#1e293b"
                    fill="#1e293b"
                    fillOpacity={0.7}
                  />
                  <Area
                    type="monotone"
                    dataKey="cikan"
                    name="Çıkan"
                    stackId="2"
                    stroke="#94a3b8"
                    fill="#94a3b8"
                    fillOpacity={0.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="Henüz hareket verisi oluşmadı" />
            )}
          </div>

          <div className="grid grid-cols-12 gap-6">
            {/* Movement by Type */}
            <div className="col-span-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">
                  Hareket Türlerine Göre Dağılım
                </p>
                {movementsByType.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={movementsByType}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label
                      >
                        {movementsByType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={MONOCHROME_COLORS[index % MONOCHROME_COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Empty description="Veri bulunamadı" />
                )}
              </div>
            </div>

            {/* Transfer Summary */}
            <div className="col-span-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">
                  Transfer Özeti
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl text-center">
                    <div className="text-sm text-slate-500 mb-1">Toplam Transfer</div>
                    <div className="text-2xl font-bold text-slate-900">{transfers.length}</div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl text-center">
                    <div className="text-sm text-slate-500 mb-1">Tamamlanan</div>
                    <div className="text-2xl font-bold text-slate-900">
                      {transfers.filter((t: any) => t.status === 'Completed').length}
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl text-center">
                    <div className="text-sm text-slate-500 mb-1">Bekleyen</div>
                    <div className="text-2xl font-bold text-slate-600">
                      {transfers.filter((t: any) => t.status === 'Pending').length}
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl text-center">
                    <div className="text-sm text-slate-500 mb-1">Yolda</div>
                    <div className="text-2xl font-bold text-slate-600">
                      {transfers.filter((t: any) => t.status === 'InTransit').length}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'abc',
      label: (
        <span>
          <ChartPieIcon className="w-4 h-4" /> ABC Analizi
        </span>
      ),
      children: (
        <div className="space-y-6">
          {/* ABC Summary */}
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 h-full">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  A Sınıfı Ürünler
                </p>
                <div className="text-3xl font-bold text-white">
                  {abcAnalysis.summary.A}
                  <span className="text-lg text-slate-400 ml-2">/ {products.length}</span>
                </div>
                <p className="text-sm text-slate-500 mt-2">%80 değer, yüksek öncelik</p>
              </div>
            </div>
            <div className="col-span-4">
              <div className="bg-slate-600 border border-slate-500 rounded-xl p-5 h-full">
                <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                  B Sınıfı Ürünler
                </p>
                <div className="text-3xl font-bold text-white">
                  {abcAnalysis.summary.B}
                  <span className="text-lg text-slate-400 ml-2">/ {products.length}</span>
                </div>
                <p className="text-sm text-slate-400 mt-2">%15 değer, orta öncelik</p>
              </div>
            </div>
            <div className="col-span-4">
              <div className="bg-slate-300 border border-slate-200 rounded-xl p-5 h-full">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
                  C Sınıfı Ürünler
                </p>
                <div className="text-3xl font-bold text-slate-900">
                  {abcAnalysis.summary.C}
                  <span className="text-lg text-slate-600 ml-2">/ {products.length}</span>
                </div>
                <p className="text-sm text-slate-600 mt-2">%5 değer, düşük öncelik</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6">
            {/* ABC Distribution */}
            <div className="col-span-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">
                  ABC Sınıfı Dağılımı
                </p>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'A Sınıfı', value: abcAnalysis.summary.A, color: '#1e293b' },
                        { name: 'B Sınıfı', value: abcAnalysis.summary.B, color: '#64748b' },
                        { name: 'C Sınıfı', value: abcAnalysis.summary.C, color: '#cbd5e1' },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                      label
                    >
                      <Cell fill="#1e293b" />
                      <Cell fill="#64748b" />
                      <Cell fill="#cbd5e1" />
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top A Class Products */}
            <div className="col-span-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    En Değerli A Sınıfı Ürünler
                  </p>
                  <Space>
                    <Button size="small" icon={<DocumentIcon className="w-4 h-4" />} onClick={() => handleExport('pdf', 'abc')} className="!border-slate-300 !text-slate-600 hover:!text-slate-900">
                      PDF
                    </Button>
                    <Button size="small" icon={<DocumentIcon className="w-4 h-4" />} onClick={() => handleExport('excel', 'abc')} className="!border-slate-300 !text-slate-600 hover:!text-slate-900">
                      Excel
                    </Button>
                  </Space>
                </div>
                <Table
                  dataSource={abcAnalysis.products.filter((p) => p.category === 'A').slice(0, 10)}
                  rowKey="id"
                  pagination={false}
                  size="small"
                  className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs"
                  columns={[
                    { title: 'Ürün', dataIndex: 'name', key: 'name', ellipsis: true },
                    { title: 'Kod', dataIndex: 'code', key: 'code', width: 100 },
                    {
                      title: 'Stok Değeri',
                      dataIndex: 'stockValue',
                      key: 'stockValue',
                      width: 120,
                      align: 'right' as const,
                      render: (v: number) => `₺${v.toLocaleString('tr-TR')}`,
                    },
                    {
                      title: 'Sınıf',
                      dataIndex: 'category',
                      key: 'category',
                      width: 60,
                      render: (c: string) => (
                        <Tag className={c === 'A' ? '!bg-slate-900 !text-white !border-slate-900' : c === 'B' ? '!bg-slate-500 !text-white !border-slate-500' : '!bg-slate-200 !text-slate-700 !border-slate-200'}>{c}</Tag>
                      ),
                    },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'alerts',
      label: (
        <span>
          <ExclamationTriangleIcon className="w-4 h-4" /> Uyarılar
        </span>
      ),
      children: (
        <div className="space-y-6">
          {/* Low Stock Summary */}
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-6">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                  Düşük Stoklu Ürünler
                </p>
                <div className="text-3xl font-bold text-slate-900">
                  {lowStockProducts.length}
                </div>
              </div>
            </div>
            <div className="col-span-6">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  <InboxIcon className="w-4 h-4 mr-2" />
                  Stokta Olmayan Ürünler
                </p>
                <div className="text-3xl font-bold text-slate-900">
                  {products.filter((p: ProductDto) => p.totalStockQuantity === 0 && p.isActive).length}
                </div>
              </div>
            </div>
          </div>

          {/* Low Stock Products Table */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">
              Düşük Stoklu Ürünler Listesi
            </p>
            {lowStockProducts.length > 0 ? (
              <Table
                dataSource={lowStockProducts}
                rowKey="productId"
                pagination={{ pageSize: 10 }}
                size="small"
                className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs"
                columns={[
                  { title: 'Ürün', dataIndex: 'productName', key: 'productName', ellipsis: true },
                  { title: 'Kod', dataIndex: 'productCode', key: 'productCode', width: 100 },
                  { title: 'Depo', dataIndex: 'warehouseName', key: 'warehouseName', width: 120 },
                  {
                    title: 'Mevcut Stok',
                    dataIndex: 'currentQuantity',
                    key: 'currentQuantity',
                    width: 100,
                    align: 'right' as const,
                    render: (v: number, record: any) => (
                      <span className={v <= record.minimumQuantity / 2 ? 'text-slate-900 font-bold' : 'text-slate-600'}>
                        {v}
                      </span>
                    ),
                  },
                  {
                    title: 'Minimum',
                    dataIndex: 'minimumQuantity',
                    key: 'minimumQuantity',
                    width: 100,
                    align: 'right' as const,
                  },
                  {
                    title: 'Eksik',
                    key: 'shortage',
                    width: 100,
                    align: 'right' as const,
                    render: (_: any, record: any) => (
                      <Tag className="!bg-slate-900 !text-white !border-slate-900">{record.minimumQuantity - record.currentQuantity}</Tag>
                    ),
                  },
                ]}
              />
            ) : (
              <Empty description="Düşük stoklu ürün yok" />
            )}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Envanter Raporları</h1>
          <p className="text-sm text-slate-500 mt-1">Stok analizi, hareket raporları ve performans metrikleri</p>
        </div>
        <Space>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'daily-stock',
                  icon: <DocumentTextIcon className="w-4 h-4" />,
                  label: 'Günlük Stok Raporu',
                  onClick: () => {
                    handleExport('pdf', 'stock-value');
                    message.success('Günlük Stok Raporu oluşturuluyor...');
                  },
                },
                {
                  key: 'weekly-movements',
                  icon: <ArrowsRightLeftIcon className="w-4 h-4" />,
                  label: 'Haftalık Hareket Raporu',
                  onClick: () => {
                    setDateRange([dayjs().subtract(7, 'day'), dayjs()]);
                    handleExport('excel', 'movements');
                    message.success('Haftalık Hareket Raporu oluşturuluyor...');
                  },
                },
                {
                  key: 'monthly-analysis',
                  icon: <ChartBarIcon className="w-4 h-4" />,
                  label: 'Aylık ABC Analizi',
                  onClick: () => {
                    setDateRange([dayjs().subtract(30, 'day'), dayjs()]);
                    handleExport('excel', 'abc-analysis');
                    message.success('Aylık ABC Analizi oluşturuluyor...');
                  },
                },
                { type: 'divider' },
                {
                  key: 'low-stock-alert',
                  icon: <ExclamationTriangleIcon className="w-4 h-4" />,
                  label: 'Düşük Stok Uyarı Raporu',
                  onClick: () => {
                    handleExport('pdf', 'alerts');
                    message.success('Düşük Stok Uyarı Raporu oluşturuluyor...');
                  },
                },
                {
                  key: 'full-inventory',
                  icon: <InboxIcon className="w-4 h-4" />,
                  label: 'Tam Envanter Listesi',
                  onClick: () => {
                    handleExport('excel', 'stock-value');
                    message.success('Tam Envanter Listesi oluşturuluyor...');
                  },
                },
              ],
            }}
            placement="bottomRight"
          >
            <Button type="primary" icon={<BoltIcon className="w-4 h-4" />} className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900">
              Hızlı Rapor Şablonları
            </Button>
          </Dropdown>
        </Space>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-12 gap-6 items-end">
          <div className="col-span-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tarih Aralığı</p>
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
              style={{ width: '100%' }}
              placeholder={['Başlangıç', 'Bitiş']}
              className="[&_.ant-picker-input_input]:!text-slate-700"
            />
          </div>
          <div className="col-span-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Depo</p>
            <Select
              placeholder="Tüm Depolar"
              value={selectedWarehouse}
              onChange={setSelectedWarehouse}
              allowClear
              style={{ width: '100%' }}
              options={warehouses.map((w: any) => ({ value: w.id, label: w.name }))}
              className="[&_.ant-select-selector]:!border-slate-300"
            />
          </div>
          <div className="col-span-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Kategori</p>
            <Select
              placeholder="Tüm Kategoriler"
              value={selectedCategory}
              onChange={setSelectedCategory}
              allowClear
              style={{ width: '100%' }}
              options={categories.map((c: CategoryDto) => ({ value: c.id, label: c.name }))}
              className="[&_.ant-select-selector]:!border-slate-300"
            />
          </div>
          <div className="col-span-2">
            <Space>
              <Button
                onClick={() => {
                  setDateRange([dayjs().subtract(30, 'day'), dayjs()]);
                  setSelectedWarehouse(undefined);
                  setSelectedCategory(undefined);
                }}
                className="!border-slate-300 !text-slate-600 hover:!text-slate-900"
              >
                Sıfırla
              </Button>
              <Button
                icon={<ArrowPathIcon className={`w-4 h-4 ${productsLoading ? 'animate-spin' : ''}`} />}
                onClick={() => refetchProducts()}
                className="!border-slate-300 !text-slate-600 hover:!text-slate-900"
              />
            </Space>
          </div>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <Tabs
          items={tabItems}
          size="large"
          className="[&_.ant-tabs-tab]:!text-slate-600 [&_.ant-tabs-tab-active_.ant-tabs-tab-btn]:!text-slate-900 [&_.ant-tabs-ink-bar]:!bg-slate-900"
        />
      </div>
    </div>
  );
}
