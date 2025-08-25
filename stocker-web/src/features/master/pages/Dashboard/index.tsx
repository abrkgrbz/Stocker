import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import { Line, Area, Column, Pie, DualAxes, Gauge, Liquid } from '@ant-design/plots';
import {
  Row,
  Col,
  Card,
  Statistic,
  Progress,
  Table,
  Tag,
  Space,
  Avatar,
  Typography,
  Button,
  Dropdown,
  Badge,
  Timeline,
  List,
  Tooltip,
  Segmented,
  Select,
  DatePicker,
  Skeleton,
  Alert,
  Tabs,
  Divider,
} from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  RiseOutlined,
  FallOutlined,
  SyncOutlined,
  CloudServerOutlined,
  DatabaseOutlined,
  ApiOutlined,
  SafetyOutlined,
  BellOutlined,
  SettingOutlined,
  ExportOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  FireOutlined,
  ThunderboltOutlined,
  RocketOutlined,
  CrownOutlined,
  TrophyOutlined,
  StarOutlined,
  GlobalOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  AreaChartOutlined,
  FundOutlined,
  StockOutlined,
  CalendarOutlined,
  FilterOutlined,
  MoreOutlined,
} from '@ant-design/icons';
// import './styles.css';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

// Types
interface StatCardProps {
  title: string;
  value: number;
  prefix?: React.ReactNode;
  suffix?: string;
  trend?: 'up' | 'down';
  trendValue?: number;
  color: string;
  icon: React.ReactNode;
  loading?: boolean;
  onClick?: () => void;
}

interface Activity {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  description: string;
  time: string;
  icon: React.ReactNode;
}

