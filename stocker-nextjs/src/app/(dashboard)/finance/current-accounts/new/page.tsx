'use client';

import React, { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FinanceFormPageLayout } from '@/components/finance/shared';
import CurrentAccountForm, { type CurrentAccountFormRef, type CurrentAccountFormData } from '@/components/finance/current-accounts/CurrentAccountForm';
import { useCreateCurrentAccount } from '@/lib/api/hooks/useFinance';

export default function NewCurrentAccountPage() {
  const router = useRouter();
  const formRef = useRef<CurrentAccountFormRef>(null);
  const createCurrentAccount = useCreateCurrentAccount();

  const handleSubmit = async (values: CurrentAccountFormData) => {
    try {
      await createCurrentAccount.mutateAsync(values);
      router.push('/finance/current-accounts');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <FinanceFormPageLayout
      title="Yeni Cari Hesap"
      subtitle="Yeni bir cari hesap oluşturun"
      cancelPath="/finance/current-accounts"
      loading={createCurrentAccount.isPending}
      onSave={() => formRef.current?.submit()}
    >
      <CurrentAccountForm
        ref={formRef}
        onFinish={handleSubmit}
        loading={createCurrentAccount.isPending}
        mode="create"
      />
    </FinanceFormPageLayout>
  );
}
