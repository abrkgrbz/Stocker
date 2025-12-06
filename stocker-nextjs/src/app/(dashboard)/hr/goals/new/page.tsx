'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Form } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, AimOutlined } from '@ant-design/icons';
import { GoalForm } from '@/components/hr';
import { useCreatePerformanceGoal } from '@/lib/api/hooks/useHR';
import type { CreatePerformanceGoalDto } from '@/lib/api/services/hr.types';

export default function NewGoalPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createGoal = useCreatePerformanceGoal();

  const handleSubmit = async (values: any) => {
    try {
      const data: CreatePerformanceGoalDto = {
        employeeId: values.employeeId,
        title: values.title,
        description: values.description,
        category: values.category,
        startDate: values.startDate?.format('YYYY-MM-DD'),
        targetDate: values.targetDate?.format('YYYY-MM-DD'),
        weight: values.weight || 1,
        metrics: values.metrics,
        targetValue: values.targetValue,
      };

      await createGoal.mutateAsync(data);
      router.push('/hr/goals');
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
                <AimOutlined className="mr-2" />
                Yeni Hedef
              </h1>
              <p className="text-sm text-gray-400 m-0">Yeni bir performans hedefi oluşturun</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/hr/goals')}>Vazgeç</Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={createGoal.isPending}
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
        <GoalForm
          form={form}
          onFinish={handleSubmit}
          loading={createGoal.isPending}
        />
      </div>
    </div>
  );
}
