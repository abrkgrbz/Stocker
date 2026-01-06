'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form } from 'antd';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { FormPageLayout } from '@/components/patterns';
import { GrievanceForm } from '@/components/hr/grievances';
import { useCreateGrievance } from '@/lib/api/hooks/useHR';

export default function NewGrievancePage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createGrievance = useCreateGrievance();

  const handleSubmit = async (values: any) => {
    try {
      const data = {
        ...values,
        filedDate: values.filedDate?.toISOString(),
      };
      await createGrievance.mutateAsync(data);
      router.push('/hr/grievances');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <FormPageLayout
      title="Yeni Sikayet"
      subtitle="Calisan sikayeti olusturun"
      icon={<ExclamationCircleIcon className="w-5 h-5" />}
      cancelPath="/hr/grievances"
      loading={createGrievance.isPending}
      onSave={() => form.submit()}
      maxWidth="max-w-7xl"
    >
      <GrievanceForm
        form={form}
        onFinish={handleSubmit}
        loading={createGrievance.isPending}
      />
    </FormPageLayout>
  );
}
