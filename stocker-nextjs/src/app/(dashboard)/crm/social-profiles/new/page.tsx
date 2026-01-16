'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form } from 'antd';
import { CrmFormPageLayout } from '@/components/crm/shared';
import { SocialMediaProfileForm } from '@/components/crm/social-profiles';
import { useCreateSocialMediaProfile } from '@/lib/api/hooks/useCRM';

export default function NewSocialMediaProfilePage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createProfile = useCreateSocialMediaProfile();

  const handleSubmit = async (values: any) => {
    try {
      // Convert date to ISO string
      const payload = {
        ...values,
        lastActivityDate: values.lastActivityDate?.toISOString(),
      };
      await createProfile.mutateAsync(payload);
      router.push('/crm/social-profiles');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <CrmFormPageLayout
      title="Yeni Sosyal Medya Profili"
      subtitle="Yeni sosyal medya profili ekleyin"
      cancelPath="/crm/social-profiles"
      loading={createProfile.isPending}
      onSave={() => form.submit()}
    >
      <SocialMediaProfileForm
        form={form}
        onFinish={handleSubmit}
        loading={createProfile.isPending}
      />
    </CrmFormPageLayout>
  );
}
