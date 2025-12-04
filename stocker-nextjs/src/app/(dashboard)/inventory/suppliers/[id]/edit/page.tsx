'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Form, Button, message, Space, Spin, Alert, Tag } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, ShopOutlined, StarFilled } from '@ant-design/icons';
import { useSupplier, useUpdateSupplier } from '@/lib/api/hooks/useInventory';
import { SupplierForm } from '@/components/inventory/suppliers';
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
      message.success('Tedarikçi başarıyla güncellendi');
      router.push('/inventory/suppliers');
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Tedarikçi güncellenemedi');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !supplier) {
    return (
      <Alert
        message="Hata"
        description="Tedarikçi bilgileri yüklenemedi"
        type="error"
        showIcon
        action={
          <Button onClick={() => router.back()}>Geri Dön</Button>
        }
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Sticky Header with Glass Effect */}
      <div
        className="sticky top-0 z-10 -mx-6 px-6 py-4 mb-8"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          marginTop: '-24px',
          paddingTop: '24px',
        }}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => router.back()}
              className="flex items-center"
            >
              Geri
            </Button>
            <div className="h-6 w-px bg-gray-200" />
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                }}
              >
                <ShopOutlined style={{ fontSize: 20, color: 'white' }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-gray-900 m-0">
                    {supplier.name}
                  </h1>
                  {supplier.isPreferred && (
                    <Tag color="gold" icon={<StarFilled />}>Tercih Edilen</Tag>
                  )}
                  <Tag color={supplier.isActive ? 'success' : 'default'}>
                    {supplier.isActive ? 'Aktif' : 'Pasif'}
                  </Tag>
                </div>
                <p className="text-sm text-gray-500 m-0">
                  Kod: {supplier.code}
                </p>
              </div>
            </div>
          </div>

          <Space>
            <Button onClick={() => router.back()}>İptal</Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={() => form.submit()}
              loading={updateSupplier.isPending}
              style={{ background: '#10b981', borderColor: '#10b981' }}
            >
              Güncelle
            </Button>
          </Space>
        </div>
      </div>

      {/* Form */}
      <SupplierForm
        form={form}
        initialValues={supplier}
        onFinish={handleSubmit}
        loading={updateSupplier.isPending}
      />
    </div>
  );
}
