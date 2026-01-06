'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form } from 'antd';
import { WalletIcon } from '@heroicons/react/24/outline';
import { FormPageLayout } from '@/components/patterns';
import { ExpenseForm } from '@/components/hr';
import { useCreateExpense } from '@/lib/api/hooks/useHR';
import type { CreateExpenseDto } from '@/lib/api/services/hr.types';

export default function NewExpensePage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createExpense = useCreateExpense();

  const handleSubmit = async (values: any) => {
    try {
      const data: CreateExpenseDto = {
        employeeId: values.employeeId,
        description: values.description,
        amount: values.amount,
        expenseType: values.expenseType,
        expenseDate: values.expenseDate?.format('YYYY-MM-DD'),
        currency: values.currency || 'TRY',
        merchantName: values.merchantName,
        receiptNumber: values.receiptNumber,
        notes: values.notes,
      };

      await createExpense.mutateAsync(data);
      router.push('/hr/expenses');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <FormPageLayout
      title="Yeni Harcama"
      subtitle="Yeni bir harcama kaydı oluşturun"
      icon={<WalletIcon className="w-5 h-5" />}
      cancelPath="/hr/expenses"
      loading={createExpense.isPending}
      onSave={() => form.submit()}
      maxWidth="max-w-5xl"
    >
      <ExpenseForm
        form={form}
        onFinish={handleSubmit}
        loading={createExpense.isPending}
      />
    </FormPageLayout>
  );
}
