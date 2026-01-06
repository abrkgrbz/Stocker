'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form } from 'antd';
import { ClockIcon } from '@heroicons/react/24/outline';
import { FormPageLayout } from '@/components/patterns';
import { AttendanceCheckInForm } from '@/components/hr';
import { useCheckIn } from '@/lib/api/hooks/useHR';
import type { CheckInDto } from '@/lib/api/services/hr.types';

export default function NewAttendancePage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const checkIn = useCheckIn();

  const handleSubmit = async (values: any) => {
    try {
      const data: CheckInDto = {
        employeeId: values.employeeId,
        checkInTime: values.checkInTime?.format('HH:mm:ss'),
      };

      await checkIn.mutateAsync(data);
      router.push('/hr/attendance');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <FormPageLayout
      title="Manuel Giriş Kaydı"
      subtitle="Çalışan için manuel giriş kaydı oluşturun"
      icon={<ClockIcon className="w-5 h-5" />}
      cancelPath="/hr/attendance"
      loading={checkIn.isPending}
      onSave={() => form.submit()}
      maxWidth="max-w-5xl"
    >
      <AttendanceCheckInForm
        form={form}
        onFinish={handleSubmit}
        loading={checkIn.isPending}
      />
    </FormPageLayout>
  );
}
