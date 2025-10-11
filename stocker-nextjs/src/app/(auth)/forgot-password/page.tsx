'use client';

import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, Alert, Space } from 'antd';
import { MailOutlined, ArrowLeftOutlined, CheckCircleOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { validatePasswordResetRequest } from '@/lib/auth/password-recovery';

const { Title, Text, Paragraph } = Typography;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');

  const handleSubmit = async (values: { email: string }) => {
    setLoading(true);
    setError(null);

    // Validate email
    const validation = validatePasswordResetRequest(values.email);
    if (!validation.valid) {
      setError(validation.error || 'Geçersiz e-posta adresi');
      setLoading(false);
      return;
    }

    try {
      // API call to send password reset email
      const { authService } = await import('@/lib/api/services');
      const response = await authService.forgotPassword(values.email);

      if (response.success) {
        setEmail(values.email);
        setEmailSent(true);
      } else {
        setError('E-posta gönderilemedi. Lütfen tekrar deneyin.');
      }
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
      console.error('Forgot password error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
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
        <Card
          style={{
            width: '100%',
            maxWidth: '450px',
            textAlign: 'center',
          }}
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <CheckCircleOutlined
              style={{
                fontSize: '64px',
                color: '#52c41a',
              }}
            />

            <div>
              <Title level={3}>E-posta Gönderildi</Title>
              <Paragraph type="secondary">
                Şifre sıfırlama bağlantısı <strong>{email}</strong> adresine gönderildi.
              </Paragraph>
              <Paragraph type="secondary">
                E-postanızı kontrol edin ve şifrenizi sıfırlamak için bağlantıya tıklayın.
                Bağlantı 1 saat içinde geçerliliğini yitirecektir.
              </Paragraph>
            </div>

            <Alert
              message="E-posta gelmediyse"
              description={
                <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
                  <li>Spam/gereksiz klasörünüzü kontrol edin</li>
                  <li>E-posta adresinizi doğru yazdığınızdan emin olun</li>
                  <li>Birkaç dakika bekleyip tekrar deneyin</li>
                </ul>
              }
              type="info"
              showIcon
            />

            <Button
              type="primary"
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push('/login')}
              block
            >
              Giriş Sayfasına Dön
            </Button>
          </Space>
        </Card>
      </div>
    );
  }

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
      <Card
        style={{
          width: '100%',
          maxWidth: '450px',
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Header */}
          <div style={{ textAlign: 'center' }}>
            <MailOutlined
              style={{
                fontSize: '48px',
                color: '#1890ff',
                marginBottom: '16px',
              }}
            />
            <Title level={3} style={{ margin: 0 }}>
              Şifremi Unuttum
            </Title>
            <Paragraph type="secondary">
              E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
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
            name="forgot-password"
            onFinish={handleSubmit}
            layout="vertical"
            requiredMark={false}
          >
            <Form.Item
              label="E-posta Adresi"
              name="email"
              rules={[
                { required: true, message: 'E-posta adresi gerekli' },
                { type: 'email', message: 'Geçerli bir e-posta adresi girin' },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="ornek@email.com"
                size="large"
                autoComplete="email"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: '12px' }}>
              <Button type="primary" htmlType="submit" loading={loading} block size="large">
                Sıfırlama Bağlantısı Gönder
              </Button>
            </Form.Item>

            <div style={{ textAlign: 'center' }}>
              <Link href="/login">
                <Button type="link" icon={<ArrowLeftOutlined />}>
                  Giriş sayfasına dön
                </Button>
              </Link>
            </div>
          </Form>

          {/* Help Text */}
          <Alert
            message="Güvenlik İpucu"
            description="Şifre sıfırlama bağlantısı yalnızca 1 saat geçerlidir ve tek kullanımlıktır. Hesabınızda şüpheli bir aktivite fark ederseniz lütfen yöneticiyle iletişime geçin."
            type="warning"
            showIcon
          />
        </Space>
      </Card>
    </div>
  );
}
