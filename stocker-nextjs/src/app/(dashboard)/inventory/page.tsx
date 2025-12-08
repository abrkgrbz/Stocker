'use client';

import React, { useMemo, useState } from 'react';
import { Typography, Space, Button, Row, Col, Card, Statistic, Table, Tag, List, Empty, Progress, Tooltip, Select, Spin, DatePicker, Tabs, Alert, Drawer, Switch, Divider } from 'antd';
import {
  AppstoreOutlined,
  ShopOutlined,
  SwapOutlined,
  WarningOutlined,
  InboxOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  PlusOutlined,
  DollarOutlined,
  RiseOutlined,
  FallOutlined,
  EditOutlined,
  BarChartOutlined,
  PieChartOutlined,
  DashboardOutlined,
  SyncOutlined,
  ExclamationCircleOutlined,
  FileExcelOutlined,
  PrinterOutlined,
  CheckSquareOutlined,
  SettingOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
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
import type { ProductDto, StockMovementDto, CategoryDto, InventoryAlertDto } from '@/lib/api/services/inventory.types';
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils/format';
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
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area,
  ComposedChart,
} from 'recharts';
import InventoryAlertsWidget from '@/components/inventory/InventoryAlertsWidget';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// Color palette
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

const productTypeLabels: Record<string, string> = {
  Raw: 'Hammadde',
  SemiFinished: 'Yarı Mamul',
  Finished: 'Mamul',
  Service: 'Hizmet',
  Consumable: 'Sarf Malzeme',
  FixedAsset: 'Duran Varlık',
};

