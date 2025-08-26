import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Row,
  Col,
  Card,
  Button,
  Space,
  Tag,
  Typography,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Divider,
  Badge,
  Tooltip,
  Table,
  Segmented,
  message,
  Popconfirm,
  Checkbox,
  List,
  Avatar,
  Progress,
  Statistic,
  Timeline,
  Alert,
  Tabs,
} from 'antd';
import {
  CrownOutlined,
  RocketOutlined,
  ThunderboltOutlined,
  UserOutlined,
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  DollarOutlined,
  GiftOutlined,
  StarFilled,
  FireOutlined,
  SafetyOutlined,
  CloudServerOutlined,
  ApiOutlined,
  DatabaseOutlined,
  MailOutlined,
  CustomerServiceOutlined,
  TeamOutlined,
  AppstoreOutlined,
  BarsOutlined,
  CopyOutlined,
  EyeOutlined,
  SettingOutlined,
  InfoCircleOutlined,
  ExportOutlined,
  ImportOutlined,
  ReloadOutlined,
  HeartFilled,
  TrophyOutlined,
  BulbOutlined,
  ExperimentOutlined,
} from '@ant-design/icons';
import CountUp from 'react-countup';
import '../../styles/master-inputs.css';
import '../../styles/master-layout.css';
import { packagesApi, CreatePackageRequest, UpdatePackageRequest, PackageFeatureDto, PackageModuleDto } from '@/shared/api/packages.api';
import { useEffect } from 'react';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

// Types
interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  discountedPrice?: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  popular?: boolean;
  recommended?: boolean;
  new?: boolean;
  maxUsers: number;
  maxStorage: number;
  features: string[];
  modules: string[];
  support: string;
  apiCalls: number;
  customDomain: boolean;
  whiteLabel: boolean;
  priority: number;
  color: string;
  icon: React.ReactNode;
  gradient: string;
  subscriberCount: number;
  revenue: number;
  growth: number;
  status: 'active' | 'inactive' | 'deprecated';
  createdAt: string;
  updatedAt: string;
}

interface Feature {
  id: string;
  name: string;
  description: string;
  category: string;
  packages: string[];
}

