'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Form } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { ShiftForm } from '@/components/hr';
import { useCreateShift } from '@/lib/api/hooks/useHR';
import type { CreateShiftDto } from '@/lib/api/services/hr.types';

export default function NewShiftPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createShift = useCreateShift();

  const handleSubmit = async (values: any) => {
    try {
      const data: CreateShiftDto = {
        name: values.name,
        code: values.code,
        description: values.description,
        startTime: values.startTime?.format('HH:mm:ss'),
        endTime: values.endTime?.format('HH:mm:ss'),
        breakDurationMinutes: values.breakDurationMinutes,
        isActive: values.isActive ?? true,
      };

      await createShift.mutateAsync(data);
      router.push('/hr/shifts');
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
                <ClockCircleOutlined className="mr-2" />
                Yeni Vardiya
              </h1>
              <p className="text-sm text-gray-400 m-0">Yeni bir vardiya tanımlayın</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/hr/shifts')}>Vazgeç</Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={createShift.isPending}
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
        <ShiftForm
          form={form}
          onFinish={handleSubmit}
          loading={createShift.isPending}
        />
      </div>
    </div>
  );
}
