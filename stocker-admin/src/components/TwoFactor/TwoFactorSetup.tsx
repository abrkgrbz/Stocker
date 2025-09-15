/**
 * Two-Factor Authentication Setup Component
 * Guides user through 2FA setup process
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Steps,
  Button,
  Input,
  Alert,
  Space,
  Typography,
  Card,
  Divider,
  List,
  Checkbox,
  Spin,
  message,
  Tooltip,
  Tag
} from 'antd';
import {
  QrcodeOutlined,
  KeyOutlined,
  SafetyOutlined,
  CheckCircleOutlined,
  CopyOutlined,
  DownloadOutlined,
  LockOutlined,
  MobileOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { twoFactorService, ITwoFactorSetup } from '../../services/twoFactorService';

const { Step } = Steps;
const { Text, Title, Paragraph } = Typography;

interface TwoFactorSetupProps {
  visible: boolean;
  userEmail: string;
  onClose: () => void;
  onComplete: () => void;
}

export const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({
  visible,
  userEmail,
  onClose,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [setupData, setSetupData] = useState<ITwoFactorSetup | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [backupCodesConfirmed, setBackupCodesConfirmed] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30);

  // Generate setup data when modal opens
  useEffect(() => {
    if (visible && !setupData) {
      generateSetup();
    }
  }, [visible]);

  // Update time remaining for TOTP
  useEffect(() => {
    if (visible && currentStep === 2) {
      const interval = setInterval(() => {
        const remaining = Math.floor(twoFactorService.getTimeRemaining());
        setTimeRemaining(remaining);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [visible, currentStep]);

  const generateSetup = async () => {
    setLoading(true);
    try {
      const data = await twoFactorService.setupTwoFactor(userEmail);
      setSetupData(data);
    } catch (error) {
      message.error('Failed to generate 2FA setup');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 2) {
      // Verify code before proceeding
      verifyAndEnable();
    } else if (currentStep === 3 && !backupCodesConfirmed) {
      message.warning('Please confirm that you have saved your backup codes');
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const verifyAndEnable = async () => {
    if (!setupData || !verificationCode) {
      message.error('Please enter the verification code');
      return;
    }

    setLoading(true);
    try {
      // Verify the code locally first
      const isValid = twoFactorService.verifyTOTP(verificationCode, setupData.secret);
      
      if (!isValid) {
        message.error('Invalid verification code. Please try again.');
        setVerificationCode('');
        return;
      }

      // Enable 2FA on server
      const success = await twoFactorService.enable2FA(
        setupData.secret,
        verificationCode,
        setupData.backupCodes
      );

      if (success) {
        setCurrentStep(3);
      } else {
        message.error('Failed to enable 2FA. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    if (!backupCodesConfirmed) {
      message.warning('Please confirm that you have saved your backup codes');
      return;
    }

    message.success('Two-factor authentication enabled successfully!');
    onComplete();
    resetState();
  };

  const resetState = () => {
    setCurrentStep(0);
    setSetupData(null);
    setVerificationCode('');
    setPassword('');
    setBackupCodesConfirmed(false);
  };

  const copyToClipboard = (text: string, name: string) => {
    navigator.clipboard.writeText(text);
    message.success(`${name} copied to clipboard`);
  };

  const downloadBackupCodes = () => {
    if (!setupData) return;

    const content = `Stocker Admin - Backup Codes
Generated: ${new Date().toISOString()}
Email: ${userEmail}

IMPORTANT: Keep these codes safe! Each code can only be used once.

${setupData.backupCodes.join('\n')}

If you lose access to your authenticator app, you can use one of these codes to sign in.`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'stocker-backup-codes.txt';
    link.click();
    URL.revokeObjectURL(url);
    
    message.success('Backup codes downloaded');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div>
            <Alert
              message="Enhance Your Security"
              description="Two-factor authentication adds an extra layer of security to your account by requiring a verification code in addition to your password."
              type="info"
              showIcon
              icon={<SafetyOutlined />}
              style={{ marginBottom: 24 }}
            />
            
            <Title level={4}>How it works:</Title>
            <List
              dataSource={[
                'Install an authenticator app on your phone (Google Authenticator, Authy, etc.)',
                'Scan the QR code or enter the setup key',
                'Enter the 6-digit code from your app to verify',
                'Save your backup codes in a safe place',
                'Use the app to generate codes when signing in'
              ]}
              renderItem={(item, index) => (
                <List.Item>
                  <Space>
                    <Tag color="blue">{index + 1}</Tag>
                    <Text>{item}</Text>
                  </Space>
                </List.Item>
              )}
            />

            <Alert
              message="Recommended Apps"
              description={
                <Space direction="vertical">
                  <Text>• Google Authenticator (iOS/Android)</Text>
                  <Text>• Microsoft Authenticator (iOS/Android)</Text>
                  <Text>• Authy (iOS/Android/Desktop)</Text>
                  <Text>• 1Password (Paid)</Text>
                </Space>
              }
              type="success"
              style={{ marginTop: 16 }}
            />
          </div>
        );

      case 1:
        return (
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <Spin size="large" />
                <Text style={{ display: 'block', marginTop: 16 }}>
                  Generating secure setup...
                </Text>
              </div>
            ) : setupData ? (
              <>
                <Title level={4}>
                  <QrcodeOutlined /> Scan QR Code
                </Title>
                <Paragraph>
                  Open your authenticator app and scan this QR code:
                </Paragraph>
                
                <Card style={{ textAlign: 'center', marginBottom: 24 }}>
                  <img 
                    src={setupData.qrCodeUrl} 
                    alt="2FA QR Code" 
                    style={{ maxWidth: 256, margin: '0 auto' }}
                  />
                </Card>

                <Divider>OR</Divider>

                <Title level={4}>
                  <KeyOutlined /> Manual Entry
                </Title>
                <Paragraph>
                  Can't scan? Enter this key manually in your app:
                </Paragraph>
                
                <Card>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Text strong>Account: </Text>
                    <Input value={userEmail} readOnly />
                    
                    <Text strong>Key: </Text>
                    <Input.Group compact>
                      <Input
                        value={setupData.manualEntryKey}
                        readOnly
                        style={{ width: 'calc(100% - 32px)', fontFamily: 'monospace' }}
                      />
                      <Tooltip title="Copy">
                        <Button
                          icon={<CopyOutlined />}
                          onClick={() => copyToClipboard(setupData.secret, 'Secret key')}
                        />
                      </Tooltip>
                    </Input.Group>
                    
                    <Text type="secondary">
                      Type: Time-based (TOTP) | Period: 30 seconds
                    </Text>
                  </Space>
                </Card>
              </>
            ) : null}
          </div>
        );

      case 2:
        return (
          <div>
            <Title level={4}>
              <MobileOutlined /> Verify Setup
            </Title>
            <Paragraph>
              Enter the 6-digit code from your authenticator app to verify the setup:
            </Paragraph>

            <Card>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Input
                  size="large"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  style={{ 
                    fontSize: 24, 
                    textAlign: 'center', 
                    letterSpacing: 8,
                    fontFamily: 'monospace'
                  }}
                  prefix={<LockOutlined />}
                />
                
                <div style={{ textAlign: 'center' }}>
                  <Text type="secondary">
                    Time remaining: {timeRemaining}s
                  </Text>
                </div>

                {verificationCode.length === 6 && (
                  <Alert
                    message="Code entered"
                    description="Click 'Verify & Enable' to complete setup"
                    type="info"
                    showIcon
                  />
                )}
              </Space>
            </Card>

            <Alert
              message="Troubleshooting"
              description={
                <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                  <li>Make sure your device time is synchronized</li>
                  <li>Check that you scanned the correct QR code</li>
                  <li>Try entering the code when the timer resets</li>
                </ul>
              }
              type="warning"
              style={{ marginTop: 16 }}
            />
          </div>
        );

      case 3:
        return (
          <div>
            <Alert
              message="Save Your Backup Codes!"
              description="These codes can be used to access your account if you lose your phone. Each code can only be used once."
              type="warning"
              showIcon
              icon={<WarningOutlined />}
              style={{ marginBottom: 24 }}
            />

            <Title level={4}>
              <SafetyOutlined /> Backup Codes
            </Title>
            
            <Card>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(2, 1fr)', 
                  gap: 8,
                  fontFamily: 'monospace',
                  fontSize: 14
                }}>
                  {setupData?.backupCodes.map((code, index) => (
                    <div key={index} style={{ 
                      padding: '8px 12px',
                      background: '#f5f5f5',
                      borderRadius: 4,
                      textAlign: 'center'
                    }}>
                      {code}
                    </div>
                  ))}
                </div>

                <Space style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}>
                  <Button
                    icon={<CopyOutlined />}
                    onClick={() => copyToClipboard(
                      setupData?.backupCodes.join('\n') || '',
                      'Backup codes'
                    )}
                  >
                    Copy All
                  </Button>
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={downloadBackupCodes}
                  >
                    Download
                  </Button>
                </Space>
              </Space>
            </Card>

            <Checkbox
              checked={backupCodesConfirmed}
              onChange={(e) => setBackupCodesConfirmed(e.target.checked)}
              style={{ marginTop: 24 }}
            >
              <Text strong>
                I have saved my backup codes in a secure location
              </Text>
            </Checkbox>

            {backupCodesConfirmed && (
              <Alert
                message="Setup Complete!"
                description="Two-factor authentication is now enabled for your account."
                type="success"
                showIcon
                icon={<CheckCircleOutlined />}
                style={{ marginTop: 16 }}
              />
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      title="Set Up Two-Factor Authentication"
      visible={visible}
      onCancel={onClose}
      width={600}
      footer={null}
      maskClosable={false}
    >
      <Steps current={currentStep} style={{ marginBottom: 32 }}>
        <Step title="Introduction" icon={<SafetyOutlined />} />
        <Step title="Setup" icon={<QrcodeOutlined />} />
        <Step title="Verify" icon={<MobileOutlined />} />
        <Step title="Backup" icon={<KeyOutlined />} />
      </Steps>

      <div style={{ minHeight: 400 }}>
        {renderStepContent()}
      </div>

      <div style={{ marginTop: 24, textAlign: 'right' }}>
        <Space>
          {currentStep > 0 && currentStep < 3 && (
            <Button onClick={handlePrev}>
              Previous
            </Button>
          )}
          
          {currentStep < 2 && (
            <Button type="primary" onClick={handleNext}>
              Next
            </Button>
          )}
          
          {currentStep === 2 && (
            <Button 
              type="primary" 
              onClick={handleNext}
              loading={loading}
              disabled={verificationCode.length !== 6}
            >
              Verify & Enable
            </Button>
          )}
          
          {currentStep === 3 && (
            <Button 
              type="primary" 
              onClick={handleComplete}
              disabled={!backupCodesConfirmed}
            >
              Complete Setup
            </Button>
          )}
        </Space>
      </div>
    </Modal>
  );
};