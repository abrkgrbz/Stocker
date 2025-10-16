import React, { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  Steps, 
  Button, 
  Form, 
  Input, 
  Select, 
  Typography, 
  Space, 
  Row, 
  Col,
  Divider,
  Alert,
  Badge,
  Tag,
  List,
  message,
  Modal,
  Result,
  Spin,
  Checkbox,
  Popover
} from 'antd';
import {
  CheckCircleOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  CreditCardOutlined,
  RocketOutlined,
  CheckOutlined,
  CloseOutlined,
  InfoCircleOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
  GlobalOutlined,
  TeamOutlined,
  BarChartOutlined,
  CloudOutlined,
  CustomerServiceOutlined,
  GiftOutlined
} from '@ant-design/icons';
import { apiClient } from '@/shared/api/client';
import { useApiCall } from '@/shared/hooks/useAdvancedAsync';
import PasswordStrength from '@/shared/components/PasswordStrength';
import { useSignalRValidation } from '@/shared/hooks/useSignalR';
import { ModuleSelection } from './ModuleSelection';
import { RegisterWizard } from './RegisterWizard';
import { NeonWizard } from './NeonWizard';
// Lazy load heavy component (1839 lines)
const ModernWizard = lazy(() => import('./ModernWizard').then(module => ({ default: module.ModernWizard })));
import { PremiumPackageCard } from './PremiumPackageCard';
import './style.css';
import './module-selection.css';
import './premium-package-selection.css';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingPeriod: 'Monthly' | 'Yearly';
  features: string[];
  maxUsers: number;
  maxStorage: number;
  modules: string[];
  isPopular?: boolean;
  discount?: number;
}

interface ModulePackageData {
  selectedModules: string[];
  basePackage: string;
  totalPrice: number;
}

interface RegisterFormData {
  // Company Info
  companyName: string;
  companyCode: string;
  domain?: string;
  
  // Contact Info
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  
  // Address
  address?: string;
  city?: string;
  country?: string;
  
  // Account
  password: string;
  confirmPassword: string;
  
