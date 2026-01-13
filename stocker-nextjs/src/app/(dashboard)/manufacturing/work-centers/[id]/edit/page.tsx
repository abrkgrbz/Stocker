'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Space, Form, Alert, Tag } from 'antd';
import { Spinner } from '@/components/primitives';
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';
import { WorkCenterForm } from '@/components/manufacturing/work-centers';
import { useWorkCenter, useUpdateWorkCenter } from '@/lib/api/hooks/useManufacturing';
import type { UpdateWorkCenterRequest } from '@/lib/api/services/manufacturing.types';

export default function EditWorkCenterPage() {
  const router = useRouter();
  const params = useParams();
  const workCenterId = params.id as string;
  const [form] = Form.useForm();

  const { data: workCenter, isLoading, error } = useWorkCenter(workCenterId);
  const updateWorkCenter = useUpdateWorkCenter();

  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      await updateWorkCenter.mutateAsync({ id: workCenterId, data: values as unknown as UpdateWorkCenterRequest });
      router.push(`/manufacturing/work-centers/${workCenterId}`);
    } catch {
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

  if (error || !workCenter) {
    return (
      <div className="p-8">
        <Alert
          message="İş Merkezi Bulunamadı"
          description="İstenen iş merkezi bulunamadı veya bir hata oluştu."
          type="error"
          showIcon
          action={
            <Button onClick={() => router.push('/manufacturing/work-centers')}>
              İş Merkezlerine Dön
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Glass Effect Sticky Header */}
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(248, 250, 252, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => router.back()}
              type="text"
              className="text-slate-500 hover:text-slate-800"
            />
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-slate-900 m-0">
                    {workCenter.code}
                  </h1>
                  <Tag
                    color={workCenter.isActive ? 'default' : 'warning'}
                    className="ml-2"
                  >
                    {workCenter.isActive ? 'Aktif' : 'Pasif'}
                  </Tag>
                </div>
                <p className="text-sm text-slate-400 m-0">{workCenter.name}</p>
              </div>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push(`/manufacturing/work-centers/${workCenterId}`)}>
              Vazgeç
            </Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              loading={updateWorkCenter.isPending}
              onClick={() => form.submit()}
              className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
            >
              Kaydet
            </Button>
          </Space>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <WorkCenterForm
          form={form}
          initialValues={workCenter}
          onFinish={handleSubmit}
          loading={updateWorkCenter.isPending}
        />
      </div>
    </div>
  );
}
