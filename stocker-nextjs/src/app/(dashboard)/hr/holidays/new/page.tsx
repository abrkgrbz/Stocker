'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form } from 'antd';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { FormPageLayout } from '@/components/patterns';
import { HolidayForm } from '@/components/hr';
import { useCreateHoliday } from '@/lib/api/hooks/useHR';
import type { CreateHolidayDto } from '@/lib/api/services/hr.types';

export default function NewHolidayPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createHoliday = useCreateHoliday();

  const handleSubmit = async (values: any) => {
    try {
      const data: CreateHolidayDto = {
        name: values.name,
        date: values.date?.format('YYYY-MM-DD'),
        description: values.description,
        isRecurring: values.isRecurring ?? false,
        holidayType: values.holidayType,
        isHalfDay: values.isHalfDay ?? false,
        isNational: values.isNational ?? true,
        affectedRegions: values.affectedRegions,
      };

      await createHoliday.mutateAsync(data);
      router.push('/hr/holidays');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <FormPageLayout
      title="Yeni Tatil Günü"
      subtitle="Yeni bir tatil günü ekleyin"
      icon={<CalendarIcon className="w-5 h-5" />}
      cancelPath="/hr/holidays"
      loading={createHoliday.isPending}
      onSave={() => form.submit()}
      maxWidth="max-w-5xl"
    >
      <HolidayForm
        form={form}
        onFinish={handleSubmit}
        loading={createHoliday.isPending}
      />
    </FormPageLayout>
  );
}
