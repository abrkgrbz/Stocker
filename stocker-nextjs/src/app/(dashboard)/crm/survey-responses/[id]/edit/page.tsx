'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Form, Spin } from 'antd';
import { CrmFormPageLayout } from '@/components/crm/shared';
import { SurveyResponseForm } from '@/components/crm/survey-responses';
import { useSurveyResponse, useUpdateSurveyResponse } from '@/lib/api/hooks/useCRM';

export default function EditSurveyResponsePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [form] = Form.useForm();
  const { data: response, isLoading: isLoadingResponse } = useSurveyResponse(id);
  const updateResponse = useUpdateSurveyResponse();

  const handleSubmit = async (values: any) => {
    try {
      // Convert date to ISO string
      const payload = {
        ...values,
        submittedAt: values.submittedAt?.toISOString(),
      };
      await updateResponse.mutateAsync({ id, data: payload });
      router.push(`/crm/survey-responses/${id}`);
    } catch (error) {
      // Error handled by hook
    }
  };

  if (isLoadingResponse) {
    return (
      <CrmFormPageLayout
        title="Anket Yaniti Duzenle"
        subtitle="Anket yaniti bilgilerini guncelleyin"
        cancelPath={`/crm/survey-responses/${id}`}
        loading={true}
        onSave={() => {}}
      >
        <div className="flex items-center justify-center py-12">
          <Spin size="large" />
        </div>
      </CrmFormPageLayout>
    );
  }

  return (
    <CrmFormPageLayout
      title="Anket Yaniti Duzenle"
      subtitle={`"${response?.surveyName || ''}" yanitini duzenleyin`}
      cancelPath={`/crm/survey-responses/${id}`}
      loading={updateResponse.isPending}
      onSave={() => form.submit()}
    >
      <SurveyResponseForm
        form={form}
        initialValues={response}
        onFinish={handleSubmit}
        loading={updateResponse.isPending}
      />
    </CrmFormPageLayout>
  );
}
