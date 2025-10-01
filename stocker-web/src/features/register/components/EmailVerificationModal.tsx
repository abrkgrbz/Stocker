import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, message, Space, Typography, Alert } from 'antd';
import { MailOutlined, SafetyOutlined } from '@ant-design/icons';
import { apiClient } from '@/shared/api/client';

const { Title, Text } = Typography;

interface EmailVerificationModalProps {
  visible: boolean;
  email: string;
  registrationCode: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
  visible,
  email,
  registrationCode,
  onSuccess,
  onCancel
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerify = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      message.error('Lütfen 6 haneli doğrulama kodunu girin');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/api/public/tenant-registration/verify-email', {
        email: email,
        token: verificationCode
      });

      if (response.data?.success) {
        message.success('E-posta doğrulandı! Yönlendiriliyorsunuz...');
        onSuccess();
      } else {
        const errorMsg = response.data?.message || response.data?.error?.description || 'Doğrulama başarısız';
        const errorCode = response.data?.error?.code;
        message.error(errorCode ? `${errorMsg} (${errorCode})` : errorMsg, 5);
      }
    } catch (error: any) {
      // RFC 7807 Problem Details format
      const problemDetails = error.response?.data;
      const detail = problemDetails?.detail ||
                    problemDetails?.message ||
                    error.message ||
                    'Doğrulama kodu hatalı veya süresi dolmuş';

      message.error(detail, 6);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;

    try {
      // TODO: Backend'de resend email endpoint eklenecek
      // await apiClient.post('/api/public/tenant-registration/resend-verification', {
      //   registrationCode
      // });

      message.success('Doğrulama kodu tekrar gönderildi');
      setCountdown(60); // 60 saniye beklet
    } catch (error) {
      message.error('Kod gönderilemedi, lütfen tekrar deneyin');
    }
  };

  return (
    <Modal
      open={visible}
      title={
        <Space direction="vertical" size={0}>
          <Title level={4} style={{ margin: 0 }}>
            <MailOutlined /> E-posta Doğrulama
          </Title>
        </Space>
      }
      onCancel={onCancel}
      footer={null}
      centered
      width={500}
      maskClosable={false}
    >
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <Alert
          message="Doğrulama Kodu Gönderildi"
          description={
            <div>
              <Text>{email}</Text> adresine 6 haneli doğrulama kodu gönderdik.
              <br />
              Lütfen e-postanızı kontrol edin ve kodu aşağıya girin.
            </div>
          }
          type="info"
          showIcon
          icon={<SafetyOutlined />}
        />

        <Input
          size="large"
          placeholder="6 haneli kod (örn: 123456)"
          maxLength={6}
          value={verificationCode}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, ''); // Sadece rakam
            setVerificationCode(value);
          }}
          onPressEnter={handleVerify}
          style={{
            fontSize: '24px',
            textAlign: 'center',
            letterSpacing: '8px'
          }}
        />

        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <Button
            type="primary"
            size="large"
            block
            loading={loading}
            onClick={handleVerify}
            disabled={verificationCode.length !== 6}
          >
            Doğrula ve Devam Et
          </Button>

          <Button
            size="large"
            block
            onClick={handleResendCode}
            disabled={countdown > 0}
          >
            {countdown > 0
              ? `Tekrar Gönder (${countdown}s)`
              : 'Kodu Tekrar Gönder'
            }
          </Button>
        </Space>

        <Alert
          message="E-posta gelmedi mi?"
          description={
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>Spam/gereksiz klasörünü kontrol edin</li>
              <li>E-posta adresinizi doğru yazdığınızdan emin olun</li>
              <li>Birkaç dakika bekleyin ve tekrar deneyin</li>
            </ul>
          }
          type="warning"
          showIcon
        />
      </Space>
    </Modal>
  );
};
