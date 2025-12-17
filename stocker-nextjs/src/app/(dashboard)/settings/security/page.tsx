'use client';

/**
 * Security Settings Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 * - Clean white cards with subtle borders
 * - Stacked form layouts
 * - Minimal accent colors (only on icons/critical elements)
 */

import { useState, useEffect } from 'react';
import {
  Form,
  Switch,
  InputNumber,
  Spin,
  Progress,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  LockOutlined,
  ClockCircleOutlined,
  KeyOutlined,
  SecurityScanOutlined,
  CheckOutlined,
  ExclamationCircleOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  EyeInvisibleOutlined,
  ApiOutlined,
  FieldTimeOutlined,
  UserSwitchOutlined,
  MobileOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { AdminOnly } from '@/components/auth/PermissionGate';
import { securitySettingsService } from '@/lib/api/services';
import { showUpdateSuccess, showError } from '@/lib/utils/sweetalert';
import type {
  SecuritySettingsDto,
  UpdatePasswordPolicyRequest,
  UpdateTwoFactorSettingsRequest,
  UpdateSessionSettingsRequest,
  UpdateApiSecurityRequest,
} from '@/lib/api/services';

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
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#f59e0b';
  if (score >= 40) return '#f97316';
  return '#ef4444';
};

const getScoreLabel = (score: number): string => {
  if (score >= 80) return 'Mükemmel';
  if (score >= 60) return 'İyi';
  if (score >= 40) return 'Orta';
  return 'Zayıf';
};

