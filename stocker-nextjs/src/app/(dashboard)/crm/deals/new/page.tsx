'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Form } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { DealForm } from '@/components/crm/deals';
import { useCreateDeal } from '@/lib/api/hooks/useCRM';
import { showCreateSuccess, showError } from '@/lib/utils/sweetalert';

export default function NewDealPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createDeal = useCreateDeal();

  const handleSubmit = async (values: any) => {
    try {
      // Validation: CustomerId is required by backend
      if (!values.customerId) {
        showError('Musteri secimi zorunludur');
        return;
      }

      // Validation: ExpectedCloseDate is required
      if (!values.expectedCloseDate) {
        showError('Tahmini kapanis tarihi zorunludur');
        return;
      }

      await createDeal.mutateAsync(values);
      showCreateSuccess('firsat');
      router.push('/crm/deals');
    } catch (error: any) {
      const apiError = error.response?.data;
      const errorMessage = apiError?.detail || apiError?.errors?.[0]?.message || apiError?.title || error.message || 'Islem basarisiz';
      showError(errorMessage);
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
              icon={<ArrowLeftOutlined />}
              onClick={() => router.back()}
              type="text"
              className="text-gray-500 hover:text-gray-800"
            />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0">
                Yeni Firsat
              </h1>
              <p className="text-sm text-gray-400 m-0">Yeni satis firsati olusturun</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/crm/deals')}>
              Vazgec
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={createDeal.isPending}
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
        <DealForm
          form={form}
          onFinish={handleSubmit}
          loading={createDeal.isPending}
        />
      </div>
    </div>
  );
}
