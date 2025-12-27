'use client';

import React, { useMemo, useState } from 'react';
import { Button, Select, Spin, DatePicker, Drawer, Switch, Dropdown, Table, Tag, List, Progress, Tooltip, Empty } from 'antd';
import {
  ArrowPathIcon,
  ArrowsRightLeftIcon,
  BuildingStorefrontIcon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  Cog6ToothIcon,
  DocumentIcon,
  EllipsisHorizontalIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InboxIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PrinterIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import {
  useProducts,
  useLowStockProducts,
  useWarehouses,
  useStockTransfers,
  useStockCounts,
  useExpiringStock,
  useStockMovements,
  useCategories,
  useInventoryDashboard,
  useStockValuation,
  useInventoryKPIs,
} from '@/lib/api/hooks/useInventory';
import { TransferStatus, StockCountStatus } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import type { ProductDto, StockMovementDto, InventoryAlertDto } from '@/lib/api/services/inventory.types';
import { formatCurrency, formatNumber } from '@/lib/utils/format';
import dayjs from 'dayjs';
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
  AreaChart,
  Area,
  Legend,
  ComposedChart,
  Line,
} from 'recharts';

const { RangePicker } = DatePicker;

// Monochrome color palette
const MONOCHROME_COLORS = ['#1e293b', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0', '#f1f5f9'];

const productTypeLabels: Record<string, string> = {
  Raw: 'Hammadde',
  SemiFinished: 'Yarı Mamul',
  Finished: 'Mamul',
  Service: 'Hizmet',
  Consumable: 'Sarf Malzeme',
  FixedAsset: 'Duran Varlık',
};

// Widget visibility interface
interface WidgetVisibility {
  stats: boolean;
  alerts: boolean;
  stockHealth: boolean;
  movementTrend: boolean;
  topProducts: boolean;
  categoryValue: boolean;
  lowStock: boolean;
  expiringStock: boolean;
  pendingTransfers: boolean;
  advancedKpis: boolean;
}

// Default widget visibility
const defaultWidgetVisibility: WidgetVisibility = {
  stats: true,
  alerts: true,
  stockHealth: true,
  movementTrend: true,
  topProducts: true,
  categoryValue: true,
  lowStock: true,
  expiringStock: true,
  pendingTransfers: true,
  advancedKpis: true,
};

// Empty State Component
const EmptyChart = ({ icon: Icon, message }: { icon: React.ComponentType<any>; message: string }) => (
  <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-slate-400">
    <Icon className="text-4xl mb-3" />
    <span className="text-sm">{message}</span>
  </div>
);

export default function InventoryDashboardPage() {
  // State for filters
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | undefined>(undefined);
  const [trendDays, setTrendDays] = useState<number>(30);
  const [kpiDateRange, setKpiDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'day'),
    dayjs(),
  ]);

  // Widget visibility state
  const [widgetVisibility, setWidgetVisibility] = useState<WidgetVisibility>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('inventoryDashboardWidgets');
      return saved ? JSON.parse(saved) : defaultWidgetVisibility;
    }
    return defaultWidgetVisibility;
  });
  const [settingsDrawerOpen, setSettingsDrawerOpen] = useState(false);

  // Toggle widget visibility
  const toggleWidget = (widget: keyof WidgetVisibility) => {
    const newVisibility = { ...widgetVisibility, [widget]: !widgetVisibility[widget] };
    setWidgetVisibility(newVisibility);
    if (typeof window !== 'undefined') {
      localStorage.setItem('inventoryDashboardWidgets', JSON.stringify(newVisibility));
    }
  };

  // Fetch inventory data - Backend Analytics API
  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    refetch: refetchDashboard,
  } = useInventoryDashboard(selectedWarehouseId, trendDays);

  // KPIs report
  const {
    data: kpisData,
    isLoading: kpisLoading
  } = useInventoryKPIs(
    kpiDateRange[0].format('YYYY-MM-DD'),
    kpiDateRange[1].format('YYYY-MM-DD'),
    selectedWarehouseId
  );

  // Legacy data fetching for fallback and additional features
  const { data: products = [], isLoading: productsLoading, refetch: refetchProducts } = useProducts(true);
  const { data: lowStockProducts = [], isLoading: lowStockLoading } = useLowStockProducts(selectedWarehouseId);
  const { data: warehouses = [], isLoading: warehousesLoading } = useWarehouses();
  const { data: transfers = [], isLoading: transfersLoading } = useStockTransfers(
    undefined,
    undefined,
    TransferStatus.InTransit
  );
  const { data: stockCounts = [] } = useStockCounts(
    undefined,
    StockCountStatus.InProgress
  );
  const { data: expiringStock = [], isLoading: expiringLoading } = useExpiringStock(30);
  const { data: stockMovements = [] } = useStockMovements();

  // Use backend data if available, otherwise fallback to client-side calculation
  const kpis = dashboardData?.kpis;
  const byCategory = dashboardData?.byCategory || [];
  const byStatus = dashboardData?.byStatus || [];
  const movementTrend = dashboardData?.movementTrend || [];
  const topProducts = dashboardData?.topProductsByValue || [];

  // Calculate stats from backend or fallback
  const totalProducts = kpis?.totalProducts ?? products.length;
  const activeProducts = kpis?.activeProducts ?? products.filter((p: ProductDto) => p.isActive).length;
  const totalWarehouses = warehouses.length;
  const activeWarehouses = warehouses.filter((w: any) => w.isActive).length;
  const pendingTransfers = kpis?.pendingTransfersCount ?? transfers.length;
  const lowStockCount = kpis?.lowStockProductsCount ?? lowStockProducts.length;
  const expiringCount = kpis?.expiringStockCount ?? expiringStock.length;

  // Calculate total stock value from backend or fallback
  const totalStockValue = useMemo(() => {
    if (kpis?.totalStockValue !== undefined) return kpis.totalStockValue;
    return products.reduce((sum: number, p: ProductDto) => sum + (p.unitPrice || 0) * p.totalStockQuantity, 0);
  }, [kpis, products]);

  // Calculate total stock quantity from backend or fallback
  const totalStockQuantity = useMemo(() => {
    if (kpis?.totalStockQuantity !== undefined) return kpis.totalStockQuantity;
    return products.reduce((sum: number, p: ProductDto) => sum + p.totalStockQuantity, 0);
  }, [kpis, products]);

  // Category distribution by value - use backend or fallback
  const categoryValueData = useMemo(() => {
    if (byCategory.length > 0) {
      return byCategory.map(c => ({
        name: c.categoryName,
        value: c.stockValue,
        quantity: c.totalQuantity,
        productCount: c.productCount,
      })).slice(0, 6);
    }
    const categoryMap = new Map<string, number>();
    products.forEach((p: ProductDto) => {
      const cat = p.categoryName || 'Kategorisiz';
      const value = (p.unitPrice || 0) * p.totalStockQuantity;
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + value);
    });
    return Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [byCategory, products]);

  // Stock movement trend - use backend or fallback
  const movementTrendData = useMemo(() => {
    if (movementTrend.length > 0) {
      return movementTrend.map(m => ({
        date: dayjs(m.date).format('DD/MM'),
        giren: m.inbound,
        cikan: m.outbound,
        net: m.netChange,
      }));
    }
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = dayjs().subtract(6 - i, 'day');
      return {
        date: date.format('DD/MM'),
        fullDate: date.format('YYYY-MM-DD'),
        giren: 0,
        cikan: 0,
      };
    });

    stockMovements.forEach((m: StockMovementDto) => {
      const moveDate = dayjs(m.movementDate).format('YYYY-MM-DD');
      const dayData = last7Days.find((d) => d.fullDate === moveDate);
      if (dayData) {
        const isIncoming = ['Purchase', 'SalesReturn', 'Production', 'AdjustmentIncrease', 'Opening', 'Found'].includes(m.movementType);
        if (isIncoming) {
          dayData.giren += m.quantity;
        } else {
          dayData.cikan += m.quantity;
        }
      }
    });

    return last7Days;
  }, [movementTrend, stockMovements]);

  // Top products by value - use backend or fallback
  const topProductsByValue = useMemo(() => {
    if (topProducts.length > 0) {
      return topProducts.map(p => ({
        name: p.productName.length > 25 ? p.productName.substring(0, 25) + '...' : p.productName,
        fullName: p.productName,
        value: p.totalValue,
        quantity: p.totalQuantity,
        code: p.productCode,
        category: p.categoryName,
      })).slice(0, 8);
    }
    return [...products]
      .map((p: ProductDto) => ({
        name: p.name.length > 25 ? p.name.substring(0, 25) + '...' : p.name,
        fullName: p.name,
        value: (p.unitPrice || 0) * p.totalStockQuantity,
        quantity: p.totalStockQuantity,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [topProducts, products]);

  // Stock health overview - use backend byStatus or fallback
  const stockHealthData = useMemo(() => {
    if (byStatus.length > 0) {
      return byStatus.map((s, idx) => ({
        name: s.status === 'Active' ? 'Aktif' : s.status === 'Inactive' ? 'Pasif' : s.status,
        value: s.productCount,
        color: MONOCHROME_COLORS[idx % MONOCHROME_COLORS.length],
      }));
    }
    let healthy = 0;
    let warning = 0;
    let critical = 0;
    let outOfStock = 0;

    products.forEach((p: ProductDto) => {
      if (p.totalStockQuantity === 0) {
        outOfStock++;
      } else if (p.totalStockQuantity < p.minStockLevel) {
        critical++;
      } else if (p.totalStockQuantity < p.minStockLevel * 1.5) {
        warning++;
      } else {
        healthy++;
      }
    });

    return [
      { name: 'Sağlıklı', value: healthy, color: '#1e293b' },
      { name: 'Uyarı', value: warning, color: '#64748b' },
      { name: 'Kritik', value: critical, color: '#94a3b8' },
      { name: 'Stok Yok', value: outOfStock, color: '#cbd5e1' },
    ];
  }, [byStatus, products]);

  // Combined loading state
  const isLoading = dashboardLoading || productsLoading;

  // Refresh all data
  const handleRefresh = () => {
    refetchDashboard();
    refetchProducts();
  };

  // Low stock table columns
  const lowStockColumns: ColumnsType<any> = [
    {
      title: 'Ürün',
      dataIndex: 'productName',
      key: 'productName',
      render: (text: string, record: any) => (
        <Link href={`/inventory/products/${record.productId}`}>
          <div>
            <div className="font-medium text-slate-900 hover:text-slate-700">{text}</div>
            <span className="text-xs text-slate-400">{record.productCode}</span>
          </div>
        </Link>
      ),
    },
    {
      title: 'Mevcut',
      dataIndex: 'currentQuantity',
      key: 'currentQuantity',
      align: 'right',
      render: (qty: number, record: any) => (
        <span className={qty <= record.minStockLevel ? 'text-slate-900 font-semibold' : ''}>
          {qty}
        </span>
      ),
    },
    {
      title: 'Eksik',
      dataIndex: 'shortage',
      key: 'shortage',
      align: 'right',
      render: (shortage: number) => (
        <span className="text-slate-500 font-medium">-{shortage}</span>
      ),
    },
  ];

  // Expiring stock table columns
  const expiringColumns: ColumnsType<any> = [
    {
      title: 'Ürün',
      dataIndex: 'productName',
      key: 'productName',
      render: (text: string, record: any) => (
        <div>
          <div className="font-medium text-slate-900">{text}</div>
          <span className="text-xs text-slate-400">{record.lotNumber}</span>
        </div>
      ),
    },
    {
      title: 'Miktar',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'right',
    },
    {
      title: 'Kalan',
      dataIndex: 'daysUntilExpiry',
      key: 'daysUntilExpiry',
      align: 'right',
      render: (days: number) => (
        <span className={`font-medium ${days <= 7 ? 'text-slate-900' : 'text-slate-500'}`}>
          {days} gün
        </span>
      ),
    },
  ];

  // Pending transfers columns
  const transferColumns: ColumnsType<any> = [
    {
      title: 'Transfer No',
      dataIndex: 'transferNumber',
      key: 'transferNumber',
      render: (text: string, record: any) => (
        <Link href={`/inventory/stock-transfers/${record.id}`}>
          <span className="text-slate-900 hover:text-slate-700 font-medium">{text}</span>
        </Link>
      ),
    },
    {
      title: 'Rota',
      key: 'route',
      render: (_: any, record: any) => (
        <div className="text-sm text-slate-600">
          {record.sourceWarehouseName} → {record.destinationWarehouseName}
        </div>
      ),
    },
  ];

  // Operations dropdown menu items
  const operationsMenuItems = [
    {
      key: 'count',
      label: <Link href="/inventory/stock-counts/new">Sayım Başlat</Link>,
      icon: <ClipboardDocumentCheckIcon className="w-4 h-4" />,
    },
    {
      key: 'adjustment',
      label: <Link href="/inventory/stock-adjustments/new">Stok Düzeltme</Link>,
      icon: <ArrowsRightLeftIcon className="w-4 h-4" />,
    },
    { type: 'divider' as const },
    {
      key: 'excel',
      label: <Link href="/inventory/stock">Excel İşlemleri</Link>,
      icon: <DocumentIcon className="w-4 h-4" />,
    },
    {
      key: 'reports',
      label: <Link href="/inventory/reports">Raporlar</Link>,
      icon: <PrinterIcon className="w-4 h-4" />,
    },
    {
      key: 'analytics',
      label: <Link href="/inventory/analytics">Analitik</Link>,
      icon: <Squares2X2Icon className="w-4 h-4" />,
    },
  ];

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-sm">
          <p className="font-medium text-slate-900 mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm text-slate-600">
              {entry.name}: {entry.value.toLocaleString('tr-TR')}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* ═══════════════════════════════════════════════════════════════
          HEADER: Clean, Modern, Monochrome
      ═══════════════════════════════════════════════════════════════ */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Envanter Paneli</h1>
          {dashboardData?.lastUpdated && (
            <p className="text-sm text-slate-500 mt-1">
              Son güncelleme: {dayjs(dashboardData.lastUpdated).format('DD/MM/YYYY HH:mm')}
            </p>
          )}
        </div>

        {/* Clean Action Bar */}
        <div className="flex items-center gap-3">
          {/* Filters */}
          <Select
            placeholder="Tüm Depolar"
            allowClear
            style={{ width: 160 }}
            value={selectedWarehouseId}
            onChange={setSelectedWarehouseId}
            loading={warehousesLoading}
            className="[&_.ant-select-selector]:!bg-white [&_.ant-select-selector]:!border-slate-300"
          >
            {warehouses.map((w: any) => (
              <Select.Option key={w.id} value={w.id}>
                {w.name}
              </Select.Option>
            ))}
          </Select>

          <Select
            value={trendDays}
            onChange={setTrendDays}
            style={{ width: 120 }}
            className="[&_.ant-select-selector]:!bg-white [&_.ant-select-selector]:!border-slate-300"
          >
            <Select.Option value={7}>7 Gün</Select.Option>
            <Select.Option value={14}>14 Gün</Select.Option>
            <Select.Option value={30}>30 Gün</Select.Option>
          </Select>

          <Button
            icon={<ArrowPathIcon className="w-4 h-4" spin={isLoading} />}
            onClick={handleRefresh}
            className="!border-slate-300 !text-slate-600 hover:!text-slate-900 hover:!border-slate-400"
          />

          <Button
            icon={<Cog6ToothIcon className="w-4 h-4" />}
            onClick={() => setSettingsDrawerOpen(true)}
            className="!border-slate-300 !text-slate-600 hover:!text-slate-900 hover:!border-slate-400"
          />

          {/* Primary Actions */}
          <Link href="/inventory/stock-transfers/new">
            <Button className="!border-slate-300 !text-slate-700 hover:!text-slate-900 hover:!border-slate-400">
              <ArrowsRightLeftIcon className="w-4 h-4 mr-1" />
              Stok Transferi
            </Button>
          </Link>

          <Link href="/inventory/products/new">
            <Button type="primary" className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900">
              <PlusIcon className="w-4 h-4 mr-1" />
              Yeni Ürün
            </Button>
          </Link>

          {/* Operations Dropdown */}
          <Dropdown menu={{ items: operationsMenuItems }} placement="bottomRight">
            <Button className="!border-slate-300 !text-slate-600">
              İşlemler <EllipsisHorizontalIcon className="w-4 h-4" />
            </Button>
          </Dropdown>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          BENTO GRID LAYOUT
      ═══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-12 gap-6">

        {/* ─────────────── KPI CARDS (Top Row - Compact) ─────────────── */}
        <div className="col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Toplam Ürün</p>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-slate-900">{formatNumber(totalProducts)}</span>
              <span className="text-sm text-slate-400">{activeProducts} aktif</span>
            </div>
          </div>
        </div>

        <div className="col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Stok Değeri</p>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-slate-900">{formatCurrency(totalStockValue)}</span>
            </div>
          </div>
        </div>

        <div className="col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Stok Miktarı</p>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-slate-900">{formatNumber(totalStockQuantity)}</span>
              <span className="text-sm text-slate-400">adet</span>
            </div>
          </div>
        </div>

        <div className="col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Aktif Depolar</p>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-slate-900">{activeWarehouses}</span>
              <span className="text-sm text-slate-400">/ {totalWarehouses}</span>
            </div>
          </div>
        </div>

        {/* ─────────────── ALERTS CARD (Wide) ─────────────── */}
        <div className="col-span-12">
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">Stok Uyarıları</p>
            <div className="grid grid-cols-3 gap-6">
              {/* Low Stock Alert */}
              <Link href="/inventory/products?lowStock=true">
                <div className={`p-5 rounded-xl border transition-all hover:shadow-md cursor-pointer ${
                  lowStockCount > 0 ? 'border-slate-300 bg-slate-50' : 'border-slate-200'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      lowStockCount > 0 ? 'bg-slate-900' : 'bg-slate-100'
                    }`}>
                      <ExclamationTriangleIcon className="w-4 h-4" className={`text-xl ${lowStockCount > 0 ? 'text-white' : 'text-slate-400'}`} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-900">{lowStockCount}</div>
                      <div className="text-sm text-slate-500">Düşük Stok</div>
                    </div>
                  </div>
                  {lowStockCount > 0 && (
                    <div className="mt-3 text-xs font-medium text-slate-600">Aksiyon gerekli →</div>
                  )}
                </div>
              </Link>

              {/* Pending Transfers Alert */}
              <Link href="/inventory/stock-transfers">
                <div className={`p-5 rounded-xl border transition-all hover:shadow-md cursor-pointer ${
                  pendingTransfers > 0 ? 'border-slate-300 bg-slate-50' : 'border-slate-200'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      pendingTransfers > 0 ? 'bg-slate-700' : 'bg-slate-100'
                    }`}>
                      <TruckOutlined className={`text-xl ${pendingTransfers > 0 ? 'text-white' : 'text-slate-400'}`} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-900">{pendingTransfers}</div>
                      <div className="text-sm text-slate-500">Yolda Transfer</div>
                    </div>
                  </div>
                  {pendingTransfers > 0 && (
                    <div className="mt-3 text-xs font-medium text-slate-600">Takip et →</div>
                  )}
                </div>
              </Link>

              {/* Expiring Stock Alert */}
              <Link href="/inventory/stock?expiring=true">
                <div className={`p-5 rounded-xl border transition-all hover:shadow-md cursor-pointer ${
                  expiringCount > 0 ? 'border-slate-300 bg-slate-50' : 'border-slate-200'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      expiringCount > 0 ? 'bg-slate-500' : 'bg-slate-100'
                    }`}>
                      <ClockIcon className="w-4 h-4" className={`text-xl ${expiringCount > 0 ? 'text-white' : 'text-slate-400'}`} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-900">{expiringCount}</div>
                      <div className="text-sm text-slate-500">SKT Yaklaşan (30g)</div>
                    </div>
                  </div>
                  {expiringCount > 0 && (
                    <div className="mt-3 text-xs font-medium text-slate-600">İncele →</div>
                  )}
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* ─────────────── MOVEMENT TREND (Large) ─────────────── */}
        <div className="col-span-8">
          <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">
              Stok Hareket Trendi (Son {trendDays} Gün)
            </p>
            {movementTrendData.length > 0 && movementTrendData.some(d => d.giren > 0 || d.cikan > 0) ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={movementTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area type="monotone" dataKey="giren" name="Giren" stackId="1" stroke="#1e293b" fill="#1e293b" fillOpacity={0.7} />
                  <Area type="monotone" dataKey="cikan" name="Çıkan" stackId="2" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.5} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart icon={InboxOutlined} message="Henüz hareket verisi oluşmadı" />
            )}
          </div>
        </div>

        {/* ─────────────── STOCK HEALTH (Donut) ─────────────── */}
        <div className="col-span-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">Stok Sağlığı</p>
            {stockHealthData.some(d => d.value > 0) ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={stockHealthData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {stockHealthData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                  {stockHealthData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-600">{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <EmptyChart icon={SearchOutlined} message="Henüz ürün eklenmemiş" />
            )}
          </div>
        </div>

        {/* ─────────────── TOP PRODUCTS BY VALUE ─────────────── */}
        <div className="col-span-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">En Değerli Ürünler</p>
            {topProductsByValue.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={topProductsByValue} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tickFormatter={(value) => `₺${(value / 1000).toFixed(0)}K`} stroke="#94a3b8" fontSize={12} />
                  <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <RechartsTooltip
                    formatter={(value: number) => `₺${value.toLocaleString('tr-TR')}`}
                    labelFormatter={(label) => topProductsByValue.find(p => p.name === label)?.fullName || label}
                  />
                  <Bar dataKey="value" name="Stok Değeri" fill="#1e293b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart icon={AppstoreOutlined} message="Henüz ürün eklenmemiş" />
            )}
          </div>
        </div>

        {/* ─────────────── CATEGORY DISTRIBUTION ─────────────── */}
        <div className="col-span-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">Kategori Bazlı Stok Değeri</p>
            {categoryValueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={categoryValueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tickFormatter={(value) => `₺${(value / 1000).toFixed(0)}K`} stroke="#94a3b8" fontSize={12} />
                  <RechartsTooltip formatter={(value: number) => `₺${value.toLocaleString('tr-TR')}`} />
                  <Bar dataKey="value" name="Stok Değeri" radius={[4, 4, 0, 0]}>
                    {categoryValueData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={MONOCHROME_COLORS[index % MONOCHROME_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart icon={AppstoreOutlined} message="Henüz kategori eklenmemiş" />
            )}
          </div>
        </div>

        {/* ─────────────── LOW STOCK TABLE ─────────────── */}
        <div className="col-span-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
            <div className="flex items-center justify-between mb-5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Düşük Stoklu Ürünler</p>
              <Link href="/inventory/products?lowStock=true" className="text-xs text-slate-500 hover:text-slate-900">
                Tümü →
              </Link>
            </div>
            {lowStockProducts.length > 0 ? (
              <Table
                columns={lowStockColumns}
                dataSource={lowStockProducts.slice(0, 5)}
                rowKey="productId"
                pagination={false}
                size="small"
                loading={lowStockLoading}
                className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs"
              />
            ) : (
              <EmptyChart icon={CheckCircleIcon} message="Düşük stoklu ürün yok" />
            )}
          </div>
        </div>

        {/* ─────────────── EXPIRING STOCK TABLE ─────────────── */}
        <div className="col-span-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
            <div className="flex items-center justify-between mb-5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">SKT Yaklaşan Ürünler</p>
              <Link href="/inventory/stock?expiring=true" className="text-xs text-slate-500 hover:text-slate-900">
                Tümü →
              </Link>
            </div>
            {expiringStock.length > 0 ? (
              <Table
                columns={expiringColumns}
                dataSource={expiringStock.slice(0, 5)}
                rowKey="stockId"
                pagination={false}
                size="small"
                loading={expiringLoading}
                className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs"
              />
            ) : (
              <EmptyChart icon={ClockCircleOutlined} message="SKT yaklaşan ürün yok" />
            )}
          </div>
        </div>

        {/* ─────────────── PENDING TRANSFERS TABLE ─────────────── */}
        <div className="col-span-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
            <div className="flex items-center justify-between mb-5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Yoldaki Transferler</p>
              <Link href="/inventory/stock-transfers" className="text-xs text-slate-500 hover:text-slate-900">
                Tümü →
              </Link>
            </div>
            {transfers.length > 0 ? (
              <Table
                columns={transferColumns}
                dataSource={transfers.slice(0, 5)}
                rowKey="id"
                pagination={false}
                size="small"
                loading={transfersLoading}
                className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs"
              />
            ) : (
              <EmptyChart icon={TruckOutlined} message="Yolda transfer yok" />
            )}
          </div>
        </div>

        {/* ─────────────── ADVANCED KPIs (Full Width) ─────────────── */}
        {kpisData && widgetVisibility.advancedKpis && (
          <div className="col-span-12">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Envanter KPI Metrikleri</p>
                <RangePicker
                  value={kpiDateRange}
                  onChange={(dates) => dates && setKpiDateRange([dates[0]!, dates[1]!])}
                  format="DD/MM/YYYY"
                  className="[&_.ant-picker-input_input]:!text-slate-700"
                />
              </div>

              <Spin spinning={kpisLoading}>
                {/* KPI Grid */}
                <div className="grid grid-cols-6 gap-6 mb-6">
                  <div className="text-center p-4 bg-slate-50 rounded-xl">
                    <Tooltip title="Stokların ne kadar hızlı döndüğünü gösterir">
                      <div className="text-sm text-slate-500 mb-1">Devir Hızı</div>
                      <div className={`text-2xl font-bold ${kpisData.inventoryTurnoverRatio >= 4 ? 'text-slate-900' : 'text-slate-500'}`}>
                        {kpisData.inventoryTurnoverRatio.toFixed(2)}x
                      </div>
                    </Tooltip>
                  </div>

                  <div className="text-center p-4 bg-slate-50 rounded-xl">
                    <Tooltip title="Mevcut stokun kaç günlük satışa yeteceği">
                      <div className="text-sm text-slate-500 mb-1">Stok Gün Sayısı</div>
                      <div className="text-2xl font-bold text-slate-900">
                        {kpisData.daysOfInventory.toFixed(0)}
                      </div>
                    </Tooltip>
                  </div>

                  <div className="text-center p-4 bg-slate-50 rounded-xl">
                    <Tooltip title="Stok tükenen ürünlerin oranı">
                      <div className="text-sm text-slate-500 mb-1">Tükenme Oranı</div>
                      <div className={`text-2xl font-bold ${kpisData.stockoutRate <= 5 ? 'text-slate-900' : 'text-slate-500'}`}>
                        %{kpisData.stockoutRate.toFixed(1)}
                      </div>
                    </Tooltip>
                  </div>

                  <div className="text-center p-4 bg-slate-50 rounded-xl">
                    <Tooltip title="Siparişlerin stoktan karşılanma oranı">
                      <div className="text-sm text-slate-500 mb-1">Karşılama Oranı</div>
                      <div className={`text-2xl font-bold ${kpisData.fillRate >= 95 ? 'text-slate-900' : 'text-slate-500'}`}>
                        %{kpisData.fillRate.toFixed(1)}
                      </div>
                    </Tooltip>
                  </div>

                  <div className="text-center p-4 bg-slate-50 rounded-xl">
                    <Tooltip title="Stok yatırımından elde edilen brüt kar getirisi">
                      <div className="text-sm text-slate-500 mb-1">GMROI</div>
                      <div className="text-2xl font-bold text-slate-900">
                        ₺{kpisData.grossMarginReturnOnInventory.toFixed(2)}
                      </div>
                    </Tooltip>
                  </div>

                  <div className="text-center p-4 bg-slate-50 rounded-xl">
                    <Tooltip title="Hareketsiz (ölü) stok oranı">
                      <div className="text-sm text-slate-500 mb-1">Ölü Stok</div>
                      <div className={`text-2xl font-bold ${kpisData.deadStockPercentage <= 10 ? 'text-slate-900' : 'text-slate-500'}`}>
                        %{kpisData.deadStockPercentage.toFixed(1)}
                      </div>
                    </Tooltip>
                  </div>
                </div>

                {/* Movement Summary & Comparison */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-5 bg-slate-50 rounded-xl">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Hareket Özeti</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center gap-2 text-slate-600 mb-1">
                          <ArrowDownOutlined className="text-slate-900" />
                          <span className="text-sm">Toplam Giriş</span>
                        </div>
                        <div className="text-xl font-bold text-slate-900">{kpisData.totalInboundMovements}</div>
                        <div className="text-xs text-slate-500">{formatNumber(kpisData.totalInboundQuantity)} adet</div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-slate-600 mb-1">
                          <ArrowUpOutlined className="text-slate-500" />
                          <span className="text-sm">Toplam Çıkış</span>
                        </div>
                        <div className="text-xl font-bold text-slate-900">{kpisData.totalOutboundMovements}</div>
                        <div className="text-xs text-slate-500">{formatNumber(kpisData.totalOutboundQuantity)} adet</div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-200 text-center text-sm text-slate-500">
                      Günlük Ortalama: {kpisData.averageMovementsPerDay.toFixed(1)} hareket
                    </div>
                  </div>

                  {kpisData.comparison && (
                    <div className="p-5 bg-slate-50 rounded-xl">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Önceki Dönem Karşılaştırması</p>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-sm text-slate-500 mb-1">Devir Hızı</div>
                          <div className={`text-xl font-bold ${kpisData.comparison.turnoverChange >= 0 ? 'text-slate-900' : 'text-slate-500'}`}>
                            {kpisData.comparison.turnoverChange >= 0 ? '+' : ''}{kpisData.comparison.turnoverChange.toFixed(1)}%
                            {kpisData.comparison.turnoverTrend === 'Up' ? <ArrowUpOutlined className="ml-1" /> : kpisData.comparison.turnoverTrend === 'Down' ? <ArrowDownOutlined className="ml-1" /> : null}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-500 mb-1">Stok Değeri</div>
                          <div className={`text-xl font-bold ${kpisData.comparison.stockValueChange >= 0 ? 'text-slate-900' : 'text-slate-500'}`}>
                            {kpisData.comparison.stockValueChange >= 0 ? '+' : ''}{kpisData.comparison.stockValueChange.toFixed(1)}%
                            {kpisData.comparison.stockValueTrend === 'Up' ? <ArrowUpOutlined className="ml-1" /> : kpisData.comparison.stockValueTrend === 'Down' ? <ArrowDownOutlined className="ml-1" /> : null}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-500 mb-1">Hareketler</div>
                          <div className={`text-xl font-bold ${kpisData.comparison.movementsChange >= 0 ? 'text-slate-900' : 'text-slate-500'}`}>
                            {kpisData.comparison.movementsChange >= 0 ? '+' : ''}{kpisData.comparison.movementsChange.toFixed(1)}%
                            {kpisData.comparison.movementsTrend === 'Up' ? <ArrowUpOutlined className="ml-1" /> : kpisData.comparison.movementsTrend === 'Down' ? <ArrowDownOutlined className="ml-1" /> : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Monthly Trend Chart */}
                {kpisData.monthlyTrend && kpisData.monthlyTrend.length > 0 && (
                  <div className="mt-6 p-5 bg-slate-50 rounded-xl">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Aylık Trend</p>
                    <ResponsiveContainer width="100%" height={220}>
                      <ComposedChart data={kpisData.monthlyTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="monthName" stroke="#94a3b8" fontSize={12} />
                        <YAxis yAxisId="left" stroke="#94a3b8" fontSize={12} />
                        <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={12} />
                        <RechartsTooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="movementsCount" name="Hareket Sayısı" fill="#64748b" radius={[4, 4, 0, 0]} />
                        <Line yAxisId="right" type="monotone" dataKey="turnoverRatio" name="Devir Hızı" stroke="#1e293b" strokeWidth={2} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Turnover by Category */}
                {kpisData.turnoverByCategory && kpisData.turnoverByCategory.length > 0 && (
                  <div className="mt-6 p-5 bg-slate-50 rounded-xl">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Kategori Bazlı Devir Hızı</p>
                    <Table
                      dataSource={kpisData.turnoverByCategory}
                      rowKey="categoryId"
                      pagination={false}
                      size="small"
                      className="[&_.ant-table-thead_th]:!bg-white [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs"
                      columns={[
                        {
                          title: 'Kategori',
                          dataIndex: 'categoryName',
                          key: 'categoryName',
                        },
                        {
                          title: 'Ürün Sayısı',
                          dataIndex: 'productCount',
                          key: 'productCount',
                          align: 'right',
                        },
                        {
                          title: 'Devir Hızı',
                          dataIndex: 'turnoverRatio',
                          key: 'turnoverRatio',
                          align: 'right',
                          render: (value: number) => (
                            <span className={`font-medium ${value >= 4 ? 'text-slate-900' : value >= 2 ? 'text-slate-600' : 'text-slate-400'}`}>
                              {value.toFixed(2)}x
                            </span>
                          ),
                        },
                        {
                          title: 'Stok Günü',
                          dataIndex: 'daysOfInventory',
                          key: 'daysOfInventory',
                          align: 'right',
                          render: (value: number) => `${value.toFixed(0)} gün`,
                        },
                      ]}
                    />
                  </div>
                )}
              </Spin>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          WIDGET SETTINGS DRAWER
      ═══════════════════════════════════════════════════════════════ */}
      <Drawer
        title={<span className="text-slate-900 font-semibold">Panel Ayarları</span>}
        placement="right"
        onClose={() => setSettingsDrawerOpen(false)}
        open={settingsDrawerOpen}
        width={360}
        className="[&_.ant-drawer-header]:!border-slate-200 [&_.ant-drawer-body]:!bg-slate-50"
      >
        <div className="space-y-1">
          <p className="text-sm text-slate-500 mb-6">
            Görmek istediğiniz widget'ları açıp kapatabilirsiniz.
          </p>

          <div className="bg-white rounded-xl p-4 mb-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Ana Bileşenler</p>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-900">İstatistik Kartları</div>
                  <div className="text-xs text-slate-500">Toplam ürün, değer, miktar</div>
                </div>
                <Switch
                  checked={widgetVisibility.stats}
                  onChange={() => toggleWidget('stats')}
                  className="!bg-slate-300 [&.ant-switch-checked]:!bg-slate-900"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-900">Uyarı Kartları</div>
                  <div className="text-xs text-slate-500">Düşük stok, transfer uyarıları</div>
                </div>
                <Switch
                  checked={widgetVisibility.alerts}
                  onChange={() => toggleWidget('alerts')}
                  className="!bg-slate-300 [&.ant-switch-checked]:!bg-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 mb-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Grafikler</p>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-900">Stok Sağlığı</div>
                  <div className="text-xs text-slate-500">Pasta grafik dağılımı</div>
                </div>
                <Switch
                  checked={widgetVisibility.stockHealth}
                  onChange={() => toggleWidget('stockHealth')}
                  className="!bg-slate-300 [&.ant-switch-checked]:!bg-slate-900"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-900">Hareket Trendi</div>
                  <div className="text-xs text-slate-500">Giriş/çıkış grafiği</div>
                </div>
                <Switch
                  checked={widgetVisibility.movementTrend}
                  onChange={() => toggleWidget('movementTrend')}
                  className="!bg-slate-300 [&.ant-switch-checked]:!bg-slate-900"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-900">En Değerli Ürünler</div>
                  <div className="text-xs text-slate-500">Stok değerine göre</div>
                </div>
                <Switch
                  checked={widgetVisibility.topProducts}
                  onChange={() => toggleWidget('topProducts')}
                  className="!bg-slate-300 [&.ant-switch-checked]:!bg-slate-900"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-900">Kategori Dağılımı</div>
                  <div className="text-xs text-slate-500">Kategori bazlı değer</div>
                </div>
                <Switch
                  checked={widgetVisibility.categoryValue}
                  onChange={() => toggleWidget('categoryValue')}
                  className="!bg-slate-300 [&.ant-switch-checked]:!bg-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 mb-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Tablolar</p>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-900">Düşük Stok</div>
                  <div className="text-xs text-slate-500">Kritik ürünler</div>
                </div>
                <Switch
                  checked={widgetVisibility.lowStock}
                  onChange={() => toggleWidget('lowStock')}
                  className="!bg-slate-300 [&.ant-switch-checked]:!bg-slate-900"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-900">SKT Yaklaşan</div>
                  <div className="text-xs text-slate-500">Tarihi yaklaşan ürünler</div>
                </div>
                <Switch
                  checked={widgetVisibility.expiringStock}
                  onChange={() => toggleWidget('expiringStock')}
                  className="!bg-slate-300 [&.ant-switch-checked]:!bg-slate-900"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-900">Yoldaki Transferler</div>
                  <div className="text-xs text-slate-500">Bekleyen transferler</div>
                </div>
                <Switch
                  checked={widgetVisibility.pendingTransfers}
                  onChange={() => toggleWidget('pendingTransfers')}
                  className="!bg-slate-300 [&.ant-switch-checked]:!bg-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Gelişmiş</p>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-900">KPI Metrikleri</div>
                <div className="text-xs text-slate-500">Devir hızı, GMROI vb.</div>
              </div>
              <Switch
                checked={widgetVisibility.advancedKpis}
                onChange={() => toggleWidget('advancedKpis')}
                className="!bg-slate-300 [&.ant-switch-checked]:!bg-slate-900"
              />
            </div>
          </div>

          <Button
            block
            onClick={() => {
              setWidgetVisibility(defaultWidgetVisibility);
              localStorage.setItem('inventoryDashboardWidgets', JSON.stringify(defaultWidgetVisibility));
            }}
            className="!mt-6 !border-slate-300 !text-slate-700 hover:!text-slate-900 hover:!border-slate-400"
          >
            Varsayılana Sıfırla
          </Button>
        </div>
      </Drawer>
    </div>
  );
}
