import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Select,
  DatePicker,
  Space,
  Statistic,
  Progress,
  Table,
  Tag,
  Typography,
  Tabs,
  Badge,
  Avatar,
  List,
  Button,
  Segmented,
} from 'antd';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  RiseOutlined,
  FallOutlined,
  TeamOutlined,
  CloudServerOutlined,
  DatabaseOutlined,
  ApiOutlined,
  ExportOutlined,
  ReloadOutlined,
} from '@ant-design/icons';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const MasterAnalyticsPage: React.FC = () => {
  const [period, setPeriod] = useState('month');
  const [dateRange, setDateRange] = useState<any>(null);

  // Mock data for charts
  const revenueData = [
    { month: 'Oca', revenue: 45000, profit: 12000, growth: 15 },
    { month: 'Şub', revenue: 52000, profit: 15000, growth: 18 },
    { month: 'Mar', revenue: 48000, profit: 13000, growth: 12 },
    { month: 'Nis', revenue: 61000, profit: 18000, growth: 25 },
    { month: 'May', revenue: 55000, profit: 16000, growth: 20 },
    { month: 'Haz', revenue: 67000, profit: 21000, growth: 28 },
  ];

  const userGrowthData = [
    { month: 'Oca', users: 1200, active: 980 },
    { month: 'Şub', users: 1350, active: 1100 },
    { month: 'Mar', users: 1500, active: 1250 },
    { month: 'Nis', users: 1780, active: 1500 },
    { month: 'May', users: 2100, active: 1800 },
    { month: 'Haz', users: 2450, active: 2100 },
  ];

  const packageDistribution = [
    { name: 'Starter', value: 35, color: '#8884d8' },
    { name: 'Professional', value: 45, color: '#82ca9d' },
    { name: 'Enterprise', value: 20, color: '#ffc658' },
  ];

  const performanceData = [
    { subject: 'CPU', A: 78, B: 85, fullMark: 100 },
    { subject: 'Memory', A: 65, B: 72, fullMark: 100 },
    { subject: 'Storage', A: 45, B: 55, fullMark: 100 },
    { subject: 'Network', A: 88, B: 92, fullMark: 100 },
    { subject: 'Response', A: 95, B: 98, fullMark: 100 },
  ];

  const topTenants = [
    { name: 'TechCorp Solutions', revenue: 12500, growth: 25 },
    { name: 'Global Retail Inc', revenue: 10200, growth: 18 },
    { name: 'Digital Agency', revenue: 8900, growth: -5 },
    { name: 'StartUp Hub', revenue: 7600, growth: 32 },
    { name: 'Finance Pro', revenue: 6800, growth: 12 },
  ];

  const moduleUsage = [
    { module: 'CRM', usage: 89, tenants: 45 },
    { module: 'Inventory', usage: 76, tenants: 38 },
    { module: 'Accounting', usage: 92, tenants: 42 },
    { module: 'HR', usage: 65, tenants: 28 },
    { module: 'Projects', usage: 58, tenants: 24 },
  ];

  return (
    <div className="master-analytics-page">
      {/* Header Controls */}
      <Card style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Segmented
                options={[
                  { label: 'Günlük', value: 'day' },
                  { label: 'Haftalık', value: 'week' },
                  { label: 'Aylık', value: 'month' },
                  { label: 'Yıllık', value: 'year' },
                ]}
                value={period}
                onChange={setPeriod}
              />
              <RangePicker onChange={setDateRange} />
            </Space>
          </Col>
          <Col>
            <Space>
              <Button icon={<ReloadOutlined />}>Yenile</Button>
              <Button icon={<ExportOutlined />} type="primary">
                Rapor İndir
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Key Metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Toplam Gelir"
              value={328000}
              precision={2}
              prefix="₺"
              valueStyle={{ color: '#3f8600' }}
              suffix={
                <span style={{ fontSize: 14 }}>
                  <ArrowUpOutlined /> 23%
                </span>
              }
            />
            <Progress percent={75} strokeColor="#52c41a" showInfo={false} />
            <Text type="secondary">Hedefin %75'i tamamlandı</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Aktif Kullanıcı"
              value={2450}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
              suffix={
                <span style={{ fontSize: 14 }}>
                  <ArrowUpOutlined /> 15%
                </span>
              }
            />
            <Progress percent={88} strokeColor="#1890ff" showInfo={false} />
            <Text type="secondary">%88 aktif kullanım oranı</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Yeni Abonelik"
              value={48}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#722ed1' }}
              suffix={
                <span style={{ fontSize: 14 }}>
                  <ArrowUpOutlined /> 8%
                </span>
              }
            />
            <Progress percent={60} strokeColor="#722ed1" showInfo={false} />
            <Text type="secondary">Bu ay 48 yeni abonelik</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Sistem Durumu"
              value={99.9}
              suffix="%"
              prefix={<CloudServerOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            <Progress percent={99.9} strokeColor="#52c41a" showInfo={false} />
            <Text type="secondary">Uptime: 30 gün</Text>
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="revenue">
        <TabPane tab="Gelir Analizi" key="revenue">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              <Card title="Gelir Trendi" bordered={false}>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stackId="1"
                      stroke="#8884d8"
                      fill="#8884d8"
                      name="Gelir"
                    />
                    <Area
                      type="monotone"
                      dataKey="profit"
                      stackId="1"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      name="Kar"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title="En Çok Gelir Getiren Firmalar" bordered={false}>
                <List
                  dataSource={topTenants}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<TeamOutlined />} />}
                        title={item.name}
                        description={`₺${item.revenue.toLocaleString('tr-TR')}`}
                      />
                      <div>
                        {item.growth > 0 ? (
                          <Tag color="green">
                            <ArrowUpOutlined /> {item.growth}%
                          </Tag>
                        ) : (
                          <Tag color="red">
                            <ArrowDownOutlined /> {Math.abs(item.growth)}%
                          </Tag>
                        )}
                      </div>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Kullanıcı Analizi" key="users">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="Kullanıcı Büyümesi" bordered={false}>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="#8884d8"
                      name="Toplam Kullanıcı"
                    />
                    <Line
                      type="monotone"
                      dataKey="active"
                      stroke="#82ca9d"
                      name="Aktif Kullanıcı"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Paket Dağılımı" bordered={false}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={packageDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {packageDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Modül Kullanımı" key="modules">
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card title="Modül Kullanım Oranları" bordered={false}>
                <Row gutter={[32, 32]}>
                  {moduleUsage.map((module) => (
                    <Col xs={24} sm={12} lg={8} key={module.module}>
                      <div style={{ textAlign: 'center' }}>
                        <Progress
                          type="circle"
                          percent={module.usage}
                          strokeColor={{
                            '0%': '#108ee9',
                            '100%': '#87d068',
                          }}
                        />
                        <Title level={4} style={{ marginTop: 16 }}>
                          {module.module}
                        </Title>
                        <Text type="secondary">
                          {module.tenants} firma kullanıyor
                        </Text>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Sistem Performansı" key="performance">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="Sistem Metrikleri" bordered={false}>
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart data={performanceData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name="Mevcut"
                      dataKey="A"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.6}
                    />
                    <Radar
                      name="Hedef"
                      dataKey="B"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      fillOpacity={0.6}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Kaynak Kullanımı" bordered={false}>
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text>CPU Kullanımı</Text>
                      <Text strong>78%</Text>
                    </div>
                    <Progress percent={78} strokeColor="#1890ff" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text>Bellek Kullanımı</Text>
                      <Text strong>65%</Text>
                    </div>
                    <Progress percent={65} strokeColor="#52c41a" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text>Disk Kullanımı</Text>
                      <Text strong>45%</Text>
                    </div>
                    <Progress percent={45} strokeColor="#faad14" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text>Network I/O</Text>
                      <Text strong>88%</Text>
                    </div>
                    <Progress percent={88} strokeColor="#722ed1" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text>Database Connections</Text>
                      <Text strong>320/500</Text>
                    </div>
                    <Progress percent={64} strokeColor="#fa541c" />
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default MasterAnalyticsPage;