export const MasterDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<string>('today');
  const [selectedMetric, setSelectedMetric] = useState<string>('revenue');

  // Animated Stat Card Component
  const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    prefix,
    suffix,
    trend,
    trendValue,
    color,
    icon,
    loading,
    onClick,
  }) => (
    <motion.div
      whileHover={{ scale: 1.02, translateY: -5 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className="stat-card glass-morphism"
        style={{
          background: `linear-gradient(135deg, ${color}08 0%, ${color}03 100%)`,
          borderLeft: `4px solid ${color}`,
          cursor: onClick ? 'pointer' : 'default',
        }}
        onClick={onClick}
        hoverable={!!onClick}
      >
        {loading ? (
          <Skeleton active paragraph={{ rows: 2 }} />
        ) : (
          <>
            <div className="stat-header">
              <div className="stat-icon-wrapper" style={{ background: `${color}15` }}>
                <div className="stat-icon" style={{ color }}>
                  {icon}
                </div>
              </div>
              {trend && (
                <div className={`stat-trend ${trend}`}>
                  {trend === 'up' ? <RiseOutlined /> : <FallOutlined />}
                  <span>{trendValue}%</span>
                </div>
              )}
            </div>
            <div className="stat-content">
              <Text className="stat-title">{title}</Text>
              <div className="stat-value">
                {prefix}
                <CountUp
                  end={value}
                  duration={2}
                  separator=","
                  decimals={suffix === '%' ? 1 : 0}
                />
                {suffix}
              </div>
            </div>
            <div className="stat-footer">
              <Progress
                percent={(trendValue || 0) + 50}
                showInfo={false}
                strokeColor={color}
                trailColor={`${color}20`}
                size="small"
              />
            </div>
          </>
        )}
      </Card>
    </motion.div>
  );

  // Mock Data
  const statsData = [
    {
      title: 'Toplam Gelir',
      value: 524350,
      prefix: '₺',
      trend: 'up' as const,
      trendValue: 12.5,
      color: '#52c41a',
      icon: <DollarOutlined />,
    },
    {
      title: 'Aktif Tenantlar',
      value: 386,
      trend: 'up' as const,
      trendValue: 8.3,
      color: '#1890ff',
      icon: <TeamOutlined />,
    },
    {
      title: 'Toplam Kullanıcı',
      value: 4823,
      trend: 'up' as const,
      trendValue: 15.7,
      color: '#722ed1',
      icon: <UserOutlined />,
    },
    {
      title: 'Sistem Uptime',
      value: 99.9,
      suffix: '%',
      trend: 'up' as const,
      trendValue: 0.1,
      color: '#13c2c2',
      icon: <ThunderboltOutlined />,
    },
  ];

  // Revenue Chart Data
  const revenueData = [
    { month: 'Ocak', revenue: 320000, growth: 12 },
    { month: 'Şubat', revenue: 385000, growth: 15 },
    { month: 'Mart', revenue: 412000, growth: 8 },
    { month: 'Nisan', revenue: 445000, growth: 11 },
    { month: 'Mayıs', revenue: 478000, growth: 9 },
    { month: 'Haziran', revenue: 524350, growth: 13 },
  ];

  const revenueChartConfig = {
    data: [revenueData, revenueData],
    xField: 'month',
    yField: ['revenue', 'growth'],
    geometryOptions: [
      {
        geometry: 'column',
        color: '#5B8FF9',
        columnWidthRatio: 0.4,
        label: {
          position: 'middle',
        },
      },
      {
        geometry: 'line',
        color: '#5AD8A6',
        smooth: true,
        lineStyle: {
          lineWidth: 3,
          shadowColor: 'rgba(0,0,0,0.1)',
          shadowBlur: 10,
        },
        point: {
          size: 5,
          shape: 'circle',
          style: {
            fill: 'white',
            stroke: '#5AD8A6',
            lineWidth: 2,
          },
        },
      },
    ],
    interactions: [{ type: 'element-active' }],
    legend: {
      position: 'top-right',
    },
  };

  // Tenant Distribution
  const tenantDistribution = [
    { type: 'Enterprise', value: 45, color: '#5B8FF9' },
    { type: 'Professional', value: 125, color: '#5AD8A6' },
    { type: 'Starter', value: 186, color: '#5D7092' },
    { type: 'Free', value: 30, color: '#FF9845' },
  ];

  const pieConfig = {
    data: tenantDistribution,
    angleField: 'value',
    colorField: 'type',
    radius: 1,
    innerRadius: 0.6,
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
    interactions: [
      { type: 'element-selected' },
      { type: 'element-active' },
    ],
    statistic: {
      title: {
        content: 'Toplam',
        style: {
          fontSize: '14px',
          color: '#8c8c8c',
        },
      },
      content: {
        style: {
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#262626',
        },
        content: '386',
      },
    },
  };

  // System Metrics
  const systemMetrics = [
    { name: 'CPU Kullanımı', value: 68, status: 'normal' },
    { name: 'RAM Kullanımı', value: 75, status: 'warning' },
    { name: 'Disk Kullanımı', value: 45, status: 'normal' },
    { name: 'Network I/O', value: 82, status: 'warning' },
    { name: 'Database Connections', value: 35, status: 'normal' },
  ];

  // Recent Activities
  const recentActivities: Activity[] = [
    {
      id: '1',
      type: 'success',
      title: 'Yeni Tenant Kaydı',
      description: 'TechCorp Solutions sisteme katıldı',
      time: '5 dakika önce',
      icon: <CheckCircleOutlined />,
    },
    {
      id: '2',
      type: 'info',
      title: 'Sistem Güncellemesi',
      description: 'v2.4.1 başarıyla yüklendi',
      time: '1 saat önce',
      icon: <InfoCircleOutlined />,
    },
    {
      id: '3',
      type: 'warning',
      title: 'Yüksek CPU Kullanımı',
      description: 'Server-3 CPU %85 üzerinde',
      time: '2 saat önce',
      icon: <WarningOutlined />,
    },
    {
      id: '4',
      type: 'error',
      title: 'Ödeme Hatası',
      description: 'ABC Corp ödeme başarısız',
      time: '3 saat önce',
      icon: <CloseCircleOutlined />,
    },
  ];

  // Top Tenants Table Columns
  const tenantColumns = [
    {
      title: 'Sıra',
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
      render: (rank: number) => {
        const icons = {
          1: <CrownOutlined style={{ color: '#ffd700' }} />,
          2: <TrophyOutlined style={{ color: '#c0c0c0' }} />,
          3: <StarOutlined style={{ color: '#cd7f32' }} />,
        };
        return (
          <Space>
            {icons[rank as keyof typeof icons]}
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
          <Avatar style={{ backgroundColor: record.color }}>
            {name.substring(0, 2).toUpperCase()}
          </Avatar>
          <div>
            <Text strong>{name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.plan}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Kullanıcı',
      dataIndex: 'users',
      key: 'users',
      render: (users: number) => (
        <Badge count={users} style={{ backgroundColor: '#52c41a' }} />
      ),
    },
    {
      title: 'Gelir',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (revenue: number) => (
        <Text strong style={{ color: '#52c41a' }}>
          ₺{revenue.toLocaleString()}
        </Text>
      ),
    },
    {
      title: 'Büyüme',
      dataIndex: 'growth',
      key: 'growth',
      render: (growth: number) => (
        <Tag color={growth > 0 ? 'success' : 'error'}>
          {growth > 0 ? '+' : ''}{growth}%
        </Tag>
      ),
    },
  ];

  const topTenantsData = [
    { rank: 1, name: 'TechCorp Solutions', plan: 'Enterprise', users: 245, revenue: 45000, growth: 15, color: '#1890ff' },
    { rank: 2, name: 'Digital Dynamics', plan: 'Professional', users: 189, revenue: 32000, growth: 12, color: '#52c41a' },
    { rank: 3, name: 'CloudFirst Inc', plan: 'Enterprise', users: 156, revenue: 28500, growth: -3, color: '#722ed1' },
    { rank: 4, name: 'DataDrive Systems', plan: 'Professional', users: 134, revenue: 24000, growth: 8, color: '#fa8c16' },
    { rank: 5, name: 'InnovateTech', plan: 'Starter', users: 98, revenue: 18000, growth: 22, color: '#eb2f96' },
  ];

  return (
    <div className="master-dashboard">
      {/* Header */}
      <div className="dashboard-header glass-morphism">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="header-left"
        >
          <Title level={2} className="gradient-text">
            <DashboardOutlined /> Master Dashboard
          </Title>
          <Text type="secondary">Sistem geneli özet ve performans metrikleri</Text>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="header-right"
        >
          <Space size="middle">
            <Segmented
              value={timeRange}
              onChange={setTimeRange}
              options={[
                { label: 'Bugün', value: 'today', icon: <CalendarOutlined /> },
                { label: 'Bu Hafta', value: 'week' },
                { label: 'Bu Ay', value: 'month' },
                { label: 'Bu Yıl', value: 'year' },
              ]}
            />
            <RangePicker />
            <Button
              icon={<ReloadOutlined spin={loading} />}
              onClick={() => setLoading(!loading)}
            >
              Yenile
            </Button>
            <Button type="primary" icon={<ExportOutlined />}>
              Rapor İndir
            </Button>
          </Space>
        </motion.div>
      </div>

      {/* Stats Cards */}
      <Row gutter={[20, 20]} className="stats-row">
        {statsData.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <StatCard {...stat} loading={loading} />
          </Col>
        ))}
      </Row>

      {/* Charts Section */}
      <Row gutter={[20, 20]} className="charts-row">
        <Col xs={24} lg={16}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card
              title={
                <Space>
                  <BarChartOutlined className="card-icon" />
                  <span>Gelir Analizi</span>
                </Space>
              }
              extra={
                <Select
                  value={selectedMetric}
                  onChange={setSelectedMetric}
                  style={{ width: 120 }}
                >
                  <Select.Option value="revenue">Gelir</Select.Option>
                  <Select.Option value="users">Kullanıcı</Select.Option>
                  <Select.Option value="growth">Büyüme</Select.Option>
                </Select>
              }
              className="chart-card glass-morphism"
            >
              {loading ? (
                <Skeleton.Node active style={{ width: '100%', height: 300 }}>
                  <BarChartOutlined style={{ fontSize: 40, color: '#bfbfbf' }} />
                </Skeleton.Node>
              ) : (
                <DualAxes {...revenueChartConfig} height={300} />
              )}
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} lg={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card
              title={
                <Space>
                  <PieChartOutlined className="card-icon" />
                  <span>Tenant Dağılımı</span>
                </Space>
              }
              className="chart-card glass-morphism"
            >
              {loading ? (
                <Skeleton.Node active style={{ width: '100%', height: 300 }}>
                  <PieChartOutlined style={{ fontSize: 40, color: '#bfbfbf' }} />
                </Skeleton.Node>
              ) : (
                <Pie {...pieConfig} height={300} />
              )}
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* System Health & Activities */}
      <Row gutter={[20, 20]} className="info-row">
        <Col xs={24} md={12}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card
              title={
                <Space>
                  <CloudServerOutlined className="card-icon" />
                  <span>Sistem Sağlığı</span>
                </Space>
              }
              extra={<Badge status="processing" text="Canlı" />}
              className="system-health-card glass-morphism"
            >
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                {systemMetrics.map((metric, index) => (
                  <div key={index} className="metric-item">
                    <div className="metric-header">
                      <Text>{metric.name}</Text>
                      <Text strong>{metric.value}%</Text>
                    </div>
                    <Progress
                      percent={metric.value}
                      strokeColor={{
                        '0%': metric.status === 'warning' ? '#faad14' : '#52c41a',
                        '100%': metric.status === 'warning' ? '#fa8c16' : '#73d13d',
                      }}
                      showInfo={false}
                    />
                  </div>
                ))}
              </Space>
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} md={12}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card
              title={
                <Space>
                  <BellOutlined className="card-icon" />
                  <span>Son Aktiviteler</span>
                </Space>
              }
              extra={
                <Button type="link" size="small">
                  Tümünü Gör
                </Button>
              }
              className="activities-card glass-morphism"
            >
              <Timeline>
                {recentActivities.map((activity) => (
                  <Timeline.Item
                    key={activity.id}
                    dot={
                      <div className={`activity-dot ${activity.type}`}>
                        {activity.icon}
                      </div>
                    }
                  >
                    <div className="activity-content">
                      <Text strong>{activity.title}</Text>
                      <br />
                      <Text type="secondary">{activity.description}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        <ClockCircleOutlined /> {activity.time}
                      </Text>
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* Top Tenants Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card
          title={
            <Space>
              <TrophyOutlined className="card-icon" style={{ color: '#faad14' }} />
              <span>En İyi 5 Tenant</span>
            </Space>
          }
          extra={
            <Space>
              <Button icon={<FilterOutlined />}>Filtrele</Button>
              <Button type="primary" icon={<ExportOutlined />}>
                Excel
              </Button>
            </Space>
          }
          className="table-card glass-morphism"
        >
          <Table
            columns={tenantColumns}
            dataSource={topTenantsData}
            pagination={false}
            loading={loading}
            rowKey="rank"
          />
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="quick-actions"
      >
        <Card className="glass-morphism gradient-border">
          <Title level={4}>Hızlı İşlemler</Title>
          <Row gutter={[16, 16]}>
            {[
              { icon: <TeamOutlined />, title: 'Yeni Tenant', color: '#1890ff' },
              { icon: <UserOutlined />, title: 'Kullanıcı Ekle', color: '#52c41a' },
              { icon: <DatabaseOutlined />, title: 'Backup Al', color: '#722ed1' },
              { icon: <SettingOutlined />, title: 'Ayarlar', color: '#fa8c16' },
            ].map((action, index) => (
              <Col xs={12} sm={6} key={index}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    className="action-button"
                    icon={action.icon}
                    size="large"
                    block
                    style={{
                      height: 80,
                      background: `linear-gradient(135deg, ${action.color}15 0%, ${action.color}05 100%)`,
                      border: `1px solid ${action.color}30`,
                    }}
                  >
                    <div style={{ marginTop: 8 }}>{action.title}</div>
                  </Button>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Card>
      </motion.div>
    </div>
  );
};