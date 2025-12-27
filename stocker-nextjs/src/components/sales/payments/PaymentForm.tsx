'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
} from 'antd';
import { CreditCardIcon } from '@heroicons/react/24/outline';
import { useCustomers } from '@/lib/api/hooks/useCRM';
import { useInvoices } from '@/lib/api/hooks/useInvoices';
import type { Customer } from '@/lib/api/services/crm.service';
import type { Payment } from '@/lib/api/services/payment.service';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface PaymentFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: Payment;
  onFinish: (values: any) => void;
  loading?: boolean;
  preselectedInvoiceId?: string;
}

const currencyOptions = [
  { value: 'TRY', label: '₺ TRY' },
  { value: 'USD', label: '$ USD' },
  { value: 'EUR', label: '€ EUR' },
];

const methodOptions = [
  { value: 'Cash', label: 'Nakit' },
  { value: 'BankTransfer', label: 'Havale/EFT' },
  { value: 'CreditCard', label: 'Kredi Kartı' },
  { value: 'DebitCard', label: 'Banka Kartı' },
  { value: 'Check', label: 'Çek' },
  { value: 'DirectDebit', label: 'Otomatik Ödeme' },
  { value: 'Other', label: 'Diğer' },
];

export default function PaymentForm({ form, initialValues, onFinish, loading, preselectedInvoiceId }: PaymentFormProps) {
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('TRY');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | undefined>();

  // Fetch customers
  const { data: customersData, isLoading: customersLoading } = useCustomers({
    searchTerm: customerSearch,
    status: 'Active',
    pageSize: 50,
  });

  // Fetch invoices for selected customer
  const { data: invoicesData, isLoading: invoicesLoading } = useInvoices({
    customerId: selectedCustomerId,
    status: 'Issued,Sent,PartiallyPaid,Overdue',
    pageSize: 100,
  });

  const customerOptions = useMemo(() =>
    customersData?.items?.map((customer: Customer) => ({
      value: customer.id.toString(),
      label: customer.companyName || customer.contactPerson,
      customer,
    })) || [], [customersData]);

  const invoiceOptions = useMemo(() =>
    invoicesData?.items?.map((invoice) => ({
      value: invoice.id,
      label: `${invoice.invoiceNumber} - ${invoice.customerName} - ${invoice.balanceDue.toLocaleString('tr-TR')} ${invoice.currency}`,
      invoice,
    })) || [], [invoicesData]);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        customerId: initialValues.customerId,
        invoiceId: initialValues.invoiceId,
        paymentDate: initialValues.paymentDate ? dayjs(initialValues.paymentDate) : dayjs(),
        currency: initialValues.currency || 'TRY',
        method: initialValues.method || 'BankTransfer',
        amount: initialValues.amount,
        reference: initialValues.reference,
        description: initialValues.description,
        bankAccountName: initialValues.bankAccountName,
        transactionId: initialValues.transactionId,
      });
      setSelectedCurrency(initialValues.currency || 'TRY');
      setSelectedCustomerId(initialValues.customerId || undefined);
    } else {
      form.setFieldsValue({
        paymentDate: dayjs(),
        currency: 'TRY',
        method: 'BankTransfer',
      });
      // If preselected invoice, set it
      if (preselectedInvoiceId) {
        form.setFieldValue('invoiceId', preselectedInvoiceId);
      }
    }
  }, [form, initialValues, preselectedInvoiceId]);

  const handleCustomerSelect = (value: string) => {
    setSelectedCustomerId(value);
    // Clear invoice selection when customer changes
    form.setFieldValue('invoiceId', undefined);
  };

  const handleInvoiceSelect = (invoiceId: string) => {
    const invoice = invoiceOptions.find((opt: { value: string }) => opt.value === invoiceId)?.invoice;
    if (invoice) {
      form.setFieldsValue({
        customerId: invoice.customerId,
        amount: invoice.balanceDue,
        currency: invoice.currency,
      });
      setSelectedCurrency(invoice.currency);
      setSelectedCustomerId(invoice.customerId || undefined);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: selectedCurrency
    }).format(amount);

  const amount = Form.useWatch('amount', form) || 0;

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      disabled={loading}
      className="w-full"
      scrollToFirstError={{ behavior: 'smooth', block: 'center' }}
    >
      {/* Main Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">

        {/* ═══════════════════════════════════════════════════════════════
            HEADER: Icon + Title + Amount
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Payment Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <CreditCardIcon className="w-6 h-6 text-slate-500" />
              </div>
            </div>

            {/* Payment Title */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900">
                {initialValues ? `Ödeme: ${initialValues.paymentNumber}` : 'Yeni Ödeme'}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {initialValues?.status || 'Ödeme bilgilerini girin'}
              </p>
            </div>

            {/* Amount Display */}
            <div className="flex-shrink-0">
              <div className="bg-slate-100 px-6 py-3 rounded-xl text-center">
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                  Ödeme Tutarı
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {formatCurrency(amount)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            FORM BODY: High-Density Grid Layout
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6">

          {/* ─────────────── MÜŞTERİ VE FATURA ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Müşteri ve Fatura
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Müşteri <span className="text-red-500">*</span></label>
                <Form.Item
                  name="customerId"
                  rules={[{ required: true, message: 'Müşteri seçimi zorunludur' }]}
                  className="mb-0"
                >
                  <Select
                    showSearch
                    placeholder="Müşteri seçin veya arayın"
                    loading={customersLoading}
                    filterOption={false}
                    onSearch={setCustomerSearch}
                    onChange={handleCustomerSelect}
                    options={customerOptions}
                    notFoundContent={customersLoading ? 'Yükleniyor...' : 'Müşteri bulunamadı'}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Fatura (Opsiyonel)</label>
                <Form.Item name="invoiceId" className="mb-0">
                  <Select
                    showSearch
                    placeholder="Fatura seçin"
                    loading={invoicesLoading}
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    onChange={handleInvoiceSelect}
                    options={invoiceOptions}
                    allowClear
                    notFoundContent={invoicesLoading ? 'Yükleniyor...' : 'Bekleyen fatura yok'}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── TARİH VE PARA BİRİMİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Tarih ve Para Birimi
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Ödeme Tarihi <span className="text-red-500">*</span></label>
                <Form.Item
                  name="paymentDate"
                  rules={[{ required: true, message: 'Ödeme tarihi zorunludur' }]}
                  className="mb-0"
                >
                  <DatePicker
                    format="DD/MM/YYYY"
                    placeholder="Tarih seçin"
                    className="!w-full [&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Para Birimi</label>
                <Form.Item name="currency" className="mb-0">
                  <Select
                    options={currencyOptions}
                    onChange={setSelectedCurrency}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── ÖDEME DETAYLARI ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Ödeme Detayları
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Ödeme Yöntemi <span className="text-red-500">*</span></label>
                <Form.Item
                  name="method"
                  rules={[{ required: true, message: 'Ödeme yöntemi zorunludur' }]}
                  className="mb-0"
                >
                  <Select
                    options={methodOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Tutar <span className="text-red-500">*</span></label>
                <Form.Item
                  name="amount"
                  rules={[{ required: true, message: 'Tutar zorunludur' }]}
                  className="mb-0"
                >
                  <InputNumber
                    min={0}
                    precision={2}
                    placeholder="0.00"
                    prefix={selectedCurrency === 'TRY' ? '₺' : selectedCurrency === 'USD' ? '$' : '€'}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Referans</label>
                <Form.Item name="reference" className="mb-0">
                  <Input
                    placeholder="Referans numarası"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── BANKA BİLGİLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Banka Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Banka Hesabı</label>
                <Form.Item name="bankAccountName" className="mb-0">
                  <Input
                    placeholder="Banka hesap adı"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">İşlem Numarası</label>
                <Form.Item name="transactionId" className="mb-0">
                  <Input
                    placeholder="Banka işlem numarası"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── AÇIKLAMA ─────────────── */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Açıklama
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <Form.Item name="description" className="mb-0">
                  <TextArea
                    placeholder="Ödeme hakkında notlar..."
                    rows={3}
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white !resize-none"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── DÜZENLEME BİLGİLERİ ─────────────── */}
          {initialValues && (
            <div className="mt-8">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                Ödeme Bilgileri
              </h3>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-xs text-slate-500 mb-1">Ödeme Numarası</div>
                    <div className="text-sm font-semibold text-slate-900">{initialValues.paymentNumber}</div>
                  </div>
                </div>
                <div className="col-span-6">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-xs text-slate-500 mb-1">Durum</div>
                    <div className="text-sm font-semibold text-slate-900">{initialValues.status}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Hidden submit */}
      <Form.Item hidden>
        <button type="submit" />
      </Form.Item>
    </Form>
  );
}
