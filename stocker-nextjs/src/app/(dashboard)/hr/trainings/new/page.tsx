'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form } from 'antd';
import { BookOpenIcon } from '@heroicons/react/24/outline';
import { FormPageLayout } from '@/components/patterns';
import { TrainingForm } from '@/components/hr';
import { useCreateTraining } from '@/lib/api/hooks/useHR';
import type { CreateTrainingDto } from '@/lib/api/services/hr.types';

export default function NewTrainingPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createTraining = useCreateTraining();

  const handleSubmit = async (values: any) => {
    try {
      const data: CreateTrainingDto = {
        code: values.code || `TRN-${Date.now()}`,
        title: values.title,
        description: values.description,
        trainingType: values.trainingType,
        provider: values.provider,
        instructor: values.instructor,
        startDate: values.dateRange?.[0]?.format('YYYY-MM-DD'),
        endDate: values.dateRange?.[1]?.format('YYYY-MM-DD'),
        location: values.location,
        isOnline: values.isOnline ?? false,
        onlineUrl: values.onlineUrl,
        durationHours: values.durationHours || 0,
        maxParticipants: values.maxParticipants,
        cost: values.cost,
        currency: values.currency,
        isMandatory: values.isMandatory ?? false,
        hasCertification: values.hasCertification ?? false,
        certificationValidityMonths: values.certificationValidityMonths,
        passingScore: values.passingScore,
        prerequisites: values.prerequisites,
        materials: values.materials,
      };

      await createTraining.mutateAsync(data);
      router.push('/hr/trainings');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <FormPageLayout
      title="Yeni Egitim"
      subtitle="Yeni bir egitim programi olusturun"
      icon={<BookOpenIcon className="w-5 h-5" />}
      cancelPath="/hr/trainings"
      loading={createTraining.isPending}
      onSave={() => form.submit()}
    >
      <TrainingForm
        form={form}
        onFinish={handleSubmit}
        loading={createTraining.isPending}
      />
    </FormPageLayout>
  );
}
