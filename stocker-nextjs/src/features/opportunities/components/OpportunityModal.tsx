'use client';

import React, { useState } from 'react';
import { Drawer, Form, Input, InputNumber, Select, DatePicker, Row, Col, Card, Steps, Button } from 'antd';
import {
  DollarOutlined,
  FileTextOutlined,
  PercentageOutlined,
  CalendarOutlined,
  FlagOutlined,
  CheckCircleOutlined,
  UserOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import type { OpportunityDto, OpportunityStatus } from '@/lib/api/services/crm.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface OpportunityModalProps {
  open: boolean;
  opportunity: OpportunityDto | null;
  loading: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
}

export function OpportunityModal({
  open,
  opportunity,
  loading,
  onCancel,
  onSubmit,
}: OpportunityModalProps) {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const isEditMode = !!opportunity;

  React.useEffect(() => {
    if (open && opportunity) {
      form.setFieldsValue({
        ...opportunity,
        expectedCloseDate: opportunity.expectedCloseDate ? dayjs(opportunity.expectedCloseDate) : null,
      });
      setCurrentStep(0);
    } else if (open) {
      form.resetFields();
      setCurrentStep(0);
    }
  }, [open, opportunity, form]);

  const steps = [
    {
      title: 'Temel Bilgiler',
      icon: <FileTextOutlined />,
    },
    {
      title: 'Finansal Bilgiler',
      icon: <DollarOutlined />,
    },
    {
      title: 'Müşteri & Tarih',
      icon: <UserOutlined />,
    },
    {
      title: 'Tamamla',
      icon: <CheckCircleOutlined />,
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
        return ['name'];
      case 1:
        return ['amount', 'probability'];
      case 2:
        return ['customerId', 'expectedCloseDate', 'status'];
      default:
        return [];
    }
  };

  return (
    <Drawer
      title={
        <div className="flex items-center gap-3">
          <div className="text-lg font-semibold text-gray-800">
            {isEditMode ? 'Fırsatı Düzenle' : 'Yeni Fırsat'}
          </div>
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
              {isEditMode ? 'Güncelle' : 'Oluştur'}
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
        {/* Step 0: Temel Bilgiler */}
        {currentStep === 0 && (
          <div className="min-h-[300px]">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FileTextOutlined className="text-blue-600 text-lg" />
              </div>
              <h3 className="text-base font-semibold text-gray-800 m-0">Temel Bilgiler</h3>
            </div>
            <Card className="shadow-sm border-gray-200">
              <Form.Item
                label={<span className="text-gray-700 font-medium">Fırsat Adı</span>}
                name="name"
                rules={[{ required: true, message: 'Fırsat adı gerekli' }]}
              >
                <Input
                  prefix={<FileTextOutlined className="text-gray-400" />}
                  placeholder="Örn: Kurumsal CRM Sistemi Fırsatı"
                  className="rounded-lg"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label={<span className="text-gray-700 font-medium">Açıklama</span>}
                name="description"
              >
                <TextArea
                  rows={5}
                  placeholder="Fırsat hakkında detaylar..."
                  className="rounded-lg"
                  size="large"
                />
              </Form.Item>
            </Card>
          </div>
        )}

        {/* Step 1: Finansal Bilgiler */}
        {currentStep === 1 && (
          <div className="min-h-[300px]">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-green-50 rounded-lg">
                <DollarOutlined className="text-green-600 text-lg" />
              </div>
              <h3 className="text-base font-semibold text-gray-800 m-0">Finansal Bilgiler</h3>
            </div>
            <Card className="shadow-sm border-gray-200">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={<span className="text-gray-700 font-medium">Tutar (₺)</span>}
                    name="amount"
                    rules={[{ required: true, message: 'Tutar gerekli' }]}
                  >
                    <InputNumber
                      min={0}
                      style={{ width: '100%' }}
                      className="rounded-lg"
                      prefix="₺"
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value!.replace(/₺\s?|(,*)/g, '')}
                      placeholder="0.00"
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={<span className="text-gray-700 font-medium">Olasılık (%)</span>}
                    name="probability"
                    rules={[{ required: true, message: 'Olasılık gerekli' }]}
                    initialValue={50}
                  >
                    <InputNumber
                      min={0}
                      max={100}
                      style={{ width: '100%' }}
                      className="rounded-lg"
                      prefix={<PercentageOutlined className="text-gray-400" />}
                      placeholder="50"
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <div className="text-sm text-blue-700">
                  <div className="font-medium mb-1">💡 Beklenen Gelir Hesaplama</div>
                  <div>Beklenen Gelir = Tutar × Olasılık</div>
                  <div className="text-xs mt-1 text-blue-600">Örnek: ₺100,000 × %50 = ₺50,000</div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Step 2: Müşteri & Tarih */}
        {currentStep === 2 && (
          <div className="min-h-[300px]">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-purple-50 rounded-lg">
                <UserOutlined className="text-purple-600 text-lg" />
              </div>
              <h3 className="text-base font-semibold text-gray-800 m-0">Müşteri ve Tarih</h3>
            </div>
            <Card className="shadow-sm border-gray-200">
              <Form.Item
                label={<span className="text-gray-700 font-medium">Müşteri ID</span>}
                name="customerId"
                rules={[{ required: true, message: 'Müşteri seçimi zorunludur' }]}
              >
                <Input
                  prefix={<UserOutlined className="text-gray-400" />}
                  className="rounded-lg"
                  placeholder="Müşteri ID girin"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label={<span className="text-gray-700 font-medium">Tahmini Kapanış Tarihi</span>}
                name="expectedCloseDate"
                rules={[{ required: true, message: 'Tahmini kapanış tarihi zorunludur' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  className="rounded-lg"
                  placeholder="Tarih seçiniz"
                  size="large"
                  disabledDate={(current) => {
                    return current && current < dayjs().startOf('day');
                  }}
                />
              </Form.Item>

              <Form.Item
                label={<span className="text-gray-700 font-medium">Durum</span>}
                name="status"
                rules={[{ required: true, message: 'Durum gerekli' }]}
                initialValue="Prospecting"
              >
                <Select placeholder="Durum seçiniz" className="rounded-lg" size="large">
                  <Select.Option value="Prospecting">Araştırma</Select.Option>
                  <Select.Option value="Qualification">Nitelendirme</Select.Option>
                  <Select.Option value="NeedsAnalysis">İhtiyaç Analizi</Select.Option>
                  <Select.Option value="Proposal">Teklif</Select.Option>
                  <Select.Option value="Negotiation">Müzakere</Select.Option>
                  <Select.Option value="ClosedWon">Kazanıldı</Select.Option>
                  <Select.Option value="ClosedLost">Kaybedildi</Select.Option>
                </Select>
              </Form.Item>
            </Card>
          </div>
        )}

        {/* Step 3: Tamamla */}
        {currentStep === 3 && (
          <div className="min-h-[300px]">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-orange-50 rounded-lg">
                <FlagOutlined className="text-orange-600 text-lg" />
              </div>
              <h3 className="text-base font-semibold text-gray-800 m-0">Satış Süreci (Opsiyonel)</h3>
            </div>
            <Card className="shadow-sm border-gray-200">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={<span className="text-gray-700 font-medium">Pipeline ID</span>}
                    name="pipelineId"
                  >
                    <Input
                      className="rounded-lg"
                      placeholder="Pipeline ID (opsiyonel)"
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={<span className="text-gray-700 font-medium">Stage ID</span>}
                    name="stageId"
                  >
                    <Input
                      className="rounded-lg"
                      placeholder="Stage ID (opsiyonel)"
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-600">
                  <div className="font-medium mb-2">💡 Satış Süreci Bilgisi</div>
                  <div>Pipeline ve Stage bilgileri opsiyoneldir. Fırsatları belirli satış süreçlerine bağlamak için kullanılır.</div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <div className="flex items-start gap-3">
                  <CheckOutlined className="text-blue-600 text-xl mt-1" />
                  <div>
                    <div className="font-semibold text-blue-900 mb-1">Tamamlamaya Hazır</div>
                    <div className="text-sm text-blue-700">
                      Fırsat bilgilerini gözden geçirin ve kaydetmek için "{isEditMode ? 'Güncelle' : 'Oluştur'}" butonuna tıklayın.
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
