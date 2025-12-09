'use client';

import React, { useState } from 'react';
import { Modal, Steps, Button, Form, Input, Select, Typography, Space, Card, message } from 'antd';
import {
  CheckCircleOutlined,
  ShopOutlined,
  CrownOutlined,
  RocketOutlined
} from '@ant-design/icons';
import { showAlert } from '@/lib/sweetalert-config';
import Swal from 'sweetalert2';
import { SetupProgressModal } from '@/components/setup/SetupProgressModal';

const { Title, Paragraph, Text } = Typography;
const { Step } = Steps;

interface OnboardingModalProps {
  visible: boolean;
  wizardData: {
    currentStepIndex: number;
    totalSteps: number;
    progressPercentage: number;
  };
  onComplete: (data: OnboardingData) => Promise<{ tenantId?: string; success?: boolean }>;
}

interface OnboardingData {
  sector?: string;
  companyName: string;
  companyCode: string;
  packageId: string;
  contactPhone?: string;
}

const sectors = [
  { value: 'retail', label: 'Perakende' },
  { value: 'wholesale', label: 'Toptan Ticaret' },
  { value: 'manufacturing', label: 'Üretim' },
  { value: 'services', label: 'Hizmet' },
  { value: 'technology', label: 'Teknoloji' },
  { value: 'healthcare', label: 'Sağlık' },
  { value: 'education', label: 'Eğitim' },
  { value: 'construction', label: 'İnşaat' },
  { value: 'food', label: 'Gıda' },
  { value: 'other', label: 'Diğer' },
];

