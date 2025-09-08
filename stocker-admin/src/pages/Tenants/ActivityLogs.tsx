import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Table,
  Timeline,
  Button,
  Space,
  Tag,
  Typography,
  Row,
  Col,
  Input,
  Select,
  DatePicker,
  Badge,
  Avatar,
  Tooltip,
  Modal,
  Tabs,
  List,
  Alert,
  Descriptions,
  Divider,
  Progress,
  Statistic,
  Empty,
  Drawer,
  message,
  Form,
  Switch,
  Radio,
  Checkbox,
} from 'antd';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import {
  HistoryOutlined,
  UserOutlined,
  LoginOutlined,
  LogoutOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  DownloadOutlined,
  FilterOutlined,
  SearchOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  DatabaseOutlined,
  SettingOutlined,
  CreditCardOutlined,
  MailOutlined,
  KeyOutlined,
  SafetyOutlined,
  CloudOutlined,
  ApiOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  TeamOutlined,
  GlobalOutlined,
  LockOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  category: 'auth' | 'user' | 'data' | 'system' | 'billing' | 'security' | 'api';
  severity: 'info' | 'warning' | 'error' | 'success';
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
  target?: string;
  description: string;
  details?: any;
  ipAddress: string;
  userAgent: string;
  location?: string;
  sessionId?: string;
}

interface SecurityEvent {
  id: string;
  timestamp: string;
  type: 'failed_login' | 'suspicious_activity' | 'permission_denied' | 'data_breach' | 'password_change';
  severity: 'low' | 'medium' | 'high' | 'critical';
  user?: string;
  details: string;
  ipAddress: string;
  resolved: boolean;
}

