/**
 * Two-Factor Authentication Login Component
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
      setError('Please enter a 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const success = await onVerify(verificationCode);
      
      if (success) {
        message.success('Verification successful!');
        setVerificationCode('');
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= maxAttempts) {
          setError('Too many failed attempts. Please try again later or use a backup code.');
        } else {
          setError(`Invalid code. ${maxAttempts - newAttempts} attempts remaining.`);
        }
        
        setVerificationCode('');
      }
    } catch (error) {
      setError('Verification failed. Please try again.');
      setVerificationCode('');
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
          <span>Two-Factor Authentication</span>
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
            Enter Verification Code
          </Title>
          <Text type="secondary">
            Open your authenticator app and enter the 6-digit code
          </Text>
          {userEmail && (
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Account: {userEmail}
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

          {/* Time remaining indicator */}
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <ClockCircleOutlined /> Time remaining
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
            Verify Code
          </Button>

          <Divider style={{ margin: '16px 0' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Having trouble?
            </Text>
          </Divider>

          <Button
            type="default"
            block
            icon={<KeyOutlined />}
            onClick={onUseBackupCode}
            disabled={loading}
          >
            Use Backup Code
          </Button>

          <Button
            type="text"
            block
            onClick={onCancel}
            disabled={loading}
          >
            Cancel Login
          </Button>
        </Space>

        {/* Help text */}
        <Alert
          message="Tips"
          description={
            <ul style={{ marginBottom: 0, paddingLeft: 20, fontSize: 12 }}>
              <li>Make sure your device time is synchronized</li>
              <li>Wait for a new code if the current one doesn't work</li>
              <li>Use a backup code if you can't access your app</li>
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