'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form } from 'antd';
import { CrmFormPageLayout } from '@/components/crm/shared';
import { LoyaltyMembershipForm } from '@/components/crm/loyalty-memberships';
import { useCreateLoyaltyMembership } from '@/lib/api/hooks/useCRM';

export default function NewLoyaltyMembershipPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createMembership = useCreateLoyaltyMembership();

  const handleSubmit = async (values: any) => {
    try {
      await createMembership.mutateAsync(values);
      router.push('/crm/loyalty-memberships');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <CrmFormPageLayout
      title="Yeni Sadakat Uyeligi"
      subtitle="Yeni sadakat programi uyeligi olusturun"
      cancelPath="/crm/loyalty-memberships"
      loading={createMembership.isPending}
      onSave={() => form.submit()}
    >
      <LoyaltyMembershipForm
        form={form}
        onFinish={handleSubmit}
        loading={createMembership.isPending}
      />
    </CrmFormPageLayout>
  );
}
