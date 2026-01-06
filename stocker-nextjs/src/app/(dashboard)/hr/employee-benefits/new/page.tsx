'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form } from 'antd';
import { GiftIcon } from '@heroicons/react/24/outline';
import { FormPageLayout } from '@/components/patterns';
import { EmployeeBenefitForm } from '@/components/hr/employee-benefits';
import { useCreateEmployeeBenefit } from '@/lib/api/hooks/useHR';

export default function NewEmployeeBenefitPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createBenefit = useCreateEmployeeBenefit();

  const handleSubmit = async (values: any) => {
    try {
      const data = {
        ...values,
        startDate: values.startDate?.toISOString(),
        endDate: values.endDate?.toISOString(),
      };
      await createBenefit.mutateAsync(data);
      router.push('/hr/employee-benefits');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <FormPageLayout
      title="Yeni Yan Hak"
      subtitle="Calisana yan hak tanimlayin"
      icon={<GiftIcon className="w-5 h-5" />}
      cancelPath="/hr/employee-benefits"
      loading={createBenefit.isPending}
      onSave={() => form.submit()}
      maxWidth="max-w-7xl"
    >
      <EmployeeBenefitForm
        form={form}
        onFinish={handleSubmit}
        loading={createBenefit.isPending}
      />
    </FormPageLayout>
  );
}
