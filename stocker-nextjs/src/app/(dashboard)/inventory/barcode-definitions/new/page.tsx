'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Form } from 'antd';
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';
import { BarcodeDefinitionForm } from '@/components/inventory/barcode-definitions';
import { useCreateBarcodeDefinition } from '@/lib/api/hooks/useInventory';
import type { CreateBarcodeDefinitionDto } from '@/lib/api/services/inventory.types';

export default function NewBarcodeDefinitionPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createBarcodeDefinition = useCreateBarcodeDefinition();

  const handleSubmit = async (values: CreateBarcodeDefinitionDto) => {
    try {
      await createBarcodeDefinition.mutateAsync(values);
      router.push('/inventory/barcode-definitions');
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
                Yeni Barkod Tanımı
              </h1>
              <p className="text-sm text-gray-400 m-0">Ürüne yeni barkod tanımlayın</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/inventory/barcode-definitions')}>
              Vazgeç
            </Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              loading={createBarcodeDefinition.isPending}
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
        <BarcodeDefinitionForm
          form={form}
          onFinish={handleSubmit}
          loading={createBarcodeDefinition.isPending}
        />
      </div>
    </div>
  );
}
