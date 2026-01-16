'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CrmFormPageLayout } from '@/components/crm/shared';
import CustomerForm, { type CustomerFormRef, type CustomerFormData } from '@/components/crm/customers/CustomerForm';
import { useCreateCustomer } from '@/lib/api/hooks/useCRM';

export default function NewCustomerPage() {
  const router = useRouter();
  const formRef = useRef<CustomerFormRef>(null);
  const createCustomer = useCreateCustomer();
  const [isDirty, setIsDirty] = useState(false);

  // Check dirty state periodically (form ref method)
  useEffect(() => {
    const interval = setInterval(() => {
      if (formRef.current) {
        setIsDirty(formRef.current.isDirty());
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (values: CustomerFormData) => {
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
      onSave={() => formRef.current?.submit()}
      isDirty={isDirty}
    >
      <CustomerForm
        ref={formRef}
        onFinish={handleSubmit}
        loading={createCustomer.isPending}
      />
    </CrmFormPageLayout>
  );
}
