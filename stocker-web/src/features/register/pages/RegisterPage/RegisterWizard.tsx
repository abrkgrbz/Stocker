import React, { useState } from 'react';
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
  InputNumber,
  message,
  Alert,
  Tooltip
} from 'antd';
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
  IdcardOutlined
} from '@ant-design/icons';
import { apiClient } from '@/shared/api/client';
import PasswordStrength from '@/shared/components/PasswordStrength';

const { Title, Text } = Typography;
const { Step } = Steps;

interface RegisterWizardProps {
  onComplete: (data: any) => void;
  selectedPackage?: any;
}

export const RegisterWizard: React.FC<RegisterWizardProps> = ({ onComplete, selectedPackage }) => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});

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

  const next = async () => {
    try {
      const values = await form.validateFields();
      setFormData({ ...formData, ...values });
      
      if (currentStep === steps.length - 1) {
        handleSubmit({ ...formData, ...values });
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
      // Backend için veri hazırla
      const [firstName, ...lastNameParts] = allValues.contactName?.split(' ') || ['', ''];
      const lastName = lastNameParts.join(' ') || firstName;
      
      const registrationData = {
        // Şirket bilgileri
        companyName: allValues.companyName,
        companyCode: allValues.companyCode,
        identityType: allValues.identityType,
        identityNumber: allValues.identityNumber,
        sector: allValues.sector,
        employeeCount: allValues.employeeCount,
        
        // İletişim bilgileri
        contactName: allValues.contactName,
        contactEmail: allValues.email,
        contactPhone: allValues.phone,
        contactTitle: allValues.title,
        
        // Kullanıcı bilgileri
        email: allValues.email,
        username: allValues.email?.split('@')[0] || allValues.companyCode,
        firstName: firstName,
        lastName: lastName,
        password: allValues.password,
        
        // Domain ve paket
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <Title level={4}>
              <ShopOutlined /> Şirket Bilgileri
            </Title>
            <Divider />
            
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  name="companyName"
                  label="Şirket Adı"
                  rules={[{ required: true, message: 'Şirket adı zorunludur' }]}
                >
                  <Input 
                    size="large"
                    prefix={<ShopOutlined />}
                    placeholder="ABC Teknoloji A.Ş." 
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="companyCode"
                  label={
                    <Space>
                      Şirket Kodu
                      <Tooltip title="URL'de kullanılacak benzersiz kod">
                        <InfoCircleOutlined />
                      </Tooltip>
                    </Space>
                  }
                  rules={[
                    { required: true, message: 'Şirket kodu zorunludur' },
                    { pattern: /^[a-z0-9-]+$/, message: 'Küçük harf, rakam ve tire kullanın' }
                  ]}
                >
                  <Input 
                    size="large"
                    placeholder="abc-teknoloji" 
                    addonAfter=".stocker.app"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  name="identityType"
                  label="Vergi Türü"
                  rules={[{ required: true }]}
                  initialValue="vergi"
                >
                  <Radio.Group size="large" buttonStyle="solid">
                    <Radio.Button value="tc">
                      <IdcardOutlined /> Şahıs Şirketi
                    </Radio.Button>
                    <Radio.Button value="vergi">
                      <BuildOutlined /> Kurumsal
                    </Radio.Button>
                  </Radio.Group>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="identityNumber"
                  label="TC Kimlik / Vergi No"
                  rules={[
                    { required: true, message: 'Bu alan zorunludur' },
                    { pattern: /^\d{10,11}$/, message: '10-11 haneli olmalı' }
                  ]}
                >
                  <Input 
                    size="large"
                    prefix={<IdcardOutlined />}
                    placeholder="12345678901" 
                    maxLength={11}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  name="sector"
                  label="Sektör"
                  rules={[{ required: true, message: 'Sektör seçimi zorunludur' }]}
                >
                  <Select size="large" placeholder="Sektörünüzü seçin">
                    <Select.Option value="Teknoloji">💻 Teknoloji</Select.Option>
                    <Select.Option value="Perakende">🛍️ Perakende</Select.Option>
                    <Select.Option value="Üretim">🏭 Üretim</Select.Option>
                    <Select.Option value="Hizmet">🤝 Hizmet</Select.Option>
                    <Select.Option value="İnşaat">🏗️ İnşaat</Select.Option>
                    <Select.Option value="Sağlık">🏥 Sağlık</Select.Option>
                    <Select.Option value="Eğitim">🎓 Eğitim</Select.Option>
                    <Select.Option value="Lojistik">🚚 Lojistik</Select.Option>
                    <Select.Option value="Gıda">🍽️ Gıda</Select.Option>
                    <Select.Option value="Diğer">📋 Diğer</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="employeeCount"
                  label="Çalışan Sayısı"
                  rules={[{ required: true, message: 'Çalışan sayısı zorunludur' }]}
                >
                  <Select size="large" placeholder="Çalışan sayınızı seçin">
                    <Select.Option value="1-10">
                      <TeamOutlined /> 1-10 Kişi
                    </Select.Option>
                    <Select.Option value="11-50">
                      <TeamOutlined /> 11-50 Kişi
                    </Select.Option>
                    <Select.Option value="51-100">
                      <TeamOutlined /> 51-100 Kişi
                    </Select.Option>
                    <Select.Option value="101-500">
                      <TeamOutlined /> 101-500 Kişi
                    </Select.Option>
                    <Select.Option value="500+">
                      <TeamOutlined /> 500+ Kişi
                    </Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </>
        );

      case 1:
        return (
          <>
            <Title level={4}>
              <UserOutlined /> Yetkili Bilgileri
            </Title>
            <Divider />
            
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  name="contactName"
                  label="Ad Soyad"
                  rules={[{ required: true, message: 'Ad soyad zorunludur' }]}
                >
                  <Input 
                    size="large"
                    prefix={<UserOutlined />}
                    placeholder="Ahmet Yılmaz" 
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="title"
                  label="Unvan"
                  rules={[{ required: true, message: 'Unvan zorunludur' }]}
                >
                  <Select size="large" placeholder="Unvanınızı seçin">
                    <Select.Option value="Genel Müdür">Genel Müdür</Select.Option>
                    <Select.Option value="İşletme Sahibi">İşletme Sahibi</Select.Option>
                    <Select.Option value="Müdür">Müdür</Select.Option>
                    <Select.Option value="Yönetici">Yönetici</Select.Option>
                    <Select.Option value="Muhasebe Müdürü">Muhasebe Müdürü</Select.Option>
                    <Select.Option value="IT Müdürü">IT Müdürü</Select.Option>
                    <Select.Option value="Satın Alma Müdürü">Satın Alma Müdürü</Select.Option>
                    <Select.Option value="İnsan Kaynakları">İnsan Kaynakları</Select.Option>
                    <Select.Option value="Diğer">Diğer</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  name="email"
                  label="E-posta"
                  rules={[
                    { required: true, message: 'E-posta zorunludur' },
                    { type: 'email', message: 'Geçerli bir e-posta girin' }
                  ]}
                >
                  <Input 
                    size="large"
                    prefix={<MailOutlined />}
                    placeholder="ahmet@sirket.com" 
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="phone"
                  label="Telefon"
                  rules={[
                    { required: true, message: 'Telefon zorunludur' },
                    { pattern: /^[0-9]{10,11}$/, message: 'Geçerli telefon girin' }
                  ]}
                >
                  <Input 
                    size="large"
                    prefix={<PhoneOutlined />}
                    placeholder="5551234567" 
                    maxLength={11}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Alert
              message="Önemli"
              description="Bu e-posta adresiniz hem iletişim hem de sisteme giriş için kullanılacaktır."
              type="info"
              showIcon
              style={{ marginTop: 24 }}
            />
          </>
        );

      case 2:
        return (
          <>
            <Title level={4}>
              <LockOutlined /> Hesap Güvenliği
            </Title>
            <Divider />
            
            <Row gutter={24}>
              <Col span={24}>
                <Alert
                  message="Güvenli Şifre Oluşturun"
                  description="Şifreniz en az 8 karakter olmalı ve büyük harf, küçük harf, rakam ve özel karakter içermelidir."
                  type="warning"
                  showIcon
                  style={{ marginBottom: 24 }}
                />
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  name="password"
                  label="Şifre"
                  rules={[
                    { required: true, message: 'Şifre zorunludur' },
                    { min: 8, message: 'En az 8 karakter olmalı' },
                    { 
                      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                      message: 'Büyük harf, küçük harf, rakam ve özel karakter içermeli'
                    }
                  ]}
                >
                  <Input.Password 
                    size="large"
                    prefix={<LockOutlined />}
                    placeholder="Güvenli şifreniz" 
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
                  <Input.Password 
                    size="large"
                    prefix={<LockOutlined />}
                    placeholder="Şifrenizi tekrar girin" 
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row>
              <Col span={24}>
                <PasswordStrength password={form.getFieldValue('password')} />
              </Col>
            </Row>

            {selectedPackage && (
              <Alert
                message="Seçili Paket"
                description={`${selectedPackage.name} - ${selectedPackage.price}₺/Ay`}
                type="success"
                showIcon
                icon={<CheckCircleOutlined />}
                style={{ marginTop: 24 }}
              />
            )}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <Steps current={currentStep} items={steps} style={{ marginBottom: 32 }} />
      
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
      >
        {renderStepContent()}
      </Form>

      <Divider />

      <Row justify="space-between">
        <Col>
          {currentStep > 0 && (
            <Button size="large" onClick={prev}>
              Geri
            </Button>
          )}
        </Col>
        <Col>
          <Button 
            type="primary" 
            size="large"
            loading={loading}
            onClick={next}
          >
            {currentStep === steps.length - 1 ? 'Kaydı Tamamla' : 'İleri'}
          </Button>
        </Col>
      </Row>
    </Card>
  );
};