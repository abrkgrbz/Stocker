'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Switch, Select } from 'antd';
import { ArchiveBoxIcon, CubeIcon } from '@heroicons/react/24/outline';
import type { PackagingTypeDto } from '@/lib/api/services/inventory.types';

const { TextArea } = Input;

interface PackagingTypeFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: PackagingTypeDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

const categoryOptions = [
  { value: 1, label: 'Kutu' },
  { value: 2, label: 'Koli' },
  { value: 3, label: 'Palet' },
  { value: 4, label: 'Kasa' },
  { value: 5, label: 'Torba' },
  { value: 6, label: 'Bidon' },
  { value: 7, label: 'Konteyner' },
  { value: 8, label: 'Şişe' },
  { value: 9, label: 'Kavanoz' },
  { value: 10, label: 'Tüp' },
  { value: 11, label: 'Poşet' },
  { value: 12, label: 'Rulo' },
  { value: 99, label: 'Diğer' },
];

const barcodeTypeOptions = [
  { value: 1, label: 'EAN-13' },
  { value: 2, label: 'EAN-8' },
  { value: 3, label: 'UPC-A' },
  { value: 5, label: 'Code 128' },
  { value: 7, label: 'QR Code' },
  { value: 10, label: 'ITF-14' },
  { value: 11, label: 'GS1-128' },
  { value: 99, label: 'Dahili' },
];

