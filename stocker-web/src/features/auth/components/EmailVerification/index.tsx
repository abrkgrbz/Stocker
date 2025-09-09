import React, { useState, useEffect } from 'react';
import {
  Modal,
  Result,
  Button,
  Input,
  Space,
  Typography,
  Alert,
  Progress,
  message,
  Spin
} from 'antd';
import {
  MailOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  SendOutlined,
  ClockCircleOutlined,
  SafetyOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import './style.css';

const { Title, Text, Paragraph } = Typography;

interface EmailVerificationProps {
  email: string;
  onVerified: () => void;
  onResend?: () => Promise<void>;
  autoSend?: boolean;
}

export const EmailVerification: React.FC<EmailVerificationProps> = ({
  email,
  onVerified,
  onResend,
  autoSend = true
}) => {
  const [status, setStatus] = useState<'pending' | 'sent' | 'verified' | 'expired'>('pending');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 5;

  useEffect(() => {
    if (autoSend && status === 'pending') {
      sendVerificationEmail();
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const sendVerificationEmail = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setStatus('sent');
      setResendTimer(60); // 60 seconds cooldown
      message.success(`Doğrulama e-postası ${email} adresine gönderildi`);
    } catch (error) {
      message.error('E-posta gönderilemedi. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    
    setAttempts(prev => prev + 1);
    
    if (attempts >= maxAttempts) {
      message.error('Çok fazla deneme yaptınız. Lütfen daha sonra tekrar deneyin.');
      return;
    }
    
    if (onResend) {
      await onResend();
    } else {
      await sendVerificationEmail();
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      message.error('Lütfen 6 haneli doğrulama kodunu girin');
      return;
    }

    setLoading(true);
    try {
      // Simulate verification
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock verification - in real app, check with backend
      if (verificationCode === '123456') {
        setStatus('verified');
        message.success('E-posta adresiniz başarıyla doğrulandı!');
        setTimeout(() => {
          onVerified();
        }, 2000);
      } else {
        message.error('Doğrulama kodu hatalı');
      }
    } catch (error) {
      message.error('Doğrulama başarısız');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'pending':
        return (
          <div className="email-verification-content">
            <Spin size="large" />
            <Title level={4} style={{ marginTop: 24 }}>
              E-posta Gönderiliyor...
            </Title>
          </div>
        );

      case 'sent':
        return (
          <motion.div
            className="email-verification-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="email-icon-container">
              <MailOutlined style={{ fontSize: 64, color: '#667eea' }} />
            </div>

            <Title level={3}>E-posta Doğrulama</Title>
            
            <Paragraph style={{ textAlign: 'center', marginBottom: 24 }}>
              <Text>{email}</Text> adresine bir doğrulama kodu gönderdik.
              <br />
              Lütfen e-postanızı kontrol edin ve 6 haneli kodu girin.
            </Paragraph>

            <div className="verification-code-input">
              <Input
                size="large"
                placeholder="000000"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                onPressEnter={handleVerifyCode}
                style={{
                  fontSize: 24,
                  textAlign: 'center',
                  letterSpacing: 8,
                  fontWeight: 600
                }}
              />
            </div>

            <Space direction="vertical" style={{ width: '100%', marginTop: 24 }}>
              <Button
                type="primary"
                size="large"
                block
                loading={loading}
                onClick={handleVerifyCode}
                disabled={verificationCode.length !== 6}
                icon={<CheckCircleOutlined />}
              >
                Doğrula
              </Button>

              <Button
                size="large"
                block
                onClick={handleResend}
                disabled={resendTimer > 0}
                icon={<ReloadOutlined />}
              >
                {resendTimer > 0 
                  ? `Tekrar gönder (${resendTimer}s)` 
                  : 'Kodu Tekrar Gönder'}
              </Button>
            </Space>

            {attempts > 0 && (
              <Alert
                message={`${maxAttempts - attempts} deneme hakkınız kaldı`}
                type="warning"
                showIcon
                style={{ marginTop: 16 }}
              />
            )}

            <div className="email-tips">
              <Text type="secondary" style={{ fontSize: 12 }}>
                <SafetyOutlined /> E-posta gelmedi mi? Spam klasörünü kontrol edin.
              </Text>
            </div>
          </motion.div>
        );

      case 'verified':
        return (
          <motion.div
            className="email-verification-content"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Result
              status="success"
              title="E-posta Doğrulandı!"
              subTitle="E-posta adresiniz başarıyla doğrulandı. Yönlendiriliyorsunuz..."
              icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            />
          </motion.div>
        );

      case 'expired':
        return (
          <motion.div
            className="email-verification-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Result
              status="warning"
              title="Doğrulama Süresi Doldu"
              subTitle="Doğrulama kodunuzun süresi doldu. Lütfen yeni bir kod isteyin."
              icon={<ClockCircleOutlined />}
              extra={[
                <Button
                  type="primary"
                  key="resend"
                  onClick={handleResend}
                  icon={<SendOutlined />}
                >
                  Yeni Kod Gönder
                </Button>
              ]}
            />
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="email-verification-container">
      <AnimatePresence mode="wait">
        {renderContent()}
      </AnimatePresence>
    </div>
  );
};

// Email Verification Modal Component
interface EmailVerificationModalProps {
  visible: boolean;
  email: string;
  onClose: () => void;
  onVerified: () => void;
}

export const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
  visible,
  email,
  onClose,
  onVerified
}) => {
  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={500}
      centered
      className="email-verification-modal"
      closeIcon={null}
      maskClosable={false}
    >
      <EmailVerification
        email={email}
        onVerified={() => {
          onVerified();
          onClose();
        }}
      />
    </Modal>
  );
};

// Inline Email Verification Component
interface InlineEmailVerificationProps {
  email: string;
  onVerified: () => void;
}

export const InlineEmailVerification: React.FC<InlineEmailVerificationProps> = ({
  email,
  onVerified
}) => {
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSent(true);
      message.success('Doğrulama kodu gönderildi');
    } catch (error) {
      message.error('Kod gönderilemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (code.length !== 6) return;
    
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('E-posta doğrulandı!');
      onVerified();
    } catch (error) {
      message.error('Doğrulama başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inline-email-verification">
      <Alert
        message="E-posta Doğrulama Gerekli"
        description={`${email} adresini doğrulamanız gerekiyor`}
        type="warning"
        showIcon
        action={
          !sent ? (
            <Button
              size="small"
              type="primary"
              loading={loading}
              onClick={handleSend}
            >
              Kod Gönder
            </Button>
          ) : (
            <Space>
              <Input
                size="small"
                placeholder="6 haneli kod"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                style={{ width: 120 }}
              />
              <Button
                size="small"
                type="primary"
                loading={loading}
                onClick={handleVerify}
                disabled={code.length !== 6}
              >
                Doğrula
              </Button>
            </Space>
          )
        }
      />
    </div>
  );
};