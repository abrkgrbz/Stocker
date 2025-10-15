/**
 * İki Faktörlü Kimlik Doğrulama Login Component
 * Handles 2FA verification during login
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Input,
  Button,
  Space,
  Typography,
  Alert,
  Divider,
  message,
  Progress
} from 'antd';
import {
  LockOutlined,
  SafetyOutlined,
  KeyOutlined,
  MobileOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { twoFactorService } from '../../services/twoFactorService';

const { Text, Title, Paragraph } = Typography;

interface TwoFactorLoginProps {
  visible: boolean;
  onVerify: (token: string) => Promise<boolean>;
  onCancel: () => void;
  onUseBackupCode: () => void;
  userEmail?: string;
}

export const TwoFactorLogin: React.FC<TwoFactorLoginProps> = ({
  visible,
  onVerify,
  onCancel,
  onUseBackupCode,
  userEmail
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 3;

  // Reset state when modal opens/closes
  useEffect(() => {
    if (visible) {
      setVerificationCode('');
      setError('');
      setAttempts(0);
    }
  }, [visible]);

  // Update time remaining for TOTP
  useEffect(() => {
    if (visible) {
      const interval = setInterval(() => {
        const remaining = Math.floor(twoFactorService.getTimeRemaining());
        setTimeRemaining(remaining);
        
        // Clear error when new period starts
        if (remaining === 30) {
          setError('');
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [visible]);

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      setError('Lütfen 6 haneli bir kod girin');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const success = await onVerify(verificationCode);

      if (success) {
        message.success('Doğrulama başarılı!');
        setVerificationCode('');
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        if (newAttempts >= maxAttempts) {
          setError('Çok fazla başarısız deneme. Lütfen daha sonra tekrar deneyin veya yedek kod kullanın.');
        } else {
          setError(`Geçersiz kod. ${maxAttempts - newAttempts} deneme hakkı kaldı.`);
        }

        setVerificationCode('');
      }
    } catch (error: any) {
      // Display backend error message (e.g., rate limiting lockout)
      const errorMessage = error?.message || error?.response?.data?.message || 'Doğrulama başarısız. Lütfen tekrar deneyin.';
      setError(errorMessage);
      setVerificationCode('');

      // If backend says locked out, disable input
      if (errorMessage.includes('fazla') || errorMessage.includes('bekle')) {
        setAttempts(maxAttempts); // Disable input
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && verificationCode.length === 6) {
      handleVerify();
    }
  };

  const getProgressColor = () => {
    if (timeRemaining > 20) return '#52c41a';
    if (timeRemaining > 10) return '#faad14';
    return '#f5222d';
  };

  return (
    <Modal
      title={
        <Space>
          <SafetyOutlined style={{ color: '#1890ff' }} />
          <span>İki Faktörlü Kimlik Doğrulama</span>
        </Space>
      }
      visible={visible}
      onCancel={onCancel}
      footer={null}
      width={420}
      centered
      maskClosable={false}
      closable={attempts < maxAttempts}
    >
      <div style={{ padding: '20px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <MobileOutlined style={{ fontSize: 48, color: '#1890ff' }} />
          <Title level={4} style={{ marginTop: 16, marginBottom: 8 }}>
            Doğrulama Kodunu Girin
          </Title>
          <Text type="secondary">
            Authenticator uygulamanızı açın ve 6 haneli kodu girin
          </Text>
          {userEmail && (
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Hesap: {userEmail}
              </Text>
            </div>
          )}
        </div>

        <div style={{ marginBottom: 24 }}>
          <Input
            size="large"
            placeholder="000000"
            value={verificationCode}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 6);
              setVerificationCode(value);
              setError('');
            }}
            onKeyPress={handleKeyPress}
            maxLength={6}
            disabled={loading || attempts >= maxAttempts}
            style={{
              fontSize: 28,
              textAlign: 'center',
              letterSpacing: 10,
              fontFamily: 'monospace',
              height: 60
            }}
            prefix={<LockOutlined style={{ fontSize: 20 }} />}
            suffix={
              verificationCode.length === 6 && (
                <Button
                  type="link"
                  size="small"
                  onClick={handleVerify}
                  loading={loading}
                >
                  Verify
                </Button>
              )
            }
          />

          {/* Kalan süre indicator */}
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <ClockCircleOutlined /> Kalan süre
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {timeRemaining}s
              </Text>
            </div>
            <Progress
              percent={(timeRemaining / 30) * 100}
              showInfo={false}
              strokeColor={getProgressColor()}
              size="small"
            />
          </div>

          {/* Error message */}
          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              style={{ marginTop: 16 }}
            />
          )}
        </div>

        {/* Action buttons */}
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button
            type="primary"
            size="large"
            block
            onClick={handleVerify}
            loading={loading}
            disabled={verificationCode.length !== 6 || attempts >= maxAttempts}
          >
            Kodu Doğrula
          </Button>

          <Divider style={{ margin: '16px 0' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Sorun mu yaşıyorsunuz??
            </Text>
          </Divider>

          <Button
            type="default"
            block
            icon={<KeyOutlined />}
            onClick={onUseBackupCode}
            disabled={loading}
          >
            Yedek Kod Kullan
          </Button>

          <Button
            type="text"
            block
            onClick={onCancel}
            disabled={loading}
          >
            Girişi İptal Et
          </Button>
        </Space>

        {/* Help text */}
        <Alert
          message="İpuçları"
          description={
            <ul style={{ marginBottom: 0, paddingLeft: 20, fontSize: 12 }}>
              <li>Cihazınızın saatinin senkronize olduğundan emin olun</li>
              <li>Mevcut kod çalışmazsa yeni bir kod bekleyin</li>
              <li>Uygulamanıza erişemiyorsanız yedek kod kullanın</li>
            </ul>
          }
          type="info"
          showIcon
          style={{ marginTop: 24 }}
        />
      </div>
    </Modal>
  );
};