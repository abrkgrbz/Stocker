'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Form, message } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { InvoiceForm } from '@/components/sales/invoices';
import { useCreateInvoice } from '@/lib/api/hooks/useInvoices';
import type { CreateInvoiceCommand } from '@/lib/api/services/invoice.service';

export default function NewInvoicePage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createInvoice = useCreateInvoice();

  const handleSubmit = async (values: any) => {
    try {
      const invoiceData: CreateInvoiceCommand = {
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
      await createInvoice.mutateAsync(invoiceData);
      message.success('Fatura başarıyla oluşturuldu');
      router.push('/sales/invoices');
    } catch (error) {
      message.error('Fatura oluşturulurken bir hata oluştu');
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
                Yeni Fatura
              </h1>
              <p className="text-sm text-gray-400 m-0">Yeni satış faturası oluşturun</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/sales/invoices')}>
              Vazgeç
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={createInvoice.isPending}
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
          onFinish={handleSubmit}
          loading={createInvoice.isPending}
        />
      </div>
    </div>
  );
}
