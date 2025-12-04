'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Form, Button, message, Space } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useCreateLocation } from '@/lib/api/hooks/useInventory';
import { LocationForm } from '@/components/inventory/locations';
import type { CreateLocationDto } from '@/lib/api/services/inventory.types';

export default function NewLocationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultWarehouseId = searchParams.get('warehouseId');

  const [form] = Form.useForm();
  const createLocation = useCreateLocation();

  const handleSubmit = async (values: CreateLocationDto) => {
    try {
      await createLocation.mutateAsync(values);
      message.success('Lokasyon başarıyla oluşturuldu');
      router.push('/inventory/locations');
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lokasyon oluşturulamadı');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Sticky Header with Glass Effect */}
      <div
        className="sticky top-0 z-10 -mx-6 px-6 py-4 mb-8"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          marginTop: '-24px',
          paddingTop: '24px',
        }}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => router.back()}
              className="flex items-center"
            >
              Geri
            </Button>
            <div className="h-6 w-px bg-gray-200" />
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                }}
              >
                <EnvironmentOutlined style={{ fontSize: 20, color: 'white' }} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 m-0">
                  Yeni Lokasyon
                </h1>
                <p className="text-sm text-gray-500 m-0">
                  Lokasyon bilgilerini girin
                </p>
              </div>
            </div>
          </div>

          <Space>
            <Button onClick={() => router.back()}>İptal</Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={() => form.submit()}
              loading={createLocation.isPending}
              style={{ background: '#6366f1', borderColor: '#6366f1' }}
            >
              Kaydet
            </Button>
          </Space>
        </div>
      </div>

      {/* Form */}
      <LocationForm
        form={form}
        onFinish={handleSubmit}
        loading={createLocation.isPending}
        defaultWarehouseId={defaultWarehouseId ? Number(defaultWarehouseId) : undefined}
      />
    </div>
  );
}
