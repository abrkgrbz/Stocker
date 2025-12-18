'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Space, Form, Spin, Alert, Tag } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { LocationForm } from '@/components/inventory/locations';
import { useLocation, useUpdateLocation } from '@/lib/api/hooks/useInventory';
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
      router.push('/inventory/locations');
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

  if (error || !location) {
    return (
      <div className="p-8">
        <Alert
          message="Lokasyon Bulunamadı"
          description="İstenen lokasyon bulunamadı veya bir hata oluştu."
          type="error"
          showIcon
          action={
            <Button onClick={() => router.push('/inventory/locations')}>
              Lokasyonlara Dön
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
              icon={<ArrowLeftOutlined />}
              onClick={() => router.back()}
              type="text"
              className="text-gray-500 hover:text-gray-800"
            />
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-gray-900 m-0">
                    {location.name}
                  </h1>
                  <Tag
                    icon={location.isActive ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                    color={location.isActive ? 'success' : 'default'}
                    className="ml-2"
                  >
                    {location.isActive ? 'Aktif' : 'Pasif'}
                  </Tag>
                </div>
                <p className="text-sm text-gray-400 m-0">{location.code} • {location.warehouseName}</p>
              </div>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/inventory/locations')}>
              Vazgeç
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={updateLocation.isPending}
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
        <LocationForm
          form={form}
          initialValues={location}
          onFinish={handleSubmit}
          loading={updateLocation.isPending}
        />
      </div>
    </div>
  );
}
