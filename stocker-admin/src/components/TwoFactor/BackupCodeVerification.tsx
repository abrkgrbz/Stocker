/**
 * Backup Code Verification Component
 * Handles backup code entry when 2FA app is unavailable
 */

import React, { useState } from 'react';
import {
  Modal,
  Input,
  Button,
  Space,
  Typography,
  Alert,
  Divider,
  message
} from 'antd';
import {
  KeyOutlined,
  SafetyOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';

const { Text, Title, Paragraph } = Typography;

interface BackupCodeVerificationProps {
  visible: boolean;
  onVerify: (code: string) => Promise<boolean>;
  onBack: () => void;
  onCancel: () => void;
  userEmail?: string;
}

export const BackupCodeVerification: React.FC<BackupCodeVerificationProps> = ({
  visible,
  onVerify,
  onBack,
  onCancel,
  userEmail
}) => {
  const [backupCode, setBackupCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    const cleanCode = backupCode.replace(/\s/g, '').toUpperCase();

    if (cleanCode.length !== 9 || !cleanCode.includes('-')) {
      setError('Lütfen geçerli bir yedek kod girin (XXXX-XXXX formatında)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const success = await onVerify(cleanCode);

      if (success) {
        message.success('Yedek kod doğrulandı!');
        setBackupCode('');
      } else {
        setError('Geçersiz yedek kod. Lütfen tekrar deneyin.');
        setBackupCode('');
      }
    } catch (error) {
      setError('Doğrulama başarısız. Lütfen tekrar deneyin.');
      setBackupCode('');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && backupCode.length === 9) {
      handleVerify();
    }
  };

  const formatBackupCode = (value: string) => {
    // Remove all non-alphanumeric characters
    const cleaned = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();

    // Format as XXXX-XXXX
    if (cleaned.length <= 4) {
      return cleaned;
    } else {
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}`;
    }
  };

  return (
    <Modal
      title={
        <Space>
          <KeyOutlined style={{ color: '#1890ff' }} />
          <span>Yedek Kod Kullan</span>
        </Space>
      }
      visible={visible}
      onCancel={onCancel}
      footer={null}
      width={420}
      centered
      maskClosable={false}
    >
      <div style={{ padding: '20px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <SafetyOutlined style={{ fontSize: 48, color: '#faad14' }} />
          <Title level={4} style={{ marginTop: 16, marginBottom: 8 }}>
            Yedek Kod Girin
          </Title>
          <Text type="secondary">
            Authenticator uygulamanıza erişemiyorsanız, yedek kodlarınızdan birini kullanın
          </Text>
          {userEmail && (
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Hesap: {userEmail}
              </Text>
            </div>
          )}
        </div>

        <Alert
          message="Önemli"
          description="Her yedek kod yalnızca bir kez kullanılabilir. Kullanıldıktan sonra geçersiz olur."
          type="warning"
          showIcon
          style={{ marginBottom: 20 }}
        />

        <div style={{ marginBottom: 24 }}>
          <Text strong style={{ display: 'block', marginBottom: 8 }}>
            Yedek Kod:
          </Text>
          <Input
            size="large"
            placeholder="XXXX-XXXX"
            value={backupCode}
            onChange={(e) => {
              const formatted = formatBackupCode(e.target.value);
              setBackupCode(formatted);
              setError('');
            }}
            onKeyPress={handleKeyPress}
            maxLength={9}
            disabled={loading}
            style={{
              fontSize: 20,
              textAlign: 'center',
              letterSpacing: 2,
              fontFamily: 'monospace',
              height: 50
            }}
            prefix={<KeyOutlined style={{ fontSize: 18 }} />}
          />

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
            disabled={backupCode.length !== 9}
            icon={<CheckCircleOutlined />}
          >
            Kodu Doğrula
          </Button>

          <Divider style={{ margin: '16px 0' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              veya
            </Text>
          </Divider>

          <Button
            type="default"
            block
            icon={<ArrowLeftOutlined />}
            onClick={onBack}
            disabled={loading}
          >
            Authenticator Uygulamasına Dön
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
          message="Yedek Kodlarınızı Kaybettiniz mi?"
          description={
            <div style={{ fontSize: 12 }}>
              <p style={{ marginBottom: 8 }}>
                Yedek kodlarınıza erişemiyorsanız:
              </p>
              <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                <li>Sistem yöneticinizle iletişime geçin</li>
                <li>Kimliğinizi doğrulayın</li>
                <li>2FA sıfırlama talebinde bulunun</li>
              </ul>
            </div>
          }
          type="info"
          showIcon
          style={{ marginTop: 24 }}
        />
      </div>
    </Modal>
  );
};