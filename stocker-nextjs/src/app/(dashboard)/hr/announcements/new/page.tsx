'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Form } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, NotificationOutlined } from '@ant-design/icons';
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
        authorId: 0, // Will be set by backend from current user
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
    <div className="min-h-screen bg-white">
      {/* Glass Effect Sticky Header */}
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.back()}
              type="text"
              className="text-gray-500 hover:text-gray-800"
            />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0">
                <NotificationOutlined className="mr-2" />
                Yeni Duyuru
              </h1>
              <p className="text-sm text-gray-400 m-0">Yeni bir duyuru oluşturun</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/hr/announcements')}>Vazgeç</Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={createAnnouncement.isPending}
              onClick={() => form.submit()}
              style={{
                background: '#1a1a1a',
                borderColor: '#1a1a1a',
                color: 'white',
              }}
            >
              Kaydet
            </Button>
          </Space>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <AnnouncementForm
          form={form}
          onFinish={handleSubmit}
          loading={createAnnouncement.isPending}
        />
      </div>
    </div>
  );
}
