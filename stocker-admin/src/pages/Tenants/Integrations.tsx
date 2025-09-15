import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Tabs,
  Table,
  Tag,
  Switch,
  Modal,
  Form,
  Input,
  Select,
  message,
  Badge,
  Avatar,
  Tooltip,
  Alert,
  List,
  Descriptions,
  Drawer,
  Steps,
  Progress,
  Timeline,
  Divider,
  Radio,
  Checkbox,
  InputNumber,
  Upload,
} from 'antd';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import {
  ApiOutlined,
  PlusOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  CloudOutlined,
  DatabaseOutlined,
  MailOutlined,
  MessageOutlined,
  ShoppingOutlined,
  BankOutlined,
  LineChartOutlined,
  SecurityScanOutlined,
  FileTextOutlined,
  GlobalOutlined,
  KeyOutlined,
  LinkOutlined,
  SyncOutlined,
  WarningOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  UploadOutlined,
  DownloadOutlined,
  EyeOutlined,
  CopyOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;

interface Integration {
  id: string;
  name: string;
  type: string;
  category: 'payment' | 'shipping' | 'analytics' | 'email' | 'sms' | 'crm' | 'erp' | 'social' | 'storage';
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  version: string;
  lastSync?: string;
  description: string;
  icon: string;
  config: Record<string, any>;
  endpoints: string[];
  permissions: string[];
  webhookUrl?: string;
  apiKeyMasked?: string;
}

interface IntegrationTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  isPopular: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  setupSteps: number;
  pricing: string;
}

