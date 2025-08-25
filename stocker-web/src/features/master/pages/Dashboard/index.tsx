import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Progress, 
  Table, 
  Tag, 
  Space, 
  Avatar, 
  Typography,
  Select,
  DatePicker,
  Button,
  Tooltip,
  Badge,
  Timeline,
  List,
  Segmented,
  Skeleton,
} from 'antd';
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined,
  UserOutlined,
  TeamOutlined,
  ShoppingOutlined,
  DollarOutlined,
  CloudServerOutlined,
  DatabaseOutlined,
  ApiOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  RiseOutlined,
  FallOutlined,
  EyeOutlined,
  ReloadOutlined,
  ExportOutlined,
  CalendarOutlined,
  BellOutlined,
  FireOutlined,
  ThunderboltOutlined,
  RocketOutlined,
  TrophyOutlined,
  CrownOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { Line, Area, Column, Pie, Gauge, DualAxes, Rose } from '@ant-design/plots';
import CountUp from 'react-countup';
import { motion } from 'framer-motion';
import './style.css';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

export const MasterDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('today');
  const [loading, setLoading] = useState(false);

  // Animated stat card component
  const StatCard = ({ 
    title, 
    value, 
    prefix, 
    suffix, 
    trend, 
    trendValue, 
    color, 
    icon, 
    delay = 0 
  }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card 
        className="stat-card"
        style={{ 
          background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
          borderTop: `3px solid ${color}`,
        }}
      >
        <div className="stat-card-header">
          <div className="stat-icon" style={{ background: `${color}20`, color }}>
            {icon}
          </div>
          <div className="stat-trend">
            {trend === 'up' ? (
              <span style={{ color: '#52c41a' }}>
                <ArrowUpOutlined /> {trendValue}%
              </span>
            ) : trend === 'down' ? (
              <span style={{ color: '#ff4d4f' }}>
                <ArrowDownOutlined /> {trendValue}%
              </span>
            ) : null}
          </div>
        </div>
        <div className="stat-content">
          <Text type="secondary" className="stat-title">{title}</Text>
          <div className="stat-value">
            {prefix}
            <CountUp
              end={value}
              duration={2}
              separator=","
              decimals={suffix === 'GB' ? 1 : 0}
            />
            {suffix}
          </div>
        </div>
      </Card>
    </motion.div>
  );

  // Revenue chart data
  const revenueData = [
    { month: 'Oca', revenue: 45000, profit: 12000 },
    { month: 'Şub', revenue: 52000, profit: 15000 },
    { month: 'Mar', revenue: 48000, profit: 13000 },
    { month: 'Nis', revenue: 61000, profit: 18000 },
    { month: 'May', revenue: 72000, profit: 22000 },
    { month: 'Haz', revenue: 85000, profit: 28000 },
    { month: 'Tem', revenue: 92000, profit: 32000 },
    { month: 'Ağu', revenue: 88000, profit: 30000 },
    { month: 'Eyl', revenue: 95000, profit: 35000 },
    { month: 'Eki', revenue: 102000, profit: 38000 },
    { month: 'Kas', revenue: 98000, profit: 36000 },
    { month: 'Ara', revenue: 115000, profit: 42000 },
  ];

  const revenueConfig = {
    data: [revenueData, revenueData],
    xField: 'month',
    yField: ['revenue', 'profit'],
    geometryOptions: [
      {
        geometry: 'column',
        color: '#667eea',
        columnWidthRatio: 0.4,
      },
      {
        geometry: 'line',
        color: '#52c41a',
        lineStyle: {
          lineWidth: 2,
        },
      },
    ],
    legend: {
      position: 'top-right',
    },
  };

  // Tenant distribution data
  const tenantDistribution = [
    { type: 'Aktif', value: 245, color: '#52c41a' },
    { type: 'Deneme', value: 85, color: '#faad14' },
    { type: 'Pasif', value: 32, color: '#ff4d4f' },
    { type: 'Askıda', value: 18, color: '#8c8c8c' },
  ];

  const pieConfig = {
    data: tenantDistribution,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    innerRadius: 0.6,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    interactions: [
      {
        type: 'pie-legend-active',
      },
      {
        type: 'element-active',
      },
    ],
    statistic: {
      title: {
        offsetY: -8,
        content: 'Toplam',
        style: {
          fontSize: '14px',
        },
      },
      content: {
        offsetY: 4,
        style: {
          fontSize: '24px',
        },
        formatter: () => '380',
      },
    },
  };

  // System health data
  const systemHealthData = [
    { name: 'CPU Kullanımı', value: 65, status: 'normal' },
    { name: 'Bellek Kullanımı', value: 78, status: 'warning' },
    { name: 'Disk Kullanımı', value: 45, status: 'normal' },
    { name: 'API Yanıt Süresi', value: 92, status: 'normal' },
    { name: 'Database Bağlantı', value: 98, status: 'normal' },
  ];

  // Recent activities
  const recentActivities = [
    {
      id: 1,
      type: 'tenant',
      action: 'Yeni tenant kaydı',
      description: 'ABC Teknoloji Ltd. Şti. sisteme kaydoldu',
      time: '5 dakika önce',
      icon: <TeamOutlined />,
      color: '#52c41a',
    },
    {
      id: 2,
      type: 'payment',
      action: 'Ödeme alındı',
      description: 'XYZ Şirketi - Professional Plan - ₺2,500',
      time: '15 dakika önce',
      icon: <DollarOutlined />,
      color: '#667eea',
    },
    {
      id: 3,
      type: 'alert',
      action: 'Sistem uyarısı',
      description: 'Disk kullanımı %80\'i aştı',
      time: '1 saat önce',
      icon: <WarningOutlined />,
      color: '#faad14',
    },
    {
      id: 4,
      type: 'user',
      action: 'Yeni admin kullanıcı',
      description: 'admin@example.com eklendi',
      time: '2 saat önce',
      icon: <UserOutlined />,
      color: '#13c2c2',
    },
  ];

  // Top tenants data
  const topTenants = [
    { 
      rank: 1, 
      name: 'TechCorp Solutions', 
      users: 145, 
      storage: '25.3 GB', 
      revenue: '₺12,500',
      growth: 15,
      status: 'active'
    },
    { 
      rank: 2, 
      name: 'Global Industries', 
      users: 98, 
      storage: '18.7 GB', 
      revenue: '₺8,900',
      growth: 8,
      status: 'active'
    },
    { 
      rank: 3, 
      name: 'StartUp Hub', 
      users: 76, 
      storage: '12.4 GB', 
      revenue: '₺6,200',
      growth: -3,
      status: 'trial'
    },
    { 
      rank: 4, 
      name: 'Digital Agency Pro', 
      users: 65, 
      storage: '9.8 GB', 
      revenue: '₺5,400',
      growth: 12,
      status: 'active'
    },
    { 
      rank: 5, 
      name: 'Cloud Systems Inc', 
      users: 54, 
      storage: '7.2 GB', 
      revenue: '₺4,100',
      growth: 5,
      status: 'active'
    },
  ];

  const columns = [
    {
      title: 'Sıra',
      dataIndex: 'rank',
      key: 'rank',
      width: 60,
      render: (rank: number) => {
        const icon = rank === 1 ? <CrownOutlined /> : 
                     rank === 2 ? <TrophyOutlined /> :
                     rank === 3 ? <StarOutlined /> : null;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {icon && <span style={{ color: '#faad14' }}>{icon}</span>}
            <span style={{ fontWeight: rank <= 3 ? 'bold' : 'normal' }}>
              {rank}
            </span>
          </div>
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
            {name.substring(0, 2).toUpperCase()}
          </Avatar>
          <div>
            <Text strong>{name}</Text>
            <br />
            <Tag color={record.status === 'active' ? 'success' : 'warning'} style={{ fontSize: '10px' }}>
              {record.status === 'active' ? 'Aktif' : 'Deneme'}
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
        <Space>
          <UserOutlined />
          <span>{users}</span>
        </Space>
      ),
    },
    {
      title: 'Depolama',
      dataIndex: 'storage',
      key: 'storage',
      render: (storage: string) => (
        <Space>
          <DatabaseOutlined />
          <span>{storage}</span>
        </Space>
      ),
    },
    {
      title: 'Gelir',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (revenue: string) => (
        <Text strong style={{ color: '#52c41a' }}>{revenue}</Text>
      ),
    },
    {
      title: 'Büyüme',
      dataIndex: 'growth',
      key: 'growth',
      render: (growth: number) => (
        <span style={{ color: growth > 0 ? '#52c41a' : '#ff4d4f' }}>
          {growth > 0 ? <RiseOutlined /> : <FallOutlined />}
          {Math.abs(growth)}%
        </span>
      ),
    },
  ];

  // API usage data
  const apiUsageData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    calls: Math.floor(Math.random() * 1000) + 200,
  }));

  const apiUsageConfig = {
    data: apiUsageData,
    xField: 'hour',
    yField: 'calls',
    smooth: true,
    areaStyle: {
      fill: 'l(270) 0:#ffffff 0.5:#667eea 1:#764ba2',
    },
    line: {
      color: '#667eea',
    },
  };

  return (
    <div className="master-dashboard">
      {/* Page Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div>
            <Title level={2} style={{ margin: 0 }}>
              <RocketOutlined /> Master Dashboard
            </Title>
            <Text type="secondary">Sistem genelinde özet ve performans metrikleri</Text>
          </div>
          <Space size="middle">
            <Segmented
              value={timeRange}
              onChange={setTimeRange}
              options={[
                { label: 'Bugün', value: 'today' },
                { label: 'Bu Hafta', value: 'week' },
                { label: 'Bu Ay', value: 'month' },
                { label: 'Bu Yıl', value: 'year' },
              ]}
            />
            <RangePicker />
            <Button icon={<ReloadOutlined />} onClick={() => setLoading(!loading)}>
              Yenile
            </Button>
            <Button type="primary" icon={<ExportOutlined />}>
              Rapor Al
            </Button>
          </Space>
        </div>
      </div>

      {/* Key Metrics */}
      <Row gutter={[16, 16]} className="metrics-row">
        <Col xs={24} sm={12} md={6}>
          <StatCard
            title="Toplam Tenant"
            value={380}
            color="#667eea"
            icon={<TeamOutlined />}
            trend="up"
            trendValue={12.5}
            delay={0}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCard
            title="Aktif Kullanıcılar"
            value={2845}
            color="#52c41a"
            icon={<UserOutlined />}
            trend="up"
            trendValue={8.3}
            delay={0.1}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCard
            title="Aylık Gelir"
            value={115000}
            prefix="₺"
            color="#faad14"
            icon={<DollarOutlined />}
            trend="up"
            trendValue={18.7}
            delay={0.2}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatCard
            title="Sistem Uptime"
            value={99.9}
            suffix="%"
            color="#13c2c2"
            icon={<ThunderboltOutlined />}
            trend="up"
            trendValue={0.2}
            delay={0.3}
          />
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card 
            title={
              <Space>
                <FireOutlined style={{ color: '#667eea' }} />
                <span>Gelir ve Kar Analizi</span>
              </Space>
            }
            extra={
              <Select defaultValue="2024" style={{ width: 100 }}>
                <Select.Option value="2024">2024</Select.Option>
                <Select.Option value="2023">2023</Select.Option>
              </Select>
            }
            className="chart-card"
          >
            {loading ? (
              <Skeleton active paragraph={{ rows: 8 }} />
            ) : (
              <DualAxes {...revenueConfig} height={300} />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card 
            title={
              <Space>
                <TeamOutlined style={{ color: '#667eea' }} />
                <span>Tenant Dağılımı</span>
              </Space>
            }
            className="chart-card"
          >
            {loading ? (
              <Skeleton active paragraph={{ rows: 8 }} />
            ) : (
              <Pie {...pieConfig} height={300} />
            )}
          </Card>
        </Col>
      </Row>

      {/* System Health and API Usage */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <Card 
            title={
              <Space>
                <CloudServerOutlined style={{ color: '#667eea' }} />
                <span>Sistem Sağlığı</span>
              </Space>
            }
            extra={
              <Badge status="processing" text="Canlı" />
            }
            className="chart-card"
          >
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {systemHealthData.map((item, index) => (
                <div key={index}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text>{item.name}</Text>
                    <Text strong>{item.value}%</Text>
                  </div>
                  <Progress
                    percent={item.value}
                    strokeColor={
                      item.value > 80 ? '#ff4d4f' : 
                      item.value > 60 ? '#faad14' : 
                      '#52c41a'
                    }
                    showInfo={false}
                  />
                </div>
              ))}
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card 
            title={
              <Space>
                <ApiOutlined style={{ color: '#667eea' }} />
                <span>API Kullanımı (Son 24 Saat)</span>
              </Space>
            }
            extra={
              <Text type="secondary">Toplam: 18,432 çağrı</Text>
            }
            className="chart-card"
          >
            {loading ? (
              <Skeleton active paragraph={{ rows: 8 }} />
            ) : (
              <Area {...apiUsageConfig} height={250} />
            )}
          </Card>
        </Col>
      </Row>

      {/* Top Tenants and Recent Activities */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={14}>
          <Card 
            title={
              <Space>
                <TrophyOutlined style={{ color: '#faad14' }} />
                <span>En İyi Tenant'lar</span>
              </Space>
            }
            extra={
              <Button type="link" icon={<EyeOutlined />}>
                Tümünü Gör
              </Button>
            }
            className="chart-card"
          >
            <Table
              columns={columns}
              dataSource={topTenants}
              pagination={false}
              size="small"
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card 
            title={
              <Space>
                <BellOutlined style={{ color: '#667eea' }} />
                <span>Son Aktiviteler</span>
              </Space>
            }
            extra={
              <Badge count={4} />
            }
            className="chart-card"
          >
            <Timeline>
              {recentActivities.map((activity) => (
                <Timeline.Item
                  key={activity.id}
                  dot={
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: `${activity.color}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: activity.color,
                      }}
                    >
                      {activity.icon}
                    </div>
                  }
                >
                  <div>
                    <Text strong>{activity.action}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {activity.description}
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      <ClockCircleOutlined /> {activity.time}
                    </Text>
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="Hızlı İşlemler" className="quick-actions-card">
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={6}>
                <Button 
                  type="default" 
                  icon={<TeamOutlined />} 
                  size="large" 
                  block
                  className="action-button"
                >
                  Yeni Tenant
                </Button>
              </Col>
              <Col xs={12} sm={6}>
                <Button 
                  type="default" 
                  icon={<UserOutlined />} 
                  size="large" 
                  block
                  className="action-button"
                >
                  Kullanıcı Ekle
                </Button>
              </Col>
              <Col xs={12} sm={6}>
                <Button 
                  type="default" 
                  icon={<DatabaseOutlined />} 
                  size="large" 
                  block
                  className="action-button"
                >
                  Backup Al
                </Button>
              </Col>
              <Col xs={12} sm={6}>
                <Button 
                  type="default" 
                  icon={<ApiOutlined />} 
                  size="large" 
                  block
                  className="action-button"
                >
                  API Monitör
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};