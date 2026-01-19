'use client';

import React, { useEffect, useState } from 'react';
import { Form, Collapse } from 'antd';
import { Cog6ToothIcon, CubeIcon } from '@heroicons/react/24/outline';
import { PackagingCategory } from '@/lib/api/services/inventory.types';
import type { PackagingTypeDto, CreatePackagingTypeDto, UpdatePackagingTypeDto } from '@/lib/api/services/inventory.types';
import {
  FormHeader,
  FormSection,
  FormInput,
  FormNumber,
  FormSelect,
  FormSwitch,
  useUnsavedChanges,
  nameFieldRules,
  codeFieldRules,
} from '@/components/forms';

interface PackagingTypeFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: PackagingTypeDto;
  onFinish: (values: CreatePackagingTypeDto | UpdatePackagingTypeDto) => void;
  loading?: boolean;
}

const categoryOptions = [
  { value: PackagingCategory.Box, label: 'Kutu' },
  { value: PackagingCategory.Carton, label: 'Karton' },
  { value: PackagingCategory.Pallet, label: 'Palet' },
  { value: PackagingCategory.Crate, label: 'Kasa' },
  { value: PackagingCategory.Bag, label: 'Torba' },
  { value: PackagingCategory.Drum, label: 'Varil' },
  { value: PackagingCategory.Container, label: 'Konteyner' },
  { value: PackagingCategory.Bottle, label: 'Şişe' },
  { value: PackagingCategory.Jar, label: 'Kavanoz' },
  { value: PackagingCategory.Tube, label: 'Tüp' },
  { value: PackagingCategory.Pouch, label: 'Poşet' },
  { value: PackagingCategory.Roll, label: 'Rulo' },
  { value: PackagingCategory.Other, label: 'Diğer' },
];

