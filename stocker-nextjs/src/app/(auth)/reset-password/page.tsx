'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Card, Form, Input, Button, Typography, Alert, Space } from 'antd';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  validatePasswordReset,
  isTokenValid,
  generateSecurePassword,
} from '@/lib/auth/password-recovery';
import { PasswordStrengthMeter } from '@/components/auth/PasswordStrengthMeter';

const { Title, Text, Paragraph } = Typography;

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [form] = Form.useForm();

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('Geçersiz veya eksik şifre sıfırlama bağlantısı');
        setTokenValid(false);
        setValidatingToken(false);
        return;
      }

      try {
        // API call to validate token
        const { authService } = await import('@/lib/api/services');
        const response = await authService.validateResetToken(token);

        // API returns { valid: boolean, expiresAt: string } directly (not wrapped)
        // Cast to any to handle both wrapped and unwrapped responses
        const data = (response as any);
        const valid = data?.valid === true || data?.data?.valid === true;
        setTokenValid(valid);

        if (!valid) {
          setError('Şifre sıfırlama bağlantısı süresi dolmuş. Lütfen yeni bir bağlantı isteyin.');
        }
      } catch (err) {
        setError('Token doğrulama hatası. Lütfen tekrar deneyin.');
        setTokenValid(false);
        console.error('Token validation error:', err);
      } finally {
        setValidatingToken(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (values: { password: string; confirmPassword: string }) => {
    setLoading(true);
    setError(null);

    // Validate passwords
    const validation = validatePasswordReset(values.password, values.confirmPassword);
    if (!validation.valid) {
      setError(validation.error || 'Geçersiz şifre');
      setLoading(false);
      return;
    }

    try {
      // API call to reset password
      const { authService } = await import('@/lib/api/services');
      const response = await authService.resetPassword({
        token: token!,
        password: values.password,
      });

      if (response.success) {
        setResetSuccess(true);

        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError('Şifre sıfırlama başarısız. Lütfen tekrar deneyin.');
      }
    } catch (err) {
      setError('Şifre sıfırlama başarısız. Lütfen tekrar deneyin.');
      console.error('Reset password error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePassword = () => {
    const generatedPassword = generateSecurePassword();
    setPassword(generatedPassword);
    form.setFieldsValue({
      password: generatedPassword,
      confirmPassword: generatedPassword,
    });
  };

  // Token validation in progress
  if (validatingToken) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}
      >
        <Card style={{ width: '100%', maxWidth: '450px', textAlign: 'center' }}>
          <Space direction="vertical" size="large">
            <ArrowPathIcon className="w-12 h-12 text-blue-500" />
            <Title level={4}>Bağlantı Doğrulanıyor...</Title>
          </Space>
        </Card>
      </div>
    );
  }

  // Invalid or expired token
  if (!tokenValid) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}
      >
        <Card style={{ width: '100%', maxWidth: '450px', textAlign: 'center' }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <XCircleIcon className="w-16 h-16 text-white/90" />
            <div>
              <Title level={3}>Geçersiz Bağlantı</Title>
              <Paragraph type="secondary">{error}</Paragraph>
            </div>
            <Link href="/forgot-password">
              <Button type="primary" size="large" block>
                Yeni Bağlantı İste
              </Button>
            </Link>
          </Space>
        </Card>
      </div>
    );
  }

  // Password reset success
  if (resetSuccess) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}
      >
        <Card style={{ width: '100%', maxWidth: '450px', textAlign: 'center' }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <CheckCircleIcon className="w-16 h-16 text-white/90" />
            <div>
              <Title level={3}>Şifre Başarıyla Sıfırlandı</Title>
              <Paragraph type="secondary">
                Şifreniz başarıyla güncellendi. Giriş sayfasına yönlendiriliyorsunuz...
              </Paragraph>
            </div>
            <Link href="/login">
              <Button type="primary" size="large" block>
                Giriş Yap
              </Button>
            </Link>
          </Space>
        </Card>
      </div>
    );
  }

  // Password reset form
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <Card style={{ width: '100%', maxWidth: '500px' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Header */}
          <div style={{ textAlign: 'center' }}>
            <LockClosedIcon className="w-12 h-12 text-blue-500 mb-4"
            />
            <Title level={3} style={{ margin: 0 }}>
              Yeni Şifre Oluştur
            </Title>
            <Paragraph type="secondary">
              Güçlü ve unutulmayacak bir şifre seçin.
            </Paragraph>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              closable
              onClose={() => setError(null)}
            />
          )}

          {/* Form */}
          <Form
            form={form}
            name="reset-password"
            onFinish={handleSubmit}
            layout="vertical"
            requiredMark={false}
          >
            <Form.Item
              label="Yeni Şifre"
              name="password"
              rules={[
                { required: true, message: 'Şifre gerekli' },
                { min: 8, message: 'Şifre en az 8 karakter olmalı' },
              ]}
            >
              <Input.Password
                prefix={<LockClosedIcon className="w-4 h-4" />}
                placeholder="Yeni şifrenizi girin"
                size="large"
                iconRender={visible => (visible ? <EyeIcon className="w-4 h-4" /> : <EyeSlashIcon className="w-4 h-4" />)}
                onChange={e => setPassword(e.target.value)}
              />
            </Form.Item>

            {/* Password Strength Meter */}
            {password && (
              <PasswordStrengthMeter password={password} showFeedback style={{ marginBottom: '16px' }} />
            )}

            <Form.Item
              label="Şifreyi Onayla"
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Şifre onayı gerekli' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Şifreler eşleşmiyor'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockClosedIcon className="w-4 h-4" />}
                placeholder="Şifrenizi tekrar girin"
                size="large"
                iconRender={visible => (visible ? <EyeIcon className="w-4 h-4" /> : <EyeSlashIcon className="w-4 h-4" />)}
              />
            </Form.Item>

            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Button type="primary" htmlType="submit" loading={loading} block size="large">
                Şifreyi Sıfırla
              </Button>

              <Button
                type="dashed"
                icon={<ArrowPathIcon className="w-4 h-4" />}
                onClick={handleGeneratePassword}
                block
              >
                Güçlü Şifre Öner
              </Button>
            </Space>
          </Form>

          {/* Security Tips */}
          <Alert
            message="Güvenli Şifre İpuçları"
            description={
              <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
                <li>En az 8 karakter kullanın (12+ daha güvenli)</li>
                <li>Büyük/küçük harf, sayı ve özel karakter karıştırın</li>
                <li>Yaygın kelimelerden ve desenlerde kaçının</li>
                <li>Şifrenizi kimseyle paylaşmayın</li>
              </ul>
            }
            type="info"
            showIcon
          />
        </Space>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ArrowPathIcon className="w-12 h-12 text-blue-500" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
