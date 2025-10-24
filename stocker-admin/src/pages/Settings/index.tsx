import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Form, 
  Input, 
  Select, 
  Switch, 
  Button, 
  Tabs, 
  Space, 
  Typography, 
  Divider, 
  Alert, 
  Upload, 
  Radio, 
  Checkbox, 
  InputNumber, 
  TimePicker, 
  ColorPicker, 
  Slider, 
  Tag, 
  Badge, 
  List, 
  Avatar, 
  Table, 
  Modal, 
  Tooltip, 
  Popconfirm,
  Progress, 
  message, 
  notification 
} from 'antd';
import {
  SettingOutlined,
  SaveOutlined,
  ReloadOutlined,
  MailOutlined,
  LockOutlined,
  GlobalOutlined,
  ApiOutlined,
  DatabaseOutlined,
  CloudOutlined,
  SafetyOutlined,
  BellOutlined,
  UserOutlined,
  TeamOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  FileProtectOutlined,
  KeyOutlined,
  LinkOutlined,
  UploadOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  QuestionCircleOutlined,
  CopyOutlined,
  ExportOutlined,
  ImportOutlined,
  SyncOutlined,
  ThunderboltOutlined,
  WifiOutlined,
  CodeOutlined,
  DesktopOutlined,
  MobileOutlined,
  TabletOutlined,
  ChromeOutlined,
  GithubOutlined,
  GoogleOutlined,
  SlackOutlined,
  VerifiedOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { TwoFactorSettings } from './TwoFactorSettings';
import { systemMonitoringService } from '../../services/api';

const { Title, Text, Paragraph, Link } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;
const { Dragger } = Upload;

interface SystemSetting {
  key: string;
  value: string | number | boolean;
  type: 'string' | 'number' | 'boolean' | 'select' | 'json';
  category: string;
  description?: string;
  editable: boolean;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  variables: string[];
  lastModified: string;
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  createdAt: string;
  lastUsed?: string;
  expiresAt?: string;
  status: 'active' | 'expired' | 'revoked';
}

interface Integration {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'disconnected' | 'error';
  config: any;
  lastSync?: string;
}

const SettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [generalForm] = Form.useForm();
  const [emailForm] = Form.useForm();
  const [securityForm] = Form.useForm();
  const [apiModalVisible, setApiModalVisible] = useState(false);
  const [emailTemplateModalVisible, setEmailTemplateModalVisible] = useState(false);
  const [apiForm] = Form.useForm();
  const [templateForm] = Form.useForm();
  const [systemMetrics, setSystemMetrics] = useState<any>(null);
  const [systemMetricsLoading, setSystemMetricsLoading] = useState(false);

  const [systemSettings, setSystemSettings] = useState<SystemSetting[]>([
    {
      key: 'site_name',
      value: 'Stocker Admin Panel',
      type: 'string',
      category: 'Genel',
      description: 'Sistem adı',
      editable: true
    },
    {
      key: 'site_url',
      value: 'https://admin.stocker.com',
      type: 'string',
      category: 'Genel',
      description: 'Ana URL',
      editable: true
    },
    {
      key: 'maintenance_mode',
      value: false,
      type: 'boolean',
      category: 'Genel',
      description: 'Bakım modu',
      editable: true
    },
    {
      key: 'max_upload_size',
      value: 10485760,
      type: 'number',
      category: 'Sistem',
      description: 'Maksimum yükleme boyutu (byte)',
      editable: true
    },
    {
      key: 'session_timeout',
      value: 30,
      type: 'number',
      category: 'Güvenlik',
      description: 'Oturum zaman aşımı (dakika)',
      editable: true
    },
    {
      key: 'enable_2fa',
      value: true,
      type: 'boolean',
      category: 'Güvenlik',
      description: 'İki faktörlü doğrulama',
      editable: true
    }
  ]);

  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([
    {
      id: '1',
      name: 'Hoş Geldiniz',
      subject: 'Stocker\'a Hoş Geldiniz {{userName}}!',
      content: 'Merhaba {{userName}}, Stocker ailesine hoş geldiniz...',
      variables: ['userName', 'companyName', 'activationLink'],
      lastModified: '2024-01-10'
    },
    {
      id: '2',
      name: 'Şifre Sıfırlama',
      subject: 'Şifre Sıfırlama Talebi',
      content: 'Şifrenizi sıfırlamak için: {{resetLink}}',
      variables: ['userName', 'resetLink', 'expiryTime'],
      lastModified: '2024-01-08'
    },
    {
      id: '3',
      name: 'Fatura Bildirimi',
      subject: 'Faturanız Hazır',
      content: '{{month}} ayı faturanız hazır.',
      variables: ['month', 'amount', 'dueDate'],
      lastModified: '2024-01-05'
    }
  ]);

  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: '1',
      name: 'Production API Key',
      key: 'sk_live_*********************',
      permissions: ['read', 'write', 'delete'],
      createdAt: '2024-01-01',
      lastUsed: '2024-01-15 14:30',
      status: 'active'
    },
    {
      id: '2',
      name: 'Development API Key',
      key: 'sk_test_*********************',
      permissions: ['read', 'write'],
      createdAt: '2023-12-15',
      lastUsed: '2024-01-14 10:00',
      expiresAt: '2024-06-15',
      status: 'active'
    },
    {
      id: '3',
      name: 'Legacy API Key',
      key: 'sk_old_*********************',
      permissions: ['read'],
      createdAt: '2023-06-01',
      status: 'revoked'
    }
  ]);

  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: '1',
      name: 'Google OAuth',
      type: 'oauth',
      status: 'connected',
      config: { clientId: '***', redirectUri: 'https://...' },
      lastSync: '2024-01-15 12:00'
    },
    {
      id: '2',
      name: 'Slack',
      type: 'webhook',
      status: 'connected',
      config: { webhookUrl: 'https://hooks.slack.com/***' },
      lastSync: '2024-01-15 14:00'
    },
    {
      id: '3',
      name: 'GitHub',
      type: 'oauth',
      status: 'disconnected',
      config: {}
    },
    {
      id: '4',
      name: 'AWS S3',
      type: 'storage',
      status: 'connected',
      config: { bucket: 'stocker-uploads', region: 'eu-west-1' },
      lastSync: '2024-01-15 15:30'
    }
  ]);

  // Fetch system metrics when System tab is active
  useEffect(() => {
    if (activeTab === 'system') {
      fetchSystemMetrics();
    }
  }, [activeTab]);

  const fetchSystemMetrics = async () => {
    setSystemMetricsLoading(true);
    try {
      const metrics = await systemMonitoringService.getSystemMetrics();
      setSystemMetrics(metrics);
    } catch (error) {
      console.error('Failed to fetch system metrics:', error);
      message.error('Sistem bilgileri alınamadı');
    } finally {
      setSystemMetricsLoading(false);
    }
  };

  const handleSaveGeneral = () => {
    generalForm.validateFields().then(values => {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        message.success('Genel ayarlar kaydedildi');
      }, 1000);
    });
  };

  const handleSaveEmail = () => {
    emailForm.validateFields().then(values => {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        message.success('E-posta ayarları kaydedildi');
      }, 1000);
    });
  };

  const handleSaveSecurity = () => {
    securityForm.validateFields().then(values => {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        message.success('Güvenlik ayarları kaydedildi');
      }, 1000);
    });
  };

  const handleTestEmail = () => {
    message.loading('Test e-postası gönderiliyor...');
    setTimeout(() => {
      message.success('Test e-postası başarıyla gönderildi');
    }, 2000);
  };

  const handleCreateApiKey = () => {
    apiForm.validateFields().then(values => {
      const newApiKey: ApiKey = {
        id: Date.now().toString(),
        name: values.name,
        key: `sk_${values.type}_${Math.random().toString(36).substring(2)}`,
        permissions: values.permissions,
        createdAt: dayjs().format('YYYY-MM-DD'),
        status: 'active'
      };
      setApiKeys([...apiKeys, newApiKey]);
      message.success('API anahtarı oluşturuldu');
      setApiModalVisible(false);
      apiForm.resetFields();
    });
  };

  const handleRevokeApiKey = (key: ApiKey) => {
    setApiKeys(prev => prev.map(k => 
      k.id === key.id ? { ...k, status: 'revoked' as const } : k
    ));
    message.success('API anahtarı iptal edildi');
  };

  const handleConnectIntegration = (integration: Integration) => {
    setIntegrations(prev => prev.map(i => 
      i.id === integration.id 
        ? { ...i, status: 'connected' as const, lastSync: dayjs().format('YYYY-MM-DD HH:mm') } 
        : i
    ));
    message.success(`${integration.name} bağlandı`);
  };

  const handleDisconnectIntegration = (integration: Integration) => {
    setIntegrations(prev => prev.map(i => 
      i.id === integration.id 
        ? { ...i, status: 'disconnected' as const } 
        : i
    ));
    message.success(`${integration.name} bağlantısı kesildi`);
  };

  const apiKeyColumns = [
    {
      title: 'Ad',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong>{text}</Text>
    },
    {
      title: 'Anahtar',
      dataIndex: 'key',
      key: 'key',
      render: (key: string) => (
        <Space>
          <Text code>{key}</Text>
          <Tooltip title="Kopyala">
            <Button size="small" icon={<CopyOutlined />} />
          </Tooltip>
        </Space>
      )
    },
    {
      title: 'İzinler',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions: string[]) => (
        <Space>
          {permissions.map(p => (
            <Tag key={p} color={p === 'delete' ? 'red' : p === 'write' ? 'orange' : 'blue'}>
              {p}
            </Tag>
          ))}
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
                 status === 'expired' ? 'warning' : 'error'}
          text={status === 'active' ? 'Aktif' :
               status === 'expired' ? 'Süresi Dolmuş' : 'İptal Edilmiş'}
        />
      )
    },
    {
      title: 'Son Kullanım',
      dataIndex: 'lastUsed',
      key: 'lastUsed',
      render: (date?: string) => date || '-'
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_, record: ApiKey) => (
        <Space>
          {record.status === 'active' && (
            <Popconfirm
              title="Bu API anahtarını iptal etmek istediğinize emin misiniz?"
              onConfirm={() => handleRevokeApiKey(record)}
            >
              <Button size="small" danger>İptal Et</Button>
            </Popconfirm>
          )}
          <Button size="small" icon={<DeleteOutlined />} danger>Sil</Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={12}>
            <Title level={4} style={{ margin: 0 }}>
              <SettingOutlined /> Sistem Ayarları
            </Title>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Space>
              <Button icon={<ExportOutlined />}>Dışa Aktar</Button>
              <Button icon={<ImportOutlined />}>İçe Aktar</Button>
              <Button icon={<ReloadOutlined />} onClick={() => window.location.reload()}>
                Sıfırla
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card bordered={false}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Genel Ayarlar" key="general">
            <Form
              form={generalForm}
              layout="vertical"
              initialValues={{
                siteName: 'Stocker Admin Panel',
                siteUrl: 'https://admin.stocker.com',
                adminEmail: 'admin@stocker.com',
                timezone: 'Europe/Istanbul',
                dateFormat: 'DD.MM.YYYY',
                timeFormat: 'HH:mm',
                language: 'tr',
                currency: 'TRY'
              }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="siteName"
                    label="Site Adı"
                    rules={[{ required: true, message: 'Site adı gereklidir' }]}
                  >
                    <Input prefix={<GlobalOutlined />} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="siteUrl"
                    label="Site URL"
                    rules={[{ required: true, message: 'Site URL gereklidir' }]}
                  >
                    <Input prefix={<LinkOutlined />} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="adminEmail"
                    label="Yönetici E-posta"
                    rules={[
                      { required: true, message: 'E-posta gereklidir' },
                      { type: 'email', message: 'Geçerli bir e-posta giriniz' }
                    ]}
                  >
                    <Input prefix={<MailOutlined />} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="timezone"
                    label="Saat Dilimi"
                    rules={[{ required: true, message: 'Saat dilimi seçiniz' }]}
                  >
                    <Select>
                      <Option value="Europe/Istanbul">İstanbul (UTC+3)</Option>
                      <Option value="Europe/London">Londra (UTC+0)</Option>
                      <Option value="America/New_York">New York (UTC-5)</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="dateFormat"
                    label="Tarih Formatı"
                  >
                    <Select>
                      <Option value="DD.MM.YYYY">DD.MM.YYYY</Option>
                      <Option value="MM/DD/YYYY">MM/DD/YYYY</Option>
                      <Option value="YYYY-MM-DD">YYYY-MM-DD</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="timeFormat"
                    label="Saat Formatı"
                  >
                    <Select>
                      <Option value="HH:mm">24 Saat (14:30)</Option>
                      <Option value="hh:mm A">12 Saat (02:30 PM)</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="currency"
                    label="Para Birimi"
                  >
                    <Select>
                      <Option value="TRY">TRY (₺)</Option>
                      <Option value="USD">USD ($)</Option>
                      <Option value="EUR">EUR (€)</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="language"
                    label="Varsayılan Dil"
                  >
                    <Select>
                      <Option value="tr">Türkçe</Option>
                      <Option value="en">English</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="pageSize"
                    label="Sayfa Başına Kayıt"
                  >
                    <Select>
                      <Option value={10}>10</Option>
                      <Option value={25}>25</Option>
                      <Option value={50}>50</Option>
                      <Option value={100}>100</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="maintenanceMode"
                    label="Bakım Modu"
                    valuePropName="checked"
                  >
                    <Switch checkedChildren="Açık" unCheckedChildren="Kapalı" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="debugMode"
                    label="Debug Modu"
                    valuePropName="checked"
                  >
                    <Switch checkedChildren="Açık" unCheckedChildren="Kapalı" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="cacheEnabled"
                    label="Önbellek"
                    valuePropName="checked"
                  >
                    <Switch defaultChecked checkedChildren="Açık" unCheckedChildren="Kapalı" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <Space>
                  <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveGeneral} loading={loading}>
                    Kaydet
                  </Button>
                  <Button icon={<ReloadOutlined />} onClick={() => generalForm.resetFields()}>
                    Sıfırla
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane tab="E-posta Ayarları" key="email">
            <Form
              form={emailForm}
              layout="vertical"
              initialValues={{
                smtpHost: 'smtp.gmail.com',
                smtpPort: 587,
                smtpUser: 'noreply@stocker.com',
                smtpEncryption: 'tls',
                fromName: 'Stocker Admin',
                fromEmail: 'noreply@stocker.com'
              }}
            >
              <Alert
                message="SMTP Konfigürasyonu"
                description="E-posta gönderimi için SMTP sunucu ayarlarını yapılandırın."
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="smtpHost"
                    label="SMTP Sunucu"
                    rules={[{ required: true, message: 'SMTP sunucu gereklidir' }]}
                  >
                    <Input placeholder="smtp.gmail.com" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="smtpPort"
                    label="Port"
                    rules={[{ required: true, message: 'Port gereklidir' }]}
                  >
                    <InputNumber min={1} max={65535} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="smtpUser"
                    label="Kullanıcı Adı"
                    rules={[{ required: true, message: 'Kullanıcı adı gereklidir' }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="smtpPassword"
                    label="Şifre"
                    rules={[{ required: true, message: 'Şifre gereklidir' }]}
                  >
                    <Input.Password />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="smtpEncryption"
                    label="Şifreleme"
                  >
                    <Select>
                      <Option value="none">Yok</Option>
                      <Option value="ssl">SSL</Option>
                      <Option value="tls">TLS</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="smtpTimeout"
                    label="Zaman Aşımı (saniye)"
                  >
                    <InputNumber min={5} max={300} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="fromName"
                    label="Gönderen Adı"
                    rules={[{ required: true, message: 'Gönderen adı gereklidir' }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="fromEmail"
                    label="Gönderen E-posta"
                    rules={[
                      { required: true, message: 'E-posta gereklidir' },
                      { type: 'email', message: 'Geçerli bir e-posta giriniz' }
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <Space>
                  <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveEmail} loading={loading}>
                    Kaydet
                  </Button>
                  <Button icon={<MailOutlined />} onClick={handleTestEmail}>
                    Test E-postası Gönder
                  </Button>
                  <Button icon={<ReloadOutlined />} onClick={() => emailForm.resetFields()}>
                    Sıfırla
                  </Button>
                </Space>
              </Form.Item>

              <Divider />

              <Title level={5}>E-posta Şablonları</Title>
              <Space style={{ marginBottom: 16 }}>
                <Button icon={<PlusOutlined />} onClick={() => setEmailTemplateModalVisible(true)}>
                  Yeni Şablon
                </Button>
              </Space>

              <List
                dataSource={emailTemplates}
                renderItem={template => (
                  <List.Item
                    actions={[
                      <Button size="small" icon={<EditOutlined />}>Düzenle</Button>,
                      <Button size="small" icon={<EyeOutlined />}>Önizle</Button>,
                      <Button size="small" icon={<DeleteOutlined />} danger>Sil</Button>
                    ]}
                  >
                    <List.Item.Meta
                      title={template.name}
                      description={
                        <Space direction="vertical" size={0}>
                          <Text type="secondary">Konu: {template.subject}</Text>
                          <Space>
                            {template.variables.map(v => (
                              <Tag key={v} color="blue">{`{{${v}}}`}</Tag>
                            ))}
                          </Space>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Form>
          </TabPane>

          <TabPane tab="Güvenlik" key="security">
            <TwoFactorSettings />
          </TabPane>

          <TabPane tab="API Ayarları" key="api">
            <Alert
              message="API Erişim Yönetimi"
              description="Sistem API'lerine erişim için anahtar ve izin yönetimi."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Space style={{ marginBottom: 16 }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setApiModalVisible(true)}>
                Yeni API Anahtarı
              </Button>
              <Button icon={<SyncOutlined />}>Tümünü Yenile</Button>
            </Space>

            <Table
              columns={apiKeyColumns}
              dataSource={apiKeys}
              rowKey="id"
              pagination={false}
            />

            <Divider />

            <Title level={5}>Rate Limiting</Title>
            <Row gutter={16}>
              <Col span={8}>
                <Form layout="vertical">
                  <Form.Item label="İstek/Dakika">
                    <InputNumber defaultValue={60} min={1} max={1000} style={{ width: '100%' }} />
                  </Form.Item>
                </Form>
              </Col>
              <Col span={8}>
                <Form layout="vertical">
                  <Form.Item label="İstek/Saat">
                    <InputNumber defaultValue={1000} min={1} max={10000} style={{ width: '100%' }} />
                  </Form.Item>
                </Form>
              </Col>
              <Col span={8}>
                <Form layout="vertical">
                  <Form.Item label="İstek/Gün">
                    <InputNumber defaultValue={10000} min={1} max={100000} style={{ width: '100%' }} />
                  </Form.Item>
                </Form>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Entegrasyonlar" key="integrations">
            <Row gutter={[16, 16]}>
              {integrations.map(integration => (
                <Col span={12} key={integration.id}>
                  <Card
                    actions={[
                      integration.status === 'connected' ? (
                        <Button 
                          size="small" 
                          danger 
                          onClick={() => handleDisconnectIntegration(integration)}
                        >
                          Bağlantıyı Kes
                        </Button>
                      ) : (
                        <Button 
                          size="small" 
                          type="primary"
                          onClick={() => handleConnectIntegration(integration)}
                        >
                          Bağlan
                        </Button>
                      ),
                      <Button size="small" icon={<SettingOutlined />}>
                        Yapılandır
                      </Button>
                    ]}
                  >
                    <Card.Meta
                      avatar={
                        <Avatar 
                          icon={
                            integration.name === 'Google OAuth' ? <GoogleOutlined /> :
                            integration.name === 'Slack' ? <SlackOutlined /> :
                            integration.name === 'GitHub' ? <GithubOutlined /> :
                            <CloudOutlined />
                          }
                          style={{ 
                            backgroundColor: integration.status === 'connected' ? '#52c41a' : '#d9d9d9' 
                          }}
                        />
                      }
                      title={
                        <Space>
                          {integration.name}
                          <Badge 
                            status={integration.status === 'connected' ? 'success' : 'default'}
                            text={integration.status === 'connected' ? 'Bağlı' : 'Bağlı Değil'}
                          />
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size={0}>
                          <Text type="secondary">Tip: {integration.type}</Text>
                          {integration.lastSync && (
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              Son senkronizasyon: {integration.lastSync}
                            </Text>
                          )}
                        </Space>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </TabPane>

          <TabPane tab="Sistem Bilgisi" key="system">
            {systemMetricsLoading ? (
              <Card loading={true}>Yükleniyor...</Card>
            ) : systemMetrics ? (
              <>
                <Row gutter={16}>
                  <Col span={12}>
                    <Card
                      title="CPU Bilgileri"
                      size="small"
                      extra={<Button size="small" icon={<SyncOutlined />} onClick={fetchSystemMetrics}>Yenile</Button>}
                    >
                      <List size="small">
                        <List.Item>
                          <Text>Kullanım:</Text>
                          <Progress
                            percent={Math.round(systemMetrics.cpu.usage)}
                            size="small"
                            status={systemMetrics.cpu.usage > 80 ? 'exception' : 'normal'}
                          />
                        </List.Item>
                        <List.Item>
                          <Text>Çekirdek Sayısı:</Text>
                          <Tag color="blue">{systemMetrics.cpu.cores} Core</Tag>
                        </List.Item>
                        <List.Item>
                          <Text>Frekans:</Text>
                          <Text strong>{systemMetrics.cpu.frequency.toFixed(2)} MHz</Text>
                        </List.Item>
                      </List>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card title="Bellek Bilgileri" size="small">
                      <List size="small">
                        <List.Item>
                          <Text>Kullanım:</Text>
                          <Progress
                            percent={Math.round(systemMetrics.memory.usagePercentage)}
                            size="small"
                            status={systemMetrics.memory.usagePercentage > 80 ? 'exception' : 'normal'}
                          />
                        </List.Item>
                        <List.Item>
                          <Text>Kullanılan:</Text>
                          <Text strong>{(systemMetrics.memory.used / 1024 / 1024 / 1024).toFixed(2)} GB</Text>
                        </List.Item>
                        <List.Item>
                          <Text>Toplam:</Text>
                          <Text strong>{(systemMetrics.memory.total / 1024 / 1024 / 1024).toFixed(2)} GB</Text>
                        </List.Item>
                        <List.Item>
                          <Text>Kullanılabilir:</Text>
                          <Text strong>{(systemMetrics.memory.available / 1024 / 1024 / 1024).toFixed(2)} GB</Text>
                        </List.Item>
                      </List>
                    </Card>
                  </Col>
                </Row>

                <Divider />

                <Row gutter={16}>
                  <Col span={12}>
                    <Card title="Disk Bilgileri" size="small">
                      <List size="small">
                        <List.Item>
                          <Text>Kullanım:</Text>
                          <Progress
                            percent={Math.round(systemMetrics.disk.usagePercentage)}
                            size="small"
                            status={systemMetrics.disk.usagePercentage > 80 ? 'exception' : 'normal'}
                          />
                        </List.Item>
                        <List.Item>
                          <Text>Kullanılan:</Text>
                          <Text strong>{(systemMetrics.disk.used / 1024 / 1024 / 1024).toFixed(2)} GB</Text>
                        </List.Item>
                        <List.Item>
                          <Text>Toplam:</Text>
                          <Text strong>{(systemMetrics.disk.total / 1024 / 1024 / 1024).toFixed(2)} GB</Text>
                        </List.Item>
                        <List.Item>
                          <Text>Boş:</Text>
                          <Text strong>{(systemMetrics.disk.free / 1024 / 1024 / 1024).toFixed(2)} GB</Text>
                        </List.Item>
                      </List>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card title="Ağ Bilgileri" size="small">
                      <List size="small">
                        <List.Item>
                          <Text>Gönderilen:</Text>
                          <Text strong>{(systemMetrics.network.bytesSent / 1024 / 1024).toFixed(2)} MB</Text>
                        </List.Item>
                        <List.Item>
                          <Text>Alınan:</Text>
                          <Text strong>{(systemMetrics.network.bytesReceived / 1024 / 1024).toFixed(2)} MB</Text>
                        </List.Item>
                        <List.Item>
                          <Text>Hız:</Text>
                          <Text strong>{systemMetrics.network.speed} Mbps</Text>
                        </List.Item>
                        <List.Item>
                          <Text>Son Güncelleme:</Text>
                          <Text type="secondary">{dayjs(systemMetrics.timestamp).format('DD.MM.YYYY HH:mm:ss')}</Text>
                        </List.Item>
                      </List>
                    </Card>
                  </Col>
                </Row>
              </>
            ) : (
              <Alert
                message="Sistem Bilgileri Yüklenemedi"
                description="Sistem bilgilerini yüklerken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
                type="warning"
                showIcon
                action={
                  <Button size="small" type="primary" onClick={fetchSystemMetrics}>
                    Tekrar Dene
                  </Button>
                }
              />
            )}
          </TabPane>
        </Tabs>
      </Card>

      {/* API Key Modal */}
      <Modal
        title="Yeni API Anahtarı Oluştur"
        visible={apiModalVisible}
        onOk={handleCreateApiKey}
        onCancel={() => setApiModalVisible(false)}
        width={500}
      >
        <Form form={apiForm} layout="vertical">
          <Form.Item
            name="name"
            label="Anahtar Adı"
            rules={[{ required: true, message: 'Anahtar adı gereklidir' }]}
          >
            <Input placeholder="Örn: Production API Key" />
          </Form.Item>
          <Form.Item
            name="type"
            label="Anahtar Tipi"
            rules={[{ required: true, message: 'Tip seçiniz' }]}
          >
            <Radio.Group>
              <Radio value="live">Production</Radio>
              <Radio value="test">Test</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            name="permissions"
            label="İzinler"
            rules={[{ required: true, message: 'En az bir izin seçiniz' }]}
          >
            <Checkbox.Group>
              <Checkbox value="read">Okuma</Checkbox>
              <Checkbox value="write">Yazma</Checkbox>
              <Checkbox value="delete">Silme</Checkbox>
            </Checkbox.Group>
          </Form.Item>
          <Form.Item
            name="expiry"
            label="Geçerlilik Süresi"
          >
            <Select placeholder="Süresiz">
              <Option value="30">30 Gün</Option>
              <Option value="90">90 Gün</Option>
              <Option value="180">180 Gün</Option>
              <Option value="365">1 Yıl</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Email Template Modal */}
      <Modal
        title="E-posta Şablonu"
        visible={emailTemplateModalVisible}
        onOk={() => {
          message.success('Şablon kaydedildi');
          setEmailTemplateModalVisible(false);
        }}
        onCancel={() => setEmailTemplateModalVisible(false)}
        width={700}
      >
        <Form form={templateForm} layout="vertical">
          <Form.Item
            name="name"
            label="Şablon Adı"
            rules={[{ required: true, message: 'Şablon adı gereklidir' }]}
          >
            <Input placeholder="Örn: Hoş Geldiniz E-postası" />
          </Form.Item>
          <Form.Item
            name="subject"
            label="Konu"
            rules={[{ required: true, message: 'Konu gereklidir' }]}
          >
            <Input placeholder="Örn: {{companyName}} - Hoş Geldiniz!" />
          </Form.Item>
          <Form.Item
            name="content"
            label="İçerik"
            rules={[{ required: true, message: 'İçerik gereklidir' }]}
          >
            <TextArea 
              rows={8} 
              placeholder="Merhaba {{userName}},&#10;&#10;Stocker ailesine hoş geldiniz..."
            />
          </Form.Item>
          <Form.Item
            name="variables"
            label="Değişkenler"
          >
            <Select mode="tags" placeholder="Değişken ekleyin">
              <Option value="userName">userName</Option>
              <Option value="companyName">companyName</Option>
              <Option value="email">email</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SettingsPage;