const packages = [
  {
    id: 'trial',
    name: 'Deneme Paketi',
    price: 'ÜCRETSİZ',
    duration: '14 Gün',
    features: [
      'Tüm modüllere erişim',
      '5 kullanıcı',
      'Email desteği',
      'Temel raporlar',
    ],
  },
  {
    id: 'starter',
    name: 'Başlangıç',
    price: '₺499',
    duration: '/ay',
    features: [
      'Tüm modüller',
      '10 kullanıcı',
      'Öncelikli destek',
      'Gelişmiş raporlar',
      'API erişimi',
    ],
  },
  {
    id: 'professional',
    name: 'Profesyonel',
    price: '₺999',
    duration: '/ay',
    features: [
      'Tüm özellikler',
      '50 kullanıcı',
      '7/24 destek',
      'Özel raporlar',
      'Entegrasyonlar',
      'Eğitim',
    ],
  },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  visible,
  wizardData,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [formData, setFormData] = useState<Partial<OnboardingData>>({});

  // Setup progress modal state
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [setupTenantId, setSetupTenantId] = useState<string | null>(null);

  const steps = [
    {
      title: 'Hoş Geldiniz',
      icon: <RocketOutlined />,
    },
    {
      title: 'Sektör Seçimi',
      icon: <ShopOutlined />,
    },
    {
      title: 'Şirket Bilgileri',
      icon: <CheckCircleOutlined />,
    },
    {
      title: 'Paket Seçimi',
      icon: <CrownOutlined />,
    },
  ];

  const handleNext = async () => {
    if (currentStep === 1) {
      // Sektör seçimi opsiyonel, form validate etmeye gerek yok
      const sector = form.getFieldValue('sector');
      setFormData({ ...formData, sector });
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 2) {
      // Şirket bilgileri required
      try {
        const values = await form.validateFields(['companyName', 'companyCode', 'contactPhone']);
        setFormData({ ...formData, ...values });
        setCurrentStep(currentStep + 1);
      } catch (error: any) {
        // Form validation failed - show errors with SweetAlert2
        console.error('Form validation error:', error);
        await Swal.fire({
          icon: 'error',
          title: 'Eksik Bilgiler',
          text: 'Lütfen tüm zorunlu alanları doldurun',
          confirmButtonText: 'Tamam',
          confirmButtonColor: '#1890ff'
        });
      }
    } else if (currentStep === 3) {
      // Paket seçimi required
      try {
        const values = await form.validateFields(['packageId']);
        const finalData = { ...formData, ...values } as OnboardingData;
        setLoading(true);

        // Call onComplete and get tenantId for progress tracking
        console.log('📤 OnboardingModal calling onComplete with:', finalData);
        const result = await onComplete(finalData);
        console.log('📥 OnboardingModal received result:', result);
        setLoading(false);

        // If we got a tenantId, show the progress modal (provisioning started)
        // Otherwise tenant is already active, redirect to dashboard
        if (result?.tenantId) {
          console.log('✅ TenantId received, showing progress modal:', result.tenantId);
          setSetupTenantId(result.tenantId);
          setShowProgressModal(true);
        } else {
          console.log('⚠️ No tenantId, redirecting to dashboard');
          // Tenant already active, redirect immediately
          window.location.href = '/dashboard';
        }
      } catch (error: any) {
        // Form validation failed or API error
        setLoading(false);
        console.error('Onboarding error:', error);

        // Check for frontend form validation errors
        if (error?.errorFields) {
          await showAlert.error('Eksik Bilgiler', 'Lütfen tüm zorunlu alanları doldurun');
          return;
        }

        // Check for backend validation errors (from Next.js API route)
        if (error?.errors) {
          const backendErrors = error.errors;
          let errorMessage = '';

          if (typeof backendErrors === 'object') {
            // Convert validation errors to HTML list
            const errorList = Object.entries(backendErrors)
              .map(([field, messages]: [string, any]) => {
                const messageArray = Array.isArray(messages) ? messages : [messages];
                return messageArray.map(msg => `• ${msg}`).join('<br>');
              })
              .join('<br>');

            errorMessage = errorList;
          } else {
            errorMessage = String(backendErrors);
          }

          await showAlert.error(
            'Doğrulama Hataları',
            errorMessage || 'Kurulum sırasında bir hata oluştu',
            { width: '600px' }
          );
          return;
        }

        // Generic error message
        await showAlert.error('Hata', error?.message || 'Kurulum sırasında bir hata oluştu');
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSkipSector = () => {
    setFormData({ ...formData, sector: undefined });
    setCurrentStep(currentStep + 1);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <RocketOutlined style={{ fontSize: 72, color: '#1890ff', marginBottom: 24 }} />
            <Title level={2}>Stocker'a Hoş Geldiniz! 🎉</Title>
            <Paragraph style={{ fontSize: 16, marginTop: 16 }}>
              İşletmenizi yönetmek için gereken tüm araçlar artık elinizin altında.
            </Paragraph>
            <Paragraph style={{ fontSize: 16 }}>
              Başlamak için birkaç basit adımda kurulumu tamamlayalım.
            </Paragraph>
            <Space direction="vertical" size="small" style={{ marginTop: 32 }}>
              <Text>✅ Hızlı ve kolay kurulum</Text>
              <Text>✅ 14 günlük ücretsiz deneme</Text>
              <Text>✅ Kredi kartı gerektirmez</Text>
            </Space>
          </div>
        );

      case 1:
        return (
          <div style={{ padding: '20px' }}>
            <Title level={3}>Sektörünüzü Seçin</Title>
            <Paragraph>
              Size en uygun şablonları ve ayarları hazırlayabilmemiz için sektörünüzü seçin.
              Bu adımı atlayıp daha sonra da yapılandırabilirsiniz.
            </Paragraph>
            <Form form={form} layout="vertical" style={{ marginTop: 32 }}>
              <Form.Item
                name="sector"
                label="Sektör"
                help="İsteğe bağlı - Atlayarak devam edebilirsiniz"
              >
                <Select
                  size="large"
                  placeholder="Sektörünüzü seçin"
                  options={sectors}
                  allowClear
                />
              </Form.Item>
            </Form>
          </div>
        );

      case 2:
        return (
          <div style={{ padding: '20px' }}>
            <Title level={3}>Şirket Bilgileri</Title>
            <Paragraph>
              Temel şirket bilgilerinizi girin. Vergi bilgileri gibi detayları daha sonra ekleyebilirsiniz.
            </Paragraph>
            <Form form={form} layout="vertical" style={{ marginTop: 32 }}>
              <Form.Item
                name="companyName"
                label="Şirket Adı"
                rules={[{ required: true, message: 'Şirket adı gereklidir' }]}
              >
                <Input size="large" placeholder="Örn: ABC Ticaret Ltd. Şti." />
              </Form.Item>
              <Form.Item
                name="companyCode"
                label="Şirket Kodu"
                rules={[
                  { required: true, message: 'Şirket kodu gereklidir' },
                  { pattern: /^[A-Z0-9]{2,10}$/, message: 'Sadece büyük harf ve rakam (2-10 karakter)' }
                ]}
                help="Büyük harf ve rakamlardan oluşan kısa kod (2-10 karakter)"
              >
                <Input size="large" placeholder="Örn: ABC123" style={{ textTransform: 'uppercase' }} />
              </Form.Item>
              <Form.Item
                name="contactPhone"
                label="İletişim Telefonu"
              >
                <Input size="large" placeholder="Örn: 0532 xxx xx xx" />
              </Form.Item>
            </Form>
          </div>
        );

      case 3:
        return (
          <div style={{ padding: '20px' }}>
            <Title level={3}>Paket Seçimi</Title>
            <Paragraph>
              İhtiyacınıza en uygun paketi seçin. Deneme paketi ile başlayıp daha sonra yükseltme yapabilirsiniz.
            </Paragraph>
            <Form form={form} layout="vertical" style={{ marginTop: 32 }}>
              <Form.Item
                name="packageId"
                rules={[{ required: true, message: 'Lütfen bir paket seçin' }]}
              >
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  {packages.map((pkg) => (
                    <Card
                      key={pkg.id}
                      hoverable
                      onClick={() => form.setFieldValue('packageId', pkg.id)}
                      style={{
                        border: form.getFieldValue('packageId') === pkg.id ? '2px solid #1890ff' : '1px solid #d9d9d9',
                        cursor: 'pointer',
                      }}
                    >
                      <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Title level={4} style={{ margin: 0 }}>{pkg.name}</Title>
                          <Text strong style={{ fontSize: 18, color: '#1890ff' }}>
                            {pkg.price}
                            {pkg.duration && <Text type="secondary"> {pkg.duration}</Text>}
                          </Text>
                        </div>
                        <div style={{ marginTop: 12 }}>
                          {pkg.features.map((feature, idx) => (
                            <div key={idx} style={{ marginBottom: 4 }}>
                              <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                              <Text>{feature}</Text>
                            </div>
                          ))}
                        </div>
                      </Space>
                    </Card>
                  ))}
                </Space>
              </Form.Item>
            </Form>
          </div>
        );

      default:
        return null;
    }
  };

  const handleProgressComplete = () => {
    // Redirect to dashboard after setup completes
    window.location.href = '/dashboard';
  };

  const handleProgressError = (error: string) => {
    console.error('Setup progress error:', error);
    setShowProgressModal(false);
    showAlert.error('Kurulum Hatası', error);
  };

  return (
    <>
      <Modal
        open={visible && !showProgressModal}
        title={null}
        footer={null}
        closable={false}
        maskClosable={false}
        width={800}
        centered
        styles={{
          body: { padding: 0 },
        }}
      >
        <div style={{ padding: '24px 24px 0' }}>
          <Steps current={currentStep} items={steps} />
        </div>

        <div style={{ minHeight: 400, padding: '24px' }}>
          {renderStepContent()}
        </div>

        <div style={{ padding: '0 24px 24px', borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              {currentStep > 0 && currentStep !== 3 && (
                <Button onClick={handlePrev}>
                  Geri
                </Button>
              )}
              {currentStep === 1 && (
                <Button onClick={handleSkipSector} style={{ marginLeft: 8 }}>
                  Atla
                </Button>
              )}
            </div>
            <div>
              {currentStep < 3 && (
                <Button type="primary" onClick={handleNext}>
                  {currentStep === 0 ? 'Başlayalım' : 'Devam Et'}
                </Button>
              )}
              {currentStep === 3 && (
                <Button type="primary" onClick={handleNext} loading={loading}>
                  Kurulumu Tamamla
                </Button>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Setup Progress Modal */}
      {setupTenantId && (
        <SetupProgressModal
          visible={showProgressModal}
          tenantId={setupTenantId}
          onComplete={handleProgressComplete}
          onError={handleProgressError}
          redirectUrl="/dashboard"
        />
      )}
    </>
  );
};
