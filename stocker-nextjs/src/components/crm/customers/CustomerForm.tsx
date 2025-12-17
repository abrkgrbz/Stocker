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
      className="max-w-4xl mx-auto"
    >
      {/* Main Card */}
      <div className="bg-white border border-slate-200 rounded-xl">

        {/* ═══════════════════════════════════════════════════════════════
            HEADER: Logo + Name + Type Selector (Inline)
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6 border-b border-slate-100">
          <div className="flex items-center gap-6">
            {/* Logo Upload */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer hover:border-slate-300 hover:bg-slate-100 transition-all">
                {customerType === 'Corporate' ? (
                  <BankOutlined className="text-xl text-slate-400" />
                ) : (
                  <UserOutlined className="text-xl text-slate-400" />
                )}
              </div>
            </div>

            {/* Company/Customer Name */}
            <div className="flex-1">
              <Form.Item
                name="companyName"
                rules={[{ required: true, message: '' }]}
                className="mb-0"
              >
                <Input
                  placeholder={customerType === 'Corporate' ? 'Firma Adı' : 'Ad Soyad'}
                  variant="borderless"
                  className="!text-xl !font-semibold !text-slate-900 !p-0 placeholder:!text-slate-300"
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
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              İletişim Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm text-slate-600 mb-1.5">İrtibat Kişisi</label>
                <Form.Item name="contactPerson" className="mb-0">
                  <Input
                    placeholder="—"
                    className="!border-slate-200 hover:!border-slate-300 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm text-slate-600 mb-1.5">E-posta <span className="text-slate-400">*</span></label>
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: '' },
                    { type: 'email', message: '' },
                  ]}
                  className="mb-0"
                >
                  <Input
                    placeholder="ornek@firma.com"
                    className="!border-slate-200 hover:!border-slate-300 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm text-slate-600 mb-1.5">Telefon</label>
                <Form.Item name="phone" className="mb-0">
                  <Input
                    placeholder="+90 (___) ___ ____"
                    className="!border-slate-200 hover:!border-slate-300 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm text-slate-600 mb-1.5">Web Sitesi</label>
                <Form.Item name="website" className="mb-0">
                  <Input
                    placeholder="https://"
                    className="!border-slate-200 hover:!border-slate-300 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── ADRES BİLGİLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Adres Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <label className="block text-sm text-slate-600 mb-1.5">Adres</label>
                <Form.Item name="address" className="mb-0">
                  <TextArea
                    placeholder="Sokak, mahalle, bina no..."
                    rows={2}
                    maxLength={200}
                    className="!border-slate-200 hover:!border-slate-300 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 !resize-none"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm text-slate-600 mb-1.5">Şehir</label>
                <Form.Item name="city" className="mb-0">
                  <Select
                    placeholder="Seçin"
                    showSearch
                    optionFilterProp="children"
                    onChange={handleCityChange}
                    className="w-full [&_.ant-select-selector]:!border-slate-200 [&_.ant-select-selector:hover]:!border-slate-300 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!shadow-none"
                  >
                    {cityNames.map((city) => (
                      <Select.Option key={city} value={city}>{city}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm text-slate-600 mb-1.5">İlçe</label>
                <Form.Item name="state" className="mb-0">
                  <Select
                    placeholder={selectedCity ? 'Seçin' : '—'}
                    showSearch
                    optionFilterProp="children"
                    disabled={!selectedCity}
                    className="w-full [&_.ant-select-selector]:!border-slate-200 [&_.ant-select-selector:hover]:!border-slate-300 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900"
                  >
                    {districts.map((district) => (
                      <Select.Option key={district} value={district}>{district}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm text-slate-600 mb-1.5">Posta Kodu</label>
                <Form.Item name="postalCode" className="mb-0">
                  <Input
                    placeholder="34000"
                    maxLength={10}
                    className="!border-slate-200 hover:!border-slate-300 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900"
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
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Mali Bilgiler
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm text-slate-600 mb-1.5">Vergi Numarası</label>
                <Form.Item
                  name="taxId"
                  rules={[{ pattern: /^[0-9]{10,11}$/, message: '' }]}
                  className="mb-0"
                >
                  <Input
                    placeholder="10-11 haneli"
                    maxLength={11}
                    className="!border-slate-200 hover:!border-slate-300 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm text-slate-600 mb-1.5">Vergi Dairesi</label>
                <Form.Item name="taxOffice" className="mb-0">
                  <Input
                    placeholder="—"
                    className="!border-slate-200 hover:!border-slate-300 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm text-slate-600 mb-1.5">Kredi Limiti</label>
                <Form.Item name="creditLimit" className="mb-0" initialValue={0}>
                  <InputNumber
                    className="!w-full [&_.ant-input-number-input]:!border-slate-200"
                    formatter={(value) => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value?.replace(/₺\s?|(,*)/g, '') as any}
                    min={0}
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm text-slate-600 mb-1.5">Ödeme Vadesi</label>
                <Form.Item name="paymentTerms" className="mb-0">
                  <Select
                    placeholder="Seçin"
                    options={paymentTermsOptions}
                    allowClear
                    className="w-full [&_.ant-select-selector]:!border-slate-200 [&_.ant-select-selector:hover]:!border-slate-300"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm text-slate-600 mb-1.5">Durum</label>
                <Form.Item name="status" className="mb-0" initialValue="Active">
                  <Select
                    options={statusOptions}
                    className="w-full [&_.ant-select-selector]:!border-slate-200 [&_.ant-select-selector:hover]:!border-slate-300"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── NOTLAR ─────────────── */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Notlar
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <Form.Item name="notes" className="mb-0">
                  <TextArea
                    placeholder="Müşteri hakkında ek notlar..."
                    rows={3}
                    className="!border-slate-200 hover:!border-slate-300 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 !resize-none"
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
