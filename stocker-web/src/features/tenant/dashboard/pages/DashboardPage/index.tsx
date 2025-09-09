import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Space,
  Typography,
  Button,
  Progress,
  Tag,
  Alert,
  Divider,
  Timeline,
  List,
  Avatar,
  Badge,
  Tooltip,
  Spin,
  message
} from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  ShopOutlined,
  AppstoreOutlined,
  DatabaseOutlined,
  CloudServerOutlined,
  BarChartOutlined,
  RiseOutlined,
  FallOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  RocketOutlined,
  SettingOutlined,
  BellOutlined,
  DollarOutlined,
  CalendarOutlined,
  FileTextOutlined,
  ApiOutlined,
  SafetyOutlined,
  SyncOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '@/shared/api/client';
import SetupWizard from '@/features/tenant/setup/components/SetupWizard';
import SetupChecklist from '@/features/tenant/setup/components/SetupChecklist';
import './style.css';

const { Title, Text, Paragraph } = Typography;

interface DashboardMetrics {
  users: {
    total: number;
    active: number;
    inactive: number;
    growth: number;
  };
  storage: {
    used: number;
    total: number;
    percentage: number;
  };
  billing: {
    currentPlan: string;
    monthlyRevenue: number;
    nextBillingDate: string;
    paymentStatus: string;
  };
  activity: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    lastActivity: string;
  };
  modules: {
    total: number;
    active: number;
    names: string[];
  };
  health: {
    status: 'healthy' | 'warning' | 'critical';
    uptime: number;
    lastIncident: string | null;
    apiLatency: number;
  };
}

interface RecentActivity {
  id: string;
  type: 'user' | 'system' | 'billing' | 'security';
  title: string;
  description: string;
  timestamp: string;
  icon: React.ReactNode;
  color: string;
}

