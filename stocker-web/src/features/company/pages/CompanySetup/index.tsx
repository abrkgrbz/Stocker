import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Input, Select, Steps, Card, Row, Col, message, InputNumber } from 'antd';
import { BankOutlined, PhoneOutlined, MailOutlined, GlobalOutlined, CheckCircleOutlined } from '@ant-design/icons';
import './style.css';

const { Step } = Steps;
const { Option } = Select;
const { TextArea } = Input;

interface CompanyFormData {
  // Temel Bilgiler
  name: string;
  code: string;
  taxNumber: string;
  taxOffice?: string;
  tradeRegisterNumber?: string;
  sector?: string;
  
  // İletişim
  email: string;
  phone: string;
  fax?: string;
  website?: string;
  
  // Adres
  country: string;
  city: string;
  district: string;
  postalCode?: string;
  addressLine: string;
  
  // Ek Bilgiler
  employeeCount?: number;
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
    name: '',
    code: '',
    taxNumber: '',
    email: '',
    phone: '',
    country: 'Türkiye',
    city: '',
    district: '',
    addressLine: '',
    currency: 'TRY',
    timezone: 'Europe/Istanbul'
  });

  const steps = [
    {
      title: 'Temel Bilgiler',
      icon: <BankOutlined />,
    },
    {
      title: 'İletişim',
      icon: <PhoneOutlined />,
    },
    {
      title: 'Adres',
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
      navigate('/dashboard');
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
            <h3>Temel Şirket Bilgileri</h3>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Şirket Adı"
                  rules={[{ required: true, message: 'Şirket adı zorunludur' }]}
                >
                  <Input size="large" placeholder="Örn: ABC Teknoloji A.Ş." />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="code"
                  label="Şirket Kodu"
                  rules={[{ required: true, message: 'Şirket kodu zorunludur' }]}
                >
                  <Input size="large" placeholder="Örn: ABC001" />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="taxNumber"
                  label="Vergi Numarası"
                  rules={[{ required: true, message: 'Vergi numarası zorunludur' }]}
                >
                  <Input size="large" placeholder="Vergi numaranız" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="taxOffice"
                  label="Vergi Dairesi"
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
                >
                  <Input size="large" placeholder="Ticaret sicil numarası" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="sector"
                  label="Sektör"
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
            <h3>İletişim Bilgileri</h3>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="email"
                  label="E-posta"
                  rules={[
                    { required: true, message: 'E-posta zorunludur' },
                    { type: 'email', message: 'Geçerli bir e-posta adresi giriniz' }
                  ]}
                >
                  <Input size="large" prefix={<MailOutlined />} placeholder="sirket@example.com" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="phone"
                  label="Telefon"
                  rules={[{ required: true, message: 'Telefon numarası zorunludur' }]}
                >
                  <Input size="large" prefix={<PhoneOutlined />} placeholder="+90 212 555 0000" />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="fax"
                  label="Faks"
                >
                  <Input size="large" placeholder="+90 212 555 0001" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="website"
                  label="Web Sitesi"
                >
                  <Input size="large" prefix={<GlobalOutlined />} placeholder="https://www.example.com" />
                </Form.Item>
              </Col>
            </Row>
          </div>
        );
        
      case 2:
        return (
          <div className="step-content">
            <h3>Adres Bilgileri</h3>
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
                >
                  <Input size="large" placeholder="34000" />
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item
              name="addressLine"
              label="Açık Adres"
              rules={[{ required: true, message: 'Adres zorunludur' }]}
            >
              <TextArea 
                size="large" 
                rows={3} 
                placeholder="Cadde, sokak, bina no vb. detaylı adres bilgisi" 
              />
            </Form.Item>
          </div>
        );
        
      case 3:
        return (
          <div className="step-content">
            <h3>Ek Bilgiler</h3>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="employeeCount"
                  label="Çalışan Sayısı"
                >
                  <InputNumber 
                    size="large" 
                    min={1} 
                    style={{ width: '100%' }} 
                    placeholder="Çalışan sayısı" 
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="foundedYear"
                  label="Kuruluş Yılı"
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
                  name="currency"
                  label="Para Birimi"
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
                  initialValue="Europe/Istanbul"
                >
                  <Select size="large">
                    <Option value="Europe/Istanbul">Türkiye (UTC+3)</Option>
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
          <h1><BankOutlined /> Şirket Kurulumu</h1>
          <p>Stocker'ı kullanmaya başlamak için şirket bilgilerinizi tamamlayın</p>
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