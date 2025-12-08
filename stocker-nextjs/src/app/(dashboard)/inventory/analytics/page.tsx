'use client';

import React, { useState, useMemo } from 'react';
import {
  Typography,
  Card,
  Row,
  Col,
  Statistic,
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
  Divider,
  Segmented,
} from 'antd';
import {
  DashboardOutlined,
  DollarOutlined,
  LineChartOutlined,
  PieChartOutlined,
  BarChartOutlined,
  RiseOutlined,
  FallOutlined,
  SyncOutlined,
  DownloadOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  AppstoreOutlined,
  ShopOutlined,
  InboxOutlined,
  SwapOutlined,
  FilterOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
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
  LineChart,
  Line,
  AreaChart,
  Area,
  ComposedChart,
  Treemap,
} from 'recharts';
import {
  useInventoryDashboard,
  useStockValuation,
  useInventoryKPIs,
  useWarehouses,
  useCategories,
} from '@/lib/api/hooks/useInventory';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// Color palette
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
const CATEGORY_COLORS = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#eb2f96', '#13c2c2', '#fa8c16'];

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

export default function InventoryAnalyticsPage() {
  // State
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | undefined>(undefined);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);
  const [trendDays, setTrendDays] = useState<number>(30);
  const [activeTab, setActiveTab] = useState<string>('overview');
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
        fill: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      }));
    }
    return byCategory.map((c, index) => ({
      name: c.categoryName,
      value: c.stockValue,
      quantity: c.totalQuantity,
      productCount: c.productCount,
      percentage: 0,
      fill: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
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
        fill: COLORS[index % COLORS.length],
      }));
    }
    return byWarehouse.map((w, index) => ({
      name: w.warehouseName,
      code: '',
      value: w.stockValue,
      quantity: w.totalQuantity,
      productCount: w.productCount,
      percentage: 0,
      fill: COLORS[index % COLORS.length],
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
    <Row gutter={[16, 16]}>
      {/* KPI Cards */}
      <Col xs={24} sm={12} md={6}>
        <Card size="small" hoverable>
          <Statistic
            title="Toplam Stok Degeri"
            value={valuationData?.totalValue || kpis?.totalStockValue || 0}
            precision={0}
            prefix={<DollarOutlined style={{ color: '#1890ff' }} />}
            valueStyle={{ color: '#1890ff' }}
            formatter={(value) => formatCurrency(Number(value))}
          />
          {valuationSummary?.valueChangePercent !== undefined && (
            <div style={{ marginTop: 8 }}>
              <Tag color={valuationSummary.valueChangePercent >= 0 ? 'green' : 'red'}>
                {valuationSummary.valueChangePercent >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                {formatPercentage(Math.abs(valuationSummary.valueChangePercent))} onceki aya gore
              </Tag>
            </div>
          )}
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" hoverable>
          <Statistic
            title="Toplam Urun Sayisi"
            value={valuationData?.totalProducts || kpis?.totalProducts || 0}
            prefix={<AppstoreOutlined style={{ color: '#52c41a' }} />}
            valueStyle={{ color: '#52c41a' }}
          />
          <div style={{ marginTop: 8 }}>
            <Text type="secondary">{valuationData?.totalSKUs || 0} farkli SKU</Text>
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" hoverable>
          <Statistic
            title="Toplam Miktar"
            value={valuationData?.totalQuantity || kpis?.totalStockQuantity || 0}
            precision={0}
            prefix={<InboxOutlined style={{ color: '#722ed1' }} />}
            valueStyle={{ color: '#722ed1' }}
            formatter={(value) => formatNumber(Number(value))}
            suffix="adet"
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small" hoverable>
          <Statistic
            title="Ortalama Birim Maliyet"
            value={valuationSummary?.averageUnitCost || 0}
            precision={2}
            prefix={<BarChartOutlined style={{ color: '#fa8c16' }} />}
            valueStyle={{ color: '#fa8c16' }}
            formatter={(value) => formatCurrency(Number(value))}
          />
        </Card>
      </Col>

      {/* Stock Movement Trend */}
      <Col xs={24} lg={16}>
        <Card
          title={
            <Space>
              <LineChartOutlined />
              <span>Stok Hareket Trendi</span>
            </Space>
          }
          extra={
            <Select
              value={trendDays}
              onChange={setTrendDays}
              style={{ width: 120 }}
              options={[
                { label: 'Son 7 Gun', value: 7 },
                { label: 'Son 14 Gun', value: 14 },
                { label: 'Son 30 Gun', value: 30 },
                { label: 'Son 90 Gun', value: 90 },
              ]}
            />
          }
        >
          {movementTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={movementTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <RechartsTooltip
                  formatter={(value: number, name: string) => {
                    if (name === 'Giren Deger' || name === 'Cikan Deger') {
                      return formatCurrency(value);
                    }
                    return formatNumber(value);
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="giren" name="Giren" fill="#52c41a" />
                <Bar yAxisId="left" dataKey="cikan" name="Cikan" fill="#f5222d" />
                <Line yAxisId="right" type="monotone" dataKey="net" name="Net Degisim" stroke="#1890ff" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <Empty description="Veri bulunamadi" />
          )}
        </Card>
      </Col>

      {/* Alert Summary */}
      <Col xs={24} lg={8}>
        <Card
          title={
            <Space>
              <WarningOutlined />
              <span>Uyarilar</span>
            </Space>
          }
          extra={<Link href="/inventory/stock-alerts">Tumu</Link>}
        >
          <div style={{ height: 300, overflow: 'auto' }}>
            {alerts.length > 0 ? (
              <Space direction="vertical" style={{ width: '100%' }}>
                {alerts.slice(0, 8).map((alert, index) => (
                  <div key={index} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <Space align="start">
                      {alert.severity === 'Critical' ? (
                        <ExclamationCircleOutlined style={{ color: '#f5222d' }} />
                      ) : alert.severity === 'High' ? (
                        <WarningOutlined style={{ color: '#fa8c16' }} />
                      ) : (
                        <InfoCircleOutlined style={{ color: '#1890ff' }} />
                      )}
                      <div>
                        <Text strong>{alert.productName || alert.alertType}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {alert.message}
                        </Text>
                      </div>
                    </Space>
                  </div>
                ))}
              </Space>
            ) : (
              <Empty description="Aktif uyari yok" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </div>
        </Card>
      </Col>

      {/* Category Distribution */}
      <Col xs={24} lg={12}>
        <Card
          title={
            <Space>
              <PieChartOutlined />
              <span>Kategorilere Gore Dagilim</span>
            </Space>
          }
        >
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
                  label={(props: any) => `${props.name} (${formatPercentage((props.percent || 0) * 100)})`}
                  labelLine={false}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <RechartsTooltip
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <Empty description="Veri bulunamadi" />
          )}
        </Card>
      </Col>

      {/* Warehouse Distribution */}
      <Col xs={24} lg={12}>
        <Card
          title={
            <Space>
              <ShopOutlined />
              <span>Depolara Gore Dagilim</span>
            </Space>
          }
        >
          {warehouseData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={warehouseData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(value) => formatCompactNumber(value)} />
                <YAxis type="category" dataKey="name" width={100} />
                <RechartsTooltip
                  formatter={(value: number, name: string) => {
                    if (name === 'value') return formatCurrency(value);
                    return formatNumber(value);
                  }}
                />
                <Bar dataKey="value" name="Deger" fill="#1890ff">
                  {warehouseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Empty description="Veri bulunamadi" />
          )}
        </Card>
      </Col>

      {/* Top Products by Value */}
      <Col xs={24}>
        <Card
          title={
            <Space>
              <DollarOutlined />
              <span>En Degerli Urunler (Top 15)</span>
            </Space>
          }
        >
          <Table
            dataSource={topProductsData}
            columns={[
              {
                title: 'Urun Kodu',
                dataIndex: 'code',
                key: 'code',
                width: 120,
              },
              {
                title: 'Urun Adi',
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
                title: 'Toplam Deger',
                dataIndex: 'value',
                key: 'value',
                width: 150,
                align: 'right' as const,
                render: (value) => (
                  <Text strong style={{ color: '#1890ff' }}>
                    {formatCurrency(value)}
                  </Text>
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
                    strokeColor="#1890ff"
                  />
                ),
              },
            ]}
            rowKey="code"
            pagination={false}
            size="small"
            scroll={{ x: 900 }}
          />
        </Card>
      </Col>
    </Row>
  );

  // Render Valuation Tab
  const renderValuation = () => (
    <Row gutter={[16, 16]}>
      {/* Valuation Summary Cards */}
      <Col xs={24} sm={12} md={6}>
        <Card size="small">
          <Statistic
            title="En Yuksek Degerli Urun"
            value={valuationSummary?.highestValueProduct || 0}
            prefix={<RiseOutlined style={{ color: '#52c41a' }} />}
            formatter={(value) => formatCurrency(Number(value))}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small">
          <Statistic
            title="En Dusuk Degerli Urun"
            value={valuationSummary?.lowestValueProduct || 0}
            prefix={<FallOutlined style={{ color: '#f5222d' }} />}
            formatter={(value) => formatCurrency(Number(value))}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small">
          <Statistic
            title="Medyan Urun Degeri"
            value={valuationSummary?.medianProductValue || 0}
            prefix={<BarChartOutlined style={{ color: '#722ed1' }} />}
            formatter={(value) => formatCurrency(Number(value))}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card size="small">
          <Statistic
            title="Tarih"
            value={valuationData?.asOfDate ? dayjs(valuationData.asOfDate).format('DD/MM/YYYY') : '-'}
            prefix={<ClockCircleOutlined style={{ color: '#fa8c16' }} />}
          />
        </Card>
      </Col>

      {/* Treemap */}
      <Col xs={24}>
        <Card
          title={
            <Space>
              <AppstoreOutlined />
              <span>Kategori Bazli Stok Degeri (Treemap)</span>
            </Space>
          }
        >
          {treemapData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <Treemap
                data={treemapData}
                dataKey="size"
                aspectRatio={4 / 3}
                stroke="#fff"
                fill="#1890ff"
                content={({ x, y, width, height, name, size, productCount }) => (
                  <g>
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      style={{
                        fill: CATEGORY_COLORS[treemapData.findIndex(d => d.name === name) % CATEGORY_COLORS.length],
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
            <Empty description="Veri bulunamadi" />
          )}
        </Card>
      </Col>

      {/* Category Table */}
      <Col xs={24}>
        <Card
          title={
            <Space>
              <PieChartOutlined />
              <span>Kategori Bazli Detayli Rapor</span>
            </Space>
          }
        >
          <Table
            dataSource={categoryData}
            columns={[
              {
                title: 'Kategori',
                dataIndex: 'name',
                key: 'name',
              },
              {
                title: 'Urun Sayisi',
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
                title: 'Toplam Deger',
                dataIndex: 'value',
                key: 'value',
                align: 'right' as const,
                render: (value) => (
                  <Text strong style={{ color: '#1890ff' }}>
                    {formatCurrency(value)}
                  </Text>
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
                    strokeColor={{
                      from: '#108ee9',
                      to: '#87d068',
                    }}
                  />
                ),
              },
            ]}
            rowKey="name"
            pagination={false}
            size="small"
            summary={(pageData) => {
              const totalValue = pageData.reduce((sum, row) => sum + row.value, 0);
              const totalQuantity = pageData.reduce((sum, row) => sum + row.quantity, 0);
              const totalProducts = pageData.reduce((sum, row) => sum + row.productCount, 0);
              return (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0}>
                    <Text strong>TOPLAM</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right">
                    <Text strong>{formatNumber(totalProducts)}</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} align="right">
                    <Text strong>{formatNumber(totalQuantity)}</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3} align="right">
                    <Text strong style={{ color: '#1890ff' }}>{formatCurrency(totalValue)}</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={4}>
                    <Text strong>%100</Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              );
            }}
          />
        </Card>
      </Col>
    </Row>
  );

  // Render KPIs Tab
  const renderKPIs = () => (
    <Row gutter={[16, 16]}>
      {/* Date Range Selector */}
      <Col xs={24}>
        <Card size="small">
          <Space>
            <Text strong>Rapor Dönemi:</Text>
            <RangePicker
              value={kpiDateRange}
              onChange={(dates) => {
                if (dates && dates[0] && dates[1]) {
                  setKpiDateRange([dates[0], dates[1]]);
                }
              }}
              format="DD/MM/YYYY"
            />
          </Space>
        </Card>
      </Col>

      {/* KPI Cards */}
      {kpisData && (
        <>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="Toplam Giris"
                value={kpisData.totalInboundQuantity || 0}
                prefix={<ArrowDownOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
                formatter={(value) => formatNumber(Number(value))}
                suffix="adet"
              />
              <Divider style={{ margin: '8px 0' }} />
              <Text type="secondary">{kpisData.totalInboundMovements || 0} hareket</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="Toplam Cikis"
                value={kpisData.totalOutboundQuantity || 0}
                prefix={<ArrowUpOutlined style={{ color: '#f5222d' }} />}
                valueStyle={{ color: '#f5222d' }}
                formatter={(value) => formatNumber(Number(value))}
                suffix="adet"
              />
              <Divider style={{ margin: '8px 0' }} />
              <Text type="secondary">{kpisData.totalOutboundMovements || 0} hareket</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="Stok Devir Orani"
                value={kpisData.inventoryTurnoverRatio || 0}
                precision={2}
                prefix={<SyncOutlined style={{ color: '#722ed1' }} />}
                valueStyle={{ color: '#722ed1' }}
                suffix="x"
              />
              <Divider style={{ margin: '8px 0' }} />
              <Text type="secondary">~{kpisData.daysOfInventory || 0} gun stok</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="Gunluk Ort Hareket"
                value={kpisData.averageMovementsPerDay || 0}
                precision={1}
                prefix={<SwapOutlined style={{ color: '#1890ff' }} />}
                valueStyle={{ color: '#1890ff' }}
              />
              <Divider style={{ margin: '8px 0' }} />
              <Text type="secondary">Stoksuzluk: %{(kpisData.stockoutRate || 0).toFixed(1)}</Text>
            </Card>
          </Col>
        </>
      )}

      {/* Turnover by Category */}
      {kpisData?.turnoverByCategory && kpisData.turnoverByCategory.length > 0 && (
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <BarChartOutlined />
                <span>Kategorilere Gore Devir Hizi</span>
              </Space>
            }
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={kpisData.turnoverByCategory.map((c) => ({
                  name: c.categoryName,
                  turnover: c.turnoverRatio,
                  days: c.daysOfInventory,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="turnover" name="Devir Orani" fill="#1890ff">
                  {kpisData.turnoverByCategory.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      )}

      {/* Turnover Rate Dashboard */}
      {kpisData?.inventoryTurnoverRatio !== undefined && (
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <SyncOutlined />
                <span>Stok Devir Performansi</span>
              </Space>
            }
          >
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Progress
                type="dashboard"
                percent={Math.min(kpisData.inventoryTurnoverRatio * 10, 100)}
                format={() => (
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 'bold' }}>
                      {kpisData.inventoryTurnoverRatio?.toFixed(2)}x
                    </div>
                    <div style={{ fontSize: 12, color: '#999' }}>Devir Hizi</div>
                  </div>
                )}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
              />
              <div style={{ marginTop: 16 }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Text type="secondary">Doluluk Orani: %{((kpisData.fillRate || 0) * 100).toFixed(1)}</Text>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary">Fire Orani: %{((kpisData.shrinkageRate || 0) * 100).toFixed(1)}</Text>
                  </Col>
                </Row>
              </div>
            </div>
          </Card>
        </Col>
      )}
    </Row>
  );

  return (
    <div style={{ padding: '24px' }}>
      <Spin spinning={isLoading}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <DashboardOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                <Title level={3} style={{ margin: 0 }}>
                  Envanter Analitikleri
                </Title>
              </Space>
            </Col>
            <Col>
              <Space>
                <Select
                  placeholder="Tum Depolar"
                  allowClear
                  style={{ width: 180 }}
                  value={selectedWarehouseId}
                  onChange={setSelectedWarehouseId}
                  options={warehouses.map((w: any) => ({
                    label: w.name,
                    value: w.id,
                  }))}
                />
                <Select
                  placeholder="Tum Kategoriler"
                  allowClear
                  style={{ width: 180 }}
                  value={selectedCategoryId}
                  onChange={setSelectedCategoryId}
                  options={categories.map((c: any) => ({
                    label: c.name,
                    value: c.id,
                  }))}
                />
                <Tooltip title="Yenile">
                  <Button
                    icon={<SyncOutlined spin={isLoading} />}
                    onClick={() => refetchDashboard()}
                  />
                </Tooltip>
                <Button icon={<DownloadOutlined />}>Rapor Indir</Button>
              </Space>
            </Col>
          </Row>
        </div>

        {/* Tabs */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'overview',
              label: (
                <span>
                  <DashboardOutlined />
                  Genel Bakis
                </span>
              ),
              children: renderOverview(),
            },
            {
              key: 'valuation',
              label: (
                <span>
                  <DollarOutlined />
                  Stok Degerleme
                </span>
              ),
              children: renderValuation(),
            },
            {
              key: 'kpis',
              label: (
                <span>
                  <BarChartOutlined />
                  KPI Raporu
                </span>
              ),
              children: renderKPIs(),
            },
          ]}
        />
      </Spin>
    </div>
  );
}
