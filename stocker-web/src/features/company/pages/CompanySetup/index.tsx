import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { BankOutlined, GlobalOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Button, Form, Input, Select, Steps, Card, Row, Col, InputNumber, message } from 'antd';
import Swal from 'sweetalert2';

import { useAuthStore } from '@/app/store/auth.store';
import { getCitiesForSelect, getDistrictsByCityForSelect } from '@/data/turkey-cities';
import companyService from '@/services/companyService';
import { showApiResponse } from '@/shared/utils/sweetAlert';

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
  const { user } = useAuthStore();
  
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

  const [districts, setDistricts] = useState<{ label: string; value: string }[]>([]);

  // Check if company already exists on mount
  useEffect(() => {
    const checkExistingCompany = async () => {
      try {
        const hasCompany = await companyService.checkCompanyExists();
        if (hasCompany) {
          message.info('Şirket bilgileriniz zaten mevcut, yönlendiriliyorsunuz...');
          
          const currentUser = user || JSON.parse(localStorage.getItem('user') || '{}');
          const userRole = currentUser.roles?.[0];
          const tenantId = currentUser.tenantId || currentUser.tenant?.id;
          
          if (userRole === 'SystemAdmin') {
            navigate('/master');
          } else if (userRole === 'Admin' || userRole === 'TenantAdmin') {
            navigate('/admin');
          } else if (tenantId) {
            navigate(`/app/${tenantId}/dashboard`);
          } else {
            navigate('/app/default');
          }
        }
      } catch (error) {
        // Error handling removed for production
      }
    };

    checkExistingCompany();
  }, [navigate, user]);

  // Handle city change to update districts
  const handleCityChange = (cityName: string) => {
    form.setFieldsValue({ district: undefined }); // Reset district
    setDistricts(getDistrictsByCityForSelect(cityName));
  };

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
      // Error handling removed for production
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    // Show loading
    showApiResponse.loading('Şirket bilgileri kaydediliyor...');
    
    try {
      // Get user info from auth store or localStorage
      const currentUser = user || JSON.parse(localStorage.getItem('user') || '{}');
      
      // Prepare company data matching backend format
      const companyData = {
        name: currentUser.companyName || currentUser.tenant?.name || 'Şirket',
        code: currentUser.tenant?.code || `company_${Date.now()}`,
        legalName: currentUser.companyName || currentUser.tenant?.name || 'Şirket', // Legal name same as company name initially
        identityType: 'TaxNumber', // Default to TaxNumber
        identityNumber: formData.taxNumber, // Use tax number as identity number
        taxNumber: formData.taxNumber,
        taxOffice: formData.taxOffice,
        tradeRegisterNumber: formData.tradeRegisterNumber,
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        fax: '', // Optional, leave empty
        website: formData.website,
        sector: formData.sector,
        employeeCount: formData.employeeCount ? parseInt(formData.employeeCount.split('-')[0]) : undefined,
        foundedYear: formData.foundedYear,
        foundedDate: formData.foundedYear ? `${formData.foundedYear}-01-01` : new Date().toISOString().split('T')[0],
        currency: formData.currency,
        timezone: formData.timezone, // This will be a timezone string like 'Europe/Istanbul'
        // Address should be a nested object
        address: {
          country: formData.country,
          city: formData.city,
          district: formData.district,
          postalCode: formData.postalCode,
          addressLine: formData.addressLine
        }
      };
      
      // Create company via API
      await companyService.createCompany(companyData);
      
      // Show success message
      await Swal.fire({
        icon: 'success',
        title: 'Başarılı!',
        text: 'Şirket kurulumu başarıyla tamamlandı.',
        html: `
          <div style="text-align: left;">
            <p><strong>Şirket Adı:</strong> ${companyData.name}</p>
            <p><strong>Vergi No:</strong> ${companyData.taxNumber}</p>
            <p><strong>Vergi Dairesi:</strong> ${companyData.taxOffice || '-'}</p>
            <p style="margin-top: 10px;">Yönlendiriliyorsunuz...</p>
          </div>
        `,
        confirmButtonText: 'Tamam',
        confirmButtonColor: '#667eea',
        timer: 3000,
        timerProgressBar: true
      });
      
      // Mark company setup as complete
      localStorage.setItem('company_setup_complete', 'true');
      
      // Navigate to main app
      navigate('/app');
    } catch (error: any) {
      // Error handling removed for production
      // Close loading
      Swal.close();
      
      // Prepare error details
      let errorMessage = 'Şirket kurulumu sırasında bir hata oluştu.';
      let errorDetails = '';
      
      if (error.response?.data) {
        const data = error.response.data;
        
        // Check for validation errors
        if (data.errors) {
          errorDetails = '<div style="text-align: left; margin-top: 10px;">';
          if (typeof data.errors === 'object') {
            Object.keys(data.errors).forEach(field => {
              const fieldErrors = Array.isArray(data.errors[field]) ? data.errors[field] : [data.errors[field]];
              fieldErrors.forEach((err: string) => {
                errorDetails += `<p style="margin: 5px 0;"><strong>${field}:</strong> ${err}</p>`;
              });
            });
          } else if (Array.isArray(data.errors)) {
            data.errors.forEach((err: string) => {
              errorDetails += `<p style="margin: 5px 0;">• ${err}</p>`;
            });
          } else {
            errorDetails += `<p>${data.errors}</p>`;
          }
          errorDetails += '</div>';
        } else if (data.message) {
          errorMessage = data.message;
        } else if (data.detail) {
          errorMessage = data.detail;
        } else if (typeof data === 'string') {
          errorMessage = data;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Show detailed error message
      await Swal.fire({
        icon: 'error',
        title: 'Hata!',
        text: errorMessage,
        html: errorDetails || undefined,
        confirmButtonText: 'Tamam',
        confirmButtonColor: '#667eea',
        footer: error.response?.status === 403 ? 
          '<p style="color: #666;">Bu işlem için yetkiniz bulunmuyor.</p>' : 
          error.response?.status === 401 ? 
          '<p style="color: #666;">Oturum süreniz dolmuş olabilir. Lütfen tekrar giriş yapın.</p>' : 
          undefined
      });
      
      // If unauthorized, redirect to login
      if (error.response?.status === 401) {
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
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
                  label="İl"
                  rules={[{ required: true, message: 'İl seçimi zorunludur' }]}
                >
                  <Select 
                    size="large" 
                    placeholder="İl seçiniz"
                    onChange={handleCityChange}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={getCitiesForSelect()}
                  />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="district"
                  label="İlçe"
                  rules={[{ required: true, message: 'İlçe seçimi zorunludur' }]}
                >
                  <Select
                    size="large"
                    placeholder="Önce il seçiniz"
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={districts}
                    disabled={districts.length === 0}
                  />
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