'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form } from 'antd';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { FormPageLayout } from '@/components/patterns';
import { DisciplinaryActionForm } from '@/components/hr/disciplinary-actions';
import { useCreateDisciplinaryAction } from '@/lib/api/hooks/useHR';

export default function NewDisciplinaryActionPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createAction = useCreateDisciplinaryAction();

  const handleSubmit = async (values: any) => {
    try {
      const data = {
        ...values,
        incidentDate: values.incidentDate?.toISOString(),
        effectiveDate: values.effectiveDate?.toISOString(),
        expiryDate: values.expiryDate?.toISOString(),
        investigationStartDate: values.investigationStartDate?.toISOString(),
        investigationEndDate: values.investigationEndDate?.toISOString(),
      };
      await createAction.mutateAsync(data);
      router.push('/hr/disciplinary-actions');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <FormPageLayout
      title="Yeni Disiplin Islemi"
      subtitle="Disiplin islemi kaydi olusturun"
      icon={<ExclamationTriangleIcon className="w-5 h-5" />}
      cancelPath="/hr/disciplinary-actions"
      loading={createAction.isPending}
      onSave={() => form.submit()}
      maxWidth="max-w-7xl"
    >
      <DisciplinaryActionForm
        form={form}
        onFinish={handleSubmit}
        loading={createAction.isPending}
      />
    </FormPageLayout>
  );
}
