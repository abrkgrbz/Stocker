'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Space, Form, Spin, Alert, Tag } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { WarehouseForm } from '@/components/inventory/warehouses';
import { useWarehouse, useUpdateWarehouse } from '@/lib/api/hooks/useInventory';
import type { UpdateWarehouseDto } from '@/lib/api/services/inventory.types';

export default function EditWarehousePage() {
  const router = useRouter();
  const params = useParams();
  const warehouseId = Number(params.id);
  const [form] = Form.useForm();

  const { data: warehouse, isLoading, error } = useWarehouse(warehouseId);
  const updateWarehouse = useUpdateWarehouse();

  const handleSubmit = async (values: UpdateWarehouseDto) => {
    try {
      await updateWarehouse.mutateAsync({ id: warehouseId, data: values });
      router.push(`/inventory/warehouses/${warehouseId}`);
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

  if (error || !warehouse) {
    return (
      <div className="p-8">
        <Alert
          message="Depo Bulunamadı"
          description="İstenen depo bulunamadı veya bir hata oluştu."
          type="error"
          showIcon
          action={
            <Button onClick={() => router.push('/inventory/warehouses')}>
              Depolara Dön
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
              icon={<ArrowLeftOutlined />}
              onClick={() => router.back()}
              type="text"
              className="text-gray-500 hover:text-gray-800"
            />
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-gray-900 m-0">
                    {warehouse.name}
                  </h1>
                  <Tag
                    icon={warehouse.isActive ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                    color={warehouse.isActive ? 'success' : 'default'}
                    className="ml-2"
                  >
                    {warehouse.isActive ? 'Aktif' : 'Pasif'}
                  </Tag>
                  {warehouse.isDefault && (
                    <Tag color="blue">Varsayılan</Tag>
                  )}
                </div>
                <p className="text-sm text-gray-400 m-0">{warehouse.code}</p>
              </div>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push(`/inventory/warehouses/${warehouseId}`)}>
              Vazgeç
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={updateWarehouse.isPending}
              onClick={() => form.submit()}
              style={{
                background: '#1a1a1a',
                borderColor: '#1a1a1a',
              }}
            >
              Kaydet
            </Button>
          </Space>
        </div>
      </div>

      {/* Page Content */}
      <div className="px-8 py-8 max-w-7xl mx-auto">
        <WarehouseForm
          form={form}
          initialValues={warehouse}
          onFinish={handleSubmit}
          loading={updateWarehouse.isPending}
        />
      </div>
    </div>
  );
}
