'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Space, Form, Alert, Tag } from 'antd';
import { Spinner } from '@/components/primitives';
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';
import { MpsForm } from '@/components/manufacturing/mps';
import { useMasterProductionSchedule, useUpdateMasterProductionSchedule } from '@/lib/api/hooks/useManufacturing';
import type { UpdateMasterProductionScheduleRequest, MpsStatus } from '@/lib/api/services/manufacturing.types';

const statusLabels: Record<MpsStatus, string> = {
  Draft: 'Taslak',
  Approved: 'Onaylı',
  Active: 'Aktif',
  Completed: 'Tamamlandı',
};

export default function EditMpsPage() {
  const router = useRouter();
  const params = useParams();
  const mpsId = params.id as string;
  const [form] = Form.useForm();

  const { data: mps, isLoading, error } = useMasterProductionSchedule(mpsId);
  const updateMps = useUpdateMasterProductionSchedule();

  const handleSubmit = async (values: UpdateMasterProductionScheduleRequest) => {
    try {
      await updateMps.mutateAsync({ id: mpsId, data: values });
      router.push(`/manufacturing/master-production-schedules/${mpsId}`);
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

  if (error || !mps) {
    return (
      <div className="p-8">
        <Alert
          message="Plan Bulunamadı"
          description="İstenen ana üretim planı bulunamadı veya bir hata oluştu."
          type="error"
          showIcon
          action={
            <Button onClick={() => router.push('/manufacturing/master-production-schedules')}>
              Planlara Dön
            </Button>
          }
        />
      </div>
    );
  }

  // Can't edit completed plans
  if (mps.status === 'Completed') {
    return (
      <div className="p-8">
        <Alert
          message="Düzenleme Yapılamaz"
          description="Tamamlanmış planlar düzenlenemez."
          type="warning"
          showIcon
          action={
            <Button onClick={() => router.push(`/manufacturing/master-production-schedules/${mpsId}`)}>
              Plan Detayına Dön
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
                    {mps.name}
                  </h1>
                  <Tag color="default" className="ml-2">
                    {statusLabels[mps.status]}
                  </Tag>
                </div>
                <p className="text-sm text-slate-400 m-0">Planı düzenle</p>
              </div>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push(`/manufacturing/master-production-schedules/${mpsId}`)}>
              Vazgeç
            </Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              loading={updateMps.isPending}
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
          initialValues={mps}
          onFinish={handleSubmit}
          loading={updateMps.isPending}
        />
      </div>
    </div>
  );
}
