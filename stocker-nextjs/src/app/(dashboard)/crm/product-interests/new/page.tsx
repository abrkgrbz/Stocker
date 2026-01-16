'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form } from 'antd';
import { CrmFormPageLayout } from '@/components/crm/shared';
import { ProductInterestForm } from '@/components/crm/product-interests';
import { useCreateProductInterest } from '@/lib/api/hooks/useCRM';

export default function NewProductInterestPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createInterest = useCreateProductInterest();

  const handleSubmit = async (values: any) => {
    try {
      await createInterest.mutateAsync(values);
      router.push('/crm/product-interests');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <CrmFormPageLayout
      title="Yeni Urun Ilgisi"
      subtitle="Yeni urun ilgisi kaydi olusturun"
      cancelPath="/crm/product-interests"
      loading={createInterest.isPending}
      onSave={() => form.submit()}
    >
      <ProductInterestForm
        form={form}
        onFinish={handleSubmit}
        loading={createInterest.isPending}
      />
    </CrmFormPageLayout>
  );
}
