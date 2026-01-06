'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form } from 'antd';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { FormPageLayout } from '@/components/patterns';
import { LeaveForm } from '@/components/hr';
import { useCreateLeave } from '@/lib/api/hooks/useHR';
import type { CreateLeaveDto } from '@/lib/api/services/hr.types';

export default function NewLeavePage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createLeave = useCreateLeave();

  const handleSubmit = async (values: any) => {
    try {
      const data: CreateLeaveDto = {
        employeeId: values.employeeId,
        leaveTypeId: values.leaveTypeId,
        startDate: values.dateRange[0]?.format('YYYY-MM-DD'),
        endDate: values.dateRange[1]?.format('YYYY-MM-DD'),
        isHalfDay: values.isHalfDay ?? false,
        isHalfDayMorning: values.isHalfDayMorning ?? false,
        reason: values.reason,
        contactDuringLeave: values.contactDuringLeave,
        handoverNotes: values.handoverNotes,
        substituteEmployeeId: values.substituteEmployeeId,
      };

      await createLeave.mutateAsync(data);
      router.push('/hr/leaves');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <FormPageLayout
      title="Yeni İzin Talebi"
      subtitle="Yeni bir izin talebi oluşturun"
      icon={<CalendarIcon className="w-5 h-5" />}
      cancelPath="/hr/leaves"
      loading={createLeave.isPending}
      onSave={() => form.submit()}
      maxWidth="max-w-5xl"
    >
      <LeaveForm
        form={form}
        onFinish={handleSubmit}
        loading={createLeave.isPending}
      />
    </FormPageLayout>
  );
}
