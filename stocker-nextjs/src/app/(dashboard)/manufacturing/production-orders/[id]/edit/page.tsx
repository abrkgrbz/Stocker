'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Space, Form, Alert, Tag } from 'antd';
import { Spinner } from '@/components/primitives';
import { ArrowLeftIcon, CheckIcon, CogIcon, ClockIcon } from '@heroicons/react/24/outline';
import { ProductionOrderForm } from '@/components/manufacturing/production-orders';
import { useProductionOrder, useUpdateProductionOrder } from '@/lib/api/hooks/useManufacturing';
import type { CreateProductionOrderRequest } from '@/lib/api/services/manufacturing.types';

const statusLabels: Record<number, string> = {
  0: 'Taslak',
  1: 'Planlandı',
  2: 'Onaylı',
  3: 'Serbest',
  4: 'Üretimde',
  5: 'Tamamlandı',
  6: 'Kapatıldı',
  7: 'İptal',
};

export default function EditProductionOrderPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  const [form] = Form.useForm();

  const { data: order, isLoading, error } = useProductionOrder(orderId);
  const updateOrder = useUpdateProductionOrder();

  const handleSubmit = async (values: Partial<CreateProductionOrderRequest>) => {
    try {
      await updateOrder.mutateAsync({ id: orderId, data: values });
      router.push(`/manufacturing/production-orders/${orderId}`);
    } catch {
      // Error handled by hook
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-8">
        <Alert
          message="Emir Bulunamadı"
          description="İstenen üretim emri bulunamadı veya bir hata oluştu."
          type="error"
          showIcon
          action={
            <Button onClick={() => router.push('/manufacturing/production-orders')}>
              Emirlere Dön
            </Button>
          }
        />
      </div>
    );
  }

  // Can't edit orders that are in progress or completed
  if (order.status >= 4) {
    return (
      <div className="p-8">
        <Alert
          message="Düzenleme Yapılamaz"
          description="Üretimi başlamış veya tamamlanmış emirler düzenlenemez."
          type="warning"
          showIcon
          action={
            <Button onClick={() => router.push(`/manufacturing/production-orders/${orderId}`)}>
              Emir Detayına Dön
            </Button>
          }
        />
      </div>
    );
  }

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
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-slate-900 m-0">
                    {order.orderNumber}
                  </h1>
                  <Tag
                    icon={order.status >= 4 ? <CogIcon className="w-3 h-3" /> : <ClockIcon className="w-3 h-3" />}
                    color={order.status === 4 ? 'processing' : 'default'}
                    className="ml-2"
                  >
                    {statusLabels[order.status] || 'Bilinmiyor'}
                  </Tag>
                </div>
                <p className="text-sm text-slate-400 m-0">{order.productName}</p>
              </div>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push(`/manufacturing/production-orders/${orderId}`)}>
              Vazgeç
            </Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              loading={updateOrder.isPending}
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
          initialValues={order}
          onFinish={handleSubmit}
          loading={updateOrder.isPending}
        />
      </div>
    </div>
  );
}
