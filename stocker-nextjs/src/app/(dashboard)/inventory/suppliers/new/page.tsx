'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Form } from 'antd';
import {
  ArrowLeftIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { SupplierForm } from '@/components/inventory/suppliers';
import { useCreateSupplier } from '@/lib/api/hooks/useInventory';
import type { CreateSupplierDto } from '@/lib/api/services/inventory.types';

export default function NewSupplierPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createSupplier = useCreateSupplier();

  const handleSubmit = async (values: CreateSupplierDto) => {
    try {
      await createSupplier.mutateAsync(values);
      router.push('/inventory/suppliers');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Glass Effect Sticky Header */}
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
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
              className="text-gray-500 hover:text-gray-800"
            />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0">
                Yeni Tedarikçi
              </h1>
              <p className="text-sm text-gray-400 m-0">Envanter için yeni tedarikçi tanımlayın</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/inventory/suppliers')}>
              Vazgeç
            </Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              loading={createSupplier.isPending}
              onClick={() => form.submit()}
              style={{
                background: '#1a1a1a',
                borderColor: '#1a1a1a',
                color: 'white',
              }}
            >
              Kaydet
            </Button>
          </Space>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <SupplierForm
          form={form}
          onFinish={handleSubmit}
          loading={createSupplier.isPending}
        />
      </div>
    </div>
  );
}
