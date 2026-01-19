'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Form, Input } from 'antd';
import { HomeIcon, UserIcon } from '@heroicons/react/24/outline';
import type { WarehouseDto, CreateWarehouseDto, UpdateWarehouseDto } from '@/lib/api/services/inventory.types';
import { CascadeLocationSelect } from '@/components/ui/CascadeLocationSelect';
import type { SelectedLocation } from '@/lib/api/services/location.types';
import { PhoneInput } from '@/components/primitives/inputs/turkey/PhoneInput';
import {
  FormHeader,
  FormSection,
  FormInput,
  FormNumber,
  FormSwitch,
  FormStatGrid,
  useUnsavedChanges,
  nameFieldRules,
  codeFieldRules,
} from '@/components/forms';

interface WarehouseFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: WarehouseDto;
  onFinish: (values: CreateWarehouseDto | UpdateWarehouseDto) => void;
  loading?: boolean;
}

export default function WarehouseForm({ form, initialValues, onFinish, loading }: WarehouseFormProps) {
  const [isActive, setIsActive] = useState(true);
  const [isDefault, setIsDefault] = useState(false);

  // Location state for CascadeLocationSelect
  const [locationValue, setLocationValue] = useState<SelectedLocation>({});

  // Phone state for PhoneInput
  const [phoneValue, setPhoneValue] = useState('');

  // Unsaved changes tracking
  const { hasUnsavedChanges, markAsSaved } = useUnsavedChanges({
    form,
    enabled: true,
    initialValues: initialValues || {},
  });

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
        isActive: true,
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

  // Handle form submission
  const handleFinish = (values: any) => {
    markAsSaved();
    onFinish(values);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      disabled={loading}
      className="w-full"
      scrollToFirstError={{ behavior: 'smooth', block: 'center' }}
    >
      {/* Main Card */}
      <div className="bg-white border border-slate-200 rounded-xl">

        {/* Header */}
        <FormHeader
          form={form}
          icon={<HomeIcon className="w-5 h-5 text-slate-500" />}
          titleField="name"
          titlePlaceholder="Depo Adı Girin..."
          titleRules={nameFieldRules('Depo adı')}
          descriptionField="description"
          descriptionPlaceholder="Depo hakkında kısa açıklama..."
          showStatusToggle={true}
          statusValue={isActive}
          onStatusChange={setIsActive}
          loading={loading}
        />

        {/* Form Body */}
        <div className="px-8 py-6">

          {/* Temel Bilgiler */}
          <FormSection title="Temel Bilgiler">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <FormInput
                  name="code"
                  label="Depo Kodu"
                  required
                  placeholder="WH-001"
                  disabled={!!initialValues}
                  rules={codeFieldRules('Depo kodu')}
                />
              </div>
              <div className="col-span-4">
                <FormNumber
                  name="branchId"
                  label="Şube ID"
                  placeholder="Şube ID (opsiyonel)"
                  min={1}
                />
              </div>
              <div className="col-span-4">
                <FormNumber
                  name="totalArea"
                  label="Toplam Alan (m²)"
                  placeholder="0"
                  min={0}
                  addonAfter="m²"
                  formItemProps={{ initialValue: 0 }}
                />
              </div>
              <div className="col-span-6">
                <FormSwitch
                  form={form}
                  name="isDefault"
                  title="Varsayılan Depo"
                  value={isDefault}
                  onChange={setIsDefault}
                  descriptionTrue="Bu depo varsayılan olarak seçilecek"
                  descriptionFalse="Varsayılan depo değil"
                  checkedChildren="Evet"
                  unCheckedChildren="Hayır"
                  disabled={loading}
                />
              </div>
            </div>
          </FormSection>

          {/* Adres Bilgileri */}
          <FormSection title="Adres Bilgileri">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <FormInput
                  name="street"
                  label="Sokak / Cadde"
                  placeholder="Adres detayı"
                />
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
                <FormInput
                  name="postalCode"
                  label="Posta Kodu"
                  placeholder="34000"
                />
              </div>
            </div>
          </FormSection>

          {/* İletişim */}
          <FormSection title="İletişim">
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
                <FormInput
                  name="manager"
                  label="Depo Sorumlusu"
                  placeholder="Ad Soyad"
                  prefix={<UserIcon className="w-4 h-4 text-slate-400" />}
                />
              </div>
            </div>
          </FormSection>

          {/* İstatistikler (Düzenleme Modu) */}
          {initialValues && (
            <FormSection title="İstatistikler">
              <FormStatGrid
                columns={2}
                stats={[
                  { value: initialValues.locationCount || 0, label: 'Lokasyon Sayısı' },
                  { value: initialValues.productCount || 0, label: 'Ürün Sayısı' },
                ]}
              />
            </FormSection>
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
