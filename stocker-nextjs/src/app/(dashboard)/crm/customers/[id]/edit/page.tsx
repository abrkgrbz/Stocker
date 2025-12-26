'use client';

import React, { useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { CrmFormPageLayout } from '@/components/crm/shared';
import CustomerForm, { type CustomerFormRef, type CustomerFormData } from '@/components/crm/customers/CustomerForm';
import { useCustomer, useUpdateCustomer } from '@/lib/api/hooks/useCRM';
import { Badge } from '@/components/primitives';

export default function EditCustomerPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;
  const formRef = useRef<CustomerFormRef>(null);

  const { data: customer, isLoading, error } = useCustomer(customerId);
  const updateCustomer = useUpdateCustomer();

  const handleSubmit = async (values: CustomerFormData) => {
    try {
      await updateCustomer.mutateAsync({ id: customerId, data: values });
      router.push('/crm/customers');
    } catch (error) {
      // Error handled by hook
    }
  };

  const isActive = customer?.status === 'Active';
  const statusLabel = customer?.status === 'Active' ? 'Aktif' : customer?.status === 'Inactive' ? 'Pasif' : 'Potansiyel';
  const statusVariant = isActive ? 'success' : 'default';

  return (
    <CrmFormPageLayout
      title={customer?.companyName || 'Müşteri Düzenle'}
      subtitle={customer?.email || 'Müşteri bilgilerini güncelleyin'}
      cancelPath="/crm/customers"
      loading={updateCustomer.isPending}
      onSave={() => formRef.current?.submit()}
      isDataLoading={isLoading}
      dataError={!!error || (!isLoading && !customer)}
      errorMessage="Müşteri Bulunamadı"
      errorDescription="İstenen müşteri bulunamadı veya bir hata oluştu."
      titleExtra={
        customer && (
          <Badge variant={statusVariant}>
            {isActive ? (
              <CheckCircleIcon className="h-3 w-3 mr-1" />
            ) : (
              <ClockIcon className="h-3 w-3 mr-1" />
            )}
            {statusLabel}
          </Badge>
        )
      }
    >
      <CustomerForm
        ref={formRef}
        initialValues={customer}
        onFinish={handleSubmit}
        loading={updateCustomer.isPending}
      />
    </CrmFormPageLayout>
  );
}
