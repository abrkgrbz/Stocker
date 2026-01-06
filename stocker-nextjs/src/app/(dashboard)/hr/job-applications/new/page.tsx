'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form } from 'antd';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { FormPageLayout } from '@/components/patterns';
import { JobApplicationForm } from '@/components/hr/job-applications';
import { useCreateJobApplication } from '@/lib/api/hooks/useHR';

export default function NewJobApplicationPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createApplication = useCreateJobApplication();

  const handleSubmit = async (values: any) => {
    try {
      const data = {
        ...values,
        applicationDate: values.applicationDate?.toISOString(),
      };
      await createApplication.mutateAsync(data);
      router.push('/hr/job-applications');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <FormPageLayout
      title="Yeni Is Basvurusu"
      subtitle="Aday basvurusu kaydedin"
      icon={<DocumentTextIcon className="w-5 h-5" />}
      cancelPath="/hr/job-applications"
      loading={createApplication.isPending}
      onSave={() => form.submit()}
      maxWidth="max-w-7xl"
    >
      <JobApplicationForm
        form={form}
        onFinish={handleSubmit}
        loading={createApplication.isPending}
      />
    </FormPageLayout>
  );
}
