'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Space, Form, Spin } from 'antd';
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';
import { BarcodeDefinitionForm } from '@/components/inventory/barcode-definitions';
import { useBarcodeDefinition, useUpdateBarcodeDefinition } from '@/lib/api/hooks/useInventory';
import type { UpdateBarcodeDefinitionDto } from '@/lib/api/services/inventory.types';

export default function EditBarcodeDefinitionPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const [form] = Form.useForm();

  const { data: barcodeDefinition, isLoading } = useBarcodeDefinition(id);
  const updateBarcodeDefinition = useUpdateBarcodeDefinition();

  const handleSubmit = async (values: UpdateBarcodeDefinitionDto) => {
    try {
      await updateBarcodeDefinition.mutateAsync({ id, dto: values });
      router.push(`/inventory/barcode-definitions/${id}`);
    } catch (error) {
      // Error handled by hook
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!barcodeDefinition) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Barkod tanımı bulunamadı</h2>
          <Button onClick={() => router.push('/inventory/barcode-definitions')} className="mt-4">
            Listeye Dön
          </Button>
        </div>
      </div>
    );
  }

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
                Barkod Tanımını Düzenle
              </h1>
              <p className="text-sm text-gray-400 m-0 font-mono">{barcodeDefinition.barcode}</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push(`/inventory/barcode-definitions/${id}`)}>
              Vazgeç
            </Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              loading={updateBarcodeDefinition.isPending}
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
          initialValues={barcodeDefinition}
          onFinish={handleSubmit}
          loading={updateBarcodeDefinition.isPending}
        />
      </div>
    </div>
  );
}
