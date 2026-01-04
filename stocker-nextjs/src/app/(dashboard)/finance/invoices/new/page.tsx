'use client';

import React, { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FinanceFormPageLayout } from '@/components/finance/shared';
import InvoiceForm, { type InvoiceFormRef, type InvoiceFormData } from '@/components/finance/invoices/InvoiceForm';
import { useCreateInvoice } from '@/lib/api/hooks/useFinance';

export default function NewInvoicePage() {
  const router = useRouter();
  const formRef = useRef<InvoiceFormRef>(null);
  const createInvoice = useCreateInvoice();

  const handleSubmit = async (values: InvoiceFormData) => {
    try {
      await createInvoice.mutateAsync(values);
      router.push('/finance/invoices');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <FinanceFormPageLayout
      title="Yeni Fatura"
      subtitle="Yeni fatura oluşturun"
      cancelPath="/finance/invoices"
      loading={createInvoice.isPending}
      onSave={() => formRef.current?.submit()}
    >
      <InvoiceForm
        ref={formRef}
        onFinish={handleSubmit}
        loading={createInvoice.isPending}
        mode="create"
      />
    </FinanceFormPageLayout>
  );
}
