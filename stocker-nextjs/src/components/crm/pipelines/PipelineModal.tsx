'use client';

import { useState, useEffect } from 'react';
import { Drawer, Steps, Form, Input, Select, Button, Space, InputNumber, Switch, message, Card, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import type { Pipeline } from '@/lib/api/services/crm.service';

interface PipelineModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  initialData?: Pipeline | null;
  loading?: boolean;
}

const STAGE_COLORS = [
  { value: '#1890ff', label: 'Mavi', color: '#1890ff' },
  { value: '#52c41a', label: 'Yeşil', color: '#52c41a' },
  { value: '#faad14', label: 'Turuncu', color: '#faad14' },
  { value: '#f5222d', label: 'Kırmızı', color: '#f5222d' },
  { value: '#722ed1', label: 'Mor', color: '#722ed1' },
  { value: '#13c2c2', label: 'Cyan', color: '#13c2c2' },
];

const DEFAULT_STAGES = [
  { name: 'Yeni Fırsat', probability: 10, color: '#1890ff', isWon: false, isLost: false },
  { name: 'Teklif Hazırlama', probability: 30, color: '#52c41a', isWon: false, isLost: false },
  { name: 'Müzakere', probability: 60, color: '#faad14', isWon: false, isLost: false },
  { name: 'Kazanıldı', probability: 100, color: '#52c41a', isWon: true, isLost: false },
];

