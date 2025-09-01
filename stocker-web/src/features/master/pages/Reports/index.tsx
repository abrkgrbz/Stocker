import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Space,
  DatePicker,
  Select,
  Table,
  Tabs,
  Statistic,
  Tag,
  Progress,
  Divider,
  Radio,
  Tooltip,
  message,
  Empty,
  Badge,
  Segmented,
  List,
  Avatar,
} from 'antd';
import {
  FileTextOutlined,
  DownloadOutlined,
  PrinterOutlined,
  MailOutlined,
  CalendarOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  AreaChartOutlined,
  RiseOutlined,
  FallOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  TeamOutlined,
  ShopOutlined,
  FilterOutlined,
  ReloadOutlined,
  ExportOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  TrophyOutlined,
  CrownOutlined,
  FireOutlined,
  RocketOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { Line, Column, Pie, Area, DualAxes, Radar, Funnel } from '@ant-design/plots';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { masterApi } from '@/shared/api/master.api';
import '../../styles/master-layout.css';

dayjs.extend(quarterOfYear);
dayjs.extend(weekOfYear);

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface ReportData {
  revenue: number;
  growth: number;
  tenants: number;
  users: number;
  subscriptions: number;
  churnRate: number;
  arpu: number;
  mrr: number;
  arr: number;
}

interface TenantReport {
  id: string;
  name: string;
  package: string;
  users: number;
  revenue: number;
  status: string;
  createdDate: string;
  lastActivity: string;
}

interface UserReport {
  id: string;
  name: string;
  tenant: string;
  role: string;
  loginCount: number;
  lastLogin: string;
  status: string;
}

export const MasterReportsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [reportType, setReportType] = useState('monthly');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'days'),
    dayjs(),
  ]);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  // Mock report data
  const reportData: ReportData = {
    revenue: 125450,
    growth: 23.5,
    tenants: 156,
    users: 3450,
    subscriptions: 142,
    churnRate: 2.8,
    arpu: 850,
    mrr: 45200,
    arr: 542400,
  };

  // Mock tenant reports
  const tenantReports: TenantReport[] = [
    {
      id: '1',
      name: 'TechCorp Solutions',
      package: 'Enterprise',
      users: 125,
      revenue: 12500,
      status: 'active',
      createdDate: '2023-06-15',
      lastActivity: dayjs().subtract(2, 'hours').toISOString(),
    },
    {
      id: '2',
      name: 'StartupHub Inc',
      package: 'Professional',
      users: 45,
      revenue: 4500,
      status: 'active',
      createdDate: '2023-08-20',
      lastActivity: dayjs().subtract(1, 'day').toISOString(),
    },
    {
      id: '3',
      name: 'Digital Agency',
      package: 'Basic',
      users: 15,
      revenue: 990,
      status: 'active',
      createdDate: '2023-10-05',
      lastActivity: dayjs().subtract(3, 'hours').toISOString(),
    },
  ];

  // Revenue trend data
  const revenueTrendData = Array.from({ length: 12 }, (_, i) => ({
    month: dayjs().subtract(11 - i, 'months').format('MMM'),
    revenue: Math.floor(Math.random() * 50000) + 30000,
    subscriptions: Math.floor(Math.random() * 30) + 100,
  }));

  // Package distribution data
  const packageDistribution = [
    { type: 'Enterprise', value: 25, count: 25 },
    { type: 'Professional', value: 45, count: 45 },
    { type: 'Basic', value: 65, count: 65 },
    { type: 'Starter', value: 21, count: 21 },
  ];

  // User activity data
  const userActivityData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    active: Math.floor(Math.random() * 200) + 50,
    new: Math.floor(Math.random() * 20) + 5,
  }));

  // Top tenants by revenue
  const topTenants = [
    { name: 'TechCorp', revenue: 12500, growth: 15 },
    { name: 'StartupHub', revenue: 8900, growth: 32 },
    { name: 'Digital Agency', revenue: 6750, growth: -5 },
    { name: 'CloudFirst', revenue: 5200, growth: 18 },
    { name: 'DataDriven Co', revenue: 4800, growth: 8 },
  ];

  useEffect(() => {
    fetchReports();
  }, [reportType, dateRange]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      // API çağrıları yapılacak
      // const response = await masterApi.reports.getOverview({
      //   type: reportType,
      //   startDate: dateRange[0].toISOString(),
      //   endDate: dateRange[1].toISOString(),
      // });
      
      setTimeout(() => {
        setLoading(false);
      }, 500);
    } catch (error) {
      message.error('Raporlar yüklenirken hata oluştu');
      setLoading(false);
    }
  };

  const handleExport = (format: string) => {
    message.success(`Rapor ${format.toUpperCase()} formatında indiriliyor...`);
    // Export logic here
  };

  const handleSendEmail = () => {
    message.success('Rapor e-posta ile gönderiliyor...');
    // Email logic here
  };

  const handlePrint = () => {
    window.print();
  };

  // Chart configurations
  const revenueChartConfig = {
    data: revenueTrendData,
    xField: 'month',
    yField: ['revenue', 'subscriptions'],
    geometryOptions: [
      {
        geometry: 'column',
        color: '#5B8FF9',
      },
      {
        geometry: 'line',
        color: '#5AD8A6',
        lineStyle: {
          lineWidth: 2,
        },
      },
    ],
    yAxis: {
      revenue: {
        min: 0,
        label: {
          formatter: (v: string) => `₺${Number(v).toLocaleString()}`,
        },
      },
      subscriptions: {
        min: 0,
      },
    },
  };

  const packagePieConfig = {
    data: packageDistribution,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'spider',
      content: '{name}: {percentage}',
    },
    interactions: [
      {
        type: 'element-active',
      },
    ],
  };

  const userActivityConfig = {
    data: userActivityData,
    xField: 'hour',
    yField: 'active',
    smooth: true,
    areaStyle: {
      fill: 'l(270) 0:#ffffff 1:#5B8FF9',
    },
  };

  // KPI Cards
  const kpiCards = [
    {
      title: 'Toplam Gelir',
      value: reportData.revenue,
      prefix: '₺',
      suffix: '',
      change: reportData.growth,
      icon: <DollarOutlined />,
      color: '#52c41a',
    },
    {
      title: 'Aktif Tenant',
      value: reportData.tenants,
      prefix: '',
      suffix: '',
      change: 8.2,
      icon: <ShopOutlined />,
      color: '#1890ff',
    },
    {
      title: 'Toplam Kullanıcı',
      value: reportData.users,
      prefix: '',
      suffix: '',
      change: 15.3,
      icon: <TeamOutlined />,
      color: '#722ed1',
    },
    {
      title: 'MRR',
      value: reportData.mrr,
      prefix: '₺',
      suffix: '',
      change: 12.5,
      icon: <RiseOutlined />,
      color: '#fa8c16',
    },
  ];

  const tenantColumns = [
    {
      title: 'Tenant',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <Space>
          <Avatar icon={<ShopOutlined />} />
          <Text strong>{name}</Text>
        </Space>
      ),
    },
    {
      title: 'Paket',
      dataIndex: 'package',
      key: 'package',
      render: (pkg: string) => {
        const colors: Record<string, string> = {
          Enterprise: 'purple',
          Professional: 'blue',
          Basic: 'green',
          Starter: 'default',
        };
        return <Tag color={colors[pkg] || 'default'}>{pkg}</Tag>;
      },
    },
    {
      title: 'Kullanıcı',
      dataIndex: 'users',
      key: 'users',
      render: (users: number) => (
        <Space>
          <TeamOutlined />
          <Text>{users}</Text>
        </Space>
      ),
    },
    {
      title: 'Gelir',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (revenue: number) => (
        <Text strong>₺{revenue.toLocaleString()}</Text>
      ),
      sorter: (a: TenantReport, b: TenantReport) => a.revenue - b.revenue,
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge
          status={status === 'active' ? 'success' : 'error'}
          text={status === 'active' ? 'Aktif' : 'Pasif'}
        />
      ),
    },
    {
      title: 'Son Aktivite',
      dataIndex: 'lastActivity',
      key: 'lastActivity',
      render: (date: string) => (
        <Text type="secondary">{dayjs(date).fromNow()}</Text>
      ),
    },
  ];

  return (
    <div className="master-reports-page">
      {/* Header */}
      <div className="page-header glass-morphism">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="header-content"
        >
          <Title level={2} className="gradient-text">
            <BarChartOutlined /> Raporlar ve Analizler
          </Title>
          <Text type="secondary">Detaylı sistem raporları ve iş analizleri</Text>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="header-actions"
        >
          <Space>
            <Segmented
              value={reportType}
              onChange={setReportType}
              options={[
                { label: 'Günlük', value: 'daily' },
                { label: 'Haftalık', value: 'weekly' },
                { label: 'Aylık', value: 'monthly' },
                { label: 'Yıllık', value: 'yearly' },
              ]}
            />
            <RangePicker
              value={dateRange}
              onChange={(dates) => dates && setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
              format="DD.MM.YYYY"
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchReports}
              loading={loading}
            >
              Yenile
            </Button>
          </Space>
        </motion.div>
      </div>

      {/* KPI Cards */}
      <Row gutter={[20, 20]} className="stats-row">
        {kpiCards.map((kpi, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="stat-card glass-morphism">
                <Statistic
                  title={kpi.title}
                  value={kpi.value}
                  prefix={
                    <span style={{ color: kpi.color }}>
                      {kpi.icon}
                      {kpi.prefix}
                    </span>
                  }
                  suffix={
                    <span style={{ fontSize: 14, color: kpi.change > 0 ? '#52c41a' : '#ff4d4f' }}>
                      {kpi.change > 0 ? <RiseOutlined /> : <FallOutlined />}
                      {Math.abs(kpi.change)}%
                    </span>
                  }
                  valueStyle={{ color: kpi.color }}
                />
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      {/* Main Content */}
      <Card className="content-card glass-morphism">
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          tabBarExtraContent={
            <Space>
              <Select
                value={exportFormat}
                onChange={setExportFormat}
                style={{ width: 100 }}
              >
                <Option value="pdf">PDF</Option>
                <Option value="excel">Excel</Option>
                <Option value="csv">CSV</Option>
              </Select>
              <Button
                icon={<DownloadOutlined />}
                onClick={() => handleExport(exportFormat)}
              >
                İndir
              </Button>
              <Button icon={<MailOutlined />} onClick={handleSendEmail}>
                E-posta
              </Button>
              <Button icon={<PrinterOutlined />} onClick={handlePrint}>
                Yazdır
              </Button>
            </Space>
          }
        >
          <TabPane
            tab={
              <span>
                <AreaChartOutlined />
                Genel Bakış
              </span>
            }
            key="overview"
          >
            <Row gutter={[20, 20]}>
              <Col xs={24} lg={16}>
                <Card
                  title="Gelir ve Abonelik Trendi"
                  bordered={false}
                  extra={
                    <Radio.Group value={selectedMetric} onChange={(e) => setSelectedMetric(e.target.value)}>
                      <Radio.Button value="revenue">Gelir</Radio.Button>
                      <Radio.Button value="subscriptions">Abonelik</Radio.Button>
                      <Radio.Button value="both">Her İkisi</Radio.Button>
                    </Radio.Group>
                  }
                >
                  <DualAxes {...revenueChartConfig} height={300} />
                </Card>
              </Col>
              <Col xs={24} lg={8}>
                <Card title="Paket Dağılımı" bordered={false}>
                  <Pie {...packagePieConfig} height={300} />
                </Card>
              </Col>
            </Row>

            <Divider />

            <Row gutter={[20, 20]}>
              <Col xs={24} lg={12}>
                <Card
                  title="En Yüksek Gelirli Tenantlar"
                  bordered={false}
                  extra={<Text type="secondary">Top 5</Text>}
                >
                  <List
                    dataSource={topTenants}
                    renderItem={(item) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={
                            item.growth > 0 ? (
                              <Avatar style={{ backgroundColor: '#52c41a' }} icon={<RiseOutlined />} />
                            ) : (
                              <Avatar style={{ backgroundColor: '#ff4d4f' }} icon={<FallOutlined />} />
                            )
                          }
                          title={item.name}
                          description={
                            <Space>
                              <Text strong>₺{item.revenue.toLocaleString()}</Text>
                              <Tag color={item.growth > 0 ? 'green' : 'red'}>
                                {item.growth > 0 ? '+' : ''}{item.growth}%
                              </Tag>
                            </Space>
                          }
                        />
                        <Progress
                          percent={(item.revenue / topTenants[0].revenue) * 100}
                          showInfo={false}
                          strokeColor="#1890ff"
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card
                  title="Kullanıcı Aktivitesi (24 Saat)"
                  bordered={false}
                  extra={
                    <Badge count={userActivityData.reduce((sum, d) => sum + d.active, 0)} showZero>
                      <UserOutlined />
                    </Badge>
                  }
                >
                  <Area {...userActivityConfig} height={320} />
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane
            tab={
              <span>
                <ShopOutlined />
                Tenant Raporları
              </span>
            }
            key="tenants"
          >
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <Col xs={24} sm={8}>
                <Card className="glass-morphism">
                  <Statistic
                    title="Toplam Tenant"
                    value={reportData.tenants}
                    prefix={<ShopOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card className="glass-morphism">
                  <Statistic
                    title="Ortalama Kullanıcı/Tenant"
                    value={Math.round(reportData.users / reportData.tenants)}
                    prefix={<TeamOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card className="glass-morphism">
                  <Statistic
                    title="Churn Rate"
                    value={reportData.churnRate}
                    suffix="%"
                    valueStyle={{ color: reportData.churnRate < 5 ? '#52c41a' : '#ff4d4f' }}
                  />
                </Card>
              </Col>
            </Row>

            <Table
              columns={tenantColumns}
              dataSource={tenantReports}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Toplam ${total} tenant`,
              }}
            />
          </TabPane>

          <TabPane
            tab={
              <span>
                <DollarOutlined />
                Finansal Raporlar
              </span>
            }
            key="financial"
          >
            <Row gutter={[20, 20]}>
              <Col xs={24} sm={12} lg={6}>
                <Card className="glass-morphism">
                  <Statistic
                    title="MRR (Aylık Tekrarlayan Gelir)"
                    value={reportData.mrr}
                    prefix="₺"
                    valueStyle={{ color: '#52c41a' }}
                  />
                  <Progress percent={75} showInfo={false} strokeColor="#52c41a" />
                  <Text type="secondary">Hedef: ₺60,000</Text>
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card className="glass-morphism">
                  <Statistic
                    title="ARR (Yıllık Tekrarlayan Gelir)"
                    value={reportData.arr}
                    prefix="₺"
                    valueStyle={{ color: '#1890ff' }}
                  />
                  <Progress percent={68} showInfo={false} strokeColor="#1890ff" />
                  <Text type="secondary">Hedef: ₺800,000</Text>
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card className="glass-morphism">
                  <Statistic
                    title="ARPU (Kullanıcı Başı Gelir)"
                    value={reportData.arpu}
                    prefix="₺"
                    valueStyle={{ color: '#722ed1' }}
                  />
                  <Progress percent={85} showInfo={false} strokeColor="#722ed1" />
                  <Text type="secondary">Hedef: ₺1,000</Text>
                </Card>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Card className="glass-morphism">
                  <Statistic
                    title="Büyüme Oranı"
                    value={reportData.growth}
                    suffix="%"
                    prefix={reportData.growth > 0 ? <RiseOutlined /> : <FallOutlined />}
                    valueStyle={{ color: reportData.growth > 0 ? '#52c41a' : '#ff4d4f' }}
                  />
                  <Progress
                    percent={reportData.growth}
                    showInfo={false}
                    strokeColor={reportData.growth > 20 ? '#52c41a' : '#faad14'}
                  />
                  <Text type="secondary">Hedef: %30</Text>
                </Card>
              </Col>
            </Row>

            <Divider />

            <Row gutter={[20, 20]}>
              <Col xs={24}>
                <Card title="Gelir Tahmin Modeli" bordered={false}>
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Gelir tahmin modeli yakında eklenecek"
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane
            tab={
              <span>
                <TeamOutlined />
                Kullanıcı Raporları
              </span>
            }
            key="users"
          >
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <Col xs={24} sm={8}>
                <Card className="glass-morphism">
                  <Statistic
                    title="Toplam Kullanıcı"
                    value={reportData.users}
                    prefix={<UserOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card className="glass-morphism">
                  <Statistic
                    title="Aktif Kullanıcı (30 gün)"
                    value={Math.round(reportData.users * 0.75)}
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card className="glass-morphism">
                  <Statistic
                    title="Yeni Kullanıcı (30 gün)"
                    value={Math.round(reportData.users * 0.15)}
                    prefix={<UserOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
            </Row>

            <Card title="Kullanıcı Aktivite Haritası" bordered={false}>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Kullanıcı aktivite haritası yakında eklenecek"
              />
            </Card>
          </TabPane>

          <TabPane
            tab={
              <span>
                <RocketOutlined />
                Performans
              </span>
            }
            key="performance"
          >
            <Row gutter={[20, 20]}>
              <Col xs={24} lg={8}>
                <Card title="Sistem Performansı" bordered={false}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Text>API Yanıt Süresi</Text>
                      <Progress percent={92} status="success" />
                    </div>
                    <div>
                      <Text>Veritabanı Performansı</Text>
                      <Progress percent={88} status="success" />
                    </div>
                    <div>
                      <Text>Önbellek İsabet Oranı</Text>
                      <Progress percent={76} status="active" />
                    </div>
                    <div>
                      <Text>Sistem Uptime</Text>
                      <Progress percent={99.9} status="success" />
                    </div>
                  </Space>
                </Card>
              </Col>
              <Col xs={24} lg={8}>
                <Card title="En Çok Kullanılan Özellikler" bordered={false}>
                  <List
                    dataSource={[
                      { name: 'Stok Yönetimi', usage: 3450 },
                      { name: 'Fatura Oluşturma', usage: 2890 },
                      { name: 'Raporlama', usage: 2100 },
                      { name: 'Müşteri Yönetimi', usage: 1850 },
                      { name: 'Kullanıcı Yönetimi', usage: 1200 },
                    ]}
                    renderItem={(item) => (
                      <List.Item>
                        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                          <Text>{item.name}</Text>
                          <Tag color="blue">{item.usage}</Tag>
                        </Space>
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
              <Col xs={24} lg={8}>
                <Card title="Hata Oranları" bordered={false}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Alert
                      message="4xx Hatalar"
                      description="125 (0.2%)"
                      type="warning"
                      showIcon
                    />
                    <Alert
                      message="5xx Hatalar"
                      description="12 (0.02%)"
                      type="error"
                      showIcon
                    />
                    <Alert
                      message="Başarılı İstekler"
                      description="62,863 (99.78%)"
                      type="success"
                      showIcon
                    />
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

export default MasterReportsPage;