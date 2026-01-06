'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form } from 'antd';
import { ClockIcon } from '@heroicons/react/24/outline';
import { FormPageLayout } from '@/components/patterns';
import { ShiftForm } from '@/components/hr';
import { useCreateShift } from '@/lib/api/hooks/useHR';
import type { CreateShiftDto } from '@/lib/api/services/hr.types';

export default function NewShiftPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createShift = useCreateShift();

  const handleSubmit = async (values: any) => {
    try {
      const data: CreateShiftDto = {
        name: values.name,
        code: values.code,
        description: values.description,
        shiftType: values.shiftType || 0,
        startTime: values.startTime?.format('HH:mm:ss'),
        endTime: values.endTime?.format('HH:mm:ss'),
        breakStartTime: values.breakStartTime?.format('HH:mm:ss'),
        breakEndTime: values.breakEndTime?.format('HH:mm:ss'),
        breakDurationMinutes: values.breakDurationMinutes || 0,
        nightShiftAllowancePercentage: values.nightShiftAllowancePercentage,
        gracePeriodMinutes: values.gracePeriodMinutes,
        earlyDepartureThresholdMinutes: values.earlyDepartureThresholdMinutes,
        overtimeThresholdMinutes: values.overtimeThresholdMinutes,
        isFlexible: values.isFlexible ?? false,
        flexibleStartTime: values.flexibleStartTime?.format('HH:mm:ss'),
        flexibleEndTime: values.flexibleEndTime?.format('HH:mm:ss'),
      };

      await createShift.mutateAsync(data);
      router.push('/hr/shifts');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <FormPageLayout
      title="Yeni Vardiya"
      subtitle="Yeni bir vardiya tanımlayın"
      icon={<ClockIcon className="w-5 h-5" />}
      cancelPath="/hr/shifts"
      loading={createShift.isPending}
      onSave={() => form.submit()}
      maxWidth="max-w-5xl"
    >
      <ShiftForm
        form={form}
        onFinish={handleSubmit}
        loading={createShift.isPending}
      />
    </FormPageLayout>
  );
}
