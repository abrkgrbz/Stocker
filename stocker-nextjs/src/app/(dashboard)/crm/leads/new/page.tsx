'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Form } from 'antd';
import { CrmFormPageLayout } from '@/components/crm/shared';
import { LeadForm } from '@/components/crm/leads';
import { useCreateLead } from '@/lib/api/hooks/useCRM';

export default function NewLeadPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createLead = useCreateLead();
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
      await createLead.mutateAsync(values);
      router.push('/crm/leads');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <CrmFormPageLayout
      title="Yeni Potansiyel Müşteri"
      subtitle="Yeni lead kaydı oluşturun"
      cancelPath="/crm/leads"
      loading={createLead.isPending}
      onSave={() => form.submit()}
      isDirty={isDirty}
    >
      <LeadForm
        form={form}
        onFinish={handleSubmit}
        loading={createLead.isPending}
      />
    </CrmFormPageLayout>
  );
}
