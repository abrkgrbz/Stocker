import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Table, 
  Tag, 
  Space, 
  Button, 
  Typography, 
  Input, 
  Select, 
  DatePicker, 
  Drawer, 
  Descriptions, 
  Timeline, 
  Badge, 
  Alert, 
  Tooltip, 
  Dropdown, 
  Menu, 
  Modal, 
  List, 
  Avatar, 
  Statistic, 
  Tabs, 
  Form, 
  Radio, 
  Checkbox, 
  Divider, 
  Empty, 
  Result,
  Progress, 
  message, 
  notification 
} from 'antd';
import {
  FileSearchOutlined,
  UserOutlined,
  SecurityScanOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
  ApiOutlined,
  DatabaseOutlined,
  LockOutlined,
  UnlockOutlined,
  LoginOutlined,
  LogoutOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  DownloadOutlined,
  UploadOutlined,
  SyncOutlined,
  SettingOutlined,
  TeamOutlined,
  AuditOutlined,
  FilterOutlined,
  ExportOutlined,
  EyeOutlined,
  DesktopOutlined,
  MobileOutlined,
  TabletOutlined,
  CloudOutlined,
  CodeOutlined,
  SafetyOutlined,
  AlertOutlined,
  BellOutlined,
  FlagOutlined,
  BugOutlined,
  FireOutlined,
  ThunderboltOutlined,
  RocketOutlined,
  CrownOutlined,
  KeyOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  HistoryOutlined,
  ReloadOutlined,
  SearchOutlined,
  MoreOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  RiseOutlined,
  FallOutlined
} from '@ant-design/icons';
import { Line, Column, Pie, Area, Heatmap } from '@ant-design/plots';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);
dayjs.locale('tr');

const { Title, Text, Paragraph, Link } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  category: 'auth' | 'system' | 'data' | 'admin' | 'security' | 'api';
  severity: 'info' | 'warning' | 'error' | 'critical';
  user: string;
  userId: string;
  ipAddress: string;
  userAgent: string;
  resource?: string;
  resourceId?: string;
  description: string;
  details?: any;
  result: 'success' | 'failure';
  duration?: number;
  tenant?: string;
  location?: string;
  device?: string;
  sessionId?: string;
  correlationId?: string;
  tags?: string[];
}

interface SecurityEvent {
  id: string;
  timestamp: string;
  type: 'intrusion' | 'bruteforce' | 'malware' | 'ddos' | 'injection' | 'xss' | 'csrf';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  target: string;
  description: string;
  status: 'detected' | 'blocked' | 'investigating' | 'resolved';
  assignedTo?: string;
  actionTaken?: string;
}

interface ComplianceReport {
  id: string;
  standard: 'GDPR' | 'HIPAA' | 'PCI-DSS' | 'SOC2' | 'ISO27001';
  status: 'compliant' | 'non-compliant' | 'partial';
  lastAudit: string;
  nextAudit: string;
  score: number;
  findings: number;
  criticalIssues: number;
}

interface AuditStatistics {
  totalEvents: number;
  failedAttempts: number;
  securityIncidents: number;
  dataChanges: number;
  adminActions: number;
  apiCalls: number;
  uniqueUsers: number;
  averageResponseTime: number;
}

const AuditLogsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('logs');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(7, 'days'),
    dayjs()
  ]);
  const [exportForm] = Form.useForm();
  const [filterForm] = Form.useForm();

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: '1',
      timestamp: '2024-01-15 14:32:15',
      action: 'USER_LOGIN',
      category: 'auth',
      severity: 'info',
      user: 'admin@example.com',
      userId: 'usr_123',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      description: 'Kullanıcı başarıyla giriş yaptı',
      result: 'success',
      duration: 245,
      tenant: 'Tenant A',
      location: 'İstanbul, TR',
      device: 'Desktop',
      sessionId: 'sess_abc123',
      tags: ['login', 'authentication']
    },
    {
      id: '2',
      timestamp: '2024-01-15 14:28:42',
      action: 'USER_LOGIN_FAILED',
      category: 'auth',
      severity: 'warning',
      user: 'user@example.com',
      userId: 'usr_456',
      ipAddress: '10.0.0.50',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0)',
      description: 'Başarısız giriş denemesi - Yanlış şifre',
      result: 'failure',
      duration: 180,
      location: 'Ankara, TR',
      device: 'Mobile',
      tags: ['failed-login', 'security']
    },
    {
      id: '3',
      timestamp: '2024-01-15 14:15:00',
      action: 'TENANT_CREATED',
      category: 'admin',
      severity: 'info',
      user: 'admin@example.com',
      userId: 'usr_123',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0',
      resource: 'Tenant',
      resourceId: 'tenant_789',
      description: 'Yeni tenant oluşturuldu: Test Company',
      result: 'success',
      duration: 1250,
      tags: ['tenant', 'creation']
    },
    {
      id: '4',
      timestamp: '2024-01-15 13:45:00',
      action: 'DATA_EXPORT',
      category: 'data',
      severity: 'warning',
      user: 'analyst@example.com',
      userId: 'usr_789',
      ipAddress: '192.168.1.150',
      userAgent: 'Mozilla/5.0',
      resource: 'Report',
      resourceId: 'report_123',
      description: 'Kullanıcı verileri dışa aktarıldı (50000 kayıt)',
      result: 'success',
      duration: 5420,
      tenant: 'Tenant B',
      tags: ['export', 'data', 'compliance']
    },
    {
      id: '5',
      timestamp: '2024-01-15 12:30:00',
      action: 'UNAUTHORIZED_ACCESS',
      category: 'security',
      severity: 'critical',
      user: 'unknown',
      userId: 'unknown',
      ipAddress: '185.220.101.45',
      userAgent: 'curl/7.68.0',
      resource: 'API',
      description: 'Yetkisiz API erişim denemesi tespit edildi',
      result: 'failure',
      location: 'Unknown',
      tags: ['security', 'intrusion', 'blocked']
    },
    {
      id: '6',
      timestamp: '2024-01-15 11:20:00',
      action: 'PERMISSION_CHANGED',
      category: 'admin',
      severity: 'warning',
      user: 'admin@example.com',
      userId: 'usr_123',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0',
      resource: 'User',
      resourceId: 'usr_999',
      description: 'Kullanıcı yetkileri güncellendi - Admin yetkisi verildi',
      result: 'success',
      duration: 150,
      tags: ['permission', 'admin', 'critical-change']
    }
  ]);

  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([
    {
      id: '1',
      timestamp: '2024-01-15 12:30:00',
      type: 'bruteforce',
      severity: 'high',
      source: '185.220.101.45',
      target: 'Login API',
      description: 'Brute force saldırısı tespit edildi - 50 başarısız deneme',
      status: 'blocked',
      actionTaken: 'IP adresi 24 saat engellendi'
    },
    {
      id: '2',
      timestamp: '2024-01-15 10:15:00',
      type: 'injection',
      severity: 'critical',
      source: '192.168.1.200',
      target: 'Search API',
      description: 'SQL injection denemesi tespit edildi',
      status: 'blocked',
      actionTaken: 'İstek engellendi, güvenlik ekibi bilgilendirildi'
    },
    {
      id: '3',
      timestamp: '2024-01-14 22:45:00',
      type: 'ddos',
      severity: 'high',
      source: 'Multiple IPs',
      target: 'Main Application',
      description: 'DDoS saldırısı tespit edildi - 10000+ istek/sn',
      status: 'resolved',
      assignedTo: 'Security Team',
      actionTaken: 'CloudFlare DDoS koruması devreye alındı'
    }
  ]);

  const [complianceReports] = useState<ComplianceReport[]>([
    {
      id: '1',
      standard: 'GDPR',
      status: 'compliant',
      lastAudit: '2024-01-01',
      nextAudit: '2024-04-01',
      score: 95,
      findings: 2,
      criticalIssues: 0
    },
    {
      id: '2',
      standard: 'ISO27001',
      status: 'partial',
      lastAudit: '2023-12-15',
      nextAudit: '2024-03-15',
      score: 78,
      findings: 8,
      criticalIssues: 2
    },
    {
      id: '3',
      standard: 'PCI-DSS',
      status: 'compliant',
      lastAudit: '2024-01-10',
      nextAudit: '2024-07-10',
      score: 92,
      findings: 3,
      criticalIssues: 0
    }
  ]);

  const [statistics] = useState<AuditStatistics>({
    totalEvents: 15420,
    failedAttempts: 342,
    securityIncidents: 28,
    dataChanges: 3456,
    adminActions: 892,
    apiCalls: 8954,
    uniqueUsers: 245,
    averageResponseTime: 350
  });

  // Chart data
  const activityData = [
    { hour: '00:00', count: 120, type: 'Normal' },
    { hour: '04:00', count: 85, type: 'Normal' },
    { hour: '08:00', count: 450, type: 'Normal' },
    { hour: '12:00', count: 680, type: 'Normal' },
    { hour: '16:00', count: 520, type: 'Normal' },
    { hour: '20:00', count: 280, type: 'Normal' },
    { hour: '00:00', count: 15, type: 'Suspicious' },
    { hour: '04:00', count: 8, type: 'Suspicious' },
    { hour: '08:00', count: 12, type: 'Suspicious' },
    { hour: '12:00', count: 25, type: 'Suspicious' },
    { hour: '16:00', count: 18, type: 'Suspicious' },
    { hour: '20:00', count: 10, type: 'Suspicious' }
  ];

  const categoryData = [
    { category: 'Authentication', value: 4520 },
    { category: 'System', value: 3280 },
    { category: 'Data Access', value: 2890 },
    { category: 'Admin Actions', value: 1850 },
    { category: 'API Calls', value: 1680 },
    { category: 'Security', value: 1200 }
  ];

  const severityData = [
    { type: 'Info', value: 8500 },
    { type: 'Warning', value: 4200 },
    { type: 'Error', value: 2100 },
    { type: 'Critical', value: 620 }
  ];

  const heatmapData = [];
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 24; j++) {
      heatmapData.push({
        day: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'][i],
        hour: j,
        value: Math.floor(Math.random() * 100)
      });
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'red';
      case 'error': return 'orange';
      case 'warning': return 'gold';
      case 'info': return 'blue';
      default: return 'default';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'auth': return <LoginOutlined />;
      case 'system': return <DesktopOutlined />;
      case 'data': return <DatabaseOutlined />;
      case 'admin': return <CrownOutlined />;
      case 'security': return <SecurityScanOutlined />;
      case 'api': return <ApiOutlined />;
      default: return <InfoCircleOutlined />;
    }
  };

  const getResultIcon = (result: string) => {
    return result === 'success' 
      ? <CheckCircleOutlined style={{ color: '#52c41a' }} />
      : <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
  };

  const getDeviceIcon = (device?: string) => {
    switch (device) {
      case 'Desktop': return <DesktopOutlined />;
      case 'Mobile': return <MobileOutlined />;
      case 'Tablet': return <TabletOutlined />;
      default: return <GlobalOutlined />;
    }
  };

  const handleExport = () => {
    exportForm.validateFields().then(values => {
      setLoading(true);
      message.loading('Dışa aktarılıyor...');
      setTimeout(() => {
        setLoading(false);
        message.success('Audit logları başarıyla dışa aktarıldı');
        setExportModalVisible(false);
        exportForm.resetFields();
      }, 2000);
    });
  };

  const handleFilter = () => {
    filterForm.validateFields().then(values => {
      message.success('Filtreler uygulandı');
      setFilterModalVisible(false);
    });
  };

  const auditColumns = [
    {
      title: 'Zaman',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 160,
      render: (timestamp: string) => (
        <Tooltip title={dayjs(timestamp).format('DD.MM.YYYY HH:mm:ss')}>
          <Text style={{ fontSize: 12 }}>{dayjs(timestamp).fromNow()}</Text>
        </Tooltip>
      )
    },
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (category: string) => (
        <Space>
          {getCategoryIcon(category)}
          <Tag>{category.toUpperCase()}</Tag>
        </Space>
      )
    },
    {
      title: 'Aksiyon',
      dataIndex: 'action',
      key: 'action',
      render: (action: string, record: AuditLog) => (
        <Space direction="vertical" size={0}>
          <Text strong>{action}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.description}
          </Text>
        </Space>
      )
    },
    {
      title: 'Kullanıcı',
      dataIndex: 'user',
      key: 'user',
      render: (user: string, record: AuditLog) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <Space direction="vertical" size={0}>
            <Text>{user}</Text>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {record.ipAddress}
            </Text>
          </Space>
        </Space>
      )
    },
    {
      title: 'Önem',
      dataIndex: 'severity',
      key: 'severity',
      width: 90,
      render: (severity: string) => (
        <Tag color={getSeverityColor(severity)}>
          {severity === 'critical' ? 'KRİTİK' :
           severity === 'error' ? 'HATA' :
           severity === 'warning' ? 'UYARI' : 'BİLGİ'}
        </Tag>
      )
    },
    {
      title: 'Sonuç',
      dataIndex: 'result',
      key: 'result',
      width: 80,
      render: (result: string) => (
        <Space>
          {getResultIcon(result)}
          <Text type={result === 'success' ? 'success' : 'danger'}>
            {result === 'success' ? 'Başarılı' : 'Başarısız'}
          </Text>
        </Space>
      )
    },
    {
      title: 'Cihaz',
      dataIndex: 'device',
      key: 'device',
      width: 80,
      render: (device?: string) => (
        <Tooltip title={device || 'Bilinmiyor'}>
          {getDeviceIcon(device)}
        </Tooltip>
      )
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 100,
      render: (_: any, record: AuditLog) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedLog(record);
              setDetailDrawerVisible(true);
            }}
          >
            Detay
          </Button>
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item key="correlate" icon={<LinkOutlined />}>
                  İlişkili Loglar
                </Menu.Item>
                <Menu.Item key="investigate" icon={<SearchOutlined />}>
                  İncele
                </Menu.Item>
                <Menu.Item key="report" icon={<FlagOutlined />}>
                  Raporla
                </Menu.Item>
              </Menu>
            }
          >
            <Button size="small" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      )
    }
  ];

  const securityColumns = [
    {
      title: 'Zaman',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp: string) => dayjs(timestamp).format('DD.MM.YYYY HH:mm')
    },
    {
      title: 'Tip',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color="red">
          {type === 'bruteforce' ? 'Brute Force' :
           type === 'injection' ? 'SQL Injection' :
           type === 'ddos' ? 'DDoS' :
           type === 'malware' ? 'Malware' :
           type === 'xss' ? 'XSS' :
           type === 'csrf' ? 'CSRF' : type.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Önem',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity: string) => (
        <Badge
          status={severity === 'critical' ? 'error' :
                 severity === 'high' ? 'warning' :
                 severity === 'medium' ? 'processing' : 'default'}
          text={severity === 'critical' ? 'Kritik' :
               severity === 'high' ? 'Yüksek' :
               severity === 'medium' ? 'Orta' : 'Düşük'}
        />
      )
    },
    {
      title: 'Kaynak',
      dataIndex: 'source',
      key: 'source',
      render: (source: string) => <Text code>{source}</Text>
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
      render: (status: string) => (
        <Badge
          status={status === 'resolved' ? 'success' :
                 status === 'blocked' ? 'warning' :
                 status === 'investigating' ? 'processing' : 'error'}
          text={status === 'resolved' ? 'Çözüldü' :
               status === 'blocked' ? 'Engellendi' :
               status === 'investigating' ? 'İnceleniyor' : 'Tespit Edildi'}
        />
      )
    },
    {
      title: 'Aksiyon',
      dataIndex: 'actionTaken',
      key: 'actionTaken',
      render: (action?: string) => action || '-'
    }
  ];

  const lineConfig = {
    data: activityData,
    xField: 'hour',
    yField: 'count',
    seriesField: 'type',
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
  };

  const columnConfig = {
    data: categoryData,
    xField: 'category',
    yField: 'value',
    label: {
      position: 'middle',
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
    },
  };

  const pieConfig = {
    appendPadding: 10,
    data: severityData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
    },
    interactions: [
      {
        type: 'element-active',
      },
    ],
  };

  const heatmapConfig = {
    data: heatmapData,
    xField: 'hour',
    yField: 'day',
    colorField: 'value',
    color: ['#174c83', '#7eb6d4', '#efefeb', '#efa759', '#9b4d16'],
    meta: {
      hour: {
        type: 'cat',
      },
    },
  };

  // Add missing import
  const LinkOutlined = () => <span>🔗</span>;

  return (
    <div style={{ padding: 24 }}>
      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={12}>
            <Title level={4} style={{ margin: 0 }}>
              <AuditOutlined /> Denetim Günlükleri
            </Title>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Space>
              <RangePicker
                value={dateRange}
                onChange={(dates) => dates && setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
                format="DD.MM.YYYY"
                placeholder={['Başlangıç', 'Bitiş']}
              />
              <Button icon={<FilterOutlined />} onClick={() => setFilterModalVisible(true)}>
                Filtrele
              </Button>
              <Button icon={<ExportOutlined />} onClick={() => setExportModalVisible(true)}>
                Dışa Aktar
              </Button>
              <Button icon={<ReloadOutlined />} onClick={() => message.info('Loglar yenilendi')}>
                Yenile
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={3}>
          <Card bordered={false}>
            <Statistic
              title="Toplam Olay"
              value={statistics.totalEvents}
              prefix={<FileSearchOutlined />}
            />
          </Card>
        </Col>
        <Col span={3}>
          <Card bordered={false}>
            <Statistic
              title="Başarısız Girişler"
              value={statistics.failedAttempts}
              prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={3}>
          <Card bordered={false}>
            <Statistic
              title="Güvenlik Olayları"
              value={statistics.securityIncidents}
              prefix={<WarningOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={3}>
          <Card bordered={false}>
            <Statistic
              title="Veri Değişiklikleri"
              value={statistics.dataChanges}
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
        <Col span={3}>
          <Card bordered={false}>
            <Statistic
              title="Admin İşlemleri"
              value={statistics.adminActions}
              prefix={<CrownOutlined style={{ color: '#722ed1' }} />}
            />
          </Card>
        </Col>
        <Col span={3}>
          <Card bordered={false}>
            <Statistic
              title="API Çağrıları"
              value={statistics.apiCalls}
              prefix={<ApiOutlined />}
            />
          </Card>
        </Col>
        <Col span={3}>
          <Card bordered={false}>
            <Statistic
              title="Aktif Kullanıcılar"
              value={statistics.uniqueUsers}
              prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col span={3}>
          <Card bordered={false}>
            <Statistic
              title="Ort. Yanıt (ms)"
              value={statistics.averageResponseTime}
              suffix="ms"
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card bordered={false}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Audit Logları" key="logs">
            <Space style={{ marginBottom: 16 }}>
              <Select placeholder="Kategori" style={{ width: 120 }} defaultValue="all">
                <Option value="all">Tümü</Option>
                <Option value="auth">Auth</Option>
                <Option value="system">System</Option>
                <Option value="data">Data</Option>
                <Option value="admin">Admin</Option>
                <Option value="security">Security</Option>
                <Option value="api">API</Option>
              </Select>
              <Select placeholder="Önem" style={{ width: 120 }} defaultValue="all">
                <Option value="all">Tümü</Option>
                <Option value="critical">Kritik</Option>
                <Option value="error">Hata</Option>
                <Option value="warning">Uyarı</Option>
                <Option value="info">Bilgi</Option>
              </Select>
              <Select placeholder="Sonuç" style={{ width: 120 }} defaultValue="all">
                <Option value="all">Tümü</Option>
                <Option value="success">Başarılı</Option>
                <Option value="failure">Başarısız</Option>
              </Select>
              <Input.Search 
                placeholder="Log ara..." 
                style={{ width: 300 }}
                enterButton={<SearchOutlined />}
              />
            </Space>

            <Table
              columns={auditColumns}
              dataSource={auditLogs}
              rowKey="id"
              pagination={{ 
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Toplam ${total} kayıt`
              }}
              scroll={{ x: 1200 }}
            />
          </TabPane>

          <TabPane tab="Güvenlik Olayları" key="security">
            <Alert
              message="Güvenlik İzleme Aktif"
              description="Sistem güvenlik olaylarını gerçek zamanlı olarak izliyor ve tehditleri otomatik olarak engelliyor."
              type="info"
              showIcon
              icon={<SecurityScanOutlined />}
              style={{ marginBottom: 16 }}
            />

            <Table
              columns={securityColumns}
              dataSource={securityEvents}
              rowKey="id"
              pagination={false}
            />

            <Divider />

            <Card title="Son 24 Saat Tehdit Analizi" size="small">
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title="Engellenen Saldırılar"
                    value={42}
                    prefix={<SafetyOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Aktif Tehditler"
                    value={3}
                    prefix={<FireOutlined />}
                    valueStyle={{ color: '#ff4d4f' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="İncelenen Olaylar"
                    value={7}
                    prefix={<SearchOutlined />}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Col>
              </Row>
            </Card>
          </TabPane>

          <TabPane tab="Aktivite Analizi" key="analytics">
            <Row gutter={16}>
              <Col span={12}>
                <Card title="Saatlik Aktivite Dağılımı" size="small">
                  <Line {...lineConfig} height={250} />
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Kategori Dağılımı" size="small">
                  <Column {...columnConfig} height={250} />
                </Card>
              </Col>
            </Row>
            <Divider />
            <Row gutter={16}>
              <Col span={8}>
                <Card title="Önem Seviyesi Dağılımı" size="small">
                  <Pie {...pieConfig} height={250} />
                </Card>
              </Col>
              <Col span={16}>
                <Card title="Haftalık Aktivite Isı Haritası" size="small">
                  <Heatmap {...heatmapConfig} height={250} />
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Uyumluluk" key="compliance">
            <Row gutter={[16, 16]}>
              {complianceReports.map(report => (
                <Col span={8} key={report.id}>
                  <Card>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Space>
                        <Title level={5} style={{ margin: 0 }}>{report.standard}</Title>
                        <Badge
                          status={report.status === 'compliant' ? 'success' :
                                 report.status === 'partial' ? 'warning' : 'error'}
                          text={report.status === 'compliant' ? 'Uyumlu' :
                               report.status === 'partial' ? 'Kısmi' : 'Uyumsuz'}
                        />
                      </Space>
                      <Progress
                        percent={report.score}
                        status={report.score >= 90 ? 'success' :
                               report.score >= 70 ? 'normal' : 'exception'}
                      />
                      <Row gutter={16}>
                        <Col span={12}>
                          <Statistic
                            title="Bulgular"
                            value={report.findings}
                            valueStyle={{ fontSize: 16 }}
                          />
                        </Col>
                        <Col span={12}>
                          <Statistic
                            title="Kritik"
                            value={report.criticalIssues}
                            valueStyle={{ fontSize: 16, color: report.criticalIssues > 0 ? '#ff4d4f' : '#52c41a' }}
                          />
                        </Col>
                      </Row>
                      <Divider style={{ margin: '12px 0' }} />
                      <Space direction="vertical" size={0} style={{ width: '100%' }}>
                        <Text type="secondary">
                          Son Denetim: {dayjs(report.lastAudit).format('DD.MM.YYYY')}
                        </Text>
                        <Text type="secondary">
                          Sonraki Denetim: {dayjs(report.nextAudit).format('DD.MM.YYYY')}
                        </Text>
                      </Space>
                      <Button type="primary" block icon={<FileSearchOutlined />}>
                        Raporu Görüntüle
                      </Button>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>

            <Divider />

            <Alert
              message="Uyumluluk Durumu"
              description="Sistemimiz GDPR, ISO27001 ve PCI-DSS standartlarına uygun olarak denetlenmektedir. Düzenli denetimler ve güvenlik testleri yapılmaktadır."
              type="success"
              showIcon
              action={
                <Button size="small" type="primary">
                  Detaylı Rapor
                </Button>
              }
            />
          </TabPane>

          <TabPane tab="Oturum İzleme" key="sessions">
            <List
              dataSource={auditLogs.filter(log => log.category === 'auth')}
              renderItem={log => (
                <List.Item
                  actions={[
                    <Button size="small" icon={<EyeOutlined />}>Detay</Button>,
                    log.sessionId && (
                      <Button size="small" icon={<CloseCircleOutlined />} danger>
                        Oturumu Sonlandır
                      </Button>
                    )
                  ].filter(Boolean)}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={
                      <Space>
                        <Text strong>{log.user}</Text>
                        <Tag color={log.result === 'success' ? 'green' : 'red'}>
                          {log.action}
                        </Tag>
                        {log.device && getDeviceIcon(log.device)}
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={0}>
                        <Text type="secondary">{log.description}</Text>
                        <Space>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            <EnvironmentOutlined /> {log.location || 'Bilinmeyen Konum'}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            <GlobalOutlined /> {log.ipAddress}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            <ClockCircleOutlined /> {dayjs(log.timestamp).format('HH:mm:ss')}
                          </Text>
                        </Space>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Detail Drawer */}
      <Drawer
        title="Log Detayları"
        placement="right"
        width={600}
        open={detailDrawerVisible}
        onClose={() => setDetailDrawerVisible(false)}
      >
        {selectedLog && (
          <div>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="ID">{selectedLog.id}</Descriptions.Item>
              <Descriptions.Item label="Zaman">
                {dayjs(selectedLog.timestamp).format('DD.MM.YYYY HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="Aksiyon">
                <Tag>{selectedLog.action}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Kategori">
                <Space>
                  {getCategoryIcon(selectedLog.category)}
                  <Text>{selectedLog.category}</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Önem Seviyesi">
                <Tag color={getSeverityColor(selectedLog.severity)}>
                  {selectedLog.severity.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Kullanıcı">
                <Space>
                  <Avatar size="small" icon={<UserOutlined />} />
                  <Text>{selectedLog.user}</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="IP Adresi">
                <Text code>{selectedLog.ipAddress}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="User Agent">
                <Text style={{ fontSize: 12 }}>{selectedLog.userAgent}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Sonuç">
                <Space>
                  {getResultIcon(selectedLog.result)}
                  <Text>{selectedLog.result === 'success' ? 'Başarılı' : 'Başarısız'}</Text>
                </Space>
              </Descriptions.Item>
              {selectedLog.duration && (
                <Descriptions.Item label="Süre">
                  {selectedLog.duration} ms
                </Descriptions.Item>
              )}
              {selectedLog.tenant && (
                <Descriptions.Item label="Tenant">
                  {selectedLog.tenant}
                </Descriptions.Item>
              )}
              {selectedLog.location && (
                <Descriptions.Item label="Konum">
                  <Space>
                    <EnvironmentOutlined />
                    <Text>{selectedLog.location}</Text>
                  </Space>
                </Descriptions.Item>
              )}
              {selectedLog.device && (
                <Descriptions.Item label="Cihaz">
                  <Space>
                    {getDeviceIcon(selectedLog.device)}
                    <Text>{selectedLog.device}</Text>
                  </Space>
                </Descriptions.Item>
              )}
              {selectedLog.sessionId && (
                <Descriptions.Item label="Oturum ID">
                  <Text code>{selectedLog.sessionId}</Text>
                </Descriptions.Item>
              )}
              {selectedLog.correlationId && (
                <Descriptions.Item label="Correlation ID">
                  <Text code>{selectedLog.correlationId}</Text>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Açıklama">
                {selectedLog.description}
              </Descriptions.Item>
              {selectedLog.tags && (
                <Descriptions.Item label="Etiketler">
                  <Space wrap>
                    {selectedLog.tags.map(tag => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </Space>
                </Descriptions.Item>
              )}
            </Descriptions>

            {selectedLog.details && (
              <>
                <Divider />
                <Card title="Ek Detaylar" size="small">
                  <pre style={{ fontSize: 12 }}>
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </Card>
              </>
            )}

            <Divider />
            
            <Card title="İlişkili Olaylar" size="small">
              <Timeline>
                <Timeline.Item color="green">
                  <Text>Kullanıcı oturum açtı</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    5 dakika önce
                  </Text>
                </Timeline.Item>
                <Timeline.Item color="blue">
                  <Text>Profil güncellendi</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    3 dakika önce
                  </Text>
                </Timeline.Item>
                <Timeline.Item color="orange">
                  <Text>Yetki değişikliği</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    2 dakika önce
                  </Text>
                </Timeline.Item>
              </Timeline>
            </Card>
          </div>
        )}
      </Drawer>

      {/* Export Modal */}
      <Modal
        title="Audit Loglarını Dışa Aktar"
        open={exportModalVisible}
        onOk={handleExport}
        onCancel={() => setExportModalVisible(false)}
        width={600}
      >
        <Form form={exportForm} layout="vertical">
          <Form.Item
            name="dateRange"
            label="Tarih Aralığı"
            rules={[{ required: true, message: 'Tarih aralığı seçiniz' }]}
          >
            <RangePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
          </Form.Item>
          <Form.Item
            name="categories"
            label="Kategoriler"
          >
            <Checkbox.Group>
              <Row>
                <Col span={8}><Checkbox value="auth">Authentication</Checkbox></Col>
                <Col span={8}><Checkbox value="system">System</Checkbox></Col>
                <Col span={8}><Checkbox value="data">Data</Checkbox></Col>
                <Col span={8}><Checkbox value="admin">Admin</Checkbox></Col>
                <Col span={8}><Checkbox value="security">Security</Checkbox></Col>
                <Col span={8}><Checkbox value="api">API</Checkbox></Col>
              </Row>
            </Checkbox.Group>
          </Form.Item>
          <Form.Item
            name="format"
            label="Çıktı Formatı"
            rules={[{ required: true, message: 'Format seçiniz' }]}
          >
            <Radio.Group>
              <Radio value="csv">CSV</Radio>
              <Radio value="json">JSON</Radio>
              <Radio value="pdf">PDF</Radio>
              <Radio value="excel">Excel</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            name="includeDetails"
            valuePropName="checked"
          >
            <Checkbox>Detaylı bilgileri dahil et</Checkbox>
          </Form.Item>
        </Form>
      </Modal>

      {/* Filter Modal */}
      <Modal
        title="Gelişmiş Filtreler"
        open={filterModalVisible}
        onOk={handleFilter}
        onCancel={() => setFilterModalVisible(false)}
        width={700}
      >
        <Form form={filterForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="user" label="Kullanıcı">
                <Input placeholder="E-posta veya kullanıcı adı" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="ipAddress" label="IP Adresi">
                <Input placeholder="192.168.1.1" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="action" label="Aksiyon">
                <Select placeholder="Aksiyon seçiniz" mode="multiple">
                  <Option value="USER_LOGIN">Kullanıcı Girişi</Option>
                  <Option value="USER_LOGOUT">Kullanıcı Çıkışı</Option>
                  <Option value="DATA_EXPORT">Veri Dışa Aktarma</Option>
                  <Option value="PERMISSION_CHANGED">Yetki Değişikliği</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="result" label="Sonuç">
                <Select placeholder="Sonuç seçiniz">
                  <Option value="all">Tümü</Option>
                  <Option value="success">Başarılı</Option>
                  <Option value="failure">Başarısız</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="severity" label="Önem Seviyesi">
                <Select placeholder="Önem seviyesi" mode="multiple">
                  <Option value="critical">Kritik</Option>
                  <Option value="error">Hata</Option>
                  <Option value="warning">Uyarı</Option>
                  <Option value="info">Bilgi</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="tenant" label="Tenant">
                <Select placeholder="Tenant seçiniz">
                  <Option value="all">Tümü</Option>
                  <Option value="tenant-a">Tenant A</Option>
                  <Option value="tenant-b">Tenant B</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default AuditLogsPage;