import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Tag, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Switch,
  message,
  Row,
  Col,
  Statistic,
  Alert,
  Typography,
  Divider,
  Timeline,
  Progress,
  List,
  Tooltip,
  Badge,
  Descriptions,
  Tabs,
  Radio,
  Checkbox,
  InputNumber,
  Result,
  Empty,
  Avatar
} from 'antd';
import {
  SecurityScanOutlined,
  LockOutlined,
  UnlockOutlined,
  ShieldOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  SafetyOutlined,
  KeyOutlined,
  GlobalOutlined,
  UserOutlined,
  AuditOutlined,
  FileProtectOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  ApiOutlined,
  WifiOutlined,
  CloudOutlined,
  DatabaseOutlined,
  AlertOutlined,
  BugOutlined,
  FireOutlined,
  ThunderboltOutlined,
  SettingOutlined,
  ReloadOutlined,
  DownloadOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import moment from 'moment';
import { Line, Column, Pie } from '@ant-design/plots';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

interface SecurityEvent {
  id: string;
  type: 'login_attempt' | 'permission_change' | 'data_access' | 'config_change' | 'threat_detected';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  user?: string;
  ipAddress: string;
  location?: string;
  description: string;
  status: 'resolved' | 'investigating' | 'pending' | 'blocked';
  details?: any;
}

interface ThreatDetection {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  detectedAt: string;
  source: string;
  target: string;
  status: 'active' | 'mitigated' | 'false_positive';
  description: string;
  recommendation: string;
}

interface SecurityPolicy {
  id: string;
  name: string;
  category: string;
  enabled: boolean;
  enforced: boolean;
  lastUpdated: string;
  compliance: number;
  description: string;
}

interface AccessLog {
  id: string;
  user: string;
  resource: string;
  action: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'denied' | 'error';
  duration: number;
}

const TenantSecurity: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [threats, setThreats] = useState<ThreatDetection[]>([]);
  const [policies, setPolicies] = useState<SecurityPolicy[]>([]);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  
  // Modals
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [policyModalVisible, setPolicyModalVisible] = useState(false);
  const [scanModalVisible, setScanModalVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  
  const [form] = Form.useForm();
  const [policyForm] = Form.useForm();

  // Filters
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('24h');

  useEffect(() => {
    fetchSecurityData();
  }, [id, timeRange]);

  const fetchSecurityData = async () => {
    setLoading(true);
    // Simulated data
    setTimeout(() => {
      setEvents([
        {
          id: '1',
          type: 'login_attempt',
          severity: 'medium',
          timestamp: '2024-01-15T14:30:00',
          user: 'unknown',
          ipAddress: '192.168.1.100',
          location: 'İstanbul, TR',
          description: 'Başarısız giriş denemesi (3 kez)',
          status: 'blocked'
        },
        {
          id: '2',
          type: 'threat_detected',
          severity: 'high',
          timestamp: '2024-01-15T13:15:00',
          ipAddress: '10.0.0.1',
          description: 'SQL Injection denemesi tespit edildi',
          status: 'resolved'
        },
        {
          id: '3',
          type: 'permission_change',
          severity: 'low',
          timestamp: '2024-01-15T12:00:00',
          user: 'admin@example.com',
          ipAddress: '192.168.1.1',
          description: 'Kullanıcı rolü güncellendi',
          status: 'resolved'
        },
        {
          id: '4',
          type: 'data_access',
          severity: 'medium',
          timestamp: '2024-01-15T11:30:00',
          user: 'user@example.com',
          ipAddress: '192.168.1.50',
          description: 'Hassas veri erişimi',
          status: 'investigating'
        }
      ]);

      setThreats([
        {
          id: '1',
          type: 'SQL Injection',
          severity: 'high',
          detectedAt: '2024-01-15T13:15:00',
          source: '10.0.0.1',
          target: '/api/users',
          status: 'mitigated',
          description: 'Kullanıcı girişinde SQL injection denemesi',
          recommendation: 'WAF kurallarını güncelle, input validation ekle'
        },
        {
          id: '2',
          type: 'Brute Force',
          severity: 'medium',
          detectedAt: '2024-01-15T14:30:00',
          source: '192.168.1.100',
          target: '/login',
          status: 'active',
          description: 'Kısa sürede çok fazla giriş denemesi',
          recommendation: 'Rate limiting uygula, CAPTCHA ekle'
        },
        {
          id: '3',
          type: 'XSS Attempt',
          severity: 'medium',
          detectedAt: '2024-01-14T10:20:00',
          source: '172.16.0.5',
          target: '/comments',
          status: 'mitigated',
          description: 'Script injection denemesi',
          recommendation: 'Content Security Policy güncelle'
        }
      ]);

      setPolicies([
        {
          id: '1',
          name: 'Şifre Politikası',
          category: 'Kimlik Doğrulama',
          enabled: true,
          enforced: true,
          lastUpdated: '2024-01-01T00:00:00',
          compliance: 95,
          description: 'Minimum 8 karakter, büyük/küçük harf, rakam ve özel karakter'
        },
        {
          id: '2',
          name: 'İki Faktörlü Doğrulama',
          category: 'Kimlik Doğrulama',
          enabled: true,
          enforced: false,
          lastUpdated: '2024-01-10T00:00:00',
          compliance: 60,
          description: 'Tüm kullanıcılar için 2FA zorunlu'
        },
        {
          id: '3',
          name: 'Veri Şifreleme',
          category: 'Veri Güvenliği',
          enabled: true,
          enforced: true,
          lastUpdated: '2023-12-15T00:00:00',
          compliance: 100,
          description: 'AES-256 ile veri şifreleme'
        },
        {
          id: '4',
          name: 'IP Beyaz Liste',
          category: 'Ağ Güvenliği',
          enabled: false,
          enforced: false,
          lastUpdated: '2023-11-20T00:00:00',
          compliance: 0,
          description: 'Sadece onaylı IP adreslerinden erişim'
        }
      ]);

      setAccessLogs([
        {
          id: '1',
          user: 'admin@example.com',
          resource: '/api/users',
          action: 'GET',
          timestamp: '2024-01-15T15:00:00',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
          status: 'success',
          duration: 120
        },
        {
          id: '2',
          user: 'user@example.com',
          resource: '/api/reports',
          action: 'POST',
          timestamp: '2024-01-15T14:45:00',
          ipAddress: '192.168.1.50',
          userAgent: 'Chrome/120.0',
          status: 'denied',
          duration: 45
        }
      ]);

      setLoading(false);
    }, 1000);
  };

  const handleRunSecurityScan = () => {
    Modal.confirm({
      title: 'Güvenlik Taraması',
      content: 'Kapsamlı güvenlik taraması başlatılsın mı? Bu işlem birkaç dakika sürebilir.',
      okText: 'Başlat',
      cancelText: 'İptal',
      onOk: async () => {
        setLoading(true);
        try {
          // API call would go here
          message.success('Güvenlik taraması başlatıldı');
          setScanModalVisible(true);
        } catch (error) {
          message.error('Tarama başlatılamadı');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const getSeverityTag = (severity: string) => {
    const severityConfig: Record<string, { color: string; text: string }> = {
      low: { color: 'default', text: 'Düşük' },
      medium: { color: 'warning', text: 'Orta' },
      high: { color: 'orange', text: 'Yüksek' },
      critical: { color: 'error', text: 'Kritik' }
    };

    const config = severityConfig[severity];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
      resolved: { color: 'success', text: 'Çözüldü', icon: <CheckCircleOutlined /> },
      investigating: { color: 'processing', text: 'İnceleniyor', icon: <EyeOutlined /> },
      pending: { color: 'warning', text: 'Beklemede', icon: <ClockCircleOutlined /> },
      blocked: { color: 'error', text: 'Engellendi', icon: <StopOutlined /> },
      active: { color: 'error', text: 'Aktif', icon: <WarningOutlined /> },
      mitigated: { color: 'success', text: 'Önlendi', icon: <ShieldOutlined /> },
      false_positive: { color: 'default', text: 'Yanlış Pozitif', icon: <CloseCircleOutlined /> }
    };

    const config = statusConfig[status] || { color: 'default', text: status, icon: null };
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  const eventColumns: ColumnsType<SecurityEvent> = [
    {
      title: 'Zaman',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 150,
      render: (timestamp) => dayjs(timestamp).format('DD.MM.YYYY HH:mm')
    },
    {
      title: 'Olay',
      key: 'event',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.description}</Text>
          {record.user && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              Kullanıcı: {record.user}
            </Text>
          )}
        </Space>
      )
    },
    {
      title: 'Tür',
      dataIndex: 'type',
      key: 'type',
      width: 150,
      render: (type) => {
        const typeConfig: Record<string, { text: string; icon: React.ReactNode }> = {
          login_attempt: { text: 'Giriş Denemesi', icon: <UserOutlined /> },
          permission_change: { text: 'Yetki Değişimi', icon: <KeyOutlined /> },
          data_access: { text: 'Veri Erişimi', icon: <DatabaseOutlined /> },
          config_change: { text: 'Konfig Değişimi', icon: <SettingOutlined /> },
          threat_detected: { text: 'Tehdit Tespiti', icon: <BugOutlined /> }
        };
        const config = typeConfig[type];
        return (
          <Space>
            {config.icon}
            <Text>{config.text}</Text>
          </Space>
        );
      }
    },
    {
      title: 'Önem',
      dataIndex: 'severity',
      key: 'severity',
      width: 100,
      render: (severity) => getSeverityTag(severity)
    },
    {
      title: 'IP Adresi',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: 120
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => getStatusTag(status)
    },
    {
      title: 'İşlem',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button 
          size="small" 
          onClick={() => {
            setSelectedEvent(record);
            setEventModalVisible(true);
          }}
        >
          Detay
        </Button>
      )
    }
  ];

  const threatColumns: ColumnsType<ThreatDetection> = [
    {
      title: 'Tespit Zamanı',
      dataIndex: 'detectedAt',
      key: 'detectedAt',
      width: 150,
      render: (date) => dayjs(date).format('DD.MM.YYYY HH:mm')
    },
    {
      title: 'Tehdit Türü',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color="red" icon={<BugOutlined />}>
          {type}
        </Tag>
      )
    },
    {
      title: 'Önem',
      dataIndex: 'severity',
      key: 'severity',
      width: 100,
      render: (severity) => getSeverityTag(severity)
    },
    {
      title: 'Kaynak',
      dataIndex: 'source',
      key: 'source'
    },
    {
      title: 'Hedef',
      dataIndex: 'target',
      key: 'target'
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => getStatusTag(status)
    },
    {
      title: 'Öneri',
      dataIndex: 'recommendation',
      key: 'recommendation',
      ellipsis: true
    }
  ];

  const policyColumns: ColumnsType<SecurityPolicy> = [
    {
      title: 'Politika',
      key: 'policy',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.name}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.description}
          </Text>
        </Space>
      )
    },
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      width: 150,
      render: (category) => <Tag>{category}</Tag>
    },
    {
      title: 'Durum',
      key: 'status',
      width: 150,
      render: (_, record) => (
        <Space>
          <Tag color={record.enabled ? 'success' : 'default'}>
            {record.enabled ? 'Aktif' : 'Pasif'}
          </Tag>
          {record.enforced && (
            <Tag color="blue">Zorunlu</Tag>
          )}
        </Space>
      )
    },
    {
      title: 'Uyumluluk',
      dataIndex: 'compliance',
      key: 'compliance',
      width: 150,
      render: (compliance) => (
        <Progress 
          percent={compliance} 
          size="small"
          status={compliance === 100 ? 'success' : compliance > 80 ? 'normal' : 'exception'}
        />
      )
    },
    {
      title: 'Son Güncelleme',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      width: 150,
      render: (date) => dayjs(date).format('DD.MM.YYYY')
    },
    {
      title: 'İşlem',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Switch 
          checked={record.enabled}
          checkedChildren="Açık"
          unCheckedChildren="Kapalı"
          onChange={(checked) => {
            message.success(`${record.name} ${checked ? 'aktifleştirildi' : 'devre dışı bırakıldı'}`);
          }}
        />
      )
    }
  ];

  // Chart Data
  const securityTrendData = [
    { date: '01 Oca', events: 12, threats: 2 },
    { date: '05 Oca', events: 18, threats: 3 },
    { date: '10 Oca', events: 15, threats: 1 },
    { date: '15 Oca', events: 22, threats: 4 }
  ];

  const threatDistributionData = [
    { type: 'SQL Injection', value: 15 },
    { type: 'XSS', value: 10 },
    { type: 'Brute Force', value: 8 },
    { type: 'CSRF', value: 5 },
    { type: 'Other', value: 3 }
  ];

  const lineConfig = {
    data: securityTrendData,
    xField: 'date',
    yField: 'events',
    seriesField: 'type',
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
  };

  const pieConfig = {
    data: threatDistributionData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
  };

  const stats = {
    totalEvents: events.length,
    criticalEvents: events.filter(e => e.severity === 'critical').length,
    activeThreats: threats.filter(t => t.status === 'active').length,
    compliance: Math.round(policies.reduce((acc, p) => acc + p.compliance, 0) / policies.length)
  };

  return (
    <div style={{ padding: 24 }}>
      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={12}>
            <Title level={4} style={{ margin: 0 }}>
              <SecurityScanOutlined /> Güvenlik Merkezi
            </Title>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Space>
              <Select
                value={timeRange}
                onChange={setTimeRange}
                style={{ width: 120 }}
              >
                <Option value="1h">Son 1 Saat</Option>
                <Option value="24h">Son 24 Saat</Option>
                <Option value="7d">Son 7 Gün</Option>
                <Option value="30d">Son 30 Gün</Option>
              </Select>
              <Button icon={<ReloadOutlined />} onClick={fetchSecurityData}>
                Yenile
              </Button>
              <Button icon={<SecurityScanOutlined />} onClick={handleRunSecurityScan}>
                Güvenlik Taraması
              </Button>
              <Button icon={<DownloadOutlined />} onClick={() => setReportModalVisible(true)}>
                Rapor İndir
              </Button>
            </Space>
          </Col>
        </Row>
        <Divider />
        
        {/* Security Score */}
        <Row gutter={16} align="middle">
          <Col span={6}>
            <div style={{ textAlign: 'center' }}>
              <Progress
                type="dashboard"
                percent={85}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
                format={(percent) => (
                  <div>
                    <div style={{ fontSize: 32, fontWeight: 'bold' }}>{percent}</div>
                    <div style={{ fontSize: 14, color: '#999' }}>Güvenlik Skoru</div>
                  </div>
                )}
              />
            </div>
          </Col>
          <Col span={18}>
            <Row gutter={16}>
              <Col span={6}>
                <Statistic
                  title="Toplam Olay"
                  value={stats.totalEvents}
                  prefix={<AlertOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Kritik Olay"
                  value={stats.criticalEvents}
                  valueStyle={{ color: '#ff4d4f' }}
                  prefix={<FireOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Aktif Tehdit"
                  value={stats.activeThreats}
                  valueStyle={{ color: '#faad14' }}
                  prefix={<BugOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Politika Uyumu"
                  value={stats.compliance}
                  suffix="%"
                  valueStyle={{ color: '#52c41a' }}
                  prefix={<CheckCircleOutlined />}
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      {/* Active Threats Alert */}
      {stats.activeThreats > 0 && (
        <Alert
          message="Aktif Tehditler Mevcut"
          description={`${stats.activeThreats} adet aktif güvenlik tehdidi tespit edildi. Lütfen inceleyiniz.`}
          type="error"
          showIcon
          closable
          style={{ marginBottom: 16 }}
          action={
            <Button size="small" danger onClick={() => setActiveTab('threats')}>
              Tehditleri Görüntüle
            </Button>
          }
        />
      )}

      <Card bordered={false}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Genel Bakış" key="overview">
            <Row gutter={16}>
              <Col span={12}>
                <Card title="Güvenlik Olayları Trendi" size="small">
                  <Line {...lineConfig} height={200} />
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Tehdit Dağılımı" size="small">
                  <Pie {...pieConfig} height={200} />
                </Card>
              </Col>
            </Row>

            <Divider />

            <Title level={5}>Son Güvenlik Olayları</Title>
            <Timeline
              items={events.slice(0, 5).map(event => ({
                color: event.severity === 'critical' ? 'red' : 
                       event.severity === 'high' ? 'orange' :
                       event.severity === 'medium' ? 'yellow' : 'gray',
                children: (
                  <div>
                    <Space>
                      <Text strong>{event.description}</Text>
                      {getSeverityTag(event.severity)}
                      {getStatusTag(event.status)}
                    </Space>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {dayjs(event.timestamp).format('DD.MM.YYYY HH:mm')} - IP: {event.ipAddress}
                    </Text>
                  </div>
                )
              }))}
            />
          </TabPane>

          <TabPane tab="Güvenlik Olayları" key="events">
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Select
                  placeholder="Önem Seviyesi"
                  style={{ width: '100%' }}
                  value={severityFilter}
                  onChange={setSeverityFilter}
                  allowClear
                >
                  <Option value="all">Tümü</Option>
                  <Option value="low">Düşük</Option>
                  <Option value="medium">Orta</Option>
                  <Option value="high">Yüksek</Option>
                  <Option value="critical">Kritik</Option>
                </Select>
              </Col>
              <Col span={6}>
                <Select
                  placeholder="Olay Türü"
                  style={{ width: '100%' }}
                  value={typeFilter}
                  onChange={setTypeFilter}
                  allowClear
                >
                  <Option value="all">Tümü</Option>
                  <Option value="login_attempt">Giriş Denemesi</Option>
                  <Option value="permission_change">Yetki Değişimi</Option>
                  <Option value="data_access">Veri Erişimi</Option>
                  <Option value="threat_detected">Tehdit Tespiti</Option>
                </Select>
              </Col>
            </Row>

            <Table
              columns={eventColumns}
              dataSource={events}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Toplam ${total} olay`
              }}
            />
          </TabPane>

          <TabPane tab="Tehdit Tespiti" key="threats">
            <Alert
              message="Tehdit İzleme Sistemi"
              description="Gerçek zamanlı tehdit tespiti ve önleme sistemi aktif."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Table
              columns={threatColumns}
              dataSource={threats}
              rowKey="id"
              loading={loading}
              pagination={false}
            />
          </TabPane>

          <TabPane tab="Güvenlik Politikaları" key="policies">
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <Alert
                  message="Politika Yönetimi"
                  description="Güvenlik politikalarını buradan yönetebilirsiniz."
                  type="info"
                  showIcon
                />
              </Col>
              <Col span={12} style={{ textAlign: 'right' }}>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setPolicyModalVisible(true)}>
                  Yeni Politika
                </Button>
              </Col>
            </Row>

            <Table
              columns={policyColumns}
              dataSource={policies}
              rowKey="id"
              loading={loading}
              pagination={false}
            />
          </TabPane>

          <TabPane tab="Erişim Logları" key="access">
            <Table
              columns={[
                {
                  title: 'Zaman',
                  dataIndex: 'timestamp',
                  key: 'timestamp',
                  width: 150,
                  render: (timestamp) => dayjs(timestamp).format('DD.MM.YYYY HH:mm:ss')
                },
                {
                  title: 'Kullanıcı',
                  dataIndex: 'user',
                  key: 'user'
                },
                {
                  title: 'Kaynak',
                  dataIndex: 'resource',
                  key: 'resource'
                },
                {
                  title: 'İşlem',
                  dataIndex: 'action',
                  key: 'action',
                  width: 80,
                  render: (action) => <Tag>{action}</Tag>
                },
                {
                  title: 'IP Adresi',
                  dataIndex: 'ipAddress',
                  key: 'ipAddress',
                  width: 120
                },
                {
                  title: 'Durum',
                  dataIndex: 'status',
                  key: 'status',
                  width: 100,
                  render: (status) => (
                    <Tag color={status === 'success' ? 'success' : status === 'denied' ? 'error' : 'warning'}>
                      {status === 'success' ? 'Başarılı' : status === 'denied' ? 'Reddedildi' : 'Hata'}
                    </Tag>
                  )
                },
                {
                  title: 'Süre',
                  dataIndex: 'duration',
                  key: 'duration',
                  width: 80,
                  render: (duration) => `${duration}ms`
                }
              ]}
              dataSource={accessLogs}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 20,
                showSizeChanger: true
              }}
            />
          </TabPane>

          <TabPane tab="Güvenlik Ayarları" key="settings">
            <Row gutter={16}>
              <Col span={12}>
                <Card title="Kimlik Doğrulama">
                  <Form layout="vertical">
                    <Form.Item label="İki Faktörlü Doğrulama">
                      <Switch checkedChildren="Zorunlu" unCheckedChildren="Opsiyonel" defaultChecked />
                    </Form.Item>
                    <Form.Item label="Oturum Zaman Aşımı (dakika)">
                      <InputNumber min={5} max={1440} defaultValue={30} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item label="Maksimum Giriş Denemesi">
                      <InputNumber min={3} max={10} defaultValue={5} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item label="Şifre Karmaşıklığı">
                      <Checkbox.Group>
                        <Checkbox value="uppercase" defaultChecked>Büyük Harf</Checkbox>
                        <Checkbox value="lowercase" defaultChecked>Küçük Harf</Checkbox>
                        <Checkbox value="number" defaultChecked>Rakam</Checkbox>
                        <Checkbox value="special" defaultChecked>Özel Karakter</Checkbox>
                      </Checkbox.Group>
                    </Form.Item>
                  </Form>
                </Card>
              </Col>

              <Col span={12}>
                <Card title="Ağ Güvenliği">
                  <Form layout="vertical">
                    <Form.Item label="IP Beyaz Liste">
                      <Switch checkedChildren="Aktif" unCheckedChildren="Pasif" />
                    </Form.Item>
                    <Form.Item label="DDoS Koruması">
                      <Switch checkedChildren="Aktif" unCheckedChildren="Pasif" defaultChecked />
                    </Form.Item>
                    <Form.Item label="Web Application Firewall">
                      <Switch checkedChildren="Aktif" unCheckedChildren="Pasif" defaultChecked />
                    </Form.Item>
                    <Form.Item label="Rate Limiting (istek/dakika)">
                      <InputNumber min={10} max={1000} defaultValue={100} style={{ width: '100%' }} />
                    </Form.Item>
                  </Form>
                </Card>
              </Col>
            </Row>

            <Divider />

            <Card title="Veri Güvenliği">
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title="Şifreleme Standardı"
                    value="AES-256"
                    prefix={<LockOutlined />}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="SSL/TLS Versiyonu"
                    value="TLS 1.3"
                    prefix={<SafetyOutlined />}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Son Güvenlik Denetimi"
                    value="15.01.2024"
                    prefix={<AuditOutlined />}
                  />
                </Col>
              </Row>
            </Card>
          </TabPane>
        </Tabs>
      </Card>

      {/* Event Details Modal */}
      <Modal
        title="Güvenlik Olayı Detayları"
        open={eventModalVisible}
        onCancel={() => setEventModalVisible(false)}
        width={600}
        footer={[
          <Button key="close" onClick={() => setEventModalVisible(false)}>
            Kapat
          </Button>
        ]}
      >
        {selectedEvent && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Olay ID">
              {selectedEvent.id}
            </Descriptions.Item>
            <Descriptions.Item label="Açıklama">
              {selectedEvent.description}
            </Descriptions.Item>
            <Descriptions.Item label="Zaman">
              {dayjs(selectedEvent.timestamp).format('DD.MM.YYYY HH:mm:ss')}
            </Descriptions.Item>
            <Descriptions.Item label="Önem Seviyesi">
              {getSeverityTag(selectedEvent.severity)}
            </Descriptions.Item>
            <Descriptions.Item label="Durum">
              {getStatusTag(selectedEvent.status)}
            </Descriptions.Item>
            <Descriptions.Item label="IP Adresi">
              {selectedEvent.ipAddress}
            </Descriptions.Item>
            {selectedEvent.location && (
              <Descriptions.Item label="Konum">
                {selectedEvent.location}
              </Descriptions.Item>
            )}
            {selectedEvent.user && (
              <Descriptions.Item label="Kullanıcı">
                {selectedEvent.user}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>

      {/* Security Scan Modal */}
      <Modal
        title="Güvenlik Taraması"
        open={scanModalVisible}
        onCancel={() => setScanModalVisible(false)}
        width={700}
        footer={null}
      >
        <Result
          icon={<SecurityScanOutlined style={{ color: '#52c41a' }} />}
          title="Güvenlik Taraması Tamamlandı"
          subTitle="Sistem güvenlik taraması başarıyla tamamlandı."
          extra={[
            <Button type="primary" key="details">
              Detayları Görüntüle
            </Button>,
            <Button key="close" onClick={() => setScanModalVisible(false)}>
              Kapat
            </Button>
          ]}
        >
          <div className="desc">
            <Paragraph>
              <Text strong style={{ fontSize: 16 }}>Tarama Sonuçları:</Text>
            </Paragraph>
            <Row gutter={16}>
              <Col span={6}>
                <Statistic title="Taranan Dosya" value={1234} />
              </Col>
              <Col span={6}>
                <Statistic title="Tespit Edilen Tehdit" value={2} valueStyle={{ color: '#faad14' }} />
              </Col>
              <Col span={6}>
                <Statistic title="Güvenlik Açığı" value={0} valueStyle={{ color: '#52c41a' }} />
              </Col>
              <Col span={6}>
                <Statistic title="Tarama Süresi" value="2.5" suffix="dk" />
              </Col>
            </Row>
          </div>
        </Result>
      </Modal>
    </div>
  );
};

export default TenantSecurity;