import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Input, Button, message, Typography, Space } from 'antd';
import { MailOutlined, LockOutlined, LoginOutlined, RocketOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/app/store/auth.store';
import { LoginRequest } from '@/shared/types';
import './style.css';

const { Title, Text } = Typography;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuthStore();
  const [form] = Form.useForm();

  const from = (location.state as any)?.from?.pathname || '/master';

  const handleSubmit = async (values: LoginRequest) => {
    try {
      await login(values);
      message.success('Login successful!');
      navigate(from, { replace: true });
    } catch (error: any) {
      message.error(error.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-background">
        <div className="login-bg-shape login-bg-shape-1"></div>
        <div className="login-bg-shape login-bg-shape-2"></div>
        <div className="login-bg-shape login-bg-shape-3"></div>
        <div className="login-bg-shape login-bg-shape-4"></div>
      </div>
      
      <div className="login-container">
        <div className="login-box">
          <div className="login-logo">
            <RocketOutlined style={{ fontSize: 48, color: '#667eea' }} />
          </div>
          <div className="login-header">
            <Title level={2} style={{ margin: 0, color: '#1a1a1a' }}>Welcome Back</Title>
            <Text type="secondary" style={{ fontSize: 16 }}>Sign in to continue to Stocker</Text>
          </div>

          <Form
            form={form}
            name="login"
            onFinish={handleSubmit}
            layout="vertical"
            size="large"
            className="login-form"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Please enter your email!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ]}
            >
              <Input 
                prefix={<MailOutlined style={{ color: '#667eea' }} />} 
                placeholder="Email address" 
                autoComplete="email"
                type="email"
                className="login-input"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please enter your password!' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#667eea' }} />}
                placeholder="Password"
                autoComplete="current-password"
                className="login-input"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 16 }}>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={isLoading} 
                block
                size="large"
                icon={<LoginOutlined />}
                className="login-button"
              >
                Sign In
              </Button>
            </Form.Item>

            <div className="login-links">
              <a href="#">Forgot password?</a>
              <span className="separator">•</span>
              <a href="#">Create account</a>
            </div>
          </Form>

          <div className="demo-section">
            <Text type="secondary" style={{ fontSize: 12, textAlign: 'center', display: 'block', marginBottom: 12 }}>
              DEMO ACCOUNTS
            </Text>
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              <div className="demo-credential" onClick={() => {
                form.setFieldsValue({ email: 'admin@stocker.com', password: 'Admin@123456' });
              }}>
                <div className="demo-icon">👨‍💼</div>
                <div className="demo-info">
                  <Text strong style={{ fontSize: 13 }}>System Admin</Text>
                  <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>admin@stocker.com</Text>
                </div>
                <Text className="demo-hint">Click to fill</Text>
              </div>
              <div className="demo-credential" onClick={() => {
                form.setFieldsValue({ email: 'tenant@example.com', password: 'Tenant@123456' });
              }}>
                <div className="demo-icon">👤</div>
                <div className="demo-info">
                  <Text strong style={{ fontSize: 13 }}>Tenant Admin</Text>
                  <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>tenant@example.com</Text>
                </div>
                <Text className="demo-hint">Click to fill</Text>
              </div>
            </Space>
          </div>
        </div>
      </div>
    </div>
  );
};