'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Form, message } from 'antd';
import { ArrowLeftIcon, CheckIcon, GiftIcon } from '@heroicons/react/24/outline';
import ProductBundleForm from '@/components/inventory/product-bundles/ProductBundleForm';
import { useCreateProductBundle } from '@/lib/api/hooks/useInventory';
import type { CreateProductBundleDto, UpdateProductBundleDto } from '@/lib/api/services/inventory.types';

export default function NewProductBundlePage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createBundle = useCreateProductBundle();

  const handleSubmit = async (values: CreateProductBundleDto | UpdateProductBundleDto) => {
    try {
      // Transform dates if needed
      const createValues = values as CreateProductBundleDto;
      const data = {
        ...createValues,
        validFrom: createValues.validFrom ? new Date(createValues.validFrom).toISOString() : undefined,
        validTo: createValues.validTo ? new Date(createValues.validTo).toISOString() : undefined,
        fixedPriceCurrency: createValues.fixedPrice ? 'TRY' : undefined,
        items: createValues.items || [],
      };
      await createBundle.mutateAsync(data);
      message.success('Paket başarıyla oluşturuldu');
      router.push('/inventory/product-bundles');
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
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: '#f59e0b15' }}
              >
                <GiftIcon className="w-5 h-5" style={{ color: '#f59e0b' }} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 m-0">
                  Yeni Ürün Paketi
                </h1>
                <p className="text-sm text-gray-400 m-0">Ürün paketi veya kombo tanımlayın</p>
              </div>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/inventory/product-bundles')}>
              Vazgeç
            </Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              loading={createBundle.isPending}
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
        <ProductBundleForm
          form={form}
          onFinish={handleSubmit}
          loading={createBundle.isPending}
        />
      </div>
    </div>
  );
}
