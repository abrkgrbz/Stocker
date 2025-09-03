import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Progress,
  Typography,
  Space,
  Tag,
  Button,
  Alert,
  Badge,
  List,
  Timeline,
  Tooltip,
  Select,
  Switch,
  Divider,
  Tabs,
  notification,
  message,
  Empty,
  Skeleton,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  SyncOutlined,
  CloudServerOutlined,
  DatabaseOutlined,
  ApiOutlined,
  WifiOutlined,
  ThunderboltOutlined,
  DashboardOutlined,
  LineChartOutlined,
  AlertOutlined,
  ReloadOutlined,
  SettingOutlined,
  InfoCircleOutlined,
  RocketOutlined,
  BugOutlined,
  ClockCircleOutlined,
  FireOutlined,
} from '@ant-design/icons';
import { Area, Line, Column, Gauge, Liquid } from '@ant-design/charts';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import { useRealtimeData, useWebSocketData } from '../../hooks/useRealtimeData';
import './monitoring.css';
import './monitoring-enhanced.css';
import './monitoring-text-fix.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

// Service durumları
interface ServiceStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  uptime: number;
  lastCheck: Date;
  error?: string;
}

// Sistem metrikleri
interface SystemMetrics {
  cpu: {
    usage: number;
    cores: number;
    temperature?: number;
    processes: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
    swap: number;
  };
  disk: {
    used: number;
    total: number;
    percentage: number;
    iops: number;
  };
  network: {
    in: number;
    out: number;
    connections: number;
    errors: number;
  };
}

// Alert interface
interface SystemAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: Date;
  resolved: boolean;
}

