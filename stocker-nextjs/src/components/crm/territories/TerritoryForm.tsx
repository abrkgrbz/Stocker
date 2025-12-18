'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Select, Switch } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import type { TerritoryDto } from '@/lib/api/services/crm.types';
import { TerritoryType } from '@/lib/api/services/crm.types';

const { TextArea } = Input;

// Territory type options
const territoryTypeOptions = [
  { value: TerritoryType.Country, label: 'Ülke' },
  { value: TerritoryType.Region, label: 'Bölge' },
  { value: TerritoryType.City, label: 'Şehir' },
  { value: TerritoryType.District, label: 'İlçe' },
  { value: TerritoryType.PostalCode, label: 'Posta Kodu' },
  { value: TerritoryType.Custom, label: 'Özel' },
  { value: TerritoryType.Industry, label: 'Sektör' },
  { value: TerritoryType.CustomerSegment, label: 'Müşteri Segmenti' },
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

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
      });
      setTerritoryType(initialValues.territoryType || TerritoryType.Region);
      setIsActive(initialValues.isActive ?? true);
    } else {
      form.setFieldsValue({
        territoryType: TerritoryType.Region,
        isActive: true,
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
            HEADER: Icon + Name + Type Selector
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Territory Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <GlobalOutlined className="text-xl text-slate-500" />
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
                    onClick={() => {
                      setTerritoryType(TerritoryType.Country);
                      form.setFieldValue('territoryType', TerritoryType.Country);
                    }}
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
                    onClick={() => {
                      setTerritoryType(TerritoryType.Region);
                      form.setFieldValue('territoryType', TerritoryType.Region);
                    }}
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
                    onClick={() => {
                      setTerritoryType(TerritoryType.City);
                      form.setFieldValue('territoryType', TerritoryType.City);
                    }}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      territoryType === TerritoryType.City
                        ? 'bg-white shadow-sm text-slate-900'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Şehir
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

          {/* ─────────────── COĞRAFİ BİLGİLER ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Coğrafi Bilgiler
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

          {/* ─────────────── SATIŞ HEDEFLERİ ─────────────── */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Satış Hedefleri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Satış Hedefi (₺)</label>
                <Form.Item name="salesTarget" className="mb-0">
                  <InputNumber
                    placeholder="1.000.000"
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value?.replace(/,/g, '') as any}
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Hedef Yılı</label>
                <Form.Item name="targetYear" className="mb-0">
                  <InputNumber
                    placeholder="2025"
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                    min={2020}
                    max={2100}
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
