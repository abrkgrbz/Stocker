'use client';

import React, { forwardRef, useImperativeHandle } from 'react';
import { Form, Input, Select, InputNumber, Switch, Divider } from 'antd';
import {
  UserIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import type { CreateCurrentAccountDto, UpdateCurrentAccountDto, CurrentAccountType } from '@/lib/api/services/finance.types';
import { useCustomers } from '@/lib/api/hooks/useCRM';

export interface CurrentAccountFormRef {
  submit: () => void;
  reset: () => void;
}

export interface CurrentAccountFormData extends CreateCurrentAccountDto {}

interface CurrentAccountFormProps {
  initialValues?: Partial<CurrentAccountFormData>;
  onFinish: (values: CurrentAccountFormData) => void;
  loading?: boolean;
  mode?: 'create' | 'edit';
}

const CurrentAccountForm = forwardRef<CurrentAccountFormRef, CurrentAccountFormProps>(
  ({ initialValues, onFinish, loading = false, mode = 'create' }, ref) => {
    const [form] = Form.useForm();

    // Fetch customers for linking
    const { data: customersData, isLoading: customersLoading } = useCustomers({ pageSize: 100 });
    const customers = customersData?.items || [];

    useImperativeHandle(ref, () => ({
      submit: () => form.submit(),
      reset: () => form.resetFields(),
    }));

    const handleFinish = (values: any) => {
      const formData: CurrentAccountFormData = {
        ...values,
        creditLimit: values.creditLimit || 0,
      };
      onFinish(formData);
    };

    const accountTypeOptions = [
      { value: 'Customer', label: 'Müşteri' },
      { value: 'Supplier', label: 'Tedarikçi' },
      { value: 'Both', label: 'Müşteri & Tedarikçi' },
      { value: 'Employee', label: 'Çalışan' },
      { value: 'Other', label: 'Diğer' },
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
          accountType: 'Customer',
          currency: 'TRY',
          creditLimit: 0,
          isActive: true,
          isBlocked: false,
          ...initialValues,
        }}
        className="space-y-6"
      >
        {/* Basic Information */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Temel Bilgiler</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="accountType"
              label="Hesap Türü"
              rules={[{ required: true, message: 'Hesap türü seçiniz' }]}
            >
              <Select options={accountTypeOptions} placeholder="Hesap türü seçin" size="large" />
            </Form.Item>

            <Form.Item
              name="accountCode"
              label="Hesap Kodu"
            >
              <Input placeholder="Otomatik oluşturulur" size="large" disabled={mode === 'create'} />
            </Form.Item>

            <Form.Item
              name="accountName"
              label="Hesap Adı"
              rules={[{ required: true, message: 'Hesap adı giriniz' }]}
              className="md:col-span-2"
            >
              <Input placeholder="Firma veya kişi adı" size="large" />
            </Form.Item>

            <Form.Item
              name="customerId"
              label="Bağlı Müşteri (CRM)"
            >
              <Select
                showSearch
                placeholder="Müşteri seçin (opsiyonel)"
                optionFilterProp="label"
                loading={customersLoading}
                size="large"
                allowClear
                options={customers.map((c: any) => ({
                  value: c.id,
                  label: c.companyName || c.name,
                }))}
              />
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

        {/* Contact Information */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
              <EnvelopeIcon className="w-4 h-4 text-purple-600" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">İletişim Bilgileri</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="email"
              label="E-posta"
              rules={[{ type: 'email', message: 'Geçerli bir e-posta giriniz' }]}
            >
              <Input prefix={<EnvelopeIcon className="w-4 h-4 text-slate-400" />} placeholder="ornek@firma.com" size="large" />
            </Form.Item>

            <Form.Item name="phone" label="Telefon">
              <Input prefix={<PhoneIcon className="w-4 h-4 text-slate-400" />} placeholder="+90 5XX XXX XX XX" size="large" />
            </Form.Item>
          </div>

          <Form.Item name="address" label="Adres">
            <Input.TextArea rows={2} placeholder="Açık adres" />
          </Form.Item>
        </div>

        {/* Tax Information */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <BuildingOfficeIcon className="w-4 h-4 text-amber-600" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Vergi Bilgileri</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item name="taxNumber" label="Vergi Numarası">
              <Input placeholder="Vergi numarası" size="large" />
            </Form.Item>

            <Form.Item name="taxOffice" label="Vergi Dairesi">
              <Input placeholder="Vergi dairesi" size="large" />
            </Form.Item>
          </div>
        </div>

        {/* Financial Information */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <CurrencyDollarIcon className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Finansal Bilgiler</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item name="creditLimit" label="Kredi Limiti">
              <InputNumber
                className="w-full"
                size="large"
                min={0}
                formatter={(val) => `₺ ${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(val) => Number((val || '').replace(/₺\s?|(,*)/g, '')) as any}
                placeholder="0"
              />
            </Form.Item>

            <Form.Item name="paymentTermDays" label="Vade Süresi (Gün)">
              <InputNumber className="w-full" size="large" min={0} max={365} placeholder="30" />
            </Form.Item>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
              <DocumentTextIcon className="w-4 h-4 text-slate-600" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Durum</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item name="isActive" label="Aktif" valuePropName="checked">
              <Switch checkedChildren="Aktif" unCheckedChildren="Pasif" />
            </Form.Item>

            <Form.Item name="isBlocked" label="Bloke" valuePropName="checked">
              <Switch checkedChildren="Bloke" unCheckedChildren="Normal" />
            </Form.Item>
          </div>

          <Form.Item name="notes" label="Notlar">
            <Input.TextArea rows={3} placeholder="Cari hesap ile ilgili notlar..." />
          </Form.Item>
        </div>
      </Form>
    );
  }
);

CurrentAccountForm.displayName = 'CurrentAccountForm';

export default CurrentAccountForm;
