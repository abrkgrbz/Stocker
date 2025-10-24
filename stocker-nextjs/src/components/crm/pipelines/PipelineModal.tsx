'use client';

import { useState } from 'react';
import { Modal, Steps, Form, Input, Select, Button, Space, ColorPicker, InputNumber, Switch, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Pipeline, PipelineStage } from '@/lib/api/services/crm.service';

interface PipelineModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  initialData?: Pipeline | null;
  loading?: boolean;
}

export function PipelineModal({ open, onCancel, onSubmit, initialData, loading = false }: PipelineModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();

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
    try {
      const values = await form.validateFields();

      // Ensure stages have proper order
      if (values.stages) {
        values.stages = values.stages.map((stage: any, index: number) => ({
          ...stage,
          order: index + 1,
        }));
      }

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

  const steps = [
    {
      title: 'Temel Bilgiler',
      content: (
        <div className="space-y-4">
          <Form.Item
            name="name"
            label="Pipeline Adı"
            rules={[{ required: true, message: 'Pipeline adı zorunludur' }]}
          >
            <Input placeholder="Örn: Satış Süreci" size="large" />
          </Form.Item>

          <Form.Item name="description" label="Açıklama">
            <Input.TextArea rows={3} placeholder="Pipeline hakkında detaylı açıklama" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Pipeline Tipi"
            rules={[{ required: true, message: 'Pipeline tipi zorunludur' }]}
          >
            <Select size="large" placeholder="Pipeline tipini seçin">
              <Select.Option value="Sales">Satış</Select.Option>
              <Select.Option value="Lead">Potansiyel Müşteri</Select.Option>
              <Select.Option value="Deal">Fırsat</Select.Option>
              <Select.Option value="Custom">Özel</Select.Option>
            </Select>
          </Form.Item>
        </div>
      ),
    },
    {
      title: 'Aşamalar',
      content: (
        <div>
          <Form.List name="stages" initialValue={[{ name: '', probability: 0, color: '#1890ff' }]}>
            {(fields, { add, remove }) => (
              <>
                <div className="mb-4 flex justify-between items-center">
                  <h4 className="text-sm font-medium text-gray-700">Pipeline Aşamaları</h4>
                  <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                    Aşama Ekle
                  </Button>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {fields.map((field, index) => (
                    <div key={field.key} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-sm font-medium text-gray-600">Aşama {index + 1}</span>
                        {fields.length > 1 && (
                          <Button
                            type="text"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => remove(field.name)}
                          />
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <Form.Item
                          {...field}
                          name={[field.name, 'name']}
                          rules={[{ required: true, message: 'Aşama adı zorunludur' }]}
                          className="mb-2"
                        >
                          <Input placeholder="Aşama adı" />
                        </Form.Item>

                        <Form.Item
                          {...field}
                          name={[field.name, 'probability']}
                          rules={[{ required: true, message: 'Olasılık zorunludur' }]}
                          className="mb-2"
                        >
                          <InputNumber
                            placeholder="Başarı olasılığı (%)"
                            min={0}
                            max={100}
                            className="w-full"
                          />
                        </Form.Item>

                        <Form.Item {...field} name={[field.name, 'color']} className="mb-2">
                          <ColorPicker showText format="hex" />
                        </Form.Item>

                        <Form.Item {...field} name={[field.name, 'description']} className="mb-0">
                          <Input placeholder="Açıklama (opsiyonel)" />
                        </Form.Item>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-2">
                        <Form.Item
                          {...field}
                          name={[field.name, 'isWon']}
                          valuePropName="checked"
                          className="mb-0"
                        >
                          <div className="flex items-center gap-2">
                            <Switch size="small" />
                            <span className="text-sm text-gray-600">Kazanıldı olarak işaretle</span>
                          </div>
                        </Form.Item>

                        <Form.Item
                          {...field}
                          name={[field.name, 'isLost']}
                          valuePropName="checked"
                          className="mb-0"
                        >
                          <div className="flex items-center gap-2">
                            <Switch size="small" />
                            <span className="text-sm text-gray-600">Kaybedildi olarak işaretle</span>
                          </div>
                        </Form.Item>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Form.List>
        </div>
      ),
    },
    {
      title: 'Ayarlar',
      content: (
        <div className="space-y-4">
          <Form.Item name="isActive" valuePropName="checked" initialValue={true}>
            <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
              <Switch defaultChecked />
              <div>
                <div className="font-medium">Pipeline Aktif</div>
                <div className="text-sm text-gray-500">Bu pipeline'ı hemen kullanıma açın</div>
              </div>
            </div>
          </Form.Item>

          <Form.Item name="isDefault" valuePropName="checked" initialValue={false}>
            <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
              <Switch />
              <div>
                <div className="font-medium">Varsayılan Pipeline</div>
                <div className="text-sm text-gray-500">
                  Yeni oluşturulan kayıtlar için bu pipeline'ı varsayılan olarak kullan
                </div>
              </div>
            </div>
          </Form.Item>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Özet</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <div>
                <strong>Pipeline Adı:</strong>{' '}
                {Form.useWatch('name', form) || <span className="text-gray-400">Belirtilmedi</span>}
              </div>
              <div>
                <strong>Tip:</strong>{' '}
                {Form.useWatch('type', form) || <span className="text-gray-400">Belirtilmedi</span>}
              </div>
              <div>
                <strong>Aşama Sayısı:</strong>{' '}
                {Form.useWatch('stages', form)?.length || 0} aşama
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <Modal
      title={initialData ? 'Pipeline Düzenle' : 'Yeni Pipeline Oluştur'}
      open={open}
      onCancel={handleCancel}
      width={800}
      footer={null}
    >
      <Steps current={currentStep} items={steps} className="mb-6" />

      <Form form={form} layout="vertical" initialValues={initialData || {}}>
        <div className="min-h-[400px]">{steps[currentStep].content}</div>

        <div className="flex justify-between mt-6 pt-4 border-t">
          <Button onClick={handleCancel}>İptal</Button>

          <Space>
            {currentStep > 0 && (
              <Button onClick={handlePrev}>Geri</Button>
            )}
            {currentStep < steps.length - 1 && (
              <Button type="primary" onClick={handleNext}>
                İleri
              </Button>
            )}
            {currentStep === steps.length - 1 && (
              <Button type="primary" onClick={handleFinish} loading={loading}>
                {initialData ? 'Güncelle' : 'Oluştur'}
              </Button>
            )}
          </Space>
        </div>
      </Form>
    </Modal>
  );
}
