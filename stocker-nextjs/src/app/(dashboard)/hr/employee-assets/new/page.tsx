'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form } from 'antd';
import { ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { FormPageLayout } from '@/components/patterns';
import { EmployeeAssetForm } from '@/components/hr/employee-assets';
import { useCreateEmployeeAsset } from '@/lib/api/hooks/useHR';

export default function NewEmployeeAssetPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createAsset = useCreateEmployeeAsset();

  const handleSubmit = async (values: any) => {
    try {
      const data = {
        ...values,
        assignedDate: values.assignedDate?.toISOString(),
        returnDate: values.returnDate?.toISOString(),
        purchaseDate: values.purchaseDate?.toISOString(),
        warrantyExpiry: values.warrantyExpiry?.toISOString(),
      };
      await createAsset.mutateAsync(data);
      router.push('/hr/employee-assets');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <FormPageLayout
      title="Yeni Varlik Atama"
      subtitle="Calisana varlik atayin"
      icon={<ComputerDesktopIcon className="w-5 h-5" />}
      cancelPath="/hr/employee-assets"
      loading={createAsset.isPending}
      onSave={() => form.submit()}
      maxWidth="max-w-7xl"
    >
      <EmployeeAssetForm
        form={form}
        onFinish={handleSubmit}
        loading={createAsset.isPending}
      />
    </FormPageLayout>
  );
}
