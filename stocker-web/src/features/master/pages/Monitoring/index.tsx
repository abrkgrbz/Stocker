import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Typography,
  Alert,
  Button,
  Space,
  Tag,
  Table,
  Tabs,
  Badge,
  List,
  Timeline,
  Select,
  DatePicker,
  Tooltip,
  message,
  Divider,
  Descriptions,
  Switch,
  notification,
  Modal,
  Input,
} from 'antd';
import {
  DashboardOutlined,
  CloudServerOutlined,
  DatabaseOutlined,
  ApiOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  InfoCircleOutlined,
  BugOutlined,
  FileTextOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  RocketOutlined,
  WifiOutlined,
  GlobalOutlined,
  LockOutlined,
  SafetyOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  ClearOutlined,
  PoweroffOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  SyncOutlined,
  HeartOutlined,
  AlertOutlined,
} from '@ant-design/icons';
import { Line, Pie, Column, Area, Gauge } from '@ant-design/plots';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { masterApi } from '@/shared/api/master.api';
import '../../styles/master-layout.css';

dayjs.extend(relativeTime);

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  trend?: 'up' | 'down' | 'stable';
}

interface Service {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error' | 'starting' | 'stopping';
  uptime: string;
  cpu: number;
  memory: number;
  responseTime: number;
  errorRate: number;
  lastCheck: string;
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  source: string;
  message: string;
  details?: any;
}

interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: string;
  resolved: boolean;
}

