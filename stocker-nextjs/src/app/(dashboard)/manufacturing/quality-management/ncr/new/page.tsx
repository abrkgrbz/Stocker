'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Form, Input, Select, Card, InputNumber } from 'antd';
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useCreateNcr } from '@/lib/api/hooks/useManufacturing';
import type { CreateNcrRequest } from '@/lib/api/services/manufacturing.types';
import { NcrSource, NcrSeverity } from '@/lib/api/services/manufacturing.types';

const sourceOptions = [
  { value: NcrSource.Internal, label: 'Dahili' },
  { value: NcrSource.Customer, label: 'Müşteri' },
  { value: NcrSource.Supplier, label: 'Tedarikçi' },
  { value: NcrSource.Production, label: 'Üretim' },
  { value: NcrSource.Inspection, label: 'Kontrol' },
];

const severityOptions = [
  { value: NcrSeverity.Minor, label: 'Küçük' },
  { value: NcrSeverity.Major, label: 'Büyük' },
  { value: NcrSeverity.Critical, label: 'Kritik' },
];

export default function NewNcrPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createNcr = useCreateNcr();

  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      const data: CreateNcrRequest = {
        title: values.title as string,
        description: values.description as string,
        source: values.source as NcrSource,
        severity: values.severity as NcrSeverity,
        productId: values.productId as string | undefined,
        productionOrderId: values.productionOrderId as string | undefined,
        customerId: values.customerId as string | undefined,
        supplierId: values.supplierId as string | undefined,
        affectedQuantity: (values.affectedQuantity as number) ?? 0,
        defectType: values.defectType as string | undefined,
      };
      const result = await createNcr.mutateAsync(data);
      router.push(`/manufacturing/quality-management`);
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
              <h1 className="text-xl font-semibold text-slate-900 m-0">Yeni Uygunsuzluk Raporu (NCR)</h1>
              <p className="text-sm text-slate-400 m-0">Uygunsuzluk bilgilerini girin</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/manufacturing/quality-management')}>Vazgeç</Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              loading={createNcr.isPending}
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
          <Card title="Temel Bilgiler" className="mb-6">
            <Form.Item
              name="title"
              label="Başlık"
              rules={[{ required: true, message: 'Başlık zorunludur' }]}
            >
              <Input placeholder="Uygunsuzluk başlığı" />
            </Form.Item>
            <div className="grid grid-cols-3 gap-6">
              <Form.Item
                name="source"
                label="Kaynak"
                rules={[{ required: true, message: 'Kaynak zorunludur' }]}
              >
                <Select options={sourceOptions} placeholder="Seçiniz" />
              </Form.Item>
              <Form.Item
                name="severity"
                label="Ciddiyet"
                rules={[{ required: true, message: 'Ciddiyet zorunludur' }]}
              >
                <Select options={severityOptions} placeholder="Seçiniz" />
              </Form.Item>
              <Form.Item name="defectType" label="Hata Tipi">
                <Input placeholder="Örn: Boyut hatası" />
              </Form.Item>
            </div>
            <Form.Item
              name="description"
              label="Açıklama"
              rules={[{ required: true, message: 'Açıklama zorunludur' }]}
            >
              <Input.TextArea rows={4} placeholder="Uygunsuzluğun detaylı açıklaması..." />
            </Form.Item>
          </Card>

          <Card title="Etkilenen Ürün/Sipariş" className="mb-6">
            <div className="grid grid-cols-2 gap-6">
              <Form.Item name="productId" label="Ürün">
                <Input placeholder="Ürün ID (opsiyonel)" />
              </Form.Item>
              <Form.Item name="productionOrderId" label="Üretim Emri">
                <Input placeholder="Üretim Emri ID (opsiyonel)" />
              </Form.Item>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <Form.Item name="affectedQuantity" label="Etkilenen Miktar">
                <InputNumber min={0} className="w-full" placeholder="0" />
              </Form.Item>
              <Form.Item name="customerId" label="Müşteri">
                <Input placeholder="Müşteri ID (opsiyonel)" />
              </Form.Item>
              <Form.Item name="supplierId" label="Tedarikçi">
                <Input placeholder="Tedarikçi ID (opsiyonel)" />
              </Form.Item>
            </div>
          </Card>
        </Form>
      </div>
    </div>
  );
}
