'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Form, Spin } from 'antd';
import { CrmFormPageLayout } from '@/components/crm/shared';
import { SocialMediaProfileForm } from '@/components/crm/social-profiles';
import { useSocialMediaProfile, useUpdateSocialMediaProfile } from '@/lib/api/hooks/useCRM';

export default function EditSocialMediaProfilePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [form] = Form.useForm();
  const { data: profile, isLoading: isLoadingProfile } = useSocialMediaProfile(id);
  const updateProfile = useUpdateSocialMediaProfile();

  const handleSubmit = async (values: any) => {
    try {
      // Convert date to ISO string
      const payload = {
        ...values,
        lastActivityDate: values.lastActivityDate?.toISOString(),
      };
      await updateProfile.mutateAsync({ id, data: payload });
      router.push(`/crm/social-profiles/${id}`);
    } catch (error) {
      // Error handled by hook
    }
  };

  if (isLoadingProfile) {
    return (
      <CrmFormPageLayout
        title="Sosyal Medya Profili Duzenle"
        subtitle="Profil bilgilerini guncelleyin"
        cancelPath={`/crm/social-profiles/${id}`}
        loading={true}
        onSave={() => {}}
      >
        <div className="flex items-center justify-center py-12">
          <Spin size="large" />
        </div>
      </CrmFormPageLayout>
    );
  }

  return (
    <CrmFormPageLayout
      title="Sosyal Medya Profili Duzenle"
      subtitle={`@${profile?.username || ''} profilini duzenleyin`}
      cancelPath={`/crm/social-profiles/${id}`}
      loading={updateProfile.isPending}
      onSave={() => form.submit()}
    >
      <SocialMediaProfileForm
        form={form}
        initialValues={profile}
        onFinish={handleSubmit}
        loading={updateProfile.isPending}
      />
    </CrmFormPageLayout>
  );
}
