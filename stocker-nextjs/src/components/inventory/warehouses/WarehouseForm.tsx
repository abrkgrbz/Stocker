'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Form, Input, InputNumber, Switch } from 'antd';
import { HomeIcon, UserIcon } from '@heroicons/react/24/outline';
import type { WarehouseDto } from '@/lib/api/services/inventory.types';
import { CascadeLocationSelect } from '@/components/ui/CascadeLocationSelect';
import type { SelectedLocation } from '@/lib/api/services/location.types';
import { PhoneInput } from '@/components/primitives/inputs/turkey/PhoneInput';

const { TextArea } = Input;

interface WarehouseFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: WarehouseDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function WarehouseForm({ form, initialValues, onFinish, loading }: WarehouseFormProps) {
  const [isActive, setIsActive] = useState(true);
  const [isDefault, setIsDefault] = useState(false);

  // Location state for CascadeLocationSelect
  const [locationValue, setLocationValue] = useState<SelectedLocation>({});

  // Phone state for PhoneInput
  const [phoneValue, setPhoneValue] = useState('');

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
      setIsActive(initialValues.isActive ?? true);
      setIsDefault(initialValues.isDefault ?? false);
      setPhoneValue(initialValues.phone || '');
      // Initialize location state from initialValues
      setLocationValue({
        countryId: initialValues.countryId || undefined,
        countryName: initialValues.country || undefined,
        cityId: initialValues.cityId || undefined,
        cityName: initialValues.city || undefined,
        districtId: initialValues.districtId || undefined,
        districtName: initialValues.state || undefined,
      });
    } else {
      form.setFieldsValue({
        totalArea: 0,
        isDefault: false,
      });
    }
  }, [form, initialValues]);

  // Handle location change from CascadeLocationSelect
  const handleLocationChange = useCallback((location: SelectedLocation) => {
    setLocationValue(location);
    // Update form values with location IDs and names
    form.setFieldsValue({
      countryId: location.countryId || null,
      cityId: location.cityId || null,
      districtId: location.districtId || null,
      country: location.countryName || '',
      city: location.cityName || '',
      state: location.districtName || '',
    });
  }, [form]);

  // Handle phone change from PhoneInput
  const handlePhoneChange = useCallback((value: string) => {
    setPhoneValue(value);
    form.setFieldValue('phone', value);
  }, [form]);

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
            {/* Warehouse Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <HomeIcon className="w-5 h-5 text-slate-500" />
              </div>
            </div>

            {/* Warehouse Name - Title Style */}
            <div className="flex-1">
              <Form.Item
                name="name"
                rules={[
                  { required: true, message: 'Depo adı zorunludur' },
                  { max: 200, message: 'Depo adı en fazla 200 karakter olabilir' },
                ]}
                className="mb-0"
              >
                <Input
                  placeholder="Depo Adı Girin..."
                  variant="borderless"
                  className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
                />
              </Form.Item>
              <Form.Item name="description" className="mb-0 mt-1">
                <Input
                  placeholder="Depo hakkında kısa açıklama..."
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
                <Form.Item name="isActive" valuePropName="checked" noStyle initialValue={true}>
                  <Switch
                    checked={isActive}
                    onChange={(val) => {
                      setIsActive(val);
                      form.setFieldValue('isActive', val);
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

          {/* ─────────────── TEMEL BİLGİLER ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Temel Bilgiler
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Depo Kodu <span className="text-red-500">*</span></label>
                <Form.Item
                  name="code"
                  rules={[{ required: true, message: 'Depo kodu zorunludur' }]}
                  className="mb-0"
                >
                  <Input
                    placeholder="WH-001"
                    disabled={!!initialValues}
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Şube ID</label>
                <Form.Item name="branchId" className="mb-0">
                  <InputNumber
                    placeholder="Şube ID (opsiyonel)"
                    min={1}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Toplam Alan (m²)</label>
                <Form.Item name="totalArea" className="mb-0" initialValue={0}>
                  <InputNumber
                    placeholder="0"
                    min={0}
                    addonAfter="m²"
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Varsayılan Depo</label>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-sm text-slate-700">
                    {isDefault ? 'Bu depo varsayılan olarak seçilecek' : 'Varsayılan depo değil'}
                  </div>
                  <Form.Item name="isDefault" valuePropName="checked" noStyle initialValue={false}>
                    <Switch
                      checked={isDefault}
                      onChange={(val) => {
                        setIsDefault(val);
                        form.setFieldValue('isDefault', val);
                      }}
                      checkedChildren="Evet"
                      unCheckedChildren="Hayır"
                    />
                  </Form.Item>
                </div>
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
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Sokak / Cadde</label>
                <Form.Item name="street" className="mb-0">
                  <Input
                    placeholder="Adres detayı"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>

              {/* GeoLocation Cascade Select: Ülke → Şehir → İlçe */}
              <div className="col-span-12">
                <CascadeLocationSelect
                  value={locationValue}
                  onChange={handleLocationChange}
                  showDistrict={true}
                  disabled={loading}
                  layout="grid"
                  countryLabel="Ülke"
                  cityLabel="Şehir (İl)"
                  districtLabel="İlçe"
                />
                {/* Hidden form fields to store location IDs */}
                <Form.Item name="countryId" hidden><Input /></Form.Item>
                <Form.Item name="cityId" hidden><Input /></Form.Item>
                <Form.Item name="districtId" hidden><Input /></Form.Item>
                <Form.Item name="country" hidden><Input /></Form.Item>
                <Form.Item name="city" hidden><Input /></Form.Item>
                <Form.Item name="state" hidden><Input /></Form.Item>
              </div>

              <div className="col-span-4">
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

          {/* ─────────────── İLETİŞİM ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              İletişim
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Telefon</label>
                <PhoneInput
                  value={phoneValue}
                  onChange={handlePhoneChange}
                  disabled={loading}
                  showCountryCode={true}
                />
                <Form.Item name="phone" hidden><Input /></Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Depo Sorumlusu</label>
                <Form.Item name="manager" className="mb-0">
                  <Input
                    placeholder="Ad Soyad"
                    prefix={<UserIcon className="w-4 h-4 text-slate-400" />}
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
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
                <div className="col-span-6">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <div className="text-2xl font-semibold text-slate-800">
                      {initialValues.locationCount || 0}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Lokasyon Sayısı</div>
                  </div>
                </div>
                <div className="col-span-6">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <div className="text-2xl font-semibold text-slate-800">
                      {initialValues.productCount || 0}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Ürün Sayısı</div>
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
