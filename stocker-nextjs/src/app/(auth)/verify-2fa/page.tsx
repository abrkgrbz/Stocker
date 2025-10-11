'use client';

import { useState } from 'react';
import { Card, Input, Button, Space, Typography, Alert, Divider } from 'antd';
import { SafetyOutlined, MobileOutlined, KeyOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Title, Text, Link } = Typography;

export default function Verify2FAPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    if ((useBackupCode && code.length < 8) || (!useBackupCode && code.length !== 6)) {
      setError(useBackupCode ? 'Yedekleme kodu 8 karakter olmalıdır' : 'Kod 6 haneli olmalıdır');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // TODO: API call to verify 2FA code
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      // Success - redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError('Geçersiz kod. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: 24
    }}>
      <Card
        style={{ width: '100%', maxWidth: 400 }}
        styles={{ body: { padding: 32 } }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Header */}
          <div style={{ textAlign: 'center' }}>
            <SafetyOutlined style={{ fontSize: 48, color: '#1890ff' }} />
            <Title level={3} style={{ marginTop: 16, marginBottom: 8 }}>
              İki Faktörlü Doğrulama
            </Title>
            <Text type="secondary">
              {useBackupCode
                ? 'Yedekleme kodunuzu girin'
                : 'Authenticator uygulamanızdaki kodu girin'
              }
            </Text>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              closable
              onClose={() => setError('')}
            />
          )}

          {/* Input Section */}
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Input
              size="large"
              placeholder={useBackupCode ? 'XXXX-XXXX' : '000000'}
              maxLength={useBackupCode ? 9 : 6}
              value={code}
              onChange={(e) => {
                const value = useBackupCode
                  ? e.target.value.toUpperCase()
                  : e.target.value.replace(/\D/g, '');
                setCode(value);
              }}
              onKeyPress={handleKeyPress}
              prefix={useBackupCode ? <KeyOutlined /> : <MobileOutlined />}
              style={{
                fontSize: useBackupCode ? 16 : 24,
                textAlign: 'center',
                letterSpacing: useBackupCode ? 2 : 8
              }}
              autoFocus
            />

            <Button
              type="primary"
              size="large"
              block
              onClick={handleVerify}
              loading={loading}
              disabled={useBackupCode ? code.length < 8 : code.length !== 6}
            >
              Doğrula
            </Button>
          </Space>

          <Divider style={{ margin: '8px 0' }} />

          {/* Alternative Method */}
          <div style={{ textAlign: 'center' }}>
            <Link onClick={() => {
              setUseBackupCode(!useBackupCode);
              setCode('');
              setError('');
            }}>
              {useBackupCode
                ? 'Authenticator kodu kullan'
                : 'Yedekleme kodu kullan'
              }
            </Link>
          </div>

          {/* Help Text */}
          <Alert
            message={useBackupCode ? 'Yedekleme Kodları' : 'Kod Nereden Alınır?'}
            description={
              useBackupCode
                ? '2FA kurulumunda kaydettiğiniz 10 koddan birini girin. Her kod sadece bir kez kullanılabilir.'
                : 'Google Authenticator, Microsoft Authenticator veya Authy uygulamanızda "Stocker ERP" için gösterilen 6 haneli kodu girin.'
            }
            type="info"
            showIcon
          />

          {/* Back to Login */}
          <div style={{ textAlign: 'center' }}>
            <Link href="/login">Giriş sayfasına dön</Link>
          </div>
        </Space>
      </Card>
    </div>
  );
}
