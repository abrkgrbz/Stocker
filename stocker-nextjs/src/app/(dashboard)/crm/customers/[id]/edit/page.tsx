'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Form, Tag } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { CrmFormPageLayout } from '@/components/crm/shared';
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

  const isActive = customer?.status === 'Active';
  const statusLabel = customer?.status === 'Active' ? 'Aktif' : customer?.status === 'Inactive' ? 'Pasif' : 'Potansiyel';

  return (
    <CrmFormPageLayout
      title={customer?.companyName || 'Müşteri Düzenle'}
      subtitle={customer?.email || 'Müşteri bilgilerini güncelleyin'}
      cancelPath="/crm/customers"
      loading={updateCustomer.isPending}
      onSave={() => form.submit()}
      isDataLoading={isLoading}
      dataError={!!error || (!isLoading && !customer)}
      errorMessage="Müşteri Bulunamadı"
      errorDescription="İstenen müşteri bulunamadı veya bir hata oluştu."
      titleExtra={
        customer && (
          <Tag
            icon={isActive ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
            color={isActive ? 'success' : 'default'}
          >
            {statusLabel}
          </Tag>
        )
      }
    >
      <CustomerForm
        form={form}
        initialValues={customer}
        onFinish={handleSubmit}
        loading={updateCustomer.isPending}
      />
    </CrmFormPageLayout>
  );
}
