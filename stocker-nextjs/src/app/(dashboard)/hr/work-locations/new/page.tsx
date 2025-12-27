'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Form, Space } from 'antd';
import {
  ArrowLeftIcon,
  CheckIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { useCreateWorkLocation } from '@/lib/api/hooks/useHR';
import { WorkLocationForm } from '@/components/hr/work-locations';
import type { CreateWorkLocationDto } from '@/lib/api/services/hr.types';

export default function NewWorkLocationPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createLocation = useCreateWorkLocation();

  const handleSubmit = async (values: any) => {
    try {
      const data: CreateWorkLocationDto = {
        name: values.name,
        code: values.code,
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

      await createLocation.mutateAsync(data);
      router.push('/hr/work-locations');
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
              onClick={() => router.push('/hr/work-locations')}
              type="text"
              className="text-gray-500 hover:text-gray-800"
            />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0">
                <MapPinIcon className="w-4 h-4 mr-2" />
                Yeni Çalışma Lokasyonu
              </h1>
              <p className="text-sm text-gray-400 m-0">Lokasyon bilgilerini girin</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/hr/work-locations')}>Vazgeç</Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              loading={createLocation.isPending}
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
        <WorkLocationForm form={form} onFinish={handleSubmit} />
      </div>
    </div>
  );
}
