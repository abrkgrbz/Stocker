import React, { useState } from 'react';
import { Form, Input, Button, Typography, message, Result, Steps } from 'antd';
import { MailOutlined, LockOutlined, ArrowLeftOutlined, CheckCircleOutlined, SendOutlined, KeyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { z } from 'zod';
import './ForgotPasswordPage.css';

const { Title, Text } = Typography;
const { Step } = Steps;

// Validation schemas
const emailSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
});

const resetSchema = z.object({
  code: z.string().min(6, 'Doğrulama kodu 6 haneli olmalıdır'),
  newPassword: z.string().min(8, 'Şifre en az 8 karakter olmalıdır'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Şifreler eşleşmiyor",
  path: ["confirmPassword"],
});

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: Send reset email
  const handleSendEmail = async (values: { email: string }) => {
    try {
      emailSchema.parse(values);
      setIsLoading(true);
      
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setEmail(values.email);
      setCurrentStep(1);
      
      await Swal.fire({
        icon: 'success',
        title: 'E-posta Gönderildi!',
        text: `${values.email} adresine şifre sıfırlama kodu gönderildi.`,
        confirmButtonColor: '#667eea',
        background: '#1a1f36',
        color: '#fff',
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        error.issues.forEach((err) => {
          form.setFields([
            {
              name: err.path[0] as string,
              errors: [err.message],
            },
          ]);
        });
      } else {
        message.error('E-posta gönderilemedi. Lütfen tekrar deneyin.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Reset password with code
  const handleResetPassword = async (values: { code: string; newPassword: string; confirmPassword: string }) => {
    try {
      resetSchema.parse(values);
      setIsLoading(true);
      
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setCurrentStep(2);
      
      await Swal.fire({
        icon: 'success',
        title: 'Şifre Güncellendi!',
        text: 'Şifreniz başarıyla güncellendi. Giriş sayfasına yönlendiriliyorsunuz...',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        background: '#1a1f36',
        color: '#fff',
      });
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        error.issues.forEach((err) => {
          form.setFields([
            {
              name: err.path[0] as string,
              errors: [err.message],
            },
          ]);
        });
      } else {
        message.error('Şifre güncellenemedi. Lütfen tekrar deneyin.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    switch (currentStep) {
      case 0:
        // Email input step
        return (
          <div className="forgot-step-content">
            <div className="step-header">
              <div className="step-icon-wrapper">
                <MailOutlined className="step-icon" />
              </div>
              <div className="step-text">
                <Title level={3} className="step-title">Şifre Sıfırlama</Title>
                <Text className="step-description">
                  Kayıtlı e-posta adresinize şifre sıfırlama kodu göndereceğiz
                </Text>
              </div>
            </div>
            
            <Form
              form={form}
              name="forgot-email"
              onFinish={handleSendEmail}
              layout="vertical"
              className="forgot-form"
            >
              <Form.Item
                name="email"
                label="E-posta Adresi"
                rules={[
                  { required: true, message: 'E-posta zorunludur' },
                  { type: 'email', message: 'Geçerli bir e-posta giriniz' }
                ]}
              >
                <Input
                  prefix={<MailOutlined className="input-icon" />}
                  placeholder="ornek@sirket.com"
                  size="large"
                  className="forgot-input email-input"
                  autoComplete="email"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isLoading}
                  size="large"
                  block
                  className="submit-button"
                  icon={<SendOutlined />}
                >
                  {isLoading ? 'Gönderiliyor...' : 'Doğrulama Kodu Gönder'}
                </Button>
              </Form.Item>
            </Form>
          </div>
        );

      case 1:
        // Code verification and password reset step
        return (
          <div className="forgot-step-content">
            <div className="step-header">
              <div className="step-icon-wrapper">
                <KeyOutlined className="step-icon" />
              </div>
              <div className="step-text">
                <Title level={3} className="step-title">Yeni Şifre Belirle</Title>
                <Text className="step-description">
                  <strong>{email}</strong> adresine gönderilen kodu girin
                </Text>
              </div>
            </div>
            
            <Form
              form={form}
              name="reset-password"
              onFinish={handleResetPassword}
              layout="vertical"
              className="forgot-form"
            >
              <Form.Item
                name="code"
                label="Doğrulama Kodu"
                rules={[
                  { required: true, message: 'Doğrulama kodu zorunludur' },
                  { min: 6, message: 'Doğrulama kodu 6 haneli olmalıdır' }
                ]}
              >
                <Input
                  prefix={<KeyOutlined className="input-icon" />}
                  placeholder="000000"
                  size="large"
                  maxLength={6}
                  className="forgot-input code-input"
                  autoComplete="off"
                />
              </Form.Item>

              <Form.Item
                name="newPassword"
                label="Yeni Şifre"
                rules={[
                  { required: true, message: 'Yeni şifre zorunludur' },
                  { min: 8, message: 'Şifre en az 8 karakter olmalıdır' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="input-icon" />}
                  placeholder="En az 8 karakter"
                  size="large"
                  className="forgot-input"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Şifre Tekrarı"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'Şifre tekrarı zorunludur' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Şifreler eşleşmiyor!'));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="input-icon" />}
                  placeholder="Şifrenizi tekrar girin"
                  size="large"
                  className="forgot-input"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isLoading}
                  size="large"
                  block
                  className="submit-button"
                  icon={<CheckCircleOutlined />}
                >
                  {isLoading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
                </Button>
              </Form.Item>
            </Form>

            <Button
              type="link"
              onClick={() => setCurrentStep(0)}
              className="resend-link"
            >
              Kodu tekrar gönder
            </Button>
          </div>
        );

      case 2:
        // Success step
        return (
          <div className="forgot-step-content">
            <Result
              status="success"
              title="Şifreniz Güncellendi!"
              subTitle="Şifreniz başarıyla değiştirildi. Yeni şifrenizle giriş yapabilirsiniz."
              extra={[
                <Button
                  type="primary"
                  key="login"
                  onClick={() => navigate('/login')}
                  className="success-button"
                >
                  Giriş Sayfasına Git
                </Button>
              ]}
              className="success-result"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="forgot-container">
      <div className="forgot-card">
        {/* Back to login */}
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/login')}
          className="back-button"
        >
          Giriş Sayfasına Dön
        </Button>

        {/* Progress Steps */}
        <Steps
          current={currentStep}
          className="forgot-steps"
          items={[
            {
              title: 'E-posta',
              icon: <MailOutlined />,
            },
            {
              title: 'Doğrulama',
              icon: <KeyOutlined />,
            },
            {
              title: 'Tamamlandı',
              icon: <CheckCircleOutlined />,
            },
          ]}
        />

        {/* Content */}
        {renderContent()}
      </div>

      {/* Background decoration */}
      <div className="forgot-bg">
        <div className="bg-gradient"></div>
        <div className="bg-pattern"></div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;