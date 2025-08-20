import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Steps,
  Button,
  Form,
  Input,
  Typography,
  Space,
  Row,
  Col,
  Progress,
  message,
  Radio,
  Tooltip,
  Tag,
  Alert,
  Checkbox,
  Spin,
  AutoComplete
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  RocketOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  TeamOutlined,
  BankOutlined,
  InfoCircleOutlined,
  LoadingOutlined,
  IdcardOutlined,
  BankFilled as BuildingOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useSignalRValidation } from '@/shared/hooks/useSignalR';
import { apiClient } from '@/shared/api/client';
import PasswordStrength from '@/shared/components/PasswordStrength';
import { useAuthStore } from '@/app/store/auth.store';
import './style.css';

const { Title, Text, Paragraph } = Typography;

interface RegisterData {
  // Step 1: Account Type
  accountType: 'company' | 'individual';
  
  // Step 2: Basic Info
  companyName?: string;
  fullName?: string;
  identityType: 'tc' | 'vergi';
  identityNumber: string;
  
  // Step 3: Business Details
  sector: string;
  employeeCount: string;
  
  // Step 4: Contact Info
  email: string;
  phone: string;
  
  // Step 5: Security
  password: string;
  confirmPassword: string;
  
  // Step 6: Agreement
  termsAccepted: boolean;
  marketingAccepted: boolean;
}

