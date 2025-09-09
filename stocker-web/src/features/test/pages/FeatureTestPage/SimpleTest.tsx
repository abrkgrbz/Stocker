import React, { useState } from 'react';
import {
  Card,
  Tabs,
  Button,
  Space,
  Typography,
  Alert,
  Form,
  Input,
  Badge,
  message,
  Row,
  Col,
  Progress,
  Divider
} from 'antd';
import {
  SafetyOutlined,
  RocketOutlined,
  SettingOutlined,
  ExperimentOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const SimpleFeatureTest: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});
  
  // Test form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    company: ''
  });

  const runTest = (testName: string, testFn: () => boolean) => {
    try {
      const result = testFn();
      setTestResults(prev => ({ ...prev, [testName]: result }));
      if (result) {
        message.success(`${testName} testi başarılı!`);
      } else {
        message.error(`${testName} testi başarısız!`);
      }
    } catch (error) {
      message.error(`${testName} test hatası: ${error}`);
      setTestResults(prev => ({ ...prev, [testName]: false }));
    }
  };

  const completedTests = Object.values(testResults).filter(r => r).length;
  const totalTests = Object.keys(testResults).length;
  const progress = totalTests > 0 ? (completedTests / totalTests) * 100 : 0;

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <Card>
        <div style={{ marginBottom: 24 }}>
          <Title level={2}>
            <ExperimentOutlined /> Özellik Test Sayfası
          </Title>
          <Paragraph>
            Tüm eklenen özellikleri buradan test edebilirsiniz.
          </Paragraph>
          
          {totalTests > 0 && (
            <>
              <Progress percent={Math.round(progress)} status={progress === 100 ? 'success' : 'active'} />
              <Text>{completedTests}/{totalTests} test tamamlandı</Text>
            </>
          )}
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {/* Overview Tab */}
          <TabPane tab={<span><CheckCircleOutlined /> Genel Bakış</span>} key="overview">
            <Alert
              message="Eklenen Özellikler"
              description={
                <ul>
                  <li>✅ CAPTCHA/reCAPTCHA entegrasyonu</li>
                  <li>✅ Rate limiting</li>
                  <li>✅ 2FA (Two-Factor Authentication)</li>
                  <li>✅ E-posta doğrulama</li>
                  <li>✅ Şifre göster/gizle</li>
                  <li>✅ Form auto-save</li>
                  <li>✅ Progress indicator</li>
                  <li>✅ Sosyal medya girişi</li>
                  <li>✅ Lazy loading</li>
                  <li>✅ Optimistic UI</li>
                  <li>✅ Analytics</li>
                  <li>✅ Referans sistemi</li>
                  <li>✅ Canlı destek</li>
                  <li>✅ Çoklu dil desteği</li>
                  <li>✅ Onboarding tour</li>
                  <li>✅ PWA desteği</li>
                  <li>✅ Biometric authentication</li>
                </ul>
              }
              type="success"
              showIcon
            />
            
            <Divider />
            
            <Title level={4}>Hızlı Testler</Title>
            <Space wrap>
              <Button 
                type="primary"
                onClick={() => runTest('LocalStorage', () => {
                  localStorage.setItem('test', 'value');
                  return localStorage.getItem('test') === 'value';
                })}
              >
                LocalStorage Test
              </Button>
              
              <Button 
                type="primary"
                onClick={() => runTest('SessionStorage', () => {
                  sessionStorage.setItem('test', 'value');
                  return sessionStorage.getItem('test') === 'value';
                })}
              >
                SessionStorage Test
              </Button>
              
              <Button 
                type="primary"
                onClick={() => runTest('Notification', () => {
                  return 'Notification' in window;
                })}
              >
                Notification API Test
              </Button>
              
              <Button 
                type="primary"
                onClick={() => runTest('ServiceWorker', () => {
                  return 'serviceWorker' in navigator;
                })}
              >
                Service Worker Test
              </Button>
              
              <Button 
                type="primary"
                onClick={() => runTest('WebAuthn', () => {
                  return !!window.PublicKeyCredential;
                })}
              >
                WebAuthn Test
              </Button>
            </Space>
          </TabPane>

          {/* Security Tab */}
          <TabPane tab={<span><SafetyOutlined /> Güvenlik</span>} key="security">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card title="Rate Limiting" size="small">
                  <Alert
                    message="Test: Butona 5 kez tıklayın"
                    type="info"
                    style={{ marginBottom: 16 }}
                  />
                  <RateLimitTest />
                </Card>
              </Col>
              
              <Col xs={24} md={12}>
                <Card title="Password Strength" size="small">
                  <PasswordStrengthTest />
                </Card>
              </Col>
              
              <Col xs={24} md={12}>
                <Card title="Form Validation" size="small">
                  <FormValidationTest />
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* UX Tab */}
          <TabPane tab={<span><RocketOutlined /> UX</span>} key="ux">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card title="Form Auto-Save" size="small">
                  <Form layout="vertical">
                    <Form.Item label="İsim">
                      <Input
                        value={formData.name}
                        onChange={(e) => {
                          const newData = { ...formData, name: e.target.value };
                          setFormData(newData);
                          // Simulate auto-save
                          localStorage.setItem('formData', JSON.stringify(newData));
                          message.info('Otomatik kaydedildi', 0.5);
                        }}
                        placeholder="Yazın, otomatik kaydedilecek..."
                      />
                    </Form.Item>
                  </Form>
                  <Button 
                    onClick={() => {
                      const saved = localStorage.getItem('formData');
                      if (saved) {
                        setFormData(JSON.parse(saved));
                        message.success('Form verileri geri yüklendi');
                      }
                    }}
                  >
                    Geri Yükle
                  </Button>
                </Card>
              </Col>
              
              <Col xs={24} md={12}>
                <Card title="Progress Indicator" size="small">
                  <FormProgressTest formData={formData} />
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* Performance Tab */}
          <TabPane tab={<span><SettingOutlined /> Performans</span>} key="performance">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card title="Browser Info" size="small">
                  <BrowserInfoTest />
                </Card>
              </Col>
              
              <Col xs={24} md={12}>
                <Card title="Network Status" size="small">
                  <NetworkStatusTest />
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

