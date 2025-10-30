import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Typography, message } from 'antd';
import { UserOutlined, LockOutlined, EyeOutlined, EyeInvisibleOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { loginSchema, type LoginFormData } from '../../schemas/authSchemas';
import { loginRateLimiter } from '../../utils/security';
import { z } from 'zod';
import { TwoFactorLogin } from '../../components/TwoFactor/TwoFactorLogin';
import { BackupCodeVerification } from '../../components/TwoFactor/BackupCodeVerification';
import './LoginPage.css';
import './LoginPage.global.css';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, requires2FA, verify2FA, verifyBackupCode, clearTempToken, user } = useAuthStore();
  const [form] = Form.useForm();

  const [isLoading, setIsLoading] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showBackupCodeModal, setShowBackupCodeModal] = useState(false);

  // Add login-page class to body to prevent scrolling
  useEffect(() => {
    document.body.classList.add('login-page');

    // Cleanup function to remove the class when component unmounts
    return () => {
      document.body.classList.remove('login-page');
    };
  }, []);

  // Check if 2FA is required after login
  useEffect(() => {
    if (requires2FA) {
      setShow2FAModal(true);
      setIsLoading(false);
    }
  }, [requires2FA]);

  const handleSubmit = async (values: { email: string; password: string }) => {
    try {
      // Check rate limit for login attempts
      const identifier = `login_${values.email}`;
      if (!loginRateLimiter.isAllowed(identifier)) {
        const remaining = loginRateLimiter.getRemainingRequests(identifier);
        await Swal.fire({
          icon: 'warning',
          title: 'Çok Fazla Deneme!',
          text: `Lütfen birkaç dakika bekleyin. (${remaining} deneme hakkı kaldı)`,
          confirmButtonColor: '#667eea',
          background: '#1a1f36',
          color: '#fff',
        });
        return;
      }

      // Validate with Zod
      const formData: LoginFormData = loginSchema.parse(values);
      setIsLoading(true);
      
      // Use validated and sanitized data
      await login(formData.email, formData.password);

      // Don't show any success message here
      // If 2FA required: modal will be shown via useEffect
      // If 2FA not required: user is already authenticated, just navigate
      // Success messages handled by 2FA verification or dashboard

      // Check the current state after login completes
      const currentState = useAuthStore.getState();

      if (!currentState.requires2FA && currentState.isAuthenticated) {
        // Only navigate if fully authenticated without 2FA
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      }
      // Otherwise, 2FA modal will be shown via useEffect
      
    } catch (error: any) {
      // Check if it's a validation error
      if (error instanceof z.ZodError) {
        error.issues.forEach((err) => {
          form.setFields([
            {
              name: err.path[0] as string,
              errors: [err.message],
            },
          ]);
        });
        setIsLoading(false);
        return;
      }
      
      // Authentication error
      Swal.fire({
        icon: 'error',
        title: 'Giriş Başarısız!',
        text: error?.message || 'E-posta veya şifre hatalı. Lütfen tekrar deneyin.',
        confirmButtonText: 'Tamam',
        confirmButtonColor: '#667eea',
        background: '#1a1f36',
        color: '#fff',
        customClass: {
          popup: 'colored-toast',
          title: 'swal-title',
          confirmButton: 'swal-button'
        },
        didOpen: (popup) => {
          popup.style.border = '2px solid #ff4757';
          popup.style.boxShadow = '0 10px 40px rgba(255, 71, 87, 0.3)';
        }
      });
      setIsLoading(false);
    }
  };

  const handle2FAVerification = async (code: string): Promise<boolean> => {
    try {
      const success = await verify2FA(code);

      if (success) {
        setShow2FAModal(false);

        // Success notification
        await Swal.fire({
          icon: 'success',
          title: '2FA Doğrulandı!',
          text: 'Yönetim paneline yönlendiriliyorsunuz...',
          timer: 1500,
          timerProgressBar: true,
          showConfirmButton: false,
          toast: true,
          position: 'top',
          background: '#1a1f36',
          color: '#fff',
          customClass: {
            popup: 'colored-toast',
            title: 'swal-title',
            timerProgressBar: 'swal-progress-bar'
          },
          didOpen: (toast) => {
            toast.style.border = '2px solid #10b981';
            toast.style.boxShadow = '0 10px 40px rgba(16, 185, 129, 0.3)';
          }
        });

        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);

        return true;
      }
      return false;
    } catch (error) {
      console.error('2FA verification failed:', error);
      return false;
    }
  };

  const handleBackupCodeVerification = async (code: string): Promise<boolean> => {
    try {
      const success = await verifyBackupCode(code);

      if (success) {
        setShowBackupCodeModal(false);
        setShow2FAModal(false);

        // Success notification
        await Swal.fire({
          icon: 'success',
          title: 'Yedek Kod Doğrulandı!',
          text: 'Yönetim paneline yönlendiriliyorsunuz...',
          timer: 1500,
          timerProgressBar: true,
          showConfirmButton: false,
          toast: true,
          position: 'top',
          background: '#1a1f36',
          color: '#fff',
          customClass: {
            popup: 'colored-toast',
            title: 'swal-title',
            timerProgressBar: 'swal-progress-bar'
          },
          didOpen: (toast) => {
            toast.style.border = '2px solid #10b981';
            toast.style.boxShadow = '0 10px 40px rgba(16, 185, 129, 0.3)';
          }
        });

        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);

        return true;
      }
      return false;
    } catch (error) {
      console.error('Backup code verification failed:', error);
      return false;
    }
  };

  const handleCancel2FA = () => {
    setShow2FAModal(false);
    setShowBackupCodeModal(false);
    clearTempToken();
    setIsLoading(false);
  };

  return (
    <div className="login-container">
      {/* Left Side - Form */}
      <div className="login-form-section">
        <div className="login-form-wrapper">
          {/* Logo */}
          <div className="login-header">
            <div className="logo-wrapper">
              <div className="logo-icon">
                <img
                  src="/logo.png"
                  alt="Stocker Logo"
                  style={{ width: '280px', height: 'auto' }}
                />
              </div>
            </div>
          </div>

          {/* Form */}
          <Form
            form={form}
            name="login"
            onFinish={handleSubmit}
            layout="vertical"
            requiredMark={false}
            className="login-form"
          >
            <Form.Item
              name="email"
              label={<span className="form-label">E-posta</span>}
              rules={[
                { required: true, message: 'E-posta zorunludur' },
                { type: 'email', message: 'Geçerli bir e-posta giriniz' }
              ]}
            >
              <Input
                prefix={<UserOutlined className="input-icon" />}
                placeholder="admin@stocker.com"
                size="large"
                className="login-input"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span className="form-label">Şifre</span>}
              rules={[
                { required: true, message: 'Şifre zorunludur' },
                { min: 8, message: 'Şifre en az 8 karakter olmalıdır' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="input-icon" />}
                placeholder="••••••••"
                size="large"
                className="login-input"
                iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                size="large"
                block
                className="login-button"
                icon={!isLoading && <ArrowRightOutlined />}
              >
                {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </Button>
            </Form.Item>
          </Form>

          {/* Footer Links */}
          <div className="login-footer">
            <div className="footer-divider">
              <span className="divider-line"></span>
              <span className="divider-text">veya</span>
              <span className="divider-line"></span>
            </div>
            <div className="footer-links">
              <Link to="/forgot-password">
                <Button type="link" className="forgot-password">
                  <LockOutlined className="forgot-icon" />
                  <span>Şifremi Unuttum</span>
                  <span className="forgot-arrow">→</span>
                </Button>
              </Link>
            </div>
            <div className="footer-help">
              <Text className="help-text">
                Yardıma mı ihtiyacınız var? 
                <a href="#" className="help-link"> Destek Merkezi</a>
              </Text>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="login-visual-section">
        {/* Animated Background Pattern */}
        <div className="animated-bg">
          <div className="gradient-bg"></div>
          <div className="pattern-overlay"></div>
        </div>
        
        {/* Content */}
        <div className="visual-content">
          <Title level={2} className="visual-title">
            Güçlü Yönetim Araçları
          </Title>
          <Text className="visual-description">
            Çoklu kiracı desteği, gelişmiş analitik ve gerçek zamanlı izleme ile işletmenizi yönetin.
          </Text>
          
          {/* Feature List */}
          <div className="feature-list">
            <div className="feature-item">
              <div className="feature-icon">📊</div>
              <Text>Gelişmiş Analitik</Text>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🏢</div>
              <Text>Çoklu Kiracı</Text>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🔒</div>
              <Text>Güvenli Altyapı</Text>
            </div>
            <div className="feature-item">
              <div className="feature-icon">⚡</div>
              <Text>Gerçek Zamanlı</Text>
            </div>
          </div>
        </div>
      </div>

      {/* 2FA Verification Modal */}
      <TwoFactorLogin
        visible={show2FAModal && !showBackupCodeModal}
        onVerify={handle2FAVerification}
        onCancel={handleCancel2FA}
        onUseBackupCode={() => {
          setShow2FAModal(false);
          setShowBackupCodeModal(true);
        }}
        userEmail={user?.email}
      />

      {/* Backup Code Verification Modal */}
      <BackupCodeVerification
        visible={showBackupCodeModal}
        onVerify={handleBackupCodeVerification}
        onBack={() => {
          setShowBackupCodeModal(false);
          setShow2FAModal(true);
        }}
        onCancel={handleCancel2FA}
        userEmail={user?.email}
      />
    </div>
  );
};

export default LoginPage;