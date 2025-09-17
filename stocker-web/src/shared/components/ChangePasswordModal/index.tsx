import React, { useState } from 'react';

import { LockOutlined, KeyOutlined } from '@ant-design/icons';
import { Modal, Form, Input, Button, message, Alert, Space, Typography, Divider } from 'antd';

import { apiClient } from '@/shared/api/client';

import PasswordStrength from '../PasswordStrength';

const { Title } = Typography;

interface ChangePasswordModalProps {
  visible: boolean;
  onClose: () => void;
  userId?: string;
  userEmail?: string;
  requireCurrentPassword?: boolean;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  visible,
  onClose,
  userId,
  userEmail,
  requireCurrentPassword = true
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<any>(null);

  const handleSubmit = async (values: any) => {
    // Check password strength
    if (passwordStrength && !passwordStrength.isAcceptable) {
      message.error('Şifre güvenlik seviyesi yetersiz!');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/api/account/change-password', {
        userId,
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      });

      if (response.data?.success) {
        message.success('Şifreniz başarıyla değiştirildi');
        form.resetFields();
        setNewPassword('');
        setPasswordStrength(null);
        onClose();
      } else {
        message.error(response.data?.message || 'Şifre değiştirilemedi');
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setNewPassword('');
    setPasswordStrength(null);
    onClose();
  };

  return (
    <Modal
      title={
        <Space>
          <KeyOutlined style={{ color: '#1890ff' }} />
          <span>Şifre Değiştir</span>
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
    >
      <Alert
        message="Güvenlik İpucu"
        description="Güçlü bir şifre oluşturmak hesabınızın güvenliği için önemlidir. Şifrenizi düzenli olarak değiştirin ve başkalarıyla paylaşmayın."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        {requireCurrentPassword && (
          <Form.Item
            name="currentPassword"
            label="Mevcut Şifre"
            rules={[{ required: true, message: 'Mevcut şifrenizi giriniz' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Mevcut şifreniz"
              size="large"
            />
          </Form.Item>
        )}

        <Divider />

        <Form.Item
          name="newPassword"
          label="Yeni Şifre"
          rules={[
            { required: true, message: 'Yeni şifre zorunludur' },
            { min: 8, message: 'Şifre en az 8 karakter olmalıdır' },
            () => ({
              validator(_, value) {
                if (!value) return Promise.resolve();
                if (passwordStrength && !passwordStrength.isAcceptable) {
                  return Promise.reject(new Error('Şifre güvenlik seviyesi yetersiz'));
                }
                return Promise.resolve();
              },
            }),
          ]}
          extra={
            newPassword && (
              <PasswordStrength
                password={newPassword}
                email={userEmail}
                onStrengthChange={setPasswordStrength}
                showRequirements={true}
                showSuggestions={true}
              />
            )
          }
        >
          <Input.Password
            prefix={<KeyOutlined />}
            placeholder="Güçlü bir şifre oluşturun"
            size="large"
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Yeni Şifre Tekrar"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: 'Şifre tekrarı zorunludur' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Şifreler eşleşmiyor'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<KeyOutlined />}
            placeholder="Yeni şifre tekrar"
            size="large"
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={handleCancel}>İptal</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              disabled={newPassword && passwordStrength && !passwordStrength.isAcceptable}
              icon={<LockOutlined />}
            >
              {newPassword && passwordStrength && !passwordStrength.isAcceptable
                ? 'Güvenli bir şifre oluşturun'
                : 'Şifreyi Değiştir'}
            </Button>
          </Space>
        </Form.Item>
      </Form>

      {/* Password Tips */}
      <div style={{ marginTop: 24, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
        <Title level={5}>Güvenli Şifre İpuçları:</Title>
        <ul style={{ marginBottom: 0 }}>
          <li>Şifrenizi kimseyle paylaşmayın</li>
          <li>Her hesap için farklı şifre kullanın</li>
          <li>Kişisel bilgilerinizi (doğum tarihi, ad vb.) kullanmayın</li>
          <li>Sözlükte bulunan kelimeleri doğrudan kullanmayın</li>
          <li>Şifre yöneticisi kullanmayı düşünün</li>
        </ul>
      </div>
    </Modal>
  );
};

export default ChangePasswordModal;