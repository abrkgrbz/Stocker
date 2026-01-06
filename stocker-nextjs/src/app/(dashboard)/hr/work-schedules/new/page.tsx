'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form } from 'antd';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { FormPageLayout } from '@/components/patterns';
import { WorkScheduleForm } from '@/components/hr/work-schedules';
import { useCreateWorkSchedule } from '@/lib/api/hooks/useHR';
import type { CreateWorkScheduleDto } from '@/lib/api/services/hr.types';

export default function NewWorkSchedulePage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createSchedule = useCreateWorkSchedule();

  const handleSubmit = async (values: any) => {
    try {
      const data: CreateWorkScheduleDto = {
        employeeId: values.employeeId,
        shiftId: values.shiftId,
        date: values.date.format('YYYY-MM-DD'),
        isWorkDay: values.isWorkDay ?? true,
        customStartTime: values.customStartTime?.format('HH:mm:ss'),
        customEndTime: values.customEndTime?.format('HH:mm:ss'),
        notes: values.notes,
      };

      await createSchedule.mutateAsync(data);
      router.push('/hr/work-schedules');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <FormPageLayout
      title="Yeni Çalışma Programı"
      subtitle="Çalışan için program oluşturun"
      icon={<CalendarIcon className="w-5 h-5" />}
      cancelPath="/hr/work-schedules"
      loading={createSchedule.isPending}
      onSave={() => form.submit()}
      maxWidth="max-w-5xl"
    >
      <WorkScheduleForm
        form={form}
        onFinish={handleSubmit}
        loading={createSchedule.isPending}
      />
    </FormPageLayout>
  );
}
