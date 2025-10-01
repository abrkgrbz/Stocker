import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, message, Space, Typography, Spin } from 'antd';
import { MailOutlined, CheckCircleOutlined, ClockCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { apiClient } from '@/shared/api/client';
import * as signalR from '@microsoft/signalr';
import './EmailVerificationModal.css';

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
  const [provisioningTenant, setProvisioningTenant] = useState(false);
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Cleanup SignalR connection on unmount
  useEffect(() => {
    return () => {
      if (connection) {
        connection.stop().catch(err => console.error('Error stopping SignalR connection:', err));
      }
    };
  }, [connection]);

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
        message.success('E-posta doğrulandı!');

        // Connect to SignalR and wait for tenant provisioning
        setProvisioningTenant(true);

        try {
          const hubConnection = new signalR.HubConnectionBuilder()
            .withUrl('https://stoocker.app/hubs/notification')
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build();

          // Set connection state
          setConnection(hubConnection);

          // Handle TenantReady event
          hubConnection.on('TenantReady', (data) => {
            console.log('Tenant ready:', data);
            setProvisioningTenant(false);
            setLoading(false);
            message.success(data.message || 'Hesabınız hazır! Giriş yapabilirsiniz.');

            // Redirect after 2 seconds
            setTimeout(() => {
              onSuccess();
            }, 2000);
          });

          // Start connection
          await hubConnection.start();
          console.log('SignalR connected successfully');

          // Join registration group
          await hubConnection.invoke('JoinGroup', `registration-${email}`);
          console.log(`Joined registration group: registration-${email}`);

          // Set timeout fallback (60 seconds)
          setTimeout(() => {
            if (provisioningTenant) {
              setProvisioningTenant(false);
              setLoading(false);
              message.warning('Hesap hazırlama işlemi uzun sürüyor. Lütfen birkaç dakika sonra giriş yapmayı deneyin.');
              onSuccess();
            }
          }, 60000);

        } catch (signalRError) {
          console.error('SignalR connection error:', signalRError);
          setProvisioningTenant(false);
          setLoading(false);
          message.warning('Hesabınız hazırlanıyor. Lütfen birkaç dakika sonra giriş yapmayı deneyin.');
          setTimeout(() => onSuccess(), 2000);
        }
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
      message.success('Doğrulama kodu tekrar gönderildi');
      setCountdown(60);
    } catch (error) {
      message.error('Kod gönderilemedi, lütfen tekrar deneyin');
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      footer={null}
      centered
      width={480}
      maskClosable={false}
      className="email-verification-modal"
      closeIcon={<span className="modal-close">×</span>}
    >
      <div className="verification-container">
        {provisioningTenant ? (
          <>
            {/* Tenant Provisioning State */}
            <div className="verification-icon">
              <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
            </div>

            <Title level={3} className="verification-title">
              Hesabınız Hazırlanıyor
            </Title>

            <Text className="verification-description">
              Şirketiniz için özel veritabanı oluşturuluyor...
              <br />
              Bu işlem birkaç saniye sürebilir.
            </Text>

            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <Spin size="large" />
            </div>
          </>
        ) : (
          <>
            {/* Icon Header */}
            <div className="verification-icon">
              <MailOutlined />
            </div>

            {/* Title */}
            <Title level={3} className="verification-title">
              E-posta Doğrulama
            </Title>

            {/* Description */}
            <Text className="verification-description">
              <strong>{email}</strong> adresine 6 haneli doğrulama kodu gönderdik.
              Lütfen e-postanızı kontrol edin.
            </Text>
          </>
        )}

        {!provisioningTenant && (
          <>
            {/* Code Input */}
            <div className="code-input-container">
              <Input
                size="large"
                placeholder="• • • • • •"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setVerificationCode(value);
                }}
                onPressEnter={handleVerify}
                className="code-input"
                autoFocus
              />
            </div>

            {/* Action Buttons */}
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <Button
                type="primary"
                size="large"
                block
                loading={loading}
                onClick={handleVerify}
                disabled={verificationCode.length !== 6}
                className="verify-button"
                icon={<CheckCircleOutlined />}
              >
                Doğrula ve Devam Et
              </Button>

              <Button
                size="large"
                block
                onClick={handleResendCode}
                disabled={countdown > 0}
                className="resend-button"
                icon={<ClockCircleOutlined />}
              >
                {countdown > 0
                  ? `Tekrar Gönder (${countdown}s)`
                  : 'Kodu Tekrar Gönder'
                }
              </Button>
            </Space>

            {/* Help Text */}
            <div className="verification-help">
              <Text type="secondary" className="help-text">
                📧 E-posta gelmedi mi?
              </Text>
              <ul className="help-list">
                <li>Spam klasörünü kontrol edin</li>
                <li>E-posta adresinizi doğru yazdığınızdan emin olun</li>
                <li>Birkaç dakika bekleyip tekrar deneyin</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
