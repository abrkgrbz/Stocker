'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Form } from 'antd';
import { CrmFormPageLayout } from '@/components/crm/shared';
import { CompetitorForm } from '@/components/crm/competitors';
import { useCompetitor, useUpdateCompetitor } from '@/lib/api/hooks/useCRM';

export default function EditCompetitorPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [form] = Form.useForm();

  const { data: competitor, isLoading, error } = useCompetitor(id);
  const updateCompetitor = useUpdateCompetitor();

  const handleSubmit = async (values: any) => {
    try {
      await updateCompetitor.mutateAsync({
        id,
        data: values,
      });
      router.push('/crm/competitors');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <CrmFormPageLayout
      title={competitor?.name || 'Rakip Düzenle'}
      subtitle="Rakip bilgilerini güncelleyin"
      cancelPath="/crm/competitors"
      loading={updateCompetitor.isPending}
      onSave={() => form.submit()}
      isDataLoading={isLoading}
      dataError={!!error || (!isLoading && !competitor)}
      errorMessage="Rakip Bulunamadı"
      errorDescription="İstenen rakip bulunamadı veya bir hata oluştu."
    >
      <CompetitorForm
        form={form}
        initialValues={competitor}
        onFinish={handleSubmit}
        loading={updateCompetitor.isPending}
      />
    </CrmFormPageLayout>
  );
}
