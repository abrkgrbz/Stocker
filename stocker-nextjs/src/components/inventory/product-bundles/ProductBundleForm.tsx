'use client';

import React, { useEffect, useState } from 'react';
import { Form, DatePicker } from 'antd';
import { CubeIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import type { ProductBundleDto, CreateProductBundleDto, UpdateProductBundleDto } from '@/lib/api/services/inventory.types';
import { BundlePricingType, BundleType } from '@/lib/api/services/inventory.types';
import dayjs from 'dayjs';
import {
  FormSection,
  FormInput,
  FormTextArea,
  FormNumber,
  FormSelect,
  FormSwitch,
  FormStatGrid,
  useUnsavedChanges,
  nameFieldRules,
  codeFieldRules,
} from '@/components/forms';

interface ProductBundleFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: ProductBundleDto;
  onFinish: (values: CreateProductBundleDto | UpdateProductBundleDto) => void;
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
  const [requireAllItems, setRequireAllItems] = useState(true);

  // Unsaved changes tracking
  const { markAsSaved } = useUnsavedChanges({
    form,
    enabled: true,
    initialValues: initialValues || {},
  });

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        validFrom: initialValues.validFrom ? dayjs(initialValues.validFrom) : null,
        validTo: initialValues.validTo ? dayjs(initialValues.validTo) : null,
      });
      setIsActive(initialValues.isActive ?? true);
      setPricingType(initialValues.pricingType ?? BundlePricingType.DynamicSum);
      setRequireAllItems(initialValues.requireAllItems ?? true);
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

  const handleFinish = (values: any) => {
    markAsSaved();
    const data = {
      ...values,
      validFrom: values.validFrom?.toISOString(),
      validTo: values.validTo?.toISOString(),
    };
    onFinish(data);
  };

  const showFixedPrice = pricingType === BundlePricingType.FixedPrice;
  const showDiscountPercentage = pricingType === BundlePricingType.PercentageDiscount;
  const showDiscountAmount = pricingType === BundlePricingType.DiscountedSum;

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
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Bundle Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <CubeIcon className="w-6 h-6 text-slate-500" />
              </div>
            </div>

            {/* Bundle Name */}
            <div className="flex-1">
              <FormInput
                name="name"
                placeholder="Paket Adı Girin..."
                rules={nameFieldRules('Paket adı', 200)}
                formItemProps={{ className: 'mb-0' }}
                className="!text-2xl !font-bold !text-slate-900 !p-0 !bg-transparent !border-0 !shadow-none placeholder:!text-slate-400 placeholder:!font-medium focus:!ring-0"
              />
              <p className="text-sm text-slate-500 mt-1">Ürün paketi/kit tanımı</p>
            </div>

            {/* Status Toggle */}
            <div className="flex-shrink-0">
              <div className="flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-lg">
                <span className="text-sm font-medium text-slate-600">
                  {isActive ? 'Aktif' : 'Pasif'}
                </span>
                <FormSwitch
                  form={form}
                  name="isActive"
                  value={isActive}
                  onChange={setIsActive}
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="px-8 py-6">

          {/* Temel Bilgiler */}
          <FormSection title="Temel Bilgiler">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <FormInput
                  name="code"
                  label="Paket Kodu"
                  required
                  placeholder="BND-001"
                  disabled={!!initialValues}
                  rules={codeFieldRules('Paket kodu')}
                />
              </div>
              <div className="col-span-4">
                <FormSelect
                  name="bundleType"
                  label="Paket Tipi"
                  required
                  placeholder="Tip seçin"
                  options={bundleTypeOptions}
                />
              </div>
              <div className="col-span-4">
                <FormNumber
                  name="displayOrder"
                  label="Görüntüleme Sırası"
                  placeholder="0"
                  min={0}
                  formItemProps={{ initialValue: 0 }}
                />
              </div>
              <div className="col-span-8">
                <FormInput
                  name="imageUrl"
                  label="Görsel URL"
                  placeholder="https://example.com/bundle-image.jpg"
                />
              </div>
              <div className="col-span-4">
                <FormSwitch
                  form={form}
                  name="requireAllItems"
                  title="Tüm Ürünler Zorunlu"
                  value={requireAllItems}
                  onChange={setRequireAllItems}
                  descriptionTrue="Tüm ürünler zorunlu"
                  descriptionFalse="Seçimli ürünler"
                  disabled={loading}
                />
              </div>
              <div className="col-span-12">
                <FormTextArea
                  name="description"
                  label="Açıklama"
                  placeholder="Paket açıklaması..."
                  rows={2}
                />
              </div>
            </div>
          </FormSection>

          {/* Fiyatlandırma */}
          <FormSection
            title="Fiyatlandırma"
            icon={<CurrencyDollarIcon className="w-4 h-4" />}
          >
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <FormSelect
                  name="pricingType"
                  label="Fiyatlandırma Tipi"
                  required
                  placeholder="Tip seçin"
                  options={pricingTypeOptions}
                  onChange={(val) => setPricingType(val)}
                />
              </div>
              <div className="col-span-2">
                <FormSelect
                  name="currency"
                  label="Para Birimi"
                  options={currencyOptions}
                  formItemProps={{ initialValue: 'TRY' }}
                />
              </div>
              {showFixedPrice && (
                <div className="col-span-3">
                  <FormNumber
                    name="fixedPrice"
                    label="Sabit Fiyat"
                    placeholder="0.00"
                    min={0}
                    precision={2}
                  />
                </div>
              )}
              {showDiscountPercentage && (
                <div className="col-span-3">
                  <FormNumber
                    name="discountPercentage"
                    label="İndirim Yüzdesi (%)"
                    placeholder="10"
                    min={0}
                    max={100}
                    precision={2}
                  />
                </div>
              )}
              {showDiscountAmount && (
                <div className="col-span-3">
                  <FormNumber
                    name="discountAmount"
                    label="İndirim Tutarı"
                    placeholder="0.00"
                    min={0}
                    precision={2}
                  />
                </div>
              )}
            </div>
          </FormSection>

          {/* Seçilebilir Ürün Ayarları */}
          <FormSection title="Seçilebilir Ürün Ayarları">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <FormNumber
                  name="minSelectableItems"
                  label="Minimum Seçilebilir Ürün"
                  placeholder="Örn: 1"
                  min={0}
                />
              </div>
              <div className="col-span-6">
                <FormNumber
                  name="maxSelectableItems"
                  label="Maksimum Seçilebilir Ürün"
                  placeholder="Örn: 5"
                  min={0}
                />
              </div>
            </div>
          </FormSection>

          {/* Geçerlilik Dönemi */}
          <FormSection title="Geçerlilik Dönemi">
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
          </FormSection>

          {/* İstatistikler (Düzenleme Modu) */}
          {initialValues && (
            <FormSection title="Paket Özeti">
              <FormStatGrid
                columns={3}
                stats={[
                  { value: initialValues.items?.length || 0, label: 'Ürün Sayısı' },
                  { value: pricingTypeOptions.find(p => p.value === initialValues.pricingType)?.label || '-', label: 'Fiyatlandırma' },
                  { value: initialValues.isActive ? 'Aktif' : 'Pasif', label: 'Durum' },
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
