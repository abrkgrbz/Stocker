'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form } from 'antd';
import { CrmFormPageLayout } from '@/components/crm/shared';
import { DealForm } from '@/components/crm/deals';
import { useCreateDeal } from '@/lib/api/hooks/useCRM';
import { showCreateSuccess, showError } from '@/lib/utils/sweetalert';

export default function NewDealPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createDeal = useCreateDeal();

  const handleSubmit = async (values: any) => {
    try {
      if (!values.customerId) {
        showError('Musteri secimi zorunludur');
        return;
      }
      if (!values.expectedCloseDate) {
        showError('Tahmini kapanis tarihi zorunludur');
        return;
      }
      await createDeal.mutateAsync(values);
      showCreateSuccess('firsat');
      router.push('/crm/deals');
    } catch (error: any) {
      const apiError = error.response?.data;
      const errorMessage = apiError?.detail || apiError?.errors?.[0]?.message || apiError?.title || error.message || 'Islem basarisiz';
      showError(errorMessage);
    }
  };

  return (
    <CrmFormPageLayout
      title="Yeni Fırsat"
      subtitle="Yeni satış fırsatı oluşturun"
      cancelPath="/crm/deals"
      loading={createDeal.isPending}
      onSave={() => form.submit()}
    >
      <DealForm
        form={form}
        onFinish={handleSubmit}
        loading={createDeal.isPending}
      />
    </CrmFormPageLayout>
  );
}
