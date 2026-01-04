'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Space, Form, Spin, Alert, Tag } from 'antd';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  CheckIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import CycleCountForm from '@/components/inventory/cycle-counts/CycleCountForm';
import { useCycleCount, useUpdateCycleCount } from '@/lib/api/hooks/useInventory';
import type { UpdateCycleCountDto } from '@/lib/api/services/inventory.types';

export default function EditCycleCountPage() {
  const router = useRouter();
  const params = useParams();
  const cycleCountId = Number(params.id);
  const [form] = Form.useForm();

  const { data: cycleCount, isLoading, error } = useCycleCount(cycleCountId);
  const updateCycleCount = useUpdateCycleCount();

  const handleSubmit = async (values: UpdateCycleCountDto) => {
    try {
      await updateCycleCount.mutateAsync({ id: cycleCountId, dto: values });
      router.push('/inventory/cycle-counts');
    } catch (error) {
      // Error handled by hook
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !cycleCount) {
    return (
      <div className="p-8">
        <Alert
          message="Sayım Planı Bulunamadı"
          description="İstenen sayım planı bulunamadı veya bir hata oluştu."
          type="error"
          showIcon
          action={
            <Button onClick={() => router.push('/inventory/cycle-counts')}>
              Sayım Planlarına Dön
            </Button>
          }
        />
      </div>
    );
  }

  const getStatusTag = () => {
    switch (cycleCount.status) {
      case 1: // Planned
        return <Tag icon={<ClockIcon className="w-4 h-4" />} color="blue">Planlandı</Tag>;
      case 2: // InProgress
        return <Tag icon={<ClockIcon className="w-4 h-4" />} color="processing">Devam Ediyor</Tag>;
      case 3: // Completed
        return <Tag icon={<CheckCircleIcon className="w-4 h-4" />} color="success">Tamamlandı</Tag>;
      case 4: // Cancelled
        return <Tag color="default">İptal Edildi</Tag>;
      default:
        return <Tag color="default">Bilinmeyen</Tag>;
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
              onClick={() => router.back()}
              type="text"
              className="text-gray-500 hover:text-gray-800"
            />
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-gray-900 m-0">
                    {cycleCount.planName}
                  </h1>
                  {getStatusTag()}
                </div>
                <p className="text-sm text-gray-400 m-0">{cycleCount.planNumber} - {cycleCount.warehouseName}</p>
              </div>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/inventory/cycle-counts')}>
              Vazgeç
            </Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              loading={updateCycleCount.isPending}
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
        <CycleCountForm
          form={form}
          initialValues={cycleCount}
          onFinish={handleSubmit}
          loading={updateCycleCount.isPending}
        />
      </div>
    </div>
  );
}
