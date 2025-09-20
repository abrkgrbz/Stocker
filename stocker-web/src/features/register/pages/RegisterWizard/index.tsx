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
  ClockCircleOutlined,
  ShopOutlined,
  CheckOutlined,
  HomeOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { useSignalRValidation } from '@/shared/hooks/useSignalR';
import { apiClient } from '@/shared/api/client';
import PasswordStrength from '@/shared/components/PasswordStrength';
import { useSecureAuthStore } from '@/app/store/secureAuth.store';
import { showApiResponse, showRegistrationSuccess } from '@/shared/utils/sweetAlert';
import Swal from 'sweetalert2';
import { navigateToSubdomain } from '@/shared/utils/subdomain';
import './style.css';

const { Title, Text, Paragraph } = Typography;

interface RegisterData {
  // Step 1: Account Type
  accountType: 'company' | 'individual';
  
  // Step 2: Basic Info
  companyName?: string;
  fullName?: string;
  subdomain?: string;
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
    accountType: 'company', // Default to company
    identityType: 'vergi' 
  });
  const [loading, setLoading] = useState(false);
  const [identityType, setIdentityType] = useState<'tc' | 'vergi'>('vergi');
  const [isValidating, setIsValidating] = useState(false);
  const [subdomain, setSubdomain] = useState('');
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null);
  const [checkingSubdomain, setCheckingSubdomain] = useState(false);
  // const [completionTime, setCompletionTime] = useState(3); // minutes - Removed
  const [progressPercent, setProgressPercent] = useState(0);
  
  const {
    emailValidation,
    identityValidation,
    domainCheck,
    validateEmail,
    validateIdentity,
    checkDomain,
    isConnected
  } = useSignalRValidation();

  // Calculate progress
  useEffect(() => {
    const totalSteps = 6;
    const percent = Math.round(((currentStep + 1) / totalSteps) * 100);
    setProgressPercent(percent);
  }, [currentStep]);

  useEffect(() => {
    if (identityValidation) {
            setIsValidating(false);
    }
  }, [identityValidation]);

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
      
      // Auto-generate subdomain suggestion
      const suggestedSubdomain = value
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 30);
      
      if (suggestedSubdomain && suggestedSubdomain !== subdomain) {
        setSubdomain(suggestedSubdomain);
        checkSubdomainAvailability(suggestedSubdomain);
      }
    }
  };

  // Check subdomain availability via SignalR
  const checkSubdomainAvailability = async (domain: string) => {
    if (!domain || domain.length < 3) {
      setSubdomainAvailable(null);
      return;
    }

    // Use SignalR if connected, otherwise fallback to API
    if (isConnected) {
      setCheckingSubdomain(true);
      // SignalR will handle the response via the hook
      // The response will come through the validation hub
    } else {
      // Fallback to direct API call
      setCheckingSubdomain(true);
      try {
        const response = await apiClient.get(`/api/tenants/check-subdomain/${domain}`);
        setSubdomainAvailable(response.data.available);
      } catch (error) {
        // If error, assume it's available (API might not be implemented yet)
        setSubdomainAvailable(true);
      } finally {
        setCheckingSubdomain(false);
      }
    }
  };

  // Debounced subdomain check
  useEffect(() => {
    const timer = setTimeout(() => {
      if (subdomain && subdomain.length >= 3) {
        if (isConnected) {
          // Use SignalR for real-time validation
          checkDomain(subdomain);
          setCheckingSubdomain(true);
        } else {
          // Fallback to API
          checkSubdomainAvailability(subdomain);
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [subdomain, isConnected, checkDomain]);

  // Listen to SignalR domain check results
  useEffect(() => {
    if (domainCheck) {
      setSubdomainAvailable(domainCheck.isAvailable);
      setCheckingSubdomain(false);
    }
  }, [domainCheck]);

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
      showApiResponse.toast.error('Lütfen gerekli alanları doldurun');
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      const values = await form.validateFields();
      const allData = { ...registerData, ...values };
      
      // Show loading alert
      showApiResponse.loading('Hesabınız oluşturuluyor...');
      
      // Prepare registration data for API
      const registrationData = {
        // User info
        email: allData.email,
        password: allData.password,
        firstName: allData.fullName?.split(' ')[0] || allData.contactName?.split(' ')[0] || '',
        lastName: allData.fullName?.split(' ').slice(1).join(' ') || allData.contactName?.split(' ').slice(1).join(' ') || '',
        username: allData.email.split('@')[0],
        
        // Company info
        companyName: allData.companyName || allData.fullName,
        companyCode: allData.subdomain || allData.companyName?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'company',
        domain: allData.subdomain || allData.companyName?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'company',
        
        // Identity info
        identityType: allData.identityType,
        identityNumber: allData.identityNumber,
        
        // Business details
        sector: allData.sector,
        employeeCount: allData.employeeCount,
        
        // Contact info
        contactName: allData.fullName || allData.contactName || `${allData.firstName} ${allData.lastName}`,
        phoneNumber: allData.phone,
        title: allData.accountType === 'company' ? 'Yönetici' : 'Kullanıcı'
      };
      
      // Call actual API
      const response = await apiClient.post('/api/auth/register', registrationData);
      
      // Close loading alert
      Swal.close();
      
      // Check if registration was successful
      // API might return data directly or wrapped in response.data
      const responseData = response.data;
      
      if (response.status === 200 || response.status === 201) {
        // Show success message with email verification info
        await showRegistrationSuccess(allData.email);
        
        // Auto login after registration
        try {
          // Small delay before login attempt
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const loginResponse = await apiClient.post('/api/auth/login', {
            email: allData.email,
            password: allData.password
          });
          
          if (loginResponse.data.accessToken || loginResponse.data.token) {
            const token = loginResponse.data.accessToken || loginResponse.data.token;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(loginResponse.data.user || loginResponse.data));
            
            // Show final success and redirect
            await showApiResponse.success(
              'Hesabınız başarıyla oluşturuldu ve giriş yapıldı. Yönlendiriliyorsunuz...',
              'Hoş Geldiniz!'
            );
            
            // Redirect to subdomain if available
            setTimeout(() => {
              if (response.data.subdomain) {
                // Navigate to the tenant's subdomain
                navigateToSubdomain(response.data.subdomain, '/dashboard');
              } else {
                navigate('/dashboard');
              }
            }, 1000);
          } else {
            throw new Error('No token received');
          }
        } catch (loginError: any) {
          // Error handling removed for production
          // If auto-login fails, still show success but redirect to login
          await showApiResponse.info(
            'Hesabınız oluşturuldu. E-posta doğrulaması sonrası giriş yapabilirsiniz.',
            'Kayıt Başarılı'
          );
          
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }
      } else {
        // Show error with API message
        showApiResponse.error(
          { response: { data: responseData } },
          'Kayıt işlemi başarısız oldu'
        );
      }
    } catch (error: any) {
      // Error handling removed for production
      // Close loading alert if open
      Swal.close();
      
      // Parse error details
      let errorMessage = 'Kayıt sırasında bir hata oluştu';
      let errorDetails = null;
      
      if (error.response?.data) {
        const data = error.response.data;
        
        // Check for validation errors
        if (data.errors) {
          // If errors is an object with field-specific errors
          if (typeof data.errors === 'object' && !Array.isArray(data.errors)) {
            const fieldErrors: string[] = [];
            Object.entries(data.errors).forEach(([field, errors]: [string, any]) => {
              if (Array.isArray(errors)) {
                errors.forEach(err => {
                  fieldErrors.push(`${field}: ${err}`);
                });
              } else {
                fieldErrors.push(`${field}: ${errors}`);
              }
            });
            
            if (fieldErrors.length > 0) {
              errorMessage = 'Lütfen formdaki hataları düzeltin';
              errorDetails = fieldErrors;
            }
          }
          // If errors is a simple array
          else if (Array.isArray(data.errors)) {
            errorMessage = 'Kayıt işlemi başarısız';
            errorDetails = data.errors;
          }
        }
        // Check for general message
        else if (data.message) {
          errorMessage = data.message;
        }
        // Check for title and detail (API problem response)
        else if (data.title) {
          errorMessage = data.title;
          if (data.detail) {
            errorDetails = [data.detail];
          }
        }
      }
      
      // Show error with parsed details
      if (errorDetails && Array.isArray(errorDetails) && errorDetails.length > 0) {
        // Show validation errors in a formatted way
        Swal.fire({
          icon: 'error',
          title: 'Kayıt Hatası',
          html: `
            <div style="text-align: left;">
              <p>${errorMessage}</p>
              <ul style="margin-top: 10px; padding-left: 20px;">
                ${errorDetails.map(err => `<li style="margin: 5px 0;">${err}</li>`).join('')}
              </ul>
            </div>
          `,
          confirmButtonText: 'Tamam',
          confirmButtonColor: '#667eea',
          width: '500px'
        });
      } else {
        // Show general error
        showApiResponse.error(error, errorMessage);
      }
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
                İşletmeniz için kurumsal hesap mı, yoksa kişisel kullanım için bireysel hesap mı açmak istiyorsunuz?
              </Paragraph>
            </div>

            <Form.Item name="accountType" rules={[{ required: true, message: 'Hesap türü seçimi zorunludur' }]}>
              <Radio.Group 
                size="large" 
                className="account-type-cards"
              >
                <Space direction="vertical" size={16} style={{ width: '100%' }}>
                  <Radio.Button value="company" className="account-type-card selected-default">
                    <div className="card-content">
                      <div className="selection-indicator">
                        <CheckOutlined />
                      </div>
                      <ShopOutlined className="card-icon company-icon" />
                      <div className="card-text">
                        <Title level={4}>Kurumsal Hesap</Title>
                        <Text type="secondary">Şirketler ve işletmeler için profesyonel çözüm</Text>
                      </div>
                      <div className="card-benefits">
                        <ul className="benefit-list">
                          <li>Sınırsız kullanıcı ekleme</li>
                          <li>E-Fatura ve E-Arşiv entegrasyonu</li>
                          <li>Gelişmiş raporlama ve analiz</li>
                          <li>Özel destek ve eğitim</li>
                        </ul>
                      </div>
                      <Tag color="green" className="recommended-tag">
                        <CheckCircleOutlined /> Önerilen
                      </Tag>
                    </div>
                  </Radio.Button>

                  <Radio.Button value="individual" className="account-type-card">
                    <div className="card-content">
                      <div className="selection-indicator">
                        <CheckOutlined />
                      </div>
                      <UserOutlined className="card-icon individual-icon" />
                      <div className="card-text">
                        <Title level={4}>Bireysel Hesap</Title>
                        <Text type="secondary">Freelancer ve bireysel kullanıcılar için ideal</Text>
                      </div>
                      <div className="card-benefits">
                        <ul className="benefit-list">
                          <li>Tek kullanıcı hesabı</li>
                          <li>Temel stok takibi</li>
                          <li>Basit raporlama</li>
                          <li>E-posta desteği</li>
                        </ul>
                      </div>
                    </div>
                  </Radio.Button>
                </Space>
              </Radio.Group>
            </Form.Item>

            <Alert
              message="Bilgi"
              description="Hesap türünüzü daha sonra yükseltebilir veya değiştirebilirsiniz."
              type="info"
              showIcon
              style={{ marginTop: 24 }}
            />
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
                      <ShopOutlined style={{ marginRight: 8, color: '#667eea' }} />
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
                    suffixIcon={<ShopOutlined />}
                  />
                </Form.Item>
              ) : null}

              {registerData.accountType === 'company' && (
                <Form.Item
                  name="subdomain"
                  label={
                    <span>
                      <HomeOutlined style={{ marginRight: 8, color: '#667eea' }} />
                      Web Adresi (Subdomain) <Text type="danger">*</Text>
                    </span>
                  }
                  rules={[
                    { required: true, message: 'Web adresi zorunludur' },
                    { min: 3, message: 'En az 3 karakter olmalıdır' },
                    { max: 30, message: 'En fazla 30 karakter olabilir' },
                    { pattern: /^[a-z0-9][a-z0-9-]*[a-z0-9]$/, message: 'Sadece küçük harf, rakam ve tire kullanabilirsiniz' }
                  ]}
                  validateStatus={
                    checkingSubdomain ? 'validating' :
                    subdomainAvailable === false ? 'error' :
                    subdomainAvailable === true ? 'success' : ''
                  }
                  hasFeedback={subdomain.length > 0}
                  help={
                    subdomainAvailable === false ? 'Bu adres kullanımda, başka bir tane deneyin' :
                    subdomainAvailable === true ? 'Bu adres müsait!' : 
                    subdomain.length > 0 && subdomain.length < 3 ? 'En az 3 karakter olmalıdır' : ''
                  }
                  extra={
                    <div style={{ marginTop: 8 }}>
                      <Text type="secondary">Şirketinizin web adresi: </Text>
                      <Text strong style={{ color: '#667eea' }}>
                        {subdomain || 'sirketiniz'}.stoocker.app
                      </Text>
                    </div>
                  }
                >
                  <Input
                    size="large"
                    placeholder="sirketiniz"
                    value={subdomain}
                    onChange={(e) => {
                      const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                      setSubdomain(value);
                      form.setFieldsValue({ subdomain: value });
                    }}
                    prefix={<HomeOutlined style={{ color: '#999' }} />}
                    suffix={
                      checkingSubdomain ? <LoadingOutlined /> :
                      subdomainAvailable === true ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> :
                      subdomainAvailable === false ? <CloseOutlined style={{ color: '#f5222d' }} /> : null
                    }
                    addonAfter=".stoocker.app"
                  />
                </Form.Item>
              )}

              {registerData.accountType === 'individual' ? (
                <Form.Item 
                  name="fullName" 
                  label={
                    <span>
                      <UserOutlined style={{ marginRight: 8, color: '#667eea' }} />
                      Ad Soyad <Text type="danger">*</Text>
                    </span>
                  }
                  rules={[{ required: true, message: 'Ad soyad zorunludur' }]}
                >
                  <Input 
                    size="large" 
                    placeholder="Adınız ve soyadınız"
                    prefix={<UserOutlined style={{ color: '#999' }} />}
                  />
                </Form.Item>
              ) : null}

              <div className="identity-selector">
                <Text strong style={{ marginBottom: 8, display: 'block' }}>
                  <IdcardOutlined style={{ marginRight: 8, color: '#667eea' }} />
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
                    {identityType === 'tc' ? 
                      <IdcardOutlined style={{ marginRight: 8, color: '#667eea' }} /> : 
                      <BankOutlined style={{ marginRight: 8, color: '#667eea' }} />
                    }
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
                  onChange={async (e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    form.setFieldsValue({ identityNumber: value });
                    if (value.length === (identityType === 'tc' ? 11 : 10)) {
                      setIsValidating(true);
                                            try {
                        await validateIdentity(value);
                                              } catch (error) {
                        // Error handling removed for production
                      } finally {
                        setTimeout(() => setIsValidating(false), 1000);
                      }
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
        <div className="wizard-header-content">
          <div className="wizard-logo">
            <RocketOutlined />
            <span>Stocker</span>
          </div>
          <Button 
            className="wizard-home-button" 
            onClick={() => navigate('/')}
            icon={<HomeOutlined />}
            type="primary"
            size="large"
            style={{ 
              background: 'white', 
              color: '#667eea',
              border: 'none',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            Anasayfaya Dön
          </Button>
        </div>
        
        <div className="wizard-progress">
          <div className="wizard-title">
            {currentStep === 0 && (
              <>
                <Title level={3} style={{ color: 'white', margin: 0 }}>Kayıt Sihirbazına Hoş Geldiniz</Title>
                <Text style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Hesabınızı oluşturmak için adımları takip edin</Text>
              </>
            )}
            {currentStep === 1 && (
              <>
                <Title level={3} style={{ color: 'white', margin: 0 }}>Kimlik Doğrulama</Title>
                <Text style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Güvenliğiniz için kimlik bilgilerinizi doğrulayın</Text>
              </>
            )}
            {currentStep === 2 && (
              <>
                <Title level={3} style={{ color: 'white', margin: 0 }}>İşletme Profili</Title>
                <Text style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Size özel çözümler sunabilmemiz için</Text>
              </>
            )}
            {currentStep === 3 && (
              <>
                <Title level={3} style={{ color: 'white', margin: 0 }}>İletişim Tercihleri</Title>
                <Text style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Size ulaşabileceğimiz bilgiler</Text>
              </>
            )}
            {currentStep === 4 && (
              <>
                <Title level={3} style={{ color: 'white', margin: 0 }}>Güvenlik Ayarları</Title>
                <Text style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Hesabınızı korumak için güçlü bir şifre</Text>
              </>
            )}
            {currentStep === 5 && (
              <>
                <Title level={3} style={{ color: 'white', margin: 0 }}>Son Adım!</Title>
                <Text style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Sözleşmeleri onaylayın ve başlayalım</Text>
              </>
            )}
          </div>
          <div className="step-indicators">
            {['Hesap Türü', 'Temel Bilgiler', 'İşletme', 'İletişim', 'Güvenlik', 'Onay'].map((step, index) => (
              <div 
                key={index} 
                className={`step-indicator ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
              >
                <div className="step-number">
                  {index < currentStep ? <CheckOutlined /> : index + 1}
                </div>
                <span className="step-label">{step}</span>
              </div>
            ))}
          </div>
          <Progress 
            percent={progressPercent} 
            strokeColor="#667eea"
            showInfo={false}
            style={{ marginBottom: 0 }}
          />
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
      </div>
    </div>
  );
};

export default RegisterWizard;