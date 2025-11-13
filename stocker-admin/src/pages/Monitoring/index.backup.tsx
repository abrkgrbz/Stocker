import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Progress, 
  Badge, 
  Alert, 
  Table, 
  Tag, 
  Space, 
  Typography, 
  Button, 
  Select, 
  Tabs, 
  List, 
  Timeline, 
  Tooltip, 
  Divider,
  Switch,
  Modal,
  Form,
  Input,
  InputNumber,
  Radio,
  Checkbox,
  notification,
  message 
} from 'antd';
import {
  MonitorOutlined,
  DashboardOutlined,
  CloudServerOutlined,
  DatabaseOutlined,
  ApiOutlined,
  WifiOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  RiseOutlined,
  FallOutlined,
  SyncOutlined,
  ReloadOutlined,
  SettingOutlined,
  BellOutlined,
  MailOutlined,
  MobileOutlined,
  DesktopOutlined,
  GlobalOutlined,
  FireOutlined,
  BugOutlined,
  RocketOutlined,
  HeartOutlined,
  LineChartOutlined,
  BarChartOutlined,
  AreaChartOutlined,
  PieChartOutlined,
  RadarChartOutlined,
  HeatMapOutlined,
  AlertOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  DownloadOutlined,
  UpOutlined,
  DownOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';
import { Line, Area, Column, Gauge, RingProgress, Pie } from '@ant-design/plots';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);
dayjs.locale('tr');

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  change: number;
}

interface ServiceStatus {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'degraded' | 'maintenance';
  uptime: number;
  responseTime: number;
  errorRate: number;
  lastCheck: string;
  incidents: number;
}

interface ServerMetric {
  id: string;
  name: string;
  type: 'web' | 'database' | 'cache' | 'queue';
  cpu: number;
  memory: number;
  disk: number;
  network: { in: number; out: number };
  status: 'healthy' | 'warning' | 'critical';
}

interface AlertRule {
  id: string;
  name: string;
  metric: string;
  condition: string;
  threshold: number;
  severity: 'info' | 'warning' | 'error' | 'critical';
  enabled: boolean;
  notifications: string[];
  lastTriggered?: string;
  triggerCount: number;
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  service: string;
  message: string;
  details?: any;
}

const MonitoringPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000);
  const [timeRange, setTimeRange] = useState('1h');
  const [alertModalVisible, setAlertModalVisible] = useState(false);
  const [alertForm] = Form.useForm();

  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([
    {
      name: 'CPU Kullanımı',
      value: 65.4,
      unit: '%',
      status: 'normal',
      trend: 'up',
      change: 5.2
    },
    {
      name: 'Bellek Kullanımı',
      value: 72.8,
      unit: '%',
      status: 'warning',
      trend: 'up',
      change: 8.3
    },
    {
      name: 'Disk Kullanımı',
      value: 45.2,
      unit: '%',
      status: 'normal',
      trend: 'stable',
      change: 0.5
    },
    {
      name: 'Ağ Trafiği',
      value: 125.6,
      unit: 'Mbps',
      status: 'normal',
      trend: 'down',
      change: -12.4
    }
  ]);

  const [services, setServices] = useState<ServiceStatus[]>([
    {
      id: '1',
      name: 'Web Application',
      status: 'online',
      uptime: 99.98,
      responseTime: 124,
      errorRate: 0.02,
      lastCheck: dayjs().toISOString(),
      incidents: 0
    },
    {
      id: '2',
      name: 'API Gateway',
      status: 'online',
      uptime: 99.95,
      responseTime: 89,
      errorRate: 0.05,
      lastCheck: dayjs().toISOString(),
      incidents: 0
    },
    {
      id: '3',
      name: 'Database',
      status: 'online',
      uptime: 99.99,
      responseTime: 12,
      errorRate: 0.01,
      lastCheck: dayjs().toISOString(),
      incidents: 0
    },
    {
      id: '4',
      name: 'Cache Server',
      status: 'degraded',
      uptime: 98.5,
      responseTime: 245,
      errorRate: 1.5,
      lastCheck: dayjs().toISOString(),
      incidents: 2
    },
    {
      id: '5',
      name: 'Message Queue',
      status: 'online',
      uptime: 99.9,
      responseTime: 34,
      errorRate: 0.1,
      lastCheck: dayjs().toISOString(),
      incidents: 0
    },
    {
      id: '6',
      name: 'Storage Service',
      status: 'maintenance',
      uptime: 99.7,
      responseTime: 156,
      errorRate: 0.3,
      lastCheck: dayjs().toISOString(),
      incidents: 1
    }
  ]);

  const [servers, setServers] = useState<ServerMetric[]>([
    {
      id: '1',
      name: 'web-server-01',
      type: 'web',
      cpu: 45,
      memory: 62,
      disk: 38,
      network: { in: 85, out: 92 },
      status: 'healthy'
    },
    {
      id: '2',
      name: 'web-server-02',
      type: 'web',
      cpu: 52,
      memory: 68,
      disk: 41,
      network: { in: 78, out: 85 },
      status: 'healthy'
    },
    {
      id: '3',
      name: 'db-master-01',
      type: 'database',
      cpu: 78,
      memory: 85,
      disk: 72,
      network: { in: 125, out: 98 },
      status: 'warning'
    },
    {
      id: '4',
      name: 'cache-01',
      type: 'cache',
      cpu: 25,
      memory: 45,
      disk: 15,
      network: { in: 45, out: 52 },
      status: 'healthy'
    }
  ]);

  const [alertRules, setAlertRules] = useState<AlertRule[]>([
    {
      id: '1',
      name: 'Yüksek CPU Kullanımı',
      metric: 'cpu',
      condition: '>',
      threshold: 80,
      severity: 'warning',
      enabled: true,
      notifications: ['email', 'slack'],
      lastTriggered: '2024-01-15 14:30',
      triggerCount: 5
    },
    {
      id: '2',
      name: 'Bellek Doluluk Uyarısı',
      metric: 'memory',
      condition: '>',
      threshold: 90,
      severity: 'critical',
      enabled: true,
      notifications: ['email', 'sms'],
      triggerCount: 2
    },
    {
      id: '3',
      name: 'Disk Alanı Kritik',
      metric: 'disk',
      condition: '>',
      threshold: 95,
      severity: 'critical',
      enabled: true,
      notifications: ['email', 'slack', 'sms'],
      triggerCount: 0
    },
    {
      id: '4',
      name: 'Yüksek Hata Oranı',
      metric: 'error_rate',
      condition: '>',
      threshold: 1,
      severity: 'error',
      enabled: true,
      notifications: ['email'],
      lastTriggered: '2024-01-14 10:15',
      triggerCount: 8
    }
  ]);

  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: '1',
      timestamp: dayjs().subtract(5, 'minutes').toISOString(),
      level: 'info',
      service: 'Web Application',
      message: 'Application started successfully'
    },
    {
      id: '2',
      timestamp: dayjs().subtract(15, 'minutes').toISOString(),
      level: 'warning',
      service: 'Cache Server',
      message: 'High memory usage detected: 85%'
    },
    {
      id: '3',
      timestamp: dayjs().subtract(30, 'minutes').toISOString(),
      level: 'error',
      service: 'API Gateway',
      message: 'Connection timeout to database',
      details: { duration: 5000, retries: 3 }
    },
    {
      id: '4',
      timestamp: dayjs().subtract(1, 'hour').toISOString(),
      level: 'info',
      service: 'Database',
      message: 'Backup completed successfully'
    }
  ]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        refreshMetrics();
      }, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const refreshMetrics = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      // Update metrics with random variations
      setSystemMetrics(prev => prev.map(metric => ({
        ...metric,
        value: Math.max(0, Math.min(100, metric.value + (Math.random() - 0.5) * 10)),
        change: (Math.random() - 0.5) * 20
      })));
      setLoading(false);
    }, 500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'healthy':
      case 'normal':
        return '#52c41a';
      case 'degraded':
      case 'warning':
        return '#faad14';
      case 'offline':
      case 'critical':
      case 'error':
        return '#ff4d4f';
      case 'maintenance':
        return '#1890ff';
      default:
        return '#d9d9d9';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'healthy':
      case 'normal':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'degraded':
      case 'warning':
        return <ExclamationCircleOutlined style={{ color: '#faad14' }} />;
      case 'offline':
      case 'critical':
      case 'error':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'maintenance':
        return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
      default:
        return <InfoCircleOutlined />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'info': return 'blue';
      case 'warning': return 'orange';
      case 'error': return 'red';
      case 'debug': return 'default';
      default: return 'default';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'red';
      case 'error': return 'orange';
      case 'warning': return 'gold';
      case 'info': return 'blue';
      default: return 'default';
    }
  };

  // Chart data
  const cpuTrendData = Array.from({ length: 20 }, (_, i) => ({
    time: dayjs().subtract(20 - i, 'minutes').format('HH:mm'),
    value: 45 + Math.random() * 30
  }));

  const memoryTrendData = Array.from({ length: 20 }, (_, i) => ({
    time: dayjs().subtract(20 - i, 'minutes').format('HH:mm'),
    value: 60 + Math.random() * 25
  }));

  const networkData = Array.from({ length: 20 }, (_, i) => ({
    time: dayjs().subtract(20 - i, 'minutes').format('HH:mm'),
    in: 80 + Math.random() * 40,
    out: 70 + Math.random() * 35
  }));

  const lineConfig = {
    data: cpuTrendData,
    xField: 'time',
    yField: 'value',
    smooth: true,
    point: {
      size: 3,
    },
    yAxis: {
      max: 100,
      min: 0,
    },
  };

  const areaConfig = {
    data: networkData,
    xField: 'time',
    yField: ['in', 'out'],
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
  };

  const handleCreateAlert = () => {
    alertForm.validateFields().then(values => {
      const newAlert: AlertRule = {
        id: Date.now().toString(),
        ...values,
        enabled: true,
        triggerCount: 0
      };
      setAlertRules([...alertRules, newAlert]);
      message.success('Uyarı kuralı oluşturuldu');
      setAlertModalVisible(false);
      alertForm.resetFields();
    });
  };

  const serviceColumns = [
    {
      title: 'Servis',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: ServiceStatus) => (
        <Space>
          {getStatusIcon(record.status)}
          <Text strong>{text}</Text>
        </Space>
      )
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge
          status={status === 'online' ? 'success' :
                 status === 'degraded' ? 'warning' :
                 status === 'offline' ? 'error' : 'processing'}
          text={status === 'online' ? 'Çevrimiçi' :
               status === 'degraded' ? 'Düşük Performans' :
               status === 'offline' ? 'Çevrimdışı' : 'Bakımda'}
        />
      )
    },
    {
      title: 'Uptime',
      dataIndex: 'uptime',
      key: 'uptime',
      render: (uptime: number) => (
        <Progress
          percent={uptime}
          size="small"
          status={uptime < 99 ? 'exception' : 'success'}
          format={(percent) => `${percent}%`}
        />
      )
    },
    {
      title: 'Yanıt Süresi',
      dataIndex: 'responseTime',
      key: 'responseTime',
      render: (time: number) => (
        <Text type={time > 200 ? 'danger' : time > 100 ? 'warning' : 'success'}>
          {time}ms
        </Text>
      )
    },
    {
      title: 'Hata Oranı',
      dataIndex: 'errorRate',
      key: 'errorRate',
      render: (rate: number) => (
        <Text type={rate > 1 ? 'danger' : rate > 0.5 ? 'warning' : 'success'}>
          {rate.toFixed(2)}%
        </Text>
      )
    },
    {
      title: 'Son Kontrol',
      dataIndex: 'lastCheck',
      key: 'lastCheck',
      render: (date: string) => dayjs(date).fromNow()
    }
  ];

  const alertColumns = [
    {
      title: 'Kural',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong>{text}</Text>
    },
    {
      title: 'Metrik',
      dataIndex: 'metric',
      key: 'metric',
      render: (metric: string) => <Tag>{metric.toUpperCase()}</Tag>
    },
    {
      title: 'Koşul',
      key: 'condition',
      render: (_: any, record: AlertRule) => (
        <Text code>{`${record.condition} ${record.threshold}`}</Text>
      )
    },
    {
      title: 'Önem',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity: string) => (
        <Tag color={getSeverityColor(severity)}>
          {severity.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Durum',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled: boolean) => (
        <Switch
          checked={enabled}
          checkedChildren="Aktif"
          unCheckedChildren="Pasif"
        />
      )
    },
    {
      title: 'Tetiklenme',
      key: 'triggers',
      render: (_: any, record: AlertRule) => (
        <Space direction="vertical" size={0}>
          <Text>{record.triggerCount} kez</Text>
          {record.lastTriggered && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              Son: {dayjs(record.lastTriggered).fromNow()}
            </Text>
          )}
        </Space>
      )
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: () => (
        <Space>
          <Button size="small" icon={<EditOutlined />}>Düzenle</Button>
          <Button size="small" icon={<DeleteOutlined />} danger>Sil</Button>
        </Space>
      )
    }
  ];

  const logColumns = [
    {
      title: 'Zaman',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp: string) => dayjs(timestamp).format('HH:mm:ss')
    },
    {
      title: 'Seviye',
      dataIndex: 'level',
      key: 'level',
      render: (level: string) => (
        <Tag color={getLevelColor(level)}>
          {level.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Servis',
      dataIndex: 'service',
      key: 'service'
    },
    {
      title: 'Mesaj',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true
    },
    {
      title: 'Detay',
      key: 'details',
      render: (_: any, record: LogEntry) => 
        record.details && (
          <Tooltip title={JSON.stringify(record.details, null, 2)}>
            <Button size="small" icon={<EyeOutlined />} />
          </Tooltip>
        )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={12}>
            <Space align="center">
              <MonitorOutlined style={{ fontSize: 24, color: '#1890ff' }} />
              <div>
                <Title level={4} style={{ margin: 0 }}>
                  Sistem İzleme
                </Title>
                <Space>
                  <Badge status="processing" />
                  <Text type="secondary">
                    {services.filter(s => s.status === 'online').length}/{services.length} servis aktif
                  </Text>
                </Space>
              </div>
            </Space>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Space>
              <Select value={timeRange} onChange={setTimeRange} style={{ width: 120 }}>
                <Option value="1h">Son 1 Saat</Option>
                <Option value="6h">Son 6 Saat</Option>
                <Option value="24h">Son 24 Saat</Option>
                <Option value="7d">Son 7 Gün</Option>
              </Select>
              <Button
                type={autoRefresh ? 'primary' : 'default'}
                icon={<SyncOutlined spin={autoRefresh} />}
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                {autoRefresh ? 'Otomatik Yenileme' : 'Durduruldu'}
              </Button>
              <Button icon={<ReloadOutlined />} onClick={refreshMetrics}>
                Yenile
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* System Metrics Overview */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        {systemMetrics.map((metric, index) => (
          <Col span={6} key={index}>
            <Card bordered={false}>
              <Statistic
                title={metric.name}
                value={metric.value}
                precision={1}
                suffix={metric.unit}
                valueStyle={{
                  color: metric.status === 'warning' ? '#faad14' :
                        metric.status === 'critical' ? '#ff4d4f' : undefined
                }}
                prefix={
                  metric.trend === 'up' ? <ArrowUpOutlined /> :
                  metric.trend === 'down' ? <ArrowDownOutlined /> : null
                }
              />
              <div style={{ marginTop: 8 }}>
                <Text type={metric.change > 0 ? 'danger' : 'success'}>
                  {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                </Text>
                <Text type="secondary" style={{ marginLeft: 8 }}>
                  son 1 saatte
                </Text>
              </div>
              <Line
                data={Array.from({ length: 10 }, (_, i) => ({ x: i, y: Math.random() * 100 }))}
                xField="x"
                yField="y"
                height={40}
                smooth
                color={getStatusColor(metric.status)}
                axis={false}
                point={false}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Card bordered={false}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Genel Bakış" key="overview">
            <Row gutter={16}>
              <Col span={12}>
                <Card title="CPU Kullanımı" size="small">
                  <Line {...lineConfig} height={200} />
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Bellek Kullanımı" size="small">
                  <Line {...{ ...lineConfig, data: memoryTrendData }} height={200} />
                </Card>
              </Col>
            </Row>

            <Divider />

            <Row gutter={16}>
              <Col span={24}>
                <Card title="Ağ Trafiği (Mbps)" size="small">
                  <Area {...areaConfig} height={200} />
                </Card>
              </Col>
            </Row>

            <Divider />

            <Card title="Servis Durumları" size="small">
              <Table
                columns={serviceColumns}
                dataSource={services}
                rowKey="id"
                pagination={false}
                size="small"
              />
            </Card>
          </TabPane>

          <TabPane tab="Sunucular" key="servers">
            <Row gutter={[16, 16]}>
              {servers.map(server => (
                <Col span={12} key={server.id}>
                  <Card
                    title={
                      <Space>
                        {getStatusIcon(server.status)}
                        <Text strong>{server.name}</Text>
                        <Tag>{server.type}</Tag>
                      </Space>
                    }
                    extra={
                      <Badge
                        status={server.status === 'healthy' ? 'success' :
                               server.status === 'warning' ? 'warning' : 'error'}
                        text={server.status === 'healthy' ? 'Sağlıklı' :
                             server.status === 'warning' ? 'Uyarı' : 'Kritik'}
                      />
                    }
                  >
                    <Row gutter={16}>
                      <Col span={12}>
                        <div style={{ marginBottom: 16 }}>
                          <Text type="secondary">CPU</Text>
                          <Progress
                            percent={server.cpu}
                            status={server.cpu > 80 ? 'exception' : 'normal'}
                            strokeColor={{
                              '0%': '#108ee9',
                              '100%': server.cpu > 80 ? '#ff4d4f' : '#87d068',
                            }}
                          />
                        </div>
                        <div>
                          <Text type="secondary">Bellek</Text>
                          <Progress
                            percent={server.memory}
                            status={server.memory > 85 ? 'exception' : 'normal'}
                            strokeColor={{
                              '0%': '#108ee9',
                              '100%': server.memory > 85 ? '#ff4d4f' : '#87d068',
                            }}
                          />
                        </div>
                      </Col>
                      <Col span={12}>
                        <div style={{ marginBottom: 16 }}>
                          <Text type="secondary">Disk</Text>
                          <Progress
                            percent={server.disk}
                            status={server.disk > 90 ? 'exception' : 'normal'}
                          />
                        </div>
                        <div>
                          <Text type="secondary">Ağ (In/Out)</Text>
                          <Space>
                            <Tag color="blue">↓ {server.network.in} Mbps</Tag>
                            <Tag color="green">↑ {server.network.out} Mbps</Tag>
                          </Space>
                        </div>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              ))}
            </Row>
          </TabPane>

          <TabPane tab="Uyarılar" key="alerts">
            <Alert
              message="Uyarı Sistemi"
              description="Sistem metriklerini izleyin ve kritik durumlar için otomatik uyarılar alın."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Space style={{ marginBottom: 16 }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setAlertModalVisible(true)}>
                Yeni Uyarı Kuralı
              </Button>
              <Button icon={<BellOutlined />}>Test Uyarısı</Button>
            </Space>

            <Table
              columns={alertColumns}
              dataSource={alertRules}
              rowKey="id"
              pagination={false}
            />

            <Divider />

            <Title level={5}>Son Uyarılar</Title>
            <Timeline>
              <Timeline.Item color="red">
                <Space direction="vertical" size={0}>
                  <Text strong>Yüksek CPU Kullanımı</Text>
                  <Text type="secondary">db-master-01 sunucusunda CPU %92</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {dayjs().subtract(10, 'minutes').fromNow()}
                  </Text>
                </Space>
              </Timeline.Item>
              <Timeline.Item color="orange">
                <Space direction="vertical" size={0}>
                  <Text strong>Bellek Uyarısı</Text>
                  <Text type="secondary">web-server-02 bellek kullanımı %85</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {dayjs().subtract(30, 'minutes').fromNow()}
                  </Text>
                </Space>
              </Timeline.Item>
              <Timeline.Item color="green">
                <Space direction="vertical" size={0}>
                  <Text strong>Servis Yeniden Başlatıldı</Text>
                  <Text type="secondary">Cache Server otomatik olarak yeniden başlatıldı</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {dayjs().subtract(1, 'hour').fromNow()}
                  </Text>
                </Space>
              </Timeline.Item>
            </Timeline>
          </TabPane>

          <TabPane tab="Loglar" key="logs">
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Select placeholder="Seviye" style={{ width: '100%' }}>
                  <Option value="all">Tümü</Option>
                  <Option value="info">Info</Option>
                  <Option value="warning">Warning</Option>
                  <Option value="error">Error</Option>
                  <Option value="debug">Debug</Option>
                </Select>
              </Col>
              <Col span={6}>
                <Select placeholder="Servis" style={{ width: '100%' }}>
                  <Option value="all">Tüm Servisler</Option>
                  {services.map(s => (
                    <Option key={s.id} value={s.name}>{s.name}</Option>
                  ))}
                </Select>
              </Col>
              <Col span={6}>
                <Input.Search placeholder="Log ara..." />
              </Col>
              <Col span={6}>
                <Button icon={<DownloadOutlined />}>Logları İndir</Button>
              </Col>
            </Row>

            <Table
              columns={logColumns}
              dataSource={logs}
              rowKey="id"
              pagination={{ pageSize: 20 }}
              size="small"
            />
          </TabPane>

          <TabPane tab="Performans" key="performance">
            <Row gutter={16}>
              <Col span={8}>
                <Card bordered={false}>
                  <Statistic
                    title="Ortalama Yanıt Süresi"
                    value={156}
                    suffix="ms"
                    prefix={<ThunderboltOutlined />}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card bordered={false}>
                  <Statistic
                    title="İstek/Saniye"
                    value={2456}
                    prefix={<ApiOutlined />}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card bordered={false}>
                  <Statistic
                    title="Aktif Bağlantı"
                    value={1234}
                    prefix={<WifiOutlined />}
                  />
                </Card>
              </Col>
            </Row>

            <Divider />

            <Row gutter={16}>
              <Col span={12}>
                <Card title="İstek Dağılımı" size="small">
                  <Column
                    data={[
                      { type: 'GET', count: 5234 },
                      { type: 'POST', count: 2341 },
                      { type: 'PUT', count: 876 },
                      { type: 'DELETE', count: 234 }
                    ]}
                    xField="type"
                    yField="count"
                    height={200}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Yanıt Kodu Dağılımı" size="small">
                  <Pie
                    data={[
                      { type: '2xx', value: 8765 },
                      { type: '3xx', value: 1234 },
                      { type: '4xx', value: 456 },
                      { type: '5xx', value: 89 }
                    ]}
                    angleField="value"
                    colorField="type"
                    height={200}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Card>

      {/* Alert Rule Modal */}
      <Modal
        title="Yeni Uyarı Kuralı"
        visible={alertModalVisible}
        onOk={handleCreateAlert}
        onCancel={() => setAlertModalVisible(false)}
        width={600}
      >
        <Form form={alertForm} layout="vertical">
          <Form.Item
            name="name"
            label="Kural Adı"
            rules={[{ required: true, message: 'Kural adı gereklidir' }]}
          >
            <Input placeholder="Örn: Yüksek CPU Kullanımı" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="metric"
                label="Metrik"
                rules={[{ required: true, message: 'Metrik seçiniz' }]}
              >
                <Select placeholder="Metrik seçiniz">
                  <Option value="cpu">CPU</Option>
                  <Option value="memory">Bellek</Option>
                  <Option value="disk">Disk</Option>
                  <Option value="network">Ağ</Option>
                  <Option value="error_rate">Hata Oranı</Option>
                  <Option value="response_time">Yanıt Süresi</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="severity"
                label="Önem Derecesi"
                rules={[{ required: true, message: 'Önem derecesi seçiniz' }]}
              >
                <Select placeholder="Önem seçiniz">
                  <Option value="info">Bilgi</Option>
                  <Option value="warning">Uyarı</Option>
                  <Option value="error">Hata</Option>
                  <Option value="critical">Kritik</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="condition"
                label="Koşul"
                rules={[{ required: true, message: 'Koşul seçiniz' }]}
              >
                <Select placeholder="Koşul seçiniz">
                  <Option value=">">Büyüktür</Option>
                  <Option value="<">Küçüktür</Option>
                  <Option value="=">Eşittir</Option>
                  <Option value=">=">Büyük Eşit</Option>
                  <Option value="<=">Küçük Eşit</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="threshold"
                label="Eşik Değeri"
                rules={[{ required: true, message: 'Eşik değeri giriniz' }]}
              >
                <InputNumber min={0} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="notifications"
            label="Bildirim Kanalları"
            rules={[{ required: true, message: 'En az bir kanal seçiniz' }]}
          >
            <Checkbox.Group>
              <Checkbox value="email">E-posta</Checkbox>
              <Checkbox value="sms">SMS</Checkbox>
              <Checkbox value="slack">Slack</Checkbox>
              <Checkbox value="webhook">Webhook</Checkbox>
            </Checkbox.Group>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MonitoringPage;