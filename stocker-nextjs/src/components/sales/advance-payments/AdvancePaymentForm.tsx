'use client';

import React, { useEffect, useMemo } from 'react';
import { Form, Input, Select, DatePicker, InputNumber, Button } from 'antd';
import dayjs from 'dayjs';
import {
  BanknotesIcon,
  UserIcon,
  CreditCardIcon,
  DocumentTextIcon,
  BuildingLibraryIcon,
} from '@heroicons/react/24/outline';
import type {
  AdvancePaymentDto,
  CreateAdvancePaymentCommand,
  UpdateAdvancePaymentCommand,
  PaymentMethod,
} from '@/features/sales/types';

// =====================================
// TYPES
// =====================================

interface AdvancePaymentFormProps {
  form: ReturnType<typeof Form.useForm<AdvancePaymentFormValues>>[0];
  initialData?: AdvancePaymentDto | null;
  onSubmit: (values: CreateAdvancePaymentCommand | UpdateAdvancePaymentCommand) => Promise<void>;
  isSubmitting?: boolean;
  mode?: 'create' | 'edit' | 'view';
}

interface AdvancePaymentFormValues {
  customerName: string;
  customerId?: string;
  customerTaxNumber?: string;
  salesOrderId?: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  paymentDate: dayjs.Dayjs;
  bankName?: string;
  bankAccountNumber?: string;
  checkNumber?: string;
  checkDate?: dayjs.Dayjs;
  notes?: string;
}

// =====================================
// CONSTANTS
// =====================================

const paymentMethods: { value: PaymentMethod; label: string }[] = [
  { value: 'Cash', label: 'Nakit' },
  { value: 'CreditCard', label: 'Kredi Kartı' },
  { value: 'DebitCard', label: 'Banka Kartı' },
  { value: 'BankTransfer', label: 'Banka Havalesi' },
  { value: 'Check', label: 'Çek' },
  { value: 'OnlinePayment', label: 'Online Ödeme' },
];

const currencies = [
  { value: 'TRY', label: 'TRY - Türk Lirası' },
  { value: 'USD', label: 'USD - Amerikan Doları' },
  { value: 'EUR', label: 'EUR - Euro' },
];

// =====================================
// COMPONENT
// =====================================

