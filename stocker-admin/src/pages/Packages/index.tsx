import React, { useState } from 'react';
import {
  Button,
  Card,
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
  Badge,
  Tooltip,
  Typography,
  Divider,
  Tabs,
  List,
  Alert,
  InputNumber,
  Checkbox,
  Radio,
  Slider,
  Table,
  Popconfirm,
  Empty,
  Result,
  Timeline,
  Progress,
} from 'antd';
import { PageContainer, ProCard, ProDescriptions } from '@ant-design/pro-components';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  DollarOutlined,
  GiftOutlined,
  ThunderboltOutlined,
  CrownOutlined,
  StarOutlined,
  RocketOutlined,
  SafetyOutlined,
  TeamOutlined,
  CloudServerOutlined,
  DatabaseOutlined,
  ApiOutlined,
  MailOutlined,
  CustomerServiceOutlined,
  FileTextOutlined,
  BarChartOutlined,
  SettingOutlined,
  GlobalOutlined,
  LockOutlined,
  UnlockOutlined,
  CheckOutlined,
  CloseOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  TrophyOutlined,
  FireOutlined,
  BulbOutlined,
  ExperimentOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;
const { Group: CheckboxGroup } = Checkbox;

interface Package {
  id: string;
  name: string;
  displayName: string;
  description: string;
  price: number;
  originalPrice?: number;
  billingCycle: 'monthly' | 'yearly' | 'one-time';
  currency: string;
  status: 'active' | 'inactive' | 'deprecated';
  tier: 'starter' | 'professional' | 'enterprise' | 'custom';
  isPopular: boolean;
  isBestValue: boolean;
  trialDays: number;
  limits: {
    users: number;
    storage: number; // GB
    apiCalls: number;
    projects: number;
    customDomains: number;
    emailSupport: boolean;
    phoneSupport: boolean;
    prioritySupport: boolean;
    sla: number; // percentage
  };
  features: string[];
  addons: string[];
  subscriberCount: number;
  revenue: number;
  createdAt: string;
  updatedAt: string;
}

