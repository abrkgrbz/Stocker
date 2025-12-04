'use client';

import React, { useState, useMemo } from 'react';
import {
  Typography,
  Card,
  Row,
  Col,
  Button,
  Space,
  Select,
  DatePicker,
  Tabs,
  Table,
  Statistic,
  Progress,
  Tag,
  Empty,
} from 'antd';
import {
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  DownloadOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  DollarOutlined,
  InboxOutlined,
  SwapOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ShopOutlined,
  AppstoreOutlined,
  WarningOutlined,
} from '@ant-design/icons';
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
  Treemap,
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

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// Colors
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

// Custom tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border rounded shadow-lg">
        <p className="font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }}>
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
  const { data: products = [] } = useProducts(true);
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

  const stockValueByWarehouse = useMemo(() => {
    // This would require warehouse stock data - simplified version
    return warehouses.slice(0, 8).map((w: any, index: number) => ({
      name: w.name,
      value: Math.floor(Math.random() * 500000) + 100000, // Placeholder
      products: Math.floor(Math.random() * 100) + 20,
    }));
  }, [warehouses]);

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

  // ============= TURNOVER ANALYSIS =============
  const turnoverData = useMemo(() => {
    // Simplified turnover calculation
    return products.slice(0, 10).map((p: ProductDto) => {
      const salesMovements = movements.filter(
        (m: StockMovementDto) => m.productId === p.id && m.movementType === 'Sales'
      );
      const totalSold = salesMovements.reduce((sum, m) => sum + m.quantity, 0);
      const avgStock = p.totalStockQuantity || 1;
      const turnover = totalSold / avgStock;

      return {
        name: p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name,
        turnover: Number(turnover.toFixed(2)),
        quantity: p.totalStockQuantity,
        sold: totalSold,
      };
    });
  }, [products, movements]);

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
          <DollarOutlined /> Stok Değeri
        </span>
      ),
      children: (
        <Row gutter={[16, 16]}>
          {/* Summary Cards */}
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Toplam Stok Değeri"
                value={totalStockValue}
                prefix={<DollarOutlined />}
                suffix="₺"
                precision={0}
                valueStyle={{ color: '#3b82f6' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Toplam Stok Miktarı"
                value={totalStockQuantity}
                prefix={<InboxOutlined />}
                valueStyle={{ color: '#10b981' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Ortalama Ürün Değeri"
                value={products.length > 0 ? totalStockValue / products.length : 0}
                prefix={<BarChartOutlined />}
                suffix="₺"
                precision={0}
                valueStyle={{ color: '#8b5cf6' }}
              />
            </Card>
          </Col>

          {/* Charts */}
          <Col xs={24} lg={12}>
            <Card
              title="Kategoriye Göre Stok Değeri"
              extra={
                <Space>
                  <Button size="small" icon={<FilePdfOutlined />} onClick={() => handleExport('pdf', 'stock-value')}>
                    PDF
                  </Button>
                  <Button size="small" icon={<FileExcelOutlined />} onClick={() => handleExport('excel', 'stock-value')}>
                    Excel
                  </Button>
                </Space>
              }
            >
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={stockValueByCategory} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(v) => `₺${(v / 1000).toFixed(0)}K`} />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
                  <RechartsTooltip
                    formatter={(value: number) => [`₺${value.toLocaleString('tr-TR')}`, 'Değer']}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Kategoriye Göre Dağılım">
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
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: 'movements',
      label: (
        <span>
          <SwapOutlined /> Hareketler
        </span>
      ),
      children: (
        <Row gutter={[16, 16]}>
          {/* Movement Summary */}
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Toplam Hareket"
                value={movements.length}
                prefix={<SwapOutlined />}
                valueStyle={{ color: '#3b82f6' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Giriş Hareketleri"
                value={movements.filter((m: StockMovementDto) =>
                  ['Purchase', 'SalesReturn', 'AdjustmentIncrease'].includes(m.movementType)
                ).length}
                prefix={<ArrowUpOutlined />}
                valueStyle={{ color: '#10b981' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Çıkış Hareketleri"
                value={movements.filter((m: StockMovementDto) =>
                  ['Sales', 'PurchaseReturn', 'AdjustmentDecrease'].includes(m.movementType)
                ).length}
                prefix={<ArrowDownOutlined />}
                valueStyle={{ color: '#ef4444' }}
              />
            </Card>
          </Col>

          {/* Movement Trend */}
          <Col xs={24}>
            <Card
              title="Hareket Trendi (Son 30 Gün)"
              extra={
                <Space>
                  <Button size="small" icon={<FilePdfOutlined />} onClick={() => handleExport('pdf', 'movements')}>
                    PDF
                  </Button>
                  <Button size="small" icon={<FileExcelOutlined />} onClick={() => handleExport('excel', 'movements')}>
                    Excel
                  </Button>
                </Space>
              }
            >
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={movementTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="giren"
                    name="Giren"
                    stackId="1"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="cikan"
                    name="Çıkan"
                    stackId="2"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* Movement by Type */}
          <Col xs={24} lg={12}>
            <Card title="Hareket Türlerine Göre Dağılım">
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
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* Transfer Summary */}
          <Col xs={24} lg={12}>
            <Card title="Transfer Özeti">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic
                    title="Toplam Transfer"
                    value={transfers.length}
                    prefix={<SwapOutlined />}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Tamamlanan"
                    value={transfers.filter((t: any) => t.status === 'Completed').length}
                    valueStyle={{ color: '#10b981' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Bekleyen"
                    value={transfers.filter((t: any) => t.status === 'Pending').length}
                    valueStyle={{ color: '#f59e0b' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Yolda"
                    value={transfers.filter((t: any) => t.status === 'InTransit').length}
                    valueStyle={{ color: '#3b82f6' }}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: 'abc',
      label: (
        <span>
          <PieChartOutlined /> ABC Analizi
        </span>
      ),
      children: (
        <Row gutter={[16, 16]}>
          {/* ABC Summary */}
          <Col xs={24} sm={8}>
            <Card className="border-l-4 border-l-red-500">
              <Statistic
                title="A Sınıfı Ürünler"
                value={abcAnalysis.summary.A}
                suffix={`/ ${products.length}`}
                valueStyle={{ color: '#ef4444' }}
              />
              <Text type="secondary">%80 değer, yüksek öncelik</Text>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="border-l-4 border-l-yellow-500">
              <Statistic
                title="B Sınıfı Ürünler"
                value={abcAnalysis.summary.B}
                suffix={`/ ${products.length}`}
                valueStyle={{ color: '#f59e0b' }}
              />
              <Text type="secondary">%15 değer, orta öncelik</Text>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="border-l-4 border-l-green-500">
              <Statistic
                title="C Sınıfı Ürünler"
                value={abcAnalysis.summary.C}
                suffix={`/ ${products.length}`}
                valueStyle={{ color: '#10b981' }}
              />
              <Text type="secondary">%5 değer, düşük öncelik</Text>
            </Card>
          </Col>

          {/* ABC Distribution */}
          <Col xs={24} lg={12}>
            <Card title="ABC Sınıfı Dağılımı">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'A Sınıfı', value: abcAnalysis.summary.A, color: '#ef4444' },
                      { name: 'B Sınıfı', value: abcAnalysis.summary.B, color: '#f59e0b' },
                      { name: 'C Sınıfı', value: abcAnalysis.summary.C, color: '#10b981' },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    label
                  >
                    <Cell fill="#ef4444" />
                    <Cell fill="#f59e0b" />
                    <Cell fill="#10b981" />
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* Top A Class Products */}
          <Col xs={24} lg={12}>
            <Card
              title="En Değerli A Sınıfı Ürünler"
              extra={
                <Space>
                  <Button size="small" icon={<FilePdfOutlined />} onClick={() => handleExport('pdf', 'abc')}>
                    PDF
                  </Button>
                  <Button size="small" icon={<FileExcelOutlined />} onClick={() => handleExport('excel', 'abc')}>
                    Excel
                  </Button>
                </Space>
              }
            >
              <Table
                dataSource={abcAnalysis.products.filter((p) => p.category === 'A').slice(0, 10)}
                rowKey="id"
                pagination={false}
                size="small"
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
                      <Tag color={c === 'A' ? 'red' : c === 'B' ? 'orange' : 'green'}>{c}</Tag>
                    ),
                  },
                ]}
              />
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: 'alerts',
      label: (
        <span>
          <WarningOutlined /> Uyarılar
        </span>
      ),
      children: (
        <Row gutter={[16, 16]}>
          {/* Low Stock Summary */}
          <Col xs={24} sm={12}>
            <Card>
              <Statistic
                title="Düşük Stoklu Ürünler"
                value={lowStockProducts.length}
                prefix={<WarningOutlined className="text-red-500" />}
                valueStyle={{ color: '#ef4444' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card>
              <Statistic
                title="Stokta Olmayan Ürünler"
                value={products.filter((p: ProductDto) => p.totalStockQuantity === 0 && p.isActive).length}
                prefix={<InboxOutlined className="text-orange-500" />}
                valueStyle={{ color: '#f59e0b' }}
              />
            </Card>
          </Col>

          {/* Low Stock Products Table */}
          <Col xs={24}>
            <Card title="Düşük Stoklu Ürünler Listesi">
              {lowStockProducts.length > 0 ? (
                <Table
                  dataSource={lowStockProducts}
                  rowKey="productId"
                  pagination={{ pageSize: 10 }}
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
                        <span className={v <= record.minimumQuantity / 2 ? 'text-red-500 font-bold' : 'text-orange-500'}>
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
                        <Tag color="red">{record.minimumQuantity - record.currentQuantity}</Tag>
                      ),
                    },
                  ]}
                />
              ) : (
                <Empty description="Düşük stoklu ürün yok" />
              )}
            </Card>
          </Col>
        </Row>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Envanter Raporları
          </Title>
          <Text type="secondary">Stok analizi, hareket raporları ve performans metrikleri</Text>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} lg={8}>
            <Text strong className="block mb-1">Tarih Aralığı</Text>
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
              style={{ width: '100%' }}
              placeholder={['Başlangıç', 'Bitiş']}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Text strong className="block mb-1">Depo</Text>
            <Select
              placeholder="Tüm Depolar"
              value={selectedWarehouse}
              onChange={setSelectedWarehouse}
              allowClear
              style={{ width: '100%' }}
              options={warehouses.map((w: any) => ({ value: w.id, label: w.name }))}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Text strong className="block mb-1">Kategori</Text>
            <Select
              placeholder="Tüm Kategoriler"
              value={selectedCategory}
              onChange={setSelectedCategory}
              allowClear
              style={{ width: '100%' }}
              options={categories.map((c: CategoryDto) => ({ value: c.id, label: c.name }))}
            />
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Text strong className="block mb-1">&nbsp;</Text>
            <Button
              onClick={() => {
                setDateRange([dayjs().subtract(30, 'day'), dayjs()]);
                setSelectedWarehouse(undefined);
                setSelectedCategory(undefined);
              }}
            >
              Sıfırla
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Report Tabs */}
      <Card>
        <Tabs items={tabItems} size="large" />
      </Card>
    </div>
  );
}
