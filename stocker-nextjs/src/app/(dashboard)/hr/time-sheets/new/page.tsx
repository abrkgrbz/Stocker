'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form } from 'antd';
import { ClockIcon } from '@heroicons/react/24/outline';
import { FormPageLayout } from '@/components/patterns';
import { TimeSheetForm } from '@/components/hr/time-sheets';
import { useCreateTimeSheet } from '@/lib/api/hooks/useHR';

export default function NewTimeSheetPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createTimeSheet = useCreateTimeSheet();

  const handleSubmit = async (values: any) => {
    try {
      const data = {
        ...values,
        periodStart: values.periodStart?.toISOString(),
        periodEnd: values.periodEnd?.toISOString(),
        submittedDate: values.submittedDate?.toISOString(),
      };
      await createTimeSheet.mutateAsync(data);
      router.push('/hr/time-sheets');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <FormPageLayout
      title="Yeni Puantaj"
      subtitle="Çalışan çalışma saatlerini kaydedin"
      icon={<ClockIcon className="w-5 h-5" />}
      cancelPath="/hr/time-sheets"
      loading={createTimeSheet.isPending}
      onSave={() => form.submit()}
      maxWidth="max-w-7xl"
    >
      <TimeSheetForm
        form={form}
        onFinish={handleSubmit}
        loading={createTimeSheet.isPending}
      />
    </FormPageLayout>
  );
}
