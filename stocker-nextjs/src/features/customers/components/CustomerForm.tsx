'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, Select, Switch, InputNumber } from 'antd';
import { BuildingOfficeIcon, UserIcon } from '@heroicons/react/24/outline';
import { FormPhoneInput } from '@/components/ui/InternationalPhoneInput';

const { TextArea } = Input;

// Customer type options
const typeOptions = [
  { value: 'individual', label: 'Bireysel' },
  { value: 'corporate', label: 'Kurumsal' },
];

// Segment options
const segmentOptions = [
  { value: 'retail', label: 'Perakende' },
  { value: 'wholesale', label: 'Toptan' },
  { value: 'corporate', label: 'Kurumsal' },
  { value: 'vip', label: 'VIP' },
];

// Payment term options
const paymentTermOptions = [
  { value: 'immediate', label: 'Peşin' },
  { value: '15-days', label: '15 Gün' },
  { value: '30-days', label: '30 Gün' },
  { value: '45-days', label: '45 Gün' },
  { value: '60-days', label: '60 Gün' },
  { value: '90-days', label: '90 Gün' },
];

export interface CustomerFormData {
  type: 'individual' | 'corporate';
  status: 'active' | 'inactive' | 'blocked';
  segment: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  taxId?: string;
  taxOffice?: string;
  email: string;
  phone: string;
  mobilePhone?: string;
  website?: string;
  address: string;
  district: string;
  city: string;
  postalCode: string;
  country: string;
  iban?: string;
  creditLimit?: number;
  paymentTerm: string;
  notes?: string;
}

export interface CustomerFormProps {
  form: ReturnType<typeof Form.useForm<CustomerFormData>>[0];
  initialValues?: Partial<CustomerFormData>;
  onFinish: (data: CustomerFormData) => void;
  loading?: boolean;
}

