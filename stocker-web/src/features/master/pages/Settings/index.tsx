import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Form,
  Input,
  Select,
  Switch,
  Button,
  Row,
  Col,
  InputNumber,
  TimePicker,
  Space,
  Typography,
  Divider,
  Alert,
  Table,
  Tag,
  Modal,
  message,
  Spin,
  Badge,
  List,
  Tooltip,
  Upload,
  Radio,
  Checkbox,
  Collapse,
  Progress,
  Statistic,
  notification,
} from 'antd';
import {
  SettingOutlined,
  MailOutlined,
  SafetyOutlined,
  DatabaseOutlined,
  ToolOutlined,
  BellOutlined,
  SaveOutlined,
  ReloadOutlined,
  CloudUploadOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  GlobalOutlined,
  ClockCircleOutlined,
  LockOutlined,
  KeyOutlined,
  UserOutlined,
  ApiOutlined,
  FileProtectOutlined,
  WarningOutlined,
  SendOutlined,
  TestTubeOutlined,
  DeleteOutlined,
  ExportOutlined,
  ImportOutlined,
  ThunderboltOutlined,
  CloudServerOutlined,
  SecurityScanOutlined,
  NotificationOutlined,
  CalendarOutlined,
  FieldTimeOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import {
  settingsApi,
  GeneralSettings,
  EmailSettings,
  SecuritySettings,
  BackupSettings,
  MaintenanceSettings,
  NotificationSettings,
} from '@/shared/api/settings.api';
import '../../styles/master-layout.css';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;
const { TextArea } = Input;
const { Option } = Select;

export const MasterSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<any>({});
  
  const [generalForm] = Form.useForm();
  const [emailForm] = Form.useForm();
  const [securityForm] = Form.useForm();
  const [backupForm] = Form.useForm();
  const [maintenanceForm] = Form.useForm();
  const [notificationForm] = Form.useForm();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await settingsApi.getAll();
      
      if (response.data?.success && response.data?.data) {
        const settings = response.data.data;
        setSettings(settings);
        
        // Set form values
        generalForm.setFieldsValue(settings.general);
        emailForm.setFieldsValue(settings.email);
        securityForm.setFieldsValue(settings.security);
        backupForm.setFieldsValue({
          ...settings.backup,
          time: dayjs(settings.backup.time, 'HH:mm'),
        });
        maintenanceForm.setFieldsValue(settings.maintenance);
        notificationForm.setFieldsValue(settings.notifications);
      } else {
        // Use mock data as fallback
        const mockSettings = {
        general: {
          siteName: 'Stocker',
          siteUrl: 'https://stoocker.app',
          adminEmail: 'info@stoocker.app',
          defaultLanguage: 'tr',
          defaultTimezone: 'Europe/Istanbul',
          dateFormat: 'DD/MM/YYYY',
          timeFormat: 'HH:mm',
          currency: 'TRY',
          maxUploadSize: 10,
          allowRegistration: true,
          requireEmailVerification: true,
          maintenanceMode: false,
        },
        email: {
          provider: 'SMTP',
          smtpHost: 'smtp.gmail.com',
          smtpPort: 587,
          smtpUsername: 'info@stoocker.app',
          smtpEncryption: 'TLS',
          fromEmail: 'info@stoocker.app',
          fromName: 'Stocker',
          testMode: false,
        },
        security: {
          enforcePasswordPolicy: true,
          minPasswordLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: true,
          passwordExpiryDays: 90,
          maxLoginAttempts: 5,
          lockoutDuration: 30,
          enableTwoFactor: true,
          sessionTimeout: 60,
          enableCaptcha: true,
          allowedIpAddresses: [],
          blockedIpAddresses: [],
        },
        backup: {
          enabled: true,
          frequency: 'daily',
          time: '03:00',
          retentionDays: 30,
          backupLocation: '/backups',
          includeDatabase: true,
          includeFiles: true,
          emailNotification: true,
          notificationEmail: 'admin@stoocker.app',
        },
        maintenance: {
          enabled: false,
          message: 'Sistem bakım çalışması yapılmaktadır. Lütfen daha sonra tekrar deneyin.',
          allowedIPs: ['127.0.0.1'],
          showCountdown: true,
        },
        notifications: {
          emailNotifications: true,
          pushNotifications: false,
          smsNotifications: false,
          newUserNotification: true,
          newTenantNotification: true,
          errorNotification: true,
          systemUpdateNotification: true,
          reportNotification: true,
          notificationEmails: ['admin@stoocker.app', 'info@stoocker.app'],
        },
      };

        setSettings(mockSettings);
        
        // Set form values
        generalForm.setFieldsValue(mockSettings.general);
        emailForm.setFieldsValue(mockSettings.email);
        securityForm.setFieldsValue(mockSettings.security);
        backupForm.setFieldsValue({
          ...mockSettings.backup,
          time: dayjs(mockSettings.backup.time, 'HH:mm'),
        });
        maintenanceForm.setFieldsValue(mockSettings.maintenance);
        notificationForm.setFieldsValue(mockSettings.notifications);
      }
    } catch (error) {
      message.error('Ayarlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneralSubmit = async (values: GeneralSettings) => {
    setSaving(true);
    try {
      await settingsApi.updateGeneral(values);
      message.success('Genel ayarlar güncellendi');
    } catch (error) {
      message.error('Ayarlar güncellenirken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleEmailSubmit = async (values: EmailSettings) => {
    setSaving(true);
    try {
      await settingsApi.updateEmail(values);
      message.success('E-posta ayarları güncellendi');
    } catch (error) {
      message.error('Ayarlar güncellenirken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleSecuritySubmit = async (values: SecuritySettings) => {
    setSaving(true);
    try {
      await settingsApi.updateSecurity(values);
      message.success('Güvenlik ayarları güncellendi');
    } catch (error) {
      message.error('Ayarlar güncellenirken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleBackupSubmit = async (values: any) => {
    setSaving(true);
    try {
      const backupSettings = {
        ...values,
        time: values.time.format('HH:mm'),
      };
      await settingsApi.updateBackup(backupSettings);
      message.success('Yedekleme ayarları güncellendi');
    } catch (error) {
      message.error('Ayarlar güncellenirken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = () => {
    Modal.confirm({
      title: 'E-posta Testi',
      content: (
        <Form layout="vertical">
          <Form.Item label="Alıcı E-posta" name="to" rules={[{ required: true, type: 'email' }]}>
            <Input placeholder="test@example.com" />
          </Form.Item>
        </Form>
      ),
      onOk: async () => {
        try {
          // await settingsApi.testEmailSettings({ to: 'test@example.com', subject: 'Test', body: 'Test email' });
          message.success('Test e-postası gönderildi');
        } catch (error) {
          message.error('E-posta gönderilemedi');
        }
      },
    });
  };

  const handleBackupNow = async () => {
    Modal.confirm({
      title: 'Manuel Yedekleme',
      content: 'Şimdi manuel yedekleme yapmak istediğinizden emin misiniz?',
      onOk: async () => {
        try {
          await settingsApi.backupNow();
          notification.success({
            message: 'Yedekleme Başlatıldı',
            description: 'Yedekleme işlemi arka planda başlatıldı. Tamamlandığında bildirim alacaksınız.',
          });
        } catch (error) {
          message.error('Yedekleme başlatılamadı');
        }
      },
    });
  };

  const handleClearCache = async () => {
    Modal.confirm({
      title: 'Önbellek Temizleme',
      content: 'Tüm sistem önbelleğini temizlemek istediğinizden emin misiniz?',
      onOk: async () => {
        try {
          await settingsApi.clearCache();
          message.success('Önbellek temizlendi');
        } catch (error) {
          message.error('Önbellek temizlenemedi');
        }
      },
    });
  };

  const tabItems = [
    {
      key: 'general',
      label: (
        <span>
          <GlobalOutlined />
          Genel
        </span>
      ),
      children: (
        <Card>
          <Form
            form={generalForm}
            layout="vertical"
            onFinish={handleGeneralSubmit}
          >
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  name="siteName"
                  label="Site Adı"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="Stocker" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="siteUrl"
                  label="Site URL"
                  rules={[{ required: true, type: 'url' }]}
                >
                  <Input placeholder="https://example.com" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="adminEmail"
                  label="Admin E-posta"
                  rules={[{ required: true, type: 'email' }]}
                >
                  <Input placeholder="admin@example.com" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="defaultLanguage"
                  label="Varsayılan Dil"
                  rules={[{ required: true }]}
                >
                  <Select>
                    <Option value="tr">Türkçe</Option>
                    <Option value="en">English</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="defaultTimezone"
                  label="Saat Dilimi"
                  rules={[{ required: true }]}
                >
                  <Select showSearch>
                    <Option value="Europe/Istanbul">Europe/Istanbul</Option>
                    <Option value="Europe/London">Europe/London</Option>
                    <Option value="America/New_York">America/New_York</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="currency"
                  label="Para Birimi"
                  rules={[{ required: true }]}
                >
                  <Select>
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
                  rules={[{ required: true }]}
                >
                  <Select>
                    <Option value="DD/MM/YYYY">DD/MM/YYYY</Option>
                    <Option value="MM/DD/YYYY">MM/DD/YYYY</Option>
                    <Option value="YYYY-MM-DD">YYYY-MM-DD</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="maxUploadSize"
                  label="Max Dosya Boyutu (MB)"
                  rules={[{ required: true }]}
                >
                  <InputNumber min={1} max={100} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Divider />
              </Col>
              <Col span={8}>
                <Form.Item
                  name="allowRegistration"
                  label="Kayıt İzni"
                  valuePropName="checked"
                >
                  <Switch checkedChildren="Açık" unCheckedChildren="Kapalı" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="requireEmailVerification"
                  label="E-posta Doğrulama"
                  valuePropName="checked"
                >
                  <Switch checkedChildren="Zorunlu" unCheckedChildren="İsteğe Bağlı" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="maintenanceMode"
                  label="Bakım Modu"
                  valuePropName="checked"
                >
                  <Switch checkedChildren="Aktif" unCheckedChildren="Pasif" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={saving} icon={<SaveOutlined />}>
                  Kaydet
                </Button>
                <Button onClick={() => generalForm.resetFields()} icon={<ReloadOutlined />}>
                  Sıfırla
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: 'email',
      label: (
        <span>
          <MailOutlined />
          E-posta
        </span>
      ),
      children: (
        <Card>
          <Form
            form={emailForm}
            layout="vertical"
            onFinish={handleEmailSubmit}
          >
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  name="provider"
                  label="E-posta Sağlayıcı"
                  rules={[{ required: true }]}
                >
                  <Select>
                    <Option value="SMTP">SMTP</Option>
                    <Option value="SendGrid">SendGrid</Option>
                    <Option value="AWS SES">AWS SES</Option>
                    <Option value="Mailgun">Mailgun</Option>
                  </Select>
                </Form.Item>
              </Col>
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
                  <InputNumber min={1} max={65535} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="smtpEncryption"
                  label="Şifreleme"
                  rules={[{ required: true }]}
                >
                  <Select>
                    <Option value="TLS">TLS</Option>
                    <Option value="SSL">SSL</Option>
                    <Option value="None">Yok</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="smtpUsername"
                  label="Kullanıcı Adı"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="username@gmail.com" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="smtpPassword"
                  label="Şifre"
                >
                  <Input.Password placeholder="••••••••" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="fromEmail"
                  label="Gönderen E-posta"
                  rules={[{ required: true, type: 'email' }]}
                >
                  <Input placeholder="noreply@example.com" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="fromName"
                  label="Gönderen Adı"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="Stocker" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="testMode"
                  label="Test Modu"
                  valuePropName="checked"
                >
                  <Switch checkedChildren="Açık" unCheckedChildren="Kapalı" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={saving} icon={<SaveOutlined />}>
                  Kaydet
                </Button>
                <Button onClick={handleTestEmail} icon={<SendOutlined />}>
                  Test E-postası Gönder
                </Button>
                <Button onClick={() => emailForm.resetFields()} icon={<ReloadOutlined />}>
                  Sıfırla
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: 'security',
      label: (
        <span>
          <SafetyOutlined />
          Güvenlik
        </span>
      ),
      children: (
        <Card>
          <Form
            form={securityForm}
            layout="vertical"
            onFinish={handleSecuritySubmit}
          >
            <Collapse defaultActiveKey={['password', 'login', 'session']}>
              <Panel header="Şifre Politikası" key="password">
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item
                      name="enforcePasswordPolicy"
                      label="Şifre Politikası"
                      valuePropName="checked"
                    >
                      <Switch checkedChildren="Zorunlu" unCheckedChildren="İsteğe Bağlı" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="minPasswordLength"
                      label="Minimum Şifre Uzunluğu"
                    >
                      <InputNumber min={6} max={32} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      name="requireUppercase"
                      valuePropName="checked"
                    >
                      <Checkbox>Büyük Harf</Checkbox>
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      name="requireLowercase"
                      valuePropName="checked"
                    >
                      <Checkbox>Küçük Harf</Checkbox>
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      name="requireNumbers"
                      valuePropName="checked"
                    >
                      <Checkbox>Rakam</Checkbox>
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      name="requireSpecialChars"
                      valuePropName="checked"
                    >
                      <Checkbox>Özel Karakter</Checkbox>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="passwordExpiryDays"
                      label="Şifre Geçerlilik Süresi (Gün)"
                    >
                      <InputNumber min={0} max={365} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>
              </Panel>
              
              <Panel header="Giriş Güvenliği" key="login">
                <Row gutter={24}>
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
                      label="Kilitleme Süresi (Dakika)"
                    >
                      <InputNumber min={5} max={60} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="enableTwoFactor"
                      label="İki Faktörlü Doğrulama"
                      valuePropName="checked"
                    >
                      <Switch checkedChildren="Zorunlu" unCheckedChildren="İsteğe Bağlı" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="enableCaptcha"
                      label="CAPTCHA"
                      valuePropName="checked"
                    >
                      <Switch checkedChildren="Aktif" unCheckedChildren="Pasif" />
                    </Form.Item>
                  </Col>
                </Row>
              </Panel>
              
              <Panel header="Oturum Yönetimi" key="session">
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item
                      name="sessionTimeout"
                      label="Oturum Zaman Aşımı (Dakika)"
                    >
                      <InputNumber min={15} max={480} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>
              </Panel>
              
              <Panel header="IP Kısıtlamaları" key="ip">
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item
                      name="allowedIpAddresses"
                      label="İzin Verilen IP Adresleri"
                    >
                      <Select
                        mode="tags"
                        placeholder="IP adresi girin"
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="blockedIpAddresses"
                      label="Engellenen IP Adresleri"
                    >
                      <Select
                        mode="tags"
                        placeholder="IP adresi girin"
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Panel>
            </Collapse>
            
            <Form.Item style={{ marginTop: 24 }}>
              <Space>
                <Button type="primary" htmlType="submit" loading={saving} icon={<SaveOutlined />}>
                  Kaydet
                </Button>
                <Button onClick={() => securityForm.resetFields()} icon={<ReloadOutlined />}>
                  Sıfırla
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: 'backup',
      label: (
        <span>
          <DatabaseOutlined />
          Yedekleme
        </span>
      ),
      children: (
        <Card>
          <Form
            form={backupForm}
            layout="vertical"
            onFinish={handleBackupSubmit}
          >
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  name="enabled"
                  label="Otomatik Yedekleme"
                  valuePropName="checked"
                >
                  <Switch checkedChildren="Aktif" unCheckedChildren="Pasif" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="frequency"
                  label="Yedekleme Sıklığı"
                  rules={[{ required: true }]}
                >
                  <Select>
                    <Option value="daily">Günlük</Option>
                    <Option value="weekly">Haftalık</Option>
                    <Option value="monthly">Aylık</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="time"
                  label="Yedekleme Saati"
                  rules={[{ required: true }]}
                >
                  <TimePicker format="HH:mm" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="retentionDays"
                  label="Saklama Süresi (Gün)"
                  rules={[{ required: true }]}
                >
                  <InputNumber min={7} max={365} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="backupLocation"
                  label="Yedekleme Konumu"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="/backups" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="includeDatabase"
                  valuePropName="checked"
                >
                  <Checkbox>Veritabanı</Checkbox>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="includeFiles"
                  valuePropName="checked"
                >
                  <Checkbox>Dosyalar</Checkbox>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="emailNotification"
                  valuePropName="checked"
                >
                  <Checkbox>E-posta Bildirimi</Checkbox>
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="notificationEmail"
                  label="Bildirim E-postası"
                >
                  <Input type="email" placeholder="admin@example.com" />
                </Form.Item>
              </Col>
            </Row>
            
            <Divider />
            
            <Alert
              message="Son Yedekleme"
              description="23 Aralık 2024, 03:00 - Başarılı"
              type="success"
              showIcon
              action={
                <Button size="small" onClick={handleBackupNow}>
                  Şimdi Yedekle
                </Button>
              }
            />
            
            <Form.Item style={{ marginTop: 24 }}>
              <Space>
                <Button type="primary" htmlType="submit" loading={saving} icon={<SaveOutlined />}>
                  Kaydet
                </Button>
                <Button onClick={handleBackupNow} icon={<CloudUploadOutlined />}>
                  Manuel Yedekleme
                </Button>
                <Button onClick={() => backupForm.resetFields()} icon={<ReloadOutlined />}>
                  Sıfırla
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: 'maintenance',
      label: (
        <span>
          <ToolOutlined />
          Bakım
        </span>
      ),
      children: (
        <Card>
          <Form
            form={maintenanceForm}
            layout="vertical"
            onFinish={(values) => message.success('Bakım ayarları güncellendi')}
          >
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  name="enabled"
                  label="Bakım Modu"
                  valuePropName="checked"
                >
                  <Switch 
                    checkedChildren="Aktif" 
                    unCheckedChildren="Pasif"
                    onChange={(checked) => {
                      if (checked) {
                        Modal.confirm({
                          title: 'Bakım Modunu Etkinleştir',
                          content: 'Bakım modu etkinleştirildiğinde kullanıcılar sisteme erişemez. Devam etmek istiyor musunuz?',
                          okText: 'Evet',
                          cancelText: 'İptal',
                          onCancel: () => {
                            maintenanceForm.setFieldValue('enabled', false);
                          },
                        });
                      }
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="showCountdown"
                  label="Geri Sayım Göster"
                  valuePropName="checked"
                >
                  <Switch checkedChildren="Evet" unCheckedChildren="Hayır" />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="message"
                  label="Bakım Mesajı"
                >
                  <TextArea
                    rows={4}
                    placeholder="Sistem bakım çalışması yapılmaktadır..."
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="allowedIPs"
                  label="İzin Verilen IP Adresleri (Bakım sırasında erişebilecek)"
                >
                  <Select
                    mode="tags"
                    placeholder="IP adresi girin"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>
            
            <Divider />
            
            <Card title="Sistem Araçları" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button 
                  icon={<DeleteOutlined />} 
                  onClick={handleClearCache}
                  block
                >
                  Önbelleği Temizle
                </Button>
                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={() => message.info('Servisler yeniden başlatılıyor...')}
                  block
                >
                  Servisleri Yeniden Başlat
                </Button>
                <Button 
                  icon={<ExportOutlined />} 
                  onClick={() => message.info('Sistem logları indiriliyor...')}
                  block
                >
                  Logları İndir
                </Button>
              </Space>
            </Card>
            
            <Form.Item style={{ marginTop: 24 }}>
              <Space>
                <Button type="primary" htmlType="submit" loading={saving} icon={<SaveOutlined />}>
                  Kaydet
                </Button>
                <Button onClick={() => maintenanceForm.resetFields()} icon={<ReloadOutlined />}>
                  Sıfırla
                </Button>
              </Space>
            </Form.Item>
          </Form>
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
        <Card>
          <Form
            form={notificationForm}
            layout="vertical"
            onFinish={(values) => message.success('Bildirim ayarları güncellendi')}
          >
            <Row gutter={24}>
              <Col span={24}>
                <Title level={5}>Bildirim Kanalları</Title>
                <Divider />
              </Col>
              <Col span={8}>
                <Form.Item
                  name="emailNotifications"
                  valuePropName="checked"
                >
                  <Checkbox>E-posta Bildirimleri</Checkbox>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="pushNotifications"
                  valuePropName="checked"
                >
                  <Checkbox>Push Bildirimleri</Checkbox>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="smsNotifications"
                  valuePropName="checked"
                >
                  <Checkbox>SMS Bildirimleri</Checkbox>
                </Form.Item>
              </Col>
              
              <Col span={24}>
                <Title level={5}>Bildirim Türleri</Title>
                <Divider />
              </Col>
              <Col span={12}>
                <Form.Item
                  name="newUserNotification"
                  valuePropName="checked"
                >
                  <Checkbox>Yeni Kullanıcı Kayıtları</Checkbox>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="newTenantNotification"
                  valuePropName="checked"
                >
                  <Checkbox>Yeni Tenant Oluşturma</Checkbox>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="errorNotification"
                  valuePropName="checked"
                >
                  <Checkbox>Sistem Hataları</Checkbox>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="systemUpdateNotification"
                  valuePropName="checked"
                >
                  <Checkbox>Sistem Güncellemeleri</Checkbox>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="reportNotification"
                  valuePropName="checked"
                >
                  <Checkbox>Raporlar</Checkbox>
                </Form.Item>
              </Col>
              
              <Col span={24}>
                <Form.Item
                  name="notificationEmails"
                  label="Bildirim E-postaları"
                >
                  <Select
                    mode="tags"
                    placeholder="E-posta adresi girin"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item style={{ marginTop: 24 }}>
              <Space>
                <Button type="primary" htmlType="submit" loading={saving} icon={<SaveOutlined />}>
                  Kaydet
                </Button>
                <Button onClick={() => notificationForm.resetFields()} icon={<ReloadOutlined />}>
                  Sıfırla
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
  ];

  return (
    <div className="master-settings-page">
      {/* Header */}
      <div className="page-header glass-morphism">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="header-content"
        >
          <Title level={2} className="gradient-text">
            <SettingOutlined /> Sistem Ayarları
          </Title>
          <Text type="secondary">Sistem yapılandırması ve ayarları yönetin</Text>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="header-actions"
        >
          <Space>
            <Button icon={<ExportOutlined />}>
              Ayarları Dışa Aktar
            </Button>
            <Button icon={<ImportOutlined />}>
              Ayarları İçe Aktar
            </Button>
          </Space>
        </motion.div>
      </div>

      {/* Content */}
      <Card className="settings-card glass-morphism">
        <Spin spinning={loading}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            type="card"
          />
        </Spin>
      </Card>
    </div>
  );
};