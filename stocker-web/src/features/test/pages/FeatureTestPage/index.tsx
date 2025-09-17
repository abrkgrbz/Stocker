import React, { useState } from 'react';
import {
  Card,
  Tabs,
  Button,
  Space,
  Typography,
  Divider,
  Alert,
  Form,
  Input,
  Switch,
  Badge,
  message,
  Modal,
  Row,
  Col,
  Collapse,
  Tag
} from 'antd';
import {
  SafetyOutlined,
  LockOutlined,
  MailOutlined,
  GiftOutlined,
  MessageOutlined,
  GlobalOutlined,
  RocketOutlined,
  MobileOutlined,
  CheckCircleOutlined,
  BugOutlined,
  ExperimentOutlined,
  SettingOutlined
} from '@ant-design/icons';

// Import all features
import { Captcha, CaptchaV3 } from '@/features/auth/components/Captcha';
import { useRateLimit, useBruteForceProtection } from '@/features/auth/hooks/useRateLimit';
import { TwoFactorSetup, TwoFactorVerify } from '@/features/auth/components/TwoFactorAuth';
import { EmailVerification, EmailVerificationModal } from '@/features/auth/components/EmailVerification';
import { useFormAutoSave, useAutoSaveStatus } from '@/features/auth/hooks/useFormAutoSave';
import { FormProgress, CircularProgress } from '@/features/auth/components/FormProgress';
import { SocialLogin, QuickSocialLogin } from '@/features/auth/components/SocialLogin';
import { ReferralInput, ReferralShare, ReferralStats } from '@/features/auth/components/ReferralCode';
import { LiveChat } from '@/features/support/components/LiveChat';
// import { useTranslation } from '@/features/i18n';
import { OnboardingTour, OnboardingChecklist } from '@/features/onboarding/components/OnboardingTour';
import { usePWAInstall, useOfflineDetection } from '@/features/pwa/serviceWorkerRegistration';
import { useBiometricAuth } from '@/features/auth/services/biometric';
import { analytics } from '@/features/auth/services/analytics';
import { useLazyLoad, useLazyImage } from '@/features/auth/hooks/useLazyLoad';
import { useOptimisticUI } from '@/features/auth/hooks/useOptimisticUI';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;

const FeatureTestPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('security');
  // const { t, changeLanguage, currentLanguage } = useTranslation();
  const t = (key: string) => key; // Mock translation
  const changeLanguage = (lang: string) => {}; // Mock language change
  const currentLanguage = 'tr';
  
  // Test states
  const [show2FA, setShow2FA] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [startTour, setStartTour] = useState(false);
  
  // Form data for auto-save test
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: ''
  });

  // Hooks
  const { checkLimit, isBlocked, remainingAttempts } = useRateLimit({
    maxAttempts: 5,
    windowMs: 60000,
    storageKey: 'test_rate_limit'
  });
  
  const { saveData, restoreData, lastSaveTime, isSaving } = useFormAutoSave(formData, {
    storageKey: 'test_form_autosave',
    debounceMs: 1000
  });
  
  const autoSaveStatus = useAutoSaveStatus(lastSaveTime, isSaving);
  
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const isOnline = useOfflineDetection();
  
  const { isAvailable: biometricAvailable, register: registerBiometric, authenticate: authenticateBiometric } = useBiometricAuth();
  
  const { data: optimisticData, applyOptimisticUpdate, rollback } = useOptimisticUI({ count: 0 });

  // Test functions
  const testRateLimit = () => {
    if (checkLimit()) {
      message.success(`İstek gönderildi! Kalan deneme: ${remainingAttempts}`);
    }
  };

  const testAnalytics = () => {
    analytics.track('test_event', {
      feature: 'analytics',
      action: 'button_click'
    });
    message.success('Analytics event gönderildi! (Console\'u kontrol edin)');
  };

  const testOptimisticUI = () => {
    applyOptimisticUpdate((current: any) => ({
      ...current,
      count: current.count + 1
    }));
    message.info(`Optimistic update: ${optimisticData.count + 1}`);
    
    // Simulate rollback after 2 seconds
    setTimeout(() => {
      rollback();
      message.warning('Update rolled back!');
    }, 2000);
  };

  const testBiometric = async () => {
    if (!biometricAvailable) {
      message.error('Biometric authentication mevcut değil!');
      return;
    }
    
    try {
      await registerBiometric('test-user', 'test@example.com');
      message.success('Biometric kaydedildi!');
      
      const result = await authenticateBiometric();
      if (result?.verified) {
        message.success('Biometric doğrulama başarılı!');
      }
    } catch (error) {
      message.error('Biometric test başarısız!');
    }
  };

  // Tour steps
  const tourSteps = [
    {
      target: '.test-security-tab',
      title: 'Güvenlik Özellikleri',
      content: 'Bu sekmede güvenlik özelliklerini test edebilirsiniz.'
    },
    {
      target: '.test-ux-tab',
      title: 'UX İyileştirmeleri',
      content: 'Kullanıcı deneyimi özelliklerini buradan test edin.'
    },
    {
      target: '.test-performance-tab',
      title: 'Performans',
      content: 'Performans optimizasyonlarını test edin.'
    }
  ];

  // Checklist items
  const checklistItems = [
    { id: '1', title: 'CAPTCHA Test Et', completed: false, required: true },
    { id: '2', title: '2FA Kur', completed: false, required: true },
    { id: '3', title: 'E-posta Doğrula', completed: false },
    { id: '4', title: 'Sosyal Giriş Dene', completed: false },
    { id: '5', title: 'PWA Yükle', completed: false }
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <Card>
        <div style={{ marginBottom: 24 }}>
          <Title level={2}>
            <ExperimentOutlined /> Feature Test Dashboard
          </Title>
          <Paragraph>
            Tüm eklenen özellikleri bu sayfadan test edebilirsiniz.
          </Paragraph>
          
          {/* Status Badges */}
          <Space wrap style={{ marginTop: 16 }}>
            <Badge status={isOnline ? 'success' : 'error'} text={isOnline ? 'Online' : 'Offline'} />
            <Badge status={isInstalled ? 'success' : 'default'} text={isInstalled ? 'PWA Yüklü' : 'PWA Yüklenmemiş'} />
            <Badge status={biometricAvailable ? 'success' : 'error'} text={biometricAvailable ? 'Biometric Mevcut' : 'Biometric Yok'} />
            <Tag color="blue">Dil: {currentLanguage.toUpperCase()}</Tag>
          </Space>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {/* Security Features */}
          <TabPane 
            tab={<span className="test-security-tab"><SafetyOutlined /> Güvenlik</span>} 
            key="security"
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card title="🔐 CAPTCHA / reCAPTCHA" size="small">
                  <Alert
                    message="Not: reCAPTCHA için geçerli site key gerekli"
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                  <Captcha
                    siteKey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" // Test key
                    onVerify={(token) => message.success(`Token: ${token.substring(0, 20)}...`)}
                    onError={() => message.error('CAPTCHA doğrulanamadı')}
                  />
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card title="⚡ Rate Limiting" size="small">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Alert
                      message={`Kalan deneme: ${remainingAttempts}/5`}
                      type={isBlocked ? 'error' : 'warning'}
                    />
                    <Button 
                      onClick={testRateLimit}
                      disabled={isBlocked}
                      type="primary"
                    >
                      Test Rate Limit
                    </Button>
                    {isBlocked && <Text type="danger">Çok fazla deneme! Bekleyin...</Text>}
                  </Space>
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card title="🔑 Two-Factor Authentication" size="small">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Button onClick={() => setShow2FA(true)} type="primary">
                      2FA Kurulumu Başlat
                    </Button>
                    <Text type="secondary">Authenticator app veya SMS ile</Text>
                  </Space>
                  <TwoFactorSetup
                    visible={show2FA}
                    onClose={() => setShow2FA(false)}
                    onComplete={(method, data) => {
                      message.success(`2FA etkinleştirildi: ${method}`);
                      setShow2FA(false);
                    }}
                    userEmail="test@example.com"
                    userPhone="+90 555 123 4567"
                  />
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card title="✉️ E-posta Doğrulama" size="small">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Button onClick={() => setShowEmailVerification(true)} type="primary">
                      E-posta Doğrulama Test
                    </Button>
                    <Text type="secondary">Test kodu: 123456</Text>
                  </Space>
                  <EmailVerificationModal
                    visible={showEmailVerification}
                    email="test@example.com"
                    onClose={() => setShowEmailVerification(false)}
                    onVerified={() => {
                      message.success('E-posta doğrulandı!');
                      setShowEmailVerification(false);
                    }}
                  />
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card title="🔒 Biometric Authentication" size="small">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Button 
                      onClick={testBiometric}
                      disabled={!biometricAvailable}
                      type="primary"
                    >
                      Test Biometric (Touch ID/Face ID)
                    </Button>
                    {!biometricAvailable && (
                      <Alert message="Cihazınız biometric desteklemiyor" type="warning" />
                    )}
                  </Space>
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* UX Features */}
          <TabPane 
            tab={<span className="test-ux-tab"><RocketOutlined /> UX Özellikleri</span>} 
            key="ux"
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card title="💾 Form Auto-Save" size="small">
                  <Form layout="vertical">
                    <Form.Item label="Ad Soyad">
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Test için yazın..."
                      />
                    </Form.Item>
                    <Form.Item label="E-posta">
                      <Input
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="Otomatik kaydedilecek..."
                      />
                    </Form.Item>
                  </Form>
                  <Text type="secondary">{autoSaveStatus}</Text>
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card title="📊 Form Progress" size="small">
                  <FormProgress
                    fields={[
                      { name: 'name', label: 'Ad', value: formData.name, required: true },
                      { name: 'email', label: 'E-posta', value: formData.email, required: true },
                      { name: 'phone', label: 'Telefon', value: formData.phone },
                      { name: 'company', label: 'Şirket', value: formData.company }
                    ]}
                    showDetails={true}
                  />
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card title="🌐 Social Login" size="small">
                  <SocialLogin
                    providers={['google', 'microsoft', 'linkedin']}
                    layout="vertical"
                    size="middle"
                    onSuccess={(provider, data) => message.success(`${provider} login simulated`)}
                    onError={(provider, error) => message.error(`${provider} login failed`)}
                  />
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card title="🎁 Referral System" size="small">
                  <ReferralInput
                    placeholder="WELCOME20 veya FRIEND50 deneyin"
                    onValidate={async (code) => {
                      message.success(`Referans kodu geçerli: ${code}`);
                      return null;
                    }}
                  />
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card title="💬 Live Chat" size="small">
                  <Button onClick={() => setShowLiveChat(!showLiveChat)} type="primary">
                    {showLiveChat ? 'Chat Kapat' : 'Chat Aç'}
                  </Button>
                  {showLiveChat && <LiveChat position="bottom-right" />}
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card title="🌍 Multi-Language" size="small">
                  <Space>
                    <Button onClick={() => changeLanguage('tr')} type={currentLanguage === 'tr' ? 'primary' : 'default'}>
                      🇹🇷 Türkçe
                    </Button>
                    <Button onClick={() => changeLanguage('en')} type={currentLanguage === 'en' ? 'primary' : 'default'}>
                      🇬🇧 English
                    </Button>
                  </Space>
                  <Divider />
                  <Text>{t('common.welcome')}</Text>
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* Performance Features */}
          <TabPane 
            tab={<span className="test-performance-tab"><SettingOutlined /> Performans</span>} 
            key="performance"
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card title="🚀 Lazy Loading" size="small">
                  <Text>Scroll yaparak lazy loading test edin</Text>
                  <div style={{ height: 200, overflow: 'auto', border: '1px solid #f0f0f0', marginTop: 16 }}>
                    <div style={{ height: 500, padding: 16 }}>
                      <LazyLoadedComponent />
                    </div>
                  </div>
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card title="⚡ Optimistic UI" size="small">
                  <Space direction="vertical">
                    <Text>Count: {optimisticData.count}</Text>
                    <Button onClick={testOptimisticUI} type="primary">
                      Test Optimistic Update
                    </Button>
                    <Text type="secondary">2 saniye sonra rollback olacak</Text>
                  </Space>
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card title="📈 Analytics" size="small">
                  <Button onClick={testAnalytics} type="primary">
                    Send Analytics Event
                  </Button>
                  <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                    Console'u kontrol edin
                  </Text>
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card title="📱 PWA Support" size="small">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {isInstallable && (
                      <Button onClick={install} type="primary">
                        PWA Olarak Yükle
                      </Button>
                    )}
                    {isInstalled && (
                      <Alert message="PWA yüklü!" type="success" />
                    )}
                    {!isInstallable && !isInstalled && (
                      <Alert message="PWA yüklenemez (HTTPS gerekli)" type="warning" />
                    )}
                  </Space>
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* Onboarding */}
          <TabPane tab={<span><BugOutlined /> Onboarding</span>} key="onboarding">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card title="🎯 Onboarding Tour" size="small">
                  <Button 
                    onClick={() => setStartTour(true)} 
                    type="primary"
                  >
                    Turu Başlat
                  </Button>
                  {startTour && (
                    <OnboardingTour
                      steps={tourSteps}
                      autoStart={true}
                      onComplete={() => {
                        message.success('Tur tamamlandı!');
                        setStartTour(false);
                      }}
                      onSkip={() => setStartTour(false)}
                    />
                  )}
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <OnboardingChecklist
                  items={checklistItems}
                  onItemComplete={(id) => message.success(`Görev ${id} tamamlandı!`)}
                />
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Card>

      {/* Quick Test Panel */}
      <Card style={{ marginTop: 24 }}>
        <Title level={4}>Hızlı Test Paneli</Title>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Alert
            message="Test Bilgileri"
            description={
              <ul>
                <li>CAPTCHA Test Key: 6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI</li>
                <li>E-posta Doğrulama Kodu: 123456</li>
                <li>Referans Kodları: WELCOME20, FRIEND50</li>
                <li>Rate Limit: 5 deneme / dakika</li>
              </ul>
            }
            type="info"
            showIcon
          />
          <Divider />
          <Title level={5}>Diğer Test Sayfaları</Title>
          <Space wrap>
            <Button type="primary" onClick={() => window.location.href = '/test-wizard'}>
              Register Wizard Test
            </Button>
            <Button onClick={() => window.location.href = '/signalr-test'}>
              SignalR Test
            </Button>
            <Button onClick={() => window.location.href = '/test-sweetalert'}>
              SweetAlert Test
            </Button>
          </Space>
        </Space>
      </Card>
    </div>
  );
};

// Lazy loaded component for testing
const LazyLoadedComponent: React.FC = () => {
  const { ref, isLoaded } = useLazyLoad({ threshold: 0.1 });
  
  return (
    <div ref={ref as any} style={{ marginTop: 400 }}>
      {isLoaded ? (
        <Alert message="Component yüklendi!" type="success" />
      ) : (
        <Text>Scroll yapın...</Text>
      )}
    </div>
  );
};

// Default export
export default FeatureTestPage;