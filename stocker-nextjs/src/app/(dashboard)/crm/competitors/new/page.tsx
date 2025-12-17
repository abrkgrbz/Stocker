'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form } from 'antd';
import { CrmFormPageLayout } from '@/components/crm/shared';
import { CompetitorForm } from '@/components/crm/competitors';
import { useCreateCompetitor } from '@/lib/api/hooks/useCRM';

export default function NewCompetitorPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createCompetitor = useCreateCompetitor();

  const handleSubmit = async (values: any) => {
    try {
      await createCompetitor.mutateAsync(values);
      router.push('/crm/competitors');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <CrmFormPageLayout
      title="Yeni Rakip"
      subtitle="Yeni rakip kaydı oluşturun"
      cancelPath="/crm/competitors"
      loading={createCompetitor.isPending}
      onSave={() => form.submit()}
    >
      <CompetitorForm
        form={form}
        onFinish={handleSubmit}
        loading={createCompetitor.isPending}
      />
    </CrmFormPageLayout>
  );
}
