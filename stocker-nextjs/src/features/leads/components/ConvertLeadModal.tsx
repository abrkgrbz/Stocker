'use client';

import React, { useState } from 'react';
import { Modal, Form, Input, Steps } from 'antd';
import {
  BuildingLibraryIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ArrowsRightLeftIcon,
  UserPlusIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

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
      title: 'Firma',
      icon: <BuildingLibraryIcon className="w-4 h-4" />,
    },
    {
      title: 'İletişim',
      icon: <EnvelopeIcon className="w-4 h-4" />,
    },
    {
      title: 'Adres',
      icon: <MapPinIcon className="w-4 h-4" />,
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
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={null}
      closable={false}
      centered
      width={560}
      destroyOnClose
      styles={{
        content: {
          padding: 0,
          borderRadius: '16px',
          overflow: 'hidden',
        },
        mask: {
          backdropFilter: 'blur(4px)',
          background: 'rgba(15, 23, 42, 0.4)',
        },
      }}
    >
      {/* Modal Header */}
      <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
            <UserPlusIcon className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 m-0">
              Müşteriye Dönüştür
            </h3>
            <p className="text-sm text-slate-500 m-0 mt-0.5">
              Lead bilgilerini düzenleyip müşteri oluşturun
            </p>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="px-6 pt-5 pb-2">
        <Steps
          current={currentStep}
          items={steps}
          size="small"
          className="convert-steps"
        />
      </div>

      {/* Modal Body */}
      <div className="px-6 py-4">
        <Form form={form} layout="vertical" className="space-y-4">
          {/* Step 0: Firma Bilgileri */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-blue-50 rounded-lg">
                  <BuildingLibraryIcon className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-slate-700">Firma Bilgileri</span>
              </div>

              <Form.Item
                name="companyName"
                rules={[{ required: true, message: 'Firma adı gerekli' }]}
                className="mb-3"
              >
                <Input
                  prefix={<BuildingLibraryIcon className="w-4 h-4 text-slate-400" />}
                  placeholder="Firma adı"
                  className="h-10 rounded-lg"
                />
              </Form.Item>

              <Form.Item name="contactPerson" className="mb-0">
                <Input
                  prefix={<UserIcon className="w-4 h-4 text-slate-400" />}
                  placeholder="İletişim kişisi"
                  className="h-10 rounded-lg"
                />
              </Form.Item>

              <div className="flex items-start gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-100 mt-4">
                <CheckCircleIcon className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-emerald-700 m-0">
                  Bu bilgiler lead kaydından otomatik dolduruldu
                </p>
              </div>
            </div>
          )}

          {/* Step 1: İletişim */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-green-50 rounded-lg">
                  <EnvelopeIcon className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm font-medium text-slate-700">İletişim Bilgileri</span>
              </div>

              <Form.Item
                name="email"
                rules={[
                  { required: true, message: 'E-posta gerekli' },
                  { type: 'email', message: 'Geçerli bir e-posta girin' },
                ]}
                className="mb-3"
              >
                <Input
                  prefix={<EnvelopeIcon className="w-4 h-4 text-slate-400" />}
                  placeholder="ornek@firma.com"
                  className="h-10 rounded-lg"
                />
              </Form.Item>

              <Form.Item name="phone" className="mb-0">
                <Input
                  prefix={<PhoneIcon className="w-4 h-4 text-slate-400" />}
                  placeholder="+90 (555) 123-4567"
                  className="h-10 rounded-lg"
                />
              </Form.Item>
            </div>
          )}

          {/* Step 2: Adres & Tamamla */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-purple-50 rounded-lg">
                  <MapPinIcon className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-slate-700">Adres Bilgileri</span>
              </div>

              <Form.Item name="address" className="mb-0">
                <TextArea
                  rows={3}
                  placeholder="Şirket adresi..."
                  className="rounded-lg"
                />
              </Form.Item>

              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100 mt-4">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ArrowsRightLeftIcon className="w-3 h-3 text-blue-600" />
                </div>
                <div className="text-sm text-blue-700">
                  <p className="font-medium m-0">Dönüştürmeye Hazır</p>
                  <p className="text-blue-600 m-0 mt-1">
                    Lead başarıyla müşteri olarak sisteme eklenecek
                  </p>
                </div>
              </div>
            </div>
          )}
        </Form>
      </div>

      {/* Modal Footer */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <div className="text-xs text-slate-400">
          Adım {currentStep + 1} / {steps.length}
        </div>
        <div className="flex items-center gap-3">
          {currentStep > 0 && (
            <button
              onClick={handlePrev}
              className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Geri
            </button>
          )}
          {currentStep === 0 && (
            <button
              onClick={handleCancel}
              className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              İptal
            </button>
          )}
          {currentStep < steps.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-5 py-2.5 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
            >
              İleri
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Dönüştürülüyor...
                </>
              ) : (
                <>
                  <UserPlusIcon className="w-4 h-4" />
                  Müşteriye Dönüştür
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
