import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Tabs,
  Table,
  Tag,
  Select,
  DatePicker,
  Progress,
  Statistic,
  Timeline,
  List,
  Badge,
  Avatar,
  Tooltip,
  message,
  Radio,
  Switch,
  Form,
  Divider,
  Alert,
} from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import {
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  EyeOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  CalendarOutlined,
  DownloadOutlined,
  FilterOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
  MobileOutlined,
  DesktopOutlined,
  ChromeOutlined,
  ExportOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface AnalyticsData {
  period: string;
  users: number;
  sessions: number;
  pageViews: number;
  revenue: number;
  orders: number;
  bounceRate: number;
  avgSessionDuration: number;
  conversionRate: number;
}

interface TopPage {
  path: string;
  views: number;
  uniqueViews: number;
  avgTimeOnPage: number;
  bounceRate: number;
}

interface UserSegment {
  name: string;
  count: number;
  percentage: number;
  growth: number;
  color: string;
}

interface GeographicData {
  country: string;
  code: string;
  users: number;
  sessions: number;
  percentage: number;
}

const TenantAnalytics: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState<string>('last7days');
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // Mock data
  const overviewStats = {
    totalUsers: 15420,
    totalSessions: 28945,
    totalPageViews: 127834,
    totalRevenue: 89234.50,
    avgSessionDuration: 245,
    bounceRate: 32.4,
    newUsersRate: 67.8,
    returningUsersRate: 32.2,
    conversionRate: 3.2,
    monthlyGrowth: 12.5,
  };

  const mockAnalyticsData: AnalyticsData[] = [
    {
      period: '2024-12-01',
      users: 1250,
      sessions: 2340,
      pageViews: 8920,
      revenue: 5670.30,
      orders: 45,
      bounceRate: 28.5,
      avgSessionDuration: 280,
      conversionRate: 1.9,
    },
    {
      period: '2024-12-02',
      users: 1380,
      sessions: 2580,
      pageViews: 9650,
      revenue: 7240.80,
      orders: 52,
      bounceRate: 31.2,
      avgSessionDuration: 265,
      conversionRate: 2.0,
    },
    {
      period: '2024-12-03',
      users: 1420,
      sessions: 2720,
      pageViews: 10230,
      revenue: 8950.20,
      orders: 67,
      bounceRate: 29.8,
      avgSessionDuration: 295,
      conversionRate: 2.5,
    },
  ];

  const mockTopPages: TopPage[] = [
    {
      path: '/',
      views: 25420,
      uniqueViews: 18340,
      avgTimeOnPage: 125,
      bounceRate: 25.4,
    },
    {
      path: '/products',
      views: 18920,
      uniqueViews: 14560,
      avgTimeOnPage: 180,
      bounceRate: 42.1,
    },
    {
      path: '/about',
      views: 12340,
      uniqueViews: 9870,
      avgTimeOnPage: 95,
      bounceRate: 58.3,
    },
    {
      path: '/contact',
      views: 8450,
      uniqueViews: 6720,
      avgTimeOnPage: 75,
      bounceRate: 67.8,
    },
    {
      path: '/pricing',
      views: 6780,
      uniqueViews: 5420,
      avgTimeOnPage: 220,
      bounceRate: 35.2,
    },
  ];

  const mockUserSegments: UserSegment[] = [
    {
      name: 'Premium Kullanıcılar',
      count: 2340,
      percentage: 15.2,
      growth: 8.5,
      color: '#1890ff',
    },
    {
      name: 'Aktif Kullanıcılar',
      count: 8920,
      percentage: 57.8,
      growth: 12.3,
      color: '#52c41a',
    },
    {
      name: 'Yeni Kullanıcılar',
      count: 3450,
      percentage: 22.4,
      growth: -2.1,
      color: '#faad14',
    },
    {
      name: 'İnaktif Kullanıcılar',
      count: 710,
      percentage: 4.6,
      growth: -15.8,
      color: '#ff4d4f',
    },
  ];

  const mockGeographicData: GeographicData[] = [
    {
      country: 'Türkiye',
      code: 'TR',
      users: 8920,
      sessions: 15640,
      percentage: 57.8,
    },
    {
      country: 'Almanya',
      code: 'DE',
      users: 2340,
      sessions: 4120,
      percentage: 15.2,
    },
    {
      country: 'ABD',
      code: 'US',
      users: 1890,
      sessions: 3450,
      percentage: 12.3,
    },
    {
      country: 'Fransa',
      code: 'FR',
      users: 1120,
      sessions: 2180,
      percentage: 7.3,
    },
    {
      country: 'İngiltere',
      code: 'GB',
      users: 890,
      sessions: 1640,
      percentage: 5.8,
    },
  ];

  const deviceData = [
    { name: 'Desktop', value: 45.2, icon: <DesktopOutlined /> },
    { name: 'Mobile', value: 38.7, icon: <MobileOutlined /> },
    { name: 'Tablet', value: 16.1, icon: <GlobalOutlined /> },
  ];

  const browserData = [
    { name: 'Chrome', value: 52.3, icon: <ChromeOutlined /> },
    { name: 'Safari', value: 28.7, icon: <GlobalOutlined /> },
    { name: 'Firefox', value: 12.8, icon: <GlobalOutlined /> },
    { name: 'Diğer', value: 6.2, icon: <GlobalOutlined /> },
  ];

  const osData = [
    { name: 'Windows', value: 48.5, icon: <DesktopOutlined /> },
    { name: 'iOS', value: 25.3, icon: <MobileOutlined /> },
    { name: 'Android', value: 18.7, icon: <MobileOutlined /> },
    { name: 'macOS', value: 7.5, icon: <DesktopOutlined /> },
  ];

  const handleDateRangeChange = (range: string) => {
    setDateRange(range);
    message.success(`Tarih aralığı güncellendi: ${range}`);
  };

  const handleExportReport = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    message.success('Rapor başarıyla dışa aktarıldı');
    setLoading(false);
  };

  const OverviewTab = () => (
    <div>
      {/* Key Metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Toplam Kullanıcı"
              value={overviewStats.totalUsers}
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
              suffix={
                <Tag color="green">
                  +{overviewStats.monthlyGrowth}%
                </Tag>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Toplam Oturum"
              value={overviewStats.totalSessions}
              prefix={<EyeOutlined style={{ color: '#52c41a' }} />}
              suffix={
                <Tooltip title="Geçen aya göre %8.2 artış">
                  <ArrowUpOutlined style={{ color: '#52c41a' }} />
                </Tooltip>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Toplam Gelir"
              value={overviewStats.totalRevenue}
              precision={2}
              prefix={<DollarOutlined style={{ color: '#faad14' }} />}
              suffix="₺"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Dönüşüm Oranı"
              value={overviewStats.conversionRate}
              precision={1}
              suffix="%"
              prefix={<ArrowUpOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Secondary Metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic
              title="Ortalama Oturum Süresi"
              value={overviewStats.avgSessionDuration}
              suffix="sn"
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic
              title="Çıkma Oranı"
              value={overviewStats.bounceRate}
              precision={1}
              suffix="%"
              valueStyle={{ 
                color: overviewStats.bounceRate > 40 ? '#ff4d4f' : '#52c41a' 
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic
              title="Yeni Kullanıcı"
              value={overviewStats.newUsersRate}
              precision={1}
              suffix="%"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Statistic
              title="Geri Dönen"
              value={overviewStats.returningUsersRate}
              precision={1}
              suffix="%"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]}>
        <Col span={16}>
          <Card title="Trafik Trendi" extra={
            <Space>
              <Select defaultValue="users" size="small">
                <Option value="users">Kullanıcılar</Option>
                <Option value="sessions">Oturumlar</Option>
                <Option value="pageviews">Sayfa Görüntüleme</Option>
              </Select>
            </Space>
          }>
            <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Space direction="vertical" align="center">
                <LineChartOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                <Text type="secondary">Grafik burada görüntülenecek</Text>
              </Space>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Kullanıcı Segmentleri">
            <List
              dataSource={mockUserSegments}
              renderItem={(segment) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        style={{ backgroundColor: segment.color }} 
                        size="small"
                      >
                        {segment.count.toString().substring(0, 1)}
                      </Avatar>
                    }
                    title={
                      <Space>
                        <Text>{segment.name}</Text>
                        <Text type="secondary">({segment.percentage}%)</Text>
                      </Space>
                    }
                    description={
                      <Space>
                        <Text strong>{segment.count.toLocaleString()}</Text>
                        <Tag 
                          color={segment.growth > 0 ? 'green' : 'red'}
                          size="small"
                        >
                          {segment.growth > 0 ? '+' : ''}{segment.growth}%
                        </Tag>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );

  const TrafficTab = () => (
    <Row gutter={[16, 16]}>
      <Col span={16}>
        <Card title="En Popüler Sayfalar">
          <Table
            dataSource={mockTopPages}
            size="small"
            pagination={false}
            columns={[
              {
                title: 'Sayfa',
                dataIndex: 'path',
                key: 'path',
                render: (path: string) => <Text code>{path}</Text>,
              },
              {
                title: 'Görüntülenme',
                dataIndex: 'views',
                key: 'views',
                render: (views: number) => views.toLocaleString(),
                sorter: (a, b) => a.views - b.views,
              },
              {
                title: 'Benzersiz',
                dataIndex: 'uniqueViews',
                key: 'uniqueViews',
                render: (uniqueViews: number) => uniqueViews.toLocaleString(),
              },
              {
                title: 'Ort. Süre',
                dataIndex: 'avgTimeOnPage',
                key: 'avgTimeOnPage',
                render: (time: number) => `${time}sn`,
              },
              {
                title: 'Çıkma Oranı',
                dataIndex: 'bounceRate',
                key: 'bounceRate',
                render: (rate: number) => (
                  <Progress
                    percent={rate}
                    size="small"
                    format={() => `${rate}%`}
                    strokeColor={rate > 50 ? '#ff4d4f' : rate > 30 ? '#faad14' : '#52c41a'}
                  />
                ),
              },
            ]}
          />
        </Card>
      </Col>
      <Col span={8}>
        <Card title="Coğrafi Dağılım">
          <List
            dataSource={mockGeographicData}
            renderItem={(geo) => (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <Badge count={geo.code} style={{ backgroundColor: '#1890ff' }} />
                  }
                  title={geo.country}
                  description={
                    <Space direction="vertical" size={0}>
                      <Text>{geo.users.toLocaleString()} kullanıcı</Text>
                      <Progress 
                        percent={geo.percentage} 
                        size="small" 
                        showInfo={false}
                      />
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      </Col>
    </Row>
  );

  const DeviceTab = () => (
    <Row gutter={[16, 16]}>
      <Col span={8}>
        <Card title="Cihaz Türü">
          <List
            dataSource={deviceData}
            renderItem={(device) => (
              <List.Item>
                <List.Item.Meta
                  avatar={device.icon}
                  title={device.name}
                  description={
                    <Space direction="vertical" size={0} style={{ width: '100%' }}>
                      <Progress 
                        percent={device.value} 
                        format={(percent) => `${percent}%`}
                      />
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      </Col>
      <Col span={8}>
        <Card title="Tarayıcı">
          <List
            dataSource={browserData}
            renderItem={(browser) => (
              <List.Item>
                <List.Item.Meta
                  avatar={browser.icon}
                  title={browser.name}
                  description={
                    <Space direction="vertical" size={0} style={{ width: '100%' }}>
                      <Progress 
                        percent={browser.value} 
                        format={(percent) => `${percent}%`}
                      />
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      </Col>
      <Col span={8}>
        <Card title="İşletim Sistemi">
          <List
            dataSource={osData}
            renderItem={(os) => (
              <List.Item>
                <List.Item.Meta
                  avatar={os.icon}
                  title={os.name}
                  description={
                    <Space direction="vertical" size={0} style={{ width: '100%' }}>
                      <Progress 
                        percent={os.value} 
                        format={(percent) => `${percent}%`}
                      />
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      </Col>
    </Row>
  );

  const ReportsTab = () => (
    <Card title="Raporlar">
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <List
            header={<Text strong>Mevcut Raporlar</Text>}
            dataSource={[
              { name: 'Aylık Trafik Raporu', date: '2024-12-01', size: '2.3MB' },
              { name: 'Kullanıcı Davranış Analizi', date: '2024-11-28', size: '1.8MB' },
              { name: 'Dönüşüm Raporu', date: '2024-11-25', size: '1.2MB' },
              { name: 'Coğrafi Analiz', date: '2024-11-20', size: '950KB' },
            ]}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button type="link" icon={<DownloadOutlined />}>İndir</Button>,
                  <Button type="link" icon={<EyeOutlined />}>Görüntüle</Button>,
                ]}
              >
                <List.Item.Meta
                  title={item.name}
                  description={`${item.date} • ${item.size}`}
                />
              </List.Item>
            )}
          />
        </Col>
        <Col span={12}>
          <Card size="small" title="Özel Rapor Oluştur">
            <Form layout="vertical">
              <Form.Item label="Rapor Türü">
                <Select placeholder="Rapor türü seçin">
                  <Option value="traffic">Trafik Raporu</Option>
                  <Option value="users">Kullanıcı Raporu</Option>
                  <Option value="conversion">Dönüşüm Raporu</Option>
                  <Option value="revenue">Gelir Raporu</Option>
                </Select>
              </Form.Item>
              <Form.Item label="Tarih Aralığı">
                <RangePicker style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item label="Format">
                <Radio.Group defaultValue="pdf">
                  <Radio value="pdf">PDF</Radio>
                  <Radio value="excel">Excel</Radio>
                  <Radio value="csv">CSV</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item>
                <Button type="primary" block>
                  Rapor Oluştur
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </Card>
  );

  return (
    <PageContainer
      header={{
        title: 'Analitik ve Raporlar',
        breadcrumb: {
          items: [
            { title: 'Ana Sayfa', path: '/' },
            { title: 'Tenants', path: '/tenants' },
            { title: 'ABC Corporation', path: `/tenants/${id}` },
            { title: 'Analitik' },
          ],
        },
        onBack: () => navigate(`/tenants/${id}`),
        extra: [
          <Space key="actions">
            <Select
              value={dateRange}
              onChange={handleDateRangeChange}
              style={{ width: 150 }}
            >
              <Option value="today">Bugün</Option>
              <Option value="yesterday">Dün</Option>
              <Option value="last7days">Son 7 Gün</Option>
              <Option value="last30days">Son 30 Gün</Option>
              <Option value="thisMonth">Bu Ay</Option>
              <Option value="lastMonth">Geçen Ay</Option>
            </Select>
            <Button icon={<ReloadOutlined />}>Yenile</Button>
            <Button 
              type="primary" 
              icon={<ExportOutlined />}
              loading={loading}
              onClick={handleExportReport}
            >
              Dışa Aktar
            </Button>
          </Space>
        ],
      }}
    >
      <Alert
        message="Analitik Verileri"
        description="Bu sayfadaki veriler gerçek zamanlı analitik sisteminden gelmektedir. Son güncellenme: 5 dakika önce"
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab={<span><BarChartOutlined /> Genel Bakış</span>} key="overview">
          <OverviewTab />
        </TabPane>
        
        <TabPane tab={<span><LineChartOutlined /> Trafik</span>} key="traffic">
          <TrafficTab />
        </TabPane>
        
        <TabPane tab={<span><PieChartOutlined /> Cihaz/Tarayıcı</span>} key="devices">
          <DeviceTab />
        </TabPane>
        
        <TabPane tab={<span><FileTextOutlined /> Raporlar</span>} key="reports">
          <ReportsTab />
        </TabPane>
      </Tabs>
    </PageContainer>
  );
};

export default TenantAnalytics;