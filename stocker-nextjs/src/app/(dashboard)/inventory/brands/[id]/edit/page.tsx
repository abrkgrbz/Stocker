'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Space, Form, Spin, Alert, Tag } from 'antd';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  CheckIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { BrandForm } from '@/components/inventory/brands';
import { useBrand, useUpdateBrand } from '@/lib/api/hooks/useInventory';
import type { UpdateBrandDto } from '@/lib/api/services/inventory.types';

export default function EditBrandPage() {
  const router = useRouter();
  const params = useParams();
  const brandId = Number(params.id);
  const [form] = Form.useForm();

  const { data: brand, isLoading, error } = useBrand(brandId);
  const updateBrand = useUpdateBrand();

  const handleSubmit = async (values: UpdateBrandDto) => {
    try {
      await updateBrand.mutateAsync({ id: brandId, data: values });
      router.push('/inventory/brands');
    } catch (error) {
      // Error handled by hook
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !brand) {
    return (
      <div className="p-8">
        <Alert
          message="Marka Bulunamadı"
          description="İstenen marka bulunamadı veya bir hata oluştu."
          type="error"
          showIcon
          action={
            <Button onClick={() => router.push('/inventory/brands')}>
              Markalara Dön
            </Button>
          }
        />
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
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-gray-900 m-0">
                    {brand.name}
                  </h1>
                  <Tag
                    icon={brand.isActive ? <CheckCircleIcon className="w-4 h-4" /> : <ClockIcon className="w-4 h-4" />}
                    color={brand.isActive ? 'success' : 'default'}
                    className="ml-2"
                  >
                    {brand.isActive ? 'Aktif' : 'Pasif'}
                  </Tag>
                </div>
                <p className="text-sm text-gray-400 m-0">{brand.code}</p>
              </div>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/inventory/brands')}>
              Vazgeç
            </Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              loading={updateBrand.isPending}
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
        <BrandForm
          form={form}
          initialValues={brand}
          onFinish={handleSubmit}
          loading={updateBrand.isPending}
        />
      </div>
    </div>
  );
}
