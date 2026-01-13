'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Space, Form, Alert, Tag } from 'antd';
import { Spinner } from '@/components/primitives';
import { ArrowLeftIcon, CheckIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { BomForm } from '@/components/manufacturing/bom';
import { useBillOfMaterial, useUpdateBillOfMaterial } from '@/lib/api/hooks/useManufacturing';
import type { UpdateBillOfMaterialRequest } from '@/lib/api/services/manufacturing.types';

export default function EditBillOfMaterialPage() {
  const router = useRouter();
  const params = useParams();
  const bomId = params.id as string;
  const [form] = Form.useForm();

  const { data: bom, isLoading, error } = useBillOfMaterial(bomId);
  const updateBom = useUpdateBillOfMaterial();

  const handleSubmit = async (values: UpdateBillOfMaterialRequest) => {
    try {
      await updateBom.mutateAsync({ id: bomId, data: values });
      router.push(`/manufacturing/bill-of-materials/${bomId}`);
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

  if (error || !bom) {
    return (
      <div className="p-8">
        <Alert
          message="Reçete Bulunamadı"
          description="İstenen ürün reçetesi bulunamadı veya bir hata oluştu."
          type="error"
          showIcon
          action={
            <Button onClick={() => router.push('/manufacturing/bill-of-materials')}>
              Reçetelere Dön
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
                    {bom.bomNumber}
                  </h1>
                  <Tag
                    icon={bom.status === 'Active' || bom.status === 'Approved' ? <CheckCircleIcon className="w-3 h-3" /> : <ClockIcon className="w-3 h-3" />}
                    color={bom.status === 'Active' ? 'success' : bom.status === 'Approved' ? 'processing' : 'default'}
                    className="ml-2"
                  >
                    {bom.status === 'Draft' ? 'Taslak' : bom.status === 'Approved' ? 'Onaylı' : bom.status === 'Active' ? 'Aktif' : 'Geçersiz'}
                  </Tag>
                </div>
                <p className="text-sm text-slate-400 m-0">{bom.productName} - v{bom.version}</p>
              </div>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push(`/manufacturing/bill-of-materials/${bomId}`)}>
              Vazgeç
            </Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              loading={updateBom.isPending}
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
        <BomForm
          form={form}
          initialValues={bom}
          onFinish={handleSubmit}
          loading={updateBom.isPending}
        />
      </div>
    </div>
  );
}
