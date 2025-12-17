'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form } from 'antd';
import { CrmFormPageLayout } from '@/components/crm/shared';
import { LoyaltyProgramForm } from '@/components/crm/loyalty-programs';
import { useCreateLoyaltyProgram } from '@/lib/api/hooks/useCRM';

export default function NewLoyaltyProgramPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createLoyaltyProgram = useCreateLoyaltyProgram();

  const handleSubmit = async (values: any) => {
    try {
      await createLoyaltyProgram.mutateAsync(values);
      router.push('/crm/loyalty-programs');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <CrmFormPageLayout
      title="Yeni Sadakat Programı"
      subtitle="Yeni sadakat programı oluşturun"
      cancelPath="/crm/loyalty-programs"
      loading={createLoyaltyProgram.isPending}
      onSave={() => form.submit()}
    >
      <LoyaltyProgramForm
        form={form}
        onFinish={handleSubmit}
        loading={createLoyaltyProgram.isPending}
      />
    </CrmFormPageLayout>
  );
}
