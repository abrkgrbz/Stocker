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
import WarehouseZoneForm from '@/components/inventory/warehouse-zones/WarehouseZoneForm';
import { useWarehouseZone, useUpdateWarehouseZone } from '@/lib/api/hooks/useInventory';
import type { UpdateWarehouseZoneDto } from '@/lib/api/services/inventory.types';

export default function EditWarehouseZonePage() {
  const router = useRouter();
  const params = useParams();
  const zoneId = Number(params.id);
  const [form] = Form.useForm();

  const { data: zone, isLoading, error } = useWarehouseZone(zoneId);
  const updateZone = useUpdateWarehouseZone();

  const handleSubmit = async (values: UpdateWarehouseZoneDto) => {
    try {
      await updateZone.mutateAsync({ id: zoneId, dto: values });
      router.push('/inventory/warehouse-zones');
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

  if (error || !zone) {
    return (
      <div className="p-8">
        <Alert
          message="Bölge Bulunamadı"
          description="İstenen depo bölgesi bulunamadı veya bir hata oluştu."
          type="error"
          showIcon
          action={
            <Button onClick={() => router.push('/inventory/warehouse-zones')}>
              Bölgelere Dön
            </Button>
          }
        />
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
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-gray-900 m-0">
                    {zone.name}
                  </h1>
                  <Tag
                    icon={zone.isActive ? <CheckCircleIcon className="w-4 h-4" /> : <ClockIcon className="w-4 h-4" />}
                    color={zone.isActive ? 'success' : 'default'}
                    className="ml-2"
                  >
                    {zone.isActive ? 'Aktif' : 'Pasif'}
                  </Tag>
                </div>
                <p className="text-sm text-gray-400 m-0">{zone.code} - {zone.warehouseName}</p>
              </div>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/inventory/warehouse-zones')}>
              Vazgeç
            </Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              loading={updateZone.isPending}
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
        <WarehouseZoneForm
          form={form}
          initialValues={zone}
          onFinish={handleSubmit}
          loading={updateZone.isPending}
        />
      </div>
    </div>
  );
}
