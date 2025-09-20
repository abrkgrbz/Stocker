import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Progress, Space, Button, List, Avatar, Typography, Spin, Badge, Tooltip, notification } from 'antd';
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
  ShoppingCartOutlined,
  WifiOutlined,
  DisconnectOutlined
} from '@ant-design/icons';
import { Line, Column, Pie } from '@ant-design/charts';
import { useAuthStore } from '../stores/authStore';
import { dashboardService } from '../services/api/dashboardService';
import { useDashboardSignalR, useRealtimeTenants, useSystemHealthMonitor } from '../hooks/useDashboardSignalR';
import { signalRService } from '../services/signalr/signalRService';
import { tokenStorage } from '../utils/tokenStorage';

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
  
  // SignalR hooks
  const { 
    isConnected, 
    stats: realtimeStats, 
    systemHealth: realtimeHealth, 
    revenueUpdates, 
    recentActivity,
    requestDashboardRefresh 
  } = useDashboardSignalR();
  
  const { tenants: realtimeTenants, lastUpdate: tenantLastUpdate } = useRealtimeTenants();
  const { health: monitoredHealth, overallStatus } = useSystemHealthMonitor();
  
  // Local state with real-time updates
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
    
    // Connect to SignalR if not connected and user is authenticated
    const token = tokenStorage.getToken();
    if (token && !signalRService.isConnected()) {
      signalRService.connect().catch(error => {
        console.warn('SignalR connection failed:', error);
      });
    }
  }, []);
  
  // Update stats when real-time data arrives
  useEffect(() => {
    if (realtimeStats) {
      setStats(realtimeStats);
    }
  }, [realtimeStats]);
  
  // Update system health from real-time monitoring
  useEffect(() => {
    if (monitoredHealth && monitoredHealth.length > 0) {
      setSystemHealth(monitoredHealth.map(h => ({
        service: h.service,
        status: h.status,
        uptime: h.uptime,
        responseTime: h.responseTime
      })));
    }
  }, [monitoredHealth]);
  
  // Update tenants from real-time updates
  useEffect(() => {
    if (realtimeTenants && realtimeTenants.length > 0) {
      setRecentTenants(realtimeTenants.slice(0, 5).map(t => ({
        id: t.id,
        name: t.name,
        status: t.status,
        package: t.packageName || 'Basic',
        userCount: t.userCount || 0,
        createdAt: t.createdAt
      })));
    }
  }, [realtimeTenants]);
  
  // Process revenue updates
  useEffect(() => {
    if (revenueUpdates && revenueUpdates.length > 0) {
      // Update revenue data with latest updates
      const latestRevenue = revenueUpdates[revenueUpdates.length - 1];
      if (latestRevenue) {
        setRevenueData(prev => {
          const updated = [...prev];
          const existingIndex = updated.findIndex(r => r.date === latestRevenue.date);
          if (existingIndex >= 0) {
            updated[existingIndex].revenue += latestRevenue.amount;
          } else {
            updated.push({ date: latestRevenue.date, revenue: latestRevenue.amount });
          }
          return updated.slice(-7); // Keep last 7 days
        });
      }
    }
  }, [revenueUpdates]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load real data from API with sequential calls to avoid rate limiting
      
      // 1. Get dashboard stats
      try {
        const statsData = await dashboardService.getStats();
        if (statsData) {
          setStats({
            totalTenants: statsData.totalTenants || 0,
            activeTenants: statsData.activeTenants || 0,
            totalUsers: statsData.totalUsers || statsData.activeUsers || 0,
            monthlyRevenue: statsData.monthlyRevenue || statsData.totalRevenue || 0,
            growthRate: statsData.growthRate || 0,
            newTenantsThisMonth: statsData.newTenantsThisMonth || 0,
            activeSubscriptions: statsData.activeTenants || 0, // Use activeTenants as proxy for active subscriptions
            pendingPayments: 0 // This field doesn't exist in the API, default to 0
          });
        }
      } catch (error) {
        console.error('Failed to load stats:', error);
        // Use fallback data if API fails
        setStats({
          totalTenants: 0,
          activeTenants: 0,
          totalUsers: 0,
          monthlyRevenue: 0,
          growthRate: 0,
          newTenantsThisMonth: 0,
          activeSubscriptions: 0,
          pendingPayments: 0
        });
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));

      // 2. Get recent tenants
      try {
        const tenants = await dashboardService.getRecentTenants();
        if (tenants && Array.isArray(tenants)) {
          setRecentTenants(tenants.slice(0, 5).map((t: any) => ({
            id: t.id,
            name: t.name || t.companyName || 'İsimsiz Firma',
            status: t.status || 'active',
            package: t.packageName || 'Basic',
            userCount: t.userCount || 0,
            createdAt: t.createdAt || new Date().toISOString()
          })));
        }
      } catch (error) {
        console.error('Failed to load tenants:', error);
        setRecentTenants([]);
      }

      await new Promise(resolve => setTimeout(resolve, 200));

      // 3. Get system health
      try {
        const health = await dashboardService.getSystemHealth();
        if (health) {
          const healthData = [];
          
          // API Server status
          if (health.apiStatus !== undefined) {
            healthData.push({ 
              service: 'API Server', 
              status: health.apiStatus as any, 
              uptime: health.uptime || 'N/A', 
              responseTime: 0 
            });
          }
          
          // Database status
          if (health.databaseStatus !== undefined) {
            healthData.push({ 
              service: 'Database', 
              status: health.databaseStatus as any, 
              uptime: health.uptime || 'N/A', 
              responseTime: 0 
            });
          }
          
          // Cache status
          if (health.cacheStatus !== undefined) {
            healthData.push({ 
              service: 'Cache Server', 
              status: health.cacheStatus as any, 
              uptime: health.uptime || 'N/A', 
              responseTime: 0 
            });
          }
          
          // Queue status (instead of File Storage)
          if (health.queueStatus !== undefined) {
            healthData.push({ 
              service: 'Queue Service', 
              status: health.queueStatus as any, 
              uptime: health.uptime || 'N/A', 
              responseTime: 0 
            });
          }
          
          setSystemHealth(healthData.length > 0 ? healthData : [
            { service: 'API Server', status: 'healthy' as any, uptime: health.uptime || 'N/A', responseTime: 0 },
            { service: 'Database', status: 'healthy' as any, uptime: 'N/A', responseTime: 0 },
            { service: 'Cache Server', status: 'healthy' as any, uptime: 'N/A', responseTime: 0 },
            { service: 'Queue Service', status: 'healthy' as any, uptime: 'N/A', responseTime: 0 }
          ]);
        }
      } catch (error) {
        console.error('Failed to load system health:', error);
        setSystemHealth([
          { service: 'API Server', status: 'unknown' as any, uptime: 'N/A', responseTime: 0 },
          { service: 'Database', status: 'unknown' as any, uptime: 'N/A', responseTime: 0 },
          { service: 'Cache Server', status: 'unknown' as any, uptime: 'N/A', responseTime: 0 },
          { service: 'Queue Service', status: 'unknown' as any, uptime: 'N/A', responseTime: 0 }
        ]);
      }

      await new Promise(resolve => setTimeout(resolve, 200));

      // 4. Get revenue data
      try {
        const revenue = await dashboardService.getRevenueOverview();
        if (revenue && revenue.daily && revenue.daily.length > 0) {
          // Use daily data from the API
          setRevenueData(revenue.daily.slice(0, 7).map((item: any) => ({
            date: item.date,
            revenue: item.revenue || 0
          })));
        } else if (revenue && revenue.monthly && revenue.monthly.length > 0) {
          // Fallback to monthly data if daily is not available
          setRevenueData(revenue.monthly.slice(0, 7).map((item: any) => ({
            date: item.date,
            revenue: item.revenue || 0
          })));
        } else {
          // Generate last 7 days with zero values if no data
          const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            return {
              date: date.toISOString().split('T')[0],
              revenue: 0
            };
          });
          setRevenueData(last7Days);
        }
      } catch (error) {
        console.error('Failed to load revenue data:', error);
        // Generate last 7 days with zero values as fallback
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return {
            date: date.toISOString().split('T')[0],
            revenue: 0
          };
        });
        setRevenueData(last7Days);
      }

      await new Promise(resolve => setTimeout(resolve, 200));

      // 5. Get tenant growth data
      try {
        const growthChart = await dashboardService.getTenantGrowthChartData();
        if (growthChart && growthChart.labels && growthChart.datasets[0]) {
          const growthData = growthChart.labels.map((label, index) => ({
            month: label,
            count: growthChart.datasets[0].data[index] || 0
          }));
          setTenantGrowthData(growthData);
        } else {
          // Generate last 6 months with zero values if no data
          const last6Months = Array.from({ length: 6 }, (_, i) => {
            const date = new Date();
            date.setMonth(date.getMonth() - (5 - i));
            return {
              month: date.toLocaleDateString('tr-TR', { month: 'short' }),
              count: 0
            };
          });
          setTenantGrowthData(last6Months);
        }
      } catch (error) {
        console.error('Failed to load tenant growth:', error);
        // Generate last 6 months with zero values as fallback
        const last6Months = Array.from({ length: 6 }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - (5 - i));
          return {
            month: date.toLocaleDateString('tr-TR', { month: 'short' }),
            count: 0
          };
        });
        setTenantGrowthData(last6Months);
      }

      await new Promise(resolve => setTimeout(resolve, 200));

      // 6. Get package distribution
      try {
        const packageChart = await dashboardService.getPackageDistribution();
        if (packageChart && packageChart.labels && packageChart.datasets[0]) {
          const packageData = packageChart.labels.map((label, index) => ({
            type: label,
            value: packageChart.datasets[0].data[index] || 0
          }));
          setPackageDistribution(packageData);
        } else {
          // Default package distribution
          setPackageDistribution([
            { type: 'Basic', value: 0 },
            { type: 'Pro', value: 0 },
            { type: 'Enterprise', value: 0 }
          ]);
        }
      } catch (error) {
        console.error('Failed to load package distribution:', error);
        setPackageDistribution([
          { type: 'Basic', value: 0 },
          { type: 'Pro', value: 0 },
          { type: 'Enterprise', value: 0 }
        ]);
      }

    } catch (error) {
      console.error('Dashboard data loading failed:', error);
      notification.error({
        message: 'Veri Yükleme Hatası',
        description: 'Dashboard verileri yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.',
        placement: 'topRight'
      });
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
      {/* Header with Connection Status */}
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2}>Hoş Geldiniz, {user?.fullName || user?.username}! 👋</Title>
            <Paragraph>Stocker SaaS platformunun genel durumu ve istatistikleri</Paragraph>
          </Col>
          <Col>
            <Space>
              <Tooltip title={isConnected ? 'Canlı bağlantı aktif' : 'Bağlantı yok'}>
                <Badge 
                  status={isConnected ? 'success' : 'error'} 
                  text={
                    <Space>
                      {isConnected ? <WifiOutlined /> : <DisconnectOutlined />}
                      {isConnected ? 'Canlı Bağlantı' : 'Bağlantı Kesildi'}
                    </Space>
                  }
                />
              </Tooltip>
              {tenantLastUpdate && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Son güncelleme: {new Date(tenantLastUpdate).toLocaleTimeString('tr-TR')}
                </Text>
              )}
              <Button 
                icon={<SyncOutlined spin={loading} />} 
                onClick={() => {
                  loadDashboardData();
                  requestDashboardRefresh();
                }}
                disabled={loading}
              >
                Yenile
              </Button>
            </Space>
          </Col>
        </Row>
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

      {/* Real-time Activity Feed */}
      {recentActivity && recentActivity.length > 0 && (
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col span={24}>
            <Card 
              title={
                <Space>
                  <span>Canlı Aktiviteler</span>
                  <Badge count={recentActivity.length} style={{ backgroundColor: '#52c41a' }} />
                </Space>
              }
              bordered={false}
            >
              <List
                size="small"
                dataSource={recentActivity.slice(0, 5)}
                renderItem={(activity: any) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          size="small" 
                          style={{ 
                            backgroundColor: activity.type === 'tenant_status' ? '#1890ff' : '#52c41a' 
                          }}
                        >
                          {activity.type === 'tenant_status' ? '🏢' : '👤'}
                        </Avatar>
                      }
                      title={
                        activity.type === 'tenant_status' 
                          ? `${activity.tenantName} durumu değişti: ${activity.oldStatus} → ${activity.newStatus}`
                          : `${activity.userName} - ${activity.action}`
                      }
                      description={
                        <Space>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {new Date(activity.timestamp).toLocaleString('tr-TR')}
                          </Text>
                          {activity.changedBy && (
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              • {activity.changedBy} tarafından
                            </Text>
                          )}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      )}
      
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