'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Form, Space, Spin, Empty } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useWorkLocation, useUpdateWorkLocation } from '@/lib/api/hooks/useHR';
import { WorkLocationForm } from '@/components/hr/work-locations';
import type { UpdateWorkLocationDto } from '@/lib/api/services/hr.types';

export default function EditWorkLocationPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const [form] = Form.useForm();

  const { data: location, isLoading, error } = useWorkLocation(id);
  const updateLocation = useUpdateWorkLocation();

  const handleSubmit = async (values: any) => {
    try {
      const data: UpdateWorkLocationDto = {
        name: values.name,
        description: values.description,
        street: values.street,
        city: values.city,
        state: values.state,
        postalCode: values.postalCode,
        country: values.country,
        latitude: values.latitude,
        longitude: values.longitude,
        phone: values.phone,
        email: values.email,
        capacity: values.capacity,
        isHeadquarters: values.isHeadquarters ?? false,
        isRemote: values.isRemote ?? false,
      };

      await updateLocation.mutateAsync({ id, data });
      router.push(`/hr/work-locations/${id}`);
    } catch (error) {
      // Error handled by hook
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !location) {
    return (
      <div className="p-6">
        <Empty description="Lokasyon bulunamadı" />
        <div className="text-center mt-4">
          <Button onClick={() => router.push('/hr/work-locations')}>Listeye Dön</Button>
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
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push(`/hr/work-locations/${id}`)}
              type="text"
              className="text-gray-500 hover:text-gray-800"
            />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0">
                <EnvironmentOutlined className="mr-2" />
                Lokasyonu Düzenle
              </h1>
              <p className="text-sm text-gray-400 m-0">{location.name}</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push(`/hr/work-locations/${id}`)}>Vazgeç</Button>
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
              Güncelle
            </Button>
          </Space>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <WorkLocationForm form={form} initialData={location} onFinish={handleSubmit} />
      </div>
    </div>
  );
}
