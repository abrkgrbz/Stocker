import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Checkbox, message } from 'antd';
import { UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { useAuthStore } from '../../stores/authStore';
import { loginRateLimiter, validateEmail, validatePassword } from '../../utils/security';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, requires2FA } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Redirect to 2FA page if 2FA is required
  useEffect(() => {
    if (requires2FA) {
      navigate('/verify-2fa');
    }
  }, [requires2FA, navigate]);

  const handleSubmit = async (values: any) => {
    const { email, password } = values;
    
    // Validate email format
    if (!validateEmail(email)) {
      setError('Geçerli bir e-posta adresi giriniz');
      return;
    }
    
    // Validate password strength
    if (!validatePassword(password)) {
      setError('Şifre en az 8 karakter, bir büyük harf, bir küçük harf ve bir rakam içermelidir');
      return;
    }
    
    // Check rate limiting
    if (!loginRateLimiter.isAllowed(email)) {
      setError('Çok fazla deneme yaptınız. Lütfen 5 dakika sonra tekrar deneyin.');
      message.warning('Çok fazla deneme yaptınız. Lütfen 5 dakika sonra tekrar deneyin.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await login(email, password);

      // Don't show any success message here
      // If 2FA required: useEffect will navigate to /verify-2fa
      // If 2FA not required: useEffect will navigate to /dashboard
      // Success messages handled by destination pages

      form.resetFields();
    } catch (err: any) {
      const errorMessage = err.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>Stocker Admin Panel</h1>
        </div>
        
        <Form
          form={form}
          name="login"
          onFinish={handleSubmit}
          autoComplete="off"
          layout="vertical"
        >
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'E-posta adresinizi giriniz!' },
              { type: 'email', message: 'Geçerli bir e-posta adresi giriniz!' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="E-posta"
              size="large"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Şifrenizi giriniz!' },
              { min: 8, message: 'Şifre en az 8 karakter olmalıdır!' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Şifre"
              size="large"
              autoComplete="current-password"
              iconRender={(visible) =>
                visible ? (
                  <EyeTwoTone />
                ) : (
                  <EyeInvisibleOutlined />
                )
              }
              aria-label="toggle password"
            />
          </Form.Item>

          <Form.Item>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Beni hatırla</Checkbox>
            </Form.Item>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              block
            >
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default LoginPage;
