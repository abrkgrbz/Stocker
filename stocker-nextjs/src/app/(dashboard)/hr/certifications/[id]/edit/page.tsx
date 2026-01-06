'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Form } from 'antd';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import { FormPageLayout } from '@/components/patterns';
import { CertificationForm } from '@/components/hr';
import { useCertification, useUpdateCertification } from '@/lib/api/hooks/useHR';
import type { UpdateCertificationDto } from '@/lib/api/services/hr.types';

export default function EditCertificationPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  const [form] = Form.useForm();

  const { data: certification, isLoading, error } = useCertification(id);
  const updateCertification = useUpdateCertification();

  const handleSubmit = async (values: UpdateCertificationDto) => {
    try {
      await updateCertification.mutateAsync({ id, data: values });
      router.push(`/hr/certifications/${id}`);
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <FormPageLayout
      title="Sertifika Duzenle"
      subtitle={certification?.certificationName || 'Yukleniyor...'}
      icon={<ShieldCheckIcon className="w-5 h-5" />}
      cancelPath={`/hr/certifications/${id}`}
      loading={updateCertification.isPending}
      onSave={() => form.submit()}
      saveButtonText="Guncelle"
      isDataLoading={isLoading}
      dataError={!!error || !certification}
    >
      <CertificationForm
        form={form}
        initialValues={certification}
        onFinish={handleSubmit}
        loading={updateCertification.isPending}
      />
    </FormPageLayout>
  );
}
