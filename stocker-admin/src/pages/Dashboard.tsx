import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Progress, Space, Button, List, Avatar, Typography, Spin } from 'antd';
import {
  TeamOutlined,
  ShopOutlined,
  DollarOutlined,
  RiseOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
  DatabaseOutlined,
  CloudServerOutlined,
  ApiOutlined,
  UserAddOutlined,
  ShoppingCartOutlined
} from '@ant-design/icons';
import { Line, Column, Pie } from '@ant-design/charts';
import { useAuthStore } from '../stores/authStore';
import { dashboardService } from '../services/api/dashboardService';

const { Title, Text, Paragraph } = Typography;

interface TenantInfo {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'suspended';
  package: string;
  userCount: number;
  createdAt: string;
}

interface SystemHealth {
  service: string;
  status: 'healthy' | 'degraded' | 'down';
  uptime: string;
  responseTime: number;
}

const Dashboard: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTenants: 0,
    activeTenants: 0,
    totalUsers: 0,
    monthlyRevenue: 0,
    growthRate: 0,
    newTenantsThisMonth: 0,
    activeSubscriptions: 0,
    pendingPayments: 0
  });
  
  const [recentTenants, setRecentTenants] = useState<TenantInfo[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [tenantGrowthData, setTenantGrowthData] = useState<any[]>([]);
  const [packageDistribution, setPackageDistribution] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Simulated data - replace with actual API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Set mock data for demonstration
      setStats({
        totalTenants: 156,
        activeTenants: 142,
        totalUsers: 3847,
        monthlyRevenue: 48750,
        growthRate: 12.5,
        newTenantsThisMonth: 18,
        activeSubscriptions: 142,
        pendingPayments: 7
      });

      setRecentTenants([
        { id: '1', name: 'ABC Teknoloji', status: 'active', package: 'Premium', userCount: 45, createdAt: '2024-01-15' },
        { id: '2', name: 'XYZ Market', status: 'active', package: 'Basic', userCount: 12, createdAt: '2024-01-14' },
        { id: '3', name: 'Demo Şirket', status: 'inactive', package: 'Trial', userCount: 5, createdAt: '2024-01-13' },
        { id: '4', name: 'Test AŞ', status: 'active', package: 'Enterprise', userCount: 125, createdAt: '2024-01-12' },
        { id: '5', name: 'Örnek Ltd', status: 'suspended', package: 'Basic', userCount: 8, createdAt: '2024-01-11' }
      ]);

      setSystemHealth([
        { service: 'API Server', status: 'healthy', uptime: '99.95%', responseTime: 45 },
        { service: 'Database', status: 'healthy', uptime: '99.99%', responseTime: 12 },
        { service: 'Cache Server', status: 'healthy', uptime: '100%', responseTime: 2 },
        { service: 'File Storage', status: 'degraded', uptime: '98.5%', responseTime: 156 }
      ]);

      // Revenue trend data for last 7 days
      setRevenueData([
        { date: '2024-01-09', revenue: 6500 },
        { date: '2024-01-10', revenue: 7200 },
        { date: '2024-01-11', revenue: 6800 },
        { date: '2024-01-12', revenue: 7500 },
        { date: '2024-01-13', revenue: 5900 },
        { date: '2024-01-14', revenue: 8200 },
        { date: '2024-01-15', revenue: 7650 }
      ]);

      // Tenant growth data for last 6 months
      setTenantGrowthData([
        { month: 'Ağustos', count: 89 },
        { month: 'Eylül', count: 102 },
        { month: 'Ekim', count: 115 },
        { month: 'Kasım', count: 128 },
        { month: 'Aralık', count: 138 },
        { month: 'Ocak', count: 156 }
      ]);

      // Package distribution
      setPackageDistribution([
        { type: 'Basic', value: 65 },
        { type: 'Premium', value: 52 },
        { type: 'Enterprise', value: 25 },
        { type: 'Trial', value: 14 }
      ]);

    } catch (error) {
      console.error('Dashboard data loading failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const tenantColumns = [
    {
      title: 'Firma Adı',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Paket',
      dataIndex: 'package',
      key: 'package',
      render: (pkg: string) => {
        const color = pkg === 'Enterprise' ? 'gold' : pkg === 'Premium' ? 'blue' : pkg === 'Trial' ? 'green' : 'default';
        return <Tag color={color}>{pkg}</Tag>;
      }
    },
    {
      title: 'Kullanıcı',
      dataIndex: 'userCount',
      key: 'userCount',
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === 'active' ? 'green' : status === 'suspended' ? 'orange' : 'red';
        const icon = status === 'active' ? <CheckCircleOutlined /> : 
                    status === 'suspended' ? <ExclamationCircleOutlined /> : 
                    <ClockCircleOutlined />;
        return <Tag icon={icon} color={color}>{status === 'active' ? 'Aktif' : status === 'suspended' ? 'Askıda' : 'Pasif'}</Tag>;
      }
    }
  ];

  const revenueChartConfig = {
    data: revenueData,
    xField: 'date',
    yField: 'revenue',
    smooth: true,
    height: 200,
    xAxis: {
      label: {
        formatter: (text: string) => {
          const date = new Date(text);
          return `${date.getDate()}/${date.getMonth() + 1}`;
        }
      }
    },
    yAxis: {
      label: {
        formatter: (text: string) => `₺${text}`
      }
    },
    point: {
      size: 3,
      shape: 'circle',
    },
    tooltip: {
      formatter: (datum: any) => {
        return {
          name: 'Gelir',
          value: `₺${datum.revenue.toLocaleString('tr-TR')}`
        };
      }
    }
  };

  const tenantGrowthConfig = {
    data: tenantGrowthData,
    xField: 'month',
    yField: 'count',
    height: 200,
    color: '#1890ff',
    columnStyle: {
      radius: [8, 8, 0, 0],
    },
    label: {
      position: 'top',
      style: {
        fill: '#666',
      }
    }
  };

  const packageDistConfig = {
    data: packageDistribution,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    height: 200,
    label: {
      text: 'value',
      style: {
        fontSize: 14,
        fontWeight: 'bold',
      }
    },
    legend: {
      position: 'bottom',
    },
    interactions: [
      {
        type: 'element-active',
      }
    ],
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Dashboard yükleniyor..." />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Hoş Geldiniz, {user?.fullName || user?.username}! 👋</Title>
        <Paragraph>Stocker SaaS platformunun genel durumu ve istatistikleri</Paragraph>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Toplam Firma"
              value={stats.totalTenants}
              prefix={<ShopOutlined style={{ color: '#1890ff' }} />}
              suffix={
                <span style={{ fontSize: 14, color: '#52c41a' }}>
                  +{stats.newTenantsThisMonth} bu ay
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Aktif Kullanıcı"
              value={stats.totalUsers}
              prefix={<TeamOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Aylık Gelir"
              value={stats.monthlyRevenue}
              prefix={<DollarOutlined style={{ color: '#faad14' }} />}
              suffix="₺"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Büyüme Oranı"
              value={stats.growthRate}
              prefix={<RiseOutlined style={{ color: '#52c41a' }} />}
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={8}>
          <Card title="Gelir Trendi (Son 7 Gün)" bordered={false}>
            <Line {...revenueChartConfig} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Firma Büyümesi (Son 6 Ay)" bordered={false}>
            <Column {...tenantGrowthConfig} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Paket Dağılımı" bordered={false}>
            <Pie {...packageDistConfig} />
          </Card>
        </Col>
      </Row>

      {/* Tables and Lists Row */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card 
            title="Son Eklenen Firmalar" 
            bordered={false}
            extra={<Button type="link">Tümünü Gör</Button>}
          >
            <Table 
              columns={tenantColumns} 
              dataSource={recentTenants} 
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card 
            title="Sistem Durumu" 
            bordered={false}
            extra={<SyncOutlined spin style={{ color: '#52c41a' }} />}
          >
            <List
              dataSource={systemHealth}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        style={{ 
                          backgroundColor: item.status === 'healthy' ? '#52c41a' : 
                                         item.status === 'degraded' ? '#faad14' : '#ff4d4f' 
                        }}
                        icon={
                          item.service.includes('API') ? <ApiOutlined /> :
                          item.service.includes('Database') ? <DatabaseOutlined /> :
                          item.service.includes('Cache') ? <CloudServerOutlined /> :
                          <CloudServerOutlined />
                        }
                      />
                    }
                    title={
                      <Space>
                        <Text>{item.service}</Text>
                        <Tag color={item.status === 'healthy' ? 'green' : item.status === 'degraded' ? 'orange' : 'red'}>
                          {item.status === 'healthy' ? 'Sağlıklı' : item.status === 'degraded' ? 'Düşük' : 'Hatalı'}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Space size="large">
                        <Text type="secondary">Uptime: {item.uptime}</Text>
                        <Text type="secondary">Response: {item.responseTime}ms</Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="Hızlı İşlemler" bordered={false}>
            <Space size="large">
              <Button type="primary" icon={<UserAddOutlined />} size="large">
                Yeni Firma Ekle
              </Button>
              <Button icon={<TeamOutlined />} size="large">
                Kullanıcı Yönetimi
              </Button>
              <Button icon={<ShoppingCartOutlined />} size="large">
                Paket Yönetimi
              </Button>
              <Button icon={<DollarOutlined />} size="large">
                Faturalar
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;