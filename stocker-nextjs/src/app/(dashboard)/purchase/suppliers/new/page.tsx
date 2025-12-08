'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form, Button, Spin } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import SupplierForm from '@/components/purchase/suppliers/SupplierForm';
import { useCreateSupplier } from '@/lib/api/hooks/usePurchase';

export default function NewSupplierPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createSupplier = useCreateSupplier();

  const handleSubmit = async (values: any) => {
    try {
      await createSupplier.mutateAsync(values);
      router.push('/purchase/suppliers');
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleCancel = () => {
    router.push('/purchase/suppliers');
  };

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
                Yeni Tedarikçi
              </h1>
              <p className="text-sm text-gray-500 m-0">
                Yeni bir tedarikçi firma ekleyin
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              icon={<CloseOutlined />}
              onClick={handleCancel}
              disabled={createSupplier.isPending}
            >
              İptal
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={() => form.submit()}
              loading={createSupplier.isPending}
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
          <Spin spinning={createSupplier.isPending}>
            <SupplierForm
              form={form}
              onFinish={handleSubmit}
              loading={createSupplier.isPending}
            />
          </Spin>
        </div>
      </div>
    </div>
  );
}
