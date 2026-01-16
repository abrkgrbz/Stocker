'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Form } from 'antd';
import { CrmFormPageLayout } from '@/components/crm/shared';
import { LoyaltyMembershipForm } from '@/components/crm/loyalty-memberships';
import { useLoyaltyMembership, useUpdateLoyaltyMembership } from '@/lib/api/hooks/useCRM';

export default function EditLoyaltyMembershipPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [form] = Form.useForm();

  const { data: membership, isLoading, error } = useLoyaltyMembership(id);
  const updateMembership = useUpdateLoyaltyMembership();

  const handleSubmit = async (values: any) => {
    try {
      await updateMembership.mutateAsync({
        id,
        data: values,
      });
      router.push('/crm/loyalty-memberships');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <CrmFormPageLayout
      title={membership?.membershipNumber || 'Sadakat Uyeligi Duzenle'}
      subtitle="Sadakat uyeligi bilgilerini guncelleyin"
      cancelPath="/crm/loyalty-memberships"
      loading={updateMembership.isPending}
      onSave={() => form.submit()}
      isDataLoading={isLoading}
      dataError={!!error || (!isLoading && !membership)}
      errorMessage="Sadakat Uyeligi Bulunamadi"
      errorDescription="Istenen sadakat uyeligi bulunamadi veya bir hata olustu."
    >
      <LoyaltyMembershipForm
        form={form}
        initialValues={membership}
        onFinish={handleSubmit}
        loading={updateMembership.isPending}
      />
    </CrmFormPageLayout>
  );
}
