'use client';

import React, { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FinanceFormPageLayout } from '@/components/finance/shared';
import ExpenseForm, { type ExpenseFormRef, type ExpenseFormData } from '@/components/finance/expenses/ExpenseForm';
import { useCreateExpense } from '@/lib/api/hooks/useFinance';

export default function NewExpensePage() {
  const router = useRouter();
  const formRef = useRef<ExpenseFormRef>(null);
  const createExpense = useCreateExpense();

  const handleSubmit = async (values: ExpenseFormData) => {
    try {
      await createExpense.mutateAsync(values);
      router.push('/finance/expenses');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <FinanceFormPageLayout
      title="Yeni Gider"
      subtitle="Yeni bir gider kaydı oluşturun"
      cancelPath="/finance/expenses"
      loading={createExpense.isPending}
      onSave={() => formRef.current?.submit()}
    >
      <ExpenseForm
        ref={formRef}
        onFinish={handleSubmit}
        loading={createExpense.isPending}
        mode="create"
      />
    </FinanceFormPageLayout>
  );
}
