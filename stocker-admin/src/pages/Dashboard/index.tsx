import React, { useEffect, useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Space, 
  Select, 
  Table,
  Tag,
  Progress,
  Typography,
  Tooltip,
  Button,
  Badge,
  Timeline,
  Alert,
  Spin,
  Empty,
} from 'antd';
import { Line, Column, Pie } from '@ant-design/charts';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  TeamOutlined,
  DollarOutlined,
  UserOutlined,
  RiseOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
  GlobalOutlined,
  CreditCardOutlined,
  TrophyOutlined,
  CloudServerOutlined,
  DatabaseOutlined,
  ApiOutlined,
  ThunderboltOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useDashboardStore } from '../../stores/dashboardStore';
import type { ColumnsType } from 'antd/es/table';
import { RecentTenant, RecentUser, Activity } from '../../services/api/dashboardService';

dayjs.extend(relativeTime);

const { Title, Text, Paragraph } = Typography;

const Dashboard: React.FC = () => {
  const {
    stats,
    revenueOverview,
    tenantStats,
    systemHealth,
    recentTenants,
    recentUsers,
    activities,
    revenueChartData,
    tenantGrowthChartData,
    packageDistributionData,
    loading,
    refreshing,
    selectedPeriod,
    fetchDashboardData,
    setSelectedPeriod,
    refreshData,
  } = useDashboardStore();

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      refreshData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Statistics Cards
  const statisticsCards = [
    {
      title: 'Toplam Tenant',
      value: stats?.totalTenants || 0,
      prefix: <GlobalOutlined />,
      suffix: stats?.activeTenants ? `(${stats.activeTenants} aktif)` : '',
      color: '#1890ff',
      change: stats?.growthRate || 0,
    },
    {
      title: 'Toplam Kullanıcı',
      value: stats?.totalUsers || 0,
      prefix: <UserOutlined />,
      suffix: stats?.activeUsers ? `(${stats.activeUsers} aktif)` : '',
      color: '#52c41a',
      change: 8.5,
    },
    {
      title: 'Aylık Gelir',
      value: stats?.monthlyRevenue || 0,
      prefix: <DollarOutlined />,
      suffix: '₺',
      color: '#722ed1',
      change: stats?.growthRate || 0,
      precision: 2,
    },
    {
      title: 'Toplam Gelir',
      value: stats?.totalRevenue || 0,
      prefix: <CreditCardOutlined />,
      suffix: '₺',
      color: '#fa8c16',
      change: 15.3,
      precision: 2,
    },
  ];

  // System Health Status
  const getHealthIcon = (status?: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'degraded':
        return <ExclamationCircleOutlined style={{ color: '#faad14' }} />;
      case 'down':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return <ExclamationCircleOutlined style={{ color: '#8c8c8c' }} />;
    }
  };

  const getHealthColor = (status?: string) => {
    switch (status) {
      case 'healthy':
        return '#52c41a';
      case 'degraded':
        return '#faad14';
      case 'down':
        return '#ff4d4f';
      default:
        return '#8c8c8c';
    }
  };

  // Recent Tenants Columns
  const tenantColumns: ColumnsType<RecentTenant> = [
    {
      title: 'Tenant',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: RecentTenant) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.code}</Text>
        </Space>
      ),
    },
    {
      title: 'Paket',
      dataIndex: 'packageName',
      key: 'packageName',
      render: (text: string) => <Tag>{text}</Tag>,
    },
    {
      title: 'Kullanıcı',
      dataIndex: 'userCount',
      key: 'userCount',
      render: (count: number) => (
        <Space>
          <UserOutlined />
          {count}
        </Space>
      ),
    },
    {
      title: 'Oluşturulma',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).fromNow(),
    },
  ];

  // Recent Users Columns
  const userColumns: ColumnsType<RecentUser> = [
    {
      title: 'Kullanıcı',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text: string, record: RecentUser) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.email}</Text>
        </Space>
      ),
    },
    {
      title: 'Tenant',
      dataIndex: 'tenantName',
      key: 'tenantName',
    },
    {
      title: 'Rol',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => <Tag>{role}</Tag>,
    },
    {
      title: 'Son Giriş',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      render: (date: string) => date ? dayjs(date).fromNow() : 'Henüz giriş yapmadı',
    },
  ];

  // Activity Timeline
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'tenant_created':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'user_added':
        return <UserOutlined style={{ color: '#1890ff' }} />;
      case 'payment_received':
        return <DollarOutlined style={{ color: '#722ed1' }} />;
      case 'subscription_renewed':
        return <SyncOutlined style={{ color: '#13c2c2' }} />;
      case 'tenant_suspended':
        return <ExclamationCircleOutlined style={{ color: '#fa8c16' }} />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  // Chart configurations
  const revenueChartConfig = {
    data: revenueChartData?.datasets[0]?.data.map((value, index) => ({
      date: revenueChartData?.labels[index] || '',
      value: value,
    })) || [],
    xField: 'date',
    yField: 'value',
    smooth: true,
    color: '#667eea',
    point: {
      size: 3,
      shape: 'circle',
    },
    tooltip: {
      formatter: (datum: any) => {
        return {
          name: 'Gelir',
          value: `₺${datum.value.toLocaleString('tr-TR')}`,
        };
      },
    },
  };

  const tenantGrowthChartConfig = {
    data: tenantGrowthChartData?.datasets[0]?.data.map((value, index) => ({
      date: tenantGrowthChartData?.labels[index] || '',
      value: value,
    })) || [],
    xField: 'date',
    yField: 'value',
    color: '#10b981',
    label: {
      position: 'middle' as const,
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
    },
    tooltip: {
      formatter: (datum: any) => {
        return {
          name: 'Yeni Tenant',
          value: datum.value,
        };
      },
    },
  };

  const packageDistributionConfig = {
    data: packageDistributionData?.datasets[0]?.data.map((value, index) => ({
      type: packageDistributionData?.labels[index] || '',
      value: value,
    })) || [],
    angleField: 'value',
    colorField: 'type',
    radius: 0.9,
    label: {
      type: 'outer',
      content: '{name} ({percentage})',
    },
    interactions: [
      {
        type: 'element-active',
      },
    ],
  };

  if (loading && !stats) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" tip="Dashboard yükleniyor..." />
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2}>Dashboard</Title>
          </Col>
          <Col>
            <Space>
              <Select
                value={selectedPeriod}
                onChange={setSelectedPeriod}
                style={{ width: 120 }}
              >
                <Select.Option value="daily">Günlük</Select.Option>
                <Select.Option value="monthly">Aylık</Select.Option>
                <Select.Option value="yearly">Yıllık</Select.Option>
              </Select>
              <Button 
                icon={<SyncOutlined spin={refreshing} />}
                onClick={refreshData}
                loading={refreshing}
              >
                Yenile
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statisticsCards.map((card, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card>
              <Statistic
                title={card.title}
                value={card.value}
                precision={card.precision || 0}
                valueStyle={{ color: card.color }}
                prefix={card.prefix}
                suffix={card.suffix}
              />
              {card.change !== 0 && (
                <div style={{ marginTop: 8 }}>
                  <Text type={card.change > 0 ? 'success' : 'danger'}>
                    {card.change > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                    {Math.abs(card.change)}%
                  </Text>
                  <Text type="secondary" style={{ marginLeft: 8 }}>
                    Geçen aya göre
                  </Text>
                </div>
              )}
            </Card>
          </Col>
        ))}
      </Row>

      {/* System Health */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card title="Sistem Durumu">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Space>
                  {getHealthIcon(systemHealth?.apiStatus)}
                  <Text>API: </Text>
                  <Text strong style={{ color: getHealthColor(systemHealth?.apiStatus) }}>
                    {systemHealth?.apiStatus?.toUpperCase() || 'UNKNOWN'}
                  </Text>
                </Space>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Space>
                  {getHealthIcon(systemHealth?.databaseStatus)}
                  <Text>Database: </Text>
                  <Text strong style={{ color: getHealthColor(systemHealth?.databaseStatus) }}>
                    {systemHealth?.databaseStatus?.toUpperCase() || 'UNKNOWN'}
                  </Text>
                </Space>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Space>
                  {getHealthIcon(systemHealth?.cacheStatus)}
                  <Text>Cache: </Text>
                  <Text strong style={{ color: getHealthColor(systemHealth?.cacheStatus) }}>
                    {systemHealth?.cacheStatus?.toUpperCase() || 'UNKNOWN'}
                  </Text>
                </Space>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Space>
                  <ClockCircleOutlined />
                  <Text>Uptime: </Text>
                  <Text strong>{systemHealth?.uptime || 'N/A'}</Text>
                </Space>
              </Col>
            </Row>
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col span={8}>
                <Text type="secondary">CPU Kullanımı</Text>
                <Progress percent={systemHealth?.cpuUsage || 0} status="active" />
              </Col>
              <Col span={8}>
                <Text type="secondary">Bellek Kullanımı</Text>
                <Progress percent={systemHealth?.memoryUsage || 0} status="active" />
              </Col>
              <Col span={8}>
                <Text type="secondary">Disk Kullanımı</Text>
                <Progress percent={systemHealth?.diskUsage || 0} status="active" />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Gelir Trendi">
            {revenueChartData ? (
              <Line {...revenueChartConfig} height={300} />
            ) : (
              <Empty description="Veri yükleniyor..." />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Tenant Büyümesi">
            {tenantGrowthChartData ? (
              <Column {...tenantGrowthChartConfig} height={300} />
            ) : (
              <Empty description="Veri yükleniyor..." />
            )}
          </Card>
        </Col>
      </Row>

      {/* Package Distribution */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={8}>
          <Card title="Paket Dağılımı">
            {packageDistributionData ? (
              <Pie {...packageDistributionConfig} height={250} />
            ) : (
              <Empty description="Veri yükleniyor..." />
            )}
          </Card>
        </Col>
        <Col xs={24} md={16}>
          <Card title="Son Aktiviteler">
            <Timeline>
              {activities.map((activity) => (
                <Timeline.Item
                  key={activity.id}
                  dot={getActivityIcon(activity.type)}
                  color={activity.color}
                >
                  <Space direction="vertical" size={0}>
                    <Text strong>{activity.title}</Text>
                    <Text type="secondary">{activity.description}</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {dayjs(activity.timestamp).fromNow()}
                    </Text>
                  </Space>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Col>
      </Row>

      {/* Recent Data Tables */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Son Eklenen Tenantlar">
            <Table
              columns={tenantColumns}
              dataSource={recentTenants}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Son Eklenen Kullanıcılar">
            <Table
              columns={userColumns}
              dataSource={recentUsers}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;