export const MasterMonitoringPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [services, setServices] = useState<Service[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [logLevel, setLogLevel] = useState<string>('all');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  // Mock system metrics
  const systemMetrics: SystemMetric[] = [
    { name: 'CPU Kullanımı', value: 42, unit: '%', status: 'normal', trend: 'stable' },
    { name: 'Bellek Kullanımı', value: 68, unit: '%', status: 'warning', trend: 'up' },
    { name: 'Disk Kullanımı', value: 35, unit: '%', status: 'normal', trend: 'up' },
    { name: 'Ağ Trafiği', value: 125, unit: 'MB/s', status: 'normal', trend: 'stable' },
  ];

  // Mock services data
  const mockServices: Service[] = [
    {
      id: '1',
      name: 'API Gateway',
      status: 'running',
      uptime: '15d 3h 45m',
      cpu: 25,
      memory: 45,
      responseTime: 125,
      errorRate: 0.2,
      lastCheck: dayjs().subtract(30, 'seconds').toISOString(),
    },
    {
      id: '2',
      name: 'PostgreSQL',
      status: 'running',
      uptime: '30d 12h 10m',
      cpu: 15,
      memory: 62,
      responseTime: 8,
      errorRate: 0,
      lastCheck: dayjs().subtract(30, 'seconds').toISOString(),
    },
    {
      id: '3',
      name: 'Redis Cache',
      status: 'running',
      uptime: '30d 12h 10m',
      cpu: 5,
      memory: 25,
      responseTime: 2,
      errorRate: 0,
      lastCheck: dayjs().subtract(30, 'seconds').toISOString(),
    },
    {
      id: '4',
      name: 'RabbitMQ',
      status: 'running',
      uptime: '10d 5h 30m',
      cpu: 12,
      memory: 38,
      responseTime: 15,
      errorRate: 0.1,
      lastCheck: dayjs().subtract(30, 'seconds').toISOString(),
    },
    {
      id: '5',
      name: 'Elasticsearch',
      status: 'warning',
      uptime: '5d 2h 15m',
      cpu: 78,
      memory: 85,
      responseTime: 450,
      errorRate: 2.5,
      lastCheck: dayjs().subtract(30, 'seconds').toISOString(),
    },
    {
      id: '6',
      name: 'MinIO Storage',
      status: 'running',
      uptime: '20d 8h 55m',
      cpu: 8,
      memory: 30,
      responseTime: 35,
      errorRate: 0,
      lastCheck: dayjs().subtract(30, 'seconds').toISOString(),
    },
  ];

  // Mock logs data
  const mockLogs: LogEntry[] = [
    {
      id: '1',
      timestamp: dayjs().subtract(2, 'minutes').toISOString(),
      level: 'info',
      source: 'API Gateway',
      message: 'New tenant registered: TechCorp',
    },
    {
      id: '2',
      timestamp: dayjs().subtract(5, 'minutes').toISOString(),
      level: 'warning',
      source: 'Elasticsearch',
      message: 'High memory usage detected (85%)',
      details: { memory: 85, threshold: 80 },
    },
    {
      id: '3',
      timestamp: dayjs().subtract(10, 'minutes').toISOString(),
      level: 'error',
      source: 'Payment Service',
      message: 'Failed to process payment for order #12345',
      details: { orderId: '12345', error: 'Gateway timeout' },
    },
    {
      id: '4',
      timestamp: dayjs().subtract(15, 'minutes').toISOString(),
      level: 'info',
      source: 'System',
      message: 'Scheduled backup completed successfully',
    },
    {
      id: '5',
      timestamp: dayjs().subtract(30, 'minutes').toISOString(),
      level: 'debug',
      source: 'Redis Cache',
      message: 'Cache invalidation completed for key: products_*',
    },
  ];

  // Mock alerts
  const mockAlerts: Alert[] = [
    {
      id: '1',
      type: 'warning',
      title: 'Yüksek Bellek Kullanımı',
      description: 'Elasticsearch servisi %85 bellek kullanımına ulaştı',
      timestamp: dayjs().subtract(5, 'minutes').toISOString(),
      resolved: false,
    },
    {
      id: '2',
      type: 'error',
      title: 'Ödeme Hatası',
      description: 'Son 10 dakikada 3 ödeme işlemi başarısız oldu',
      timestamp: dayjs().subtract(10, 'minutes').toISOString(),
      resolved: false,
    },
    {
      id: '3',
      type: 'info',
      title: 'Sistem Güncellemesi',
      description: 'Yeni güvenlik yaması uygulandı',
      timestamp: dayjs().subtract(1, 'hour').toISOString(),
      resolved: true,
    },
  ];

  useEffect(() => {
    fetchMonitoringData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchMonitoringData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const fetchMonitoringData = async () => {
    setLoading(true);
    try {
      // API çağrıları yapılacak
      // const [status, metrics, logs] = await Promise.all([
      //   masterApi.monitoring.getSystemStatus(),
      //   masterApi.monitoring.getPerformanceMetrics(),
      //   masterApi.monitoring.getLogs(),
      // ]);
      
      // Şimdilik mock data kullanıyoruz
      setTimeout(() => {
        setServices(mockServices);
        setLogs(mockLogs);
        setAlerts(mockAlerts);
        setLoading(false);
      }, 500);
    } catch (error) {
      message.error('Monitoring verileri yüklenirken hata oluştu');
      setLoading(false);
    }
  };

  const handleServiceAction = async (service: Service, action: 'start' | 'stop' | 'restart') => {
    try {
      // await masterApi.monitoring.restartService(service.id);
      notification.success({
        message: 'İşlem Başarılı',
        description: `${service.name} servisi ${action === 'restart' ? 'yeniden başlatıldı' : action === 'start' ? 'başlatıldı' : 'durduruldu'}`,
      });
      fetchMonitoringData();
    } catch (error) {
      message.error('İşlem başarısız oldu');
    }
  };

  const handleClearCache = async () => {
    Modal.confirm({
      title: 'Önbelleği Temizle',
      content: 'Tüm önbellek verilerini temizlemek istediğinizden emin misiniz?',
      okText: 'Temizle',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          // await masterApi.monitoring.clearCache();
          message.success('Önbellek temizlendi');
        } catch (error) {
          message.error('Önbellek temizlenemedi');
        }
      },
    });
  };

  const getServiceStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      running: 'success',
      stopped: 'default',
      error: 'error',
      starting: 'processing',
      stopping: 'warning',
    };
    return colors[status] || 'default';
  };

  const getServiceStatusIcon = (status: string) => {
    const icons: Record<string, React.ReactNode> = {
      running: <CheckCircleOutlined />,
      stopped: <StopOutlined />,
      error: <CloseCircleOutlined />,
      starting: <SyncOutlined spin />,
      stopping: <PauseCircleOutlined />,
    };
    return icons[status] || <InfoCircleOutlined />;
  };

  const getLogLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      info: 'blue',
      warning: 'orange',
      error: 'red',
      debug: 'default',
    };
    return colors[level] || 'default';
  };

  // CPU Usage Chart Data
  const cpuChartData = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    value: Math.floor(Math.random() * 40) + 30,
  }));

  const cpuChartConfig = {
    data: cpuChartData,
    xField: 'time',
    yField: 'value',
    smooth: true,
    color: '#1890ff',
    areaStyle: {
      fill: 'l(270) 0:#ffffff 1:#1890ff',
    },
    yAxis: {
      max: 100,
      min: 0,
    },
  };

  // Memory Usage Gauge
  const memoryGaugeConfig = {
    percent: 0.68,
    range: {
      color: 'l(0) 0:#52c41a 0.5:#faad14 1:#ff4d4f',
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
          fontSize: '24px',
        },
        formatter: () => '68%',
      },
    },
  };

  // Service Health Pie Chart
  const serviceHealthData = [
    { type: 'Sağlıklı', value: 4 },
    { type: 'Uyarı', value: 1 },
    { type: 'Hata', value: 1 },
  ];

  const serviceHealthConfig = {
    data: serviceHealthData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
    },
    color: ['#52c41a', '#faad14', '#ff4d4f'],
  };

  const serviceColumns = [
    {
      title: 'Servis',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Service) => (
        <Space>
          <Badge status={getServiceStatusColor(record.status) as any} />
          <Text strong>{name}</Text>
        </Space>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getServiceStatusColor(status)} icon={getServiceStatusIcon(status)}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Uptime',
      dataIndex: 'uptime',
      key: 'uptime',
    },
    {
      title: 'CPU',
      dataIndex: 'cpu',
      key: 'cpu',
      render: (cpu: number) => (
        <Progress
          percent={cpu}
          size="small"
          status={cpu > 80 ? 'exception' : cpu > 60 ? 'active' : 'success'}
        />
      ),
    },
    {
      title: 'Bellek',
      dataIndex: 'memory',
      key: 'memory',
      render: (memory: number) => (
        <Progress
          percent={memory}
          size="small"
          status={memory > 80 ? 'exception' : memory > 60 ? 'active' : 'success'}
        />
      ),
    },
    {
      title: 'Yanıt Süresi',
      dataIndex: 'responseTime',
      key: 'responseTime',
      render: (time: number) => (
        <Tag color={time > 500 ? 'red' : time > 200 ? 'orange' : 'green'}>
          {time}ms
        </Tag>
      ),
    },
    {
      title: 'Hata Oranı',
      dataIndex: 'errorRate',
      key: 'errorRate',
      render: (rate: number) => (
        <Tag color={rate > 5 ? 'red' : rate > 2 ? 'orange' : 'green'}>
          {rate}%
        </Tag>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (record: Service) => (
        <Space>
          <Tooltip title="Detaylar">
            <Button
              type="text"
              icon={<InfoCircleOutlined />}
              onClick={() => {
                setSelectedService(record);
                setShowServiceModal(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Yeniden Başlat">
            <Button
              type="text"
              icon={<ReloadOutlined />}
              onClick={() => handleServiceAction(record, 'restart')}
            />
          </Tooltip>
          {record.status === 'running' ? (
            <Tooltip title="Durdur">
              <Button
                type="text"
                icon={<PauseCircleOutlined />}
                danger
                onClick={() => handleServiceAction(record, 'stop')}
              />
            </Tooltip>
          ) : (
            <Tooltip title="Başlat">
              <Button
                type="text"
                icon={<PlayCircleOutlined />}
                onClick={() => handleServiceAction(record, 'start')}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const filteredLogs = logs.filter(log => 
    logLevel === 'all' || log.level === logLevel
  );

  return (
    <div className="master-monitoring-page">
      {/* Header */}
      <div className="page-header glass-morphism">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="header-content"
        >
          <Title level={2} className="gradient-text">
            <DashboardOutlined /> Sistem İzleme
          </Title>
          <Text type="secondary">Sistem performansı ve servis durumlarını izleyin</Text>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="header-actions"
        >
          <Space>
            <Text>Otomatik Yenileme:</Text>
            <Switch
              checked={autoRefresh}
              onChange={setAutoRefresh}
              checkedChildren="Açık"
              unCheckedChildren="Kapalı"
            />
            <Select
              value={refreshInterval}
              onChange={setRefreshInterval}
              style={{ width: 120 }}
              disabled={!autoRefresh}
            >
              <Option value={10000}>10 saniye</Option>
              <Option value={30000}>30 saniye</Option>
              <Option value={60000}>1 dakika</Option>
              <Option value={300000}>5 dakika</Option>
            </Select>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchMonitoringData}
              loading={loading}
            >
              Yenile
            </Button>
          </Space>
        </motion.div>
      </div>

      {/* Active Alerts */}
      {alerts.filter(a => !a.resolved).length > 0 && (
        <Alert
          message="Aktif Uyarılar"
          description={
            <Space direction="vertical" style={{ width: '100%' }}>
              {alerts.filter(a => !a.resolved).map(alert => (
                <div key={alert.id}>
                  <Space>
                    {alert.type === 'error' ? (
                      <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
                    ) : (
                      <WarningOutlined style={{ color: '#faad14' }} />
                    )}
                    <Text strong>{alert.title}</Text>
                    <Text type="secondary">- {alert.description}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      ({dayjs(alert.timestamp).fromNow()})
                    </Text>
                  </Space>
                </div>
              ))}
            </Space>
          }
          type="warning"
          showIcon
          closable
          style={{ marginBottom: 20 }}
        />
      )}

      {/* System Metrics */}
      <Row gutter={[20, 20]} className="stats-row">
        {systemMetrics.map((metric, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="stat-card glass-morphism">
                <Statistic
                  title={metric.name}
                  value={metric.value}
                  suffix={metric.unit}
                  valueStyle={{
                    color: metric.status === 'critical' ? '#ff4d4f' :
                           metric.status === 'warning' ? '#faad14' : '#52c41a'
                  }}
                  prefix={
                    metric.trend === 'up' ? <ArrowUpOutlined /> :
                    metric.trend === 'down' ? <ArrowDownOutlined /> : null
                  }
                />
                <Progress
                  percent={metric.unit === '%' ? metric.value : (metric.value / 200) * 100}
                  showInfo={false}
                  status={
                    metric.status === 'critical' ? 'exception' :
                    metric.status === 'warning' ? 'active' : 'success'
                  }
                />
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      {/* Main Content */}
      <Card className="content-card glass-morphism">
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane
            tab={
              <span>
                <BarChartOutlined />
                Genel Bakış
              </span>
            }
            key="overview"
          >
            <Row gutter={[20, 20]}>
              <Col xs={24} lg={12}>
                <Card title="CPU Kullanımı (24 Saat)" bordered={false}>
                  <Area {...cpuChartConfig} height={200} />
                </Card>
              </Col>
              <Col xs={24} lg={6}>
                <Card title="Bellek Kullanımı" bordered={false}>
                  <Gauge {...memoryGaugeConfig} height={200} />
                </Card>
              </Col>
              <Col xs={24} lg={6}>
                <Card title="Servis Durumu" bordered={false}>
                  <Pie {...serviceHealthConfig} height={200} />
                </Card>
              </Col>
            </Row>

            <Divider />

            <Row gutter={[20, 20]}>
              <Col xs={24}>
                <Card
                  title="Sistem Bilgileri"
                  bordered={false}
                  extra={
                    <Button
                      icon={<ClearOutlined />}
                      onClick={handleClearCache}
                    >
                      Önbelleği Temizle
                    </Button>
                  }
                >
                  <Descriptions bordered column={{ xs: 1, sm: 2, lg: 3 }}>
                    <Descriptions.Item label="İşletim Sistemi">
                      Ubuntu 22.04 LTS
                    </Descriptions.Item>
                    <Descriptions.Item label="Çekirdek">
                      5.15.0-88-generic
                    </Descriptions.Item>
                    <Descriptions.Item label="Uptime">
                      30d 12h 45m
                    </Descriptions.Item>
                    <Descriptions.Item label="CPU">
                      Intel Xeon E5-2680 v4 (8 cores)
                    </Descriptions.Item>
                    <Descriptions.Item label="RAM">
                      32 GB DDR4
                    </Descriptions.Item>
                    <Descriptions.Item label="Disk">
                      500 GB SSD
                    </Descriptions.Item>
                    <Descriptions.Item label="Veritabanı Boyutu">
                      12.5 GB
                    </Descriptions.Item>
                    <Descriptions.Item label="Önbellek Boyutu">
                      256 MB
                    </Descriptions.Item>
                    <Descriptions.Item label="Son Yedekleme">
                      {dayjs().subtract(6, 'hours').format('DD.MM.YYYY HH:mm')}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane
            tab={
              <span>
                <CloudServerOutlined />
                Servisler
              </span>
            }
            key="services"
          >
            <Table
              columns={serviceColumns}
              dataSource={services}
              rowKey="id"
              loading={loading}
              pagination={false}
            />
          </TabPane>

          <TabPane
            tab={
              <span>
                <FileTextOutlined />
                Loglar
              </span>
            }
            key="logs"
          >
            <Space style={{ marginBottom: 16 }}>
              <Select
                value={logLevel}
                onChange={setLogLevel}
                style={{ width: 120 }}
              >
                <Option value="all">Tümü</Option>
                <Option value="error">Hata</Option>
                <Option value="warning">Uyarı</Option>
                <Option value="info">Bilgi</Option>
                <Option value="debug">Debug</Option>
              </Select>
              <RangePicker
                showTime
                onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
              />
              <Button icon={<SearchOutlined />}>Ara</Button>
              <Button icon={<DownloadOutlined />}>İndir</Button>
            </Space>

            <List
              dataSource={filteredLogs}
              renderItem={(log) => (
                <List.Item
                  key={log.id}
                  actions={[
                    <Button
                      type="link"
                      onClick={() => {
                        setSelectedLog(log);
                        setShowLogModal(true);
                      }}
                    >
                      Detay
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Tag color={getLogLevelColor(log.level)}>
                        {log.level.toUpperCase()}
                      </Tag>
                    }
                    title={
                      <Space>
                        <Text strong>{log.source}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {dayjs(log.timestamp).format('DD.MM.YYYY HH:mm:ss')}
                        </Text>
                      </Space>
                    }
                    description={log.message}
                  />
                </List.Item>
              )}
            />
          </TabPane>

          <TabPane
            tab={
              <span>
                <AlertOutlined />
                Uyarılar
              </span>
            }
            key="alerts"
          >
            <Timeline>
              {alerts.map(alert => (
                <Timeline.Item
                  key={alert.id}
                  color={
                    alert.type === 'error' ? 'red' :
                    alert.type === 'warning' ? 'orange' : 'blue'
                  }
                  dot={
                    alert.resolved ? <CheckCircleOutlined /> :
                    alert.type === 'error' ? <CloseCircleOutlined /> :
                    <ExclamationCircleOutlined />
                  }
                >
                  <Space direction="vertical">
                    <Space>
                      <Text strong>{alert.title}</Text>
                      {alert.resolved && (
                        <Tag color="success">Çözüldü</Tag>
                      )}
                    </Space>
                    <Text>{alert.description}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {dayjs(alert.timestamp).format('DD.MM.YYYY HH:mm')}
                    </Text>
                  </Space>
                </Timeline.Item>
              ))}
            </Timeline>
          </TabPane>
        </Tabs>
      </Card>

      {/* Service Details Modal */}
      <Modal
        title={`Servis Detayları: ${selectedService?.name}`}
        open={showServiceModal}
        onCancel={() => setShowServiceModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowServiceModal(false)}>
            Kapat
          </Button>,
        ]}
        width={600}
      >
        {selectedService && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Durum">
              <Tag color={getServiceStatusColor(selectedService.status)}>
                {selectedService.status.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Uptime">
              {selectedService.uptime}
            </Descriptions.Item>
            <Descriptions.Item label="CPU Kullanımı">
              <Progress percent={selectedService.cpu} />
            </Descriptions.Item>
            <Descriptions.Item label="Bellek Kullanımı">
              <Progress percent={selectedService.memory} />
            </Descriptions.Item>
            <Descriptions.Item label="Yanıt Süresi">
              {selectedService.responseTime}ms
            </Descriptions.Item>
            <Descriptions.Item label="Hata Oranı">
              {selectedService.errorRate}%
            </Descriptions.Item>
            <Descriptions.Item label="Son Kontrol">
              {dayjs(selectedService.lastCheck).format('DD.MM.YYYY HH:mm:ss')}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Log Details Modal */}
      <Modal
        title="Log Detayları"
        open={showLogModal}
        onCancel={() => setShowLogModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowLogModal(false)}>
            Kapat
          </Button>,
        ]}
        width={700}
      >
        {selectedLog && (
          <>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Zaman">
                {dayjs(selectedLog.timestamp).format('DD.MM.YYYY HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="Seviye">
                <Tag color={getLogLevelColor(selectedLog.level)}>
                  {selectedLog.level.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Kaynak">
                {selectedLog.source}
              </Descriptions.Item>
              <Descriptions.Item label="Mesaj">
                {selectedLog.message}
              </Descriptions.Item>
            </Descriptions>
            {selectedLog.details && (
              <>
                <Divider>Detaylar</Divider>
                <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </>
            )}
          </>
        )}
      </Modal>
    </div>
  );
};

// Fix for missing icon imports
const ArrowUpOutlined = () => <span>↑</span>;
const ArrowDownOutlined = () => <span>↓</span>;

export default MasterMonitoringPage;