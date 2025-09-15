import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Select, 
  DatePicker, 
  Button, 
  Space, 
  Table, 
  Tag, 
  Typography, 
  Divider,
  Tabs,
  Progress,
  Alert,
  Segmented,
  Badge,
  List,
  Avatar,
  Tooltip,
  Empty
} from 'antd';
import {
  LineChartOutlined,
  BarChartOutlined,
  PieChartOutlined,
  DotChartOutlined,
  RiseOutlined,
  FallOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  GlobalOutlined,
  MobileOutlined,
  DesktopOutlined,
  TabletOutlined,
  ClockCircleOutlined,
  FireOutlined,
  ThunderboltOutlined,
  DownloadOutlined,
  ReloadOutlined,
  CalendarOutlined,
  FilterOutlined,
  ExportOutlined,
  InfoCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { Line, Column, Pie, Area, Gauge, DualAxes, Radar, Heatmap } from '@ant-design/plots';
import moment from 'moment';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

interface AnalyticsData {
  visitors: number;
  pageViews: number;
  sessions: number;
  bounceRate: number;
  avgSessionDuration: number;
  conversionRate: number;
  revenue: number;
  transactions: number;
}

interface TrafficSource {
  source: string;
  visitors: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}

interface PageMetric {
  path: string;
  views: number;
  uniqueViews: number;
  avgTime: number;
  bounceRate: number;
  exitRate: number;
}

interface UserBehavior {
  action: string;
  count: number;
  category: string;
  timestamp: string;
}

const TenantAnalytics: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('7d');
  const [dateRange, setDateRange] = useState<[moment.Moment, moment.Moment]>([
    dayjs().subtract(7, 'days'),
    dayjs()
  ]);
  const [activeTab, setActiveTab] = useState('overview');
  const [viewType, setViewType] = useState('chart');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    visitors: 12543,
    pageViews: 45678,
    sessions: 18234,
    bounceRate: 42.5,
    avgSessionDuration: 245,
    conversionRate: 3.8,
    revenue: 125430,
    transactions: 342
  });

  useEffect(() => {
    fetchAnalytics();
  }, [id, timeRange, dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    // Simulated API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  // Chart configurations
  const visitorTrendData = [
    { date: '01 Oca', visitors: 1200, pageViews: 3400 },
    { date: '02 Oca', visitors: 1350, pageViews: 3800 },
    { date: '03 Oca', visitors: 1100, pageViews: 3200 },
    { date: '04 Oca', visitors: 1450, pageViews: 4100 },
    { date: '05 Oca', visitors: 1600, pageViews: 4500 },
    { date: '06 Oca', visitors: 1400, pageViews: 3900 },
    { date: '07 Oca', visitors: 1550, pageViews: 4300 }
  ];

  const trafficSourceData = [
    { source: 'Organik Arama', value: 45, color: '#5B8FF9' },
    { source: 'Direkt', value: 25, color: '#5AD8A6' },
    { source: 'Sosyal Medya', value: 15, color: '#5D7092' },
    { source: 'Referans', value: 10, color: '#F6BD16' },
    { source: 'E-posta', value: 5, color: '#E86452' }
  ];

  const deviceData = [
    { device: 'Masaüstü', value: 55, icon: <DesktopOutlined /> },
    { device: 'Mobil', value: 35, icon: <MobileOutlined /> },
    { device: 'Tablet', value: 10, icon: <TabletOutlined /> }
  ];

  const pageMetrics: PageMetric[] = [
    {
      path: '/home',
      views: 12543,
      uniqueViews: 8932,
      avgTime: 145,
      bounceRate: 35.2,
      exitRate: 28.5
    },
    {
      path: '/products',
      views: 8734,
      uniqueViews: 6234,
      avgTime: 234,
      bounceRate: 42.1,
      exitRate: 38.2
    },
    {
      path: '/about',
      views: 3456,
      uniqueViews: 2876,
      avgTime: 89,
      bounceRate: 55.3,
      exitRate: 48.7
    },
    {
      path: '/contact',
      views: 2341,
      uniqueViews: 1987,
      avgTime: 67,
      bounceRate: 62.4,
      exitRate: 58.9
    }
  ];

  const conversionFunnelData = [
    { stage: 'Ana Sayfa', value: 10000 },
    { stage: 'Ürün Sayfası', value: 6500 },
    { stage: 'Sepet', value: 3200 },
    { stage: 'Ödeme', value: 1800 },
    { stage: 'Tamamlandı', value: 1200 }
  ];

  const realtimeData = [
    { time: '10:00', users: 234 },
    { time: '10:15', users: 256 },
    { time: '10:30', users: 289 },
    { time: '10:45', users: 312 },
    { time: '11:00', users: 345 },
    { time: '11:15', users: 378 }
  ];

  const heatmapData = [];
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 24; j++) {
      heatmapData.push({
        day: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'][i],
        hour: j,
        value: Math.floor(Math.random() * 100)
      });
    }
  }

  const lineConfig = {
    data: visitorTrendData,
    xField: 'date',
    yField: 'visitors',
    smooth: true,
    point: {
      size: 5,
      shape: 'diamond',
    },
    label: {
      style: {
        fill: '#aaa',
      },
    },
  };

  const pieConfig = {
    data: trafficSourceData,
    angleField: 'value',
    colorField: 'source',
    radius: 0.8,
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
  };

  const columnConfig = {
    data: conversionFunnelData,
    xField: 'stage',
    yField: 'value',
    label: {
      position: 'middle',
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
    },
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
      },
    },
  };

  const areaConfig = {
    data: realtimeData,
    xField: 'time',
    yField: 'users',
    smooth: true,
    areaStyle: {
      fill: 'l(270) 0:#ffffff 0.5:#7ec2f3 1:#1890ff',
    },
  };

  const heatmapConfig = {
    data: heatmapData,
    xField: 'hour',
    yField: 'day',
    colorField: 'value',
    color: ['#174c83', '#7eb6d4', '#efefeb', '#efa759', '#9b4d16'],
    meta: {
      hour: {
        type: 'cat',
      },
    },
  };

  const getChangeTag = (value: number, suffix: string = '%') => {
    if (value > 0) {
      return (
        <Tag color="success">
          <ArrowUpOutlined /> {value}{suffix}
        </Tag>
      );
    } else if (value < 0) {
      return (
        <Tag color="error">
          <ArrowDownOutlined /> {Math.abs(value)}{suffix}
        </Tag>
      );
    }
    return <Tag>0{suffix}</Tag>;
  };

  const pageColumns = [
    {
      title: 'Sayfa',
      dataIndex: 'path',
      key: 'path',
      render: (path: string) => <Text strong>{path}</Text>
    },
    {
      title: 'Görüntüleme',
      dataIndex: 'views',
      key: 'views',
      render: (views: number) => views.toLocaleString('tr-TR')
    },
    {
      title: 'Benzersiz',
      dataIndex: 'uniqueViews',
      key: 'uniqueViews',
      render: (views: number) => views.toLocaleString('tr-TR')
    },
    {
      title: 'Ort. Süre',
      dataIndex: 'avgTime',
      key: 'avgTime',
      render: (time: number) => `${Math.floor(time / 60)}:${(time % 60).toString().padStart(2, '0')}`
    },
    {
      title: 'Hemen Çıkma',
      dataIndex: 'bounceRate',
      key: 'bounceRate',
      render: (rate: number) => (
        <Progress 
          percent={rate} 
          size="small" 
          status={rate > 50 ? 'exception' : 'normal'}
          format={(percent) => `${percent}%`}
        />
      )
    },
    {
      title: 'Çıkış Oranı',
      dataIndex: 'exitRate',
      key: 'exitRate',
      render: (rate: number) => `${rate}%`
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={12}>
            <Title level={4} style={{ margin: 0 }}>
              <LineChartOutlined /> Analytics Dashboard
            </Title>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Space>
              <RangePicker
                value={dateRange}
                onChange={(dates) => dates && setDateRange(dates as [moment.Moment, moment.Moment])}
                format="DD.MM.YYYY"
              />
              <Select
                value={timeRange}
                onChange={setTimeRange}
                style={{ width: 120 }}
              >
                <Option value="1d">Bugün</Option>
                <Option value="7d">Son 7 Gün</Option>
                <Option value="30d">Son 30 Gün</Option>
                <Option value="90d">Son 90 Gün</Option>
              </Select>
              <Button icon={<ReloadOutlined />} onClick={fetchAnalytics}>
                Yenile
              </Button>
              <Button icon={<ExportOutlined />} type="primary">
                Rapor İndir
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Key Metrics */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Ziyaretçi"
              value={analyticsData.visitors}
              prefix={<UserOutlined />}
              suffix={getChangeTag(12.5)}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Sayfa Görüntüleme"
              value={analyticsData.pageViews}
              prefix={<EyeOutlined />}
              suffix={getChangeTag(8.2)}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Dönüşüm Oranı"
              value={analyticsData.conversionRate}
              suffix="%"
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            {getChangeTag(2.1)}
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Gelir"
              value={analyticsData.revenue}
              prefix={<DollarOutlined />}
              suffix="₺"
              valueStyle={{ color: '#fa8c16' }}
            />
            {getChangeTag(15.3)}
          </Card>
        </Col>
      </Row>

      <Card bordered={false}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Genel Bakış" key="overview">
            <Row gutter={16}>
              <Col span={16}>
                <Card 
                  title="Ziyaretçi Trendi" 
                  size="small"
                  extra={
                    <Segmented
                      options={[
                        { label: 'Gün', value: 'day' },
                        { label: 'Hafta', value: 'week' },
                        { label: 'Ay', value: 'month' }
                      ]}
                      defaultValue="day"
                    />
                  }
                >
                  <Line {...lineConfig} height={300} />
                </Card>
              </Col>
              <Col span={8}>
                <Card title="Trafik Kaynakları" size="small">
                  <Pie {...pieConfig} height={300} />
                </Card>
              </Col>
            </Row>

            <Divider />

            <Row gutter={16}>
              <Col span={8}>
                <Card title="Cihaz Dağılımı" size="small">
                  <List
                    dataSource={deviceData}
                    renderItem={item => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={item.icon}
                          title={item.device}
                          description={
                            <Progress 
                              percent={item.value} 
                              strokeColor="#667eea"
                              format={(percent) => `${percent}%`}
                            />
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card title="Kullanıcı Metrikleri" size="small">
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Statistic
                        title="Ort. Oturum Süresi"
                        value={`${Math.floor(analyticsData.avgSessionDuration / 60)}:${(analyticsData.avgSessionDuration % 60).toString().padStart(2, '0')}`}
                        prefix={<ClockCircleOutlined />}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Hemen Çıkma Oranı"
                        value={analyticsData.bounceRate}
                        suffix="%"
                        valueStyle={{ color: analyticsData.bounceRate > 50 ? '#ff4d4f' : '#52c41a' }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Sayfa/Oturum"
                        value={(analyticsData.pageViews / analyticsData.sessions).toFixed(2)}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Yeni Kullanıcı"
                        value="68"
                        suffix="%"
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
              <Col span={8}>
                <Card title="En Popüler Sayfalar" size="small">
                  <List
                    size="small"
                    dataSource={pageMetrics.slice(0, 4)}
                    renderItem={(item, index) => (
                      <List.Item>
                        <Badge count={index + 1} style={{ backgroundColor: '#667eea' }}>
                          <Text>{item.path}</Text>
                        </Badge>
                        <Text type="secondary">{item.views.toLocaleString('tr-TR')} görüntüleme</Text>
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Davranış" key="behavior">
            <Row gutter={16}>
              <Col span={24}>
                <Card title="Sayfa Performansı" size="small">
                  <Table
                    columns={pageColumns}
                    dataSource={pageMetrics}
                    pagination={false}
                    size="small"
                  />
                </Card>
              </Col>
            </Row>

            <Divider />

            <Row gutter={16}>
              <Col span={12}>
                <Card title="Kullanıcı Akışı" size="small">
                  <Column {...columnConfig} height={300} />
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Site İçi Arama" size="small">
                  <List
                    dataSource={[
                      { term: 'ürün adı', count: 234 },
                      { term: 'fiyat', count: 189 },
                      { term: 'kargo', count: 156 },
                      { term: 'iade', count: 98 },
                      { term: 'kampanya', count: 67 }
                    ]}
                    renderItem={item => (
                      <List.Item>
                        <Text>{item.term}</Text>
                        <Tag>{item.count} arama</Tag>
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Dönüşüm" key="conversion">
            <Row gutter={16}>
              <Col span={16}>
                <Card 
                  title="Dönüşüm Hunisi" 
                  size="small"
                  extra={
                    <Space>
                      <Text type="secondary">Dönüşüm Oranı:</Text>
                      <Text strong>{analyticsData.conversionRate}%</Text>
                    </Space>
                  }
                >
                  <Column {...columnConfig} height={300} />
                </Card>
              </Col>
              <Col span={8}>
                <Card title="E-ticaret Metrikleri" size="small">
                  <Space direction="vertical" style={{ width: '100%' }} size="large">
                    <Statistic
                      title="Ortalama Sepet Değeri"
                      value={366.28}
                      prefix="₺"
                      suffix={getChangeTag(8.5)}
                    />
                    <Statistic
                      title="Sepet Terk Oranı"
                      value={68.4}
                      suffix="%"
                      valueStyle={{ color: '#ff4d4f' }}
                    />
                    <Statistic
                      title="Ürün Görüntüleme"
                      value={23456}
                      suffix={getChangeTag(12.3, '')}
                    />
                    <Statistic
                      title="Sepete Ekleme Oranı"
                      value={32}
                      suffix="%"
                    />
                  </Space>
                </Card>
              </Col>
            </Row>

            <Divider />

            <Row gutter={16}>
              <Col span={24}>
                <Card title="Hedef Tamamlanma" size="small">
                  <List
                    dataSource={[
                      { goal: 'Üye Kaydı', target: 500, achieved: 423, rate: 84.6 },
                      { goal: 'Newsletter Aboneliği', target: 1000, achieved: 876, rate: 87.6 },
                      { goal: 'Ürün Satın Alma', target: 200, achieved: 168, rate: 84 },
                      { goal: 'Form Doldurma', target: 300, achieved: 234, rate: 78 }
                    ]}
                    renderItem={item => (
                      <List.Item>
                        <List.Item.Meta
                          title={item.goal}
                          description={`${item.achieved} / ${item.target}`}
                        />
                        <Progress
                          type="circle"
                          percent={item.rate}
                          width={60}
                          strokeColor={{
                            '0%': '#108ee9',
                            '100%': '#87d068',
                          }}
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Gerçek Zamanlı" key="realtime">
            <Alert
              message="Gerçek Zamanlı İzleme"
              description="Son 30 dakikadaki kullanıcı aktiviteleri"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Row gutter={16}>
              <Col span={6}>
                <Card bordered={false}>
                  <Statistic
                    title="Aktif Kullanıcı"
                    value={378}
                    prefix={<FireOutlined style={{ color: '#ff4d4f' }} />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card bordered={false}>
                  <Statistic
                    title="Sayfa/Dakika"
                    value={89}
                    prefix={<ThunderboltOutlined style={{ color: '#faad14' }} />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card bordered={false}>
                  <Statistic
                    title="Aktif Oturum"
                    value={234}
                    prefix={<GlobalOutlined style={{ color: '#1890ff' }} />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card bordered={false}>
                  <Gauge
                    percent={0.75}
                    range={{
                      color: ['l(0) 0:#5d7092 1:#6395f9'],
                    }}
                    startAngle={180}
                    endAngle={0}
                    height={100}
                    statistic={{
                      title: {
                        formatter: () => 'Yük',
                        style: { fontSize: '14px' }
                      },
                      content: {
                        formatter: () => 'Yüksek',
                        style: { fontSize: '16px' }
                      }
                    }}
                  />
                </Card>
              </Col>
            </Row>

            <Divider />

            <Row gutter={16}>
              <Col span={16}>
                <Card title="Kullanıcı Akışı (Son 1 Saat)" size="small">
                  <Area {...areaConfig} height={250} />
                </Card>
              </Col>
              <Col span={8}>
                <Card title="Aktif Sayfalar" size="small">
                  <List
                    size="small"
                    dataSource={[
                      { page: '/home', users: 89, trend: 'up' },
                      { page: '/products', users: 67, trend: 'up' },
                      { page: '/cart', users: 34, trend: 'down' },
                      { page: '/checkout', users: 12, trend: 'stable' },
                      { page: '/contact', users: 8, trend: 'down' }
                    ]}
                    renderItem={item => (
                      <List.Item>
                        <Space>
                          <Text>{item.page}</Text>
                          <Badge count={item.users} style={{ backgroundColor: '#52c41a' }} />
                          {item.trend === 'up' && <RiseOutlined style={{ color: '#52c41a' }} />}
                          {item.trend === 'down' && <FallOutlined style={{ color: '#ff4d4f' }} />}
                        </Space>
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Isı Haritası" key="heatmap">
            <Card 
              title="Kullanım Yoğunluğu" 
              size="small"
              extra={
                <Text type="secondary">
                  Haftalık kullanım yoğunluğu (saat bazında)
                </Text>
              }
            >
              <Heatmap {...heatmapConfig} height={300} />
            </Card>

            <Divider />

            <Row gutter={16}>
              <Col span={12}>
                <Card title="Coğrafi Dağılım" size="small">
                  <List
                    dataSource={[
                      { city: 'İstanbul', users: 4532, percentage: 36.1 },
                      { city: 'Ankara', users: 2341, percentage: 18.7 },
                      { city: 'İzmir', users: 1876, percentage: 15.0 },
                      { city: 'Bursa', users: 987, percentage: 7.9 },
                      { city: 'Antalya', users: 765, percentage: 6.1 },
                      { city: 'Diğer', users: 2042, percentage: 16.2 }
                    ]}
                    renderItem={item => (
                      <List.Item>
                        <List.Item.Meta
                          title={item.city}
                          description={`${item.users.toLocaleString('tr-TR')} kullanıcı`}
                        />
                        <Progress
                          percent={item.percentage}
                          strokeColor="#667eea"
                          format={(percent) => `${percent}%`}
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Tarayıcı Dağılımı" size="small">
                  <List
                    dataSource={[
                      { browser: 'Chrome', users: 6543, percentage: 52.2 },
                      { browser: 'Safari', users: 2876, percentage: 22.9 },
                      { browser: 'Firefox', users: 1654, percentage: 13.2 },
                      { browser: 'Edge', users: 987, percentage: 7.9 },
                      { browser: 'Diğer', users: 483, percentage: 3.8 }
                    ]}
                    renderItem={item => (
                      <List.Item>
                        <List.Item.Meta
                          title={item.browser}
                          description={`${item.users.toLocaleString('tr-TR')} kullanıcı`}
                        />
                        <Progress
                          percent={item.percentage}
                          strokeColor="#52c41a"
                          format={(percent) => `${percent}%`}
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default TenantAnalytics;