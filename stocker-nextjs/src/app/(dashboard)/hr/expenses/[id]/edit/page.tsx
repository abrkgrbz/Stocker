'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Form } from 'antd';
import { WalletIcon } from '@heroicons/react/24/outline';
import { FormPageLayout } from '@/components/patterns';
import { ExpenseForm } from '@/components/hr';
import { useExpense, useUpdateExpense } from '@/lib/api/hooks/useHR';
import type { UpdateExpenseDto } from '@/lib/api/services/hr.types';
import { ExpenseStatus } from '@/lib/api/services/hr.types';

export default function EditExpensePage() {
  const params = useParams();
  const router = useRouter();
  const [form] = Form.useForm();
  const id = Number(params.id);

  // API Hooks
  const { data: expense, isLoading, error } = useExpense(id);
  const updateExpense = useUpdateExpense();

  // Check if expense can be edited (only pending expenses)
  const canEdit = expense?.status === ExpenseStatus.Pending;

  // Redirect to detail page if expense cannot be edited
  useEffect(() => {
    if (expense && !canEdit) {
      router.push(`/hr/expenses/${id}`);
    }
  }, [expense, canEdit, router, id]);

  const handleSubmit = async (values: any) => {
    try {
      const data: UpdateExpenseDto = {
        description: values.description,
        amount: values.amount,
        expenseType: values.expenseType,
        expenseDate: values.expenseDate?.format('YYYY-MM-DD'),
        merchantName: values.merchantName,
        receiptNumber: values.receiptNumber,
        notes: values.notes,
      };

      await updateExpense.mutateAsync({ id, data });
      router.push(`/hr/expenses/${id}`);
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <FormPageLayout
      title="Harcama Duzenle"
      subtitle={expense?.employeeName || `Calisan #${expense?.employeeId || ''}`}
      icon={<WalletIcon className="w-5 h-5" />}
      cancelPath={`/hr/expenses/${id}`}
      loading={updateExpense.isPending}
      onSave={() => form.submit()}
      isDataLoading={isLoading}
      dataError={!!error || (!isLoading && !expense)}
      errorMessage="Harcama Bulunamadi"
      errorDescription="Istenen harcama kaydi bulunamadi veya bir hata olustu."
      saveButtonText="Guncelle"
      maxWidth="max-w-4xl"
    >
      <ExpenseForm
        form={form}
        initialValues={expense || undefined}
        onFinish={handleSubmit}
        loading={updateExpense.isPending}
      />
    </FormPageLayout>
  );
}
