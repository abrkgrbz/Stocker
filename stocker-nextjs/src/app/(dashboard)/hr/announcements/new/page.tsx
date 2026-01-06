'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form } from 'antd';
import { BellIcon } from '@heroicons/react/24/outline';
import { FormPageLayout } from '@/components/patterns';
import { AnnouncementForm } from '@/components/hr';
import { useCreateAnnouncement } from '@/lib/api/hooks/useHR';
import type { CreateAnnouncementDto } from '@/lib/api/services/hr.types';

export default function NewAnnouncementPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createAnnouncement = useCreateAnnouncement();

  const handleSubmit = async (values: any) => {
    try {
      const data: CreateAnnouncementDto = {
        title: values.title,
        content: values.content,
        summary: values.summary,
        announcementType: values.announcementType || 'General',
        priority: values.priority || 'Normal',
        authorId: values.authorId,
        publishDate: values.publishDate?.format('YYYY-MM-DD') || new Date().toISOString().split('T')[0],
        expiryDate: values.expiryDate?.format('YYYY-MM-DD'),
        isPinned: values.isPinned ?? false,
        requiresAcknowledgment: values.requiresAcknowledgment ?? false,
        targetDepartmentId: values.targetDepartmentId,
      };

      await createAnnouncement.mutateAsync(data);
      router.push('/hr/announcements');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <FormPageLayout
      title="Yeni Duyuru"
      subtitle="Yeni bir duyuru olusturun"
      icon={<BellIcon className="w-5 h-5" />}
      cancelPath="/hr/announcements"
      loading={createAnnouncement.isPending}
      onSave={() => form.submit()}
    >
      <AnnouncementForm
        form={form}
        onFinish={handleSubmit}
        loading={createAnnouncement.isPending}
      />
    </FormPageLayout>
  );
}
