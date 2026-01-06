'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form } from 'antd';
import { ClockIcon } from '@heroicons/react/24/outline';
import { FormPageLayout } from '@/components/patterns';
import { OvertimeForm } from '@/components/hr';
import { useCreateOvertime } from '@/lib/api/hooks/useHR';
import type { CreateOvertimeDto } from '@/lib/api/services/hr.types';

export default function NewOvertimePage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createOvertime = useCreateOvertime();

  const handleSubmit = async (values: CreateOvertimeDto) => {
    try {
      await createOvertime.mutateAsync(values);
      router.push('/hr/overtimes');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <FormPageLayout
      title="Yeni Fazla Mesai Talebi"
      subtitle="Yeni bir fazla mesai talebi oluşturun"
      icon={<ClockIcon className="w-5 h-5" />}
      cancelPath="/hr/overtimes"
      loading={createOvertime.isPending}
      onSave={() => form.submit()}
      maxWidth="max-w-5xl"
    >
      <OvertimeForm
        form={form}
        onFinish={handleSubmit}
        loading={createOvertime.isPending}
      />
    </FormPageLayout>
  );
}
