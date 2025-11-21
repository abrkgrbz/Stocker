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
  DeleteOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import type { Deal, Pipeline } from '@/lib/api/services/crm.service';
import { useCustomers } from '@/hooks/useCRM';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface DealModalProps {
  open: boolean;
  deal: Deal | null;
  loading: boolean;
  pipelines: Pipeline[];
  onCancel: () => void;
  onSubmit: (values: any) => void;
  onDelete?: (id: string, deal: Deal) => void;
}

export function DealModal({
  open,
  deal,
  loading,
  pipelines,
  onCancel,
  onSubmit,
  onDelete,
}: DealModalProps) {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPipeline, setSelectedPipeline] = useState<string | null>(null);
  const isEditMode = !!deal;

  // Fetch customers for dropdown
  const { data: customersData, isLoading: customersLoading } = useCustomers();
  const customers = customersData?.items || [];

  // Get stages from selected pipeline
  const stages = selectedPipeline
    ? pipelines.find((p) => p.id === selectedPipeline)?.stages || []
    : [];

  React.useEffect(() => {
    if (open && deal) {
      form.setFieldsValue({
        ...deal,
        expectedCloseDate: deal.expectedCloseDate ? dayjs(deal.expectedCloseDate) : null,
      });
      setSelectedPipeline(deal.pipelineId || null);
      setCurrentStep(0);
    } else if (open) {
      form.resetFields();
      setSelectedPipeline(null);
      setCurrentStep(0);
    }
  }, [open, deal, form]);

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
      title: 'Aşama & Durum',
      icon: <FlagOutlined />,
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
      // Get all form values first
      const values = form.getFieldsValue();

      console.log('🔍 All form values:', values);
      console.log('📋 Form fields:', Object.keys(values));

      // Manual validation for required fields that might not be visible
      const errors = [];

      if (!values.title) errors.push('Başlık gerekli');
      if (!values.amount) errors.push('Tutar gerekli');
      if (!values.probability && values.probability !== 0) errors.push('Olasılık gerekli');
      if (!values.stageId) errors.push('Aşama gerekli');
      if (!values.status) errors.push('Durum gerekli');
      if (!values.expectedCloseDate) errors.push('Tahmini kapanış tarihi zorunlu');
      if (!values.customerId) errors.push('Müşteri seçimi zorunlu');

      if (errors.length > 0) {
        console.error('❌ Validation errors:', errors);
        console.error('❌ Missing values:', {
          title: values.title,
          amount: values.amount,
          probability: values.probability,
          stageId: values.stageId,
          status: values.status,
          expectedCloseDate: values.expectedCloseDate,
          customerId: values.customerId,
        });
        // Find which step has the first error and go there
        if (!values.title) setCurrentStep(0);
        else if (!values.amount || (!values.probability && values.probability !== 0)) setCurrentStep(1);
        else if (!values.stageId || !values.status || !values.expectedCloseDate) setCurrentStep(2);
        else if (!values.customerId) setCurrentStep(3);
        return;
      }

      // Validate visible fields
      await form.validateFields();
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

  const handleDelete = () => {
    if (deal && onDelete) {
      onDelete(deal.id, deal);
      setCurrentStep(0);
    }
  };

  const getStepFields = (step: number): string[] => {
    switch (step) {
      case 0:
        return ['title'];
      case 1:
        return ['amount', 'probability'];
      case 2:
        return ['stageId', 'status', 'expectedCloseDate'];
      case 3:
        return ['customerId'];
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

      <Form form={form} layout="vertical" preserve={true}>
        {/* Step 0: Temel Bilgiler */}
        <div style={{ display: currentStep === 0 ? 'block' : 'none' }}>
          <div className="min-h-[300px]">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FileTextOutlined className="text-blue-600 text-lg" />
              </div>
              <h3 className="text-base font-semibold text-gray-800 m-0">Temel Bilgiler</h3>
            </div>
            <Card className="shadow-sm border-gray-200">
              <Form.Item
                label={<span className="text-gray-700 font-medium">Başlık</span>}
                name="title"
                rules={[{ required: true, message: 'Başlık gerekli' }]}
              >
                <Input
                  prefix={<FileTextOutlined className="text-gray-400" />}
                  placeholder="Örn: Yıllık Yazılım Lisansı Anlaşması"
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
        </div>

        {/* Step 1: Finansal Bilgiler */}
        <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
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
                      parser={(value) => value!.replace(/₺\s?|(,*)/g, '') as any}
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
        </div>

        {/* Step 2: Aşama & Durum */}
        <div style={{ display: currentStep === 2 ? 'block' : 'none' }}>
          <div className="min-h-[300px]">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-purple-50 rounded-lg">
                <FlagOutlined className="text-purple-600 text-lg" />
              </div>
              <h3 className="text-base font-semibold text-gray-800 m-0">Aşama ve Durum</h3>
            </div>
            <Card className="shadow-sm border-gray-200">
              <Form.Item
                label={<span className="text-gray-700 font-medium">💼 Satış Süreci (Pipeline)</span>}
                name="pipelineId"
                rules={[{ required: true, message: 'Pipeline seçimi zorunludur' }]}
              >
                <Select
                  placeholder="Satış sürecini seçiniz"
                  className="rounded-lg"
                  size="large"
                  onChange={(value) => {
                    setSelectedPipeline(value);
                    form.setFieldsValue({ stageId: undefined }); // Reset stage when pipeline changes
                  }}
                >
                  {pipelines.map((pipeline) => (
                    <Select.Option key={pipeline.id} value={pipeline.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{pipeline.name}</span>
                        <span className="text-gray-500 text-xs">({pipeline.stages?.length || 0} aşama)</span>
                      </div>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={<span className="text-gray-700 font-medium">Aşama</span>}
                    name="stageId"
                    rules={[{ required: true, message: 'Aşama gerekli' }]}
                  >
                    <Select
                      placeholder={selectedPipeline ? "Aşama seçiniz" : "Önce pipeline seçiniz"}
                      className="rounded-lg"
                      size="large"
                      disabled={!selectedPipeline}
                    >
                      {stages.map((stage) => (
                        <Select.Option key={stage.id} value={stage.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: stage.color }}
                            />
                            <span>{stage.name}</span>
                          </div>
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={<span className="text-gray-700 font-medium">Durum</span>}
                    name="status"
                    rules={[{ required: true, message: 'Durum gerekli' }]}
                    initialValue="Open"
                  >
                    <Select placeholder="Durum seçiniz" className="rounded-lg" size="large">
                      <Select.Option value="Open">Açık</Select.Option>
                      <Select.Option value="Won">Kazanıldı</Select.Option>
                      <Select.Option value="Lost">Kaybedildi</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

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
            </Card>
          </div>
        </div>

        {/* Step 3: Tamamla */}
        <div style={{ display: currentStep === 3 ? 'block' : 'none' }}>
          <div className="min-h-[300px]">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-orange-50 rounded-lg">
                <UserOutlined className="text-orange-600 text-lg" />
              </div>
              <h3 className="text-base font-semibold text-gray-800 m-0">Müşteri Bilgisi</h3>
            </div>
            <Card className="shadow-sm border-gray-200">
              <Form.Item
                label={<span className="text-gray-700 font-medium">Müşteri</span>}
                name="customerId"
                rules={[{ required: true, message: 'Müşteri seçimi zorunludur' }]}
              >
                <Select
                  className="rounded-lg"
                  placeholder="Müşteri seçiniz"
                  size="large"
                  showSearch
                  loading={customersLoading}
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.label?.toString() ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={customers.map((customer) => ({
                    label: customer.customerName,
                    value: customer.id,
                  }))}
                />
              </Form.Item>

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

              {isEditMode && onDelete && (
                <div className="mt-4">
                  <Button
                    danger
                    block
                    size="large"
                    icon={<DeleteOutlined />}
                    onClick={handleDelete}
                  >
                    Fırsatı Sil
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </Form>
    </Drawer>
  );
}