export function PipelineModal({ open, onCancel, onSubmit, initialData, loading = false }: PipelineModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();

  useEffect(() => {
    if (open && !initialData) {
      form.setFieldsValue({
        name: '',
        description: '',
        type: 'Deal',
        isActive: true,
        isDefault: true,
        stages: DEFAULT_STAGES,
      });
    } else if (open && initialData) {
      form.setFieldsValue(initialData);
    }
  }, [open, initialData, form]);

  const handleNext = async () => {
    try {
      await form.validateFields();
      setCurrentStep(currentStep + 1);
    } catch (error) {
      message.error('Lütfen tüm zorunlu alanları doldurun');
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleFinish = async () => {
    console.log('🔵 handleFinish called - Starting validation...');

    try {
      const values = await form.validateFields();
      console.log('✅ Validation passed');
      console.log('🚀 Pipeline Modal - Form Values:', values);

      // Ensure stages have proper order
      if (values.stages) {
        values.stages = values.stages.map((stage: any, index: number) => ({
          ...stage,
          order: index + 1,
          color: stage.color || '#1890ff',
        }));
      }

      console.log('📤 Pipeline Modal - Submitting to API:', values);

      onSubmit(values);
      form.resetFields();
      setCurrentStep(0);
    } catch (error) {
      message.error('Lütfen tüm zorunlu alanları doldurun');
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setCurrentStep(0);
    onCancel();
  };

  const handleUseDefaultStages = () => {
    form.setFieldsValue({ stages: DEFAULT_STAGES });
    message.success('Varsayılan aşamalar yüklendi');
  };

  const steps = [
    {
      title: 'Temel Bilgiler',
      description: 'Pipeline detayları',
      content: (
        <div className="space-y-4">
          <Form.Item
            name="name"
            label="Pipeline Adı"
            rules={[{ required: true, message: 'Pipeline adı zorunludur' }]}
          >
            <Input placeholder="Örn: Satış Süreci" size="large" />
          </Form.Item>

          <Form.Item name="description" label="Açıklama (Opsiyonel)">
            <Input.TextArea rows={3} placeholder="Pipeline hakkında kısa açıklama" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Pipeline Tipi"
            rules={[{ required: true, message: 'Pipeline tipi zorunludur' }]}
          >
            <Select size="large" placeholder="Pipeline tipini seçin">
              <Select.Option value="Sales">💼 Satış</Select.Option>
              <Select.Option value="Lead">🎯 Potansiyel Müşteri</Select.Option>
              <Select.Option value="Deal">🤝 Fırsat</Select.Option>
              <Select.Option value="Custom">⚙️ Özel</Select.Option>
            </Select>
          </Form.Item>
        </div>
      ),
    },
    {
      title: 'Aşamalar',
      description: 'Satış adımları',
      content: (
        <div>
          <div className="mb-4 flex justify-between items-center">
            <h4 className="text-sm font-medium text-gray-700">Pipeline Aşamaları</h4>
            <Button size="small" type="link" onClick={handleUseDefaultStages}>
              Varsayılan Aşamaları Kullan
            </Button>
          </div>

          <Form.List
            name="stages"
            rules={[
              {
                validator: async (_, stages) => {
                  if (!stages || stages.length === 0) {
                    return Promise.reject(new Error('En az 1 aşama eklemelisiniz'));
                  }
                },
              },
            ]}
          >
            {(fields, { add, remove }) => (
              <>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {fields.map((field, index) => (
                    <Card
                      key={field.key}
                      size="small"
                      className="bg-gray-50"
                      title={
                        <div className="flex items-center gap-2">
                          <Tag color="blue">#{index + 1}</Tag>
                          <span className="text-sm">Aşama {index + 1}</span>
                        </div>
                      }
                      extra={
                        fields.length > 1 && (
                          <Button
                            type="text"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => remove(field.name)}
                          />
                        )
                      }
                    >
                      <div className="space-y-3">
                        <Form.Item
                          {...field}
                          name={[field.name, 'name']}
                          label="Aşama Adı"
                          rules={[{ required: true, message: 'Aşama adı zorunludur' }]}
                          className="mb-0"
                        >
                          <Input placeholder="Örn: Yeni Fırsat" />
                        </Form.Item>

                        <div className="grid grid-cols-2 gap-3">
                          <Form.Item
                            {...field}
                            name={[field.name, 'probability']}
                            label="Başarı Olasılığı (%)"
                            rules={[{ required: true, message: 'Olasılık zorunludur' }]}
                            className="mb-0"
                          >
                            <InputNumber
                              placeholder="0-100"
                              min={0}
                              max={100}
                              suffix="%"
                              className="w-full"
                            />
                          </Form.Item>

                          <Form.Item
                            {...field}
                            name={[field.name, 'color']}
                            label="Renk"
                            initialValue="#1890ff"
                            className="mb-0"
                          >
                            <Select placeholder="Renk seçin">
                              {STAGE_COLORS.map((c) => (
                                <Select.Option key={c.value} value={c.value}>
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="w-4 h-4 rounded"
                                      style={{ backgroundColor: c.color }}
                                    />
                                    {c.label}
                                  </div>
                                </Select.Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <Form.Item
                            {...field}
                            name={[field.name, 'isWon']}
                            valuePropName="checked"
                            className="mb-0"
                          >
                            <div className="flex items-center gap-2 p-2 border rounded">
                              <Switch size="small" />
                              <span className="text-sm">
                                <CheckCircleOutlined className="text-green-500 mr-1" />
                                Kazanıldı olarak işaretle
                              </span>
                            </div>
                          </Form.Item>

                          <Form.Item
                            {...field}
                            name={[field.name, 'isLost']}
                            valuePropName="checked"
                            className="mb-0"
                          >
                            <div className="flex items-center gap-2 p-2 border rounded">
                              <Switch size="small" />
                              <span className="text-sm">
                                <CloseCircleOutlined className="text-red-500 mr-1" />
                                Kaybedildi olarak işaretle
                              </span>
                            </div>
                          </Form.Item>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <Button
                  type="dashed"
                  onClick={() =>
                    add({ name: '', probability: 50, color: '#1890ff', isWon: false, isLost: false })
                  }
                  block
                  icon={<PlusOutlined />}
                  className="mt-3"
                >
                  Yeni Aşama Ekle
                </Button>
              </>
            )}
          </Form.List>
        </div>
      ),
    },
    {
      title: 'Ayarlar',
      description: 'Son adım',
      content: (
        <div className="space-y-4">
          <Form.Item name="isActive" valuePropName="checked" initialValue={true}>
            <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg bg-white">
              <Switch defaultChecked />
              <div>
                <div className="font-medium">Pipeline Aktif</div>
                <div className="text-sm text-gray-500">Bu pipeline'ı hemen kullanıma açın</div>
              </div>
            </div>
          </Form.Item>

          <Form.Item name="isDefault" valuePropName="checked" initialValue={true}>
            <div className="flex items-center gap-3 p-4 border border-blue-200 rounded-lg bg-blue-50">
              <Switch defaultChecked />
              <div>
                <div className="font-medium">⭐ Varsayılan Pipeline</div>
                <div className="text-sm text-blue-600">
                  Yeni oluşturulan kayıtlar için bu pipeline'ı varsayılan olarak kullan
                </div>
              </div>
            </div>
          </Form.Item>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">✅ Özet</h4>
            <div className="text-sm text-green-800 space-y-1">
              <div>
                <strong>Pipeline Adı:</strong>{' '}
                {Form.useWatch('name', form) || <span className="text-gray-400">Belirtilmedi</span>}
              </div>
              <div>
                <strong>Tip:</strong>{' '}
                {Form.useWatch('type', form) || <span className="text-gray-400">Belirtilmedi</span>}
              </div>
              <div>
                <strong>Aşama Sayısı:</strong> {Form.useWatch('stages', form)?.length || 0} aşama
              </div>
              <div>
                <strong>Durum:</strong>{' '}
                {Form.useWatch('isActive', form) ? (
                  <span className="text-green-600">✅ Aktif</span>
                ) : (
                  <span className="text-gray-500">❌ Pasif</span>
                )}
              </div>
              <div>
                <strong>Varsayılan:</strong>{' '}
                {Form.useWatch('isDefault', form) ? (
                  <span className="text-blue-600">⭐ Evet</span>
                ) : (
                  <span className="text-gray-500">Hayır</span>
                )}
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <Drawer
      title={initialData ? '✏️ Pipeline Düzenle' : '➕ Yeni Pipeline Oluştur'}
      open={open}
      onClose={handleCancel}
      width={720}
      placement="right"
      destroyOnClose
      styles={{
        mask: {
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
        },
      }}
      footer={
        <div className="flex justify-between">
          <Button onClick={handleCancel}>İptal</Button>
          <Space>
            {currentStep > 0 && (
              <Button onClick={handlePrev}>← Geri</Button>
            )}
            {currentStep < steps.length - 1 && (
              <Button type="primary" onClick={handleNext}>
                İleri →
              </Button>
            )}
            {currentStep === steps.length - 1 && (
              <Button type="primary" onClick={handleFinish} loading={loading}>
                {initialData ? '💾 Güncelle' : '✨ Oluştur'}
              </Button>
            )}
          </Space>
        </div>
      }
    >
      <Steps current={currentStep} items={steps} className="mb-6" />

      <Form form={form} layout="vertical" initialValues={{ isActive: true, isDefault: true }}>
        {/* Render all form content, control visibility with CSS */}
        {steps.map((step, index) => (
          <div
            key={index}
            className="min-h-[450px]"
            style={{ display: currentStep === index ? 'block' : 'none' }}
          >
            {step.content}
          </div>
        ))}
      </Form>
    </Drawer>
  );
}