const PackagesPage: React.FC = () => {
  const [packages, setPackages] = useState<Package[]>([
    {
      id: '1',
      name: 'starter',
      displayName: 'Starter',
      description: 'Küçük işletmeler ve yeni başlayanlar için ideal',
      price: 99,
      billingCycle: 'monthly',
      currency: 'TRY',
      status: 'active',
      tier: 'starter',
      isPopular: false,
      isBestValue: false,
      trialDays: 14,
      limits: {
        users: 10,
        storage: 10,
        apiCalls: 10000,
        projects: 3,
        customDomains: 0,
        emailSupport: true,
        phoneSupport: false,
        prioritySupport: false,
        sla: 95,
      },
      features: [
        'Temel özellikler',
        'E-posta desteği',
        '10 GB depolama',
        '10 kullanıcı',
        'Standart raporlar',
        'Mobil uygulama erişimi',
      ],
      addons: [],
      subscriberCount: 450,
      revenue: 44550,
      createdAt: '2024-01-01',
      updatedAt: '2024-11-15',
    },
    {
      id: '2',
      name: 'professional',
      displayName: 'Professional',
      description: 'Büyüyen işletmeler için gelişmiş özellikler',
      price: 299,
      originalPrice: 399,
      billingCycle: 'monthly',
      currency: 'TRY',
      status: 'active',
      tier: 'professional',
      isPopular: true,
      isBestValue: true,
      trialDays: 30,
      limits: {
        users: 50,
        storage: 100,
        apiCalls: 100000,
        projects: 20,
        customDomains: 3,
        emailSupport: true,
        phoneSupport: true,
        prioritySupport: false,
        sla: 99,
      },
      features: [
        'Tüm Starter özellikleri',
        'Gelişmiş analitik',
        'API erişimi',
        'Özel raporlar',
        'Telefon desteği',
        '100 GB depolama',
        '50 kullanıcı',
        'Özel domain desteği',
        'Webhook entegrasyonları',
        'Gelişmiş güvenlik',
      ],
      addons: ['extra-storage', 'advanced-analytics'],
      subscriberCount: 280,
      revenue: 83720,
      createdAt: '2024-01-01',
      updatedAt: '2024-11-20',
    },
    {
      id: '3',
      name: 'enterprise',
      displayName: 'Enterprise',
      description: 'Büyük organizasyonlar için kurumsal çözüm',
      price: 999,
      billingCycle: 'monthly',
      currency: 'TRY',
      status: 'active',
      tier: 'enterprise',
      isPopular: false,
      isBestValue: false,
      trialDays: 30,
      limits: {
        users: 99999,
        storage: 99999,
        apiCalls: 99999999,
        projects: 99999,
        customDomains: 99999,
        emailSupport: true,
        phoneSupport: true,
        prioritySupport: true,
        sla: 99.9,
      },
      features: [
        'Tüm Professional özellikleri',
        'Sınırsız kullanıcı',
        'Sınırsız depolama',
        'Öncelikli destek',
        'SLA garantisi',
        'Özel onboarding',
        'Dedicated account manager',
        'Custom entegrasyonlar',
        'White-label seçeneği',
        'Gelişmiş güvenlik ve uyumluluk',
        'Custom contract',
      ],
      addons: ['white-label', 'dedicated-support', 'custom-integration'],
      subscriberCount: 45,
      revenue: 44955,
      createdAt: '2024-01-01',
      updatedAt: '2024-12-01',
    },
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('overview');

  const allFeatures = [
    { value: 'basic-features', label: 'Temel Özellikler' },
    { value: 'advanced-analytics', label: 'Gelişmiş Analitik' },
    { value: 'api-access', label: 'API Erişimi' },
    { value: 'custom-reports', label: 'Özel Raporlar' },
    { value: 'email-support', label: 'E-posta Desteği' },
    { value: 'phone-support', label: 'Telefon Desteği' },
    { value: 'priority-support', label: 'Öncelikli Destek' },
    { value: 'custom-domain', label: 'Özel Domain' },
    { value: 'white-label', label: 'White Label' },
    { value: 'sla-guarantee', label: 'SLA Garantisi' },
    { value: 'webhook-integration', label: 'Webhook Entegrasyonu' },
    { value: 'advanced-security', label: 'Gelişmiş Güvenlik' },
    { value: 'custom-integration', label: 'Özel Entegrasyon' },
    { value: 'dedicated-manager', label: 'Özel Account Manager' },
    { value: 'onboarding', label: 'Özel Onboarding' },
  ];

  const tierIcons = {
    starter: <RocketOutlined style={{ color: '#52c41a' }} />,
    professional: <StarOutlined style={{ color: '#1890ff' }} />,
    enterprise: <CrownOutlined style={{ color: '#722ed1' }} />,
    custom: <BulbOutlined style={{ color: '#fa8c16' }} />,
  };

  const tierColors = {
    starter: '#52c41a',
    professional: '#1890ff',
    enterprise: '#722ed1',
    custom: '#fa8c16',
  };

  const handleEdit = (pkg: Package) => {
    setEditingPackage(pkg);
    form.setFieldsValue({
      ...pkg,
      features: pkg.features,
      'limits.users': pkg.limits.users,
      'limits.storage': pkg.limits.storage,
      'limits.apiCalls': pkg.limits.apiCalls,
      'limits.projects': pkg.limits.projects,
      'limits.customDomains': pkg.limits.customDomains,
      'limits.emailSupport': pkg.limits.emailSupport,
      'limits.phoneSupport': pkg.limits.phoneSupport,
      'limits.prioritySupport': pkg.limits.prioritySupport,
      'limits.sla': pkg.limits.sla,
    });
    setIsModalVisible(true);
  };

  const handleDelete = (pkg: Package) => {
    Modal.confirm({
      title: 'Paket Sil',
      content: (
        <div>
          <Alert
            message="Dikkat!"
            description={`${pkg.subscriberCount} aktif aboneye sahip bu paketi silmek istediğinize emin misiniz?`}
            type="warning"
            showIcon
          />
          <p style={{ marginTop: 16 }}>
            <strong>{pkg.displayName}</strong> paketi silinecek.
          </p>
        </div>
      ),
      okText: 'Sil',
      okType: 'danger',
      onOk: () => {
        setPackages(packages.filter(p => p.id !== pkg.id));
        message.success('Paket silindi');
      },
    });
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      const newPackage: Package = {
        ...values,
        id: editingPackage?.id || Date.now().toString(),
        limits: {
          users: values['limits.users'],
          storage: values['limits.storage'],
          apiCalls: values['limits.apiCalls'],
          projects: values['limits.projects'],
          customDomains: values['limits.customDomains'],
          emailSupport: values['limits.emailSupport'],
          phoneSupport: values['limits.phoneSupport'],
          prioritySupport: values['limits.prioritySupport'],
          sla: values['limits.sla'],
        },
        subscriberCount: editingPackage?.subscriberCount || 0,
        revenue: editingPackage?.revenue || 0,
        createdAt: editingPackage?.createdAt || new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };

      if (editingPackage) {
        setPackages(packages.map(p => p.id === editingPackage.id ? newPackage : p));
        message.success('Paket güncellendi');
      } else {
        setPackages([...packages, newPackage]);
        message.success('Yeni paket oluşturuldu');
      }

      setIsModalVisible(false);
      form.resetFields();
      setEditingPackage(null);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const renderPackageCard = (pkg: Package) => (
    <ProCard
      key={pkg.id}
      hoverable
      bordered
      style={{ height: '100%' }}
      bodyStyle={{ padding: 0 }}
    >
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <Space>
            {tierIcons[pkg.tier]}
            <Title level={4} style={{ margin: 0 }}>{pkg.displayName}</Title>
          </Space>
          <Space>
            {pkg.isPopular && (
              <Tag color="red" icon={<FireOutlined />}>Popüler</Tag>
            )}
            {pkg.isBestValue && (
              <Tag color="green" icon={<TrophyOutlined />}>En İyi Değer</Tag>
            )}
            <Badge
              status={pkg.status === 'active' ? 'success' : pkg.status === 'inactive' ? 'default' : 'error'}
              text={pkg.status === 'active' ? 'Aktif' : pkg.status === 'inactive' ? 'İnaktif' : 'Kullanımdan Kaldırıldı'}
            />
          </Space>
        </div>

        <Paragraph type="secondary" style={{ minHeight: 50 }}>
          {pkg.description}
        </Paragraph>

        <div style={{ marginBottom: 24 }}>
          <Space align="baseline">
            {pkg.originalPrice && (
              <Text delete type="secondary" style={{ fontSize: 18 }}>
                ₺{pkg.originalPrice}
              </Text>
            )}
            <Text strong style={{ fontSize: 32 }}>
              ₺{pkg.price}
            </Text>
            <Text type="secondary">
              / {pkg.billingCycle === 'monthly' ? 'ay' : pkg.billingCycle === 'yearly' ? 'yıl' : 'tek seferlik'}
            </Text>
          </Space>
          {pkg.originalPrice && (
            <div>
              <Tag color="green">
                %{Math.round(((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100)} İndirim
              </Tag>
            </div>
          )}
        </div>

        <Divider />

        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Text strong>Limitler:</Text>
            <List
              size="small"
              style={{ marginTop: 8 }}
              dataSource={[
                { icon: <TeamOutlined />, text: `${pkg.limits.users === 99999 ? 'Sınırsız' : pkg.limits.users} Kullanıcı` },
                { icon: <CloudServerOutlined />, text: `${pkg.limits.storage === 99999 ? 'Sınırsız' : pkg.limits.storage + ' GB'} Depolama` },
                { icon: <ApiOutlined />, text: `${pkg.limits.apiCalls === 99999999 ? 'Sınırsız' : pkg.limits.apiCalls.toLocaleString()} API Çağrısı` },
                { icon: <AppstoreOutlined />, text: `${pkg.limits.projects === 99999 ? 'Sınırsız' : pkg.limits.projects} Proje` },
              ]}
              renderItem={(item) => (
                <List.Item style={{ padding: '4px 0', border: 'none' }}>
                  <Space size="small">
                    {item.icon}
                    <Text>{item.text}</Text>
                  </Space>
                </List.Item>
              )}
            />
          </div>

          <div>
            <Text strong>Özellikler:</Text>
            <List
              size="small"
              style={{ marginTop: 8, maxHeight: 150, overflow: 'auto' }}
              dataSource={pkg.features.slice(0, 5)}
              renderItem={(feature) => (
                <List.Item style={{ padding: '4px 0', border: 'none' }}>
                  <Space size="small">
                    <CheckOutlined style={{ color: '#52c41a' }} />
                    <Text>{feature}</Text>
                  </Space>
                </List.Item>
              )}
            />
            {pkg.features.length > 5 && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                +{pkg.features.length - 5} daha fazla özellik
              </Text>
            )}
          </div>

          <div>
            <Text strong>Destek:</Text>
            <Space wrap style={{ marginTop: 8 }}>
              {pkg.limits.emailSupport && (
                <Tag icon={<MailOutlined />} color="blue">E-posta</Tag>
              )}
              {pkg.limits.phoneSupport && (
                <Tag icon={<CustomerServiceOutlined />} color="green">Telefon</Tag>
              )}
              {pkg.limits.prioritySupport && (
                <Tag icon={<ThunderboltOutlined />} color="gold">Öncelikli</Tag>
              )}
              <Tag icon={<SafetyOutlined />}>SLA %{pkg.limits.sla}</Tag>
            </Space>
          </div>
        </Space>

        <Divider />

        <Row gutter={8}>
          <Col span={12}>
            <Statistic
              title="Abone"
              value={pkg.subscriberCount}
              prefix={<TeamOutlined />}
              valueStyle={{ fontSize: 16 }}
            />
          </Col>
          <Col span={12}>
            <Statistic
              title="Aylık Gelir"
              value={pkg.revenue}
              prefix="₺"
              valueStyle={{ fontSize: 16 }}
            />
          </Col>
        </Row>

        <Divider />

        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Button type="primary" onClick={() => handleEdit(pkg)}>
            Düzenle
          </Button>
          <Popconfirm
            title="Bu paketi silmek istediğinize emin misiniz?"
            onConfirm={() => handleDelete(pkg)}
            okText="Evet"
            cancelText="Hayır"
          >
            <Button danger>Sil</Button>
          </Popconfirm>
        </Space>
      </div>
    </ProCard>
  );

  const renderComparisonTable = () => {
    const features = [
      { name: 'Kullanıcı Sayısı', key: 'users' },
      { name: 'Depolama', key: 'storage' },
      { name: 'API Çağrısı', key: 'apiCalls' },
      { name: 'Proje Sayısı', key: 'projects' },
      { name: 'Özel Domain', key: 'customDomains' },
      { name: 'E-posta Desteği', key: 'emailSupport' },
      { name: 'Telefon Desteği', key: 'phoneSupport' },
      { name: 'Öncelikli Destek', key: 'prioritySupport' },
      { name: 'SLA', key: 'sla' },
    ];

    const columns = [
      {
        title: 'Özellik',
        dataIndex: 'name',
        key: 'name',
        fixed: 'left',
        width: 200,
      },
      ...packages.map(pkg => ({
        title: (
          <Space>
            {tierIcons[pkg.tier]}
            {pkg.displayName}
          </Space>
        ),
        key: pkg.id,
        align: 'center' as const,
        render: (_: any, record: any) => {
          const value = pkg.limits[record.key as keyof typeof pkg.limits];
          
          if (typeof value === 'boolean') {
            return value ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
          }
          
          if (record.key === 'users' || record.key === 'projects') {
            return value === 99999 ? 'Sınırsız' : value;
          }
          
          if (record.key === 'storage') {
            return value === 99999 ? 'Sınırsız' : `${value} GB`;
          }
          
          if (record.key === 'apiCalls') {
            return value === 99999999 ? 'Sınırsız' : value.toLocaleString();
          }
          
          if (record.key === 'customDomains') {
            return value === 99999 ? 'Sınırsız' : value === 0 ? '-' : value;
          }
          
          if (record.key === 'sla') {
            return `%${value}`;
          }
          
          return value;
        },
      })),
    ];

    return (
      <Table
        dataSource={features}
        columns={columns}
        pagination={false}
        scroll={{ x: 'max-content' }}
        bordered
      />
    );
  };

  return (
    <PageContainer
      header={{
        title: 'Paket Yönetimi',
        breadcrumb: {
          items: [
            { title: 'Ana Sayfa' },
            { title: 'Paketler' },
          ],
        },
      }}
      tabList={[
        { key: 'overview', tab: 'Genel Bakış' },
        { key: 'packages', tab: 'Paketler' },
        { key: 'comparison', tab: 'Karşılaştırma' },
        { key: 'analytics', tab: 'Analitik' },
      ]}
      tabActiveKey={activeTab}
      onTabChange={setActiveTab}
    >
      {activeTab === 'overview' && (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Toplam Paket"
                  value={packages.length}
                  prefix={<AppstoreOutlined style={{ color: '#667eea' }} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Aktif Paket"
                  value={packages.filter(p => p.status === 'active').length}
                  prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Toplam Abone"
                  value={packages.reduce((sum, p) => sum + p.subscriberCount, 0)}
                  prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Aylık Gelir"
                  value={packages.reduce((sum, p) => sum + p.revenue, 0)}
                  prefix="₺"
                  suffix={
                    <Text type="success" style={{ fontSize: 14 }}>
                      +12.5%
                    </Text>
                  }
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            {packages.map(pkg => (
              <Col xs={24} sm={12} lg={8} key={pkg.id}>
                {renderPackageCard(pkg)}
              </Col>
            ))}
            <Col xs={24} sm={12} lg={8}>
              <ProCard
                hoverable
                bordered
                style={{ height: '100%', minHeight: 400 }}
                bodyStyle={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  textAlign: 'center'
                }}
              >
                <ExperimentOutlined style={{ fontSize: 48, color: '#999', marginBottom: 16 }} />
                <Title level={4} type="secondary">Yeni Paket Ekle</Title>
                <Paragraph type="secondary">
                  Müşterileriniz için yeni bir paket oluşturun
                </Paragraph>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  size="large"
                  onClick={() => {
                    setEditingPackage(null);
                    form.resetFields();
                    setIsModalVisible(true);
                  }}
                >
                  Paket Oluştur
                </Button>
              </ProCard>
            </Col>
          </Row>
        </>
      )}

      {activeTab === 'packages' && (
        <ProCard>
          <List
            dataSource={packages}
            renderItem={(pkg) => (
              <List.Item
                key={pkg.id}
                actions={[
                  <Button type="link" onClick={() => handleEdit(pkg)}>Düzenle</Button>,
                  <Popconfirm
                    title="Bu paketi silmek istediğinize emin misiniz?"
                    onConfirm={() => handleDelete(pkg)}
                  >
                    <Button type="link" danger>Sil</Button>
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  avatar={tierIcons[pkg.tier]}
                  title={
                    <Space>
                      {pkg.displayName}
                      <Badge
                        status={pkg.status === 'active' ? 'success' : 'default'}
                        text={pkg.status === 'active' ? 'Aktif' : 'İnaktif'}
                      />
                    </Space>
                  }
                  description={
                    <Space direction="vertical">
                      <Text>{pkg.description}</Text>
                      <Space>
                        <Text strong>₺{pkg.price}/{pkg.billingCycle === 'monthly' ? 'ay' : 'yıl'}</Text>
                        <Divider type="vertical" />
                        <Text>{pkg.subscriberCount} abone</Text>
                        <Divider type="vertical" />
                        <Text>₺{pkg.revenue.toLocaleString()} gelir</Text>
                      </Space>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </ProCard>
      )}

      {activeTab === 'comparison' && (
        <ProCard title="Paket Karşılaştırması">
          {renderComparisonTable()}
        </ProCard>
      )}

      {activeTab === 'analytics' && (
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <ProCard title="Paket Dağılımı">
              <Row gutter={16}>
                {packages.map(pkg => (
                  <Col span={8} key={pkg.id}>
                    <Card>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Space>
                          {tierIcons[pkg.tier]}
                          <Text strong>{pkg.displayName}</Text>
                        </Space>
                        <Progress
                          percent={Math.round((pkg.subscriberCount / packages.reduce((sum, p) => sum + p.subscriberCount, 0)) * 100)}
                          strokeColor={tierColors[pkg.tier]}
                        />
                        <Row>
                          <Col span={12}>
                            <Statistic
                              title="Abone"
                              value={pkg.subscriberCount}
                              valueStyle={{ fontSize: 16 }}
                            />
                          </Col>
                          <Col span={12}>
                            <Statistic
                              title="Gelir"
                              value={pkg.revenue}
                              prefix="₺"
                              valueStyle={{ fontSize: 16 }}
                            />
                          </Col>
                        </Row>
                      </Space>
                    </Card>
                  </Col>
                ))}
              </Row>
            </ProCard>
          </Col>

          <Col span={12}>
            <ProCard title="En Popüler Özellikler">
              <List
                dataSource={[
                  { feature: 'E-posta Desteği', usage: 95 },
                  { feature: 'API Erişimi', usage: 78 },
                  { feature: 'Özel Raporlar', usage: 65 },
                  { feature: 'Telefon Desteği', usage: 45 },
                  { feature: 'White Label', usage: 12 },
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <div style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text>{item.feature}</Text>
                        <Text strong>{item.usage}%</Text>
                      </div>
                      <Progress percent={item.usage} showInfo={false} />
                    </div>
                  </List.Item>
                )}
              />
            </ProCard>
          </Col>

          <Col span={12}>
            <ProCard title="Paket Değişim Trendleri">
              <Timeline>
                <Timeline.Item color="green">
                  <p>15 kullanıcı Starter'dan Professional'a yükseltildi</p>
                  <Text type="secondary">Bu ay</Text>
                </Timeline.Item>
                <Timeline.Item color="blue">
                  <p>8 kullanıcı Professional'dan Enterprise'a yükseltildi</p>
                  <Text type="secondary">Bu ay</Text>
                </Timeline.Item>
                <Timeline.Item color="red">
                  <p>3 kullanıcı Professional'dan Starter'a düşürüldü</p>
                  <Text type="secondary">Geçen ay</Text>
                </Timeline.Item>
                <Timeline.Item>
                  <p>Yeni "Custom" paketi eklendi</p>
                  <Text type="secondary">2 ay önce</Text>
                </Timeline.Item>
              </Timeline>
            </ProCard>
          </Col>
        </Row>
      )}

      {/* Create/Edit Package Modal */}
      <Modal
        title={editingPackage ? 'Paketi Düzenle' : 'Yeni Paket Oluştur'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingPackage(null);
        }}
        width={900}
        okText={editingPackage ? 'Güncelle' : 'Oluştur'}
        cancelText="İptal"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: 'active',
            billingCycle: 'monthly',
            currency: 'TRY',
            tier: 'starter',
            isPopular: false,
            isBestValue: false,
            trialDays: 14,
            'limits.emailSupport': true,
            'limits.phoneSupport': false,
            'limits.prioritySupport': false,
            'limits.sla': 95,
          }}
        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="name"
                label="Paket Kodu"
                rules={[{ required: true, message: 'Paket kodu zorunludur' }]}
              >
                <Input placeholder="starter, professional, enterprise" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="displayName"
                label="Görünen Ad"
                rules={[{ required: true, message: 'Görünen ad zorunludur' }]}
              >
                <Input placeholder="Starter, Professional, Enterprise" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="tier"
                label="Seviye"
                rules={[{ required: true, message: 'Seviye seçimi zorunludur' }]}
              >
                <Select>
                  <Option value="starter">Starter</Option>
                  <Option value="professional">Professional</Option>
                  <Option value="enterprise">Enterprise</Option>
                  <Option value="custom">Custom</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Açıklama"
            rules={[{ required: true, message: 'Açıklama zorunludur' }]}
          >
            <TextArea rows={2} placeholder="Paketin kısa açıklaması" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                name="price"
                label="Fiyat"
                rules={[{ required: true, message: 'Fiyat zorunludur' }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  formatter={(value) => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/₺\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="originalPrice" label="Orijinal Fiyat (Opsiyonel)">
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  formatter={(value) => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/₺\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="billingCycle"
                label="Faturalama Periyodu"
                rules={[{ required: true }]}
              >
                <Select>
                  <Option value="monthly">Aylık</Option>
                  <Option value="yearly">Yıllık</Option>
                  <Option value="one-time">Tek Seferlik</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="trialDays" label="Deneme Süresi (Gün)">
                <InputNumber min={0} max={90} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider>Limitler</Divider>

          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                name="limits.users"
                label="Kullanıcı Sayısı"
                rules={[{ required: true }]}
              >
                <InputNumber min={1} max={99999} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="limits.storage"
                label="Depolama (GB)"
                rules={[{ required: true }]}
              >
                <InputNumber min={1} max={99999} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="limits.apiCalls"
                label="API Çağrısı"
                rules={[{ required: true }]}
              >
                <InputNumber min={1000} max={99999999} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="limits.projects"
                label="Proje Sayısı"
                rules={[{ required: true }]}
              >
                <InputNumber min={1} max={99999} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                name="limits.customDomains"
                label="Özel Domain"
              >
                <InputNumber min={0} max={99999} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="limits.sla"
                label="SLA (%)"
                rules={[{ required: true }]}
              >
                <InputNumber min={90} max={99.99} step={0.1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Destek Seçenekleri">
                <Space>
                  <Form.Item name="limits.emailSupport" valuePropName="checked" noStyle>
                    <Checkbox>E-posta</Checkbox>
                  </Form.Item>
                  <Form.Item name="limits.phoneSupport" valuePropName="checked" noStyle>
                    <Checkbox>Telefon</Checkbox>
                  </Form.Item>
                  <Form.Item name="limits.prioritySupport" valuePropName="checked" noStyle>
                    <Checkbox>Öncelikli</Checkbox>
                  </Form.Item>
                </Space>
              </Form.Item>
            </Col>
          </Row>

          <Divider>Özellikler</Divider>

          <Form.Item name="features" label="Paket Özellikleri">
            <CheckboxGroup options={allFeatures} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="status" label="Durum">
                <Radio.Group>
                  <Radio value="active">Aktif</Radio>
                  <Radio value="inactive">İnaktif</Radio>
                  <Radio value="deprecated">Kullanımdan Kaldırıldı</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="isPopular" valuePropName="checked">
                <Checkbox>Popüler Paket</Checkbox>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="isBestValue" valuePropName="checked">
                <Checkbox>En İyi Değer</Checkbox>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default PackagesPage;