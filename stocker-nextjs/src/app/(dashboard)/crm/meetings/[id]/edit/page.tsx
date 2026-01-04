'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Form, Empty } from 'antd';
import { Spinner } from '@/components/primitives';
import { CrmFormPageLayout } from '@/components/crm/shared';
import { MeetingForm } from '@/components/crm/meetings';
import { useMeeting, useUpdateMeeting } from '@/lib/api/hooks/useCRM';
import dayjs from 'dayjs';

export default function EditMeetingPage() {
  const router = useRouter();
  const params = useParams();
  const meetingId = params.id as string;
  const [form] = Form.useForm();

  const { data: meeting, isLoading } = useMeeting(meetingId);
  const updateMeeting = useUpdateMeeting();

  const handleSubmit = async (values: any) => {
    try {
      const payload = {
        id: meetingId,
        ...values,
        startTime: values.startTime ? dayjs(values.startTime).toISOString() : undefined,
        endTime: values.endTime ? dayjs(values.endTime).toISOString() : undefined,
      };
      await updateMeeting.mutateAsync({ id: meetingId, data: payload });
      router.push(`/crm/meetings/${meetingId}`);
    } catch (error) {
      // Error handled by hook
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Empty description="Toplantı bulunamadı" />
      </div>
    );
  }

  // Transform meeting data for form - Dayjs objects for DatePicker components
  const initialValues = {
    ...meeting,
    startTime: meeting.startTime ? dayjs(meeting.startTime) : undefined,
    endTime: meeting.endTime ? dayjs(meeting.endTime) : undefined,
  } as any; // Form values use Dayjs for DatePicker

  return (
    <CrmFormPageLayout
      title="Toplantı Düzenle"
      subtitle={meeting.title}
      cancelPath={`/crm/meetings/${meetingId}`}
      loading={updateMeeting.isPending}
      onSave={() => form.submit()}
    >
      <MeetingForm
        form={form}
        initialValues={initialValues}
        onFinish={handleSubmit}
        loading={updateMeeting.isPending}
      />
    </CrmFormPageLayout>
  );
}
