import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Form,
  Input,
  Button,
  Select,
  Switch,
  Row,
  Col,
  Upload,
  message,
  Alert,
  Divider,
  Typography,
  Space,
  InputNumber,
  TimePicker,
  Radio,
  Checkbox,
  Modal,
  List,
  Avatar,
  Badge,
  Tag,
  Tooltip,
  notification,
} from 'antd';
import {
  SaveOutlined,
  UploadOutlined,
  SettingOutlined,
  BellOutlined,
  MailOutlined,
  GlobalOutlined,
  SafetyOutlined,
  FileTextOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  LockOutlined,
  ApiOutlined,
  DatabaseOutlined,
  CloudUploadOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  KeyOutlined,
  TeamOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  BankOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { PageHeader } from '@/shared/components/PageHeader';
import { formRules } from '@/shared/utils/validators';
import dayjs from 'dayjs';
import './style.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Dragger } = Upload;

interface CompanySettings {
  companyName: string;
  companyLogo?: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  taxNumber: string;
  taxOffice: string;
  website?: string;
  industry: string;
}

interface GeneralSettings {
  timezone: string;
  language: string;
  currency: string;
  dateFormat: string;
  timeFormat: string;
  weekStartsOn: string;
  fiscalYearStart: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  invoiceReminders: boolean;
  paymentReminders: boolean;
  systemUpdates: boolean;
  marketingEmails: boolean;
  reminderDays: number;
}

interface InvoiceSettings {
  invoicePrefix: string;
  invoiceStartNumber: number;
  invoiceNumberFormat: string;
  dueDays: number;
  defaultTaxRate: number;
  defaultPaymentMethod: string;
  showLogo: boolean;
  showQRCode: boolean;
  footerText: string;
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: number;
  passwordExpiry: number;
  passwordComplexity: string;
  ipWhitelist: string[];
  loginAttempts: number;
  lockoutDuration: number;
}

export const TenantSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('company');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [companyForm] = Form.useForm();
  const [generalForm] = Form.useForm();
  const [notificationForm] = Form.useForm();
  const [invoiceForm] = Form.useForm();
  const [securityForm] = Form.useForm();
  const [emailForm] = Form.useForm();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      // API'den ayarları yükle
      // const response = await settingsService.getTenantSettings();
      
      // Mock data
      const mockSettings = {
        company: {
          companyName: 'ABC Teknoloji A.Ş.',
          companyAddress: 'Maslak Mah. Teknoloji Cad. No:15\nSarıyer/İstanbul',
          companyPhone: '+90 212 555 0100',
          companyEmail: 'info@abcteknoloji.com',
          taxNumber: '1234567890',
          taxOffice: 'Sarıyer',
          website: 'www.abcteknoloji.com',
          industry: 'technology',
        },
        general: {
          timezone: 'Europe/Istanbul',
          language: 'tr',
          currency: 'TRY',
          dateFormat: 'DD.MM.YYYY',
          timeFormat: '24h',
          weekStartsOn: 'monday',
          fiscalYearStart: '01-01',
        },
        notifications: {
          emailNotifications: true,
          smsNotifications: false,
          pushNotifications: true,
          invoiceReminders: true,
          paymentReminders: true,
          systemUpdates: true,
          marketingEmails: false,
          reminderDays: 3,
        },
        invoice: {
          invoicePrefix: 'INV',
          invoiceStartNumber: 1000,
          invoiceNumberFormat: '{prefix}-{year}-{number}',
          dueDays: 30,
          defaultTaxRate: 18,
          defaultPaymentMethod: 'BankTransfer',
          showLogo: true,
          showQRCode: true,
          footerText: 'Teşekkür ederiz.',
        },
        security: {
          twoFactorAuth: false,
          sessionTimeout: 30,
          passwordExpiry: 90,
          passwordComplexity: 'medium',
          ipWhitelist: [],
          loginAttempts: 5,
          lockoutDuration: 30,
        },
      };

      companyForm.setFieldsValue(mockSettings.company);
      generalForm.setFieldsValue(mockSettings.general);
      notificationForm.setFieldsValue(mockSettings.notifications);
      invoiceForm.setFieldsValue(mockSettings.invoice);
      securityForm.setFieldsValue(mockSettings.security);
    } catch (error) {
      message.error('Ayarlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCompanySettings = async (values: CompanySettings) => {
    setSaving(true);
    try {
      // await settingsService.updateCompanySettings(values);
      message.success('Şirket bilgileri güncellendi');
    } catch (error) {
      message.error('Güncelleme başarısız');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveGeneralSettings = async (values: GeneralSettings) => {
    setSaving(true);
    try {
      // await settingsService.updateGeneralSettings(values);
      message.success('Genel ayarlar güncellendi');
    } catch (error) {
      message.error('Güncelleme başarısız');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotificationSettings = async (values: NotificationSettings) => {
    setSaving(true);
    try {
      // await settingsService.updateNotificationSettings(values);
      message.success('Bildirim ayarları güncellendi');
    } catch (error) {
      message.error('Güncelleme başarısız');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveInvoiceSettings = async (values: InvoiceSettings) => {
    setSaving(true);
    try {
      // await settingsService.updateInvoiceSettings(values);
      message.success('Fatura ayarları güncellendi');
    } catch (error) {
      message.error('Güncelleme başarısız');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSecuritySettings = async (values: SecuritySettings) => {
    setSaving(true);
    try {
      // await settingsService.updateSecuritySettings(values);
      message.success('Güvenlik ayarları güncellendi');
    } catch (error) {
      message.error('Güncelleme başarısız');
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmailSettings = async () => {
    const values = emailForm.getFieldsValue();
    try {
      // await settingsService.testEmailSettings(values);
      notification.success({
        message: 'Test Başarılı',
        description: 'Test e-postası başarıyla gönderildi.',
      });
    } catch (error) {
      notification.error({
        message: 'Test Başarısız',
        description: 'E-posta gönderilemedi. Ayarları kontrol edin.',
      });
    }
  };

  const uploadProps = {
    name: 'logo',
    action: '/api/upload/logo',
    headers: {
      authorization: 'authorization-text',
    },
    onChange(info: any) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} yüklendi`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} yüklenemedi`);
      }
    },
  };

  return (
    <div className="tenant-settings-page">
      <PageHeader
        title="Ayarlar"
        subtitle="Sistem ve şirket ayarlarını yönetin"
        breadcrumbs={[
          { title: 'Ana Sayfa', path: '/app/tenant' },
          { title: 'Ayarlar' },
        ]}
      />

      <Card loading={loading}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {/* Şirket Bilgileri */}
          <TabPane
            tab={
              <span>
                <BankOutlined />
                Şirket Bilgileri
              </span>
            }
            key="company"
          >
            <Form
              form={companyForm}
              layout="vertical"
              onFinish={handleSaveCompanySettings}
            >
              <Title level={4}>Şirket Bilgileri</Title>
              <Paragraph type="secondary">
                Faturalarda ve raporlarda görünecek şirket bilgilerinizi güncelleyin.
              </Paragraph>

              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="companyName"
                    label="Şirket Adı"
                    rules={[formRules.required()]}
                  >
                    <Input prefix={<BankOutlined />} placeholder="Şirket adı" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="website" label="Web Sitesi">
                    <Input prefix={<GlobalOutlined />} placeholder="www.sirket.com" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="companyEmail"
                    label="E-posta"
                    rules={[formRules.required(), formRules.email()]}
                  >
                    <Input prefix={<MailOutlined />} placeholder="info@sirket.com" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="companyPhone"
                    label="Telefon"
                    rules={[formRules.required()]}
                  >
                    <Input prefix={<PhoneOutlined />} placeholder="+90 XXX XXX XX XX" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="companyAddress"
                label="Adres"
                rules={[formRules.required()]}
              >
                <TextArea
                  rows={3}
                  placeholder="Şirket adresi"
                />
              </Form.Item>

              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="taxNumber"
                    label="Vergi No"
                    rules={[formRules.required()]}
                  >
                    <Input placeholder="Vergi numarası" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="taxOffice"
                    label="Vergi Dairesi"
                    rules={[formRules.required()]}
                  >
                    <Input placeholder="Vergi dairesi" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="industry" label="Sektör">
                <Select placeholder="Sektör seçin">
                  <Option value="technology">Teknoloji</Option>
                  <Option value="retail">Perakende</Option>
                  <Option value="manufacturing">Üretim</Option>
                  <Option value="service">Hizmet</Option>
                  <Option value="education">Eğitim</Option>
                  <Option value="healthcare">Sağlık</Option>
                  <Option value="other">Diğer</Option>
                </Select>
              </Form.Item>

              <Divider />

              <Title level={5}>Logo</Title>
              <Dragger {...uploadProps} style={{ marginBottom: 24 }}>
                <p className="ant-upload-drag-icon">
                  <CloudUploadOutlined />
                </p>
                <p className="ant-upload-text">
                  Logo yüklemek için tıklayın veya sürükleyin
                </p>
                <p className="ant-upload-hint">
                  PNG, JPG veya SVG formatında, maksimum 2MB
                </p>
              </Dragger>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={saving}
                  icon={<SaveOutlined />}
                >
                  Kaydet
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          {/* Genel Ayarlar */}
          <TabPane
            tab={
              <span>
                <SettingOutlined />
                Genel Ayarlar
              </span>
            }
            key="general"
          >
            <Form
              form={generalForm}
              layout="vertical"
              onFinish={handleSaveGeneralSettings}
            >
              <Title level={4}>Genel Ayarlar</Title>
              <Paragraph type="secondary">
                Dil, para birimi ve tarih formatı gibi genel sistem ayarlarını yapılandırın.
              </Paragraph>

              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item name="language" label="Dil">
                    <Select>
                      <Option value="tr">Türkçe</Option>
                      <Option value="en">English</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="timezone" label="Saat Dilimi">
                    <Select showSearch>
                      <Option value="Europe/Istanbul">İstanbul (UTC+3)</Option>
                      <Option value="Europe/London">Londra (UTC+0)</Option>
                      <Option value="America/New_York">New York (UTC-5)</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item name="currency" label="Para Birimi">
                    <Select>
                      <Option value="TRY">TRY - Türk Lirası (₺)</Option>
                      <Option value="USD">USD - Amerikan Doları ($)</Option>
                      <Option value="EUR">EUR - Euro (€)</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="fiscalYearStart" label="Mali Yıl Başlangıcı">
                    <Select>
                      <Option value="01-01">1 Ocak</Option>
                      <Option value="04-01">1 Nisan</Option>
                      <Option value="07-01">1 Temmuz</Option>
                      <Option value="10-01">1 Ekim</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item name="dateFormat" label="Tarih Formatı">
                    <Select>
                      <Option value="DD.MM.YYYY">DD.MM.YYYY (31.12.2024)</Option>
                      <Option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</Option>
                      <Option value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="timeFormat" label="Saat Formatı">
                    <Radio.Group>
                      <Radio value="24h">24 Saat (14:30)</Radio>
                      <Radio value="12h">12 Saat (2:30 PM)</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="weekStartsOn" label="Hafta Başlangıcı">
                <Radio.Group>
                  <Radio value="monday">Pazartesi</Radio>
                  <Radio value="sunday">Pazar</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={saving}
                  icon={<SaveOutlined />}
                >
                  Kaydet
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          {/* Bildirim Ayarları */}
          <TabPane
            tab={
              <span>
                <BellOutlined />
                Bildirimler
              </span>
            }
            key="notifications"
          >
            <Form
              form={notificationForm}
              layout="vertical"
              onFinish={handleSaveNotificationSettings}
            >
              <Title level={4}>Bildirim Ayarları</Title>
              <Paragraph type="secondary">
                Hangi bildirimleri almak istediğinizi seçin.
              </Paragraph>

              <Title level={5}>Bildirim Kanalları</Title>
              <Row gutter={24} style={{ marginBottom: 24 }}>
                <Col span={8}>
                  <Form.Item name="emailNotifications" valuePropName="checked">
                    <Switch /> E-posta Bildirimleri
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="smsNotifications" valuePropName="checked">
                    <Switch /> SMS Bildirimleri
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="pushNotifications" valuePropName="checked">
                    <Switch /> Push Bildirimleri
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              <Title level={5}>Bildirim Türleri</Title>
              <Row gutter={[24, 16]}>
                <Col span={12}>
                  <Form.Item name="invoiceReminders" valuePropName="checked">
                    <Switch /> Fatura Hatırlatmaları
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="paymentReminders" valuePropName="checked">
                    <Switch /> Ödeme Hatırlatmaları
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="systemUpdates" valuePropName="checked">
                    <Switch /> Sistem Güncellemeleri
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="marketingEmails" valuePropName="checked">
                    <Switch /> Pazarlama E-postaları
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              <Form.Item
                name="reminderDays"
                label="Hatırlatma Süresi (Vade tarihinden kaç gün önce)"
              >
                <InputNumber min={1} max={30} style={{ width: 200 }} />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={saving}
                  icon={<SaveOutlined />}
                >
                  Kaydet
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          {/* Fatura Ayarları */}
          <TabPane
            tab={
              <span>
                <FileTextOutlined />
                Fatura
              </span>
            }
            key="invoice"
          >
            <Form
              form={invoiceForm}
              layout="vertical"
              onFinish={handleSaveInvoiceSettings}
            >
              <Title level={4}>Fatura Ayarları</Title>
              <Paragraph type="secondary">
                Fatura numaralandırma ve varsayılan değerleri ayarlayın.
              </Paragraph>

              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="invoicePrefix"
                    label="Fatura Ön Eki"
                    rules={[formRules.required()]}
                  >
                    <Input placeholder="INV" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="invoiceStartNumber"
                    label="Başlangıç Numarası"
                    rules={[formRules.required()]}
                  >
                    <InputNumber min={1} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="invoiceNumberFormat"
                label="Numara Formatı"
                extra="Kullanılabilir: {prefix}, {year}, {month}, {number}"
              >
                <Input placeholder="{prefix}-{year}-{number}" />
              </Form.Item>

              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="dueDays"
                    label="Varsayılan Vade (Gün)"
                    rules={[formRules.required()]}
                  >
                    <InputNumber min={0} max={365} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="defaultTaxRate"
                    label="Varsayılan KDV Oranı (%)"
                    rules={[formRules.required()]}
                  >
                    <Select>
                      <Option value={0}>%0</Option>
                      <Option value={1}>%1</Option>
                      <Option value={8}>%8</Option>
                      <Option value={18}>%18</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="defaultPaymentMethod" label="Varsayılan Ödeme Yöntemi">
                <Select>
                  <Option value="BankTransfer">Banka Havalesi</Option>
                  <Option value="CreditCard">Kredi Kartı</Option>
                  <Option value="Cash">Nakit</Option>
                  <Option value="Check">Çek</Option>
                </Select>
              </Form.Item>

              <Divider />

              <Title level={5}>Görünüm Ayarları</Title>
              <Row gutter={[24, 16]}>
                <Col span={12}>
                  <Form.Item name="showLogo" valuePropName="checked">
                    <Switch /> Logo Göster
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="showQRCode" valuePropName="checked">
                    <Switch /> QR Kod Göster
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="footerText" label="Fatura Alt Metni">
                <TextArea
                  rows={2}
                  placeholder="Faturanın altında görünecek metin"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={saving}
                  icon={<SaveOutlined />}
                >
                  Kaydet
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          {/* Güvenlik Ayarları */}
          <TabPane
            tab={
              <span>
                <SafetyOutlined />
                Güvenlik
              </span>
            }
            key="security"
          >
            <Form
              form={securityForm}
              layout="vertical"
              onFinish={handleSaveSecuritySettings}
            >
              <Title level={4}>Güvenlik Ayarları</Title>
              <Paragraph type="secondary">
                Hesap güvenliği ve erişim kontrolü ayarlarını yapılandırın.
              </Paragraph>

              <Alert
                message="Güvenlik Uyarısı"
                description="Bu ayarlar tüm kullanıcıları etkileyecektir. Dikkatli bir şekilde yapılandırın."
                type="warning"
                showIcon
                style={{ marginBottom: 24 }}
              />

              <Title level={5}>Kimlik Doğrulama</Title>
              <Form.Item name="twoFactorAuth" valuePropName="checked">
                <Switch /> İki Faktörlü Kimlik Doğrulama
              </Form.Item>

              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="sessionTimeout"
                    label="Oturum Zaman Aşımı (Dakika)"
                  >
                    <InputNumber min={5} max={480} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="passwordExpiry"
                    label="Şifre Geçerlilik Süresi (Gün)"
                  >
                    <InputNumber min={0} max={365} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="passwordComplexity" label="Şifre Karmaşıklığı">
                <Radio.Group>
                  <Radio value="low">Düşük (En az 6 karakter)</Radio>
                  <Radio value="medium">Orta (8 karakter, büyük/küçük harf)</Radio>
                  <Radio value="high">Yüksek (8 karakter, özel karakter)</Radio>
                </Radio.Group>
              </Form.Item>

              <Divider />

              <Title level={5}>Erişim Kontrolü</Title>
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="loginAttempts"
                    label="Maksimum Giriş Denemesi"
                  >
                    <InputNumber min={3} max={10} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="lockoutDuration"
                    label="Hesap Kilitleme Süresi (Dakika)"
                  >
                    <InputNumber min={5} max={1440} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="ipWhitelist"
                label="IP Beyaz Listesi"
                extra="Her satıra bir IP adresi girin. Boş bırakılırsa tüm IP'ler kabul edilir."
              >
                <TextArea
                  rows={4}
                  placeholder="192.168.1.1&#10;10.0.0.0/24"
                />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={saving}
                    icon={<SaveOutlined />}
                  >
                    Kaydet
                  </Button>
                  <Button icon={<KeyOutlined />}>
                    Tüm Oturumları Sonlandır
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </TabPane>

          {/* E-posta Ayarları */}
          <TabPane
            tab={
              <span>
                <MailOutlined />
                E-posta
              </span>
            }
            key="email"
          >
            <Form
              form={emailForm}
              layout="vertical"
              onFinish={(values) => {
                message.success('E-posta ayarları güncellendi');
              }}
            >
              <Title level={4}>E-posta Ayarları</Title>
              <Paragraph type="secondary">
                Sistem e-postalarının gönderimi için SMTP ayarlarını yapılandırın.
              </Paragraph>

              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="smtpHost"
                    label="SMTP Sunucu"
                    rules={[formRules.required()]}
                  >
                    <Input placeholder="smtp.gmail.com" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="smtpPort"
                    label="Port"
                    rules={[formRules.required()]}
                  >
                    <Select>
                      <Option value={25}>25 (Varsayılan)</Option>
                      <Option value={465}>465 (SSL)</Option>
                      <Option value={587}>587 (TLS)</Option>
                      <Option value={2525}>2525 (Alternatif)</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="smtpUser"
                    label="Kullanıcı Adı"
                    rules={[formRules.required()]}
                  >
                    <Input placeholder="email@domain.com" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="smtpPassword"
                    label="Şifre"
                    rules={[formRules.required()]}
                  >
                    <Input.Password placeholder="SMTP şifresi" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="smtpSecure" valuePropName="checked">
                <Switch /> SSL/TLS Kullan
              </Form.Item>

              <Divider />

              <Title level={5}>Gönderen Bilgileri</Title>
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="fromEmail"
                    label="Gönderen E-posta"
                    rules={[formRules.required(), formRules.email()]}
                  >
                    <Input placeholder="noreply@domain.com" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="fromName"
                    label="Gönderen Adı"
                    rules={[formRules.required()]}
                  >
                    <Input placeholder="Stocker Sistem" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={saving}
                    icon={<SaveOutlined />}
                  >
                    Kaydet
                  </Button>
                  <Button onClick={handleTestEmailSettings} icon={<MailOutlined />}>
                    Test E-postası Gönder
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </TabPane>

          {/* API Ayarları */}
          <TabPane
            tab={
              <span>
                <ApiOutlined />
                API
              </span>
            }
            key="api"
          >
            <Title level={4}>API Ayarları</Title>
            <Paragraph type="secondary">
              API anahtarlarını ve webhook ayarlarını yönetin.
            </Paragraph>

            <Alert
              message="API Anahtarı"
              description="API anahtarınız sistem tarafından otomatik oluşturulur ve güvenli bir şekilde saklanır."
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Card title="API Anahtarları" style={{ marginBottom: 24 }}>
              <List
                dataSource={[
                  {
                    id: '1',
                    name: 'Production API Key',
                    key: 'sk_live_***************',
                    created: '2024-01-01',
                    lastUsed: '2024-01-15',
                  },
                  {
                    id: '2',
                    name: 'Test API Key',
                    key: 'sk_test_***************',
                    created: '2024-01-01',
                    lastUsed: '2024-01-14',
                  },
                ]}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Button type="link" danger size="small">
                        İptal Et
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      title={item.name}
                      description={
                        <Space>
                          <Text code>{item.key}</Text>
                          <Text type="secondary">
                            Son kullanım: {item.lastUsed}
                          </Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
              <Button type="dashed" icon={<PlusOutlined />} block>
                Yeni API Anahtarı Oluştur
              </Button>
            </Card>

            <Card title="Webhook Ayarları">
              <Form layout="vertical">
                <Form.Item
                  label="Webhook URL"
                  extra="Sistem olayları bu adrese POST isteği olarak gönderilir"
                >
                  <Input placeholder="https://your-domain.com/webhook" />
                </Form.Item>
                <Form.Item label="Webhook Olayları">
                  <Checkbox.Group>
                    <Row>
                      <Col span={12}>
                        <Checkbox value="invoice.created">Fatura Oluşturuldu</Checkbox>
                      </Col>
                      <Col span={12}>
                        <Checkbox value="invoice.paid">Fatura Ödendi</Checkbox>
                      </Col>
                      <Col span={12}>
                        <Checkbox value="user.created">Kullanıcı Oluşturuldu</Checkbox>
                      </Col>
                      <Col span={12}>
                        <Checkbox value="user.deleted">Kullanıcı Silindi</Checkbox>
                      </Col>
                    </Row>
                  </Checkbox.Group>
                </Form.Item>
                <Form.Item>
                  <Button type="primary" icon={<SaveOutlined />}>
                    Webhook Ayarlarını Kaydet
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default TenantSettings;