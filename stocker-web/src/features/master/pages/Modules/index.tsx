import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Switch,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Row,
  Col,
  Typography,
  Badge,
  Statistic,
  Tooltip,
  message,
  Tabs,
  List,
  Avatar,
  Progress,
  Alert,
} from 'antd';
import {
  AppstoreOutlined,
  EditOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  UserOutlined,
  ShoppingOutlined,
  TeamOutlined,
  BarChartOutlined,
  DatabaseOutlined,
  ApiOutlined,
  CloudOutlined,
  SafetyOutlined,
  RocketOutlined,
  ThunderboltOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  MinusOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { masterApi } from '@/shared/api/master.api';
import '../../styles/master-layout.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

interface Module {
  id: string;
  name: string;
  displayName: string;
  description: string;
  icon: string;
  isActive: boolean;
  isPremium: boolean;
  price: number;
  features: string[];
  permissions: string[];
  dependencies: string[];
  version: string;
  lastUpdated: string;
  usageCount: number;
  color: string;
}

const moduleIcons: Record<string, React.ReactNode> = {
  crm: <TeamOutlined />,
  inventory: <DatabaseOutlined />,
  sales: <ShoppingOutlined />,
  finance: <DollarOutlined />,
  hr: <UserOutlined />,
  production: <SettingOutlined />,
  reporting: <BarChartOutlined />,
  api: <ApiOutlined />,
  cloud: <CloudOutlined />,
  security: <SafetyOutlined />,
};

const moduleColors: Record<string, string> = {
  crm: '#1890ff',
  inventory: '#52c41a',
  sales: '#fa8c16',
  finance: '#722ed1',
  hr: '#13c2c2',
  production: '#eb2f96',
  reporting: '#faad14',
  api: '#2f54eb',
  cloud: '#73d13d',
  security: '#ff4d4f',
};

export const MasterModulesPage: React.FC = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [form] = Form.useForm();
  const [featureForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('all');

  // Mock data - API'den gelecek
  const mockModules: Module[] = [
    {
      id: '1',
      name: 'crm',
      displayName: 'CRM Modülü',
      description: 'Müşteri ilişkileri yönetimi modülü',
      icon: 'crm',
      isActive: true,
      isPremium: false,
      price: 0,
      features: ['Müşteri Yönetimi', 'Lead Takibi', 'Satış Pipeline', 'Raporlama'],
      permissions: ['crm.view', 'crm.create', 'crm.update', 'crm.delete'],
      dependencies: [],
      version: '2.1.0',
      lastUpdated: '2024-01-15',
      usageCount: 245,
      color: '#1890ff',
    },
    {
      id: '2',
      name: 'inventory',
      displayName: 'Stok Yönetimi',
      description: 'Envanter ve stok takip modülü',
      icon: 'inventory',
      isActive: true,
      isPremium: false,
      price: 0,
      features: ['Ürün Yönetimi', 'Stok Takibi', 'Depo Yönetimi', 'Stok Uyarıları'],
      permissions: ['inventory.view', 'inventory.create', 'inventory.update', 'inventory.delete'],
      dependencies: [],
      version: '2.0.5',
      lastUpdated: '2024-01-10',
      usageCount: 189,
      color: '#52c41a',
    },
    {
      id: '3',
      name: 'sales',
      displayName: 'Satış Yönetimi',
      description: 'Satış ve sipariş yönetimi modülü',
      icon: 'sales',
      isActive: true,
      isPremium: true,
      price: 99,
      features: ['Sipariş Yönetimi', 'Fatura Oluşturma', 'Ödeme Takibi', 'Satış Raporları'],
      permissions: ['sales.view', 'sales.create', 'sales.update', 'sales.delete'],
      dependencies: ['inventory'],
      version: '1.8.2',
      lastUpdated: '2024-01-08',
      usageCount: 156,
      color: '#fa8c16',
    },
    {
      id: '4',
      name: 'finance',
      displayName: 'Finans Modülü',
      description: 'Finansal yönetim ve muhasebe modülü',
      icon: 'finance',
      isActive: true,
      isPremium: true,
      price: 149,
      features: ['Gelir/Gider Takibi', 'Bütçe Yönetimi', 'Finansal Raporlar', 'Vergi Hesaplamaları'],
      permissions: ['finance.view', 'finance.create', 'finance.update', 'finance.delete'],
      dependencies: ['sales'],
      version: '1.5.0',
      lastUpdated: '2024-01-05',
      usageCount: 98,
      color: '#722ed1',
    },
    {
      id: '5',
      name: 'hr',
      displayName: 'İnsan Kaynakları',
      description: 'İK ve personel yönetimi modülü',
      icon: 'hr',
      isActive: false,
      isPremium: true,
      price: 199,
      features: ['Personel Yönetimi', 'İzin Takibi', 'Maaş Bordrosu', 'Performans Değerlendirme'],
      permissions: ['hr.view', 'hr.create', 'hr.update', 'hr.delete'],
      dependencies: [],
      version: '1.2.0',
      lastUpdated: '2023-12-20',
      usageCount: 45,
      color: '#13c2c2',
    },
  ];

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    setLoading(true);
    try {
      // API çağrısı yapılacak
      // const response = await masterApi.modules.getAll();
      // setModules(response.data);
      
      // Şimdilik mock data kullanıyoruz
      setTimeout(() => {
        setModules(mockModules);
        setLoading(false);
      }, 500);
    } catch (error) {
      message.error('Modüller yüklenirken hata oluştu');
      setLoading(false);
    }
  };

  const handleToggleStatus = async (module: Module) => {
    try {
      // await masterApi.modules.toggleStatus(module.id, !module.isActive);
      message.success(`${module.displayName} ${module.isActive ? 'devre dışı bırakıldı' : 'aktif edildi'}`);
      fetchModules();
    } catch (error) {
      message.error('Durum değiştirilemedi');
    }
  };

  const handleEdit = (module: Module) => {
    setSelectedModule(module);
    form.setFieldsValue({
      displayName: module.displayName,
      description: module.description,
      price: module.price,
      isPremium: module.isPremium,
      version: module.version,
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (values: any) => {
    try {
      // await masterApi.modules.update(selectedModule!.id, values);
      message.success('Modül güncellendi');
      setShowEditModal(false);
      fetchModules();
    } catch (error) {
      message.error('Modül güncellenemedi');
    }
  };

  const handleManageFeatures = (module: Module) => {
    setSelectedModule(module);
    setShowFeatureModal(true);
  };

  const stats = [
    {
      title: 'Toplam Modül',
      value: modules.length,
      icon: <AppstoreOutlined />,
      color: '#1890ff',
    },
    {
      title: 'Aktif Modül',
      value: modules.filter(m => m.isActive).length,
      icon: <CheckCircleOutlined />,
      color: '#52c41a',
    },
    {
      title: 'Premium Modül',
      value: modules.filter(m => m.isPremium).length,
      icon: <DollarOutlined />,
      color: '#722ed1',
    },
    {
      title: 'Toplam Kullanım',
      value: modules.reduce((sum, m) => sum + m.usageCount, 0),
      icon: <TeamOutlined />,
      color: '#fa8c16',
    },
  ];

  const columns = [
    {
      title: 'Modül',
      key: 'module',
      render: (record: Module) => (
        <Space>
          <Avatar
            style={{ backgroundColor: moduleColors[record.name] }}
            icon={moduleIcons[record.name]}
            size="large"
          />
          <div>
            <Text strong>{record.displayName}</Text>
            {record.isPremium && (
              <Badge count="Premium" style={{ backgroundColor: '#722ed1', marginLeft: 8 }} />
            )}
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.description}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Versiyon',
      dataIndex: 'version',
      key: 'version',
      render: (version: string) => <Tag>{version}</Tag>,
    },
    {
      title: 'Özellikler',
      key: 'features',
      render: (record: Module) => (
        <Tooltip title={record.features.join(', ')}>
          <Tag color="blue">{record.features.length} Özellik</Tag>
        </Tooltip>
      ),
    },
    {
      title: 'Fiyat',
      dataIndex: 'price',
      key: 'price',
      render: (price: number, record: Module) => (
        record.isPremium ? (
          <Text strong style={{ color: '#722ed1' }}>
            ${price}/ay
          </Text>
        ) : (
          <Tag color="green">Ücretsiz</Tag>
        )
      ),
    },
    {
      title: 'Kullanım',
      dataIndex: 'usageCount',
      key: 'usageCount',
      render: (count: number) => (
        <Space>
          <TeamOutlined />
          <Text>{count} Tenant</Text>
        </Space>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean, record: Module) => (
        <Switch
          checked={isActive}
          onChange={() => handleToggleStatus(record)}
          checkedChildren="Aktif"
          unCheckedChildren="Pasif"
        />
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (record: Module) => (
        <Space>
          <Tooltip title="Düzenle">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Özellikler">
            <Button
              type="text"
              icon={<SettingOutlined />}
              onClick={() => handleManageFeatures(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const filteredModules = activeTab === 'all' 
    ? modules 
    : activeTab === 'active' 
      ? modules.filter(m => m.isActive)
      : activeTab === 'premium'
        ? modules.filter(m => m.isPremium)
        : modules;

  return (
    <div className="master-modules-page">
      {/* Header */}
      <div className="page-header glass-morphism">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="header-content"
        >
          <Title level={2} className="gradient-text">
            <AppstoreOutlined /> Modül Yönetimi
          </Title>
          <Text type="secondary">Sistem modüllerini yönetin ve yapılandırın</Text>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="header-actions"
        >
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchModules}
            loading={loading}
          >
            Yenile
          </Button>
        </motion.div>
      </div>

      {/* Stats */}
      <Row gutter={[20, 20]} className="stats-row">
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
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
                    <span style={{ color: stat.color, marginRight: 8 }}>
                      {stat.icon}
                    </span>
                  }
                  valueStyle={{ color: stat.color }}
                />
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      {/* Module Cards Grid */}
      <Card className="content-card glass-morphism">
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Tüm Modüller" key="all" />
          <TabPane tab="Aktif Modüller" key="active" />
          <TabPane tab="Premium Modüller" key="premium" />
        </Tabs>

        <Row gutter={[20, 20]} style={{ marginTop: 20 }}>
          {filteredModules.map((module, index) => (
            <Col xs={24} sm={12} lg={8} xl={6} key={module.id}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className="module-card glass-morphism"
                  hoverable
                  style={{ height: '100%' }}
                >
                  <div style={{ textAlign: 'center', marginBottom: 16 }}>
                    <Avatar
                      size={64}
                      style={{ backgroundColor: moduleColors[module.name] }}
                      icon={moduleIcons[module.name]}
                    />
                    <Title level={4} style={{ marginTop: 12, marginBottom: 4 }}>
                      {module.displayName}
                    </Title>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {module.description}
                    </Text>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <Progress
                      percent={Math.round((module.usageCount / 300) * 100)}
                      size="small"
                      format={() => `${module.usageCount} Kullanıcı`}
                    />
                  </div>

                  <Space direction="vertical" style={{ width: '100%' }} size="small">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text type="secondary">Versiyon:</Text>
                      <Tag>{module.version}</Tag>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text type="secondary">Fiyat:</Text>
                      {module.isPremium ? (
                        <Text strong style={{ color: '#722ed1' }}>${module.price}/ay</Text>
                      ) : (
                        <Tag color="green">Ücretsiz</Tag>
                      )}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text type="secondary">Durum:</Text>
                      <Switch
                        size="small"
                        checked={module.isActive}
                        onChange={() => handleToggleStatus(module)}
                      />
                    </div>
                  </Space>

                  <div style={{ marginTop: 16, textAlign: 'center' }}>
                    <Space>
                      <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(module)}
                      >
                        Düzenle
                      </Button>
                      <Button
                        size="small"
                        icon={<SettingOutlined />}
                        onClick={() => handleManageFeatures(module)}
                      >
                        Özellikler
                      </Button>
                    </Space>
                  </div>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Edit Modal */}
      <Modal
        title="Modül Düzenle"
        open={showEditModal}
        onCancel={() => setShowEditModal(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleEditSubmit}
        >
          <Form.Item
            name="displayName"
            label="Modül Adı"
            rules={[{ required: true, message: 'Modül adı zorunlu' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Açıklama"
            rules={[{ required: true, message: 'Açıklama zorunlu' }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="version"
                label="Versiyon"
                rules={[{ required: true, message: 'Versiyon zorunlu' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="price"
                label="Fiyat ($/ay)"
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="isPremium"
            valuePropName="checked"
          >
            <Switch checkedChildren="Premium" unCheckedChildren="Ücretsiz" />
          </Form.Item>
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setShowEditModal(false)}>İptal</Button>
              <Button type="primary" htmlType="submit">
                Kaydet
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Features Modal */}
      <Modal
        title={`${selectedModule?.displayName} - Özellikler`}
        open={showFeatureModal}
        onCancel={() => setShowFeatureModal(false)}
        footer={null}
        width={700}
      >
        {selectedModule && (
          <Tabs defaultActiveKey="features">
            <TabPane tab="Özellikler" key="features">
              <List
                dataSource={selectedModule.features}
                renderItem={(feature) => (
                  <List.Item
                    actions={[
                      <Button
                        type="text"
                        icon={<MinusOutlined />}
                        danger
                        size="small"
                      />
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                      title={feature}
                    />
                  </List.Item>
                )}
              />
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                style={{ width: '100%', marginTop: 16 }}
              >
                Yeni Özellik Ekle
              </Button>
            </TabPane>
            <TabPane tab="İzinler" key="permissions">
              <List
                dataSource={selectedModule.permissions}
                renderItem={(permission) => (
                  <List.Item>
                    <Tag color="blue">{permission}</Tag>
                  </List.Item>
                )}
              />
            </TabPane>
            <TabPane tab="Bağımlılıklar" key="dependencies">
              {selectedModule.dependencies.length > 0 ? (
                <List
                  dataSource={selectedModule.dependencies}
                  renderItem={(dep) => (
                    <List.Item>
                      <Tag color="orange">{dep}</Tag>
                    </List.Item>
                  )}
                />
              ) : (
                <Alert
                  message="Bağımlılık Yok"
                  description="Bu modülün başka modüllere bağımlılığı bulunmuyor."
                  type="info"
                />
              )}
            </TabPane>
          </Tabs>
        )}
      </Modal>
    </div>
  );
};

export default MasterModulesPage;