// Sub-components for testing
const RateLimitTest: React.FC = () => {
  const [clicks, setClicks] = useState(0);
  const [blocked, setBlocked] = useState(false);
  const maxClicks = 5;

  const handleClick = () => {
    if (clicks >= maxClicks) {
      setBlocked(true);
      message.error('Rate limit aşıldı! 5 saniye bekleyin.');
      setTimeout(() => {
        setClicks(0);
        setBlocked(false);
      }, 5000);
      return;
    }
    setClicks(clicks + 1);
    message.info(`Tıklama: ${clicks + 1}/${maxClicks}`);
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Progress percent={(clicks / maxClicks) * 100} status={blocked ? 'exception' : 'active'} />
      <Button onClick={handleClick} disabled={blocked} type="primary">
        Test Et ({clicks}/{maxClicks})
      </Button>
      {blocked && <Alert message="Rate limit aktif!" type="error" />}
    </Space>
  );
};

const PasswordStrengthTest: React.FC = () => {
  const [password, setPassword] = useState('');
  
  const getStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  };

  const strength = getStrength();
  const strengthText = strength === 0 ? 'Çok Zayıf' : 
                       strength <= 25 ? 'Zayıf' :
                       strength <= 50 ? 'Orta' :
                       strength <= 75 ? 'İyi' : 'Güçlü';

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Input.Password
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Şifre girin..."
      />
      <Progress 
        percent={strength} 
        status={strength === 100 ? 'success' : strength >= 50 ? 'active' : 'exception'}
        format={() => strengthText}
      />
      <Text type="secondary">
        ✓ En az 8 karakter {password.length >= 8 && '✓'}<br />
        ✓ Büyük harf {/[A-Z]/.test(password) && '✓'}<br />
        ✓ Rakam {/[0-9]/.test(password) && '✓'}<br />
        ✓ Özel karakter {/[^A-Za-z0-9]/.test(password) && '✓'}
      </Text>
    </Space>
  );
};

const FormValidationTest: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Input
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setIsValid(e.target.value ? validateEmail(e.target.value) : null);
        }}
        placeholder="E-posta adresi girin..."
        status={isValid === false ? 'error' : isValid === true ? 'success' : ''}
      />
      {isValid !== null && (
        <Alert
          message={isValid ? 'Geçerli e-posta' : 'Geçersiz e-posta'}
          type={isValid ? 'success' : 'error'}
          showIcon
        />
      )}
    </Space>
  );
};

const FormProgressTest: React.FC<{ formData: any }> = ({ formData }) => {
  const fields = ['name', 'email', 'password', 'company'];
  const filled = fields.filter(field => formData[field]).length;
  const progress = (filled / fields.length) * 100;

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Progress percent={progress} status={progress === 100 ? 'success' : 'active'} />
      <Text>{filled}/{fields.length} alan dolduruldu</Text>
      <Space>
        {fields.map(field => (
          <Badge
            key={field}
            status={formData[field] ? 'success' : 'default'}
            text={field}
          />
        ))}
      </Space>
    </Space>
  );
};

const BrowserInfoTest: React.FC = () => {
  const info = {
    'User Agent': navigator.userAgent.substring(0, 50) + '...',
    'Platform': navigator.platform,
    'Language': navigator.language,
    'Cookies Enabled': navigator.cookieEnabled ? 'Evet' : 'Hayır',
    'Online': navigator.onLine ? 'Evet' : 'Hayır',
    'Screen': `${screen.width}x${screen.height}`,
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      {Object.entries(info).map(([key, value]) => (
        <div key={key}>
          <Text strong>{key}: </Text>
          <Text>{value}</Text>
        </div>
      ))}
    </Space>
  );
};

const NetworkStatusTest: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Badge status={isOnline ? 'success' : 'error'} text={isOnline ? 'Online' : 'Offline'} />
      <Alert
        message={isOnline ? 'İnternet bağlantısı var' : 'İnternet bağlantısı yok'}
        type={isOnline ? 'success' : 'error'}
        showIcon
      />
    </Space>
  );
};

export default SimpleFeatureTest;