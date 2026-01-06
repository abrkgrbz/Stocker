'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form } from 'antd';
import { CursorArrowRaysIcon } from '@heroicons/react/24/outline';
import { FormPageLayout } from '@/components/patterns';
import { GoalForm } from '@/components/hr';
import { useCreatePerformanceGoal } from '@/lib/api/hooks/useHR';
import type { CreatePerformanceGoalDto } from '@/lib/api/services/hr.types';

export default function NewGoalPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createGoal = useCreatePerformanceGoal();

  const handleSubmit = async (values: any) => {
    try {
      const data: CreatePerformanceGoalDto = {
        employeeId: values.employeeId,
        title: values.title,
        description: values.description,
        category: values.category,
        startDate: values.startDate?.format('YYYY-MM-DD'),
        targetDate: values.targetDate?.format('YYYY-MM-DD'),
        weight: values.weight || 1,
        metrics: values.metrics,
        targetValue: values.targetValue,
      };

      await createGoal.mutateAsync(data);
      router.push('/hr/goals');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <FormPageLayout
      title="Yeni Hedef"
      subtitle="Yeni bir performans hedefi olusturun"
      icon={<CursorArrowRaysIcon className="w-5 h-5" />}
      cancelPath="/hr/goals"
      loading={createGoal.isPending}
      onSave={() => form.submit()}
    >
      <GoalForm
        form={form}
        onFinish={handleSubmit}
        loading={createGoal.isPending}
      />
    </FormPageLayout>
  );
}
