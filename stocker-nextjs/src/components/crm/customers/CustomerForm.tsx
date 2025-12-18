'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Select } from 'antd';
import {
  UserOutlined,
  BankOutlined,
  CameraOutlined,
} from '@ant-design/icons';
import type { Customer } from '@/lib/api/services/crm.service';
import { getCityNames, getDistrictsByCity } from '@/lib/data/turkey-cities';
import { FormPhoneInput } from '@/components/ui/InternationalPhoneInput';

const { TextArea } = Input;

// Customer status options
const statusOptions = [
  { value: 'Active', label: 'Aktif' },
  { value: 'Inactive', label: 'Pasif' },
  { value: 'Potential', label: 'Potansiyel' },
];

// Payment terms options
const paymentTermsOptions = [
  { value: 'Immediate', label: 'Peşin' },
  { value: '15 Days', label: '15 Gün' },
  { value: '30 Days', label: '30 Gün' },
  { value: '45 Days', label: '45 Gün' },
  { value: '60 Days', label: '60 Gün' },
  { value: '90 Days', label: '90 Gün' },
];

interface CustomerFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: Customer;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function CustomerForm({ form, initialValues, onFinish, loading }: CustomerFormProps) {
  const [customerType, setCustomerType] = useState<string>('Corporate');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [districts, setDistricts] = useState<string[]>([]);

  const cityNames = getCityNames();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        country: initialValues.country || 'Türkiye',
      });
      setCustomerType(initialValues.customerType || 'Corporate');
      if (initialValues.city) {
        setSelectedCity(initialValues.city);
        setDistricts(getDistrictsByCity(initialValues.city));
      }
    } else {
      form.setFieldsValue({
        customerType: 'Corporate',
        status: 'Active',
        country: 'Türkiye',
        creditLimit: 0,
      });
    }
  }, [form, initialValues]);

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    const cityDistricts = getDistrictsByCity(city);
    setDistricts(cityDistricts);
    form.setFieldsValue({ state: undefined });
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
            HEADER: Logo + Name + Type Selector (Inline)
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Logo Upload */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-slate-400 hover:bg-slate-200 transition-all">
                {customerType === 'Corporate' ? (
                  <BankOutlined className="text-xl text-slate-500" />
                ) : (
                  <UserOutlined className="text-xl text-slate-500" />
                )}
              </div>
            </div>

            {/* Company/Customer Name - Title Style */}
            <div className="flex-1">
              <Form.Item
                name="companyName"
                rules={[{ required: true, message: 'Müşteri adı zorunludur' }]}
                className="mb-0"
              >
                <Input
                  placeholder={customerType === 'Corporate' ? 'Firma Adı Girin...' : 'Ad Soyad Girin...'}
                  variant="borderless"
                  className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
                />
              </Form.Item>
            </div>

            {/* Type Selector */}
            <div className="flex-shrink-0">
              <Form.Item name="customerType" className="mb-0" initialValue="Corporate">
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerType('Corporate');
                      form.setFieldValue('customerType', 'Corporate');
                    }}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                      customerType === 'Corporate'
                        ? 'bg-white shadow-sm text-slate-900'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Kurumsal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerType('Individual');
                      form.setFieldValue('customerType', 'Individual');
                    }}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                      customerType === 'Individual'
                        ? 'bg-white shadow-sm text-slate-900'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Bireysel
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

          {/* ─────────────── İLETİŞİM BİLGİLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              İletişim Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">İrtibat Kişisi</label>
                <Form.Item name="contactPerson" className="mb-0">
                  <Input
                    placeholder="—"
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
                    { type: 'email', message: 'Geçerli bir e-posta adresi girin' },
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
                  <FormPhoneInput defaultCountry="TR" />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Web Sitesi</label>
                <Form.Item name="website" className="mb-0">
                  <Input
                    placeholder="https://"
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
                    placeholder="Sokak, mahalle, bina no..."
                    rows={2}
                    maxLength={200}
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white !resize-none"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Şehir</label>
                <Form.Item name="city" className="mb-0">
                  <Select
                    placeholder="Seçin"
                    showSearch
                    optionFilterProp="children"
                    onChange={handleCityChange}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white [&_.ant-select-focused_.ant-select-selector]:!shadow-none"
                  >
                    {cityNames.map((city) => (
                      <Select.Option key={city} value={city}>{city}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">İlçe</label>
                <Form.Item name="state" className="mb-0">
                  <Select
                    placeholder={selectedCity ? 'Seçin' : '—'}
                    showSearch
                    optionFilterProp="children"
                    disabled={!selectedCity}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  >
                    {districts.map((district) => (
                      <Select.Option key={district} value={district}>{district}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Posta Kodu</label>
                <Form.Item name="postalCode" className="mb-0">
                  <Input
                    placeholder="34000"
                    maxLength={10}
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
            <Form.Item name="country" className="hidden" initialValue="Türkiye">
              <Input type="hidden" />
            </Form.Item>
          </div>

          {/* ─────────────── MALİ BİLGİLER ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Mali Bilgiler
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Vergi Numarası</label>
                <Form.Item
                  name="taxId"
                  rules={[{ pattern: /^[0-9]{10,11}$/, message: 'Geçerli bir vergi numarası girin (10-11 hane)' }]}
                  className="mb-0"
                >
                  <Input
                    placeholder="10-11 haneli"
                    maxLength={11}
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Vergi Dairesi</label>
                <Form.Item name="taxOffice" className="mb-0">
                  <Input
                    placeholder="—"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Kredi Limiti</label>
                <Form.Item name="creditLimit" className="mb-0" initialValue={0}>
                  <InputNumber
                    className="!w-full [&_.ant-input-number]:!bg-slate-50 [&_.ant-input-number]:!border-slate-300 [&_.ant-input-number:hover]:!border-slate-400 [&_.ant-input-number-focused]:!border-slate-900 [&_.ant-input-number-focused]:!bg-white"
                    formatter={(value) => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value?.replace(/₺\s?|(,*)/g, '') as any}
                    min={0}
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Ödeme Vadesi</label>
                <Form.Item name="paymentTerms" className="mb-0">
                  <Select
                    placeholder="Seçin"
                    options={paymentTermsOptions}
                    allowClear
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Durum</label>
                <Form.Item name="status" className="mb-0" initialValue="Active">
                  <Select
                    options={statusOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
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
                <Form.Item name="notes" className="mb-0">
                  <TextArea
                    placeholder="Müşteri hakkında ek notlar..."
                    rows={3}
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white !resize-none"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Hidden submit */}
      <Form.Item hidden>
        <button type="submit" />
      </Form.Item>
    </Form>
  );
}
