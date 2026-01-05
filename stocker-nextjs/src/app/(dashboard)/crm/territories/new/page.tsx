'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form } from 'antd';
import { CrmFormPageLayout } from '@/components/crm/shared';
import { TerritoryForm } from '@/components/crm/territories';
import { useCreateTerritory } from '@/lib/api/hooks/useCRM';

export default function NewTerritoryPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createTerritory = useCreateTerritory();

  const handleSubmit = async (values: any) => {
    try {
      await createTerritory.mutateAsync(values);
      router.push('/crm/territories');
    } catch {
      // Error handled by hook
    }
  };

  return (
    <CrmFormPageLayout
      title="Yeni Bölge"
      subtitle="Yeni satış bölgesi oluşturun"
      cancelPath="/crm/territories"
      loading={createTerritory.isPending}
      onSave={() => form.submit()}
    >
      <TerritoryForm
        form={form}
        onFinish={handleSubmit}
        loading={createTerritory.isPending}
      />
    </CrmFormPageLayout>
  );
}
