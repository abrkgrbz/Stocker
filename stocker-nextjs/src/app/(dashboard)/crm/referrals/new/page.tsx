'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form } from 'antd';
import { CrmFormPageLayout } from '@/components/crm/shared';
import { ReferralForm } from '@/components/crm/referrals';
import { useCreateReferral } from '@/lib/api/hooks/useCRM';

export default function NewReferralPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createReferral = useCreateReferral();

  const handleSubmit = async (values: any) => {
    try {
      await createReferral.mutateAsync(values);
      router.push('/crm/referrals');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <CrmFormPageLayout
      title="Yeni Referans"
      subtitle="Yeni referans kaydı oluşturun"
      cancelPath="/crm/referrals"
      loading={createReferral.isPending}
      onSave={() => form.submit()}
    >
      <ReferralForm
        form={form}
        onFinish={handleSubmit}
        loading={createReferral.isPending}
      />
    </CrmFormPageLayout>
  );
}
