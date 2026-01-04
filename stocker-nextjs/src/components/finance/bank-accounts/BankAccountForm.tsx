'use client';

import React, { forwardRef, useImperativeHandle } from 'react';
import { Form, Input, Select, InputNumber, Switch } from 'antd';
import {
  BuildingLibraryIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';
import type { CreateBankAccountDto, BankAccountType } from '@/lib/api/services/finance.types';

export interface BankAccountFormRef {
  submit: () => void;
  reset: () => void;
}

export interface BankAccountFormData extends CreateBankAccountDto {}

interface BankAccountFormProps {
  initialValues?: Partial<BankAccountFormData>;
  onFinish: (values: BankAccountFormData) => void;
  loading?: boolean;
  mode?: 'create' | 'edit';
}

const BankAccountForm = forwardRef<BankAccountFormRef, BankAccountFormProps>(
  ({ initialValues, onFinish, loading = false, mode = 'create' }, ref) => {
    const [form] = Form.useForm();

    useImperativeHandle(ref, () => ({
      submit: () => form.submit(),
      reset: () => form.resetFields(),
    }));

    const handleFinish = (values: any) => {
      const formData: BankAccountFormData = {
        ...values,
        openingBalance: values.openingBalance || 0,
      };
      onFinish(formData);
    };

    const accountTypeOptions = [
      { value: 'Checking', label: 'Vadesiz Hesap' },
      { value: 'Savings', label: 'Vadeli Hesap' },
      { value: 'Credit', label: 'Kredi Hesabı' },
      { value: 'Investment', label: 'Yatırım Hesabı' },
    ];

    const currencyOptions = [
      { value: 'TRY', label: 'Türk Lirası (TRY)' },
      { value: 'USD', label: 'Amerikan Doları (USD)' },
      { value: 'EUR', label: 'Euro (EUR)' },
      { value: 'GBP', label: 'İngiliz Sterlini (GBP)' },
    ];

    // Turkish banks list
    const bankOptions = [
      { value: 'Akbank', label: 'Akbank' },
      { value: 'Denizbank', label: 'Denizbank' },
      { value: 'Finansbank', label: 'QNB Finansbank' },
      { value: 'Garanti BBVA', label: 'Garanti BBVA' },
      { value: 'Halkbank', label: 'Halkbank' },
      { value: 'İş Bankası', label: 'Türkiye İş Bankası' },
      { value: 'TEB', label: 'TEB' },
      { value: 'Vakıfbank', label: 'Vakıfbank' },
      { value: 'Yapı Kredi', label: 'Yapı Kredi' },
      { value: 'Ziraat Bankası', label: 'Ziraat Bankası' },
      { value: 'Other', label: 'Diğer' },
    ];

    return (
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          accountType: 'Checking',
          currency: 'TRY',
          openingBalance: 0,
          isActive: true,
          ...initialValues,
        }}
        className="space-y-6"
      >
        {/* Bank Information */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <BuildingLibraryIcon className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Banka Bilgileri</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="bankName"
              label="Banka"
              rules={[{ required: true, message: 'Banka seçiniz' }]}
            >
              <Select
                showSearch
                options={bankOptions}
                placeholder="Banka seçin"
                size="large"
                optionFilterProp="label"
              />
            </Form.Item>

            <Form.Item
              name="branchName"
              label="Şube Adı"
            >
              <Input placeholder="Şube adı" size="large" />
            </Form.Item>

            <Form.Item
              name="branchCode"
              label="Şube Kodu"
            >
              <Input placeholder="Şube kodu" size="large" />
            </Form.Item>

            <Form.Item
              name="accountType"
              label="Hesap Türü"
              rules={[{ required: true, message: 'Hesap türü seçiniz' }]}
            >
              <Select options={accountTypeOptions} placeholder="Hesap türü seçin" size="large" />
            </Form.Item>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
              <CreditCardIcon className="w-4 h-4 text-purple-600" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Hesap Bilgileri</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="accountName"
              label="Hesap Adı"
              rules={[{ required: true, message: 'Hesap adı giriniz' }]}
            >
              <Input placeholder="Hesap adı (örn: Ana Ticari Hesap)" size="large" />
            </Form.Item>

            <Form.Item
              name="currency"
              label="Para Birimi"
              rules={[{ required: true, message: 'Para birimi seçiniz' }]}
            >
              <Select options={currencyOptions} placeholder="Para birimi seçin" size="large" />
            </Form.Item>

            <Form.Item
              name="accountNumber"
              label="Hesap Numarası"
            >
              <Input placeholder="Hesap numarası" size="large" />
            </Form.Item>

            <Form.Item
              name="iban"
              label="IBAN"
              rules={[
                {
                  pattern: /^TR\d{24}$|^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/,
                  message: 'Geçerli bir IBAN giriniz'
                }
              ]}
            >
              <Input placeholder="TR00 0000 0000 0000 0000 0000 00" size="large" />
            </Form.Item>

            <Form.Item
              name="swiftCode"
              label="SWIFT Kodu"
            >
              <Input placeholder="SWIFT/BIC kodu" size="large" />
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
            <Form.Item
              name="openingBalance"
              label="Açılış Bakiyesi"
            >
              <InputNumber
                className="w-full"
                size="large"
                formatter={(val) => `₺ ${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(val) => Number((val || '').replace(/₺\s?|(,*)/g, '')) as any}
                placeholder="0"
              />
            </Form.Item>

            <Form.Item
              name="creditLimit"
              label="Kredi Limiti"
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
          </div>
        </div>

        {/* Status */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
              <DocumentTextIcon className="w-4 h-4 text-slate-600" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Durum & Notlar</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item name="isActive" label="Aktif" valuePropName="checked">
              <Switch checkedChildren="Aktif" unCheckedChildren="Pasif" />
            </Form.Item>

            <Form.Item name="isDefault" label="Varsayılan Hesap" valuePropName="checked">
              <Switch checkedChildren="Evet" unCheckedChildren="Hayır" />
            </Form.Item>
          </div>

          <Form.Item name="description" label="Açıklama">
            <Input.TextArea rows={3} placeholder="Hesap ile ilgili notlar..." />
          </Form.Item>
        </div>
      </Form>
    );
  }
);

BankAccountForm.displayName = 'BankAccountForm';

export default BankAccountForm;
