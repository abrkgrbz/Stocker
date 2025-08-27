import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Input, Select, Steps, Card, Row, Col, message, InputNumber } from 'antd';
import { BankOutlined, GlobalOutlined, CheckCircleOutlined } from '@ant-design/icons';
import './style.css';

const { Step } = Steps;
const { Option } = Select;
const { TextArea } = Input;

interface CompanyFormData {
  // Vergi Bilgileri (Zorunlu)
  taxNumber: string;
  taxOffice?: string;
  
  // Adres (Zorunlu fatura için)
  country: string;
  city: string;
  district: string;
  addressLine: string;
  
  // İsteğe Bağlı
  website?: string;
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
    country: 'Türkiye',
    city: '',
    district: '',
    addressLine: '',
    currency: 'TRY',
    timezone: 'Europe/Istanbul'
  });

  const steps = [
    {
      title: 'Vergi Bilgileri',
      icon: <BankOutlined />,
    },
    {
      title: 'Adres',
      icon: <GlobalOutlined />,
    },
    {
      title: 'Tercihler',
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
            <h3>Vergi Bilgileri</h3>
            <p style={{ marginBottom: 24, color: '#666' }}>
              Fatura kesebilmek için vergi bilgileriniz gereklidir
            </p>
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
                  rules={[{ required: true, message: 'Vergi dairesi zorunludur' }]}
                >
                  <Input size="large" placeholder="Örn: Kadıköy V.D." />
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
              Faturalarınızda görünecek adres bilgileri
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
        
      case 2:
        return (
          <div className="step-content">
            <h3>Tercihler</h3>
            <p style={{ marginBottom: 24, color: '#666' }}>
              İsteğe bağlı ayarlar - daha sonra da değiştirebilirsiniz
            </p>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="website"
                  label="Web Sitesi"
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
                  initialValue="TRY"
                >
                  <Select size="large">
                    <Option value="TRY">Türk Lirası (TRY)</Option>
                    <Option value="USD">ABD Doları (USD)</Option>
                    <Option value="EUR">Euro (EUR)</Option>
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
          <p>Fatura kesebilmek için vergi ve adres bilgilerinizi tamamlayın</p>
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