const RegisterWizard: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [registerData, setRegisterData] = useState<Partial<RegisterData>>({ 
    accountType: 'company',
    identityType: 'vergi' 
  });
  const [loading, setLoading] = useState(false);
  const [identityType, setIdentityType] = useState<'tc' | 'vergi'>('vergi');
  const [isValidating, setIsValidating] = useState(false);
  const [completionTime, setCompletionTime] = useState(3); // minutes
  const [progressPercent, setProgressPercent] = useState(0);
  
  const {
    emailValidation,
    identityValidation,
    validateEmail,
    validateIdentity,
    isConnected
  } = useSignalRValidation();

  // Calculate progress
  useEffect(() => {
    const totalSteps = 6;
    const percent = Math.round(((currentStep + 1) / totalSteps) * 100);
    setProgressPercent(percent);
    
    // Update estimated time
    const timePerStep = 0.5; // 30 seconds per step
    const remainingSteps = totalSteps - currentStep - 1;
    setCompletionTime(Math.max(1, Math.round(remainingSteps * timePerStep)));
  }, [currentStep]);

  // Company name suggestions
  const [companySuggestions, setCompanySuggestions] = useState<string[]>([]);
  
  const handleCompanySearch = (value: string) => {
    // Simulate company suggestions
    if (value) {
      setCompanySuggestions([
        `${value} Teknoloji A.Ş.`,
        `${value} Bilişim Ltd. Şti.`,
        `${value} Yazılım ve Danışmanlık`,
        `${value} İnovasyon Merkezi`
      ]);
    }
  };

  const handleNext = async () => {
    try {
      const values = await form.validateFields();
      setRegisterData({ ...registerData, ...values });
      
      if (currentStep < 5) {
        setCurrentStep(currentStep + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        handleSubmit();
      }
    } catch (error) {
      message.error('Lütfen gerekli alanları doldurun');
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // API call simulation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      message.success('Kayıt başarılı! Yönlendiriliyorsunuz...');
      setTimeout(() => {
        navigate('/welcome');
      }, 1500);
    } catch (error) {
      message.error('Kayıt sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Account Type Selection
        return (
          <div className="step-account-type">
            <div className="step-header">
              <Title level={2}>Hesap Türünüzü Seçin</Title>
              <Paragraph type="secondary">
                İşletmeniz için mi yoksa bireysel kullanım için mi kayıt oluyorsunuz?
              </Paragraph>
            </div>

            <Form.Item name="accountType" rules={[{ required: true, message: 'Hesap türü seçimi zorunludur' }]}>
              <Radio.Group 
                size="large" 
                className="account-type-cards"
                defaultValue="company"
              >
                <Space direction="vertical" size={16} style={{ width: '100%' }}>
                  <Radio.Button value="company" className="account-type-card">
                    <div className="card-content">
                      <BuildingOutlined className="card-icon" />
                      <div className="card-text">
                        <Title level={4}>Kurumsal Hesap</Title>
                        <Text type="secondary">Şirketim veya işletmem için</Text>
                      </div>
                      <div className="card-benefits">
                        <Tag color="blue">Çoklu kullanıcı</Tag>
                        <Tag color="green">Fatura kesebilme</Tag>
                        <Tag color="purple">Tüm modüller</Tag>
                      </div>
                    </div>
                  </Radio.Button>

                  <Radio.Button value="individual" className="account-type-card">
                    <div className="card-content">
                      <UserOutlined className="card-icon" />
                      <div className="card-text">
                        <Title level={4}>Bireysel Hesap</Title>
                        <Text type="secondary">Kişisel kullanım için</Text>
                      </div>
                      <div className="card-benefits">
                        <Tag color="blue">Tek kullanıcı</Tag>
                        <Tag color="green">Basit arayüz</Tag>
                        <Tag color="purple">Temel özellikler</Tag>
                      </div>
                    </div>
                  </Radio.Button>
                </Space>
              </Radio.Group>
            </Form.Item>
          </div>
        );

      case 1: // Basic Information
        return (
          <div className="step-basic-info">
            <div className="step-header">
              <Title level={2}>Temel Bilgiler</Title>
              <Paragraph type="secondary">
                {registerData.accountType === 'company' ? 'Şirket' : 'Kişisel'} bilgilerinizi girin
              </Paragraph>
            </div>

            <Space direction="vertical" size={24} style={{ width: '100%' }}>
              {registerData.accountType === 'company' ? (
                <Form.Item 
                  name="companyName" 
                  label={
                    <span>
                      Şirket Adı <Text type="danger">*</Text>
                    </span>
                  }
                  rules={[{ required: true, message: 'Şirket adı zorunludur' }]}
                  extra="Resmi şirket unvanınızı yazın"
                >
                  <AutoComplete
                    size="large"
                    placeholder="Örn: ABC Teknoloji A.Ş."
                    onSearch={handleCompanySearch}
                    options={companySuggestions.map(s => ({ value: s }))}
                  />
                </Form.Item>
              ) : (
                <Form.Item 
                  name="fullName" 
                  label={
                    <span>
                      Ad Soyad <Text type="danger">*</Text>
                    </span>
                  }
                  rules={[{ required: true, message: 'Ad soyad zorunludur' }]}
                >
                  <Input size="large" placeholder="Adınız ve soyadınız" />
                </Form.Item>
              )}

              <div className="identity-selector">
                <Text strong style={{ marginBottom: 8, display: 'block' }}>
                  Kimlik Doğrulama Tipi <Text type="danger">*</Text>
                </Text>
                <Radio.Group 
                  value={identityType}
                  onChange={(e) => setIdentityType(e.target.value)}
                  size="large"
                  style={{ width: '100%' }}
                >
                  <Space direction="vertical" size={12} style={{ width: '100%' }}>
                    <Radio value="tc" className="identity-option">
                      <Space>
                        <IdcardOutlined />
                        <span>TC Kimlik No</span>
                        <Tooltip title="11 haneli TC kimlik numaranız">
                          <InfoCircleOutlined style={{ color: '#999' }} />
                        </Tooltip>
                      </Space>
                    </Radio>
                    <Radio value="vergi" className="identity-option">
                      <Space>
                        <BankOutlined />
                        <span>Vergi No</span>
                        <Tooltip title="10 haneli vergi numaranız">
                          <InfoCircleOutlined style={{ color: '#999' }} />
                        </Tooltip>
                      </Space>
                    </Radio>
                  </Space>
                </Radio.Group>
              </div>

              <Form.Item
                name="identityNumber"
                label={
                  <span>
                    {identityType === 'tc' ? 'TC Kimlik No' : 'Vergi No'} <Text type="danger">*</Text>
                  </span>
                }
                rules={[
                  { required: true, message: `${identityType === 'tc' ? 'TC Kimlik No' : 'Vergi No'} zorunludur` },
                  { len: identityType === 'tc' ? 11 : 10, message: `${identityType === 'tc' ? '11' : '10'} haneli olmalıdır` }
                ]}
                validateStatus={identityValidation?.isValid === false ? 'error' : ''}
                help={identityValidation?.isValid === false ? identityValidation.message : ''}
              >
                <Input
                  size="large"
                  placeholder={identityType === 'tc' ? '11 haneli TC Kimlik No' : '10 haneli Vergi No'}
                  maxLength={identityType === 'tc' ? 11 : 10}
                  suffix={
                    isValidating ? <LoadingOutlined /> :
                    identityValidation?.isValid ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : null
                  }
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    form.setFieldsValue({ identityNumber: value });
                    if (value.length === (identityType === 'tc' ? 11 : 10)) {
                      setIsValidating(true);
                      validateIdentity(value);
                      setTimeout(() => setIsValidating(false), 500);
                    }
                  }}
                />
              </Form.Item>
            </Space>
          </div>
        );

      case 2: // Business Details
        return (
          <div className="step-business">
            <div className="step-header">
              <Title level={2}>İşletme Detayları</Title>
              <Paragraph type="secondary">
                Sektörünüzü ve işletme büyüklüğünüzü belirtin
              </Paragraph>
            </div>

            <Space direction="vertical" size={32} style={{ width: '100%' }}>
              <div>
                <Text strong style={{ marginBottom: 16, display: 'block', fontSize: 16 }}>
                  Faaliyet Sektörünüz <Text type="danger">*</Text>
                </Text>
                <Form.Item 
                  name="sector" 
                  rules={[{ required: true, message: 'Sektör seçimi zorunludur' }]}
                >
                  <Radio.Group className="sector-cards">
                    <Row gutter={[16, 16]}>
                      {[
                        { value: 'tech', label: 'Teknoloji', icon: '💻' },
                        { value: 'retail', label: 'Perakende', icon: '🛍️' },
                        { value: 'service', label: 'Hizmet', icon: '🤝' },
                        { value: 'production', label: 'Üretim', icon: '🏭' },
                        { value: 'health', label: 'Sağlık', icon: '🏥' },
                        { value: 'education', label: 'Eğitim', icon: '🎓' },
                        { value: 'construction', label: 'İnşaat', icon: '🏗️' },
                        { value: 'other', label: 'Diğer', icon: '📊' }
                      ].map(sector => (
                        <Col xs={12} sm={8} md={6} key={sector.value}>
                          <Radio.Button value={sector.value} className="sector-card">
                            <div className="sector-card-content">
                              <span className="sector-icon">{sector.icon}</span>
                              <span className="sector-label">{sector.label}</span>
                            </div>
                          </Radio.Button>
                        </Col>
                      ))}
                    </Row>
                  </Radio.Group>
                </Form.Item>
              </div>

              <div>
                <Text strong style={{ marginBottom: 16, display: 'block', fontSize: 16 }}>
                  Çalışan Sayısı <Text type="danger">*</Text>
                </Text>
                <Form.Item 
                  name="employeeCount" 
                  rules={[{ required: true, message: 'Çalışan sayısı seçimi zorunludur' }]}
                >
                  <Radio.Group className="employee-cards">
                    <Row gutter={[16, 16]}>
                      {[
                        { value: '1-10', label: '1-10', desc: 'Mikro İşletme' },
                        { value: '11-50', label: '11-50', desc: 'Küçük İşletme' },
                        { value: '51-200', label: '51-200', desc: 'Orta Ölçekli' },
                        { value: '200+', label: '200+', desc: 'Büyük İşletme' }
                      ].map(size => (
                        <Col xs={12} sm={6} key={size.value}>
                          <Radio.Button value={size.value} className="employee-card">
                            <TeamOutlined style={{ fontSize: 24, marginBottom: 8 }} />
                            <div className="employee-count">{size.label}</div>
                            <div className="employee-desc">{size.desc}</div>
                          </Radio.Button>
                        </Col>
                      ))}
                    </Row>
                  </Radio.Group>
                </Form.Item>
              </div>
            </Space>
          </div>
        );

      case 3: // Contact Information
        return (
          <div className="step-contact">
            <div className="step-header">
              <Title level={2}>İletişim Bilgileri</Title>
              <Paragraph type="secondary">
                Size ulaşabileceğimiz iletişim bilgilerinizi girin
              </Paragraph>
            </div>

            <Space direction="vertical" size={24} style={{ width: '100%' }}>
              <Form.Item
                name="email"
                label={
                  <span>
                    E-posta Adresi <Text type="danger">*</Text>
                  </span>
                }
                rules={[
                  { required: true, message: 'E-posta adresi zorunludur' },
                  { type: 'email', message: 'Geçerli bir e-posta adresi girin' }
                ]}
                validateStatus={emailValidation?.isValid === false ? 'error' : ''}
                help={emailValidation?.isValid === false ? 'Bu e-posta adresi zaten kullanımda' : ''}
                extra="Giriş yapmak ve bildirimler için kullanılacak"
              >
                <Input
                  size="large"
                  prefix={<MailOutlined />}
                  placeholder="ornek@sirket.com"
                  onChange={(e) => validateEmail(e.target.value)}
                  suffix={
                    emailValidation?.isValid ? 
                    <CheckCircleOutlined style={{ color: '#52c41a' }} /> : null
                  }
                />
              </Form.Item>

              <Form.Item
                name="phone"
                label={
                  <span>
                    Telefon Numarası <Text type="danger">*</Text>
                  </span>
                }
                rules={[
                  { required: true, message: 'Telefon numarası zorunludur' },
                  { pattern: /^[0-9]{10,11}$/, message: 'Geçerli bir telefon numarası girin' }
                ]}
                extra="Başında 0 olmadan, 10 haneli olarak girin"
              >
                <Input
                  size="large"
                  prefix={<PhoneOutlined />}
                  placeholder="5XX XXX XX XX"
                  maxLength={10}
                />
              </Form.Item>
            </Space>
          </div>
        );

      case 4: // Security
        return (
          <div className="step-security">
            <div className="step-header">
              <Title level={2}>Güvenlik</Title>
              <Paragraph type="secondary">
                Hesabınız için güçlü bir şifre belirleyin
              </Paragraph>
            </div>

            <Space direction="vertical" size={24} style={{ width: '100%' }}>
              <Form.Item
                name="password"
                label={
                  <span>
                    Şifre <Text type="danger">*</Text>
                  </span>
                }
                rules={[
                  { required: true, message: 'Şifre zorunludur' },
                  { min: 8, message: 'Şifre en az 8 karakter olmalıdır' }
                ]}
                extra={<PasswordStrength password={form.getFieldValue('password')} />}
              >
                <Input.Password
                  size="large"
                  prefix={<LockOutlined />}
                  placeholder="En az 8 karakter"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label={
                  <span>
                    Şifre Tekrar <Text type="danger">*</Text>
                  </span>
                }
                dependencies={['password']}
                rules={[
                  { required: true, message: 'Şifre tekrarı zorunludur' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Şifreler eşleşmiyor'));
                    },
                  }),
                ]}
              >
                <Input.Password
                  size="large"
                  prefix={<LockOutlined />}
                  placeholder="Şifrenizi tekrar girin"
                />
              </Form.Item>

              <Alert
                message="Güvenlik İpuçları"
                description={
                  <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                    <li>Büyük ve küçük harf kullanın</li>
                    <li>En az bir rakam ekleyin</li>
                    <li>Özel karakter kullanın (!@#$%)</li>
                    <li>Kişisel bilgilerinizi kullanmayın</li>
                  </ul>
                }
                type="info"
                showIcon
              />
            </Space>
          </div>
        );

      case 5: // Agreement & Summary
        return (
          <div className="step-agreement">
            <div className="step-header">
              <Title level={2}>Neredeyse Hazırsınız!</Title>
              <Paragraph type="secondary">
                Son adım: Sözleşmeleri onaylayın ve hesabınızı oluşturun
              </Paragraph>
            </div>

            <Card className="summary-card">
              <Title level={4}>Hesap Özeti</Title>
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                <div className="summary-item">
                  <Text type="secondary">Hesap Türü:</Text>
                  <Text strong>{registerData.accountType === 'company' ? 'Kurumsal' : 'Bireysel'}</Text>
                </div>
                {registerData.companyName && (
                  <div className="summary-item">
                    <Text type="secondary">Şirket:</Text>
                    <Text strong>{registerData.companyName}</Text>
                  </div>
                )}
                <div className="summary-item">
                  <Text type="secondary">E-posta:</Text>
                  <Text strong>{registerData.email}</Text>
                </div>
                <div className="summary-item">
                  <Text type="secondary">Sektör:</Text>
                  <Text strong>{registerData.sector}</Text>
                </div>
              </Space>
            </Card>

            <Space direction="vertical" size={16} style={{ width: '100%', marginTop: 24 }}>
              <Form.Item
                name="termsAccepted"
                valuePropName="checked"
                rules={[
                  {
                    validator: (_, value) =>
                      value ? Promise.resolve() : Promise.reject(new Error('Sözleşmeyi kabul etmelisiniz')),
                  },
                ]}
              >
                <Checkbox>
                  <Space>
                    <span>
                      <a href="/terms" target="_blank">Kullanım Sözleşmesi</a> ve{' '}
                      <a href="/privacy" target="_blank">Gizlilik Politikası</a>'nı okudum, kabul ediyorum
                    </span>
                    <Text type="danger">*</Text>
                  </Space>
                </Checkbox>
              </Form.Item>

              <Form.Item name="marketingAccepted" valuePropName="checked">
                <Checkbox>
                  Stocker'dan haberler ve kampanyalar hakkında e-posta almak istiyorum
                </Checkbox>
              </Form.Item>
            </Space>

            <Alert
              message="Hesabınız oluşturulduktan sonra:"
              description={
                <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                  <li>14 gün ücretsiz deneme başlayacak</li>
                  <li>Tüm özelliklere erişim sağlanacak</li>
                  <li>İstediğiniz zaman iptal edebileceksiniz</li>
                  <li>7/24 destek alabileceksiniz</li>
                </ul>
              }
              type="success"
              showIcon
              style={{ marginTop: 24 }}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="register-wizard-container">
      <div className="wizard-header">
        <div className="wizard-logo" onClick={() => navigate('/')}>
          <RocketOutlined />
          <span>Stocker</span>
        </div>
        
        <div className="wizard-progress">
          <Progress 
            percent={progressPercent} 
            strokeColor="#667eea"
            showInfo={false}
          />
          <div className="progress-info">
            <Space>
              <ClockCircleOutlined />
              <Text>Yaklaşık {completionTime} dakika kaldı</Text>
            </Space>
            <Text strong>{progressPercent}% tamamlandı</Text>
          </div>
        </div>
      </div>

      <div className="wizard-content">
        <Card className="wizard-card">
          {!isConnected && (
            <Alert
              message="Bağlantı Kontrol Ediliyor"
              description="Gerçek zamanlı doğrulama servisi bağlanıyor..."
              type="warning"
              showIcon
              icon={<LoadingOutlined />}
              style={{ marginBottom: 24 }}
            />
          )}

          <Form
            form={form}
            layout="vertical"
            size="large"
            initialValues={registerData}
            onFinish={handleSubmit}
          >
            {renderStepContent()}
          </Form>

          <div className="wizard-actions">
            {currentStep > 0 && (
              <Button 
                size="large" 
                onClick={handlePrev}
                icon={<ArrowLeftOutlined />}
              >
                Geri
              </Button>
            )}
            
            <Button
              type="primary"
              size="large"
              onClick={handleNext}
              loading={loading}
              icon={currentStep === 5 ? <CheckCircleOutlined /> : <ArrowRightOutlined />}
              iconPosition="end"
            >
              {currentStep === 5 ? 'Hesabı Oluştur' : 'Devam Et'}
            </Button>
          </div>
        </Card>

        <div className="wizard-footer">
          <Text type="secondary">
            Zaten hesabınız var mı? <a href="/login">Giriş yapın</a>
          </Text>
        </div>
      </div>
    </div>
  );
};

export default RegisterWizard;