'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Form } from 'antd';
import { MapPinIcon } from '@heroicons/react/24/outline';
import { FormPageLayout } from '@/components/patterns';
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

  return (
    <FormPageLayout
      title="Lokasyonu Duzenle"
      subtitle={location?.name || ''}
      icon={<MapPinIcon className="w-5 h-5" />}
      cancelPath={`/hr/work-locations/${id}`}
      loading={updateLocation.isPending}
      onSave={() => form.submit()}
      isDataLoading={isLoading}
      dataError={!!error || (!isLoading && !location)}
      errorMessage="Lokasyon Bulunamadi"
      errorDescription="Istenen lokasyon bulunamadi veya bir hata olustu."
      saveButtonText="Guncelle"
      maxWidth="max-w-7xl"
    >
      <WorkLocationForm form={form} initialData={location} onFinish={handleSubmit} />
    </FormPageLayout>
  );
}
