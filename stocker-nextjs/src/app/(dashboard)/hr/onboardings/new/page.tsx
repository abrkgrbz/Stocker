'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form } from 'antd';
import { RocketLaunchIcon } from '@heroicons/react/24/outline';
import { FormPageLayout } from '@/components/patterns';
import { OnboardingForm } from '@/components/hr/onboardings';
import { useCreateOnboarding } from '@/lib/api/hooks/useHR';

export default function NewOnboardingPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createOnboarding = useCreateOnboarding();

  const handleSubmit = async (values: any) => {
    try {
      const data = {
        ...values,
        startDate: values.startDate?.toISOString(),
        expectedEndDate: values.expectedEndDate?.toISOString(),
        firstDaySchedule: values.firstDaySchedule?.toISOString(),
        firstWeekCheckIn: values.firstWeekCheckIn?.toISOString(),
        thirtyDayCheckIn: values.thirtyDayCheckIn?.toISOString(),
        sixtyDayCheckIn: values.sixtyDayCheckIn?.toISOString(),
        ninetyDayCheckIn: values.ninetyDayCheckIn?.toISOString(),
      };
      await createOnboarding.mutateAsync(data);
      router.push('/hr/onboardings');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <FormPageLayout
      title="Yeni Onboarding"
      subtitle="Yeni calisan oryantasyonu olusturun"
      icon={<RocketLaunchIcon className="w-5 h-5" />}
      cancelPath="/hr/onboardings"
      loading={createOnboarding.isPending}
      onSave={() => form.submit()}
      maxWidth="max-w-7xl"
    >
      <OnboardingForm
        form={form}
        onFinish={handleSubmit}
        loading={createOnboarding.isPending}
      />
    </FormPageLayout>
  );
}
