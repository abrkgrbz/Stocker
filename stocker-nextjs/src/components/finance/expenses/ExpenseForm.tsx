'use client';

import React, { forwardRef, useImperativeHandle } from 'react';
import { Form, Input, Select, InputNumber, DatePicker, Upload, Switch } from 'antd';
import {
  DocumentTextIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserIcon,
  ReceiptPercentIcon,
  PaperClipIcon,
} from '@heroicons/react/24/outline';
import type { CreateExpenseDto, ExpenseCategory, ExpenseStatus } from '@/lib/api/services/finance.types';
import { useSuppliers } from '@/lib/api/hooks/usePurchase';
import { useBankAccounts } from '@/lib/api/hooks/useFinance';
import dayjs from 'dayjs';

export interface ExpenseFormRef {
  submit: () => void;
  reset: () => void;
}

export interface ExpenseFormData extends CreateExpenseDto {}

interface ExpenseFormProps {
  initialValues?: Partial<ExpenseFormData>;
  onFinish: (values: ExpenseFormData) => void;
  loading?: boolean;
  mode?: 'create' | 'edit';
}

const ExpenseForm = forwardRef<ExpenseFormRef, ExpenseFormProps>(
  ({ initialValues, onFinish, loading = false, mode = 'create' }, ref) => {
    const [form] = Form.useForm();

    // Fetch suppliers and bank accounts
    const { data: suppliersData, isLoading: suppliersLoading } = useSuppliers({ pageSize: 100 });
    const { data: bankAccountsData, isLoading: bankAccountsLoading } = useBankAccounts({ pageSize: 100 });

    const suppliers = suppliersData?.items || [];
    const bankAccounts = bankAccountsData?.items || [];

    useImperativeHandle(ref, () => ({
      submit: () => form.submit(),
      reset: () => form.resetFields(),
    }));

    const handleFinish = (values: any) => {
      const formData: ExpenseFormData = {
        ...values,
        expenseDate: values.expenseDate?.toISOString(),
        dueDate: values.dueDate?.toISOString(),
        paymentDate: values.paymentDate?.toISOString(),
      };
      onFinish(formData);
    };

    const categoryOptions = [
      { value: 'Rent', label: 'Kira' },
      { value: 'Utilities', label: 'Faturalar (Su, Elektrik, Doğalgaz)' },
      { value: 'Salaries', label: 'Maaşlar' },
      { value: 'Marketing', label: 'Pazarlama' },
      { value: 'Travel', label: 'Seyahat' },
      { value: 'Supplies', label: 'Ofis Malzemeleri' },
      { value: 'Equipment', label: 'Ekipman' },
      { value: 'Maintenance', label: 'Bakım & Onarım' },
      { value: 'Insurance', label: 'Sigorta' },
      { value: 'Taxes', label: 'Vergiler' },
      { value: 'Other', label: 'Diğer' },
    ];

    const paymentMethodOptions = [
      { value: 'Cash', label: 'Nakit' },
      { value: 'BankTransfer', label: 'Banka Havalesi' },
      { value: 'CreditCard', label: 'Kredi Kartı' },
      { value: 'Check', label: 'Çek' },
      { value: 'Other', label: 'Diğer' },
    ];

    const kdvRateOptions = [
      { value: 0, label: '%0' },
      { value: 1, label: '%1' },
      { value: 10, label: '%10' },
      { value: 20, label: '%20' },
    ];

    const currencyOptions = [
      { value: 'TRY', label: 'Türk Lirası (TRY)' },
      { value: 'USD', label: 'Amerikan Doları (USD)' },
      { value: 'EUR', label: 'Euro (EUR)' },
    ];

    return (
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          category: 'Other',
          currency: 'TRY',
          kdvRate: 20,
          expenseDate: dayjs(),
          isPaid: false,
          ...initialValues,
          expenseDate: initialValues?.expenseDate ? dayjs(initialValues.expenseDate) : dayjs(),
          dueDate: initialValues?.dueDate ? dayjs(initialValues.dueDate) : undefined,
          paymentDate: initialValues?.paymentDate ? dayjs(initialValues.paymentDate) : undefined,
        }}
        className="space-y-6"
      >
        {/* Basic Information */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <DocumentTextIcon className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Gider Bilgileri</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="category"
              label="Kategori"
              rules={[{ required: true, message: 'Kategori seçiniz' }]}
            >
              <Select options={categoryOptions} placeholder="Kategori seçin" size="large" />
            </Form.Item>

            <Form.Item
              name="expenseNumber"
              label="Gider No"
            >
              <Input placeholder="Otomatik oluşturulur" size="large" disabled={mode === 'create'} />
            </Form.Item>

            <Form.Item
              name="description"
              label="Açıklama"
              rules={[{ required: true, message: 'Açıklama giriniz' }]}
              className="md:col-span-2"
            >
              <Input placeholder="Gider açıklaması" size="large" />
            </Form.Item>

            <Form.Item
              name="expenseDate"
              label="Gider Tarihi"
              rules={[{ required: true, message: 'Gider tarihi seçiniz' }]}
            >
              <DatePicker className="w-full" format="DD/MM/YYYY" size="large" />
            </Form.Item>

            <Form.Item
              name="dueDate"
              label="Vade Tarihi"
            >
              <DatePicker className="w-full" format="DD/MM/YYYY" size="large" />
            </Form.Item>
          </div>
        </div>

        {/* Supplier Information */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-purple-600" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Tedarikçi Bilgileri</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="supplierId"
              label="Tedarikçi"
            >
              <Select
                showSearch
                placeholder="Tedarikçi seçin (opsiyonel)"
                optionFilterProp="label"
                loading={suppliersLoading}
                size="large"
                allowClear
                options={suppliers.map((s: any) => ({
                  value: s.id,
                  label: s.name || s.companyName,
                }))}
              />
            </Form.Item>

            <Form.Item
              name="supplierName"
              label="Tedarikçi Adı"
            >
              <Input placeholder="Tedarikçi adı" size="large" />
            </Form.Item>

            <Form.Item
              name="invoiceNumber"
              label="Fatura Numarası"
            >
              <Input placeholder="Tedarikçi fatura numarası" size="large" />
            </Form.Item>

            <Form.Item
              name="receiptNumber"
              label="Fiş Numarası"
            >
              <Input placeholder="Fiş numarası" size="large" />
            </Form.Item>
          </div>
        </div>

        {/* Financial Information */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <CurrencyDollarIcon className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Tutar Bilgileri</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item
              name="amount"
              label="Tutar (KDV Hariç)"
              rules={[{ required: true, message: 'Tutar giriniz' }]}
            >
              <InputNumber
                className="w-full"
                size="large"
                min={0}
                formatter={(val) => `₺ ${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(val) => Number((val || '').replace(/₺\s?|(,*)/g, '')) as any}
                placeholder="0"
              />
            </Form.Item>

            <Form.Item
              name="kdvRate"
              label="KDV Oranı"
            >
              <Select options={kdvRateOptions} placeholder="KDV oranı" size="large" />
            </Form.Item>

            <Form.Item
              name="currency"
              label="Para Birimi"
              rules={[{ required: true, message: 'Para birimi seçiniz' }]}
            >
              <Select options={currencyOptions} placeholder="Para birimi seçin" size="large" />
            </Form.Item>
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <ReceiptPercentIcon className="w-4 h-4 text-amber-600" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Ödeme Bilgileri</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item name="isPaid" label="Ödendi mi?" valuePropName="checked">
              <Switch checkedChildren="Ödendi" unCheckedChildren="Ödenmedi" />
            </Form.Item>

            <Form.Item
              name="paymentMethod"
              label="Ödeme Yöntemi"
            >
              <Select options={paymentMethodOptions} placeholder="Ödeme yöntemi" size="large" allowClear />
            </Form.Item>

            <Form.Item
              name="paymentDate"
              label="Ödeme Tarihi"
            >
              <DatePicker className="w-full" format="DD/MM/YYYY" size="large" />
            </Form.Item>

            <Form.Item
              name="bankAccountId"
              label="Banka Hesabı"
            >
              <Select
                showSearch
                placeholder="Banka hesabı seçin"
                optionFilterProp="label"
                loading={bankAccountsLoading}
                size="large"
                allowClear
                options={bankAccounts.map((b: any) => ({
                  value: b.id,
                  label: `${b.bankName} - ${b.accountName}`,
                }))}
              />
            </Form.Item>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
              <PaperClipIcon className="w-4 h-4 text-slate-600" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Ek Bilgiler</h3>
          </div>

          <Form.Item name="notes" label="Notlar">
            <Input.TextArea rows={3} placeholder="Gider ile ilgili notlar..." />
          </Form.Item>
        </div>
      </Form>
    );
  }
);

ExpenseForm.displayName = 'ExpenseForm';

export default ExpenseForm;
