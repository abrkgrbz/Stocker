import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { MailOutlined, LockOutlined, LoginOutlined, RocketOutlined, HomeOutlined } from '@ant-design/icons';
import { Form, Input, Button, Typography, Space } from 'antd';
import Swal from 'sweetalert2';

import { useAuthStore } from '@/app/store/auth.store';
import companyService from '@/services/companyService';
import { LoginRequest } from '@/shared/types';
import { showApiResponse, showWelcomeAlert } from '@/shared/utils/sweetAlert';

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
      
            // Check if company exists for tenant users BEFORE navigation
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
          // Error handling removed for production
        }
      }
      
      // Navigate FIRST, immediately based on role
      let targetPath = '/';
      if (from) {
                targetPath = from;
      } else if (userRole === 'SystemAdmin') {
                targetPath = '/master';
      } else if (userRole === 'TenantAdmin' || userRole === 'Admin') {
                targetPath = '/admin';
      } else {
        // For regular users, we need to use the tenant ID
        const tenantId = authStore.user?.tenantId || localStorage.getItem('stocker_tenant') || 'default';
                targetPath = `/app/${tenantId}`;
      }
      
                  // Show welcome alert first (non-blocking)
      const roleDisplayName = userRole === 'SystemAdmin' ? 'Sistem Yöneticisi' : 
                             userRole === 'TenantAdmin' ? 'Kiracı Yöneticisi' :
                             userRole === 'Admin' ? 'Yönetici' : 'Kullanıcı';
      showWelcomeAlert(userName, roleDisplayName);
      
      // Use window.location for hard navigation to ensure page reload
      // This will trigger a full page reload and re-initialization
            setTimeout(() => {
        // Use window.location.href for guaranteed navigation
        window.location.href = targetPath;
      }, 1000);
      
    } catch (error: any) {
      // Close loading
      Swal.close();
      
      // Error handling removed for production
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
              ÖZELLİKLER
            </Text>
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              <div className="feature-item">
                <div className="feature-icon">🔒</div>
                <div className="feature-info">
                  <Text strong style={{ fontSize: 13 }}>Güvenli Giriş</Text>
                  <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>256-bit SSL şifreleme ile korunan veriler</Text>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">📱</div>
                <div className="feature-info">
                  <Text strong style={{ fontSize: 13 }}>Çoklu Platform</Text>
                  <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Mobil, tablet ve masaüstü desteği</Text>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🚀</div>
                <div className="feature-info">
                  <Text strong style={{ fontSize: 13 }}>Hızlı Erişim</Text>
                  <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Otomatik oturum açma ve biyometrik giriş</Text>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🌐</div>
                <div className="feature-info">
                  <Text strong style={{ fontSize: 13 }}>7/24 Erişim</Text>
                  <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Her zaman, her yerden güvenli bağlantı</Text>
                </div>
              </div>
            </Space>
          </div>
        </div>
      </div>
    </div>
  );
};