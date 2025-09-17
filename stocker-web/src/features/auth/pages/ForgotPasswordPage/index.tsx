import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { MailOutlined, LockOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Form, Input, Button, Card, Typography, Alert, Steps } from 'antd';

import { Toast } from '@/shared/components/Toast';
import { formRules } from '@/shared/utils/validators';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

interface ForgotPasswordForm {
  email: string;
}

interface ResetPasswordForm {
  code: string;
  password: string;
  confirmPassword: string;
}

export const ForgotPasswordPage: React.FC = () => {
  const [form] = Form.useForm();
  const [resetForm] = Form.useForm();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendResetCode = async (values: ForgotPasswordForm) => {
    setIsLoading(true);
    try {
      // API call to send reset code
      // await authApi.sendPasswordResetCode(values.email);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Toast.success('Şifre sıfırlama kodu email adresinize gönderildi.');
      setEmail(values.email);
      setCurrentStep(1);
    } catch (error) {
      Toast.error('Kod gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (values: ResetPasswordForm) => {
    setIsLoading(true);
    try {
      // API call to reset password
      // await authApi.resetPassword({
      //   email,
      //   code: values.code,
      //   newPassword: values.password
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Toast.success('Şifreniz başarıyla güncellendi. Giriş yapabilirsiniz.');
      setCurrentStep(2);
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      Toast.error('Şifre güncellenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    try {
      // await authApi.sendPasswordResetCode(email);
      await new Promise(resolve => setTimeout(resolve, 1500));
      Toast.success('Yeni kod gönderildi.');
    } catch (error) {
      Toast.error('Kod gönderilirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-content">
        <Card className="forgot-password-card">
          <div className="forgot-password-header">
            <Title level={2}>Şifremi Unuttum</Title>
            <Paragraph type="secondary">
              {currentStep === 0 && 'Email adresinizi girin, size şifre sıfırlama kodu gönderelim.'}
              {currentStep === 1 && 'Email adresinize gönderilen kodu girin ve yeni şifrenizi belirleyin.'}
              {currentStep === 2 && 'Şifreniz başarıyla güncellendi!'}
            </Paragraph>
          </div>

          <Steps current={currentStep} className="forgot-password-steps">
            <Step title="Email" />
            <Step title="Doğrulama" />
            <Step title="Tamamlandı" />
          </Steps>

          {currentStep === 0 && (
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSendResetCode}
              className="forgot-password-form"
            >
              <Form.Item
                name="email"
                label="Email Adresi"
                rules={[
                  formRules.required('Email adresi zorunludur'),
                  formRules.email('Geçerli bir email adresi giriniz'),
                ]}
              >
                <Input
                  size="large"
                  prefix={<MailOutlined />}
                  placeholder="ornek@email.com"
                  autoComplete="email"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  loading={isLoading}
                >
                  Kod Gönder
                </Button>
              </Form.Item>

              <div className="forgot-password-footer">
                <Link to="/login">
                  <ArrowLeftOutlined /> Giriş sayfasına dön
                </Link>
              </div>
            </Form>
          )}

          {currentStep === 1 && (
            <Form
              form={resetForm}
              layout="vertical"
              onFinish={handleResetPassword}
              className="forgot-password-form"
            >
              <Alert
                message={`Doğrulama kodu ${email} adresine gönderildi.`}
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
              />

              <Form.Item
                name="code"
                label="Doğrulama Kodu"
                rules={[
                  formRules.required('Doğrulama kodu zorunludur'),
                  formRules.min(6, 'Doğrulama kodu en az 6 karakter olmalıdır'),
                ]}
              >
                <Input
                  size="large"
                  placeholder="6 haneli kodu girin"
                  maxLength={6}
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="Yeni Şifre"
                rules={[
                  formRules.required('Şifre zorunludur'),
                  formRules.password(),
                ]}
              >
                <Input.Password
                  size="large"
                  prefix={<LockOutlined />}
                  placeholder="Yeni şifrenizi girin"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Şifre Tekrar"
                dependencies={['password']}
                rules={[
                  formRules.required('Şifre tekrarı zorunludur'),
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Şifreler eşleşmiyor'));
                    },
                  }),
                ]}
              >
                <Input.Password
                  size="large"
                  prefix={<LockOutlined />}
                  placeholder="Şifrenizi tekrar girin"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  loading={isLoading}
                >
                  Şifreyi Güncelle
                </Button>
              </Form.Item>

              <div className="forgot-password-footer">
                <Button type="link" onClick={handleResendCode} disabled={isLoading}>
                  Kodu tekrar gönder
                </Button>
                <Link to="/login">
                  <ArrowLeftOutlined /> Giriş sayfasına dön
                </Link>
              </div>
            </Form>
          )}

          {currentStep === 2 && (
            <div className="forgot-password-success">
              <div className="success-icon">✓</div>
              <Title level={3}>Şifreniz Güncellendi!</Title>
              <Paragraph>
                Yeni şifreniz ile giriş yapabilirsiniz. Yönlendiriliyorsunuz...
              </Paragraph>
              <Button type="primary" size="large" onClick={() => navigate('/login')}>
                Giriş Yap
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;