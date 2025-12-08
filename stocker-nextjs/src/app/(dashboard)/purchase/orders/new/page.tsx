'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form, Button, Spin } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, CloseOutlined, SendOutlined } from '@ant-design/icons';
import PurchaseOrderForm from '@/components/purchase/orders/PurchaseOrderForm';
import { useCreatePurchaseOrder, useSubmitPurchaseOrder } from '@/lib/api/hooks/usePurchase';

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
              icon={<ArrowLeftOutlined />}
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700"
            />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0">
                Yeni Satın Alma Siparişi
              </h1>
              <p className="text-sm text-gray-500 m-0">
                Tedarikçiye sipariş oluşturun
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              icon={<CloseOutlined />}
              onClick={handleCancel}
              disabled={isLoading}
            >
              İptal
            </Button>
            <Button
              icon={<SaveOutlined />}
              onClick={() => form.submit()}
              loading={createOrder.isPending}
            >
              Taslak Kaydet
            </Button>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSaveAndSubmit}
              loading={isLoading}
              className="px-6"
            >
              Kaydet ve Onaya Gönder
            </Button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
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
