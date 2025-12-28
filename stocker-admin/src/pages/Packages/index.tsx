import React, { useState, useEffect } from 'react';
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
  Spin,
  notification,
  Dropdown,
  Drawer,
} from 'antd';
import type { MenuProps } from 'antd';
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
  MoreOutlined,
} from '@ant-design/icons';
import { packageService } from '../../services/api/packageService';
import styles from './index.module.css';

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
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('overview');
  const [formTab, setFormTab] = useState('basic');

  // Unlimited checkbox states
  const [unlimitedUsers, setUnlimitedUsers] = useState(false);
  const [unlimitedStorage, setUnlimitedStorage] = useState(false);
  const [unlimitedApiCalls, setUnlimitedApiCalls] = useState(false);
  const [unlimitedProjects, setUnlimitedProjects] = useState(false);
  const [unlimitedDomains, setUnlimitedDomains] = useState(false);

  // Load packages from API on component mount
  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    setLoading(true);
    try {
      const apiPackages = await packageService.getAll({ includeInactive: true });
      
      // Map API response to frontend format
      const mappedPackages = apiPackages.map(pkg => packageService.mapToFrontendPackage(pkg));
      
      setPackages(mappedPackages);
    } catch (error) {
      console.error('Failed to load packages:', error);
      notification.error({
        message: 'Veri Yükleme Hatası',
        description: 'Paketler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.',
        placement: 'topRight'
      });
      
      // Set empty array on error
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

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

    // Check for unlimited values
    const isUnlimitedUsers = pkg.limits.users === 2147483647 || pkg.limits.users === 99999;
    const isUnlimitedStorage = pkg.limits.storage === 2147483647 || pkg.limits.storage === 99999;
    const isUnlimitedApiCalls = pkg.limits.apiCalls === 2147483647 || pkg.limits.apiCalls === 99999999;
    const isUnlimitedProjects = pkg.limits.projects === 2147483647 || pkg.limits.projects === 99999;
    const isUnlimitedDomains = pkg.limits.customDomains === 2147483647 || pkg.limits.customDomains === 99999;

    setUnlimitedUsers(isUnlimitedUsers);
    setUnlimitedStorage(isUnlimitedStorage);
    setUnlimitedApiCalls(isUnlimitedApiCalls);
    setUnlimitedProjects(isUnlimitedProjects);
    setUnlimitedDomains(isUnlimitedDomains);

    form.setFieldsValue({
      ...pkg,
      features: pkg.features,
      'limits.users': isUnlimitedUsers ? 0 : pkg.limits.users,
      'limits.storage': isUnlimitedStorage ? 0 : pkg.limits.storage,
      'limits.apiCalls': isUnlimitedApiCalls ? 0 : pkg.limits.apiCalls,
      'limits.projects': isUnlimitedProjects ? 0 : pkg.limits.projects,
      'limits.customDomains': isUnlimitedDomains ? 0 : pkg.limits.customDomains,
      'limits.emailSupport': pkg.limits.emailSupport,
      'limits.phoneSupport': pkg.limits.phoneSupport,
      'limits.prioritySupport': pkg.limits.prioritySupport,
      'limits.sla': pkg.limits.sla,
    });
    setFormTab('basic');
    setIsDrawerVisible(true);
  };

  const handleDelete = (pkg: Package) => {
    const hasSubscribers = pkg.subscriberCount > 0;

    Modal.confirm({
      title: 'Paket Sil',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <Alert
            message="Dikkat!"
            description={
              hasSubscribers
                ? `Bu pakette ${pkg.subscriberCount} aktif abone bulunmaktadır. Paketi silerseniz bu aboneler etkilenecektir!`
                : "Bu işlem geri alınamaz."
            }
            type={hasSubscribers ? "error" : "warning"}
            showIcon
          />
          <p style={{ marginTop: 16 }}>
            <strong>{pkg.displayName}</strong> paketi silinecek.
          </p>
          {hasSubscribers && (
            <p style={{ color: '#ff4d4f', marginTop: 8, fontWeight: 'bold' }}>
              ⚠️ {pkg.subscriberCount} abone etkilenecek!
            </p>
          )}
        </div>
      ),
      okText: hasSubscribers ? `Evet, ${pkg.subscriberCount} Aboneyi Etkileyerek Sil` : 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          const success = await packageService.delete(pkg.id);
          if (success) {
            setPackages(packages.filter(p => p.id !== pkg.id));
            message.success('Paket başarıyla silindi');
          } else {
            throw new Error('Silme işlemi başarısız');
          }
        } catch (error) {
          console.error('Failed to delete package:', error);
          message.error('Paket silinirken bir hata oluştu');
        }
      },
    });
  };

  const handleDrawerOk = async () => {
    try {
      const values = await form.validateFields();

      const packageData: Package = {
        ...values,
        id: editingPackage?.id || '',
        limits: {
          users: unlimitedUsers ? 2147483647 : values['limits.users'],
          storage: unlimitedStorage ? 2147483647 : values['limits.storage'],
          apiCalls: unlimitedApiCalls ? 2147483647 : values['limits.apiCalls'],
          projects: unlimitedProjects ? 2147483647 : values['limits.projects'],
          customDomains: unlimitedDomains ? 2147483647 : values['limits.customDomains'],
          emailSupport: values['limits.emailSupport'],
          phoneSupport: values['limits.phoneSupport'],
          prioritySupport: values['limits.prioritySupport'],
          sla: values['limits.sla'],
        },
        subscriberCount: editingPackage?.subscriberCount || 0,
        revenue: editingPackage?.revenue || 0,
        createdAt: editingPackage?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (editingPackage) {
        // Update existing package
        try {
          const updateCommand = packageService.mapToUpdateCommand(packageData);
          const success = await packageService.update(editingPackage.id, updateCommand);
          
          if (success) {
            message.success('Paket başarıyla güncellendi');
            // Reload packages to get updated data
            await loadPackages();
          } else {
            throw new Error('Güncelleme başarısız');
          }
        } catch (error) {
          console.error('Failed to update package:', error);
          message.error('Paket güncellenirken bir hata oluştu');
          return;
        }
      } else {
        // Create new package
        try {
          const createCommand = packageService.mapToCreateCommand(packageData);
          const newPackage = await packageService.create(createCommand);
          
          if (newPackage) {
            message.success('Yeni paket başarıyla oluşturuldu');
            // Reload packages to get new data
            await loadPackages();
          } else {
            throw new Error('Oluşturma başarısız');
          }
        } catch (error) {
          console.error('Failed to create package:', error);
          message.error('Paket oluşturulurken bir hata oluştu');
          return;
        }
      }

      setIsDrawerVisible(false);
      form.resetFields();
      setEditingPackage(null);
      setFormTab('basic');
      setUnlimitedUsers(false);
      setUnlimitedStorage(false);
      setUnlimitedApiCalls(false);
      setUnlimitedProjects(false);
      setUnlimitedDomains(false);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const formatLimit = (value: number, type: 'users' | 'storage' | 'api' | 'projects') => {
    if (value === 2147483647 || value === 99999 || value === 99999999) {
      return 'Sınırsız';
    }
    if (type === 'storage') return `${value} GB`;
    if (type === 'api') return value >= 1000000 ? `${(value / 1000000).toFixed(0)}M` : value >= 1000 ? `${(value / 1000).toFixed(0)}K` : value.toString();
    return value.toString();
  };

  const renderPackageCard = (pkg: Package) => (
    <div key={pkg.id} className={styles.packageCard}>
      {/* Header: Name + Status | Price */}
      <div className={styles.cardHeader}>
        <div className={styles.headerLeft}>
          <span className={styles.packageTitle}>{pkg.displayName}</span>
          <span className={`${styles.statusBadge} ${styles[pkg.status]}`}>
            {pkg.status === 'active' ? 'Aktif' : pkg.status === 'inactive' ? 'Pasif' : 'Kullanım Dışı'}
          </span>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.priceValue}>₺{pkg.price.toLocaleString()}</div>
          <div className={styles.pricePeriod}>
            {pkg.billingCycle === 'monthly' ? '/ay' : pkg.billingCycle === 'yearly' ? '/yıl' : 'tek seferlik'}
          </div>
        </div>
      </div>

      {/* Limit Özet Grid */}
      <div className={styles.limitsGrid}>
        <div className={styles.limitItem}>
          <div className={styles.limitIcon}><TeamOutlined /></div>
          <div className={styles.limitText}>
            <span className={styles.limitValue}>{formatLimit(pkg.limits.users, 'users')}</span>
            <span className={styles.limitLabel}>Kullanıcı</span>
          </div>
        </div>
        <div className={styles.limitItem}>
          <div className={styles.limitIcon}><CloudServerOutlined /></div>
          <div className={styles.limitText}>
            <span className={styles.limitValue}>{formatLimit(pkg.limits.storage, 'storage')}</span>
            <span className={styles.limitLabel}>Depolama</span>
          </div>
        </div>
        <div className={styles.limitItem}>
          <div className={styles.limitIcon}><ApiOutlined /></div>
          <div className={styles.limitText}>
            <span className={styles.limitValue}>{formatLimit(pkg.limits.apiCalls, 'api')}</span>
            <span className={styles.limitLabel}>API Çağrısı</span>
          </div>
        </div>
        <div className={styles.limitItem}>
          <div className={styles.limitIcon}><AppstoreOutlined /></div>
          <div className={styles.limitText}>
            <span className={styles.limitValue}>{formatLimit(pkg.limits.projects, 'projects')}</span>
            <span className={styles.limitLabel}>Proje</span>
          </div>
        </div>
      </div>

      {/* Canlı Metrikler */}
      <div className={styles.metricsSection}>
        <div className={styles.metricItem}>
          <div className={styles.metricLabel}>Abone Sayısı</div>
          <div className={styles.metricValue}>{pkg.subscriberCount.toLocaleString()}</div>
        </div>
        <div className={styles.metricItem}>
          <div className={styles.metricLabel}>Aylık Gelir</div>
          <div className={styles.metricValue}>₺{pkg.revenue.toLocaleString()}</div>
        </div>
      </div>

      {/* Aksiyonlar */}
      <div className={styles.cardActions}>
        <Button
          onClick={() => handleEdit(pkg)}
          icon={<EditOutlined />}
          className={styles.editButton}
        >
          Düzenle
        </Button>
        <Dropdown
          menu={{
            items: [
              {
                key: 'archive',
                label: 'Arşivle',
                icon: <CloseCircleOutlined />,
              },
              {
                key: 'delete',
                label: 'Sil',
                danger: true,
                icon: <DeleteOutlined />,
                onClick: () => handleDelete(pkg),
              },
            ],
          }}
          placement="bottomRight"
        >
          <Button icon={<MoreOutlined />} className={styles.moreButton} />
        </Dropdown>
      </div>
    </div>
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
        fixed: 'left' as const,
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
            return value === 2147483647 || value === 99999 ? '∞ Sınırsız' : value;
          }

          if (record.key === 'storage') {
            return value === 2147483647 || value === 99999 ? '∞ Sınırsız' : `${value} GB`;
          }

          if (record.key === 'apiCalls') {
            return value === 2147483647 || value === 99999999 ? '∞ Sınırsız' : value.toLocaleString();
          }

          if (record.key === 'customDomains') {
            return value === 2147483647 || value === 99999 ? '∞ Sınırsız' : value === 0 ? '-' : value;
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

  if (loading) {
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
      >
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <Spin size="large" tip="Paketler yükleniyor..." />
        </div>
      </PageContainer>
    );
  }

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
          {/* Özet İstatistikler */}
          <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <Card className={styles.statsCard} bordered={false}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div className={styles.statsCardLabel}>Toplam Paket</div>
                    <div className={styles.statsCardValue}>{packages.length}</div>
                  </div>
                  <AppstoreOutlined className={styles.statsCardIcon} />
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className={styles.statsCard} bordered={false}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div className={styles.statsCardLabel}>Aktif</div>
                    <div className={styles.statsCardValue} style={{ color: '#16a34a' }}>
                      {packages.filter(p => p.status === 'active').length}
                    </div>
                  </div>
                  <CheckCircleOutlined className={styles.statsCardIcon} />
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className={styles.statsCard} bordered={false}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div className={styles.statsCardLabel}>Toplam Abone</div>
                    <div className={styles.statsCardValue}>
                      {packages.reduce((sum, p) => sum + p.subscriberCount, 0).toLocaleString()}
                    </div>
                  </div>
                  <TeamOutlined className={styles.statsCardIcon} />
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className={styles.statsCard} bordered={false}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div className={styles.statsCardLabel}>Aylık Gelir</div>
                    <div className={styles.statsCardValue}>
                      ₺{packages.reduce((sum, p) => sum + p.revenue, 0).toLocaleString()}
                    </div>
                    <div className={`${styles.growthIndicator} ${styles.positive}`}>
                      +12.5%
                    </div>
                  </div>
                  <DollarOutlined className={styles.statsCardIcon} />
                </div>
              </Card>
            </Col>
          </Row>

          {/* Paket Kartları Grid - 3 kolon */}
          <Row gutter={[24, 24]}>
            {packages.map(pkg => (
              <Col xs={24} sm={12} lg={8} key={pkg.id}>
                {renderPackageCard(pkg)}
              </Col>
            ))}
            <Col xs={24} sm={12} lg={8}>
              <div
                className={styles.addPackageCard}
                onClick={() => {
                  setEditingPackage(null);
                  form.resetFields();
                  setFormTab('basic');
                  setIsDrawerVisible(true);
                }}
              >
                <div className={styles.addPackageContent}>
                  <PlusOutlined className={styles.addPackageIcon} />
                  <span className={styles.addPackageTitle}>Yeni Paket Ekle</span>
                </div>
              </div>
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

      {/* Create/Edit Package Drawer */}
      <Drawer
        title={editingPackage ? 'Paketi Düzenle' : 'Yeni Paket Oluştur'}
        open={isDrawerVisible}
        onClose={() => {
          setIsDrawerVisible(false);
          form.resetFields();
          setEditingPackage(null);
          setFormTab('basic');
          setUnlimitedUsers(false);
          setUnlimitedStorage(false);
          setUnlimitedApiCalls(false);
          setUnlimitedProjects(false);
          setUnlimitedDomains(false);
        }}
        width={720}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setIsDrawerVisible(false);
                form.resetFields();
                setEditingPackage(null);
                setFormTab('basic');
              }}>
                İptal
              </Button>
              <Button type="primary" onClick={handleDrawerOk}>
                {editingPackage ? 'Güncelle' : 'Oluştur'}
              </Button>
            </Space>
          </div>
        }
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
          <Tabs
            activeKey={formTab}
            onChange={setFormTab}
            items={[
              {
                key: 'basic',
                label: 'Temel Bilgiler',
                children: (
                  <>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="name"
                          label="Paket Kodu"
                          rules={[{ required: true, message: 'Paket kodu zorunludur' }]}
                        >
                          <Input placeholder="starter, professional, enterprise" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="displayName"
                          label="Görünen Ad"
                          rules={[{ required: true, message: 'Görünen ad zorunludur' }]}
                        >
                          <Input placeholder="Starter, Professional, Enterprise" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={12}>
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
                      <Col span={12}>
                        <Form.Item name="trialDays" label="Deneme Süresi (Gün)">
                          <InputNumber min={0} max={90} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item
                      name="description"
                      label="Açıklama"
                      rules={[{ required: true, message: 'Açıklama zorunludur' }]}
                    >
                      <TextArea rows={3} placeholder="Paketin kısa açıklaması" />
                    </Form.Item>

                    <Divider orientation="left">Fiyatlandırma</Divider>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="price"
                          label="Fiyat"
                          rules={[{ required: true, message: 'Fiyat zorunludur' }]}
                        >
                          <InputNumber
                            min={0}
                            style={{ width: '100%' }}
                            addonBefore="₺"
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
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
                    </Row>

                    <Form.Item name="originalPrice" label="Orijinal Fiyat (İndirim göstermek için)">
                      <InputNumber
                        min={0}
                        style={{ width: '100%' }}
                        addonBefore="₺"
                        placeholder="Opsiyonel"
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                      />
                    </Form.Item>
                  </>
                ),
              },
              {
                key: 'limits',
                label: 'Limitler & Kotalar',
                children: (
                  <>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item label="Kullanıcı Sayısı">
                          <Space.Compact style={{ width: '100%' }}>
                            <Form.Item
                              name="limits.users"
                              noStyle
                              rules={[{ required: !unlimitedUsers, message: 'Zorunlu' }]}
                            >
                              <InputNumber
                                min={1}
                                max={99999}
                                style={{ width: 'calc(100% - 100px)' }}
                                disabled={unlimitedUsers}
                              />
                            </Form.Item>
                            <Checkbox
                              checked={unlimitedUsers}
                              onChange={(e) => setUnlimitedUsers(e.target.checked)}
                              style={{ marginLeft: 8 }}
                            >
                              Sınırsız
                            </Checkbox>
                          </Space.Compact>
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="Depolama (GB)">
                          <Space.Compact style={{ width: '100%' }}>
                            <Form.Item
                              name="limits.storage"
                              noStyle
                              rules={[{ required: !unlimitedStorage, message: 'Zorunlu' }]}
                            >
                              <InputNumber
                                min={1}
                                max={99999}
                                style={{ width: 'calc(100% - 100px)' }}
                                disabled={unlimitedStorage}
                              />
                            </Form.Item>
                            <Checkbox
                              checked={unlimitedStorage}
                              onChange={(e) => setUnlimitedStorage(e.target.checked)}
                              style={{ marginLeft: 8 }}
                            >
                              Sınırsız
                            </Checkbox>
                          </Space.Compact>
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item label="API Çağrısı">
                          <Space.Compact style={{ width: '100%' }}>
                            <Form.Item
                              name="limits.apiCalls"
                              noStyle
                              rules={[{ required: !unlimitedApiCalls, message: 'Zorunlu' }]}
                            >
                              <InputNumber
                                min={1000}
                                max={99999999}
                                style={{ width: 'calc(100% - 100px)' }}
                                disabled={unlimitedApiCalls}
                              />
                            </Form.Item>
                            <Checkbox
                              checked={unlimitedApiCalls}
                              onChange={(e) => setUnlimitedApiCalls(e.target.checked)}
                              style={{ marginLeft: 8 }}
                            >
                              Sınırsız
                            </Checkbox>
                          </Space.Compact>
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="Proje Sayısı">
                          <Space.Compact style={{ width: '100%' }}>
                            <Form.Item
                              name="limits.projects"
                              noStyle
                              rules={[{ required: !unlimitedProjects, message: 'Zorunlu' }]}
                            >
                              <InputNumber
                                min={1}
                                max={99999}
                                style={{ width: 'calc(100% - 100px)' }}
                                disabled={unlimitedProjects}
                              />
                            </Form.Item>
                            <Checkbox
                              checked={unlimitedProjects}
                              onChange={(e) => setUnlimitedProjects(e.target.checked)}
                              style={{ marginLeft: 8 }}
                            >
                              Sınırsız
                            </Checkbox>
                          </Space.Compact>
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item label="Özel Domain">
                          <Space.Compact style={{ width: '100%' }}>
                            <Form.Item
                              name="limits.customDomains"
                              noStyle
                            >
                              <InputNumber
                                min={0}
                                max={99999}
                                style={{ width: 'calc(100% - 100px)' }}
                                disabled={unlimitedDomains}
                              />
                            </Form.Item>
                            <Checkbox
                              checked={unlimitedDomains}
                              onChange={(e) => setUnlimitedDomains(e.target.checked)}
                              style={{ marginLeft: 8 }}
                            >
                              Sınırsız
                            </Checkbox>
                          </Space.Compact>
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="limits.sla"
                          label="SLA (%)"
                          rules={[{ required: true }]}
                        >
                          <InputNumber min={90} max={99.99} step={0.1} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Divider orientation="left">Destek Seçenekleri</Divider>

                    <Form.Item label=" " colon={false}>
                      <Space size="large">
                        <Form.Item name="limits.emailSupport" valuePropName="checked" noStyle>
                          <Checkbox>E-posta Desteği</Checkbox>
                        </Form.Item>
                        <Form.Item name="limits.phoneSupport" valuePropName="checked" noStyle>
                          <Checkbox>Telefon Desteği</Checkbox>
                        </Form.Item>
                        <Form.Item name="limits.prioritySupport" valuePropName="checked" noStyle>
                          <Checkbox>Öncelikli Destek</Checkbox>
                        </Form.Item>
                      </Space>
                    </Form.Item>
                  </>
                ),
              },
              {
                key: 'features',
                label: 'Özellikler',
                children: (
                  <>
                    <Divider orientation="left">Destek Özellikleri</Divider>
                    <Form.Item name="features">
                      <CheckboxGroup>
                        <Row>
                          <Col span={12}><Checkbox value="email-support">E-posta Desteği</Checkbox></Col>
                          <Col span={12}><Checkbox value="phone-support">Telefon Desteği</Checkbox></Col>
                          <Col span={12}><Checkbox value="priority-support">Öncelikli Destek</Checkbox></Col>
                          <Col span={12}><Checkbox value="dedicated-manager">Özel Hesap Yöneticisi</Checkbox></Col>
                        </Row>
                      </CheckboxGroup>
                    </Form.Item>

                    <Divider orientation="left">Teknik Özellikler</Divider>
                    <Form.Item name="features">
                      <CheckboxGroup>
                        <Row>
                          <Col span={12}><Checkbox value="api-access">API Erişimi</Checkbox></Col>
                          <Col span={12}><Checkbox value="webhooks">Webhook Desteği</Checkbox></Col>
                          <Col span={12}><Checkbox value="custom-integrations">Özel Entegrasyonlar</Checkbox></Col>
                          <Col span={12}><Checkbox value="advanced-analytics">Gelişmiş Analitik</Checkbox></Col>
                          <Col span={12}><Checkbox value="custom-reports">Özel Raporlar</Checkbox></Col>
                          <Col span={12}><Checkbox value="export-data">Veri Dışa Aktarma</Checkbox></Col>
                        </Row>
                      </CheckboxGroup>
                    </Form.Item>

                    <Divider orientation="left">Güvenlik Özellikleri</Divider>
                    <Form.Item name="features">
                      <CheckboxGroup>
                        <Row>
                          <Col span={12}><Checkbox value="sso">Single Sign-On (SSO)</Checkbox></Col>
                          <Col span={12}><Checkbox value="two-factor-auth">İki Faktörlü Doğrulama</Checkbox></Col>
                          <Col span={12}><Checkbox value="ip-whitelist">IP Beyaz Listesi</Checkbox></Col>
                          <Col span={12}><Checkbox value="audit-logs">Denetim Günlükleri</Checkbox></Col>
                          <Col span={12}><Checkbox value="custom-permissions">Özel İzinler</Checkbox></Col>
                          <Col span={12}><Checkbox value="data-encryption">Veri Şifreleme</Checkbox></Col>
                        </Row>
                      </CheckboxGroup>
                    </Form.Item>
                  </>
                ),
              },
              {
                key: 'settings',
                label: 'Görünüm & Ayarlar',
                children: (
                  <>
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
                    </Row>

                    <Divider orientation="left">Etiketler</Divider>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name="isPopular" valuePropName="checked">
                          <Checkbox>Popüler Paket</Checkbox>
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="isBestValue" valuePropName="checked">
                          <Checkbox>En İyi Değer</Checkbox>
                        </Form.Item>
                      </Col>
                    </Row>
                  </>
                ),
              },
            ]}
          />
        </Form>
      </Drawer>
    </PageContainer>
  );
};

export default PackagesPage;