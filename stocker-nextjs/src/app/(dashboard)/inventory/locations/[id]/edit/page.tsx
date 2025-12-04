'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Form, Button, message, Space, Spin, Alert, Tag } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useLocation, useUpdateLocation } from '@/lib/api/hooks/useInventory';
import { LocationForm } from '@/components/inventory/locations';
import type { UpdateLocationDto } from '@/lib/api/services/inventory.types';

export default function EditLocationPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  const [form] = Form.useForm();

  const { data: location, isLoading, error } = useLocation(id);
  const updateLocation = useUpdateLocation();

  const handleSubmit = async (values: UpdateLocationDto) => {
    try {
      await updateLocation.mutateAsync({ id, data: values });
      message.success('Lokasyon başarıyla güncellendi');
      router.push('/inventory/locations');
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lokasyon güncellenemedi');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !location) {
    return (
      <Alert
        message="Hata"
        description="Lokasyon bilgileri yüklenemedi"
        type="error"
        showIcon
        action={
          <Button onClick={() => router.back()}>Geri Dön</Button>
        }
      />
    );
  }

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
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-gray-900 m-0">
                    {location.name}
                  </h1>
                  <Tag color={location.isActive ? 'success' : 'default'}>
                    {location.isActive ? 'Aktif' : 'Pasif'}
                  </Tag>
                </div>
                <p className="text-sm text-gray-500 m-0">
                  Kod: {location.code} • {location.warehouseName}
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
              loading={updateLocation.isPending}
              style={{ background: '#6366f1', borderColor: '#6366f1' }}
            >
              Güncelle
            </Button>
          </Space>
        </div>
      </div>

      {/* Form */}
      <LocationForm
        form={form}
        initialValues={location}
        onFinish={handleSubmit}
        loading={updateLocation.isPending}
      />
    </div>
  );
}
