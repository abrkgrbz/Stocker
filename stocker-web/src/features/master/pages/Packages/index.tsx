import React, { useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import {
  Card,
  Table,
  Space,
  Button,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Row,
  Col,
  Tabs,
  List,
  Badge,
  message,
  Popconfirm,
  Typography,
  Divider,
  Checkbox,
  Transfer,
  Alert,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  CheckCircleOutlined,
  AppstoreOutlined,
  DollarOutlined,
  UserOutlined,
  CloudOutlined,
  ApiOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
  StarOutlined,
  StarFilled,
  DatabaseOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

interface PackageData {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'quarterly' | 'yearly';
  features: string[];
  modules: string[];
  limits: {
    users: number;
    storage: number;
    apiCalls: number;
  };
  isActive: boolean;
  isPopular: boolean;
  discount?: number;
  trialDays: number;
  createdAt: string;
  subscriberCount: number;
}

interface ModuleData {
  key: string;
  title: string;
  description: string;
}

export const MasterPackagesPage: React.FC = () => {
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageData | null>(null);
  const [form] = Form.useForm();
  const [selectedModules, setSelectedModules] = useState<string[]>([]);

  // Mock data
  const mockPackages: PackageData[] = [
    {
      id: '1',
      name: 'Başlangıç',
      description: 'Küçük işletmeler için ideal başlangıç paketi',
      price: 499,
      currency: '₺',
      billingCycle: 'monthly',
      features: [
        'Temel CRM özellikleri',
        'Stok takibi',
        'Fatura yönetimi',
        'E-posta desteği',
        'Mobil uygulama',
      ],
      modules: ['CRM', 'Stok'],
      limits: {
        users: 5,
        storage: 10,
        apiCalls: 10000,
      },
      isActive: true,
      isPopular: false,
      trialDays: 14,
      createdAt: '2023-01-15',
      subscriberCount: 245,
    },
    {
      id: '2',
      name: 'Profesyonel',
      description: 'Büyüyen işletmeler için gelişmiş özellikler',
      price: 999,
      currency: '₺',
      billingCycle: 'monthly',
      features: [
        'Gelişmiş CRM özellikleri',
        'Stok ve depo yönetimi',
        'Muhasebe entegrasyonu',
        'E-fatura',
        'Öncelikli destek',
        'API erişimi',
        'Özel raporlar',
      ],
      modules: ['CRM', 'Stok', 'Muhasebe', 'E-Ticaret'],
      limits: {
        users: 25,
        storage: 100,
        apiCalls: 100000,
      },
      isActive: true,
      isPopular: true,
      discount: 20,
      trialDays: 14,
      createdAt: '2023-01-15',
      subscriberCount: 185,
    },
    {
      id: '3',
      name: 'Kurumsal',
      description: 'Büyük organizasyonlar için sınırsız imkanlar',
      price: 2499,
      currency: '₺',
      billingCycle: 'monthly',
      features: [
        'Tüm özellikler',
        'Sınırsız kullanıcı',
        'Sınırsız depolama',
        'Özel geliştirmeler',
        '7/24 VIP destek',
        'SLA garantisi',
        'Yerinde eğitim',
        'Özel sunucu seçeneği',
      ],
      modules: ['CRM', 'Stok', 'Muhasebe', 'E-Ticaret', 'İK', 'Üretim'],
      limits: {
        users: -1, // Unlimited
        storage: -1,
        apiCalls: -1,
      },
      isActive: true,
      isPopular: false,
      trialDays: 30,
      createdAt: '2023-01-15',
      subscriberCount: 70,
    },
  ];

  const allModules: ModuleData[] = [
    { key: 'CRM', title: 'CRM', description: 'Müşteri ilişkileri yönetimi' },
    { key: 'Stok', title: 'Stok', description: 'Stok ve depo yönetimi' },
    { key: 'Muhasebe', title: 'Muhasebe', description: 'Finansal işlemler' },
    { key: 'E-Ticaret', title: 'E-Ticaret', description: 'Online satış' },
    { key: 'İK', title: 'İnsan Kaynakları', description: 'Personel yönetimi' },
    { key: 'Üretim', title: 'Üretim', description: 'Üretim takibi' },
  ];

  const handleEdit = (record: PackageData) => {
    setSelectedPackage(record);
    form.setFieldsValue({
      ...record,
      modules: record.modules,
    });
    setSelectedModules(record.modules);
    setEditModalVisible(true);
  };

  const handleDuplicate = (record: PackageData) => {
    const newPackage = {
      ...record,
      name: `${record.name} (Kopya)`,
      id: Date.now().toString(),
    };
    message.success('Paket kopyalandı');
  };

  const handleDelete = (record: PackageData) => {
    message.success('Paket silindi');
  };

  const handleSave = () => {
    form.validateFields().then(values => {
      message.success('Paket güncellendi');
      setEditModalVisible(false);
    });
  };

  const columns: ColumnsType<PackageData> = [
    {
      title: 'Paket',
      key: 'package',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Space>
            <Text strong style={{ fontSize: 16 }}>{record.name}</Text>
            {record.isPopular && <Tag color="purple" icon={<StarFilled />}>Popüler</Tag>}
          </Space>
          <Text type="secondary">{record.description}</Text>
        </Space>
      ),
    },
    {
      title: 'Fiyat',
      key: 'price',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Space>
            <Text strong style={{ fontSize: 20 }}>
              {record.currency}{record.price}
            </Text>
            <Text type="secondary">/ay</Text>
          </Space>
          {record.discount && (
            <Tag color="red">%{record.discount} indirim</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Limitler',
      key: 'limits',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text>
            <UserOutlined /> {record.limits.users === -1 ? 'Sınırsız' : record.limits.users} kullanıcı
          </Text>
          <Text>
            <DatabaseOutlined /> {record.limits.storage === -1 ? 'Sınırsız' : `${record.limits.storage} GB`}
          </Text>
          <Text>
            <ApiOutlined /> {record.limits.apiCalls === -1 ? 'Sınırsız' : `${record.limits.apiCalls / 1000}K`} API
          </Text>
        </Space>
      ),
    },
    {
      title: 'Modüller',
      dataIndex: 'modules',
      key: 'modules',
      render: (modules: string[]) => (
        <Space wrap>
          {modules.map(module => (
            <Tag key={module} color="blue">{module}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Aboneler',
      key: 'subscribers',
      render: (_, record) => (
        <Badge count={record.subscriberCount} showZero color="#52c41a">
          <Tag>{record.subscriberCount} firma</Tag>
        </Badge>
      ),
    },
    {
      title: 'Durum',
      key: 'status',
      render: (_, record) => (
        <Switch 
          checked={record.isActive} 
          checkedChildren="Aktif" 
          unCheckedChildren="Pasif"
          onChange={(checked) => {
            message.success(`Paket ${checked ? 'aktifleştirildi' : 'pasifleştirildi'}`);
          }}
        />
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Düzenle
          </Button>
          <Button icon={<CopyOutlined />} onClick={() => handleDuplicate(record)}>
            Kopyala
          </Button>
          <Popconfirm
            title="Bu paketi silmek istediğinizden emin misiniz?"
            onConfirm={() => handleDelete(record)}
            okText="Evet"
            cancelText="Hayır"
          >
            <Button danger icon={<DeleteOutlined />}>
              Sil
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer
      title="Paket Yönetimi"
      subTitle="Abonelik paketlerini yönet ve düzenle"
      extra={[
        <Button key="add" type="primary" icon={<PlusOutlined />} onClick={() => {
          setSelectedPackage(null);
          form.resetFields();
          setEditModalVisible(true);
        }}>
          Yeni Paket
        </Button>,
      ]}
    >
      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text type="secondary">Toplam Paket</Text>
              <Title level={2} style={{ margin: 0 }}>{mockPackages.length}</Title>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text type="secondary">Aktif Abonelik</Text>
              <Title level={2} style={{ margin: 0 }}>
                {mockPackages.reduce((sum, p) => sum + p.subscriberCount, 0)}
              </Title>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text type="secondary">Aylık Gelir</Text>
              <Title level={2} style={{ margin: 0 }}>
                ₺{mockPackages.reduce((sum, p) => sum + (p.price * p.subscriberCount), 0).toLocaleString('tr-TR')}
              </Title>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Info Alert */}
      <Alert
        message="Paket Yönetimi"
        description="Paketlerde yapacağınız değişiklikler mevcut aboneleri etkilemez. Yeni abonelikler güncel paket özelliklerine göre oluşturulur."
        type="info"
        showIcon
        closable
        style={{ marginBottom: 24 }}
      />

      {/* Packages Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={mockPackages}
          rowKey="id"
          pagination={false}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Edit/Create Modal */}
      <Modal
        title={selectedPackage ? 'Paketi Düzenle' : 'Yeni Paket Oluştur'}
        visible={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleSave}
        width={800}
        okText="Kaydet"
        cancelText="İptal"
      >
        <Form form={form} layout="vertical">
          <Tabs defaultActiveKey="1">
            <TabPane tab="Genel Bilgiler" key="1">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="name"
                    label="Paket Adı"
                    rules={[{ required: true, message: 'Paket adı gereklidir' }]}
                  >
                    <Input placeholder="Örn: Profesyonel" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="billingCycle"
                    label="Faturalandırma Periyodu"
                    rules={[{ required: true }]}
                  >
                    <Select>
                      <Select.Option value="monthly">Aylık</Select.Option>
                      <Select.Option value="quarterly">3 Aylık</Select.Option>
                      <Select.Option value="yearly">Yıllık</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item
                name="description"
                label="Açıklama"
                rules={[{ required: true, message: 'Açıklama gereklidir' }]}
              >
                <TextArea rows={3} placeholder="Paket açıklaması..." />
              </Form.Item>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="price"
                    label="Fiyat"
                    rules={[{ required: true, message: 'Fiyat gereklidir' }]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      min={0}
                      formatter={value => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value!.replace(/₺\s?|(,*)/g, '')}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="discount" label="İndirim (%)">
                    <InputNumber style={{ width: '100%' }} min={0} max={100} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="trialDays" label="Deneme Süresi (Gün)">
                    <InputNumber style={{ width: '100%' }} min={0} max={90} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="isActive" label="Durum" valuePropName="checked">
                    <Switch checkedChildren="Aktif" unCheckedChildren="Pasif" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="isPopular" label="Popüler Paket" valuePropName="checked">
                    <Switch checkedChildren="Evet" unCheckedChildren="Hayır" />
                  </Form.Item>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab="Limitler" key="2">
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item name={['limits', 'users']} label="Kullanıcı Limiti">
                    <InputNumber 
                      style={{ width: '100%' }} 
                      min={-1} 
                      placeholder="-1 = Sınırsız"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name={['limits', 'storage']} label="Depolama (GB)">
                    <InputNumber 
                      style={{ width: '100%' }} 
                      min={-1} 
                      placeholder="-1 = Sınırsız"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name={['limits', 'apiCalls']} label="API Çağrısı">
                    <InputNumber 
                      style={{ width: '100%' }} 
                      min={-1} 
                      placeholder="-1 = Sınırsız"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab="Modüller" key="3">
              <Form.Item name="modules" label="Dahil Olan Modüller">
                <Checkbox.Group style={{ width: '100%' }}>
                  <Row>
                    {allModules.map(module => (
                      <Col span={12} key={module.key} style={{ marginBottom: 16 }}>
                        <Checkbox value={module.key}>
                          <Space>
                            <AppstoreOutlined />
                            <div>
                              <div><strong>{module.title}</strong></div>
                              <div style={{ fontSize: 12, color: '#888' }}>{module.description}</div>
                            </div>
                          </Space>
                        </Checkbox>
                      </Col>
                    ))}
                  </Row>
                </Checkbox.Group>
              </Form.Item>
            </TabPane>

            <TabPane tab="Özellikler" key="4">
              <Form.Item 
                name="features" 
                label="Paket Özellikleri"
                tooltip="Her satıra bir özellik yazın"
              >
                <TextArea 
                  rows={10} 
                  placeholder="Her satıra bir özellik yazın..."
                />
              </Form.Item>
            </TabPane>
          </Tabs>
        </Form>
      </Modal>
    </PageContainer>
  );
};