export function CustomerForm({
  form,
  initialValues,
  onFinish,
  loading = false,
}: CustomerFormProps) {
  const [customerType, setCustomerType] = useState<'individual' | 'corporate'>('corporate');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
      setCustomerType(initialValues.type || 'corporate');
      setIsActive(initialValues.status === 'active');
    } else {
      form.setFieldsValue({
        type: 'corporate',
        status: 'active',
        country: 'Türkiye',
        paymentTerm: '30-days',
        segment: 'wholesale',
      });
    }
  }, [form, initialValues]);

  const handleTypeChange = (value: 'individual' | 'corporate') => {
    setCustomerType(value);
    form.setFieldValue('type', value);
    // Clear irrelevant fields
    if (value === 'individual') {
      form.setFieldsValue({ companyName: undefined, taxId: undefined, taxOffice: undefined });
    } else {
      form.setFieldsValue({ firstName: undefined, lastName: undefined });
    }
  };

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
      <div className="bg-white border border-slate-200 rounded-xl">

        {/* ═══════════════════════════════════════════════════════════════
            HEADER: Icon + Name + Status Toggle
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Customer Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                {customerType === 'corporate' ? (
                  <BuildingOfficeIcon className="w-6 h-6 text-slate-500" />
                ) : (
                  <UserIcon className="w-6 h-6 text-slate-500" />
                )}
              </div>
            </div>

            {/* Customer Name - Title Style */}
            <div className="flex-1">
              {customerType === 'corporate' ? (
                <Form.Item
                  name="companyName"
                  rules={[
                    { required: customerType === 'corporate', message: 'Firma adı zorunludur' },
                  ]}
                  className="mb-0"
                >
                  <Input
                    placeholder="Firma Adı Girin..."
                    variant="borderless"
                    className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
                  />
                </Form.Item>
              ) : (
                <div className="flex gap-4">
                  <Form.Item
                    name="firstName"
                    rules={[
                      { required: customerType === 'individual', message: 'Ad zorunludur' },
                    ]}
                    className="mb-0 flex-1"
                  >
                    <Input
                      placeholder="Ad"
                      variant="borderless"
                      className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
                    />
                  </Form.Item>
                  <Form.Item
                    name="lastName"
                    rules={[
                      { required: customerType === 'individual', message: 'Soyad zorunludur' },
                    ]}
                    className="mb-0 flex-1"
                  >
                    <Input
                      placeholder="Soyad"
                      variant="borderless"
                      className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
                    />
                  </Form.Item>
                </div>
              )}
              <Form.Item name="notes" className="mb-0 mt-1">
                <Input
                  placeholder="Müşteri hakkında kısa not..."
                  variant="borderless"
                  className="!text-sm !text-slate-500 !p-0 placeholder:!text-slate-400"
                />
              </Form.Item>
            </div>

            {/* Status Toggle */}
            <div className="flex-shrink-0">
              <div className="flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-lg">
                <span className="text-sm font-medium text-slate-600">
                  {isActive ? 'Aktif' : 'Pasif'}
                </span>
                <Form.Item name="status" noStyle>
                  <Switch
                    checked={isActive}
                    onChange={(val) => {
                      setIsActive(val);
                      form.setFieldValue('status', val ? 'active' : 'inactive');
                    }}
                  />
                </Form.Item>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            FORM BODY: High-Density Grid Layout
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6">

          {/* ─────────────── MÜŞTERİ TİPİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Müşteri Tipi
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Tip <span className="text-red-500">*</span></label>
                <Form.Item name="type" className="mb-0" initialValue="corporate">
                  <Select
                    options={typeOptions}
                    onChange={handleTypeChange}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Segment <span className="text-red-500">*</span></label>
                <Form.Item
                  name="segment"
                  rules={[{ required: true, message: 'Segment seçimi zorunludur' }]}
                  className="mb-0"
                  initialValue="wholesale"
                >
                  <Select
                    options={segmentOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              {customerType === 'corporate' && (
                <>
                  <div className="col-span-4">
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Vergi No <span className="text-red-500">*</span></label>
                    <Form.Item
                      name="taxId"
                      rules={[{ required: customerType === 'corporate', message: 'Vergi numarası zorunludur' }]}
                      className="mb-0"
                    >
                      <Input
                        placeholder="1234567890"
                        maxLength={11}
                        className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                      />
                    </Form.Item>
                  </div>
                  <div className="col-span-4">
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Vergi Dairesi</label>
                    <Form.Item name="taxOffice" className="mb-0">
                      <Input
                        placeholder="Kadıköy"
                        className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                      />
                    </Form.Item>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ─────────────── İLETİŞİM BİLGİLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              İletişim Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">E-posta <span className="text-red-500">*</span></label>
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: 'E-posta zorunludur' },
                    { type: 'email', message: 'Geçerli bir e-posta adresi girin' },
                  ]}
                  className="mb-0"
                >
                  <Input
                    placeholder="info@firma.com"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Telefon <span className="text-red-500">*</span></label>
                <Form.Item
                  name="phone"
                  rules={[{ required: true, message: 'Telefon zorunludur' }]}
                  className="mb-0"
                >
                  <FormPhoneInput defaultCountry="TR" />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Cep Telefonu</label>
                <Form.Item name="mobilePhone" className="mb-0">
                  <FormPhoneInput defaultCountry="TR" />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Web Sitesi</label>
                <Form.Item name="website" className="mb-0">
                  <Input
                    placeholder="https://www.firma.com"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── ADRES BİLGİLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Adres Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Adres <span className="text-red-500">*</span></label>
                <Form.Item
                  name="address"
                  rules={[{ required: true, message: 'Adres zorunludur' }]}
                  className="mb-0"
                >
                  <TextArea
                    placeholder="Açık adres bilgisi"
                    rows={2}
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white !resize-none"
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">İlçe <span className="text-red-500">*</span></label>
                <Form.Item
                  name="district"
                  rules={[{ required: true, message: 'İlçe zorunludur' }]}
                  className="mb-0"
                >
                  <Input
                    placeholder="Kadıköy"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Şehir <span className="text-red-500">*</span></label>
                <Form.Item
                  name="city"
                  rules={[{ required: true, message: 'Şehir zorunludur' }]}
                  className="mb-0"
                >
                  <Input
                    placeholder="İstanbul"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Posta Kodu <span className="text-red-500">*</span></label>
                <Form.Item
                  name="postalCode"
                  rules={[{ required: true, message: 'Posta kodu zorunludur' }]}
                  className="mb-0"
                >
                  <Input
                    placeholder="34000"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Ülke <span className="text-red-500">*</span></label>
                <Form.Item
                  name="country"
                  rules={[{ required: true, message: 'Ülke zorunludur' }]}
                  className="mb-0"
                  initialValue="Türkiye"
                >
                  <Input
                    placeholder="Türkiye"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── FİNANSAL BİLGİLER ─────────────── */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Finansal Bilgiler
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">IBAN</label>
                <Form.Item name="iban" className="mb-0">
                  <Input
                    placeholder="TR00 0000 0000 0000 0000 0000 00"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Kredi Limiti (₺)</label>
                <Form.Item name="creditLimit" className="mb-0">
                  <InputNumber
                    placeholder="0"
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value?.replace(/,/g, '') as any}
                    min={0}
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Ödeme Vadesi <span className="text-red-500">*</span></label>
                <Form.Item
                  name="paymentTerm"
                  rules={[{ required: true, message: 'Ödeme vadesi zorunludur' }]}
                  className="mb-0"
                  initialValue="30-days"
                >
                  <Select
                    options={paymentTermOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
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
