'use client';

/**
 * Edit Purchase Order Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 */

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Form, Spin } from 'antd';
import {
  ArrowLeftIcon,
  CheckIcon,
  ShoppingCartIcon,
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center mb-4">
          <ShoppingCartIcon className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-lg font-medium text-slate-900 mb-2">Sipariş bulunamadı</h2>
        <p className="text-sm text-slate-500 mb-4">Bu sipariş silinmiş veya erişim yetkiniz yok olabilir.</p>
        <button
          onClick={() => router.push('/purchase/orders')}
          className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
        >
          Siparişlere Dön
        </button>
      </div>
    );
  }

  if (order.status !== 'Draft') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center mb-4">
          <ShoppingCartIcon className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-lg font-medium text-slate-900 mb-2">Bu sipariş düzenlenemez</h2>
        <p className="text-sm text-slate-500 mb-4">Sadece taslak durumundaki siparişler düzenlenebilir.</p>
        <button
          onClick={() => router.push(`/purchase/orders/${orderId}`)}
          className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
        >
          Siparişe Dön
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleCancel}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">
                  Siparişi Düzenle
                </h1>
                <p className="text-sm text-slate-500">
                  {order.orderNumber}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCancel}
                disabled={updateOrder.isPending}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                <XMarkIcon className="w-4 h-4" />
                İptal
              </button>
              <button
                onClick={() => form.submit()}
                disabled={updateOrder.isPending}
                className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                <CheckIcon className="w-4 h-4" />
                {updateOrder.isPending ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white border border-slate-200 rounded-xl p-8">
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
