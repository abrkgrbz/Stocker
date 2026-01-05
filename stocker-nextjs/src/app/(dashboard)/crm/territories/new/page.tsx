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
    // DEBUG: Log values before API call
    console.log('🚀 NewTerritoryPage - Sending to API:', JSON.stringify(values, null, 2));

    try {
      const result = await createTerritory.mutateAsync(values);
      console.log('✅ Territory created:', result);

      // DEBUG: Wait 3 seconds before redirect so we can see logs
      await new Promise(resolve => setTimeout(resolve, 3000));

      router.push('/crm/territories');
    } catch (error) {
      console.error('❌ Territory creation error:', error);
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
