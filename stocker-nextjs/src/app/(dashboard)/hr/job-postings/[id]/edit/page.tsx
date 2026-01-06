'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Form } from 'antd';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { FormPageLayout } from '@/components/patterns';
import { JobPostingForm } from '@/components/hr';
import { useJobPosting, useUpdateJobPosting } from '@/lib/api/hooks/useHR';
import type { UpdateJobPostingDto } from '@/lib/api/services/hr.types';

export default function EditJobPostingPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  const [form] = Form.useForm();

  const { data: jobPosting, isLoading, isError } = useJobPosting(id);
  const updateJobPosting = useUpdateJobPosting();

  const handleSubmit = async (values: UpdateJobPostingDto) => {
    try {
      await updateJobPosting.mutateAsync({ id, data: values });
      router.push(`/hr/job-postings/${id}`);
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <FormPageLayout
      title="Is Ilani Duzenle"
      subtitle={jobPosting?.title || ''}
      cancelPath={`/hr/job-postings/${id}`}
      loading={updateJobPosting.isPending}
      onSave={() => form.submit()}
      isDataLoading={isLoading}
      dataError={isError}
      saveButtonText="Guncelle"
      icon={<DocumentTextIcon className="w-5 h-5" />}
      maxWidth="max-w-7xl"
    >
      <JobPostingForm
        form={form}
        initialValues={jobPosting}
        onFinish={handleSubmit}
        loading={updateJobPosting.isPending}
      />
    </FormPageLayout>
  );
}
