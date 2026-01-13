'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Form, Input, InputNumber, Select } from 'antd';
import { UserIcon } from '@heroicons/react/24/outline';
import type { Lead } from '@/lib/api/services/crm.service';
import { FormPhoneInput } from '@/components/ui/InternationalPhoneInput';
import { CascadeLocationSelect } from '@/components/ui/CascadeLocationSelect';
import type { SelectedLocation } from '@/lib/api/services/location.types';

const { TextArea } = Input;

// Lead source options
const sourceOptions = [
  { value: 'Website', label: 'Web Sitesi' },
  { value: 'Referral', label: 'Referans' },
  { value: 'SocialMedia', label: 'Sosyal Medya' },
  { value: 'Event', label: 'Etkinlik' },
  { value: 'ColdCall', label: 'Soğuk Arama' },
  { value: 'Email', label: 'E-posta' },
  { value: 'Other', label: 'Diğer' },
];

// Lead status options - Backend LeadStatus enum ile senkronize
const statusOptions = [
  { value: 'New', label: 'Yeni' },
  { value: 'Contacted', label: 'İletişime Geçildi' },
  { value: 'Qualified', label: 'Nitelikli' },
  { value: 'Unqualified', label: 'Niteliksiz' },
  { value: 'Converted', label: 'Dönüştürüldü' },
  { value: 'Lost', label: 'Kayıp' },
];

// Lead rating options - Backend LeadRating enum ile senkronize
const ratingOptions = [
  { value: 'Unrated', label: 'Değerlendirilmedi' },
  { value: 'Cold', label: 'Soğuk' },
  { value: 'Warm', label: 'Ilık' },
  { value: 'Hot', label: 'Sıcak' },
];

