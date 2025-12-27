'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, Select, InputNumber, Switch } from 'antd';
import { MapPinIcon } from '@heroicons/react/24/outline';
import type { FormInstance } from 'antd';
import type { TerritoryType, SalesTerritoryListDto } from '@/lib/api/services/sales.service';

interface TerritoryFormProps {
  form: FormInstance;
  onFinish: (values: any) => void;
  loading?: boolean;
  isEdit?: boolean;
  initialValues?: any;
  parentTerritories?: SalesTerritoryListDto[];
  loadingParents?: boolean;
}

const territoryTypeOptions: { value: TerritoryType; label: string }[] = [
  { value: 'Country', label: 'Ülke' },
  { value: 'Region', label: 'Bölge' },
  { value: 'City', label: 'Şehir' },
  { value: 'District', label: 'İlçe' },
  { value: 'Zone', label: 'Zon' },
  { value: 'Custom', label: 'Özel' },
];

const currencyOptions = [
  { value: 'TRY', label: '₺ TRY' },
  { value: 'USD', label: '$ USD' },
  { value: 'EUR', label: '€ EUR' },
];

export function TerritoryForm({
  form,
  onFinish,
  loading = false,
  isEdit = false,
  initialValues,
  parentTerritories = [],
  loadingParents = false,
}: TerritoryFormProps) {
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
      });
      setIsActive(initialValues.isActive ?? true);
    } else {
      form.setFieldsValue({
        territoryType: 'Region',
        annualTargetCurrency: 'TRY',
      });
    }
  }, [form, initialValues]);

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
            {/* Territory Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <MapPinIcon className="w-6 h-6 text-slate-500" />
              </div>
            </div>

            {/* Territory Name - Title Style */}
            <div className="flex-1">
              <Form.Item
                name="name"
                rules={[{ required: true, message: 'Bölge adı giriniz' }]}
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
                  placeholder="Bölge hakkında kısa açıklama..."
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
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Bölge Kodu {!isEdit && <span className="text-red-500">*</span>}</label>
                <Form.Item
                  name="territoryCode"
                  rules={[{ required: !isEdit, message: 'Bölge kodu giriniz' }]}
                  className="mb-0"
                >
                  <Input
                    placeholder="TR-IST"
                    disabled={isEdit}
                    style={{ textTransform: 'uppercase' }}
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Bölge Türü {!isEdit && <span className="text-red-500">*</span>}</label>
                <Form.Item
                  name="territoryType"
                  rules={[{ required: !isEdit, message: 'Bölge türü seçiniz' }]}
                  className="mb-0"
                >
                  <Select
                    options={territoryTypeOptions}
                    disabled={isEdit}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Üst Bölge</label>
                <Form.Item name="parentTerritoryId" className="mb-0">
                  <Select
                    placeholder="Üst bölge seçiniz (opsiyonel)"
                    loading={loadingParents}
                    showSearch
                    optionFilterProp="label"
                    allowClear
                    disabled={isEdit}
                    options={parentTerritories.map((t) => ({
                      value: t.id,
                      label: `${t.territoryCode} - ${t.name}`
                    }))}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── KONUM BİLGİLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Konum Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Ülke</label>
                <Form.Item name="country" className="mb-0">
                  <Input
                    placeholder="Türkiye"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Bölge</label>
                <Form.Item name="region" className="mb-0">
                  <Input
                    placeholder="Marmara"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Şehir</label>
                <Form.Item name="city" className="mb-0">
                  <Input
                    placeholder="İstanbul"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">İlçe</label>
                <Form.Item name="district" className="mb-0">
                  <Input
                    placeholder="Kadıköy"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── YILLIK HEDEFLER ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Yıllık Hedefler
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Hedef Tutarı</label>
                <Form.Item name="annualTargetAmount" className="mb-0">
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="0"
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value?.replace(/,/g, '') as any}
                    className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Para Birimi</label>
                <Form.Item name="annualTargetCurrency" className="mb-0">
                  <Select
                    options={currencyOptions}
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
                  <Input.TextArea
                    rows={3}
                    placeholder="Ek notlar..."
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