export default function SecurityPage() {
  const router = useRouter();
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
      showError('Güvenlik ayarları yüklenirken hata oluştu');
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
        showUpdateSuccess('şifre politikası');
        await loadSecuritySettings();
      } else {
        showError(response.message || 'Ayarlar kaydedilirken bir hata oluştu');
      }
    } catch (error) {
      showError('Ayarlar kaydedilirken bir hata oluştu');
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
        showUpdateSuccess('2FA ayarları');
        await loadSecuritySettings();
      } else {
        showError(response.message || 'Ayarlar kaydedilirken bir hata oluştu');
      }
    } catch (error) {
      showError('Ayarlar kaydedilirken bir hata oluştu');
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
        showUpdateSuccess('oturum ayarları');
        await loadSecuritySettings();
      } else {
        showError(response.message || 'Ayarlar kaydedilirken bir hata oluştu');
      }
    } catch (error) {
      showError('Ayarlar kaydedilirken bir hata oluştu');
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
        showUpdateSuccess('API güvenlik ayarları');
        await loadSecuritySettings();
      } else {
        showError(response.message || 'Ayarlar kaydedilirken bir hata oluştu');
      }
    } catch (error) {
      showError('Ayarlar kaydedilirken bir hata oluştu');
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  const securityScore = calculateSecurityScore(settings);

  return (
    <AdminOnly
      fallback={
        <div className="min-h-screen bg-slate-50 p-6">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: '#ef444415' }}
              >
                <ExclamationCircleOutlined style={{ color: '#ef4444', fontSize: 24 }} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Yetkisiz Erişim</h3>
              <p className="text-sm text-slate-500">
                Güvenlik ayarlarına erişim yetkiniz bulunmamaktadır.
              </p>
            </div>
          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-slate-50">
        {/* Minimal Header */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
              >
                <ArrowLeftOutlined />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-slate-900">Güvenlik Ayarları</h1>
                <p className="text-sm text-slate-500">Hesap güvenliği, erişim kontrolü ve API güvenlik yapılandırmaları</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Security Score Card */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <Progress
                  type="circle"
                  percent={securityScore}
                  size={100}
                  strokeColor={getScoreColor(securityScore)}
                  trailColor="#e2e8f0"
                  format={(percent) => (
                    <span className="text-xl font-semibold text-slate-900">{percent}</span>
                  )}
                />
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                  <span className="text-lg font-semibold text-slate-900">Güvenlik Skoru</span>
                  <span
                    className="px-2 py-0.5 text-xs font-medium rounded-full"
                    style={{
                      backgroundColor: `${getScoreColor(securityScore)}15`,
                      color: getScoreColor(securityScore),
                    }}
                  >
                    {getScoreLabel(securityScore)}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mb-4">
                  {securityScore >= 80
                    ? 'Sisteminiz yüksek güvenlik standartlarına sahip.'
                    : securityScore >= 60
                    ? 'Güvenliğinizi artırmak için bazı iyileştirmeler yapabilirsiniz.'
                    : 'Güvenlik ayarlarınızı gözden geçirmenizi öneririz.'
                  }
                </p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-md text-xs text-slate-600">
                    <LockOutlined />
                    <span>Şifre Politikası</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-md text-xs text-slate-600">
                    <MobileOutlined />
                    <span>2FA</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-md text-xs text-slate-600">
                    <ClockCircleOutlined />
                    <span>Oturum</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-md text-xs text-slate-600">
                    <ApiOutlined />
                    <span>API</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Password Policy Card */}
            <section>
              <h2 className="text-sm font-medium text-slate-900 mb-4 flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded flex items-center justify-center"
                  style={{ backgroundColor: '#3b82f615' }}
                >
                  <LockOutlined style={{ color: '#3b82f6', fontSize: 12 }} />
                </div>
                Şifre Politikası
              </h2>
              <div className="bg-white border border-slate-200 rounded-lg p-6">
                <Form
                  form={passwordForm}
                  layout="vertical"
                  onFinish={handleSavePasswordPolicy}
                >
                  <Form.Item
                    label={
                      <span className="flex items-center gap-2 text-sm text-slate-600">
                        <ThunderboltOutlined className="text-amber-500" />
                        Minimum Şifre Uzunluğu
                      </span>
                    }
                    name="minPasswordLength"
                    rules={[{ required: true, message: 'Zorunlu alan' }]}
                  >
                    <InputNumber min={6} max={32} className="w-full" addonAfter="karakter" />
                  </Form.Item>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <Form.Item name="requireUppercase" valuePropName="checked" className="mb-0">
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-xs text-slate-600">Büyük Harf (A-Z)</span>
                        <Switch size="small" />
                      </div>
                    </Form.Item>

                    <Form.Item name="requireLowercase" valuePropName="checked" className="mb-0">
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-xs text-slate-600">Küçük Harf (a-z)</span>
                        <Switch size="small" />
                      </div>
                    </Form.Item>

                    <Form.Item name="requireNumbers" valuePropName="checked" className="mb-0">
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-xs text-slate-600">Rakam (0-9)</span>
                        <Switch size="small" />
                      </div>
                    </Form.Item>

                    <Form.Item name="requireSpecialChars" valuePropName="checked" className="mb-0">
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-xs text-slate-600">Özel Karakter (!@#)</span>
                        <Switch size="small" />
                      </div>
                    </Form.Item>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                      label={<span className="text-xs text-slate-600">Şifre Geçerliliği (0=Süresiz)</span>}
                      name="passwordExpiry"
                      className="mb-4"
                    >
                      <InputNumber min={0} max={365} className="w-full" addonAfter="gün" />
                    </Form.Item>

                    <Form.Item
                      label={<span className="text-xs text-slate-600">Tekrar Kullanma Engeli</span>}
                      name="preventReuse"
                      className="mb-4"
                    >
                      <InputNumber min={0} max={10} className="w-full" addonAfter="şifre" />
                    </Form.Item>
                  </div>

                  <button
                    type="submit"
                    disabled={saving === 'password'}
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    <SaveOutlined />
                    {saving === 'password' ? 'Kaydediliyor...' : 'Kaydet'}
                  </button>
                </Form>
              </div>
            </section>

            {/* 2FA Card */}
            <section>
              <h2 className="text-sm font-medium text-slate-900 mb-4 flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded flex items-center justify-center"
                  style={{ backgroundColor: '#10b98115' }}
                >
                  <SecurityScanOutlined style={{ color: '#10b981', fontSize: 12 }} />
                </div>
                İki Faktörlü Doğrulama
              </h2>
              <div className="bg-white border border-slate-200 rounded-lg p-6">
                <Form
                  form={twoFactorForm}
                  layout="vertical"
                  onFinish={handleSaveTwoFactor}
                >
                  <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100 mb-4">
                    <div className="flex items-start gap-3">
                      <CheckOutlined className="text-emerald-500 mt-0.5" />
                      <div>
                        <span className="text-sm font-medium text-emerald-800 block">2FA Neden Önemli?</span>
                        <span className="text-xs text-emerald-700">
                          Şifre çalınsa bile hesaplarınız güvende kalır.
                        </span>
                      </div>
                    </div>
                  </div>

                  <Form.Item name="require2FA" valuePropName="checked" className="mb-3">
                    <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
                      <div>
                        <span className="text-sm font-medium text-red-800 block">2FA Zorunlu</span>
                        <span className="text-xs text-red-600">Tüm kullanıcılar için zorunlu</span>
                      </div>
                      <Switch />
                    </div>
                  </Form.Item>

                  <Form.Item name="allow2FA" valuePropName="checked" className="mb-3">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                      <div>
                        <span className="text-sm font-medium text-slate-700 block">2FA İzin Ver</span>
                        <span className="text-xs text-slate-500">Kullanıcılar isteğe bağlı aktif edebilir</span>
                      </div>
                      <Switch />
                    </div>
                  </Form.Item>

                  <Form.Item name="trustedDevices" valuePropName="checked" className="mb-3">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                      <div>
                        <span className="text-sm font-medium text-slate-700 block">Güvenilir Cihazlar</span>
                        <span className="text-xs text-slate-500">Cihazı hatırla, tekrar sorma</span>
                      </div>
                      <Switch />
                    </div>
                  </Form.Item>

                  <Form.Item
                    label={<span className="text-xs text-slate-600">Güvenilir Cihaz Süresi</span>}
                    name="trustedDeviceDays"
                    className="mb-4"
                  >
                    <InputNumber min={1} max={90} className="w-full" addonAfter="gün" />
                  </Form.Item>

                  <button
                    type="submit"
                    disabled={saving === '2fa'}
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    <SaveOutlined />
                    {saving === '2fa' ? 'Kaydediliyor...' : 'Kaydet'}
                  </button>
                </Form>
              </div>
            </section>

            {/* Session Management Card */}
            <section>
              <h2 className="text-sm font-medium text-slate-900 mb-4 flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded flex items-center justify-center"
                  style={{ backgroundColor: '#f59e0b15' }}
                >
                  <ClockCircleOutlined style={{ color: '#f59e0b', fontSize: 12 }} />
                </div>
                Oturum Yönetimi
              </h2>
              <div className="bg-white border border-slate-200 rounded-lg p-6">
                <Form
                  form={sessionForm}
                  layout="vertical"
                  onFinish={handleSaveSession}
                >
                  <Form.Item
                    label={
                      <span className="flex items-center gap-2 text-sm text-slate-600">
                        <FieldTimeOutlined className="text-amber-500" />
                        Oturum Zaman Aşımı
                      </span>
                    }
                    name="sessionTimeout"
                  >
                    <InputNumber min={5} max={1440} className="w-full" addonAfter="dakika" />
                  </Form.Item>

                  <Form.Item
                    label={
                      <span className="flex items-center gap-2 text-sm text-slate-600">
                        <UserSwitchOutlined className="text-blue-500" />
                        Maksimum Eşzamanlı Oturum
                      </span>
                    }
                    name="maxConcurrentSessions"
                  >
                    <InputNumber min={1} max={10} className="w-full" addonAfter="oturum" />
                  </Form.Item>

                  <Form.Item name="requireReauth" valuePropName="checked" className="mb-4">
                    <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-100">
                      <div>
                        <span className="text-sm font-medium text-amber-800 block flex items-center gap-2">
                          <EyeInvisibleOutlined />
                          Kritik İşlem Doğrulaması
                        </span>
                        <span className="text-xs text-amber-700">Önemli değişiklikler için şifre sor</span>
                      </div>
                      <Switch />
                    </div>
                  </Form.Item>

                  <button
                    type="submit"
                    disabled={saving === 'session'}
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    <SaveOutlined />
                    {saving === 'session' ? 'Kaydediliyor...' : 'Kaydet'}
                  </button>
                </Form>
              </div>
            </section>

            {/* API Security Card */}
            <section>
              <h2 className="text-sm font-medium text-slate-900 mb-4 flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded flex items-center justify-center"
                  style={{ backgroundColor: '#8b5cf615' }}
                >
                  <KeyOutlined style={{ color: '#8b5cf6', fontSize: 12 }} />
                </div>
                API Güvenliği
              </h2>
              <div className="bg-white border border-slate-200 rounded-lg p-6">
                <Form
                  form={apiForm}
                  layout="vertical"
                  onFinish={handleSaveApiSecurity}
                >
                  <Form.Item name="allowApiAccess" valuePropName="checked" className="mb-3">
                    <div className="flex items-center justify-between p-4 bg-violet-50 rounded-lg border border-violet-100">
                      <div>
                        <span className="text-sm font-medium text-violet-800 block">API Erişimi</span>
                        <span className="text-xs text-violet-600">Harici uygulamalara izin ver</span>
                      </div>
                      <Switch />
                    </div>
                  </Form.Item>

                  <Form.Item name="requireApiKey" valuePropName="checked" className="mb-3">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                      <div>
                        <span className="text-sm font-medium text-slate-700 block">API Key Zorunlu</span>
                        <span className="text-xs text-slate-500">Her istek için anahtar gerekli</span>
                      </div>
                      <Switch />
                    </div>
                  </Form.Item>

                  <Form.Item
                    label={<span className="text-xs text-slate-600">API Key Geçerlilik Süresi (0=Süresiz)</span>}
                    name="apiKeyExpiry"
                  >
                    <InputNumber min={0} max={365} className="w-full" addonAfter="gün" />
                  </Form.Item>

                  <div className="border-t border-slate-100 pt-4 mt-4">
                    <span className="text-xs font-medium text-slate-700 block mb-3">Rate Limiting</span>

                    <Form.Item name="rateLimitEnabled" valuePropName="checked" className="mb-3">
                      <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
                        <div>
                          <span className="text-sm font-medium text-red-800 block">Rate Limiting Aktif</span>
                          <span className="text-xs text-red-600">Aşırı istek saldırılarını engelle</span>
                        </div>
                        <Switch />
                      </div>
                    </Form.Item>

                    <Form.Item
                      label={<span className="text-xs text-slate-600">Saatlik İstek Limiti</span>}
                      name="rateLimitRequests"
                      className="mb-4"
                    >
                      <InputNumber min={100} max={10000} className="w-full" addonAfter="istek/saat" />
                    </Form.Item>
                  </div>

                  <button
                    type="submit"
                    disabled={saving === 'api'}
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-md hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    <SaveOutlined />
                    {saving === 'api' ? 'Kaydediliyor...' : 'Kaydet'}
                  </button>
                </Form>
              </div>
            </section>
          </div>
        </div>
      </div>
    </AdminOnly>
  );
}
