import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Tabs,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Button,
  Space,
  Typography,
  Divider,
  Alert,
  message,
  notification,
  Upload,
  ColorPicker,
  Slider,
  Radio,
  Checkbox,
  TimePicker,
  DatePicker,
  Tag,
  Tooltip,
  Progress,
  List,
  Avatar,
  Badge,
  Descriptions,
  Table,
  Modal,
  Drawer,
  Spin,
  Result,
  Skeleton,
  Tree,
  TreeSelect,
  Cascader,
  AutoComplete,
  Mentions,
  Rate,
  Transfer,
} from 'antd';
import type { UploadProps, TabsProps } from 'antd';
import {
  SettingOutlined,
  GlobalOutlined,
  SecurityScanOutlined,
  MailOutlined,
  DatabaseOutlined,
  CloudServerOutlined,
  ApiOutlined,
  BellOutlined,
  UserOutlined,
  KeyOutlined,
  LockOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
  RocketOutlined,
  DollarOutlined,
  FileTextOutlined,
  CodeOutlined,
  BugOutlined,
  ExperimentOutlined,
  ToolOutlined,
  ControlOutlined,
  ApartmentOutlined,
  BlockOutlined,
  ClusterOutlined,
  CloudUploadOutlined,
  CloudDownloadOutlined,
  SyncOutlined,
  ReloadOutlined,
  SaveOutlined,
  ExportOutlined,
  ImportOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined,
  PlusOutlined,
  MinusOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  ScissorOutlined,
  FolderOutlined,
  FolderOpenOutlined,
  FileAddOutlined,
  FileDoneOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  FileMarkdownOutlined,
  FileZipOutlined,
  DesktopOutlined,
  MobileOutlined,
  TabletOutlined,
  LaptopOutlined,
  ChromeOutlined,
  GithubOutlined,
  SlackOutlined,
  GoogleOutlined,
  FacebookOutlined,
  TwitterOutlined,
  LinkedinOutlined,
  InstagramOutlined,
  WhatsAppOutlined,
} from '@ant-design/icons';
import { ProForm, ProFormText, ProFormSelect, ProFormSwitch, ProFormDigit, ProFormTextArea } from '@ant-design/pro-components';
import dayjs from 'dayjs';
import './system-settings-enhanced.css';

const { Title, Text, Paragraph, Link } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;
const { Dragger } = Upload;
const { confirm } = Modal;

