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
  EyeInvisibleOutlined,
  EyeTwoTone
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { getTenantSlugFromDomain, getMainDomainUrl, TenantInfo } from '../../../../utils/tenant';
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
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/tenants/${tenantSlug}`);
      // const data = await response.json();
      
      // Mock data for now
      setTimeout(() => {
        setTenantInfo({
          id: '1',
          slug: tenantSlug!,
          name: tenantSlug!.charAt(0).toUpperCase() + tenantSlug!.slice(1) + ' Company',
          logo: null,
          primaryColor: '#667eea',
          secondaryColor: '#764ba2',
          isActive: true
        });
        setTenantLoading(false);
      }, 500);
    } catch (err) {
      setError('Tenant bulunamadı veya aktif değil');
      setTenantLoading(false);
    }
  };

  const handleLogin = async (values: LoginForm) => {
    try {
      setLoading(true);
      
      // TODO: Implement actual login API call
      // const response = await fetch(`/api/tenants/${tenantSlug}/login`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(values)
      // });
      
      // Mock login
      setTimeout(() => {
        message.success('Giriş başarılı!');
        // Store tenant context
        localStorage.setItem('current_tenant', tenantSlug!);
        localStorage.setItem('auth_token', 'mock_token_123');
        
        // Redirect to dashboard
        navigate('/dashboard');
        setLoading(false);
      }, 1000);
    } catch (err) {
      message.error('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
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

  if (error || !tenantInfo?.isActive) {
    return (
      <div className="tenant-login-container">
        <Card className="error-card">
          <Alert
            message="Erişim Hatası"
            description={error || 'Bu tenant aktif değil veya bulunamadı.'}
            type="error"
            showIcon
          />
          <Button
            type="primary"
            icon={<HomeOutlined />}
            onClick={() => window.location.href = getMainDomainUrl()}
            style={{ marginTop: 20 }}
          >
            Ana Sayfaya Dön
          </Button>
        </Card>
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
                  <span>{tenantSlug}.stocker.app</span>
                </div>
                <h2 className="login-form-title">Hoş Geldiniz</h2>
                <p className="login-form-subtitle">
                  Hesabınıza giriş yaparak devam edin
                </p>
              </div>

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
                  rules={[
                    { required: true, message: 'E-posta adresinizi girin' },
                    { type: 'email', message: 'Geçerli bir e-posta adresi girin' }
                  ]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="E-posta adresiniz"
                    size="large"
                    autoComplete="email"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[{ required: true, message: 'Şifrenizi girin' }]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Şifreniz"
                    size="large"
                    autoComplete="current-password"
                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                  />
                </Form.Item>

                <div className="form-extras">
                  <Form.Item name="remember" valuePropName="checked" noStyle>
                    <Checkbox>Beni hatırla</Checkbox>
                  </Form.Item>
                  <Link onClick={() => navigate('/forgot-password')}>
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
    </div>
  );
};