'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Select, Switch, Alert } from 'antd';
import { HashtagIcon } from '@heroicons/react/24/outline';

const { TextArea } = Input;
import { useUnits } from '@/lib/api/hooks/useInventory';
import type { UnitDto } from '@/lib/api/services/inventory.types';

interface UnitFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: UnitDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function UnitForm({ form, initialValues, onFinish, loading }: UnitFormProps) {
  const [isActive, setIsActive] = useState(true);
  const [hasBaseUnit, setHasBaseUnit] = useState(false);
  const [allowDecimals, setAllowDecimals] = useState(false);

  const { data: units = [] } = useUnits(true);

  // Filter out the current unit from base unit options
  const baseUnitOptions = units
    .filter(u => !initialValues || u.id !== initialValues.id)
    .filter(u => !u.baseUnitId) // Only show base units
    .map(u => ({
      value: u.id,
      label: `${u.name} (${u.symbol || u.code})`,
    }));

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
      setIsActive(initialValues.isActive ?? true);
      setHasBaseUnit(!!initialValues.baseUnitId);
      setAllowDecimals(initialValues.allowDecimals ?? false);
    } else {
      form.setFieldsValue({
        conversionFactor: 1,
        displayOrder: 0,
        allowDecimals: false,
        decimalPlaces: 0,
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
            {/* Unit Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <HashtagIcon className="w-6 h-6 text-slate-500" />
              </div>
            </div>

            {/* Unit Name - Title Style */}
            <div className="flex-1">
              <Form.Item
                name="name"
                rules={[
                  { required: true, message: 'Birim adı zorunludur' },
                  { max: 100, message: 'Birim adı en fazla 100 karakter olabilir' },
                ]}
                className="mb-0"
              >
                <Input
                  placeholder="Birim Adı Girin... (örn: Kilogram)"
                  variant="borderless"
                  className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
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
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Birim Kodu <span className="text-red-500">*</span></label>
                <Form.Item
                  name="code"
                  rules={[{ required: true, message: 'Birim kodu zorunludur' }]}
                  className="mb-0"
                >
                  <Input
                    placeholder="KG"
                    disabled={!!initialValues}
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Sembol</label>
                <Form.Item name="symbol" className="mb-0">
                  <Input
                    placeholder="kg"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Sıralama</label>
                <Form.Item name="displayOrder" className="mb-0" initialValue={0}>
                  <InputNumber
                    placeholder="0"
                    min={0}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Açıklama</label>
                <Form.Item name="description" className="mb-0">
                  <TextArea
                    placeholder="Birim hakkında açıklama..."
                    rows={2}
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white !resize-none"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── ONDALIK AYARLARI ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Ondalık Ayarları
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-lg border border-slate-200">
                  <span className="text-sm font-medium text-slate-600">Ondalık Kullan</span>
                  <Form.Item name="allowDecimals" valuePropName="checked" noStyle initialValue={false}>
                    <Switch
                      checked={allowDecimals}
                      onChange={(val) => {
                        setAllowDecimals(val);
                        form.setFieldValue('allowDecimals', val);
                        if (!val) {
                          form.setFieldValue('decimalPlaces', 0);
                        }
                      }}
                    />
                  </Form.Item>
                </div>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Ondalık Basamak</label>
                <Form.Item name="decimalPlaces" className="mb-0" initialValue={0}>
                  <InputNumber
                    placeholder="0"
                    min={0}
                    max={6}
                    disabled={!allowDecimals}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── DÖNÜŞÜM ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Dönüşüm Ayarları
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Temel Birim</label>
                <Form.Item name="baseUnitId" className="mb-0">
                  <Select
                    placeholder="Temel birim seçin (opsiyonel)"
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    options={baseUnitOptions}
                    onChange={(val) => setHasBaseUnit(!!val)}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Dönüşüm Faktörü</label>
                <Form.Item
                  name="conversionFactor"
                  className="mb-0"
                  rules={[
                    { required: hasBaseUnit, message: 'Dönüşüm faktörü zorunludur' }
                  ]}
                >
                  <InputNumber
                    placeholder="1"
                    min={0.0001}
                    step={0.01}
                    disabled={!hasBaseUnit}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
            <Alert
              type="info"
              message="Örnek"
              description="Eğer temel birim 'Kilogram' ve bu birim 'Gram' ise, dönüşüm faktörü 0.001 olmalıdır (1 gram = 0.001 kilogram)"
              showIcon
              className="!mt-4 !bg-slate-50 !border-slate-200"
            />
          </div>

          {/* ─────────────── TÜRETİLMİŞ BİRİMLER (Düzenleme Modu) ─────────────── */}
          {initialValues && initialValues.derivedUnits && initialValues.derivedUnits.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                Türetilmiş Birimler
              </h3>
              <div className="grid grid-cols-12 gap-4">
                {initialValues.derivedUnits.map(du => (
                  <div key={du.id} className="col-span-6">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                      <span className="text-sm text-slate-700">{du.name}</span>
                      <span className="text-xs text-slate-500 bg-slate-200 px-2 py-1 rounded">x{du.conversionFactor}</span>
                    </div>
                  </div>
                ))}
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
