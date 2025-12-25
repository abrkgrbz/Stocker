'use client';

/**
 * New Customer Contract Page
 * Enterprise-grade form following CRM patterns
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form } from 'antd';
import { CrmFormPageLayout } from '@/components/crm/shared';
import { ContractForm } from '@/components/sales/contracts';
import { useCreateCustomerContract } from '@/lib/api/hooks/useSales';
import { useCustomers } from '@/lib/api/hooks/useCRM';
import type { CreateCustomerContractCommand } from '@/lib/api/services/sales.service';
import type { Customer, PaginatedResponse } from '@/lib/api/services/crm.service';

export default function NewContractPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createContract = useCreateCustomerContract();

  // Fetch customers for dropdown
  const customersQuery = useCustomers({
    pageNumber: 1,
    pageSize: 100,
  });
  const customersData = customersQuery.data as unknown as PaginatedResponse<Customer> | undefined;
  const loadingCustomers = customersQuery.isLoading;

  const customers = (customersData?.items || []).map((c) => ({
    id: c.id.toString(),
    name: c.companyName || c.customerName || '',
    taxNumber: c.taxId || undefined,
  }));

  const handleSubmit = async (values: any) => {
    try {
      const selectedCustomer = customers.find(c => c.id === values.customerId);

      const command: CreateCustomerContractCommand = {
        title: values.title,
        description: values.description,
        contractType: values.contractType,
        customerId: values.customerId,
        customerName: selectedCustomer?.name || '',
        customerTaxNumber: selectedCustomer?.taxNumber,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
        defaultPaymentDueDays: values.defaultPaymentDueDays,
        priceListId: values.priceListId,
        generalDiscountPercentage: values.generalDiscountPercentage,
        creditLimitAmount: values.creditLimitAmount,
        creditLimitCurrency: values.creditLimitCurrency || 'TRY',
        autoRenewal: values.autoRenewal,
        renewalPeriodMonths: values.renewalPeriodMonths,
        renewalNoticeBeforeDays: values.renewalNoticeBeforeDays,
        salesRepresentativeId: values.salesRepresentativeId,
        salesRepresentativeName: values.salesRepresentativeName,
      };

      await createContract.mutateAsync(command);
      router.push('/sales/contracts');
    } catch {
      // Error handled by hook
    }
  };

  return (
    <CrmFormPageLayout
      title="Yeni Sözleşme"
      subtitle="Yeni müşteri sözleşmesi oluşturun"
      cancelPath="/sales/contracts"
      loading={createContract.isPending}
      onSave={() => form.submit()}
    >
      <ContractForm
        form={form}
        onFinish={handleSubmit}
        loading={createContract.isPending}
        customers={customers}
        loadingCustomers={loadingCustomers}
      />
    </CrmFormPageLayout>
  );
}
