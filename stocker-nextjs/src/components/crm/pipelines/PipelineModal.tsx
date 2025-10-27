'use client';

import { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, Space, InputNumber, Switch, Divider, Card, Tag, message } from 'antd';
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
  { value: '#1890ff', label: 'Mavi' },
  { value: '#52c41a', label: 'Yeşil' },
  { value: '#faad14', label: 'Turuncu' },
  { value: '#f5222d', label: 'Kırmızı' },
  { value: '#722ed1', label: 'Mor' },
  { value: '#13c2c2', label: 'Cyan' },
];

const DEFAULT_STAGES = [
  { name: 'Yeni Fırsat', probability: 10, color: '#1890ff', isWon: false, isLost: false },
  { name: 'Teklif Hazırlama', probability: 30, color: '#52c41a', isWon: false, isLost: false },
  { name: 'Müzakere', probability: 60, color: '#faad14', isWon: false, isLost: false },
  { name: 'Kazanıldı', probability: 100, color: '#52c41a', isWon: true, isLost: false },
  { name: 'Kaybedildi', probability: 0, color: '#f5222d', isWon: false, isLost: true },
];

export function PipelineModal({ open, onCancel, onSubmit, initialData, loading = false }: PipelineModalProps) {
  const [form] = Form.useForm();
  const [useDefaultStages, setUseDefaultStages] = useState(true);

  useEffect(() => {
    if (open && !initialData) {
      // Reset form with default values when opening for new pipeline
      form.setFieldsValue({
        name: '',
        description: '',
        type: 'Deal',
        isActive: true,
        isDefault: true,
        stages: DEFAULT_STAGES,
      });
      setUseDefaultStages(true);
    } else if (open && initialData) {
      form.setFieldsValue(initialData);
      setUseDefaultStages(false);
    }
  }, [open, initialData, form]);

  const handleFinish = async (values: any) => {
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
  };

  const handleCancel = () => {
    form.resetFields();
    setUseDefaultStages(true);
    onCancel();
  };

  const handleUseDefaultStages = () => {
    form.setFieldsValue({ stages: DEFAULT_STAGES });
    setUseDefaultStages(true);
    message.success('Varsayılan aşamalar yüklendi');
  };

  return (
    <Modal
      title={
        <div className="text-lg font-semibold">
          {initialData ? '✏️ Pipeline Düzenle' : '➕ Yeni Pipeline Oluştur'}
        </div>
      }
      open={open}
      onCancel={handleCancel}
      width={800}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        className="mt-4"
      >
        {/* Basic Info */}
        <Card size="small" title="📋 Temel Bilgiler" className="mb-4">
          <Form.Item
            name="name"
            label="Pipeline Adı"
            rules={[{ required: true, message: 'Pipeline adı zorunludur' }]}
          >
            <Input placeholder="Örn: Satış Süreci" size="large" />
          </Form.Item>

          <Form.Item name="description" label="Açıklama (Opsiyonel)">
            <Input.TextArea rows={2} placeholder="Pipeline hakkında kısa açıklama" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="type"
              label="Pipeline Tipi"
              rules={[{ required: true, message: 'Tip zorunludur' }]}
            >
              <Select size="large">
                <Select.Option value="Sales">💼 Satış</Select.Option>
                <Select.Option value="Lead">🎯 Potansiyel Müşteri</Select.Option>
                <Select.Option value="Deal">🤝 Fırsat</Select.Option>
                <Select.Option value="Custom">⚙️ Özel</Select.Option>
              </Select>
            </Form.Item>

            <div className="space-y-2">
              <Form.Item name="isActive" valuePropName="checked" className="mb-2">
                <div className="flex items-center gap-2 p-2 border rounded">
                  <Switch defaultChecked />
                  <span className="text-sm">✅ Pipeline Aktif</span>
                </div>
              </Form.Item>

              <Form.Item name="isDefault" valuePropName="checked" className="mb-0">
                <div className="flex items-center gap-2 p-2 border rounded bg-blue-50">
                  <Switch />
                  <span className="text-sm">⭐ Varsayılan Pipeline</span>
                </div>
              </Form.Item>
            </div>
          </div>
        </Card>

        {/* Stages */}
        <Card
          size="small"
          title="🎯 Satış Aşamaları"
          className="mb-4"
          extra={
            !useDefaultStages && (
              <Button size="small" type="link" onClick={handleUseDefaultStages}>
                Varsayılan Aşamaları Kullan
              </Button>
            )
          }
        >
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
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {fields.map((field, index) => (
                    <div key={field.key} className="p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3 mb-2">
                        <Tag color="blue">#{index + 1}</Tag>
                        <Form.Item
                          {...field}
                          name={[field.name, 'name']}
                          rules={[{ required: true, message: 'Ad gerekli' }]}
                          className="mb-0 flex-1"
                        >
                          <Input placeholder="Aşama adı" />
                        </Form.Item>
                        {fields.length > 1 && (
                          <Button
                            type="text"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => {
                              remove(field.name);
                              setUseDefaultStages(false);
                            }}
                          />
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <Form.Item
                          {...field}
                          name={[field.name, 'probability']}
                          rules={[{ required: true, message: 'Gerekli' }]}
                          className="mb-0"
                        >
                          <InputNumber
                            placeholder="Olasılık %"
                            min={0}
                            max={100}
                            suffix="%"
                            className="w-full"
                          />
                        </Form.Item>

                        <Form.Item
                          {...field}
                          name={[field.name, 'color']}
                          initialValue="#1890ff"
                          className="mb-0"
                        >
                          <Select placeholder="Renk">
                            {STAGE_COLORS.map((c) => (
                              <Select.Option key={c.value} value={c.value}>
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-4 h-4 rounded"
                                    style={{ backgroundColor: c.value }}
                                  />
                                  {c.label}
                                </div>
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>

                        <div className="flex gap-1">
                          <Form.Item
                            {...field}
                            name={[field.name, 'isWon']}
                            valuePropName="checked"
                            className="mb-0"
                          >
                            <Button
                              size="small"
                              icon={<CheckCircleOutlined />}
                              className="flex-1"
                              type={form.getFieldValue(['stages', field.name, 'isWon']) ? 'primary' : 'default'}
                            >
                              Kazandı
                            </Button>
                          </Form.Item>

                          <Form.Item
                            {...field}
                            name={[field.name, 'isLost']}
                            valuePropName="checked"
                            className="mb-0"
                          >
                            <Button
                              size="small"
                              icon={<CloseCircleOutlined />}
                              className="flex-1"
                              danger={form.getFieldValue(['stages', field.name, 'isLost'])}
                            >
                              Kaybetti
                            </Button>
                          </Form.Item>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  type="dashed"
                  onClick={() => {
                    add({ name: '', probability: 50, color: '#1890ff', isWon: false, isLost: false });
                    setUseDefaultStages(false);
                  }}
                  block
                  icon={<PlusOutlined />}
                  className="mt-3"
                >
                  Yeni Aşama Ekle
                </Button>
              </>
            )}
          </Form.List>
        </Card>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button onClick={handleCancel} size="large">
            İptal
          </Button>
          <Button type="primary" htmlType="submit" loading={loading} size="large">
            {initialData ? '💾 Güncelle' : '✨ Oluştur'}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
