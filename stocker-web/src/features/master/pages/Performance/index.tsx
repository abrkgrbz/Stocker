import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Progress,
  Statistic,
  Table,
  Tag,
  Alert,
  Button,
  Space,
  Typography,
  Timeline,
  Badge,
  Tabs,
  List,
  Avatar,
  Tooltip,
  Select,
  DatePicker,
} from 'antd';
import {
  ThunderboltOutlined,
  ClockCircleOutlined,
  CloudServerOutlined,
  DatabaseOutlined,
  ApiOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  RiseOutlined,
  FallOutlined,
  ReloadOutlined,
  SettingOutlined,
  DashboardOutlined,
  DesktopOutlined,
  GlobalOutlined,
  WifiOutlined,
} from '@ant-design/icons';
import { Line, Area } from '@/components/LazyChart';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
}

interface ServerStatus {
  id: string;
  name: string;
  type: string;
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  status: 'online' | 'offline' | 'maintenance';
  uptime: string;
  lastCheck: string;
}

const MasterPerformancePage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [selectedServer, setSelectedServer] = useState<string>('all');
  const [timeRange, setTimeRange] = useState('1h');

  // Mock real-time data
  const [realtimeData, setRealtimeData] = useState<any[]>([]);

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      const newData = {
        time: new Date().toLocaleTimeString(),
        cpu: Math.floor(Math.random() * 30 + 50),
        memory: Math.floor(Math.random() * 20 + 60),
        requests: Math.floor(Math.random() * 500 + 1000),
        responseTime: Math.floor(Math.random() * 50 + 100),
      };
      
      setRealtimeData(prev => {
        const updated = [...prev, newData];
        return updated.slice(-20); // Keep last 20 data points
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const performanceMetrics: PerformanceMetric[] = [
    {
      id: '1',
      name: 'Response Time',
      value: 125,
      unit: 'ms',
      status: 'good',
      trend: 'down',
      trendValue: 15,
    },
    {
      id: '2',
      name: 'Throughput',
      value: 1500,
      unit: 'req/s',
      status: 'good',
      trend: 'up',
      trendValue: 8,
    },
    {
      id: '3',
      name: 'Error Rate',
      value: 0.2,
      unit: '%',
      status: 'good',
      trend: 'down',
      trendValue: 5,
    },
    {
      id: '4',
      name: 'Apdex Score',
      value: 0.95,
      unit: '',
      status: 'good',
      trend: 'stable',
      trendValue: 0,
    },
  ];

  const servers: ServerStatus[] = [
    {
      id: '1',
      name: 'API Server 1',
      type: 'Application',
      cpu: 65,
      memory: 72,
      disk: 45,
      network: 88,
      status: 'online',
      uptime: '45 days',
      lastCheck: '2 seconds ago',
    },
    {
      id: '2',
      name: 'Database Primary',
      type: 'Database',
      cpu: 45,
      memory: 85,
      disk: 78,
      network: 65,
      status: 'online',
      uptime: '120 days',
      lastCheck: '5 seconds ago',
    },
    {
      id: '3',
      name: 'Cache Server',
      type: 'Cache',
      cpu: 25,
      memory: 45,
      disk: 20,
      network: 92,
      status: 'online',
      uptime: '30 days',
      lastCheck: '3 seconds ago',
    },
    {
      id: '4',
      name: 'Load Balancer',
      type: 'Network',
      cpu: 35,
      memory: 40,
      disk: 15,
      network: 95,
      status: 'online',
      uptime: '180 days',
      lastCheck: '1 second ago',
    },
  ];

  const apiEndpoints = [
    { endpoint: '/api/auth/login', avgTime: 120, calls: 15420, errors: 12, errorRate: 0.08 },
    { endpoint: '/api/tenants', avgTime: 85, calls: 8932, errors: 5, errorRate: 0.06 },
    { endpoint: '/api/users', avgTime: 95, calls: 12543, errors: 8, errorRate: 0.06 },
    { endpoint: '/api/reports', avgTime: 450, calls: 3421, errors: 45, errorRate: 1.31 },
    { endpoint: '/api/analytics', avgTime: 320, calls: 5678, errors: 23, errorRate: 0.41 },
  ];

  const slowQueries = [
    {
      query: 'SELECT * FROM tenants JOIN subscriptions...',
      duration: 2.5,
      executions: 145,
      database: 'Master',
    },
    {
      query: 'UPDATE users SET last_login = NOW()...',
      duration: 1.8,
      executions: 3421,
      database: 'Tenant_001',
    },
    {
      query: 'SELECT COUNT(*) FROM transactions WHERE...',
      duration: 1.5,
      executions: 892,
      database: 'Analytics',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
      case 'online':
        return 'success';
      case 'warning':
      case 'maintenance':
        return 'warning';
      case 'critical':
      case 'offline':
        return 'error';
      default:
        return 'default';
    }
  };

  const getProgressColor = (value: number) => {
    if (value < 50) return '#52c41a';
    if (value < 75) return '#faad14';
    return '#f5222d';
  };

  return (
    <div className="master-performance-page">
      {/* Header */}
      <Card style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Select
                value={selectedServer}
                onChange={setSelectedServer}
                style={{ width: 200 }}
              >
                <Select.Option value="all">Tüm Sunucular</Select.Option>
                {servers.map(server => (
                  <Select.Option key={server.id} value={server.id}>
                    {server.name}
                  </Select.Option>
                ))}
              </Select>
              <Select
                value={timeRange}
                onChange={setTimeRange}
                style={{ width: 150 }}
              >
                <Select.Option value="1h">Son 1 Saat</Select.Option>
                <Select.Option value="6h">Son 6 Saat</Select.Option>
                <Select.Option value="24h">Son 24 Saat</Select.Option>
                <Select.Option value="7d">Son 7 Gün</Select.Option>
              </Select>
              <Button icon={<ReloadOutlined />} onClick={() => setLoading(true)}>
                Yenile
              </Button>
            </Space>
          </Col>
          <Col>
            <Space>
              <Badge status="processing" text="Canlı İzleme Aktif" />
              <Button icon={<SettingOutlined />}>Ayarlar</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Key Performance Indicators */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {performanceMetrics.map(metric => (
          <Col xs={24} sm={12} lg={6} key={metric.id}>
            <Card>
              <Statistic
                title={metric.name}
                value={metric.value}
                suffix={metric.unit}
                valueStyle={{ color: getStatusColor(metric.status) === 'success' ? '#3f8600' : undefined }}
                prefix={
                  metric.trend === 'up' ? <RiseOutlined /> :
                  metric.trend === 'down' ? <FallOutlined /> :
                  null
                }
              />
              <div style={{ marginTop: 8 }}>
                <Tag color={getStatusColor(metric.status)}>
                  {metric.status.toUpperCase()}
                </Tag>
                {metric.trend !== 'stable' && (
                  <Text type="secondary" style={{ marginLeft: 8 }}>
                    {metric.trend === 'up' ? '+' : '-'}{metric.trendValue}%
                  </Text>
                )}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Tabs defaultActiveKey="realtime">
        <TabPane tab="Gerçek Zamanlı İzleme" key="realtime">
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card title="Sistem Metrikleri" bordered={false}>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={realtimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <ChartTooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="cpu"
                      stroke="#8884d8"
                      name="CPU %"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="memory"
                      stroke="#82ca9d"
                      name="Memory %"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="responseTime"
                      stroke="#ffc658"
                      name="Response Time (ms)"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Sunucu Durumu" key="servers">
          <Row gutter={[16, 16]}>
            {servers.map(server => (
              <Col xs={24} sm={12} lg={6} key={server.id}>
                <Card
                  title={
                    <Space>
                      <Badge status={server.status === 'online' ? 'success' : 'error'} />
                      {server.name}
                    </Space>
                  }
                  extra={<Tag color={getStatusColor(server.status)}>{server.status}</Tag>}
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Text type="secondary">CPU</Text>
                      <Progress
                        percent={server.cpu}
                        strokeColor={getProgressColor(server.cpu)}
                        size="small"
                      />
                    </div>
                    <div>
                      <Text type="secondary">Memory</Text>
                      <Progress
                        percent={server.memory}
                        strokeColor={getProgressColor(server.memory)}
                        size="small"
                      />
                    </div>
                    <div>
                      <Text type="secondary">Disk</Text>
                      <Progress
                        percent={server.disk}
                        strokeColor={getProgressColor(server.disk)}
                        size="small"
                      />
                    </div>
                    <div>
                      <Text type="secondary">Network</Text>
                      <Progress
                        percent={server.network}
                        strokeColor={getProgressColor(server.network)}
                        size="small"
                      />
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <Text type="secondary">Uptime: </Text>
                      <Text strong>{server.uptime}</Text>
                    </div>
                    <div>
                      <Text type="secondary">Last Check: </Text>
                      <Text>{server.lastCheck}</Text>
                    </div>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </TabPane>

        <TabPane tab="API Performansı" key="api">
          <Card title="API Endpoint Performansı" bordered={false}>
            <Table
              dataSource={apiEndpoints}
              columns={[
                {
                  title: 'Endpoint',
                  dataIndex: 'endpoint',
                  key: 'endpoint',
                  render: (text) => <Text code>{text}</Text>,
                },
                {
                  title: 'Ortalama Süre',
                  dataIndex: 'avgTime',
                  key: 'avgTime',
                  render: (time) => {
                    const color = time < 200 ? 'success' : time < 500 ? 'warning' : 'error';
                    return <Tag color={color}>{time}ms</Tag>;
                  },
                },
                {
                  title: 'Toplam Çağrı',
                  dataIndex: 'calls',
                  key: 'calls',
                  render: (calls) => calls.toLocaleString('tr-TR'),
                },
                {
                  title: 'Hata Sayısı',
                  dataIndex: 'errors',
                  key: 'errors',
                },
                {
                  title: 'Hata Oranı',
                  dataIndex: 'errorRate',
                  key: 'errorRate',
                  render: (rate) => {
                    const color = rate < 0.1 ? 'success' : rate < 1 ? 'warning' : 'error';
                    return <Tag color={color}>{rate.toFixed(2)}%</Tag>;
                  },
                },
              ]}
              pagination={false}
              rowKey="endpoint"
            />
          </Card>
        </TabPane>

        <TabPane tab="Veritabanı" key="database">
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Alert
                message="Yavaş Sorgu Uyarısı"
                description="3 adet yavaş çalışan sorgu tespit edildi. Lütfen optimize ediniz."
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
              />
            </Col>
            <Col span={24}>
              <Card title="Yavaş Sorgular" bordered={false}>
                <Table
                  dataSource={slowQueries}
                  columns={[
                    {
                      title: 'Sorgu',
                      dataIndex: 'query',
                      key: 'query',
                      render: (text) => (
                        <Tooltip title={text}>
                          <Text code style={{ maxWidth: 300, display: 'inline-block' }} ellipsis>
                            {text}
                          </Text>
                        </Tooltip>
                      ),
                    },
                    {
                      title: 'Süre',
                      dataIndex: 'duration',
                      key: 'duration',
                      render: (duration) => (
                        <Tag color={duration > 2 ? 'error' : 'warning'}>
                          {duration}s
                        </Tag>
                      ),
                    },
                    {
                      title: 'Çalıştırma',
                      dataIndex: 'executions',
                      key: 'executions',
                    },
                    {
                      title: 'Veritabanı',
                      dataIndex: 'database',
                      key: 'database',
                      render: (db) => <Tag>{db}</Tag>,
                    },
                  ]}
                  pagination={false}
                  rowKey="query"
                />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Bağlantı Havuzu" bordered={false}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text>Aktif Bağlantılar</Text>
                      <Text strong>85/100</Text>
                    </div>
                    <Progress percent={85} strokeColor="#1890ff" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text>Bekleyen İşlemler</Text>
                      <Text strong>12</Text>
                    </div>
                    <Progress percent={12} strokeColor="#52c41a" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text>Zaman Aşımı</Text>
                      <Text strong>3</Text>
                    </div>
                    <Progress percent={3} strokeColor="#faad14" />
                  </div>
                </Space>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Cache Performansı" bordered={false}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Statistic
                    title="Cache Hit Rate"
                    value={92.5}
                    suffix="%"
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: '#3f8600' }}
                  />
                  <Row gutter={16}>
                    <Col span={12}>
                      <Statistic title="Hits" value={125432} />
                    </Col>
                    <Col span={12}>
                      <Statistic title="Misses" value={10234} />
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Statistic title="Keys" value={8932} />
                    </Col>
                    <Col span={12}>
                      <Statistic title="Memory" value="256MB" />
                    </Col>
                  </Row>
                </Space>
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default MasterPerformancePage;