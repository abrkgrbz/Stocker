'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Space, Form, message } from 'antd';
import {
  ArrowLeftIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { PaymentForm } from '@/components/sales/payments';
import { useCreatePayment } from '@/lib/api/hooks/usePayments';
import type { CreatePaymentCommand } from '@/lib/api/services/payment.service';

export default function NewPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form] = Form.useForm();
  const createPayment = useCreatePayment();

  // Check if coming from an invoice
  const preselectedInvoiceId = searchParams.get('invoiceId') || undefined;

  const handleSubmit = async (values: any) => {
    try {
      const paymentData: CreatePaymentCommand = {
        paymentDate: values.paymentDate?.toISOString(),
        customerId: values.customerId,
        customerName: values.customerName || '',
        invoiceId: values.invoiceId,
        method: values.method || 'BankTransfer',
        currency: values.currency || 'TRY',
        amount: values.amount,
        reference: values.reference,
        description: values.description,
        bankAccountName: values.bankAccountName,
        transactionId: values.transactionId,
      };
      await createPayment.mutateAsync(paymentData);
      message.success('Ödeme başarıyla kaydedildi');
      router.push('/sales/payments');
    } catch (error) {
      message.error('Ödeme kaydedilirken bir hata oluştu');
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
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => router.back()}
              type="text"
              className="text-gray-500 hover:text-gray-800"
            />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0">
                Yeni Ödeme
              </h1>
              <p className="text-sm text-gray-400 m-0">Yeni ödeme kaydı oluşturun</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push('/sales/payments')}>
              Vazgeç
            </Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              loading={createPayment.isPending}
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
        <PaymentForm
          form={form}
          onFinish={handleSubmit}
          loading={createPayment.isPending}
          preselectedInvoiceId={preselectedInvoiceId}
        />
      </div>
    </div>
  );
}
