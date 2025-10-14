/**
 * Two-Factor Authentication Kurulum Component
 * Guides user through 2FA setup process
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Steps,
  Button,
  Input,
  Alert,
  Space,
  Typography,
  Card,
  Divider,
  List,
  Checkbox,
  Spin,
  message,
  Tooltip,
  Tag
} from 'antd';
import {
  QrcodeOutlined,
  KeyOutlined,
  SafetyOutlined,
  CheckCircleOutlined,
  CopyOutlined,
  İndirOutlined,
  LockOutlined,
  MobileOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { twoFactorService, ITwoFactorKurulum } from '../../services/twoFactorService';

const { Step } = Steps;
const { Text, Title, Paragraph } = Typography;

interface TwoFactorKurulumProps {
  visible: boolean;
  userEmail: string;
  onClose: () => void;
  onComplete: () => void;
}

export const TwoFactorKurulum: React.FC<TwoFactorKurulumProps> = ({
  visible,
  userEmail,
  onClose,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [setupData, setKurulumData] = useState<ITwoFactorKurulum | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [backupCodesConfirmed, setYedekCodesConfirmed] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30);

  // Generate setup data when modal opens
  useEffect(() => {
    if (visible && !setupData) {
      generateKurulum();
    }
  }, [visible]);

  // Update time remaining for TOTP
  useEffect(() => {
    if (visible && currentStep === 2) {
      const interval = setInterval(() => {
        const remaining = Math.floor(twoFactorService.getTimeRemaining());
        setTimeRemaining(remaining);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [visible, currentStep]);

  const generateKurulum = async () => {
    setLoading(true);
    try {
      const data = await twoFactorService.setupTwoFactor(userEmail);
      setKurulumData(data);
    } catch (error) {
      message.error('2FA kurulumu oluşturulamadı');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleSonraki = () => {
    if (currentStep === 2) {
      // Doğrula code before proceeding
      verifyAndEnable();
    } else if (currentStep === 3 && !backupCodesConfirmed) {
      message.warning('Lütfen yedek kodlarınızı kaydettiğinizi onaylayın');
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const verifyAndEnable = async () => {
    if (!setupData || !verificationCode) {
      message.error('Lütfen doğrulama kodunu girin');
      return;
    }

    setLoading(true);
    try {
      // Doğrula the code locally first
      const isValid = twoFactorService.verifyTOTP(verificationCode, setupData.secret);
      
      if (!isValid) {
        message.error('Geçersiz doğrulama kodu. Lütfen tekrar deneyin.');
        setVerificationCode('');
        return;
      }

      // Enable 2FA on server
      const success = await twoFactorService.enable2FA(
        setupData.secret,
        verificationCode,
        setupData.backupCodes
      );

      if (success) {
        setCurrentStep(3);
      } else {
        message.error('2FA etkinleştirilemedi. Lütfen tekrar deneyin.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    if (!backupCodesConfirmed) {
      message.warning('Lütfen yedek kodlarınızı kaydettiğinizi onaylayın');
      return;
    }

    message.success('İki faktörlü kimlik doğrulama başarıyla etkinleştirildi!');
    onComplete();
    resetState();
  };

  const resetState = () => {
    setCurrentStep(0);
    setKurulumData(null);
    setVerificationCode('');
    setPassword('');
    setYedekCodesConfirmed(false);
  };

  const copyToClipboard = (text: string, name: string) => {
    navigator.clipboard.writeText(text);
    message.success(`${name} panoya kopyalandı`);
  };

  const downloadYedekCodes = () => {
    if (!setupData) return;

    const content = `Stocker Admin - Yedek Kodlar
Generated: ${new Date().toISOString()}
Email: ${userEmail}

IMPORTANT: Keep these codes safe! Each code can only be used once.

${setupData.backupCodes.join('\n')}

If you lose access to your authenticator app, you can use one of these codes to sign in.`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'stocker-backup-codes.txt';
    link.click();
    URL.revokeObjectURL(url);
    
    message.success('Yedek kodlar indirildi');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div>
            <Alert
              message="Güvenliğinizi Artırın"
              description="İki faktörlü kimlik doğrulama, şifrenize ek olarak bir doğrulama kodu gerektirerek hesabınıza ekstra bir güvenlik katmanı ekler."
              type="info"
              showIcon
              icon={<SafetyOutlined />}
              style={{ marginBottom: 24 }}
            />
            
            <Title level={4}>Nasıl çalışır:</Title>
            <List
              dataSource={[
                'Telefonunuza bir authenticator uygulaması yükleyin (Google Authenticator, Authy, vb.)',
                'QR kodunu taratın veya kurulum anahtarını girin',
                'Doğrulamak için uygulamanızdaki 6 haneli kodu girin',
                'Yedek kodlarınızı güvenli bir yerde saklayın',
                'Giriş yaparken kod oluşturmak için uygulamayı kullanın'
              ]}
              renderItem={(item, index) => (
                <List.Item>
                  <Space>
                    <Tag color="blue">{index + 1}</Tag>
                    <Text>{item}</Text>
                  </Space>
                </List.Item>
              )}
            />

            <Alert
              message="Önerilen Uygulamalar"
              description={
                <Space direction="vertical">
                  <Text>• Google Authenticator (iOS/Android)</Text>
                  <Text>• Microsoft Authenticator (iOS/Android)</Text>
                  <Text>• Authy (iOS/Android/Desktop)</Text>
                  <Text>• 1Password (Paid)</Text>
                </Space>
              }
              type="success"
              style={{ marginTop: 16 }}
            />
          </div>
        );

      case 1:
        return (
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <Spin size="large" />
                <Text style={{ display: 'block', marginTop: 16 }}>
                  Generating secure setup...
                </Text>
              </div>
            ) : setupData ? (
              <>
                <Title level={4}>
                  <QrcodeOutlined /> QR Kodu Tarayın
                </Title>
                <Paragraph>
                  Authenticator uygulamanızı açın ve bu QR kodunu taratın:
                </Paragraph>
                
                <Card style={{ textAlign: 'center', marginBottom: 24 }}>
                  <img 
                    src={setupData.qrCodeUrl} 
                    alt="2FA QR Code" 
                    style={{ maxWidth: 256, margin: '0 auto' }}
                  />
                </Card>

                <Divider>OR</Divider>

                <Title level={4}>
                  <KeyOutlined /> Manuel Giriş
                </Title>
                <Paragraph>
                  Can't scan? Enter this key manually in your app:
                </Paragraph>
                
                <Card>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Text strong>Hesap: </Text>
                    <Input value={userEmail} readOnly />
                    
                    <Text strong>Anahtar: </Text>
                    <Input.Group compact>
                      <Input
                        value={setupData.manualEntryKey}
                        readOnly
                        style={{ width: 'calc(100% - 32px)', fontFamily: 'monospace' }}
                      />
                      <Tooltip title="Copy">
                        <Button
                          icon={<CopyOutlined />}
                          onClick={() => copyToClipboard(setupData.secret, 'Secret key')}
                        />
                      </Tooltip>
                    </Input.Group>
                    
                    <Text type="secondary">
                      Tip: Zaman tabanlı (TOTP) | Periyot: 30 saniye
                    </Text>
                  </Space>
                </Card>
              </>
            ) : null}
          </div>
        );

      case 2:
        return (
          <div>
            <Title level={4}>
              <MobileOutlined /> Kurulumu Doğrula
            </Title>
            <Paragraph>
              Kurulumu doğrulamak için authenticator uygulamanızdaki 6 haneli kodu girin:
            </Paragraph>

            <Card>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Input
                  size="large"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  style={{ 
                    fontSize: 24, 
                    textAlign: 'center', 
                    letterSpacing: 8,
                    fontFamily: 'monospace'
                  }}
                  prefix={<LockOutlined />}
                />
                
                <div style={{ textAlign: 'center' }}>
                  <Text type="secondary">
                    Kalan süre: {timeRemaining}s
                  </Text>
                </div>

                {verificationCode.length === 6 && (
                  <Alert
                    message="Kod girildi"
                    description="Kurulumu tamamlamak için 'Doğrula ve Etkinleştir'e tıklayın"
                    type="info"
                    showIcon
                  />
                )}
              </Space>
            </Card>

            <Alert
              message="Sorun Giderme"
              description={
                <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                  <li>Cihazınızın saatinin senkronize olduğundan emin olun</li>
                  <li>Doğru QR kodunu taradığınızı kontrol edin</li>
                  <li>Zamanlayıcı sıfırlandığında kodu girmeyi deneyin</li>
                </ul>
              }
              type="warning"
              style={{ marginTop: 16 }}
            />
          </div>
        );

      case 3:
        return (
          <div>
            <Alert
              message="Yedek Kodlarınızı Kaydedin!"
              description="Bu kodlar telefonunuzu kaybederseniz hesabınıza erişmek için kullanılabilir. Her kod yalnızca bir kez kullanılabilir."
              type="warning"
              showIcon
              icon={<WarningOutlined />}
              style={{ marginBottom: 24 }}
            />

            <Title level={4}>
              <SafetyOutlined /> Yedek Kodlar
            </Title>
            
            <Card>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(2, 1fr)', 
                  gap: 8,
                  fontFamily: 'monospace',
                  fontSize: 14
                }}>
                  {setupData?.backupCodes.map((code, index) => (
                    <div key={index} style={{ 
                      padding: '8px 12px',
                      background: '#f5f5f5',
                      borderRadius: 4,
                      textAlign: 'center'
                    }}>
                      {code}
                    </div>
                  ))}
                </div>

                <Space style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}>
                  <Button
                    icon={<CopyOutlined />}
                    onClick={() => copyToClipboard(
                      setupData?.backupCodes.join('\n') || '',
                      'Yedek codes'
                    )}
                  >
                    Tümünü Kopyala
                  </Button>
                  <Button
                    icon={<İndirOutlined />}
                    onClick={downloadYedekCodes}
                  >
                    İndir
                  </Button>
                </Space>
              </Space>
            </Card>

            <Checkbox
              checked={backupCodesConfirmed}
              onChange={(e) => setYedekCodesConfirmed(e.target.checked)}
              style={{ marginTop: 24 }}
            >
              <Text strong>
                Yedek kodlarımı güvenli bir yerde kaydettim
              </Text>
            </Checkbox>

            {backupCodesConfirmed && (
              <Alert
                message="Kurulum Tamamlandı!"
                description="İki faktörlü kimlik doğrulama artık hesabınız için etkinleştirildi."
                type="success"
                showIcon
                icon={<CheckCircleOutlined />}
                style={{ marginTop: 16 }}
              />
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      title="İki Faktörlü Kimlik Doğrulamayı Kur"
      visible={visible}
      onCancel={onClose}
      width={600}
      footer={null}
      maskClosable={false}
    >
      <Steps current={currentStep} style={{ marginBottom: 32 }}>
        <Step title="Giriş" icon={<SafetyOutlined />} />
        <Step title="Kurulum" icon={<QrcodeOutlined />} />
        <Step title="Doğrula" icon={<MobileOutlined />} />
        <Step title="Yedek" icon={<KeyOutlined />} />
      </Steps>

      <div style={{ minHeight: 400 }}>
        {renderStepContent()}
      </div>

      <div style={{ marginTop: 24, textAlign: 'right' }}>
        <Space>
          {currentStep > 0 && currentStep < 3 && (
            <Button onClick={handlePrev}>
              Önceki
            </Button>
          )}
          
          {currentStep < 2 && (
            <Button type="primary" onClick={handleSonraki}>
              Sonraki
            </Button>
          )}
          
          {currentStep === 2 && (
            <Button 
              type="primary" 
              onClick={handleSonraki}
              loading={loading}
              disabled={verificationCode.length !== 6}
            >
              Doğrula & Enable
            </Button>
          )}
          
          {currentStep === 3 && (
            <Button 
              type="primary" 
              onClick={handleComplete}
              disabled={!backupCodesConfirmed}
            >
              Complete Kurulum
            </Button>
          )}
        </Space>
      </div>
    </Modal>
  );
};