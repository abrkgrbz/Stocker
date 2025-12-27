'use client';

/**
 * New Purchase Order Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form, Spin } from 'antd';
import {
  ArrowLeftIcon,
  CheckIcon,
  PaperAirplaneIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import PurchaseOrderForm from '@/components/purchase/orders/PurchaseOrderForm';
import { useCreatePurchaseOrder, useSubmitPurchaseOrder } from '@/lib/api/hooks/usePurchase';
import { PageContainer } from '@/components/ui/enterprise-page';

export default function NewPurchaseOrderPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createOrder = useCreatePurchaseOrder();
  const submitOrder = useSubmitPurchaseOrder();

  const handleSaveDraft = async (values: any) => {
    try {
      await createOrder.mutateAsync({
        ...values,
        status: 'Draft',
      });
      router.push('/purchase/orders');
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleSaveAndSubmit = async () => {
    try {
      const values = await form.validateFields();
      const result = await createOrder.mutateAsync({
        ...values,
        status: 'Draft',
      });
      // Submit for approval
      if (result && result.id) {
        await submitOrder.mutateAsync(result.id);
      }
      router.push('/purchase/orders');
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleCancel = () => {
    router.push('/purchase/orders');
  };

  const isLoading = createOrder.isPending || submitOrder.isPending;

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
                  Yeni Satın Alma Siparişi
                </h1>
                <p className="text-sm text-slate-500">
                  Tedarikçiye sipariş oluşturun
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                <XMarkIcon className="w-4 h-4" />
                İptal
              </button>
              <button
                onClick={() => form.submit()}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                <CheckIcon className="w-4 h-4" />
                {createOrder.isPending ? 'Kaydediliyor...' : 'Taslak Kaydet'}
              </button>
              <button
                onClick={handleSaveAndSubmit}
                disabled={isLoading}
                className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                <PaperAirplaneIcon className="w-4 h-4" />
                {isLoading ? 'İşleniyor...' : 'Kaydet ve Onaya Gönder'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white border border-slate-200 rounded-xl p-8">
          <Spin spinning={isLoading}>
            <PurchaseOrderForm
              form={form}
              onFinish={handleSaveDraft}
              loading={isLoading}
            />
          </Spin>
        </div>
      </div>
    </div>
  );
}
