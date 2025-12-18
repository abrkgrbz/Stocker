'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Space, Form, Spin, Alert, Tag } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, CheckCircleOutlined, ClockCircleOutlined, StarFilled } from '@ant-design/icons';
import { SupplierForm } from '@/components/inventory/suppliers';
import { useSupplier, useUpdateSupplier } from '@/lib/api/hooks/useInventory';
import type { UpdateSupplierDto } from '@/lib/api/services/inventory.types';

export default function EditSupplierPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  const [form] = Form.useForm();

  const { data: supplier, isLoading, error } = useSupplier(id);
  const updateSupplier = useUpdateSupplier();

  const handleSubmit = async (values: UpdateSupplierDto) => {
    try {
      await updateSupplier.mutateAsync({ id, data: values });
      router.push('/inventory/suppliers');
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

  if (error || !supplier) {
    return (
      <div className="p-8">
        <Alert
          message="Tedarikçi Bulunamadı"
          description="İstenen tedarikçi bulunamadı veya bir hata oluştu."
          type="error"
          showIcon
          action={
            <Button onClick={() => router.push('/inventory/suppliers')}>
              Tedarikçilere Dön
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
                    {supplier.name}
                  </h1>
                  {supplier.isPreferred && (
                    <Tag color="gold" icon={<StarFilled />}>Tercih Edilen</Tag>
                  )}
                  <Tag
                    icon={supplier.isActive ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                    color={supplier.isActive ? 'success' : 'default'}
                  >
                    {supplier.isActive ? 'Aktif' : 'Pasif'}
                  </Tag>
                </div>
                <p className="text-sm text-gray-400 m-0">{supplier.code}</p>
              </div>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/inventory/suppliers')}>
              Vazgeç
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={updateSupplier.isPending}
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
        <SupplierForm
          form={form}
          initialValues={supplier}
          onFinish={handleSubmit}
          loading={updateSupplier.isPending}
        />
      </div>
    </div>
  );
}
