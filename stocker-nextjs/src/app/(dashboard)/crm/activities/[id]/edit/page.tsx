'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Form, Empty } from 'antd';
import { Spinner } from '@/components/primitives';
import { CrmFormPageLayout } from '@/components/crm/shared';
import { ActivityForm } from '@/features/activities/components';
import { useActivity, useUpdateActivity } from '@/lib/api/hooks/useCRM';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import dayjs from 'dayjs';

export default function EditActivityPage() {
  const router = useRouter();
  const params = useParams();
  const activityId = params.id as string;
  const [form] = Form.useForm();

  const { data: activity, isLoading } = useActivity(activityId);
  const updateActivity = useUpdateActivity();

  const handleSubmit = async (values: any) => {
    try {
      // Map frontend fields to backend format
      const payload = {
        id: activityId,
        subject: values.title,
        description: values.description || null,
        type: values.type,
        status: values.status,
        priority: values.priority || 2,
        dueDate: values.startTime?.toISOString(),
        duration: values.endTime
          ? Math.round((values.endTime.valueOf() - values.startTime.valueOf()) / 60000)
          : null,
        location: values.location || null,
        leadId: values.leadId ? String(values.leadId) : null,
        customerId: values.customerId ? String(values.customerId) : null,
        contactId: values.contactId ? String(values.contactId) : null,
        opportunityId: values.opportunityId ? String(values.opportunityId) : null,
        dealId: values.dealId ? String(values.dealId) : null,
        notes: values.notes || null,
      };

      await updateActivity.mutateAsync({ id: activityId, data: payload });
      showSuccess('Aktivite başarıyla güncellendi');
      router.push(`/crm/activities/${activityId}`);
    } catch (error: any) {
      showApiError(error, 'Güncelleme başarısız');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Empty description="Aktivite bulunamadı" />
      </div>
    );
  }

  // Transform activity data for form
  const initialValues = {
    title: activity.subject || activity.title,
    description: activity.description,
    type: activity.type,
    status: activity.status,
    priority: activity.priority,
    startTime: activity.startTime ? dayjs(activity.startTime) : null,
    endTime: activity.endTime ? dayjs(activity.endTime) : null,
    location: activity.location,
    leadId: activity.leadId,
    customerId: activity.customerId,
    contactId: activity.contactId,
    opportunityId: activity.opportunityId,
    dealId: activity.dealId,
    notes: activity.notes,
  };

  return (
    <CrmFormPageLayout
      title="Aktivite Düzenle"
      subtitle={activity.subject || activity.title}
      cancelPath={`/crm/activities/${activityId}`}
      loading={updateActivity.isPending}
      onSave={() => form.submit()}
    >
      <ActivityForm
        form={form}
        initialValues={initialValues}
        onFinish={handleSubmit}
        loading={updateActivity.isPending}
      />
    </CrmFormPageLayout>
  );
}
