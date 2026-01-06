'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form } from 'antd';
import { TrophyIcon } from '@heroicons/react/24/outline';
import { FormPageLayout } from '@/components/patterns';
import { PerformanceReviewForm } from '@/components/hr';
import { useCreatePerformanceReview } from '@/lib/api/hooks/useHR';
import type { CreatePerformanceReviewDto } from '@/lib/api/services/hr.types';

export default function NewPerformancePage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createReview = useCreatePerformanceReview();

  const handleSubmit = async (values: any) => {
    try {
      const data: CreatePerformanceReviewDto = {
        employeeId: values.employeeId,
        reviewerId: values.reviewerId,
        reviewDate: values.reviewDate?.format('YYYY-MM-DD'),
        reviewPeriod: values.reviewPeriod,
        dueDate: values.dueDate?.format('YYYY-MM-DD'),
        reviewType: values.reviewType || 'Annual',
      };

      await createReview.mutateAsync(data);
      router.push('/hr/performance');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <FormPageLayout
      title="Yeni Performans Degerlendirmesi"
      subtitle="Yeni bir performans degerlendirmesi olusturun"
      icon={<TrophyIcon className="w-5 h-5" />}
      cancelPath="/hr/performance"
      loading={createReview.isPending}
      onSave={() => form.submit()}
    >
      <PerformanceReviewForm
        form={form}
        onFinish={handleSubmit}
        loading={createReview.isPending}
      />
    </FormPageLayout>
  );
}
