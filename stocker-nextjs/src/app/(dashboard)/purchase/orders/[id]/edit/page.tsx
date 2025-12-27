'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Form, Button, Spin, Empty } from 'antd';
import {
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import PurchaseOrderForm from '@/components/purchase/orders/PurchaseOrderForm';
import { usePurchaseOrder, useUpdatePurchaseOrder } from '@/lib/api/hooks/usePurchase';

export default function EditPurchaseOrderPage() {
  const params = useParams();
  const router = useRouter();
  const [form] = Form.useForm();
  const orderId = params.id as string;

  const { data: order, isLoading: isLoadingOrder } = usePurchaseOrder(orderId);
  const updateOrder = useUpdatePurchaseOrder();

  const handleSubmit = async (values: any) => {
    try {
      await updateOrder.mutateAsync({ id: orderId, data: values });
      router.push(`/purchase/orders/${orderId}`);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleCancel = () => {
    router.push(`/purchase/orders/${orderId}`);
  };

  if (isLoadingOrder) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8">
        <Empty description="Sipariş bulunamadı" />
        <div className="text-center mt-4">
          <Button onClick={() => router.push('/purchase/orders')}>
            Siparişlere Dön
          </Button>
        </div>
      </div>
    );
  }

  if (order.status !== 'Draft') {
    return (
      <div className="p-8">
        <Empty description="Bu sipariş düzenlenemez. Sadece taslak durumundaki siparişler düzenlenebilir." />
        <div className="text-center mt-4">
          <Button onClick={() => router.push(`/purchase/orders/${orderId}`)}>
            Siparişe Dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30">
      {/* Sticky Header */}
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700"
            />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0">
                Siparişi Düzenle
              </h1>
              <p className="text-sm text-gray-500 m-0">
                {order.orderNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              icon={<XMarkIcon className="w-4 h-4" />}
              onClick={handleCancel}
              disabled={updateOrder.isPending}
            >
              İptal
            </Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              onClick={() => form.submit()}
              loading={updateOrder.isPending}
              className="px-6"
            >
              Kaydet
            </Button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <Spin spinning={updateOrder.isPending}>
            <PurchaseOrderForm
              form={form}
              initialValues={order}
              onFinish={handleSubmit}
              loading={updateOrder.isPending}
            />
          </Spin>
        </div>
      </div>
    </div>
  );
}