interface LeadFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: Lead;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function LeadForm({ form, initialValues, onFinish, loading }: LeadFormProps) {
  const [rating, setRating] = useState<string>('Warm');
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation>({});

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        status: initialValues.status ?? 'New',
      });
      setRating(initialValues.rating || 'Warm');
      // Initialize location from existing data (text-based matching not supported, user needs to reselect)
      // For now we just show the text values in hidden fields
    } else {
      form.setFieldsValue({
        status: 'New',
        score: 50,
        rating: 'Warm',
      });
    }
  }, [form, initialValues]);

  // Handle location change from cascade dropdown
  const handleLocationChange = useCallback((location: SelectedLocation) => {
    setSelectedLocation(location);
    // Update form values with text names for backend (backend expects string fields)
    form.setFieldsValue({
      country: location.countryName || '',
      city: location.cityName || '',
      state: location.districtName || location.region || '', // Use district or region as state
    });
  }, [form]);

  const handleFormFinish = (values: any) => {
    // Ensure location text values are included
    const submitData = {
      ...values,
      country: selectedLocation.countryName || values.country || '',
      city: selectedLocation.cityName || values.city || '',
      state: selectedLocation.districtName || selectedLocation.region || values.state || '',
    };
    onFinish(submitData);
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
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">

        {/* ═══════════════════════════════════════════════════════════════
            HEADER: Avatar + Name Fields + Rating Selector
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-slate-400 hover:bg-slate-200 transition-all">
                <UserIcon className="w-5 h-5 text-slate-500" />
              </div>
            </div>

            {/* Name Fields - Title Style */}
            <div className="flex-1 flex gap-4">
              <Form.Item
                name="firstName"
                rules={[{ required: true, message: 'Ad zorunludur' }]}
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
                rules={[{ required: true, message: 'Soyad zorunludur' }]}
                className="mb-0 flex-1"
              >
                <Input
                  placeholder="Soyad"
                  variant="borderless"
                  className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
                />
              </Form.Item>
            </div>

            {/* Rating Selector */}
            <div className="flex-shrink-0">
              <Form.Item name="rating" className="mb-0" initialValue="Warm">
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  {ratingOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setRating(opt.value);
                        form.setFieldValue('rating', opt.value);
                      }}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                        rating === opt.value
                          ? 'bg-white shadow-sm text-slate-900'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </Form.Item>
            </div>
          </div>

          {/* Description under name */}
          <div className="mt-3 ml-[88px]">
            <Form.Item name="description" className="mb-0">
              <Input
                placeholder="Lead hakkında kısa not..."
                variant="borderless"
                className="!text-sm !text-slate-500 !p-0 placeholder:!text-slate-400"
              />
            </Form.Item>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            FORM BODY: High-Density Grid Layout
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6">

          {/* ─────────────── İLETİŞİM BİLGİLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
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
                    placeholder="ornek@firma.com"
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
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Telefon</label>
                <Form.Item name="phone" className="mb-0">
                  <FormPhoneInput defaultCountry="TR" />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Cep Telefonu</label>
                <Form.Item name="mobilePhone" className="mb-0">
                  <FormPhoneInput defaultCountry="TR" />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── FİRMA BİLGİLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Firma Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Firma Adı</label>
                <Form.Item name="companyName" className="mb-0">
                  <Input
                    placeholder="ABC Teknoloji A.Ş."
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Pozisyon</label>
                <Form.Item name="jobTitle" className="mb-0">
                  <Input
                    placeholder="Satın Alma Müdürü"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Sektör</label>
                <Form.Item name="industry" className="mb-0">
                  <Select
                    placeholder="Seçin"
                    allowClear
                    options={[
                      { value: 'Technology', label: 'Teknoloji' },
                      { value: 'Finance', label: 'Finans' },
                      { value: 'Healthcare', label: 'Sağlık' },
                      { value: 'Manufacturing', label: 'Üretim' },
                      { value: 'Retail', label: 'Perakende' },
                      { value: 'Education', label: 'Eğitim' },
                      { value: 'RealEstate', label: 'Gayrimenkul' },
                      { value: 'Transportation', label: 'Taşımacılık' },
                      { value: 'Other', label: 'Diğer' },
                    ]}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Yıllık Gelir (₺)</label>
                <Form.Item name="annualRevenue" className="mb-0">
                  <InputNumber
                    min={0}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value?.replace(/,/g, '') as any}
                    placeholder="0"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Çalışan Sayısı</label>
                <Form.Item name="numberOfEmployees" className="mb-0">
                  <InputNumber
                    min={0}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                    placeholder="0"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── ADRES BİLGİLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Adres Bilgileri
            </h3>

            {/* Cascade Location Select */}
            <CascadeLocationSelect
              value={selectedLocation}
              onChange={handleLocationChange}
              showDistrict={true}
              showRegion={true}
              disabled={loading}
              layout="grid"
              countryLabel="Ülke"
              cityLabel="Şehir"
              districtLabel="İlçe"
            />

            {/* Hidden fields for form submission */}
            <Form.Item name="country" hidden><Input /></Form.Item>
            <Form.Item name="city" hidden><Input /></Form.Item>
            <Form.Item name="state" hidden><Input /></Form.Item>

            <div className="grid grid-cols-12 gap-4 mt-4">
              <div className="col-span-9">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Adres Detayı</label>
                <Form.Item name="address" className="mb-0">
                  <Input
                    placeholder="Sokak, Mahalle, Bina No, Daire"
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
            </div>
          </div>

          {/* ─────────────── LEAD BİLGİLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Lead Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Kaynak <span className="text-red-500">*</span></label>
                <Form.Item
                  name="source"
                  rules={[{ required: true, message: 'Kaynak seçimi zorunludur' }]}
                  className="mb-0"
                >
                  <Select
                    placeholder="Seçin"
                    options={sourceOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Durum <span className="text-red-500">*</span></label>
                <Form.Item
                  name="status"
                  rules={[{ required: true, message: 'Durum seçimi zorunludur' }]}
                  className="mb-0"
                  initialValue="New"
                >
                  <Select
                    placeholder="Seçin"
                    options={statusOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Lead Puanı</label>
                <Form.Item name="score" className="mb-0" initialValue={50}>
                  <InputNumber
                    min={0}
                    max={100}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                    addonAfter="/ 100"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── NOTLAR ─────────────── */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Notlar
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <Form.Item name="notes" className="mb-0">
                  <TextArea
                    placeholder="Lead hakkında ek notlar..."
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
