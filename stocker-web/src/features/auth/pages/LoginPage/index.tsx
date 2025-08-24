import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Input, Button, Typography, Space } from 'antd';
import { MailOutlined, LockOutlined, LoginOutlined, RocketOutlined, HomeOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/app/store/auth.store';
import { LoginRequest } from '@/shared/types';
import companyService from '@/services/companyService';
import { showApiResponse, showLoginSuccess } from '@/shared/utils/sweetAlert';
import Swal from 'sweetalert2';
import './style.css';

const { Title, Text } = Typography;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuthStore();
  const [form] = Form.useForm();

  const handleSubmit = async (values: any) => {
    // Show loading
    showApiResponse.loading('Giriş yapılıyor...');
    
    try {
      // If tenant code is provided, set it as a header
      if (values.tenantCode) {
        localStorage.setItem('X-Tenant-Code', values.tenantCode);
      }
      
      const loginData: LoginRequest = {
        email: values.email,
        password: values.password,
        tenantCode: values.tenantCode
      };
      
      await login(loginData);
      
      // Close loading
      Swal.close();
      
      // Wait for auth store to be updated
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Get the fresh user data after login
      const authStore = useAuthStore.getState();
      const userName = authStore.user?.firstName || authStore.user?.email || 'Kullanıcı';
      const userRole = authStore.user?.roles?.[0];
      const from = (location.state as any)?.from?.pathname;
      
      console.log('Login successful - User role:', userRole);
      
      // Show success message (non-blocking)
      showLoginSuccess(userName);
      
      // Check if company exists for tenant users
      if (userRole !== 'SystemAdmin') {
        try {
          const hasCompany = await companyService.checkCompanyExists();
          if (!hasCompany) {
            showApiResponse.info(
              'Şirket bilgilerinizi tamamlamanız gerekiyor. Yönlendiriliyorsunuz...',
              'Şirket Kurulumu'
            );
            setTimeout(() => {
              navigate('/company-setup', { replace: true });
            }, 1000);
            return;
          }
        } catch (companyError) {
          console.log('Company check skipped:', companyError);
        }
      }
      
      // Navigate immediately based on role
      if (from) {
        navigate(from, { replace: true });
      } else if (userRole === 'SystemAdmin') {
        console.log('Navigating to /master');
        navigate('/master', { replace: true });
      } else if (userRole === 'TenantAdmin' || userRole === 'Admin') {
        console.log('Navigating to /admin');
        navigate('/admin', { replace: true });
      } else {
        console.log('Navigating to /app/default');
        navigate('/app/default', { replace: true });
      }
      
    } catch (error: any) {
      // Close loading
      Swal.close();
      
      console.error('Login error:', error);
      
      // Show detailed error message
      if (error.response) {
        // API returned an error response
        showApiResponse.error(error, 'Giriş başarısız');
      } else if (error.message) {
        // Network or other error
        showApiResponse.error(
          { response: { data: { message: error.message } } },
          'Giriş başarısız'
        );
      } else {
        // Unknown error
        showApiResponse.error(
          { response: { data: { message: 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.' } } },
          'Giriş başarısız'
        );
      }
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
            <Title level={2} style={{ margin: 0, color: '#1a1a1a' }}>Hoş Geldiniz</Title>
            <Text type="secondary" style={{ fontSize: 16 }}>Stocker'a devam etmek için giriş yapın</Text>
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
              name="tenantCode"
              rules={[
                { required: false, message: 'Lütfen kiracı kodunu girin!' }
              ]}
            >
              <Input 
                prefix={<HomeOutlined style={{ color: '#667eea' }} />} 
                placeholder="Kiracı Kodu (örn: test)" 
                autoComplete="organization"
                className="login-input"
              />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Lütfen email adresinizi girin!' },
                { type: 'email', message: 'Lütfen geçerli bir email adresi girin!' }
              ]}
            >
              <Input 
                prefix={<MailOutlined style={{ color: '#667eea' }} />} 
                placeholder="Email adresi" 
                autoComplete="email"
                type="email"
                className="login-input"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Lütfen şifrenizi girin!' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#667eea' }} />}
                placeholder="Şifre"
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
                Giriş Yap
              </Button>
            </Form.Item>

            <div className="login-links">
              <a href="/forgot-password">Şifremi unuttum</a>
              <span className="separator">•</span>
              <a href="/register">Hesap oluştur</a>
            </div>
          </Form>

          <div className="demo-section">
            <Text type="secondary" style={{ fontSize: 12, textAlign: 'center', display: 'block', marginBottom: 12 }}>
              DEMO HESAPLARI
            </Text>
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              <div className="demo-credential" onClick={() => {
                form.setFieldsValue({ email: 'admin@stocker.com', password: 'Admin@123456' });
              }}>
                <div className="demo-icon">👨‍💼</div>
                <div className="demo-info">
                  <Text strong style={{ fontSize: 13 }}>Sistem Yöneticisi</Text>
                  <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>admin@stocker.com</Text>
                </div>
                <Text className="demo-hint">Doldurmak için tıkla</Text>
              </div>
              <div className="demo-credential" onClick={() => {
                form.setFieldsValue({ email: 'tenant@example.com', password: 'Tenant@123456' });
              }}>
                <div className="demo-icon">👤</div>
                <div className="demo-info">
                  <Text strong style={{ fontSize: 13 }}>Kiracı Yöneticisi</Text>
                  <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>tenant@example.com</Text>
                </div>
                <Text className="demo-hint">Doldurmak için tıkla</Text>
              </div>
            </Space>
          </div>
        </div>
      </div>
    </div>
  );
};