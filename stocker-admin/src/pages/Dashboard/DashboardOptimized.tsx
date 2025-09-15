import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Space, 
  Select, 
  DatePicker, 
  Typography,
  Tabs,
  Segmented,
} from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import {
  TeamOutlined,
  DollarOutlined,
  UserOutlined,
  RiseOutlined,
  CloudServerOutlined,
  DatabaseOutlined,
  ApiOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

// Import optimized components
import { StatCard } from '../../components/optimized/StatCard';
import { ChartCard } from '../../components/optimized/ChartCard';
import { DataTable } from '../../components/optimized/DataTable';

// Import constants
import { 
  DATE_FORMATS, 
  PAGINATION_CONFIG,
  UI_CONFIG,
  COLORS 
} from '../../constants';

const { RangePicker } = DatePicker;
const { Title } = Typography;
const { TabPane } = Tabs;

// Memoized sub-components
const StatsSection = memo(({ stats, loading }: any) => {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Toplam Kiracı"
          value={stats.totalTenants}
          prefix={<TeamOutlined />}
          trend={12.5}
          loading={loading}
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Aktif Kullanıcı"
          value={stats.activeUsers}
          prefix={<UserOutlined />}
          trend={8.3}
          loading={loading}
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Aylık Gelir"
          value={stats.monthlyRevenue}
          prefix={<DollarOutlined />}
          suffix="₺"
          trend={15.2}
          loading={loading}
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <StatCard
          title="Sistem Uptime"
          value={stats.uptime}
          prefix={<CloudServerOutlined />}
          suffix="%"
          precision={2}
          loading={loading}
        />
      </Col>
    </Row>
  );
});

StatsSection.displayName = 'StatsSection';

// Main Dashboard Component with optimizations
const DashboardOptimized: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'day'),
    dayjs()
  ]);
  const [viewMode, setViewMode] = useState<string>('overview');
  const [refreshKey, setRefreshKey] = useState(0);

  // Memoized stats data
  const stats = useMemo(() => ({
    totalTenants: 1247,
    activeTenants: 1189,
    totalUsers: 15632,
    activeUsers: 14280,
    totalRevenue: 458750,
    monthlyRevenue: 67500,
    totalSubscriptions: 1189,
    activeSubscriptions: 1054,
    growthRate: 12.5,
    churnRate: 2.3,
    avgResponseTime: 245,
    uptime: 99.97,
  }), [refreshKey]);

  // Memoized chart data
  const revenueData = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      date: dayjs().subtract(30 - i, 'day').format(DATE_FORMATS.API),
      revenue: Math.floor(Math.random() * 5000) + 2000,
      subscriptions: Math.floor(Math.random() * 50) + 20,
    }));
  }, [refreshKey]);

  // Memoized table data
  const tenantData = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => ({
      key: i,
      name: `Tenant ${i + 1}`,
      users: Math.floor(Math.random() * 100) + 10,
      status: i % 3 === 0 ? 'active' : i % 3 === 1 ? 'trial' : 'inactive',
      revenue: Math.floor(Math.random() * 10000) + 1000,
      lastActive: dayjs().subtract(Math.floor(Math.random() * 30), 'day').format(DATE_FORMATS.DISPLAY_WITH_TIME),
    }));
  }, [refreshKey]);

  // Callbacks with useCallback
  const handleDateRangeChange = useCallback((dates: any) => {
    if (dates) {
      setDateRange(dates);
      // Trigger data refresh
      setRefreshKey(prev => prev + 1);
    }
  }, []);

  const handleViewModeChange = useCallback((value: string) => {
    setViewMode(value);
  }, []);

  const handleRefresh = useCallback(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshKey(prev => prev + 1);
      setLoading(false);
    }, 1000);
  }, []);

  // Effect for initial data load
  useEffect(() => {
    handleRefresh();
  }, []);

  // Memoized chart config
  const chartConfig = useMemo(() => ({
    data: revenueData,
    xField: 'date',
    yField: 'revenue',
    smooth: true,
    color: COLORS.PRIMARY,
    point: {
      size: 3,
      shape: 'circle',
    },
    tooltip: {
      showMarkers: true,
    },
    animation: {
      appear: {
        animation: 'path-in',
        duration: UI_CONFIG.ANIMATION_DURATION,
      },
    },
  }), [revenueData]);

  // Memoized table columns
  const tableColumns = useMemo(() => [
    {
      title: 'Kiracı Adı',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
    },
    {
      title: 'Kullanıcı',
      dataIndex: 'users',
      key: 'users',
      sorter: true,
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === 'active' ? 'green' : status === 'trial' ? 'orange' : 'red';
        return <span style={{ color }}>{status.toUpperCase()}</span>;
      },
    },
    {
      title: 'Gelir',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (value: number) => `₺${value.toLocaleString('tr-TR')}`,
      sorter: true,
    },
    {
      title: 'Son Aktivite',
      dataIndex: 'lastActive',
      key: 'lastActive',
    },
  ], []);

  return (
    <PageContainer
      header={{
        title: 'Dashboard',
        breadcrumb: {},
        extra: [
          <RangePicker
            key="dateRange"
            value={dateRange}
            onChange={handleDateRangeChange}
            format={DATE_FORMATS.DISPLAY}
          />,
          <Select
            key="period"
            defaultValue="30d"
            style={{ width: 120 }}
            options={[
              { value: '7d', label: 'Son 7 Gün' },
              { value: '30d', label: 'Son 30 Gün' },
              { value: '90d', label: 'Son 90 Gün' },
              { value: '1y', label: 'Son 1 Yıl' },
            ]}
          />,
        ],
      }}
    >
      <Space direction="vertical" size="large" style={{ display: 'flex' }}>
        {/* View Mode Selector */}
        <Segmented
          value={viewMode}
          onChange={handleViewModeChange}
          options={[
            { label: 'Genel Bakış', value: 'overview' },
            { label: 'Detaylı', value: 'detailed' },
            { label: 'Analiz', value: 'analytics' },
          ]}
        />

        {/* Stats Cards */}
        <StatsSection stats={stats} loading={loading} />

        {/* Charts Section */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <ChartCard
              title="Gelir Trendi"
              type="line"
              data={revenueData}
              config={chartConfig}
              loading={loading}
            />
          </Col>
          <Col xs={24} lg={8}>
            <ChartCard
              title="Paket Dağılımı"
              type="pie"
              data={[
                { type: 'Starter', value: 27 },
                { type: 'Professional', value: 45 },
                { type: 'Enterprise', value: 28 },
              ]}
              config={{
                angleField: 'value',
                colorField: 'type',
                radius: 0.8,
                label: {
                  type: 'spider',
                  labelHeight: 28,
                  content: '{name}\n{percentage}',
                },
              }}
              loading={loading}
            />
          </Col>
        </Row>

        {/* Data Table */}
        <Card title="En Aktif Kiracılar">
          <DataTable
            columns={tableColumns}
            dataSource={tenantData}
            loading={loading}
            pagination={{
              pageSize: PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
              showSizeChanger: true,
              pageSizeOptions: PAGINATION_CONFIG.PAGE_SIZE_OPTIONS.map(String),
            }}
          />
        </Card>
      </Space>
    </PageContainer>
  );
};

// Export with memo for parent component optimization
export default memo(DashboardOptimized);