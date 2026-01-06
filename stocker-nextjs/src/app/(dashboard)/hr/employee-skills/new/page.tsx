'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form } from 'antd';
import { WrenchIcon } from '@heroicons/react/24/outline';
import { FormPageLayout } from '@/components/patterns';
import { EmployeeSkillForm } from '@/components/hr/employee-skills';
import { useCreateEmployeeSkill } from '@/lib/api/hooks/useHR';

export default function NewEmployeeSkillPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createSkill = useCreateEmployeeSkill();

  const handleSubmit = async (values: any) => {
    try {
      const data = {
        ...values,
        lastUsedDate: values.lastUsedDate?.toISOString(),
        certificationDate: values.certificationDate?.toISOString(),
        certificationExpiry: values.certificationExpiry?.toISOString(),
      };
      await createSkill.mutateAsync(data);
      router.push('/hr/employee-skills');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <FormPageLayout
      title="Yeni Yetkinlik"
      subtitle="Calisana yetkinlik ekleyin"
      icon={<WrenchIcon className="w-5 h-5" />}
      cancelPath="/hr/employee-skills"
      loading={createSkill.isPending}
      onSave={() => form.submit()}
      maxWidth="max-w-7xl"
    >
      <EmployeeSkillForm
        form={form}
        onFinish={handleSubmit}
        loading={createSkill.isPending}
      />
    </FormPageLayout>
  );
}
