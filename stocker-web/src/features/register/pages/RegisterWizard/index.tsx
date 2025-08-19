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
  Result,
  Tooltip,
  Tag,
  Divider,
  Alert,
  Checkbox,
  Radio,
  Avatar,
  Timeline
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  RocketOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  SafetyOutlined,
  TeamOutlined,
  GlobalOutlined,
  BankOutlined,
  InfoCircleOutlined,
  LoadingOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { useSignalRValidation } from '@/shared/hooks/useSignalR';
import { apiClient } from '@/shared/api/client';
import PasswordStrength from '@/shared/components/PasswordStrength';
import './style.css';

const { Title, Text, Paragraph } = Typography;

interface RegisterData {
  // Step 1: Company Info
  companyName: string;
  companyCode: string;
  sector: string;
  employeeCount: string;
  
  // Step 2: Contact Person
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactTitle: string;
  
  // Step 3: Account Setup
  username: string;
  password: string;
  confirmPassword: string;
  domain: string;
  
  // Step 4: Agreement
  termsAccepted: boolean;
  marketingAccepted: boolean;
}

const RegisterWizard: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [registerData, setRegisterData] = useState<Partial<RegisterData>>({});
  const [loading, setLoading] = useState(false);
  const [validationStatus, setValidationStatus] = useState<Record<string, any>>({});
  
  const {
    emailValidation,
    domainCheck,
    companyNameCheck,
    phoneValidation,
    passwordStrength,
    validateEmail,
    checkDomain,
    checkCompanyName,
    validatePhone,
    checkPasswordStrength,
    isConnected
  } = useSignalRValidation();

  // Step definitions
  const steps = [
    {
      title: 'Şirket Bilgileri',
      icon: <BankOutlined />,
      description: 'İşletmeniz hakkında temel bilgiler'
    },
    {
      title: 'İletişim Bilgileri',
      icon: <TeamOutlined />,
      description: 'Yetkili kişi ve iletişim detayları'
    },
    {
      title: 'Hesap Oluştur',
      icon: <SafetyOutlined />,
      description: 'Kullanıcı adı ve şifre belirleme'
    },
    {
      title: 'Onay & Başlangıç',
      icon: <CheckCircleOutlined />,
      description: 'Sözleşme ve hesap aktivasyonu'
    }
  ];

  const sectors = [
    'Bilişim ve Teknoloji',
    'Üretim ve Sanayi',
    'Perakende ve E-ticaret',
    'Hizmet Sektörü',
    'Sağlık',
    'Eğitim',
    'İnşaat ve Gayrimenkul',
    'Lojistik',
    'Turizm',
    'Diğer'
  ];

  const employeeCounts = [
    { value: '1-10', label: '1-10 Çalışan' },
    { value: '11-50', label: '11-50 Çalışan' },
    { value: '51-200', label: '51-200 Çalışan' },
    { value: '200+', label: '200+ Çalışan' }
  ];

  // Real-time validation handlers
  const handleCompanyNameChange = (value: string) => {
    if (value && value.length > 2) {
      checkCompanyName(value);
    }
  };

  const handleEmailChange = (value: string) => {
    if (value && value.includes('@')) {
      validateEmail(value);
    }
  };

  const handlePhoneChange = (value: string) => {
    if (value && value.length >= 10) {
      validatePhone(value, 'TR');
    }
  };

  const handlePasswordChange = (value: string) => {
    if (value) {
      checkPasswordStrength(value);
    }
  };

  const handleDomainChange = (value: string) => {
    if (value && value.length > 2) {
      const domain = value.toLowerCase().replace(/[^a-z0-9]/g, '');
      form.setFieldsValue({ domain });
      checkDomain(`${domain}.stocker.com`);
    }
  };

  // Navigation handlers
  const next = async () => {
    try {
      const values = await form.validateFields();
      setRegisterData({ ...registerData, ...values });
      
      if (currentStep === steps.length - 1) {
        handleSubmit();
      } else {
        setCurrentStep(currentStep + 1);
        window.scrollTo(0, 0);
      }
    } catch (error) {
      message.error('Lütfen gerekli alanları doldurun');
    }
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const finalData = { ...registerData, ...form.getFieldsValue() };
      
      // API call to register
      const response = await apiClient.post('/auth/register', {
        companyName: finalData.companyName,
        companyCode: finalData.companyCode,
        contactName: finalData.contactName,
        contactEmail: finalData.contactEmail,
        contactPhone: finalData.contactPhone,
        username: finalData.username,
        password: finalData.password,
        domain: `${finalData.domain}.stocker.com`,
        sector: finalData.sector,
        employeeCount: finalData.employeeCount
      });

      if (response.data.success) {
        setCurrentStep(currentStep + 1);
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Kayıt sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Step content renderers
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="step-content">
            <div className="step-header">
              <Title level={3}>Şirket Bilgileri</Title>
              <Paragraph className="step-description">
                İşletmeniz hakkında temel bilgileri girin. Bu bilgiler fatura ve resmi işlemlerinizde kullanılacaktır.
              </Paragraph>
            </div>

            <Form form={form} layout="vertical" className="step-form">
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="companyName"
                    label="Şirket Adı"
                    rules={[
                      { required: true, message: 'Şirket adı zorunludur' },
                      { min: 3, message: 'En az 3 karakter olmalıdır' }
                    ]}
                    validateStatus={companyNameCheck?.isValid === false ? 'error' : ''}
                    help={companyNameCheck?.message}
                  >
                    <Input
                      size="large"
                      placeholder="Örn: ABC Teknoloji A.Ş."
                      prefix={<BankOutlined />}
                      onChange={(e) => handleCompanyNameChange(e.target.value)}
                      suffix={
                        companyNameCheck?.isValid === true ? (
                          <CheckCircleOutlined style={{ color: '#52c41a' }} />
                        ) : companyNameCheck?.isValid === false ? (
                          <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                        ) : null
                      }
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="companyCode"
                    label="Vergi No / TC Kimlik No"
                    rules={[
                      { required: true, message: 'Vergi numarası zorunludur' },
                      { pattern: /^[0-9]{10,11}$/, message: 'Geçerli bir numara girin' }
                    ]}
                  >
                    <Input
                      size="large"
                      placeholder="Vergi numaranızı girin"
                      prefix={<InfoCircleOutlined />}
                      maxLength={11}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="sector"
                    label="Sektör"
                    rules={[{ required: true, message: 'Sektör seçimi zorunludur' }]}
                  >
                    <Radio.Group className="sector-radio-group">
                      {sectors.map((sector) => (
                        <Radio.Button key={sector} value={sector} className="sector-button">
                          {sector}
                        </Radio.Button>
                      ))}
                    </Radio.Group>
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="employeeCount"
                    label="Çalışan Sayısı"
                    rules={[{ required: true, message: 'Çalışan sayısı seçimi zorunludur' }]}
                  >
                    <Radio.Group className="employee-radio-group">
                      {employeeCounts.map((count) => (
                        <Radio.Button key={count.value} value={count.value} className="employee-button">
                          <TeamOutlined /> {count.label}
                        </Radio.Button>
                      ))}
                    </Radio.Group>
                  </Form.Item>
                </Col>
              </Row>
            </Form>

            <div className="step-info">
              <Alert
                message="Bilgi"
                description="Şirket bilgileriniz güvenle saklanır ve sadece yasal gereklilikler için kullanılır."
                type="info"
                showIcon
                icon={<SafetyOutlined />}
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="step-content">
            <div className="step-header">
              <Title level={3}>İletişim Bilgileri</Title>
              <Paragraph className="step-description">
                Sizinle iletişime geçeceğimiz yetkili kişi bilgilerini girin.
              </Paragraph>
            </div>

            <Form form={form} layout="vertical" className="step-form">
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="contactName"
                    label="Ad Soyad"
                    rules={[
                      { required: true, message: 'Ad soyad zorunludur' },
                      { min: 3, message: 'En az 3 karakter olmalıdır' }
                    ]}
                  >
                    <Input
                      size="large"
                      placeholder="Adınız ve soyadınız"
                      prefix={<UserOutlined />}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="contactTitle"
                    label="Unvan"
                    rules={[{ required: true, message: 'Unvan zorunludur' }]}
                  >
                    <Input
                      size="large"
                      placeholder="Örn: Genel Müdür, IT Müdürü"
                      prefix={<TeamOutlined />}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="contactEmail"
                    label="E-posta Adresi"
                    rules={[
                      { required: true, message: 'E-posta zorunludur' },
                      { type: 'email', message: 'Geçerli bir e-posta adresi girin' }
                    ]}
                    validateStatus={emailValidation?.isValid === false ? 'error' : ''}
                    help={emailValidation?.message}
                  >
                    <Input
                      size="large"
                      placeholder="ornek@sirket.com"
                      prefix={<MailOutlined />}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      suffix={
                        emailValidation?.isValid === true ? (
                          <CheckCircleOutlined style={{ color: '#52c41a' }} />
                        ) : emailValidation?.isValid === false ? (
                          <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                        ) : null
                      }
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="contactPhone"
                    label="Telefon Numarası"
                    rules={[
                      { required: true, message: 'Telefon numarası zorunludur' },
                      { pattern: /^[0-9]{10,11}$/, message: 'Geçerli bir telefon numarası girin' }
                    ]}
                    validateStatus={phoneValidation?.isValid === false ? 'error' : ''}
                    help={phoneValidation?.message}
                  >
                    <Input
                      size="large"
                      placeholder="5XX XXX XX XX"
                      prefix={<PhoneOutlined />}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      suffix={
                        phoneValidation?.isValid === true ? (
                          <CheckCircleOutlined style={{ color: '#52c41a' }} />
                        ) : phoneValidation?.isValid === false ? (
                          <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                        ) : null
                      }
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>

            <div className="contact-benefits">
              <Title level={4}>İletişim Avantajları</Title>
              <Timeline>
                <Timeline.Item color="green">7/24 teknik destek</Timeline.Item>
                <Timeline.Item color="blue">Özel müşteri temsilcisi</Timeline.Item>
                <Timeline.Item color="orange">Ücretsiz eğitim ve danışmanlık</Timeline.Item>
                <Timeline.Item color="purple">Öncelikli güncelleme bildirimleri</Timeline.Item>
              </Timeline>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <div className="step-header">
              <Title level={3}>Hesap Bilgileri</Title>
              <Paragraph className="step-description">
                Sisteme giriş için kullanacağınız bilgileri oluşturun.
              </Paragraph>
            </div>

            <Form form={form} layout="vertical" className="step-form">
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="domain"
                    label="Alt Alan Adı"
                    rules={[
                      { required: true, message: 'Alt alan adı zorunludur' },
                      { pattern: /^[a-z0-9]+$/, message: 'Sadece küçük harf ve rakam kullanın' },
                      { min: 3, message: 'En az 3 karakter olmalıdır' }
                    ]}
                    validateStatus={domainCheck?.isAvailable === false ? 'error' : ''}
                    help={domainCheck?.message}
                  >
                    <Input
                      size="large"
                      placeholder="sirketiniz"
                      prefix={<GlobalOutlined />}
                      suffix={<Text type="secondary">.stocker.com</Text>}
                      onChange={(e) => handleDomainChange(e.target.value)}
                    />
                  </Form.Item>
                  {domainCheck?.isAvailable && (
                    <Alert
                      message={`${form.getFieldValue('domain')}.stocker.com adresi kullanılabilir!`}
                      type="success"
                      showIcon
                      style={{ marginBottom: 16 }}
                    />
                  )}
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="username"
                    label="Kullanıcı Adı"
                    rules={[
                      { required: true, message: 'Kullanıcı adı zorunludur' },
                      { min: 3, message: 'En az 3 karakter olmalıdır' }
                    ]}
                  >
                    <Input
                      size="large"
                      placeholder="Kullanıcı adınız"
                      prefix={<UserOutlined />}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="password"
                    label="Şifre"
                    rules={[
                      { required: true, message: 'Şifre zorunludur' },
                      { min: 8, message: 'En az 8 karakter olmalıdır' }
                    ]}
                  >
                    <Input.Password
                      size="large"
                      placeholder="Güçlü bir şifre belirleyin"
                      prefix={<LockOutlined />}
                      onChange={(e) => handlePasswordChange(e.target.value)}
                    />
                  </Form.Item>
                  {passwordStrength && (
                    <PasswordStrength strength={passwordStrength} />
                  )}
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="confirmPassword"
                    label="Şifre Tekrar"
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
                      placeholder="Şifrenizi tekrar girin"
                      prefix={<LockOutlined />}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>

            <div className="security-features">
              <Title level={4}>Güvenlik Özellikleri</Title>
              <Row gutter={[16, 16]}>
                <Col xs={12} md={6}>
                  <Card size="small" className="security-card">
                    <SafetyOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                    <Text>256-bit Şifreleme</Text>
                  </Card>
                </Col>
                <Col xs={12} md={6}>
                  <Card size="small" className="security-card">
                    <CheckCircleOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                    <Text>İki Faktörlü Doğrulama</Text>
                  </Card>
                </Col>
                <Col xs={12} md={6}>
                  <Card size="small" className="security-card">
                    <GlobalOutlined style={{ fontSize: 24, color: '#722ed1' }} />
                    <Text>SSL Sertifikası</Text>
                  </Card>
                </Col>
                <Col xs={12} md={6}>
                  <Card size="small" className="security-card">
                    <TeamOutlined style={{ fontSize: 24, color: '#fa8c16' }} />
                    <Text>KVKK Uyumlu</Text>
                  </Card>
                </Col>
              </Row>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <div className="step-header">
              <Title level={3}>Sözleşme ve Onay</Title>
              <Paragraph className="step-description">
                Son adım! Sözleşmeleri onaylayarak hesabınızı aktif edin.
              </Paragraph>
            </div>

            <Form form={form} layout="vertical" className="step-form">
              <div className="agreement-summary">
                <Card className="summary-card">
                  <Title level={4}>Hesap Özeti</Title>
                  <Divider />
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Text type="secondary">Şirket:</Text>
                      <br />
                      <Text strong>{registerData.companyName}</Text>
                    </Col>
                    <Col span={12}>
                      <Text type="secondary">Yetkili:</Text>
                      <br />
                      <Text strong>{registerData.contactName}</Text>
                    </Col>
                    <Col span={12}>
                      <Text type="secondary">E-posta:</Text>
                      <br />
                      <Text strong>{registerData.contactEmail}</Text>
                    </Col>
                    <Col span={12}>
                      <Text type="secondary">Alan Adı:</Text>
                      <br />
                      <Text strong>{registerData.domain}.stocker.com</Text>
                    </Col>
                  </Row>
                </Card>
              </div>

              <div className="agreements">
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
                        <a href="/privacy" target="_blank">Gizlilik Politikası</a>'nı okudum ve kabul ediyorum.
                      </span>
                    </Space>
                  </Checkbox>
                </Form.Item>

                <Form.Item name="marketingAccepted" valuePropName="checked">
                  <Checkbox>
                    <Space>
                      <span>Ürün güncellemeleri ve kampanyalar hakkında bilgi almak istiyorum.</span>
                    </Space>
                  </Checkbox>
                </Form.Item>
              </div>

              <Alert
                message="14 Gün Ücretsiz Deneme"
                description="Kredi kartı bilgisi gerekmez. İstediğiniz zaman iptal edebilirsiniz."
                type="success"
                showIcon
                style={{ marginTop: 24 }}
              />
            </Form>
          </div>
        );

      case 4:
        return (
          <Result
            status="success"
            title="Hesabınız Başarıyla Oluşturuldu!"
            subTitle={`${registerData.domain}.stocker.com adresiniz hazır. E-posta adresinize gönderilen doğrulama linkine tıklayarak hesabınızı aktif edebilirsiniz.`}
            extra={[
              <Button 
                type="primary" 
                key="login"
                size="large"
                icon={<RocketOutlined />}
                onClick={() => navigate('/login')}
              >
                Giriş Yap
              </Button>,
              <Button 
                key="home"
                size="large"
                onClick={() => navigate('/')}
              >
                Ana Sayfa
              </Button>
            ]}
          >
            <div className="success-details">
              <Title level={4}>Sonraki Adımlar</Title>
              <Timeline>
                <Timeline.Item color="green">
                  E-posta adresinizi doğrulayın
                </Timeline.Item>
                <Timeline.Item color="blue">
                  Şirket profilinizi tamamlayın
                </Timeline.Item>
                <Timeline.Item color="orange">
                  İlk kullanıcılarınızı ekleyin
                </Timeline.Item>
                <Timeline.Item color="purple">
                  Modüllerinizi yapılandırın
                </Timeline.Item>
              </Timeline>
            </div>
          </Result>
        );

      default:
        return null;
    }
  };

  return (
    <div className="register-wizard">
      <div className="wizard-header">
        <div className="header-content">
          <Title level={2}>Stocker'a Hoş Geldiniz</Title>
          <Paragraph>
            İşletmenizi dijitalleştirmeye hazır mısınız? Birkaç dakika içinde hesabınızı oluşturun.
          </Paragraph>
        </div>
      </div>

      <Card className="wizard-card">
        {currentStep < 4 && (
          <>
            <Steps current={currentStep} className="wizard-steps">
              {steps.map((step, index) => (
                <Steps.Step
                  key={index}
                  title={step.title}
                  description={step.description}
                  icon={
                    <Avatar
                      size="large"
                      style={{
                        backgroundColor: currentStep >= index ? '#667eea' : '#f0f0f0',
                        color: currentStep >= index ? '#fff' : '#999'
                      }}
                    >
                      {step.icon}
                    </Avatar>
                  }
                />
              ))}
            </Steps>

            <Progress
              percent={(currentStep / (steps.length - 1)) * 100}
              showInfo={false}
              strokeColor="#667eea"
              style={{ marginTop: 24 }}
            />
          </>
        )}

        <div className="wizard-body">
          {renderStepContent()}
        </div>

        {currentStep < 4 && (
          <div className="wizard-footer">
            <Button
              onClick={prev}
              disabled={currentStep === 0}
              icon={<ArrowLeftOutlined />}
            >
              Geri
            </Button>
            <Button
              type="primary"
              onClick={next}
              loading={loading}
              icon={currentStep === steps.length - 1 ? <CheckCircleOutlined /> : <ArrowRightOutlined />}
              iconPosition="end"
            >
              {currentStep === steps.length - 1 ? 'Hesabı Oluştur' : 'İleri'}
            </Button>
          </div>
        )}
      </Card>

      <div className="wizard-footer-info">
        <Space split={<Divider type="vertical" />}>
          <Text type="secondary">
            <SafetyOutlined /> 256-bit SSL Şifreleme
          </Text>
          <Text type="secondary">
            <CheckCircleOutlined /> KVKK Uyumlu
          </Text>
          <Text type="secondary">
            <GlobalOutlined /> %99.9 Uptime Garantisi
          </Text>
        </Space>
      </div>
    </div>
  );
};

export default RegisterWizard;