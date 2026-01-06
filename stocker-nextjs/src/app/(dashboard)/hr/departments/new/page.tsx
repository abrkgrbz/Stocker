'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form } from 'antd';
import { BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { FormPageLayout } from '@/components/patterns';
import { DepartmentForm } from '@/components/hr';
import { useCreateDepartment } from '@/lib/api/hooks/useHR';
import type { CreateDepartmentDto } from '@/lib/api/services/hr.types';

export default function NewDepartmentPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createDepartment = useCreateDepartment();

  const handleSubmit = async (values: CreateDepartmentDto) => {
    try {
      await createDepartment.mutateAsync(values);
      router.push('/hr/departments');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <FormPageLayout
      title="Yeni Departman"
      subtitle="Yeni bir departman oluşturun"
      icon={<BuildingOfficeIcon className="w-5 h-5" />}
      cancelPath="/hr/departments"
      loading={createDepartment.isPending}
      onSave={() => form.submit()}
      maxWidth="max-w-5xl"
    >
      <DepartmentForm
        form={form}
        onFinish={handleSubmit}
        loading={createDepartment.isPending}
      />
    </FormPageLayout>
  );
}