interface SystemConfig {
  general: {
    siteName: string;
    siteUrl: string;
    adminEmail: string;
    supportEmail: string;
    timezone: string;
    dateFormat: string;
    language: string;
    currency: string;
    maintenanceMode: boolean;
    maintenanceMessage: string;
  };
  security: {
    passwordMinLength: number;
    passwordRequireUppercase: boolean;
    passwordRequireLowercase: boolean;
    passwordRequireNumbers: boolean;
    passwordRequireSpecialChars: boolean;
    passwordExpiryDays: number;
    maxLoginAttempts: number;
    lockoutDuration: number;
    twoFactorAuth: boolean;
    sessionTimeout: number;
    ipWhitelist: string[];
    ipBlacklist: string[];
    enableCaptcha: boolean;
    enableSSL: boolean;
    enableCSRF: boolean;
  };
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpUsername: string;
    smtpPassword: string;
    smtpEncryption: 'none' | 'tls' | 'ssl';
    fromName: string;
    fromEmail: string;
    replyToEmail: string;
    emailSignature: string;
    enableEmailQueue: boolean;
    maxEmailsPerHour: number;
  };
  database: {
    connectionString: string;
    maxConnections: number;
    connectionTimeout: number;
    commandTimeout: number;
    enableConnectionPooling: boolean;
    minPoolSize: number;
    maxPoolSize: number;
    enableAutoMigration: boolean;
    backupSchedule: string;
    retentionDays: number;
  };
  storage: {
    provider: 'local' | 'aws' | 'azure' | 'gcp';
    localPath: string;
    awsBucket: string;
    awsRegion: string;
    awsAccessKey: string;
    awsSecretKey: string;
    azureContainer: string;
    azureConnectionString: string;
    gcpBucket: string;
    gcpProjectId: string;
    maxFileSize: number;
    allowedFileTypes: string[];
  };
  api: {
    enableApi: boolean;
    apiVersion: string;
    rateLimit: number;
    rateLimitWindow: number;
    enableApiKey: boolean;
    enableOAuth: boolean;
    corsOrigins: string[];
    enableSwagger: boolean;
    enableGraphQL: boolean;
    maxRequestSize: number;
    timeout: number;
  };
  notifications: {
    enableEmailNotifications: boolean;
    enablePushNotifications: boolean;
    enableSmsNotifications: boolean;
    enableInAppNotifications: boolean;
    enableSlackIntegration: boolean;
    slackWebhookUrl: string;
    enableWebhooks: boolean;
    webhookEndpoints: string[];
    notificationRetention: number;
  };
  performance: {
    enableCaching: boolean;
    cacheProvider: 'memory' | 'redis' | 'memcached';
    cacheDuration: number;
    redisConnectionString: string;
    enableCompression: boolean;
    compressionLevel: number;
    enableMinification: boolean;
    enableCDN: boolean;
    cdnUrl: string;
    enableLazyLoading: boolean;
    maxConcurrentRequests: number;
  };
  logging: {
    logLevel: 'debug' | 'info' | 'warning' | 'error' | 'critical';
    enableFileLogging: boolean;
    logFilePath: string;
    maxLogFileSize: number;
    logRetentionDays: number;
    enableDatabaseLogging: boolean;
    enableConsoleLogging: boolean;
    enableSentryLogging: boolean;
    sentryDsn: string;
    enableElasticLogging: boolean;
    elasticUrl: string;
  };
  billing: {
    enableBilling: boolean;
    currency: string;
    taxRate: number;
    paymentGateway: 'stripe' | 'paypal' | 'square' | 'custom';
    stripePublicKey: string;
    stripeSecretKey: string;
    paypalClientId: string;
    paypalClientSecret: string;
    enableRecurringBilling: boolean;
    trialPeriodDays: number;
    enableProration: boolean;
  };
}

