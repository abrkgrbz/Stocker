'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Form, Spin, Empty, Space } from 'antd';
import {
  ArrowLeftIcon,
  CalendarIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { WorkScheduleForm } from '@/components/hr/work-schedules';
import { useWorkSchedule, useUpdateWorkSchedule } from '@/lib/api/hooks/useHR';
import type { UpdateWorkScheduleDto } from '@/lib/api/services/hr.types';

export default function EditWorkSchedulePage() {
  const params = useParams();
  const router = useRouter();
  const [form] = Form.useForm();
  const id = Number(params.id);

  // API Hooks
  const { data: schedule, isLoading, error } = useWorkSchedule(id);
  const updateSchedule = useUpdateWorkSchedule();

  const handleSubmit = async (values: any) => {
    try {
      const data: UpdateWorkScheduleDto = {
        shiftId: values.shiftId,
        isWorkDay: values.isWorkDay ?? true,
        customStartTime: values.customStartTime?.format('HH:mm:ss'),
        customEndTime: values.customEndTime?.format('HH:mm:ss'),
        notes: values.notes,
      };

      await updateSchedule.mutateAsync({ id, data });
      router.push(`/hr/work-schedules/${id}`);
    } catch (error) {
      // Error handled by hook
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !schedule) {
    return (
      <div className="p-6">
        <Empty description="Çalışma programı bulunamadı" />
        <div className="text-center mt-4">
          <Button onClick={() => router.push('/hr/work-schedules')}>Listeye Dön</Button>
        </div>
      </div>
    );
  }

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
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => router.push(`/hr/work-schedules/${id}`)}
              type="text"
              className="text-gray-500 hover:text-gray-800"
            />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0">
                <CalendarIcon className="w-4 h-4 mr-2" />
                Çalışma Programı Düzenle
              </h1>
              <p className="text-sm text-gray-400 m-0">{schedule.employeeName}</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push(`/hr/work-schedules/${id}`)}>Vazgeç</Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              loading={updateSchedule.isPending}
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
        <WorkScheduleForm
          form={form}
          initialValues={schedule}
          onFinish={handleSubmit}
          loading={updateSchedule.isPending}
          isEdit
        />
      </div>
    </div>
  );
}
