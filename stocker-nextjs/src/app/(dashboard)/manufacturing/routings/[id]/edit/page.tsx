'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Space, Form, Alert, Tag } from 'antd';
import { Spinner } from '@/components/primitives';
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';
import { RoutingForm } from '@/components/manufacturing/routings';
import { useRouting, useUpdateRouting } from '@/lib/api/hooks/useManufacturing';
import type { UpdateRoutingRequest, RoutingStatus } from '@/lib/api/services/manufacturing.types';

const statusLabels: Record<RoutingStatus, string> = {
  Draft: 'Taslak',
  Approved: 'Onaylı',
  Active: 'Aktif',
  Obsolete: 'Geçersiz',
};

export default function EditRoutingPage() {
  const router = useRouter();
  const params = useParams();
  const routingId = params.id as string;
  const [form] = Form.useForm();

  const { data: routing, isLoading, error } = useRouting(routingId);
  const updateRouting = useUpdateRouting();

  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      await updateRouting.mutateAsync({ id: routingId, data: values as unknown as UpdateRoutingRequest });
      router.push(`/manufacturing/routings/${routingId}`);
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

  if (error || !routing) {
    return (
      <div className="p-8">
        <Alert
          message="Rota Bulunamadı"
          description="İstenen rota bulunamadı veya bir hata oluştu."
          type="error"
          showIcon
          action={
            <Button onClick={() => router.push('/manufacturing/routings')}>
              Rotalara Dön
            </Button>
          }
        />
      </div>
    );
  }

  // Can't edit active or obsolete routings
  if (routing.status === 'Active' || routing.status === 'Obsolete') {
    return (
      <div className="p-8">
        <Alert
          message="Düzenleme Yapılamaz"
          description="Aktif veya geçersiz rotalar düzenlenemez."
          type="warning"
          showIcon
          action={
            <Button onClick={() => router.push(`/manufacturing/routings/${routingId}`)}>
              Rota Detayına Dön
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
                    {routing.routingNumber}
                  </h1>
                  <Tag color="default" className="ml-2">
                    {statusLabels[routing.status]}
                  </Tag>
                </div>
                <p className="text-sm text-slate-400 m-0">{routing.productName}</p>
              </div>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push(`/manufacturing/routings/${routingId}`)}>
              Vazgeç
            </Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              loading={updateRouting.isPending}
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
        <RoutingForm
          form={form}
          initialValues={routing}
          onFinish={handleSubmit}
          loading={updateRouting.isPending}
        />
      </div>
    </div>
  );
}