export default function PackagingTypeForm({ form, initialValues, onFinish, loading }: PackagingTypeFormProps) {
  const [isActive, setIsActive] = useState(true);
  const [isStackable, setIsStackable] = useState(true);
  const [isReturnable, setIsReturnable] = useState(false);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
      setIsActive(initialValues.isActive ?? true);
      setIsStackable(initialValues.isStackable ?? true);
      setIsReturnable(initialValues.isReturnable ?? false);
    } else {
      form.setFieldsValue({
        category: 1,
        isStackable: true,
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

        {/* ═══════════════════════════════════════════════════════════════
            HEADER: Icon + Name + Status Toggle
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Packaging Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <ArchiveBoxIcon className="w-6 h-6 text-slate-500" />
              </div>
            </div>

            {/* Packaging Name - Title Style */}
            <div className="flex-1">
              <Form.Item
                name="name"
                rules={[
                  { required: true, message: 'Ambalaj adı zorunludur' },
                  { max: 100, message: 'Ambalaj adı en fazla 100 karakter olabilir' },
                ]}
                className="mb-0"
              >
                <Input
                  placeholder="Ambalaj Adı Girin..."
                  variant="borderless"
                  className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
                />
              </Form.Item>
              <p className="text-sm text-slate-500 mt-1">Koli, palet, kutu vb. tanımları</p>
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
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Ambalaj Kodu <span className="text-red-500">*</span></label>
                <Form.Item
                  name="code"
                  rules={[{ required: true, message: 'Ambalaj kodu zorunludur' }]}
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
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Kategori <span className="text-red-500">*</span></label>
                <Form.Item
                  name="category"
                  rules={[{ required: true, message: 'Kategori zorunludur' }]}
                  className="mb-0"
                  initialValue={1}
                >
                  <Select
                    placeholder="Kategori seçin"
                    options={categoryOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Malzeme Türü</label>
                <Form.Item name="materialType" className="mb-0">
                  <Input
                    placeholder="Karton, Plastik, Ahşap..."
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Açıklama</label>
                <Form.Item name="description" className="mb-0">
                  <TextArea
                    rows={2}
                    placeholder="Ambalaj açıklaması..."
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── BOYUT BİLGİLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100 flex items-center gap-2">
              <CubeIcon className="w-4 h-4" />
              Boyut Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Uzunluk (cm)</label>
                <Form.Item name="length" className="mb-0">
                  <InputNumber
                    placeholder="0"
                    min={0}
                    precision={2}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Genişlik (cm)</label>
                <Form.Item name="width" className="mb-0">
                  <InputNumber
                    placeholder="0"
                    min={0}
                    precision={2}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Yükseklik (cm)</label>
                <Form.Item name="height" className="mb-0">
                  <InputNumber
                    placeholder="0"
                    min={0}
                    precision={2}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Hacim (m³)</label>
                <Form.Item name="volume" className="mb-0">
                  <InputNumber
                    placeholder="Otomatik hesaplanır"
                    min={0}
                    precision={4}
                    disabled
                    className="!w-full [&.ant-input-number]:!bg-slate-100 [&.ant-input-number]:!border-slate-300"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── AĞIRLIK BİLGİLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Ağırlık Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Boş Ağırlık / Dara (kg)</label>
                <Form.Item name="emptyWeight" className="mb-0">
                  <InputNumber
                    placeholder="0.00"
                    min={0}
                    precision={3}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Maks. Ağırlık Kapasitesi (kg)</label>
                <Form.Item name="maxWeightCapacity" className="mb-0">
                  <InputNumber
                    placeholder="0.00"
                    min={0}
                    precision={3}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── KAPASİTE BİLGİLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Kapasite Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Varsayılan Miktar</label>
                <Form.Item name="defaultQuantity" className="mb-0">
                  <InputNumber
                    placeholder="Örn: 12"
                    min={0}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Maks. Miktar</label>
                <Form.Item name="maxQuantity" className="mb-0">
                  <InputNumber
                    placeholder="Örn: 24"
                    min={0}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 h-full">
                  <div className="text-sm text-slate-700">İstiflenebilir</div>
                  <Form.Item name="isStackable" valuePropName="checked" noStyle initialValue={true}>
                    <Switch
                      size="small"
                      checked={isStackable}
                      onChange={(val) => {
                        setIsStackable(val);
                        form.setFieldValue('isStackable', val);
                      }}
                    />
                  </Form.Item>
                </div>
              </div>
              {isStackable && (
                <div className="col-span-3">
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">İstif Adeti</label>
                  <Form.Item name="stackableCount" className="mb-0">
                    <InputNumber
                      placeholder="Örn: 5"
                      min={1}
                      className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                    />
                  </Form.Item>
                </div>
              )}
            </div>
          </div>

          {/* ─────────────── LOJİSTİK BİLGİLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Lojistik Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Palet Başına Adet</label>
                <Form.Item name="unitsPerPallet" className="mb-0">
                  <InputNumber
                    placeholder="Örn: 48"
                    min={0}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Kat Başına Adet</label>
                <Form.Item name="unitsPerPalletLayer" className="mb-0">
                  <InputNumber
                    placeholder="Örn: 12"
                    min={0}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Barkod Öneki</label>
                <Form.Item name="barcodePrefix" className="mb-0">
                  <Input
                    placeholder="Örn: PKG"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Varsayılan Barkod Türü</label>
                <Form.Item name="defaultBarcodeType" className="mb-0">
                  <Select
                    placeholder="Tür seçin"
                    allowClear
                    options={barcodeTypeOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── MALZEME VE İADE ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Malzeme ve İade Özellikleri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-sm text-slate-700">Geri dönüştürülebilir</div>
                  <Form.Item name="isRecyclable" valuePropName="checked" noStyle>
                    <Switch size="small" />
                  </Form.Item>
                </div>
              </div>
              <div className="col-span-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-sm text-slate-700">İade edilebilir</div>
                  <Form.Item name="isReturnable" valuePropName="checked" noStyle>
                    <Switch
                      size="small"
                      checked={isReturnable}
                      onChange={(val) => {
                        setIsReturnable(val);
                        form.setFieldValue('isReturnable', val);
                      }}
                    />
                  </Form.Item>
                </div>
              </div>
              {isReturnable && (
                <div className="col-span-3">
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Depozito Tutarı</label>
                  <Form.Item name="depositAmount" className="mb-0">
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

        </div>
      </div>

      {/* Hidden submit button */}
      <Form.Item hidden>
        <button type="submit" />
      </Form.Item>
    </Form>
  );
}