const EnhancedSystemSettings: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [activeTab, setActiveTab] = useState('general');
  const [testingConnection, setTestingConnection] = useState(false);
  const [form] = Form.useForm();

  // Mock configuration data
  const mockConfig: SystemConfig = {
    general: {
      siteName: 'Stocker Platform',
      siteUrl: 'https://stocker.com',
      adminEmail: 'admin@stocker.com',
      supportEmail: 'support@stocker.com',
      timezone: 'Europe/Istanbul',
      dateFormat: 'DD/MM/YYYY',
      language: 'tr',
      currency: 'TRY',
      maintenanceMode: false,
      maintenanceMessage: 'Sistem bakımda, lütfen daha sonra tekrar deneyin.',
    },
    security: {
      passwordMinLength: 8,
      passwordRequireUppercase: true,
      passwordRequireLowercase: true,
      passwordRequireNumbers: true,
      passwordRequireSpecialChars: true,
      passwordExpiryDays: 90,
      maxLoginAttempts: 5,
      lockoutDuration: 30,
      twoFactorAuth: true,
      sessionTimeout: 30,
      ipWhitelist: [],
      ipBlacklist: [],
      enableCaptcha: true,
      enableSSL: true,
      enableCSRF: true,
    },
    email: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUsername: 'noreply@stocker.com',
      smtpPassword: '********',
      smtpEncryption: 'tls',
      fromName: 'Stocker Platform',
      fromEmail: 'noreply@stocker.com',
      replyToEmail: 'support@stocker.com',
      emailSignature: 'Stocker Platform Team',
      enableEmailQueue: true,
      maxEmailsPerHour: 100,
    },
    database: {
      connectionString: 'Server=localhost;Database=stocker;User Id=sa;Password=******',
      maxConnections: 100,
      connectionTimeout: 30,
      commandTimeout: 30,
      enableConnectionPooling: true,
      minPoolSize: 10,
      maxPoolSize: 100,
      enableAutoMigration: true,
      backupSchedule: '0 2 * * *',
      retentionDays: 30,
    },
    storage: {
      provider: 'aws',
      localPath: '/var/storage',
      awsBucket: 'stocker-uploads',
      awsRegion: 'eu-west-1',
      awsAccessKey: 'AKIA**********',
      awsSecretKey: '********',
      azureContainer: '',
      azureConnectionString: '',
      gcpBucket: '',
      gcpProjectId: '',
      maxFileSize: 10485760,
      allowedFileTypes: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'xls', 'xlsx'],
    },
    api: {
      enableApi: true,
      apiVersion: 'v1',
      rateLimit: 1000,
      rateLimitWindow: 3600,
      enableApiKey: true,
      enableOAuth: true,
      corsOrigins: ['http://localhost:3000', 'https://stocker.com'],
      enableSwagger: true,
      enableGraphQL: false,
      maxRequestSize: 5242880,
      timeout: 30000,
    },
    notifications: {
      enableEmailNotifications: true,
      enablePushNotifications: true,
      enableSmsNotifications: false,
      enableInAppNotifications: true,
      enableSlackIntegration: true,
      slackWebhookUrl: 'https://hooks.slack.com/services/******',
      enableWebhooks: true,
      webhookEndpoints: ['https://api.example.com/webhook'],
      notificationRetention: 30,
    },
    performance: {
      enableCaching: true,
      cacheProvider: 'redis',
      cacheDuration: 3600,
      redisConnectionString: 'redis://localhost:6379',
      enableCompression: true,
      compressionLevel: 6,
      enableMinification: true,
      enableCDN: true,
      cdnUrl: 'https://cdn.stocker.com',
      enableLazyLoading: true,
      maxConcurrentRequests: 10,
    },
    logging: {
      logLevel: 'info',
      enableFileLogging: true,
      logFilePath: '/var/log/stocker',
      maxLogFileSize: 10485760,
      logRetentionDays: 30,
      enableDatabaseLogging: true,
      enableConsoleLogging: true,
      enableSentryLogging: true,
      sentryDsn: 'https://******@sentry.io/******',
      enableElasticLogging: false,
      elasticUrl: '',
    },
    billing: {
      enableBilling: true,
      currency: 'TRY',
      taxRate: 18,
      paymentGateway: 'stripe',
      stripePublicKey: 'pk_live_******',
      stripeSecretKey: 'sk_live_******',
      paypalClientId: '',
      paypalClientSecret: '',
      enableRecurringBilling: true,
      trialPeriodDays: 14,
      enableProration: true,
    },
  };

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    setLoading(true);
    try {
      // Simulated API call
      setTimeout(() => {
        setConfig(mockConfig);
        form.setFieldsValue(mockConfig);
        setLoading(false);
      }, 1000);
    } catch (error) {
      message.error('Ayarlar yüklenemedi');
      setLoading(false);
    }
  };

  const handleSave = async (values: any) => {
    setSaving(true);
    try {
      // Simulated API call
      setTimeout(() => {
        message.success('Ayarlar başarıyla kaydedildi');
        setSaving(false);
      }, 1500);
    } catch (error) {
      message.error('Ayarlar kaydedilemedi');
      setSaving(false);
    }
  };

  const handleTestConnection = (type: string) => {
    setTestingConnection(true);
    setTimeout(() => {
      notification.success({
        message: 'Bağlantı Başarılı',
        description: `${type} bağlantısı başarıyla test edildi.`,
      });
      setTestingConnection(false);
    }, 2000);
  };

  const handleExportSettings = () => {
    const dataStr = JSON.stringify(config, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `system-settings-${dayjs().format('YYYY-MM-DD')}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    message.success('Ayarlar dışa aktarıldı');
  };

  const handleImportSettings = (file: any) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedConfig = JSON.parse(e.target?.result as string);
        setConfig(importedConfig);
        form.setFieldsValue(importedConfig);
        message.success('Ayarlar başarıyla içe aktarıldı');
      } catch (error) {
        message.error('Geçersiz ayar dosyası');
      }
    };
    reader.readAsText(file);
    return false;
  };

  const handleResetSettings = () => {
    confirm({
      title: 'Ayarları Sıfırla',
      icon: <WarningOutlined />,
      content: 'Tüm ayarlar varsayılan değerlere döndürülecek. Bu işlem geri alınamaz.',
      okText: 'Sıfırla',
      okType: 'danger',
      cancelText: 'İptal',
      onOk() {
        loadConfiguration();
        message.success('Ayarlar sıfırlandı');
      },
    });
  };

  if (loading) {
    return (
      <div className="system-settings-loading">
        <Card>
          <Skeleton active paragraph={{ rows: 8 }} />
        </Card>
      </div>
    );
  }

  const tabItems: TabsProps['items'] = [
    {
      key: 'general',
      label: (
        <span>
          <GlobalOutlined />
          Genel Ayarlar
        </span>
      ),
      children: (
        <Card title="Genel Sistem Ayarları" className="settings-card">
          <Form.Item label="Site Adı" name={['general', 'siteName']} rules={[{ required: true }]}>
            <Input prefix={<GlobalOutlined />} />
          </Form.Item>
          <Form.Item label="Site URL" name={['general', 'siteUrl']} rules={[{ required: true, type: 'url' }]}>
            <Input prefix={<GlobalOutlined />} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Admin Email" name={['general', 'adminEmail']} rules={[{ required: true, type: 'email' }]}>
                <Input prefix={<MailOutlined />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Destek Email" name={['general', 'supportEmail']} rules={[{ required: true, type: 'email' }]}>
                <Input prefix={<MailOutlined />} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Zaman Dilimi" name={['general', 'timezone']}>
                <Select>
                  <Option value="Europe/Istanbul">Europe/Istanbul</Option>
                  <Option value="UTC">UTC</Option>
                  <Option value="America/New_York">America/New_York</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Tarih Formatı" name={['general', 'dateFormat']}>
                <Select>
                  <Option value="DD/MM/YYYY">DD/MM/YYYY</Option>
                  <Option value="MM/DD/YYYY">MM/DD/YYYY</Option>
                  <Option value="YYYY-MM-DD">YYYY-MM-DD</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Para Birimi" name={['general', 'currency']}>
                <Select>
                  <Option value="TRY">TRY (₺)</Option>
                  <Option value="USD">USD ($)</Option>
                  <Option value="EUR">EUR (€)</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Divider />
          <Form.Item label="Bakım Modu" name={['general', 'maintenanceMode']} valuePropName="checked">
            <Switch checkedChildren="Açık" unCheckedChildren="Kapalı" />
          </Form.Item>
          <Form.Item label="Bakım Mesajı" name={['general', 'maintenanceMessage']}>
            <TextArea rows={4} />
          </Form.Item>
        </Card>
      ),
    },
    {
      key: 'security',
      label: (
        <span>
          <SecurityScanOutlined />
          Güvenlik
        </span>
      ),
      children: (
        <Card title="Güvenlik Ayarları" className="settings-card">
          <Title level={5}>Şifre Politikaları</Title>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Minimum Şifre Uzunluğu" name={['security', 'passwordMinLength']}>
                <InputNumber min={6} max={32} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Şifre Geçerlilik Süresi (Gün)" name={['security', 'passwordExpiryDays']}>
                <InputNumber min={0} max={365} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Maksimum Giriş Denemesi" name={['security', 'maxLoginAttempts']}>
                <InputNumber min={3} max={10} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Form.Item name={['security', 'passwordRequireUppercase']} valuePropName="checked">
              <Checkbox>Büyük harf zorunlu</Checkbox>
            </Form.Item>
            <Form.Item name={['security', 'passwordRequireLowercase']} valuePropName="checked">
              <Checkbox>Küçük harf zorunlu</Checkbox>
            </Form.Item>
            <Form.Item name={['security', 'passwordRequireNumbers']} valuePropName="checked">
              <Checkbox>Rakam zorunlu</Checkbox>
            </Form.Item>
            <Form.Item name={['security', 'passwordRequireSpecialChars']} valuePropName="checked">
              <Checkbox>Özel karakter zorunlu</Checkbox>
            </Form.Item>
          </Space>
          
          <Divider />
          <Title level={5}>Güvenlik Özellikleri</Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="İki Faktörlü Doğrulama" name={['security', 'twoFactorAuth']} valuePropName="checked">
                <Switch checkedChildren="Açık" unCheckedChildren="Kapalı" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Oturum Zaman Aşımı (Dakika)" name={['security', 'sessionTimeout']}>
                <InputNumber min={5} max={1440} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="CAPTCHA" name={['security', 'enableCaptcha']} valuePropName="checked">
                <Switch checkedChildren="Açık" unCheckedChildren="Kapalı" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="SSL" name={['security', 'enableSSL']} valuePropName="checked">
                <Switch checkedChildren="Açık" unCheckedChildren="Kapalı" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="CSRF Koruması" name={['security', 'enableCSRF']} valuePropName="checked">
                <Switch checkedChildren="Açık" unCheckedChildren="Kapalı" />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      ),
    },
    {
      key: 'email',
      label: (
        <span>
          <MailOutlined />
          Email
        </span>
      ),
      children: (
        <Card title="Email Ayarları" className="settings-card">
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item label="SMTP Sunucu" name={['email', 'smtpHost']} rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Port" name={['email', 'smtpPort']} rules={[{ required: true }]}>
                <InputNumber min={1} max={65535} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Kullanıcı Adı" name={['email', 'smtpUsername']}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Şifre" name={['email', 'smtpPassword']}>
                <Input.Password />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Şifreleme" name={['email', 'smtpEncryption']}>
            <Radio.Group>
              <Radio value="none">Yok</Radio>
              <Radio value="tls">TLS</Radio>
              <Radio value="ssl">SSL</Radio>
            </Radio.Group>
          </Form.Item>
          <Divider />
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Gönderen Adı" name={['email', 'fromName']}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Gönderen Email" name={['email', 'fromEmail']} rules={[{ type: 'email' }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Email İmzası" name={['email', 'emailSignature']}>
            <TextArea rows={4} />
          </Form.Item>
          <Space>
            <Button 
              icon={<ThunderboltOutlined />}
              onClick={() => handleTestConnection('Email')}
              loading={testingConnection}
            >
              Bağlantıyı Test Et
            </Button>
          </Space>
        </Card>
      ),
    },
    {
      key: 'database',
      label: (
        <span>
          <DatabaseOutlined />
          Veritabanı
        </span>
      ),
      children: (
        <Card title="Veritabanı Ayarları" className="settings-card">
          <Form.Item 
            label="Bağlantı Dizesi" 
            name={['database', 'connectionString']}
            rules={[{ required: true }]}
          >
            <Input.Password placeholder="Server=localhost;Database=stocker;..." />
          </Form.Item>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Maksimum Bağlantı" name={['database', 'maxConnections']}>
                <InputNumber min={1} max={1000} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Bağlantı Timeout (sn)" name={['database', 'connectionTimeout']}>
                <InputNumber min={5} max={300} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Komut Timeout (sn)" name={['database', 'commandTimeout']}>
                <InputNumber min={5} max={300} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Connection Pooling" name={['database', 'enableConnectionPooling']} valuePropName="checked">
            <Switch checkedChildren="Açık" unCheckedChildren="Kapalı" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Minimum Pool Size" name={['database', 'minPoolSize']}>
                <InputNumber min={1} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Maximum Pool Size" name={['database', 'maxPoolSize']}>
                <InputNumber min={1} max={500} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Divider />
          <Title level={5}>Yedekleme</Title>
          <Form.Item label="Yedekleme Zamanlaması (Cron)" name={['database', 'backupSchedule']}>
            <Input placeholder="0 2 * * * (Her gün saat 02:00)" />
          </Form.Item>
          <Form.Item label="Yedek Saklama Süresi (Gün)" name={['database', 'retentionDays']}>
            <InputNumber min={1} max={365} style={{ width: '100%' }} />
          </Form.Item>
          <Space>
            <Button 
              icon={<ThunderboltOutlined />}
              onClick={() => handleTestConnection('Database')}
              loading={testingConnection}
            >
              Bağlantıyı Test Et
            </Button>
            <Button icon={<CloudDownloadOutlined />}>
              Manuel Yedek Al
            </Button>
          </Space>
        </Card>
      ),
    },
    {
      key: 'storage',
      label: (
        <span>
          <CloudServerOutlined />
          Depolama
        </span>
      ),
      children: (
        <Card title="Depolama Ayarları" className="settings-card">
          <Form.Item label="Depolama Sağlayıcı" name={['storage', 'provider']}>
            <Select>
              <Option value="local">Yerel Depolama</Option>
              <Option value="aws">Amazon S3</Option>
              <Option value="azure">Azure Blob Storage</Option>
              <Option value="gcp">Google Cloud Storage</Option>
            </Select>
          </Form.Item>
          
          <Form.Item 
            noStyle
            shouldUpdate={(prevValues, currentValues) => 
              prevValues?.storage?.provider !== currentValues?.storage?.provider
            }
          >
            {({ getFieldValue }) => {
              const provider = getFieldValue(['storage', 'provider']);
              
              if (provider === 'local') {
                return (
                  <Form.Item label="Yerel Yol" name={['storage', 'localPath']}>
                    <Input />
                  </Form.Item>
                );
              }
              
              if (provider === 'aws') {
                return (
                  <>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item label="S3 Bucket" name={['storage', 'awsBucket']}>
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="AWS Region" name={['storage', 'awsRegion']}>
                          <Input />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item label="Access Key" name={['storage', 'awsAccessKey']}>
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="Secret Key" name={['storage', 'awsSecretKey']}>
                          <Input.Password />
                        </Form.Item>
                      </Col>
                    </Row>
                  </>
                );
              }
              
              return null;
            }}
          </Form.Item>
          
          <Divider />
          <Form.Item label="Maksimum Dosya Boyutu (MB)" name={['storage', 'maxFileSize']}>
            <InputNumber 
              min={1} 
              max={100} 
              formatter={value => `${value} MB`}
              parser={value => value?.replace(' MB', '') as any}
              style={{ width: '100%' }} 
            />
          </Form.Item>
          <Form.Item label="İzin Verilen Dosya Türleri" name={['storage', 'allowedFileTypes']}>
            <Select mode="tags" placeholder="jpg, png, pdf...">
              <Option value="jpg">jpg</Option>
              <Option value="png">png</Option>
              <Option value="pdf">pdf</Option>
              <Option value="doc">doc</Option>
              <Option value="docx">docx</Option>
            </Select>
          </Form.Item>
        </Card>
      ),
    },
    {
      key: 'api',
      label: (
        <span>
          <ApiOutlined />
          API
        </span>
      ),
      children: (
        <Card title="API Ayarları" className="settings-card">
          <Form.Item label="API Durumu" name={['api', 'enableApi']} valuePropName="checked">
            <Switch checkedChildren="Açık" unCheckedChildren="Kapalı" />
          </Form.Item>
          <Form.Item label="API Versiyonu" name={['api', 'apiVersion']}>
            <Input />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Rate Limit (İstek/Saat)" name={['api', 'rateLimit']}>
                <InputNumber min={10} max={10000} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Maksimum İstek Boyutu (MB)" name={['api', 'maxRequestSize']}>
                <InputNumber 
                  min={1} 
                  max={100}
                  formatter={value => `${value} MB`}
                  parser={value => value?.replace(' MB', '') as any}
                  style={{ width: '100%' }} 
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="API Key" name={['api', 'enableApiKey']} valuePropName="checked">
                <Switch checkedChildren="Açık" unCheckedChildren="Kapalı" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="OAuth" name={['api', 'enableOAuth']} valuePropName="checked">
                <Switch checkedChildren="Açık" unCheckedChildren="Kapalı" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Swagger" name={['api', 'enableSwagger']} valuePropName="checked">
                <Switch checkedChildren="Açık" unCheckedChildren="Kapalı" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="CORS Origins" name={['api', 'corsOrigins']}>
            <Select mode="tags" placeholder="http://localhost:3000">
              <Option value="http://localhost:3000">http://localhost:3000</Option>
              <Option value="https://stocker.com">https://stocker.com</Option>
            </Select>
          </Form.Item>
        </Card>
      ),
    },
    {
      key: 'notifications',
      label: (
        <span>
          <BellOutlined />
          Bildirimler
        </span>
      ),
      children: (
        <Card title="Bildirim Ayarları" className="settings-card">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Email Bildirimleri" name={['notifications', 'enableEmailNotifications']} valuePropName="checked">
                <Switch checkedChildren="Açık" unCheckedChildren="Kapalı" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Push Bildirimleri" name={['notifications', 'enablePushNotifications']} valuePropName="checked">
                <Switch checkedChildren="Açık" unCheckedChildren="Kapalı" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="SMS Bildirimleri" name={['notifications', 'enableSmsNotifications']} valuePropName="checked">
                <Switch checkedChildren="Açık" unCheckedChildren="Kapalı" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Uygulama İçi Bildirimler" name={['notifications', 'enableInAppNotifications']} valuePropName="checked">
                <Switch checkedChildren="Açık" unCheckedChildren="Kapalı" />
              </Form.Item>
            </Col>
          </Row>
          <Divider />
          <Title level={5}>Entegrasyonlar</Title>
          <Form.Item label="Slack Entegrasyonu" name={['notifications', 'enableSlackIntegration']} valuePropName="checked">
            <Switch checkedChildren="Açık" unCheckedChildren="Kapalı" />
          </Form.Item>
          <Form.Item label="Slack Webhook URL" name={['notifications', 'slackWebhookUrl']}>
            <Input placeholder="https://hooks.slack.com/services/..." />
          </Form.Item>
          <Form.Item label="Webhook Endpoints" name={['notifications', 'webhookEndpoints']}>
            <Select mode="tags" placeholder="Webhook URL ekle">
              <Option value="https://api.example.com/webhook">https://api.example.com/webhook</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Bildirim Saklama Süresi (Gün)" name={['notifications', 'notificationRetention']}>
            <InputNumber min={1} max={365} style={{ width: '100%' }} />
          </Form.Item>
        </Card>
      ),
    },
    {
      key: 'performance',
      label: (
        <span>
          <RocketOutlined />
          Performans
        </span>
      ),
      children: (
        <Card title="Performans Ayarları" className="settings-card">
          <Form.Item label="Önbellekleme" name={['performance', 'enableCaching']} valuePropName="checked">
            <Switch checkedChildren="Açık" unCheckedChildren="Kapalı" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Cache Sağlayıcı" name={['performance', 'cacheProvider']}>
                <Select>
                  <Option value="memory">Memory</Option>
                  <Option value="redis">Redis</Option>
                  <Option value="memcached">Memcached</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Cache Süresi (Saniye)" name={['performance', 'cacheDuration']}>
                <InputNumber min={60} max={86400} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Redis Bağlantı" name={['performance', 'redisConnectionString']}>
            <Input placeholder="redis://localhost:6379" />
          </Form.Item>
          <Divider />
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Sıkıştırma" name={['performance', 'enableCompression']} valuePropName="checked">
                <Switch checkedChildren="Açık" unCheckedChildren="Kapalı" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Minification" name={['performance', 'enableMinification']} valuePropName="checked">
                <Switch checkedChildren="Açık" unCheckedChildren="Kapalı" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Lazy Loading" name={['performance', 'enableLazyLoading']} valuePropName="checked">
                <Switch checkedChildren="Açık" unCheckedChildren="Kapalı" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="CDN" name={['performance', 'enableCDN']} valuePropName="checked">
            <Switch checkedChildren="Açık" unCheckedChildren="Kapalı" />
          </Form.Item>
          <Form.Item label="CDN URL" name={['performance', 'cdnUrl']}>
            <Input placeholder="https://cdn.stocker.com" />
          </Form.Item>
        </Card>
      ),
    },
    {
      key: 'logging',
      label: (
        <span>
          <FileTextOutlined />
          Loglama
        </span>
      ),
      children: (
        <Card title="Loglama Ayarları" className="settings-card">
          <Form.Item label="Log Seviyesi" name={['logging', 'logLevel']}>
            <Select>
              <Option value="debug">Debug</Option>
              <Option value="info">Info</Option>
              <Option value="warning">Warning</Option>
              <Option value="error">Error</Option>
              <Option value="critical">Critical</Option>
            </Select>
          </Form.Item>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Dosya Loglama" name={['logging', 'enableFileLogging']} valuePropName="checked">
                <Switch checkedChildren="Açık" unCheckedChildren="Kapalı" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Veritabanı Loglama" name={['logging', 'enableDatabaseLogging']} valuePropName="checked">
                <Switch checkedChildren="Açık" unCheckedChildren="Kapalı" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Konsol Loglama" name={['logging', 'enableConsoleLogging']} valuePropName="checked">
                <Switch checkedChildren="Açık" unCheckedChildren="Kapalı" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Log Dosya Yolu" name={['logging', 'logFilePath']}>
            <Input placeholder="/var/log/stocker" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Max Log Dosya Boyutu (MB)" name={['logging', 'maxLogFileSize']}>
                <InputNumber 
                  min={1} 
                  max={1000}
                  formatter={value => `${value} MB`}
                  parser={value => value?.replace(' MB', '') as any}
                  style={{ width: '100%' }} 
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Log Saklama Süresi (Gün)" name={['logging', 'logRetentionDays']}>
                <InputNumber min={1} max={365} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Divider />
          <Title level={5}>External Logging</Title>
          <Form.Item label="Sentry" name={['logging', 'enableSentryLogging']} valuePropName="checked">
            <Switch checkedChildren="Açık" unCheckedChildren="Kapalı" />
          </Form.Item>
          <Form.Item label="Sentry DSN" name={['logging', 'sentryDsn']}>
            <Input placeholder="https://xxxx@sentry.io/xxxx" />
          </Form.Item>
        </Card>
      ),
    },
    {
      key: 'billing',
      label: (
        <span>
          <DollarOutlined />
          Faturalama
        </span>
      ),
      children: (
        <Card title="Faturalama Ayarları" className="settings-card">
          <Form.Item label="Faturalama Sistemi" name={['billing', 'enableBilling']} valuePropName="checked">
            <Switch checkedChildren="Açık" unCheckedChildren="Kapalı" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Para Birimi" name={['billing', 'currency']}>
                <Select>
                  <Option value="TRY">TRY (₺)</Option>
                  <Option value="USD">USD ($)</Option>
                  <Option value="EUR">EUR (€)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="KDV Oranı (%)" name={['billing', 'taxRate']}>
                <InputNumber min={0} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Ödeme Yöntemi" name={['billing', 'paymentGateway']}>
            <Select>
              <Option value="stripe">Stripe</Option>
              <Option value="paypal">PayPal</Option>
              <Option value="square">Square</Option>
              <Option value="custom">Özel</Option>
            </Select>
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Stripe Public Key" name={['billing', 'stripePublicKey']}>
                <Input placeholder="pk_live_..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Stripe Secret Key" name={['billing', 'stripeSecretKey']}>
                <Input.Password placeholder="sk_live_..." />
              </Form.Item>
            </Col>
          </Row>
          <Divider />
          <Form.Item label="Tekrarlanan Ödemeler" name={['billing', 'enableRecurringBilling']} valuePropName="checked">
            <Switch checkedChildren="Açık" unCheckedChildren="Kapalı" />
          </Form.Item>
          <Form.Item label="Deneme Süresi (Gün)" name={['billing', 'trialPeriodDays']}>
            <InputNumber min={0} max={90} style={{ width: '100%' }} />
          </Form.Item>
        </Card>
      ),
    },
  ];

  return (
    <div className="enhanced-system-settings">
      <div className="settings-header">
        <div className="header-content">
          <Title level={2}>
            <SettingOutlined /> Sistem Ayarları
          </Title>
          <Text type="secondary">
            Sistem genelinde geçerli olan tüm ayarları buradan yapılandırabilirsiniz
          </Text>
        </div>
        <Space>
          <Button icon={<ImportOutlined />} onClick={() => document.getElementById('import-settings')?.click()}>
            İçe Aktar
          </Button>
          <input
            id="import-settings"
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={(e) => e.target.files?.[0] && handleImportSettings(e.target.files[0])}
          />
          <Button icon={<ExportOutlined />} onClick={handleExportSettings}>
            Dışa Aktar
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleResetSettings}>
            Sıfırla
          </Button>
          <Button 
            type="primary" 
            icon={<SaveOutlined />}
            onClick={() => form.validateFields().then(handleSave)}
            loading={saving}
          >
            Kaydet
          </Button>
        </Space>
      </div>

      <Form
        form={form}
        layout="vertical"
        initialValues={config || undefined}
        onFinish={handleSave}
      >
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={tabItems}
        />
      </Form>

      <Card className="settings-footer">
        <Alert
          message="Önemli Bilgi"
          description="Yapılan değişiklikler kaydedildikten sonra sistem genelinde geçerli olacaktır. Bazı ayarlar için sistemin yeniden başlatılması gerekebilir."
          type="info"
          showIcon
        />
      </Card>
    </div>
  );
};

export default EnhancedSystemSettings;