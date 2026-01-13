'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Form } from 'antd';
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';
import { ProductionOrderForm } from '@/components/manufacturing/production-orders';
import { useCreateProductionOrder } from '@/lib/api/hooks/useManufacturing';
import type { CreateProductionOrderRequest } from '@/lib/api/services/manufacturing.types';

export default function NewProductionOrderPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createOrder = useCreateProductionOrder();

  const handleSubmit = async (values: CreateProductionOrderRequest) => {
    try {
      await createOrder.mutateAsync(values);
      router.push('/manufacturing/production-orders');
    } catch {
      // Error handled by hook
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Glass Effect Sticky Header */}
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(248, 250, 252, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => router.back()}
              type="text"
              className="text-slate-500 hover:text-slate-800"
            />
            <div>
              <h1 className="text-xl font-semibold text-slate-900 m-0">
                Yeni Üretim Emri
              </h1>
              <p className="text-sm text-slate-400 m-0">Yeni üretim emri oluşturun</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/manufacturing/production-orders')}>
              Vazgeç
            </Button>
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

      {/* Page Content */}
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <ProductionOrderForm
          form={form}
          onFinish={handleSubmit}
          loading={createOrder.isPending}
        />
      </div>
    </div>
  );
}