export function AdvancePaymentForm({
  form,
  initialData,
  onSubmit,
  isSubmitting = false,
  mode = 'create',
}: AdvancePaymentFormProps) {
  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';

  // =====================================
  // WATCH VALUES
  // =====================================
  const watchedPaymentMethod = Form.useWatch('paymentMethod', form);
  const watchedAmount = Form.useWatch('amount', form);
  const watchedCurrency = Form.useWatch('currency', form);

  // =====================================
  // EFFECTS
  // =====================================
  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        customerName: initialData.customerName,
        customerId: initialData.customerId,
        customerTaxNumber: initialData.customerTaxNumber,
        salesOrderId: initialData.salesOrderId,
        amount: initialData.amount,
        currency: initialData.currency,
        paymentMethod: initialData.paymentMethod as PaymentMethod,
        paymentReference: initialData.paymentReference,
        paymentDate: dayjs(initialData.paymentDate),
        bankName: initialData.bankName,
        bankAccountNumber: initialData.bankAccountNumber,
        checkNumber: initialData.checkNumber,
        checkDate: initialData.checkDate ? dayjs(initialData.checkDate) : undefined,
        notes: initialData.notes,
      });
    }
  }, [initialData, form]);

  // =====================================
  // COMPUTED VALUES
  // =====================================
  const displayAmount = useMemo(() => {
    const amount = watchedAmount || 0;
    const currency = watchedCurrency || 'TRY';
    return `${amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ${currency}`;
  }, [watchedAmount, watchedCurrency]);

  const showBankFields = watchedPaymentMethod === 'BankTransfer';
  const showCheckFields = watchedPaymentMethod === 'Check';

  // =====================================
  // HANDLERS
  // =====================================
  const handleFormSubmit = async (values: AdvancePaymentFormValues) => {
    if (isEditMode) {
      const updateData: UpdateAdvancePaymentCommand = {
        amount: values.amount,
        paymentMethod: values.paymentMethod,
        paymentReference: values.paymentReference,
        bankName: values.bankName,
        bankAccountNumber: values.bankAccountNumber,
        checkNumber: values.checkNumber,
        checkDate: values.checkDate?.toISOString(),
        notes: values.notes,
      };
      await onSubmit(updateData);
    } else {
      const createData: CreateAdvancePaymentCommand = {
        customerId: values.customerId,
        customerName: values.customerName,
        customerTaxNumber: values.customerTaxNumber,
        salesOrderId: values.salesOrderId,
        amount: values.amount,
        currency: values.currency,
        paymentMethod: values.paymentMethod,
        paymentReference: values.paymentReference,
        bankName: values.bankName,
        bankAccountNumber: values.bankAccountNumber,
        checkNumber: values.checkNumber,
        checkDate: values.checkDate?.toISOString(),
        notes: values.notes,
      };
      await onSubmit(createData);
    }
  };

  // =====================================
  // RENDER
  // =====================================
  return (
    <div className="bg-white rounded-lg border border-slate-200">
      {/* Header */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
            <BanknotesIcon className="w-8 h-8 text-slate-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-slate-900">
              {isViewMode ? 'Avans Ödeme Detayı' : isEditMode ? 'Avans Ödeme Düzenle' : 'Yeni Avans Ödeme'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Müşteriden alınan avans ödemeleri kaydedin ve takip edin
            </p>
            {initialData && (
              <p className="text-xs text-slate-400 mt-1">
                Makbuz No: {initialData.paymentNumber}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-900">{displayAmount}</p>
            <p className="text-sm text-slate-500">Avans Tutarı</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFormSubmit}
        disabled={isViewMode}
        initialValues={{
          currency: 'TRY',
          paymentMethod: 'Cash',
          paymentDate: dayjs(),
          amount: 0,
        }}
        className="p-6"
      >
        {/* Customer Info Section */}
        <div className="mb-8">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100 flex items-center gap-2">
            <UserIcon className="w-4 h-4" />
            Müşteri Bilgileri
          </h3>
          <div className="grid grid-cols-12 gap-4">
            <Form.Item
              name="customerName"
              label="Müşteri Adı"
              rules={[{ required: true, message: 'Müşteri adı zorunludur' }]}
              className="col-span-6"
            >
              <Input
                placeholder="Müşteri adı veya ünvanı"
                className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900"
              />
            </Form.Item>

            <Form.Item
              name="customerTaxNumber"
              label="Vergi No / TCKN"
              className="col-span-3"
            >
              <Input
                placeholder="Vergi numarası"
                className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900"
              />
            </Form.Item>

            <Form.Item
              name="salesOrderId"
              label="Sipariş No"
              className="col-span-3"
            >
              <Input
                placeholder="İlişkili sipariş"
                className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900"
              />
            </Form.Item>
          </div>
        </div>

        {/* Payment Info Section */}
        <div className="mb-8">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100 flex items-center gap-2">
            <CreditCardIcon className="w-4 h-4" />
            Ödeme Bilgileri
          </h3>
          <div className="grid grid-cols-12 gap-4">
            <Form.Item
              name="amount"
              label="Tutar"
              rules={[
                { required: true, message: 'Tutar zorunludur' },
                { type: 'number', min: 0.01, message: 'Tutar 0\'dan büyük olmalıdır' },
              ]}
              className="col-span-4"
            >
              <InputNumber
                min={0}
                precision={2}
                placeholder="0.00"
                className="w-full !bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900"
              />
            </Form.Item>

            <Form.Item
              name="currency"
              label="Para Birimi"
              rules={[{ required: true, message: 'Para birimi zorunludur' }]}
              className="col-span-2"
            >
              <Select
                options={currencies}
                className="[&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
              />
            </Form.Item>

            <Form.Item
              name="paymentDate"
              label="Ödeme Tarihi"
              rules={[{ required: true, message: 'Ödeme tarihi zorunludur' }]}
              className="col-span-3"
            >
              <DatePicker
                format="DD.MM.YYYY"
                placeholder="Tarih seçin"
                className="w-full !bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900"
              />
            </Form.Item>

            <Form.Item
              name="paymentMethod"
              label="Ödeme Yöntemi"
              rules={[{ required: true, message: 'Ödeme yöntemi zorunludur' }]}
              className="col-span-3"
            >
              <Select
                options={paymentMethods}
                className="[&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
              />
            </Form.Item>

            <Form.Item
              name="paymentReference"
              label="Referans No"
              className="col-span-4"
            >
              <Input
                placeholder="İşlem referans numarası"
                className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900"
              />
            </Form.Item>
          </div>
        </div>

        {/* Bank Transfer Details */}
        {showBankFields && (
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100 flex items-center gap-2">
              <BuildingLibraryIcon className="w-4 h-4" />
              Banka Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <Form.Item
                name="bankName"
                label="Banka Adı"
                className="col-span-6"
              >
                <Input
                  placeholder="Banka adı"
                  className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900"
                />
              </Form.Item>

              <Form.Item
                name="bankAccountNumber"
                label="Hesap No / IBAN"
                className="col-span-6"
              >
                <Input
                  placeholder="TR00 0000 0000 0000 0000 0000 00"
                  className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900"
                />
              </Form.Item>
            </div>
          </div>
        )}

        {/* Check Details */}
        {showCheckFields && (
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100 flex items-center gap-2">
              <DocumentTextIcon className="w-4 h-4" />
              Çek Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <Form.Item
                name="checkNumber"
                label="Çek No"
                className="col-span-4"
              >
                <Input
                  placeholder="Çek numarası"
                  className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900"
                />
              </Form.Item>

              <Form.Item
                name="checkDate"
                label="Çek Vadesi"
                className="col-span-4"
              >
                <DatePicker
                  format="DD.MM.YYYY"
                  placeholder="Vade tarihi"
                  className="w-full !bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900"
                />
              </Form.Item>

              <Form.Item
                name="bankName"
                label="Banka Adı"
                className="col-span-4"
              >
                <Input
                  placeholder="Keşideci banka"
                  className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900"
                />
              </Form.Item>
            </div>
          </div>
        )}

        {/* Notes Section */}
        <div className="mb-8">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100 flex items-center gap-2">
            <DocumentTextIcon className="w-4 h-4" />
            Notlar
          </h3>
          <Form.Item name="notes" className="col-span-12 mb-0">
            <Input.TextArea
              rows={3}
              placeholder="Ek notlar..."
              className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900"
            />
          </Form.Item>
        </div>

        {/* Status Info - View Mode */}
        {isViewMode && initialData && (
          <div className="mb-8 p-4 bg-slate-50 rounded-lg">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-200">
              Durum Bilgileri
            </h3>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-slate-500">Durum:</span>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                  initialData.status === 'Captured' ? 'bg-green-100 text-green-800' :
                  initialData.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                  initialData.status === 'Refunded' ? 'bg-red-100 text-red-800' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {initialData.status}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Kullanılan:</span>
                <span className="ml-2 font-medium">{initialData.appliedAmount.toLocaleString('tr-TR')} {initialData.currency}</span>
              </div>
              <div>
                <span className="text-slate-500">Kalan:</span>
                <span className="ml-2 font-medium">{initialData.remainingAmount.toLocaleString('tr-TR')} {initialData.currency}</span>
              </div>
              <div>
                <span className="text-slate-500">Makbuz:</span>
                <span className="ml-2">{initialData.receiptIssued ? 'Kesildi' : 'Kesilmedi'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        {!isViewMode && (
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <Button size="large">İptal</Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={isSubmitting}
              className="!bg-slate-900 hover:!bg-slate-800"
            >
              {isEditMode ? 'Güncelle' : 'Kaydet'}
            </Button>
          </div>
        )}
      </Form>
    </div>
  );
}

export default AdvancePaymentForm;
