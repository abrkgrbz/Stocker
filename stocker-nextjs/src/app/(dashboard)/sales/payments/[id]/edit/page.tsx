'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Space, Form, message, Spin, Result } from 'antd';
import {
  ArrowLeftIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { PaymentForm } from '@/components/sales/payments';
import { usePayment, useUpdatePayment } from '@/lib/api/hooks/usePayments';
import type { UpdatePaymentCommand } from '@/lib/api/services/payment.service';

export default function EditPaymentPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [form] = Form.useForm();

  const { data: payment, isLoading } = usePayment(id);
  const updatePayment = useUpdatePayment();

  const handleSubmit = async (values: any) => {
    try {
      const updateData: Omit<UpdatePaymentCommand, 'id'> = {
        paymentDate: values.paymentDate?.toISOString(),
        customerId: values.customerId,
        customerName: values.customerName || payment?.customerName || '',
        invoiceId: values.invoiceId,
        method: values.method || 'BankTransfer',
        currency: values.currency || 'TRY',
        amount: values.amount,
        reference: values.reference,
        description: values.description,
        bankAccountName: values.bankAccountName,
        transactionId: values.transactionId,
      };
      await updatePayment.mutateAsync({ id, data: updateData });
      message.success('Ödeme başarıyla güncellendi');
      router.push(`/sales/payments/${id}`);
    } catch (error) {
      message.error('Ödeme güncellenirken bir hata oluştu');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Result
          status="404"
          title="Ödeme Bulunamadı"
          subTitle="Düzenlemek istediğiniz ödeme bulunamadı."
          extra={
            <Button type="primary" onClick={() => router.push('/sales/payments')}>
              Ödemeler Listesine Dön
            </Button>
          }
        />
      </div>
    );
  }

  // Only allow editing pending payments
  if (payment.status !== 'Pending') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Result
          status="warning"
          title="Düzenleme Yapılamaz"
          subTitle={`Bu ödeme "${payment.status}" durumunda olduğu için düzenlenemez. Sadece bekleyen ödemeler düzenlenebilir.`}
          extra={
            <Button type="primary" onClick={() => router.push(`/sales/payments/${id}`)}>
              Ödeme Detayına Dön
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
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => router.back()}
              type="text"
              className="text-gray-500 hover:text-gray-800"
            />
            <div>
              <h1 className="text-xl font-semibold text-gray-900 m-0">
                Ödeme Düzenle
              </h1>
              <p className="text-sm text-gray-400 m-0">{payment.paymentNumber}</p>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.push(`/sales/payments/${id}`)}>
              Vazgeç
            </Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              loading={updatePayment.isPending}
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
          initialValues={payment}
          onFinish={handleSubmit}
          loading={updatePayment.isPending}
        />
      </div>
    </div>
  );
}
