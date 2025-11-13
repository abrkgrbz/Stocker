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
  message,
  Spin
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
import systemMonitoringService, {
  SystemMetrics,
  SystemHealth,
  ServiceStatus
} from '../../services/api/systemMonitoringService';
import monitoringSignalRService from '../../services/signalr/monitoringSignalRService';

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
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [timeRange, setTimeRange] = useState('1h');
  const [alertModalVisible, setAlertModalVisible] = useState(false);
  const [alertForm] = Form.useForm();

  // Real data states
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [fetchError, setFetchError] = useState<string | null>(null);

  // SignalR connection state
  const [signalRConnected, setSignalRConnected] = useState(false);
  const [signalRStatus, setSignalRStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'reconnecting'>('disconnected');

  // Chart data states
  const [cpuHistory, setCpuHistory] = useState<any[]>([]);
  const [memoryHistory, setMemoryHistory] = useState<any[]>([]);
  const [diskHistory, setDiskHistory] = useState<any[]>([]);

  // Keep mock data for alerts and logs (will be replaced in Phase 2)
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
    }
  ]);

  // Fetch real data from API
  const fetchMonitoringData = async () => {
    try {
      setLoading(true);
      setFetchError(null);

      // Fetch all data in parallel
      const [metrics, health, serviceStatus] = await Promise.all([
        systemMonitoringService.getSystemMetrics(),
        systemMonitoringService.getSystemHealth(),
        systemMonitoringService.getServiceStatus()
      ]);

      setSystemMetrics(metrics);
      setSystemHealth(health);
      setServices(serviceStatus);
      setLastUpdate(new Date());

      // Update history for charts (keep last 20 data points)
      const timestamp = dayjs().format('HH:mm:ss');
      setCpuHistory(prev => [...prev.slice(-19), { time: timestamp, value: metrics.cpu.usage }]);
      setMemoryHistory(prev => [...prev.slice(-19), { time: timestamp, value: metrics.memory.usagePercentage }]);

      // Check for alerts based on real metrics
      checkAlerts(metrics);

    } catch (error) {
      console.error('Failed to fetch monitoring data:', error);
      setFetchError('Monitoring verileri alınamadı. Lütfen daha sonra tekrar deneyin.');
      notification.error({
        message: 'Veri Alınamadı',
        description: 'Monitoring verileri yüklenirken bir hata oluştu.',
        placement: 'topRight'
      });
    } finally {
      setLoading(false);
    }
  };

  // Check alerts based on real metrics
  const checkAlerts = (metrics: SystemMetrics) => {
    alertRules.forEach(rule => {
      if (!rule.enabled) return;

      let shouldTrigger = false;
      let currentValue = 0;

      switch (rule.metric) {
        case 'cpu':
          currentValue = metrics.cpu.usage;
          break;
        case 'memory':
          currentValue = metrics.memory.usagePercentage;
          break;
        case 'disk':
          currentValue = metrics.disk.usagePercentage;
          break;
      }

      if (rule.condition === '>' && currentValue > rule.threshold) {
        shouldTrigger = true;
      } else if (rule.condition === '<' && currentValue < rule.threshold) {
        shouldTrigger = true;
      }

      if (shouldTrigger) {
        notification.warning({
          message: `Uyarı: ${rule.name}`,
          description: `${rule.metric.toUpperCase()} değeri ${currentValue.toFixed(1)}% - Eşik değer: ${rule.threshold}%`,
          placement: 'topRight',
          duration: 10
        });

        // Add to logs
        const newLog: LogEntry = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          level: rule.severity as any,
          service: 'Monitoring Alert',
          message: `${rule.name}: ${currentValue.toFixed(1)}%`,
          details: { metric: rule.metric, value: currentValue, threshold: rule.threshold }
        };
        setLogs(prev => [newLog, ...prev.slice(0, 99)]); // Keep last 100 logs
      }
    });
  };

  // SignalR initialization and auto refresh
  useEffect(() => {
    // Initial fetch - always get initial data from API
    fetchMonitoringData();

    // Initialize SignalR connection
    const initializeSignalR = async () => {
      try {
        setSignalRStatus('connecting');

        // Initialize connection
        await monitoringSignalRService.initialize();

        // Register event handlers
        monitoringSignalRService.onMetricsUpdate((data) => {
          // Update all metrics from SignalR push
          setSystemMetrics(data.metrics);
          setSystemHealth(data.health);
          setServices(data.services);
          setLastUpdate(new Date(data.collectedAt));

          // Update history charts
          const timestamp = dayjs(data.collectedAt).format('HH:mm:ss');
          setCpuHistory(prev => [...prev.slice(-29), { time: timestamp, value: data.metrics.cpu.usage }]);
          setMemoryHistory(prev => [...prev.slice(-29), { time: timestamp, value: data.metrics.memory.usagePercentage }]);
          setDiskHistory(prev => [...prev.slice(-29), { time: timestamp, value: data.metrics.disk.usagePercentage }]);

          // Check alert rules
          checkAlerts(data.metrics);
        });

        monitoringSignalRService.onAlert((alertData) => {
          // Handle alert notifications
          alertData.alerts.forEach(alert => {
            const notifyMethod = alert.severity === 'critical' ? notification.error :
                               alert.severity === 'warning' ? notification.warning :
                               notification.info;

            notifyMethod({
              message: `${alert.severity.toUpperCase()}: ${alert.metric.toUpperCase()}`,
              description: alert.message,
              placement: 'topRight',
              duration: alert.severity === 'critical' ? 0 : 10
            });
          });
        });

        monitoringSignalRService.onDockerStatsUpdate((dockerData) => {
          // Handle Docker stats updates if needed
          console.log('Docker stats received:', dockerData);
        });

        monitoringSignalRService.onConnectionStateChange((state) => {
          setSignalRStatus(state as any);
          setSignalRConnected(state === 'connected');

          // Show connection status notifications
          if (state === 'connected') {
            message.success('Real-time monitoring bağlantısı kuruldu');
          } else if (state === 'disconnected') {
            message.warning('Real-time monitoring bağlantısı koptu');
          }
        });

        // Request immediate update after connection
        await monitoringSignalRService.requestMetricsUpdate();

      } catch (error) {
        console.error('SignalR initialization error:', error);
        setSignalRStatus('disconnected');
        setSignalRConnected(false);
      }
    };

    // Initialize SignalR
    initializeSignalR();

    // Set up fallback polling if SignalR is not connected
    let interval: NodeJS.Timeout | null = null;
    if (autoRefresh && !signalRConnected) {
      interval = setInterval(() => {
        if (!signalRConnected) {
          fetchMonitoringData();
        }
      }, refreshInterval);
    }

    return () => {
      // Cleanup
      if (interval) clearInterval(interval);
      monitoringSignalRService.dispose();
    };
  }, [autoRefresh, refreshInterval, signalRConnected]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'healthy':
      case 'normal':
      case 'success':
        return '#52c41a';
      case 'degraded':
      case 'warning':
        return '#faad14';
      case 'offline':
      case 'critical':
      case 'error':
        return '#f5222d';
      default:
        return '#d9d9d9';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'degraded':
        return <WarningOutlined style={{ color: '#faad14' }} />;
      case 'offline':
        return <CloseCircleOutlined style={{ color: '#f5222d' }} />;
      default:
        return <InfoCircleOutlined style={{ color: '#d9d9d9' }} />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'info': return 'blue';
      case 'warning': return 'orange';
      case 'error': return 'red';
      case 'critical': return 'magenta';
      default: return 'default';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'info': return 'blue';
      case 'warning': return 'orange';
      case 'error': return 'red';
      case 'debug': return 'purple';
      default: return 'default';
    }
  };

  const getMetricStatus = (value: number, type: string): 'normal' | 'warning' | 'critical' => {
    switch (type) {
      case 'cpu':
      case 'memory':
      case 'disk':
        if (value > 90) return 'critical';
        if (value > 75) return 'warning';
        return 'normal';
      default:
        return 'normal';
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const createGaugeConfig = (value: number | undefined, title: string) => {
    const safeValue = value ?? 0;
    return {
      percent: safeValue / 100,
      range: {
        ticks: [0, 1],
        color: ['#52c41a', '#faad14', '#f5222d'],
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
        title: {
          formatter: () => title,
          style: {
            fontSize: '14px',
            lineHeight: '14px',
          },
        },
        content: {
          formatter: () => `${safeValue.toFixed(1)}%`,
          style: {
            fontSize: '24px',
            lineHeight: '24px',
          },
        },
      },
    };
  };

  const cpuChartConfig = {
    data: cpuHistory,
    xField: 'time',
    yField: 'value',
    smooth: true,
    lineStyle: {
      lineWidth: 2,
    },
    point: {
      size: 3,
    },
    tooltip: {
      formatter: (datum: any) => ({
        name: 'CPU',
        value: `${(datum?.value ?? 0).toFixed(1)}%`,
      }),
    },
    yAxis: {
      min: 0,
      max: 100,
      title: {
        text: 'CPU Usage (%)',
      },
    },
  };

  const memoryChartConfig = {
    data: memoryHistory,
    xField: 'time',
    yField: 'value',
    smooth: true,
    lineStyle: {
      lineWidth: 2,
      stroke: '#faad14',
    },
    point: {
      size: 3,
    },
    tooltip: {
      formatter: (datum: any) => ({
        name: 'Memory',
        value: `${(datum?.value ?? 0).toFixed(1)}%`,
      }),
    },
    yAxis: {
      min: 0,
      max: 100,
      title: {
        text: 'Memory Usage (%)',
      },
    },
  };

  const diskChartConfig = {
    data: diskHistory,
    xField: 'time',
    yField: 'value',
    smooth: true,
    lineStyle: {
      lineWidth: 2,
      stroke: '#f5222d',
    },
    point: {
      size: 3,
    },
    tooltip: {
      formatter: (datum: any) => ({
        name: 'Disk',
        value: `${(datum?.value ?? 0).toFixed(1)}%`,
      }),
    },
    yAxis: {
      min: 0,
      max: 100,
      title: {
        text: 'Disk Usage (%)',
      },
    },
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
                <Text type="secondary">
                  Son güncelleme: {dayjs(lastUpdate).format('HH:mm:ss')}
                </Text>
              </div>
            </Space>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Space>
              {/* SignalR Connection Status */}
              <Badge
                status={
                  signalRStatus === 'connected' ? 'success' :
                  signalRStatus === 'connecting' ? 'processing' :
                  signalRStatus === 'reconnecting' ? 'warning' :
                  'error'
                }
                text={
                  signalRStatus === 'connected' ? 'Real-time Bağlantı Aktif' :
                  signalRStatus === 'connecting' ? 'Bağlanıyor...' :
                  signalRStatus === 'reconnecting' ? 'Yeniden Bağlanıyor...' :
                  'Bağlantı Yok (Polling Modu)'
                }
              />
              <Divider type="vertical" />
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
                disabled={!autoRefresh || signalRConnected}
              >
                <Option value={10000}>10 saniye</Option>
                <Option value={30000}>30 saniye</Option>
                <Option value={60000}>1 dakika</Option>
                <Option value={300000}>5 dakika</Option>
              </Select>
              <Tooltip title={signalRConnected ? 'Real-time güncellemeler aktif, manuel yenileme gerekmiyor' : 'Manuel yenileme'}>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    if (signalRConnected) {
                      monitoringSignalRService.requestMetricsUpdate();
                    } else {
                      fetchMonitoringData();
                    }
                  }}
                  loading={loading}
                  type={!signalRConnected ? 'primary' : 'default'}
                >
                  Yenile
                </Button>
              </Tooltip>
            </Space>
          </Col>
        </Row>
      </Card>

      {fetchError && (
        <Alert
          message="Bağlantı Hatası"
          description={fetchError}
          type="error"
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane
          tab={
            <span>
              <DashboardOutlined />
              Genel Bakış
            </span>
          }
          key="overview"
        >
          <Spin spinning={loading}>
            {systemMetrics && (
              <>
                {/* System Metrics Cards */}
                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                  <Col xs={24} sm={12} lg={6}>
                    <Card>
                      <Statistic
                        title="CPU Kullanımı"
                        value={systemMetrics.cpu.usage}
                        precision={1}
                        suffix="%"
                        valueStyle={{
                          color: getStatusColor(getMetricStatus(systemMetrics.cpu.usage, 'cpu'))
                        }}
                        prefix={<ThunderboltOutlined />}
                      />
                      <Progress
                        percent={systemMetrics.cpu.usage}
                        strokeColor={getStatusColor(getMetricStatus(systemMetrics.cpu.usage, 'cpu'))}
                        showInfo={false}
                      />
                      <Text type="secondary">{systemMetrics.cpu.cores} çekirdek</Text>
                    </Card>
                  </Col>

                  <Col xs={24} sm={12} lg={6}>
                    <Card>
                      <Statistic
                        title="Bellek Kullanımı"
                        value={systemMetrics.memory.usagePercentage}
                        precision={1}
                        suffix="%"
                        valueStyle={{
                          color: getStatusColor(getMetricStatus(systemMetrics.memory.usagePercentage, 'memory'))
                        }}
                        prefix={<DatabaseOutlined />}
                      />
                      <Progress
                        percent={systemMetrics.memory.usagePercentage}
                        strokeColor={getStatusColor(getMetricStatus(systemMetrics.memory.usagePercentage, 'memory'))}
                        showInfo={false}
                      />
                      <Text type="secondary">
                        {formatBytes(systemMetrics.memory.used)} / {formatBytes(systemMetrics.memory.total)}
                      </Text>
                    </Card>
                  </Col>

                  <Col xs={24} sm={12} lg={6}>
                    <Card>
                      <Statistic
                        title="Disk Kullanımı"
                        value={systemMetrics.disk.usagePercentage}
                        precision={1}
                        suffix="%"
                        valueStyle={{
                          color: getStatusColor(getMetricStatus(systemMetrics.disk.usagePercentage, 'disk'))
                        }}
                        prefix={<CloudServerOutlined />}
                      />
                      <Progress
                        percent={systemMetrics.disk.usagePercentage}
                        strokeColor={getStatusColor(getMetricStatus(systemMetrics.disk.usagePercentage, 'disk'))}
                        showInfo={false}
                      />
                      <Text type="secondary">
                        {formatBytes(systemMetrics.disk.used)} / {formatBytes(systemMetrics.disk.total)}
                      </Text>
                    </Card>
                  </Col>

                  <Col xs={24} sm={12} lg={6}>
                    <Card>
                      <Statistic
                        title="Network I/O"
                        value={systemMetrics.network.speed}
                        suffix="Mbps"
                        valueStyle={{ color: '#1890ff' }}
                        prefix={<WifiOutlined />}
                      />
                      <Row>
                        <Col span={12}>
                          <Text type="secondary">
                            <ArrowUpOutlined /> {formatBytes(systemMetrics.network.bytesSent)}
                          </Text>
                        </Col>
                        <Col span={12}>
                          <Text type="secondary">
                            <ArrowDownOutlined /> {formatBytes(systemMetrics.network.bytesReceived)}
                          </Text>
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                </Row>

                {/* Performance Charts */}
                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                  <Col xs={24} lg={12}>
                    <Card title="CPU Kullanım Geçmişi" bordered={false}>
                      {cpuHistory.length > 1 ? (
                        <Line {...cpuChartConfig} height={200} />
                      ) : (
                        <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Text type="secondary">Veri toplanıyor...</Text>
                        </div>
                      )}
                    </Card>
                  </Col>
                  <Col xs={24} lg={12}>
                    <Card title="Bellek Kullanım Geçmişi" bordered={false}>
                      {memoryHistory.length > 1 ? (
                        <Line {...memoryChartConfig} height={200} />
                      ) : (
                        <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Text type="secondary">Veri toplanıyor...</Text>
                        </div>
                      )}
                    </Card>
                  </Col>
                </Row>

                {/* Disk Usage History Chart */}
                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                  <Col xs={24}>
                    <Card title="Disk Kullanım Geçmişi" bordered={false}>
                      {diskHistory.length > 1 ? (
                        <Line {...diskChartConfig} height={200} />
                      ) : (
                        <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Text type="secondary">Veri toplanıyor...</Text>
                        </div>
                      )}
                    </Card>
                  </Col>
                </Row>

                {/* Gauge Meters */}
                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                  <Col xs={24} sm={8}>
                    <Card title="CPU" bordered={false}>
                      <Gauge {...createGaugeConfig(systemMetrics.cpu.usage, 'CPU')} height={200} />
                    </Card>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Card title="Memory" bordered={false}>
                      <Gauge {...createGaugeConfig(systemMetrics.memory.usagePercentage, 'Memory')} height={200} />
                    </Card>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Card title="Disk" bordered={false}>
                      <Gauge {...createGaugeConfig(systemMetrics.disk.usagePercentage, 'Disk')} height={200} />
                    </Card>
                  </Col>
                </Row>
              </>
            )}

            {/* System Health */}
            {systemHealth && (
              <Card
                title="Sistem Sağlığı"
                bordered={false}
                extra={
                  <Tag color={getStatusColor(systemHealth.overallStatus)}>
                    {systemHealth.overallStatus.toUpperCase()}
                  </Tag>
                }
                style={{ marginBottom: 16 }}
              >
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <Text>Uptime: {Math.floor(systemHealth.uptime / 3600)} saat</Text>
                  </Col>
                </Row>
              </Card>
            )}
          </Spin>
        </TabPane>

        <TabPane
          tab={
            <span>
              <ApiOutlined />
              Servisler
            </span>
          }
          key="services"
        >
          <Card bordered={false}>
            <Table
              dataSource={services}
              columns={serviceColumns}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane
          tab={
            <span>
              <BugOutlined />
              Loglar
            </span>
          }
          key="logs"
        >
          <Card bordered={false}>
            <Table
              dataSource={logs}
              columns={logColumns}
              rowKey="id"
              pagination={{ pageSize: 20 }}
              size="small"
            />
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default MonitoringPage;