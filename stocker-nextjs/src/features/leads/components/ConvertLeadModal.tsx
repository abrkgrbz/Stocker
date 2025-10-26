'use client';

import React, { useState } from 'react';
import { Drawer, Form, Input, Card, Steps, Button } from 'antd';
import {
  BankOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  SwapOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckOutlined,
} from '@ant-design/icons';

const { TextArea } = Input;

interface ConvertLeadModalProps {
  open: boolean;
  loading: boolean;
  initialValues?: any;
  onCancel: () => void;
  onSubmit: (values: any) => void;
}

export function ConvertLeadModal({
  open,
  loading,
  initialValues,
  onCancel,
  onSubmit,
}: ConvertLeadModalProps) {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);

  React.useEffect(() => {
    if (open && initialValues) {
      form.setFieldsValue(initialValues);
      setCurrentStep(0);
    } else if (open) {
      form.resetFields();
      setCurrentStep(0);
    }
  }, [open, initialValues, form]);

  const steps = [
    {
      title: 'Firma Bilgileri',
      icon: <BankOutlined />,
    },
    {
      title: 'İletişim',
      icon: <MailOutlined />,
    },
    {
      title: 'Adres & Tamamla',
      icon: <EnvironmentOutlined />,
    },
  ];

  const handleNext = async () => {
    try {
      const fieldsToValidate = getStepFields(currentStep);
      await form.validateFields(fieldsToValidate);
      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
      setCurrentStep(0);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleCancel = () => {
    setCurrentStep(0);
    onCancel();
  };

  const getStepFields = (step: number): string[] => {
    switch (step) {
      case 0:
        return ['companyName'];
      case 1:
        return ['email'];
      default:
        return [];
    }
  };

  return (
    <Drawer
      title={
        <div className="flex items-center gap-3 pb-4">
          <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md">
            <SwapOutlined className="text-white text-lg" />
          </div>
          <div className="text-lg font-semibold text-gray-800">Müşteriye Dönüştür</div>
        </div>
      }
      open={open}
      onClose={handleCancel}
      width={720}
      destroyOnClose
      placement="right"
      styles={{
        mask: {
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
        },
        body: { paddingTop: 24 },
      }}
      footer={
        <div className="flex justify-between items-center">
          <Button onClick={handlePrev} disabled={currentStep === 0} icon={<ArrowLeftOutlined />} size="large">
            Geri
          </Button>
          <div className="text-sm text-gray-500">Adım {currentStep + 1} / {steps.length}</div>
          {currentStep < steps.length - 1 ? (
            <Button type="primary" onClick={handleNext} icon={<ArrowRightOutlined />} iconPosition="end" size="large">
              İleri
            </Button>
          ) : (
            <Button type="primary" onClick={handleSubmit} loading={loading} icon={<CheckOutlined />} size="large">
              Müşteriye Dönüştür
            </Button>
          )}
        </div>
      }
    >
      {/* Steps */}
      <div className="mb-6">
        <Steps current={currentStep} items={steps} className="px-4" />
      </div>

      <Form form={form} layout="vertical">
        {/* Step 0: Firma Bilgileri */}
        {currentStep === 0 && (
          <div className="min-h-[280px]">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <BankOutlined className="text-blue-600 text-lg" />
              </div>
              <h3 className="text-base font-semibold text-gray-800 m-0">Firma Bilgileri</h3>
            </div>
            <Card className="shadow-sm border-gray-200">
              <Form.Item
                label={<span className="text-gray-700 font-medium">Firma Adı</span>}
                name="companyName"
                rules={[{ required: true, message: 'Firma adı gerekli' }]}
              >
                <Input
                  prefix={<BankOutlined className="text-gray-400" />}
                  placeholder="Firma adı"
                  className="rounded-lg"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label={<span className="text-gray-700 font-medium">İletişim Kişisi</span>}
                name="contactPerson"
              >
                <Input
                  prefix={<UserOutlined className="text-gray-400" />}
                  placeholder="Ad Soyad"
                  className="rounded-lg"
                  size="large"
                />
              </Form.Item>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                <div className="text-sm text-green-700">
                  💡 Bu bilgiler lead kaydından otomatik doldurulmuştur. Gerekirse düzenleyebilirsiniz.
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Step 1: İletişim */}
        {currentStep === 1 && (
          <div className="min-h-[280px]">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-green-50 rounded-lg">
                <MailOutlined className="text-green-600 text-lg" />
              </div>
              <h3 className="text-base font-semibold text-gray-800 m-0">İletişim Bilgileri</h3>
            </div>
            <Card className="shadow-sm border-gray-200">
              <Form.Item
                label={<span className="text-gray-700 font-medium">E-posta</span>}
                name="email"
                rules={[
                  { required: true, message: 'E-posta gerekli' },
                  { type: 'email', message: 'Geçerli bir e-posta girin' },
                ]}
              >
                <Input
                  prefix={<MailOutlined className="text-gray-400" />}
                  placeholder="ornek@firma.com"
                  className="rounded-lg"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label={<span className="text-gray-700 font-medium">Telefon</span>}
                name="phone"
              >
                <Input
                  prefix={<PhoneOutlined className="text-gray-400" />}
                  placeholder="+90 (555) 123-4567"
                  className="rounded-lg"
                  size="large"
                />
              </Form.Item>
            </Card>
          </div>
        )}

        {/* Step 2: Adres & Tamamla */}
        {currentStep === 2 && (
          <div className="min-h-[280px]">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-purple-50 rounded-lg">
                <EnvironmentOutlined className="text-purple-600 text-lg" />
              </div>
              <h3 className="text-base font-semibold text-gray-800 m-0">Adres</h3>
            </div>
            <Card className="shadow-sm border-gray-200">
              <Form.Item
                label={<span className="text-gray-700 font-medium">Adres</span>}
                name="address"
              >
                <TextArea
                  rows={5}
                  placeholder="Şirket adresi..."
                  className="rounded-lg"
                  size="large"
                />
              </Form.Item>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <div className="flex items-start gap-3">
                  <SwapOutlined className="text-blue-600 text-xl mt-1" />
                  <div>
                    <div className="font-semibold text-blue-900 mb-1">Dönüştürmeye Hazır</div>
                    <div className="text-sm text-blue-700">
                      Lead başarıyla müşteri olarak sisteme eklenecek. Bilgileri kontrol edin ve "Dönüştür" butonuna tıklayın.
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </Form>
    </Drawer>
  );
}