const TenantDashboard: React.FC = () => {
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [setupProgress, setSetupProgress] = useState<any>(null);
  const [showSetupWizard, setShowSetupWizard] = useState(false);

  useEffect(() => {
    if (tenantId) {
      fetchDashboardData();
    }
  }, [tenantId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch multiple endpoints in parallel
      const [metricsRes, setupRes, activitiesRes] = await Promise.all([
        apiClient.get(`/api/master/tenants/${tenantId}/statistics`),
        apiClient.get(`/api/master/tenants/${tenantId}/setup-checklist`),
        apiClient.get(`/api/master/tenants/${tenantId}/activities?limit=5`)
      ]);

      if (metricsRes.data?.success) {
        setMetrics(metricsRes.data.data);
      }

      if (setupRes.data?.success) {
        setSetupProgress(setupRes.data.data);
      }

      if (activitiesRes.data?.success) {
        setRecentActivities(activitiesRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      message.error('Dashboard verileri yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
    message.success('Dashboard güncellendi');
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return '#52c41a';
      case 'warning': return '#faad14';
      case 'critical': return '#f5222d';
      default: return '#d9d9d9';
    }
  };

  const getPaymentStatusTag = (status: string) => {
    switch (status) {
      case 'paid': return <Tag color="success">Ödendi</Tag>;
      case 'pending': return <Tag color="warning">Bekliyor</Tag>;
      case 'overdue': return <Tag color="error">Gecikmiş</Tag>;
      default: return <Tag>{status}</Tag>;
    }
  };

  const quickActions = [
    {
      title: 'Kullanıcı Davet Et',
      icon: <UserOutlined />,
      color: '#1890ff',
      onClick: () => navigate(`/tenant/${tenantId}/users/invite`)
    },
    {
      title: 'Modül Ekle',
      icon: <AppstoreOutlined />,
      color: '#52c41a',
      onClick: () => navigate(`/tenant/${tenantId}/modules`)
    },
    {
      title: 'Fatura Detayları',
      icon: <DollarOutlined />,
      color: '#faad14',
      onClick: () => navigate(`/tenant/${tenantId}/billing`)
    },
    {
      title: 'Sistem Ayarları',
      icon: <SettingOutlined />,
      color: '#722ed1',
      onClick: () => navigate(`/tenant/${tenantId}/settings`)
    }
  ];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <Spin size="large" tip="Dashboard yükleniyor..." />
      </div>
    );
  }

  return (
    <div className="tenant-dashboard-container">
      {/* Header Section */}
      <div className="dashboard-header">
        <Row align="middle" justify="space-between">
          <Col>
            <Space direction="vertical" size={0}>
              <Title level={2} style={{ margin: 0 }}>
                <BarChartOutlined /> Tenant Dashboard
              </Title>
              <Text type="secondary">
                Tenant ID: {tenantId}
              </Text>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button
                icon={<SyncOutlined spin={refreshing} />}
                onClick={handleRefresh}
                disabled={refreshing}
              >
                Yenile
              </Button>
              <Button
                type="primary"
                icon={<RocketOutlined />}
                onClick={() => setShowSetupWizard(true)}
              >
                Kurulum Sihirbazı
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Setup Progress Alert */}
      {setupProgress && !setupProgress.canGoLive && (
        <Alert
          message="Kurulum Tamamlanmamış"
          description={`Sistemin canlıya geçmesi için ${setupProgress.requiredItems - setupProgress.requiredCompletedItems} zorunlu adım tamamlanmalı.`}
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          action={
            <Button size="small" type="primary" onClick={() => setShowSetupWizard(true)}>
              Kurulumu Tamamla
            </Button>
          }
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Key Metrics */}
      <Row gutter={[16, 16]} className="metrics-row">
        <Col xs={24} sm={12} lg={6}>
          <Card className="metric-card">
            <Statistic
              title="Toplam Kullanıcı"
              value={metrics?.users.total || 0}
              prefix={<TeamOutlined />}
              suffix={
                <span className={metrics?.users.growth >= 0 ? 'growth-positive' : 'growth-negative'}>
                  {metrics?.users.growth >= 0 ? <RiseOutlined /> : <FallOutlined />}
                  {Math.abs(metrics?.users.growth || 0)}%
                </span>
              }
            />
            <Progress
              percent={(metrics?.users.active / metrics?.users.total) * 100 || 0}
              strokeColor="#52c41a"
              showInfo={false}
              size="small"
              style={{ marginTop: 8 }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {metrics?.users.active} aktif kullanıcı
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="metric-card">
            <Statistic
              title="Depolama Kullanımı"
              value={metrics?.storage.percentage || 0}
              suffix="%"
              prefix={<DatabaseOutlined />}
            />
            <Progress
              percent={metrics?.storage.percentage || 0}
              strokeColor={metrics?.storage.percentage > 80 ? '#ff4d4f' : '#1890ff'}
              size="small"
              style={{ marginTop: 8 }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {metrics?.storage.used}GB / {metrics?.storage.total}GB
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="metric-card">
            <Statistic
              title="Aylık Gelir"
              value={metrics?.billing.monthlyRevenue || 0}
              prefix="₺"
              precision={2}
              valueStyle={{ color: '#52c41a' }}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Plan: {metrics?.billing.currentPlan}
              </Text>
              <br />
              {getPaymentStatusTag(metrics?.billing.paymentStatus || '')}
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="metric-card">
            <Statistic
              title="Sistem Durumu"
              value={metrics?.health.uptime || 0}
              suffix="%"
              valueStyle={{ color: getHealthStatusColor(metrics?.health.status || '') }}
            />
            <div style={{ marginTop: 8 }}>
              <Badge
                status={metrics?.health.status === 'healthy' ? 'success' : 'error'}
                text={metrics?.health.status === 'healthy' ? 'Sağlıklı' : 'Sorunlu'}
              />
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                API Gecikme: {metrics?.health.apiLatency}ms
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Main Content Grid */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        {/* Setup Progress */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <CheckCircleOutlined />
                <span>Kurulum Durumu</span>
              </Space>
            }
            extra={
              <Button
                type="link"
                size="small"
                onClick={() => navigate(`/tenant/${tenantId}/setup`)}
              >
                Detaylar
              </Button>
            }
            className="dashboard-card"
          >
            {setupProgress && (
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>Genel İlerleme</Text>
                  <Progress
                    percent={setupProgress.overallProgress || 0}
                    strokeColor={{
                      '0%': '#108ee9',
                      '100%': '#87d068',
                    }}
                  />
                </div>
                <div>
                  <Text strong>Zorunlu Adımlar</Text>
                  <Progress
                    percent={setupProgress.requiredProgress || 0}
                    strokeColor="#ff4d4f"
                    format={percent => (
                      <span style={{ fontSize: 12 }}>
                        {setupProgress.requiredCompletedItems}/{setupProgress.requiredItems}
                      </span>
                    )}
                  />
                </div>
                <Divider style={{ margin: '12px 0' }} />
                <Space wrap>
                  <Badge status="success" text={`${setupProgress.completedItems} Tamamlandı`} />
                  <Badge status="processing" text={`${setupProgress.totalItems - setupProgress.completedItems} Bekliyor`} />
                </Space>
                {setupProgress.canGoLive && (
                  <Alert
                    message="Canlıya Geçmeye Hazır!"
                    type="success"
                    showIcon
                    style={{ marginTop: 12 }}
                  />
                )}
              </Space>
            )}
          </Card>
        </Col>

        {/* Active Modules */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <AppstoreOutlined />
                <span>Aktif Modüller</span>
              </Space>
            }
            extra={
              <Button
                type="link"
                size="small"
                onClick={() => navigate(`/tenant/${tenantId}/modules`)}
              >
                Yönet
              </Button>
            }
            className="dashboard-card"
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ marginBottom: 16 }}>
                <Text type="secondary">Toplam Modül</Text>
                <Title level={3} style={{ margin: '8px 0' }}>
                  {metrics?.modules.active} / {metrics?.modules.total}
                </Title>
              </div>
              <div className="module-tags">
                {metrics?.modules.names.map(module => (
                  <Tag key={module} color="blue" style={{ marginBottom: 8 }}>
                    {module}
                  </Tag>
                ))}
              </div>
              <Button
                type="dashed"
                block
                icon={<AppstoreOutlined />}
                onClick={() => navigate(`/tenant/${tenantId}/modules/add`)}
              >
                Yeni Modül Ekle
              </Button>
            </Space>
          </Card>
        </Col>

        {/* Recent Activity */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <ClockCircleOutlined />
                <span>Son Aktiviteler</span>
              </Space>
            }
            extra={
              <Button
                type="link"
                size="small"
                onClick={() => navigate(`/tenant/${tenantId}/activities`)}
              >
                Tümü
              </Button>
            }
            className="dashboard-card"
          >
            <Timeline mode="left">
              {recentActivities.map(activity => (
                <Timeline.Item
                  key={activity.id}
                  dot={activity.icon}
                  color={activity.color}
                >
                  <Text strong>{activity.title}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {activity.description}
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {activity.timestamp}
                  </Text>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Card
        title={
          <Space>
            <RocketOutlined />
            <span>Hızlı İşlemler</span>
          </Space>
        }
        className="dashboard-card"
        style={{ marginTop: 16 }}
      >
        <Row gutter={[16, 16]}>
          {quickActions.map((action, index) => (
            <Col xs={12} sm={6} key={index}>
              <Button
                type="default"
                block
                size="large"
                icon={action.icon}
                onClick={action.onClick}
                style={{ height: 'auto', padding: '16px' }}
              >
                <div style={{ marginTop: 8 }}>{action.title}</div>
              </Button>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Setup Wizard Modal */}
      {showSetupWizard && tenantId && (
        <SetupWizard
          tenantId={tenantId}
          onClose={() => {
            setShowSetupWizard(false);
            fetchDashboardData();
          }}
        />
      )}
    </div>
  );
};

export default TenantDashboard;