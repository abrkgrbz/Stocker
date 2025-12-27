'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, Select, InputNumber, Switch } from 'antd';
import { CursorArrowRaysIcon } from '@heroicons/react/24/outline';
import type { CompetitorDto } from '@/lib/api/services/crm.types';
import { ThreatLevel, PriceComparison } from '@/lib/api/services/crm.types';
import { FormPhoneInput } from '@/components/ui/InternationalPhoneInput';

const { TextArea } = Input;

// Threat level options
const threatLevelOptions = [
  { value: ThreatLevel.VeryLow, label: 'Çok Düşük' },
  { value: ThreatLevel.Low, label: 'Düşük' },
  { value: ThreatLevel.Medium, label: 'Orta' },
  { value: ThreatLevel.High, label: 'Yüksek' },
  { value: ThreatLevel.VeryHigh, label: 'Çok Yüksek' },
];

// Price comparison options
const priceComparisonOptions = [
  { value: PriceComparison.MuchLower, label: 'Çok Düşük' },
  { value: PriceComparison.Lower, label: 'Düşük' },
  { value: PriceComparison.Similar, label: 'Benzer' },
  { value: PriceComparison.Higher, label: 'Yüksek' },
  { value: PriceComparison.MuchHigher, label: 'Çok Yüksek' },
];

interface CompetitorFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: CompetitorDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function CompetitorForm({ form, initialValues, onFinish, loading }: CompetitorFormProps) {
  const [threatLevel, setThreatLevel] = useState<ThreatLevel>(ThreatLevel.Medium);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
      });
      setThreatLevel(initialValues.threatLevel || ThreatLevel.Medium);
      setIsActive(initialValues.isActive ?? true);
    } else {
      form.setFieldsValue({
        threatLevel: ThreatLevel.Medium,
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
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">

        {/* ═══════════════════════════════════════════════════════════════
            HEADER: Icon + Name + Threat Level
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Competitor Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <CursorArrowRaysIcon className="w-5 h-5 text-slate-500" />
              </div>
            </div>

            {/* Competitor Name - Title Style */}
            <div className="flex-1">
              <div className="flex items-center gap-4">
                <Form.Item
                  name="name"
                  rules={[
                    { required: true, message: 'Rakip adı zorunludur' },
                    { max: 200, message: 'En fazla 200 karakter olabilir' },
                  ]}
                  className="mb-0 flex-1"
                >
                  <Input
                    placeholder="Rakip Adı Girin..."
                    variant="borderless"
                    className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
                  />
                </Form.Item>
                <Form.Item name="code" className="mb-0 w-32">
                  <Input
                    placeholder="Kod"
                    variant="borderless"
                    className="!text-lg !font-medium !text-slate-500 !p-0 placeholder:!text-slate-400"
                  />
                </Form.Item>
              </div>
              <Form.Item name="description" className="mb-0 mt-1">
                <Input
                  placeholder="Rakip hakkında kısa not..."
                  variant="borderless"
                  className="!text-sm !text-slate-500 !p-0 placeholder:!text-slate-400"
                />
              </Form.Item>
            </div>

            {/* Threat Level Selector */}
            <div className="flex-shrink-0">
              <Form.Item name="threatLevel" className="mb-0" initialValue={ThreatLevel.Medium}>
                <Select
                  options={threatLevelOptions}
                  onChange={(val) => {
                    setThreatLevel(val);
                    form.setFieldValue('threatLevel', val);
                  }}
                  className="w-36 [&_.ant-select-selector]:!bg-slate-100 [&_.ant-select-selector]:!border-0 [&_.ant-select-selector]:!rounded-lg"
                />
              </Form.Item>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            FORM BODY: High-Density Grid Layout
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6">

          {/* ─────────────── FİRMA BİLGİLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Firma Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Website</label>
                <Form.Item name="website" className="mb-0">
                  <Input
                    placeholder="https://www.rakip.com"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Merkez</label>
                <Form.Item name="headquarters" className="mb-0">
                  <Input
                    placeholder="İstanbul, Türkiye"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Kuruluş Yılı</label>
                <Form.Item name="foundedYear" className="mb-0">
                  <InputNumber
                    placeholder="2010"
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                    min={1900}
                    max={2100}
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Çalışan Sayısı</label>
                <Form.Item name="employeeCount" className="mb-0">
                  <Input
                    placeholder="100-500"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── PAZAR BİLGİLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Pazar Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Fiyat Karşılaştırması</label>
                <Form.Item name="priceComparison" className="mb-0">
                  <Select
                    placeholder="Seçin"
                    options={priceComparisonOptions}
                    allowClear
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Pazar Payı (%)</label>
                <Form.Item name="marketShare" className="mb-0">
                  <InputNumber
                    placeholder="15"
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                    min={0}
                    max={100}
                    addonAfter="%"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Durum</label>
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-md border border-slate-300 h-[32px]">
                  <span className="text-sm text-slate-600">{isActive ? 'Aktif' : 'Pasif'}</span>
                  <Form.Item name="isActive" valuePropName="checked" className="mb-0" initialValue={true}>
                    <Switch
                      size="small"
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

          {/* ─────────────── İLETİŞİM BİLGİLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              İletişim Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">İletişim Kişisi</label>
                <Form.Item name="contactPerson" className="mb-0">
                  <Input
                    placeholder="Ad Soyad"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">E-posta</label>
                <Form.Item name="email" className="mb-0">
                  <Input
                    placeholder="info@rakip.com"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Telefon</label>
                <Form.Item name="phone" className="mb-0">
                  <FormPhoneInput defaultCountry="TR" />
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
                    placeholder="Rakip hakkında ek notlar..."
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
