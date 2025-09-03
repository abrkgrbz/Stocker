import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Row,
  Col,
  Card,
  Tabs,
  Descriptions,
  Table,
  Tag,
  Button,
  Space,
  Typography,
  Timeline,
  Avatar,
  Badge,
  Statistic,
  Progress,
  Switch,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Tooltip,
  Divider,
  List,
  Alert,
  Dropdown,
  Menu,
  notification,
  Breadcrumb,
  Empty,
  Drawer,
  Skeleton,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  UnlockOutlined,
  UserOutlined,
  TeamOutlined,
  AppstoreOutlined,
  DollarOutlined,
  CalendarOutlined,
  HistoryOutlined,
  SettingOutlined,
  CreditCardOutlined,
  FileTextOutlined,
  CloudServerOutlined,
  DatabaseOutlined,
  ApiOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  RiseOutlined,
  FallOutlined,
  SyncOutlined,
  MailOutlined,
  PhoneOutlined,
  GlobalOutlined,
  SafetyOutlined,
  ExclamationCircleOutlined,
  MoreOutlined,
  DownloadOutlined,
  PlusOutlined,
  ReloadOutlined,
  SendOutlined,
  PrintOutlined,
  ShareAltOutlined,
  EyeOutlined,
  BankOutlined,
  ShoppingCartOutlined,
  LineChartOutlined,
  BarChartOutlined,
  PieChartOutlined,
  FundOutlined,
  KeyOutlined,
  BellOutlined,
  MessageOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  RocketOutlined,
  FireOutlined,
  ThunderboltOutlined,
  SaveOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { Area, Line, Column, Pie, Gauge, Liquid, DualAxes } from '@ant-design/charts';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { masterTenantApi } from '@/shared/api/master.api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import './tenant-detail-enhanced.css';

dayjs.extend(relativeTime);

const { Title, Text, Paragraph, Link } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;
const { confirm } = Modal;

interface TenantDetailData {
  id: string;
  name: string;
  code: string;
  domain: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  status: 'active' | 'suspended' | 'pending' | 'expired';
  plan: string;
  maxUsers: number;
  currentUsers: number;
  storage: {
    used: number;
    total: number;
  };
  createdAt: string;
  expiresAt: string;
  lastLogin: string;
  modules: string[];
  subscription: {
    id: string;
    plan: string;
    price: number;
    period: 'monthly' | 'yearly';
    startDate: string;
    endDate: string;
    autoRenew: boolean;
  };
  billing: {
    totalPaid: number;
    outstandingBalance: number;
    nextPayment: string;
    paymentMethod: string;
  };
  usage: {
    apiCalls: number;
    bandwidth: number;
    transactions: number;
    emails: number;
  };
  admins: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    lastLogin: string;
  }>;
}

const EnhancedTenantDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [actionDrawerVisible, setActionDrawerVisible] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [form] = Form.useForm();

  // Fetch tenant data from API
  const { data: apiTenant, isLoading: loading, error } = useQuery({
    queryKey: ['tenant', id],
    queryFn: () => masterTenantApi.getById(id!),
    enabled: !!id,
  });

  // Fetch statistics
  const { data: statistics } = useQuery({
    queryKey: ['tenant-statistics', id],
    queryFn: () => masterTenantApi.getStatistics(id!),
    enabled: !!id,
  });

  // Map API data to component format
  const tenant: TenantDetailData | null = useMemo(() => {
    if (!apiTenant) return null;
    
    return {
      id: apiTenant.id,
      name: apiTenant.name,
      code: apiTenant.code,
      domain: apiTenant.domain || '',
      email: apiTenant.contactEmail || 'info@example.com',
      phone: apiTenant.contactPhone || '',
      address: apiTenant.address || '',
      city: apiTenant.city || '',
      country: apiTenant.country || 'Türkiye',
      status: apiTenant.isActive ? 'active' : 'inactive',
      plan: apiTenant.subscription?.packageName || 'Standart',
      maxUsers: 100, // TODO: Get from package details
      currentUsers: apiTenant.userCount || 0,
      storage: {
        used: statistics?.storageUsed || 0,
        total: statistics?.storageTotal || 100,
      },
      createdAt: apiTenant.createdAt,
      expiresAt: apiTenant.subscription?.endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      lastLogin: apiTenant.updatedAt || apiTenant.createdAt,
      modules: [], // TODO: Get from subscription modules
      subscription: apiTenant.subscription ? {
        id: apiTenant.subscription.id,
        plan: apiTenant.subscription.packageName,
        price: apiTenant.subscription.price,
        period: 'monthly',
        startDate: apiTenant.subscription.startDate,
        endDate: apiTenant.subscription.endDate,
        autoRenew: true,
      } : {
        id: 'N/A',
        plan: 'No Subscription',
        price: 0,
        period: 'monthly',
        startDate: apiTenant.createdAt,
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        autoRenew: false,
      },
      billing: {
        totalPaid: 0,
        outstandingBalance: 0,
        nextPayment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        paymentMethod: 'Kredi Kartı',
      },
      usage: {
        apiCalls: statistics?.apiCallCount || 0,
        bandwidth: statistics?.bandwidthUsed || 0,
        transactions: statistics?.transactionCount || 0,
        emails: statistics?.emailCount || 0,
      },
      admins: [],
    };
  }, [apiTenant, statistics]);

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: () => masterTenantApi.toggleStatus(id!),
    onSuccess: () => {
      message.success('Kiracı durumu güncellendi');
      queryClient.invalidateQueries({ queryKey: ['tenant', id] });
    },
    onError: () => {
      message.error('Durum güncellenirken hata oluştu');
    },
  });

  useEffect(() => {
    if (error) {
      message.error('Kiracı bilgileri yüklenemedi');
      navigate('/master/tenants');
    }
  }, [error, navigate]);

  const handleStatusChange = (checked: boolean) => {
    confirm({
      title: checked ? 'Kiracıyı Aktifleştir' : 'Kiracıyı Askıya Al',
      icon: <ExclamationCircleOutlined />,
      content: `Bu kiracıyı ${checked ? 'aktifleştirmek' : 'askıya almak'} istediğinize emin misiniz?`,
      okText: 'Evet',
      cancelText: 'İptal',
      onOk() {
        toggleStatusMutation.mutate();
      },
    });
  };

  const handleDelete = () => {
    confirm({
      title: 'Kiracıyı Sil',
      icon: <ExclamationCircleOutlined />,
      content: 'Bu işlem geri alınamaz. Tüm veriler silinecektir.',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk() {
        message.success('Kiracı silindi');
        navigate('/master/tenants');
      },
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'success',
      suspended: 'warning',
      pending: 'processing',
      expired: 'error',
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      active: <CheckCircleOutlined />,
      suspended: <WarningOutlined />,
      pending: <SyncOutlined spin />,
      expired: <CloseCircleOutlined />,
    };
    return icons[status as keyof typeof icons];
  };

  // Charts Configuration
  const usageChartConfig = {
    data: [
      { date: '2024-01', value: 850000, type: 'API Calls' },
      { date: '2024-01', value: 650, type: 'Bandwidth (GB)' },
      { date: '2024-01', value: 35000, type: 'Transactions' },
      { date: '2023-12', value: 920000, type: 'API Calls' },
      { date: '2023-12', value: 720, type: 'Bandwidth (GB)' },
      { date: '2023-12', value: 38000, type: 'Transactions' },
      { date: '2023-11', value: 780000, type: 'API Calls' },
      { date: '2023-11', value: 590, type: 'Bandwidth (GB)' },
      { date: '2023-11', value: 32000, type: 'Transactions' },
    ],
    xField: 'date',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
  };

  const storageGaugeConfig = {
    percent: tenant ? tenant.storage.used / tenant.storage.total : 0,
    range: {
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
        formatter: (v: string) => {
          return Number(v) * 100 + ' GB';
        },
      },
    },
    statistic: {
      content: {
        formatter: () => {
          return tenant ? `${tenant.storage.used} / ${tenant.storage.total} GB` : '0 GB';
        },
        style: {
          fontSize: '16px',
        },
      },
    },
  };

  const actionMenu = (
    <Menu>
      <Menu.Item key="email" icon={<MailOutlined />}>
        Email Gönder
      </Menu.Item>
      <Menu.Item key="invoice" icon={<FileTextOutlined />}>
        Fatura Oluştur
      </Menu.Item>
      <Menu.Item key="backup" icon={<CloudServerOutlined />}>
        Yedek Al
      </Menu.Item>
      <Menu.Item key="reset" icon={<KeyOutlined />}>
        Şifre Sıfırla
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="export" icon={<DownloadOutlined />}>
        Verileri Dışa Aktar
      </Menu.Item>
      <Menu.Item key="audit" icon={<FileTextOutlined />}>
        Denetim Raporu
      </Menu.Item>
    </Menu>
  );

  if (loading) {
    return (
      <div className="tenant-detail-loading">
        <Card>
          <Skeleton active paragraph={{ rows: 8 }} />
        </Card>
      </div>
    );
  }

  if (!tenant) {
    return (
      <Card>
        <Empty description="Kiracı bulunamadı" />
      </Card>
    );
  }

  return (
    <div className="enhanced-tenant-detail">
      {/* Header */}
      <div className="detail-header">
        <div className="header-content">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/master/tenants')}
            className="back-button"
          >
            Geri
          </Button>
          <Breadcrumb>
            <Breadcrumb.Item>Master</Breadcrumb.Item>
            <Breadcrumb.Item>Kiracılar</Breadcrumb.Item>
            <Breadcrumb.Item>{tenant.name}</Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>

      {/* Tenant Header Card */}
      <Card className="tenant-header-card">
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} sm={8} lg={6}>
            <div className="tenant-avatar-section">
              <Avatar 
                size={120} 
                icon={<BankOutlined />}
                className="tenant-avatar"
                style={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              />
              <div className="tenant-status-wrapper">
                <Badge 
                  status={getStatusColor(tenant.status) as any} 
                  text={
                    <Tag 
                      color={getStatusColor(tenant.status)}
                      icon={getStatusIcon(tenant.status)}
                    >
                      {tenant.status.toUpperCase()}
                    </Tag>
                  }
                />
              </div>
            </div>
          </Col>
          
          <Col xs={24} sm={16} lg={12}>
            <div className="tenant-info">
              <Title level={2}>{tenant.name}</Title>
              <Space direction="vertical" size="small">
                <Text type="secondary">
                  <GlobalOutlined /> {tenant.domain}
                </Text>
                <Text type="secondary">
                  <MailOutlined /> {tenant.email}
                </Text>
                <Text type="secondary">
                  <PhoneOutlined /> {tenant.phone}
                </Text>
                <Text type="secondary">
                  <EnvironmentOutlined /> {tenant.city}, {tenant.country}
                </Text>
              </Space>
              <Divider />
              <Space wrap>
                <Tag color="blue" icon={<AppstoreOutlined />}>
                  {tenant.plan}
                </Tag>
                <Tag color="green" icon={<TeamOutlined />}>
                  {tenant.currentUsers}/{tenant.maxUsers} Kullanıcı
                </Tag>
                <Tag color="orange" icon={<CalendarOutlined />}>
                  {dayjs(tenant.expiresAt).format('DD/MM/YYYY')} tarihine kadar
                </Tag>
              </Space>
            </div>
          </Col>
          
          <Col xs={24} lg={6}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button 
                type="primary" 
                icon={<EditOutlined />}
                block
                onClick={() => setEditModalVisible(true)}
              >
                Düzenle
              </Button>
              <Button 
                icon={<SettingOutlined />}
                block
                onClick={() => setActionDrawerVisible(true)}
              >
                İşlemler
              </Button>
              <Dropdown overlay={actionMenu} trigger={['click']}>
                <Button icon={<MoreOutlined />} block>
                  Diğer
                </Button>
              </Dropdown>
              <Divider />
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Text>Durum</Text>
                <Switch
                  checked={tenant.status === 'active'}
                  onChange={handleStatusChange}
                  checkedChildren="Aktif"
                  unCheckedChildren="Pasif"
                />
              </Space>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Toplam Ödeme"
              value={tenant.billing.totalPaid}
              prefix="₺"
              valueStyle={{ color: '#52c41a' }}
            />
            <Progress percent={100} showInfo={false} strokeColor="#52c41a" />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="API Kullanımı"
              value={tenant.usage.apiCalls}
              suffix="/ ay"
              valueStyle={{ color: '#1890ff' }}
            />
            <Progress percent={75} showInfo={false} strokeColor="#1890ff" />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Depolama"
              value={tenant.storage.used}
              suffix={`/ ${tenant.storage.total} GB`}
              valueStyle={{ color: '#faad14' }}
            />
            <Progress 
              percent={(tenant.storage.used / tenant.storage.total) * 100} 
              showInfo={false} 
              strokeColor="#faad14" 
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Aktif Modül"
              value={tenant.modules.length}
              suffix="/ 10"
              valueStyle={{ color: '#722ed1' }}
            />
            <Progress 
              percent={(tenant.modules.length / 10) * 100} 
              showInfo={false} 
              strokeColor="#722ed1" 
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content Tabs */}
      <Card style={{ marginTop: 24 }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane 
            tab={
              <span>
                <InfoCircleOutlined />
                Genel Bilgiler
              </span>
            } 
            key="overview"
          >
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                <Card title="Temel Bilgiler" className="info-card">
                  <Descriptions column={1} bordered>
                    <Descriptions.Item label="Şirket Kodu">{tenant.code}</Descriptions.Item>
                    <Descriptions.Item label="Domain">{tenant.domain}</Descriptions.Item>
                    <Descriptions.Item label="Kayıt Tarihi">
                      {dayjs(tenant.createdAt).format('DD/MM/YYYY HH:mm')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Son Giriş">
                      {dayjs(tenant.lastLogin).fromNow()}
                    </Descriptions.Item>
                    <Descriptions.Item label="Adres">
                      {tenant.address}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
              
              <Col xs={24} lg={12}>
                <Card title="Abonelik Bilgileri" className="info-card">
                  <Descriptions column={1} bordered>
                    <Descriptions.Item label="Plan">{tenant.subscription.plan}</Descriptions.Item>
                    <Descriptions.Item label="Fiyat">
                      ₺{tenant.subscription.price} / {tenant.subscription.period === 'monthly' ? 'Ay' : 'Yıl'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Başlangıç">
                      {dayjs(tenant.subscription.startDate).format('DD/MM/YYYY')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Bitiş">
                      {dayjs(tenant.subscription.endDate).format('DD/MM/YYYY')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Otomatik Yenileme">
                      <Switch checked={tenant.subscription.autoRenew} disabled />
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            </Row>

            <Card title="Aktif Modüller" style={{ marginTop: 24 }}>
              <Space wrap size="large">
                {tenant.modules.map(module => (
                  <Tag 
                    key={module}
                    color="blue"
                    icon={<AppstoreOutlined />}
                    style={{ padding: '8px 16px', fontSize: '14px' }}
                  >
                    {module}
                  </Tag>
                ))}
              </Space>
            </Card>
          </TabPane>

          <TabPane 
            tab={
              <span>
                <TeamOutlined />
                Kullanıcılar
              </span>
            } 
            key="users"
          >
            <Table
              columns={[
                {
                  title: 'Ad Soyad',
                  dataIndex: 'name',
                  key: 'name',
                  render: (text: string) => (
                    <Space>
                      <Avatar icon={<UserOutlined />} />
                      {text}
                    </Space>
                  ),
                },
                {
                  title: 'Email',
                  dataIndex: 'email',
                  key: 'email',
                },
                {
                  title: 'Rol',
                  dataIndex: 'role',
                  key: 'role',
                  render: (role: string) => (
                    <Tag color={role === 'Süper Admin' ? 'red' : 'blue'}>{role}</Tag>
                  ),
                },
                {
                  title: 'Son Giriş',
                  dataIndex: 'lastLogin',
                  key: 'lastLogin',
                  render: (date: string) => dayjs(date).fromNow(),
                },
                {
                  title: 'İşlemler',
                  key: 'actions',
                  render: () => (
                    <Space>
                      <Button size="small" icon={<EditOutlined />} />
                      <Button size="small" icon={<DeleteOutlined />} danger />
                    </Space>
                  ),
                },
              ]}
              dataSource={tenant.admins}
              rowKey="id"
            />
          </TabPane>

          <TabPane 
            tab={
              <span>
                <LineChartOutlined />
                Kullanım
              </span>
            } 
            key="usage"
          >
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={16}>
                <Card title="Aylık Kullanım Trendleri">
                  <Line {...usageChartConfig} height={300} />
                </Card>
              </Col>
              <Col xs={24} lg={8}>
                <Card title="Depolama Kullanımı">
                  <Gauge {...storageGaugeConfig} height={200} />
                </Card>
                <Card title="Kullanım Özeti" style={{ marginTop: 24 }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div className="usage-item">
                      <Text>API Çağrıları</Text>
                      <Text strong>{tenant.usage.apiCalls.toLocaleString()}</Text>
                    </div>
                    <div className="usage-item">
                      <Text>Bant Genişliği</Text>
                      <Text strong>{tenant.usage.bandwidth} GB</Text>
                    </div>
                    <div className="usage-item">
                      <Text>İşlemler</Text>
                      <Text strong>{tenant.usage.transactions.toLocaleString()}</Text>
                    </div>
                    <div className="usage-item">
                      <Text>Email</Text>
                      <Text strong>{tenant.usage.emails.toLocaleString()}</Text>
                    </div>
                  </Space>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane 
            tab={
              <span>
                <DollarOutlined />
                Faturalama
              </span>
            } 
            key="billing"
          >
            <Alert
              message="Ödeme Durumu"
              description="Tüm ödemeler güncel. Bir sonraki ödeme tarihi: 15/02/2024"
              type="success"
              showIcon
              style={{ marginBottom: 24 }}
            />
            
            <Card title="Ödeme Geçmişi">
              <Table
                columns={[
                  {
                    title: 'Fatura No',
                    dataIndex: 'invoiceNo',
                    key: 'invoiceNo',
                  },
                  {
                    title: 'Tarih',
                    dataIndex: 'date',
                    key: 'date',
                  },
                  {
                    title: 'Tutar',
                    dataIndex: 'amount',
                    key: 'amount',
                    render: (amount: number) => `₺${amount}`,
                  },
                  {
                    title: 'Durum',
                    dataIndex: 'status',
                    key: 'status',
                    render: (status: string) => (
                      <Tag color={status === 'paid' ? 'success' : 'warning'}>
                        {status === 'paid' ? 'Ödendi' : 'Bekliyor'}
                      </Tag>
                    ),
                  },
                  {
                    title: 'İşlemler',
                    key: 'actions',
                    render: () => (
                      <Space>
                        <Button size="small" icon={<EyeOutlined />}>Görüntüle</Button>
                        <Button size="small" icon={<DownloadOutlined />}>İndir</Button>
                      </Space>
                    ),
                  },
                ]}
                dataSource={[
                  { invoiceNo: 'INV-2024-001', date: '15/01/2024', amount: 2999, status: 'paid' },
                  { invoiceNo: 'INV-2023-012', date: '15/12/2023', amount: 2999, status: 'paid' },
                  { invoiceNo: 'INV-2023-011', date: '15/11/2023', amount: 2999, status: 'paid' },
                ]}
                rowKey="invoiceNo"
              />
            </Card>
          </TabPane>

          <TabPane 
            tab={
              <span>
                <HistoryOutlined />
                Aktivite Geçmişi
              </span>
            } 
            key="activity"
          >
            <Timeline mode="left">
              <Timeline.Item 
                color="green" 
                label={dayjs().subtract(2, 'hours').format('DD/MM/YYYY HH:mm')}
              >
                Yeni kullanıcı eklendi: Mehmet Öz
              </Timeline.Item>
              <Timeline.Item 
                color="blue" 
                label={dayjs().subtract(1, 'days').format('DD/MM/YYYY HH:mm')}
              >
                API limiti güncellendi: 2M → 3M
              </Timeline.Item>
              <Timeline.Item 
                color="orange" 
                label={dayjs().subtract(3, 'days').format('DD/MM/YYYY HH:mm')}
              >
                Fatura ödendi: ₺2999
              </Timeline.Item>
              <Timeline.Item 
                color="red" 
                label={dayjs().subtract(5, 'days').format('DD/MM/YYYY HH:mm')}
              >
                Şifre sıfırlama talebi
              </Timeline.Item>
              <Timeline.Item 
                label={dayjs().subtract(7, 'days').format('DD/MM/YYYY HH:mm')}
              >
                CRM modülü aktifleştirildi
              </Timeline.Item>
            </Timeline>
          </TabPane>
        </Tabs>
      </Card>

      {/* Edit Modal */}
      <Modal
        title="Kiracı Bilgilerini Düzenle"
        visible={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setEditModalVisible(false)}>
            İptal
          </Button>,
          <Button key="save" type="primary" icon={<SaveOutlined />}>
            Kaydet
          </Button>,
        ]}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Şirket Adı" name="name">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Şirket Kodu" name="code">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Email" name="email">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Telefon" name="phone">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Adres" name="address">
            <TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Action Drawer */}
      <Drawer
        title="Hızlı İşlemler"
        placement="right"
        onClose={() => setActionDrawerVisible(false)}
        visible={actionDrawerVisible}
        width={400}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Button type="primary" icon={<MailOutlined />} block>
            Email Gönder
          </Button>
          <Button icon={<FileTextOutlined />} block>
            Fatura Oluştur
          </Button>
          <Button icon={<CloudServerOutlined />} block>
            Yedek Al
          </Button>
          <Button icon={<KeyOutlined />} block>
            Şifre Sıfırla
          </Button>
          <Button icon={<BellOutlined />} block>
            Bildirim Gönder
          </Button>
          <Divider />
          <Button danger icon={<DeleteOutlined />} block onClick={handleDelete}>
            Kiracıyı Sil
          </Button>
        </Space>
      </Drawer>
    </div>
  );
};

export default EnhancedTenantDetail;