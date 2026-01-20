'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Form } from 'antd';
import {
  ArrowLeftIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import QualityControlForm from '@/components/inventory/quality-control/QualityControlForm';
import { useCreateQualityControl } from '@/lib/api/hooks/useInventory';
import type { CreateQualityControlDto, UpdateQualityControlDto } from '@/lib/api/services/inventory.types';

export default function NewQualityControlPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createQC = useCreateQualityControl();

  const handleSubmit = async (values: CreateQualityControlDto | UpdateQualityControlDto) => {
    try {
      await createQC.mutateAsync(values as CreateQualityControlDto);
      router.push('/inventory/quality-control');
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
                Yeni Kalite Kontrol
              </h1>
              <p className="text-sm text-gray-400 m-0">Ürün kalite kontrolü için yeni kayıt oluşturun</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/inventory/quality-control')}>
              Vazgeç
            </Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              loading={createQC.isPending}
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
        <QualityControlForm
          form={form}
          onFinish={handleSubmit}
          loading={createQC.isPending}
        />
      </div>
    </div>
  );
}
