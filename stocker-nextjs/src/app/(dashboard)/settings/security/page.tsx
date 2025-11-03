'use client';

/**
 * Security Settings Page
 * Password policies, 2FA, session management, and security configurations
 */

import {
  Card,
  Form,
  Switch,
  Button,
  InputNumber,
  Select,
  Divider,
  Alert,
  message,
  Space,
  Tabs,
} from 'antd';
import {
  SafetyOutlined,
  SaveOutlined,
  LockOutlined,
  ClockCircleOutlined,
  KeyOutlined,
  ShieldOutlined,
} from '@ant-design/icons';
import { AdminOnly } from '@/components/auth/PermissionGate';

export default function SecurityPage() {
  const [form] = Form.useForm();

  const handleSave = async (values: any) => {
    try {
      // TODO: API call to update security settings
      message.success('Güvenlik ayarları başarıyla kaydedildi');
    } catch (error) {
      message.error('Ayarlar kaydedilirken bir hata oluştu');
    }
  };

  return (
    <AdminOnly
      fallback={
        <div style={{ padding: '24px' }}>
          <Alert
            message="Yetkisiz Erişim"
            description="Güvenlik ayarlarına erişim yetkiniz bulunmamaktadır."
            type="error"
            showIcon
          />
        </div>
      }
    >
      <div style={{ padding: '24px' }}>
        <Card
          title={
            <div className="flex items-center gap-2">
              <SafetyOutlined />
              <span>Güvenlik Ayarları</span>
            </div>
          }
        >
          <Tabs
            defaultActiveKey="password"
            items={[
              {
                key: 'password',
                label: (
                  <span>
                    <LockOutlined />
                    {' Şifre Politikası'}
                  </span>
                ),
                children: (
                  <Form
                form={form}
                layout="vertical"
                onFinish={handleSave}
                initialValues={{
                  minPasswordLength: 8,
                  requireUppercase: true,
                  requireLowercase: true,
                  requireNumbers: true,
                  requireSpecialChars: true,
                  passwordExpiry: 90,
                  preventReuse: 5,
                }}
              >
                <Alert
                  message="Şifre güvenliği kuralları tüm kullanıcılar için geçerli olacaktır"
                  type="info"
                  showIcon
                  style={{ marginBottom: 24 }}
                />

                <Form.Item
                  label="Minimum Şifre Uzunluğu"
                  name="minPasswordLength"
                  rules={[{ required: true }]}
                >
                  <InputNumber min={6} max={32} style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item
                  label="Büyük Harf Zorunluluğu"
                  name="requireUppercase"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  label="Küçük Harf Zorunluluğu"
                  name="requireLowercase"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  label="Rakam Zorunluluğu"
                  name="requireNumbers"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  label="Özel Karakter Zorunluluğu (!@#$%)"
                  name="requireSpecialChars"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>

                <Divider />

                <Form.Item
                  label="Şifre Geçerlilik Süresi (Gün)"
                  name="passwordExpiry"
                  help="0 = Süresiz"
                >
                  <InputNumber min={0} max={365} style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item
                  label="Önceki Şifreleri Tekrar Kullanmayı Engelle"
                  name="preventReuse"
                  help="Son kaç şifrenin tekrar kullanılması engellensin"
                >
                  <InputNumber min={0} max={10} style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                    Kaydet
                  </Button>
                </Form.Item>
                  </Form>
                ),
              },
              {
                key: '2fa',
                label: (
                  <span>
                    <ShieldOutlined />
                    {' 2FA & Doğrulama'}
                  </span>
                ),
                children: (
                  <Form
                layout="vertical"
                initialValues={{
                  require2FA: false,
                  allow2FA: true,
                  trustedDevices: true,
                }}
              >
                <Alert
                  message="İki Faktörlü Kimlik Doğrulama (2FA)"
                  description="Hesap güvenliğini artırmak için ikinci bir doğrulama adımı ekleyin"
                  type="info"
                  showIcon
                  style={{ marginBottom: 24 }}
                />

                <Form.Item
                  label="2FA Zorunlu Kılma"
                  name="require2FA"
                  valuePropName="checked"
                  help="Tüm kullanıcılar için 2FA zorunlu olacak"
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  label="2FA İzin Ver"
                  name="allow2FA"
                  valuePropName="checked"
                  help="Kullanıcıların isteğe bağlı olarak 2FA aktif etmesine izin ver"
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  label="Güvenilir Cihazları Hatırla"
                  name="trustedDevices"
                  valuePropName="checked"
                  help="30 gün boyunca 2FA sorulmayacak"
                >
                  <Switch />
                </Form.Item>

                <Form.Item>
                  <Button type="primary" icon={<SaveOutlined />}>
                    Kaydet
                  </Button>
                </Form.Item>
                  </Form>
                ),
              },
              {
                key: 'session',
                label: (
                  <span>
                    <ClockCircleOutlined />
                    {' Oturum Yönetimi'}
                  </span>
                ),
                children: (
                  <Form
                layout="vertical"
                initialValues={{
                  sessionTimeout: 60,
                  maxConcurrentSessions: 3,
                  requireReauth: true,
                }}
              >
                <Form.Item
                  label="Oturum Zaman Aşımı (Dakika)"
                  name="sessionTimeout"
                  help="İşlem yapılmadığında oturum otomatik kapatılır"
                >
                  <InputNumber min={5} max={1440} style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item
                  label="Maksimum Eşzamanlı Oturum"
                  name="maxConcurrentSessions"
                  help="Bir kullanıcının aynı anda açabileceği oturum sayısı"
                >
                  <InputNumber min={1} max={10} style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item
                  label="Kritik İşlemlerde Yeniden Kimlik Doğrulama"
                  name="requireReauth"
                  valuePropName="checked"
                  help="Önemli değişiklikler için şifre sorulur"
                >
                  <Switch />
                </Form.Item>

                <Form.Item>
                  <Button type="primary" icon={<SaveOutlined />}>
                    Kaydet
                  </Button>
                </Form.Item>
                  </Form>
                ),
              },
              {
                key: 'api',
                label: (
                  <span>
                    <KeyOutlined />
                    {' API & Entegrasyon'}
                  </span>
                ),
                children: (
                  <Form
                layout="vertical"
                initialValues={{
                  allowApiAccess: true,
                  requireApiKey: true,
                  apiKeyExpiry: 365,
                  rateLimitEnabled: true,
                  rateLimitRequests: 1000,
                }}
              >
                <Alert
                  message="API Güvenlik Ayarları"
                  description="Üçüncü parti entegrasyonlar için güvenlik kuralları"
                  type="info"
                  showIcon
                  style={{ marginBottom: 24 }}
                />

                <Form.Item
                  label="API Erişimine İzin Ver"
                  name="allowApiAccess"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  label="API Key Zorunluluğu"
                  name="requireApiKey"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  label="API Key Geçerlilik Süresi (Gün)"
                  name="apiKeyExpiry"
                  help="0 = Süresiz"
                >
                  <InputNumber min={0} max={365} style={{ width: '100%' }} />
                </Form.Item>

                <Divider>Rate Limiting</Divider>

                <Form.Item
                  label="Rate Limiting Aktif"
                  name="rateLimitEnabled"
                  valuePropName="checked"
                  help="Kötüye kullanımı önlemek için istek limitlemesi"
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  label="Saatlik İstek Limiti"
                  name="rateLimitRequests"
                >
                  <InputNumber min={100} max={10000} style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item>
                  <Button type="primary" icon={<SaveOutlined />}>
                    Kaydet
                  </Button>
                </Form.Item>
                  </Form>
                ),
              },
            ]}
          />
        </Card>
      </div>
    </AdminOnly>
  );
}
