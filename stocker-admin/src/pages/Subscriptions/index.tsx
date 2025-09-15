import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Table, 
  Button, 
  Space, 
  Typography, 
  Tag, 
  Badge, 
  Statistic, 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  InputNumber, 
  Switch, 
  Divider, 
  Alert, 
  Tooltip, 
  Dropdown, 
  Menu, 
  Progress, 
  Timeline, 
  Avatar, 
  List, 
  Tabs, 
  Descriptions, 
  message, 
  notification 
} from 'antd';
import {
  CreditCardOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  FilterOutlined,
  DownloadOutlined,
  StopOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  DollarOutlined,
  TeamOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  SettingOutlined,
  BellOutlined,
  MailOutlined,
  CopyOutlined,
  ShareAltOutlined,
  TrophyOutlined,
  RiseOutlined,
  FallOutlined,
  ClockCircleOutlined,
  UserOutlined,
  MoreOutlined,
  SearchOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';
import { Column, Line, Pie, Area } from '@ant-design/plots';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);
dayjs.locale('tr');

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { TextArea } = Input;

interface Subscription {
  id: string;
  tenantId: string;
  tenantName: string;
  packageName: string;
  packageType: 'basic' | 'standard' | 'premium' | 'enterprise';
  status: 'active' | 'paused' | 'cancelled' | 'expired' | 'trial';
  price: number;
  currency: 'USD' | 'EUR' | 'TRY';
  billingCycle: 'monthly' | 'yearly' | 'quarterly';
  startDate: string;
  endDate: string;
  nextBilling: string;
  autoRenew: boolean;
  trialPeriod?: number;
  discount?: number;
  users: number;
  maxUsers: number;
  features: string[];
  paymentMethod: string;
  lastPayment?: string;
  totalPaid: number;
  invoicesCount: number;
}

interface SubscriptionStats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  annualRevenue: number;
  churnRate: number;
  averagePrice: number;
  trialConversion: number;
  renewalRate: number;
}

const SubscriptionsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form] = Form.useForm();

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([
    {
      id: '1',
      tenantId: 'tenant_123',
      tenantName: 'ABC Corp',
      packageName: 'Enterprise Plan',
      packageType: 'enterprise',
      status: 'active',
      price: 299,
      currency: 'USD',
      billingCycle: 'monthly',
      startDate: '2023-01-15',
      endDate: '2024-01-15',
      nextBilling: '2024-02-15',
      autoRenew: true,
      users: 45,
      maxUsers: 100,
      features: ['Advanced Analytics', 'Priority Support', 'Custom Integrations', 'API Access'],
      paymentMethod: 'Credit Card (**** 1234)',
      lastPayment: '2024-01-15',
      totalPaid: 3588,
      invoicesCount: 12
    },
    {
      id: '2',
      tenantId: 'tenant_456',
      tenantName: 'XYZ Solutions',
      packageName: 'Standard Plan',
      packageType: 'standard',
      status: 'active',
      price: 99,
      currency: 'USD',
      billingCycle: 'monthly',
      startDate: '2023-06-01',
      endDate: '2024-06-01',
      nextBilling: '2024-02-01',
      autoRenew: true,
      users: 15,
      maxUsers: 25,
      features: ['Basic Analytics', 'Email Support', 'Standard Integrations'],
      paymentMethod: 'Bank Transfer',
      lastPayment: '2024-01-01',
      totalPaid: 792,
      invoicesCount: 8
    },
    {
      id: '3',
      tenantId: 'tenant_789',
      tenantName: 'StartupCo',
      packageName: 'Basic Plan',
      packageType: 'basic',
      status: 'trial',
      price: 29,
      currency: 'USD',
      billingCycle: 'monthly',
      startDate: '2024-01-01',
      endDate: '2024-01-15',
      nextBilling: '2024-01-15',
      autoRenew: false,
      trialPeriod: 14,
      users: 3,
      maxUsers: 5,
      features: ['Basic Features', 'Community Support'],
      paymentMethod: 'Not Set',
      totalPaid: 0,
      invoicesCount: 0
    },
    {
      id: '4',
      tenantId: 'tenant_012',
      tenantName: 'Tech Agency',
      packageName: 'Premium Plan',
      packageType: 'premium',
      status: 'paused',
      price: 199,
      currency: 'USD',
      billingCycle: 'monthly',
      startDate: '2023-03-10',
      endDate: '2024-03-10',
      nextBilling: '2024-02-10',
      autoRenew: true,
      users: 28,
      maxUsers: 50,
      features: ['Advanced Analytics', 'Priority Support', 'API Access'],
      paymentMethod: 'Credit Card (**** 5678)',
      lastPayment: '2023-12-10',
      totalPaid: 2189,
      invoicesCount: 11
    },
    {
      id: '5',
      tenantId: 'tenant_345',
      tenantName: 'Digital Solutions',
      packageName: 'Enterprise Plan',
      packageType: 'enterprise',
      status: 'cancelled',
      price: 299,
      currency: 'USD',
      billingCycle: 'yearly',
      startDate: '2022-08-01',
      endDate: '2023-08-01',
      nextBilling: '-',
      autoRenew: false,
      users: 0,
      maxUsers: 100,
      features: ['Advanced Analytics', 'Priority Support', 'Custom Integrations', 'API Access'],
      paymentMethod: 'Credit Card (**** 9012)',
      lastPayment: '2022-08-01',
      totalPaid: 3588,
      invoicesCount: 12
    }
  ]);

  const [stats] = useState<SubscriptionStats>({
    totalSubscriptions: 234,
    activeSubscriptions: 189,
    monthlyRevenue: 45620,
    annualRevenue: 547440,
    churnRate: 3.2,
    averagePrice: 142,
    trialConversion: 68.5,
    renewalRate: 92.3
  });

  // Chart data
  const revenueData = [
    { month: 'Oca', value: 38500 },
    { month: 'Şub', value: 42100 },
    { month: 'Mar', value: 39800 },
    { month: 'Nis', value: 43600 },
    { month: 'May', value: 41200 },
    { month: 'Haz', value: 45620 }
  ];

  const packageDistribution = [
    { type: 'Basic', value: 35.2, count: 82 },
    { type: 'Standard', value: 28.7, count: 67 },
    { type: 'Premium', value: 21.4, count: 50 },
    { type: 'Enterprise', value: 14.7, count: 35 }
  ];

  const churnData = [
    { month: 'Oca', churn: 2.8, new: 24 },
    { month: 'Şub', churn: 3.1, new: 28 },
    { month: 'Mar', churn: 2.9, new: 22 },
    { month: 'Nis', churn: 3.4, new: 31 },
    { month: 'May', churn: 2.7, new: 26 },
    { month: 'Haz', churn: 3.2, new: 29 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'trial': return 'blue';
      case 'paused': return 'orange';
      case 'cancelled': return 'red';
      case 'expired': return 'default';
      default: return 'default';
    }
  };

  const getPackageColor = (type: string) => {
    switch (type) {
      case 'basic': return 'blue';
      case 'standard': return 'green';
      case 'premium': return 'gold';
      case 'enterprise': return 'purple';
      default: return 'default';
    }
  };

  const handleStatusChange = (subscriptionId: string, newStatus: string) => {
    setSubscriptions(prev => prev.map(sub => 
      sub.id === subscriptionId 
        ? { ...sub, status: newStatus as any }
        : sub
    ));
    message.success('Abonelik durumu güncellendi');
  };

  const handleCreate = () => {
    form.validateFields().then(values => {
      const newSubscription: Subscription = {
        id: Date.now().toString(),
        ...values,
        status: 'active',
        totalPaid: 0,
        invoicesCount: 0,
        features: values.features || []
      };
      setSubscriptions([newSubscription, ...subscriptions]);
      message.success('Yeni abonelik oluşturuldu');
      setModalVisible(false);
      form.resetFields();
    });
  };

  const columns = [
    {
      title: 'Tenant',
      dataIndex: 'tenantName',
      key: 'tenantName',
      render: (text: string, record: Subscription) => (
        <Space>
          <Avatar size="small" style={{ backgroundColor: getPackageColor(record.packageType) }}>
            {text.charAt(0)}
          </Avatar>
          <div>
            <Text strong>{text}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.tenantId}
            </Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Paket',
      dataIndex: 'packageName',
      key: 'packageName',
      render: (text: string, record: Subscription) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Tag color={getPackageColor(record.packageType)}>
            {record.packageType.toUpperCase()}
          </Tag>
        </Space>
      )
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge
          status={status === 'active' ? 'success' :
                 status === 'trial' ? 'processing' :
                 status === 'paused' ? 'warning' :
                 status === 'cancelled' ? 'error' : 'default'}
          text={status === 'active' ? 'Aktif' :
               status === 'trial' ? 'Deneme' :
               status === 'paused' ? 'Duraklatıldı' :
               status === 'cancelled' ? 'İptal Edildi' : 'Süresi Doldu'}
        />
      )
    },
    {
      title: 'Fiyat',
      dataIndex: 'price',
      key: 'price',
      render: (price: number, record: Subscription) => (
        <Space direction="vertical" size={0}>
          <Text strong>${price}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.billingCycle === 'monthly' ? '/ay' :
             record.billingCycle === 'yearly' ? '/yıl' : '/çeyrek'}
          </Text>
        </Space>
      )
    },
    {
      title: 'Kullanıcılar',
      dataIndex: 'users',
      key: 'users',
      render: (users: number, record: Subscription) => (
        <Space direction="vertical" size={0}>
          <Text>{users} / {record.maxUsers}</Text>
          <Progress 
            percent={(users / record.maxUsers) * 100} 
            size="small" 
            showInfo={false}
          />
        </Space>
      )
    },
    {
      title: 'Sonraki Faturalandırma',
      dataIndex: 'nextBilling',
      key: 'nextBilling',
      render: (date: string) => (
        date !== '-' ? dayjs(date).format('DD.MM.YYYY') : '-'
      )
    },
    {
      title: 'Toplam Ödenen',
      dataIndex: 'totalPaid',
      key: 'totalPaid',
      render: (amount: number) => (
        <Text>${amount.toLocaleString()}</Text>
      )
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_: any, record: Subscription) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedSubscription(record);
              setDetailModalVisible(true);
            }}
          >
            Detay
          </Button>
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item 
                  key="pause" 
                  icon={<PauseCircleOutlined />}
                  disabled={record.status !== 'active'}
                  onClick={() => handleStatusChange(record.id, 'paused')}
                >
                  Duraklat
                </Menu.Item>
                <Menu.Item 
                  key="resume" 
                  icon={<PlayCircleOutlined />}
                  disabled={record.status !== 'paused'}
                  onClick={() => handleStatusChange(record.id, 'active')}
                >
                  Devam Ettir
                </Menu.Item>
                <Menu.Item 
                  key="cancel" 
                  icon={<StopOutlined />}
                  danger
                  disabled={record.status === 'cancelled'}
                  onClick={() => handleStatusChange(record.id, 'cancelled')}
                >
                  İptal Et
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item key="edit" icon={<EditOutlined />}>
                  Düzenle
                </Menu.Item>
                <Menu.Item key="invoice" icon={<CreditCardOutlined />}>
                  Fatura Oluştur
                </Menu.Item>
                <Menu.Item key="contact" icon={<MailOutlined />}>
                  Müşteriyle İletişim
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

  const lineConfig = {
    data: revenueData,
    xField: 'month',
    yField: 'value',
    smooth: true,
    point: {
      size: 4,
      shape: 'circle',
    },
    line: {
      color: '#667eea',
    },
  };

  const pieConfig = {
    appendPadding: 10,
    data: packageDistribution,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      formatter: (text: any, item: any) => {
        return `${item._origin.type}: ${item._origin.count}`;
      },
    },
    interactions: [
      {
        type: 'element-active',
      },
    ],
  };

  const areaConfig = {
    data: churnData.flatMap(item => [
      { month: item.month, value: item.churn, type: 'Churn Rate' },
      { month: item.month, value: item.new, type: 'New Subscriptions' }
    ]),
    xField: 'month',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
  };

  return (
    <div style={{ padding: 24 }}>
      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={12}>
            <Title level={4} style={{ margin: 0 }}>
              <CreditCardOutlined /> Abonelik Yönetimi
            </Title>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Space>
              <Button icon={<FilterOutlined />}>Filtrele</Button>
              <Button icon={<DownloadOutlined />}>Dışa Aktar</Button>
              <Button icon={<ReloadOutlined />}>Yenile</Button>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setModalVisible(true)}
              >
                Yeni Abonelik
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Toplam Abonelik"
              value={stats.totalSubscriptions}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Aktif Abonelik"
              value={stats.activeSubscriptions}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Aylık Gelir"
              value={stats.monthlyRevenue}
              prefix={<DollarOutlined />}
              precision={0}
              suffix="USD"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Yenileme Oranı"
              value={stats.renewalRate}
              precision={1}
              suffix="%"
              prefix={<RiseOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Secondary Statistics */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Yıllık Gelir"
              value={stats.annualRevenue}
              prefix={<TrophyOutlined />}
              precision={0}
              suffix="USD"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Churn Oranı"
              value={stats.churnRate}
              precision={1}
              suffix="%"
              prefix={<FallOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Ortalama Fiyat"
              value={stats.averagePrice}
              prefix={<DollarOutlined />}
              suffix="USD"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Trial Dönüşümü"
              value={stats.trialConversion}
              precision={1}
              suffix="%"
              prefix={<RiseOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Card bordered={false}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Tüm Abonelikler" key="all">
            <Space style={{ marginBottom: 16 }}>
              <Select placeholder="Durum" style={{ width: 120 }} defaultValue="all">
                <Option value="all">Tümü</Option>
                <Option value="active">Aktif</Option>
                <Option value="trial">Deneme</Option>
                <Option value="paused">Duraklatıldı</Option>
                <Option value="cancelled">İptal Edildi</Option>
                <Option value="expired">Süresi Doldu</Option>
              </Select>
              <Select placeholder="Paket Tipi" style={{ width: 120 }} defaultValue="all">
                <Option value="all">Tümü</Option>
                <Option value="basic">Basic</Option>
                <Option value="standard">Standard</Option>
                <Option value="premium">Premium</Option>
                <Option value="enterprise">Enterprise</Option>
              </Select>
              <Select placeholder="Faturalandırma" style={{ width: 120 }} defaultValue="all">
                <Option value="all">Tümü</Option>
                <Option value="monthly">Aylık</Option>
                <Option value="quarterly">Çeyreklik</Option>
                <Option value="yearly">Yıllık</Option>
              </Select>
              <Input.Search 
                placeholder="Abonelik ara..." 
                style={{ width: 300 }}
                enterButton={<SearchOutlined />}
              />
            </Space>

            <Table
              columns={columns}
              dataSource={subscriptions}
              rowKey="id"
              pagination={{ 
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Toplam ${total} abonelik`
              }}
              scroll={{ x: 1400 }}
            />
          </TabPane>

          <TabPane tab="Analitik" key="analytics">
            <Row gutter={16}>
              <Col span={12}>
                <Card title="Aylık Gelir Trendi" size="small" style={{ marginBottom: 16 }}>
                  <Line {...lineConfig} height={200} />
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Paket Dağılımı" size="small" style={{ marginBottom: 16 }}>
                  <Pie {...pieConfig} height={200} />
                </Card>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={24}>
                <Card title="Churn Rate vs Yeni Abonelikler" size="small">
                  <Area {...areaConfig} height={250} />
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Faturalandırma Takvimi" key="billing">
            <Alert
              message="Yaklaşan Faturalandırmalar"
              description="Önümüzdeki 30 gün içinde faturalandırılacak abonelikler"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Timeline>
              <Timeline.Item color="green">
                <Space direction="vertical" size={0}>
                  <Text strong>ABC Corp - Enterprise Plan</Text>
                  <Text type="secondary">$299 - 15 Şubat 2024</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Otomatik ödeme aktif
                  </Text>
                </Space>
              </Timeline.Item>
              <Timeline.Item color="orange">
                <Space direction="vertical" size={0}>
                  <Text strong>Tech Agency - Premium Plan</Text>
                  <Text type="secondary">$199 - 18 Şubat 2024</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    <WarningOutlined /> Ödeme yöntemi güncellenmeli
                  </Text>
                </Space>
              </Timeline.Item>
              <Timeline.Item color="blue">
                <Space direction="vertical" size={0}>
                  <Text strong>XYZ Solutions - Standard Plan</Text>
                  <Text type="secondary">$99 - 1 Mart 2024</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Banka havalesi
                  </Text>
                </Space>
              </Timeline.Item>
              <Timeline.Item color="red">
                <Space direction="vertical" size={0}>
                  <Text strong>StartupCo - Trial Period</Text>
                  <Text type="secondary">Deneme süresi bitiyor - 15 Şubat 2024</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    <ExclamationCircleOutlined /> Ödeme yöntemi ayarlanmalı
                  </Text>
                </Space>
              </Timeline.Item>
            </Timeline>
          </TabPane>

          <TabPane tab="Trial Abonelikler" key="trials">
            <Alert
              message="Trial Abonelik Yönetimi"
              description="Deneme süresi kullanıcılarını takip edin ve ücretli plana geçiş sürecini yönetin."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <List
              dataSource={subscriptions.filter(sub => sub.status === 'trial')}
              renderItem={subscription => (
                <List.Item
                  actions={[
                    <Button type="primary" size="small">Plana Yükselt</Button>,
                    <Button size="small">Uzat</Button>,
                    <Button size="small" danger>İptal Et</Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={subscription.tenantName}
                    description={
                      <Space direction="vertical" size={0}>
                        <Text>{subscription.packageName}</Text>
                        <Text type="secondary">
                          Kalan süre: {dayjs(subscription.endDate).diff(dayjs(), 'days')} gün
                        </Text>
                        <Progress 
                          percent={100 - ((dayjs(subscription.endDate).diff(dayjs(), 'days') / (subscription.trialPeriod || 14)) * 100)}
                          size="small"
                          status={dayjs(subscription.endDate).diff(dayjs(), 'days') < 3 ? 'exception' : 'normal'}
                        />
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editMode ? 'Abonelik Düzenle' : 'Yeni Abonelik Oluştur'}
        visible={modalVisible}
        onOk={handleCreate}
        onCancel={() => setModalVisible(false)}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="tenantName"
                label="Tenant Adı"
                rules={[{ required: true, message: 'Tenant adı gereklidir' }]}
              >
                <Input placeholder="ABC Corp" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="tenantId"
                label="Tenant ID"
                rules={[{ required: true, message: 'Tenant ID gereklidir' }]}
              >
                <Input placeholder="tenant_123" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="packageName"
                label="Paket Adı"
                rules={[{ required: true, message: 'Paket adı gereklidir' }]}
              >
                <Input placeholder="Enterprise Plan" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="packageType"
                label="Paket Tipi"
                rules={[{ required: true, message: 'Paket tipi seçiniz' }]}
              >
                <Select placeholder="Paket tipi seçiniz">
                  <Option value="basic">Basic</Option>
                  <Option value="standard">Standard</Option>
                  <Option value="premium">Premium</Option>
                  <Option value="enterprise">Enterprise</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="price"
                label="Fiyat"
                rules={[{ required: true, message: 'Fiyat gereklidir' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="299"
                  min={0}
                  addonBefore="$"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="billingCycle"
                label="Faturalandırma Döngüsü"
                rules={[{ required: true, message: 'Faturalandırma döngüsü seçiniz' }]}
              >
                <Select placeholder="Döngü seçiniz">
                  <Option value="monthly">Aylık</Option>
                  <Option value="quarterly">Çeyreklik</Option>
                  <Option value="yearly">Yıllık</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="currency"
                label="Para Birimi"
                rules={[{ required: true, message: 'Para birimi seçiniz' }]}
              >
                <Select placeholder="Para birimi" defaultValue="USD">
                  <Option value="USD">USD</Option>
                  <Option value="EUR">EUR</Option>
                  <Option value="TRY">TRY</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="maxUsers"
                label="Maksimum Kullanıcı"
                rules={[{ required: true, message: 'Maksimum kullanıcı sayısı gereklidir' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="100"
                  min={1}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="autoRenew"
                label="Otomatik Yenileme"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="features"
            label="Özellikler"
          >
            <Select
              mode="tags"
              placeholder="Paket özelliklerini ekleyin"
              tokenSeparators={[',']}
            >
              <Option value="Advanced Analytics">Advanced Analytics</Option>
              <Option value="Priority Support">Priority Support</Option>
              <Option value="API Access">API Access</Option>
              <Option value="Custom Integrations">Custom Integrations</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title="Abonelik Detayları"
        visible={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Kapat
          </Button>
        ]}
      >
        {selectedSubscription && (
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="Tenant" span={2}>
              <Space>
                <Avatar size="small" style={{ backgroundColor: getPackageColor(selectedSubscription.packageType) }}>
                  {selectedSubscription.tenantName.charAt(0)}
                </Avatar>
                <Text strong>{selectedSubscription.tenantName}</Text>
                <Text type="secondary">({selectedSubscription.tenantId})</Text>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Paket">
              {selectedSubscription.packageName}
            </Descriptions.Item>
            <Descriptions.Item label="Tip">
              <Tag color={getPackageColor(selectedSubscription.packageType)}>
                {selectedSubscription.packageType.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Durum">
              <Badge
                status={getStatusColor(selectedSubscription.status) as any}
                text={selectedSubscription.status}
              />
            </Descriptions.Item>
            <Descriptions.Item label="Fiyat">
              ${selectedSubscription.price} / {selectedSubscription.billingCycle}
            </Descriptions.Item>
            <Descriptions.Item label="Başlangıç Tarihi">
              {dayjs(selectedSubscription.startDate).format('DD.MM.YYYY')}
            </Descriptions.Item>
            <Descriptions.Item label="Bitiş Tarihi">
              {dayjs(selectedSubscription.endDate).format('DD.MM.YYYY')}
            </Descriptions.Item>
            <Descriptions.Item label="Kullanıcılar">
              {selectedSubscription.users} / {selectedSubscription.maxUsers}
            </Descriptions.Item>
            <Descriptions.Item label="Otomatik Yenileme">
              {selectedSubscription.autoRenew ? 'Aktif' : 'Pasif'}
            </Descriptions.Item>
            <Descriptions.Item label="Ödeme Yöntemi">
              {selectedSubscription.paymentMethod}
            </Descriptions.Item>
            <Descriptions.Item label="Son Ödeme">
              {selectedSubscription.lastPayment ? 
                dayjs(selectedSubscription.lastPayment).format('DD.MM.YYYY') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Toplam Ödenen">
              ${selectedSubscription.totalPaid.toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Fatura Sayısı">
              {selectedSubscription.invoicesCount}
            </Descriptions.Item>
            <Descriptions.Item label="Özellikler" span={2}>
              <Space wrap>
                {selectedSubscription.features.map(feature => (
                  <Tag key={feature}>{feature}</Tag>
                ))}
              </Space>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default SubscriptionsPage;