import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, Button, Result, Spin, message, Typography } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, MailOutlined } from '@ant-design/icons';
import { authAPI } from '@/services/api/auth.api';
import './style.css';

const { Title, Paragraph } = Typography;

const EmailVerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const email = searchParams.get('email');
  const token = searchParams.get('token');

  useEffect(() => {
    if (email && token) {
      verifyEmail();
    } else {
      setVerificationStatus('error');
      setErrorMessage('Geçersiz doğrulama linki');
    }
  }, [email, token]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const verifyEmail = async () => {
    if (!email || !token) return;

    try {
      const response = await authAPI.verifyEmail({ email, token });
      
      if (response.data.success) {
        setVerificationStatus('success');
        message.success(response.data.message || 'Email başarıyla doğrulandı!');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate(response.data.redirectUrl || '/login');
        }, 3000);
      } else {
        setVerificationStatus('error');
        setErrorMessage(response.data.message || 'Doğrulama başarısız');
      }
    } catch (error: any) {
      setVerificationStatus('error');
      setErrorMessage(error.response?.data?.message || 'Doğrulama sırasında bir hata oluştu');
    }
  };

  const handleResendEmail = async () => {
    if (!email || isResending || resendCooldown > 0) return;

    setIsResending(true);
    try {
      const response = await authAPI.resendVerificationEmail({ email });
      
      if (response.data.success) {
        message.success(response.data.message || 'Doğrulama emaili tekrar gönderildi');
        setResendCooldown(60); // 60 second cooldown
      } else {
        message.error(response.data.message || 'Email gönderilemedi');
      }
    } catch (error: any) {
      if (error.response?.data?.message?.includes('saniye sonra')) {
        // Extract seconds from rate limit message
        const match = error.response.data.message.match(/(\d+) saniye/);
        if (match) {
          setResendCooldown(parseInt(match[1]));
        }
      }
      message.error(error.response?.data?.message || 'Email gönderilemedi');
    } finally {
      setIsResending(false);
    }
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="email-verification-container">
      <Card className="email-verification-card">
        {verificationStatus === 'pending' && (
          <div className="verification-loading">
            <Spin size="large" />
            <Title level={3}>Email Doğrulanıyor...</Title>
            <Paragraph>Lütfen bekleyin, email adresiniz doğrulanıyor.</Paragraph>
          </div>
        )}

        {verificationStatus === 'success' && (
          <Result
            status="success"
            icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            title="Email Başarıyla Doğrulandı!"
            subTitle="Hesabınız aktifleştirildi. Giriş sayfasına yönlendiriliyorsunuz..."
            extra={[
              <Button type="primary" key="login" onClick={handleGoToLogin}>
                Hemen Giriş Yap
              </Button>
            ]}
          />
        )}

        {verificationStatus === 'error' && (
          <Result
            status="error"
            icon={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
            title="Doğrulama Başarısız"
            subTitle={errorMessage}
            extra={[
              email && (
                <Button
                  key="resend"
                  type="primary"
                  icon={<MailOutlined />}
                  loading={isResending}
                  disabled={resendCooldown > 0}
                  onClick={handleResendEmail}
                >
                  {resendCooldown > 0 
                    ? `Tekrar Gönder (${resendCooldown}s)` 
                    : 'Doğrulama Emailini Tekrar Gönder'}
                </Button>
              ),
              <Button key="login" onClick={handleGoToLogin}>
                Giriş Sayfasına Git
              </Button>
            ]}
          />
        )}
      </Card>
    </div>
  );
};

export default EmailVerificationPage;