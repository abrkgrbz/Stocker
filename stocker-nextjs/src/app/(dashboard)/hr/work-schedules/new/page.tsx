'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Form, Space } from 'antd';
import {
  ArrowLeftIcon,
  CalendarIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { WorkScheduleForm } from '@/components/hr/work-schedules';
import { useCreateWorkSchedule } from '@/lib/api/hooks/useHR';
import type { CreateWorkScheduleDto } from '@/lib/api/services/hr.types';

export default function NewWorkSchedulePage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createSchedule = useCreateWorkSchedule();

  const handleSubmit = async (values: any) => {
    try {
      const data: CreateWorkScheduleDto = {
        employeeId: values.employeeId,
        shiftId: values.shiftId,
        date: values.date.format('YYYY-MM-DD'),
        isWorkDay: values.isWorkDay ?? true,
        customStartTime: values.customStartTime?.format('HH:mm:ss'),
        customEndTime: values.customEndTime?.format('HH:mm:ss'),
        notes: values.notes,
      };

      await createSchedule.mutateAsync(data);
      router.push('/hr/work-schedules');
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
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => router.push('/hr/work-schedules')}
              type="text"
              className="text-gray-500 hover:text-gray-800"
            />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0">
                <CalendarIcon className="w-4 h-4" className="mr-2" />
                Yeni Çalışma Programı
              </h1>
              <p className="text-sm text-gray-400 m-0">Çalışan için program oluşturun</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/hr/work-schedules')}>Vazgeç</Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              loading={createSchedule.isPending}
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
        <WorkScheduleForm form={form} onFinish={handleSubmit} loading={createSchedule.isPending} />
      </div>
    </div>
  );
}
