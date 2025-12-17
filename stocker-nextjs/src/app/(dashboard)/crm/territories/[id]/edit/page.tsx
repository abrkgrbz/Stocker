'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Form } from 'antd';
import { CrmFormPageLayout } from '@/components/crm/shared';
import { TerritoryForm } from '@/components/crm/territories';
import { useTerritory, useUpdateTerritory } from '@/lib/api/hooks/useCRM';

export default function EditTerritoryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [form] = Form.useForm();

  const { data: territory, isLoading, error } = useTerritory(id);
  const updateTerritory = useUpdateTerritory();

  const handleSubmit = async (values: any) => {
    try {
      await updateTerritory.mutateAsync({
        id,
        data: values,
      });
      router.push('/crm/territories');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <CrmFormPageLayout
      title={territory?.name || 'Bölge Düzenle'}
      subtitle="Bölge bilgilerini güncelleyin"
      cancelPath="/crm/territories"
      loading={updateTerritory.isPending}
      onSave={() => form.submit()}
      isDataLoading={isLoading}
      dataError={!!error || (!isLoading && !territory)}
      errorMessage="Bölge Bulunamadı"
      errorDescription="İstenen bölge bulunamadı veya bir hata oluştu."
    >
      <TerritoryForm
        form={form}
        initialValues={territory}
        onFinish={handleSubmit}
        loading={updateTerritory.isPending}
      />
    </CrmFormPageLayout>
  );
}
