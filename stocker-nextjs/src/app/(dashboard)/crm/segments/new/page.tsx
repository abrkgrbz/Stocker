'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form } from 'antd';
import { CrmFormPageLayout } from '@/components/crm/shared';
import { SegmentForm } from '@/components/crm/segments';
import { useCreateCustomerSegment } from '@/lib/api/hooks/useCRM';

export default function NewSegmentPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createSegment = useCreateCustomerSegment();

  const handleSubmit = async (values: any) => {
    try {
      await createSegment.mutateAsync(values);
      router.push('/crm/segments');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <CrmFormPageLayout
      title="Yeni Segment"
      subtitle="Yeni müşteri segmenti oluşturun"
      cancelPath="/crm/segments"
      loading={createSegment.isPending}
      onSave={() => form.submit()}
    >
      <SegmentForm
        form={form}
        onFinish={handleSubmit}
        loading={createSegment.isPending}
      />
    </CrmFormPageLayout>
  );
}
