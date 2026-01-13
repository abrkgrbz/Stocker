'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Form } from 'antd';
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';
import { MpsForm } from '@/components/manufacturing/mps';
import { useCreateMasterProductionSchedule } from '@/lib/api/hooks/useManufacturing';
import type { CreateMasterProductionScheduleRequest } from '@/lib/api/services/manufacturing.types';

export default function NewMpsPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createMps = useCreateMasterProductionSchedule();

  const handleSubmit = async (values: CreateMasterProductionScheduleRequest) => {
    try {
      const result = await createMps.mutateAsync(values);
      router.push(`/manufacturing/master-production-schedules/${result.id}`);
    } catch {
      // Error handled by hook
    }
  };

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
            <div>
              <h1 className="text-xl font-semibold text-slate-900 m-0">
                Yeni Ana Üretim Planı
              </h1>
              <p className="text-sm text-slate-400 m-0">Plan bilgilerini girin</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/manufacturing/master-production-schedules')}>
              Vazgeç
            </Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              loading={createMps.isPending}
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
        <MpsForm
          form={form}
          onFinish={handleSubmit}
          loading={createMps.isPending}
        />
      </div>
    </div>
  );
}
