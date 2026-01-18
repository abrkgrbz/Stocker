'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Form, Empty } from 'antd';
import { Spinner } from '@/components/primitives';
import { CrmFormPageLayout } from '@/components/crm/shared';
import ReferralForm from '@/components/crm/referrals/ReferralForm';
import { useReferral, useUpdateReferral } from '@/lib/api/hooks/useCRM';

export default function EditReferralPage() {
  const router = useRouter();
  const params = useParams();
  const referralId = params.id as string;
  const [form] = Form.useForm();

  const { data: referral, isLoading } = useReferral(referralId);
  const updateReferral = useUpdateReferral();

  const handleSubmit = async (values: any) => {
    try {
      const payload = {
        id: referralId,
        ...values,
      };
      await updateReferral.mutateAsync({ id: referralId, data: payload });
      router.push(`/crm/referrals/${referralId}`);
    } catch (error) {
      // Error handled by hook
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!referral) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Empty description="Referans bulunamadı" />
      </div>
    );
  }

  return (
    <CrmFormPageLayout
      title="Referans Düzenle"
      subtitle={referral.referrerName}
      cancelPath={`/crm/referrals/${referralId}`}
      loading={updateReferral.isPending}
      onSave={() => form.submit()}
    >
      <ReferralForm
        form={form}
        initialValues={referral}
        onFinish={handleSubmit}
        loading={updateReferral.isPending}
      />
    </CrmFormPageLayout>
  );
}
