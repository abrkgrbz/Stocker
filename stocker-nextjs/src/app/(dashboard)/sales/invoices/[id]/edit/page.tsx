'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Space, Form, message, Spin, Result } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { InvoiceForm } from '@/components/sales/invoices';
import { useInvoice, useUpdateInvoice } from '@/lib/api/hooks/useInvoices';
import type { UpdateInvoiceCommand } from '@/lib/api/services/invoice.service';

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [form] = Form.useForm();

  const { data: invoice, isLoading } = useInvoice(id);
  const updateInvoice = useUpdateInvoice();

  const handleSubmit = async (values: any) => {
    try {
      const updateData: Omit<UpdateInvoiceCommand, 'id'> = {
        invoiceDate: values.invoiceDate,
        dueDate: values.dueDate,
        customerId: values.customerId,
        customerName: values.customerName,
        customerEmail: values.customerEmail,
        customerTaxNumber: values.customerTaxNumber,
        customerAddress: values.customerAddress,
        type: values.type || 'Sales',
        currency: values.currency || 'TRY',
        notes: values.notes,
        paymentTerms: values.paymentTerms,
        discountRate: values.discountRate || 0,
        isEInvoice: values.isEInvoice || false,
        items: values.items.map((item: any, index: number) => ({
          lineNumber: index + 1,
          productId: item.productId,
          productCode: item.productCode,
          productName: item.productName,
          unit: item.unit || 'Adet',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          vatRate: item.vatRate || 18,
          description: item.description,
          discountRate: item.discountRate || 0,
        })),
      };
      await updateInvoice.mutateAsync({ id, data: updateData });
      message.success('Fatura başarıyla güncellendi');
      router.push(`/sales/invoices/${id}`);
    } catch (error) {
      message.error('Fatura güncellenirken bir hata oluştu');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Result
          status="404"
          title="Fatura Bulunamadı"
          subTitle="Düzenlemek istediğiniz fatura bulunamadı."
          extra={
            <Button type="primary" onClick={() => router.push('/sales/invoices')}>
              Faturalar Listesine Dön
            </Button>
          }
        />
      </div>
    );
  }

  // Only allow editing draft invoices
  if (invoice.status !== 'Draft') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Result
          status="warning"
          title="Düzenleme Yapılamaz"
          subTitle={`Bu fatura "${invoice.status}" durumunda olduğu için düzenlenemez. Sadece taslak faturalar düzenlenebilir.`}
          extra={
            <Button type="primary" onClick={() => router.push(`/sales/invoices/${id}`)}>
              Fatura Detayına Dön
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
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0">
                Fatura Düzenle
              </h1>
              <p className="text-sm text-gray-400 m-0">{invoice.invoiceNumber}</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push(`/sales/invoices/${id}`)}>
              Vazgeç
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={updateInvoice.isPending}
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
        <InvoiceForm
          form={form}
          initialValues={invoice}
          onFinish={handleSubmit}
          loading={updateInvoice.isPending}
        />
      </div>
    </div>
  );
}
