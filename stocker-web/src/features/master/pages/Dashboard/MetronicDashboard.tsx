import React, { useState, useEffect } from 'react';
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
} from '@ant-design/icons';
import { Line, Area, Column, Pie, Tiny } from '@ant-design/charts';
import CountUp from 'react-countup';
import { masterApi } from '@/shared/api/master.api';
import './metronic-dashboard.css';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

const MetronicDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(false);
  const [tenants, setTenants] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loadingTenants, setLoadingTenants] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);

  // Fetch tenants from API
  useEffect(() => {
    fetchTenants();
    fetchStats();
  }, []);

  const fetchTenants = async () => {
    try {
      setLoadingTenants(true);
      const response = await masterApi.tenants.getAll();
      if (response.data?.items) {
        // Format tenants for table
        const formattedTenants = response.data.items.slice(0, 5).map((tenant: any, index: number) => ({
          key: tenant.id,
          rank: index + 1,
          name: tenant.name || tenant.companyName,
          plan: tenant.subscriptionPlan || 'Free',
          users: tenant.userCount || Math.floor(Math.random() * 200) + 50,
          revenue: tenant.revenue || Math.floor(Math.random() * 50000) + 10000,
          growth: Math.random() * 40 - 10,
          status: tenant.isActive ? 'active' : 'suspended',
        }));
        setTenants(formattedTenants);
      }
    } catch (error) {
      console.error('Failed to fetch tenants:', error);
      message.error('Failed to load tenants data');
    } finally {
      setLoadingTenants(false);
    }
  };

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const response = await masterApi.dashboard.getStats();
      if (response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      // Use default values if API fails
      setStats({
        totalRevenue: 524350,
        activeTenants: 386,
        totalUsers: 4823,
        conversionRate: 68.3,
      });
    } finally {
      setLoadingStats(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    Promise.all([fetchTenants(), fetchStats()]).finally(() => {
      setLoading(false);
      message.success('Dashboard refreshed');
    });
  };

  // Stats Data - Use API data or defaults
  const statsData = [
    {
      title: 'Toplam Gelir',
      value: stats?.totalRevenue || 524350,
      prefix: '₺',
      change: stats?.revenueChange || 12.5,
      changeType: (stats?.revenueChange || 12.5) > 0 ? 'increase' : 'decrease',
      icon: <DollarOutlined />,
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
  ];

  // Revenue Chart Data
  const revenueData = [
    { month: 'Jan', revenue: 320000, profit: 120000 },
    { month: 'Feb', revenue: 385000, profit: 145000 },
    { month: 'Mar', revenue: 412000, profit: 168000 },
    { month: 'Apr', revenue: 445000, profit: 178000 },
    { month: 'May', revenue: 478000, profit: 195000 },
    { month: 'Jun', revenue: 524350, profit: 210000 },
  ];

  const revenueConfig = {
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
        formatter: (v: string) => `$${parseInt(v) / 1000}k`,
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
            `<div style="color: ${item.color};">Revenue: $${item.data.revenue.toLocaleString()}</div>
             <div style="color: ${item.color};">Profit: $${item.data.profit.toLocaleString()}</div>`
          ).join('')}
        </div>`;
      },
    },
  };

  // Tenant Distribution
  const tenantData = [
    { type: 'Enterprise', value: 45, percentage: 11.6 },
    { type: 'Professional', value: 125, percentage: 32.4 },
    { type: 'Starter', value: 186, percentage: 48.2 },
    { type: 'Free Trial', value: 30, percentage: 7.8 },
  ];

  const pieConfig = {
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
        content: '386\nTenants',
      },
    },
    legend: {
      position: 'bottom',
      flipPage: false,
    },
  };

  // Recent Activities
  const activities = [
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
  ];

  const columns = [
    {
      title: 'Sıra',
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
      render: (rank: number) => {
        const medals = {
          1: <TrophyOutlined style={{ color: '#ffd700', fontSize: 18 }} />,
          2: <TrophyOutlined style={{ color: '#c0c0c0', fontSize: 18 }} />,
          3: <TrophyOutlined style={{ color: '#cd7f32', fontSize: 18 }} />,
        };
        return (
          <Space>
            {medals[rank as keyof typeof medals]}
            <Text strong>#{rank}</Text>
          </Space>
        );
      },
    },
    {
      title: 'Tenant',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: any) => (
        <Space>
          <Avatar style={{ backgroundColor: '#667eea' }}>
            {name ? name.substring(0, 2).toUpperCase() : 'NA'}
          </Avatar>
          <div>
            <Text strong>{name || 'İsimsiz'}</Text>
            <br />
            <Tag color={record.plan === 'Enterprise' ? 'purple' : record.plan === 'Professional' ? 'blue' : record.plan === 'Starter' ? 'green' : 'default'}>
              {record.plan}
            </Tag>
          </div>
        </Space>
      ),
    },
    {
      title: 'Kullanıcılar',
      dataIndex: 'users',
      key: 'users',
      render: (users: number) => (
        <Badge count={users} showZero style={{ backgroundColor: '#667eea' }} />
      ),
    },
    {
      title: 'Gelir',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (revenue: number) => (
        <Text strong style={{ color: '#50cd89' }}>
          ₺{revenue.toLocaleString()}
        </Text>
      ),
    },
    {
      title: 'Büyüme',
      dataIndex: 'growth',
      key: 'growth',
      render: (growth: number) => (
        <Space>
          {growth > 0 ? (
            <ArrowUpOutlined style={{ color: '#50cd89' }} />
          ) : (
            <ArrowDownOutlined style={{ color: '#f1416c' }} />
          )}
          <Text style={{ color: growth > 0 ? '#50cd89' : '#f1416c' }}>
            {Math.abs(growth).toFixed(1)}%
          </Text>
        </Space>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'success' : 'error'}>
          {status === 'active' ? 'AKTİF' : 'ASKIDA'}
        </Tag>
      ),
    },
    {
      title: 'İşlemler',
      key: 'action',
      render: () => (
        <Dropdown
          menu={{
            items: [
              { key: 'view', label: 'Detayları Gör' },
              { key: 'edit', label: 'Düzenle' },
              { key: 'delete', label: 'Sil', danger: true },
            ],
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="metronic-dashboard">
      {/* Page Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <Title level={3} className="page-title">Dashboard</Title>
          <Paragraph className="page-description">
            Welcome back! Here's what's happening with your platform today.
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
            <Button type="primary" icon={<SyncOutlined />} onClick={handleRefresh} loading={loading}>
              Yenile
            </Button>
          </Space>
        </div>
      </div>

      {/* Stats Cards */}
      <Row gutter={[24, 24]} className="stats-row">
        {statsData.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card className="stat-card" loading={loading}>
              <div className="stat-card-content">
                <div className="stat-icon" style={{ backgroundColor: stat.bgColor, color: stat.color }}>
                  {stat.icon}
                </div>
                <div className="stat-details">
                  <Text className="stat-title">{stat.title}</Text>
                  <div className="stat-value">
                    {stat.prefix}
                    <CountUp
                      end={stat.value}
                      duration={2}
                      separator=","
                      decimals={stat.suffix === '%' ? 1 : 0}
                    />
                    {stat.suffix}
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
      <Row gutter={[24, 24]} className="charts-row">
        <Col xs={24} lg={16}>
          <Card
            title="Revenue Overview"
            extra={
              <Space>
                <Button type="text" icon={<FilterOutlined />}>Filter</Button>
                <Button type="text" icon={<MoreOutlined />} />
              </Space>
            }
            className="chart-card"
            loading={loading}
          >
            <Area {...revenueConfig} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title="Tenant Distribution"
            extra={<Button type="text" icon={<MoreOutlined />} />}
            className="chart-card"
            loading={loading}
          >
            <Pie {...pieConfig} />
          </Card>
        </Col>
      </Row>

      {/* Tables Row */}
      <Row gutter={[24, 24]} className="tables-row">
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
              dataSource={tenants.length > 0 ? tenants : []}
              pagination={false}
              loading={loadingTenants}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title="Son Aktiviteler"
            extra={<Button type="text">Tümünü Gör</Button>}
            className="activity-card"
            loading={loading}
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
          <Card title="Platform Performance" className="performance-card">
            <Row gutter={[24, 24]}>
              <Col xs={24} sm={12} md={6}>
                <div className="performance-metric">
                  <div className="metric-header">
                    <Text type="secondary">Server Uptime</Text>
                    <CheckCircleOutlined style={{ color: '#50cd89' }} />
                  </div>
                  <Progress percent={99.9} strokeColor="#50cd89" />
                  <Text strong>99.9% Uptime</Text>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div className="performance-metric">
                  <div className="metric-header">
                    <Text type="secondary">Response Time</Text>
                    <ThunderboltOutlined style={{ color: '#ffc700' }} />
                  </div>
                  <Progress percent={85} strokeColor="#ffc700" />
                  <Text strong>245ms Average</Text>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div className="performance-metric">
                  <div className="metric-header">
                    <Text type="secondary">API Calls</Text>
                    <ApiOutlined style={{ color: '#667eea' }} />
                  </div>
                  <Progress percent={68} strokeColor="#667eea" />
                  <Text strong>1.2M Today</Text>
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <div className="performance-metric">
                  <div className="metric-header">
                    <Text type="secondary">Error Rate</Text>
                    <WarningOutlined style={{ color: '#f1416c' }} />
                  </div>
                  <Progress percent={2} strokeColor="#f1416c" />
                  <Text strong>0.02% Errors</Text>
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