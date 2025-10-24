'use client';

import { useState } from 'react';
import { Modal, Steps, Form, Input, Select, Button, Space, ColorPicker, Switch, message, Tag } from 'antd';
import type { CustomerSegment } from '@/lib/api/services/crm.service';

interface CustomerSegmentModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  initialData?: CustomerSegment | null;
  loading?: boolean;
}

export function CustomerSegmentModal({
  open,
  onCancel,
  onSubmit,
  initialData,
  loading = false,
}: CustomerSegmentModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();

  const segmentType = Form.useWatch('type', form);

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
            label="Segment Adı"
            rules={[{ required: true, message: 'Segment adı zorunludur' }]}
          >
            <Input placeholder="Örn: VIP Müşteriler" size="large" />
          </Form.Item>

          <Form.Item name="description" label="Açıklama">
            <Input.TextArea rows={3} placeholder="Segment hakkında detaylı açıklama" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Segment Tipi"
            rules={[{ required: true, message: 'Segment tipi zorunludur' }]}
            initialValue="Static"
          >
            <Select size="large" placeholder="Segment tipini seçin">
              <Select.Option value="Static">
                <div className="flex items-center justify-between">
                  <span>Statik</span>
                  <Tag color="default">Manuel</Tag>
                </div>
              </Select.Option>
              <Select.Option value="Dynamic">
                <div className="flex items-center justify-between">
                  <span>Dinamik</span>
                  <Tag color="processing">Otomatik</Tag>
                </div>
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="color" label="Renk" initialValue="#1890ff">
            <ColorPicker showText format="hex" />
          </Form.Item>
        </div>
      ),
    },
    {
      title: 'Kriterler',
      content: (
        <div className="space-y-4">
          {segmentType === 'Dynamic' ? (
            <>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                <h4 className="font-medium text-blue-900 mb-2">Dinamik Segment</h4>
                <p className="text-sm text-blue-800">
                  Dinamik segmentler, belirlediğiniz kriterlere uyan müşterileri otomatik olarak gruplar.
                </p>
              </div>

              <Form.Item
                name="criteria"
                label="Segment Kriterleri (JSON)"
                rules={[{ required: true, message: 'Kriterler zorunludur' }]}
                help="Örn: {&quot;totalOrders&quot;: {&quot;$gte&quot;: 10}, &quot;totalSpent&quot;: {&quot;$gte&quot;: 1000}}"
              >
                <Input.TextArea
                  rows={6}
                  placeholder='{"totalOrders": {"$gte": 10}, "totalSpent": {"$gte": 1000}}'
                  className="font-mono text-sm"
                />
              </Form.Item>

              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h4 className="font-medium text-gray-700 mb-2">Örnek Kriterler</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>
                    <strong>VIP Müşteriler:</strong>{' '}
                    <code className="bg-white px-2 py-1 rounded">
                      {JSON.stringify({ totalSpent: { $gte: 10000 } })}
                    </code>
                  </div>
                  <div>
                    <strong>Aktif Müşteriler:</strong>{' '}
                    <code className="bg-white px-2 py-1 rounded">
                      {JSON.stringify({ lastOrderDate: { $gte: '2024-01-01' } })}
                    </code>
                  </div>
                  <div>
                    <strong>Yeni Müşteriler:</strong>{' '}
                    <code className="bg-white px-2 py-1 rounded">
                      {JSON.stringify({ createdAt: { $gte: '2024-10-01' } })}
                    </code>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">Statik Segment</h4>
                <p className="text-sm text-gray-600">
                  Statik segmentlere müşterileri manuel olarak ekleyeceksiniz. Segment oluşturduktan sonra müşteri
                  listesinden istediğiniz müşterileri bu segmente ekleyebilirsiniz.
                </p>
              </div>

              <Form.Item name="criteria" initialValue="{}">
                <Input type="hidden" />
              </Form.Item>
            </>
          )}
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
                <div className="font-medium">Segment Aktif</div>
                <div className="text-sm text-gray-500">Bu segmenti hemen kullanıma açın</div>
              </div>
            </div>
          </Form.Item>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Özet</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <div>
                <strong>Segment Adı:</strong>{' '}
                {Form.useWatch('name', form) || <span className="text-gray-400">Belirtilmedi</span>}
              </div>
              <div>
                <strong>Tip:</strong>{' '}
                <Tag color={segmentType === 'Dynamic' ? 'processing' : 'default'}>
                  {segmentType === 'Dynamic' ? 'Dinamik' : 'Statik'}
                </Tag>
              </div>
              <div className="flex items-center gap-2">
                <strong>Renk:</strong>
                <div
                  className="w-6 h-6 rounded border border-gray-300"
                  style={{ backgroundColor: Form.useWatch('color', form) || '#1890ff' }}
                />
              </div>
            </div>
          </div>

          {segmentType === 'Dynamic' && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-1">💡 Dinamik Segment Bilgisi</h4>
              <p className="text-sm text-yellow-800">
                Dinamik segmentler her gün otomatik olarak güncellenir. Kriterlere uyan yeni müşteriler
                otomatik olarak eklenir, uymayanlar çıkarılır.
              </p>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <Modal
      title={initialData ? 'Segment Düzenle' : 'Yeni Segment Oluştur'}
      open={open}
      onCancel={handleCancel}
      width={700}
      footer={null}
    >
      <Steps current={currentStep} items={steps} className="mb-6" />

      <Form form={form} layout="vertical" initialValues={initialData || { type: 'Static', color: '#1890ff' }}>
        <div className="min-h-[400px]">{steps[currentStep].content}</div>

        <div className="flex justify-between mt-6 pt-4 border-t">
          <Button onClick={handleCancel}>İptal</Button>

          <Space>
            {currentStep > 0 && <Button onClick={handlePrev}>Geri</Button>}
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
