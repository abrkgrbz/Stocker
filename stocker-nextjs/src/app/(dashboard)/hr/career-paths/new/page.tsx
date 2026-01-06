'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form } from 'antd';
import { RocketLaunchIcon } from '@heroicons/react/24/outline';
import { FormPageLayout } from '@/components/patterns';
import { CareerPathForm } from '@/components/hr/career-paths';
import { useCreateCareerPath } from '@/lib/api/hooks/useHR';

export default function NewCareerPathPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createCareerPath = useCreateCareerPath();

  const handleSubmit = async (values: any) => {
    try {
      const data = {
        ...values,
        startDate: values.startDate?.toISOString(),
        targetDate: values.targetDate?.toISOString(),
      };
      await createCareerPath.mutateAsync(data);
      router.push('/hr/career-paths');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <FormPageLayout
      title="Yeni Kariyer Plani"
      subtitle="Calisan icin kariyer plani olusturun"
      icon={<RocketLaunchIcon className="w-5 h-5" />}
      cancelPath="/hr/career-paths"
      loading={createCareerPath.isPending}
      onSave={() => form.submit()}
      maxWidth="max-w-7xl"
    >
      <CareerPathForm
        form={form}
        onFinish={handleSubmit}
        loading={createCareerPath.isPending}
      />
    </FormPageLayout>
  );
}
