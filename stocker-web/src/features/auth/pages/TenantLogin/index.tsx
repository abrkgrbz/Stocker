import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Space,
  Divider,
  Alert,
  Checkbox,
  Spin,
  message,
  Row,
  Col
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  LoginOutlined,
  HomeOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
  GlobalOutlined,
  RocketOutlined,
  MailOutlined,
  MailFilled,
  LockFilled,
  EyeInvisibleOutlined,
  EyeTwoTone,
  ReloadOutlined,
  SafetyOutlined,
  KeyOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { getTenantSlugFromDomain, getMainDomainUrl, TenantInfo } from '@/utils/tenant';
import { useAuthStore } from '@/app/store/auth.store';
import { showApiResponse } from '@/shared/utils/sweetAlert';
import Swal from 'sweetalert2';
import { ForgotPasswordModal } from '@/features/auth/components/ForgotPasswordModal';
import './style.css';

const { Title, Text, Link } = Typography;

interface LoginForm {
  email: string;
  password: string;
  remember: boolean;
}

export const TenantLogin: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [tenantLoading, setTenantLoading] = useState(true);
  const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [forgotPasswordVisible, setForgotPasswordVisible] = useState(false);
  const { login } = useAuthStore();

  const tenantSlug = getTenantSlugFromDomain();

  useEffect(() => {
    // If no tenant slug, redirect to main domain
    if (!tenantSlug) {
      window.location.href = getMainDomainUrl();
      return;
    }

    // Fetch tenant information
    fetchTenantInfo();
  }, [tenantSlug]);

  const fetchTenantInfo = async () => {
    try {
      setTenantLoading(true);
      setError(null); // Clear any previous errors
      
      // Check if tenant exists - make actual API call
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/public/tenants/check/${tenantSlug}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Tenant not found');
      }
      
      const data = await response.json();
      
      if (data.exists && data.isActive) {
        setTenantInfo({
          id: data.id,
          slug: tenantSlug!,
          name: data.name || tenantSlug!,
          logo: data.logo,
          primaryColor: data.primaryColor || '#667eea',
          secondaryColor: data.secondaryColor || '#764ba2',
          isActive: true
        });
      } else {
        // Set error but don't redirect - show alert on login page
        setError(`"${tenantSlug}" adında bir firma bulunamadı. Lütfen doğru adresten eriştiğinizden emin olun.`);
        // Show mock tenant for demo purposes
        setTenantInfo({
          id: '1',
          slug: tenantSlug!,
          name: 'Demo Firma',
          logo: null,
          primaryColor: '#667eea',
          secondaryColor: '#764ba2',
          isActive: false // Mark as inactive to show warning
        });
      }
      
      setTenantLoading(false);
    } catch (err) {
      // Error handling removed for production
      // For development, allow login even if tenant check fails
      if (import.meta.env.DEV) {
        setTenantInfo({
          id: '1',
          slug: tenantSlug!,
          name: tenantSlug!.charAt(0).toUpperCase() + tenantSlug!.slice(1).replace('-', ' ') + ' Company',
          logo: null,
          primaryColor: '#667eea',
          secondaryColor: '#764ba2',
          isActive: true
        });
      } else {
        // For production, show error but still display login form
        setError(`"${tenantSlug}" firmasına bağlanılamadı. Lütfen daha sonra tekrar deneyin.`);
        setTenantInfo({
          id: '1',
          slug: tenantSlug!,
          name: tenantSlug!.charAt(0).toUpperCase() + tenantSlug!.slice(1).replace('-', ' ') + ' Company',
          logo: null,
          primaryColor: '#667eea',
          secondaryColor: '#764ba2',
          isActive: false // Mark as inactive to show warning
        });
      }
      setTenantLoading(false);
    }
  };

  const handleLogin = async (values: LoginForm) => {
    try {
      setLoading(true);
      
      // Set tenant context for API calls
      localStorage.setItem('X-Tenant-Code', tenantSlug!);
      localStorage.setItem('current_tenant', tenantSlug!);
      
      // Use auth store login
      const loginData = {
        email: values.email,
        password: values.password,
        tenantCode: tenantSlug
      };
      
      await login(loginData);
      
      message.success('Giriş başarılı!');
      
      // For now, just stay on login page after successful login
      // Post-login features will be added after refactoring
      
      setLoading(false);
    } catch (err: any) {
      // Error handling removed for production
      // Show detailed error
      if (err.response?.data?.message) {
        message.error(err.response.data.message);
      } else if (err.message) {
        message.error(err.message);
      } else {
        message.error('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
      }
      
      setLoading(false);
    }
  };

  if (tenantLoading) {
    return (
      <div className="tenant-login-container">
        <div className="loading-wrapper">
          <Spin
            indicator={<LoadingOutlined style={{ fontSize: 48 }} />}
            tip="Yükleniyor..."
            size="large"
          />
        </div>
      </div>
    );
  }


  const customStyle = tenantInfo?.primaryColor ? {
    '--primary-color': tenantInfo.primaryColor,
    '--secondary-color': tenantInfo.secondaryColor || tenantInfo.primaryColor
  } as React.CSSProperties : {};

  return (
    <div className="tenant-login-container">
      {/* Left Section - Brand */}
      <div className="login-left-section">
        <div className="geometric-pattern" />
        <div className="floating-shapes">
          <div className="shape" />
          <div className="shape" />
          <div className="shape" />
          <div className="shape shape-4" />
          <div className="shape shape-5" />
        </div>
        
        <motion.div
          className="brand-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="brand-logo">
            <RocketOutlined />
          </div>
          <h1 className="brand-title">{tenantInfo?.name || 'Stocker'}</h1>
          <p className="brand-subtitle">İşletmenizi dijitalleştirin</p>
          
          <ul className="features-list">
            <li>
              <CheckCircleOutlined />
              Güvenli ve hızlı giriş
            </li>
            <li>
              <CheckCircleOutlined />
              256-bit SSL şifreleme
            </li>
            <li>
              <CheckCircleOutlined />
              7/24 erişim imkanı
            </li>
            <li>
              <CheckCircleOutlined />
              Çoklu cihaz desteği
            </li>
          </ul>
        </motion.div>
      </div>

      {/* Right Section - Login Form */}
      <div className="login-right-section">
        <div className="login-content">
          <Card className="login-card">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Form Header */}
              <div className="login-form-header">
                <div className="tenant-badge">
                  <GlobalOutlined />
                  <span>{tenantSlug}.stoocker.app</span>
                </div>
                <h2 className="login-form-title">Hoş Geldiniz</h2>
                <p className="login-form-subtitle">
                  {tenantInfo?.isActive ? 'Hesabınıza giriş yaparak devam edin' : 'Demo Modunda Giriş'}
                </p>
              </div>

              {/* Show error alert if tenant not found */}
              {error && (
                <Alert
                  message="Firma Doğrulanamadı"
                  description={
                    <div>
                      <p style={{ margin: '8px 0' }}>{error}</p>
                      {!tenantInfo?.isActive && (
                        <div style={{ marginTop: 12, padding: '8px 12px', background: '#fff7e6', borderRadius: 4 }}>
                          <Text type="warning" style={{ fontSize: 13 }}>
                            <strong>Not:</strong> Demo modunda giriş yapabilirsiniz ancak bazı özellikler kısıtlı olabilir.
                          </Text>
                        </div>
                      )}
                    </div>
                  }
                  type="warning"
                  showIcon
                  closable
                  onClose={() => setError(null)}
                  style={{ marginBottom: 24 }}
                />
              )}

              {/* Login Form */}
              <Form
                form={form}
                layout="vertical"
                onFinish={handleLogin}
                autoComplete="off"
                initialValues={{ remember: true }}
                className="login-form"
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
                    prefix={<MailFilled style={{ color: '#667eea' }} />}
                    placeholder="ornek@firma.com"
                    size="large"
                    autoComplete="email"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label="Şifre"
                  rules={[{ required: true, message: 'Şifrenizi girin' }]}
                >
                  <Input.Password
                    prefix={<KeyOutlined style={{ color: '#667eea' }} />}
                    placeholder="••••••••"
                    size="large"
                    autoComplete="current-password"
                    iconRender={(visible) => (visible ? <EyeTwoTone twoToneColor="#667eea" /> : <EyeInvisibleOutlined />)}
                  />
                </Form.Item>

                <div className="form-extras">
                  <Form.Item name="remember" valuePropName="checked" noStyle>
                    <Checkbox>Beni hatırla</Checkbox>
                  </Form.Item>
                  <Link onClick={() => setForgotPasswordVisible(true)}>
                    Şifremi unuttum
                  </Link>
                </div>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={loading}
                    icon={<LoginOutlined />}
                    block
                  >
                    Giriş Yap
                  </Button>
                </Form.Item>
              </Form>

              {/* Footer */}
              <div className="login-footer">
                <Text type="secondary">
                  Henüz hesabınız yok mu?{' '}
                  <Link onClick={() => navigate('/register')}>
                    Ücretsiz Kayıt Ol
                  </Link>
                </Text>
                <div style={{ marginTop: 16 }}>
                  <Space split={<Divider type="vertical" />}>
                    <Link onClick={() => window.location.href = getMainDomainUrl()}>
                      Ana Sayfa
                    </Link>
                    <Link href="/privacy">Gizlilik</Link>
                    <Link href="/terms">Şartlar</Link>
                  </Space>
                </div>
              </div>
            </motion.div>
          </Card>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        visible={forgotPasswordVisible}
        onCancel={() => setForgotPasswordVisible(false)}
        tenantSlug={tenantSlug || undefined}
      />
    </div>
  );
};