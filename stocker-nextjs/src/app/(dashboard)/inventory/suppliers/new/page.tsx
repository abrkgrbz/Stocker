'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form, Button, message, Space } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, ShopOutlined } from '@ant-design/icons';
import { useCreateSupplier } from '@/lib/api/hooks/useInventory';
import { SupplierForm } from '@/components/inventory/suppliers';
import type { CreateSupplierDto } from '@/lib/api/services/inventory.types';

export default function NewSupplierPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createSupplier = useCreateSupplier();

  const handleSubmit = async (values: CreateSupplierDto) => {
    try {
      await createSupplier.mutateAsync(values);
      message.success('Tedarikçi başarıyla oluşturuldu');
      router.push('/inventory/suppliers');
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Tedarikçi oluşturulamadı');
    }
  };

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
                <h1 className="text-xl font-semibold text-gray-900 m-0">
                  Yeni Tedarikçi
                </h1>
                <p className="text-sm text-gray-500 m-0">
                  Tedarikçi bilgilerini girin
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
              loading={createSupplier.isPending}
              style={{ background: '#10b981', borderColor: '#10b981' }}
            >
              Kaydet
            </Button>
          </Space>
        </div>
      </div>

      {/* Form */}
      <SupplierForm
        form={form}
        onFinish={handleSubmit}
        loading={createSupplier.isPending}
      />
    </div>
  );
}
