'use client';

/**
 * Security Settings Page
 * Modern card-based layout for security configurations
 */

import { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Switch,
  Button,
  InputNumber,
  message,
  Spin,
  Typography,
  Progress,
  Badge,
} from 'antd';
import {
  SaveOutlined,
  LockOutlined,
  ClockCircleOutlined,
  KeyOutlined,
  SecurityScanOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  EyeInvisibleOutlined,
  ApiOutlined,
  FieldTimeOutlined,
  UserSwitchOutlined,
  MobileOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { AdminOnly } from '@/components/auth/PermissionGate';
import { securitySettingsService } from '@/lib/api/services';
import type {
  SecuritySettingsDto,
  UpdatePasswordPolicyRequest,
  UpdateTwoFactorSettingsRequest,
  UpdateSessionSettingsRequest,
  UpdateApiSecurityRequest,
} from '@/lib/api/services';

const { Title, Text } = Typography;

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// Security Score Calculator
const calculateSecurityScore = (settings: SecuritySettingsDto | null): number => {
  if (!settings) return 0;

  let score = 0;
  const { passwordPolicy, twoFactorSettings, sessionSettings, apiSecurity } = settings;

  // Password Policy (max 30 points)
  if (passwordPolicy.minPasswordLength >= 8) score += 5;
  if (passwordPolicy.minPasswordLength >= 12) score += 5;
  if (passwordPolicy.requireUppercase) score += 5;
  if (passwordPolicy.requireLowercase) score += 3;
  if (passwordPolicy.requireNumbers) score += 4;
  if (passwordPolicy.requireSpecialChars) score += 5;
  if (passwordPolicy.preventPasswordReuse > 0) score += 3;

  // 2FA (max 30 points)
  if (twoFactorSettings.allow2FA) score += 10;
  if (twoFactorSettings.require2FA) score += 20;

  // Session (max 20 points)
  if (sessionSettings.sessionTimeoutMinutes <= 60) score += 10;
  if (sessionSettings.maxConcurrentSessions <= 3) score += 5;
  if (sessionSettings.requireReauthForCriticalOps) score += 5;

  // API Security (max 20 points)
  if (apiSecurity.requireApiKey) score += 10;
  if (apiSecurity.rateLimitEnabled) score += 10;

  return Math.min(score, 100);
};

const getScoreColor = (score: number): string => {
  if (score >= 80) return '#52c41a';
  if (score >= 60) return '#faad14';
  if (score >= 40) return '#fa8c16';
  return '#ff4d4f';
};

const getScoreLabel = (score: number): string => {
  if (score >= 80) return 'Mükemmel';
  if (score >= 60) return 'İyi';
  if (score >= 40) return 'Orta';
  return 'Zayıf';
};

export default function SecurityPage() {
  const [passwordForm] = Form.useForm();
  const [twoFactorForm] = Form.useForm();
  const [sessionForm] = Form.useForm();
  const [apiForm] = Form.useForm();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [settings, setSettings] = useState<SecuritySettingsDto | null>(null);

  useEffect(() => {
    loadSecuritySettings();
  }, []);

  const loadSecuritySettings = async () => {
    try {
      setLoading(true);
      const response = await securitySettingsService.getSecuritySettings();

      if (response.success && response.data) {
        setSettings(response.data);
        populateForms(response.data);
      }
    } catch (error) {
      message.error('Güvenlik ayarları yüklenirken hata oluştu');
      console.error('Load security settings error:', error);
    } finally {
      setLoading(false);
    }
  };

  const populateForms = (data: SecuritySettingsDto) => {
    passwordForm.setFieldsValue({
      minPasswordLength: data.passwordPolicy.minPasswordLength,
      requireUppercase: data.passwordPolicy.requireUppercase,
      requireLowercase: data.passwordPolicy.requireLowercase,
      requireNumbers: data.passwordPolicy.requireNumbers,
      requireSpecialChars: data.passwordPolicy.requireSpecialChars,
      passwordExpiry: data.passwordPolicy.passwordExpiryDays,
      preventReuse: data.passwordPolicy.preventPasswordReuse,
    });

    twoFactorForm.setFieldsValue({
      require2FA: data.twoFactorSettings.require2FA,
      allow2FA: data.twoFactorSettings.allow2FA,
      trustedDevices: data.twoFactorSettings.trustedDevices,
      trustedDeviceDays: data.twoFactorSettings.trustedDeviceDays,
    });

    sessionForm.setFieldsValue({
      sessionTimeout: data.sessionSettings.sessionTimeoutMinutes,
      maxConcurrentSessions: data.sessionSettings.maxConcurrentSessions,
      requireReauth: data.sessionSettings.requireReauthForCriticalOps,
    });

    apiForm.setFieldsValue({
      allowApiAccess: data.apiSecurity.allowApiAccess,
      requireApiKey: data.apiSecurity.requireApiKey,
      apiKeyExpiry: data.apiSecurity.apiKeyExpiryDays,
      rateLimitEnabled: data.apiSecurity.rateLimitEnabled,
      rateLimitRequests: data.apiSecurity.rateLimitRequestsPerHour,
    });
  };

  const handleSavePasswordPolicy = async (values: any) => {
    try {
      setSaving('password');
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
        await loadSecuritySettings();
      } else {
        message.error(response.message || 'Ayarlar kaydedilirken bir hata oluştu');
      }
    } catch (error) {
      message.error('Ayarlar kaydedilirken bir hata oluştu');
    } finally {
      setSaving(null);
    }
  };

  const handleSaveTwoFactor = async (values: any) => {
    try {
      setSaving('2fa');
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
    } finally {
      setSaving(null);
    }
  };

  const handleSaveSession = async (values: any) => {
    try {
      setSaving('session');
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
    } finally {
      setSaving(null);
    }
  };

  const handleSaveApiSecurity = async (values: any) => {
    try {
      setSaving('api');
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
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spin size="large" tip="Güvenlik ayarları yükleniyor..." />
      </div>
    );
  }

  const securityScore = calculateSecurityScore(settings);

  return (
    <AdminOnly
      fallback={
        <div className="p-6">
          <Card className="text-center py-12">
            <ExclamationCircleOutlined className="text-6xl text-red-400 mb-4" />
            <Title level={4} className="!text-gray-600">Yetkisiz Erişim</Title>
            <Text className="text-gray-500">
              Güvenlik ayarlarına erişim yetkiniz bulunmamaktadır.
            </Text>
          </Card>
        </div>
      }
    >
      <motion.div
        className="min-h-screen bg-gray-50 p-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Page Header */}
        <motion.div variants={cardVariants} className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <Title level={2} className="!mb-2 !text-gray-800 flex items-center gap-3">
                <SafetyCertificateOutlined className="text-blue-500" />
                Güvenlik Ayarları
              </Title>
              <Text className="text-gray-500 text-base">
                Hesap güvenliği, erişim kontrolü ve API güvenlik yapılandırmaları
              </Text>
            </div>
          </div>

          {/* Security Score Card */}
          <Card className="shadow-lg border-0 bg-gradient-to-r from-slate-900 to-slate-800">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <Progress
                  type="circle"
                  percent={securityScore}
                  size={120}
                  strokeColor={getScoreColor(securityScore)}
                  trailColor="rgba(255,255,255,0.1)"
                  format={(percent) => (
                    <span className="text-white font-bold text-2xl">{percent}</span>
                  )}
                />
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                  <Text className="text-white text-xl font-semibold">Güvenlik Skoru</Text>
                  <Badge
                    count={getScoreLabel(securityScore)}
                    style={{ backgroundColor: getScoreColor(securityScore) }}
                  />
                </div>
                <Text className="text-gray-300 block mb-4">
                  {securityScore >= 80
                    ? 'Sisteminiz yüksek güvenlik standartlarına sahip.'
                    : securityScore >= 60
                    ? 'Güvenliğinizi artırmak için bazı iyileştirmeler yapabilirsiniz.'
                    : 'Güvenlik ayarlarınızı gözden geçirmenizi öneririz.'
                  }
                </Text>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5">
                    <LockOutlined className="text-blue-400" />
                    <span className="text-white text-sm">Şifre Politikası</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5">
                    <MobileOutlined className="text-green-400" />
                    <span className="text-white text-sm">2FA</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5">
                    <ClockCircleOutlined className="text-orange-400" />
                    <span className="text-white text-sm">Oturum</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5">
                    <ApiOutlined className="text-purple-400" />
                    <span className="text-white text-sm">API</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Password Policy Card */}
          <motion.div variants={cardVariants}>
            <Card
              className="shadow-lg h-full"
              title={
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <LockOutlined className="text-xl text-blue-600" />
                  </div>
                  <div>
                    <Text className="font-semibold text-base">Şifre Politikası</Text>
                    <Text className="text-xs text-gray-500 block">Güçlü şifre gereksinimleri</Text>
                  </div>
                </div>
              }
            >
              <Form
                form={passwordForm}
                layout="vertical"
                onFinish={handleSavePasswordPolicy}
                className="space-y-1"
              >
                <Form.Item
                  label={
                    <span className="flex items-center gap-2">
                      <ThunderboltOutlined className="text-yellow-500" />
                      Minimum Şifre Uzunluğu
                    </span>
                  }
                  name="minPasswordLength"
                  rules={[{ required: true, message: 'Zorunlu alan' }]}
                >
                  <InputNumber
                    min={6}
                    max={32}
                    className="w-full"
                    addonAfter="karakter"
                  />
                </Form.Item>

                <div className="grid grid-cols-2 gap-4">
                  <Form.Item
                    name="requireUppercase"
                    valuePropName="checked"
                    className="mb-2"
                  >
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">Büyük Harf (A-Z)</span>
                      <Switch size="small" checked={passwordForm.getFieldValue('requireUppercase')} onChange={(checked) => passwordForm.setFieldValue('requireUppercase', checked)} />
                    </div>
                  </Form.Item>

                  <Form.Item
                    name="requireLowercase"
                    valuePropName="checked"
                    className="mb-2"
                  >
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">Küçük Harf (a-z)</span>
                      <Switch size="small" checked={passwordForm.getFieldValue('requireLowercase')} onChange={(checked) => passwordForm.setFieldValue('requireLowercase', checked)} />
                    </div>
                  </Form.Item>

                  <Form.Item
                    name="requireNumbers"
                    valuePropName="checked"
                    className="mb-2"
                  >
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">Rakam (0-9)</span>
                      <Switch size="small" checked={passwordForm.getFieldValue('requireNumbers')} onChange={(checked) => passwordForm.setFieldValue('requireNumbers', checked)} />
                    </div>
                  </Form.Item>

                  <Form.Item
                    name="requireSpecialChars"
                    valuePropName="checked"
                    className="mb-2"
                  >
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm">Özel Karakter (!@#)</span>
                      <Switch size="small" checked={passwordForm.getFieldValue('requireSpecialChars')} onChange={(checked) => passwordForm.setFieldValue('requireSpecialChars', checked)} />
                    </div>
                  </Form.Item>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <Form.Item
                    label="Şifre Geçerliliği"
                    name="passwordExpiry"
                    tooltip="0 = Süresiz"
                  >
                    <InputNumber min={0} max={365} className="w-full" addonAfter="gün" />
                  </Form.Item>

                  <Form.Item
                    label="Tekrar Kullanma Engeli"
                    name="preventReuse"
                    tooltip="Son kaç şifre engellensin"
                  >
                    <InputNumber min={0} max={10} className="w-full" addonAfter="şifre" />
                  </Form.Item>
                </div>

                <Form.Item className="mb-0 pt-2">
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    loading={saving === 'password'}
                    block
                  >
                    Kaydet
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </motion.div>

          {/* 2FA Card */}
          <motion.div variants={cardVariants}>
            <Card
              className="shadow-lg h-full"
              title={
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <SecurityScanOutlined className="text-xl text-green-600" />
                  </div>
                  <div>
                    <Text className="font-semibold text-base">İki Faktörlü Doğrulama</Text>
                    <Text className="text-xs text-gray-500 block">Ekstra güvenlik katmanı</Text>
                  </div>
                </div>
              }
            >
              <Form
                form={twoFactorForm}
                layout="vertical"
                onFinish={handleSaveTwoFactor}
              >
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl mb-4 border border-green-100">
                  <div className="flex items-start gap-3">
                    <CheckCircleOutlined className="text-green-500 text-xl mt-0.5" />
                    <div>
                      <Text className="font-medium text-green-800 block">2FA Neden Önemli?</Text>
                      <Text className="text-sm text-green-700">
                        Şifre çalınsa bile hesaplarınız güvende kalır. Google Authenticator veya benzeri uygulamalarla kullanılır.
                      </Text>
                    </div>
                  </div>
                </div>

                <Form.Item
                  name="require2FA"
                  valuePropName="checked"
                >
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
                    <div>
                      <Text className="font-medium text-red-800 block">2FA Zorunlu</Text>
                      <Text className="text-xs text-red-600">Tüm kullanıcılar için zorunlu</Text>
                    </div>
                    <Switch checked={twoFactorForm.getFieldValue('require2FA')} onChange={(checked) => twoFactorForm.setFieldValue('require2FA', checked)} />
                  </div>
                </Form.Item>

                <Form.Item
                  name="allow2FA"
                  valuePropName="checked"
                >
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div>
                      <Text className="font-medium text-blue-800 block">2FA İzin Ver</Text>
                      <Text className="text-xs text-blue-600">Kullanıcılar isteğe bağlı aktif edebilir</Text>
                    </div>
                    <Switch checked={twoFactorForm.getFieldValue('allow2FA')} onChange={(checked) => twoFactorForm.setFieldValue('allow2FA', checked)} />
                  </div>
                </Form.Item>

                <Form.Item
                  name="trustedDevices"
                  valuePropName="checked"
                >
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <Text className="font-medium block">Güvenilir Cihazlar</Text>
                      <Text className="text-xs text-gray-500">Cihazı hatırla, tekrar sorma</Text>
                    </div>
                    <Switch checked={twoFactorForm.getFieldValue('trustedDevices')} onChange={(checked) => twoFactorForm.setFieldValue('trustedDevices', checked)} />
                  </div>
                </Form.Item>

                <Form.Item
                  label="Güvenilir Cihaz Süresi"
                  name="trustedDeviceDays"
                >
                  <InputNumber min={1} max={90} className="w-full" addonAfter="gün" />
                </Form.Item>

                <Form.Item className="mb-0">
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    loading={saving === '2fa'}
                    block
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Kaydet
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </motion.div>

          {/* Session Management Card */}
          <motion.div variants={cardVariants}>
            <Card
              className="shadow-lg h-full"
              title={
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <ClockCircleOutlined className="text-xl text-orange-600" />
                  </div>
                  <div>
                    <Text className="font-semibold text-base">Oturum Yönetimi</Text>
                    <Text className="text-xs text-gray-500 block">Oturum süreleri ve kısıtlamalar</Text>
                  </div>
                </div>
              }
            >
              <Form
                form={sessionForm}
                layout="vertical"
                onFinish={handleSaveSession}
              >
                <Form.Item
                  label={
                    <span className="flex items-center gap-2">
                      <FieldTimeOutlined className="text-orange-500" />
                      Oturum Zaman Aşımı
                    </span>
                  }
                  name="sessionTimeout"
                  tooltip="İşlem yapılmadığında otomatik çıkış"
                >
                  <InputNumber min={5} max={1440} className="w-full" addonAfter="dakika" />
                </Form.Item>

                <Form.Item
                  label={
                    <span className="flex items-center gap-2">
                      <UserSwitchOutlined className="text-blue-500" />
                      Maksimum Eşzamanlı Oturum
                    </span>
                  }
                  name="maxConcurrentSessions"
                  tooltip="Aynı anda açılabilecek oturum sayısı"
                >
                  <InputNumber min={1} max={10} className="w-full" addonAfter="oturum" />
                </Form.Item>

                <Form.Item
                  name="requireReauth"
                  valuePropName="checked"
                >
                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                    <div>
                      <Text className="font-medium text-yellow-800 block flex items-center gap-2">
                        <EyeInvisibleOutlined />
                        Kritik İşlem Doğrulaması
                      </Text>
                      <Text className="text-xs text-yellow-700">Önemli değişiklikler için şifre sor</Text>
                    </div>
                    <Switch checked={sessionForm.getFieldValue('requireReauth')} onChange={(checked) => sessionForm.setFieldValue('requireReauth', checked)} />
                  </div>
                </Form.Item>

                <Form.Item className="mb-0">
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    loading={saving === 'session'}
                    block
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    Kaydet
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </motion.div>

          {/* API Security Card */}
          <motion.div variants={cardVariants}>
            <Card
              className="shadow-lg h-full"
              title={
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <KeyOutlined className="text-xl text-purple-600" />
                  </div>
                  <div>
                    <Text className="font-semibold text-base">API Güvenliği</Text>
                    <Text className="text-xs text-gray-500 block">Entegrasyon ve rate limiting</Text>
                  </div>
                </div>
              }
            >
              <Form
                form={apiForm}
                layout="vertical"
                onFinish={handleSaveApiSecurity}
              >
                <Form.Item
                  name="allowApiAccess"
                  valuePropName="checked"
                >
                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-100">
                    <div>
                      <Text className="font-medium text-purple-800 block">API Erişimi</Text>
                      <Text className="text-xs text-purple-600">Harici uygulamalara izin ver</Text>
                    </div>
                    <Switch checked={apiForm.getFieldValue('allowApiAccess')} onChange={(checked) => apiForm.setFieldValue('allowApiAccess', checked)} />
                  </div>
                </Form.Item>

                <Form.Item
                  name="requireApiKey"
                  valuePropName="checked"
                >
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <Text className="font-medium block">API Key Zorunlu</Text>
                      <Text className="text-xs text-gray-500">Her istek için anahtar gerekli</Text>
                    </div>
                    <Switch checked={apiForm.getFieldValue('requireApiKey')} onChange={(checked) => apiForm.setFieldValue('requireApiKey', checked)} />
                  </div>
                </Form.Item>

                <Form.Item
                  label="API Key Geçerlilik Süresi"
                  name="apiKeyExpiry"
                  tooltip="0 = Süresiz"
                >
                  <InputNumber min={0} max={365} className="w-full" addonAfter="gün" />
                </Form.Item>

                <div className="border-t border-gray-100 pt-4 mt-4">
                  <Text className="font-medium text-gray-700 block mb-3">Rate Limiting</Text>

                  <Form.Item
                    name="rateLimitEnabled"
                    valuePropName="checked"
                  >
                    <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
                      <div>
                        <Text className="font-medium text-red-800 block">Rate Limiting Aktif</Text>
                        <Text className="text-xs text-red-600">Aşırı istek saldırılarını engelle</Text>
                      </div>
                      <Switch checked={apiForm.getFieldValue('rateLimitEnabled')} onChange={(checked) => apiForm.setFieldValue('rateLimitEnabled', checked)} />
                    </div>
                  </Form.Item>

                  <Form.Item
                    label="Saatlik İstek Limiti"
                    name="rateLimitRequests"
                  >
                    <InputNumber min={100} max={10000} className="w-full" addonAfter="istek/saat" />
                  </Form.Item>
                </div>

                <Form.Item className="mb-0">
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    loading={saving === 'api'}
                    block
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Kaydet
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </AdminOnly>
  );
}
