'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form } from 'antd';
import { CrmFormPageLayout } from '@/components/crm/shared';
import { MeetingForm } from '@/components/crm/meetings';
import { useCreateMeeting } from '@/lib/api/hooks/useCRM';
import dayjs from 'dayjs';

export default function NewMeetingPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createMeeting = useCreateMeeting();

  const handleSubmit = async (values: any) => {
    try {
      const payload = {
        ...values,
        startTime: values.startTime ? dayjs(values.startTime).toISOString() : undefined,
        endTime: values.endTime ? dayjs(values.endTime).toISOString() : undefined,
        organizerId: 1, // TODO: Get from auth context
      };
      await createMeeting.mutateAsync(payload);
      router.push('/crm/meetings');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <CrmFormPageLayout
      title="Yeni Toplantı"
      subtitle="Yeni toplantı oluşturun"
      cancelPath="/crm/meetings"
      loading={createMeeting.isPending}
      onSave={() => form.submit()}
    >
      <MeetingForm
        form={form}
        onFinish={handleSubmit}
        loading={createMeeting.isPending}
      />
    </CrmFormPageLayout>
  );
}
