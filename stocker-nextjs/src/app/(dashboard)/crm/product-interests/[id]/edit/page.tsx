'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Form } from 'antd';
import { CrmFormPageLayout } from '@/components/crm/shared';
import { ProductInterestForm } from '@/components/crm/product-interests';
import { useProductInterest, useUpdateProductInterest } from '@/lib/api/hooks/useCRM';

export default function EditProductInterestPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [form] = Form.useForm();

  const { data: interest, isLoading, error } = useProductInterest(id);
  const updateInterest = useUpdateProductInterest();

  const handleSubmit = async (values: any) => {
    try {
      await updateInterest.mutateAsync({
        id,
        data: values,
      });
      router.push('/crm/product-interests');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <CrmFormPageLayout
      title={interest?.productName || 'Urun Ilgisi Duzenle'}
      subtitle="Urun ilgisi bilgilerini guncelleyin"
      cancelPath="/crm/product-interests"
      loading={updateInterest.isPending}
      onSave={() => form.submit()}
      isDataLoading={isLoading}
      dataError={!!error || (!isLoading && !interest)}
      errorMessage="Urun Ilgisi Bulunamadi"
      errorDescription="Istenen urun ilgisi bulunamadi veya bir hata olustu."
    >
      <ProductInterestForm
        form={form}
        initialValues={interest}
        onFinish={handleSubmit}
        loading={updateInterest.isPending}
      />
    </CrmFormPageLayout>
  );
}
