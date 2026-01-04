'use client';

import React, { useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { FinanceFormPageLayout } from '@/components/finance/shared';
import ExpenseForm, { type ExpenseFormRef, type ExpenseFormData } from '@/components/finance/expenses/ExpenseForm';
import { useExpense, useUpdateExpense } from '@/lib/api/hooks/useFinance';
import { Badge } from '@/components/primitives';

export default function EditExpensePage() {
  const router = useRouter();
  const params = useParams();
  const expenseId = Number(params.id);
  const formRef = useRef<ExpenseFormRef>(null);

  const { data: expense, isLoading, error } = useExpense(expenseId);
  const updateExpense = useUpdateExpense();

  const handleSubmit = async (values: ExpenseFormData) => {
    try {
      await updateExpense.mutateAsync({ id: expenseId, data: values });
      router.push('/finance/expenses');
    } catch (error) {
      // Error handled by hook
    }
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'default'; icon: React.ReactNode }> = {
      Draft: { label: 'Taslak', variant: 'default', icon: <ClockIcon className="h-3 w-3 mr-1" /> },
      Pending: { label: 'Beklemede', variant: 'warning', icon: <ClockIcon className="h-3 w-3 mr-1" /> },
      Approved: { label: 'Onaylandı', variant: 'success', icon: <CheckCircleIcon className="h-3 w-3 mr-1" /> },
      Paid: { label: 'Ödendi', variant: 'success', icon: <CheckCircleIcon className="h-3 w-3 mr-1" /> },
      Rejected: { label: 'Reddedildi', variant: 'error', icon: <XCircleIcon className="h-3 w-3 mr-1" /> },
      Cancelled: { label: 'İptal', variant: 'error', icon: <XCircleIcon className="h-3 w-3 mr-1" /> },
    };
    return configs[status] || { label: status, variant: 'default' as const, icon: null };
  };

  const statusConfig = expense?.status ? getStatusConfig(expense.status) : null;

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      Rent: 'Kira',
      Utilities: 'Faturalar',
      Salaries: 'Maaşlar',
      Marketing: 'Pazarlama',
      Travel: 'Seyahat',
      Supplies: 'Ofis Malzemeleri',
      Equipment: 'Ekipman',
      Maintenance: 'Bakım & Onarım',
      Insurance: 'Sigorta',
      Taxes: 'Vergiler',
      Other: 'Diğer',
    };
    return labels[category] || category;
  };

  return (
    <FinanceFormPageLayout
      title={expense?.expenseNumber || 'Gider Düzenle'}
      subtitle={expense?.description || 'Gider bilgilerini güncelleyin'}
      cancelPath="/finance/expenses"
      loading={updateExpense.isPending}
      onSave={() => formRef.current?.submit()}
      isDataLoading={isLoading}
      dataError={!!error || (!isLoading && !expense)}
      errorMessage="Gider Bulunamadı"
      errorDescription="İstenen gider bulunamadı veya bir hata oluştu."
      titleExtra={
        expense && statusConfig && (
          <Badge variant={statusConfig.variant}>
            {statusConfig.icon}
            {statusConfig.label}
          </Badge>
        )
      }
    >
      <ExpenseForm
        ref={formRef}
        initialValues={expense || undefined}
        onFinish={handleSubmit}
        loading={updateExpense.isPending}
        mode="edit"
      />
    </FinanceFormPageLayout>
  );
}
