'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Form, Input, InputNumber, Switch, Select } from 'antd';
import { GlobeAltIcon } from '@heroicons/react/24/outline';
import type { TerritoryDto } from '@/lib/api/services/crm.types';
import { TerritoryType } from '@/lib/api/services/crm.types';
import { CascadeLocationSelect } from '@/components/ui/CascadeLocationSelect';
import type { SelectedLocation } from '@/lib/api/services/location.types';

// Currency options
const currencyOptions = [
  { value: 'TRY', label: '₺ TRY' },
  { value: 'USD', label: '$ USD' },
  { value: 'EUR', label: '€ EUR' },
  { value: 'GBP', label: '£ GBP' },
];

interface TerritoryFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: TerritoryDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function TerritoryForm({ form, initialValues, onFinish, loading }: TerritoryFormProps) {
  const [territoryType, setTerritoryType] = useState<TerritoryType>(TerritoryType.Region);
  const [isActive, setIsActive] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation>({});

  // Initialize form with existing values
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        // Ensure targetYear has current year as default if salesTarget exists but no year
        targetYear: initialValues.targetYear || (initialValues.salesTarget ? new Date().getFullYear() : undefined),
      });
      setTerritoryType(initialValues.territoryType || TerritoryType.Region);
      setIsActive(initialValues.isActive ?? true);

      // Set initial location from existing territory data
      setSelectedLocation({
        countryId: initialValues.countryId,
        countryName: initialValues.country,
        countryCode: initialValues.countryCode,
        cityId: initialValues.cityId,
        cityName: initialValues.city,
        region: initialValues.region,
        districtId: initialValues.districtId,
        districtName: initialValues.district,
      });
    } else {
      form.setFieldsValue({
        territoryType: TerritoryType.Region,
        isActive: true,
        targetYear: new Date().getFullYear(),
        currency: 'TRY',
      });
    }
  }, [form, initialValues]);

  // Handle location change from cascade dropdown
  const handleLocationChange = useCallback((location: SelectedLocation) => {
    setSelectedLocation(location);

    // Update form values with GeoLocation IDs and display names
    form.setFieldsValue({
      countryId: location.countryId,
      country: location.countryName,
      countryCode: location.countryCode,
      cityId: location.cityId,
      city: location.cityName,
      region: location.region,
      districtId: location.districtId,
      district: location.districtName,
    });
  }, [form]);

  // Handle territory type change - clear location and update type
  const handleTerritoryTypeChange = useCallback((newType: TerritoryType) => {
    setTerritoryType(newType);
    form.setFieldValue('territoryType', newType);

    // Clear location selection when type changes
    setSelectedLocation({});
    form.setFieldsValue({
      countryId: undefined, country: undefined, countryCode: undefined,
      cityId: undefined, city: undefined, region: undefined,
      districtId: undefined, district: undefined,
    });
  }, [form]);

  // Handle form submission - include location fields
  const handleFinish = useCallback((values: any) => {
    // Ensure targetYear is set if salesTarget is provided (required by backend)
    const targetYear = values.targetYear || (values.salesTarget ? new Date().getFullYear() : undefined);

    // Merge location data with form values
    const submitData = {
      ...values,
      targetYear, // Ensure targetYear is sent with salesTarget
      countryId: selectedLocation.countryId,
      country: selectedLocation.countryName,
      countryCode: selectedLocation.countryCode,
      cityId: selectedLocation.cityId,
      city: selectedLocation.cityName,
      region: selectedLocation.region,
      districtId: selectedLocation.districtId,
      district: selectedLocation.districtName,
    };
    onFinish(submitData);
  }, [selectedLocation, onFinish]);

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

        {/* ═══════════════════════════════════════════════════════════════
            HEADER: Icon + Name + Type Selector
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Territory Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <GlobeAltIcon className="w-5 h-5 text-slate-500" />
              </div>
            </div>

            {/* Territory Name - Title Style */}
            <div className="flex-1">
              <Form.Item
                name="name"
                rules={[
                  { required: true, message: 'Bölge adı zorunludur' },
                  { max: 100, message: 'En fazla 100 karakter olabilir' },
                ]}
                className="mb-0"
              >
                <Input
                  placeholder="Bölge Adı Girin..."
                  variant="borderless"
                  className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
                />
              </Form.Item>
              <Form.Item name="description" className="mb-0 mt-1">
                <Input
                  placeholder="Bölge hakkında kısa not..."
                  variant="borderless"
                  className="!text-sm !text-slate-500 !p-0 placeholder:!text-slate-400"
                />
              </Form.Item>
            </div>

            {/* Type Selector */}
            <div className="flex-shrink-0">
              <Form.Item name="territoryType" className="mb-0" initialValue={TerritoryType.Region}>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => handleTerritoryTypeChange(TerritoryType.Country)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      territoryType === TerritoryType.Country
                        ? 'bg-white shadow-sm text-slate-900'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Ülke
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTerritoryTypeChange(TerritoryType.Region)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      territoryType === TerritoryType.Region
                        ? 'bg-white shadow-sm text-slate-900'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Bölge
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTerritoryTypeChange(TerritoryType.City)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      territoryType === TerritoryType.City
                        ? 'bg-white shadow-sm text-slate-900'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Şehir
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTerritoryTypeChange(TerritoryType.District)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      territoryType === TerritoryType.District
                        ? 'bg-white shadow-sm text-slate-900'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    İlçe
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

          {/* ─────────────── BÖLGE BİLGİLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Bölge Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Bölge Kodu <span className="text-red-500">*</span></label>
                <Form.Item
                  name="code"
                  rules={[
                    { required: true, message: 'Bölge kodu zorunludur' },
                    { max: 20, message: 'En fazla 20 karakter olabilir' },
                  ]}
                  className="mb-0"
                >
                  <Input
                    placeholder="TR-MAR"
                    maxLength={20}
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Durum</label>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <div className="text-sm text-slate-700">
                      {isActive ? 'Bölge aktif' : 'Bölge pasif'}
                    </div>
                  </div>
                  <Form.Item name="isActive" valuePropName="checked" noStyle initialValue={true}>
                    <Switch
                      checked={isActive}
                      onChange={(val) => {
                        setIsActive(val);
                        form.setFieldValue('isActive', val);
                      }}
                      checkedChildren="Aktif"
                      unCheckedChildren="Pasif"
                    />
                  </Form.Item>
                </div>
              </div>
            </div>
          </div>

          {/* ─────────────── COĞRAFİ BİLGİLER (Cascade Dropdown) ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Coğrafi Bilgiler
            </h3>

            {/* Dynamic hint based on territory type */}
            <p className="text-sm text-slate-500 mb-4">
              {territoryType === TerritoryType.Country && 'Ülke bazlı bölge için sadece ülke seçin.'}
              {territoryType === TerritoryType.Region && 'Bölge bazlı territory için ülke ve şehir seçin.'}
              {territoryType === TerritoryType.City && 'Şehir bazlı territory için ülke ve şehir seçin.'}
              {territoryType === TerritoryType.District && 'İlçe bazlı territory için ülke, şehir ve ilçe seçin.'}
            </p>

            {/* Cascade Location Select Component - Dynamic based on territory type */}
            <CascadeLocationSelect
              value={selectedLocation}
              onChange={handleLocationChange}
              showCity={territoryType !== TerritoryType.Country}
              showDistrict={territoryType === TerritoryType.District}
              showRegion={territoryType === TerritoryType.Region}
              disabled={loading}
              layout="grid"
            />

            {/* Hidden fields for form submission */}
            <Form.Item name="countryId" hidden><Input /></Form.Item>
            <Form.Item name="country" hidden><Input /></Form.Item>
            <Form.Item name="countryCode" hidden><Input /></Form.Item>
            <Form.Item name="cityId" hidden><Input /></Form.Item>
            <Form.Item name="city" hidden><Input /></Form.Item>
            <Form.Item name="region" hidden><Input /></Form.Item>
            <Form.Item name="districtId" hidden><Input /></Form.Item>
            <Form.Item name="district" hidden><Input /></Form.Item>
          </div>

          {/* ─────────────── SATIŞ HEDEFLERİ ─────────────── */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Satış Hedefleri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Satış Hedefi</label>
                <Form.Item name="salesTarget" className="mb-0">
                  <InputNumber
                    placeholder="1.000.000"
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value?.replace(/,/g, '') as any}
                  />
                </Form.Item>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Para Birimi</label>
                <Form.Item name="currency" className="mb-0" initialValue="TRY">
                  <Select
                    options={currencyOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Hedef Yılı</label>
                <Form.Item name="targetYear" className="mb-0">
                  <InputNumber
                    placeholder="2026"
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                    min={2020}
                    max={2100}
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Potansiyel Değer</label>
                <Form.Item name="potentialValue" className="mb-0">
                  <InputNumber
                    placeholder="0"
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value?.replace(/,/g, '') as any}
                    min={0}
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
