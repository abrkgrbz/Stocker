'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Form, Input, Select, DatePicker, Card, InputNumber } from 'antd';
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useCreateSubcontractOrder } from '@/lib/api/hooks/useManufacturing';
import type { CreateSubcontractOrderRequest } from '@/lib/api/services/manufacturing.types';
import dayjs from 'dayjs';

export default function NewSubcontractOrderPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createOrder = useCreateSubcontractOrder();

  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      const data: CreateSubcontractOrderRequest = {
        subcontractorId: values.subcontractorId as string,
        productId: values.productId as string,
        productionOrderId: values.productionOrderId as string | undefined,
        quantity: values.quantity as number,
        unitOfMeasure: values.unitOfMeasure as string,
        unitPrice: values.unitPrice as number,
        expectedDeliveryDate: (values.expectedDeliveryDate as dayjs.Dayjs).toISOString(),
        notes: values.notes as string | undefined,
      };
      const result = await createOrder.mutateAsync(data);
      router.push(`/manufacturing/subcontract-orders/${result.id}`);
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
              <h1 className="text-xl font-semibold text-slate-900 m-0">Yeni Fason Sipariş</h1>
              <p className="text-sm text-slate-400 m-0">Sipariş bilgilerini girin</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/manufacturing/subcontract-orders')}>Vazgeç</Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              loading={createOrder.isPending}
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
          <Card title="Sipariş Bilgileri" className="mb-6">
            <div className="grid grid-cols-2 gap-6">
              <Form.Item
                name="subcontractorId"
                label="Fasoncu"
                rules={[{ required: true, message: 'Fasoncu zorunludur' }]}
              >
                <Input placeholder="Fasoncu ID" />
              </Form.Item>
              <Form.Item
                name="productId"
                label="Ürün"
                rules={[{ required: true, message: 'Ürün zorunludur' }]}
              >
                <Input placeholder="Ürün ID" />
              </Form.Item>
            </div>
            <div className="grid grid-cols-4 gap-6">
              <Form.Item
                name="quantity"
                label="Sipariş Miktarı"
                rules={[{ required: true, message: 'Miktar zorunludur' }]}
              >
                <InputNumber min={1} className="w-full" placeholder="0" />
              </Form.Item>
              <Form.Item
                name="unitOfMeasure"
                label="Birim"
                rules={[{ required: true, message: 'Birim zorunludur' }]}
              >
                <Select
                  placeholder="Seçiniz"
                  options={[
                    { value: 'Adet', label: 'Adet' },
                    { value: 'Kg', label: 'Kg' },
                    { value: 'Lt', label: 'Lt' },
                    { value: 'Mt', label: 'Mt' },
                  ]}
                />
              </Form.Item>
              <Form.Item
                name="unitPrice"
                label="Birim Fiyat"
                rules={[{ required: true, message: 'Birim fiyat zorunludur' }]}
              >
                <InputNumber
                  min={0}
                  step={0.01}
                  className="w-full"
                  placeholder="0.00"
                  formatter={value => `₺ ${value}`}
                />
              </Form.Item>
              <Form.Item
                name="expectedDeliveryDate"
                label="Beklenen Teslim Tarihi"
                rules={[{ required: true, message: 'Teslim tarihi zorunludur' }]}
              >
                <DatePicker className="w-full" format="DD.MM.YYYY" />
              </Form.Item>
            </div>
            <Form.Item name="productionOrderId" label="Üretim Emri (Opsiyonel)">
              <Input placeholder="Üretim Emri ID" />
            </Form.Item>
          </Card>

          <Card title="Notlar">
            <Form.Item name="notes" label="Açıklama">
              <Input.TextArea rows={4} placeholder="Sipariş hakkında notlar..." />
            </Form.Item>
          </Card>
        </Form>
      </div>
    </div>
  );
}
