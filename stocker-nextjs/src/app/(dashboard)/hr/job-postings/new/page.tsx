'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form } from 'antd';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { FormPageLayout } from '@/components/patterns';
import { JobPostingForm } from '@/components/hr';
import { useCreateJobPosting } from '@/lib/api/hooks/useHR';
import type { CreateJobPostingDto } from '@/lib/api/services/hr.types';

export default function NewJobPostingPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createJobPosting = useCreateJobPosting();

  const handleSubmit = async (values: CreateJobPostingDto) => {
    try {
      await createJobPosting.mutateAsync(values);
      router.push('/hr/job-postings');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <FormPageLayout
      title="Yeni Is Ilani"
      subtitle="Yeni bir is ilani olusturun"
      icon={<DocumentTextIcon className="w-5 h-5" />}
      cancelPath="/hr/job-postings"
      loading={createJobPosting.isPending}
      onSave={() => form.submit()}
    >
      <JobPostingForm
        form={form}
        onFinish={handleSubmit}
        loading={createJobPosting.isPending}
      />
    </FormPageLayout>
  );
}
