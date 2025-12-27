'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Space, Form, Spin, Empty } from 'antd';
import {
  ArrowLeftIcon,
  CheckIcon,
  CursorArrowRaysIcon,
} from '@heroicons/react/24/outline';
import { GoalForm } from '@/components/hr';
import { usePerformanceGoal, useUpdatePerformanceGoal } from '@/lib/api/hooks/useHR';
import type { UpdatePerformanceGoalDto } from '@/lib/api/services/hr.types';

export default function EditGoalPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const [form] = Form.useForm();

  const { data: goal, isLoading, error } = usePerformanceGoal(id);
  const updateGoal = useUpdatePerformanceGoal();

  const handleSubmit = async (values: any) => {
    try {
      const data: UpdatePerformanceGoalDto = {
        title: values.title,
        description: values.description,
        category: values.category,
        targetDate: values.targetDate?.format('YYYY-MM-DD'),
        weight: values.weight || 1,
        metrics: values.metrics,
        targetValue: values.targetValue,
      };

      await updateGoal.mutateAsync({ id, data });
      router.push(`/hr/goals/${id}`);
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

  if (error || !goal) {
    return (
      <div className="p-6">
        <Empty description="Hedef bulunamadı" />
        <div className="text-center mt-4">
          <Button onClick={() => router.push('/hr/goals')}>Listeye Dön</Button>
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
              onClick={() => router.back()}
              type="text"
              className="text-gray-500 hover:text-gray-800"
            />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0">
                <CursorArrowRaysIcon className="w-4 h-4" className="mr-2" />
                Hedefi Düzenle
              </h1>
              <p className="text-sm text-gray-400 m-0">{goal.title}</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push(`/hr/goals/${id}`)}>Vazgeç</Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              loading={updateGoal.isPending}
              onClick={() => form.submit()}
              style={{
                background: '#1a1a1a',
                borderColor: '#1a1a1a',
                color: 'white',
              }}
            >
              Güncelle
            </Button>
          </Space>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <GoalForm
          form={form}
          initialValues={goal}
          onFinish={handleSubmit}
          loading={updateGoal.isPending}
        />
      </div>
    </div>
  );
}
