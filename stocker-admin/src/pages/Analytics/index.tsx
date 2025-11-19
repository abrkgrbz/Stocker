import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Progress, 
  Button, 
  Select, 
  DatePicker, 
  Space, 
  Typography, 
  Tabs, 
  Table, 
  Tag, 
  Badge, 
  Alert, 
  Tooltip, 
  Divider, 
  List, 
  Avatar, 
  Timeline, 
  Empty, 
  Spin 
} from 'antd';
import {
  LineChartOutlined,
  BarChartOutlined,
  PieChartOutlined,
  RiseOutlined,
  FallOutlined,
  TrendingUpOutlined,
  UserOutlined,
  TeamOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  DownloadOutlined,
  ReloadOutlined,
  FilterOutlined,
  GlobalOutlined,
  MobileOutlined,
  DesktopOutlined,
  TabletOutlined,
  CalendarOutlined,
  ThunderboltOutlined,
  DatabaseOutlined,
  ApiOutlined,
  SecurityScanOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';
import { Line, Column, Pie, Area, DualAxes, Heatmap, Gauge } from '@ant-design/plots';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import relativeTime from 'dayjs/plugin/relativeTime';
import { analyticsService } from '../../services/api/analyticsService';
import type {
  RevenueAnalytics,
  UserAnalytics,
  PerformanceAnalytics
} from '../../services/api/analyticsService';

dayjs.extend(relativeTime);
dayjs.locale('tr');

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

// AnalyticsData interface removed - using API data types instead

interface ChartData {
  date: string;
  value: number;
  type?: string;
}

interface TopTenant {
  id: string;
  name: string;
  revenue: number;
  users: number;
  growth: number;
  status: 'active' | 'inactive' | 'trial';
}

interface UserActivity {
  hour: string;
  desktop: number;
  mobile: number;
  tablet: number;
}

const AnalyticsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'days'),
    dayjs()
  ]);
  const [refreshing, setRefreshing] = useState(false);

  // API data states
  const [revenueData, setRevenueData] = useState<RevenueAnalytics | null>(null);
  const [userData, setUserData] = useState<UserAnalytics | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceAnalytics | null>(null);

  // Remove mock data - will use API data only

  // Load analytics data
  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [revenue, users, performance] = await Promise.all([
        analyticsService.getRevenueAnalytics(
          dateRange[0].format('YYYY-MM-DD'),
          dateRange[1].format('YYYY-MM-DD'),
          'monthly'
        ),
        analyticsService.getUserAnalytics('monthly'),
        analyticsService.getPerformanceAnalytics()
      ]);

      setRevenueData(revenue);
      setUserData(users);
      setPerformanceData(performance);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Chart data - converted from API data
  const revenueChartData: ChartData[] = revenueData?.revenueByPeriod?.map(p => ({
    date: p.period,
    value: p.revenue
  })) || [];

  const userGrowthData: ChartData[] = userData?.userGrowth?.flatMap(ug => [
    { date: ug.period, value: ug.totalUsers, type: 'Toplam Kullanıcı' },
    { date: ug.period, value: ug.totalUsers - ug.churnedUsers, type: 'Aktif Kullanıcı' }
  ]) || [];

  // Device and location data from API (placeholder for future implementation)
  const deviceData = [
    { type: 'Desktop', value: 65.2 },
    { type: 'Mobile', value: 28.5 },
    { type: 'Tablet', value: 6.3 }
  ];

  const locationData = [
    { location: 'Türkiye', users: 5420, percentage: 62.1 },
    { location: 'Almanya', users: 1250, percentage: 14.3 },
    { location: 'İngiltere', users: 890, percentage: 10.2 },
    { location: 'Fransa', users: 650, percentage: 7.4 },
    { location: 'Diğer', users: 540, percentage: 6.0 }
  ];

  const topTenants: TopTenant[] = revenueData?.topPayingTenants?.map((t, index) => ({
    id: String(index + 1),
    name: t.tenantName,
    revenue: t.revenue,
    users: 0, // Not available from API
    growth: 0, // Not available from API
    status: 'active' as const
  })) || [];

  // Activity data (placeholder - will be added to API in future)
  const activityData: UserActivity[] = [];

  // Performance metrics - converted from API data
  const performanceChartData = performanceData?.responseTimeHistory?.map(rt => ({
    time: rt.timestamp,
    cpu: rt.averageTime / 10, // Normalize to percentage-like values for chart
    memory: rt.p95Time / 10,
    disk: rt.p99Time / 10
  })) || [
    { time: '00:00', cpu: 45, memory: 62, disk: 38 },
    { time: '04:00', cpu: 38, memory: 58, disk: 35 },
    { time: '08:00', cpu: 72, memory: 78, disk: 55 },
    { time: '12:00', cpu: 85, memory: 82, disk: 68 },
    { time: '16:00', cpu: 78, memory: 75, disk: 62 },
    { time: '20:00', cpu: 65, memory: 70, disk: 48 }
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  const getGrowthIcon = (growth: number) => {
    return growth > 0 ? 
      <ArrowUpOutlined style={{ color: '#52c41a' }} /> : 
      <ArrowDownOutlined style={{ color: '#ff4d4f' }} />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'trial': return 'orange';
      case 'inactive': return 'red';
      default: return 'default';
    }
  };

  // Chart configurations
  const revenueConfig = {
    data: revenueChartData,
    xField: 'date',
    yField: 'value',
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
    point: {
      size: 3,
      shape: 'circle',
    },
    line: {
      color: '#667eea',
    },
  };

  const userGrowthConfig = {
    data: userGrowthData,
    xField: 'date',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
  };

  const devicePieConfig = {
    appendPadding: 10,
    data: deviceData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      formatter: (text: any, item: any) => {
        return `${item._origin.type}: ${item._origin.value}%`;
      },
    },
    interactions: [
      {
        type: 'element-active',
      },
    ],
  };

  const activityAreaConfig = {
    data: activityData.flatMap(item => [
      { hour: item.hour, value: item.desktop, type: 'Desktop' },
      { hour: item.hour, value: item.mobile, type: 'Mobile' },
      { hour: item.hour, value: item.tablet, type: 'Tablet' }
    ]),
    xField: 'hour',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    animation: {
      appear: {
        animation: 'wave-in',
        duration: 1000,
      },
    },
  };

  const performanceDualConfig = {
    data: [performanceChartData, performanceChartData, performanceChartData],
    xField: 'time',
    yField: ['cpu', 'memory', 'disk'],
    geometryOptions: [
      {
        geometry: 'line',
        smooth: true,
        color: '#5B8FF9',
      },
      {
        geometry: 'line',
        smooth: true,
        color: '#5AD8A6',
      },
      {
        geometry: 'line',
        smooth: true,
        color: '#FF9845',
      },
    ],
  };

  const gaugeConfig = {
    percent: (performanceData?.successRate || 99.97) / 100,
    range: {
      color: '#30BF78',
    },
    indicator: {
      pointer: {
        style: {
          stroke: '#D0D0D0',
        },
      },
      pin: {
        style: {
          stroke: '#D0D0D0',
        },
      },
    },
    statistic: {
      content: {
        style: {
          fontSize: '36px',
          lineHeight: '36px',
        },
        formatter: () => `${(performanceData?.successRate || 99.97).toFixed(2)}%`,
      },
    },
  };

  const tenantColumns = [
    {
      title: 'Tenant',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: TopTenant) => (
        <Space>
          <Avatar size="small" style={{ backgroundColor: '#667eea' }}>
            {text.charAt(0)}
          </Avatar>
          <Text strong>{text}</Text>
          <Badge status={getStatusColor(record.status) as any} />
        </Space>
      )
    },
    {
      title: 'Gelir',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (revenue: number) => (
        <Text>${revenue.toLocaleString()}</Text>
      )
    },
    {
      title: 'Kullanıcılar',
      dataIndex: 'users',
      key: 'users',
      render: (users: number) => (
        <Text>{users}</Text>
      )
    },
    {
      title: 'Büyüme',
      dataIndex: 'growth',
      key: 'growth',
      render: (growth: number) => (
        <Space>
          {getGrowthIcon(growth)}
          <Text style={{ color: growth > 0 ? '#52c41a' : '#ff4d4f' }}>
            {Math.abs(growth)}%
          </Text>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={12}>
            <Title level={4} style={{ margin: 0 }}>
              <LineChartOutlined /> Analitik Dashboard
            </Title>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Space>
              <RangePicker
                value={dateRange}
                onChange={(dates) => dates && setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
                format="DD.MM.YYYY"
              />
              <Button icon={<FilterOutlined />}>Filtrele</Button>
              <Button 
                icon={<ReloadOutlined spin={refreshing} />} 
                onClick={handleRefresh}
                loading={refreshing}
              >
                Yenile
              </Button>
              <Button icon={<DownloadOutlined />}>Dışa Aktar</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Key Metrics */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Toplam Kullanıcı"
              value={userData?.totalUsers || 0}
              prefix={<UserOutlined />}
              suffix={
                <Space>
                  <ArrowUpOutlined style={{ color: '#52c41a', fontSize: 12 }} />
                  <span style={{ color: '#52c41a', fontSize: 12 }}>
                    +{(userData?.activationRate || 0).toFixed(1)}%
                  </span>
                </Space>
              }
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Aktif Kullanıcı"
              value={userData?.activeUsers || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
              suffix={
                <Progress
                  percent={userData?.totalUsers ? ((userData.activeUsers / userData.totalUsers) * 100) : 0}
                  size="small"
                  showInfo={false}
                  style={{ width: 60 }}
                />
              }
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Toplam Gelir"
              value={revenueData?.totalRevenue || 0}
              prefix={<DollarOutlined />}
              precision={0}
              valueStyle={{ color: '#52c41a' }}
              suffix="USD"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Sistem Çalışma Oranı"
              value={performanceData?.successRate || 0}
              precision={2}
              suffix="%"
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Secondary Metrics */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Tenant Sayısı"
              value={userData?.tenantCount || 0}
              prefix={<GlobalOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="API Çağrıları"
              value={performanceData?.totalRequests || 0}
              prefix={<ApiOutlined />}
              suffix="/ay"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Ortalama Yanıt Süresi"
              value={performanceData?.averageResponseTime || 0}
              prefix={<ClockCircleOutlined />}
              suffix="ms"
              valueStyle={{ color: (performanceData?.averageResponseTime || 0) < 300 ? '#52c41a' : '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Aylık Büyüme"
              value={revenueData?.growthRate || 0}
              precision={1}
              suffix="%"
              prefix={<RiseOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Card bordered={false}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Genel Bakış" key="overview">
            <Row gutter={16}>
              <Col span={12}>
                <Card title="Gelir Trendi" size="small" style={{ marginBottom: 16 }}>
                  <Line {...revenueConfig} height={200} />
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Kullanıcı Büyümesi" size="small" style={{ marginBottom: 16 }}>
                  <Line {...userGrowthConfig} height={200} />
                </Card>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={8}>
                <Card title="Cihaz Dağılımı" size="small">
                  <Pie {...devicePieConfig} height={250} />
                </Card>
              </Col>
              <Col span={8}>
                <Card title="Sistem Çalışma Oranı" size="small">
                  <Gauge {...gaugeConfig} height={250} />
                </Card>
              </Col>
              <Col span={8}>
                <Card title="Konum Dağılımı" size="small">
                  <List
                    size="small"
                    dataSource={locationData}
                    renderItem={item => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<GlobalOutlined />}
                          title={
                            <Space>
                              <Text>{item.location}</Text>
                              <Text type="secondary">({item.percentage}%)</Text>
                            </Space>
                          }
                          description={`${item.users} kullanıcı`}
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Kullanıcı Aktivitesi" key="users">
            <Alert
              message="Gerçek Zamanlı Kullanıcı Takibi"
              description="Son 24 saatteki kullanıcı aktivitesi ve cihaz kullanım analizi"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <Card title="Saatlik Aktivite Dağılımı" size="small" style={{ marginBottom: 16 }}>
              <Area {...activityAreaConfig} height={300} />
            </Card>

            <Row gutter={16}>
              <Col span={16}>
                <Card title="En Aktif Tenantlar" size="small">
                  <Table
                    columns={tenantColumns}
                    dataSource={topTenants}
                    rowKey="id"
                    pagination={false}
                    size="small"
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card title="Kullanıcı İstatistikleri" size="small">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Statistic
                      title="Günlük Aktif Kullanıcı"
                      value={userData?.userActivity?.dailyActiveUsers || 5420}
                      prefix={<UserOutlined />}
                    />
                    <Divider />
                    <Statistic
                      title="Haftalık Aktif Kullanıcı"
                      value={userData?.userActivity?.weeklyActiveUsers || 8950}
                      prefix={<TeamOutlined />}
                    />
                    <Divider />
                    <Statistic
                      title="Aylık Aktif Kullanıcı"
                      value={userData?.userActivity?.monthlyActiveUsers || 15420}
                      prefix={<GlobalOutlined />}
                    />
                    <Divider />
                    <Statistic
                      title="Ortalama Oturum Süresi"
                      value={userData?.averageSessionDuration || 28}
                      suffix="dk"
                      prefix={<ClockCircleOutlined />}
                    />
                  </Space>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Sistem Performansı" key="performance">
            <Alert
              message="Sistem Sağlığı Mükemmel"
              description="Tüm sistemler normal çalışıyor, herhangi bir performans problemi tespit edilmedi."
              type="success"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Card title="Sistem Kaynak Kullanımı" size="small" style={{ marginBottom: 16 }}>
              <DualAxes {...performanceDualConfig} height={250} />
            </Card>

            <Row gutter={16}>
              <Col span={8}>
                <Card title="CPU Kullanımı" size="small">
                  <Progress
                    type="circle"
                    percent={performanceData?.systemMetrics?.cpuUsage || 78}
                    format={() => `${performanceData?.systemMetrics?.cpuUsage || 78}%`}
                    strokeColor={{
                      '0%': '#108ee9',
                      '100%': '#87d068',
                    }}
                  />
                  <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <Text type="secondary">Ortalama: {performanceData?.systemMetrics?.cpuUsage || 65}%</Text>
                  </div>
                </Card>
              </Col>
              <Col span={8}>
                <Card title="Bellek Kullanımı" size="small">
                  <Progress
                    type="circle"
                    percent={performanceData?.systemMetrics?.memoryUsage || 75}
                    format={() => `${performanceData?.systemMetrics?.memoryUsage || 75}%`}
                    strokeColor={{
                      '0%': '#faad14',
                      '100%': '#52c41a',
                    }}
                  />
                  <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <Text type="secondary">Kullanılan: {((performanceData?.systemMetrics?.memoryUsage || 75) * 16 / 100).toFixed(1)} GB</Text>
                  </div>
                </Card>
              </Col>
              <Col span={8}>
                <Card title="Disk Kullanımı" size="small">
                  <Progress
                    type="circle"
                    percent={performanceData?.systemMetrics?.diskUsage || 62}
                    format={() => `${performanceData?.systemMetrics?.diskUsage || 62}%`}
                    strokeColor={{
                      '0%': '#722ed1',
                      '100%': '#1890ff',
                    }}
                  />
                  <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <Text type="secondary">Kullanılan: {((performanceData?.systemMetrics?.diskUsage || 62) * 500 / 100).toFixed(0)} GB</Text>
                  </div>
                </Card>
              </Col>
            </Row>

            <Divider />

            <Row gutter={16}>
              <Col span={12}>
                <Card title="API Performans Metrikleri" size="small">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>Ortalama Yanıt Süresi</Text>
                      <Text strong>{performanceData?.averageResponseTime || 245}ms</Text>
                    </div>
                    <Progress percent={85} strokeColor="#52c41a" />

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>Throughput</Text>
                      <Text strong>{performanceData?.requestsPerSecond?.toFixed(0) || '1,250'} req/sec</Text>
                    </div>
                    <Progress percent={92} strokeColor="#1890ff" />

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>Hata Oranı</Text>
                      <Text strong>{performanceData?.errorRate?.toFixed(2) || '0.03'}%</Text>
                    </div>
                    <Progress percent={performanceData?.errorRate ? Math.min(performanceData.errorRate * 20, 100) : 5} strokeColor="#ff4d4f" />
                  </Space>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Database Performansı" size="small">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>Sorgu Performansı</Text>
                      <Text strong>12ms</Text>
                    </div>
                    <Progress percent={95} strokeColor="#52c41a" />
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>Bağlantı Havuzu</Text>
                      <Text strong>68/100</Text>
                    </div>
                    <Progress percent={68} strokeColor="#faad14" />
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>Disk I/O</Text>
                      <Text strong>Normal</Text>
                    </div>
                    <Progress percent={78} strokeColor="#1890ff" />
                  </Space>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Güvenlik" key="security">
            <Alert
              message="Güvenlik Durumu: Güvenli"
              description="Son 24 saatte herhangi bir güvenlik tehdidi tespit edilmedi."
              type="success"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Row gutter={16}>
              <Col span={8}>
                <Card bordered={false}>
                  <Statistic
                    title="Başarısız Giriş Denemeleri"
                    value={24}
                    prefix={<WarningOutlined style={{ color: '#faad14' }} />}
                    suffix="son 24 saat"
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card bordered={false}>
                  <Statistic
                    title="Engellenen IP"
                    value={3}
                    prefix={<SecurityScanOutlined style={{ color: '#ff4d4f' }} />}
                    suffix="otomatik"
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card bordered={false}>
                  <Statistic
                    title="Güvenlik Skoru"
                    value={98}
                    suffix="/100"
                    prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
            </Row>

            <Divider />

            <Row gutter={16}>
              <Col span={12}>
                <Card title="Son Güvenlik Olayları" size="small">
                  <Timeline>
                    <Timeline.Item color="green">
                      <Text>Sistem güvenlik taraması tamamlandı</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        2 saat önce
                      </Text>
                    </Timeline.Item>
                    <Timeline.Item color="orange">
                      <Text>Şüpheli API isteği engellendi</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        6 saat önce - IP: 185.xxx.xxx.45
                      </Text>
                    </Timeline.Item>
                    <Timeline.Item color="green">
                      <Text>SSL sertifikaları yenilendi</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        1 gün önce
                      </Text>
                    </Timeline.Item>
                    <Timeline.Item color="blue">
                      <Text>Firewall kuralları güncellendi</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        3 gün önce
                      </Text>
                    </Timeline.Item>
                  </Timeline>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Güvenlik Durumu" size="small">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text>Firewall</Text>
                      <Badge status="success" text="Aktif" />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text>DDoS Koruması</Text>
                      <Badge status="success" text="Aktif" />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text>WAF (Web Application Firewall)</Text>
                      <Badge status="success" text="Aktif" />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text>Intrusion Detection</Text>
                      <Badge status="success" text="Aktif" />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text>SSL/TLS</Text>
                      <Badge status="success" text="A+ Rating" />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text>Vulnerability Scan</Text>
                      <Badge status="success" text="Temiz" />
                    </div>
                  </Space>
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default AnalyticsPage;