const TenantActivityLogs: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<any>([]);

  // Mock data
  const mockLogs: ActivityLog[] = [
    {
      id: '1',
      timestamp: '2024-12-07T14:30:00Z',
      action: 'Kullanıcı girişi',
      category: 'auth',
      severity: 'info',
      user: {
        id: '1',
        name: 'John Doe',
        email: 'john@abc-corp.com',
        role: 'Admin',
      },
      description: 'Başarılı giriş yapıldı',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      location: 'İstanbul, Türkiye',
      sessionId: 'ses_abc123',
    },
    {
      id: '2',
      timestamp: '2024-12-07T14:25:00Z',
      action: 'Kullanıcı eklendi',
      category: 'user',
      severity: 'info',
      user: {
        id: '1',
        name: 'John Doe',
        email: 'john@abc-corp.com',
        role: 'Admin',
      },
      target: 'Jane Smith (jane@abc-corp.com)',
      description: 'Yeni kullanıcı eklendi',
      details: {
        userId: 'usr_456',
        role: 'Manager',
        department: 'Sales',
      },
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      location: 'İstanbul, Türkiye',
    },
    {
      id: '3',
      timestamp: '2024-12-07T13:45:00Z',
      action: 'Başarısız giriş denemesi',
      category: 'security',
      severity: 'warning',
      user: {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@abc-corp.com',
        role: 'Manager',
      },
      description: 'Yanlış şifre girişi',
      details: {
        attempts: 3,
        reason: 'invalid_password',
      },
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      location: 'Ankara, Türkiye',
    },
    {
      id: '4',
      timestamp: '2024-12-07T12:20:00Z',
      action: 'Veri güncelleme',
      category: 'data',
      severity: 'info',
      user: {
        id: '3',
        name: 'Mike Johnson',
        email: 'mike@abc-corp.com',
        role: 'User',
      },
      target: 'Proje #1234',
      description: 'Proje bilgileri güncellendi',
      details: {
        fields: ['title', 'description', 'status'],
        oldValues: { status: 'draft' },
        newValues: { status: 'active' },
      },
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
    {
      id: '5',
      timestamp: '2024-12-07T11:15:00Z',
      action: 'API anahtarı oluşturuldu',
      category: 'api',
      severity: 'info',
      user: {
        id: '1',
        name: 'John Doe',
        email: 'john@abc-corp.com',
        role: 'Admin',
      },
      description: 'Yeni API anahtarı oluşturuldu',
      details: {
        keyId: 'key_789',
        permissions: ['read', 'write'],
        expiresAt: '2025-12-07',
      },
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
  ];

  const mockSecurityEvents: SecurityEvent[] = [
    {
      id: '1',
      timestamp: '2024-12-07T13:45:00Z',
      type: 'failed_login',
      severity: 'medium',
      user: 'jane@abc-corp.com',
      details: '3 başarısız giriş denemesi',
      ipAddress: '192.168.1.101',
      resolved: false,
    },
    {
      id: '2',
      timestamp: '2024-12-06T22:30:00Z',
      type: 'suspicious_activity',
      severity: 'high',
      user: 'unknown@suspicious.com',
      details: 'Bilinmeyen IP adresinden çoklu giriş denemesi',
      ipAddress: '185.220.101.182',
      resolved: true,
    },
  ];

  const categoryColors = {
    auth: 'blue',
    user: 'green',
    data: 'orange',
    system: 'purple',
    billing: 'gold',
    security: 'red',
    api: 'cyan',
  };

  const severityColors = {
    info: 'default',
    success: 'success',
    warning: 'warning',
    error: 'error',
  };

  const severityIcons = {
    info: <InfoCircleOutlined />,
    success: <CheckCircleOutlined />,
    warning: <WarningOutlined />,
    error: <CloseCircleOutlined />,
  };

  const categoryIcons = {
    auth: <LoginOutlined />,
    user: <UserOutlined />,
    data: <FileTextOutlined />,
    system: <SettingOutlined />,
    billing: <CreditCardOutlined />,
    security: <SafetyOutlined />,
    api: <ApiOutlined />,
  };

  const columns: ProColumns<ActivityLog>[] = [
    {
      title: 'Zaman',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 150,
      render: (timestamp: string) => (
        <Space direction="vertical" size={0}>
          <Text strong>{dayjs(timestamp).format('HH:mm:ss')}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {dayjs(timestamp).format('DD.MM.YYYY')}
          </Text>
        </Space>
      ),
      sorter: (a, b) => dayjs(a.timestamp).unix() - dayjs(b.timestamp).unix(),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Eylem',
      key: 'action',
      width: 300,
      render: (_, record) => (
        <Space>
          <Avatar
            size="small"
            icon={categoryIcons[record.category]}
            style={{ backgroundColor: categoryColors[record.category] }}
          />
          <Space direction="vertical" size={0}>
            <Space>
              <Text strong>{record.action}</Text>
              <Badge
                status={severityColors[record.severity] as any}
                text={record.severity.toUpperCase()}
              />
            </Space>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.description}
            </Text>
            {record.target && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                Hedef: {record.target}
              </Text>
            )}
          </Space>
        </Space>
      ),
    },
    {
      title: 'Kullanıcı',
      key: 'user',
      width: 200,
      render: (_, record) => (
        <Space>
          <Avatar size="small">
            {record.user.name.split(' ').map(n => n[0]).join('')}
          </Avatar>
          <Space direction="vertical" size={0}>
            <Text>{record.user.name}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.user.email}
            </Text>
          </Space>
        </Space>
      ),
    },
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category: string) => (
        <Tag color={categoryColors[category as keyof typeof categoryColors]}>
          {category.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'Kimlik Doğrulama', value: 'auth' },
        { text: 'Kullanıcı', value: 'user' },
        { text: 'Veri', value: 'data' },
        { text: 'Sistem', value: 'system' },
        { text: 'Faturalama', value: 'billing' },
        { text: 'Güvenlik', value: 'security' },
        { text: 'API', value: 'api' },
      ],
    },
    {
      title: 'IP Adresi',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: 120,
      render: (ip: string) => <Text code>{ip}</Text>,
    },
    {
      title: 'Konum',
      dataIndex: 'location',
      key: 'location',
      width: 120,
      render: (location?: string) => (
        <Text type="secondary">{location || '-'}</Text>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <Tooltip title="Detayları Görüntüle">
          <Button
            type="text"
            icon={<InfoCircleOutlined />}
            onClick={() => {
              setSelectedLog(record);
              setIsDrawerVisible(true);
            }}
          />
        </Tooltip>
      ),
    },
  ];

  const handleExport = async () => {
    message.loading('Loglar dışa aktarılıyor...');
    setTimeout(() => {
      message.success('Loglar başarıyla dışa aktarıldı');
    }, 2000);
  };

  const handleClearLogs = async () => {
    const result = await Swal.fire({
      title: 'Logları Temizle',
      text: 'Seçili tarih aralığındaki logları silmek istediğinize emin misiniz?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Evet, Sil',
      cancelButtonText: 'İptal',
    });

    if (result.isConfirmed) {
      message.success('Loglar başarıyla temizlendi');
    }
  };

  const filteredLogs = mockLogs.filter(log => {
    const matchesSearch = searchText === '' || 
      log.action.toLowerCase().includes(searchText.toLowerCase()) ||
      log.description.toLowerCase().includes(searchText.toLowerCase()) ||
      log.user.name.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter;
    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
    
    let matchesDateRange = true;
    if (dateRange.length === 2) {
      const logDate = dayjs(log.timestamp);
      matchesDateRange = logDate.isAfter(dateRange[0]) && logDate.isBefore(dateRange[1]);
    }

    return matchesSearch && matchesCategory && matchesSeverity && matchesDateRange;
  });

  const LogDetailDrawer = () => (
    <Drawer
      title="Log Detayları"
      width={600}
      open={isDrawerVisible}
      onClose={() => setIsDrawerVisible(false)}
      extra={
        <Button
          icon={<DownloadOutlined />}
          onClick={() => message.success('Log detayı dışa aktarıldı')}
        >
          Dışa Aktar
        </Button>
      }
    >
      {selectedLog && (
        <div>
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Log ID">{selectedLog.id}</Descriptions.Item>
            <Descriptions.Item label="Zaman Damgası">
              {dayjs(selectedLog.timestamp).format('DD.MM.YYYY HH:mm:ss')}
            </Descriptions.Item>
            <Descriptions.Item label="Eylem">{selectedLog.action}</Descriptions.Item>
            <Descriptions.Item label="Kategori">
              <Tag color={categoryColors[selectedLog.category]}>
                {selectedLog.category.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Önem Düzeyi">
              <Badge
                status={severityColors[selectedLog.severity] as any}
                text={selectedLog.severity.toUpperCase()}
              />
            </Descriptions.Item>
            <Descriptions.Item label="Kullanıcı">
              <Space>
                <Avatar size="small">
                  {selectedLog.user.name.split(' ').map(n => n[0]).join('')}
                </Avatar>
                <div>
                  <div>{selectedLog.user.name}</div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {selectedLog.user.email} • {selectedLog.user.role}
                  </Text>
                </div>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Hedef">
              {selectedLog.target || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Açıklama">
              {selectedLog.description}
            </Descriptions.Item>
            <Descriptions.Item label="IP Adresi">
              <Text code>{selectedLog.ipAddress}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Konum">
              {selectedLog.location || 'Bilinmiyor'}
            </Descriptions.Item>
            <Descriptions.Item label="Oturum ID">
              {selectedLog.sessionId ? (
                <Text code>{selectedLog.sessionId}</Text>
              ) : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Tarayıcı">
              <Tooltip title={selectedLog.userAgent}>
                <Text ellipsis style={{ maxWidth: 300 }}>
                  {selectedLog.userAgent}
                </Text>
              </Tooltip>
            </Descriptions.Item>
          </Descriptions>

          {selectedLog.details && (
            <>
              <Divider />
              <Title level={5}>Ek Detaylar</Title>
              <pre style={{
                background: '#f5f5f5',
                padding: '12px',
                borderRadius: '6px',
                fontSize: '12px',
                overflow: 'auto',
              }}>
                {JSON.stringify(selectedLog.details, null, 2)}
              </pre>
            </>
          )}
        </div>
      )}
    </Drawer>
  );

  const SecurityEventsTab = () => (
    <Card>
      <Alert
        message="Güvenlik Olayları"
        description="Bu bölümde güvenlikle ilgili önemli olaylar izlenir."
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
      />
      <List
        dataSource={mockSecurityEvents}
        renderItem={(event) => (
          <List.Item
            actions={[
              <Button
                type={event.resolved ? 'default' : 'primary'}
                size="small"
                onClick={() => message.success(event.resolved ? 'Olay yeniden açıldı' : 'Olay çözüldü')}
              >
                {event.resolved ? 'Yeniden Aç' : 'Çözüldü İşaretle'}
              </Button>,
            ]}
          >
            <List.Item.Meta
              avatar={
                <Avatar
                  style={{
                    backgroundColor: 
                      event.severity === 'critical' ? '#ff4d4f' :
                      event.severity === 'high' ? '#fa8c16' :
                      event.severity === 'medium' ? '#faad14' : '#52c41a'
                  }}
                >
                  <SafetyOutlined />
                </Avatar>
              }
              title={
                <Space>
                  <Text strong>{event.type.replace('_', ' ').toUpperCase()}</Text>
                  <Tag color={
                    event.severity === 'critical' ? 'red' :
                    event.severity === 'high' ? 'orange' :
                    event.severity === 'medium' ? 'gold' : 'green'
                  }>
                    {event.severity.toUpperCase()}
                  </Tag>
                  {event.resolved && <Tag color="green">Çözüldü</Tag>}
                </Space>
              }
              description={
                <Space direction="vertical" size={0}>
                  <Text>{event.details}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {event.user && `Kullanıcı: ${event.user} • `}
                    IP: {event.ipAddress} • {dayjs(event.timestamp).format('DD.MM.YYYY HH:mm')}
                  </Text>
                </Space>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );

  const StatisticsTab = () => (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Toplam Log"
                value={1247}
                prefix={<HistoryOutlined style={{ color: '#1890ff' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Bugün"
                value={47}
                prefix={<CalendarOutlined style={{ color: '#52c41a' }} />}
                suffix={
                  <Text type="success" style={{ fontSize: 14 }}>
                    +12%
                  </Text>
                }
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Güvenlik Olayları"
                value={3}
                prefix={<SafetyOutlined style={{ color: '#fa8c16' }} />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Aktif Kullanıcılar"
                value={156}
                prefix={<TeamOutlined style={{ color: '#722ed1' }} />}
              />
            </Card>
          </Col>
        </Row>
      </Col>
      <Col span={24}>
        <Card title="Kategori Dağılımı">
          <Row gutter={[16, 16]}>
            {Object.entries(categoryColors).map(([category, color]) => {
              const count = mockLogs.filter(log => log.category === category).length;
              const percentage = (count / mockLogs.length) * 100;
              return (
                <Col span={12} key={category}>
                  <div style={{ marginBottom: 8 }}>
                    <Space>
                      <Avatar
                        size="small"
                        icon={categoryIcons[category as keyof typeof categoryIcons]}
                        style={{ backgroundColor: color }}
                      />
                      <Text>{category.toUpperCase()}</Text>
                      <Text type="secondary">({count})</Text>
                    </Space>
                  </div>
                  <Progress percent={percentage} strokeColor={color} />
                </Col>
              );
            })}
          </Row>
        </Card>
      </Col>
    </Row>
  );

  return (
    <PageContainer
      header={{
        title: 'Aktivite Logları',
        breadcrumb: {
          items: [
            { title: 'Ana Sayfa', path: '/' },
            { title: 'Tenants', path: '/tenants' },
            { title: 'ABC Corporation', path: `/tenants/${id}` },
            { title: 'Aktivite Logları' },
          ],
        },
        onBack: () => navigate(`/tenants/${id}`),
      }}
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Tüm Loglar" key="all">
          <Card>
            <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
              <Space wrap>
                <Search
                  placeholder="Log ara..."
                  style={{ width: 300 }}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  prefix={<SearchOutlined />}
                />
                <Select
                  style={{ width: 150 }}
                  placeholder="Kategori"
                  value={categoryFilter}
                  onChange={setCategoryFilter}
                >
                  <Option value="all">Tüm Kategoriler</Option>
                  <Option value="auth">Kimlik Doğrulama</Option>
                  <Option value="user">Kullanıcı</Option>
                  <Option value="data">Veri</Option>
                  <Option value="system">Sistem</Option>
                  <Option value="billing">Faturalama</Option>
                  <Option value="security">Güvenlik</Option>
                  <Option value="api">API</Option>
                </Select>
                <Select
                  style={{ width: 120 }}
                  placeholder="Önem"
                  value={severityFilter}
                  onChange={setSeverityFilter}
                >
                  <Option value="all">Tümü</Option>
                  <Option value="info">Bilgi</Option>
                  <Option value="success">Başarı</Option>
                  <Option value="warning">Uyarı</Option>
                  <Option value="error">Hata</Option>
                </Select>
                <RangePicker
                  value={dateRange}
                  onChange={setDateRange}
                  placeholder={['Başlangıç', 'Bitiş']}
                />
              </Space>
              <Space>
                <Button icon={<DownloadOutlined />} onClick={handleExport}>
                  Dışa Aktar
                </Button>
                <Button icon={<ReloadOutlined />}>
                  Yenile
                </Button>
                <Button danger icon={<DeleteOutlined />} onClick={handleClearLogs}>
                  Temizle
                </Button>
              </Space>
            </Space>

            <ProTable<ActivityLog>
              columns={columns}
              dataSource={filteredLogs}
              rowKey="id"
              search={false}
              pagination={{
                pageSize: 20,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} / ${total} log`,
              }}
              scroll={{ x: 1200 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Güvenlik Olayları" key="security">
          <SecurityEventsTab />
        </TabPane>

        <TabPane tab="İstatistikler" key="stats">
          <StatisticsTab />
        </TabPane>

        <TabPane tab="Zaman Çizelgesi" key="timeline">
          <Card>
            <Timeline
              items={mockLogs.slice(0, 10).map(log => ({
                dot: severityIcons[log.severity],
                color: severityColors[log.severity] === 'error' ? 'red' : 
                       severityColors[log.severity] === 'warning' ? 'orange' : 
                       severityColors[log.severity] === 'success' ? 'green' : 'blue',
                children: (
                  <div>
                    <div style={{ marginBottom: 4 }}>
                      <Space>
                        <Text strong>{log.action}</Text>
                        <Tag color={categoryColors[log.category]} size="small">
                          {log.category}
                        </Tag>
                      </Space>
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {log.user.name} • {dayjs(log.timestamp).format('DD.MM.YYYY HH:mm')}
                    </Text>
                    <div style={{ marginTop: 4 }}>
                      <Text>{log.description}</Text>
                    </div>
                    {log.target && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Hedef: {log.target}
                      </Text>
                    )}
                  </div>
                ),
              }))}
            />
          </Card>
        </TabPane>
      </Tabs>

      <LogDetailDrawer />
    </PageContainer>
  );
};

export default TenantActivityLogs;