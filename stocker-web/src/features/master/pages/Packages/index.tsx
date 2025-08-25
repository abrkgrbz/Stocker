import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Table,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Tabs,
  Badge,
  Typography,
  Tooltip,
  Dropdown,
  Avatar,
  List,
  Checkbox,
  Divider,
  Alert,
  Progress,
  Statistic,
  Timeline,
  message,
  Popconfirm,
  Descriptions,
  Segmented,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  EyeOutlined,
  MoreOutlined,
  DollarOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  StarOutlined,
  ThunderboltOutlined,
  CrownOutlined,
  RocketOutlined,
  GiftOutlined,
  TagOutlined,
  PercentageOutlined,
  CalendarOutlined,
  TeamOutlined,
  DatabaseOutlined,
  ApiOutlined,
  SafetyOutlined,
  CustomerServiceOutlined,
  FileTextOutlined,
  SettingOutlined,
  AppstoreOutlined,
  CloudOutlined,
  LockOutlined,
  UnlockOutlined,
  FireOutlined,
  TrophyOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import './style.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

interface Package {
  id: string;
  name: string;
  displayName: string;
  description: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  limits: {
    users: number;
    storage: number;
    projects: number;
    apiCalls: number;
  };
  modules: string[];
  isActive: boolean;
  isPopular: boolean;
  discount: number;
  subscriberCount: number;
  revenue: number;
  color: string;
  icon: React.ReactNode;
}

