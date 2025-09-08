import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Space, 
  Select, 
  DatePicker, 
  Table,
  Tag,
  Progress,
  Avatar,
  Typography,
  Tooltip,
  Button,
  Tabs,
  Badge,
  Segmented,
  Timeline,
  Alert,
  Divider,
} from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import { Column, Line, Area, Pie, DualAxes, Gauge, Liquid } from '@ant-design/charts';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  TeamOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  UserOutlined,
  RiseOutlined,
  FallOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  GlobalOutlined,
  AppstoreOutlined,
  CreditCardOutlined,
  FileTextOutlined,
  TrophyOutlined,
  CloudServerOutlined,
  DatabaseOutlined,
  ApiOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
  FireOutlined,
  BugOutlined,
  WarningOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'day'),
    dayjs()
  ]);
  const [viewMode, setViewMode] = useState<string>('overview');

  // Mock data - gerçek uygulamada API'den gelecek
  const stats = {
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
  };

  // Revenue Chart Data
  const revenueData = Array.from({ length: 30 }, (_, i) => ({
    date: dayjs().subtract(30 - i, 'day').format('YYYY-MM-DD'),
    revenue: Math.floor(Math.random() * 5000) + 2000,
    subscriptions: Math.floor(Math.random() * 50) + 20,
  }));

  // Tenant Growth Data
  const tenantGrowthData = Array.from({ length: 12 }, (_, i) => ({
    month: dayjs().subtract(12 - i, 'month').format('MMM'),
    tenants: Math.floor(Math.random() * 100) + 50,
    users: Math.floor(Math.random() * 500) + 200,
  }));

  // Package Distribution
  const packageDistribution = [
    { type: 'Starter', value: 345, percentage: 29 },
    { type: 'Professional', value: 512, percentage: 43 },
    { type: 'Enterprise', value: 289, percentage: 24 },
    { type: 'Custom', value: 43, percentage: 4 },
  ];

  // Recent Activities
  const recentActivities = [
    {
      id: 1,
      tenant: 'ABC Corporation',
      action: 'Yeni abonelik',
      package: 'Enterprise',
      time: '5 dakika önce',
      status: 'success',
    },
    {
      id: 2,
      tenant: 'XYZ Ltd.',
      action: 'Paket yükseltme',
      package: 'Professional',
      time: '15 dakika önce',
      status: 'success',
    },
    {
      id: 3,
      tenant: 'Tech Startup Inc.',
      action: 'Ödeme hatası',
      package: 'Starter',
      time: '1 saat önce',
      status: 'error',
    },
    {
      id: 4,
      tenant: 'Global Services',
      action: 'Abonelik yenileme',
      package: 'Enterprise',
      time: '2 saat önce',
      status: 'success',
    },
    {
      id: 5,
      tenant: 'Digital Agency',
      action: 'Yeni kullanıcı',
      package: 'Professional',
      time: '3 saat önce',
      status: 'info',
    },
  ];

  // Top Tenants
  const topTenants = [
    { name: 'Global Corporation', users: 450, revenue: 12500, growth: 15.2 },
    { name: 'Tech Innovations', users: 380, revenue: 9800, growth: 8.7 },
    { name: 'Digital Services', users: 320, revenue: 8500, growth: -2.3 },
    { name: 'Enterprise Solutions', users: 290, revenue: 7600, growth: 5.1 },
    { name: 'Cloud Systems', users: 260, revenue: 6900, growth: 18.9 },
  ];

  // System Health
  const systemHealth = {
    api: { status: 'operational', responseTime: 145, uptime: 99.99 },
    database: { status: 'operational', responseTime: 23, uptime: 99.97 },
    storage: { status: 'degraded', usage: 78, available: '2.2 TB' },
    cdn: { status: 'operational', hitRate: 94.5, bandwidth: '12.4 TB' },
  };

  // Revenue Area Chart Config
  const revenueChartConfig = {
    data: revenueData,
    xField: 'date',
    yField: 'revenue',
    smooth: true,
    areaStyle: {
      fill: 'l(270) 0:#ffffff 0.5:#667eea 1:#764ba2',
    },
    line: {
      color: '#667eea',
    },
    point: {
      size: 3,
      shape: 'circle',
    },
    tooltip: {
      formatter: (datum: any) => ({
        name: 'Gelir',
        value: `₺${datum.revenue.toLocaleString('tr-TR')}`,
      }),
    },
  };

  // Tenant Growth Dual Axes Config
  const tenantGrowthConfig = {
    data: [tenantGrowthData, tenantGrowthData],
    xField: 'month',
    yField: ['tenants', 'users'],
    geometryOptions: [
      {
        geometry: 'column',
        color: '#667eea',
      },
      {
        geometry: 'line',
        color: '#764ba2',
        lineStyle: {
          lineWidth: 2,
        },
      },
    ],
    legend: {
      custom: true,
      items: [
        { name: 'Tenants', value: 'tenants', marker: { symbol: 'square', style: { fill: '#667eea' } } },
        { name: 'Users', value: 'users', marker: { symbol: 'line', style: { stroke: '#764ba2' } } },
      ],
    },
  };

  // Package Distribution Pie Config
  const packagePieConfig = {
    data: packageDistribution,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    interactions: [{ type: 'pie-legend-active' }, { type: 'element-active' }],
    color: ['#667eea', '#764ba2', '#f093fb', '#4facfe'],
  };

  const columns = [
    {
      title: 'Tenant',
      dataIndex: 'tenant',
      key: 'tenant',
      render: (text: string) => (
        <Space>
          <Avatar style={{ backgroundColor: '#667eea' }}>
            {text[0]}
          </Avatar>
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'İşlem',
      dataIndex: 'action',
      key: 'action',
    },
    {
      title: 'Paket',
      dataIndex: 'package',
      key: 'package',
      render: (text: string) => (
        <Tag color={
          text === 'Enterprise' ? 'purple' : 
          text === 'Professional' ? 'blue' : 
          text === 'Starter' ? 'green' : 'default'
        }>
          {text}
        </Tag>
      ),
    },
    {
      title: 'Zaman',
      dataIndex: 'time',
      key: 'time',
      render: (text: string) => (
        <Space>
          <ClockCircleOutlined />
          <Text type="secondary">{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const icon = 
          status === 'success' ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> :
          status === 'error' ? <CloseCircleOutlined style={{ color: '#ff4d4f' }} /> :
          status === 'warning' ? <ExclamationCircleOutlined style={{ color: '#faad14' }} /> :
          <InfoCircleOutlined style={{ color: '#1890ff' }} />;
        return icon;
      },
    },
  ];

  return (
    <PageContainer
      header={{
        title: 'Dashboard',
        breadcrumb: {
          items: [
            { title: 'Ana Sayfa' },
            { title: 'Dashboard' },
          ],
        },
        extra: [
          <Space key="actions">
            <RangePicker
              value={dateRange}
              onChange={(dates) => dates && setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
              format="DD MMM YYYY"
            />
            <Button type="primary" icon={<SyncOutlined />} onClick={() => setLoading(true)}>
              Yenile
            </Button>
          </Space>,
        ],
      }}
    >
      {/* Key Metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Toplam Tenant"
              value={stats.totalTenants}
              prefix={<TeamOutlined style={{ color: '#667eea' }} />}
              suffix={
                <Text type="success" style={{ fontSize: 14 }}>
                  <ArrowUpOutlined /> {stats.growthRate}%
                </Text>
              }
            />
            <Progress
              percent={95}
              strokeColor={{ from: '#667eea', to: '#764ba2' }}
              showInfo={false}
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Aktif Kullanıcılar"
              value={stats.activeUsers}
              prefix={<UserOutlined style={{ color: '#764ba2' }} />}
              suffix={
                <Text type="secondary" style={{ fontSize: 14 }}>
                  / {stats.totalUsers}
                </Text>
              }
            />
            <Progress
              percent={Math.round((stats.activeUsers / stats.totalUsers) * 100)}
              strokeColor="#764ba2"
              showInfo={false}
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Aylık Gelir"
              value={stats.monthlyRevenue}
              prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
              suffix="₺"
              precision={2}
            />
            <Progress
              percent={75}
              strokeColor="#52c41a"
              showInfo={false}
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Sistem Uptime"
              value={stats.uptime}
              suffix="%"
              prefix={<ThunderboltOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
            <Progress
              percent={stats.uptime}
              strokeColor="#52c41a"
              showInfo={false}
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Performance Indicators */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Space direction="vertical" style={{ width: '100%' }} align="center">
              <Text type="secondary">Büyüme Oranı</Text>
              <Progress
                type="circle"
                percent={stats.growthRate}
                strokeColor="#667eea"
                format={() => (
                  <Space direction="vertical" align="center">
                    <Text strong style={{ fontSize: 24 }}>{stats.growthRate}%</Text>
                    <Text type="secondary">Aylık</Text>
                  </Space>
                )}
                width={120}
              />
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text type="secondary">Churn Rate</Text>
              <Gauge
                percent={stats.churnRate / 10}
                range={{
                  color: ['#52c41a', '#faad14', '#ff4d4f'],
                  width: 12,
                }}
                indicator={false}
                statistic={{
                  title: false,
                  content: {
                    formatter: () => `${stats.churnRate}%`,
                    style: { fontSize: 24 },
                  },
                }}
              />
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text type="secondary">API Response</Text>
              <Liquid
                percent={stats.avgResponseTime / 1000}
                statistic={{
                  title: false,
                  content: {
                    formatter: () => `${stats.avgResponseTime}ms`,
                    style: { fontSize: 24 },
                  },
                }}
                color={() => stats.avgResponseTime < 300 ? '#52c41a' : '#faad14'}
              />
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text type="secondary">Aktif Abonelik</Text>
              <Progress
                type="dashboard"
                percent={Math.round((stats.activeSubscriptions / stats.totalSubscriptions) * 100)}
                gapDegree={30}
                strokeColor={{ '0%': '#667eea', '100%': '#764ba2' }}
                format={(percent) => (
                  <Space direction="vertical" align="center">
                    <Text strong style={{ fontSize: 24 }}>{percent}%</Text>
                    <Text type="secondary">{stats.activeSubscriptions}/{stats.totalSubscriptions}</Text>
                  </Space>
                )}
              />
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Charts Section */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card
            title="Gelir Analizi"
            extra={
              <Segmented
                options={['Günlük', 'Haftalık', 'Aylık', 'Yıllık']}
                defaultValue="Aylık"
              />
            }
          >
            <Area {...revenueChartConfig} height={300} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Paket Dağılımı">
            <Pie {...packagePieConfig} height={300} />
          </Card>
        </Col>
      </Row>

      {/* Tenant Growth and Top Tenants */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Tenant & Kullanıcı Büyümesi">
            <DualAxes {...tenantGrowthConfig} height={300} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title="En İyi Tenantlar"
            extra={<Button type="link">Tümünü Gör</Button>}
          >
            <Table
              dataSource={topTenants}
              pagination={false}
              size="small"
              columns={[
                {
                  title: 'Tenant',
                  dataIndex: 'name',
                  key: 'name',
                  render: (text: string) => (
                    <Space>
                      <Avatar size="small" style={{ backgroundColor: '#667eea' }}>
                        {text[0]}
                      </Avatar>
                      <Text>{text}</Text>
                    </Space>
                  ),
                },
                {
                  title: 'Kullanıcı',
                  dataIndex: 'users',
                  key: 'users',
                  align: 'center',
                },
                {
                  title: 'Gelir',
                  dataIndex: 'revenue',
                  key: 'revenue',
                  align: 'right',
                  render: (value: number) => `₺${value.toLocaleString('tr-TR')}`,
                },
                {
                  title: 'Büyüme',
                  dataIndex: 'growth',
                  key: 'growth',
                  align: 'center',
                  render: (value: number) => (
                    <Tag color={value > 0 ? 'green' : 'red'}>
                      {value > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                      {Math.abs(value)}%
                    </Tag>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* System Health and Recent Activities */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card title="Sistem Sağlığı" extra={<Badge status="processing" text="Live" />}>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {Object.entries(systemHealth).map(([key, value]) => (
                <div key={key}>
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Space>
                      {key === 'api' && <ApiOutlined />}
                      {key === 'database' && <DatabaseOutlined />}
                      {key === 'storage' && <CloudServerOutlined />}
                      {key === 'cdn' && <GlobalOutlined />}
                      <Text strong>{key.toUpperCase()}</Text>
                    </Space>
                    <Badge
                      status={
                        value.status === 'operational' ? 'success' :
                        value.status === 'degraded' ? 'warning' : 'error'
                      }
                      text={value.status}
                    />
                  </Space>
                  {key === 'storage' && (
                    <Progress
                      percent={value.usage}
                      size="small"
                      status={value.usage > 80 ? 'exception' : 'active'}
                      format={(percent) => `${percent}% Used`}
                    />
                  )}
                  {(key === 'api' || key === 'database') && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Response: {value.responseTime}ms | Uptime: {value.uptime}%
                    </Text>
                  )}
                  {key === 'cdn' && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Hit Rate: {value.hitRate}% | Bandwidth: {value.bandwidth}
                    </Text>
                  )}
                  {key !== 'cdn' && <Divider style={{ margin: '12px 0' }} />}
                </div>
              ))}
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card
            title="Son Aktiviteler"
            extra={
              <Space>
                <Badge count={3} />
                <Button type="link">Tümünü Gör</Button>
              </Space>
            }
          >
            <Table
              dataSource={recentActivities}
              columns={columns}
              pagination={false}
              rowKey="id"
            />
          </Card>
        </Col>
      </Row>

      {/* Alerts Section */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Alert
            message="Sistem Bakımı"
            description="Planlı sistem bakımı 15 Aralık 2024 saat 03:00-05:00 arasında gerçekleştirilecektir."
            type="info"
            showIcon
            closable
            action={
              <Button size="small" type="primary">
                Detaylar
              </Button>
            }
          />
        </Col>
      </Row>
    </PageContainer>
  );
};

export default Dashboard;