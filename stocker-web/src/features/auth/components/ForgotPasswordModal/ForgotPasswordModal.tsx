import React, { useState } from 'react';
import { Modal, Form, Input, Button, Alert, Typography, Space, Result } from 'antd';
import { 
  MailOutlined, 
  LockOutlined, 
  SendOutlined,
  ArrowLeftOutlined,
  CheckCircleFilled,
  ClockCircleOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import './style.css';

const { Title, Text, Paragraph } = Typography;

interface ForgotPasswordModalProps {
  visible: boolean;
  onCancel: () => void;
  tenantSlug?: string;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  visible,
  onCancel,
  tenantSlug
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'success'>('email');
  const [email, setEmail] = useState('');

  const handleSubmit = async (values: { email: string }) => {
    try {
      setLoading(true);
      
      // API call to send password reset email
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(tenantSlug && { 'X-Tenant-Code': tenantSlug })
        },
        body: JSON.stringify({ 
          email: values.email,
          tenantCode: tenantSlug 
        })
      });

      if (response.ok) {
        setEmail(values.email);
        setStep('success');
      } else {
        // Show error but still show success for security
        setEmail(values.email);
        setStep('success');
      }
    } catch (error) {
      // For security, always show success message
      setEmail(values.email);
      setStep('success');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onCancel();
    // Reset modal state after animation
    setTimeout(() => {
      setStep('email');
      form.resetFields();
      setEmail('');
    }, 300);
  };

  const handleBackToLogin = () => {
    handleClose();
  };

  return (
    <Modal
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={480}
      centered
      className="forgot-password-modal"
      closeIcon={<ArrowLeftOutlined />}
      destroyOnClose
    >
      <div className="forgot-password-content">
        <AnimatePresence mode="wait">
          {step === 'email' ? (
            <motion.div
              key="email-step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Icon */}
              <div className="modal-icon">
                <div className="icon-wrapper">
                  <LockOutlined />
                </div>
              </div>

              {/* Header */}
              <div className="modal-header">
                <Title level={3} className="modal-title">
                  Şifrenizi mi Unuttunuz?
                </Title>
                <Paragraph className="modal-subtitle">
                  Endişelenmeyin! E-posta adresinizi girin, size şifre sıfırlama 
                  bağlantısı gönderelim.
                </Paragraph>
              </div>

              {/* Form */}
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                className="forgot-password-form"
              >
                <Form.Item
                  name="email"
                  label="E-posta Adresi"
                  rules={[
                    { required: true, message: 'E-posta adresinizi girin' },
                    { type: 'email', message: 'Geçerli bir e-posta adresi girin' }
                  ]}
                >
                  <Input
                    prefix={<MailOutlined style={{ color: '#667eea' }} />}
                    placeholder="ornek@firma.com"
                    size="large"
                    autoComplete="email"
                    className="forgot-input"
                  />
                </Form.Item>

                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    size="large"
                    block
                    icon={<SendOutlined />}
                    className="submit-button"
                  >
                    Sıfırlama Bağlantısı Gönder
                  </Button>

                  <Button
                    type="text"
                    onClick={handleClose}
                    size="large"
                    block
                    className="back-button"
                  >
                    Giriş Sayfasına Dön
                  </Button>
                </Space>
              </Form>

              {/* Info Alert */}
              <Alert
                message="Bilgi"
                description="Şifre sıfırlama bağlantısı, kayıtlı e-posta adresinize gönderilecektir. 
                           Bağlantı 1 saat süreyle geçerli olacaktır."
                type="info"
                showIcon
                icon={<ClockCircleOutlined />}
                className="info-alert"
              />
            </motion.div>
          ) : (
            <motion.div
              key="success-step"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="success-content"
            >
              <Result
                icon={
                  <div className="success-icon-wrapper">
                    <CheckCircleFilled style={{ fontSize: 72, color: '#52c41a' }} />
                  </div>
                }
                title="E-posta Gönderildi!"
                subTitle={
                  <div>
                    <Paragraph>
                      Şifre sıfırlama bağlantısı <strong>{email}</strong> adresine gönderildi.
                    </Paragraph>
                    <Paragraph type="secondary">
                      E-postanızı kontrol edin ve bağlantıya tıklayarak yeni şifrenizi oluşturun.
                    </Paragraph>
                  </div>
                }
                extra={[
                  <Button 
                    key="back"
                    type="primary" 
                    size="large"
                    onClick={handleBackToLogin}
                    className="success-button"
                  >
                    Giriş Sayfasına Dön
                  </Button>
                ]}
              />

              {/* Additional Info */}
              <div className="additional-info">
                <Alert
                  message="E-posta gelmedi mi?"
                  description={
                    <Space direction="vertical" size="small">
                      <Text>• Spam/Gereksiz klasörünü kontrol edin</Text>
                      <Text>• E-posta adresinizi doğru girdiğinizden emin olun</Text>
                      <Text>• Birkaç dakika bekleyin ve tekrar deneyin</Text>
                    </Space>
                  }
                  type="warning"
                  showIcon
                  className="warning-alert"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
};