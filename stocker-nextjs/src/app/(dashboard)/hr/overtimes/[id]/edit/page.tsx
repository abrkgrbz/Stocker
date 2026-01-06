'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Form } from 'antd';
import { ClockIcon } from '@heroicons/react/24/outline';
import { FormPageLayout } from '@/components/patterns';
import { OvertimeForm } from '@/components/hr';
import { useOvertime, useUpdateOvertime } from '@/lib/api/hooks/useHR';
import type { UpdateOvertimeDto } from '@/lib/api/services/hr.types';

export default function EditOvertimePage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  const [form] = Form.useForm();

  const { data: overtime, isLoading, error } = useOvertime(id);
  const updateOvertime = useUpdateOvertime();

  const handleSubmit = async (values: UpdateOvertimeDto) => {
    try {
      await updateOvertime.mutateAsync({ id, data: values });
      router.push(`/hr/overtimes/${id}`);
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <FormPageLayout
      title="Fazla Mesai Duzenle"
      subtitle={overtime?.employeeName || ''}
      icon={<ClockIcon className="w-5 h-5" />}
      cancelPath={`/hr/overtimes/${id}`}
      loading={updateOvertime.isPending}
      onSave={() => form.submit()}
      isDataLoading={isLoading}
      dataError={!!error || (!isLoading && !overtime)}
      errorMessage="Fazla Mesai Bulunamadi"
      errorDescription="Istenen fazla mesai kaydi bulunamadi veya bir hata olustu."
      saveButtonText="Guncelle"
      maxWidth="max-w-7xl"
    >
      <OvertimeForm
        form={form}
        initialValues={overtime}
        onFinish={handleSubmit}
        loading={updateOvertime.isPending}
      />
    </FormPageLayout>
  );
}
