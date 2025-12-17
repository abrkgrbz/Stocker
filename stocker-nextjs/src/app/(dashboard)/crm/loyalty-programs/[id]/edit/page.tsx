'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Form } from 'antd';
import { CrmFormPageLayout } from '@/components/crm/shared';
import { LoyaltyProgramForm } from '@/components/crm/loyalty-programs';
import { useLoyaltyProgram, useUpdateLoyaltyProgram } from '@/lib/api/hooks/useCRM';

export default function EditLoyaltyProgramPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [form] = Form.useForm();

  const { data: program, isLoading, error } = useLoyaltyProgram(id);
  const updateLoyaltyProgram = useUpdateLoyaltyProgram();

  const handleSubmit = async (values: any) => {
    try {
      await updateLoyaltyProgram.mutateAsync({
        id,
        data: values,
      });
      router.push('/crm/loyalty-programs');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <CrmFormPageLayout
      title={program?.name || 'Sadakat Programı Düzenle'}
      subtitle="Sadakat programı bilgilerini güncelleyin"
      cancelPath="/crm/loyalty-programs"
      loading={updateLoyaltyProgram.isPending}
      onSave={() => form.submit()}
      isDataLoading={isLoading}
      dataError={!!error || (!isLoading && !program)}
      errorMessage="Sadakat Programı Bulunamadı"
      errorDescription="İstenen sadakat programı bulunamadı veya bir hata oluştu."
    >
      <LoyaltyProgramForm
        form={form}
        initialValues={program}
        onFinish={handleSubmit}
        loading={updateLoyaltyProgram.isPending}
      />
    </CrmFormPageLayout>
  );
}