const TenantIntegrations: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('active');
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [setupStep, setSetupStep] = useState(0);

  // Mock data
  const mockIntegrations: Integration[] = [
    {
      id: '1',
      name: 'Stripe Payments',
      type: 'stripe',
      category: 'payment',
      status: 'connected',
      version: 'v2023.12.01',
      lastSync: '2024-12-07T15:30:00Z',
      description: 'Güvenli ödeme işlemleri için Stripe entegrasyonu',
      icon: 'stripe',
      config: {
        publishableKey: 'mock_pub_key_abc123...',
        secretKey: 'mock_secret_key_xyz789...',
        webhookEndpoint: 'https://api.stocker.com/webhooks/stripe',
      },
      endpoints: ['/api/payments', '/api/refunds', '/api/customers'],
      permissions: ['payments.read', 'payments.write', 'customers.read'],
      webhookUrl: 'https://api.stocker.com/webhooks/stripe',
      apiKeyMasked: 'mock_pub...123',
    },
    {
      id: '2',
      name: 'SendGrid Email',
      type: 'sendgrid',
      category: 'email',
      status: 'connected',
      version: 'v3.12.4',
      lastSync: '2024-12-07T14:20:00Z',
      description: 'E-posta gönderimi için SendGrid entegrasyonu',
      icon: 'sendgrid',
      config: {
        apiKey: 'SG.Ab12Cd34...',
        fromEmail: 'noreply@abc-corp.com',
        fromName: 'ABC Corporation',
      },
      endpoints: ['/api/emails/send', '/api/emails/templates'],
      permissions: ['email.send', 'templates.read'],
      apiKeyMasked: 'SG.Ab12...34Ef',
    },
    {
      id: '3',
      name: 'Google Analytics',
      type: 'ga4',
      category: 'analytics',
      status: 'syncing',
      version: 'v4.2024.01',
      lastSync: '2024-12-07T13:45:00Z',
      description: 'Web sitesi analitikleri için Google Analytics 4',
      icon: 'google-analytics',
      config: {
        measurementId: 'G-XXXXXXXXXX',
        trackingId: 'UA-XXXXXXXXX-1',
      },
      endpoints: ['/api/analytics/events', '/api/analytics/reports'],
      permissions: ['analytics.read', 'events.write'],
    },
    {
      id: '4',
      name: 'Slack Notifications',
      type: 'slack',
      category: 'sms',
      status: 'error',
      version: 'v1.8.2',
      lastSync: '2024-12-06T09:15:00Z',
      description: 'Ekip bildirimleri için Slack entegrasyonu',
      icon: 'slack',
      config: {
        webhookUrl: 'https://hooks.slack.com/services/...',
        channel: '#notifications',
      },
      endpoints: ['/api/notifications/slack'],
      permissions: ['notifications.send'],
    },
    {
      id: '5',
      name: 'HubSpot CRM',
      type: 'hubspot',
      category: 'crm',
      status: 'disconnected',
      version: 'v3.2024.02',
      description: 'Müşteri ilişkileri yönetimi için HubSpot',
      icon: 'hubspot',
      config: {},
      endpoints: ['/api/contacts', '/api/deals', '/api/companies'],
      permissions: [],
    },
  ];

  const mockTemplates: IntegrationTemplate[] = [
    {
      id: 'shopify',
      name: 'Shopify',
      category: 'E-Commerce',
      description: 'E-ticaret mağazanızı yönetin',
      icon: 'shopify',
      isPopular: true,
      difficulty: 'medium',
      setupSteps: 4,
      pricing: 'Ücretsiz',
    },
    {
      id: 'wordpress',
      name: 'WordPress',
      category: 'CMS',
      description: 'Blog ve web sitenizi entegre edin',
      icon: 'wordpress',
      isPopular: true,
      difficulty: 'easy',
      setupSteps: 3,
      pricing: 'Ücretsiz',
    },
    {
      id: 'salesforce',
      name: 'Salesforce',
      category: 'CRM',
      description: 'Müşteri verilerini senkronize edin',
      icon: 'salesforce',
      isPopular: false,
      difficulty: 'hard',
      setupSteps: 6,
      pricing: '$19/ay',
    },
    {
      id: 'mailchimp',
      name: 'MailChimp',
      category: 'E-posta Pazarlama',
      description: 'E-posta kampanyalarını yönetin',
      icon: 'mailchimp',
      isPopular: true,
      difficulty: 'easy',
      setupSteps: 2,
      pricing: 'Ücretsiz',
    },
  ];

  const statusColors = {
    connected: 'success',
    disconnected: 'default',
    error: 'error',
    syncing: 'processing',
  };

  const statusTexts = {
    connected: 'Bağlı',
    disconnected: 'Bağlı Değil',
    error: 'Hata',
    syncing: 'Senkronizasyon',
  };

  const categoryIcons = {
    payment: <BankOutlined />,
    shipping: <ShoppingOutlined />,
    analytics: <LineChartOutlined />,
    email: <MailOutlined />,
    sms: <MessageOutlined />,
    crm: <DatabaseOutlined />,
    erp: <FileTextOutlined />,
    social: <GlobalOutlined />,
    storage: <CloudOutlined />,
  };

  const columns: ProColumns<Integration>[] = [
    {
      title: 'Entegrasyon',
      key: 'integration',
      width: 300,
      render: (_, record) => (
        <Space>
          <Avatar
            src={`/integrations/${record.icon}.png`}
            icon={categoryIcons[record.category]}
            size="large"
          />
          <Space direction="vertical" size={0}>
            <Text strong>{record.name}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.description}
            </Text>
            <Tag size="small">{record.version}</Tag>
          </Space>
        </Space>
      ),
    },
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category: keyof typeof categoryIcons) => (
        <Space>
          {categoryIcons[category]}
          <Text style={{ textTransform: 'capitalize' }}>{category}</Text>
        </Space>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: keyof typeof statusColors, record) => (
        <Space direction="vertical" size={0}>
          <Badge
            status={statusColors[status] as any}
            text={statusTexts[status]}
          />
          {record.lastSync && status !== 'disconnected' && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              Son: {dayjs(record.lastSync).fromNow()}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'API Anahtarı',
      key: 'apiKey',
      width: 150,
      render: (_, record) => (
        record.apiKeyMasked ? (
          <Space>
            <Text code style={{ fontSize: 11 }}>
              {record.apiKeyMasked}
            </Text>
            <Tooltip title="Tam anahtarı göster">
              <Button type="text" size="small" icon={<EyeOutlined />} />
            </Tooltip>
          </Space>
        ) : (
          <Text type="secondary">-</Text>
        )
      ),
    },
    {
      title: 'Son Aktivite',
      dataIndex: 'lastSync',
      key: 'lastSync',
      width: 120,
      render: (date: string) => (
        date ? dayjs(date).format('DD.MM.YYYY HH:mm') : '-'
      ),
      sorter: (a, b) => {
        if (!a.lastSync && !b.lastSync) return 0;
        if (!a.lastSync) return 1;
        if (!b.lastSync) return -1;
        return dayjs(a.lastSync).unix() - dayjs(b.lastSync).unix();
      },
    },
    {
      title: 'İşlemler',
      key: 'actions',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title="Detaylar">
            <Button
              type="text"
              icon={<InfoCircleOutlined />}
              onClick={() => {
                setSelectedIntegration(record);
                setIsDrawerVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Ayarlar">
            <Button
              type="text"
              icon={<SettingOutlined />}
              onClick={() => handleConfigure(record)}
            />
          </Tooltip>
          <Tooltip title={record.status === 'connected' ? 'Bağlantıyı Kes' : 'Bağlan'}>
            <Button
              type="text"
              icon={record.status === 'connected' ? <CloseOutlined /> : <LinkOutlined />}
              onClick={() => handleToggleConnection(record)}
            />
          </Tooltip>
          <Tooltip title="Sil">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleConfigure = (integration: Integration) => {
    setSelectedIntegration(integration);
    form.setFieldsValue(integration.config);
    setIsModalVisible(true);
  };

  const handleToggleConnection = async (integration: Integration) => {
    const action = integration.status === 'connected' ? 'disconnect' : 'connect';
    
    await Swal.fire({
      title: action === 'connect' ? 'Entegrasyonu Bağla' : 'Bağlantıyı Kes',
      text: `${integration.name} entegrasyonunu ${action === 'connect' ? 'bağlamak' : 'kesmek'} istediğinize emin misiniz?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: action === 'connect' ? 'Bağla' : 'Kes',
      cancelButtonText: 'İptal',
    }).then((result) => {
      if (result.isConfirmed) {
        message.success(`${integration.name} başarıyla ${action === 'connect' ? 'bağlandı' : 'kesildi'}`);
      }
    });
  };

  const handleDelete = async (integration: Integration) => {
    await Swal.fire({
      title: 'Entegrasyonu Sil',
      text: `${integration.name} entegrasyonunu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sil',
      cancelButtonText: 'İptal',
      confirmButtonColor: '#ff4d4f',
    }).then((result) => {
      if (result.isConfirmed) {
        message.success(`${integration.name} entegrasyonu silindi`);
      }
    });
  };

  const handleSetup = (template: IntegrationTemplate) => {
    setSetupStep(0);
    setSelectedIntegration({
      id: template.id,
      name: template.name,
      type: template.id,
      category: template.category.toLowerCase() as any,
      status: 'disconnected',
      version: 'v1.0.0',
      description: template.description,
      icon: template.icon,
      config: {},
      endpoints: [],
      permissions: [],
    });
    setIsModalVisible(true);
  };

  const handleTestConnection = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    message.success('Bağlantı testi başarılı');
    setLoading(false);
  };

  const IntegrationDrawer = () => (
    <Drawer
      title={`Entegrasyon: ${selectedIntegration?.name}`}
      width={800}
      open={isDrawerVisible}
      onClose={() => setIsDrawerVisible(false)}
      extra={
        <Space>
          <Button icon={<EditOutlined />}>Düzenle</Button>
          <Button icon={<SyncOutlined />}>Senkronize Et</Button>
        </Space>
      }
    >
      {selectedIntegration && (
        <Tabs defaultActiveKey="details">
          <TabPane tab="Detaylar" key="details">
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Ad">
                {selectedIntegration.name}
              </Descriptions.Item>
              <Descriptions.Item label="Tip">
                {selectedIntegration.type}
              </Descriptions.Item>
              <Descriptions.Item label="Kategori">
                <Space>
                  {categoryIcons[selectedIntegration.category]}
                  {selectedIntegration.category}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Durum">
                <Badge
                  status={statusColors[selectedIntegration.status]}
                  text={statusTexts[selectedIntegration.status]}
                />
              </Descriptions.Item>
              <Descriptions.Item label="Sürüm">
                {selectedIntegration.version}
              </Descriptions.Item>
              <Descriptions.Item label="Son Senkronizasyon">
                {selectedIntegration.lastSync 
                  ? dayjs(selectedIntegration.lastSync).format('DD.MM.YYYY HH:mm')
                  : 'Hiç senkronize edilmedi'
                }
              </Descriptions.Item>
              <Descriptions.Item label="Açıklama">
                {selectedIntegration.description}
              </Descriptions.Item>
              {selectedIntegration.webhookUrl && (
                <Descriptions.Item label="Webhook URL">
                  <Space>
                    <Text code>{selectedIntegration.webhookUrl}</Text>
                    <Button 
                      size="small" 
                      icon={<CopyOutlined />}
                      onClick={() => {
                        navigator.clipboard.writeText(selectedIntegration.webhookUrl!);
                        message.success('URL kopyalandı');
                      }}
                    />
                  </Space>
                </Descriptions.Item>
              )}
            </Descriptions>

            {selectedIntegration.endpoints.length > 0 && (
              <>
                <Divider />
                <Title level={5}>API Endpoints</Title>
                <List
                  size="small"
                  dataSource={selectedIntegration.endpoints}
                  renderItem={(endpoint) => (
                    <List.Item>
                      <Text code>{endpoint}</Text>
                    </List.Item>
                  )}
                />
              </>
            )}

            {selectedIntegration.permissions.length > 0 && (
              <>
                <Divider />
                <Title level={5}>İzinler</Title>
                <Space wrap>
                  {selectedIntegration.permissions.map(permission => (
                    <Tag key={permission} color="blue">
                      {permission}
                    </Tag>
                  ))}
                </Space>
              </>
            )}
          </TabPane>

          <TabPane tab="Konfigürasyon" key="config">
            <Card size="small">
              <pre style={{ background: '#f5f5f5', padding: 16, borderRadius: 4 }}>
                {JSON.stringify(selectedIntegration.config, null, 2)}
              </pre>
            </Card>
          </TabPane>

          <TabPane tab="Loglar" key="logs">
            <Timeline
              items={[
                {
                  color: 'green',
                  children: (
                    <div>
                      <Text strong>Bağlantı başarılı</Text>
                      <br />
                      <Text type="secondary">2024-12-07 15:30:00</Text>
                    </div>
                  ),
                },
                {
                  color: 'blue',
                  children: (
                    <div>
                      <Text strong>Senkronizasyon tamamlandı</Text>
                      <br />
                      <Text type="secondary">2024-12-07 14:20:00</Text>
                    </div>
                  ),
                },
                {
                  color: 'orange',
                  children: (
                    <div>
                      <Text strong>Konfigürasyon güncellendi</Text>
                      <br />
                      <Text type="secondary">2024-12-07 13:45:00</Text>
                    </div>
                  ),
                },
              ]}
            />
          </TabPane>
        </Tabs>
      )}
    </Drawer>
  );

  const SetupModal = () => (
    <Modal
      title="Entegrasyon Kurulumu"
      open={isModalVisible}
      onCancel={() => setIsModalVisible(false)}
      width={800}
      footer={
        <Space>
          <Button onClick={() => setIsModalVisible(false)}>
            İptal
          </Button>
          <Button onClick={handleTestConnection} loading={loading}>
            Bağlantıyı Test Et
          </Button>
          <Button type="primary">
            Kurulumu Tamamla
          </Button>
        </Space>
      }
    >
      <Steps current={setupStep} style={{ marginBottom: 24 }}>
        <Step title="Kimlik Bilgileri" />
        <Step title="Konfigürasyon" />
        <Step title="Test" />
        <Step title="Tamamla" />
      </Steps>

      <Form form={form} layout="vertical">
        {setupStep === 0 && (
          <>
            <Form.Item
              name="apiKey"
              label="API Anahtarı"
              rules={[{ required: true, message: 'API anahtarı gerekli' }]}
            >
              <Input.Password placeholder="API anahtarınızı girin" />
            </Form.Item>
            <Form.Item
              name="secretKey"
              label="Secret Key (Opsiyonel)"
            >
              <Input.Password placeholder="Secret key'inizi girin" />
            </Form.Item>
          </>
        )}

        {setupStep === 1 && (
          <>
            <Form.Item
              name="webhookUrl"
              label="Webhook URL"
            >
              <Input placeholder="https://your-app.com/webhooks" />
            </Form.Item>
            <Form.Item
              name="environment"
              label="Ortam"
              initialValue="production"
            >
              <Radio.Group>
                <Radio value="production">Production</Radio>
                <Radio value="staging">Staging</Radio>
                <Radio value="development">Development</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item
              name="permissions"
              label="İzinler"
            >
              <Checkbox.Group>
                <Row>
                  <Col span={8}><Checkbox value="read">Okuma</Checkbox></Col>
                  <Col span={8}><Checkbox value="write">Yazma</Checkbox></Col>
                  <Col span={8}><Checkbox value="delete">Silme</Checkbox></Col>
                </Row>
              </Checkbox.Group>
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );

  const ActiveTab = () => (
    <Card>
      <ProTable<Integration>
        columns={columns}
        dataSource={mockIntegrations.filter(i => i.status !== 'disconnected')}
        rowKey="id"
        search={false}
        pagination={{ pageSize: 10 }}
        toolBarRender={() => [
          <Button key="refresh" icon={<ReloadOutlined />}>
            Yenile
          </Button>,
          <Button key="sync" icon={<SyncOutlined />}>
            Tümünü Senkronize Et
          </Button>,
        ]}
        scroll={{ x: 1200 }}
      />
    </Card>
  );

  const AvailableTab = () => (
    <Row gutter={[16, 16]}>
      {mockTemplates.map((template) => (
        <Col xs={24} sm={12} lg={8} xl={6} key={template.id}>
          <Card
            hoverable
            actions={[
              <Button
                type="primary"
                size="small"
                onClick={() => handleSetup(template)}
              >
                Kur
              </Button>,
              <Button size="small" icon={<InfoCircleOutlined />}>
                Detay
              </Button>,
            ]}
          >
            <Card.Meta
              avatar={
                <Avatar
                  src={`/integrations/${template.icon}.png`}
                  icon={<ApiOutlined />}
                  size="large"
                />
              }
              title={
                <Space>
                  {template.name}
                  {template.isPopular && (
                    <Badge count="Popüler" style={{ backgroundColor: '#1890ff' }} />
                  )}
                </Space>
              }
              description={
                <Space direction="vertical" size={4}>
                  <Text type="secondary">{template.description}</Text>
                  <Space size="small">
                    <Tag color="blue">{template.category}</Tag>
                    <Tag color={
                      template.difficulty === 'easy' ? 'green' :
                      template.difficulty === 'medium' ? 'orange' : 'red'
                    }>
                      {template.difficulty === 'easy' ? 'Kolay' :
                       template.difficulty === 'medium' ? 'Orta' : 'Zor'}
                    </Tag>
                  </Space>
                  <Space size="small">
                    <Text type="secondary">
                      {template.setupSteps} adım • {template.pricing}
                    </Text>
                  </Space>
                </Space>
              }
            />
          </Card>
        </Col>
      ))}
    </Row>
  );

  return (
    <PageContainer
      header={{
        title: 'Entegrasyonlar',
        breadcrumb: {
          items: [
            { title: 'Ana Sayfa', path: '/' },
            { title: 'Tenants', path: '/tenants' },
            { title: 'ABC Corporation', path: `/tenants/${id}` },
            { title: 'Entegrasyonlar' },
          ],
        },
        onBack: () => navigate(`/tenants/${id}`),
      }}
    >
      <Alert
        message="Entegrasyon Yönetimi"
        description="Uygulamanızı üçüncü taraf servislerle entegre edin ve iş akışlarınızı otomatikleştirin."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane 
          tab={
            <Space>
              <LinkOutlined />
              Aktif Entegrasyonlar
              <Badge 
                count={mockIntegrations.filter(i => i.status !== 'disconnected').length} 
                style={{ backgroundColor: '#52c41a' }} 
              />
            </Space>
          } 
          key="active"
        >
          <ActiveTab />
        </TabPane>
        
        <TabPane 
          tab={
            <Space>
              <PlusOutlined />
              Mevcut Entegrasyonlar
              <Badge 
                count={mockTemplates.length} 
                style={{ backgroundColor: '#1890ff' }} 
              />
            </Space>
          } 
          key="available"
        >
          <AvailableTab />
        </TabPane>
      </Tabs>

      <SetupModal />
      <IntegrationDrawer />
    </PageContainer>
  );
};

export default TenantIntegrations;