export const MasterPackagesPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [loading, setLoading] = useState(false);
  const [packages, setPackages] = useState<Package[]>([]);
  const [form] = Form.useForm();
  const [featureForm] = Form.useForm();

  // Fetch packages from API
  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const response = await packagesApi.getAll({ isActive: true });
      
      if (response.data && response.data.success && response.data.data) {
        const mappedPackages = response.data.data.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description || 'Açıklama yok',
          price: p.basePrice?.amount || 0,
          discountedPrice: p.discountedPrice,
          currency: p.basePrice?.currency || p.currency || 'TRY',
          billingCycle: p.billingCycle?.toLowerCase() || 'monthly',
          popular: p.isPopular || false,
          recommended: false,
          new: false,
          maxUsers: p.maxUsers || 0,
          maxStorage: p.maxStorage || 0,
          features: p.features?.map((f: PackageFeatureDto) => f.featureName) || [],
          modules: p.modules?.map((m: PackageModuleDto) => m.moduleName) || [],
          support: 'E-posta',
          apiCalls: 10000,
          customDomain: p.basePrice?.amount > 100,
          whiteLabel: p.basePrice?.amount > 500,
          priority: p.displayOrder || 1,
          color: getPackageColor(p.name),
          icon: getPackageIcon(p.name),
          gradient: getPackageGradient(p.name),
          subscriberCount: Math.floor(Math.random() * 1000),
          revenue: (p.basePrice?.amount || 0) * Math.floor(Math.random() * 100),
          growth: Math.floor(Math.random() * 40) - 10,
          status: p.isActive ? 'active' : 'inactive',
          createdAt: p.createdAt || new Date().toISOString(),
          updatedAt: p.modifiedAt || new Date().toISOString()
        }));
        
        setPackages(mappedPackages);
      } else {
        // Use mock data as fallback
        setPackages(mockPackages);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
      message.error('Paket listesi yüklenirken hata oluştu');
      // Use mock data as fallback
      setPackages(mockPackages);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for package styling
  const getPackageColor = (name: string) => {
    const colors: any = {
      'Free': '#8c8c8c',
      'Starter': '#52c41a',
      'Professional': '#1890ff',
      'Enterprise': '#722ed1'
    };
    return colors[name] || '#1890ff';
  };

  const getPackageIcon = (name: string) => {
    const icons: any = {
      'Free': <UserOutlined />,
      'Starter': <RocketOutlined />,
      'Professional': <ThunderboltOutlined />,
      'Enterprise': <CrownOutlined />
    };
    return icons[name] || <AppstoreOutlined />;
  };

  const getPackageGradient = (name: string) => {
    const gradients: any = {
      'Free': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'Starter': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'Professional': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'Enterprise': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    };
    return gradients[name] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  };

  // Mock packages data
  const mockPackages: Package[] = [
    {
      id: '1',
      name: 'Free',
      description: 'Küçük işletmeler için mükemmel başlangıç',
      price: 0,
      currency: '₺',
      billingCycle: 'monthly',
      maxUsers: 5,
      maxStorage: 5,
      features: [
        'Temel CRM özellikleri',
        'E-posta desteği',
        '5 GB depolama',
        'Temel raporlama',
        'Mobil uygulama',
      ],
      modules: ['CRM'],
      support: 'E-posta',
      apiCalls: 1000,
      customDomain: false,
      whiteLabel: false,
      priority: 1,
      color: '#8c8c8c',
      icon: <UserOutlined />,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      subscriberCount: 150,
      revenue: 0,
      growth: 25,
      status: 'active',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    {
      id: '2',
      name: 'Starter',
      description: 'Büyüyen işletmeler için ideal',
      price: 299,
      discountedPrice: 249,
      currency: '₺',
      billingCycle: 'monthly',
      new: true,
      maxUsers: 25,
      maxStorage: 25,
      features: [
        'Tüm Free özellikleri',
        'Gelişmiş CRM',
        'Sales modülü',
        '25 GB depolama',
        'Özel raporlar',
        'Öncelikli e-posta desteği',
        'API erişimi',
      ],
      modules: ['CRM', 'Sales'],
      support: 'E-posta + Telefon',
      apiCalls: 10000,
      customDomain: false,
      whiteLabel: false,
      priority: 2,
      color: '#52c41a',
      icon: <RocketOutlined />,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      subscriberCount: 89,
      revenue: 22211,
      growth: 15,
      status: 'active',
      createdAt: '2024-01-01',
      updatedAt: '2024-03-01',
    },
    {
      id: '3',
      name: 'Professional',
      description: 'Profesyonel ekipler için güçlü özellikler',
      price: 599,
      currency: '₺',
      billingCycle: 'monthly',
      popular: true,
      recommended: true,
      maxUsers: 100,
      maxStorage: 100,
      features: [
        'Tüm Starter özellikleri',
        'Finance modülü',
        'HR modülü',
        '100 GB depolama',
        'Gelişmiş analitik',
        '7/24 telefon desteği',
        'Özel domain',
        'Webhook entegrasyonları',
        'Bulk işlemler',
      ],
      modules: ['CRM', 'Sales', 'Finance', 'HR'],
      support: '7/24 Telefon + Chat',
      apiCalls: 50000,
      customDomain: true,
      whiteLabel: false,
      priority: 3,
      color: '#1890ff',
      icon: <ThunderboltOutlined />,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      subscriberCount: 156,
      revenue: 93444,
      growth: 32,
      status: 'active',
      createdAt: '2024-01-01',
      updatedAt: '2024-02-15',
    },
    {
      id: '4',
      name: 'Enterprise',
      description: 'Büyük organizasyonlar için sınırsız güç',
      price: 1299,
      discountedPrice: 999,
      currency: '₺',
      billingCycle: 'monthly',
      maxUsers: 999999,
      maxStorage: 999999,
      features: [
        'Tüm Professional özellikleri',
        'Production modülü',
        'Inventory modülü',
        'Sınırsız depolama',
        'Özel geliştirme',
        'Dedike destek',
        'White-label',
        'SLA garantisi',
        'Özel eğitim',
        'Veri yedekleme',
      ],
      modules: ['CRM', 'Sales', 'Finance', 'HR', 'Production', 'Inventory'],
      support: 'Dedike Account Manager',
      apiCalls: 999999,
      customDomain: true,
      whiteLabel: true,
      priority: 4,
      color: '#722ed1',
      icon: <CrownOutlined />,
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      subscriberCount: 45,
      revenue: 44955,
      growth: 18,
      status: 'active',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-20',
    },
  ];

  // Remove this line as packages state is already defined above

  // Mock features data
  const mockFeatures: Feature[] = [
    { id: '1', name: 'CRM Modülü', description: 'Müşteri ilişkileri yönetimi', category: 'Modüller', packages: ['Free', 'Starter', 'Professional', 'Enterprise'] },
    { id: '2', name: 'Sales Modülü', description: 'Satış yönetimi', category: 'Modüller', packages: ['Starter', 'Professional', 'Enterprise'] },
    { id: '3', name: 'Finance Modülü', description: 'Finansal yönetim', category: 'Modüller', packages: ['Professional', 'Enterprise'] },
    { id: '4', name: 'API Erişimi', description: 'REST API erişimi', category: 'Entegrasyon', packages: ['Starter', 'Professional', 'Enterprise'] },
    { id: '5', name: 'Özel Domain', description: 'Kendi domain adresiniz', category: 'Özelleştirme', packages: ['Professional', 'Enterprise'] },
    { id: '6', name: 'White Label', description: 'Marka özelleştirme', category: 'Özelleştirme', packages: ['Enterprise'] },
  ];

  const [features, setFeatures] = useState<Feature[]>(mockFeatures);

  // Stats
  const stats = [
    {
      title: 'Toplam Paket',
      value: packages.length,
      icon: <GiftOutlined />,
      color: '#1890ff',
      suffix: '',
    },
    {
      title: 'Aktif Abonelik',
      value: packages.reduce((sum, p) => sum + p.subscriberCount, 0),
      icon: <TeamOutlined />,
      color: '#52c41a',
      suffix: '',
    },
    {
      title: 'Aylık Gelir',
      value: packages.reduce((sum, p) => sum + p.revenue, 0),
      icon: <DollarOutlined />,
      color: '#fa8c16',
      prefix: '₺',
    },
    {
      title: 'Ortalama Büyüme',
      value: Math.round(packages.reduce((sum, p) => sum + p.growth, 0) / packages.length),
      icon: <FireOutlined />,
      color: '#722ed1',
      suffix: '%',
    },
  ];

  // Package Card Component
  const PackageCard: React.FC<{ pkg: Package }> = ({ pkg }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={`package-card ${pkg.popular ? 'popular' : ''}`}
        style={{
          background: `linear-gradient(135deg, white 0%, ${pkg.color}05 100%)`,
          borderTop: `4px solid ${pkg.color}`,
          height: '100%',
          minHeight: '450px',
        }}
      >
        {/* Badges */}
        {(pkg.popular || pkg.recommended || pkg.new) && (
          <div className="package-badges">
            {pkg.popular && (
              <Badge.Ribbon text="Popüler" color="red">
                <div />
              </Badge.Ribbon>
            )}
            {pkg.recommended && (
              <Tag color="green" icon={<StarFilled />}>
                Önerilen
              </Tag>
            )}
            {pkg.new && (
              <Tag color="blue" icon={<FireOutlined />}>
                Yeni
              </Tag>
            )}
          </div>
        )}

        {/* Header */}
        <div className="package-header">
          <Avatar
            size={64}
            style={{
              background: pkg.gradient,
              border: `3px solid ${pkg.color}20`,
            }}
          >
            {pkg.icon}
          </Avatar>
          <Title level={3} style={{ color: pkg.color, marginTop: 16 }}>
            {pkg.name}
          </Title>
          <Paragraph type="secondary">{pkg.description}</Paragraph>
        </div>

        {/* Pricing */}
        <div className="package-pricing">
          {pkg.discountedPrice ? (
            <>
              <Text delete style={{ fontSize: 20, color: '#8c8c8c' }}>
                {pkg.currency}{pkg.price}
              </Text>
              <Title level={2} style={{ color: pkg.color, margin: '0 8px' }}>
                {pkg.currency}{pkg.discountedPrice}
              </Title>
            </>
          ) : (
            <Title level={2} style={{ color: pkg.color }}>
              {pkg.price === 0 ? 'Ücretsiz' : `${pkg.currency}${pkg.price}`}
            </Title>
          )}
          {pkg.price > 0 && (
            <Text type="secondary">
              / {billingCycle === 'monthly' ? 'aylık' : 'yıllık'}
            </Text>
          )}
        </div>

        <Divider />

        {/* Features */}
        <div className="package-features">
          <List
            size="small"
            dataSource={pkg.features}
            renderItem={(feature) => (
              <List.Item style={{ border: 'none', padding: '4px 0' }}>
                <Space>
                  <CheckOutlined style={{ color: '#52c41a' }} />
                  <Text>{feature}</Text>
                </Space>
              </List.Item>
            )}
          />
        </div>

        <Divider />

        {/* Limits */}
        <div className="package-limits">
          <Row gutter={[8, 8]}>
            <Col span={12}>
              <div className="limit-item">
                <UserOutlined style={{ color: pkg.color }} />
                <Text strong>
                  {pkg.maxUsers === 999999 ? 'Sınırsız' : pkg.maxUsers}
                </Text>
                <Text type="secondary">Kullanıcı</Text>
              </div>
            </Col>
            <Col span={12}>
              <div className="limit-item">
                <DatabaseOutlined style={{ color: pkg.color }} />
                <Text strong>
                  {pkg.maxStorage === 999999 ? 'Sınırsız' : `${pkg.maxStorage}GB`}
                </Text>
                <Text type="secondary">Depolama</Text>
              </div>
            </Col>
            <Col span={12}>
              <div className="limit-item">
                <ApiOutlined style={{ color: pkg.color }} />
                <Text strong>
                  {pkg.apiCalls === 999999 ? 'Sınırsız' : `${pkg.apiCalls / 1000}K`}
                </Text>
                <Text type="secondary">API Çağrı</Text>
              </div>
            </Col>
            <Col span={12}>
              <div className="limit-item">
                <CustomerServiceOutlined style={{ color: pkg.color }} />
                <Text strong>{pkg.support.split(' ')[0]}</Text>
                <Text type="secondary">Destek</Text>
              </div>
            </Col>
          </Row>
        </div>

        <Divider />

        {/* Stats */}
        <div className="package-stats">
          <Row gutter={[8, 8]}>
            <Col span={8}>
              <Statistic
                value={pkg.subscriberCount}
                valueStyle={{ fontSize: 16, color: pkg.color }}
                prefix={<TeamOutlined />}
                title="Abone"
              />
            </Col>
            <Col span={8}>
              <Statistic
                value={pkg.revenue}
                valueStyle={{ fontSize: 16, color: '#52c41a' }}
                prefix="₺"
                title="Gelir"
              />
            </Col>
            <Col span={8}>
              <Statistic
                value={pkg.growth}
                valueStyle={{
                  fontSize: 16,
                  color: pkg.growth > 0 ? '#52c41a' : '#ff4d4f',
                }}
                suffix="%"
                prefix={pkg.growth > 0 ? '+' : ''}
                title="Büyüme"
              />
            </Col>
          </Row>
        </div>

        {/* Actions */}
        <div className="package-actions">
          <Button
            type="primary"
            block
            size="large"
            style={{
              background: pkg.gradient,
              border: 'none',
              height: 48,
            }}
            onClick={() => handleEdit(pkg)}
          >
            Düzenle
          </Button>
          <Space style={{ marginTop: 12, width: '100%' }}>
            <Button
              block
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(pkg)}
            >
              Detaylar
            </Button>
            <Button
              block
              icon={<CopyOutlined />}
              onClick={() => handleDuplicate(pkg)}
            >
              Kopyala
            </Button>
            <Popconfirm
              title="Bu paketi silmek istediğinizden emin misiniz?"
              onConfirm={() => handleDelete(pkg.id)}
              okText="Sil"
              cancelText="İptal"
            >
              <Button block danger icon={<DeleteOutlined />}>
                Sil
              </Button>
            </Popconfirm>
          </Space>
        </div>
      </Card>
    </motion.div>
  );

  // Table columns
  const columns = [
    {
      title: 'Paket',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Package) => (
        <Space>
          <Avatar style={{ background: record.gradient }}>
            {record.icon}
          </Avatar>
          <div>
            <Text strong>{text}</Text>
            {record.popular && <Tag color="red">Popüler</Tag>}
            {record.new && <Tag color="blue">Yeni</Tag>}
          </div>
        </Space>
      ),
    },
    {
      title: 'Fiyat',
      key: 'price',
      render: (record: Package) => (
        <div>
          {record.discountedPrice ? (
            <>
              <Text delete>{record.currency}{record.price}</Text>
              <Text strong style={{ marginLeft: 8, color: record.color }}>
                {record.currency}{record.discountedPrice}
              </Text>
            </>
          ) : (
            <Text strong style={{ color: record.color }}>
              {record.price === 0 ? 'Ücretsiz' : `${record.currency}${record.price}`}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: 'Limitler',
      key: 'limits',
      render: (record: Package) => (
        <Space direction="vertical" size={0}>
          <Text>{record.maxUsers === 999999 ? 'Sınırsız' : record.maxUsers} kullanıcı</Text>
          <Text>{record.maxStorage === 999999 ? 'Sınırsız' : `${record.maxStorage}GB`} depolama</Text>
        </Space>
      ),
    },
    {
      title: 'Aboneler',
      dataIndex: 'subscriberCount',
      key: 'subscriberCount',
      render: (count: number) => (
        <Badge count={count} style={{ backgroundColor: '#52c41a' }} />
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
      title: 'Büyüme',
      dataIndex: 'growth',
      key: 'growth',
      render: (growth: number) => (
        <Tag color={growth > 0 ? 'success' : 'error'}>
          {growth > 0 ? '+' : ''}{growth}%
        </Tag>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'success' : 'default'}>
          {status === 'active' ? 'Aktif' : 'Pasif'}
        </Tag>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (record: Package) => (
        <Space>
          <Tooltip title="Düzenle">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Kopyala">
            <Button
              type="text"
              size="small"
              icon={<CopyOutlined />}
              onClick={() => handleDuplicate(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Bu paketi silmek istediğinizden emin misiniz?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Tooltip title="Sil">
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Handlers
  const handleEdit = (pkg: Package) => {
    setSelectedPackage(pkg);
    form.setFieldsValue({
      ...pkg,
      billingCycle: pkg.billingCycle,
      isActive: pkg.status === 'active'
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await packagesApi.delete(id);
      setPackages(packages.filter((p) => p.id !== id));
      message.success('Paket silindi');
    } catch (error) {
      message.error('Paket silinirken hata oluştu');
    }
  };

  const handleDuplicate = (pkg: Package) => {
    const newPackage = {
      ...pkg,
      id: Date.now().toString(),
      name: `${pkg.name} (Kopya)`,
      createdAt: new Date().toISOString(),
    };
    setPackages([...packages, newPackage]);
    message.success('Paket kopyalandı');
  };

  const handleViewDetails = (pkg: Package) => {
    Modal.info({
      title: `${pkg.name} Paket Detayları`,
      width: 600,
      content: (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Divider />
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Fiyat" span={2}>
              {pkg.currency}{pkg.discountedPrice || pkg.price} / {pkg.billingCycle === 'monthly' ? 'aylık' : 'yıllık'}
            </Descriptions.Item>
            <Descriptions.Item label="Max Kullanıcı">
              {pkg.maxUsers === 999999 ? 'Sınırsız' : pkg.maxUsers}
            </Descriptions.Item>
            <Descriptions.Item label="Max Depolama">
              {pkg.maxStorage === 999999 ? 'Sınırsız' : `${pkg.maxStorage}GB`}
            </Descriptions.Item>
            <Descriptions.Item label="API Çağrı">
              {pkg.apiCalls === 999999 ? 'Sınırsız' : pkg.apiCalls}
            </Descriptions.Item>
            <Descriptions.Item label="Destek">
              {pkg.support}
            </Descriptions.Item>
            <Descriptions.Item label="Modüller" span={2}>
              <Space wrap>
                {pkg.modules.map((module) => (
                  <Tag key={module} color="blue">{module}</Tag>
                ))}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Özellikler" span={2}>
              <List
                size="small"
                dataSource={pkg.features}
                renderItem={(feature) => (
                  <List.Item style={{ padding: '4px 0' }}>
                    <CheckOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                    {feature}
                  </List.Item>
                )}
              />
            </Descriptions.Item>
          </Descriptions>
        </Space>
      ),
    });
  };

  const handleCreatePackage = async (values: any) => {
    setLoading(true);
    try {
      // Prepare features and modules
      const features: PackageFeatureDto[] = (values.features || []).map((f: string) => ({
        featureCode: f.toLowerCase().replace(/\s+/g, '_'),
        featureName: f,
        isEnabled: true
      }));
      
      const modules: PackageModuleDto[] = (values.modules || []).map((m: string) => ({
        moduleCode: m.toLowerCase(),
        moduleName: m,
        isIncluded: true
      }));
      
      if (selectedPackage) {
        // Update existing package
        const updateRequest: UpdatePackageRequest = {
          id: selectedPackage.id,
          name: values.name,
          description: values.description,
          basePrice: values.price,
          billingCycle: values.billingCycle === 'monthly' ? 'Monthly' : 'Yearly',
          maxUsers: values.maxUsers,
          maxStorage: values.maxStorage,
          isActive: values.isActive !== undefined ? values.isActive : true
        };
        await packagesApi.update(selectedPackage.id, updateRequest);
        message.success('Paket güncellendi');
      } else {
        // Create new package
        const createRequest: CreatePackageRequest = {
          name: values.name,
          description: values.description,
          basePrice: values.price,
          billingCycle: values.billingCycle === 'monthly' ? 'Monthly' : 'Yearly',
          maxUsers: values.maxUsers,
          maxStorage: values.maxStorage,
          isActive: true,
          features,
          modules
        };
        await packagesApi.create(createRequest);
        message.success('Paket oluşturuldu');
      }
      
      // Refresh packages list
      await fetchPackages();
      
      setShowCreateModal(false);
      setSelectedPackage(null);
      form.resetFields();
    } catch (error) {
      message.error(selectedPackage ? 'Paket güncellenirken hata oluştu' : 'Paket oluşturulurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFeature = (values: any) => {
    const newFeature: Feature = {
      ...values,
      id: Date.now().toString(),
    };
    setFeatures([...features, newFeature]);
    message.success('Özellik eklendi');
    setShowFeatureModal(false);
    featureForm.resetFields();
  };

  return (
    <div className="master-packages-page">
      {/* Header */}
      <div className="page-header glass-morphism">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="header-content"
        >
          <Title level={2} className="gradient-text">
            <GiftOutlined /> Paket Yönetimi
          </Title>
          <Text type="secondary">Abonelik paketlerini yönetin ve fiyatlandırın</Text>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="header-actions"
        >
          <Space>
            <Button icon={<PlusOutlined />} onClick={() => setShowFeatureModal(true)}>
              Özellik Ekle
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setShowCreateModal(true)}
              className="gradient-button"
            >
              Yeni Paket
            </Button>
          </Space>
        </motion.div>
      </div>

      {/* Stats */}
      <Row gutter={[20, 20]} className="stats-row">
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} md={12} lg={6} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="stat-card glass-morphism">
                <Statistic
                  title={stat.title}
                  value={stat.value}
                  prefix={
                    <>
                      {stat.prefix}
                      <span className="stat-icon" style={{ color: stat.color }}>
                        {stat.icon}
                      </span>
                    </>
                  }
                  suffix={stat.suffix}
                  valueStyle={{ color: stat.color }}
                />
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      {/* Controls */}
      <Card className="controls-card glass-morphism">
        <Row align="middle" justify="space-between">
          <Col>
            <Segmented
              value={billingCycle}
              onChange={(value) => setBillingCycle(value as 'monthly' | 'yearly')}
              options={[
                { label: 'Aylık', value: 'monthly' },
                { label: 'Yıllık', value: 'yearly', icon: <Tag color="green">-20%</Tag> },
              ]}
            />
          </Col>
          <Col>
            <Space>
              <Segmented
                value={viewMode}
                onChange={(value) => setViewMode(value as 'grid' | 'table')}
                options={[
                  { label: 'Grid', value: 'grid', icon: <AppstoreOutlined /> },
                  { label: 'Tablo', value: 'table', icon: <BarsOutlined /> },
                ]}
              />
              <Button icon={<ReloadOutlined spin={loading} />} onClick={() => setLoading(!loading)}>
                Yenile
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Content */}
      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Row gutter={[20, 20]}>
              {packages.map((pkg) => (
                <Col xs={24} sm={24} md={12} lg={8} xl={8} xxl={6} key={pkg.id}>
                  <PackageCard pkg={pkg} />
                </Col>
              ))}
            </Row>
          </motion.div>
        ) : (
          <motion.div
            key="table"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card className="table-card glass-morphism">
              <Table
                columns={columns}
                dataSource={packages}
                rowKey="id"
                loading={loading}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Toplam ${total} paket`,
                }}
              />
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create/Edit Package Modal */}
      <Modal
        title={selectedPackage ? 'Paket Düzenle' : 'Yeni Paket Oluştur'}
        open={showCreateModal}
        onCancel={() => {
          setShowCreateModal(false);
          setSelectedPackage(null);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreatePackage}
        >
          <Tabs defaultActiveKey="1">
            <TabPane tab="Genel Bilgiler" key="1">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="name"
                    label="Paket Adı"
                    rules={[{ required: true, message: 'Paket adı gerekli' }]}
                  >
                    <Input placeholder="Örn: Professional" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="billingCycle"
                    label="Faturalandırma"
                    rules={[{ required: true }]}
                  >
                    <Select>
                      <Select.Option value="monthly">Aylık</Select.Option>
                      <Select.Option value="yearly">Yıllık</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item
                name="description"
                label="Açıklama"
                rules={[{ required: true, message: 'Açıklama gerekli' }]}
              >
                <Input.TextArea rows={3} placeholder="Paket açıklaması" />
              </Form.Item>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="price"
                    label="Fiyat"
                    rules={[{ required: true, message: 'Fiyat gerekli' }]}
                  >
                    <InputNumber
                      min={0}
                      style={{ width: '100%' }}
                      addonBefore="₺"
                      placeholder="599"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="discountedPrice"
                    label="İndirimli Fiyat"
                  >
                    <InputNumber
                      min={0}
                      style={{ width: '100%' }}
                      addonBefore="₺"
                      placeholder="499"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="color"
                    label="Renk"
                    rules={[{ required: true }]}
                  >
                    <Input type="color" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item name="popular" valuePropName="checked">
                    <Checkbox>Popüler</Checkbox>
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name="recommended" valuePropName="checked">
                    <Checkbox>Önerilen</Checkbox>
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name="new" valuePropName="checked">
                    <Checkbox>Yeni</Checkbox>
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name="isActive" valuePropName="checked" initialValue={true}>
                    <Checkbox>Aktif</Checkbox>
                  </Form.Item>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab="Limitler" key="2">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="maxUsers"
                    label="Maksimum Kullanıcı"
                    rules={[{ required: true }]}
                  >
                    <InputNumber
                      min={1}
                      style={{ width: '100%' }}
                      placeholder="100"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="maxStorage"
                    label="Maksimum Depolama (GB)"
                    rules={[{ required: true }]}
                  >
                    <InputNumber
                      min={1}
                      style={{ width: '100%' }}
                      placeholder="100"
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="apiCalls"
                    label="API Çağrı Limiti"
                    rules={[{ required: true }]}
                  >
                    <InputNumber
                      min={0}
                      style={{ width: '100%' }}
                      placeholder="50000"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="support"
                    label="Destek Seviyesi"
                    rules={[{ required: true }]}
                  >
                    <Select>
                      <Select.Option value="E-posta">E-posta</Select.Option>
                      <Select.Option value="E-posta + Telefon">E-posta + Telefon</Select.Option>
                      <Select.Option value="7/24 Telefon + Chat">7/24 Telefon + Chat</Select.Option>
                      <Select.Option value="Dedike Account Manager">Dedike Account Manager</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="customDomain" valuePropName="checked">
                    <Checkbox>Özel Domain Desteği</Checkbox>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="whiteLabel" valuePropName="checked">
                    <Checkbox>White Label</Checkbox>
                  </Form.Item>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab="Modüller" key="3">
              <Form.Item name="modules" label="Aktif Modüller">
                <Checkbox.Group>
                  <Row>
                    <Col span={8}>
                      <Checkbox value="CRM">CRM</Checkbox>
                    </Col>
                    <Col span={8}>
                      <Checkbox value="Sales">Sales</Checkbox>
                    </Col>
                    <Col span={8}>
                      <Checkbox value="Finance">Finance</Checkbox>
                    </Col>
                    <Col span={8}>
                      <Checkbox value="HR">HR</Checkbox>
                    </Col>
                    <Col span={8}>
                      <Checkbox value="Production">Production</Checkbox>
                    </Col>
                    <Col span={8}>
                      <Checkbox value="Inventory">Inventory</Checkbox>
                    </Col>
                  </Row>
                </Checkbox.Group>
              </Form.Item>
            </TabPane>

            <TabPane tab="Özellikler" key="4">
              <Form.Item name="features" label="Paket Özellikleri">
                <Select
                  mode="tags"
                  style={{ width: '100%' }}
                  placeholder="Özellik ekleyin"
                  options={features.map((f) => ({ label: f.name, value: f.name }))}
                />
              </Form.Item>
            </TabPane>
          </Tabs>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setShowCreateModal(false)}>İptal</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {selectedPackage ? 'Güncelle' : 'Oluştur'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Feature Modal */}
      <Modal
        title="Yeni Özellik Ekle"
        open={showFeatureModal}
        onCancel={() => {
          setShowFeatureModal(false);
          featureForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={featureForm}
          layout="vertical"
          onFinish={handleCreateFeature}
        >
          <Form.Item
            name="name"
            label="Özellik Adı"
            rules={[{ required: true }]}
          >
            <Input placeholder="Örn: API Erişimi" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Açıklama"
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={2} placeholder="Özellik açıklaması" />
          </Form.Item>
          <Form.Item
            name="category"
            label="Kategori"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="Modüller">Modüller</Select.Option>
              <Select.Option value="Entegrasyon">Entegrasyon</Select.Option>
              <Select.Option value="Özelleştirme">Özelleştirme</Select.Option>
              <Select.Option value="Destek">Destek</Select.Option>
              <Select.Option value="Güvenlik">Güvenlik</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="packages"
            label="Paketler"
            rules={[{ required: true }]}
          >
            <Checkbox.Group>
              <Row>
                {packages.map((pkg) => (
                  <Col span={12} key={pkg.id}>
                    <Checkbox value={pkg.name}>{pkg.name}</Checkbox>
                  </Col>
                ))}
              </Row>
            </Checkbox.Group>
          </Form.Item>
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setShowFeatureModal(false)}>İptal</Button>
              <Button type="primary" htmlType="submit">
                Ekle
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// Add missing import
import { Descriptions } from 'antd';