import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Badge, 
  Space, 
  Typography, 
  Progress, 
  Alert, 
  List, 
  Tag, 
  Divider,
  Timeline,
  Button,
  Tabs,
  Table,
  Tooltip,
  Empty,
  Collapse,
  message,
  notification
} from 'antd';
import {
  HeartOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  CloudServerOutlined,
  ApiOutlined,
  GlobalOutlined,
  ThunderboltOutlined,
  DashboardOutlined,
  MonitorOutlined,
  BugOutlined,
  SafetyOutlined,
  SyncOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  RocketOutlined,
  FieldTimeOutlined,
  FileProtectOutlined,
  LinkOutlined,
  TeamOutlined,
  MailOutlined,
  BellOutlined,
  ReloadOutlined,
  DownloadOutlined,
  SettingOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { Line, Gauge, TinyLine, TinyColumn, RingProgress } from '@ant-design/plots';
import moment from 'moment';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'critical';
  message: string;
  lastCheck: string;
}

interface ServiceHealth {
  name: string;
  status: 'up' | 'down' | 'degraded';
  responseTime: number;
  uptime: number;
  lastIncident?: string;
  errorRate: number;
  throughput: number;
}

interface SystemMetric {
  cpu: number;
  memory: number;
  disk: number;
  network: {
    in: number;
    out: number;
  };
  connections: number;
  threads: number;
}

interface HealthCheck {
  id: string;
  name: string;
  type: 'http' | 'tcp' | 'database' | 'custom';
  endpoint?: string;
  interval: number;
  timeout: number;
  status: 'passing' | 'warning' | 'failing';
  lastRun: string;
  nextRun: string;
  duration: number;
  message?: string;
}

interface Incident {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'investigating' | 'resolved';
  startTime: string;
  endTime?: string;
  affectedServices: string[];
  description: string;
}

