'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form } from 'antd';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { FormPageLayout } from '@/components/patterns';
import { LeaveTypeForm } from '@/components/hr';
import { useCreateLeaveType } from '@/lib/api/hooks/useHR';
import type { CreateLeaveTypeDto } from '@/lib/api/services/hr.types';

export default function NewLeaveTypePage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createLeaveType = useCreateLeaveType();

  const handleSubmit = async (values: CreateLeaveTypeDto) => {
    try {
      await createLeaveType.mutateAsync(values);
      router.push('/hr/leave-types');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <FormPageLayout
      title="Yeni İzin Türü"
      subtitle="Yeni bir izin türü tanımlayın"
      icon={<DocumentTextIcon className="w-5 h-5" />}
      cancelPath="/hr/leave-types"
      loading={createLeaveType.isPending}
      onSave={() => form.submit()}
      maxWidth="max-w-5xl"
    >
      <LeaveTypeForm
        form={form}
        onFinish={handleSubmit}
        loading={createLeaveType.isPending}
      />
    </FormPageLayout>
  );
}
