import React, { useState, useEffect } from 'react';
import {
  Steps,
  Form,
  Input,
  Select,
  Button,
  Card,
  Row,
  Col,
  Typography,
  Space,
  Divider,
  Radio,
  message,
  Alert,
  Tooltip,
  Progress,
  Spin,
  Checkbox
} from 'antd';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { showRegistrationSuccess, showApiResponse } from '../../../../shared/utils/sweetAlert';
import {
  UserOutlined,
  ShopOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  InfoCircleOutlined,
  BuildOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  IdcardOutlined,
  CheckOutlined,
  CloseOutlined,
  LoadingOutlined,
  SafetyOutlined,
  BankOutlined,
  GlobalOutlined,
  SolutionOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import { apiClient } from '@/shared/api/client';
import PasswordStrength from '@/shared/components/PasswordStrength';
import { useRealTimeValidation } from '../../hooks/useRealTimeValidation';
import ReCAPTCHA from 'react-google-recaptcha';
import './register-wizard.css';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const MySwal = withReactContent(Swal);

interface RegisterWizardProps {
  onComplete: (data: any) => void;
  selectedPackage?: any;
}

export const RegisterWizard: React.FC<RegisterWizardProps> = ({ onComplete, selectedPackage }) => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [password, setPassword] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const recaptchaRef = React.useRef<ReCAPTCHA>(null);
  
  // Real-time validation hook
  const {
    isConnected,
    validationResults,
    loading: validationLoading,
    validateEmail,
    checkPasswordStrength,
    checkDomain,
    validatePhone,
    checkCompanyName,
    validateIdentity,
    clearValidation
  } = useRealTimeValidation();

  const steps = [
    {
      title: 'Şirket Bilgileri',
      icon: <ShopOutlined />,
      description: 'Şirket detaylarınızı girin'
    },
    {
      title: 'Yetkili Bilgileri',
      icon: <UserOutlined />,
      description: 'İletişim bilgilerinizi girin'
    },
    {
      title: 'Hesap Güvenliği',
      icon: <LockOutlined />,
      description: 'Giriş bilgilerinizi oluşturun'
    }
  ];

  // Password requirements check
  const passwordRequirements = [
    { key: 'length', label: 'En az 8 karakter', test: (pwd: string) => pwd.length >= 8 },
    { key: 'uppercase', label: 'En az 1 büyük harf', test: (pwd: string) => /[A-Z]/.test(pwd) },
    { key: 'lowercase', label: 'En az 1 küçük harf', test: (pwd: string) => /[a-z]/.test(pwd) },
    { key: 'number', label: 'En az 1 rakam', test: (pwd: string) => /\d/.test(pwd) },
    { key: 'special', label: 'En az 1 özel karakter', test: (pwd: string) => /[@$!%*?&]/.test(pwd) }
  ];

  const next = async () => {
    try {
      const values = await form.validateFields();
      
      // Check captcha on last step
      if (currentStep === steps.length - 1 && !captchaToken) {
        message.error('Lütfen güvenlik doğrulamasını tamamlayın');
        return;
      }
      
      const newFormData = { ...formData, ...values };
      setFormData(newFormData);
      
      if (currentStep === steps.length - 1) {
        handleSubmit(newFormData);
      } else {
        setCurrentStep(currentStep + 1);
      }
    } catch (error) {
      message.error('Lütfen tüm zorunlu alanları doldurun');
    }
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (allValues: any) => {
    setLoading(true);
    try {
      const [firstName, ...lastNameParts] = allValues.contactName?.split(' ') || ['', ''];
      const lastName = lastNameParts.join(' ') || firstName;
      
      const registrationData = {
        // Company Information
        companyName: allValues.companyName,
        companyCode: allValues.companyCode,
        taxNumber: allValues.identityType === 'vergi' ? allValues.identityNumber : null,
        taxOffice: allValues.taxOffice,
        tradeRegistryNumber: allValues.tradeRegistryNumber || null,
        mersisNumber: allValues.mersisNumber || null,
        
        // Contact Information
        contactEmail: allValues.email,
        contactPhone: allValues.phone,
        contactFax: allValues.fax || null,
        website: allValues.website || null,
        
        // Address
        addressLine1: allValues.address || null,
        addressLine2: allValues.addressLine2 || null,
        city: allValues.city || null,
        state: allValues.state || null,
        country: allValues.country || 'Türkiye',
        postalCode: allValues.postalCode || null,
        
        // Business Information
        industryType: allValues.sector,
        businessType: allValues.identityType === 'vergi' ? 'Kurumsal' : 'Şahıs',
        employeeCountRange: allValues.employeeCount,
        annualRevenue: allValues.annualRevenue || null,
        currency: 'TRY',
        
        // Admin User Information
        adminEmail: allValues.email,
        adminUsername: allValues.email?.split('@')[0] || allValues.companyCode,
        adminFirstName: firstName,
        adminLastName: lastName,
        adminPhone: allValues.phone,
        adminTitle: allValues.title || null,
        adminPassword: allValues.password,
        
        // Package & Subscription
        packageId: selectedPackage?.id || null,
        billingCycle: 'Monthly',
        
        // Preferences
        preferredLanguage: 'tr-TR',
        preferredTimeZone: 'Turkey Standard Time',
        acceptTerms: true,
        acceptPrivacyPolicy: true,
        allowMarketing: allValues.allowMarketing || false,
        
        // Captcha
        captchaToken: captchaToken
      };

      const response = await apiClient.post('/api/public/tenant-registration/register', registrationData);
      
      if (response.data?.success) {
        // Başarılı kayıt alert'i - sweetAlert utility'sini kullan
        await showRegistrationSuccess(allValues.email);
        
        }
        
        onComplete(response.data.data);
      } else {
        // Hata alert'i - sweetAlert utility'sini kullan
        await showApiResponse.error(
          response.data?.message || 'Kayıt işlemi sırasında bir hata oluştu.',
          'Kayıt Başarısız'
        );
      }
    } catch (error: any) {
      // Detaylı hata alert'i - sweetAlert utility'sini kullan
      await showApiResponse.error(error, 'Kayıt işlemi sırasında bir hata oluştu');
      console.error('Registration error:', error);
      });
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = () => {
    return ((currentStep + 1) / steps.length) * 100;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="form-section">
            <div className="form-section-title">
              <ShopOutlined />
              <h3>Şirket Bilgileri</h3>
            </div>
            
            <Row gutter={[24, 0]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="companyName"
                  label="Şirket Adı"
                  className="wizard-form-item"
                  rules={[{ required: true, message: 'Şirket adı zorunludur' }]}
                >
                  <Input 
                    size="large"
                    prefix={<ShopOutlined className="field-icon" />}
                    placeholder="ABC Teknoloji A.Ş." 
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="companyCode"
                  label={
                    <Space>
                      Şirket Kodu
                      <Tooltip title="URL'de kullanılacak benzersiz kod">
                        <InfoCircleOutlined className="wizard-tooltip" />
                      </Tooltip>
                    </Space>
                  }
                  className="wizard-form-item"
                  rules={[
                    { required: true, message: 'Şirket kodu zorunludur' },
                    { pattern: /^[a-z0-9-]+$/, message: 'Küçük harf, rakam ve tire kullanın' }
                  ]}
                  validateStatus={
                    validationResults.domain?.isAvailable === false ? 'error' : 
                    validationResults.domain?.isAvailable === true ? 'success' : ''
                  }
                  help={
                    validationLoading.domain ? 'Kontrol ediliyor...' :
                    validationResults.domain?.message
                  }
                  hasFeedback={!!validationResults.domain}
                >
                  <Input 
                    size="large"
                    placeholder="abc-teknoloji" 
                    addonAfter=".stocker.app"
                    onChange={(e) => {
                      const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                      form.setFieldValue('companyCode', value);
                      if (value.length >= 3) {
                        checkDomain(value);
                      }
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[24, 0]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="identityType"
                  label="Vergi Türü"
                  className="wizard-form-item"
                  rules={[{ required: true, message: 'Vergi türü seçimi zorunludur' }]}
                  initialValue="vergi"
                >
                  <Radio.Group size="large" className="identity-type-selector">
                    <Radio.Button value="tc">
                      <Space>
                        <IdcardOutlined />
                        Şahıs Şirketi
                      </Space>
                    </Radio.Button>
                    <Radio.Button value="vergi">
                      <Space>
                        <BankOutlined />
                        Kurumsal
                      </Space>
                    </Radio.Button>
                  </Radio.Group>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="identityNumber"
                  label="TC Kimlik / Vergi No"
                  className="wizard-form-item"
                  rules={[
                    { required: true, message: 'Bu alan zorunludur' },
                    { pattern: /^\d{10,11}$/, message: '10-11 haneli olmalı' }
                  ]}
                  validateStatus={
                    validationResults.identity?.isValid === false ? 'error' : 
                    validationResults.identity?.isValid === true ? 'success' : ''
                  }
                  help={
                    validationLoading.identity ? 'Doğrulanıyor...' :
                    validationResults.identity?.message
                  }
                  hasFeedback={!!validationResults.identity}
                >
                  <Input 
                    size="large"
                    prefix={<IdcardOutlined className="field-icon" />}
                    placeholder="12345678901" 
                    maxLength={11}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      form.setFieldValue('identityNumber', value);
                      if (value.length === 10 || value.length === 11) {
                        validateIdentity(value);
                      }
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[24, 0]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="sector"
                  label="Sektör"
                  className="wizard-form-item"
                  rules={[{ required: true, message: 'Sektör seçimi zorunludur' }]}
                >
                  <Select size="large" placeholder="Sektörünüzü seçin" className="sector-select">
                    <Select.Option value="Teknoloji">
                      <Space>
                        <span>💻</span>
                        <span>Teknoloji</span>
                      </Space>
                    </Select.Option>
                    <Select.Option value="Perakende">
                      <Space>
                        <span>🛍️</span>
                        <span>Perakende</span>
                      </Space>
                    </Select.Option>
                    <Select.Option value="Üretim">
                      <Space>
                        <span>🏭</span>
                        <span>Üretim</span>
                      </Space>
                    </Select.Option>
                    <Select.Option value="Hizmet">
                      <Space>
                        <span>🤝</span>
                        <span>Hizmet</span>
                      </Space>
                    </Select.Option>
                    <Select.Option value="İnşaat">
                      <Space>
                        <span>🏗️</span>
                        <span>İnşaat</span>
                      </Space>
                    </Select.Option>
                    <Select.Option value="Sağlık">
                      <Space>
                        <span>🏥</span>
                        <span>Sağlık</span>
                      </Space>
                    </Select.Option>
                    <Select.Option value="Eğitim">
                      <Space>
                        <span>🎓</span>
                        <span>Eğitim</span>
                      </Space>
                    </Select.Option>
                    <Select.Option value="Lojistik">
                      <Space>
                        <span>🚚</span>
                        <span>Lojistik</span>
                      </Space>
                    </Select.Option>
                    <Select.Option value="Gıda">
                      <Space>
                        <span>🍽️</span>
                        <span>Gıda</span>
                      </Space>
                    </Select.Option>
                    <Select.Option value="Diğer">
                      <Space>
                        <span>📋</span>
                        <span>Diğer</span>
                      </Space>
                    </Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="employeeCount"
                  label="Çalışan Sayısı"
                  className="wizard-form-item"
                  rules={[{ required: true, message: 'Çalışan sayısı zorunludur' }]}
                >
                  <Select size="large" placeholder="Çalışan sayınızı seçin">
                    <Select.Option value="1-10">
                      <Space>
                        <TeamOutlined />
                        <span>1-10 Kişi</span>
                      </Space>
                    </Select.Option>
                    <Select.Option value="11-50">
                      <Space>
                        <TeamOutlined />
                        <span>11-50 Kişi</span>
                      </Space>
                    </Select.Option>
                    <Select.Option value="51-100">
                      <Space>
                        <TeamOutlined />
                        <span>51-100 Kişi</span>
                      </Space>
                    </Select.Option>
                    <Select.Option value="101-500">
                      <Space>
                        <TeamOutlined />
                        <span>101-500 Kişi</span>
                      </Space>
                    </Select.Option>
                    <Select.Option value="500+">
                      <Space>
                        <TeamOutlined />
                        <span>500+ Kişi</span>
                      </Space>
                    </Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[24, 0]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="taxOffice"
                  label="Vergi Dairesi"
                  className="wizard-form-item"
                >
                  <Input 
                    size="large"
                    prefix={<BankOutlined className="field-icon" />}
                    placeholder="Merkez Vergi Dairesi" 
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="tradeRegistryNumber"
                  label="Ticaret Sicil No"
                  className="wizard-form-item"
                >
                  <Input 
                    size="large"
                    placeholder="123456" 
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[24, 0]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="mersisNumber"
                  label="MERSİS No"
                  className="wizard-form-item"
                >
                  <Input 
                    size="large"
                    placeholder="0123456789012345" 
                    maxLength={16}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="annualRevenue"
                  label="Yıllık Ciro (Opsiyonel)"
                  className="wizard-form-item"
                >
                  <Select size="large" placeholder="Yıllık ciro aralığı">
                    <Select.Option value="0-1M">0 - 1 Milyon TL</Select.Option>
                    <Select.Option value="1M-5M">1 - 5 Milyon TL</Select.Option>
                    <Select.Option value="5M-10M">5 - 10 Milyon TL</Select.Option>
                    <Select.Option value="10M-50M">10 - 50 Milyon TL</Select.Option>
                    <Select.Option value="50M+">50+ Milyon TL</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">Adres Bilgileri</Divider>
            
            <Row gutter={[24, 0]}>
              <Col xs={24}>
                <Form.Item
                  name="address"
                  label="Adres"
                  className="wizard-form-item"
                >
                  <Input.TextArea 
                    size="large"
                    rows={2}
                    placeholder="Cadde, sokak, bina no" 
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[24, 0]}>
              <Col xs={24} md={8}>
                <Form.Item
                  name="city"
                  label="İl"
                  className="wizard-form-item"
                >
                  <Select 
                    size="large" 
                    showSearch
                    placeholder="İl seçin"
                  >
                    <Select.Option value="İstanbul">İstanbul</Select.Option>
                    <Select.Option value="Ankara">Ankara</Select.Option>
                    <Select.Option value="İzmir">İzmir</Select.Option>
                    <Select.Option value="Bursa">Bursa</Select.Option>
                    <Select.Option value="Antalya">Antalya</Select.Option>
                    <Select.Option value="Adana">Adana</Select.Option>
                    <Select.Option value="Kocaeli">Kocaeli</Select.Option>
                    <Select.Option value="Konya">Konya</Select.Option>
                    <Select.Option value="Gaziantep">Gaziantep</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name="state"
                  label="İlçe"
                  className="wizard-form-item"
                >
                  <Input 
                    size="large"
                    placeholder="İlçe adı" 
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name="postalCode"
                  label="Posta Kodu"
                  className="wizard-form-item"
                >
                  <Input 
                    size="large"
                    placeholder="34100" 
                    maxLength={5}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>
        );

      case 1:
        return (
          <div className="form-section">
            <div className="form-section-title">
              <UserOutlined />
              <h3>Yetkili Bilgileri</h3>
            </div>
            
            <Row gutter={[24, 0]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="contactName"
                  label="Ad Soyad"
                  className="wizard-form-item"
                  rules={[{ required: true, message: 'Ad soyad zorunludur' }]}
                >
                  <Input 
                    size="large"
                    prefix={<UserOutlined className="field-icon" />}
                    placeholder="Ahmet Yılmaz" 
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="title"
                  label="Unvan"
                  className="wizard-form-item"
                  rules={[{ required: true, message: 'Unvan zorunludur' }]}
                >
                  <Select size="large" placeholder="Unvanınızı seçin">
                    <Select.Option value="Genel Müdür">
                      <Space>
                        <SolutionOutlined />
                        <span>Genel Müdür</span>
                      </Space>
                    </Select.Option>
                    <Select.Option value="İşletme Sahibi">
                      <Space>
                        <SolutionOutlined />
                        <span>İşletme Sahibi</span>
                      </Space>
                    </Select.Option>
                    <Select.Option value="Müdür">
                      <Space>
                        <SolutionOutlined />
                        <span>Müdür</span>
                      </Space>
                    </Select.Option>
                    <Select.Option value="Yönetici">
                      <Space>
                        <SolutionOutlined />
                        <span>Yönetici</span>
                      </Space>
                    </Select.Option>
                    <Select.Option value="Muhasebe Müdürü">
                      <Space>
                        <SolutionOutlined />
                        <span>Muhasebe Müdürü</span>
                      </Space>
                    </Select.Option>
                    <Select.Option value="IT Müdürü">
                      <Space>
                        <SolutionOutlined />
                        <span>IT Müdürü</span>
                      </Space>
                    </Select.Option>
                    <Select.Option value="Satın Alma Müdürü">
                      <Space>
                        <SolutionOutlined />
                        <span>Satın Alma Müdürü</span>
                      </Space>
                    </Select.Option>
                    <Select.Option value="İnsan Kaynakları">
                      <Space>
                        <SolutionOutlined />
                        <span>İnsan Kaynakları</span>
                      </Space>
                    </Select.Option>
                    <Select.Option value="Diğer">
                      <Space>
                        <SolutionOutlined />
                        <span>Diğer</span>
                      </Space>
                    </Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[24, 0]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="email"
                  label="E-posta"
                  className="wizard-form-item"
                  rules={[
                    { required: true, message: 'E-posta zorunludur' },
                    { type: 'email', message: 'Geçerli bir e-posta girin' }
                  ]}
                  validateStatus={
                    validationResults.email?.isValid === false ? 'error' : 
                    validationResults.email?.isValid === true ? 'success' : ''
                  }
                  help={
                    validationLoading.email ? 'Kontrol ediliyor...' :
                    validationResults.email?.message
                  }
                  hasFeedback={!!validationResults.email}
                >
                  <Input 
                    size="large"
                    prefix={<MailOutlined className="field-icon" />}
                    placeholder="ahmet@sirket.com" 
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.includes('@') && value.includes('.')) {
                        validateEmail(value);
                      }
                    }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="phone"
                  label="Telefon"
                  className="wizard-form-item"
                  rules={[
                    { required: true, message: 'Telefon zorunludur' },
                    { pattern: /^[0-9]{10,11}$/, message: 'Geçerli telefon girin' }
                  ]}
                  validateStatus={
                    validationResults.phone?.isValid === false ? 'error' : 
                    validationResults.phone?.isValid === true ? 'success' : ''
                  }
                  help={
                    validationLoading.phone ? 'Doğrulanıyor...' :
                    validationResults.phone?.details?.formattedNumber || validationResults.phone?.message
                  }
                  hasFeedback={!!validationResults.phone}
                >
                  <Input 
                    size="large"
                    prefix={<PhoneOutlined className="field-icon" />}
                    placeholder="5551234567" 
                    maxLength={11}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      form.setFieldValue('phone', value);
                      if (value.length >= 10) {
                        validatePhone(value);
                      }
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[24, 0]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="fax"
                  label="Faks (Opsiyonel)"
                  className="wizard-form-item"
                >
                  <Input 
                    size="large"
                    prefix={<PhoneOutlined className="field-icon" />}
                    placeholder="2121234567" 
                    maxLength={11}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="website"
                  label="Web Sitesi (Opsiyonel)"
                  className="wizard-form-item"
                  rules={[
                    { type: 'url', message: 'Geçerli bir URL girin' }
                  ]}
                >
                  <Input 
                    size="large"
                    prefix={<GlobalOutlined className="field-icon" />}
                    placeholder="https://www.sirket.com" 
                  />
                </Form.Item>
              </Col>
            </Row>

            <Alert
              message="Önemli Bilgilendirme"
              description="Bu e-posta adresiniz hem iletişim hem de sisteme giriş için kullanılacaktır. Lütfen aktif olarak kullandığınız bir e-posta adresi girin."
              type="info"
              showIcon
              className="wizard-info-alert"
              icon={<InfoCircleOutlined />}
            />
          </div>
        );

      case 2:
        return (
          <div className="form-section">
            <div className="form-section-title">
              <LockOutlined />
              <h3>Hesap Güvenliği</h3>
            </div>
            
            <Row gutter={[24, 0]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="password"
                  label="Şifre"
                  className="wizard-form-item"
                  rules={[
                    { required: true, message: 'Şifre zorunludur' },
                    { min: 8, message: 'En az 8 karakter olmalı' },
                    { 
                      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                      message: 'Şifre gereksinimleri karşılanmıyor'
                    }
                  ]}
                >
                  <Input.Password 
                    size="large"
                    prefix={<LockOutlined className="field-icon" />}
                    placeholder="Güvenli şifreniz"
                    onChange={(e) => {
                      const value = e.target.value;
                      setPassword(value);
                      if (value.length > 0) {
                        checkPasswordStrength(value);
                      }
                    }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="confirmPassword"
                  label="Şifre Tekrar"
                  className="wizard-form-item"
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
                    prefix={<LockOutlined className="field-icon" />}
                    placeholder="Şifrenizi tekrar girin" 
                  />
                </Form.Item>
              </Col>
            </Row>

            {password && (
              <div className="password-requirements">
                <div className="password-requirements-title">
                  <SafetyOutlined /> Şifre Gereksinimleri
                </div>
                
                {/* Real-time password strength */}
                {validationResults.password && (
                  <div className="password-strength-meter">
                    <Progress 
                      percent={validationResults.password.score * 20} 
                      strokeColor={validationResults.password.color}
                      showInfo={false}
                    />
                    <span style={{ color: validationResults.password.color }}>
                      Güç: {validationResults.password.level}
                    </span>
                  </div>
                )}
                
                {passwordRequirements.map(req => (
                  <div 
                    key={req.key} 
                    className={`password-requirement-item ${req.test(password) ? 'fulfilled' : ''}`}
                  >
                    {req.test(password) ? (
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    ) : (
                      <CloseOutlined style={{ color: '#ff4d4f' }} />
                    )}
                    <span>{req.label}</span>
                  </div>
                ))}
                
                {/* Password suggestions */}
                {validationResults.password?.suggestions?.length > 0 && (
                  <Alert
                    message="Öneriler"
                    description={
                      <ul style={{ margin: 0, paddingLeft: 20 }}>
                        {validationResults.password.suggestions.map((suggestion: string, index: number) => (
                          <li key={index}>{suggestion}</li>
                        ))}
                      </ul>
                    }
                    type="info"
                    showIcon
                    style={{ marginTop: 10 }}
                  />
                )}
              </div>
            )}

            <Divider orientation="left">Sözleşmeler ve İzinler</Divider>

            <Row gutter={[24, 0]}>
              <Col xs={24}>
                <Form.Item
                  name="acceptTerms"
                  valuePropName="checked"
                  className="wizard-form-item"
                  rules={[
                    {
                      validator: (_, value) =>
                        value ? Promise.resolve() : Promise.reject(new Error('Kullanım koşullarını kabul etmelisiniz')),
                    },
                  ]}
                >
                  <Checkbox>
                    <span>
                      <a href="/terms" target="_blank" rel="noopener noreferrer">Kullanım Koşulları</a>'nı okudum ve kabul ediyorum
                    </span>
                  </Checkbox>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[24, 0]}>
              <Col xs={24}>
                <Form.Item
                  name="acceptPrivacy"
                  valuePropName="checked"
                  className="wizard-form-item"
                  rules={[
                    {
                      validator: (_, value) =>
                        value ? Promise.resolve() : Promise.reject(new Error('Gizlilik politikasını kabul etmelisiniz')),
                    },
                  ]}
                >
                  <Checkbox>
                    <span>
                      <a href="/privacy" target="_blank" rel="noopener noreferrer">Gizlilik Politikası</a>'nı okudum ve kabul ediyorum
                    </span>
                  </Checkbox>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[24, 0]}>
              <Col xs={24}>
                <Form.Item
                  name="allowMarketing"
                  valuePropName="checked"
                  className="wizard-form-item"
                  initialValue={false}
                >
                  <Checkbox>
                    <span>Stocker'dan pazarlama e-postaları almak istiyorum (Opsiyonel)</span>
                  </Checkbox>
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">Güvenlik Doğrulaması</Divider>

            <Row gutter={[24, 0]}>
              <Col xs={24}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"} // Test key
                    onChange={(token) => {
                      setCaptchaToken(token);
                      if (token) {
                        message.success('Güvenlik doğrulaması başarılı');
                      }
                    }}
                    onExpired={() => {
                      setCaptchaToken(null);
                      message.warning('Güvenlik doğrulaması süresi doldu, lütfen tekrar deneyin');
                    }}
                    onErrored={() => {
                      setCaptchaToken(null);
                      message.error('Güvenlik doğrulaması başarısız');
                    }}
                    theme="light"
                    size="normal"
                  />
                </div>
                {!captchaToken && (
                  <Alert
                    message="Robot olmadığınızı doğrulayın"
                    description="Kayıt işlemini tamamlamak için yukarıdaki güvenlik doğrulamasını tamamlamanız gerekmektedir."
                    type="warning"
                    showIcon
                  />
                )}
              </Col>
            </Row>

            {selectedPackage && (
              <div className="wizard-summary">
                <div className="wizard-summary-item">
                  <span className="wizard-summary-label">Seçili Paket:</span>
                  <span className="wizard-summary-value">{selectedPackage.name}</span>
                </div>
                <div className="wizard-summary-item">
                  <span className="wizard-summary-label">Aylık Ücret:</span>
                  <span className="wizard-summary-value">{selectedPackage.price}₺</span>
                </div>
                <div className="wizard-summary-item">
                  <span className="wizard-summary-label">Deneme Süresi:</span>
                  <span className="wizard-summary-value">14 Gün Ücretsiz</span>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="register-wizard-container">
      <Card className="wizard-card">
        <div className="wizard-header">
          <h2>Stocker'a Hoş Geldiniz</h2>
          <p>İşletmenizi dijitalleştirmek için doğru yerdesiniz</p>
        </div>

        <div className="step-progress-bar">
          <div 
            className="step-progress-fill" 
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>

        <div className="wizard-steps">
          <Steps current={currentStep}>
            {steps.map((step, index) => (
              <Step
                key={index}
                title={step.title}
                description={step.description}
                icon={step.icon}
              />
            ))}
          </Steps>
        </div>
        
        <Form
          form={form}
          layout="vertical"
          autoComplete="off"
          className="wizard-form"
        >
          <div className="wizard-form-content">
            {loading ? (
              <div className="wizard-loading">
                <Spin 
                  size="large" 
                  indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
                />
              </div>
            ) : (
              renderStepContent()
            )}
          </div>
        </Form>

        <div className="wizard-footer">
          <div className="wizard-footer-content">
            <Button
              size="large"
              onClick={prev}
              disabled={currentStep === 0}
              className="wizard-btn wizard-btn-secondary"
              icon={<ArrowLeftOutlined />}
            >
              Geri
            </Button>
            
            <Space size={8}>
              {[...Array(steps.length)].map((_, index) => (
                <div
                  key={index}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: index === currentStep ? '#667eea' : '#e8e8e8',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </Space>

            <Button 
              type="primary"
              size="large"
              loading={loading}
              onClick={next}
              className="wizard-btn wizard-btn-primary"
              icon={currentStep === steps.length - 1 ? <CheckOutlined /> : <ArrowRightOutlined />}
            >
              {currentStep === steps.length - 1 ? 'Kaydı Tamamla' : 'İleri'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};