export default function PackagingTypeForm({ form, initialValues, onFinish, loading }: PackagingTypeFormProps) {
  const [isStackable, setIsStackable] = useState(false);
  const [isRecyclable, setIsRecyclable] = useState(false);
  const [isReturnable, setIsReturnable] = useState(false);

  // Unsaved changes tracking
  const { markAsSaved } = useUnsavedChanges({
    form,
    enabled: true,
    initialValues: initialValues || {},
  });

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
      setIsStackable(initialValues.isStackable);
      setIsRecyclable(initialValues.isRecyclable);
      setIsReturnable(initialValues.isReturnable);
    } else {
      form.setFieldsValue({
        category: PackagingCategory.Box,
        isStackable: false,
        isRecyclable: false,
        isReturnable: false,
      });
    }
  }, [form, initialValues]);

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

        {/* Header Section */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-start gap-6">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <CubeIcon className="w-8 h-8 text-emerald-600" />
              </div>
            </div>

            {/* Name Input */}
            <div className="flex-1">
              <FormInput
                name="name"
                placeholder="Ambalaj Tipi Adı..."
                variant="borderless"
                rules={nameFieldRules('Ambalaj tipi adı', 100)}
                className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
              />
              <FormInput
                name="description"
                placeholder="Ambalaj tipi açıklaması..."
                variant="borderless"
                className="!text-sm !text-slate-500 !p-0 placeholder:!text-slate-400 mt-1"
              />
            </div>

            {/* Category Selector */}
            <div className="flex-shrink-0 w-48">
              <FormSelect
                name="category"
                options={categoryOptions}
                formItemProps={{ initialValue: PackagingCategory.Box }}
                className="w-full [&_.ant-select-selector]:!bg-slate-100 [&_.ant-select-selector]:!border-0 [&_.ant-select-selector]:!rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="px-8 py-6">

          {/* Tanımlama */}
          <FormSection title="Tanımlama">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <FormInput
                  name="code"
                  label="Kod"
                  required
                  placeholder="PKG-001"
                  disabled={!!initialValues}
                  rules={codeFieldRules('Kod')}
                />
              </div>
              <div className="col-span-4">
                <FormInput
                  name="materialType"
                  label="Materyal Tipi"
                  placeholder="Karton, Plastik, Ahşap..."
                />
              </div>
              <div className="col-span-4">
                <FormInput
                  name="barcodePrefix"
                  label="Barkod Öneki"
                  placeholder="PKG"
                />
              </div>
            </div>
          </FormSection>

          {/* Boyutlar */}
          <FormSection title="Boyutlar (cm)">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-3">
                <FormNumber
                  name="length"
                  label="Uzunluk"
                  placeholder="30"
                  min={0}
                  precision={2}
                />
              </div>
              <div className="col-span-3">
                <FormNumber
                  name="width"
                  label="Genişlik"
                  placeholder="20"
                  min={0}
                  precision={2}
                />
              </div>
              <div className="col-span-3">
                <FormNumber
                  name="height"
                  label="Yükseklik"
                  placeholder="15"
                  min={0}
                  precision={2}
                />
              </div>
              <div className="col-span-3">
                <FormNumber
                  name="volume"
                  label="Hacim (cm³)"
                  placeholder="Otomatik"
                  min={0}
                  precision={2}
                />
              </div>
            </div>
          </FormSection>

          {/* Ağırlık */}
          <FormSection title="Ağırlık (kg)">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <FormNumber
                  name="emptyWeight"
                  label="Boş Ağırlık"
                  placeholder="0.500"
                  min={0}
                  precision={3}
                />
              </div>
              <div className="col-span-6">
                <FormNumber
                  name="maxWeightCapacity"
                  label="Maksimum Taşıma Kapasitesi"
                  placeholder="25.00"
                  min={0}
                  precision={2}
                />
              </div>
            </div>
          </FormSection>

          {/* Kapasite */}
          <FormSection title="Kapasite">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-3">
                <FormNumber
                  name="defaultQuantity"
                  label="Varsayılan Miktar"
                  placeholder="12"
                  min={1}
                />
              </div>
              <div className="col-span-3">
                <FormNumber
                  name="maxQuantity"
                  label="Maksimum Miktar"
                  placeholder="24"
                  min={1}
                />
              </div>
              <div className="col-span-3">
                <FormNumber
                  name="unitsPerPallet"
                  label="Palet Başına"
                  placeholder="48"
                  min={1}
                />
              </div>
              <div className="col-span-3">
                <FormNumber
                  name="unitsPerPalletLayer"
                  label="Palet Katman Başına"
                  placeholder="12"
                  min={1}
                />
              </div>
            </div>
          </FormSection>

          {/* Özellikler */}
          <FormSection title="Özellikler">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <FormSwitch
                  form={form}
                  name="isStackable"
                  title="İstiflenebilir"
                  value={isStackable}
                  onChange={setIsStackable}
                  descriptionTrue="Üst üste konulabilir"
                  descriptionFalse="İstiflenemez"
                  disabled={loading}
                />
              </div>
              <div className="col-span-4">
                <FormSwitch
                  form={form}
                  name="isRecyclable"
                  title="Geri Dönüştürülebilir"
                  value={isRecyclable}
                  onChange={setIsRecyclable}
                  descriptionTrue="Çevre dostu malzeme"
                  descriptionFalse="Geri dönüştürülemez"
                  disabled={loading}
                />
              </div>
              <div className="col-span-4">
                <FormSwitch
                  form={form}
                  name="isReturnable"
                  title="İade Edilebilir"
                  value={isReturnable}
                  onChange={setIsReturnable}
                  descriptionTrue="Depozitolu ambalaj"
                  descriptionFalse="İade edilemez"
                  disabled={loading}
                />
              </div>
            </div>
          </FormSection>

          {/* Gelişmiş Ayarlar */}
          {(isStackable || isReturnable) && (
            <FormSection title="Gelişmiş Ayarlar">
              <div className="grid grid-cols-12 gap-4">
                {isStackable && (
                  <div className="col-span-4">
                    <FormNumber
                      name="stackableCount"
                      label="İstif Sayısı"
                      placeholder="4"
                      min={1}
                    />
                  </div>
                )}
                {isReturnable && (
                  <div className="col-span-4">
                    <FormNumber
                      name="depositAmount"
                      label="Depozito Tutarı"
                      placeholder="5.00"
                      min={0}
                      precision={2}
                      addonBefore="₺"
                    />
                  </div>
                )}
              </div>
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
