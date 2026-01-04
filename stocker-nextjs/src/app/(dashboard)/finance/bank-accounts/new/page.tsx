'use client';

import React, { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FinanceFormPageLayout } from '@/components/finance/shared';
import BankAccountForm, { type BankAccountFormRef, type BankAccountFormData } from '@/components/finance/bank-accounts/BankAccountForm';
import { useCreateBankAccount } from '@/lib/api/hooks/useFinance';

export default function NewBankAccountPage() {
  const router = useRouter();
  const formRef = useRef<BankAccountFormRef>(null);
  const createBankAccount = useCreateBankAccount();

  const handleSubmit = async (values: BankAccountFormData) => {
    try {
      await createBankAccount.mutateAsync(values);
      router.push('/finance/bank-accounts');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <FinanceFormPageLayout
      title="Yeni Banka Hesabı"
      subtitle="Yeni bir banka hesabı ekleyin"
      cancelPath="/finance/bank-accounts"
      loading={createBankAccount.isPending}
      onSave={() => formRef.current?.submit()}
    >
      <BankAccountForm
        ref={formRef}
        onFinish={handleSubmit}
        loading={createBankAccount.isPending}
        mode="create"
      />
    </FinanceFormPageLayout>
  );
}
