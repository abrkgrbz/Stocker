'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form } from 'antd';
import { CrmFormPageLayout } from '@/components/crm/shared';
import { SurveyResponseForm } from '@/components/crm/survey-responses';
import { useCreateSurveyResponse } from '@/lib/api/hooks/useCRM';

export default function NewSurveyResponsePage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createResponse = useCreateSurveyResponse();

  const handleSubmit = async (values: any) => {
    try {
      // Convert date to ISO string
      const payload = {
        ...values,
        submittedAt: values.submittedAt?.toISOString(),
      };
      await createResponse.mutateAsync(payload);
      router.push('/crm/survey-responses');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <CrmFormPageLayout
      title="Yeni Anket Yaniti"
      subtitle="Yeni anket yaniti kaydedin"
      cancelPath="/crm/survey-responses"
      loading={createResponse.isPending}
      onSave={() => form.submit()}
    >
      <SurveyResponseForm
        form={form}
        onFinish={handleSubmit}
        loading={createResponse.isPending}
      />
    </CrmFormPageLayout>
  );
}
