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
  Tag,
  Progress,
  Statistic,
  Timeline,
  List,
  Badge,
  Avatar,
  Tooltip,
  Alert,
  Table,
  Switch,
  Select,
  DatePicker,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Divider,
  Empty,
  Radio,
} from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import {
  HeartOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  DatabaseOutlined,
  ApiOutlined,
  CloudOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
  ReloadOutlined,
  SettingOutlined,
  BellOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  LineChartOutlined,
  BarChartOutlined,
  DashboardOutlined,
  MonitorOutlined,
  GlobalOutlined,
  LockOutlined,
  EyeOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BankOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface HealthMetric {
  id: string;
  name: string;
  category: 'performance' | 'availability' | 'security' | 'storage' | 'network';
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  value: number;
  unit: string;
  threshold: {
    warning: number;
    critical: number;
  };
  lastCheck: string;
  description: string;
  trend: 'up' | 'down' | 'stable';
}

interface ServiceStatus {
  id: string;
  name: string;
  type: 'database' | 'api' | 'cache' | 'storage' | 'auth' | 'payment' | 'notification';
  status: 'online' | 'offline' | 'degraded' | 'maintenance';
  responseTime: number;
  uptime: number;
  lastCheck: string;
  endpoint?: string;
  version?: string;
  dependencies: string[];
}

interface Incident {
  id: string;
  title: string;
  status: 'open' | 'investigating' | 'resolved' | 'monitoring';
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedServices: string[];
  startTime: string;
  resolvedTime?: string;
  description: string;
  updates: {
    timestamp: string;
    message: string;
    author: string;
  }[];
}

interface AlertRule {
  id: string;
  name: string;
  metric: string;
  condition: 'greater_than' | 'less_than' | 'equals';
  threshold: number;
  duration: number;
  enabled: boolean;
  notifications: string[];
  createdAt: string;
  lastTriggered?: string;
}

const TenantHealth: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');
  const [isAlertModalVisible, setIsAlertModalVisible] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // Mock data
  const systemHealth = {
    overallScore: 94,
    status: 'healthy' as const,
    uptime: 99.97,
    responseTime: 125,
    lastIncident: '2024-11-15T14:30:00Z',
    activeIssues: 2,
    resolvedToday: 5,
  };

  const mockMetrics: HealthMetric[] = [
    {
      id: '1',
      name: 'CPU Kullanımı',
      category: 'performance',
      status: 'healthy',
      value: 32.5,
      unit: '%',
      threshold: { warning: 70, critical: 90 },
      lastCheck: '2024-12-07T15:30:00Z',
      description: 'Ortalama CPU kullanım oranı',
      trend: 'stable',
    },
    {
      id: '2',
      name: 'Bellek Kullanımı',
      category: 'performance',
      status: 'warning',
      value: 78.3,
      unit: '%',
      threshold: { warning: 75, critical: 90 },
      lastCheck: '2024-12-07T15:30:00Z',
      description: 'RAM kullanım yüzdesi',
      trend: 'up',
    },
    {
      id: '3',
      name: 'Disk Alanı',
      category: 'storage',
      status: 'healthy',
      value: 45.2,
      unit: '%',
      threshold: { warning: 80, critical: 95 },
      lastCheck: '2024-12-07T15:30:00Z',
      description: 'Disk kullanım oranı',
      trend: 'stable',
    },
    {
      id: '4',
      name: 'API Yanıt Süresi',
      category: 'performance',
      status: 'healthy',
      value: 125,
      unit: 'ms',
      threshold: { warning: 500, critical: 1000 },
      lastCheck: '2024-12-07T15:30:00Z',
      description: 'Ortalama API yanıt süresi',
      trend: 'down',
    },
    {
      id: '5',
      name: 'Aktif Bağlantılar',
      category: 'network',
      status: 'healthy',
      value: 247,
      unit: '',
      threshold: { warning: 500, critical: 800 },
      lastCheck: '2024-12-07T15:30:00Z',
      description: 'Eşzamanlı aktif bağlantı sayısı',
      trend: 'stable',
    },
    {
      id: '6',
      name: 'Hata Oranı',
      category: 'availability',
      status: 'critical',
      value: 2.8,
      unit: '%',
      threshold: { warning: 1, critical: 2.5 },
      lastCheck: '2024-12-07T15:30:00Z',
      description: '5xx hata oranı',
      trend: 'up',
    },
  ];

  const mockServices: ServiceStatus[] = [
    {
      id: '1',
      name: 'Ana Veritabanı',
      type: 'database',
      status: 'online',
      responseTime: 12,
      uptime: 99.98,
      lastCheck: '2024-12-07T15:30:00Z',
      endpoint: 'postgres://db.stocker.com:5432',
      version: '14.9',
      dependencies: [],
    },
    {
      id: '2',
      name: 'API Gateway',
      type: 'api',
      status: 'online',
      responseTime: 45,
      uptime: 99.95,
      lastCheck: '2024-12-07T15:30:00Z',
      endpoint: 'https://api.stocker.com',
      version: '2.1.4',
      dependencies: ['Ana Veritabanı', 'Redis Cache'],
    },
    {
      id: '3',
      name: 'Redis Cache',
      type: 'cache',
      status: 'degraded',
      responseTime: 180,
      uptime: 98.52,
      lastCheck: '2024-12-07T15:30:00Z',
      endpoint: 'redis://cache.stocker.com:6379',
      version: '7.0.5',
      dependencies: [],
    },
    {
      id: '4',
      name: 'Dosya Depolama',
      type: 'storage',
      status: 'online',
      responseTime: 89,
      uptime: 99.99,
      lastCheck: '2024-12-07T15:30:00Z',
      endpoint: 'https://storage.stocker.com',
      version: '1.8.2',
      dependencies: [],
    },
    {
      id: '5',
      name: 'Kimlik Doğrulama',
      type: 'auth',
      status: 'maintenance',
      responseTime: 0,
      uptime: 95.23,
      lastCheck: '2024-12-07T15:30:00Z',
      endpoint: 'https://auth.stocker.com',
      version: '3.2.1',
      dependencies: ['Ana Veritabanı'],
    },
    {
      id: '6',
      name: 'Ödeme Sistemi',
      type: 'payment',
      status: 'online',
      responseTime: 234,
      uptime: 99.87,
      lastCheck: '2024-12-07T15:30:00Z',
      endpoint: 'https://payments.stocker.com',
      version: '1.5.7',
      dependencies: ['API Gateway'],
    },
  ];

  const mockIncidents: Incident[] = [
    {
      id: '1',
      title: 'Redis Cache Performans Düşüklüğü',
      status: 'investigating',
      severity: 'medium',
      affectedServices: ['Redis Cache', 'API Gateway'],
      startTime: '2024-12-07T14:20:00Z',
      description: 'Redis cache sunucusunda yüksek bellek kullanımı ve yavaş yanıt süreleri gözleniyor.',
      updates: [
        {
          timestamp: '2024-12-07T14:25:00Z',
          message: 'Sorun tespit edildi, araştırma başlatıldı',
          author: 'DevOps Team',
        },
        {
          timestamp: '2024-12-07T14:45:00Z',
          message: 'Memory leak sorunu bulundu, düzeltme çalışmaları devam ediyor',
          author: 'Backend Team',
        },
      ],
    },
    {
      id: '2',
      title: 'Kimlik Doğrulama Servisi Bakımı',
      status: 'monitoring',
      severity: 'high',
      affectedServices: ['Kimlik Doğrulama'],
      startTime: '2024-12-07T13:00:00Z',
      resolvedTime: '2024-12-07T15:00:00Z',
      description: 'Planlı güvenlik güncellemesi için kimlik doğrulama servisi geçici olarak kapatıldı.',
      updates: [
        {
          timestamp: '2024-12-07T13:00:00Z',
          message: 'Planlı bakım başlatıldı',
          author: 'DevOps Team',
        },
        {
          timestamp: '2024-12-07T15:00:00Z',
          message: 'Bakım tamamlandı, servis normale döndü',
          author: 'DevOps Team',
        },
      ],
    },
  ];

  const mockAlertRules: AlertRule[] = [
    {
      id: '1',
      name: 'Yüksek CPU Kullanımı',
      metric: 'cpu_usage',
      condition: 'greater_than',
      threshold: 80,
      duration: 300,
      enabled: true,
      notifications: ['email', 'slack'],
      createdAt: '2024-01-15T10:00:00Z',
      lastTriggered: '2024-11-28T14:30:00Z',
    },
    {
      id: '2',
      name: 'API Yanıt Süresi Uyarısı',
      metric: 'api_response_time',
      condition: 'greater_than',
      threshold: 1000,
      duration: 60,
      enabled: true,
      notifications: ['email', 'sms'],
      createdAt: '2024-02-20T15:30:00Z',
    },
    {
      id: '3',
      name: 'Disk Alanı Uyarısı',
      metric: 'disk_usage',
      condition: 'greater_than',
      threshold: 90,
      duration: 0,
      enabled: false,
      notifications: ['email'],
      createdAt: '2024-03-10T09:15:00Z',
    },
  ];

  const statusColors = {
    healthy: 'success',
    warning: 'warning',
    critical: 'error',
    unknown: 'default',
  };

  const serviceStatusColors = {
    online: 'success',
    offline: 'error',
    degraded: 'warning',
    maintenance: 'processing',
  };

  const incidentStatusColors = {
    open: 'error',
    investigating: 'processing',
    resolved: 'success',
    monitoring: 'warning',
  };

  const severityColors = {
    low: 'green',
    medium: 'orange',
    high: 'red',
    critical: 'purple',
  };

  const categoryIcons = {
    performance: <ThunderboltOutlined />,
    availability: <HeartOutlined />,
    security: <SafetyOutlined />,
    storage: <DatabaseOutlined />,
    network: <GlobalOutlined />,
  };

  const serviceIcons = {
    database: <DatabaseOutlined />,
    api: <ApiOutlined />,
    cache: <DatabaseOutlined />,
    storage: <CloudOutlined />,
    auth: <LockOutlined />,
    payment: <BankOutlined />,
    notification: <BellOutlined />,
  };

  const handleRefreshMetrics = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    message.success('Metrikler yenilendi');
    setLoading(false);
  };

  const handleCreateAlert = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      await Swal.fire({
        icon: 'success',
        title: 'Uyarı Kuralı Oluşturuldu',
        text: 'Yeni uyarı kuralı başarıyla eklendi.',
        timer: 2000,
        showConfirmButton: false,
      });

      setIsAlertModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Lütfen gerekli alanları doldurun');
    } finally {
      setLoading(false);
    }
  };

  const OverviewTab = () => (
    <div>
      {/* System Health Score */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card>
            <Row gutter={[16, 16]} align="middle">
              <Col flex="auto">
                <Space direction="vertical">
                  <Title level={2} style={{ margin: 0, color: '#52c41a' }}>
                    Sistem Sağlığı: {systemHealth.overallScore}/100
                  </Title>
                  <Text type="secondary" style={{ fontSize: 16 }}>
                    Son olay: {dayjs(systemHealth.lastIncident).fromNow()}
                  </Text>
                </Space>
              </Col>
              <Col>
                <Progress
                  type="circle"
                  percent={systemHealth.overallScore}
                  size={120}
                  strokeColor={
                    systemHealth.overallScore >= 90 ? '#52c41a' :
                    systemHealth.overallScore >= 70 ? '#faad14' : '#ff4d4f'
                  }
                  format={(percent) => (
                    <div>
                      <div style={{ fontSize: 20, fontWeight: 'bold' }}>{percent}%</div>
                      <div style={{ fontSize: 12, color: '#666' }}>Sağlıklı</div>
                    </div>
                  )}
                />
              </Col>
              <Col>
                <Space>
                  <Button
                    type="primary"
                    icon={<ReloadOutlined />}
                    loading={loading}
                    onClick={handleRefreshMetrics}
                  >
                    Yenile
                  </Button>
                  <Button icon={<SettingOutlined />}>
                    Ayarlar
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Key Metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Uptime"
              value={systemHealth.uptime}
              precision={2}
              suffix="%"
              prefix={<HeartOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Ortalama Yanıt"
              value={systemHealth.responseTime}
              suffix="ms"
              prefix={<ThunderboltOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Aktif Sorunlar"
              value={systemHealth.activeIssues}
              prefix={<ExclamationCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: systemHealth.activeIssues > 0 ? '#faad14' : '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Bugün Çözülen"
              value={systemHealth.resolvedToday}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Current Issues */}
      <Row gutter={[16, 16]}>
        <Col span={16}>
          <Card title="Güncel Sorunlar" extra={
            <Select defaultValue="all" size="small">
              <Option value="all">Tümü</Option>
              <Option value="critical">Kritik</Option>
              <Option value="high">Yüksek</Option>
              <Option value="medium">Orta</Option>
            </Select>
          }>
            {mockIncidents.filter(i => i.status !== 'resolved').length === 0 ? (
              <Empty 
                description="Aktif sorun bulunmuyor"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <List
                dataSource={mockIncidents.filter(i => i.status !== 'resolved')}
                renderItem={(incident) => (
                  <List.Item
                    actions={[
                      <Button 
                        size="small" 
                        type="link"
                        onClick={() => setSelectedIncident(incident)}
                      >
                        Detaylar
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          style={{ 
                            backgroundColor: severityColors[incident.severity] 
                          }}
                        >
                          <ExclamationCircleOutlined />
                        </Avatar>
                      }
                      title={
                        <Space>
                          <Text strong>{incident.title}</Text>
                          <Badge
                            status={incidentStatusColors[incident.status]}
                            text={incident.status}
                          />
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size={0}>
                          <Text type="secondary">{incident.description}</Text>
                          <Space>
                            <Text type="secondary">
                              {dayjs(incident.startTime).fromNow()}
                            </Text>
                            <Tag color={severityColors[incident.severity]}>
                              {incident.severity.toUpperCase()}
                            </Tag>
                          </Space>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Sistem Durumu">
            <Timeline
              items={[
                {
                  color: 'green',
                  children: (
                    <div>
                      <Text strong>Tüm servisler çalışıyor</Text>
                      <br />
                      <Text type="secondary">5 dakika önce</Text>
                    </div>
                  ),
                },
                {
                  color: 'orange',
                  children: (
                    <div>
                      <Text strong>Redis performans uyarısı</Text>
                      <br />
                      <Text type="secondary">1 saat önce</Text>
                    </div>
                  ),
                },
                {
                  color: 'blue',
                  children: (
                    <div>
                      <Text strong>Kimlik doğrulama bakımı tamamlandı</Text>
                      <br />
                      <Text type="secondary">2 saat önce</Text>
                    </div>
                  ),
                },
                {
                  color: 'green',
                  children: (
                    <div>
                      <Text strong>Sistem başlatıldı</Text>
                      <br />
                      <Text type="secondary">1 gün önce</Text>
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );

  const MetricsTab = () => (
    <Row gutter={[16, 16]}>
      {mockMetrics.map(metric => (
        <Col xs={24} sm={12} lg={8} key={metric.id}>
          <Card
            size="small"
            title={
              <Space>
                {categoryIcons[metric.category]}
                <Text>{metric.name}</Text>
              </Space>
            }
            extra={
              <Badge status={statusColors[metric.status]} />
            }
          >
            <Row gutter={[16, 16]} align="middle">
              <Col flex="auto">
                <Statistic
                  value={metric.value}
                  suffix={metric.unit}
                  valueStyle={{
                    color: 
                      metric.status === 'healthy' ? '#52c41a' :
                      metric.status === 'warning' ? '#faad14' : '#ff4d4f'
                  }}
                />
                <Space style={{ marginTop: 8 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Son kontrol: {dayjs(metric.lastCheck).fromNow()}
                  </Text>
                  {metric.trend === 'up' && <ArrowUpOutlined style={{ color: '#ff4d4f' }} />}
                  {metric.trend === 'down' && <ArrowDownOutlined style={{ color: '#52c41a' }} />}
                </Space>
              </Col>
              <Col>
                <Progress
                  type="circle"
                  percent={
                    metric.category === 'performance' || metric.category === 'storage' ?
                    (metric.value / metric.threshold.critical) * 100 :
                    100 - (metric.value / metric.threshold.critical) * 100
                  }
                  size={60}
                  strokeColor={
                    metric.value >= metric.threshold.critical ? '#ff4d4f' :
                    metric.value >= metric.threshold.warning ? '#faad14' : '#52c41a'
                  }
                  format={() => (
                    <div style={{ fontSize: 10, textAlign: 'center' }}>
                      <div>{metric.value}</div>
                      <div>{metric.unit}</div>
                    </div>
                  )}
                />
              </Col>
            </Row>
            <Divider style={{ margin: '12px 0' }} />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {metric.description}
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Uyarı: {metric.threshold.warning}{metric.unit} • Kritik: {metric.threshold.critical}{metric.unit}
            </Text>
          </Card>
        </Col>
      ))}
    </Row>
  );

  const ServicesTab = () => (
    <Row gutter={[16, 16]}>
      {mockServices.map(service => (
        <Col xs={24} sm={12} lg={8} key={service.id}>
          <Card
            title={
              <Space>
                {serviceIcons[service.type]}
                <Text>{service.name}</Text>
              </Space>
            }
            extra={
              <Badge
                status={serviceStatusColors[service.status]}
                text={service.status}
              />
            }
          >
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              <Row justify="space-between">
                <Text type="secondary">Yanıt Süresi:</Text>
                <Text strong>
                  {service.responseTime > 0 ? `${service.responseTime}ms` : 'N/A'}
                </Text>
              </Row>
              <Row justify="space-between">
                <Text type="secondary">Uptime:</Text>
                <Text strong style={{
                  color: service.uptime > 99.5 ? '#52c41a' : 
                         service.uptime > 95 ? '#faad14' : '#ff4d4f'
                }}>
                  {service.uptime}%
                </Text>
              </Row>
              {service.version && (
                <Row justify="space-between">
                  <Text type="secondary">Sürüm:</Text>
                  <Tag size="small">{service.version}</Tag>
                </Row>
              )}
              {service.endpoint && (
                <Row justify="space-between">
                  <Text type="secondary">Endpoint:</Text>
                  <Tooltip title={service.endpoint}>
                    <Text code style={{ fontSize: 11 }}>
                      {service.endpoint.length > 20 ? 
                        service.endpoint.substring(0, 20) + '...' : 
                        service.endpoint
                      }
                    </Text>
                  </Tooltip>
                </Row>
              )}
              <Row justify="space-between">
                <Text type="secondary">Son Kontrol:</Text>
                <Text style={{ fontSize: 12 }}>
                  {dayjs(service.lastCheck).fromNow()}
                </Text>
              </Row>
              
              {service.dependencies.length > 0 && (
                <>
                  <Divider style={{ margin: '8px 0' }} />
                  <Text type="secondary" style={{ fontSize: 12 }}>Bağımlılıklar:</Text>
                  <Space wrap>
                    {service.dependencies.map(dep => (
                      <Tag key={dep} size="small">{dep}</Tag>
                    ))}
                  </Space>
                </>
              )}
            </Space>
          </Card>
        </Col>
      ))}
    </Row>
  );

  const AlertsTab = () => (
    <Card>
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
        <Title level={4} style={{ margin: 0 }}>Uyarı Kuralları</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setIsAlertModalVisible(true)}
        >
          Yeni Kural
        </Button>
      </Space>

      <Table
        dataSource={mockAlertRules}
        rowKey="id"
        pagination={false}
        columns={[
          {
            title: 'Kural Adı',
            dataIndex: 'name',
            key: 'name',
            render: (name: string) => <Text strong>{name}</Text>,
          },
          {
            title: 'Metrik',
            dataIndex: 'metric',
            key: 'metric',
            render: (metric: string) => <Tag color="blue">{metric}</Tag>,
          },
          {
            title: 'Koşul',
            key: 'condition',
            render: (_, record) => (
              <Text>
                {record.condition.replace('_', ' ')} {record.threshold}
              </Text>
            ),
          },
          {
            title: 'Süre',
            dataIndex: 'duration',
            key: 'duration',
            render: (duration: number) => (
              duration > 0 ? `${duration}s` : 'Anında'
            ),
          },
          {
            title: 'Durum',
            dataIndex: 'enabled',
            key: 'enabled',
            render: (enabled: boolean, record) => (
              <Switch
                checked={enabled}
                checkedChildren="Aktif"
                unCheckedChildren="Pasif"
                onChange={(checked) => {
                  message.success(`${record.name} ${checked ? 'aktifleştirildi' : 'devre dışı bırakıldı'}`);
                }}
              />
            ),
          },
          {
            title: 'Son Tetikleme',
            dataIndex: 'lastTriggered',
            key: 'lastTriggered',
            render: (date?: string) => (
              date ? dayjs(date).fromNow() : 'Hiç'
            ),
          },
          {
            title: 'İşlemler',
            key: 'actions',
            render: (_, record) => (
              <Space>
                <Button type="text" icon={<EditOutlined />} />
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Space>
            ),
          },
        ]}
      />
    </Card>
  );

  const AlertModal = () => (
    <Modal
      title="Yeni Uyarı Kuralı"
      open={isAlertModalVisible}
      onOk={handleCreateAlert}
      onCancel={() => setIsAlertModalVisible(false)}
      confirmLoading={loading}
      okText="Oluştur"
      cancelText="İptal"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Kural Adı"
          rules={[{ required: true, message: 'Kural adı gerekli' }]}
        >
          <Input placeholder="Yüksek CPU Kullanımı" />
        </Form.Item>
        
        <Form.Item
          name="metric"
          label="Metrik"
          rules={[{ required: true, message: 'Metrik seçimi gerekli' }]}
        >
          <Select placeholder="Metrik seçin">
            <Option value="cpu_usage">CPU Kullanımı</Option>
            <Option value="memory_usage">Bellek Kullanımı</Option>
            <Option value="disk_usage">Disk Kullanımı</Option>
            <Option value="api_response_time">API Yanıt Süresi</Option>
            <Option value="error_rate">Hata Oranı</Option>
          </Select>
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="condition"
              label="Koşul"
              initialValue="greater_than"
            >
              <Select>
                <Option value="greater_than">Büyükse</Option>
                <Option value="less_than">Küçükse</Option>
                <Option value="equals">Eşitse</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="threshold"
              label="Eşik Değer"
              rules={[{ required: true, message: 'Eşik değer gerekli' }]}
            >
              <InputNumber style={{ width: '100%' }} placeholder="80" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="duration"
          label="Süre (saniye)"
          initialValue={300}
        >
          <InputNumber 
            style={{ width: '100%' }} 
            min={0}
            placeholder="300" 
            addonAfter="saniye"
          />
        </Form.Item>

        <Form.Item
          name="notifications"
          label="Bildirim Yöntemleri"
        >
          <Checkbox.Group>
            <Row>
              <Col span={8}><Checkbox value="email">E-posta</Checkbox></Col>
              <Col span={8}><Checkbox value="sms">SMS</Checkbox></Col>
              <Col span={8}><Checkbox value="slack">Slack</Checkbox></Col>
            </Row>
          </Checkbox.Group>
        </Form.Item>
      </Form>
    </Modal>
  );

  return (
    <PageContainer
      header={{
        title: 'Sistem Sağlığı ve İzleme',
        breadcrumb: {
          items: [
            { title: 'Ana Sayfa', path: '/' },
            { title: 'Tenants', path: '/tenants' },
            { title: 'ABC Corporation', path: `/tenants/${id}` },
            { title: 'Sistem Sağlığı' },
          ],
        },
        onBack: () => navigate(`/tenants/${id}`),
        extra: [
          <Select
            key="timeRange"
            value={selectedTimeRange}
            onChange={setSelectedTimeRange}
            style={{ width: 120 }}
          >
            <Option value="1h">Son 1 Saat</Option>
            <Option value="24h">Son 24 Saat</Option>
            <Option value="7d">Son 7 Gün</Option>
            <Option value="30d">Son 30 Gün</Option>
          </Select>,
        ],
      }}
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab={<span><DashboardOutlined /> Genel Bakış</span>} key="overview">
          <OverviewTab />
        </TabPane>
        
        <TabPane tab={<span><LineChartOutlined /> Metrikler</span>} key="metrics">
          <MetricsTab />
        </TabPane>
        
        <TabPane tab={<span><DatabaseOutlined /> Servisler</span>} key="services">
          <ServicesTab />
        </TabPane>
        
        <TabPane tab={<span><BellOutlined /> Uyarılar</span>} key="alerts">
          <AlertsTab />
        </TabPane>
      </Tabs>

      <AlertModal />
    </PageContainer>
  );
};

export default TenantHealth;