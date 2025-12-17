'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form } from 'antd';
import { CrmFormPageLayout } from '@/components/crm/shared';
import { CustomerForm } from '@/components/crm/customers';
import { useCreateCustomer } from '@/lib/api/hooks/useCRM';

export default function NewCustomerPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createCustomer = useCreateCustomer();

  const handleSubmit = async (values: any) => {
    try {
      await createCustomer.mutateAsync(values);
      router.push('/crm/customers');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <CrmFormPageLayout
      title="Yeni Müşteri"
      subtitle="Yeni müşteri kaydı oluşturun"
      cancelPath="/crm/customers"
      loading={createCustomer.isPending}
      onSave={() => form.submit()}
    >
      <CustomerForm
        form={form}
        onFinish={handleSubmit}
        loading={createCustomer.isPending}
      />
    </CrmFormPageLayout>
  );
}
