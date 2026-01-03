'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Select, DatePicker } from 'antd';
import { ShareIcon, UserIcon } from '@heroicons/react/24/outline';
import type { ReferralDto } from '@/lib/api/services/crm.types';
import { ReferralType, ReferralStatus, ReferralRewardType } from '@/lib/api/services/crm.types';
import { useCustomers } from '@/lib/api/hooks/useCRM';
import { FormPhoneInput } from '@/components/ui/InternationalPhoneInput';
import dayjs from 'dayjs';

const { TextArea } = Input;

// Referral type options
const referralTypeOptions = [
  { value: ReferralType.Customer, label: 'Müşteri' },
  { value: ReferralType.Partner, label: 'Partner' },
  { value: ReferralType.Employee, label: 'Çalışan' },
  { value: ReferralType.Influencer, label: 'Influencer' },
  { value: ReferralType.Affiliate, label: 'Affiliate' },
  { value: ReferralType.Other, label: 'Diğer' },
];

// Reward type options
const rewardTypeOptions = [
  { value: ReferralRewardType.Cash, label: 'Nakit' },
  { value: ReferralRewardType.Discount, label: 'İndirim' },
  { value: ReferralRewardType.Points, label: 'Puan' },
  { value: ReferralRewardType.Credit, label: 'Kredi' },
  { value: ReferralRewardType.Gift, label: 'Hediye' },
  { value: ReferralRewardType.FreeProduct, label: 'Ücretsiz Ürün' },
  { value: ReferralRewardType.FreeService, label: 'Ücretsiz Hizmet' },
];

// Status options
const statusOptions = [
  { value: ReferralStatus.New, label: 'Yeni' },
  { value: ReferralStatus.Contacted, label: 'İletişime Geçildi' },
  { value: ReferralStatus.Qualified, label: 'Nitelikli' },
  { value: ReferralStatus.Converted, label: 'Dönüştürüldü' },
  { value: ReferralStatus.Rejected, label: 'Reddedildi' },
  { value: ReferralStatus.Expired, label: 'Süresi Doldu' },
];

// Currency options
const currencyOptions = [
  { value: 'TRY', label: '₺ TRY' },
  { value: 'USD', label: '$ USD' },
  { value: 'EUR', label: '€ EUR' },
  { value: 'GBP', label: '£ GBP' },
];

