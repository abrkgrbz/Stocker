import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
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
  message,
  InputNumber,
  Tooltip,
  Alert,
  Progress,
  Tag,
  Avatar,
  Badge,
  Carousel,
  Result,
  Modal,
  Upload,
  Switch
} from 'antd';
import {
  BankOutlined,
  GlobalOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  CalendarOutlined,
  TeamOutlined,
  SafetyOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  RocketOutlined,
  TrophyOutlined,
  StarOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  CloudUploadOutlined,
  PictureOutlined,
  FileTextOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  CheckOutlined,
  LoadingOutlined,
  SmileOutlined,
  HeartOutlined
} from '@ant-design/icons';
// Removed framer-motion import - not installed
import companyService from '@/services/companyService';
import { getCitiesForSelect, getDistrictsByCityForSelect } from '@/data/turkey-cities';
import './ModernCompanySetup.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Dragger } = Upload;

interface CompanyFormData {
  // Basic Info
  companyName: string;
  legalName?: string;
  
  // Tax Info
  taxNumber: string;
  taxOffice: string;
  tradeRegisterNumber?: string;
  
  // Contact
  email: string;
  phone: string;
  website?: string;
  
  // Address
  country: string;
  city: string;
  district: string;
  postalCode?: string;
  addressLine: string;
  
  // Additional
  sector?: string;
  employeeCount?: string;
  foundedYear?: number;
  currency: string;
  timezone: string;
  
  // Company Logo
  logo?: any;
}

