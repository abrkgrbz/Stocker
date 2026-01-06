'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Form } from 'antd';
import { CursorArrowRaysIcon } from '@heroicons/react/24/outline';
import { FormPageLayout } from '@/components/patterns';
import { GoalForm } from '@/components/hr';
import { usePerformanceGoal, useUpdatePerformanceGoal } from '@/lib/api/hooks/useHR';
import type { UpdatePerformanceGoalDto } from '@/lib/api/services/hr.types';

export default function EditGoalPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const [form] = Form.useForm();

  const { data: goal, isLoading, error } = usePerformanceGoal(id);
  const updateGoal = useUpdatePerformanceGoal();

  const handleSubmit = async (values: any) => {
    try {
      const data: UpdatePerformanceGoalDto = {
        title: values.title,
        description: values.description,
        category: values.category,
        targetDate: values.targetDate?.format('YYYY-MM-DD'),
        weight: values.weight || 1,
        metrics: values.metrics,
        targetValue: values.targetValue,
      };

      await updateGoal.mutateAsync({ id, data });
      router.push(`/hr/goals/${id}`);
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <FormPageLayout
      title="Hedefi Duzenle"
      subtitle={goal?.title || 'Yukleniyor...'}
      icon={<CursorArrowRaysIcon className="w-5 h-5" />}
      cancelPath={`/hr/goals/${id}`}
      loading={updateGoal.isPending}
      onSave={() => form.submit()}
      saveButtonText="Guncelle"
      isDataLoading={isLoading}
      dataError={!!error || !goal}
      errorMessage="Hedef Bulunamadi"
      errorDescription="Istenen hedef bulunamadi veya bir hata olustu."
    >
      <GoalForm
        form={form}
        initialValues={goal}
        onFinish={handleSubmit}
        loading={updateGoal.isPending}
      />
    </FormPageLayout>
  );
}
