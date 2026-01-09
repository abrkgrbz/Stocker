'use client';

/**
 * Security Settings Page
 * Monochrome Design System - Professional Slate Palette
 * - Single global save bar (sticky bottom)
 * - Slate color scheme only
 * - Dense layout with compact spacing
 * - Native toggle switches (slate-900 when active)
 */

import { useState, useEffect, useCallback } from 'react';
import { Form, InputNumber } from 'antd';
import { Spinner } from '@/components/primitives';
import {
  ArrowLeft,
  Shield,
  Clock,
  Key,
  Lock,
  Smartphone,
  Monitor,
  Zap,
  Save,
  AlertCircle,
} from 'lucide-react';
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

const getScoreLabel = (score: number): string => {
  if (score >= 80) return 'Mükemmel';
  if (score >= 60) return 'İyi';
  if (score >= 40) return 'Orta';
  return 'Zayıf';
};

// Custom Toggle Switch Component - Slate-900 when active
function Toggle({ checked, onChange, disabled }: { checked?: boolean; onChange?: (checked: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={`
        relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
        transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2
        ${checked ? 'bg-slate-900' : 'bg-slate-200'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <span
        className={`
          pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0
          transition duration-200 ease-in-out
          ${checked ? 'translate-x-4' : 'translate-x-0'}
        `}
      />
    </button>
  );
}

export default function SecurityPage() {
  const router = useRouter();
  const [passwordForm] = Form.useForm();
  const [twoFactorForm] = Form.useForm();
  const [sessionForm] = Form.useForm();
  const [apiForm] = Form.useForm();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SecuritySettingsDto | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Track form changes
  const markAsChanged = useCallback(() => {
    setHasChanges(true);
  }, []);

  useEffect(() => {
    loadSecuritySettings();
  }, []);

  const loadSecuritySettings = async () => {
    try {
      setLoading(true);
      const response = await securitySettingsService.getSecuritySettings();

      // Handle both wrapped ({ success, data }) and unwrapped responses
      const responseData = response as any;
      const settingsData = responseData?.data || responseData;
      const isSuccess = responseData?.success !== false;

      if (isSuccess && settingsData?.passwordPolicy) {
        setSettings(settingsData);
        populateForms(settingsData);
      } else {
        console.warn('Security settings response:', response);
        showError(responseData?.message || 'Güvenlik ayarları yüklenemedi');
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

  // Global Save - saves all sections
  const handleSaveAll = async () => {
    try {
      setSaving(true);

      // Get all form values
      const passwordValues = passwordForm.getFieldsValue();
      const twoFactorValues = twoFactorForm.getFieldsValue();
      const sessionValues = sessionForm.getFieldsValue();
      const apiValues = apiForm.getFieldsValue();

      // Save Password Policy
      const passwordRequest: UpdatePasswordPolicyRequest = {
        minPasswordLength: passwordValues.minPasswordLength,
        requireUppercase: passwordValues.requireUppercase,
        requireLowercase: passwordValues.requireLowercase,
        requireNumbers: passwordValues.requireNumbers,
        requireSpecialChars: passwordValues.requireSpecialChars,
        passwordExpiryDays: passwordValues.passwordExpiry,
        preventPasswordReuse: passwordValues.preventReuse,
      };
      await securitySettingsService.updatePasswordPolicy(passwordRequest);

      // Save 2FA Settings
      const twoFactorRequest: UpdateTwoFactorSettingsRequest = {
        require2FA: twoFactorValues.require2FA,
        allow2FA: twoFactorValues.allow2FA,
        trustedDevices: twoFactorValues.trustedDevices,
        trustedDeviceDays: twoFactorValues.trustedDeviceDays || 30,
      };
      await securitySettingsService.updateTwoFactorSettings(twoFactorRequest);

      // Save Session Settings
      const sessionRequest: UpdateSessionSettingsRequest = {
        sessionTimeoutMinutes: sessionValues.sessionTimeout,
        maxConcurrentSessions: sessionValues.maxConcurrentSessions,
        requireReauthForCriticalOps: sessionValues.requireReauth,
      };
      await securitySettingsService.updateSessionSettings(sessionRequest);

      // Save API Security
      const apiRequest: UpdateApiSecurityRequest = {
        allowApiAccess: apiValues.allowApiAccess,
        requireApiKey: apiValues.requireApiKey,
        apiKeyExpiryDays: apiValues.apiKeyExpiry,
        rateLimitEnabled: apiValues.rateLimitEnabled,
        rateLimitRequestsPerHour: apiValues.rateLimitRequests,
      };
      await securitySettingsService.updateApiSecurity(apiRequest);

      showUpdateSuccess('güvenlik ayarları');
      setHasChanges(false);
      await loadSecuritySettings();
    } catch (error) {
      showError('Ayarlar kaydedilirken bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const securityScore = calculateSecurityScore(settings);

  return (
    <AdminOnly
      fallback={
        <div className="min-h-screen bg-slate-50 p-8">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
              <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Yetkisiz Erişim</h3>
              <p className="text-sm text-slate-500">
                Güvenlik ayarlarına erişim yetkiniz bulunmamaktadır.
              </p>
            </div>
          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-slate-50 p-8 pb-24">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Güvenlik Ayarları</h1>
              <p className="text-sm text-slate-500">Hesap güvenliği ve erişim kontrolü</p>
            </div>
          </div>

          {/* Compact Security Score - Horizontal Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
            <div className="flex items-center gap-6">
              {/* Score Circle - Smaller */}
              <div className="flex-shrink-0">
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="#e2e8f0"
                      strokeWidth="4"
                      fill="none"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="#0f172a"
                      strokeWidth="4"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${(securityScore / 100) * 176} 176`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-slate-900">{securityScore}</span>
                  </div>
                </div>
              </div>

              {/* Score Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-slate-900">Güvenlik Skoru</span>
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-600">
                    {getScoreLabel(securityScore)}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {securityScore >= 80
                    ? 'Sisteminiz yüksek güvenlik standartlarına sahip.'
                    : 'Güvenlik ayarlarınızı gözden geçirmenizi öneririz.'
                  }
                </p>
              </div>

              {/* Score Components - Compact Pills */}
              <div className="hidden md:flex items-center gap-2">
                <span className="px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded">Şifre</span>
                <span className="px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded">2FA</span>
                <span className="px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded">Oturum</span>
                <span className="px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded">API</span>
              </div>
            </div>
          </div>

          {/* Settings Grid - 2 columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Password Policy Card */}
            <section>
              <div className="flex items-center gap-2 mb-3 border-b border-slate-200 pb-2">
                <Lock className="w-4 h-4 text-slate-500" />
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Şifre Politikası</h2>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <Form
                  form={passwordForm}
                  layout="vertical"
                  onValuesChange={markAsChanged}
                  className="space-y-3"
                >
                  {/* Min Length */}
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-700">Min. Şifre Uzunluğu</span>
                    </div>
                    <Form.Item name="minPasswordLength" className="mb-0">
                      <InputNumber min={6} max={32} className="w-20" size="small" />
                    </Form.Item>
                  </div>

                  {/* Toggle Grid - Compact */}
                  <div className="grid grid-cols-2 gap-2">
                    <Form.Item name="requireUppercase" valuePropName="checked" className="mb-0">
                      <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100">
                        <span className="text-xs text-slate-600">Büyük Harf</span>
                        <Form.Item name="requireUppercase" valuePropName="checked" noStyle>
                          <Toggle />
                        </Form.Item>
                      </div>
                    </Form.Item>

                    <Form.Item name="requireLowercase" valuePropName="checked" className="mb-0">
                      <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100">
                        <span className="text-xs text-slate-600">Küçük Harf</span>
                        <Form.Item name="requireLowercase" valuePropName="checked" noStyle>
                          <Toggle />
                        </Form.Item>
                      </div>
                    </Form.Item>

                    <Form.Item name="requireNumbers" valuePropName="checked" className="mb-0">
                      <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100">
                        <span className="text-xs text-slate-600">Rakam</span>
                        <Form.Item name="requireNumbers" valuePropName="checked" noStyle>
                          <Toggle />
                        </Form.Item>
                      </div>
                    </Form.Item>

                    <Form.Item name="requireSpecialChars" valuePropName="checked" className="mb-0">
                      <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100">
                        <span className="text-xs text-slate-600">Özel Karakter</span>
                        <Form.Item name="requireSpecialChars" valuePropName="checked" noStyle>
                          <Toggle />
                        </Form.Item>
                      </div>
                    </Form.Item>
                  </div>

                  {/* Expiry Settings - Inline */}
                  <div className="flex gap-3 pt-2">
                    <div className="flex-1">
                      <label className="text-xs text-slate-500 block mb-1">Geçerlilik (gün)</label>
                      <Form.Item name="passwordExpiry" className="mb-0">
                        <InputNumber min={0} max={365} className="w-full" size="small" placeholder="0=Süresiz" />
                      </Form.Item>
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-slate-500 block mb-1">Tekrar Engeli</label>
                      <Form.Item name="preventReuse" className="mb-0">
                        <InputNumber min={0} max={10} className="w-full" size="small" placeholder="şifre" />
                      </Form.Item>
                    </div>
                  </div>
                </Form>
              </div>
            </section>

            {/* 2FA Card */}
            <section>
              <div className="flex items-center gap-2 mb-3 border-b border-slate-200 pb-2">
                <Smartphone className="w-4 h-4 text-slate-500" />
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">İki Faktörlü Doğrulama</h2>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <Form
                  form={twoFactorForm}
                  layout="vertical"
                  onValuesChange={markAsChanged}
                  className="space-y-2"
                >
                  {/* 2FA Required */}
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-100">
                    <div>
                      <span className="text-sm font-medium text-slate-700 block">2FA Zorunlu</span>
                      <span className="text-xs text-slate-500">Tüm kullanıcılar için zorunlu</span>
                    </div>
                    <Form.Item name="require2FA" valuePropName="checked" noStyle>
                      <Toggle />
                    </Form.Item>
                  </div>

                  {/* Allow 2FA */}
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-100">
                    <div>
                      <span className="text-sm font-medium text-slate-700 block">2FA İzin Ver</span>
                      <span className="text-xs text-slate-500">Kullanıcılar aktif edebilir</span>
                    </div>
                    <Form.Item name="allow2FA" valuePropName="checked" noStyle>
                      <Toggle />
                    </Form.Item>
                  </div>

                  {/* Trusted Devices */}
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-100">
                    <div>
                      <span className="text-sm font-medium text-slate-700 block">Güvenilir Cihazlar</span>
                      <span className="text-xs text-slate-500">Cihazı hatırla</span>
                    </div>
                    <Form.Item name="trustedDevices" valuePropName="checked" noStyle>
                      <Toggle />
                    </Form.Item>
                  </div>

                  {/* Trusted Device Days */}
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-slate-600">Güvenilir Cihaz Süresi</span>
                    <Form.Item name="trustedDeviceDays" className="mb-0">
                      <InputNumber min={1} max={90} className="w-20" size="small" addonAfter="gün" />
                    </Form.Item>
                  </div>
                </Form>
              </div>
            </section>

            {/* Session Management Card */}
            <section>
              <div className="flex items-center gap-2 mb-3 border-b border-slate-200 pb-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Oturum Yönetimi</h2>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <Form
                  form={sessionForm}
                  layout="vertical"
                  onValuesChange={markAsChanged}
                  className="space-y-3"
                >
                  {/* Session Timeout */}
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-700">Oturum Zaman Aşımı</span>
                    </div>
                    <Form.Item name="sessionTimeout" className="mb-0">
                      <InputNumber min={5} max={1440} className="w-24" size="small" addonAfter="dk" />
                    </Form.Item>
                  </div>

                  {/* Max Concurrent Sessions */}
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-700">Maks. Eşzamanlı Oturum</span>
                    </div>
                    <Form.Item name="maxConcurrentSessions" className="mb-0">
                      <InputNumber min={1} max={10} className="w-20" size="small" />
                    </Form.Item>
                  </div>

                  {/* Require Reauth */}
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-100">
                    <div>
                      <span className="text-sm font-medium text-slate-700 block">Kritik İşlem Doğrulaması</span>
                      <span className="text-xs text-slate-500">Önemli değişiklikler için şifre sor</span>
                    </div>
                    <Form.Item name="requireReauth" valuePropName="checked" noStyle>
                      <Toggle />
                    </Form.Item>
                  </div>
                </Form>
              </div>
            </section>

            {/* API Security Card */}
            <section>
              <div className="flex items-center gap-2 mb-3 border-b border-slate-200 pb-2">
                <Key className="w-4 h-4 text-slate-500" />
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">API Güvenliği</h2>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <Form
                  form={apiForm}
                  layout="vertical"
                  onValuesChange={markAsChanged}
                  className="space-y-2"
                >
                  {/* Allow API Access */}
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-100">
                    <div>
                      <span className="text-sm font-medium text-slate-700 block">API Erişimi</span>
                      <span className="text-xs text-slate-500">Harici uygulamalara izin ver</span>
                    </div>
                    <Form.Item name="allowApiAccess" valuePropName="checked" noStyle>
                      <Toggle />
                    </Form.Item>
                  </div>

                  {/* Require API Key */}
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-100">
                    <div>
                      <span className="text-sm font-medium text-slate-700 block">API Key Zorunlu</span>
                      <span className="text-xs text-slate-500">Her istek için anahtar gerekli</span>
                    </div>
                    <Form.Item name="requireApiKey" valuePropName="checked" noStyle>
                      <Toggle />
                    </Form.Item>
                  </div>

                  {/* API Key Expiry */}
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-slate-600">API Key Geçerliliği</span>
                    <Form.Item name="apiKeyExpiry" className="mb-0">
                      <InputNumber min={0} max={365} className="w-24" size="small" addonAfter="gün" />
                    </Form.Item>
                  </div>

                  {/* Rate Limiting Section */}
                  <div className="border-t border-slate-100 pt-3 mt-3">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-2">Rate Limiting</span>

                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-100 mb-2">
                      <div>
                        <span className="text-sm font-medium text-slate-700 block">Rate Limiting Aktif</span>
                        <span className="text-xs text-slate-500">Aşırı istek saldırılarını engelle</span>
                      </div>
                      <Form.Item name="rateLimitEnabled" valuePropName="checked" noStyle>
                        <Toggle />
                      </Form.Item>
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-slate-600">Saatlik İstek Limiti</span>
                      <Form.Item name="rateLimitRequests" className="mb-0">
                        <InputNumber min={100} max={10000} className="w-24" size="small" />
                      </Form.Item>
                    </div>
                  </div>
                </Form>
              </div>
            </section>
          </div>
        </div>

        {/* Sticky Save Bar - Bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50">
          <div className="max-w-6xl mx-auto px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                {hasChanges ? (
                  <>
                    <div className="w-2 h-2 bg-slate-400 rounded-full" />
                    <span>Kaydedilmemiş değişiklikler var</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    <span>Tüm güvenlik ayarları güncel</span>
                  </>
                )}
              </div>
              <button
                onClick={handleSaveAll}
                disabled={saving || !hasChanges}
                className={`
                  px-6 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2
                  ${hasChanges
                    ? '!bg-slate-900 hover:!bg-slate-800 !border-slate-900 text-white'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }
                  disabled:opacity-50
                `}
              >
                <Save className="w-4 h-4" />
                {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminOnly>
  );
}
