'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, Select, Switch, InputNumber } from 'antd';
import { BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import type { SupplierDto } from '@/lib/api/services/purchase.types';

const { TextArea } = Input;

interface SupplierFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: SupplierDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

const supplierTypeOptions = [
  { value: 'Manufacturer', label: 'Üretici' },
  { value: 'Distributor', label: 'Distribütör' },
  { value: 'Wholesaler', label: 'Toptancı' },
  { value: 'Retailer', label: 'Perakendeci' },
  { value: 'ServiceProvider', label: 'Hizmet Sağlayıcı' },
  { value: 'Contractor', label: 'Yüklenici' },
  { value: 'Other', label: 'Diğer' },
];

const paymentTermOptions = [
  { value: 'Prepaid', label: 'Peşin' },
  { value: 'Net15', label: 'Net 15 Gün' },
  { value: 'Net30', label: 'Net 30 Gün' },
  { value: 'Net45', label: 'Net 45 Gün' },
  { value: 'Net60', label: 'Net 60 Gün' },
  { value: 'Net90', label: 'Net 90 Gün' },
  { value: 'Custom', label: 'Özel' },
];

const currencyOptions = [
  { value: 'TRY', label: 'TRY' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'GBP', label: 'GBP' },
];

export default function SupplierForm({ form, initialValues, onFinish, loading }: SupplierFormProps) {
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
      setIsActive(initialValues.status === 'Active');
    } else {
      form.setFieldsValue({
        status: 'Active',
        supplierType: 'Distributor',
        currency: 'TRY',
        paymentTerms: 'Net30',
        creditLimit: 0,
        rating: 0,
        country: 'Türkiye',
      });
    }
  }, [form, initialValues]);

  const handleStatusChange = (checked: boolean) => {
    setIsActive(checked);
    form.setFieldValue('status', checked ? 'Active' : 'Inactive');
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
            {/* Supplier Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <BuildingStorefrontIcon className="w-6 h-6 text-slate-500" />
              </div>
            </div>

            {/* Supplier Name - Title Style */}
            <div className="flex-1">
              <Form.Item
                name="name"
                rules={[
                  { required: true, message: 'Tedarikçi adı zorunludur' },
                  { max: 200, message: 'Tedarikçi adı en fazla 200 karakter olabilir' },
                ]}
                className="mb-0"
              >
                <Input
                  placeholder="Tedarikçi Adı Girin..."
                  variant="borderless"
                  className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
                />
              </Form.Item>
              <Form.Item name="description" className="mb-0 mt-1">
                <Input
                  placeholder="Tedarikçi hakkında kısa açıklama..."
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
                    onChange={handleStatusChange}
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

          {/* ─────────────── TEMEL BİLGİLER ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Temel Bilgiler
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Tedarikçi Kodu <span className="text-red-500">*</span></label>
                <Form.Item
                  name="code"
                  rules={[{ required: true, message: 'Tedarikçi kodu zorunludur' }]}
                  className="mb-0"
                >
                  <Input
                    placeholder="SUP-001"
                    disabled={!!initialValues}
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Tedarikçi Tipi <span className="text-red-500">*</span></label>
                <Form.Item
                  name="supplierType"
                  rules={[{ required: true, message: 'Tedarikçi tipi zorunludur' }]}
                  className="mb-0"
                >
                  <Select
                    placeholder="Tip seçin"
                    options={supplierTypeOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Para Birimi</label>
                <Form.Item name="currency" className="mb-0">
                  <Select
                    placeholder="Para birimi"
                    options={currencyOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Vergi No</label>
                <Form.Item name="taxNumber" className="mb-0">
                  <Input
                    placeholder="Vergi numarası"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Vergi Dairesi</label>
                <Form.Item name="taxOffice" className="mb-0">
                  <Input
                    placeholder="Vergi dairesi"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── İLETİŞİM BİLGİLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              İletişim Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">İlgili Kişi</label>
                <Form.Item name="contactPerson" className="mb-0">
                  <Input
                    placeholder="Ad Soyad"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Ünvan</label>
                <Form.Item name="contactTitle" className="mb-0">
                  <Input
                    placeholder="Ünvan / Pozisyon"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">E-posta <span className="text-red-500">*</span></label>
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: 'E-posta zorunludur' },
                    { type: 'email', message: 'Geçerli e-posta girin' },
                  ]}
                  className="mb-0"
                >
                  <Input
                    placeholder="ornek@firma.com"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Telefon</label>
                <Form.Item name="phone" className="mb-0">
                  <Input
                    placeholder="+90 (___) ___ __ __"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Faks</label>
                <Form.Item name="fax" className="mb-0">
                  <Input
                    placeholder="Faks numarası"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
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
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Adres</label>
                <Form.Item name="address" className="mb-0">
                  <TextArea
                    rows={2}
                    placeholder="Açık adres"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white !resize-none"
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">İlçe</label>
                <Form.Item name="district" className="mb-0">
                  <Input
                    placeholder="İlçe"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Şehir</label>
                <Form.Item name="city" className="mb-0">
                  <Input
                    placeholder="Şehir"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Posta Kodu</label>
                <Form.Item name="postalCode" className="mb-0">
                  <Input
                    placeholder="34000"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Ülke</label>
                <Form.Item name="country" className="mb-0">
                  <Input
                    placeholder="Ülke"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── FİNANSAL BİLGİLER ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Finansal Bilgiler
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Ödeme Vadesi</label>
                <Form.Item name="paymentTerms" className="mb-0">
                  <Select
                    placeholder="Vade seçin"
                    options={paymentTermOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Kredi Limiti</label>
                <Form.Item name="creditLimit" className="mb-0">
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    placeholder="0"
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value: string | undefined) => Number(value?.replace(/,/g, '') ?? 0)}
                    className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">İndirim Oranı (%)</label>
                <Form.Item name="discountRate" className="mb-0">
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    max={100}
                    placeholder="0"
                    className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Banka Adı</label>
                <Form.Item name="bankName" className="mb-0">
                  <Input
                    placeholder="Banka adı"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Hesap Numarası</label>
                <Form.Item name="bankAccountNumber" className="mb-0">
                  <Input
                    placeholder="Hesap numarası"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">IBAN</label>
                <Form.Item name="iban" className="mb-0">
                  <Input
                    placeholder="TR00 0000 0000 0000 0000 0000 00"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── NOTLAR ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Notlar
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Genel Notlar</label>
                <Form.Item name="notes" className="mb-0">
                  <TextArea
                    rows={3}
                    placeholder="Tedarikçi hakkında notlar..."
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white !resize-none"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Dahili Notlar</label>
                <Form.Item name="internalNotes" className="mb-0">
                  <TextArea
                    rows={3}
                    placeholder="Sadece internal kullanım için notlar..."
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white !resize-none"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── İSTATİSTİKLER (Düzenleme Modu) ─────────────── */}
          {initialValues && (
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                İstatistikler
              </h3>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-3">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <div className="text-2xl font-semibold text-slate-800">
                      {initialValues.creditLimit?.toLocaleString('tr-TR') || '0'}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Kredi Limiti ({initialValues.currency})</div>
                  </div>
                </div>
                <div className="col-span-3">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <div className="text-2xl font-semibold text-slate-800">
                      {initialValues.currentBalance?.toLocaleString('tr-TR') || '0'}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Güncel Bakiye ({initialValues.currency})</div>
                  </div>
                </div>
                <div className="col-span-3">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-center">
                    <div className="text-2xl font-semibold text-blue-600">
                      {initialValues.rating?.toFixed(1) || '0.0'}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Puan</div>
                  </div>
                </div>
                <div className="col-span-3">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-center">
                    <div className="text-2xl font-semibold text-green-600">
                      %{initialValues.discountRate || 0}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">İndirim Oranı</div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Hidden submit button */}
      <Form.Item hidden>
        <button type="submit" />
      </Form.Item>
    </Form>
  );
}