interface ReferralFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: ReferralDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function ReferralForm({ form, initialValues, onFinish, loading }: ReferralFormProps) {
  const [referralType, setReferralType] = useState<ReferralType>(ReferralType.Customer);
  const { data: customersData } = useCustomers({ pageSize: 100 });
  const customers = customersData?.items || [];

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        expiryDate: initialValues.expiryDate ? dayjs(initialValues.expiryDate) : undefined,
      });
      setReferralType(initialValues.referralType || ReferralType.Customer);
    } else {
      form.setFieldsValue({
        referralType: ReferralType.Customer,
        status: ReferralStatus.New,
        rewardType: ReferralRewardType.Points,
        currency: 'TRY',
      });
    }
  }, [form, initialValues]);

  const handleFormFinish = (values: any) => {
    if (values.expiryDate) {
      values.expiryDate = values.expiryDate.format('YYYY-MM-DD');
    }
    onFinish(values);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFormFinish}
      disabled={loading}
      className="w-full"
      scrollToFirstError={{ behavior: 'smooth', block: 'center' }}
    >
      {/* Main Card */}
      <div className="bg-white border border-slate-200 rounded-xl">

        {/* ═══════════════════════════════════════════════════════════════
            HEADER: Icon + Name + Type Selector
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Referral Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <ShareIcon className="w-5 h-5 text-slate-500" />
              </div>
            </div>

            {/* Referrer Name - Title Style */}
            <div className="flex-1">
              <Form.Item
                name="referrerName"
                rules={[{ required: true, message: 'Referans veren adı zorunludur' }]}
                className="mb-0"
              >
                <Input
                  placeholder="Referans Veren Adı Girin..."
                  variant="borderless"
                  className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
                />
              </Form.Item>
            </div>

            {/* Type Selector */}
            <div className="flex-shrink-0">
              <Form.Item name="referralType" className="mb-0" initialValue={ReferralType.Customer}>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setReferralType(ReferralType.Customer);
                      form.setFieldValue('referralType', ReferralType.Customer);
                    }}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      referralType === ReferralType.Customer
                        ? 'bg-white shadow-sm text-slate-900'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Müşteri
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReferralType(ReferralType.Partner);
                      form.setFieldValue('referralType', ReferralType.Partner);
                    }}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      referralType === ReferralType.Partner
                        ? 'bg-white shadow-sm text-slate-900'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Partner
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReferralType(ReferralType.Employee);
                      form.setFieldValue('referralType', ReferralType.Employee);
                    }}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      referralType === ReferralType.Employee
                        ? 'bg-white shadow-sm text-slate-900'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Çalışan
                  </button>
                </div>
              </Form.Item>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            FORM BODY: High-Density Grid Layout
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6">

          {/* ─────────────── REFERANS VEREN ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Referans Veren Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">E-posta</label>
                <Form.Item name="referrerEmail" className="mb-0">
                  <Input
                    placeholder="ornek@firma.com"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Telefon</label>
                <Form.Item name="referrerPhone" className="mb-0">
                  <FormPhoneInput defaultCountry="TR" />
                </Form.Item>
              </div>
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Mevcut Müşteri</label>
                <Form.Item name="referrerCustomerId" className="mb-0">
                  <Select
                    placeholder="Müşteri seçin (opsiyonel)"
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    options={customers.map(c => ({ value: c.id, label: c.companyName }))}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── REFERANS EDİLEN ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Referans Edilen Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Ad Soyad <span className="text-red-500">*</span></label>
                <Form.Item
                  name="referredName"
                  rules={[{ required: true, message: 'Referans edilen adı zorunludur' }]}
                  className="mb-0"
                >
                  <Input
                    placeholder="—"
                    prefix={<UserIcon className="w-4 h-4 text-slate-400" />}
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Firma</label>
                <Form.Item name="referredCompany" className="mb-0">
                  <Input
                    placeholder="—"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">E-posta</label>
                <Form.Item name="referredEmail" className="mb-0">
                  <Input
                    placeholder="ornek@firma.com"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Telefon</label>
                <Form.Item name="referredPhone" className="mb-0">
                  <FormPhoneInput defaultCountry="TR" />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── ÖDÜL BİLGİLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Ödül Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Ödül Tipi</label>
                <Form.Item name="rewardType" className="mb-0" initialValue={ReferralRewardType.Points}>
                  <Select
                    placeholder="Seçin"
                    options={rewardTypeOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Referrer Ödülü</label>
                <Form.Item name="referrerReward" className="mb-0">
                  <InputNumber
                    placeholder="100"
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                    min={0}
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Referred Ödülü</label>
                <Form.Item name="referredReward" className="mb-0">
                  <InputNumber
                    placeholder="50"
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                    min={0}
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Para Birimi</label>
                <Form.Item name="currency" className="mb-0" initialValue="TRY">
                  <Select
                    placeholder="Seçin"
                    options={currencyOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── DURUM ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Durum
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Referans Durumu</label>
                <Form.Item name="status" className="mb-0" initialValue={ReferralStatus.New}>
                  <Select
                    options={statusOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Son Geçerlilik Tarihi</label>
                <Form.Item name="expiryDate" className="mb-0">
                  <DatePicker
                    format="DD/MM/YYYY"
                    placeholder="Tarih seçin"
                    className="!w-full [&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── NOTLAR ─────────────── */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Notlar
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <Form.Item name="referralMessage" className="mb-0">
                  <TextArea
                    placeholder="Referans ile ilgili mesaj veya not..."
                    rows={3}
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white !resize-none"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Hidden submit button */}
      <Form.Item hidden>
        <button type="submit" />
      </Form.Item>
    </Form>
  );
}
