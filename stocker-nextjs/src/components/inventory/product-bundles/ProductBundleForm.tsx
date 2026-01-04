'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Switch, Select, DatePicker } from 'antd';
import { CubeIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import type { ProductBundleDto } from '@/lib/api/services/inventory.types';
import { BundlePricingType, BundleType } from '@/lib/api/services/inventory.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface ProductBundleFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: ProductBundleDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

const bundleTypeOptions = [
  { value: BundleType.Fixed, label: 'Sabit Paket' },
  { value: BundleType.Configurable, label: 'Yapılandırılabilir Paket' },
  { value: BundleType.Kit, label: 'Kit' },
  { value: BundleType.Package, label: 'Çoklu Paket' },
  { value: BundleType.Combo, label: 'Kombo' },
];

const pricingTypeOptions = [
  { value: BundlePricingType.DynamicSum, label: 'Kalem Toplamı' },
  { value: BundlePricingType.FixedPrice, label: 'Sabit Fiyat' },
  { value: BundlePricingType.PercentageDiscount, label: 'Yüzde İndirim' },
  { value: BundlePricingType.DiscountedSum, label: 'Sabit İndirim' },
];

const currencyOptions = [
  { value: 'TRY', label: '₺ TRY' },
  { value: 'USD', label: '$ USD' },
  { value: 'EUR', label: '€ EUR' },
];

export default function ProductBundleForm({ form, initialValues, onFinish, loading }: ProductBundleFormProps) {
  const [isActive, setIsActive] = useState(true);
  const [pricingType, setPricingType] = useState<BundlePricingType>(BundlePricingType.DynamicSum);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        validFrom: initialValues.validFrom ? dayjs(initialValues.validFrom) : null,
        validTo: initialValues.validTo ? dayjs(initialValues.validTo) : null,
      });
      setIsActive(initialValues.isActive ?? true);
      setPricingType(initialValues.pricingType ?? BundlePricingType.DynamicSum);
    } else {
      form.setFieldsValue({
        bundleType: BundleType.Fixed,
        pricingType: BundlePricingType.DynamicSum,
        requireAllItems: true,
        displayOrder: 0,
        currency: 'TRY',
      });
    }
  }, [form, initialValues]);

  const showFixedPrice = pricingType === BundlePricingType.FixedPrice;
  const showDiscountPercentage = pricingType === BundlePricingType.PercentageDiscount;
  const showDiscountAmount = pricingType === BundlePricingType.DiscountedSum;

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
            {/* Bundle Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <CubeIcon className="w-6 h-6 text-slate-500" />
              </div>
            </div>

            {/* Bundle Name - Title Style */}
            <div className="flex-1">
              <Form.Item
                name="name"
                rules={[
                  { required: true, message: 'Paket adı zorunludur' },
                  { max: 200, message: 'Paket adı en fazla 200 karakter olabilir' },
                ]}
                className="mb-0"
              >
                <Input
                  placeholder="Paket Adı Girin..."
                  variant="borderless"
                  className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
                />
              </Form.Item>
              <p className="text-sm text-slate-500 mt-1">Ürün paketi/kit tanımı</p>
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
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Paket Kodu <span className="text-red-500">*</span></label>
                <Form.Item
                  name="code"
                  rules={[{ required: true, message: 'Paket kodu zorunludur' }]}
                  className="mb-0"
                >
                  <Input
                    placeholder="BND-001"
                    disabled={!!initialValues}
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Paket Tipi <span className="text-red-500">*</span></label>
                <Form.Item
                  name="bundleType"
                  rules={[{ required: true, message: 'Paket tipi zorunludur' }]}
                  className="mb-0"
                  initialValue={1}
                >
                  <Select
                    placeholder="Tip seçin"
                    options={bundleTypeOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Görüntüleme Sırası</label>
                <Form.Item name="displayOrder" className="mb-0" initialValue={0}>
                  <InputNumber
                    placeholder="0"
                    min={0}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                  />
                </Form.Item>
              </div>
              <div className="col-span-8">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Görsel URL</label>
                <Form.Item name="imageUrl" className="mb-0">
                  <Input
                    placeholder="https://example.com/bundle-image.jpg"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">&nbsp;</label>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-sm text-slate-700">Tüm ürünler zorunlu</div>
                  <Form.Item name="requireAllItems" valuePropName="checked" noStyle initialValue={true}>
                    <Switch size="small" />
                  </Form.Item>
                </div>
              </div>
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Açıklama</label>
                <Form.Item name="description" className="mb-0">
                  <TextArea
                    rows={2}
                    placeholder="Paket açıklaması..."
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── FİYATLANDIRMA ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100 flex items-center gap-2">
              <CurrencyDollarIcon className="w-4 h-4" />
              Fiyatlandırma
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Fiyatlandırma Tipi <span className="text-red-500">*</span></label>
                <Form.Item
                  name="pricingType"
                  rules={[{ required: true, message: 'Fiyatlandırma tipi zorunludur' }]}
                  className="mb-0"
                  initialValue={1}
                >
                  <Select
                    placeholder="Tip seçin"
                    options={pricingTypeOptions}
                    onChange={(val) => setPricingType(val)}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
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
              {showFixedPrice && (
                <div className="col-span-3">
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Sabit Fiyat</label>
                  <Form.Item name="fixedPrice" className="mb-0">
                    <InputNumber
                      placeholder="0.00"
                      min={0}
                      precision={2}
                      className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                    />
                  </Form.Item>
                </div>
              )}
              {showDiscountPercentage && (
                <div className="col-span-3">
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">İndirim Yüzdesi (%)</label>
                  <Form.Item name="discountPercentage" className="mb-0">
                    <InputNumber
                      placeholder="10"
                      min={0}
                      max={100}
                      precision={2}
                      className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                    />
                  </Form.Item>
                </div>
              )}
              {showDiscountAmount && (
                <div className="col-span-3">
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">İndirim Tutarı</label>
                  <Form.Item name="discountAmount" className="mb-0">
                    <InputNumber
                      placeholder="0.00"
                      min={0}
                      precision={2}
                      className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                    />
                  </Form.Item>
                </div>
              )}
            </div>
          </div>

          {/* ─────────────── SEÇİLEBİLİR ÜRÜN AYARLARI ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Seçilebilir Ürün Ayarları
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Minimum Seçilebilir Ürün</label>
                <Form.Item name="minSelectableItems" className="mb-0">
                  <InputNumber
                    placeholder="Örn: 1"
                    min={0}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Maksimum Seçilebilir Ürün</label>
                <Form.Item name="maxSelectableItems" className="mb-0">
                  <InputNumber
                    placeholder="Örn: 5"
                    min={0}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── GEÇERLİLİK DÖNEMİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Geçerlilik Dönemi
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Başlangıç Tarihi</label>
                <Form.Item name="validFrom" className="mb-0">
                  <DatePicker
                    placeholder="Başlangıç"
                    format="DD.MM.YYYY"
                    className="!w-full !bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Bitiş Tarihi</label>
                <Form.Item name="validTo" className="mb-0">
                  <DatePicker
                    placeholder="Bitiş"
                    format="DD.MM.YYYY"
                    className="!w-full !bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── İSTATİSTİKLER (Düzenleme Modu) ─────────────── */}
          {initialValues && (
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                Paket Özeti
              </h3>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-4">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <div className="text-2xl font-semibold text-slate-800">
                      {initialValues.items?.length || 0}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Ürün Sayısı</div>
                  </div>
                </div>
                <div className="col-span-4">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <div className="text-2xl font-semibold text-slate-800">
                      {pricingTypeOptions.find(p => p.value === initialValues.pricingType)?.label || '-'}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Fiyatlandırma</div>
                  </div>
                </div>
                <div className="col-span-4">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <div className={`text-sm font-medium ${initialValues.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {initialValues.isActive ? 'Aktif' : 'Pasif'}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Durum</div>
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
