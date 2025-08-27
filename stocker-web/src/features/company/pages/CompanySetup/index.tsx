import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Input, Select, Steps, Card, Row, Col, message, InputNumber } from 'antd';
import { BankOutlined, GlobalOutlined, CheckCircleOutlined } from '@ant-design/icons';
import './style.css';

const { Step } = Steps;
const { Option } = Select;
const { TextArea } = Input;

interface CompanyFormData {
  // Ticari Bilgiler
  tradeRegisterNumber?: string;
  sector?: string;
  
  // Vergi Bilgileri (Zorunlu)
  taxNumber: string;
  taxOffice: string;
  
  // Adres (Zorunlu fatura için)
  country: string;
  city: string;
  district: string;
  postalCode?: string;
  addressLine: string;
  
  // Ek Bilgiler
  website?: string;
  employeeCount?: string;
  foundedYear?: number;
  currency: string;
  timezone: string;
}

const CompanySetup: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<CompanyFormData>({
    taxNumber: '',
    taxOffice: '',
    country: 'Türkiye',
    city: '',
    district: '',
    addressLine: '',
    currency: 'TRY',
    timezone: 'Europe/Istanbul'
  });

  const steps = [
    {
      title: 'Ticari Bilgiler',
      icon: <BankOutlined />,
    },
    {
      title: 'Adres Bilgileri',
      icon: <GlobalOutlined />,
    },
    {
      title: 'Ek Bilgiler',
      icon: <CheckCircleOutlined />,
    },
  ];

  const handleNext = async () => {
    try {
      const values = await form.validateFields();
      setFormData({ ...formData, ...values });
      
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // TODO: API call to save company data
      console.log('Company data:', formData);
      
      // Simulated API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      message.success('Şirket kurulumu başarıyla tamamlandı!');
      
      // Navigate based on user role
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const userRole = user.roles?.[0];
        const tenantId = user.tenantId || user.tenant?.id;
        
        if (userRole === 'SystemAdmin') {
          navigate('/master');
        } else if (userRole === 'Admin' || userRole === 'TenantAdmin') {
          navigate('/admin');
        } else if (tenantId) {
          navigate(`/app/${tenantId}/dashboard`);
        } else {
          navigate('/app/default');
        }
      } else {
        navigate('/admin');
      }
    } catch (error) {
      message.error('Şirket kurulumu sırasında bir hata oluştu.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="step-content">
            <h3>Ticari ve Vergi Bilgileri</h3>
            <p style={{ marginBottom: 24, color: '#666' }}>
              Fatura ve resmi işlemler için gerekli bilgiler
            </p>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="taxNumber"
                  label="Vergi Numarası"
                  rules={[
                    { required: true, message: 'Vergi numarası zorunludur' },
                    { pattern: /^\d{10,11}$/, message: 'Vergi numarası 10 veya 11 haneli olmalıdır' }
                  ]}
                  tooltip="10 haneli vergi no veya 11 haneli TC kimlik no"
                >
                  <Input size="large" placeholder="Vergi numaranız" maxLength={11} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="taxOffice"
                  label="Vergi Dairesi"
                  rules={[{ required: true, message: 'Vergi dairesi zorunludur' }]}
                >
                  <Input size="large" placeholder="Örn: Kadıköy V.D." />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="tradeRegisterNumber"
                  label="Ticaret Sicil No"
                  tooltip="Ticaret odasına kayıtlı sicil numaranız"
                >
                  <Input size="large" placeholder="Ticaret sicil numarası (opsiyonel)" />
                </Form.Item>
              </Col>
              <Col span={12}>
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
                    <Option value="Danışmanlık">Danışmanlık</Option>
                    <Option value="Diğer">Diğer</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </div>
        );
        
      case 1:
        return (
          <div className="step-content">
            <h3>Adres Bilgileri</h3>
            <p style={{ marginBottom: 24, color: '#666' }}>
              Faturalarınızda görünecek resmi adres bilgileri
            </p>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="country"
                  label="Ülke"
                  rules={[{ required: true, message: 'Ülke seçimi zorunludur' }]}
                  initialValue="Türkiye"
                >
                  <Select size="large">
                    <Option value="Türkiye">Türkiye</Option>
                    <Option value="KKTC">KKTC</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="city"
                  label="Şehir"
                  rules={[{ required: true, message: 'Şehir zorunludur' }]}
                >
                  <Input size="large" placeholder="Örn: İstanbul" />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="district"
                  label="İlçe"
                  rules={[{ required: true, message: 'İlçe zorunludur' }]}
                >
                  <Input size="large" placeholder="Örn: Kadıköy" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="postalCode"
                  label="Posta Kodu"
                  tooltip="5 haneli posta kodunuz"
                >
                  <Input size="large" placeholder="34000" maxLength={5} />
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item
              name="addressLine"
              label="Açık Adres"
              rules={[
                { required: true, message: 'Adres zorunludur' },
                { min: 20, message: 'Adres en az 20 karakter olmalıdır' }
              ]}
            >
              <TextArea 
                size="large" 
                rows={3} 
                placeholder="Mahalle, cadde, sokak, bina no, daire no vb. detaylı adres bilgisi"
                showCount
                maxLength={250}
              />
            </Form.Item>
          </div>
        );
        
      case 2:
        return (
          <div className="step-content">
            <h3>Ek Bilgiler</h3>
            <p style={{ marginBottom: 24, color: '#666' }}>
              Şirketiniz hakkında ek bilgiler (bazı alanlar opsiyonel)
            </p>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="employeeCount"
                  label="Çalışan Sayısı"
                  tooltip="Yaklaşık çalışan sayınız"
                >
                  <Select size="large" placeholder="Çalışan sayısı seçiniz">
                    <Option value="1-5">1-5</Option>
                    <Option value="6-10">6-10</Option>
                    <Option value="11-25">11-25</Option>
                    <Option value="26-50">26-50</Option>
                    <Option value="51-100">51-100</Option>
                    <Option value="101-250">101-250</Option>
                    <Option value="250+">250+</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="foundedYear"
                  label="Kuruluş Yılı"
                  tooltip="Şirketinizin kuruluş yılı"
                >
                  <InputNumber 
                    size="large" 
                    min={1900} 
                    max={new Date().getFullYear()} 
                    style={{ width: '100%' }} 
                    placeholder={String(new Date().getFullYear())}
                  />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="website"
                  label="Web Sitesi"
                  rules={[
                    { type: 'url', message: 'Geçerli bir URL giriniz' }
                  ]}
                >
                  <Input size="large" prefix={<GlobalOutlined />} placeholder="https://www.example.com" />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="currency"
                  label="Para Birimi"
                  rules={[{ required: true, message: 'Para birimi seçimi zorunludur' }]}
                  initialValue="TRY"
                >
                  <Select size="large">
                    <Option value="TRY">Türk Lirası (TRY)</Option>
                    <Option value="USD">ABD Doları (USD)</Option>
                    <Option value="EUR">Euro (EUR)</Option>
                    <Option value="GBP">İngiliz Sterlini (GBP)</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="timezone"
                  label="Saat Dilimi"
                  rules={[{ required: true, message: 'Saat dilimi seçimi zorunludur' }]}
                  initialValue="Europe/Istanbul"
                >
                  <Select size="large">
                    <Option value="Europe/Istanbul">Türkiye (UTC+3)</Option>
                    <Option value="Europe/London">Londra (UTC+0)</Option>
                    <Option value="Europe/Berlin">Berlin (UTC+1)</Option>
                    <Option value="America/New_York">New York (UTC-5)</Option>
                    <Option value="UTC">UTC</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="company-setup-container">
      <Card className="company-setup-card">
        <div className="setup-header">
          <h1><BankOutlined /> Şirket Bilgileri</h1>
          <p>Şirketinizle ilgili detaylı bilgileri tamamlayarak kurulumu bitirin</p>
        </div>
        
        <Steps current={currentStep} className="setup-steps">
          {steps.map((step, index) => (
            <Step key={index} title={step.title} icon={step.icon} />
          ))}
        </Steps>
        
        <Form
          form={form}
          layout="vertical"
          className="setup-form"
          initialValues={formData}
        >
          {renderStepContent()}
        </Form>
        
        <div className="setup-actions">
          {currentStep > 0 && (
            <Button size="large" onClick={handlePrev}>
              Geri
            </Button>
          )}
          <Button
            type="primary"
            size="large"
            loading={loading}
            onClick={handleNext}
          >
            {currentStep === steps.length - 1 ? 'Kurulumu Tamamla' : 'İleri'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CompanySetup;