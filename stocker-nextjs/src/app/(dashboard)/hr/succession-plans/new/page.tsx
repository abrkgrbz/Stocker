'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form } from 'antd';
import { StarIcon } from '@heroicons/react/24/outline';
import { FormPageLayout } from '@/components/patterns';
import { SuccessionPlanForm } from '@/components/hr/succession-plans';
import { useCreateSuccessionPlan } from '@/lib/api/hooks/useHR';

export default function NewSuccessionPlanPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createPlan = useCreateSuccessionPlan();

  const handleSubmit = async (values: any) => {
    try {
      const data = {
        ...values,
        targetDate: values.targetDate?.toISOString(),
        lastReviewDate: values.lastReviewDate?.toISOString(),
        nextReviewDate: values.nextReviewDate?.toISOString(),
      };
      await createPlan.mutateAsync(data);
      router.push('/hr/succession-plans');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <FormPageLayout
      title="Yeni Yedekleme Plani"
      subtitle="Kritik pozisyon icin yedekleme plani olusturun"
      icon={<StarIcon className="w-5 h-5" />}
      cancelPath="/hr/succession-plans"
      loading={createPlan.isPending}
      onSave={() => form.submit()}
      maxWidth="max-w-7xl"
    >
      <SuccessionPlanForm
        form={form}
        onFinish={handleSubmit}
        loading={createPlan.isPending}
      />
    </FormPageLayout>
  );
}
