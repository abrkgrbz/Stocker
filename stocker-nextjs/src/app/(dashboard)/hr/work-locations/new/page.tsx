'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form } from 'antd';
import { MapPinIcon } from '@heroicons/react/24/outline';
import { FormPageLayout } from '@/components/patterns';
import { WorkLocationForm } from '@/components/hr/work-locations';
import { useCreateWorkLocation } from '@/lib/api/hooks/useHR';
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
    <FormPageLayout
      title="Yeni Çalışma Lokasyonu"
      subtitle="Lokasyon bilgilerini girin"
      icon={<MapPinIcon className="w-5 h-5" />}
      cancelPath="/hr/work-locations"
      loading={createLocation.isPending}
      onSave={() => form.submit()}
      maxWidth="max-w-5xl"
    >
      <WorkLocationForm
        form={form}
        onFinish={handleSubmit}
      />
    </FormPageLayout>
  );
}
