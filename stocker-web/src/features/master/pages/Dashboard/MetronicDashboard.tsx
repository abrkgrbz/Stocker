import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Progress,
  Table,
  Tag,
  Avatar,
  Space,
  Button,
  Dropdown,
  Select,
  DatePicker,
  Typography,
  List,
  Timeline,
  Badge,
  Tooltip,
  Skeleton,
  message,
} from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  UserOutlined,
  TeamOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  RiseOutlined,
  FallOutlined,
  MoreOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  ExportOutlined,
  FilterOutlined,
  FileTextOutlined,
  CrownOutlined,
  FireOutlined,
  RocketOutlined,
  ThunderboltOutlined,
  HeartOutlined,
  StarOutlined,
  TrophyOutlined,
  ApiOutlined,
  WarningOutlined,
  SettingOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
// Lazy load charts for better initial load performance
const Area = lazy(() => import('@ant-design/charts').then(module => ({ default: module.Area })));
const Pie = lazy(() => import('@ant-design/charts').then(module => ({ default: module.Pie })));
import CountUp from 'react-countup';
import { masterApi } from '@/shared/api/master.api';
import { dashboardApi } from '@/shared/api/dashboard.api';
import { useApiCache, prefetchApi } from '@/shared/hooks/useApiCache';
import { useDebounce } from '@/shared/utils/performance';
import './metronic-dashboard.css';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

const MetronicDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('month');
  const [searchQuery, setSearchQuery] = useState('');

  // Use API cache for tenants
  const {
    data: tenantsData,
    loading: loadingTenants,
    error: tenantsError,
    refetch: refetchTenants,
    isStale: tenantsStale
  } = useApiCache(
    `dashboard-tenants-${timeRange}`,
    async () => {
      const response = await dashboardApi.topTenants.get();
      if (response.data?.success && response.data?.data) {
        return response.data.data.map((tenant: any, index: number) => ({
          key: tenant.id,
          rank: index + 1,
          name: tenant.name,
          plan: tenant.plan,
          users: tenant.users,
          revenue: tenant.revenue,
          growth: tenant.growth,
          status: tenant.status,
        }));
      }
      return [];
    },
    { ttl: 5 * 60 * 1000, staleTime: 60 * 1000 }
  );

  // Use API cache for stats
  const {
    data: statsData,
    loading: loadingStats,
    error: statsError,
    refetch: refetchStats,
    isStale: statsStale
  } = useApiCache(
    `dashboard-stats-${timeRange}`,
    async () => {
      const response = await dashboardApi.stats.get();
      if (response.data?.success && response.data?.data) {
        const data = response.data.data;
        return {
          totalRevenue: data.totalRevenue,
          activeTenants: data.activeTenants,
          totalUsers: data.totalUsers,
          activeUsers: data.activeUsers,
          conversionRate: 68.3,
          revenueChange: data.growth.revenue,
          tenantsChange: data.growth.tenants,
          usersChange: data.growth.users,
          systemHealth: data.systemHealth,
          packageDistribution: data.packageDistribution
        };
      }
      return null;
    },
    { ttl: 5 * 60 * 1000, staleTime: 60 * 1000 }
  );

  const tenants = useMemo(() => tenantsData || [], [tenantsData]);
  const stats = useMemo(() => statsData || {
    totalRevenue: 524350,
    activeTenants: 386,
    totalUsers: 4823,
    conversionRate: 68.3,
  }, [statsData]);

  // Prefetch data for next time range
  useEffect(() => {
    const nextTimeRange = timeRange === 'today' ? 'week' : 
                         timeRange === 'week' ? 'month' : 
                         timeRange === 'month' ? 'year' : 'today';
    
    prefetchApi(
      `dashboard-stats-${nextTimeRange}`,
      () => dashboardApi.stats.get(),
      5 * 60 * 1000
    );
  }, [timeRange]);

  const handleRefresh = useCallback(async () => {
    try {
      await Promise.all([refetchTenants(), refetchStats()]);
      message.success('Dashboard yenilendi');
    } catch (error) {
      message.error('Yenileme başarısız');
    }
  }, [refetchTenants, refetchStats]);

  // Debounced search for tenants
  const debouncedSearch = useDebounce((query: string) => {
    // Filter tenants based on search query
    console.log('Searching for:', query);
  }, 300);

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
    debouncedSearch(value);
  }, [debouncedSearch]);

  // Filter tenants based on search
  const filteredTenants = useMemo(() => {
    if (!searchQuery) return tenants;
    
    return tenants.filter(tenant => 
      tenant.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.plan?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tenants, searchQuery]);

  // Stats Data - Memoized for performance
  const statsCardData = useMemo(() => [
    {
      title: 'Toplam Gelir',
      value: stats?.totalRevenue || 524350,
      prefix: '',
      change: stats?.revenueChange || 12.5,
      changeType: (stats?.revenueChange || 12.5) > 0 ? 'increase' : 'decrease',
      icon: <span style={{ fontSize: 24, fontWeight: 600 }}>₺</span>,
      color: '#667eea',
      bgColor: 'rgba(102, 126, 234, 0.1)',
      description: 'geçen aya göre',
    },
    {
      title: 'Aktif Tenantlar',
      value: stats?.activeTenants || 386,
      change: stats?.tenantsChange || 8.3,
      changeType: (stats?.tenantsChange || 8.3) > 0 ? 'increase' : 'decrease',
      icon: <TeamOutlined />,
      color: '#50cd89',
      bgColor: 'rgba(80, 205, 137, 0.1)',
      description: 'bu ay yeni',
    },
    {
      title: 'Toplam Kullanıcı',
      value: stats?.totalUsers || 4823,
      change: stats?.usersChange || 15.7,
      changeType: (stats?.usersChange || 15.7) > 0 ? 'increase' : 'decrease',
      icon: <UserOutlined />,
      color: '#ffc700',
      bgColor: 'rgba(255, 199, 0, 0.1)',
      description: 'aktif kullanıcı',
    },
    {
      title: 'Dönüşüm Oranı',
      value: stats?.conversionRate || 68.3,
      suffix: '%',
      change: stats?.conversionChange || 3.2,
      changeType: (stats?.conversionChange || -3.2) > 0 ? 'increase' : 'decrease',
      icon: <RiseOutlined />,
      color: '#f1416c',
      bgColor: 'rgba(241, 65, 108, 0.1)',
      description: 'denemelerden',
    },
  ], [stats]);

  // Revenue Chart Data - Memoized
  const revenueData = useMemo(() => [
    { month: 'Jan', revenue: 320000, profit: 120000 },
    { month: 'Feb', revenue: 385000, profit: 145000 },
    { month: 'Mar', revenue: 412000, profit: 168000 },
    { month: 'Apr', revenue: 445000, profit: 178000 },
    { month: 'May', revenue: 478000, profit: 195000 },
    { month: 'Jun', revenue: 524350, profit: 210000 },
  ], []);

  const revenueConfig = useMemo(() => ({
    data: revenueData,
    xField: 'month',
    yField: 'revenue',
    height: 300,
    smooth: true,
    color: 'l(0) 0:#667eea 1:#764ba2',
    areaStyle: {
      fillOpacity: 0.6,
    },
    xAxis: {
      grid: null,
    },
    yAxis: {
      label: {
        formatter: (v: string) => `₺${parseInt(v) / 1000}k`,
      },
      grid: {
        line: {
          style: {
            stroke: '#f0f0f0',
            lineWidth: 1,
            lineDash: [4, 4],
          },
        },
      },
    },
    tooltip: {
      customContent: (title: string, items: any[]) => {
        return `<div style="padding: 8px;">
          <div style="margin-bottom: 4px; font-weight: 600;">${title}</div>
          ${items.map(item => 
            `<div style="color: ${item.color};">Gelir: ₺${item.data.revenue.toLocaleString('tr-TR')}</div>
             <div style="color: ${item.color};">Kar: ₺${item.data.profit.toLocaleString('tr-TR')}</div>`
          ).join('')}
        </div>`;
      },
    },
  }), [revenueData]);

  // Tenant Distribution - Memoized
  const tenantData = useMemo(() => [
    { type: 'Enterprise', value: 45, percentage: 11.6 },
    { type: 'Professional', value: 125, percentage: 32.4 },
    { type: 'Starter', value: 186, percentage: 48.2 },
    { type: 'Free Trial', value: 30, percentage: 7.8 },
  ], []);

  const pieConfig = useMemo(() => ({
    data: tenantData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    innerRadius: 0.6,
    height: 300,
    label: {
      type: 'inner',
      offset: '-50%',
      content: '{value}',
      style: {
        textAlign: 'center',
        fontSize: 14,
        fill: '#fff',
      },
    },
    color: ['#667eea', '#50cd89', '#ffc700', '#f1416c'],
    interactions: [{ type: 'element-active' }],
    statistic: {
      title: false,
      content: {
        style: {
          whiteSpace: 'pre-wrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontSize: '24px',
          fontWeight: 'bold',
        },
        content: '386\nTenant',
      },
    },
    legend: {
      position: 'bottom',
      flipPage: false,
    },
  }), [tenantData]);

  // Recent Activities - Memoized
  const activities = useMemo(() => [
    {
      type: 'success',
      title: 'Yeni tenant kaydı',
      description: 'TechCorp Solutions platforma katıldı',
      time: '2 dakika önce',
      user: 'John Doe',
      avatar: null,
    },
    {
      type: 'info',
      title: 'Ödeme alındı',
      description: 'Fatura #1234 ödendi',
      time: '1 saat önce',
      user: 'Jane Smith',
      avatar: null,
    },
    {
      type: 'warning',
      title: 'Abonelik sona eriyor',
      description: 'CloudFirst Inc aboneliği 3 gün içinde sona erecek',
      time: '3 saat önce',
      user: 'Sistem',
      avatar: null,
    },
    {
      type: 'error',
      title: 'Ödeme başarısız',
      description: 'StartupHub için ödeme işlenemedi',
      time: '5 saat önce',
      user: 'Sistem',
      avatar: null,
    },
  ], []);

  const columns = useMemo(() => [
    {
      title: '#',
      dataIndex: 'rank',
      key: 'rank',
      width: 60,
      fixed: 'left' as const,
      render: (rank: number) => {
        const icons = {
          1: <TrophyOutlined style={{ color: '#ffd700', fontSize: 16 }} />,
          2: <TrophyOutlined style={{ color: '#c0c0c0', fontSize: 16 }} />,
          3: <TrophyOutlined style={{ color: '#cd7f32', fontSize: 16 }} />,
        };
        return (
          <Space size="small">
            {icons[rank as keyof typeof icons]}
            <span>#{rank}</span>
          </Space>
        );
      },
    },
    {
      title: 'Tenant',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: true,
      render: (name: string, record: any) => (
        <Space size="small">
          <Avatar size="small" style={{ backgroundColor: '#667eea' }}>
            {name ? name.substring(0, 2).toUpperCase() : 'NA'}
          </Avatar>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontWeight: 500 }}>{name || 'İsimsiz'}</div>
            <Tag 
              style={{ marginTop: 4, fontSize: 11 }}
              color={record.plan === 'Enterprise' ? 'purple' : record.plan === 'Professional' ? 'blue' : record.plan === 'Starter' ? 'green' : 'default'}
            >
              {record.plan}
            </Tag>
          </div>
        </Space>
      ),
    },
    {
      title: 'Kullanıcı',
      dataIndex: 'users',
      key: 'users',
      width: 100,
      align: 'center' as const,
      render: (users: number) => (
        <Badge count={users} showZero overflowCount={999} style={{ backgroundColor: '#667eea' }} />
      ),
    },
    {
      title: 'Gelir',
      dataIndex: 'revenue',
      key: 'revenue',
      width: 120,
      align: 'right' as const,
      render: (revenue: number) => (
        <span style={{ color: '#50cd89', fontWeight: 500 }}>
          ₺{revenue.toLocaleString('tr-TR')}
        </span>
      ),
    },
    {
      title: 'Büyüme',
      dataIndex: 'growth',
      key: 'growth',
      width: 100,
      align: 'center' as const,
      render: (growth: number) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          {growth > 0 ? (
            <ArrowUpOutlined style={{ color: '#50cd89', fontSize: 12 }} />
          ) : (
            <ArrowDownOutlined style={{ color: '#f1416c', fontSize: 12 }} />
          )}
          <span style={{ color: growth > 0 ? '#50cd89' : '#f1416c', fontWeight: 500 }}>
            {Math.abs(growth).toFixed(1)}%
          </span>
        </div>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      align: 'center' as const,
      render: (status: string) => (
        <Tag 
          style={{ margin: 0, fontSize: 11 }}
          color={status === 'active' ? 'success' : 'error'}
        >
          {status === 'active' ? 'AKTİF' : 'ASKIDA'}
        </Tag>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 50,
      fixed: 'right' as const,
      render: () => (
        <Dropdown
          menu={{
            items: [
              { key: 'view', label: 'Detaylar', icon: <FileTextOutlined /> },
              { key: 'edit', label: 'Düzenle', icon: <SettingOutlined /> },
              { type: 'divider' },
              { key: 'delete', label: 'Sil', icon: <DeleteOutlined />, danger: true },
            ],
          }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button 
            type="text" 
            size="small"
            icon={<MoreOutlined />} 
            style={{ padding: '4px 8px' }}
          />
        </Dropdown>
      ),
    },
  ], []);

  return (
    <div className="metronic-dashboard">
      {/* Page Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <Title level={3} className="page-title">Dashboard</Title>
          <Paragraph className="page-description">
            Hoş geldiniz! Platformunuzda bugün neler oluyor.
          </Paragraph>
        </div>
        <div className="header-actions">
          <Space>
            <Select
              value={timeRange}
              onChange={setTimeRange}
              style={{ width: 120 }}
            >
              <Select.Option value="today">Bugün</Select.Option>
              <Select.Option value="week">Bu Hafta</Select.Option>
              <Select.Option value="month">Bu Ay</Select.Option>
              <Select.Option value="year">Bu Yıl</Select.Option>
            </Select>
            <RangePicker />
            <Button icon={<ExportOutlined />}>Dışa Aktar</Button>
            <Button 
              type="primary" 
              icon={<SyncOutlined spin={loadingStats || loadingTenants} />} 
              onClick={handleRefresh} 
              loading={loadingStats || loadingTenants}
            >
              {(tenantsStale || statsStale) ? 'Güncelle' : 'Yenile'}
            </Button>
          </Space>
        </div>
      </div>

      {/* Stats Cards */}
      <Row gutter={[32, 32]} className="stats-row">
        {statsCardData.map((stat, index) => (
          <Col xs={24} sm={12} xl={6} key={index}>
            <Card className="stat-card" loading={loadingStats}>
              <div className="stat-card-content">
                <div className="stat-icon" style={{ backgroundColor: stat.bgColor, color: stat.color }}>
                  {stat.icon}
                </div>
                <div className="stat-details">
                  <Text className="stat-title">{stat.title}</Text>
                  <div className="stat-value">
                    {stat.prefix && <span className="currency-symbol">{stat.prefix}</span>}
                    <CountUp
                      end={stat.value}
                      duration={2}
                      separator=","
                      decimals={stat.suffix === '%' ? 1 : 0}
                    />
                    {stat.suffix && <span className="stat-suffix">{stat.suffix}</span>}
                  </div>
                  <div className="stat-change">
                    {stat.changeType === 'increase' ? (
                      <ArrowUpOutlined style={{ color: '#50cd89' }} />
                    ) : (
                      <ArrowDownOutlined style={{ color: '#f1416c' }} />
                    )}
                    <span className={`change-value ${stat.changeType}`}>
                      {stat.change}%
                    </span>
                    <span className="change-description">{stat.description}</span>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Charts Row */}
      <Row gutter={[32, 32]} className="charts-row">
        <Col xs={24} lg={16}>
          <Card
            title="Gelir Özeti"
            extra={
              <Space>
                <Button type="text" icon={<FilterOutlined />}>Filtrele</Button>
                <Button type="text" icon={<MoreOutlined />} />
              </Space>
            }
            className="chart-card"
            loading={loadingStats}
          >
            <Suspense fallback={<Skeleton active paragraph={{ rows: 8 }} />}>
              <Area {...revenueConfig} />
            </Suspense>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title="Tenant Dağılımı"
            extra={<Button type="text" icon={<MoreOutlined />} />}
            className="chart-card"
            loading={loadingStats}
          >
            <Suspense fallback={<Skeleton active paragraph={{ rows: 8 }} />}>
              <Pie {...pieConfig} />
            </Suspense>
          </Card>
        </Col>
      </Row>

      {/* Tables Row */}
      <Row gutter={[32, 32]} className="tables-row">
        <Col xs={24} lg={16}>
          <Card
            title="En İyi Performans Gösteren Tenantlar"
            extra={
              <Space>
                <Button type="text">Tümünü Gör</Button>
                <Button type="text" icon={<MoreOutlined />} />
              </Space>
            }
            className="table-card"
          >
            <Table
              columns={columns}
              dataSource={filteredTenants}
              pagination={{
                pageSize: 10,
                showSizeChanger: false,
                showTotal: (total) => `Toplam ${total} tenant`,
              }}
              loading={loadingTenants}
              scroll={{ x: 800 }}
              size="small"
              rowClassName="table-row-hover"
            />
          </Card>
        </Col>
        <Col xs={24} xl={8} lg={24}>
          <Card
            title="Son Aktiviteler"
            extra={<Button type="text">Tümünü Gör</Button>}
            className="activity-card"
            loading={loadingStats}
          >
            <Timeline>
              {activities.map((activity, index) => (
                <Timeline.Item
                  key={index}
                  color={
                    activity.type === 'success' ? 'green' :
                    activity.type === 'info' ? 'blue' :
                    activity.type === 'warning' ? 'orange' : 'red'
                  }
                >
                  <div className="activity-item">
                    <Text strong>{activity.title}</Text>
                    <br />
                    <Text type="secondary">{activity.description}</Text>
                    <br />
                    <Space className="activity-meta">
                      <ClockCircleOutlined />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {activity.time}
                      </Text>
                      {activity.user && (
                        <>
                          <span>•</span>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {activity.user} tarafından
                          </Text>
                        </>
                      )}
                    </Space>
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Col>
      </Row>

      {/* Quick Stats */}
      <Row gutter={[24, 24]} className="quick-stats-row">
        <Col xs={24}>
          <Card title="Platform Performansı" className="performance-card">
            <Row gutter={[24, 24]}>
              <Col xs={24} sm={12} md={6}>
                <div className="performance-metric">
                  <div className="metric-header">
                    <Text type="secondary">Sunucu Çalışma Süresi</Text>
                    <CheckCircleOutlined style={{ color: '#50cd89' }} />
                  </div>
                  <Progress percent={99.9} strokeColor="#50cd89" />
                  <Text strong>%99.9 Çalışma</Text>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div className="performance-metric">
                  <div className="metric-header">
                    <Text type="secondary">Yanıt Süresi</Text>
                    <ThunderboltOutlined style={{ color: '#ffc700' }} />
                  </div>
                  <Progress percent={85} strokeColor="#ffc700" />
                  <Text strong>245ms Ortalama</Text>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div className="performance-metric">
                  <div className="metric-header">
                    <Text type="secondary">API Çağrıları</Text>
                    <ApiOutlined style={{ color: '#667eea' }} />
                  </div>
                  <Progress percent={68} strokeColor="#667eea" />
                  <Text strong>Bugün 1.2M</Text>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div className="performance-metric">
                  <div className="metric-header">
                    <Text type="secondary">Hata Oranı</Text>
                    <WarningOutlined style={{ color: '#f1416c' }} />
                  </div>
                  <Progress percent={2} strokeColor="#f1416c" />
                  <Text strong>%0.02 Hata</Text>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default MetronicDashboard;