const ModernCompanySetup: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [districts, setDistricts] = useState<{ label: string; value: string }[]>([]);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [formData, setFormData] = useState<Partial<CompanyFormData>>({
    country: 'Türkiye',
    currency: 'TRY',
    timezone: 'Europe/Istanbul'
  });

  const steps = [
    {
      title: 'Şirket Bilgileri',
      icon: <BankOutlined />,
      description: 'Temel şirket bilgileri',
      color: '#667eea'
    },
    {
      title: 'İletişim',
      icon: <PhoneOutlined />,
      description: 'İletişim bilgileri',
      color: '#48bb78'
    },
    {
      title: 'Adres',
      icon: <EnvironmentOutlined />,
      description: 'Şirket adresi',
      color: '#ed8936'
    },
    {
      title: 'Detaylar',
      icon: <InfoCircleOutlined />,
      description: 'Ek bilgiler',
      color: '#9f7aea'
    }
  ];

  useEffect(() => {
    // Check if company already exists
    checkExistingCompany();
  }, []);

  const checkExistingCompany = async () => {
    const token = localStorage.getItem('stocker_token');
    if (!token) return;
    
    try {
      const hasCompany = await companyService.checkCompanyExists();
      if (hasCompany) {
        message.info('Şirket bilgileriniz zaten mevcut');
        localStorage.setItem('company_setup_complete', 'true');
        navigate('/app');
      }
    } catch (error) {
      console.error('Error checking company:', error);
    }
  };

  const handleCityChange = (cityName: string) => {
    form.setFieldsValue({ district: undefined });
    setDistricts(getDistrictsByCityForSelect(cityName));
  };

  const handleStepChange = (step: number) => {
    form.validateFields()
      .then(values => {
        // Save current step data
        setFormData(prev => ({ ...prev, ...values }));
        setCompletedSteps(prev => [...prev, currentStep]);
        setCurrentStep(step);
      })
      .catch(() => {
        message.error('Lütfen gerekli alanları doldurun');
      });
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      handleStepChange(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const finalData = { ...formData, ...values };
      
      setLoading(true);
      
      // Show loading message
      message.loading('Şirket bilgileri kaydediliyor...', 0);
      
      // Prepare company data
      const companyData = {
        name: finalData.companyName,
        code: `company_${Date.now()}`,
        legalName: finalData.legalName || finalData.companyName,
        identityType: 'TaxNumber',
        identityNumber: finalData.taxNumber,
        taxNumber: finalData.taxNumber,
        taxOffice: finalData.taxOffice,
        tradeRegisterNumber: finalData.tradeRegisterNumber,
        email: finalData.email,
        phone: finalData.phone,
        website: finalData.website,
        sector: finalData.sector,
        employeeCount: finalData.employeeCount ? parseInt(finalData.employeeCount.split('-')[0]) : undefined,
        foundedYear: finalData.foundedYear,
        currency: finalData.currency,
        timezone: finalData.timezone,
        country: finalData.country,
        city: finalData.city,
        district: finalData.district,
        postalCode: finalData.postalCode,
        addressLine: finalData.addressLine
      };
      
      await companyService.createCompany(companyData);
      
      message.destroy();
      
      // Show success modal
      Modal.success({
        title: 'Tebrikler! 🎉',
        content: (
          <div>
            <p>Şirket kurulumunuz başarıyla tamamlandı!</p>
            <p>Artık sistemi kullanmaya başlayabilirsiniz.</p>
          </div>
        ),
        okText: 'Başla',
        onOk: () => {
          localStorage.setItem('company_setup_complete', 'true');
          navigate('/app');
        }
      });
      
    } catch (error: any) {
      message.destroy();
      message.error(error.message || 'Şirket kurulumu sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getStepStatus = (stepIndex: number) => {
    if (completedSteps.includes(stepIndex)) return 'completed';
    if (currentStep === stepIndex) return 'current';
    return 'pending';
  };

  const renderStepIndicator = () => (
    <div className="step-indicator">
      <Row justify="center" align="middle" gutter={[16, 16]}>
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          return (
            <Col key={index}>
              <div 
                className={`step-item ${status}`}
                onClick={() => index < currentStep && handleStepChange(index)}
                style={{ cursor: index < currentStep ? 'pointer' : 'default' }}
              >
                <Badge
                  count={status === 'completed' ? <CheckOutlined style={{ color: '#52c41a' }} /> : null}
                  offset={[-5, 5]}
                >
                  <Avatar
                    size={48}
                    icon={step.icon}
                    style={{
                      backgroundColor: status === 'current' ? step.color : '#f0f0f0',
                      color: status === 'current' ? '#fff' : '#8c8c8c',
                      border: status === 'current' ? `3px solid ${step.color}` : 'none'
                    }}
                  />
                </Badge>
                <div className="step-info">
                  <Text strong={status === 'current'}>{step.title}</Text>
                  <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                    {step.description}
                  </Text>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="step-connector" style={{
                  backgroundColor: completedSteps.includes(index) ? '#52c41a' : '#f0f0f0'
                }} />
              )}
            </Col>
          );
        })}
      </Row>
      <Progress 
        percent={(completedSteps.length / steps.length) * 100} 
        showInfo={false}
        strokeColor={{
          '0%': '#667eea',
          '100%': '#764ba2',
        }}
        style={{ marginTop: 20 }}
      />
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Company Info
        return (
          <div className="step-animation">
            <Card bordered={false} className="step-card">
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div className="step-header">
                  <Title level={3}>
                    <BankOutlined /> Şirket Bilgileri
                  </Title>
                  <Paragraph type="secondary">
                    İşletmenizin temel bilgilerini girin
                  </Paragraph>
                </div>

                <Row gutter={[24, 16]}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="companyName"
                      label="Şirket Adı"
                      rules={[{ required: true, message: 'Şirket adı zorunludur' }]}
                      tooltip="Müşterilerinizin göreceği şirket adı"
                    >
                      <Input
                        size="large"
                        prefix={<BankOutlined />}
                        placeholder="Örn: ABC Teknoloji"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="legalName"
                      label="Ticari Ünvan"
                      tooltip="Resmi evraklardaki tam ünvanınız"
                    >
                      <Input
                        size="large"
                        placeholder="ABC Teknoloji A.Ş."
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[24, 16]}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="taxNumber"
                      label="Vergi Numarası"
                      rules={[
                        { required: true, message: 'Vergi numarası zorunludur' },
                        { pattern: /^\d{10,11}$/, message: '10 veya 11 haneli olmalıdır' }
                      ]}
                    >
                      <Input
                        size="large"
                        placeholder="10 veya 11 haneli"
                        maxLength={11}
                        prefix={<FileTextOutlined />}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="taxOffice"
                      label="Vergi Dairesi"
                      rules={[{ required: true, message: 'Vergi dairesi zorunludur' }]}
                    >
                      <Input
                        size="large"
                        placeholder="Örn: Kadıköy V.D."
                        prefix={<HomeOutlined />}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[24, 16]}>
                  <Col xs={24}>
                    <Form.Item
                      name="tradeRegisterNumber"
                      label="Ticaret Sicil No"
                      tooltip="Ticaret odası kayıt numaranız (opsiyonel)"
                    >
                      <Input
                        size="large"
                        placeholder="Opsiyonel"
                        prefix={<SafetyOutlined />}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Alert
                  message="Önemli"
                  description="Vergi numarası ve vergi dairesi bilgileri faturalama için zorunludur."
                  type="info"
                  showIcon
                  icon={<InfoCircleOutlined />}
                />
              </Space>
            </Card>
          </div>
        );

      case 1: // Contact Info
        return (
          <div className="step-animation">
            <Card bordered={false} className="step-card">
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div className="step-header">
                  <Title level={3}>
                    <PhoneOutlined /> İletişim Bilgileri
                  </Title>
                  <Paragraph type="secondary">
                    Müşterilerinizin size ulaşabileceği bilgiler
                  </Paragraph>
                </div>

                <Row gutter={[24, 16]}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="email"
                      label="E-posta Adresi"
                      rules={[
                        { required: true, message: 'E-posta zorunludur' },
                        { type: 'email', message: 'Geçerli bir e-posta girin' }
                      ]}
                    >
                      <Input
                        size="large"
                        prefix={<MailOutlined />}
                        placeholder="info@sirket.com"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="phone"
                      label="Telefon"
                      rules={[{ required: true, message: 'Telefon zorunludur' }]}
                    >
                      <Input
                        size="large"
                        prefix={<PhoneOutlined />}
                        placeholder="0212 123 45 67"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[24, 16]}>
                  <Col xs={24}>
                    <Form.Item
                      name="website"
                      label="Web Sitesi"
                      rules={[{ type: 'url', message: 'Geçerli bir URL girin' }]}
                    >
                      <Input
                        size="large"
                        prefix={<GlobalOutlined />}
                        placeholder="https://www.sirket.com"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Divider />

                <div className="info-cards">
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={8}>
                      <Card className="info-card" hoverable>
                        <Space>
                          <Avatar icon={<MailOutlined />} style={{ backgroundColor: '#667eea' }} />
                          <div>
                            <Text strong>E-posta</Text>
                            <br />
                            <Text type="secondary">Sistem bildirimleri için</Text>
                          </div>
                        </Space>
                      </Card>
                    </Col>
                    <Col xs={24} md={8}>
                      <Card className="info-card" hoverable>
                        <Space>
                          <Avatar icon={<PhoneOutlined />} style={{ backgroundColor: '#48bb78' }} />
                          <div>
                            <Text strong>Telefon</Text>
                            <br />
                            <Text type="secondary">Müşteri iletişimi için</Text>
                          </div>
                        </Space>
                      </Card>
                    </Col>
                    <Col xs={24} md={8}>
                      <Card className="info-card" hoverable>
                        <Space>
                          <Avatar icon={<GlobalOutlined />} style={{ backgroundColor: '#ed8936' }} />
                          <div>
                            <Text strong>Website</Text>
                            <br />
                            <Text type="secondary">Online varlığınız</Text>
                          </div>
                        </Space>
                      </Card>
                    </Col>
                  </Row>
                </div>
              </Space>
            </Card>
          </div>
        );

      case 2: // Address
        return (
          <div className="step-animation">
            <Card bordered={false} className="step-card">
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div className="step-header">
                  <Title level={3}>
                    <EnvironmentOutlined /> Adres Bilgileri
                  </Title>
                  <Paragraph type="secondary">
                    Şirket merkez adresi bilgileri
                  </Paragraph>
                </div>

                <Row gutter={[24, 16]}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="city"
                      label="İl"
                      rules={[{ required: true, message: 'İl seçimi zorunludur' }]}
                    >
                      <Select
                        size="large"
                        showSearch
                        placeholder="İl seçiniz"
                        onChange={handleCityChange}
                        filterOption={(input, option) =>
                          option?.children.toLowerCase().includes(input.toLowerCase())
                        }
                      >
                        {getCitiesForSelect().map(city => (
                          <Option key={city.value} value={city.value}>
                            {city.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="district"
                      label="İlçe"
                      rules={[{ required: true, message: 'İlçe seçimi zorunludur' }]}
                    >
                      <Select
                        size="large"
                        showSearch
                        placeholder="İlçe seçiniz"
                        disabled={!districts.length}
                        filterOption={(input, option) =>
                          option?.children.toLowerCase().includes(input.toLowerCase())
                        }
                      >
                        {districts.map(district => (
                          <Option key={district.value} value={district.value}>
                            {district.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[24, 16]}>
                  <Col xs={24} md={8}>
                    <Form.Item
                      name="postalCode"
                      label="Posta Kodu"
                    >
                      <Input
                        size="large"
                        placeholder="34710"
                        maxLength={5}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[24, 16]}>
                  <Col xs={24}>
                    <Form.Item
                      name="addressLine"
                      label="Açık Adres"
                      rules={[{ required: true, message: 'Adres zorunludur' }]}
                    >
                      <TextArea
                        size="large"
                        rows={3}
                        placeholder="Mahalle, sokak, bina no vb."
                        maxLength={500}
                        showCount
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Alert
                  message="Faturalama Adresi"
                  description="Bu adres, kesilen faturalarda görünecektir."
                  type="info"
                  showIcon
                />
              </Space>
            </Card>
          </div>
        );

      case 3: // Additional Details
        return (
          <div className="step-animation">
            <Card bordered={false} className="step-card">
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div className="step-header">
                  <Title level={3}>
                    <InfoCircleOutlined /> Ek Bilgiler
                  </Title>
                  <Paragraph type="secondary">
                    İşletmeniz hakkında detaylı bilgiler
                  </Paragraph>
                </div>

                <Row gutter={[24, 16]}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="sector"
                      label="Sektör"
                      rules={[{ required: true, message: 'Sektör seçimi zorunludur' }]}
                    >
                      <Select size="large" placeholder="Sektör seçiniz">
                        <Option value="Teknoloji">Teknoloji</Option>
                        <Option value="Üretim">Üretim</Option>
                        <Option value="Hizmet">Hizmet</Option>
                        <Option value="Ticaret">Ticaret</Option>
                        <Option value="İnşaat">İnşaat</Option>
                        <Option value="Sağlık">Sağlık</Option>
                        <Option value="Eğitim">Eğitim</Option>
                        <Option value="Gıda">Gıda</Option>
                        <Option value="Tekstil">Tekstil</Option>
                        <Option value="Lojistik">Lojistik</Option>
                        <Option value="Turizm">Turizm</Option>
                        <Option value="Finans">Finans</Option>
                        <Option value="Diğer">Diğer</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="employeeCount"
                      label="Çalışan Sayısı"
                    >
                      <Select size="large" placeholder="Seçiniz">
                        <Option value="1-5">1-5 Kişi</Option>
                        <Option value="6-10">6-10 Kişi</Option>
                        <Option value="11-25">11-25 Kişi</Option>
                        <Option value="26-50">26-50 Kişi</Option>
                        <Option value="51-100">51-100 Kişi</Option>
                        <Option value="101-250">101-250 Kişi</Option>
                        <Option value="251-500">251-500 Kişi</Option>
                        <Option value="500+">500+ Kişi</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[24, 16]}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="foundedYear"
                      label="Kuruluş Yılı"
                    >
                      <InputNumber
                        size="large"
                        min={1900}
                        max={new Date().getFullYear()}
                        style={{ width: '100%' }}
                        placeholder="2020"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="currency"
                      label="Para Birimi"
                      initialValue="TRY"
                    >
                      <Select size="large">
                        <Option value="TRY">Türk Lirası (₺)</Option>
                        <Option value="USD">ABD Doları ($)</Option>
                        <Option value="EUR">Euro (€)</Option>
                        <Option value="GBP">İngiliz Sterlini (£)</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Divider />

                <div className="completion-message">
                  <Result
                    icon={<SmileOutlined />}
                    title="Hemen Hemen Tamamlandı!"
                    subTitle="Birkaç saniye içinde sistemi kullanmaya başlayabileceksiniz."
                    extra={[
                      <Tag color="green" key="1">
                        <CheckCircleOutlined /> Güvenli
                      </Tag>,
                      <Tag color="blue" key="2">
                        <RocketOutlined /> Hızlı
                      </Tag>,
                      <Tag color="purple" key="3">
                        <HeartOutlined /> Kolay
                      </Tag>
                    ]}
                  />
                </div>
              </Space>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="modern-company-setup">
      <div className="setup-container">
        <div className="setup-header">
          <div className="header-animation">
            <Title level={2} className="setup-title">
              <RocketOutlined /> Şirket Kurulumu
            </Title>
            <Paragraph className="setup-subtitle">
              Birkaç basit adımda şirket bilgilerinizi tamamlayın
            </Paragraph>
          </div>
        </div>

        <div className="setup-progress">
          {renderStepIndicator()}
        </div>

        <div className="setup-content">
          <Form
            form={form}
            layout="vertical"
            size="large"
            initialValues={formData}
          >
            {renderStepContent()}
          </Form>
        </div>

        <div className="setup-actions">
          <Row justify="space-between" align="middle">
            <Col>
              {currentStep > 0 && (
                <Button
                  size="large"
                  onClick={handlePrev}
                  icon={<ArrowLeftOutlined />}
                >
                  Önceki
                </Button>
              )}
            </Col>
            <Col>
              <Space>
                <Button
                  type="default"
                  size="large"
                  onClick={() => navigate('/app')}
                >
                  Daha Sonra
                </Button>
                <Button
                  type="primary"
                  size="large"
                  onClick={handleNext}
                  loading={loading}
                  icon={currentStep === steps.length - 1 ? <CheckOutlined /> : <ArrowRightOutlined />}
                >
                  {currentStep === steps.length - 1 ? 'Tamamla' : 'Devam Et'}
                </Button>
              </Space>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default ModernCompanySetup;