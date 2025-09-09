import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  Input,
  Button,
  Space,
  Typography,
  Alert,
  Tabs,
  QRCode,
  message,
  Spin,
  Divider,
  Steps
} from 'antd';
import {
  MobileOutlined,
  MailOutlined,
  SafetyOutlined,
  KeyOutlined,
  CheckCircleOutlined,
  CopyOutlined,
  ReloadOutlined,
  QrcodeOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import './style.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Step } = Steps;

interface TwoFactorSetupProps {
  visible: boolean;
  onClose: () => void;
  onComplete: (method: string, data: any) => void;
  userEmail?: string;
  userPhone?: string;
}

export const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({
  visible,
  onClose,
  onComplete,
  userEmail,
  userPhone
}) => {
  const [activeTab, setActiveTab] = useState('authenticator');
  const [currentStep, setCurrentStep] = useState(0);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && activeTab === 'authenticator') {
      generateAuthenticatorSetup();
    }
  }, [visible, activeTab]);

  const generateAuthenticatorSetup = async () => {
    setLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        const secret = generateRandomSecret();
        const otpUrl = `otpauth://totp/Stocker:${userEmail}?secret=${secret}&issuer=Stocker`;
        setSecretKey(secret);
        setQrCodeUrl(otpUrl);
        setLoading(false);
      }, 1000);
    } catch (error) {
      message.error('2FA kurulumu başlatılamadı');
      setLoading(false);
    }
  };

  const generateRandomSecret = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars[Math.floor(Math.random() * chars.length)];
    }
    return secret;
  };

  const generateBackupCodes = () => {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  };

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      message.error('Lütfen 6 haneli kodu girin');
      return;
    }

    setLoading(true);
    try {
      // Simulate verification
      setTimeout(() => {
        const codes = generateBackupCodes();
        setBackupCodes(codes);
        setCurrentStep(2);
        message.success('2FA başarıyla etkinleştirildi!');
        setLoading(false);
      }, 1500);
    } catch (error) {
      message.error('Doğrulama kodu hatalı');
      setLoading(false);
    }
  };

  const handleSMSSetup = async () => {
    setLoading(true);
    try {
      // Send SMS code
      setTimeout(() => {
        message.success('Doğrulama kodu SMS olarak gönderildi');
        setCurrentStep(1);
        setLoading(false);
      }, 1500);
    } catch (error) {
      message.error('SMS gönderilemedi');
      setLoading(false);
    }
  };

  const handleEmailSetup = async () => {
    setLoading(true);
    try {
      // Send email code
      setTimeout(() => {
        message.success('Doğrulama kodu e-posta adresinize gönderildi');
        setCurrentStep(1);
        setLoading(false);
      }, 1500);
    } catch (error) {
      message.error('E-posta gönderilemedi');
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success('Kopyalandı!');
  };

  const downloadBackupCodes = () => {
    const content = backupCodes.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stocker-backup-codes.txt';
    a.click();
  };

  const renderAuthenticatorSetup = () => (
    <div className="twofa-setup-content">
      <Steps current={currentStep} style={{ marginBottom: 32 }}>
        <Step title="QR Kod" icon={<QrcodeOutlined />} />
        <Step title="Doğrula" icon={<SafetyOutlined />} />
        <Step title="Yedek Kodlar" icon={<KeyOutlined />} />
      </Steps>

      {currentStep === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Alert
            message="Authenticator Uygulaması Kurulumu"
            description="Google Authenticator veya Microsoft Authenticator uygulamasını kullanarak QR kodu tarayın"
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <div className="qr-code-container">
            {loading ? (
              <Spin size="large" />
            ) : (
              <QRCode value={qrCodeUrl} size={200} />
            )}
          </div>

          <Divider>veya manuel olarak girin</Divider>

          <div className="secret-key-container">
            <Text strong>Gizli Anahtar:</Text>
            <div className="secret-key-box">
              <Text code className="secret-key">{secretKey}</Text>
              <Button
                icon={<CopyOutlined />}
                onClick={() => copyToClipboard(secretKey)}
                size="small"
              >
                Kopyala
              </Button>
            </div>
          </div>

          <Button
            type="primary"
            block
            size="large"
            onClick={() => setCurrentStep(1)}
            style={{ marginTop: 24 }}
          >
            Devam Et
          </Button>
        </motion.div>
      )}

      {currentStep === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Alert
            message="Doğrulama Kodu"
            description="Authenticator uygulamanızda görünen 6 haneli kodu girin"
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <div className="verification-input">
            <Input
              size="large"
              placeholder="000000"
              maxLength={6}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
              style={{
                fontSize: 24,
                textAlign: 'center',
                letterSpacing: 8,
                fontWeight: 600
              }}
            />
          </div>

          <Space style={{ width: '100%', marginTop: 24 }} direction="vertical">
            <Button
              type="primary"
              block
              size="large"
              loading={loading}
              onClick={handleVerifyCode}
              disabled={verificationCode.length !== 6}
            >
              Doğrula ve Etkinleştir
            </Button>
            <Button
              block
              size="large"
              onClick={() => setCurrentStep(0)}
            >
              Geri
            </Button>
          </Space>
        </motion.div>
      )}

      {currentStep === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="success-icon">
            <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a' }} />
          </div>

          <Title level={3} style={{ textAlign: 'center', marginTop: 24 }}>
            2FA Başarıyla Etkinleştirildi!
          </Title>

          <Alert
            message="Yedek Kodlarınız"
            description="Bu kodları güvenli bir yerde saklayın. Telefonunuzu kaybederseniz bu kodlarla giriş yapabilirsiniz."
            type="warning"
            showIcon
            style={{ marginTop: 24, marginBottom: 16 }}
          />

          <div className="backup-codes-grid">
            {backupCodes.map((code, index) => (
              <div key={index} className="backup-code">
                <Text code>{code}</Text>
              </div>
            ))}
          </div>

          <Space style={{ width: '100%', marginTop: 24 }} direction="vertical">
            <Button
              type="primary"
              block
              size="large"
              icon={<CopyOutlined />}
              onClick={() => copyToClipboard(backupCodes.join('\n'))}
            >
              Tümünü Kopyala
            </Button>
            <Button
              block
              size="large"
              onClick={downloadBackupCodes}
            >
              İndir (.txt)
            </Button>
            <Button
              type="primary"
              block
              size="large"
              onClick={() => onComplete('authenticator', { secretKey, backupCodes })}
            >
              Tamamla
            </Button>
          </Space>
        </motion.div>
      )}
    </div>
  );

  const renderSMSSetup = () => (
    <div className="twofa-setup-content">
      {currentStep === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Alert
            message="SMS ile 2FA"
            description="Her girişte telefonunuza SMS ile doğrulama kodu gönderilecek"
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <div className="phone-input-container">
            <Text strong>Telefon Numarası:</Text>
            <Input
              size="large"
              prefix={<MobileOutlined />}
              value={userPhone || '+90 5XX XXX XX XX'}
              disabled
              style={{ marginTop: 8 }}
            />
          </div>

          <Button
            type="primary"
            block
            size="large"
            loading={loading}
            onClick={handleSMSSetup}
            style={{ marginTop: 24 }}
            icon={<MobileOutlined />}
          >
            SMS Kodu Gönder
          </Button>
        </motion.div>
      )}

      {currentStep === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Alert
            message="SMS Doğrulama"
            description={`${userPhone} numarasına gönderilen 6 haneli kodu girin`}
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <div className="verification-input">
            <Input
              size="large"
              placeholder="000000"
              maxLength={6}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
              style={{
                fontSize: 24,
                textAlign: 'center',
                letterSpacing: 8,
                fontWeight: 600
              }}
            />
          </div>

          <Space style={{ width: '100%', marginTop: 24 }} direction="vertical">
            <Button
              type="primary"
              block
              size="large"
              loading={loading}
              onClick={() => {
                message.success('SMS 2FA etkinleştirildi!');
                onComplete('sms', { phone: userPhone });
              }}
              disabled={verificationCode.length !== 6}
            >
              Doğrula ve Etkinleştir
            </Button>
            <Button
              block
              onClick={() => handleSMSSetup()}
              icon={<ReloadOutlined />}
            >
              Tekrar Gönder
            </Button>
          </Space>
        </motion.div>
      )}
    </div>
  );

  return (
    <Modal
      title={
        <Space>
          <SafetyOutlined />
          <span>İki Faktörlü Kimlik Doğrulama (2FA)</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      centered
      className="twofa-modal"
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane
          tab={
            <Space>
              <KeyOutlined />
              <span>Authenticator App</span>
            </Space>
          }
          key="authenticator"
        >
          {renderAuthenticatorSetup()}
        </TabPane>
        <TabPane
          tab={
            <Space>
              <MobileOutlined />
              <span>SMS</span>
            </Space>
          }
          key="sms"
        >
          {renderSMSSetup()}
        </TabPane>
        <TabPane
          tab={
            <Space>
              <MailOutlined />
              <span>E-posta</span>
            </Space>
          }
          key="email"
          disabled
        >
          <Alert
            message="Yakında"
            description="E-posta ile 2FA özelliği yakında eklenecek"
            type="info"
            showIcon
          />
        </TabPane>
      </Tabs>
    </Modal>
  );
};

