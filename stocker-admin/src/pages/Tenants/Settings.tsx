import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  Select,
  Switch,
  Button,
  Space,
  Row,
  Col,
  Divider,
  Typography,
  Alert,
  message,
  Tabs,
  Radio,
  InputNumber,
  TimePicker,
  Checkbox,
  Upload,
  ColorPicker,
  Slider,
  Table,
  Tag,
  Tooltip,
  Modal,
  List,
} from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import {
  SettingOutlined,
  SaveOutlined,
  ReloadOutlined,
  GlobalOutlined,
  MailOutlined,
  BellOutlined,
  SafetyOutlined,
  ApiOutlined,
  DatabaseOutlined,
  CloudOutlined,
  LockOutlined,
  UserOutlined,
  TeamOutlined,
  ExperimentOutlined,
  ThunderboltOutlined,
  UploadOutlined,
  PlusOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  FileTextOutlined,
  CalendarOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

const TenantSettings: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [form] = Form.useForm();
  const [emailForm] = Form.useForm();
  const [securityForm] = Form.useForm();
  const [apiForm] = Form.useForm();

  // Mock settings data
  const initialSettings = {
    general: {
      companyName: 'ABC Corporation',
      timezone: 'Europe/Istanbul',
      language: 'tr',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      currency: 'TRY',
      fiscalYearStart: '01-01',
      weekStart: 'monday',
    },
    branding: {
      primaryColor: '#667eea',
      secondaryColor: '#764ba2',
      logoUrl: '',
      faviconUrl: '',
      emailLogo: '',
      customCSS: '',
      hideWatermark: true,
      customFooter: '© 2024 ABC Corporation. Tüm hakları saklıdır.',
    },
    email: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUser: 'noreply@abc-corp.com',
      smtpPassword: '********',
      smtpEncryption: 'tls',
      fromName: 'ABC Corporation',
      fromEmail: 'noreply@abc-corp.com',
      replyToEmail: 'support@abc-corp.com',
      emailSignature: 'ABC Corporation Destek Ekibi',
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      weeklyReport: true,
      monthlyReport: true,
      systemAlerts: true,
      securityAlerts: true,
      billingAlerts: true,
      userActivityAlerts: false,
    },
    security: {
      twoFactorAuth: 'optional',
      sessionTimeout: 30,
      passwordPolicy: 'strong',
      passwordExpiry: 90,
      ipWhitelist: [],
      ipBlacklist: [],
      maxLoginAttempts: 5,
      lockoutDuration: 30,
      forceHttps: true,
      corsEnabled: true,
      allowedOrigins: ['https://app.abc-corp.com'],
    },
    api: {
      enabled: true,
      rateLimit: 1000,
      rateLimitWindow: 3600,
      apiVersion: 'v2',
      webhookUrl: 'https://api.abc-corp.com/webhooks',
      apiKeys: [
        { id: '1', name: 'Production API', key: 'pk_live_...', created: '2024-01-15', lastUsed: '2024-12-07' },
        { id: '2', name: 'Test API', key: 'pk_test_...', created: '2024-03-20', lastUsed: '2024-12-05' },
      ],
    },
    storage: {
      provider: 's3',
      region: 'eu-west-1',
      bucket: 'abc-corp-storage',
      maxFileSize: 100, // MB
      allowedFormats: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'png', 'jpg', 'jpeg'],
      autoBackup: true,
      backupFrequency: 'daily',
      backupRetention: 30,
    },
    advanced: {
      maintenanceMode: false,
      maintenanceMessage: '',
      customDomain: 'app.abc-corp.com',
      cdnEnabled: true,
      cacheEnabled: true,
      cacheTTL: 3600,
      debugMode: false,
      auditLog: true,
      dataRetention: 365,
    },
  };

  const [settings, setSettings] = useState(initialSettings);
  const [apiKeys, setApiKeys] = useState(initialSettings.api.apiKeys);
  const [ipWhitelist, setIpWhitelist] = useState(initialSettings.security.ipWhitelist);

  const handleSaveSettings = async (section: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      await Swal.fire({
        icon: 'success',
        title: 'Ayarlar Kaydedildi',
        text: `${section} ayarları başarıyla güncellendi.`,
        timer: 1500,
        showConfirmButton: false,
      });
      
      message.success('Ayarlar kaydedildi');
    } catch (error) {
      message.error('Ayarlar kaydedilirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateApiKey = () => {
    Modal.confirm({
      title: 'Yeni API Anahtarı Oluştur',
      content: (
        <Form layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="Anahtar Adı" required>
            <Input placeholder="Production API" />
          </Form.Item>
          <Form.Item label="İzinler">
            <Checkbox.Group>
              <Row>
                <Col span={12}><Checkbox value="read">Okuma</Checkbox></Col>
                <Col span={12}><Checkbox value="write">Yazma</Checkbox></Col>
                <Col span={12}><Checkbox value="delete">Silme</Checkbox></Col>
                <Col span={12}><Checkbox value="admin">Admin</Checkbox></Col>
              </Row>
            </Checkbox.Group>
          </Form.Item>
        </Form>
      ),
      onOk: () => {
        const newKey = {
          id: String(apiKeys.length + 1),
          name: 'New API Key',
          key: `pk_live_${Math.random().toString(36).substr(2, 9)}`,
          created: dayjs().format('YYYY-MM-DD'),
          lastUsed: '-',
        };
        setApiKeys([...apiKeys, newKey]);
        message.success('API anahtarı oluşturuldu');
      },
    });
  };

  const handleDeleteApiKey = (id: string) => {
    Modal.confirm({
      title: 'API Anahtarını Sil',
      content: 'Bu API anahtarını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
      okText: 'Sil',
      okType: 'danger',
      onOk: () => {
        setApiKeys(apiKeys.filter(key => key.id !== id));
        message.success('API anahtarı silindi');
      },
    });
  };

  const apiKeyColumns = [
    {
      title: 'Ad',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Anahtar',
      dataIndex: 'key',
      key: 'key',
      render: (text: string) => (
        <Space>
          <Text code>{text}</Text>
          <Tooltip title="Kopyala">
            <Button type="text" size="small" icon={<FileTextOutlined />} />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: 'Oluşturulma',
      dataIndex: 'created',
      key: 'created',
    },
    {
      title: 'Son Kullanım',
      dataIndex: 'lastUsed',
      key: 'lastUsed',
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_: any, record: any) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteApiKey(record.id)}
        />
      ),
    },
  ];

  return (
    <PageContainer
      header={{
        title: 'Tenant Ayarları',
        breadcrumb: {
          items: [
            { title: 'Ana Sayfa', path: '/' },
            { title: 'Tenants', path: '/tenants' },
            { title: 'ABC Corporation', path: `/tenants/${id}` },
            { title: 'Ayarlar' },
          ],
        },
        onBack: () => navigate(`/tenants/${id}`),
      }}
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab={<span><SettingOutlined /> Genel</span>} key="general">
          <Card>
            <Form
              form={form}
              layout="vertical"
              initialValues={settings.general}
              onFinish={() => handleSaveSettings('Genel')}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="companyName"
                    label="Şirket Adı"
                    rules={[{ required: true }]}
                  >
                    <Input size="large" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="timezone"
                    label="Zaman Dilimi"
                    rules={[{ required: true }]}
                  >
                    <Select size="large">
                      <Option value="Europe/Istanbul">Istanbul (UTC+3)</Option>
                      <Option value="Europe/London">London (UTC+0)</Option>
                      <Option value="America/New_York">New York (UTC-5)</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="language"
                    label="Dil"
                    rules={[{ required: true }]}
                  >
                    <Select size="large">
                      <Option value="tr">Türkçe</Option>
                      <Option value="en">English</Option>
                      <Option value="de">Deutsch</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="currency"
                    label="Para Birimi"
                    rules={[{ required: true }]}
                  >
                    <Select size="large">
                      <Option value="TRY">TRY (₺)</Option>
                      <Option value="USD">USD ($)</Option>
                      <Option value="EUR">EUR (€)</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="dateFormat"
                    label="Tarih Formatı"
                  >
                    <Select size="large">
                      <Option value="DD/MM/YYYY">DD/MM/YYYY</Option>
                      <Option value="MM/DD/YYYY">MM/DD/YYYY</Option>
                      <Option value="YYYY-MM-DD">YYYY-MM-DD</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="timeFormat"
                    label="Saat Formatı"
                  >
                    <Radio.Group>
                      <Radio value="12h">12 Saat</Radio>
                      <Radio value="24h">24 Saat</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="weekStart"
                    label="Hafta Başlangıcı"
                  >
                    <Select size="large">
                      <Option value="monday">Pazartesi</Option>
                      <Option value="sunday">Pazar</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="fiscalYearStart"
                    label="Mali Yıl Başlangıcı"
                  >
                    <Input size="large" placeholder="01-01" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
                    Kaydet
                  </Button>
                  <Button icon={<ReloadOutlined />}>Sıfırla</Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        <TabPane tab={<span><GlobalOutlined /> Marka</span>} key="branding">
          <Card>
            <Form
              layout="vertical"
              initialValues={settings.branding}
              onFinish={() => handleSaveSettings('Marka')}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="primaryColor" label="Ana Renk">
                    <Input type="color" style={{ width: 100, height: 40 }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="secondaryColor" label="İkincil Renk">
                    <Input type="color" style={{ width: 100, height: 40 }} />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item name="logo" label="Logo">
                    <Upload
                      listType="picture-card"
                      maxCount={1}
                      beforeUpload={() => false}
                    >
                      <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>Logo Yükle</div>
                      </div>
                    </Upload>
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item name="favicon" label="Favicon">
                    <Upload
                      listType="picture-card"
                      maxCount={1}
                      beforeUpload={() => false}
                    >
                      <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>Favicon Yükle</div>
                      </div>
                    </Upload>
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item name="customFooter" label="Özel Footer Metni">
                    <TextArea rows={2} />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item name="customCSS" label="Özel CSS">
                    <TextArea
                      rows={6}
                      placeholder="/* Özel CSS kodlarınız */"
                      style={{ fontFamily: 'monospace' }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="hideWatermark" valuePropName="checked">
                    <Switch checkedChildren="Watermark Gizli" unCheckedChildren="Watermark Görünür" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
                  Kaydet
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        <TabPane tab={<span><MailOutlined /> E-posta</span>} key="email">
          <Card>
            <Alert
              message="SMTP Ayarları"
              description="E-posta gönderimi için SMTP sunucu ayarlarını yapılandırın."
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />
            <Form
              form={emailForm}
              layout="vertical"
              initialValues={settings.email}
              onFinish={() => handleSaveSettings('E-posta')}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="smtpHost"
                    label="SMTP Sunucu"
                    rules={[{ required: true }]}
                  >
                    <Input placeholder="smtp.gmail.com" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="smtpPort"
                    label="Port"
                    rules={[{ required: true }]}
                  >
                    <InputNumber style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="smtpUser"
                    label="Kullanıcı Adı"
                    rules={[{ required: true }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="smtpPassword"
                    label="Şifre"
                    rules={[{ required: true }]}
                  >
                    <Input.Password />
                  </Form.Item>
                </Col>
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
                    name="fromEmail"
                    label="Gönderen E-posta"
                    rules={[{ required: true, type: 'email' }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="fromName"
                    label="Gönderen Adı"
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="replyToEmail"
                    label="Yanıt E-postası"
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    name="emailSignature"
                    label="E-posta İmzası"
                  >
                    <TextArea rows={3} />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
                    Kaydet
                  </Button>
                  <Button icon={<MailOutlined />}>Test E-postası Gönder</Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        <TabPane tab={<span><BellOutlined /> Bildirimler</span>} key="notifications">
          <Card>
            <Form
              layout="vertical"
              initialValues={settings.notifications}
              onFinish={() => handleSaveSettings('Bildirimler')}
            >
              <Title level={5}>Bildirim Kanalları</Title>
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <Form.Item name="emailNotifications" valuePropName="checked">
                    <Switch checkedChildren="E-posta Aktif" unCheckedChildren="E-posta Pasif" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="smsNotifications" valuePropName="checked">
                    <Switch checkedChildren="SMS Aktif" unCheckedChildren="SMS Pasif" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="pushNotifications" valuePropName="checked">
                    <Switch checkedChildren="Push Aktif" unCheckedChildren="Push Pasif" />
                  </Form.Item>
                </Col>
              </Row>

              <Divider />
              
              <Title level={5}>Bildirim Türleri</Title>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Form.Item name="systemAlerts" valuePropName="checked">
                    <Checkbox>Sistem Uyarıları</Checkbox>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="securityAlerts" valuePropName="checked">
                    <Checkbox>Güvenlik Uyarıları</Checkbox>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="billingAlerts" valuePropName="checked">
                    <Checkbox>Faturalama Bildirimleri</Checkbox>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="userActivityAlerts" valuePropName="checked">
                    <Checkbox>Kullanıcı Aktivite Bildirimleri</Checkbox>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="weeklyReport" valuePropName="checked">
                    <Checkbox>Haftalık Rapor</Checkbox>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="monthlyReport" valuePropName="checked">
                    <Checkbox>Aylık Rapor</Checkbox>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item style={{ marginTop: 24 }}>
                <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
                  Kaydet
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        <TabPane tab={<span><SafetyOutlined /> Güvenlik</span>} key="security">
          <Card>
            <Form
              form={securityForm}
              layout="vertical"
              initialValues={settings.security}
              onFinish={() => handleSaveSettings('Güvenlik')}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="twoFactorAuth"
                    label="İki Faktörlü Doğrulama"
                  >
                    <Select>
                      <Option value="disabled">Devre Dışı</Option>
                      <Option value="optional">Opsiyonel</Option>
                      <Option value="required">Zorunlu</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="sessionTimeout"
                    label="Oturum Zaman Aşımı (dakika)"
                  >
                    <InputNumber min={5} max={1440} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="passwordPolicy"
                    label="Şifre Politikası"
                  >
                    <Select>
                      <Option value="weak">Zayıf</Option>
                      <Option value="medium">Orta</Option>
                      <Option value="strong">Güçlü</Option>
                      <Option value="very-strong">Çok Güçlü</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="passwordExpiry"
                    label="Şifre Geçerlilik Süresi (gün)"
                  >
                    <InputNumber min={0} max={365} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="maxLoginAttempts"
                    label="Max Giriş Denemesi"
                  >
                    <InputNumber min={3} max={10} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="lockoutDuration"
                    label="Hesap Kilitleme Süresi (dakika)"
                  >
                    <InputNumber min={5} max={1440} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <Form.Item name="forceHttps" valuePropName="checked">
                    <Switch checkedChildren="HTTPS Zorunlu" unCheckedChildren="HTTPS Opsiyonel" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="corsEnabled" valuePropName="checked">
                    <Switch checkedChildren="CORS Aktif" unCheckedChildren="CORS Pasif" />
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              <Title level={5}>IP Whitelist</Title>
              <Alert
                message="Sadece bu IP adreslerinden erişime izin verilir (boş bırakılırsa tüm IP'ler)"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <List
                size="small"
                dataSource={ipWhitelist}
                renderItem={(ip: string) => (
                  <List.Item
                    actions={[
                      <Button type="text" danger size="small" icon={<DeleteOutlined />} />
                    ]}
                  >
                    {ip}
                  </List.Item>
                )}
              />
              <Button icon={<PlusOutlined />} style={{ marginTop: 8 }}>
                IP Adresi Ekle
              </Button>

              <Form.Item style={{ marginTop: 24 }}>
                <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
                  Kaydet
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        <TabPane tab={<span><ApiOutlined /> API</span>} key="api">
          <Card>
            <Form
              form={apiForm}
              layout="vertical"
              initialValues={settings.api}
              onFinish={() => handleSaveSettings('API')}
            >
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item name="enabled" valuePropName="checked">
                    <Switch checkedChildren="API Aktif" unCheckedChildren="API Pasif" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="rateLimit"
                    label="Rate Limit (istek/saat)"
                  >
                    <InputNumber min={100} max={100000} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="apiVersion"
                    label="API Versiyonu"
                  >
                    <Select>
                      <Option value="v1">v1</Option>
                      <Option value="v2">v2</Option>
                      <Option value="v3">v3</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    name="webhookUrl"
                    label="Webhook URL"
                  >
                    <Input placeholder="https://api.example.com/webhooks" />
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              <Title level={5}>API Anahtarları</Title>
              <Table
                dataSource={apiKeys}
                columns={apiKeyColumns}
                rowKey="id"
                size="small"
                pagination={false}
              />
              <Button
                icon={<PlusOutlined />}
                style={{ marginTop: 16 }}
                onClick={handleGenerateApiKey}
              >
                Yeni API Anahtarı Oluştur
              </Button>

              <Form.Item style={{ marginTop: 24 }}>
                <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
                  Kaydet
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        <TabPane tab={<span><DatabaseOutlined /> Depolama</span>} key="storage">
          <Card>
            <Form
              layout="vertical"
              initialValues={settings.storage}
              onFinish={() => handleSaveSettings('Depolama')}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="provider"
                    label="Depolama Sağlayıcı"
                  >
                    <Select>
                      <Option value="local">Yerel</Option>
                      <Option value="s3">Amazon S3</Option>
                      <Option value="azure">Azure Blob</Option>
                      <Option value="gcs">Google Cloud Storage</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="region"
                    label="Bölge"
                  >
                    <Select>
                      <Option value="eu-west-1">EU West (Ireland)</Option>
                      <Option value="us-east-1">US East (Virginia)</Option>
                      <Option value="ap-southeast-1">Asia Pacific (Singapore)</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="bucket"
                    label="Bucket/Container Adı"
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="maxFileSize"
                    label="Max Dosya Boyutu (MB)"
                  >
                    <InputNumber min={1} max={1000} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              <Title level={5}>Yedekleme Ayarları</Title>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item name="autoBackup" valuePropName="checked">
                    <Switch checkedChildren="Otomatik Yedekleme Aktif" unCheckedChildren="Pasif" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="backupFrequency"
                    label="Yedekleme Sıklığı"
                  >
                    <Select>
                      <Option value="hourly">Saatlik</Option>
                      <Option value="daily">Günlük</Option>
                      <Option value="weekly">Haftalık</Option>
                      <Option value="monthly">Aylık</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="backupRetention"
                    label="Saklama Süresi (gün)"
                  >
                    <InputNumber min={1} max={365} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
                  Kaydet
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        <TabPane tab={<span><ExperimentOutlined /> Gelişmiş</span>} key="advanced">
          <Card>
            <Alert
              message="Dikkat"
              description="Bu ayarlar sistem performansını ve güvenliğini etkileyebilir. Dikkatli kullanın."
              type="warning"
              showIcon
              style={{ marginBottom: 24 }}
            />
            <Form
              layout="vertical"
              initialValues={settings.advanced}
              onFinish={() => handleSaveSettings('Gelişmiş')}
            >
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Form.Item name="maintenanceMode" valuePropName="checked">
                    <Switch
                      checkedChildren="Bakım Modu Aktif"
                      unCheckedChildren="Bakım Modu Pasif"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="debugMode" valuePropName="checked">
                    <Switch
                      checkedChildren="Debug Modu Aktif"
                      unCheckedChildren="Debug Modu Pasif"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="cdnEnabled" valuePropName="checked">
                    <Switch checkedChildren="CDN Aktif" unCheckedChildren="CDN Pasif" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="cacheEnabled" valuePropName="checked">
                    <Switch checkedChildren="Cache Aktif" unCheckedChildren="Cache Pasif" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="auditLog" valuePropName="checked">
                    <Switch checkedChildren="Audit Log Aktif" unCheckedChildren="Audit Log Pasif" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="cacheTTL"
                    label="Cache TTL (saniye)"
                  >
                    <InputNumber min={60} max={86400} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="dataRetention"
                    label="Veri Saklama Süresi (gün)"
                  >
                    <InputNumber min={30} max={3650} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="customDomain"
                    label="Özel Domain"
                  >
                    <Input placeholder="app.example.com" />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    name="maintenanceMessage"
                    label="Bakım Modu Mesajı"
                  >
                    <TextArea
                      rows={3}
                      placeholder="Sistem bakımda, lütfen daha sonra tekrar deneyin."
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
                    Kaydet
                  </Button>
                  <Button danger icon={<WarningOutlined />}>
                    Cache Temizle
                  </Button>
                  <Button icon={<ReloadOutlined />}>
                    Sistemi Yeniden Başlat
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
      </Tabs>
    </PageContainer>
  );
};

export default TenantSettings;