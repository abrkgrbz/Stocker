import React, { useState } from 'react';
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

dayjs.extend(relativeTime);
dayjs.locale('tr');

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  monthlyGrowth: number;
  tenantCount: number;
  apiCalls: number;
  avgResponseTime: number;
  systemUptime: number;
}

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

  const [analyticsData] = useState<AnalyticsData>({
    totalUsers: 15420,
    activeUsers: 8950,
    totalRevenue: 125000,
    monthlyGrowth: 12.5,
    tenantCount: 234,
    apiCalls: 1250000,
    avgResponseTime: 245,
    systemUptime: 99.97
  });

  // Chart data
  const revenueData: ChartData[] = [
    { date: '2024-01-01', value: 98000 },
    { date: '2024-01-02', value: 102000 },
    { date: '2024-01-03', value: 105000 },
    { date: '2024-01-04', value: 108000 },
    { date: '2024-01-05', value: 112000 },
    { date: '2024-01-06', value: 115000 },
    { date: '2024-01-07', value: 118000 },
    { date: '2024-01-08', value: 121000 },
    { date: '2024-01-09', value: 125000 },
  ];

  const userGrowthData: ChartData[] = [
    { date: '2024-01-01', value: 12500, type: 'Toplam Kullanıcı' },
    { date: '2024-01-02', value: 12650, type: 'Toplam Kullanıcı' },
    { date: '2024-01-03', value: 12800, type: 'Toplam Kullanıcı' },
    { date: '2024-01-04', value: 12950, type: 'Toplam Kullanıcı' },
    { date: '2024-01-05', value: 13100, type: 'Toplam Kullanıcı' },
    { date: '2024-01-06', value: 13250, type: 'Toplam Kullanıcı' },
    { date: '2024-01-07', value: 13400, type: 'Toplam Kullanıcı' },
    { date: '2024-01-08', value: 13550, type: 'Toplam Kullanıcı' },
    { date: '2024-01-09', value: 13700, type: 'Toplam Kullanıcı' },
    { date: '2024-01-01', value: 8200, type: 'Aktif Kullanıcı' },
    { date: '2024-01-02', value: 8350, type: 'Aktif Kullanıcı' },
    { date: '2024-01-03', value: 8500, type: 'Aktif Kullanıcı' },
    { date: '2024-01-04', value: 8650, type: 'Aktif Kullanıcı' },
    { date: '2024-01-05', value: 8800, type: 'Aktif Kullanıcı' },
    { date: '2024-01-06', value: 8950, type: 'Aktif Kullanıcı' },
    { date: '2024-01-07', value: 9100, type: 'Aktif Kullanıcı' },
    { date: '2024-01-08', value: 9250, type: 'Aktif Kullanıcı' },
    { date: '2024-01-09', value: 9400, type: 'Aktif Kullanıcı' },
  ];

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

  const topTenants: TopTenant[] = [
    {
      id: '1',
      name: 'ABC Corp',
      revenue: 15000,
      users: 450,
      growth: 15.2,
      status: 'active'
    },
    {
      id: '2',
      name: 'XYZ Ltd',
      revenue: 12500,
      users: 380,
      growth: 8.7,
      status: 'active'
    },
    {
      id: '3',
      name: 'Tech Solutions',
      revenue: 10800,
      users: 320,
      growth: -2.1,
      status: 'active'
    },
    {
      id: '4',
      name: 'Digital Agency',
      revenue: 9200,
      users: 275,
      growth: 22.3,
      status: 'trial'
    },
    {
      id: '5',
      name: 'StartupCo',
      revenue: 7500,
      users: 198,
      growth: 45.6,
      status: 'active'
    }
  ];

  const activityData: UserActivity[] = [
    { hour: '00:00', desktop: 120, mobile: 80, tablet: 20 },
    { hour: '04:00', desktop: 85, mobile: 60, tablet: 15 },
    { hour: '08:00', desktop: 450, mobile: 200, tablet: 50 },
    { hour: '12:00', desktop: 680, mobile: 350, tablet: 70 },
    { hour: '16:00', desktop: 520, mobile: 280, tablet: 55 },
    { hour: '20:00', desktop: 280, mobile: 180, tablet: 35 }
  ];

  // Performance metrics
  const performanceData = [
    { time: '00:00', cpu: 45, memory: 62, disk: 38 },
    { time: '04:00', cpu: 38, memory: 58, disk: 35 },
    { time: '08:00', cpu: 72, memory: 78, disk: 55 },
    { time: '12:00', cpu: 85, memory: 82, disk: 68 },
    { time: '16:00', cpu: 78, memory: 75, disk: 62 },
    { time: '20:00', cpu: 65, memory: 70, disk: 48 }
  ];

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
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
    data: revenueData,
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
    data: [performanceData, performanceData, performanceData],
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
    percent: analyticsData.systemUptime / 100,
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
        formatter: () => `${analyticsData.systemUptime}%`,
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
              value={analyticsData.totalUsers}
              prefix={<UserOutlined />}
              suffix={
                <Space>
                  <ArrowUpOutlined style={{ color: '#52c41a', fontSize: 12 }} />
                  <span style={{ color: '#52c41a', fontSize: 12 }}>+12.5%</span>
                </Space>
              }
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Aktif Kullanıcı"
              value={analyticsData.activeUsers}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
              suffix={
                <Progress 
                  percent={(analyticsData.activeUsers / analyticsData.totalUsers) * 100} 
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
              value={analyticsData.totalRevenue}
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
              value={analyticsData.systemUptime}
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
              value={analyticsData.tenantCount}
              prefix={<GlobalOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="API Çağrıları"
              value={analyticsData.apiCalls}
              prefix={<ApiOutlined />}
              suffix="/ay"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Ortalama Yanıt Süresi"
              value={analyticsData.avgResponseTime}
              prefix={<ClockCircleOutlined />}
              suffix="ms"
              valueStyle={{ color: analyticsData.avgResponseTime < 300 ? '#52c41a' : '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Aylık Büyüme"
              value={analyticsData.monthlyGrowth}
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
                      value={5420}
                      prefix={<UserOutlined />}
                    />
                    <Divider />
                    <Statistic
                      title="Haftalık Aktif Kullanıcı"
                      value={8950}
                      prefix={<TeamOutlined />}
                    />
                    <Divider />
                    <Statistic
                      title="Aylık Aktif Kullanıcı"
                      value={15420}
                      prefix={<GlobalOutlined />}
                    />
                    <Divider />
                    <Statistic
                      title="Ortalama Oturum Süresi"
                      value={28}
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
                    percent={78}
                    format={() => '78%'}
                    strokeColor={{
                      '0%': '#108ee9',
                      '100%': '#87d068',
                    }}
                  />
                  <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <Text type="secondary">Ortalama: 65%</Text>
                  </div>
                </Card>
              </Col>
              <Col span={8}>
                <Card title="Bellek Kullanımı" size="small">
                  <Progress
                    type="circle"
                    percent={75}
                    format={() => '75%'}
                    strokeColor={{
                      '0%': '#faad14',
                      '100%': '#52c41a',
                    }}
                  />
                  <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <Text type="secondary">Kullanılan: 12.8 GB</Text>
                  </div>
                </Card>
              </Col>
              <Col span={8}>
                <Card title="Disk Kullanımı" size="small">
                  <Progress
                    type="circle"
                    percent={62}
                    format={() => '62%'}
                    strokeColor={{
                      '0%': '#722ed1',
                      '100%': '#1890ff',
                    }}
                  />
                  <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <Text type="secondary">Kullanılan: 285 GB</Text>
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
                      <Text strong>245ms</Text>
                    </div>
                    <Progress percent={85} strokeColor="#52c41a" />
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>Throughput</Text>
                      <Text strong>1,250 req/sec</Text>
                    </div>
                    <Progress percent={92} strokeColor="#1890ff" />
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>Hata Oranı</Text>
                      <Text strong>0.03%</Text>
                    </div>
                    <Progress percent={5} strokeColor="#ff4d4f" />
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