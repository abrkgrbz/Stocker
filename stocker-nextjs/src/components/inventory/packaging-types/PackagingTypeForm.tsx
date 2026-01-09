'use client';

import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Collapse,
} from 'antd';
import {
  Cog6ToothIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';
import { PackagingCategory } from '@/lib/api/services/inventory.types';
import type { PackagingTypeDto } from '@/lib/api/services/inventory.types';

const { TextArea } = Input;

interface PackagingTypeFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: PackagingTypeDto;
  onFinish: (values: any) => void;
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
  const [category, setCategory] = useState<PackagingCategory>(PackagingCategory.Box);
  const [isStackable, setIsStackable] = useState(false);
  const [isRecyclable, setIsRecyclable] = useState(false);
  const [isReturnable, setIsReturnable] = useState(false);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
      setCategory(initialValues.category);
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
              <Form.Item
                name="name"
                rules={[
                  { required: true, message: 'Ambalaj tipi adı zorunludur' },
                  { max: 100, message: 'Ad en fazla 100 karakter olabilir' },
                ]}
                className="mb-0"
              >
                <Input
                  placeholder="Ambalaj Tipi Adı..."
                  variant="borderless"
                  className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
                />
              </Form.Item>
              <Form.Item name="description" className="mb-0 mt-1">
                <Input
                  placeholder="Ambalaj tipi açıklaması..."
                  variant="borderless"
                  className="!text-sm !text-slate-500 !p-0 placeholder:!text-slate-400"
                />
              </Form.Item>
            </div>

            {/* Category Selector */}
            <div className="flex-shrink-0 w-48">
              <Form.Item name="category" className="mb-0" initialValue={PackagingCategory.Box}>
                <Select
                  options={categoryOptions}
                  onChange={(val) => setCategory(val)}
                  className="w-full [&_.ant-select-selector]:!bg-slate-100 [&_.ant-select-selector]:!border-0 [&_.ant-select-selector]:!rounded-lg"
                />
              </Form.Item>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="px-8 py-6">

          {/* Envanter Kodları */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Tanımlama
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Kod <span className="text-red-500">*</span></label>
                <Form.Item
                  name="code"
                  rules={[{ required: true, message: 'Kod zorunludur' }]}
                  className="mb-0"
                >
                  <Input
                    placeholder="PKG-001"
                    disabled={!!initialValues}
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Materyal Tipi</label>
                <Form.Item name="materialType" className="mb-0">
                  <Input
                    placeholder="Karton, Plastik, Ahşap..."
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Barkod Öneki</label>
                <Form.Item name="barcodePrefix" className="mb-0">
                  <Input
                    placeholder="PKG"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Boyutlar */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Boyutlar (cm)
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Uzunluk</label>
                <Form.Item name="length" className="mb-0">
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    precision={2}
                    placeholder="30"
                    className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Genişlik</label>
                <Form.Item name="width" className="mb-0">
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    precision={2}
                    placeholder="20"
                    className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Yükseklik</label>
                <Form.Item name="height" className="mb-0">
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    precision={2}
                    placeholder="15"
                    className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Hacim (cm³)</label>
                <Form.Item name="volume" className="mb-0">
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    precision={2}
                    placeholder="Otomatik"
                    className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Ağırlık */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Ağırlık (kg)
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Boş Ağırlık</label>
                <Form.Item name="emptyWeight" className="mb-0">
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    precision={3}
                    placeholder="0.500"
                    className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Maksimum Taşıma Kapasitesi</label>
                <Form.Item name="maxWeightCapacity" className="mb-0">
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    precision={2}
                    placeholder="25.00"
                    className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Kapasite */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Kapasite
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Varsayılan Miktar</label>
                <Form.Item name="defaultQuantity" className="mb-0">
                  <InputNumber
                    style={{ width: '100%' }}
                    min={1}
                    placeholder="12"
                    className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Maksimum Miktar</label>
                <Form.Item name="maxQuantity" className="mb-0">
                  <InputNumber
                    style={{ width: '100%' }}
                    min={1}
                    placeholder="24"
                    className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Palet Başına</label>
                <Form.Item name="unitsPerPallet" className="mb-0">
                  <InputNumber
                    style={{ width: '100%' }}
                    min={1}
                    placeholder="48"
                    className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Palet Katman Başına</label>
                <Form.Item name="unitsPerPalletLayer" className="mb-0">
                  <InputNumber
                    style={{ width: '100%' }}
                    min={1}
                    placeholder="12"
                    className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Özellikler */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Özellikler
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <div className="text-sm font-medium text-slate-700">İstiflenebilir</div>
                    <div className="text-xs text-slate-500 mt-0.5">Üst üste konulabilir</div>
                  </div>
                  <Form.Item name="isStackable" valuePropName="checked" noStyle>
                    <Switch
                      checked={isStackable}
                      onChange={(val) => {
                        setIsStackable(val);
                        form.setFieldValue('isStackable', val);
                      }}
                    />
                  </Form.Item>
                </div>
              </div>
              <div className="col-span-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <div className="text-sm font-medium text-slate-700">Geri Dönüştürülebilir</div>
                    <div className="text-xs text-slate-500 mt-0.5">Çevre dostu malzeme</div>
                  </div>
                  <Form.Item name="isRecyclable" valuePropName="checked" noStyle>
                    <Switch
                      checked={isRecyclable}
                      onChange={(val) => {
                        setIsRecyclable(val);
                        form.setFieldValue('isRecyclable', val);
                      }}
                    />
                  </Form.Item>
                </div>
              </div>
              <div className="col-span-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <div className="text-sm font-medium text-slate-700">İade Edilebilir</div>
                    <div className="text-xs text-slate-500 mt-0.5">Depozitolu ambalaj</div>
                  </div>
                  <Form.Item name="isReturnable" valuePropName="checked" noStyle>
                    <Switch
                      checked={isReturnable}
                      onChange={(val) => {
                        setIsReturnable(val);
                        form.setFieldValue('isReturnable', val);
                      }}
                    />
                  </Form.Item>
                </div>
              </div>
            </div>
          </div>

          {/* Gelişmiş Ayarlar */}
          <div>
            <Collapse
              ghost
              expandIconPosition="end"
              className="!bg-transparent [&_.ant-collapse-header]:!px-0 [&_.ant-collapse-content-box]:!px-0"
              items={[
                {
                  key: 'advanced',
                  label: (
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                      <Cog6ToothIcon className="w-4 h-4" /> Gelişmiş Ayarlar
                    </h3>
                  ),
                  children: (
                    <div className="pt-4">
                      <div className="grid grid-cols-12 gap-4">
                        {isStackable && (
                          <div className="col-span-4">
                            <label className="block text-sm font-medium text-slate-600 mb-1.5">İstif Sayısı</label>
                            <Form.Item name="stackableCount" className="mb-0">
                              <InputNumber
                                style={{ width: '100%' }}
                                min={1}
                                placeholder="4"
                                className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                              />
                            </Form.Item>
                          </div>
                        )}
                        {isReturnable && (
                          <div className="col-span-4">
                            <label className="block text-sm font-medium text-slate-600 mb-1.5">Depozito Tutarı</label>
                            <Form.Item name="depositAmount" className="mb-0">
                              <InputNumber
                                style={{ width: '100%' }}
                                min={0}
                                precision={2}
                                placeholder="5.00"
                                addonBefore="₺"
                                className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                              />
                            </Form.Item>
                          </div>
                        )}
                      </div>
                    </div>
                  ),
                },
              ]}
            />
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
