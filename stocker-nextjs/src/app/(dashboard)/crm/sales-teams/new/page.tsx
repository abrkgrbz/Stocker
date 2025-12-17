'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form } from 'antd';
import { CrmFormPageLayout } from '@/components/crm/shared';
import { SalesTeamForm } from '@/components/crm/sales-teams';
import { useCreateSalesTeam } from '@/lib/api/hooks/useCRM';

export default function NewSalesTeamPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createSalesTeam = useCreateSalesTeam();

  const handleSubmit = async (values: any) => {
    try {
      await createSalesTeam.mutateAsync(values);
      router.push('/crm/sales-teams');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <CrmFormPageLayout
      title="Yeni Satış Ekibi"
      subtitle="Yeni satış ekibi oluşturun"
      cancelPath="/crm/sales-teams"
      loading={createSalesTeam.isPending}
      onSave={() => form.submit()}
    >
      <SalesTeamForm
        form={form}
        onFinish={handleSubmit}
        loading={createSalesTeam.isPending}
      />
    </CrmFormPageLayout>
  );
}
