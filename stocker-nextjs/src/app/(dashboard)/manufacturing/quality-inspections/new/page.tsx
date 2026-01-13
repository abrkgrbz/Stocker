'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Form, Input, Select, Card, InputNumber } from 'antd';
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useCreateQualityInspection } from '@/lib/api/hooks/useManufacturing';
import type { CreateQualityInspectionRequest } from '@/lib/api/services/manufacturing.types';
import { InspectionType } from '@/lib/api/services/manufacturing.types';

const inspectionTypeOptions = [
  { value: InspectionType.Incoming, label: 'Giriş Kontrolü' },
  { value: InspectionType.InProcess, label: 'Proses İçi' },
  { value: InspectionType.Final, label: 'Final Kontrol' },
  { value: InspectionType.Random, label: 'Rastgele Numune' },
];

export default function NewQualityInspectionPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createInspection = useCreateQualityInspection();

  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      const data: CreateQualityInspectionRequest = {
        productId: values.productId as string,
        productionOrderId: values.productionOrderId as string | undefined,
        inspectionType: values.inspectionType as InspectionType,
        inspectionPlanId: values.inspectionPlanId as string | undefined,
        sampleSize: values.sampleSize as number,
        notes: values.notes as string | undefined,
      };
      const result = await createInspection.mutateAsync(data);
      router.push(`/manufacturing/quality-inspections/${result.id}`);
    } catch {
      // Error handled by hook
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(248, 250, 252, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => router.back()}
              type="text"
              className="text-slate-500 hover:text-slate-800"
            />
            <div>
              <h1 className="text-xl font-semibold text-slate-900 m-0">Yeni Kalite Kontrolü</h1>
              <p className="text-sm text-slate-400 m-0">Kontrol bilgilerini girin</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/manufacturing/quality-inspections')}>Vazgeç</Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              loading={createInspection.isPending}
              onClick={() => form.submit()}
              className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
            >
              Kaydet
            </Button>
          </Space>
        </div>
      </div>

      <div className="px-8 py-8 max-w-5xl mx-auto">
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Card title="Kontrol Bilgileri" className="mb-6">
            <div className="grid grid-cols-2 gap-6">
              <Form.Item
                name="inspectionType"
                label="Kontrol Tipi"
                rules={[{ required: true, message: 'Kontrol tipi zorunludur' }]}
              >
                <Select options={inspectionTypeOptions} placeholder="Seçiniz" />
              </Form.Item>
              <Form.Item
                name="sampleSize"
                label="Numune Büyüklüğü"
                rules={[{ required: true, message: 'Numune büyüklüğü zorunludur' }]}
              >
                <InputNumber min={1} className="w-full" placeholder="10" />
              </Form.Item>
            </div>
          </Card>

          <Card title="Ürün Bilgileri" className="mb-6">
            <div className="grid grid-cols-2 gap-6">
              <Form.Item
                name="productId"
                label="Ürün"
                rules={[{ required: true, message: 'Ürün zorunludur' }]}
              >
                <Input placeholder="Ürün ID" />
              </Form.Item>
              <Form.Item name="productionOrderId" label="Üretim Emri (Opsiyonel)">
                <Input placeholder="Üretim Emri ID" />
              </Form.Item>
            </div>
            <Form.Item name="inspectionPlanId" label="Kontrol Planı (Opsiyonel)">
              <Input placeholder="Kontrol Planı ID" />
            </Form.Item>
          </Card>

          <Card title="Notlar">
            <Form.Item name="notes" label="Açıklama">
              <Input.TextArea rows={4} placeholder="Kontrol hakkında notlar..." />
            </Form.Item>
          </Card>
        </Form>
      </div>
    </div>
  );
}
