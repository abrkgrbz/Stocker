import React, { useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import {
  Card,
  Tabs,
  Form,
  Input,
  Switch,
  Button,
  Select,
  TimePicker,
  InputNumber,
  Space,
  Divider,
  Typography,
  Alert,
  Row,
  Col,
  Upload,
  ColorPicker,
  Radio,
  Checkbox,
  message,
  Spin,
} from 'antd';
import {
  SaveOutlined,
  SettingOutlined,
  MailOutlined,
  SecurityScanOutlined,
  DatabaseOutlined,
  ApiOutlined,
  GlobalOutlined,
  CloudUploadOutlined,
  BellOutlined,
  DollarOutlined,
  FileTextOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  UploadOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useGetGeneralSettings, useUpdateGeneralSettings } from '@/features/master/hooks/useSettings';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

export const MasterSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [generalForm] = Form.useForm();
  const [emailForm] = Form.useForm();
  const [securityForm] = Form.useForm();
  const [tenantForm] = Form.useForm();
  const [maintenanceForm] = Form.useForm();

  // Mock data for now - will be replaced with actual API calls
  const { data: settings, isLoading } = useGetGeneralSettings();
  const updateSettingsMutation = useUpdateGeneralSettings();

  // General Settings Tab
  const GeneralSettingsTab = () => (
    <Card>
      <Form
        form={generalForm}
        layout="vertical"
        initialValues={{
          appName: 'Stocker',
          appTitle: 'Stok Yönetim Sistemi',
          appDescription: 'Modern ve güçlü stok yönetim çözümü',
          appVersion: '1.0.0',
          appUrl: 'https://stoocker.app',
          apiUrl: 'https://api.stoocker.app',
          supportEmail: 'info@stoocker.app',
          supportPhone: '+90 555 123 4567',
          defaultLanguage: 'tr',
          defaultTimezone: 'Europe/Istanbul',
          dateFormat: 'DD/MM/YYYY',
          timeFormat: 'HH:mm',
          currency: 'TRY',
          currencyPosition: 'before',
        }}
        onFinish={(values) => {
          console.log('General settings:', values);
          message.success('Genel ayarlar kaydedildi');
        }}
      >
        <Title level={4}>
          <GlobalOutlined /> Uygulama Bilgileri
        </Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="appName"
              label="Uygulama Adı"
              rules={[{ required: true, message: 'Uygulama adı zorunludur' }]}
            >
              <Input placeholder="Stocker" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="appVersion"
              label="Versiyon"
              rules={[{ required: true, message: 'Versiyon zorunludur' }]}
            >
              <Input placeholder="1.0.0" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="appTitle"
              label="Uygulama Başlığı"
              rules={[{ required: true, message: 'Başlık zorunludur' }]}
            >
              <Input placeholder="Stok Yönetim Sistemi" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="appUrl"
              label="Uygulama URL"
              rules={[
                { required: true, message: 'URL zorunludur' },
                { type: 'url', message: 'Geçerli bir URL girin' },
              ]}
            >
              <Input placeholder="https://stoocker.app" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="appDescription"
          label="Uygulama Açıklaması"
        >
          <TextArea rows={3} placeholder="Modern ve güçlü stok yönetim çözümü" />
        </Form.Item>

        <Form.Item
          name="apiUrl"
          label="API URL"
          rules={[
            { required: true, message: 'API URL zorunludur' },
            { type: 'url', message: 'Geçerli bir URL girin' },
          ]}
        >
          <Input placeholder="https://api.stoocker.app" />
        </Form.Item>

        <Divider />

        <Title level={4}>
          <MailOutlined /> İletişim Bilgileri
        </Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="supportEmail"
              label="Destek E-posta"
              rules={[
                { required: true, message: 'E-posta zorunludur' },
                { type: 'email', message: 'Geçerli bir e-posta girin' },
              ]}
            >
              <Input placeholder="info@stoocker.app" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="supportPhone"
              label="Destek Telefon"
            >
              <Input placeholder="+90 555 123 4567" />
            </Form.Item>
          </Col>
        </Row>

        <Divider />

        <Title level={4}>
          <ClockCircleOutlined /> Bölgesel Ayarlar
        </Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="defaultLanguage"
              label="Varsayılan Dil"
              rules={[{ required: true, message: 'Dil seçimi zorunludur' }]}
            >
              <Select>
                <Select.Option value="tr">Türkçe</Select.Option>
                <Select.Option value="en">English</Select.Option>
                <Select.Option value="de">Deutsch</Select.Option>
                <Select.Option value="fr">Français</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="defaultTimezone"
              label="Varsayılan Saat Dilimi"
              rules={[{ required: true, message: 'Saat dilimi zorunludur' }]}
            >
              <Select showSearch>
                <Select.Option value="Europe/Istanbul">Europe/Istanbul</Select.Option>
                <Select.Option value="Europe/London">Europe/London</Select.Option>
                <Select.Option value="America/New_York">America/New_York</Select.Option>
                <Select.Option value="Asia/Tokyo">Asia/Tokyo</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="dateFormat"
              label="Tarih Formatı"
              rules={[{ required: true, message: 'Tarih formatı zorunludur' }]}
            >
              <Select>
                <Select.Option value="DD/MM/YYYY">DD/MM/YYYY</Select.Option>
                <Select.Option value="MM/DD/YYYY">MM/DD/YYYY</Select.Option>
                <Select.Option value="YYYY-MM-DD">YYYY-MM-DD</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="timeFormat"
              label="Saat Formatı"
              rules={[{ required: true, message: 'Saat formatı zorunludur' }]}
            >
              <Select>
                <Select.Option value="HH:mm">24 Saat (15:30)</Select.Option>
                <Select.Option value="hh:mm A">12 Saat (03:30 PM)</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Divider />

        <Title level={4}>
          <DollarOutlined /> Para Birimi Ayarları
        </Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="currency"
              label="Para Birimi"
              rules={[{ required: true, message: 'Para birimi zorunludur' }]}
            >
              <Select showSearch>
                <Select.Option value="TRY">TRY - Türk Lirası</Select.Option>
                <Select.Option value="USD">USD - US Dollar</Select.Option>
                <Select.Option value="EUR">EUR - Euro</Select.Option>
                <Select.Option value="GBP">GBP - British Pound</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="currencyPosition"
              label="Para Birimi Pozisyonu"
              rules={[{ required: true, message: 'Pozisyon seçimi zorunludur' }]}
            >
              <Radio.Group>
                <Radio value="before">Önce (₺100)</Radio>
                <Radio value="after">Sonra (100₺)</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
              Kaydet
            </Button>
            <Button onClick={() => generalForm.resetFields()}>
              Sıfırla
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );

  // Email Settings Tab
  const EmailSettingsTab = () => (
    <Card>
      <Form
        form={emailForm}
        layout="vertical"
        initialValues={{
          emailProvider: 'smtp',
          smtpHost: 'smtp.gmail.com',
          smtpPort: 587,
          smtpUsername: 'info@stoocker.app',
          smtpPassword: '',
          smtpEncryption: 'tls',
          fromEmail: 'info@stoocker.app',
          fromName: 'Stocker',
          replyToEmail: 'support@stoocker.app',
        }}
        onFinish={(values) => {
          console.log('Email settings:', values);
          message.success('E-posta ayarları kaydedildi');
        }}
      >
        <Title level={4}>
          <MailOutlined /> E-posta Sağlayıcı
        </Title>
        <Form.Item
          name="emailProvider"
          label="E-posta Servisi"
          rules={[{ required: true, message: 'Servis seçimi zorunludur' }]}
        >
          <Select>
            <Select.Option value="smtp">SMTP</Select.Option>
            <Select.Option value="sendgrid">SendGrid</Select.Option>
            <Select.Option value="mailgun">Mailgun</Select.Option>
            <Select.Option value="ses">Amazon SES</Select.Option>
          </Select>
        </Form.Item>

        <Title level={4}>SMTP Ayarları</Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={16}>
            <Form.Item
              name="smtpHost"
              label="SMTP Sunucu"
              rules={[{ required: true, message: 'SMTP sunucu zorunludur' }]}
            >
              <Input placeholder="smtp.gmail.com" />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              name="smtpPort"
              label="Port"
              rules={[{ required: true, message: 'Port zorunludur' }]}
            >
              <InputNumber min={1} max={65535} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="smtpUsername"
              label="Kullanıcı Adı"
              rules={[{ required: true, message: 'Kullanıcı adı zorunludur' }]}
            >
              <Input placeholder="info@stoocker.app" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="smtpPassword"
              label="Şifre"
              rules={[{ required: true, message: 'Şifre zorunludur' }]}
            >
              <Input.Password placeholder="••••••••" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="smtpEncryption"
          label="Şifreleme"
          rules={[{ required: true, message: 'Şifreleme tipi zorunludur' }]}
        >
          <Radio.Group>
            <Radio value="none">Yok</Radio>
            <Radio value="ssl">SSL</Radio>
            <Radio value="tls">TLS</Radio>
          </Radio.Group>
        </Form.Item>

        <Divider />

        <Title level={4}>Gönderici Bilgileri</Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="fromEmail"
              label="Gönderici E-posta"
              rules={[
                { required: true, message: 'E-posta zorunludur' },
                { type: 'email', message: 'Geçerli bir e-posta girin' },
              ]}
            >
              <Input placeholder="info@stoocker.app" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="fromName"
              label="Gönderici Adı"
              rules={[{ required: true, message: 'İsim zorunludur' }]}
            >
              <Input placeholder="Stocker" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="replyToEmail"
          label="Yanıt E-postası"
          rules={[{ type: 'email', message: 'Geçerli bir e-posta girin' }]}
        >
          <Input placeholder="support@stoocker.app" />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
              Kaydet
            </Button>
            <Button icon={<MailOutlined />}>
              Test E-postası Gönder
            </Button>
            <Button onClick={() => emailForm.resetFields()}>
              Sıfırla
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );

  // Security Settings Tab
  const SecuritySettingsTab = () => (
    <Card>
      <Form
        form={securityForm}
        layout="vertical"
        initialValues={{
          passwordMinLength: 8,
          passwordRequireUppercase: true,
          passwordRequireLowercase: true,
          passwordRequireNumbers: true,
          passwordRequireSpecialChars: true,
          passwordExpirationDays: 90,
          maxLoginAttempts: 5,
          lockoutDuration: 30,
          sessionTimeout: 60,
          enableTwoFactor: false,
          enableCaptcha: true,
          enableIpWhitelist: false,
          ipWhitelist: '',
          enableApiRateLimit: true,
          apiRateLimit: 100,
        }}
        onFinish={(values) => {
          console.log('Security settings:', values);
          message.success('Güvenlik ayarları kaydedildi');
        }}
      >
        <Title level={4}>
          <SecurityScanOutlined /> Şifre Politikası
        </Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="passwordMinLength"
              label="Minimum Şifre Uzunluğu"
              rules={[{ required: true, message: 'Uzunluk zorunludur' }]}
            >
              <InputNumber min={6} max={32} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="passwordExpirationDays"
              label="Şifre Geçerlilik Süresi (Gün)"
            >
              <InputNumber min={0} max={365} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Space direction="vertical" style={{ width: '100%' }}>
          <Form.Item name="passwordRequireUppercase" valuePropName="checked">
            <Checkbox>Büyük harf zorunlu</Checkbox>
          </Form.Item>
          <Form.Item name="passwordRequireLowercase" valuePropName="checked">
            <Checkbox>Küçük harf zorunlu</Checkbox>
          </Form.Item>
          <Form.Item name="passwordRequireNumbers" valuePropName="checked">
            <Checkbox>Rakam zorunlu</Checkbox>
          </Form.Item>
          <Form.Item name="passwordRequireSpecialChars" valuePropName="checked">
            <Checkbox>Özel karakter zorunlu</Checkbox>
          </Form.Item>
        </Space>

        <Divider />

        <Title level={4}>Giriş Güvenliği</Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="maxLoginAttempts"
              label="Maksimum Giriş Denemesi"
              rules={[{ required: true, message: 'Değer zorunludur' }]}
            >
              <InputNumber min={3} max={10} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="lockoutDuration"
              label="Hesap Kilitleme Süresi (Dakika)"
              rules={[{ required: true, message: 'Süre zorunludur' }]}
            >
              <InputNumber min={5} max={1440} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="sessionTimeout"
          label="Oturum Zaman Aşımı (Dakika)"
          rules={[{ required: true, message: 'Süre zorunludur' }]}
        >
          <InputNumber min={5} max={1440} style={{ width: '100%' }} />
        </Form.Item>

        <Space direction="vertical" style={{ width: '100%' }}>
          <Form.Item name="enableTwoFactor" valuePropName="checked">
            <Checkbox>İki faktörlü doğrulama etkin</Checkbox>
          </Form.Item>
          <Form.Item name="enableCaptcha" valuePropName="checked">
            <Checkbox>CAPTCHA etkin</Checkbox>
          </Form.Item>
        </Space>

        <Divider />

        <Title level={4}>IP Güvenliği</Title>
        <Form.Item name="enableIpWhitelist" valuePropName="checked">
          <Checkbox>IP beyaz listesi etkin</Checkbox>
        </Form.Item>
        <Form.Item
          name="ipWhitelist"
          label="İzin Verilen IP Adresleri (virgülle ayırın)"
        >
          <TextArea rows={3} placeholder="192.168.1.1, 10.0.0.0/24" />
        </Form.Item>

        <Divider />

        <Title level={4}>API Güvenliği</Title>
        <Form.Item name="enableApiRateLimit" valuePropName="checked">
          <Checkbox>API rate limiting etkin</Checkbox>
        </Form.Item>
        <Form.Item
          name="apiRateLimit"
          label="Dakika Başına Maksimum İstek"
        >
          <InputNumber min={10} max={1000} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
              Kaydet
            </Button>
            <Button onClick={() => securityForm.resetFields()}>
              Sıfırla
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );

  // Tenant Settings Tab
  const TenantSettingsTab = () => (
    <Card>
      <Form
        form={tenantForm}
        layout="vertical"
        initialValues={{
          allowSelfRegistration: true,
          requireEmailVerification: true,
          requirePhoneVerification: false,
          requireAdminApproval: false,
          defaultTrialDays: 14,
          maxUsersPerTenant: 50,
          maxStoragePerTenant: 10,
          allowCustomDomain: true,
          autoProvisionDatabase: true,
          defaultPackage: 'starter',
        }}
        onFinish={(values) => {
          console.log('Tenant settings:', values);
          message.success('Tenant ayarları kaydedildi');
        }}
      >
        <Title level={4}>
          <TeamOutlined /> Kayıt Ayarları
        </Title>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Form.Item name="allowSelfRegistration" valuePropName="checked">
            <Checkbox>Self-registration izin ver</Checkbox>
          </Form.Item>
          <Form.Item name="requireEmailVerification" valuePropName="checked">
            <Checkbox>E-posta doğrulaması zorunlu</Checkbox>
          </Form.Item>
          <Form.Item name="requirePhoneVerification" valuePropName="checked">
            <Checkbox>Telefon doğrulaması zorunlu</Checkbox>
          </Form.Item>
          <Form.Item name="requireAdminApproval" valuePropName="checked">
            <Checkbox>Admin onayı zorunlu</Checkbox>
          </Form.Item>
        </Space>

        <Divider />

        <Title level={4}>Varsayılan Limitler</Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="defaultTrialDays"
              label="Deneme Süresi (Gün)"
              rules={[{ required: true, message: 'Süre zorunludur' }]}
            >
              <InputNumber min={0} max={90} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="maxUsersPerTenant"
              label="Maksimum Kullanıcı Sayısı"
              rules={[{ required: true, message: 'Değer zorunludur' }]}
            >
              <InputNumber min={1} max={1000} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="maxStoragePerTenant"
          label="Maksimum Depolama Alanı (GB)"
          rules={[{ required: true, message: 'Değer zorunludur' }]}
        >
          <InputNumber min={1} max={1000} style={{ width: '100%' }} />
        </Form.Item>

        <Divider />

        <Title level={4}>Gelişmiş Ayarlar</Title>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Form.Item name="allowCustomDomain" valuePropName="checked">
            <Checkbox>Özel domain kullanımına izin ver</Checkbox>
          </Form.Item>
          <Form.Item name="autoProvisionDatabase" valuePropName="checked">
            <Checkbox>Otomatik veritabanı oluştur</Checkbox>
          </Form.Item>
        </Space>

        <Form.Item
          name="defaultPackage"
          label="Varsayılan Paket"
          rules={[{ required: true, message: 'Paket seçimi zorunludur' }]}
        >
          <Select>
            <Select.Option value="free">Ücretsiz</Select.Option>
            <Select.Option value="starter">Başlangıç</Select.Option>
            <Select.Option value="professional">Profesyonel</Select.Option>
            <Select.Option value="enterprise">Kurumsal</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
              Kaydet
            </Button>
            <Button onClick={() => tenantForm.resetFields()}>
              Sıfırla
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );

  // Maintenance Settings Tab
  const MaintenanceSettingsTab = () => (
    <Card>
      <Form
        form={maintenanceForm}
        layout="vertical"
        initialValues={{
          maintenanceMode: false,
          maintenanceMessage: 'Sistem bakımda. Lütfen daha sonra tekrar deneyin.',
          allowedIps: '',
          scheduledMaintenance: false,
          maintenanceStart: null,
          maintenanceEnd: null,
        }}
        onFinish={(values) => {
          console.log('Maintenance settings:', values);
          message.success('Bakım ayarları kaydedildi');
        }}
      >
        <Alert
          message="Bakım Modu Uyarısı"
          description="Bakım modu etkinleştirildiğinde, sadece belirtilen IP adreslerinden erişim sağlanabilir."
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Form.Item name="maintenanceMode" valuePropName="checked">
          <Switch
            checkedChildren="Bakım Modu Açık"
            unCheckedChildren="Bakım Modu Kapalı"
          />
        </Form.Item>

        <Form.Item
          name="maintenanceMessage"
          label="Bakım Mesajı"
          rules={[{ required: true, message: 'Mesaj zorunludur' }]}
        >
          <TextArea
            rows={3}
            placeholder="Sistem bakımda. Lütfen daha sonra tekrar deneyin."
          />
        </Form.Item>

        <Form.Item
          name="allowedIps"
          label="Bakım Sırasında İzin Verilen IP Adresleri"
          extra="Virgülle ayırarak birden fazla IP girebilirsiniz"
        >
          <TextArea rows={2} placeholder="192.168.1.1, 10.0.0.1" />
        </Form.Item>

        <Divider />

        <Title level={4}>Planlanmış Bakım</Title>
        <Form.Item name="scheduledMaintenance" valuePropName="checked">
          <Checkbox>Planlanmış bakım etkin</Checkbox>
        </Form.Item>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="maintenanceStart"
              label="Başlangıç Zamanı"
            >
              <TimePicker style={{ width: '100%' }} format="HH:mm" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="maintenanceEnd"
              label="Bitiş Zamanı"
            >
              <TimePicker style={{ width: '100%' }} format="HH:mm" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
              Kaydet
            </Button>
            <Button onClick={() => maintenanceForm.resetFields()}>
              Sıfırla
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );

  if (isLoading) {
    return (
      <PageContainer>
        <Card>
          <div style={{ textAlign: 'center', padding: 50 }}>
            <Spin size="large" />
          </div>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Sistem Ayarları"
      subTitle="Uygulama ve sistem ayarlarını yönetin"
      extra={[
        <Button key="refresh" icon={<ReloadOutlined />}>
          Yenile
        </Button>,
      ]}
    >
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          tabPosition="left"
          items={[
            {
              key: 'general',
              label: (
                <span>
                  <SettingOutlined /> Genel Ayarlar
                </span>
              ),
              children: <GeneralSettingsTab />,
            },
            {
              key: 'email',
              label: (
                <span>
                  <MailOutlined /> E-posta Ayarları
                </span>
              ),
              children: <EmailSettingsTab />,
            },
            {
              key: 'security',
              label: (
                <span>
                  <SecurityScanOutlined /> Güvenlik
                </span>
              ),
              children: <SecuritySettingsTab />,
            },
            {
              key: 'tenant',
              label: (
                <span>
                  <TeamOutlined /> Tenant Ayarları
                </span>
              ),
              children: <TenantSettingsTab />,
            },
            {
              key: 'maintenance',
              label: (
                <span>
                  <DatabaseOutlined /> Bakım Modu
                </span>
              ),
              children: <MaintenanceSettingsTab />,
            },
          ]}
        />
      </Card>
    </PageContainer>
  );
};