const TenantHealth: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000);
  
  const [overallHealth, setOverallHealth] = useState<HealthStatus>({
    status: 'healthy',
    message: 'Tüm sistemler normal çalışıyor',
    lastCheck: dayjs().toISOString()
  });

  const [systemMetrics, setSystemMetrics] = useState<SystemMetric>({
    cpu: 45,
    memory: 62,
    disk: 38,
    network: { in: 125, out: 89 },
    connections: 234,
    threads: 128
  });

  const [services, setServices] = useState<ServiceHealth[]>([
    {
      name: 'Web API',
      status: 'up',
      responseTime: 124,
      uptime: 99.99,
      errorRate: 0.01,
      throughput: 1250
    },
    {
      name: 'Database',
      status: 'up',
      responseTime: 8,
      uptime: 99.95,
      errorRate: 0.02,
      throughput: 3400
    },
    {
      name: 'Cache (Redis)',
      status: 'up',
      responseTime: 2,
      uptime: 99.98,
      errorRate: 0.001,
      throughput: 8900
    },
    {
      name: 'Message Queue',
      status: 'degraded',
      responseTime: 450,
      uptime: 98.5,
      lastIncident: '2 saat önce',
      errorRate: 2.5,
      throughput: 450
    },
    {
      name: 'Email Service',
      status: 'up',
      responseTime: 340,
      uptime: 99.9,
      errorRate: 0.05,
      throughput: 120
    },
    {
      name: 'Storage (S3)',
      status: 'up',
      responseTime: 156,
      uptime: 99.99,
      errorRate: 0.01,
      throughput: 890
    }
  ]);

  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([
    {
      id: '1',
      name: 'API Health Check',
      type: 'http',
      endpoint: '/api/health',
      interval: 60,
      timeout: 5,
      status: 'passing',
      lastRun: dayjs().subtract(30, 'seconds').toISOString(),
      nextRun: dayjs().add(30, 'seconds').toISOString(),
      duration: 124
    },
    {
      id: '2',
      name: 'Database Connection',
      type: 'database',
      interval: 120,
      timeout: 10,
      status: 'passing',
      lastRun: dayjs().subtract(1, 'minute').toISOString(),
      nextRun: dayjs().add(1, 'minute').toISOString(),
      duration: 8
    },
    {
      id: '3',
      name: 'Redis Ping',
      type: 'tcp',
      endpoint: 'redis:6379',
      interval: 60,
      timeout: 3,
      status: 'passing',
      lastRun: dayjs().subtract(15, 'seconds').toISOString(),
      nextRun: dayjs().add(45, 'seconds').toISOString(),
      duration: 2
    },
    {
      id: '4',
      name: 'Queue Health',
      type: 'custom',
      interval: 180,
      timeout: 15,
      status: 'warning',
      lastRun: dayjs().subtract(2, 'minutes').toISOString(),
      nextRun: dayjs().add(1, 'minute').toISOString(),
      duration: 450,
      message: 'Yüksek mesaj bekleme süresi tespit edildi'
    },
    {
      id: '5',
      name: 'Storage Access',
      type: 'http',
      endpoint: 'https://storage.example.com/health',
      interval: 300,
      timeout: 10,
      status: 'passing',
      lastRun: dayjs().subtract(3, 'minutes').toISOString(),
      nextRun: dayjs().add(2, 'minutes').toISOString(),
      duration: 156
    }
  ]);

  const [incidents, setIncidents] = useState<Incident[]>([
    {
      id: '1',
      title: 'Message Queue Performans Düşüşü',
      severity: 'medium',
      status: 'investigating',
      startTime: dayjs().subtract(2, 'hours').toISOString(),
      affectedServices: ['Message Queue', 'Email Service'],
      description: 'Mesaj kuyruğunda yüksek bekleme süresi tespit edildi. İnceleme devam ediyor.'
    },
    {
      id: '2',
      title: 'API Rate Limit Aşımı',
      severity: 'low',
      status: 'resolved',
      startTime: dayjs().subtract(1, 'day').toISOString(),
      endTime: dayjs().subtract(23, 'hours').toISOString(),
      affectedServices: ['Web API'],
      description: 'Geçici rate limit aşımı. Otomatik ölçekleme ile çözüldü.'
    }
  ]);

  useEffect(() => {
    fetchHealthData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchHealthData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [id, autoRefresh, refreshInterval]);

  const fetchHealthData = async () => {
    setLoading(true);
    // Simulated API call
    setTimeout(() => {
      // Update metrics with random variations
      setSystemMetrics(prev => ({
        cpu: Math.min(100, Math.max(0, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.min(100, Math.max(0, prev.memory + (Math.random() - 0.5) * 5)),
        disk: prev.disk,
        network: {
          in: Math.max(0, prev.network.in + (Math.random() - 0.5) * 20),
          out: Math.max(0, prev.network.out + (Math.random() - 0.5) * 15)
        },
        connections: Math.max(0, prev.connections + Math.floor((Math.random() - 0.5) * 20)),
        threads: Math.max(0, prev.threads + Math.floor((Math.random() - 0.5) * 10))
      }));
      setLoading(false);
    }, 500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'up':
      case 'passing':
      case 'resolved':
        return '#52c41a';
      case 'degraded':
      case 'warning':
      case 'investigating':
        return '#faad14';
      case 'unhealthy':
      case 'down':
      case 'failing':
      case 'active':
        return '#ff4d4f';
      case 'critical':
        return '#cf1322';
      default:
        return '#d9d9d9';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'up':
      case 'passing':
      case 'resolved':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'degraded':
      case 'warning':
      case 'investigating':
        return <WarningOutlined style={{ color: '#faad14' }} />;
      case 'unhealthy':
      case 'down':
      case 'failing':
      case 'active':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'critical':
        return <ExclamationCircleOutlined style={{ color: '#cf1322' }} />;
      default:
        return <InfoCircleOutlined />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'blue';
      case 'medium': return 'orange';
      case 'high': return 'red';
      case 'critical': return 'purple';
      default: return 'default';
    }
  };

  const cpuTrendData = Array.from({ length: 20 }, (_, i) => 
    45 + Math.random() * 20 - 10
  );

  const memoryTrendData = Array.from({ length: 20 }, (_, i) => 
    62 + Math.random() * 15 - 7.5
  );

  const serviceColumns = [
    {
      title: 'Servis',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: ServiceHealth) => (
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
          status={status === 'up' ? 'success' : status === 'degraded' ? 'warning' : 'error'}
          text={status === 'up' ? 'Çalışıyor' : status === 'degraded' ? 'Düşük Performans' : 'Çalışmıyor'}
        />
      )
    },
    {
      title: 'Yanıt Süresi',
      dataIndex: 'responseTime',
      key: 'responseTime',
      render: (time: number) => (
        <Text type={time > 500 ? 'danger' : time > 200 ? 'warning' : 'success'}>
          {time}ms
        </Text>
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
      title: 'Hata Oranı',
      dataIndex: 'errorRate',
      key: 'errorRate',
      render: (rate: number) => (
        <Text type={rate > 1 ? 'danger' : rate > 0.5 ? 'warning' : 'success'}>
          {rate}%
        </Text>
      )
    },
    {
      title: 'İşlem/sn',
      dataIndex: 'throughput',
      key: 'throughput',
      render: (throughput: number) => throughput.toLocaleString('tr-TR')
    },
    {
      title: 'Son Olay',
      dataIndex: 'lastIncident',
      key: 'lastIncident',
      render: (incident?: string) => incident || '-'
    }
  ];

  const healthCheckColumns = [
    {
      title: 'Kontrol',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: HealthCheck) => (
        <Space>
          {getStatusIcon(record.status)}
          <Text strong>{text}</Text>
        </Space>
      )
    },
    {
      title: 'Tip',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color="blue">{type.toUpperCase()}</Tag>
      )
    },
    {
      title: 'Endpoint',
      dataIndex: 'endpoint',
      key: 'endpoint',
      render: (endpoint?: string) => endpoint || '-'
    },
    {
      title: 'Aralık',
      dataIndex: 'interval',
      key: 'interval',
      render: (interval: number) => `${interval}s`
    },
    {
      title: 'Son Çalışma',
      dataIndex: 'lastRun',
      key: 'lastRun',
      render: (date: string) => dayjs(date).fromNow()
    },
    {
      title: 'Süre',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration: number) => `${duration}ms`
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge 
          status={status === 'passing' ? 'success' : status === 'warning' ? 'warning' : 'error'}
          text={status === 'passing' ? 'Başarılı' : status === 'warning' ? 'Uyarı' : 'Başarısız'}
        />
      )
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_, record: HealthCheck) => (
        <Space>
          <Button size="small" icon={<SyncOutlined />}>
            Çalıştır
          </Button>
          <Button size="small" icon={<SettingOutlined />}>
            Düzenle
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={12}>
            <Space align="center">
              <HeartOutlined style={{ fontSize: 24, color: getStatusColor(overallHealth.status) }} />
              <div>
                <Title level={4} style={{ margin: 0 }}>
                  Sistem Sağlığı
                </Title>
                <Space>
                  <Badge status={overallHealth.status === 'healthy' ? 'success' : 
                               overallHealth.status === 'degraded' ? 'warning' : 
                               overallHealth.status === 'unhealthy' ? 'error' : 'default'} />
                  <Text type="secondary">{overallHealth.message}</Text>
                </Space>
              </div>
            </Space>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Space>
              <Text type="secondary">Otomatik Yenileme:</Text>
              <Button 
                type={autoRefresh ? 'primary' : 'default'}
                icon={<SyncOutlined spin={autoRefresh} />}
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                {autoRefresh ? 'Aktif (30s)' : 'Devre Dışı'}
              </Button>
              <Button icon={<ReloadOutlined />} onClick={fetchHealthData}>
                Yenile
              </Button>
              <Button icon={<DownloadOutlined />}>
                Rapor İndir
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* System Metrics Overview */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card bordered={false}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text type="secondary">CPU Kullanımı</Text>
              <RingProgress
                percent={systemMetrics.cpu / 100}
                color={systemMetrics.cpu > 80 ? '#ff4d4f' : systemMetrics.cpu > 60 ? '#faad14' : '#52c41a'}
                statistic={{
                  title: {
                    formatter: () => 'CPU',
                    style: { fontSize: '14px' }
                  },
                  content: {
                    formatter: () => `${systemMetrics.cpu.toFixed(1)}%`,
                    style: { fontSize: '20px' }
                  }
                }}
              />
              <TinyLine 
                data={cpuTrendData} 
                height={40} 
                smooth 
                color={systemMetrics.cpu > 80 ? '#ff4d4f' : '#1890ff'}
              />
            </Space>
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text type="secondary">Bellek Kullanımı</Text>
              <RingProgress
                percent={systemMetrics.memory / 100}
                color={systemMetrics.memory > 85 ? '#ff4d4f' : systemMetrics.memory > 70 ? '#faad14' : '#52c41a'}
                statistic={{
                  title: {
                    formatter: () => 'RAM',
                    style: { fontSize: '14px' }
                  },
                  content: {
                    formatter: () => `${systemMetrics.memory.toFixed(1)}%`,
                    style: { fontSize: '20px' }
                  }
                }}
              />
              <TinyLine 
                data={memoryTrendData} 
                height={40} 
                smooth 
                color={systemMetrics.memory > 85 ? '#ff4d4f' : '#1890ff'}
              />
            </Space>
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text type="secondary">Disk Kullanımı</Text>
              <Progress
                type="dashboard"
                percent={systemMetrics.disk}
                status={systemMetrics.disk > 90 ? 'exception' : 'normal'}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': systemMetrics.disk > 90 ? '#ff4d4f' : '#87d068',
                }}
              />
              <Statistic
                value={`${(250 * systemMetrics.disk / 100).toFixed(1)} GB`}
                suffix="/ 250 GB"
                valueStyle={{ fontSize: 14 }}
              />
            </Space>
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text type="secondary">Ağ Trafiği</Text>
              <Statistic
                value={systemMetrics.network.in}
                suffix="Mbps ↓"
                valueStyle={{ fontSize: 16, color: '#52c41a' }}
              />
              <Statistic
                value={systemMetrics.network.out}
                suffix="Mbps ↑"
                valueStyle={{ fontSize: 16, color: '#1890ff' }}
              />
              <Progress
                percent={((systemMetrics.network.in + systemMetrics.network.out) / 1000) * 100}
                size="small"
                showInfo={false}
              />
            </Space>
          </Card>
        </Col>
      </Row>

      <Card bordered={false}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Servisler" key="services">
            <Alert
              message="Servis Durumu"
              description={`${services.filter(s => s.status === 'up').length} / ${services.length} servis çalışıyor`}
              type={services.some(s => s.status === 'down') ? 'error' : 
                    services.some(s => s.status === 'degraded') ? 'warning' : 'success'}
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Table
              columns={serviceColumns}
              dataSource={services}
              rowKey="name"
              pagination={false}
              size="small"
            />

            <Divider />

            <Row gutter={16}>
              <Col span={12}>
                <Card title="Servis Yanıt Süreleri (ms)" size="small">
                  <List
                    size="small"
                    dataSource={services}
                    renderItem={item => (
                      <List.Item>
                        <Text>{item.name}</Text>
                        <Progress
                          percent={(200 - Math.min(item.responseTime, 200)) / 2}
                          strokeColor={item.responseTime > 500 ? '#ff4d4f' : 
                                     item.responseTime > 200 ? '#faad14' : '#52c41a'}
                          format={() => `${item.responseTime}ms`}
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Hata Oranları (%)" size="small">
                  <List
                    size="small"
                    dataSource={services}
                    renderItem={item => (
                      <List.Item>
                        <Text>{item.name}</Text>
                        <Progress
                          percent={item.errorRate}
                          status={item.errorRate > 1 ? 'exception' : 'normal'}
                          strokeColor={item.errorRate > 1 ? '#ff4d4f' : 
                                     item.errorRate > 0.5 ? '#faad14' : '#52c41a'}
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Health Checks" key="checks">
            <Space style={{ marginBottom: 16 }}>
              <Button type="primary" icon={<PlusOutlined />}>
                Yeni Kontrol Ekle
              </Button>
              <Button icon={<SyncOutlined />}>
                Tümünü Çalıştır
              </Button>
            </Space>

            <Table
              columns={healthCheckColumns}
              dataSource={healthChecks}
              rowKey="id"
              pagination={false}
              expandable={{
                expandedRowRender: (record) => (
                  <div style={{ padding: 16 }}>
                    {record.message && (
                      <Alert
                        message={record.message}
                        type={record.status === 'passing' ? 'success' : 
                              record.status === 'warning' ? 'warning' : 'error'}
                        style={{ marginBottom: 16 }}
                      />
                    )}
                    <Row gutter={16}>
                      <Col span={8}>
                        <Statistic
                          title="Timeout"
                          value={record.timeout}
                          suffix="saniye"
                        />
                      </Col>
                      <Col span={8}>
                        <Statistic
                          title="Sonraki Çalışma"
                          value={dayjs(record.nextRun).fromNow()}
                        />
                      </Col>
                      <Col span={8}>
                        <Statistic
                          title="Başarı Oranı"
                          value={record.status === 'passing' ? 100 : 
                                record.status === 'warning' ? 75 : 0}
                          suffix="%"
                        />
                      </Col>
                    </Row>
                  </div>
                )
              }}
            />
          </TabPane>

          <TabPane tab="Olaylar" key="incidents">
            {incidents.length === 0 ? (
              <Empty description="Aktif olay bulunmuyor" />
            ) : (
              <Timeline mode="left">
                {incidents.map(incident => (
                  <Timeline.Item
                    key={incident.id}
                    color={getStatusColor(incident.status)}
                    label={dayjs(incident.startTime).format('DD.MM.YYYY HH:mm')}
                  >
                    <Card size="small">
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Space>
                          <Tag color={getSeverityColor(incident.severity)}>
                            {incident.severity.toUpperCase()}
                          </Tag>
                          <Badge 
                            status={incident.status === 'resolved' ? 'success' : 
                                   incident.status === 'investigating' ? 'warning' : 'error'}
                            text={incident.status === 'resolved' ? 'Çözüldü' : 
                                 incident.status === 'investigating' ? 'İnceleniyor' : 'Aktif'}
                          />
                        </Space>
                        <Text strong>{incident.title}</Text>
                        <Text type="secondary">{incident.description}</Text>
                        <Space>
                          <Text type="secondary">Etkilenen servisler:</Text>
                          {incident.affectedServices.map(service => (
                            <Tag key={service}>{service}</Tag>
                          ))}
                        </Space>
                        {incident.endTime && (
                          <Text type="secondary">
                            Süre: {moment.duration(dayjs(incident.endTime).diff(dayjs(incident.startTime))).humanize()}
                          </Text>
                        )}
                      </Space>
                    </Card>
                  </Timeline.Item>
                ))}
              </Timeline>
            )}
          </TabPane>

          <TabPane tab="Performans" key="performance">
            <Row gutter={16}>
              <Col span={8}>
                <Card bordered={false}>
                  <Statistic
                    title="Ortalama Yanıt Süresi"
                    value={124}
                    suffix="ms"
                    prefix={<ThunderboltOutlined />}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card bordered={false}>
                  <Statistic
                    title="Toplam İstek"
                    value={1234567}
                    prefix={<ApiOutlined />}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card bordered={false}>
                  <Statistic
                    title="Aktif Bağlantı"
                    value={systemMetrics.connections}
                    prefix={<LinkOutlined />}
                  />
                </Card>
              </Col>
            </Row>

            <Divider />

            <Row gutter={16}>
              <Col span={12}>
                <Card title="Thread Kullanımı" size="small">
                  <Gauge
                    percent={systemMetrics.threads / 200}
                    range={{
                      color: ['l(0) 0:#5d7092 1:#6395f9'],
                    }}
                    statistic={{
                      title: {
                        formatter: () => 'Threads',
                        style: { fontSize: '14px' }
                      },
                      content: {
                        formatter: () => `${systemMetrics.threads} / 200`,
                        style: { fontSize: '20px' }
                      }
                    }}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Database Pool" size="small">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Progress
                      percent={68}
                      success={{ percent: 45 }}
                      format={() => '68 / 100'}
                    />
                    <Row gutter={16}>
                      <Col span={12}>
                        <Statistic
                          title="Aktif"
                          value={45}
                          valueStyle={{ fontSize: 16 }}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title="Boşta"
                          value={23}
                          valueStyle={{ fontSize: 16 }}
                        />
                      </Col>
                    </Row>
                  </Space>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Loglar" key="logs">
            <Card title="Son Sistem Logları" size="small">
              <List
                size="small"
                dataSource={[
                  { level: 'info', message: 'Sistem başarıyla başlatıldı', time: '10:45:23' },
                  { level: 'warning', message: 'Bellek kullanımı %80 üzerine çıktı', time: '10:42:15' },
                  { level: 'error', message: 'Database bağlantı timeout', time: '10:38:45' },
                  { level: 'info', message: 'Cache temizlendi', time: '10:35:10' },
                  { level: 'debug', message: 'Health check tamamlandı', time: '10:30:00' }
                ]}
                renderItem={item => (
                  <List.Item>
                    <Space>
                      <Tag color={
                        item.level === 'error' ? 'red' :
                        item.level === 'warning' ? 'orange' :
                        item.level === 'info' ? 'blue' : 'default'
                      }>
                        {item.level.toUpperCase()}
                      </Tag>
                      <Text type="secondary">{item.time}</Text>
                      <Text>{item.message}</Text>
                    </Space>
                  </List.Item>
                )}
              />
            </Card>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default TenantHealth;