const alertSeverityColors: Record<string, string> = {
  Critical: 'red',
  High: 'orange',
  Medium: 'gold',
  Low: 'blue',
  Info: 'default',
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

export default function InventoryDashboardPage() {
  // State for filters
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | undefined>(undefined);
  const [trendDays, setTrendDays] = useState<number>(30);
  const [activeTab, setActiveTab] = useState<string>('overview');
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
    error: dashboardError
  } = useInventoryDashboard(selectedWarehouseId, trendDays);

  // Stock valuation for detailed reporting
  const {
    data: valuationData,
    isLoading: valuationLoading
  } = useStockValuation(selectedWarehouseId);

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
  const { data: stockCounts = [], isLoading: stockCountsLoading } = useStockCounts(
    undefined,
    StockCountStatus.InProgress
  );
  const { data: expiringStock = [], isLoading: expiringLoading } = useExpiringStock(30);
  const { data: stockMovements = [], isLoading: movementsLoading } = useStockMovements();
  const { data: categories = [] } = useCategories();

  // Use backend data if available, otherwise fallback to client-side calculation
  const kpis = dashboardData?.kpis;
  const byCategory = dashboardData?.byCategory || [];
  const byWarehouse = dashboardData?.byWarehouse || [];
  const byStatus = dashboardData?.byStatus || [];
  const movementTrend = dashboardData?.movementTrend || [];
  const topProducts = dashboardData?.topProductsByValue || [];
  const alerts = dashboardData?.alerts || [];

  // Calculate stats from backend or fallback
  const totalProducts = kpis?.totalProducts ?? products.length;
  const activeProducts = kpis?.activeProducts ?? products.filter((p: ProductDto) => p.isActive).length;
  const totalWarehouses = warehouses.length;
  const activeWarehouses = warehouses.filter((w: any) => w.isActive).length;
  const pendingTransfers = kpis?.pendingTransfersCount ?? transfers.length;
  const activeStockCounts = kpis?.activeStockCountsCount ?? stockCounts.length;
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

  // Product type distribution - use backend byStatus or fallback
  const productTypeData = useMemo(() => {
    if (byStatus.length > 0) {
      return byStatus.map(s => ({
        name: s.status,
        value: s.productCount,
        color: s.status === 'Active' ? '#10b981' : '#6b7280',
      }));
    }
    const typeMap = new Map<string, number>();
    products.forEach((p: ProductDto) => {
      const type = p.productType || 'Other';
      typeMap.set(type, (typeMap.get(type) || 0) + 1);
    });
    return Array.from(typeMap.entries()).map(([name, value]) => ({
      name: productTypeLabels[name] || name,
      value,
    }));
  }, [byStatus, products]);

  // Category distribution by value - use backend or fallback
  const categoryValueData = useMemo(() => {
    if (byCategory.length > 0) {
      return byCategory.map(c => ({
        name: c.categoryName,
        value: c.stockValue,
        quantity: c.totalQuantity,
        productCount: c.productCount,
      })).slice(0, 8);
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
      .slice(0, 8);
  }, [byCategory, products]);

  // Stock movement trend - use backend or fallback
  const movementTrendData = useMemo(() => {
    if (movementTrend.length > 0) {
      return movementTrend.map(m => ({
        date: dayjs(m.date).format('DD/MM'),
        giren: m.inbound,
        cikan: m.outbound,
        net: m.netChange,
        girenDeger: m.inboundValue,
        cikanDeger: m.outboundValue,
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
        name: p.productName.length > 20 ? p.productName.substring(0, 20) + '...' : p.productName,
        fullName: p.productName,
        value: p.totalValue,
        quantity: p.totalQuantity,
        code: p.productCode,
        category: p.categoryName,
      }));
    }
    return [...products]
      .map((p: ProductDto) => ({
        name: p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name,
        fullName: p.name,
        value: (p.unitPrice || 0) * p.totalStockQuantity,
        quantity: p.totalStockQuantity,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [topProducts, products]);

  // Stock health overview - use backend byStatus or fallback
  const stockHealthData = useMemo(() => {
    if (byStatus.length > 0) {
      return byStatus.map(s => ({
        name: s.status === 'Active' ? 'Aktif' : s.status === 'Inactive' ? 'Pasif' : s.status,
        value: s.productCount,
        color: s.status === 'Active' ? '#10b981' : '#6b7280',
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
      { name: 'Sağlıklı', value: healthy, color: '#10b981' },
      { name: 'Uyarı', value: warning, color: '#f59e0b' },
      { name: 'Kritik', value: critical, color: '#ef4444' },
      { name: 'Stok Yok', value: outOfStock, color: '#6b7280' },
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
            <div className="font-medium text-blue-600 hover:text-blue-800">{text}</div>
            <Text type="secondary" className="text-xs">{record.productCode}</Text>
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
        <span className={qty <= record.minStockLevel ? 'text-red-600 font-semibold' : ''}>
          {qty}
        </span>
      ),
    },
    {
      title: 'Min. Stok',
      dataIndex: 'minStockLevel',
      key: 'minStockLevel',
      align: 'right',
    },
    {
      title: 'Eksik',
      dataIndex: 'shortage',
      key: 'shortage',
      align: 'right',
      render: (shortage: number) => (
        <Tag color="red">-{shortage}</Tag>
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
          <div className="font-medium">{text}</div>
          <Text type="secondary" className="text-xs">{record.lotNumber}</Text>
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
      title: 'Son Kullanma',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      render: (date: string, record: any) => (
        <div>
          <div className={record.daysUntilExpiry <= 7 ? 'text-red-600' : 'text-orange-600'}>
            {dayjs(date).format('DD/MM/YYYY')}
          </div>
          <Text type="secondary" className="text-xs">{record.daysUntilExpiry} gün kaldı</Text>
        </div>
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
          <span className="text-blue-600 hover:text-blue-800 font-medium">{text}</span>
        </Link>
      ),
    },
    {
      title: 'Kaynak → Hedef',
      key: 'route',
      render: (_: any, record: any) => (
        <div className="text-sm">
          {record.sourceWarehouseName} → {record.destinationWarehouseName}
        </div>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig: Record<string, { color: string; label: string }> = {
          Draft: { color: 'default', label: 'Taslak' },
          Pending: { color: 'processing', label: 'Beklemede' },
          Approved: { color: 'blue', label: 'Onaylı' },
          InTransit: { color: 'orange', label: 'Yolda' },
          Received: { color: 'cyan', label: 'Teslim Alındı' },
          Completed: { color: 'green', label: 'Tamamlandı' },
          Cancelled: { color: 'red', label: 'İptal' },
        };
        const config = statusConfig[status] || { color: 'default', label: status };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
  ];

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow-sm">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString('tr-TR')}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Title level={2} style={{ margin: 0 }}>
            <DashboardOutlined className="mr-2" />
            Envanter Yönetimi
          </Title>
          {dashboardData?.lastUpdated && (
            <Text type="secondary" className="text-sm">
              Son güncelleme: {dayjs(dashboardData.lastUpdated).format('DD/MM/YYYY HH:mm')}
            </Text>
          )}
        </div>
        <Space wrap>
          {/* Warehouse Filter */}
          <Select
            placeholder="Tüm Depolar"
            allowClear
            style={{ width: 180 }}
            value={selectedWarehouseId}
            onChange={setSelectedWarehouseId}
            loading={warehousesLoading}
          >
            {warehouses.map((w: any) => (
              <Select.Option key={w.id} value={w.id}>
                {w.name}
              </Select.Option>
            ))}
          </Select>

          {/* Trend Period Filter */}
          <Select
            value={trendDays}
            onChange={setTrendDays}
            style={{ width: 120 }}
          >
            <Select.Option value={7}>Son 7 Gün</Select.Option>
            <Select.Option value={14}>Son 14 Gün</Select.Option>
            <Select.Option value={30}>Son 30 Gün</Select.Option>
            <Select.Option value={60}>Son 60 Gün</Select.Option>
            <Select.Option value={90}>Son 90 Gün</Select.Option>
          </Select>

          <Button
            icon={<SyncOutlined spin={isLoading} />}
            onClick={handleRefresh}
            loading={isLoading}
          >
            Yenile
          </Button>
          <Link href="/inventory/products">
            <Button type="primary" icon={<AppstoreOutlined />}>Ürünler</Button>
          </Link>
          <Link href="/inventory/warehouses">
            <Button icon={<ShopOutlined />}>Depolar</Button>
          </Link>
          <Link href="/inventory/stock-adjustments">
            <Button icon={<EditOutlined />}>Stok Düzeltme</Button>
          </Link>
          <Button
            icon={<SettingOutlined />}
            onClick={() => setSettingsDrawerOpen(true)}
          >
            Widget Ayarları
          </Button>
        </Space>
      </div>

      {/* Error Alert */}
      {dashboardError && (
        <Alert
          message="Veri yükleme hatası"
          description="Dashboard verileri yüklenirken bir hata oluştu. Yedek veriler gösteriliyor."
          type="warning"
          showIcon
          className="mb-4"
          closable
        />
      )}

      {/* Quick Actions Panel */}
      <Card className="mb-6" size="small">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <ThunderboltOutlined className="text-yellow-500 text-lg" />
            <Text strong>Hızlı İşlemler</Text>
          </div>
          <Space wrap size="small">
            <Link href="/inventory/products/new">
              <Button type="primary" icon={<PlusOutlined />} size="small">
                Yeni Ürün
              </Button>
            </Link>
            <Link href="/inventory/stock-transfers/new">
              <Button icon={<SwapOutlined />} size="small">
                Stok Transferi
              </Button>
            </Link>
            <Link href="/inventory/stock-counts/new">
              <Button icon={<CheckSquareOutlined />} size="small">
                Sayım Başlat
              </Button>
            </Link>
            <Link href="/inventory/stock-adjustments/new">
              <Button icon={<EditOutlined />} size="small">
                Stok Düzeltme
              </Button>
            </Link>
            <Link href="/inventory/stock">
              <Button icon={<FileExcelOutlined />} size="small">
                Excel İşlemleri
              </Button>
            </Link>
            <Link href="/inventory/reports">
              <Button icon={<PrinterOutlined />} size="small">
                Raporlar
              </Button>
            </Link>
            <Link href="/inventory/analytics">
              <Button icon={<BarChartOutlined />} size="small">
                Analitik
              </Button>
            </Link>
          </Space>
        </div>
      </Card>

      {/* Main Stats Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className="h-full">
            <Statistic
              title="Toplam Ürün"
              value={totalProducts}
              prefix={<AppstoreOutlined className="text-blue-500" />}
              suffix={<Text type="secondary" className="text-sm">/ {activeProducts} aktif</Text>}
              loading={isLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className="h-full">
            <Statistic
              title="Toplam Stok Değeri"
              value={totalStockValue}
              prefix={<DollarOutlined className="text-green-500" />}
              formatter={(value) => formatCurrency(Number(value))}
              loading={isLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className="h-full">
            <Statistic
              title="Toplam Stok Miktarı"
              value={totalStockQuantity}
              prefix={<InboxOutlined className="text-purple-500" />}
              formatter={(value) => formatNumber(Number(value))}
              loading={isLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable className="h-full">
            <Statistic
              title="Aktif Depolar"
              value={activeWarehouses}
              prefix={<ShopOutlined className="text-orange-500" />}
              suffix={<Text type="secondary" className="text-sm">/ {totalWarehouses} toplam</Text>}
              loading={warehousesLoading}
            />
          </Card>
        </Col>
      </Row>

      {/* Alert Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={8}>
          <Card className={`h-full ${lowStockCount > 0 ? 'border-red-200 bg-red-50' : ''}`} hoverable>
            <Link href="/inventory/products?lowStock=true">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-full ${lowStockCount > 0 ? 'bg-red-100' : 'bg-gray-100'}`}>
                    <WarningOutlined className={`text-2xl ${lowStockCount > 0 ? 'text-red-500' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <Text strong className="text-lg">{lowStockCount}</Text>
                    <div className="text-gray-500">Düşük Stoklu Ürün</div>
                  </div>
                </div>
                {lowStockCount > 0 && <Tag color="red">Aksiyon Gerekli</Tag>}
              </div>
            </Link>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className={`h-full ${pendingTransfers > 0 ? 'border-orange-200 bg-orange-50' : ''}`} hoverable>
            <Link href="/inventory/stock-transfers">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-full ${pendingTransfers > 0 ? 'bg-orange-100' : 'bg-gray-100'}`}>
                    <SwapOutlined className={`text-2xl ${pendingTransfers > 0 ? 'text-orange-500' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <Text strong className="text-lg">{pendingTransfers}</Text>
                    <div className="text-gray-500">Yoldaki Transfer</div>
                  </div>
                </div>
                {pendingTransfers > 0 && <Tag color="orange">Takip Et</Tag>}
              </div>
            </Link>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className={`h-full ${expiringCount > 0 ? 'border-yellow-200 bg-yellow-50' : ''}`} hoverable>
            <Link href="/inventory/stock?expiring=true">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-full ${expiringCount > 0 ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                    <InboxOutlined className={`text-2xl ${expiringCount > 0 ? 'text-yellow-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <Text strong className="text-lg">{expiringCount}</Text>
                    <div className="text-gray-500">SKT Yaklaşan (30 gün)</div>
                  </div>
                </div>
                {expiringCount > 0 && <Tag color="gold">Dikkat</Tag>}
              </div>
            </Link>
          </Card>
        </Col>
      </Row>

      {/* Charts Row 1 */}
      <Row gutter={[16, 16]} className="mb-6">
        {/* Stock Movement Trend */}
        <Col xs={24} lg={16}>
          <Card title={<><RiseOutlined className="text-blue-500 mr-2" />Stok Hareket Trendi (Son {trendDays} Gün)</>}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={movementTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend />
                <Area type="monotone" dataKey="giren" name="Giren" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                <Area type="monotone" dataKey="cikan" name="Çıkan" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Stock Health */}
        <Col xs={24} lg={8}>
          <Card title={<><WarningOutlined className="text-orange-500 mr-2" />Stok Sağlığı</>}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stockHealthData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                >
                  {stockHealthData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {stockHealthData.map((item, index) => (
                <div key={index} className="flex items-center gap-1 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts Row 2 */}
      <Row gutter={[16, 16]} className="mb-6">
        {/* Top Products by Value */}
        <Col xs={24} lg={12}>
          <Card title={<><DollarOutlined className="text-green-500 mr-2" />En Değerli 10 Ürün (Stok Değerine Göre)</>}>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={topProductsByValue} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(value) => `₺${(value / 1000).toFixed(0)}K`} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
                <RechartsTooltip
                  formatter={(value: number) => `₺${value.toLocaleString('tr-TR')}`}
                  labelFormatter={(label) => topProductsByValue.find(p => p.name === label)?.fullName || label}
                />
                <Bar dataKey="value" name="Stok Değeri" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Category Distribution */}
        <Col xs={24} lg={12}>
          <Card title={<><AppstoreOutlined className="text-purple-500 mr-2" />Kategori Bazlı Stok Değeri</>}>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={categoryValueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(value) => `₺${(value / 1000).toFixed(0)}K`} />
                <RechartsTooltip formatter={(value: number) => `₺${value.toLocaleString('tr-TR')}`} />
                <Bar dataKey="value" name="Stok Değeri" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                  {categoryValueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Product Type Distribution */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={8}>
          <Card title={<><InboxOutlined className="text-cyan-500 mr-2" />Ürün Tipi Dağılımı</>}>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={productTypeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {productTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Low Stock Products Table */}
        <Col xs={24} lg={8}>
          <Card
            title={<><WarningOutlined className="text-red-500 mr-2" />Düşük Stoklu Ürünler</>}
            extra={<Link href="/inventory/products?lowStock=true"><Button type="link" size="small">Tümünü Gör</Button></Link>}
          >
            {lowStockProducts.length > 0 ? (
              <Table
                columns={lowStockColumns}
                dataSource={lowStockProducts.slice(0, 5)}
                rowKey="productId"
                pagination={false}
                size="small"
                loading={lowStockLoading}
              />
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Düşük stoklu ürün yok" />
            )}
          </Card>
        </Col>

        {/* Pending Transfers Table */}
        <Col xs={24} lg={8}>
          <Card
            title={<><SwapOutlined className="text-orange-500 mr-2" />Yoldaki Transferler</>}
            extra={<Link href="/inventory/stock-transfers"><Button type="link" size="small">Tümünü Gör</Button></Link>}
          >
            {transfers.length > 0 ? (
              <Table
                columns={transferColumns}
                dataSource={transfers.slice(0, 5)}
                rowKey="id"
                pagination={false}
                size="small"
                loading={transfersLoading}
              />
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Yolda transfer yok" />
            )}
          </Card>
        </Col>
      </Row>

      {/* Bottom Row */}
      <Row gutter={[16, 16]}>
        {/* Expiring Stock */}
        <Col xs={24} lg={12}>
          <Card
            title={<><InboxOutlined className="text-yellow-600 mr-2" />SKT Yaklaşan Ürünler</>}
            extra={<Link href="/inventory/stock?expiring=true"><Button type="link" size="small">Tümünü Gör</Button></Link>}
          >
            {expiringStock.length > 0 ? (
              <Table
                columns={expiringColumns}
                dataSource={expiringStock.slice(0, 5)}
                rowKey="stockId"
                pagination={false}
                size="small"
                loading={expiringLoading}
              />
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="SKT yaklaşan ürün yok" />
            )}
          </Card>
        </Col>

        {/* Inventory Alerts Widget */}
        <Col xs={24} lg={6}>
          <InventoryAlertsWidget maxItems={5} />
        </Col>

        {/* Warehouse Summary */}
        <Col xs={24} lg={6}>
          <Card
            title={<><ShopOutlined className="text-green-500 mr-2" />Depo Özeti</>}
            extra={<Link href="/inventory/warehouses"><Button type="link" size="small">Tümünü Gör</Button></Link>}
          >
            {warehouses.length > 0 ? (
              <List
                dataSource={warehouses.slice(0, 5)}
                loading={warehousesLoading}
                renderItem={(warehouse: any) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <div className={`p-2 rounded-full ${warehouse.isDefault ? 'bg-blue-100' : 'bg-gray-100'}`}>
                          <ShopOutlined className={warehouse.isDefault ? 'text-blue-500' : 'text-gray-500'} />
                        </div>
                      }
                      title={
                        <Link href={`/inventory/warehouses/${warehouse.id}`}>
                          <span className="text-blue-600 hover:text-blue-800">
                            {warehouse.name}
                            {warehouse.isDefault && <Tag color="blue" className="ml-2">Varsayılan</Tag>}
                          </span>
                        </Link>
                      }
                      description={warehouse.city || 'Konum belirtilmemiş'}
                    />
                    <div className="text-right">
                      <div className="font-semibold">{warehouse.locationCount || 0} konum</div>
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div className="text-center">
                    <div className="mb-2">Henüz depo oluşturulmamış</div>
                    <Link href="/inventory/warehouses">
                      <Button type="primary" icon={<PlusOutlined />}>Depo Oluştur</Button>
                    </Link>
                  </div>
                }
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Advanced KPIs Section */}
      {kpisData && (
        <Row gutter={[16, 16]} className="mt-6">
          <Col span={24}>
            <Card
              title={
                <div className="flex items-center justify-between">
                  <span><BarChartOutlined className="text-indigo-500 mr-2" />Envanter KPI Metrikleri</span>
                  <RangePicker
                    value={kpiDateRange}
                    onChange={(dates) => dates && setKpiDateRange([dates[0]!, dates[1]!])}
                    format="DD/MM/YYYY"
                    style={{ width: 240 }}
                  />
                </div>
              }
            >
              <Spin spinning={kpisLoading}>
                <Row gutter={[16, 16]}>
                  {/* Inventory Turnover */}
                  <Col xs={12} sm={8} lg={4}>
                    <Statistic
                      title={
                        <Tooltip title="Stokların ne kadar hızlı döndüğünü gösterir. Yüksek değer, iyi stok yönetimini ifade eder.">
                          <span>Stok Devir Hızı</span>
                        </Tooltip>
                      }
                      value={kpisData.inventoryTurnoverRatio}
                      precision={2}
                      suffix="x"
                      valueStyle={{ color: kpisData.inventoryTurnoverRatio >= 4 ? '#3f8600' : '#cf1322' }}
                    />
                  </Col>

                  {/* Days of Inventory */}
                  <Col xs={12} sm={8} lg={4}>
                    <Statistic
                      title={
                        <Tooltip title="Mevcut stokun kaç günlük satışa yeteceğini gösterir.">
                          <span>Stok Gün Sayısı</span>
                        </Tooltip>
                      }
                      value={kpisData.daysOfInventory}
                      precision={0}
                      suffix="gün"
                    />
                  </Col>

                  {/* Stockout Rate */}
                  <Col xs={12} sm={8} lg={4}>
                    <Statistic
                      title={
                        <Tooltip title="Stok tükenen ürünlerin oranı. Düşük değer daha iyi.">
                          <span>Stok Tükenme Oranı</span>
                        </Tooltip>
                      }
                      value={kpisData.stockoutRate}
                      precision={1}
                      suffix="%"
                      valueStyle={{ color: kpisData.stockoutRate <= 5 ? '#3f8600' : '#cf1322' }}
                    />
                  </Col>

                  {/* Fill Rate */}
                  <Col xs={12} sm={8} lg={4}>
                    <Statistic
                      title={
                        <Tooltip title="Siparişlerin stoktan karşılanma oranı. Yüksek değer daha iyi.">
                          <span>Karşılama Oranı</span>
                        </Tooltip>
                      }
                      value={kpisData.fillRate}
                      precision={1}
                      suffix="%"
                      valueStyle={{ color: kpisData.fillRate >= 95 ? '#3f8600' : '#cf1322' }}
                    />
                  </Col>

                  {/* GMROI */}
                  <Col xs={12} sm={8} lg={4}>
                    <Statistic
                      title={
                        <Tooltip title="Stok yatırımından elde edilen brüt kar getirisi.">
                          <span>GMROI</span>
                        </Tooltip>
                      }
                      value={kpisData.grossMarginReturnOnInventory}
                      precision={2}
                      suffix="₺"
                    />
                  </Col>

                  {/* Dead Stock */}
                  <Col xs={12} sm={8} lg={4}>
                    <Statistic
                      title={
                        <Tooltip title="Hareketsiz (ölü) stok oranı. Düşük değer daha iyi.">
                          <span>Ölü Stok Oranı</span>
                        </Tooltip>
                      }
                      value={kpisData.deadStockPercentage}
                      precision={1}
                      suffix="%"
                      valueStyle={{ color: kpisData.deadStockPercentage <= 10 ? '#3f8600' : '#cf1322' }}
                    />
                  </Col>
                </Row>

                {/* Movement Summary */}
                <Row gutter={[16, 16]} className="mt-4">
                  <Col xs={24} lg={12}>
                    <Card size="small" title="Hareket Özeti">
                      <Row gutter={16}>
                        <Col span={12}>
                          <Statistic
                            title="Toplam Giriş"
                            value={kpisData.totalInboundMovements}
                            prefix={<ArrowDownOutlined className="text-green-500" />}
                            suffix={`(${formatNumber(kpisData.totalInboundQuantity)} adet)`}
                          />
                        </Col>
                        <Col span={12}>
                          <Statistic
                            title="Toplam Çıkış"
                            value={kpisData.totalOutboundMovements}
                            prefix={<ArrowUpOutlined className="text-red-500" />}
                            suffix={`(${formatNumber(kpisData.totalOutboundQuantity)} adet)`}
                          />
                        </Col>
                      </Row>
                      <div className="mt-2 text-center text-gray-500">
                        Günlük Ortalama: {kpisData.averageMovementsPerDay.toFixed(1)} hareket
                      </div>
                    </Card>
                  </Col>

                  {/* Comparison with Previous Period */}
                  {kpisData.comparison && (
                    <Col xs={24} lg={12}>
                      <Card size="small" title="Önceki Dönem Karşılaştırması">
                        <Row gutter={16}>
                          <Col span={8}>
                            <div className="text-center">
                              <div className="text-gray-500 text-sm">Devir Hızı</div>
                              <div className={`text-lg font-semibold ${kpisData.comparison.turnoverChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {kpisData.comparison.turnoverChange >= 0 ? '+' : ''}{kpisData.comparison.turnoverChange.toFixed(1)}%
                                {kpisData.comparison.turnoverTrend === 'Up' ? <ArrowUpOutlined /> : kpisData.comparison.turnoverTrend === 'Down' ? <ArrowDownOutlined /> : null}
                              </div>
                            </div>
                          </Col>
                          <Col span={8}>
                            <div className="text-center">
                              <div className="text-gray-500 text-sm">Stok Değeri</div>
                              <div className={`text-lg font-semibold ${kpisData.comparison.stockValueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {kpisData.comparison.stockValueChange >= 0 ? '+' : ''}{kpisData.comparison.stockValueChange.toFixed(1)}%
                                {kpisData.comparison.stockValueTrend === 'Up' ? <ArrowUpOutlined /> : kpisData.comparison.stockValueTrend === 'Down' ? <ArrowDownOutlined /> : null}
                              </div>
                            </div>
                          </Col>
                          <Col span={8}>
                            <div className="text-center">
                              <div className="text-gray-500 text-sm">Hareketler</div>
                              <div className={`text-lg font-semibold ${kpisData.comparison.movementsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {kpisData.comparison.movementsChange >= 0 ? '+' : ''}{kpisData.comparison.movementsChange.toFixed(1)}%
                                {kpisData.comparison.movementsTrend === 'Up' ? <ArrowUpOutlined /> : kpisData.comparison.movementsTrend === 'Down' ? <ArrowDownOutlined /> : null}
                              </div>
                            </div>
                          </Col>
                        </Row>
                      </Card>
                    </Col>
                  )}
                </Row>

                {/* Monthly Trend Chart */}
                {kpisData.monthlyTrend && kpisData.monthlyTrend.length > 0 && (
                  <Row className="mt-4">
                    <Col span={24}>
                      <Card size="small" title="Aylık Trend">
                        <ResponsiveContainer width="100%" height={250}>
                          <ComposedChart data={kpisData.monthlyTrend}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="monthName" />
                            <YAxis yAxisId="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <RechartsTooltip />
                            <Legend />
                            <Bar yAxisId="left" dataKey="movementsCount" name="Hareket Sayısı" fill="#8884d8" />
                            <Line yAxisId="right" type="monotone" dataKey="turnoverRatio" name="Devir Hızı" stroke="#82ca9d" />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </Card>
                    </Col>
                  </Row>
                )}

                {/* Turnover by Category */}
                {kpisData.turnoverByCategory && kpisData.turnoverByCategory.length > 0 && (
                  <Row className="mt-4">
                    <Col span={24}>
                      <Card size="small" title="Kategori Bazlı Devir Hızı">
                        <Table
                          dataSource={kpisData.turnoverByCategory}
                          rowKey="categoryId"
                          pagination={false}
                          size="small"
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
                                <span className={value >= 4 ? 'text-green-600' : value >= 2 ? 'text-orange-500' : 'text-red-600'}>
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
                      </Card>
                    </Col>
                  </Row>
                )}
              </Spin>
            </Card>
          </Col>
        </Row>
      )}

      {/* Backend Alerts Section */}
      {alerts.length > 0 && widgetVisibility.alerts && (
        <Row gutter={[16, 16]} className="mt-6">
          <Col span={24}>
            <Card
              title={<><ExclamationCircleOutlined className="text-orange-500 mr-2" />Sistem Uyarıları ({alerts.length})</>}
            >
              <List
                dataSource={alerts.slice(0, 10)}
                renderItem={(alert: InventoryAlertDto) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Tag color={alertSeverityColors[alert.severity] || 'default'}>
                          {alert.severity}
                        </Tag>
                      }
                      title={
                        <div className="flex items-center gap-2">
                          <span>{alert.alertType}</span>
                          {alert.productName && (
                            <Text type="secondary">- {alert.productName}</Text>
                          )}
                        </div>
                      }
                      description={
                        <div>
                          <div>{alert.message}</div>
                          <Text type="secondary" className="text-xs">
                            {dayjs(alert.createdAt).format('DD/MM/YYYY HH:mm')}
                          </Text>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Widget Settings Drawer */}
      <Drawer
        title="Dashboard Widget Ayarları"
        placement="right"
        onClose={() => setSettingsDrawerOpen(false)}
        open={settingsDrawerOpen}
        width={350}
      >
        <div className="space-y-4">
          <Text type="secondary">
            Görmek istediğiniz widget'ları açıp kapatabilirsiniz. Ayarlarınız tarayıcınızda saklanır.
          </Text>

          <Divider orientation="left">Ana Bileşenler</Divider>

          <div className="flex items-center justify-between py-2">
            <div>
              <Text strong>İstatistik Kartları</Text>
              <div className="text-xs text-gray-500">Toplam ürün, değer, miktar</div>
            </div>
            <Switch
              checked={widgetVisibility.stats}
              onChange={() => toggleWidget('stats')}
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <Text strong>Uyarı Kartları</Text>
              <div className="text-xs text-gray-500">Düşük stok, transfer, sayım uyarıları</div>
            </div>
            <Switch
              checked={widgetVisibility.alerts}
              onChange={() => toggleWidget('alerts')}
            />
          </div>

          <Divider orientation="left">Grafikler</Divider>

          <div className="flex items-center justify-between py-2">
            <div>
              <Text strong>Stok Sağlığı</Text>
              <div className="text-xs text-gray-500">Pasta grafik - stok durumu dağılımı</div>
            </div>
            <Switch
              checked={widgetVisibility.stockHealth}
              onChange={() => toggleWidget('stockHealth')}
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <Text strong>Hareket Trendi</Text>
              <div className="text-xs text-gray-500">Giriş/çıkış hareket grafiği</div>
            </div>
            <Switch
              checked={widgetVisibility.movementTrend}
              onChange={() => toggleWidget('movementTrend')}
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <Text strong>En Değerli Ürünler</Text>
              <div className="text-xs text-gray-500">Stok değerine göre sıralama</div>
            </div>
            <Switch
              checked={widgetVisibility.topProducts}
              onChange={() => toggleWidget('topProducts')}
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <Text strong>Kategori Dağılımı</Text>
              <div className="text-xs text-gray-500">Kategori bazlı stok değeri</div>
            </div>
            <Switch
              checked={widgetVisibility.categoryValue}
              onChange={() => toggleWidget('categoryValue')}
            />
          </div>

          <Divider orientation="left">Tablolar</Divider>

          <div className="flex items-center justify-between py-2">
            <div>
              <Text strong>Düşük Stok Tablosu</Text>
              <div className="text-xs text-gray-500">Kritik seviyedeki ürünler</div>
            </div>
            <Switch
              checked={widgetVisibility.lowStock}
              onChange={() => toggleWidget('lowStock')}
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <Text strong>Son Kullanma Tarihi</Text>
              <div className="text-xs text-gray-500">Tarihi yaklaşan ürünler</div>
            </div>
            <Switch
              checked={widgetVisibility.expiringStock}
              onChange={() => toggleWidget('expiringStock')}
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <Text strong>Bekleyen Transferler</Text>
              <div className="text-xs text-gray-500">Yoldaki stok transferleri</div>
            </div>
            <Switch
              checked={widgetVisibility.pendingTransfers}
              onChange={() => toggleWidget('pendingTransfers')}
            />
          </div>

          <Divider orientation="left">Gelişmiş</Divider>

          <div className="flex items-center justify-between py-2">
            <div>
              <Text strong>Gelişmiş KPI'lar</Text>
              <div className="text-xs text-gray-500">Devir hızı, GMROI, stok gün sayısı</div>
            </div>
            <Switch
              checked={widgetVisibility.advancedKpis}
              onChange={() => toggleWidget('advancedKpis')}
            />
          </div>

          <Divider />

          <Button
            block
            onClick={() => {
              setWidgetVisibility(defaultWidgetVisibility);
              localStorage.setItem('inventoryDashboardWidgets', JSON.stringify(defaultWidgetVisibility));
            }}
          >
            Varsayılana Sıfırla
          </Button>
        </div>
      </Drawer>
    </div>
  );
}
