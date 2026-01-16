'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Form } from 'antd';
import { CrmFormPageLayout } from '@/components/crm/shared';
import { CampaignForm } from '@/components/crm/campaigns';
import { useCreateCampaign } from '@/lib/api/hooks/useCRM';

export default function NewCampaignPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createCampaign = useCreateCampaign();
  const [isDirty, setIsDirty] = useState(false);

  // Check if form has been touched
  useEffect(() => {
    const interval = setInterval(() => {
      setIsDirty(form.isFieldsTouched());
    }, 500);
    return () => clearInterval(interval);
  }, [form]);

  const handleSubmit = async (values: any) => {
    try {
      await createCampaign.mutateAsync(values);
      router.push('/crm/campaigns');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <CrmFormPageLayout
      title="Yeni Kampanya"
      subtitle="Yeni pazarlama kampanyası oluşturun"
      cancelPath="/crm/campaigns"
      loading={createCampaign.isPending}
      onSave={() => form.submit()}
      isDirty={isDirty}
    >
      <CampaignForm
        form={form}
        onFinish={handleSubmit}
        loading={createCampaign.isPending}
      />
    </CrmFormPageLayout>
  );
}
