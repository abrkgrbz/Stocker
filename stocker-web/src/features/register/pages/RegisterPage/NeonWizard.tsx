import React, { useState, useEffect } from 'react';
import { Form, message } from 'antd';
import {
  UserOutlined,
  ShopOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  InfoCircleOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  IdcardOutlined,
  CheckOutlined,
  CloseOutlined,
  SafetyOutlined,
  BankOutlined,
  SolutionOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  RocketOutlined
} from '@ant-design/icons';
import { apiClient } from '@/shared/api/client';
import './neon-wizard.css';

interface NeonWizardProps {
  onComplete: (data: any) => void;
  selectedPackage?: any;
}

export const NeonWizard: React.FC<NeonWizardProps> = ({ onComplete, selectedPackage }) => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [password, setPassword] = useState('');
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const steps = [
    {
      id: 1,
      title: 'Şirket Bilgileri',
      description: 'İşletme detayları',
      icon: <ShopOutlined />
    },
    {
      id: 2, 
      title: 'Yetkili Bilgileri',
      description: 'İletişim bilgileri',
      icon: <UserOutlined />
    },
    {
      id: 3,
      title: 'Hesap Güvenliği',
      description: 'Şifre oluşturma',
      icon: <LockOutlined />
    }
  ];

  const passwordRequirements = [
    { key: 'length', label: 'En az 8 karakter', test: (pwd: string) => pwd.length >= 8 },
    { key: 'uppercase', label: 'Büyük harf (A-Z)', test: (pwd: string) => /[A-Z]/.test(pwd) },
    { key: 'lowercase', label: 'Küçük harf (a-z)', test: (pwd: string) => /[a-z]/.test(pwd) },
    { key: 'number', label: 'Rakam (0-9)', test: (pwd: string) => /\d/.test(pwd) },
    { key: 'special', label: 'Özel karakter (!@#$%)', test: (pwd: string) => /[@$!%*?&]/.test(pwd) },
    { key: 'noSpace', label: 'Boşluk içermemeli', test: (pwd: string) => !/\s/.test(pwd) }
  ];

  const next = async () => {
    try {
      const values = await form.validateFields();
      const newFormData = { ...formData, ...values };
      setFormData(newFormData);
      
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      
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

  const goToStep = (stepIndex: number) => {
    if (stepIndex <= Math.max(...completedSteps, 0) + 1) {
      setCurrentStep(stepIndex);
    }
  };

  const handleSubmit = async (allValues: any) => {
    setLoading(true);
    try {
      const [firstName, ...lastNameParts] = allValues.contactName?.split(' ') || ['', ''];
      const lastName = lastNameParts.join(' ') || firstName;
      
      const registrationData = {
        companyName: allValues.companyName,
        companyCode: allValues.companyCode,
        identityType: allValues.identityType,
        identityNumber: allValues.identityNumber,
        sector: allValues.sector,
        employeeCount: allValues.employeeCount,
        contactName: allValues.contactName,
        contactEmail: allValues.email,
        contactPhone: allValues.phone,
        contactTitle: allValues.title,
        email: allValues.email,
        username: allValues.email?.split('@')[0] || allValues.companyCode,
        firstName: firstName,
        lastName: lastName,
        password: allValues.password,
        domain: allValues.companyCode,
        packageId: selectedPackage?.id,
        billingPeriod: 'Monthly'
      };

      const response = await apiClient.post('/api/public/register', registrationData);
      
      if (response.data?.success) {
        message.success('Kayıt başarılı! Yönlendiriliyorsunuz...');
        onComplete(response.data.data);
      } else {
        message.error(response.data?.message || 'Kayıt başarısız');
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Bir hata oluştu');
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
          <>
            <div className="neon-form-header">
              <h3>Şirket Bilgilerinizi Girin</h3>
              <p>İşletmenizin temel bilgilerini doldurun</p>
            </div>
            
            <div className="neon-form-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div className="neon-form-group">
                  <label className="neon-form-label">
                    <ShopOutlined className="neon-form-label-icon" />
                    Şirket Adı
                  </label>
                  <Form.Item
                    name="companyName"
                    rules={[{ required: true, message: 'Şirket adı zorunludur' }]}
                    noStyle
                  >
                    <div className="neon-input-wrapper">
                      <input 
                        className="neon-input"
                        placeholder="ABC Teknoloji A.Ş."
                      />
                      <ShopOutlined className="neon-input-icon" />
                    </div>
                  </Form.Item>
                </div>

                <div className="neon-form-group">
                  <label className="neon-form-label">
                    <InfoCircleOutlined className="neon-form-label-icon" />
                    Şirket Kodu
                  </label>
                  <Form.Item
                    name="companyCode"
                    rules={[
                      { required: true, message: 'Şirket kodu zorunludur' },
                      { pattern: /^[a-z0-9-]+$/, message: 'Küçük harf, rakam ve tire' }
                    ]}
                    noStyle
                  >
                    <div className="neon-input-wrapper">
                      <input 
                        className="neon-input"
                        placeholder="abc-teknoloji"
                      />
                      <RocketOutlined className="neon-input-icon" />
                    </div>
                  </Form.Item>
                </div>
              </div>

              <div className="neon-form-group">
                <label className="neon-form-label">
                  <IdcardOutlined className="neon-form-label-icon" />
                  Vergi Türü
                </label>
                <Form.Item
                  name="identityType"
                  initialValue="vergi"
                  rules={[{ required: true, message: 'Vergi türü seçimi zorunludur' }]}
                  noStyle
                >
                  <div className="neon-radio-group">
                    <div className="neon-radio-button">
                      <input type="radio" id="tc" name="identityType" value="tc" />
                      <label htmlFor="tc" className="neon-radio-label" onClick={() => form.setFieldsValue({ identityType: 'tc' })}>
                        <IdcardOutlined className="neon-radio-icon" />
                        Şahıs Şirketi
                      </label>
                    </div>
                    <div className="neon-radio-button">
                      <input type="radio" id="vergi" name="identityType" value="vergi" defaultChecked />
                      <label htmlFor="vergi" className="neon-radio-label" onClick={() => form.setFieldsValue({ identityType: 'vergi' })}>
                        <BankOutlined className="neon-radio-icon" />
                        Kurumsal
                      </label>
                    </div>
                  </div>
                </Form.Item>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div className="neon-form-group">
                  <label className="neon-form-label">
                    <IdcardOutlined className="neon-form-label-icon" />
                    TC Kimlik / Vergi No
                  </label>
                  <Form.Item
                    name="identityNumber"
                    rules={[
                      { required: true, message: 'Bu alan zorunludur' },
                      { pattern: /^\d{10,11}$/, message: '10-11 haneli olmalı' }
                    ]}
                    noStyle
                  >
                    <div className="neon-input-wrapper">
                      <input 
                        className="neon-input"
                        placeholder="12345678901"
                        maxLength={11}
                      />
                      <IdcardOutlined className="neon-input-icon" />
                    </div>
                  </Form.Item>
                </div>

                <div className="neon-form-group">
                  <label className="neon-form-label">
                    <TeamOutlined className="neon-form-label-icon" />
                    Çalışan Sayısı
                  </label>
                  <Form.Item
                    name="employeeCount"
                    rules={[{ required: true, message: 'Çalışan sayısı zorunludur' }]}
                    noStyle
                  >
                    <div className="neon-input-wrapper">
                      <select className="neon-input neon-select">
                        <option value="">Seçiniz</option>
                        <option value="1-10">1-10 Kişi</option>
                        <option value="11-50">11-50 Kişi</option>
                        <option value="51-100">51-100 Kişi</option>
                        <option value="101-500">101-500 Kişi</option>
                        <option value="500+">500+ Kişi</option>
                      </select>
                      <TeamOutlined className="neon-input-icon" />
                    </div>
                  </Form.Item>
                </div>
              </div>

              <div className="neon-form-group">
                <label className="neon-form-label">
                  <ShopOutlined className="neon-form-label-icon" />
                  Sektör
                </label>
                <Form.Item
                  name="sector"
                  rules={[{ required: true, message: 'Sektör seçimi zorunludur' }]}
                  noStyle
                >
                  <div className="neon-input-wrapper">
                    <select className="neon-input neon-select">
                      <option value="">Sektörünüzü seçin</option>
                      <option value="Teknoloji">💻 Teknoloji</option>
                      <option value="Perakende">🛍️ Perakende</option>
                      <option value="Üretim">🏭 Üretim</option>
                      <option value="Hizmet">🤝 Hizmet</option>
                      <option value="İnşaat">🏗️ İnşaat</option>
                      <option value="Sağlık">🏥 Sağlık</option>
                      <option value="Eğitim">🎓 Eğitim</option>
                      <option value="Lojistik">🚚 Lojistik</option>
                      <option value="Gıda">🍽️ Gıda</option>
                      <option value="Diğer">📋 Diğer</option>
                    </select>
                    <ShopOutlined className="neon-input-icon" />
                  </div>
                </Form.Item>
              </div>
            </div>
          </>
        );

      case 1:
        return (
          <>
            <div className="neon-form-header">
              <h3>Yetkili Bilgileri</h3>
              <p>İletişim ve yetkili kişi bilgilerini girin</p>
            </div>
            
            <div className="neon-form-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div className="neon-form-group">
                  <label className="neon-form-label">
                    <UserOutlined className="neon-form-label-icon" />
                    Ad Soyad
                  </label>
                  <Form.Item
                    name="contactName"
                    rules={[{ required: true, message: 'Ad soyad zorunludur' }]}
                    noStyle
                  >
                    <div className="neon-input-wrapper">
                      <input 
                        className="neon-input"
                        placeholder="Ahmet Yılmaz"
                      />
                      <UserOutlined className="neon-input-icon" />
                    </div>
                  </Form.Item>
                </div>

                <div className="neon-form-group">
                  <label className="neon-form-label">
                    <SolutionOutlined className="neon-form-label-icon" />
                    Unvan
                  </label>
                  <Form.Item
                    name="title"
                    rules={[{ required: true, message: 'Unvan zorunludur' }]}
                    noStyle
                  >
                    <div className="neon-input-wrapper">
                      <select className="neon-input neon-select">
                        <option value="">Unvanınızı seçin</option>
                        <option value="Genel Müdür">Genel Müdür</option>
                        <option value="İşletme Sahibi">İşletme Sahibi</option>
                        <option value="Müdür">Müdür</option>
                        <option value="Yönetici">Yönetici</option>
                        <option value="Muhasebe Müdürü">Muhasebe Müdürü</option>
                        <option value="IT Müdürü">IT Müdürü</option>
                        <option value="Satın Alma Müdürü">Satın Alma Müdürü</option>
                        <option value="İnsan Kaynakları">İnsan Kaynakları</option>
                        <option value="Diğer">Diğer</option>
                      </select>
                      <SolutionOutlined className="neon-input-icon" />
                    </div>
                  </Form.Item>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div className="neon-form-group">
                  <label className="neon-form-label">
                    <MailOutlined className="neon-form-label-icon" />
                    E-posta Adresi
                  </label>
                  <Form.Item
                    name="email"
                    rules={[
                      { required: true, message: 'E-posta zorunludur' },
                      { type: 'email', message: 'Geçerli bir e-posta girin' }
                    ]}
                    noStyle
                  >
                    <div className="neon-input-wrapper">
                      <input 
                        type="email"
                        className="neon-input"
                        placeholder="ahmet@sirket.com"
                      />
                      <MailOutlined className="neon-input-icon" />
                    </div>
                  </Form.Item>
                </div>

                <div className="neon-form-group">
                  <label className="neon-form-label">
                    <PhoneOutlined className="neon-form-label-icon" />
                    Telefon Numarası
                  </label>
                  <Form.Item
                    name="phone"
                    rules={[
                      { required: true, message: 'Telefon zorunludur' },
                      { pattern: /^[0-9]{10,11}$/, message: 'Geçerli telefon girin' }
                    ]}
                    noStyle
                  >
                    <div className="neon-input-wrapper">
                      <input 
                        className="neon-input"
                        placeholder="5551234567"
                        maxLength={11}
                      />
                      <PhoneOutlined className="neon-input-icon" />
                    </div>
                  </Form.Item>
                </div>
              </div>

              <div className="neon-info-box">
                <InfoCircleOutlined className="neon-info-icon" />
                <div className="neon-info-content">
                  <h5>Önemli Bilgilendirme</h5>
                  <p>
                    E-posta adresiniz hem iletişim hem de sisteme giriş için kullanılacaktır. 
                    Lütfen aktif olarak kullandığınız bir e-posta adresi girin.
                  </p>
                </div>
              </div>
            </div>
          </>
        );

      case 2:
        return (
          <>
            <div className="neon-form-header">
              <h3>Hesap Güvenliği</h3>
              <p>Güçlü bir şifre oluşturarak hesabınızı koruyun</p>
            </div>
            
            <div className="neon-form-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div className="neon-form-group">
                  <label className="neon-form-label">
                    <LockOutlined className="neon-form-label-icon" />
                    Şifre
                  </label>
                  <Form.Item
                    name="password"
                    rules={[
                      { required: true, message: 'Şifre zorunludur' },
                      { min: 8, message: 'En az 8 karakter olmalı' },
                      { 
                        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                        message: 'Şifre gereksinimleri karşılanmıyor'
                      }
                    ]}
                    noStyle
                  >
                    <div className="neon-input-wrapper">
                      <input 
                        type="password"
                        className="neon-input"
                        placeholder="Güvenli şifreniz"
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <LockOutlined className="neon-input-icon" />
                    </div>
                  </Form.Item>
                </div>

                <div className="neon-form-group">
                  <label className="neon-form-label">
                    <LockOutlined className="neon-form-label-icon" />
                    Şifre Tekrar
                  </label>
                  <Form.Item
                    name="confirmPassword"
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
                    noStyle
                  >
                    <div className="neon-input-wrapper">
                      <input 
                        type="password"
                        className="neon-input"
                        placeholder="Şifrenizi tekrar girin"
                      />
                      <LockOutlined className="neon-input-icon" />
                    </div>
                  </Form.Item>
                </div>
              </div>

              {password && (
                <div className="neon-password-strength">
                  <div className="neon-password-header">
                    <SafetyOutlined className="neon-password-header-icon" />
                    <h5>Şifre Gereksinimleri</h5>
                  </div>
                  <div className="neon-password-requirements">
                    {passwordRequirements.map(req => (
                      <div 
                        key={req.key} 
                        className={`neon-requirement ${req.test(password) ? 'valid' : ''}`}
                      >
                        {req.test(password) ? (
                          <CheckCircleOutlined className="neon-requirement-icon" />
                        ) : (
                          <CloseOutlined className="neon-requirement-icon" />
                        )}
                        {req.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedPackage && (
                <div className="neon-info-box">
                  <CheckCircleOutlined className="neon-info-icon" />
                  <div className="neon-info-content">
                    <h5>Seçili Paket: {selectedPackage.name}</h5>
                    <p>
                      Aylık {selectedPackage.price}₺ ödeme ile başlayacaksınız. 
                      İlk 14 gün ücretsiz deneme süreniz bulunmaktadır.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="neon-wizard-wrapper">
      {/* Animated Background Shapes */}
      <div className="floating-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <div className="neon-wizard-card">
        {/* Left Sidebar */}
        <div className="neon-wizard-sidebar">
          <div className="wizard-logo">
            <h2>Stocker</h2>
            <p>İşletme Yönetim Sistemi</p>
          </div>

          <div className="neon-steps">
            {steps.map((step, index) => (
              <div 
                key={step.id}
                className={`neon-step ${currentStep === index ? 'active' : ''} ${completedSteps.includes(index) ? 'completed' : ''}`}
                onClick={() => goToStep(index)}
              >
                <div className="neon-step-indicator">
                  {completedSteps.includes(index) && currentStep !== index ? (
                    <CheckOutlined className="neon-step-check" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <div className="neon-step-content">
                  <h4>{step.title}</h4>
                  <p>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Content */}
        <div className="neon-wizard-content">
          {/* Progress Bar */}
          <div className="neon-progress-bar">
            <div 
              className="neon-progress-fill" 
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>

          <Form
            form={form}
            layout="vertical"
            autoComplete="off"
          >
            {loading ? (
              <div className="neon-loading">
                <div className="neon-spinner"></div>
                <div className="neon-loading-text">İşleminiz gerçekleştiriliyor...</div>
              </div>
            ) : (
              renderStepContent()
            )}
          </Form>

          {/* Footer */}
          <div className="neon-wizard-footer">
            <button
              className="neon-btn neon-btn-secondary"
              onClick={prev}
              disabled={currentStep === 0}
            >
              <ArrowLeftOutlined />
              Geri
            </button>

            <div className="neon-step-dots">
              {steps.map((_, index) => (
                <div 
                  key={index} 
                  className={`neon-dot ${currentStep === index ? 'active' : ''}`}
                />
              ))}
            </div>

            <button
              className="neon-btn neon-btn-primary"
              onClick={next}
              disabled={loading}
            >
              {currentStep === steps.length - 1 ? 'Kaydı Tamamla' : 'İleri'}
              {currentStep < steps.length - 1 && <ArrowRightOutlined />}
              {currentStep === steps.length - 1 && <CheckOutlined />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};