export const MasterPackagesPage: React.FC = () => {
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [form] = Form.useForm();

  // Mock packages data
  const packages: Package[] = [
    {
      id: '1',
      name: 'free',
      displayName: 'Ücretsiz',
      description: 'Küçük işletmeler ve bireysel kullanıcılar için ideal başlangıç paketi',
      price: 0,
      billingCycle: 'monthly',
      features: [
        'Temel stok yönetimi',
        'Fatura oluşturma',
        'Basit raporlama',
        'E-posta desteği',
      ],
      limits: {
        users: 2,
        storage: 1,
        projects: 3,
        apiCalls: 1000,
      },
      modules: ['inventory', 'invoicing'],
      isActive: true,
      isPopular: false,
      discount: 0,
      subscriberCount: 145,
      revenue: 0,
      color: '#8c8c8c',
      icon: <GiftOutlined />,
    },
    {
      id: '2',
      name: 'starter',
      displayName: 'Başlangıç',
      description: 'Büyüyen işletmeler için gelişmiş özellikler ve daha fazla kullanıcı',
      price: 499,
      billingCycle: 'monthly',
      features: [
        'Gelişmiş stok yönetimi',
        'CRM modülü',
        'Detaylı raporlama',
        'Telefon desteği',
        'API erişimi',
      ],
      limits: {
        users: 10,
        storage: 10,
        projects: 10,
        apiCalls: 10000,
      },
      modules: ['inventory', 'invoicing', 'crm', 'reports'],
      isActive: true,
      isPopular: true,
      discount: 20,
      subscriberCount: 89,
      revenue: 44411,
      color: '#52c41a',
      icon: <RocketOutlined />,
    },
    {
      id: '3',
      name: 'professional',
      displayName: 'Profesyonel',
      description: 'Orta ölçekli işletmeler için tam özellikli çözüm',
      price: 999,
      billingCycle: 'monthly',
      features: [
        'Tüm modüller',
        'Sınırsız fatura',
        'Gelişmiş analizler',
        '7/24 destek',
        'Özel entegrasyonlar',
        'Veri yedekleme',
      ],
      limits: {
        users: 50,
        storage: 50,
        projects: 50,
        apiCalls: 50000,
      },
      modules: ['inventory', 'invoicing', 'crm', 'reports', 'hr', 'finance'],
      isActive: true,
      isPopular: false,
      discount: 15,
      subscriberCount: 45,
      revenue: 44955,
      color: '#667eea',
      icon: <CrownOutlined />,
    },
    {
      id: '4',
      name: 'enterprise',
      displayName: 'Kurumsal',
      description: 'Büyük ölçekli işletmeler için özelleştirilebilir kurumsal çözüm',
      price: 2499,
      billingCycle: 'monthly',
      features: [
        'Sınırsız kullanıcı',
        'Sınırsız depolama',
        'Özel modüller',
        'Özel sunucu',
        'SLA garantisi',
        'Özel eğitim',
        'Danışmanlık hizmeti',
      ],
      limits: {
        users: -1,
        storage: -1,
        projects: -1,
        apiCalls: -1,
      },
      modules: ['all'],
      isActive: true,
      isPopular: false,
      discount: 0,
      subscriberCount: 12,
      revenue: 29988,
      color: '#faad14',
      icon: <TrophyOutlined />,
    },
  ];

  const totalRevenue = packages.reduce((sum, pkg) => sum + pkg.revenue, 0);
  const totalSubscribers = packages.reduce((sum, pkg) => sum + pkg.subscriberCount, 0);

  // Package Card Component
  const PackageCard = ({ pkg }: { pkg: Package }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        className={`package-card ${pkg.isPopular ? 'popular' : ''}`}
        style={{ borderTop: `4px solid ${pkg.color}` }}
        actions={[
          <Tooltip title="Düzenle" key="edit">
            <EditOutlined onClick={() => handleEdit(pkg)} />
          </Tooltip>,
          <Tooltip title="Kopyala" key="copy">
            <CopyOutlined onClick={() => handleDuplicate(pkg)} />
          </Tooltip>,
          <Tooltip title="Detaylar" key="view">
            <EyeOutlined onClick={() => handleView(pkg)} />
          </Tooltip>,
          <Dropdown
            key="more"
            menu={{
              items: [
                {
                  key: 'activate',
                  label: pkg.isActive ? 'Deaktif Et' : 'Aktif Et',
                  icon: pkg.isActive ? <LockOutlined /> : <UnlockOutlined />,
                  onClick: () => handleToggleStatus(pkg),
                },
                {
                  key: 'delete',
                  label: 'Sil',
                  icon: <DeleteOutlined />,
                  danger: true,
                  onClick: () => handleDelete(pkg),
                },
              ],
            }}
          >
            <MoreOutlined />
          </Dropdown>,
        ]}
      >
        {pkg.isPopular && (
          <div className="popular-badge">
            <FireOutlined /> En Popüler
          </div>
        )}
        {pkg.discount > 0 && (
          <div className="discount-badge">
            -{pkg.discount}%
          </div>
        )}
        
        <div className="package-header">
          <div className="package-icon" style={{ background: `${pkg.color}20`, color: pkg.color }}>
            {pkg.icon}
          </div>
          <Title level={4} style={{ margin: 0 }}>{pkg.displayName}</Title>
          <Paragraph type="secondary" style={{ marginBottom: 0 }}>
            {pkg.description}
          </Paragraph>
        </div>

        <div className="package-price">
          <Text type="secondary" style={{ textDecoration: pkg.discount > 0 ? 'line-through' : 'none' }}>
            {pkg.discount > 0 && `₺${pkg.price}`}
          </Text>
          <div className="price-display">
            <span className="currency">₺</span>
            <span className="amount">
              {pkg.discount > 0 
                ? Math.floor(pkg.price * (1 - pkg.discount / 100))
                : pkg.price}
            </span>
            <span className="period">/ay</span>
          </div>
        </div>

        <Divider />

        <div className="package-features">
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            {pkg.features.slice(0, 4).map((feature, index) => (
              <div key={index} className="feature-item">
                <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                <Text>{feature}</Text>
              </div>
            ))}
            {pkg.features.length > 4 && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                +{pkg.features.length - 4} daha fazla özellik
              </Text>
            )}
          </Space>
        </div>

        <Divider />

        <div className="package-limits">
          <Row gutter={[8, 8]}>
            <Col span={12}>
              <Statistic
                title={<span style={{ fontSize: 11 }}>Kullanıcı</span>}
                value={pkg.limits.users === -1 ? '∞' : pkg.limits.users}
                prefix={<UserOutlined style={{ fontSize: 14 }} />}
                valueStyle={{ fontSize: 16 }}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title={<span style={{ fontSize: 11 }}>Depolama</span>}
                value={pkg.limits.storage === -1 ? '∞' : pkg.limits.storage}
                suffix={pkg.limits.storage !== -1 ? 'GB' : ''}
                prefix={<DatabaseOutlined style={{ fontSize: 14 }} />}
                valueStyle={{ fontSize: 16 }}
              />
            </Col>
          </Row>
        </div>

        <Divider />

        <div className="package-stats">
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text type="secondary">Abone Sayısı</Text>
              <Badge count={pkg.subscriberCount} showZero color={pkg.color} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text type="secondary">Aylık Gelir</Text>
              <Text strong style={{ color: '#52c41a' }}>₺{pkg.revenue.toLocaleString()}</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text type="secondary">Durum</Text>
              <Tag color={pkg.isActive ? 'success' : 'error'}>
                {pkg.isActive ? 'Aktif' : 'Pasif'}
              </Tag>
            </div>
          </Space>
        </div>
      </Card>
    </motion.div>
  );

  const handleEdit = (pkg: Package) => {
    setSelectedPackage(pkg);
    form.setFieldsValue(pkg);
    setModalVisible(true);
  };

  const handleDuplicate = (pkg: Package) => {
    message.success(`${pkg.displayName} paketi kopyalandı`);
  };

  const handleView = (pkg: Package) => {
    Modal.info({
      title: `${pkg.displayName} Paket Detayları`,
      width: 600,
      content: (
        <div>
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Paket Adı">{pkg.name}</Descriptions.Item>
            <Descriptions.Item label="Görünen Ad">{pkg.displayName}</Descriptions.Item>
            <Descriptions.Item label="Açıklama">{pkg.description}</Descriptions.Item>
            <Descriptions.Item label="Fiyat">₺{pkg.price}/ay</Descriptions.Item>
            <Descriptions.Item label="İndirim">%{pkg.discount}</Descriptions.Item>
            <Descriptions.Item label="Abone Sayısı">{pkg.subscriberCount}</Descriptions.Item>
            <Descriptions.Item label="Aylık Gelir">₺{pkg.revenue}</Descriptions.Item>
            <Descriptions.Item label="Durum">
              <Tag color={pkg.isActive ? 'success' : 'error'}>
                {pkg.isActive ? 'Aktif' : 'Pasif'}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
          
          <Title level={5} style={{ marginTop: 16 }}>Özellikler</Title>
          <List
            dataSource={pkg.features}
            renderItem={(item) => (
              <List.Item>
                <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                {item}
              </List.Item>
            )}
          />
          
          <Title level={5} style={{ marginTop: 16 }}>Limitler</Title>
          <Space wrap>
            <Tag icon={<UserOutlined />}>
              {pkg.limits.users === -1 ? 'Sınırsız' : pkg.limits.users} Kullanıcı
            </Tag>
            <Tag icon={<DatabaseOutlined />}>
              {pkg.limits.storage === -1 ? 'Sınırsız' : `${pkg.limits.storage} GB`} Depolama
            </Tag>
            <Tag icon={<AppstoreOutlined />}>
              {pkg.limits.projects === -1 ? 'Sınırsız' : pkg.limits.projects} Proje
            </Tag>
            <Tag icon={<ApiOutlined />}>
              {pkg.limits.apiCalls === -1 ? 'Sınırsız' : pkg.limits.apiCalls} API Çağrısı
            </Tag>
          </Space>
        </div>
      ),
    });
  };

  const handleToggleStatus = (pkg: Package) => {
    message.success(`${pkg.displayName} paketi ${pkg.isActive ? 'deaktif' : 'aktif'} edildi`);
  };

  const handleDelete = (pkg: Package) => {
    Modal.confirm({
      title: 'Paketi Sil',
      content: `${pkg.displayName} paketini silmek istediğinizden emin misiniz?`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: () => {
        message.success('Paket silindi');
      },
    });
  };

  const columns = [
    {
      title: 'Paket',
      key: 'package',
      render: (_: any, record: Package) => (
        <Space>
          <div className="package-icon-small" style={{ background: `${record.color}20`, color: record.color }}>
            {record.icon}
          </div>
          <div>
            <Text strong>{record.displayName}</Text>
            {record.isPopular && (
              <Tag color="orange" style={{ marginLeft: 8 }}>
                <FireOutlined /> Popüler
              </Tag>
            )}
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>{record.name}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Fiyat',
      key: 'price',
      render: (_: any, record: Package) => (
        <div>
          {record.discount > 0 && (
            <Text delete type="secondary" style={{ fontSize: 12 }}>
              ₺{record.price}
            </Text>
          )}
          <Text strong style={{ fontSize: 16 }}>
            ₺{record.discount > 0 
              ? Math.floor(record.price * (1 - record.discount / 100))
              : record.price}
          </Text>
          <Text type="secondary">/ay</Text>
          {record.discount > 0 && (
            <Tag color="red" style={{ marginLeft: 8 }}>-%{record.discount}</Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Limitler',
      key: 'limits',
      render: (_: any, record: Package) => (
        <Space wrap>
          <Tag>{record.limits.users === -1 ? '∞' : record.limits.users} kullanıcı</Tag>
          <Tag>{record.limits.storage === -1 ? '∞' : `${record.limits.storage}GB`}</Tag>
        </Space>
      ),
    },
    {
      title: 'Aboneler',
      dataIndex: 'subscriberCount',
      key: 'subscriberCount',
      render: (count: number) => (
        <Badge count={count} showZero style={{ backgroundColor: '#52c41a' }} />
      ),
    },
    {
      title: 'Gelir',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (revenue: number) => (
        <Text strong style={{ color: '#52c41a' }}>
          ₺{revenue.toLocaleString()}
        </Text>
      ),
    },
    {
      title: 'Durum',
      key: 'status',
      render: (_: any, record: Package) => (
        <Tag color={record.isActive ? 'success' : 'error'}>
          {record.isActive ? 'Aktif' : 'Pasif'}
        </Tag>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_: any, record: Package) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button type="link" icon={<CopyOutlined />} onClick={() => handleDuplicate(record)} />
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleView(record)} />
          <Dropdown
            menu={{
              items: [
                {
                  key: 'activate',
                  label: record.isActive ? 'Deaktif Et' : 'Aktif Et',
                  icon: record.isActive ? <LockOutlined /> : <UnlockOutlined />,
                  onClick: () => handleToggleStatus(record),
                },
                {
                  key: 'delete',
                  label: 'Sil',
                  icon: <DeleteOutlined />,
                  danger: true,
                  onClick: () => handleDelete(record),
                },
              ],
            }}
          >
            <Button type="link" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <div className="master-packages">
      {/* Page Header */}
      <div className="packages-header">
        <div className="header-content">
          <div>
            <Title level={2} style={{ margin: 0 }}>
              <AppstoreOutlined /> Paket Yönetimi
            </Title>
            <Text type="secondary">Abonelik paketlerini yönetin ve fiyatlandırın</Text>
          </div>
          <Space>
            <Segmented
              value={viewMode}
              onChange={(value) => setViewMode(value as 'grid' | 'table')}
              options={[
                { label: 'Grid', value: 'grid', icon: <AppstoreOutlined /> },
                { label: 'Tablo', value: 'table', icon: <UnorderedListOutlined /> },
              ]}
            />
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => {
                setSelectedPackage(null);
                form.resetFields();
                setModalVisible(true);
              }}
            >
              Yeni Paket
            </Button>
          </Space>
        </div>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={8}>
          <Card className="stat-card">
            <Statistic
              title="Toplam Paket"
              value={packages.length}
              prefix={<AppstoreOutlined />}
              valueStyle={{ color: '#667eea' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="stat-card">
            <Statistic
              title="Toplam Abone"
              value={totalSubscribers}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="stat-card">
            <Statistic
              title="Toplam Gelir"
              value={totalRevenue}
              prefix="₺"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Packages Grid/Table */}
      {viewMode === 'grid' ? (
        <Row gutter={[16, 16]} className="packages-grid">
          {packages.map((pkg) => (
            <Col key={pkg.id} xs={24} sm={12} lg={6}>
              <PackageCard pkg={pkg} />
            </Col>
          ))}
        </Row>
      ) : (
        <Card className="packages-table">
          <Table
            columns={columns}
            dataSource={packages}
            rowKey="id"
            pagination={false}
          />
        </Card>
      )}

      {/* Edit/Create Modal */}
      <Modal
        title={selectedPackage ? 'Paketi Düzenle' : 'Yeni Paket'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={800}
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            İptal
          </Button>,
          <Button key="save" type="primary" onClick={() => {
            form.validateFields().then((values) => {
              console.log('Package saved:', values);
              message.success('Paket kaydedildi');
              setModalVisible(false);
            });
          }}>
            Kaydet
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="Paket Kodu" rules={[{ required: true }]}>
                <Input placeholder="free, starter, professional" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="displayName" label="Görünen Ad" rules={[{ required: true }]}>
                <Input placeholder="Ücretsiz, Başlangıç, Profesyonel" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item name="description" label="Açıklama">
            <TextArea rows={2} placeholder="Paket açıklaması" />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="price" label="Fiyat (₺)" rules={[{ required: true }]}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="billingCycle" label="Faturalandırma" rules={[{ required: true }]}>
                <Select>
                  <Select.Option value="monthly">Aylık</Select.Option>
                  <Select.Option value="yearly">Yıllık</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="discount" label="İndirim (%)">
                <InputNumber min={0} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          
          <Divider>Limitler</Divider>
          
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name={['limits', 'users']} label="Kullanıcı Sayısı">
                <InputNumber min={-1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name={['limits', 'storage']} label="Depolama (GB)">
                <InputNumber min={-1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name={['limits', 'projects']} label="Proje Sayısı">
                <InputNumber min={-1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name={['limits', 'apiCalls']} label="API Çağrısı">
                <InputNumber min={-1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item name="features" label="Özellikler">
            <Select mode="tags" placeholder="Özellik ekleyin" />
          </Form.Item>
          
          <Form.Item name="modules" label="Modüller">
            <Checkbox.Group>
              <Row>
                <Col span={8}><Checkbox value="inventory">Stok Yönetimi</Checkbox></Col>
                <Col span={8}><Checkbox value="invoicing">Faturalama</Checkbox></Col>
                <Col span={8}><Checkbox value="crm">CRM</Checkbox></Col>
                <Col span={8}><Checkbox value="reports">Raporlama</Checkbox></Col>
                <Col span={8}><Checkbox value="hr">İnsan Kaynakları</Checkbox></Col>
                <Col span={8}><Checkbox value="finance">Finans</Checkbox></Col>
              </Row>
            </Checkbox.Group>
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="isActive" valuePropName="checked" label="Durum">
                <Switch checkedChildren="Aktif" unCheckedChildren="Pasif" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="isPopular" valuePropName="checked" label="Popüler">
                <Switch checkedChildren="Evet" unCheckedChildren="Hayır" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};