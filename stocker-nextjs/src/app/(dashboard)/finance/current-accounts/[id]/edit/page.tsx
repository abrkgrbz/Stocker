'use client';

import React, { useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { FinanceFormPageLayout } from '@/components/finance/shared';
import CurrentAccountForm, { type CurrentAccountFormRef, type CurrentAccountFormData } from '@/components/finance/current-accounts/CurrentAccountForm';
import { useCurrentAccount, useUpdateCurrentAccount } from '@/lib/api/hooks/useFinance';
import { Badge } from '@/components/primitives';

export default function EditCurrentAccountPage() {
  const router = useRouter();
  const params = useParams();
  const accountId = Number(params.id);
  const formRef = useRef<CurrentAccountFormRef>(null);

  const { data: account, isLoading, error } = useCurrentAccount(accountId);
  const updateCurrentAccount = useUpdateCurrentAccount();

  const handleSubmit = async (values: CurrentAccountFormData) => {
    try {
      await updateCurrentAccount.mutateAsync({ id: accountId, data: values });
      router.push('/finance/current-accounts');
    } catch (error) {
      // Error handled by hook
    }
  };

  const isActive = account?.isActive;
  const isBlocked = account?.isBlocked;

  return (
    <FinanceFormPageLayout
      title={account?.accountName || 'Cari Hesap Düzenle'}
      subtitle={account?.accountCode || 'Cari hesap bilgilerini güncelleyin'}
      cancelPath="/finance/current-accounts"
      loading={updateCurrentAccount.isPending}
      onSave={() => formRef.current?.submit()}
      isDataLoading={isLoading}
      dataError={!!error || (!isLoading && !account)}
      errorMessage="Cari Hesap Bulunamadı"
      errorDescription="İstenen cari hesap bulunamadı veya bir hata oluştu."
      titleExtra={
        account && (
          <div className="flex items-center gap-2">
            <Badge variant={isActive ? 'success' : 'default'}>
              {isActive ? (
                <CheckCircleIcon className="h-3 w-3 mr-1" />
              ) : (
                <XCircleIcon className="h-3 w-3 mr-1" />
              )}
              {isActive ? 'Aktif' : 'Pasif'}
            </Badge>
            {isBlocked && (
              <Badge variant="error">
                <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                Bloke
              </Badge>
            )}
          </div>
        )
      }
    >
      <CurrentAccountForm
        ref={formRef}
        initialValues={account || undefined}
        onFinish={handleSubmit}
        loading={updateCurrentAccount.isPending}
        mode="edit"
      />
    </FinanceFormPageLayout>
  );
}
