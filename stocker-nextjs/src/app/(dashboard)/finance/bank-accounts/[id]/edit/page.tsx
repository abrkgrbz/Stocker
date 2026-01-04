'use client';

import React, { useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { FinanceFormPageLayout } from '@/components/finance/shared';
import BankAccountForm, { type BankAccountFormRef, type BankAccountFormData } from '@/components/finance/bank-accounts/BankAccountForm';
import { useBankAccount, useUpdateBankAccount } from '@/lib/api/hooks/useFinance';
import { Badge } from '@/components/primitives';

export default function EditBankAccountPage() {
  const router = useRouter();
  const params = useParams();
  const accountId = Number(params.id);
  const formRef = useRef<BankAccountFormRef>(null);

  const { data: account, isLoading, error } = useBankAccount(accountId);
  const updateBankAccount = useUpdateBankAccount();

  const handleSubmit = async (values: BankAccountFormData) => {
    try {
      await updateBankAccount.mutateAsync({ id: accountId, data: values });
      router.push('/finance/bank-accounts');
    } catch (error) {
      // Error handled by hook
    }
  };

  const isActive = account?.isActive;

  const getAccountTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      Checking: 'Vadesiz Hesap',
      Savings: 'Vadeli Hesap',
      Credit: 'Kredi Hesabı',
      Investment: 'Yatırım Hesabı',
    };
    return labels[type] || type;
  };

  return (
    <FinanceFormPageLayout
      title={account?.accountName || 'Banka Hesabı Düzenle'}
      subtitle={account?.bankName ? `${account.bankName} - ${getAccountTypeLabel(account.accountType)}` : 'Banka hesabı bilgilerini güncelleyin'}
      cancelPath="/finance/bank-accounts"
      loading={updateBankAccount.isPending}
      onSave={() => formRef.current?.submit()}
      isDataLoading={isLoading}
      dataError={!!error || (!isLoading && !account)}
      errorMessage="Banka Hesabı Bulunamadı"
      errorDescription="İstenen banka hesabı bulunamadı veya bir hata oluştu."
      titleExtra={
        account && (
          <Badge variant={isActive ? 'success' : 'default'}>
            {isActive ? (
              <CheckCircleIcon className="h-3 w-3 mr-1" />
            ) : (
              <XCircleIcon className="h-3 w-3 mr-1" />
            )}
            {isActive ? 'Aktif' : 'Pasif'}
          </Badge>
        )
      }
    >
      <BankAccountForm
        ref={formRef}
        initialValues={account || undefined}
        onFinish={handleSubmit}
        loading={updateBankAccount.isPending}
        mode="edit"
      />
    </FinanceFormPageLayout>
  );
}