  // Package
  packageId: string;
  billingPeriod: 'Monthly' | 'Yearly';
}

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<'Monthly' | 'Yearly'>('Monthly');
  const [loading, setLoading] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [tenantId, setTenantId] = useState<string | null>(null); // Store tenant ID after registration
  const [passwordStrength, setPasswordStrength] = useState<any>(null);
  const [password, setPassword] = useState('');
  const [modulePackageData, setModulePackageData] = useState<ModulePackageData | null>(null);
  const [form] = Form.useForm();

  // SignalR Validation Hook
  const {
    isConnected,
    emailValidation,
    passwordStrength: signalRPasswordStrength,
    domainCheck,
    phoneValidation,
    companyNameCheck,
    identityValidation,
    tenantCodeValidation,
    validateEmail,
    checkPasswordStrength,
    checkDomain,
    validatePhone,
    checkCompanyName,
    validateIdentity,
    validateTenantCode,
    error: validationError
  } = useSignalRValidation();

  // Fetch available packages
  useEffect(() => {
    fetchPackages();
  }, []);

  // Show connection status
  useEffect(() => {
    if (isConnected) {
      message.success('Real-time validation bağlantısı kuruldu', 2);
    }
  }, [isConnected]);

  // Update password strength from SignalR
  useEffect(() => {
    if (signalRPasswordStrength) {
      setPasswordStrength({
        score: signalRPasswordStrength.score,
        level: signalRPasswordStrength.level,
        isAcceptable: signalRPasswordStrength.score >= 3,
        feedback: signalRPasswordStrength.suggestions
      });
    }
  }, [signalRPasswordStrength]);

  const fetchPackages = async () => {
    try {
      // Fetch real packages from API
      const response = await apiClient.get('/api/public/packages?OnlyActive=true');
      
      
      if (response.data?.success && response.data?.data && response.data.data.length > 0) {
        const packages = response.data.data.map((pkg: any) => ({
          id: pkg.id, // Real GUID from backend
          name: pkg.name,
          description: pkg.description,
          price: pkg.basePrice?.amount || 0,
          currency: pkg.basePrice?.currency || pkg.currency || '₺',
          type: pkg.type,
          billingPeriod: 'Monthly',
          features: pkg.features?.map((f: any) => f.featureName || f.name || f) || [],
          maxUsers: pkg.maxUsers || 0,
          maxStorage: pkg.maxStorage || 0,
          modules: pkg.modules?.map((m: any) => m.moduleName || m) || [],
          isPopular: pkg.type === 'Professional' || pkg.isPopular,
          discount: pkg.discount || 0,
          trialDays: pkg.trialDays || 14
        }));
        
        setPackages(packages);
        // Don't auto-select - let user choose
      } else {
        // Fallback to mock packages if API fails
        const mockPackages: Package[] = [
        {
          id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', // Mock GUID
          name: 'Başlangıç',
          description: 'Küçük işletmeler için ideal',
          price: 499,
          currency: '₺',
          billingPeriod: 'Monthly',
          features: [
            '5 Kullanıcı',
            '10 GB Depolama',
            'CRM Modülü',
            'Temel Raporlama',
            'Email Desteği',
            'Mobil Uygulama'
          ],
          maxUsers: 5,
          maxStorage: 10,
          modules: ['CRM'],
        },
        {
          id: 'b2c3d4e5-f6a7-8901-bcde-f23456789012', // Mock GUID
          name: 'Profesyonel',
          description: 'Büyüyen işletmeler için',
          price: 999,
          currency: '₺',
          billingPeriod: 'Monthly',
          features: [
            '20 Kullanıcı',
            '50 GB Depolama',
            'CRM + Stok Modülü',
            'Gelişmiş Raporlama',
            'Öncelikli Destek',
            'API Erişimi',
            'Özel Eğitim'
          ],
          maxUsers: 20,
          maxStorage: 50,
          modules: ['CRM', 'Inventory'],
          isPopular: true,
          discount: 20
        },
        {
          id: 'c3d4e5f6-a7b8-9012-cdef-345678901234', // Mock GUID
          name: 'Enterprise',
          description: 'Büyük ölçekli işletmeler için',
          price: 2499,
          currency: '₺',
          billingPeriod: 'Monthly',
          features: [
            'Sınırsız Kullanıcı',
            '500 GB Depolama',
            'Tüm Modüller',
            'Özel Raporlama',
            '7/24 Destek',
            'Özel Entegrasyonlar',
            'SLA Garantisi',
            'Özel Sunucu Seçeneği'
          ],
          maxUsers: -1,
          maxStorage: 500,
          modules: ['CRM', 'Inventory', 'Finance', 'HR', 'Projects'],
        }
      ];
        setPackages(mockPackages);
        // Don't auto-select - let user choose
      }
    } catch (error: any) {
      message.error('Paketler API\'den yüklenemedi, mock data kullanılıyor');
      
      // Use mock packages on error
      const mockPackages: Package[] = [
        {
          id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          name: 'Başlangıç',
          description: 'Küçük işletmeler için ideal',
          price: 499,
          currency: '₺',
          billingPeriod: 'Monthly',
          features: ['5 Kullanıcı', '10 GB Depolama', 'CRM Modülü'],
          maxUsers: 5,
          maxStorage: 10,
          modules: ['CRM'],
        },
        {
          id: 'b2c3d4e5-f6a7-8901-bcde-f23456789012',
          name: 'Profesyonel',
          description: 'Büyüyen işletmeler için',
          price: 999,
          currency: '₺',
          billingPeriod: 'Monthly',
          features: ['20 Kullanıcı', '50 GB Depolama', 'Tüm Modüller'],
          maxUsers: 20,
          maxStorage: 50,
          modules: ['CRM', 'Inventory'],
          isPopular: true,
        },
        {
          id: 'c3d4e5f6-a7b8-9012-cdef-345678901234',
          name: 'Enterprise',
          description: 'Kurumsal çözümler',
          price: 2499,
          currency: '₺',
          billingPeriod: 'Monthly',
          features: ['Sınırsız Kullanıcı', '500 GB Depolama'],
          maxUsers: -1,
          maxStorage: 500,
          modules: ['CRM', 'Inventory', 'Finance'],
        }
      ];
      setPackages(mockPackages);
      // Don't auto-select - let user choose
    }
  };

  const handleModuleSelectionComplete = (selectedModules: string[], basePackage: string, totalPrice: number) => {
    setModulePackageData({
      selectedModules,
      basePackage,
      totalPrice
    });
    setCurrentStep(1);
  };

  const handlePackageSelect = (pkg: Package) => {
    setSelectedPackage(pkg);
    setCurrentStep(1);
  };

  const handleRegistration = async (values: any) => {
    setLoading(true);
    try {
      // Backend'in beklediği formatı oluştur
      const [firstName, ...lastNameParts] = values.contactName?.split(' ') || ['', ''];
      const lastName = lastNameParts.join(' ') || firstName;
      
      const registrationData = {
        // Şirket bilgileri
        companyName: values.companyName,
        companyCode: values.companyCode,
        identityType: values.identityType,
        identityNumber: values.identityNumber,
        sector: values.sector,
        employeeCount: values.employeeCount,
        
        // İletişim bilgileri
        contactName: values.contactName,
        contactEmail: values.contactEmail,
        contactPhone: values.contactPhone,
        contactTitle: values.contactTitle,
        
        // Kullanıcı bilgileri
        email: values.contactEmail, // Backend email field'ı bekliyor
        username: values.contactEmail?.split('@')[0] || values.companyCode, // Email'den username oluştur
        firstName: firstName,
        lastName: lastName,
        password: values.password,
        
        // Domain ve paket
        domain: `${values.companyCode}`,
        packageId: selectedPackage?.id,
        billingPeriod
      };

      // API call to register tenant (creates INACTIVE tenant)
      const response = await apiClient.post('/api/public/tenant-registration/register', registrationData);
      
      if (response.data?.success && response.data?.data?.id) {
        // Store tenant ID for payment step
        setTenantId(response.data.data.id);
        message.success('Kayıt başarılı! Şimdi ödeme adımına geçiliyor...');
        
        // Move to payment step
        setCurrentStep(2);
      } else {
        message.error('Kayıt sırasında bir hata oluştu');
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Kayıt işlemi başarısız');
    } finally {
      setLoading(false);
    }
  };

  const simulatePayment = async (paymentMethod: string) => {
    // Check if we have tenant ID from registration
    if (!tenantId) {
      message.error('Kayıt bilgileri bulunamadı. Lütfen önce kayıt işlemini tamamlayın.');
      setCurrentStep(1);
      return;
    }
    
    // Redirect to realistic payment page with tenant ID
    const params = new URLSearchParams({
      tenantId: tenantId, // Use actual tenant ID from registration
      packageId: selectedPackage?.id || '',
      package: selectedPackage?.name || '',
      amount: calculatePrice().toString(),
      period: billingPeriod,
      company: form.getFieldValue('companyName'),
      email: form.getFieldValue('contactEmail'),
      method: paymentMethod
    });
    
    navigate(`/payment?${params.toString()}`);
  };

  const calculatePrice = () => {
    if (modulePackageData) {
      // Use module-based pricing
      let price = modulePackageData.totalPrice;
      
      // Apply yearly discount
      if (billingPeriod === 'Yearly') {
        price = price * 12 * 0.8; // 20% yearly discount
      }
      
      return Math.floor(price);
    }
    
    // Fallback to old pricing
    if (!selectedPackage || !selectedPackage.price) return 0;
    
    let price = selectedPackage.price;
    
    // Apply yearly discount
    if (billingPeriod === 'Yearly') {
      price = price * 12 * 0.8; // 20% yearly discount
    }
    
    // Apply package discount if any
    if (selectedPackage.discount) {
      price = price * (1 - selectedPackage.discount / 100);
    }
    
    return Math.floor(price);
  };

  const renderModuleSelection = () => (
    <ModuleSelection
      onComplete={handleModuleSelectionComplete}
      initialModules={modulePackageData?.selectedModules}
      initialPackage={modulePackageData?.basePackage}
    />
  );

  const renderPackageSelection = () => (
    <div className="package-selection-wrapper">
      <div className="floating-shapes">
        <div className="floating-shape"></div>
        <div className="floating-shape"></div>
        <div className="floating-shape"></div>
      </div>
      
      <div className="billing-toggle-container">
        <div className="billing-toggle">
          <button 
            className={`billing-toggle-btn ${billingPeriod === 'Monthly' ? 'active' : ''}`}
            onClick={() => setBillingPeriod('Monthly')}
          >
            Aylık
          </button>
          <button 
            className={`billing-toggle-btn ${billingPeriod === 'Yearly' ? 'active' : ''}`}
            onClick={() => setBillingPeriod('Yearly')}
          >
            Yıllık 
            <span className="discount-badge">💸 %20 İndirim</span>
          </button>
        </div>
      </div>

      <div className="packages-grid">
        {packages.map((pkg) => (
          <PremiumPackageCard
            key={pkg.id}
            package={pkg}
            isSelected={selectedPackage?.id === pkg.id}
            onSelect={handlePackageSelect}
            billingPeriod={billingPeriod}
          />
        ))}
      </div>

      <div className="package-comparison">
        <Card style={{ marginTop: 48 }}>
          <Title level={4}>
            <InfoCircleOutlined /> Neden Stocker?
          </Title>
          <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
            <Col xs={24} md={6}>
              <Space direction="vertical" align="center" style={{ width: '100%' }}>
                <ThunderboltOutlined style={{ fontSize: 32, color: '#667eea' }} />
                <Text strong>Hızlı Kurulum</Text>
                <Text type="secondary" style={{ textAlign: 'center' }}>
                  5 dakikada başlayın
                </Text>
              </Space>
            </Col>
            <Col xs={24} md={6}>
              <Space direction="vertical" align="center" style={{ width: '100%' }}>
                <SafetyOutlined style={{ fontSize: 32, color: '#667eea' }} />
                <Text strong>%99.9 Uptime</Text>
                <Text type="secondary" style={{ textAlign: 'center' }}>
                  SLA garantisi
                </Text>
              </Space>
            </Col>
            <Col xs={24} md={6}>
              <Space direction="vertical" align="center" style={{ width: '100%' }}>
                <CustomerServiceOutlined style={{ fontSize: 32, color: '#667eea' }} />
                <Text strong>7/24 Destek</Text>
                <Text type="secondary" style={{ textAlign: 'center' }}>
                  Her zaman yanınızdayız
                </Text>
              </Space>
            </Col>
            <Col xs={24} md={6}>
              <Space direction="vertical" align="center" style={{ width: '100%' }}>
                <GiftOutlined style={{ fontSize: 32, color: '#667eea' }} />
                <Text strong>14 Gün Deneme</Text>
                <Text type="secondary" style={{ textAlign: 'center' }}>
                  Kredi kartı gerekmez
                </Text>
              </Space>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );

  const handleWizardComplete = (data: any) => {
    // Wizard'dan gelen veriyi kaydet ve ödeme adımına geç
    setTenantId(data.id);
    message.success('Kayıt başarılı! Şimdi ödeme adımına geçiliyor...');
    setCurrentStep(2);
  };

  const renderRegistrationForm = () => {
    return (
      <Suspense fallback={<div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" tip="Loading registration wizard..." /></div>}>
        <ModernWizard 
        onComplete={handleWizardComplete}
        selectedPackage={selectedPackage}
        signalRValidation={{
          isConnected,
          emailValidation,
          passwordStrength: signalRPasswordStrength,
          domainCheck,
          phoneValidation,
          companyNameCheck,
          identityValidation,
          tenantCodeValidation,
          validateEmail,
          checkPasswordStrength,
          checkDomain,
          validatePhone,
          checkCompanyName,
          validateIdentity,
          validateTenantCode,
          error: validationError
        }}
      />
      </Suspense>
    );
  };

  const renderPayment = () => (
    <div className="payment-section">
      <Row gutter={[48, 24]} justify="center">
        <Col xs={24} md={16}>
          <Card>
            <Title level={3}>
              <CreditCardOutlined /> Ödeme Bilgileri
            </Title>

            {paymentProcessing ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <Spin size="large" />
                <Title level={4} style={{ marginTop: 24 }}>
                  Ödeme işleniyor...
                </Title>
                <Text type="secondary">
                  Lütfen bekleyin, ödemeniz güvenli bir şekilde işleniyor.
                </Text>
              </div>
            ) : (
              <>
                <Alert
                  message="Kayıt Başarılı!"
                  description={`Tenant ID: ${tenantId}. Şimdi ödeme yaparak hesabınızı aktifleştirin.`}
                  type="info"
                  showIcon
                  style={{ marginBottom: 24 }}
                />

                <div className="payment-methods">
                  <Title level={5}>Ödeme Yöntemi Seçin</Title>
                  
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Card 
                        hoverable 
                        className="payment-method-card"
                        onClick={() => simulatePayment('credit_card')}
                      >
                        <Space direction="vertical" align="center" style={{ width: '100%' }}>
                          <CreditCardOutlined style={{ fontSize: 48, color: '#667eea' }} />
                          <Text strong>Kredi Kartı</Text>
                          <Text type="secondary">Visa, Mastercard, Amex</Text>
                        </Space>
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card 
                        hoverable 
                        className="payment-method-card"
                        onClick={() => simulatePayment('bank_transfer')}
                      >
                        <Space direction="vertical" align="center" style={{ width: '100%' }}>
                          <img 
                            src="https://cdn-icons-png.flaticon.com/512/2830/2830284.png" 
                            alt="Bank Transfer" 
                            style={{ width: 48, height: 48 }}
                          />
                          <Text strong>Banka Havalesi / EFT</Text>
                          <Text type="secondary">3 iş günü içinde</Text>
                        </Space>
                      </Card>
                    </Col>
                  </Row>
                </div>

                <Divider />

                <div className="payment-summary">
                  <Title level={5}>Ödeme Özeti</Title>
                  <div className="summary-details">
                    <div className="summary-row">
                      <Text>Şirket:</Text>
                      <Text strong>{form.getFieldValue('companyName')}</Text>
                    </div>
                    <div className="summary-row">
                      <Text>Paket:</Text>
                      <Text strong>{selectedPackage?.name}</Text>
                    </div>
                    <div className="summary-row">
                      <Text>Dönem:</Text>
                      <Text strong>{billingPeriod === 'Monthly' ? 'Aylık' : 'Yıllık'}</Text>
                    </div>
                    <Divider />
                    <div className="summary-row total">
                      <Title level={5}>Toplam Tutar:</Title>
                      <Title level={4} style={{ color: '#667eea', margin: 0 }}>
                        {selectedPackage?.currency}{calculatePrice()}
                      </Title>
                    </div>
                  </div>
                </div>

                <Alert
                  message="Güvenli Ödeme"
                  description="Ödeme bilgileriniz 256-bit SSL şifreleme ile korunmaktadır."
                  type="success"
                  showIcon
                  icon={<SafetyOutlined />}
                  style={{ marginTop: 24 }}
                />
              </>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );

  // Directly render the wizard with integrated package selection
  return renderRegistrationForm();
};