// 2FA Verification Component for Login
interface TwoFactorVerifyProps {
  visible: boolean;
  method: 'authenticator' | 'sms' | 'email';
  onVerify: (code: string) => void;
  onCancel: () => void;
  onResend?: () => void;
}

export const TwoFactorVerify: React.FC<TwoFactorVerifyProps> = ({
  visible,
  method,
  onVerify,
  onCancel,
  onResend
}) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(Input | null)[]>([]);

  const handleSubmit = () => {
    if (code.length === 6) {
      setLoading(true);
      onVerify(code);
    }
  };

  return (
    <Modal
      title="İki Faktörlü Doğrulama"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={400}
      centered
      className="twofa-verify-modal"
    >
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <SafetyOutlined style={{ fontSize: 48, color: '#667eea', marginBottom: 20 }} />
        
        <Paragraph>
          {method === 'authenticator' && 'Authenticator uygulamanızdaki 6 haneli kodu girin'}
          {method === 'sms' && 'Telefonunuza gönderilen 6 haneli kodu girin'}
          {method === 'email' && 'E-posta adresinize gönderilen 6 haneli kodu girin'}
        </Paragraph>

        <Input
          size="large"
          placeholder="000000"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          onPressEnter={handleSubmit}
          style={{
            fontSize: 24,
            textAlign: 'center',
            letterSpacing: 8,
            fontWeight: 600,
            marginBottom: 24
          }}
        />

        <Space direction="vertical" style={{ width: '100%' }}>
          <Button
            type="primary"
            block
            size="large"
            loading={loading}
            onClick={handleSubmit}
            disabled={code.length !== 6}
          >
            Doğrula
          </Button>
          
          {method === 'sms' && onResend && (
            <Button
              type="link"
              onClick={onResend}
            >
              Kodu Tekrar Gönder
            </Button>
          )}
        </Space>
      </div>
    </Modal>
  );
};