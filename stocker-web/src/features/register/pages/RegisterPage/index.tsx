import React, { useState, useEffect } from 'react';
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
import PasswordStrength from '@/shared/components/PasswordStrength';
import { useSignalRValidation } from '@/shared/hooks/useSignalR';
import './style.css';

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
  const [form] = Form.useForm();

  // SignalR Validation Hook
  const {
    isConnected,
    emailValidation,
    passwordStrength: signalRPasswordStrength,
    domainCheck,
    phoneValidation,
    companyNameCheck,
    validateEmail,
    checkPasswordStrength,
    checkDomain,
    validatePhone,
    checkCompanyName,
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
      const response = await apiClient.get('/api/public/packages');
      
      
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
        // Auto-select first package
        if (packages.length > 0 && !selectedPackage) {
          setSelectedPackage(packages[0]);
        }
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
        // Auto-select first package
        if (mockPackages.length > 0 && !selectedPackage) {
          setSelectedPackage(mockPackages[0]);
        }
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
      // Auto-select first package
      if (mockPackages.length > 0 && !selectedPackage) {
        setSelectedPackage(mockPackages[0]);
      }
    }
  };

  const handlePackageSelect = (pkg: Package) => {
    setSelectedPackage(pkg);
    setCurrentStep(1);
  };

  const handleRegistration = async (values: any) => {
    setLoading(true);
    try {
      const registrationData = {
        ...values,
        domain: `${values.companyCode}.stocker.app`, // Auto-generate domain from company code
        packageId: selectedPackage?.id,
        billingPeriod
      };

      // API call to register tenant (creates INACTIVE tenant)
      const response = await apiClient.post('/api/public/register', registrationData);
      
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

  const renderPackageSelection = () => (
    <div className="packages-section">
      <div className="billing-toggle">
        <Space size="large">
          <Text strong>Faturalandırma Dönemi:</Text>
          <Button.Group>
            <Button 
              type={billingPeriod === 'Monthly' ? 'primary' : 'default'}
              onClick={() => setBillingPeriod('Monthly')}
            >
              Aylık
            </Button>
            <Button 
              type={billingPeriod === 'Yearly' ? 'primary' : 'default'}
              onClick={() => setBillingPeriod('Yearly')}
            >
              Yıllık <Tag color="green">20% İndirim</Tag>
            </Button>
          </Button.Group>
        </Space>
      </div>

      <Row gutter={[24, 24]} style={{ marginTop: 32 }}>
        {packages.map((pkg) => (
          <Col xs={24} md={8} key={pkg.id}>
            <Badge.Ribbon 
              text="Popüler" 
              color="red"
              style={{ display: pkg.isPopular ? 'block' : 'none' }}
            >
              <Card 
                hoverable
                className={`package-card ${selectedPackage?.id === pkg.id ? 'selected' : ''} ${pkg.isPopular ? 'popular' : ''}`}
                onClick={() => handlePackageSelect(pkg)}
              >
                <div className="package-header">
                  <Title level={3}>{pkg.name}</Title>
                  <Text type="secondary">{pkg.description}</Text>
                </div>

                <div className="package-pricing">
                  <div className="price">
                    <span className="currency">{pkg.currency}</span>
                    <span className="amount">
                      {billingPeriod === 'Monthly' 
                        ? pkg.price 
                        : Math.floor(pkg.price * 12 * 0.8 / 12)}
                    </span>
                    <span className="period">/ay</span>
                  </div>
                  {billingPeriod === 'Yearly' && (
                    <Text type="secondary" delete>
                      {pkg.currency}{pkg.price}/ay
                    </Text>
                  )}
                  {pkg.discount && (
                    <Tag color="red">%{pkg.discount} İndirim</Tag>
                  )}
                </div>

                <Divider />

                <List
                  size="small"
                  dataSource={pkg.features}
                  renderItem={(feature) => (
                    <List.Item style={{ border: 'none', padding: '8px 0' }}>
                      <Space>
                        <CheckOutlined style={{ color: '#52c41a' }} />
                        <Text>{feature}</Text>
                      </Space>
                    </List.Item>
                  )}
                />

                <Button 
                  type={pkg.isPopular ? 'primary' : 'default'}
                  size="large"
                  block
                  style={{ marginTop: 24 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePackageSelect(pkg);
                  }}
                >
                  {pkg.isPopular ? 'En Çok Tercih Edilen' : 'Paketi Seç'}
                </Button>
              </Card>
            </Badge.Ribbon>
          </Col>
        ))}
      </Row>

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

  const renderRegistrationForm = () => (
    <Row gutter={[48, 24]}>
      <Col xs={24} md={16}>
        <Card>
          <Title level={3}>Hesap Bilgileri</Title>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleRegistration}
            autoComplete="off"
          >
            <Title level={5}>Şirket Bilgileri</Title>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="companyName"
                  label="Şirket Adı"
                  rules={[{ required: true, message: 'Şirket adı zorunludur' }]}
                  validateStatus={companyNameCheck ? (companyNameCheck.isValid ? 'success' : 'error') : ''}
                  help={companyNameCheck?.message}
                >
                  <Input 
                    placeholder="Örnek: ABC Teknoloji A.Ş." 
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value && value.length > 2) {
                        checkCompanyName(value);
                      }
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="companyCode"
                  label="Şirket Kodu"
                  rules={[
                    { required: true, message: 'Şirket kodu zorunludur' },
                    { pattern: /^[a-z0-9-]+$/, message: 'Sadece küçük harf, rakam ve tire kullanın' }
                  ]}
                  tooltip="URL'de kullanılacak benzersiz kod"
                  validateStatus={domainCheck ? (domainCheck.isAvailable ? 'success' : 'error') : ''}
                  help={domainCheck?.message || (domainCheck?.suggestions && `Öneriler: ${domainCheck.suggestions.join(', ')}`)}
                >
                  <Input 
                    placeholder="ornek-sirket" 
                    addonAfter=".stocker.app"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value && value.length > 2) {
                        checkDomain(`${value}.stocker.app`);
                      }
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Divider />

            <Title level={5}>İletişim Bilgileri</Title>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="contactName"
                  label="Yetkili Adı Soyadı"
                  rules={[{ required: true, message: 'Yetkili adı zorunludur' }]}
                >
                  <Input placeholder="Ad Soyad" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="contactPhone"
                  label="Telefon"
                  rules={[{ required: true, message: 'Telefon zorunludur' }]}
                  validateStatus={phoneValidation ? (phoneValidation.isValid ? 'success' : 'error') : ''}
                  help={phoneValidation?.message}
                >
                  <Input 
                    placeholder="+90 555 123 4567" 
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value && value.length > 6) {
                        validatePhone(value, 'TR');
                      }
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="contactEmail"
              label="E-posta"
              rules={[
                { required: true, message: 'E-posta zorunludur' },
                { type: 'email', message: 'Geçerli bir e-posta giriniz' }
              ]}
              validateStatus={emailValidation ? (emailValidation.isValid ? 'success' : 'error') : ''}
              help={emailValidation?.message}
            >
              <Input 
                placeholder="yetkili@sirket.com" 
                onChange={(e) => {
                  const value = e.target.value;
                  if (value && value.includes('@')) {
                    validateEmail(value);
                  }
                }}
              />
            </Form.Item>

            <Divider />

            <Title level={5}>Adres Bilgileri</Title>
            <Form.Item name="address" label="Adres">
              <Input.TextArea rows={2} placeholder="Açık adres" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="city" label="Şehir">
                  <Input placeholder="İstanbul" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="country" label="Ülke">
                  <Select defaultValue="TR">
                    <Select.Option value="TR">Türkiye</Select.Option>
                    <Select.Option value="US">Amerika</Select.Option>
                    <Select.Option value="DE">Almanya</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Divider />

            <Title level={5}>Giriş Bilgileri</Title>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="password"
                  label={
                    <Space>
                      Şifre
                      <Popover
                        content={
                          <div style={{ width: 300 }}>
                            <Title level={5}>Güvenli Şifre Oluşturma</Title>
                            <List
                              size="small"
                              dataSource={[
                                'En az 8 karakter uzunluğunda',
                                'Büyük ve küçük harf içermeli',
                                'En az bir rakam içermeli',
                                'Özel karakter kullanın (!@#$%^&*)',
                                'Kişisel bilgilerinizi kullanmayın',
                                'Yaygın kelimelerden kaçının'
                              ]}
                              renderItem={(item) => (
                                <List.Item style={{ padding: '4px 0' }}>
                                  <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                                  {item}
                                </List.Item>
                              )}
                            />
                          </div>
                        }
                        trigger="hover"
                      >
                        <InfoCircleOutlined style={{ cursor: 'pointer', color: '#1890ff' }} />
                      </Popover>
                    </Space>
                  }
                  rules={[
                    { required: true, message: 'Şifre zorunludur' },
                    { min: 8, message: 'Şifre en az 8 karakter olmalıdır' },
                    () => ({
                      validator(_, value) {
                        if (!value) return Promise.resolve();
                        if (passwordStrength && !passwordStrength.isAcceptable) {
                          return Promise.reject(new Error('Şifre güvenlik seviyesi yetersiz. En az "Güçlü" seviyesinde olmalıdır.'));
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                  extra={
                    password && (
                      <PasswordStrength
                        password={password}
                        username={form.getFieldValue('contactEmail')}
                        email={form.getFieldValue('contactEmail')}
                        onStrengthChange={setPasswordStrength}
                      />
                    )
                  }
                >
                  <Input.Password
                    placeholder="Güçlü bir şifre oluşturun"
                    onChange={(e) => {
                      const value = e.target.value;
                      setPassword(value);
                      if (value) {
                        checkPasswordStrength(value);
                      }
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
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
                  <Input.Password placeholder="Şifre tekrar" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="terms"
              valuePropName="checked"
              rules={[
                {
                  validator: (_, value) =>
                    value ? Promise.resolve() : Promise.reject(new Error('Sözleşmeyi kabul etmelisiniz')),
                },
              ]}
            >
              <Checkbox>
                <a href="#" target="_blank">Kullanım Şartları</a> ve{' '}
                <a href="#" target="_blank">Gizlilik Politikası</a>'nı okudum ve kabul ediyorum
              </Checkbox>
            </Form.Item>

            <Button 
              type="primary" 
              htmlType="submit" 
              size="large" 
              block 
              loading={loading}
              disabled={!isConnected || (password && passwordStrength && !passwordStrength.isAcceptable)}
            >
              {!isConnected
                ? 'Bağlantı kuruluyor...'
                : password && passwordStrength && !passwordStrength.isAcceptable 
                ? 'Güvenli bir şifre oluşturun' 
                : 'Kayıt Ol ve Ödeme Adımına Geç'}
            </Button>
          </Form>
        </Card>
      </Col>

      <Col xs={24} md={8}>
        <div className="order-summary-container">
          <Space direction="vertical" style={{ width: '100%' }} size={16}>
            <Card className="order-summary">
              <Title level={4}>Sipariş Özeti</Title>
              
              {selectedPackage && (
                <>
                  <div className="summary-item">
                    <Text>Paket:</Text>
                    <Text strong>{selectedPackage.name}</Text>
                  </div>
                  
                  <div className="summary-item">
                    <Text>Dönem:</Text>
                    <Text strong>
                      {billingPeriod === 'Monthly' ? 'Aylık' : 'Yıllık'}
                    </Text>
                  </div>

                  <div className="summary-item">
                    <Text>Kullanıcı:</Text>
                    <Text strong>
                      {selectedPackage.maxUsers === -1 ? 'Sınırsız' : `${selectedPackage.maxUsers} Kullanıcı`}
                    </Text>
                  </div>

                  <div className="summary-item">
                    <Text>Depolama:</Text>
                    <Text strong>{selectedPackage.maxStorage} GB</Text>
                  </div>

                  <Divider />

                  <div className="summary-item">
                    <Text>Aylık Tutar:</Text>
                    <Text>{selectedPackage.currency}{selectedPackage.price}</Text>
                  </div>

                  {billingPeriod === 'Yearly' && (
                    <>
                      <div className="summary-item">
                        <Text>Yıllık İndirim:</Text>
                        <Text type="success">%20</Text>
                      </div>
                    </>
                  )}

                  {selectedPackage.discount && (
                    <div className="summary-item">
                      <Text>Özel İndirim:</Text>
                      <Text type="success">%{selectedPackage.discount}</Text>
                    </div>
                  )}

                  <Divider />

                  <div className="summary-total">
                    <Title level={5}>Toplam</Title>
                    <div className="total-amount">
                      <Text className="currency">{selectedPackage.currency}</Text>
                      <Text className="amount">{selectedPackage.price || 0}</Text>
                      <Text className="period">
                        /{billingPeriod === 'Monthly' ? 'ay' : 'yıl'}
                      </Text>
                    </div>
                  </div>

                  <Alert
                    message="14 Gün Ücretsiz Deneme"
                    description="İlk 14 gün ücretsiz kullanın. İstediğiniz zaman iptal edebilirsiniz."
                    type="info"
                    showIcon
                    style={{ marginTop: 16 }}
                  />
                </>
              )}
            </Card>

            <Card>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space>
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  <Text>SSL ile güvenli ödeme</Text>
                </Space>
                <Space>
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  <Text>Anında aktivasyon</Text>
                </Space>
                <Space>
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  <Text>7/24 destek</Text>
                </Space>
                <Space>
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  <Text>İstediğiniz zaman iptal</Text>
                </Space>
                {isConnected && (
                  <Space>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    <Text>Real-time validation aktif</Text>
                  </Space>
                )}
              </Space>
            </Card>
          </Space>
        </div>
      </Col>
    </Row>
  );

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

  return (
    <div className="register-page">
      <div className="register-header">
        <div className="container">
          <Space size="large">
            <RocketOutlined style={{ fontSize: 32, color: '#667eea' }} />
            <Title level={2} style={{ margin: 0, color: '#fff' }}>
              Stocker'a Kayıt Ol
            </Title>
          </Space>
          <Button 
            type="default" 
            ghost 
            onClick={() => navigate('/login')}
            style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)' }}
          >
            Zaten hesabım var
          </Button>
        </div>
      </div>

      <div className="register-content">
        <div className="container">
          <Steps 
            current={currentStep} 
            style={{ marginBottom: 48 }}
            items={[
              {
                title: 'Paket Seçimi',
                icon: <ShoppingCartOutlined />
              },
              {
                title: 'Bilgi Girişi',
                icon: <UserOutlined />
              },
              {
                title: 'Ödeme',
                icon: <CreditCardOutlined />
              }
            ]}
          />

          {currentStep === 0 && renderPackageSelection()}
          {currentStep === 1 && renderRegistrationForm()}
          {currentStep === 2 && renderPayment()}
        </div>
      </div>
    </div>
  );
};