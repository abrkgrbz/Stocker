'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form } from 'antd';
import { CrmFormPageLayout } from '@/components/crm/shared';
import { PipelineForm } from '@/components/crm/pipelines';
import { useCreatePipeline } from '@/lib/api/hooks/useCRM';

export default function NewPipelinePage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createPipeline = useCreatePipeline();

  const handleSubmit = async (values: any) => {
    try {
      await createPipeline.mutateAsync(values);
      router.push('/crm/pipelines');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <CrmFormPageLayout
      title="Yeni Pipeline"
      subtitle="Yeni satış süreci oluşturun"
      cancelPath="/crm/pipelines"
      loading={createPipeline.isPending}
      onSave={() => form.submit()}
    >
      <PipelineForm
        form={form}
        onFinish={handleSubmit}
        loading={createPipeline.isPending}
      />
    </CrmFormPageLayout>
  );
}
