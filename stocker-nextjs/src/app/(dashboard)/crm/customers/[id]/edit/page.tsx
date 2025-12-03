'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Space, Form, Spin, Alert, Tag } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { CustomerForm } from '@/components/crm/customers';
import { useCustomer, useUpdateCustomer } from '@/lib/api/hooks/useCRM';

export default function EditCustomerPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;
  const [form] = Form.useForm();

  const { data: customer, isLoading, error } = useCustomer(customerId);
  const updateCustomer = useUpdateCustomer();

  const handleSubmit = async (values: any) => {
    try {
      await updateCustomer.mutateAsync({ id: customerId, data: values });
      router.push('/crm/customers');
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

  if (error || !customer) {
    return (
      <div className="p-8">
        <Alert
          message="Müşteri Bulunamadı"
          description="İstenen müşteri bulunamadı veya bir hata oluştu."
          type="error"
          showIcon
          action={
            <Button onClick={() => router.push('/crm/customers')}>
              Müşterilere Dön
            </Button>
          }
        />
      </div>
    );
  }

  const isActive = customer.status === 'Active';

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
                    {customer.companyName}
                  </h1>
                  <Tag
                    icon={isActive ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                    color={isActive ? 'success' : 'default'}
                    className="ml-2"
                  >
                    {customer.status === 'Active' ? 'Aktif' : customer.status === 'Inactive' ? 'Pasif' : 'Potansiyel'}
                  </Tag>
                </div>
                <p className="text-sm text-gray-400 m-0">{customer.email}</p>
              </div>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/crm/customers')}>
              Vazgeç
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={updateCustomer.isPending}
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
        <CustomerForm
          form={form}
          initialValues={customer}
          onFinish={handleSubmit}
          loading={updateCustomer.isPending}
        />
      </div>
    </div>
  );
}
