'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Form } from 'antd';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { FormPageLayout } from '@/components/patterns';
import { WorkScheduleForm } from '@/components/hr/work-schedules';
import { useWorkSchedule, useUpdateWorkSchedule } from '@/lib/api/hooks/useHR';
import type { UpdateWorkScheduleDto } from '@/lib/api/services/hr.types';

export default function EditWorkSchedulePage() {
  const params = useParams();
  const router = useRouter();
  const [form] = Form.useForm();
  const id = Number(params.id);

  // API Hooks
  const { data: schedule, isLoading, error } = useWorkSchedule(id);
  const updateSchedule = useUpdateWorkSchedule();

  const handleSubmit = async (values: any) => {
    try {
      const data: UpdateWorkScheduleDto = {
        shiftId: values.shiftId,
        isWorkDay: values.isWorkDay ?? true,
        customStartTime: values.customStartTime?.format('HH:mm:ss'),
        customEndTime: values.customEndTime?.format('HH:mm:ss'),
        notes: values.notes,
      };

      await updateSchedule.mutateAsync({ id, data });
      router.push(`/hr/work-schedules/${id}`);
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <FormPageLayout
      title="Calisma Programi Duzenle"
      subtitle={schedule?.employeeName || ''}
      icon={<CalendarIcon className="w-5 h-5" />}
      cancelPath={`/hr/work-schedules/${id}`}
      loading={updateSchedule.isPending}
      onSave={() => form.submit()}
      isDataLoading={isLoading}
      dataError={!!error || (!isLoading && !schedule)}
      errorMessage="Calisma Programi Bulunamadi"
      errorDescription="Istenen calisma programi bulunamadi veya bir hata olustu."
      saveButtonText="Guncelle"
      maxWidth="max-w-7xl"
    >
      <WorkScheduleForm
        form={form}
        initialValues={schedule}
        onFinish={handleSubmit}
        loading={updateSchedule.isPending}
        isEdit
      />
    </FormPageLayout>
  );
}
