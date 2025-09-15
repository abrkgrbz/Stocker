/**
 * Two-Factor Authentication Settings Component
 * Manage 2FA settings in user profile
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Switch,
  Button,
  Space,
  Typography,
  Alert,
  Modal,
  Input,
  Divider,
  List,
  Tag,
  message,
  Spin,
  Badge,
  Tooltip,
  Row,
  Col,
  Statistic
} from 'antd';
import {
  SafetyOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  KeyOutlined,
  MobileOutlined,
  ReloadOutlined,
  WarningOutlined,
  LockOutlined,
  InfoCircleOutlined,
  DownloadOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { twoFactorService, ITwoFactorStatus } from '../../services/twoFactorService';
import { TwoFactorSetup } from './TwoFactorSetup';

const { Text, Title, Paragraph } = Typography;
const { confirm } = Modal;

interface TwoFactorSettingsProps {
  userEmail: string;
  onStatusChange?: (enabled: boolean) => void;
}

export const TwoFactorSettings: React.FC<TwoFactorSettingsProps> = ({
  userEmail,
  onStatusChange
}) => {
  const [status, setStatus] = useState<ITwoFactorStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [setupModalVisible, setSetupModalVisible] = useState(false);
  const [disableModalVisible, setDisableModalVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [disabling, setDisabling] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const currentStatus = await twoFactorService.get2FAStatus();
      setStatus(currentStatus);
    } catch (error) {
      message.error('Failed to load 2FA status');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (checked: boolean) => {
    if (checked) {
      setSetupModalVisible(true);
    } else {
      showDisableConfirm();
    }
  };

  const showDisableConfirm = () => {
    confirm({
      title: 'Disable Two-Factor Authentication?',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <Paragraph>
            Disabling 2FA will make your account less secure. Are you sure you want to continue?
          </Paragraph>
          <Alert
            message="You'll need to enter your password to confirm"
            type="warning"
            showIcon
          />
        </div>
      ),
      onOk: () => {
        setDisableModalVisible(true);
      },
      okText: 'Continue',
      cancelText: 'Keep Enabled',
      okButtonProps: { danger: true }
    });
  };

  const handleDisable = async () => {
    if (!password) {
      message.error('Please enter your password');
      return;
    }

    setDisabling(true);
    try {
      const success = await twoFactorService.disable2FA(password);
      
      if (success) {
        message.success('Two-factor authentication has been disabled');
        setStatus({ ...status!, enabled: false, method: null });
        setDisableModalVisible(false);
        setPassword('');
        onStatusChange?.(false);
      } else {
        message.error('Failed to disable 2FA. Please check your password.');
      }
    } finally {
      setDisabling(false);
    }
  };

  const handleSetupComplete = () => {
    setSetupModalVisible(false);
    loadStatus();
    onStatusChange?.(true);
    message.success('Two-factor authentication enabled successfully!');
  };

  const handleRegenerateBackupCodes = () => {
    confirm({
      title: 'Regenerate Backup Codes?',
      icon: <WarningOutlined />,
      content: (
        <div>
          <Paragraph>
            This will invalidate all existing backup codes. Any unused codes will no longer work.
          </Paragraph>
          <Alert
            message="Make sure to save the new codes in a safe place"
            type="warning"
            showIcon
          />
        </div>
      ),
      onOk: async () => {
        await regenerateBackupCodes();
      },
      okText: 'Regenerate',
      cancelText: 'Cancel'
    });
  };

  const regenerateBackupCodes = async () => {
    setRegenerating(true);
    
    // First prompt for password
    Modal.confirm({
      title: 'Enter Password',
      content: (
        <Input.Password
          placeholder="Enter your password to continue"
          onChange={(e) => setPassword(e.target.value)}
        />
      ),
      onOk: async () => {
        try {
          const newCodes = await twoFactorService.regenerateBackupCodes(password);
          
          if (newCodes.length > 0) {
            showBackupCodesModal(newCodes);
            setPassword('');
          } else {
            message.error('Failed to regenerate backup codes');
          }
        } finally {
          setRegenerating(false);
        }
      },
      onCancel: () => {
        setRegenerating(false);
        setPassword('');
      }
    });
  };

  const showBackupCodesModal = (codes: string[]) => {
    Modal.info({
      title: 'New Backup Codes',
      width: 500,
      content: (
        <div>
          <Alert
            message="Save these codes immediately!"
            description="Your old backup codes are now invalid. Save these new codes in a secure location."
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 8,
            marginBottom: 16
          }}>
            {codes.map((code, index) => (
              <div key={index} style={{
                padding: '8px 12px',
                background: '#f5f5f5',
                borderRadius: 4,
                fontFamily: 'monospace',
                textAlign: 'center'
              }}>
                {code}
              </div>
            ))}
          </div>
          
          <Space>
            <Button
              icon={<DownloadOutlined />}
              onClick={() => downloadBackupCodes(codes)}
            >
              Download
            </Button>
          </Space>
        </div>
      ),
      okText: 'I have saved the codes'
    });
  };

  const downloadBackupCodes = (codes: string[]) => {
    const content = `Stocker Admin - Backup Codes
Generated: ${new Date().toISOString()}
Email: ${userEmail}

${codes.join('\n')}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'stocker-backup-codes-new.txt';
    link.click();
    URL.revokeObjectURL(url);
    
    message.success('Backup codes downloaded');
  };

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin size="large" />
          <Text style={{ display: 'block', marginTop: 16 }}>
            Loading 2FA settings...
          </Text>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card
        title={
          <Space>
            <SafetyOutlined />
            <span>Two-Factor Authentication</span>
          </Space>
        }
        extra={
          <Badge
            status={status?.enabled ? 'success' : 'default'}
            text={status?.enabled ? 'Enabled' : 'Disabled'}
          />
        }
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {/* Status Section */}
          <div>
            <Space align="center" style={{ marginBottom: 16 }}>
              <Switch
                checked={status?.enabled || false}
                onChange={handleToggle}
                loading={loading}
              />
              <Text strong>
                {status?.enabled ? 'Two-factor authentication is enabled' : 'Enable two-factor authentication'}
              </Text>
            </Space>

            {status?.enabled ? (
              <Alert
                message="Your account is protected"
                description="Two-factor authentication adds an extra layer of security to your account."
                type="success"
                showIcon
                icon={<CheckCircleOutlined />}
              />
            ) : (
              <Alert
                message="Enhance your security"
                description="Enable two-factor authentication to protect your account from unauthorized access."
                type="info"
                showIcon
                icon={<InfoCircleOutlined />}
              />
            )}
          </div>

          {/* Details Section - Only show when enabled */}
          {status?.enabled && (
            <>
              <Divider />
              
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title="Authentication Method"
                    value={status.method?.toUpperCase() || 'TOTP'}
                    prefix={<MobileOutlined />}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Backup Codes"
                    value={status.backupCodesRemaining || 0}
                    suffix="/ 10"
                    prefix={<KeyOutlined />}
                    valueStyle={{
                      color: (status.backupCodesRemaining || 0) < 3 ? '#ff4d4f' : '#52c41a'
                    }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Last Used"
                    value={status.lastUsed ? new Date(status.lastUsed).toLocaleDateString() : 'Never'}
                    prefix={<ClockCircleOutlined />}
                  />
                </Col>
              </Row>

              <Divider />

              {/* Actions */}
              <Space direction="vertical" style={{ width: '100%' }}>
                <Title level={5}>Manage Settings</Title>
                
                <List
                  dataSource={[
                    {
                      title: 'Backup Codes',
                      description: `${status.backupCodesRemaining || 0} codes remaining`,
                      action: (
                        <Button
                          size="small"
                          icon={<ReloadOutlined />}
                          onClick={handleRegenerateBackupCodes}
                          loading={regenerating}
                        >
                          Regenerate
                        </Button>
                      ),
                      warning: (status.backupCodesRemaining || 0) < 3
                    },
                    {
                      title: 'Trusted Devices',
                      description: 'Manage devices that don\'t require 2FA',
                      action: (
                        <Button size="small" disabled>
                          Manage
                        </Button>
                      )
                    },
                    {
                      title: 'Recovery Options',
                      description: 'Set up alternative recovery methods',
                      action: (
                        <Button size="small" disabled>
                          Configure
                        </Button>
                      )
                    }
                  ]}
                  renderItem={item => (
                    <List.Item
                      actions={[item.action]}
                      style={{
                        background: item.warning ? '#fff7e6' : 'transparent',
                        padding: '12px 16px',
                        borderRadius: 4,
                        marginBottom: 8
                      }}
                    >
                      <List.Item.Meta
                        title={
                          <Space>
                            {item.title}
                            {item.warning && (
                              <Tooltip title="Low on backup codes">
                                <WarningOutlined style={{ color: '#faad14' }} />
                              </Tooltip>
                            )}
                          </Space>
                        }
                        description={item.description}
                      />
                    </List.Item>
                  )}
                />
              </Space>
            </>
          )}
        </Space>
      </Card>

      {/* Setup Modal */}
      <TwoFactorSetup
        visible={setupModalVisible}
        userEmail={userEmail}
        onClose={() => setSetupModalVisible(false)}
        onComplete={handleSetupComplete}
      />

      {/* Disable Modal */}
      <Modal
        title="Disable Two-Factor Authentication"
        visible={disableModalVisible}
        onCancel={() => {
          setDisableModalVisible(false);
          setPassword('');
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setDisableModalVisible(false);
              setPassword('');
            }}
          >
            Cancel
          </Button>,
          <Button
            key="disable"
            type="primary"
            danger
            loading={disabling}
            onClick={handleDisable}
          >
            Disable 2FA
          </Button>
        ]}
      >
        <Alert
          message="Security Warning"
          description="Disabling 2FA will make your account less secure"
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Text>Enter your password to confirm:</Text>
        <Input.Password
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onPressEnter={handleDisable}
          style={{ marginTop: 8 }}
          prefix={<LockOutlined />}
        />
      </Modal>
    </>
  );
};