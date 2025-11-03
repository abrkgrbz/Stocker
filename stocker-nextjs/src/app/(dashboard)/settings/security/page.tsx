'use client';

/**
 * Security Settings Page
 * Password policies, 2FA, session management, and security configurations
 */

import { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Switch,
  Button,
  InputNumber,
  Divider,
  Alert,
  message,
  Tabs,
  Spin,
} from 'antd';
import {
  SafetyOutlined,
  SaveOutlined,
  LockOutlined,
  ClockCircleOutlined,
  KeyOutlined,
  SecurityScanOutlined,
} from '@ant-design/icons';
import { AdminOnly } from '@/components/auth/PermissionGate';
import { securitySettingsService } from '@/lib/api/services';
import type {
  SecuritySettingsDto,
  UpdatePasswordPolicyRequest,
  UpdateTwoFactorSettingsRequest,
  UpdateSessionSettingsRequest,
  UpdateApiSecurityRequest,
} from '@/lib/api/services';

export default function SecurityPage() {
  const [passwordForm] = Form.useForm();
  const [twoFactorForm] = Form.useForm();
  const [sessionForm] = Form.useForm();
  const [apiForm] = Form.useForm();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SecuritySettingsDto | null>(null);

  // Load security settings on mount
  useEffect(() => {
    loadSecuritySettings();
  }, []);

  const loadSecuritySettings = async () => {
    try {
      setLoading(true);
      const response = await securitySettingsService.getSecuritySettings();

      if (response.success && response.data) {
        setSettings(response.data);

        // Populate forms with loaded data
        passwordForm.setFieldsValue({
          minPasswordLength: response.data.passwordPolicy.minPasswordLength,
          requireUppercase: response.data.passwordPolicy.requireUppercase,
          requireLowercase: response.data.passwordPolicy.requireLowercase,
          requireNumbers: response.data.passwordPolicy.requireNumbers,
          requireSpecialChars: response.data.passwordPolicy.requireSpecialChars,
          passwordExpiry: response.data.passwordPolicy.passwordExpiryDays,
          preventReuse: response.data.passwordPolicy.preventPasswordReuse,
        });

        twoFactorForm.setFieldsValue({
          require2FA: response.data.twoFactorSettings.require2FA,
          allow2FA: response.data.twoFactorSettings.allow2FA,
          trustedDevices: response.data.twoFactorSettings.trustedDevices,
          trustedDeviceDays: response.data.twoFactorSettings.trustedDeviceDays,
        });

        sessionForm.setFieldsValue({
          sessionTimeout: response.data.sessionSettings.sessionTimeoutMinutes,
          maxConcurrentSessions: response.data.sessionSettings.maxConcurrentSessions,
          requireReauth: response.data.sessionSettings.requireReauthForCriticalOps,
        });

        apiForm.setFieldsValue({
          allowApiAccess: response.data.apiSecurity.allowApiAccess,
          requireApiKey: response.data.apiSecurity.requireApiKey,
          apiKeyExpiry: response.data.apiSecurity.apiKeyExpiryDays,
          rateLimitEnabled: response.data.apiSecurity.rateLimitEnabled,
          rateLimitRequests: response.data.apiSecurity.rateLimitRequestsPerHour,
        });
      }
    } catch (error) {
      message.error('Güvenlik ayarları yüklenirken hata oluştu');
      console.error('Load security settings error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePasswordPolicy = async (values: any) => {
    try {
      setSaving(true);
      const request: UpdatePasswordPolicyRequest = {
        minPasswordLength: values.minPasswordLength,
        requireUppercase: values.requireUppercase,
        requireLowercase: values.requireLowercase,
        requireNumbers: values.requireNumbers,
        requireSpecialChars: values.requireSpecialChars,
        passwordExpiryDays: values.passwordExpiry,
        preventPasswordReuse: values.preventReuse,
      };

      const response = await securitySettingsService.updatePasswordPolicy(request);

      if (response.success) {
        message.success('Şifre politikası başarıyla kaydedildi');
        await loadSecuritySettings(); // Reload to get updated data
      } else {
        message.error(response.message || 'Ayarlar kaydedilirken bir hata oluştu');
      }
    } catch (error) {
      message.error('Ayarlar kaydedilirken bir hata oluştu');
      console.error('Save password policy error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTwoFactor = async (values: any) => {
    try {
      setSaving(true);
      const request: UpdateTwoFactorSettingsRequest = {
        require2FA: values.require2FA,
        allow2FA: values.allow2FA,
        trustedDevices: values.trustedDevices,
        trustedDeviceDays: values.trustedDeviceDays || 30,
      };

      const response = await securitySettingsService.updateTwoFactorSettings(request);

      if (response.success) {
        message.success('2FA ayarları başarıyla kaydedildi');
        await loadSecuritySettings();
      } else {
        message.error(response.message || 'Ayarlar kaydedilirken bir hata oluştu');
      }
    } catch (error) {
      message.error('Ayarlar kaydedilirken bir hata oluştu');
      console.error('Save 2FA settings error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSession = async (values: any) => {
    try {
      setSaving(true);
      const request: UpdateSessionSettingsRequest = {
        sessionTimeoutMinutes: values.sessionTimeout,
        maxConcurrentSessions: values.maxConcurrentSessions,
        requireReauthForCriticalOps: values.requireReauth,
      };

      const response = await securitySettingsService.updateSessionSettings(request);

      if (response.success) {
        message.success('Oturum ayarları başarıyla kaydedildi');
        await loadSecuritySettings();
      } else {
        message.error(response.message || 'Ayarlar kaydedilirken bir hata oluştu');
      }
    } catch (error) {
      message.error('Ayarlar kaydedilirken bir hata oluştu');
      console.error('Save session settings error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveApiSecurity = async (values: any) => {
    try {
      setSaving(true);
      const request: UpdateApiSecurityRequest = {
        allowApiAccess: values.allowApiAccess,
        requireApiKey: values.requireApiKey,
        apiKeyExpiryDays: values.apiKeyExpiry,
        rateLimitEnabled: values.rateLimitEnabled,
        rateLimitRequestsPerHour: values.rateLimitRequests,
      };

      const response = await securitySettingsService.updateApiSecurity(request);

      if (response.success) {
        message.success('API güvenlik ayarları başarıyla kaydedildi');
        await loadSecuritySettings();
      } else {
        message.error(response.message || 'Ayarlar kaydedilirken bir hata oluştu');
      }
    } catch (error) {
      message.error('Ayarlar kaydedilirken bir hata oluştu');
      console.error('Save API security error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" tip="Güvenlik ayarları yükleniyor..." />
      </div>
    );
  }

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
                    form={passwordForm}
                    layout="vertical"
                    onFinish={handleSavePasswordPolicy}
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
                      rules={[{ required: true, message: 'Lütfen minimum şifre uzunluğunu belirtin' }]}
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
                      <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>
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
                    <SecurityScanOutlined />
                    {' 2FA & Doğrulama'}
                  </span>
                ),
                children: (
                  <Form
                    form={twoFactorForm}
                    layout="vertical"
                    onFinish={handleSaveTwoFactor}
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
                      help="Belirtilen gün boyunca 2FA sorulmayacak"
                    >
                      <Switch />
                    </Form.Item>

                    <Form.Item
                      label="Güvenilir Cihaz Süresi (Gün)"
                      name="trustedDeviceDays"
                      help="Güvenilir cihazların hatırlanma süresi"
                    >
                      <InputNumber min={1} max={90} style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item>
                      <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>
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
                    form={sessionForm}
                    layout="vertical"
                    onFinish={handleSaveSession}
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
                      <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>
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
                    form={apiForm}
                    layout="vertical"
                    onFinish={handleSaveApiSecurity}
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
                      <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>
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
