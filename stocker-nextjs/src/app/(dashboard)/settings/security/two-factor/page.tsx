'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Steps, Typography, Space, Alert, Input, message, Divider, Tag } from 'antd';
import { ShieldCheckIcon, QrCodeIcon, KeyIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { generateTOTPSecret, generateQRCode, generateBackupCodes, type BackupCode } from '@/lib/auth/totp';

const { Title, Text, Paragraph } = Typography;

export default function TwoFactorSetupPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [manualKey, setManualKey] = useState('');
  const [backupCodes, setBackupCodes] = useState<BackupCode[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);

  // Setup 2FA on mount (call backend API)
  useEffect(() => {
    const setup2FA = async () => {
      try {
        const { authService } = await import('@/lib/api/services');
        const response = await authService.setup2FA();

        if (response.success && response.data) {
          setSecret(response.data.secret);
          setQrCodeUrl(response.data.qrCodeUrl);
          setManualKey(response.data.secret.match(/.{1,4}/g)?.join(' ') || response.data.secret);

          // Convert backend backup codes to BackupCode format
          const codes: BackupCode[] = response.data.backupCodes.map((code) => ({
            code,
            used: false,
          }));
          setBackupCodes(codes);
        } else {
          message.error('2FA kurulumu başlatılamadı');
        }
      } catch (error) {
        message.error('Bir hata oluştu. Lütfen tekrar deneyin.');
        console.error('2FA setup error:', error);
      }
    };

    setup2FA();
  }, []);

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      message.error('Lütfen 6 haneli kodu girin');
      return;
    }

    try {
      const { authService } = await import('@/lib/api/services');
      const response = await authService.enable2FA(verificationCode);

      if (response.success) {
        message.success('2FA başarıyla etkinleştirildi!');
        setIsEnabled(true);
        setCurrentStep(2);
      } else {
        message.error('Doğrulama başarısız. Lütfen kodu kontrol edin.');
      }
    } catch (error) {
      message.error('Kod doğrulanamadı. Lütfen tekrar deneyin.');
      console.error('2FA enable error:', error);
    }
  };

  const handleDownloadCodes = () => {
    const text = backupCodes.map(bc => bc.code).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stocker-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
    message.success('Yedekleme kodları indirildi');
  };

  const steps = [
    {
      title: 'QR Kod Tara',
      icon: <QrCodeIcon className="w-5 h-5" />,
      content: (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Alert
            message="Authenticator Uygulaması Gerekli"
            description="Google Authenticator, Microsoft Authenticator veya Authy gibi bir uygulama indirin."
            type="info"
            showIcon
          />

          <div style={{ textAlign: 'center' }}>
            {qrCodeUrl && (
              <Image
                src={qrCodeUrl}
                alt="QR Code"
                width={300}
                height={300}
                style={{ border: '1px solid #d9d9d9', borderRadius: 8 }}
              />
            )}
          </div>

          <Card size="small" title="Manuel Giriş Anahtarı">
            <Paragraph copyable={{ text: secret }}>
              <Text code>{manualKey}</Text>
            </Paragraph>
            <Text type="secondary">
              QR kodu tarayamıyorsanız, bu anahtarı manuel olarak girin.
            </Text>
          </Card>

          <Button type="primary" block onClick={() => setCurrentStep(1)}>
            Devam Et
          </Button>
        </Space>
      ),
    },
    {
      title: 'Doğrulama',
      icon: <KeyIcon className="w-5 h-5" />,
      content: (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Alert
            message="Uygulamadan Kodu Girin"
            description="Authenticator uygulamanızda görünen 6 haneli kodu aşağıya girin."
            type="info"
            showIcon
          />

          <Input
            size="large"
            placeholder="000000"
            maxLength={6}
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
            style={{ fontSize: 24, textAlign: 'center', letterSpacing: 8 }}
          />

          <Space style={{ width: '100%' }}>
            <Button onClick={() => setCurrentStep(0)}>
              Geri
            </Button>
            <Button type="primary" onClick={handleVerify} disabled={verificationCode.length !== 6}>
              Doğrula ve Etkinleştir
            </Button>
          </Space>
        </Space>
      ),
    },
    {
      title: 'Yedekleme Kodları',
      icon: <CheckCircleIcon className="w-5 h-5" />,
      content: (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Alert
            message="Yedekleme Kodlarınızı Kaydedin"
            description="Telefonunuzu kaybederseniz bu kodlarla giriş yapabilirsiniz. Her kod sadece bir kez kullanılabilir."
            type="warning"
            showIcon
          />

          <Card
            title="Yedekleme Kodları"
            extra={
              <Button icon={<ShieldCheckIcon className="w-4 h-4" />} onClick={handleDownloadCodes}>
                İndir
              </Button>
            }
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {backupCodes.map((bc, index) => (
                <Tag key={index} color="blue" style={{ margin: 0, padding: '4px 8px' }}>
                  <Text code>{bc.code}</Text>
                </Tag>
              ))}
            </div>
          </Card>

          <Alert
            message="2FA Başarıyla Etkinleştirildi!"
            description="Artık hesabınız iki faktörlü doğrulama ile korunuyor."
            type="success"
            showIcon
          />

          <Button type="primary" block href="/dashboard">
            Dashboard'a Dön
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={2}>
            <ShieldCheckIcon className="w-6 h-6 inline-block mr-2" /> İki Faktörlü Doğrulama
          </Title>
          <Paragraph type="secondary">
            Hesabınızı ekstra bir güvenlik katmanıyla koruyun. Giriş yaparken şifrenizin yanı sıra
            telefonunuzdaki authenticator uygulamasından bir kod da girmeniz gerekecek.
          </Paragraph>
        </div>

        <Card>
          <Steps current={currentStep} items={steps} style={{ marginBottom: 32 }} />
          <Divider />
          {steps[currentStep].content}
        </Card>

        {isEnabled && (
          <Card>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Title level={5}>Güvenlik Durumu</Title>
              <Space>
                <CheckCircleIcon className="w-5 h-5" style={{ color: '#52c41a' }} />
                <Text strong>2FA Aktif</Text>
              </Space>
              <Text type="secondary">
                Son etkinleştirme: {new Date().toLocaleString('tr-TR')}
              </Text>
              <Button danger onClick={async () => {
                try {
                  const { authService } = await import('@/lib/api/services');
                  const code = prompt('2FA\'yı devre dışı bırakmak için authenticator kodunu girin:');
                  if (code) {
                    const response = await authService.disable2FA(code);
                    if (response.success) {
                      message.success('2FA devre dışı bırakıldı');
                      setIsEnabled(false);
                    }
                  }
                } catch (error) {
                  message.error('İşlem başarısız. Kodu kontrol edin.');
                }
              }}>2FA'yı Devre Dışı Bırak</Button>
            </Space>
          </Card>
        )}
      </Space>
    </div>
  );
}
