'use client';

import React, { useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { FinanceFormPageLayout } from '@/components/finance/shared';
import InvoiceForm, { type InvoiceFormRef, type InvoiceFormData } from '@/components/finance/invoices/InvoiceForm';
import { useInvoice, useUpdateInvoice } from '@/lib/api/hooks/useFinance';
import { Badge } from '@/components/primitives';

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = Number(params.id);
  const formRef = useRef<InvoiceFormRef>(null);

  const { data: invoice, isLoading, error } = useInvoice(invoiceId);
  const updateInvoice = useUpdateInvoice();

  const handleSubmit = async (values: InvoiceFormData) => {
    try {
      await updateInvoice.mutateAsync({ id: invoiceId, data: values });
      router.push('/finance/invoices');
    } catch (error) {
      // Error handled by hook
    }
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'default'; icon: React.ReactNode }> = {
      Draft: { label: 'Taslak', variant: 'default', icon: <ClockIcon className="h-3 w-3 mr-1" /> },
      Approved: { label: 'Onaylandı', variant: 'success', icon: <CheckCircleIcon className="h-3 w-3 mr-1" /> },
      Sent: { label: 'Gönderildi', variant: 'success', icon: <CheckCircleIcon className="h-3 w-3 mr-1" /> },
      PartiallyPaid: { label: 'Kısmi Ödendi', variant: 'warning', icon: <ClockIcon className="h-3 w-3 mr-1" /> },
      Paid: { label: 'Ödendi', variant: 'success', icon: <CheckCircleIcon className="h-3 w-3 mr-1" /> },
      Cancelled: { label: 'İptal', variant: 'error', icon: <XCircleIcon className="h-3 w-3 mr-1" /> },
    };
    return configs[status] || { label: status, variant: 'default' as const, icon: null };
  };

  const statusConfig = invoice?.status ? getStatusConfig(invoice.status) : null;

  // Prepare initial values for the form
  const initialValues = invoice ? {
    invoiceType: invoice.invoiceType,
    invoiceNumber: invoice.invoiceNumber,
    invoiceDate: invoice.invoiceDate,
    dueDate: invoice.dueDate,
    currency: invoice.currency,
    customerId: invoice.customerId,
    customerName: invoice.customerName,
    customerTaxNumber: invoice.customerTaxNumber,
    customerTaxOffice: invoice.customerTaxOffice,
    customerAddress: invoice.customerAddress,
    notes: invoice.notes,
    items: invoice.items || [],
  } : undefined;

  return (
    <FinanceFormPageLayout
      title={invoice?.invoiceNumber || 'Fatura Düzenle'}
      subtitle={invoice?.customerName || 'Fatura bilgilerini güncelleyin'}
      cancelPath="/finance/invoices"
      loading={updateInvoice.isPending}
      onSave={() => formRef.current?.submit()}
      isDataLoading={isLoading}
      dataError={!!error || (!isLoading && !invoice)}
      errorMessage="Fatura Bulunamadı"
      errorDescription="İstenen fatura bulunamadı veya bir hata oluştu."
      titleExtra={
        invoice && statusConfig && (
          <Badge variant={statusConfig.variant}>
            {statusConfig.icon}
            {statusConfig.label}
          </Badge>
        )
      }
    >
      <InvoiceForm
        ref={formRef}
        initialValues={initialValues}
        onFinish={handleSubmit}
        loading={updateInvoice.isPending}
        mode="edit"
      />
    </FinanceFormPageLayout>
  );
}
