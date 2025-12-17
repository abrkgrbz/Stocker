'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form } from 'antd';
import { CrmFormPageLayout } from '@/components/crm/shared';
import { OpportunityForm } from '@/components/crm/opportunities';
import { useCreateOpportunity } from '@/lib/api/hooks/useCRM';
import dayjs from 'dayjs';

export default function NewOpportunityPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createOpportunity = useCreateOpportunity();

  const handleSubmit = async (values: any) => {
    try {
      // Format the data for API
      const formattedData = {
        ...values,
        expectedCloseDate: values.expectedCloseDate ? dayjs(values.expectedCloseDate).toISOString() : null,
      };
      await createOpportunity.mutateAsync(formattedData);
      router.push('/crm/opportunities');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <CrmFormPageLayout
      title="Yeni Fırsat"
      subtitle="Yeni satış fırsatı oluşturun"
      cancelPath="/crm/opportunities"
      loading={createOpportunity.isPending}
      onSave={() => form.submit()}
    >
      <OpportunityForm
        form={form}
        onFinish={handleSubmit}
        loading={createOpportunity.isPending}
      />
    </CrmFormPageLayout>
  );
}
