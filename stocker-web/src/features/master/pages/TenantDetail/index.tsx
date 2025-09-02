import React, { useState, useEffect } from 'react';
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
  Result,
  Skeleton,
  Alert,
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
} from '@ant-design/icons';
import { Area, Column, Pie } from '@ant-design/charts';
import { tenantsApi } from '@/shared/api/tenants.api';
import './style.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

interface TenantDetails {
  id: string;
  name: string;
  code: string;
  domain: string;
  email: string;
  phone: string;
  status: 'active' | 'suspended' | 'pending';
  plan: string;
  maxUsers: number;
  currentUsers: number;
  storage: {
    used: number;
    total: number;
  };
  createdAt: Date;
  expiresAt: Date;
  lastLogin: Date;
  modules: string[];
  subscription: {
    id: string;
    plan: string;
    price: number;
    period: 'monthly' | 'yearly';
    startDate: Date;
    endDate: Date;
    autoRenew: boolean;
  };
  billing: {
    totalPaid: number;
    totalDue: number;
    lastPayment: Date;
    nextPayment: Date;
  };
}

const TenantDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState<TenantDetails | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (id) {
      fetchTenantDetails(id);
    }
  }, [id]);

  const fetchTenantDetails = async (tenantId: string) => {
    try {
      setLoading(true);
      const response = await tenantsApi.getById(tenantId);
      if (response.data?.success && response.data?.data) {
        // Mock additional data for demonstration
        const tenantData = {
          ...response.data.data,
          storage: {
            used: 3.2,
            total: 10,
          },
          currentUsers: 15,
          lastLogin: new Date(),
          subscription: {
            id: 'sub-1',
            plan: response.data.data.plan || 'Professional',
            price: 299,
            period: 'monthly' as const,
            startDate: new Date(response.data.data.createdAt),
            endDate: new Date(response.data.data.expiresAt || Date.now() + 30 * 24 * 60 * 60 * 1000),
            autoRenew: true,
          },
          billing: {
            totalPaid: 2990,
            totalDue: 0,
            lastPayment: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            nextPayment: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          },
        };
        setTenant(tenantData);
        form.setFieldsValue(tenantData);
      }
    } catch (error) {
      console.error('Failed to fetch tenant details:', error);
      message.error('Tenant detayları yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (values: any) => {
    try {
      const response = await tenantsApi.update(id!, values);
      if (response.data?.success) {
        message.success('Tenant başarıyla güncellendi');
        setEditModalVisible(false);
        fetchTenantDetails(id!);
      }
    } catch (error) {
      message.error('Tenant güncellenemedi');
    }
  };

  const handleDelete = () => {
    Modal.confirm({
      title: 'Tenant Sil',
      content: 'Bu tenant\'ı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          const response = await tenantsApi.delete(id!);
          if (response.data?.success) {
            message.success('Tenant başarıyla silindi');
            navigate('/master/tenants');
          }
        } catch (error) {
          message.error('Tenant silinemedi');
        }
      },
    });
  };

  const handleToggleStatus = async () => {
    try {
      const response = await tenantsApi.toggleStatus(id!);
      if (response.data?.success) {
        message.success('Tenant durumu güncellendi');
        fetchTenantDetails(id!);
      }
    } catch (error) {
      message.error('Tenant durumu güncellenemedi');
    }
  };

  if (loading) {
    return (
      <div className="tenant-detail-page">
        <Card>
          <Skeleton active paragraph={{ rows: 8 }} />
        </Card>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="tenant-detail-page">
        <Result
          status="404"
          title="Tenant Bulunamadı"
          subTitle="Aradığınız tenant mevcut değil veya silinmiş olabilir."
          extra={
            <Button type="primary" onClick={() => navigate('/master/tenants')}>
              Tenant Listesine Dön
            </Button>
          }
        />
      </div>
    );
  }

  // Revenue chart data
  const revenueData = [
    { month: 'Oca', revenue: 299 },
    { month: 'Şub', revenue: 299 },
    { month: 'Mar', revenue: 299 },
    { month: 'Nis', revenue: 299 },
    { month: 'May', revenue: 299 },
    { month: 'Haz', revenue: 299 },
  ];

  const revenueConfig = {
    data: revenueData,
    xField: 'month',
    yField: 'revenue',
    height: 200,
    smooth: true,
    color: '#667eea',
  };

  // User activity data
  const userActivityData = [
    { date: '01', users: 12 },
    { date: '02', users: 15 },
    { date: '03', users: 10 },
    { date: '04', users: 18 },
    { date: '05', users: 14 },
    { date: '06', users: 16 },
    { date: '07', users: 13 },
  ];

  const activityConfig = {
    data: userActivityData,
    xField: 'date',
    yField: 'users',
    height: 200,
    columnStyle: {
      radius: [8, 8, 0, 0],
    },
  };

  // Module usage data
  const moduleData = [
    { type: 'CRM', value: 45 },
    { type: 'Stok', value: 30 },
    { type: 'Muhasebe', value: 20 },
    { type: 'İK', value: 5 },
  ];

  const moduleConfig = {
    data: moduleData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    innerRadius: 0.6,
    height: 200,
  };

  // User list columns
  const userColumns = [
    {
      title: 'Kullanıcı',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: any) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div>{name}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>{record.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Rol',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'Admin' ? 'red' : 'blue'}>{role}</Tag>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge status={status === 'active' ? 'success' : 'default'} text={status === 'active' ? 'Aktif' : 'Pasif'} />
      ),
    },
    {
      title: 'Son Giriş',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      render: (date: Date) => new Date(date).toLocaleDateString('tr-TR'),
    },
  ];

  const mockUsers = [
    { key: '1', name: 'John Doe', email: 'john@company.com', role: 'Admin', status: 'active', lastLogin: new Date() },
    { key: '2', name: 'Jane Smith', email: 'jane@company.com', role: 'User', status: 'active', lastLogin: new Date() },
    { key: '3', name: 'Bob Wilson', email: 'bob@company.com', role: 'User', status: 'inactive', lastLogin: new Date() },
  ];

  return (
    <div className="tenant-detail-page">
      {/* Header */}
      <Card className="header-card">
        <Row align="middle" justify="space-between">
          <Col>
            <Space align="center" size="large">
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/master/tenants')}
              >
                Geri
              </Button>
              <Avatar 
                size={64} 
                style={{ backgroundColor: '#667eea' }}
                icon={<TeamOutlined />}
              >
                {tenant.name.substring(0, 2).toUpperCase()}
              </Avatar>
              <div>
                <Title level={3} style={{ margin: 0 }}>{tenant.name}</Title>
                <Space>
                  <Tag color={tenant.status === 'active' ? 'success' : 'error'}>
                    {tenant.status === 'active' ? 'Aktif' : 'Askıda'}
                  </Tag>
                  <Tag color="blue">{tenant.plan}</Tag>
                  <Text type="secondary">Kod: {tenant.code}</Text>
                </Space>
              </div>
            </Space>
          </Col>
          <Col>
            <Space>
              <Tooltip title={tenant.status === 'active' ? 'Askıya Al' : 'Aktifleştir'}>
                <Button
                  icon={tenant.status === 'active' ? <LockOutlined /> : <UnlockOutlined />}
                  onClick={handleToggleStatus}
                >
                  {tenant.status === 'active' ? 'Askıya Al' : 'Aktifleştir'}
                </Button>
              </Tooltip>
              <Button 
                type="primary" 
                icon={<EditOutlined />}
                onClick={() => setEditModalVisible(true)}
              >
                Düzenle
              </Button>
              <Button 
                danger 
                icon={<DeleteOutlined />}
                onClick={handleDelete}
              >
                Sil
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Kullanıcılar"
              value={tenant.currentUsers}
              suffix={`/ ${tenant.maxUsers}`}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#667eea' }}
            />
            <Progress 
              percent={(tenant.currentUsers / tenant.maxUsers) * 100} 
              showInfo={false}
              strokeColor="#667eea"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Depolama"
              value={tenant.storage.used}
              suffix={`/ ${tenant.storage.total} GB`}
              prefix={<DatabaseOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            <Progress 
              percent={(tenant.storage.used / tenant.storage.total) * 100} 
              showInfo={false}
              strokeColor="#52c41a"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Aylık Ödeme"
              value={tenant.subscription.price}
              prefix="₺"
              suffix="/ ay"
              valueStyle={{ color: '#faad14' }}
            />
            <Text type="secondary">Sonraki: {tenant.billing.nextPayment.toLocaleDateString('tr-TR')}</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Toplam Ödeme"
              value={tenant.billing.totalPaid}
              prefix="₺"
              valueStyle={{ color: '#13c2c2' }}
            />
            <Text type="secondary">Son: {tenant.billing.lastPayment.toLocaleDateString('tr-TR')}</Text>
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Card style={{ marginTop: 16 }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab={<span><InfoCircleOutlined /> Genel Bilgiler</span>} key="overview">
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                <Card title="Tenant Bilgileri" size="small">
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Tenant Adı">{tenant.name}</Descriptions.Item>
                    <Descriptions.Item label="Tenant Kodu">{tenant.code}</Descriptions.Item>
                    <Descriptions.Item label="Domain">
                      <a href={`https://${tenant.domain}`} target="_blank" rel="noopener noreferrer">
                        {tenant.domain} <GlobalOutlined />
                      </a>
                    </Descriptions.Item>
                    <Descriptions.Item label="E-posta">
                      <Space>
                        <MailOutlined />
                        {tenant.email}
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Telefon">
                      <Space>
                        <PhoneOutlined />
                        {tenant.phone}
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Oluşturma Tarihi">
                      {new Date(tenant.createdAt).toLocaleDateString('tr-TR')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Son Giriş">
                      {new Date(tenant.lastLogin).toLocaleDateString('tr-TR')}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title="Abonelik Bilgileri" size="small">
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Plan">{tenant.subscription.plan}</Descriptions.Item>
                    <Descriptions.Item label="Ücret">
                      ₺{tenant.subscription.price} / {tenant.subscription.period === 'monthly' ? 'Ay' : 'Yıl'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Başlangıç">
                      {tenant.subscription.startDate.toLocaleDateString('tr-TR')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Bitiş">
                      {tenant.subscription.endDate.toLocaleDateString('tr-TR')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Otomatik Yenileme">
                      <Switch checked={tenant.subscription.autoRenew} disabled />
                    </Descriptions.Item>
                    <Descriptions.Item label="Modüller">
                      {tenant.modules.map(module => (
                        <Tag key={module} color="blue">{module}</Tag>
                      ))}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab={<span><UserOutlined /> Kullanıcılar</span>} key="users">
            <Card 
              title={`Kullanıcılar (${tenant.currentUsers} / ${tenant.maxUsers})`}
              extra={
                <Button type="primary" icon={<UserOutlined />}>
                  Kullanıcı Ekle
                </Button>
              }
            >
              <Table
                columns={userColumns}
                dataSource={mockUsers}
                pagination={{ pageSize: 10 }}
              />
            </Card>
          </TabPane>

          <TabPane tab={<span><BarChartOutlined /> Analitik</span>} key="analytics">
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={8}>
                <Card title="Gelir Trendi" size="small">
                  <Area {...revenueConfig} />
                </Card>
              </Col>
              <Col xs={24} lg={8}>
                <Card title="Kullanıcı Aktivitesi" size="small">
                  <Column {...activityConfig} />
                </Card>
              </Col>
              <Col xs={24} lg={8}>
                <Card title="Modül Kullanımı" size="small">
                  <Pie {...moduleConfig} />
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab={<span><HistoryOutlined /> Aktivite Geçmişi</span>} key="activity">
            <Timeline mode="left">
              <Timeline.Item color="green" label="Bugün">
                Admin girişi yapıldı
              </Timeline.Item>
              <Timeline.Item color="blue" label="2 gün önce">
                Yeni kullanıcı eklendi: Jane Smith
              </Timeline.Item>
              <Timeline.Item label="5 gün önce">
                Abonelik yenilendi
              </Timeline.Item>
              <Timeline.Item color="red" label="1 hafta önce">
                Ödeme başarısız
              </Timeline.Item>
              <Timeline.Item label="2 hafta önce">
                Plan güncellendi: Professional → Enterprise
              </Timeline.Item>
            </Timeline>
          </TabPane>

          <TabPane tab={<span><CreditCardOutlined /> Ödemeler</span>} key="payments">
            <Alert
              message="Ödeme Durumu"
              description="Tüm ödemeler güncel. Sonraki ödeme tarihi: 5 gün sonra."
              type="success"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Table
              columns={[
                { title: 'Tarih', dataIndex: 'date', key: 'date' },
                { title: 'Açıklama', dataIndex: 'description', key: 'description' },
                { title: 'Tutar', dataIndex: 'amount', key: 'amount', render: (amount: number) => `₺${amount}` },
                { 
                  title: 'Durum', 
                  dataIndex: 'status', 
                  key: 'status',
                  render: (status: string) => (
                    <Tag color={status === 'paid' ? 'success' : 'error'}>
                      {status === 'paid' ? 'Ödendi' : 'Bekliyor'}
                    </Tag>
                  )
                },
              ]}
              dataSource={[
                { key: '1', date: '01.12.2024', description: 'Aylık abonelik', amount: 299, status: 'paid' },
                { key: '2', date: '01.11.2024', description: 'Aylık abonelik', amount: 299, status: 'paid' },
                { key: '3', date: '01.10.2024', description: 'Aylık abonelik', amount: 299, status: 'paid' },
              ]}
            />
          </TabPane>

          <TabPane tab={<span><SettingOutlined /> Ayarlar</span>} key="settings">
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <Card title="Limit Ayarları" size="small">
                  <Form layout="vertical">
                    <Form.Item label="Maksimum Kullanıcı">
                      <Input type="number" value={tenant.maxUsers} />
                    </Form.Item>
                    <Form.Item label="Maksimum Depolama (GB)">
                      <Input type="number" value={tenant.storage.total} />
                    </Form.Item>
                    <Form.Item label="API Rate Limit">
                      <Input value="1000 req/hour" />
                    </Form.Item>
                    <Form.Item>
                      <Button type="primary">Kaydet</Button>
                    </Form.Item>
                  </Form>
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title="Güvenlik Ayarları" size="small">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text>İki Faktörlü Doğrulama</Text>
                      <Switch defaultChecked />
                    </div>
                    <Divider />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text>IP Kısıtlaması</Text>
                      <Switch />
                    </div>
                    <Divider />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text>SSO Entegrasyonu</Text>
                      <Switch />
                    </div>
                    <Divider />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text>API Erişimi</Text>
                      <Switch defaultChecked />
                    </div>
                  </Space>
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Card>

      {/* Edit Modal */}
      <Modal
        title="Tenant Düzenle"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleEdit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Tenant Adı"
                rules={[{ required: true, message: 'Tenant adı gerekli' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="code"
                label="Tenant Kodu"
                rules={[{ required: true, message: 'Tenant kodu gerekli' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="E-posta"
                rules={[
                  { required: true, message: 'E-posta gerekli' },
                  { type: 'email', message: 'Geçerli bir e-posta girin' }
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Telefon"
                rules={[{ required: true, message: 'Telefon gerekli' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="plan"
                label="Plan"
                rules={[{ required: true, message: 'Plan seçimi gerekli' }]}
              >
                <Select>
                  <Option value="Free">Free</Option>
                  <Option value="Starter">Starter</Option>
                  <Option value="Professional">Professional</Option>
                  <Option value="Enterprise">Enterprise</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="maxUsers"
                label="Maksimum Kullanıcı"
                rules={[{ required: true, message: 'Maksimum kullanıcı sayısı gerekli' }]}
              >
                <Input type="number" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Güncelle
              </Button>
              <Button onClick={() => setEditModalVisible(false)}>
                İptal
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TenantDetail;