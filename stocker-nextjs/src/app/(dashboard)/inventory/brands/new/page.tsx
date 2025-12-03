'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Form } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { BrandForm } from '@/components/inventory/brands';
import { useCreateBrand } from '@/lib/api/hooks/useInventory';
import type { CreateBrandDto } from '@/lib/api/services/inventory.types';

export default function NewBrandPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createBrand = useCreateBrand();

  const handleSubmit = async (values: CreateBrandDto) => {
    try {
      await createBrand.mutateAsync(values);
      router.push('/inventory/brands');
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
              icon={<ArrowLeftOutlined />}
              onClick={() => router.back()}
              type="text"
              className="text-gray-500 hover:text-gray-800"
            />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0">
                Yeni Marka
              </h1>
              <p className="text-sm text-gray-400 m-0">Ürünler için yeni marka tanımlayın</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/inventory/brands')}>
              Vazgeç
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={createBrand.isPending}
              onClick={() => form.submit()}
              style={{
                background: '#1a1a1a',
                borderColor: '#1a1a1a',
              }}
            >
              Kaydet
            </Button>
          </Space>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <BrandForm
          form={form}
          onFinish={handleSubmit}
          loading={createBrand.isPending}
        />
      </div>
    </div>
  );
}
