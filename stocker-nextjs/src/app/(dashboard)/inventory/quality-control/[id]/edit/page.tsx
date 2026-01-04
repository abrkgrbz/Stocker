'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Space, Form, Spin, Alert, Tag } from 'antd';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  CheckIcon,
  ClockIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import QualityControlForm from '@/components/inventory/quality-control/QualityControlForm';
import { useQualityControl, useUpdateQualityControl } from '@/lib/api/hooks/useInventory';
import type { UpdateQualityControlDto } from '@/lib/api/services/inventory.types';

export default function EditQualityControlPage() {
  const router = useRouter();
  const params = useParams();
  const qcId = Number(params.id);
  const [form] = Form.useForm();

  const { data: qc, isLoading, error } = useQualityControl(qcId);
  const updateQC = useUpdateQualityControl();

  const handleSubmit = async (values: UpdateQualityControlDto) => {
    try {
      await updateQC.mutateAsync({ id: qcId, dto: values });
      router.push('/inventory/quality-control');
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

  if (error || !qc) {
    return (
      <div className="p-8">
        <Alert
          message="Kalite Kontrol Bulunamadı"
          description="İstenen kalite kontrol kaydı bulunamadı veya bir hata oluştu."
          type="error"
          showIcon
          action={
            <Button onClick={() => router.push('/inventory/quality-control')}>
              Kalite Kontrole Dön
            </Button>
          }
        />
      </div>
    );
  }

  const getStatusTag = () => {
    switch (qc.status) {
      case 0: // Pending
        return <Tag icon={<ClockIcon className="w-4 h-4" />} color="default">Beklemede</Tag>;
      case 1: // InProgress
        return <Tag icon={<ClockIcon className="w-4 h-4" />} color="processing">Devam Ediyor</Tag>;
      case 2: // Completed
        return <Tag icon={<CheckCircleIcon className="w-4 h-4" />} color="success">Tamamlandı</Tag>;
      case 3: // Cancelled
        return <Tag icon={<XCircleIcon className="w-4 h-4" />} color="default">İptal Edildi</Tag>;
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
                    {qc.qcNumber}
                  </h1>
                  {getStatusTag()}
                </div>
                <p className="text-sm text-gray-400 m-0">{qc.productName}</p>
              </div>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/inventory/quality-control')}>
              Vazgeç
            </Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              loading={updateQC.isPending}
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
        <QualityControlForm
          form={form}
          initialValues={qc}
          onFinish={handleSubmit}
          loading={updateQC.isPending}
        />
      </div>
    </div>
  );
}