const SystemMonitoring: React.FC = () => {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [alertsFilter, setAlertsFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');

  // Mock data - gerçek API'ye bağlanacak
  const mockMetrics: SystemMetrics = {
    cpu: {
      usage: Math.random() * 100,
      cores: 8,
      temperature: 45 + Math.random() * 20,
      processes: Math.floor(150 + Math.random() * 50),
    },
    memory: {
      used: 12.5,
      total: 16,
      percentage: 78.125,
      swap: 2.1,
    },
    disk: {
      used: 256,
      total: 512,
      percentage: 50,
      iops: Math.floor(1000 + Math.random() * 500),
    },
    network: {
      in: Math.random() * 100,
      out: Math.random() * 50,
      connections: Math.floor(200 + Math.random() * 100),
      errors: Math.floor(Math.random() * 5),
    },
  };

  // Services mock data
  const services: ServiceStatus[] = [
    {
      name: 'API Gateway',
      status: 'healthy',
      responseTime: 45,
      uptime: 99.99,
      lastCheck: new Date(),
    },
    {
      name: 'PostgreSQL Database',
      status: 'healthy',
      responseTime: 12,
      uptime: 99.95,
      lastCheck: new Date(),
    },
    {
      name: 'Redis Cache',
      status: 'healthy',
      responseTime: 2,
      uptime: 100,
      lastCheck: new Date(),
    },
    {
      name: 'File Storage',
      status: 'degraded',
      responseTime: 350,
      uptime: 98.5,
      lastCheck: new Date(),
      error: 'High latency detected',
    },
    {
      name: 'Email Service',
      status: 'healthy',
      responseTime: 120,
      uptime: 99.8,
      lastCheck: new Date(),
    },
    {
      name: 'Background Jobs',
      status: 'healthy',
      responseTime: 55,
      uptime: 99.9,
      lastCheck: new Date(),
    },
  ];

  // Alerts mock data
  const alerts: SystemAlert[] = [
    {
      id: '1',
      type: 'warning',
      title: 'High CPU Usage',
      description: 'CPU usage has been above 80% for the last 5 minutes',
      timestamp: new Date(Date.now() - 10 * 60000),
      resolved: false,
    },
    {
      id: '2',
      type: 'info',
      title: 'Backup Completed',
      description: 'Daily backup completed successfully',
      timestamp: new Date(Date.now() - 30 * 60000),
      resolved: true,
    },
    {
      id: '3',
      type: 'critical',
      title: 'Storage Service Degraded',
      description: 'File storage service experiencing high latency',
      timestamp: new Date(Date.now() - 5 * 60000),
      resolved: false,
    },
  ];

  // Metrikleri state'te tut (realtime hook yerine)
  const [metrics, setMetrics] = useState<SystemMetrics>(mockMetrics);
  const [metricsLoading, setMetricsLoading] = useState(false);
  
  // Metrikleri güncelle
  const refreshMetrics = useCallback(() => {
    setMetricsLoading(true);
    // Simüle edilmiş veri güncelleme
    setTimeout(() => {
      setMetrics({
        cpu: {
          usage: Math.random() * 100,
          cores: 8,
          temperature: 45 + Math.random() * 20,
          processes: Math.floor(150 + Math.random() * 50),
        },
        memory: {
          used: 12.5,
          total: 16,
          percentage: 78.125,
          swap: 2.1,
        },
        disk: {
          used: 256,
          total: 512,
          percentage: 50,
          iops: Math.floor(1000 + Math.random() * 500),
        },
        network: {
          in: Math.random() * 100,
          out: Math.random() * 50,
          connections: Math.floor(200 + Math.random() * 100),
          errors: Math.floor(Math.random() * 5),
        },
      });
      setMetricsLoading(false);
    }, 500);
  }, []);
  
  // Auto refresh effect
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(refreshMetrics, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, refreshMetrics]);

  // WebSocket bağlantısını devre dışı bırak (şimdilik)
  // const { data: wsData, connected } = useWebSocketData<any>(
  //   'ws://localhost:8080/monitoring',
  //   {
  //     onMessage: (data) => {
  //       console.log('WebSocket data received:', data);
  //     },
  //     onError: (error) => {
  //       console.error('WebSocket error:', error);
  //     },
  //   }
  // );
  const connected = false; // WebSocket devre dışı

  // Service status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge status="success" text="Healthy" />;
      case 'degraded':
        return <Badge status="warning" text="Degraded" />;
      case 'down':
        return <Badge status="error" text="Down" />;
      default:
        return <Badge status="default" text="Unknown" />;
    }
  };

  // Alert icon
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'warning':
        return <WarningOutlined style={{ color: '#faad14' }} />;
      case 'info':
        return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
      default:
        return null;
    }
  };

  // CPU Gauge Chart Config
  const cpuGaugeConfig = {
    percent: (metrics?.cpu.usage || 0) / 100,
    range: {
      ticks: [0, 1 / 3, 2 / 3, 1],
      color: ['#30BF78', '#FAAD14', '#F4664A'],
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
    axis: {
      label: {
        formatter: (v: any) => (Number(v) * 100).toFixed(0),
      },
      subTickLine: {
        count: 3,
      },
    },
    statistic: {
      title: {
        formatter: () => 'CPU',
        style: {
          fontSize: '14px',
          lineHeight: 1,
        },
      },
      content: {
        offsetY: 36,
        style: {
          fontSize: '24px',
          color: '#4B535E',
        },
        formatter: () => `${(metrics?.cpu.usage || 0).toFixed(1)}%`,
      },
    },
  };

  // Memory Liquid Chart Config
  const memoryLiquidConfig = {
    percent: (metrics?.memory.percentage || 0) / 100,
    outline: {
      border: 4,
      distance: 8,
    },
    wave: {
      length: 128,
    },
    statistic: {
      title: {
        formatter: () => 'Memory',
        style: {
          fontSize: '14px',
        },
      },
      content: {
        style: {
          fontSize: '24px',
        },
        formatter: () => `${(metrics?.memory.percentage || 0).toFixed(1)}%`,
      },
    },
  };

  // Network Traffic Chart Data
  const networkData = Array.from({ length: 20 }, (_, i) => ({
    time: `${i * 5}s`,
    in: Math.random() * 100,
    out: Math.random() * 50,
  }));

  const networkConfig = {
    data: networkData,
    xField: 'time',
    yField: 'in',
    smooth: true,
    height: 100,
    autoFit: true,
    areaStyle: {
      fill: 'l(270) 0:#ffffff 0.5:#7ec2f3 1:#1890ff',
    },
  };

  return (
    <div className="system-monitoring">
      {/* Header Controls */}
      <Card className="monitoring-header" bordered={false}>
        <Row align="middle" justify="space-between">
          <Col>
            <Space>
              <Title level={3} style={{ margin: 0 }}>
                <DashboardOutlined /> System Monitoring
              </Title>
              {connected && (
                <Tag color="green" icon={<WifiOutlined />}>
                  Live Connection
                </Tag>
              )}
              <Badge 
                count={alerts.filter(a => !a.resolved && a.type === 'critical').length} 
                style={{ backgroundColor: '#ff4d4f' }}
              >
                <Tag color="default">Alerts</Tag>
              </Badge>
            </Space>
          </Col>
          <Col>
            <Space>
              <Select
                value={refreshInterval}
                onChange={setRefreshInterval}
                style={{ width: 120 }}
              >
                <Select.Option value={5000}>5 seconds</Select.Option>
                <Select.Option value={10000}>10 seconds</Select.Option>
                <Select.Option value={30000}>30 seconds</Select.Option>
                <Select.Option value={60000}>1 minute</Select.Option>
              </Select>
              <Switch
                checked={autoRefresh}
                onChange={setAutoRefresh}
                checkedChildren="Auto Refresh"
                unCheckedChildren="Manual"
              />
              <Button
                icon={<ReloadOutlined spin={metricsLoading} />}
                onClick={refreshMetrics}
                type="primary"
              >
                Refresh
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Critical Alerts */}
      {alerts.filter(a => !a.resolved && a.type === 'critical').length > 0 && (
        <Alert
          message="Critical System Alert"
          description={
            <Space direction="vertical">
              {alerts
                .filter(a => !a.resolved && a.type === 'critical')
                .map(alert => (
                  <div key={alert.id}>
                    <Text strong>{alert.title}:</Text> {alert.description}
                  </div>
                ))}
            </Space>
          }
          type="error"
          showIcon
          closable
          style={{ marginBottom: 24 }}
        />
      )}

      {/* System Metrics Overview */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="metric-card" bordered={false}>
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Gauge {...cpuGaugeConfig} height={200} />
            </motion.div>
            <Divider />
            <Space direction="vertical" style={{ width: '100%' }}>
              <div className="metric-detail">
                <Text type="secondary">Cores:</Text>
                <Text strong>{metrics?.cpu.cores || 0}</Text>
              </div>
              <div className="metric-detail">
                <Text type="secondary">Temperature:</Text>
                <Text strong>{(metrics?.cpu.temperature || 0).toFixed(1)}°C</Text>
              </div>
              <div className="metric-detail">
                <Text type="secondary">Processes:</Text>
                <Text strong>{metrics?.cpu.processes || 0}</Text>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="metric-card" bordered={false}>
            <Liquid {...memoryLiquidConfig} height={200} />
            <Divider />
            <Space direction="vertical" style={{ width: '100%' }}>
              <div className="metric-detail">
                <Text type="secondary">Used:</Text>
                <Text strong>{(metrics?.memory.used || 0).toFixed(1)} GB</Text>
              </div>
              <div className="metric-detail">
                <Text type="secondary">Total:</Text>
                <Text strong>{metrics?.memory.total || 0} GB</Text>
              </div>
              <div className="metric-detail">
                <Text type="secondary">Swap:</Text>
                <Text strong>{(metrics?.memory.swap || 0).toFixed(1)} GB</Text>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="metric-card" bordered={false}>
            <div className="disk-usage">
              <CloudServerOutlined style={{ fontSize: 48, color: '#1890ff' }} />
              <Title level={2} style={{ margin: '16px 0' }}>
                <CountUp end={metrics?.disk.percentage || 0} suffix="%" />
              </Title>
              <Text type="secondary">Disk Usage</Text>
            </div>
            <Progress
              percent={metrics?.disk.percentage || 0}
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
              status={metrics?.disk.percentage > 90 ? 'exception' : 'active'}
            />
            <Divider />
            <Space direction="vertical" style={{ width: '100%' }}>
              <div className="metric-detail">
                <Text type="secondary">Used:</Text>
                <Text strong>{metrics?.disk.used || 0} GB</Text>
              </div>
              <div className="metric-detail">
                <Text type="secondary">Total:</Text>
                <Text strong>{metrics?.disk.total || 0} GB</Text>
              </div>
              <div className="metric-detail">
                <Text type="secondary">IOPS:</Text>
                <Text strong>{metrics?.disk.iops || 0}</Text>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="metric-card" bordered={false}>
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary">Network Traffic</Text>
            </div>
            <Area {...networkConfig} style={{ height: 60 }} />
            <Divider />
            <Space direction="vertical" style={{ width: '100%' }}>
              <div className="metric-detail">
                <Text type="secondary">In:</Text>
                <Text strong>{(metrics?.network.in || 0).toFixed(2)} Mbps</Text>
              </div>
              <div className="metric-detail">
                <Text type="secondary">Out:</Text>
                <Text strong>{(metrics?.network.out || 0).toFixed(2)} Mbps</Text>
              </div>
              <div className="metric-detail">
                <Text type="secondary">Connections:</Text>
                <Text strong>{metrics?.network.connections || 0}</Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Services & Alerts Tabs */}
      <Tabs defaultActiveKey="services" type="card">
        <TabPane tab={<span><ApiOutlined /> Services Status</span>} key="services">
          <Row gutter={[24, 24]}>
            {services.map((service) => (
              <Col xs={24} sm={12} lg={8} key={service.name}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className={`service-card ${service.status}`}
                    bordered={false}
                    hoverable
                    onClick={() => setSelectedService(service.name)}
                  >
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Title level={5} style={{ margin: 0 }}>{service.name}</Title>
                        {getStatusBadge(service.status)}
                      </div>
                      
                      <Row gutter={16}>
                        <Col span={12}>
                          <Statistic
                            title="Response Time"
                            value={service.responseTime}
                            suffix="ms"
                            valueStyle={{
                              color: service.responseTime > 200 ? '#faad14' : '#52c41a',
                              fontSize: 20
                            }}
                          />
                        </Col>
                        <Col span={12}>
                          <Statistic
                            title="Uptime"
                            value={service.uptime}
                            suffix="%"
                            precision={2}
                            valueStyle={{
                              color: service.uptime > 99 ? '#52c41a' : '#faad14',
                              fontSize: 20
                            }}
                          />
                        </Col>
                      </Row>

                      {service.error && (
                        <Alert message={service.error} type="warning" showIcon />
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <ClockCircleOutlined /> Last check: {new Date(service.lastCheck).toLocaleTimeString()}
                        </Text>
                        <Button size="small" type="text" icon={<SyncOutlined />}>
                          Check Now
                        </Button>
                      </div>
                    </Space>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </TabPane>

        <TabPane tab={<span><AlertOutlined /> System Alerts</span>} key="alerts">
          <Card bordered={false}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Select
                  value={alertsFilter}
                  onChange={setAlertsFilter}
                  style={{ width: 200 }}
                >
                  <Select.Option value="all">All Alerts</Select.Option>
                  <Select.Option value="critical">Critical Only</Select.Option>
                  <Select.Option value="warning">Warnings</Select.Option>
                  <Select.Option value="info">Info</Select.Option>
                </Select>
                <Button type="primary" danger icon={<BugOutlined />}>
                  Clear Resolved
                </Button>
              </div>

              <Timeline mode="left">
                {alerts
                  .filter(a => alertsFilter === 'all' || a.type === alertsFilter)
                  .map(alert => (
                    <Timeline.Item
                      key={alert.id}
                      dot={getAlertIcon(alert.type)}
                      color={alert.resolved ? 'gray' : undefined}
                    >
                      <Card
                        size="small"
                        className={`alert-card ${alert.type} ${alert.resolved ? 'resolved' : ''}`}
                      >
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text strong style={{ textDecoration: alert.resolved ? 'line-through' : 'none' }}>
                              {alert.title}
                            </Text>
                            <Tag color={alert.resolved ? 'success' : 'processing'}>
                              {alert.resolved ? 'Resolved' : 'Active'}
                            </Tag>
                          </div>
                          <Text type="secondary">{alert.description}</Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            <ClockCircleOutlined /> {new Date(alert.timestamp).toLocaleString()}
                          </Text>
                          {!alert.resolved && (
                            <Button size="small" type="primary">
                              Mark as Resolved
                            </Button>
                          )}
                        </Space>
                      </Card>
                    </Timeline.Item>
                  ))}
              </Timeline>
            </Space>
          </Card>
        </TabPane>

        <TabPane tab={<span><LineChartOutlined /> Performance Trends</span>} key="trends">
          <Card bordered={false}>
            <Empty description="Performance trends coming soon..." />
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default SystemMonitoring;