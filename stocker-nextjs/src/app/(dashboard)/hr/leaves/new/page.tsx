'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Form } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, CalendarOutlined } from '@ant-design/icons';
import { LeaveForm } from '@/components/hr';
import { useCreateLeave } from '@/lib/api/hooks/useHR';
import type { CreateLeaveDto } from '@/lib/api/services/hr.types';

export default function NewLeavePage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createLeave = useCreateLeave();

  const handleSubmit = async (values: any) => {
    try {
      const data: CreateLeaveDto = {
        employeeId: values.employeeId,
        leaveTypeId: values.leaveTypeId,
        startDate: values.dateRange[0]?.format('YYYY-MM-DD'),
        endDate: values.dateRange[1]?.format('YYYY-MM-DD'),
        reason: values.reason,
      };

      await createLeave.mutateAsync(data);
      router.push('/hr/leaves');
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
                <CalendarOutlined className="mr-2" />
                Yeni İzin Talebi
              </h1>
              <p className="text-sm text-gray-400 m-0">Yeni bir izin talebi oluşturun</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/hr/leaves')}>Vazgeç</Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={createLeave.isPending}
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
        <LeaveForm
          form={form}
          onFinish={handleSubmit}
          loading={createLeave.isPending}
        />
      </div>
    </div>
  );
}
