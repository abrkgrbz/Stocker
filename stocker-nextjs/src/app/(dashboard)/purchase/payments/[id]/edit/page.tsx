'use client';

/**
 * Edit Supplier Payment Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 */

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Form,
  Input,
  DatePicker,
  InputNumber,
  Spin,
  message,
} from 'antd';
import {
  ArrowLeftIcon,
  CheckIcon,
  WalletIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useSupplierPayment, useUpdateSupplierPayment } from '@/lib/api/hooks/usePurchase';
import { PaymentMethod } from '@/lib/api/services/purchase.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

const methodLabels: Record<PaymentMethod, string> = {
  Cash: 'Nakit',
  BankTransfer: 'Havale/EFT',
  CreditCard: 'Kredi Kartı',
  Check: 'Çek',
  DirectDebit: 'Otomatik Ödeme',
  Other: 'Diğer',
};

const typeLabels: Record<string, string> = {
  Standard: 'Standart',
  Advance: 'Avans',
  Partial: 'Kısmi',
  Final: 'Son',
  Refund: 'İade',
};

export default function EditSupplierPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const paymentId = params.id as string;
  const [form] = Form.useForm();

  const { data: payment, isLoading: paymentLoading } = useSupplierPayment(paymentId);
  const updatePayment = useUpdateSupplierPayment();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(PaymentMethod.BankTransfer);

  useEffect(() => {
    if (payment) {
      setSelectedMethod(payment.method as PaymentMethod);
      form.setFieldsValue({
        paymentDate: payment.paymentDate ? dayjs(payment.paymentDate) : null,
        amount: payment.amount,
        exchangeRate: payment.exchangeRate,
        bankName: payment.bankName,
        bankAccountNumber: payment.bankAccountNumber,
        iban: payment.iban,
        swiftCode: payment.swiftCode,
        checkNumber: payment.checkNumber,
        checkDate: payment.checkDate ? dayjs(payment.checkDate) : null,
        description: payment.description,
        notes: payment.notes,
        internalNotes: payment.internalNotes,
      });
    }
  }, [payment, form]);

  if (paymentLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center mb-4">
          <WalletIcon className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-lg font-medium text-slate-900 mb-2">Ödeme belgesi bulunamadı</h2>
        <p className="text-sm text-slate-500 mb-4">Bu ödeme silinmiş veya erişim yetkiniz yok olabilir.</p>
        <button
          onClick={() => router.push('/purchase/payments')}
          className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
        >
          Ödemelere Dön
        </button>
      </div>
    );
  }

  if (payment.status !== 'Draft') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center mb-4">
          <WalletIcon className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-lg font-medium text-slate-900 mb-2">Bu ödeme düzenlenemez</h2>
        <p className="text-sm text-slate-500 mb-4">Sadece taslak durumundaki ödemeler düzenlenebilir.</p>
        <button
          onClick={() => router.push(`/purchase/payments/${paymentId}`)}
          className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
        >
          Ödemeye Dön
        </button>
      </div>
    );
  }

  const handleSave = async (values: any) => {
    try {
      await updatePayment.mutateAsync({
        id: paymentId,
        data: {
          paymentDate: values.paymentDate?.toISOString(),
          amount: values.amount,
          exchangeRate: values.exchangeRate,
          bankName: values.bankName,
          bankAccountNumber: values.bankAccountNumber,
          iban: values.iban,
          swiftCode: values.swiftCode,
          checkNumber: values.checkNumber,
          checkDate: values.checkDate?.toISOString(),
          description: values.description,
          notes: values.notes,
          internalNotes: values.internalNotes,
        },
      });
      message.success('Ödeme başarıyla güncellendi');
      router.push(`/purchase/payments/${paymentId}`);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleCancel = () => {
    router.push(`/purchase/payments/${paymentId}`);
  };

  const isLoading = updatePayment.isPending;
  const showBankFields = ['BankTransfer', 'DirectDebit'].includes(selectedMethod);
  const showCheckFields = selectedMethod === 'Check';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleCancel}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">
                  Ödeme Düzenle
                </h1>
                <p className="text-sm text-slate-500">
                  {payment.paymentNumber}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                <XMarkIcon className="w-4 h-4" />
                İptal
              </button>
              <button
                onClick={() => form.submit()}
                disabled={isLoading}
                className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                <CheckIcon className="w-4 h-4" />
                {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          {/* Read-Only Info */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
            <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-4">
              Ödeme Bilgileri (Salt Okunur)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-slate-400 mb-1">Ödeme No</p>
                <p className="text-sm font-medium text-slate-900">{payment.paymentNumber}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Tedarikçi</p>
                <p className="text-sm font-medium text-slate-900">{payment.supplierName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Ödeme Yöntemi</p>
                <p className="text-sm font-medium text-slate-900">{methodLabels[payment.method as PaymentMethod] || payment.method}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Ödeme Tipi</p>
                <p className="text-sm font-medium text-slate-900">{typeLabels[payment.type] || payment.type}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Para Birimi</p>
                <p className="text-sm font-medium text-slate-900">{payment.currency || 'TRY'}</p>
              </div>
              {payment.purchaseInvoiceNumber && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">İlişkili Fatura</p>
                  <p className="text-sm font-medium text-slate-900">{payment.purchaseInvoiceNumber}</p>
                </div>
              )}
            </div>
          </div>

          {/* Editable Fields */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
            <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-4">
              Düzenlenebilir Alanlar
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="paymentDate"
                label={<span className="text-xs text-slate-400">Ödeme Tarihi</span>}
                rules={[{ required: true, message: 'Tarih seçin' }]}
              >
                <DatePicker className="w-full" format="DD.MM.YYYY" variant="filled" />
              </Form.Item>
              <Form.Item
                name="amount"
                label={<span className="text-xs text-slate-400">Ödeme Tutarı</span>}
                rules={[{ required: true, message: 'Tutar girin' }]}
              >
                <InputNumber
                  min={0}
                  step={0.01}
                  className="w-full"
                  placeholder="0.00"
                  variant="filled"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  addonAfter={payment.currency || '₺'}
                />
              </Form.Item>
              {payment.currency !== 'TRY' && (
                <Form.Item name="exchangeRate" label={<span className="text-xs text-slate-400">Döviz Kuru</span>}>
                  <InputNumber
                    min={0}
                    step={0.0001}
                    className="w-full"
                    placeholder="1.00"
                    variant="filled"
                  />
                </Form.Item>
              )}
            </div>
          </div>

          {/* Bank Details */}
          {showBankFields && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
              <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-4">
                Banka Bilgileri
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item name="bankName" label={<span className="text-xs text-slate-400">Banka Adı</span>}>
                  <Input placeholder="Banka adı" variant="filled" />
                </Form.Item>
                <Form.Item name="bankAccountNumber" label={<span className="text-xs text-slate-400">Hesap No</span>}>
                  <Input placeholder="Hesap numarası" variant="filled" />
                </Form.Item>
                <Form.Item name="iban" label={<span className="text-xs text-slate-400">IBAN</span>} className="md:col-span-2">
                  <Input placeholder="TR00 0000 0000 0000 0000 0000 00" variant="filled" />
                </Form.Item>
                <Form.Item name="swiftCode" label={<span className="text-xs text-slate-400">SWIFT Kodu</span>}>
                  <Input placeholder="SWIFT kodu" variant="filled" />
                </Form.Item>
              </div>
            </div>
          )}

          {/* Check Details */}
          {showCheckFields && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
              <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-4">
                Çek Bilgileri
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item name="checkNumber" label={<span className="text-xs text-slate-400">Çek No</span>}>
                  <Input placeholder="Çek numarası" variant="filled" />
                </Form.Item>
                <Form.Item name="checkDate" label={<span className="text-xs text-slate-400">Çek Tarihi</span>}>
                  <DatePicker className="w-full" format="DD.MM.YYYY" variant="filled" />
                </Form.Item>
                <Form.Item name="bankName" label={<span className="text-xs text-slate-400">Banka</span>}>
                  <Input placeholder="Çekin bankası" variant="filled" />
                </Form.Item>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-4">
              Notlar
            </h3>
            <div className="space-y-4">
              <Form.Item name="description" label={<span className="text-xs text-slate-400">Açıklama</span>}>
                <TextArea rows={2} placeholder="Ödeme açıklaması..." variant="filled" />
              </Form.Item>
              <Form.Item name="notes" label={<span className="text-xs text-slate-400">Genel Not</span>}>
                <TextArea rows={2} placeholder="Genel notlar..." variant="filled" />
              </Form.Item>
              <Form.Item name="internalNotes" label={<span className="text-xs text-slate-400">Dahili Not</span>}>
                <TextArea rows={2} placeholder="Dahili not (tedarikçiye gösterilmez)..." variant="filled" />
              </Form.Item>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
