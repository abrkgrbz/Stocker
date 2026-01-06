'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form } from 'antd';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import { FormPageLayout } from '@/components/patterns';
import { InterviewForm } from '@/components/hr/interviews';
import { useCreateInterview } from '@/lib/api/hooks/useHR';

export default function NewInterviewPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createInterview = useCreateInterview();

  const handleSubmit = async (values: any) => {
    try {
      const data = {
        ...values,
        scheduledDate: values.scheduledDate?.toISOString(),
      };
      await createInterview.mutateAsync(data);
      router.push('/hr/interviews');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <FormPageLayout
      title="Yeni Mulakat"
      subtitle="Is gorusmesi planlayin"
      icon={<UserGroupIcon className="w-5 h-5" />}
      cancelPath="/hr/interviews"
      loading={createInterview.isPending}
      onSave={() => form.submit()}
      maxWidth="max-w-7xl"
    >
      <InterviewForm
        form={form}
        onFinish={handleSubmit}
        loading={createInterview.isPending}
      />
    </FormPageLayout>
  );
}
