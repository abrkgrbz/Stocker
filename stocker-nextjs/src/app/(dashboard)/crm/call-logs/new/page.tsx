'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form } from 'antd';
import { CrmFormPageLayout } from '@/components/crm/shared';
import { CallLogForm } from '@/components/crm/call-logs';
import { useCreateCallLog } from '@/lib/api/hooks/useCRM';
import dayjs from 'dayjs';

export default function NewCallLogPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createCallLog = useCreateCallLog();

  const handleSubmit = async (values: any) => {
    try {
      const payload = {
        ...values,
        startTime: values.startTime ? dayjs(values.startTime).toISOString() : undefined,
      };
      await createCallLog.mutateAsync(payload);
      router.push('/crm/call-logs');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <CrmFormPageLayout
      title="Yeni Arama Kaydı"
      subtitle="Yeni arama kaydı oluşturun"
      cancelPath="/crm/call-logs"
      loading={createCallLog.isPending}
      onSave={() => form.submit()}
    >
      <CallLogForm
        form={form}
        onFinish={handleSubmit}
        loading={createCallLog.isPending}
      />
    </CrmFormPageLayout>
  );
}
