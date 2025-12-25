'use client';

/**
 * Edit Customer Contract Page
 * Enterprise-grade form following CRM patterns
 */

import React, { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Form, Tag } from 'antd';
import { CrmFormPageLayout } from '@/components/crm/shared';
import { ContractForm } from '@/components/sales/contracts';
import { useCustomerContract, useUpdateCustomerContract } from '@/lib/api/hooks/useSales';
import type { UpdateCustomerContractCommand, ContractStatus } from '@/lib/api/services/sales.service';

const statusConfig: Record<ContractStatus, { label: string; color: string }> = {
  Draft: { label: 'Taslak', color: 'default' },
  Active: { label: 'Aktif', color: 'success' },
  Suspended: { label: 'Askıda', color: 'warning' },
  Terminated: { label: 'Feshedildi', color: 'error' },
  Expired: { label: 'Süresi Doldu', color: 'default' },
  PendingApproval: { label: 'Onay Bekliyor', color: 'processing' },
};

export default function EditContractPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [form] = Form.useForm();

  const { data: contract, isLoading: loadingContract, error } = useCustomerContract(id);
  const updateContract = useUpdateCustomerContract();

  // Populate form when contract data is loaded
  useEffect(() => {
    if (contract) {
      form.setFieldsValue({
        contractNumber: contract.contractNumber,
        title: contract.title,
        contractType: contract.contractType,
        priceListId: contract.priceListId,
        generalDiscountPercentage: contract.generalDiscountPercentage,
        autoRenewal: contract.autoRenewal,
        renewalPeriodMonths: contract.renewalPeriodMonths,
        renewalNoticeBeforeDays: contract.renewalNoticeBeforeDays,
        salesRepresentativeId: contract.salesRepresentativeId,
        specialTerms: contract.specialTerms,
        internalNotes: contract.internalNotes,
      });
    }
  }, [contract, form]);

  const handleSubmit = async (values: any) => {
    try {
      const command: UpdateCustomerContractCommand = {
        priceListId: values.priceListId || undefined,
        generalDiscountPercentage: values.generalDiscountPercentage,
        autoRenewal: values.autoRenewal,
        renewalPeriodMonths: values.renewalPeriodMonths,
        renewalNoticeBeforeDays: values.renewalNoticeBeforeDays,
        salesRepresentativeId: values.salesRepresentativeId || undefined,
        salesRepresentativeName: values.salesRepresentativeName || undefined,
      };

      await updateContract.mutateAsync({ id, data: command });
      router.push(`/sales/contracts/${id}`);
    } catch {
      // Error handled by hook
    }
  };

  const statusInfo = contract ? statusConfig[contract.status as ContractStatus] : null;

  return (
    <CrmFormPageLayout
      title={contract?.contractNumber || 'Sözleşme Düzenle'}
      subtitle={contract?.customerName || 'Sözleşme bilgilerini güncelleyin'}
      cancelPath={`/sales/contracts/${id}`}
      loading={updateContract.isPending}
      onSave={() => form.submit()}
      isDataLoading={loadingContract}
      dataError={!!error}
      errorMessage="Sözleşme Bulunamadı"
      errorDescription="İstenen sözleşme bulunamadı veya bir hata oluştu."
      titleExtra={statusInfo && <Tag color={statusInfo.color}>{statusInfo.label}</Tag>}
    >
      <ContractForm
        form={form}
        onFinish={handleSubmit}
        loading={updateContract.isPending}
        isEdit
      />
    </CrmFormPageLayout>
  );
}
