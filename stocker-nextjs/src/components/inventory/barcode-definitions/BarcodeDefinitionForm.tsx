'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Switch, Select, DatePicker } from 'antd';
import { QrCodeIcon } from '@heroicons/react/24/outline';
import { useProducts } from '@/lib/api/hooks/useInventory';
import type { BarcodeDefinitionDto } from '@/lib/api/services/inventory.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface BarcodeDefinitionFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: BarcodeDefinitionDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

const barcodeTypeOptions = [
  { value: 1, label: 'EAN-13' },
  { value: 2, label: 'EAN-8' },
  { value: 3, label: 'UPC-A' },
  { value: 4, label: 'UPC-E' },
  { value: 5, label: 'Code 128' },
  { value: 6, label: 'Code 39' },
  { value: 7, label: 'QR Code' },
  { value: 8, label: 'Data Matrix' },
  { value: 9, label: 'PDF417' },
  { value: 10, label: 'ITF-14' },
  { value: 11, label: 'GS1-128' },
  { value: 99, label: 'Dahili' },
];

export default function BarcodeDefinitionForm({ form, initialValues, onFinish, loading }: BarcodeDefinitionFormProps) {
  const [isActive, setIsActive] = useState(true);
  const [isPrimary, setIsPrimary] = useState(false);
  const [isManufacturerBarcode, setIsManufacturerBarcode] = useState(false);

  const { data: products = [] } = useProducts(true);

  const productOptions = products.map(p => ({
    value: p.id,
    label: `${p.code} - ${p.name}`,
  }));

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        validFrom: initialValues.validFrom ? dayjs(initialValues.validFrom) : null,
        validUntil: initialValues.validUntil ? dayjs(initialValues.validUntil) : null,
      });
      setIsActive(initialValues.isActive ?? true);
      setIsPrimary(initialValues.isPrimary ?? false);
      setIsManufacturerBarcode(initialValues.isManufacturerBarcode ?? false);
    } else {
      form.setFieldsValue({
        barcodeType: 1,
        quantityPerUnit: 1,
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
            HEADER: Icon + Barcode + Status Toggle
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Barcode Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <QrCodeIcon className="w-6 h-6 text-slate-500" />
              </div>
            </div>

            {/* Barcode Value - Title Style */}
            <div className="flex-1">
              <Form.Item
                name="barcode"
                rules={[
                  { required: true, message: 'Barkod değeri zorunludur' },
                  { max: 100, message: 'Barkod en fazla 100 karakter olabilir' },
                ]}
                className="mb-0"
              >
                <Input
                  placeholder="Barkod Değerini Girin..."
                  variant="borderless"
                  disabled={!!initialValues}
                  className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium font-mono"
                />
              </Form.Item>
              <p className="text-sm text-slate-500 mt-1">Ürün barkod tanımı</p>
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
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Ürün <span className="text-red-500">*</span></label>
                <Form.Item
                  name="productId"
                  rules={[{ required: true, message: 'Ürün seçimi zorunludur' }]}
                  className="mb-0"
                >
                  <Select
                    placeholder="Ürün seçin"
                    disabled={!!initialValues}
                    showSearch
                    optionFilterProp="label"
                    options={productOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Barkod Türü <span className="text-red-500">*</span></label>
                <Form.Item
                  name="barcodeType"
                  rules={[{ required: true, message: 'Barkod türü zorunludur' }]}
                  className="mb-0"
                  initialValue={1}
                >
                  <Select
                    placeholder="Tür seçin"
                    options={barcodeTypeOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Birim İçi Adet</label>
                <Form.Item name="quantityPerUnit" className="mb-0" initialValue={1}>
                  <InputNumber
                    placeholder="1"
                    min={1}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-sm text-slate-700">Birincil barkod</div>
                  <Form.Item name="isPrimary" valuePropName="checked" noStyle>
                    <Switch
                      size="small"
                      checked={isPrimary}
                      onChange={(val) => {
                        setIsPrimary(val);
                        form.setFieldValue('isPrimary', val);
                      }}
                    />
                  </Form.Item>
                </div>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Varyant ID</label>
                <Form.Item name="productVariantId" className="mb-0">
                  <InputNumber
                    placeholder="Opsiyonel"
                    min={0}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Ambalaj Türü ID</label>
                <Form.Item name="packagingTypeId" className="mb-0">
                  <InputNumber
                    placeholder="Opsiyonel"
                    min={0}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── ÜRETİCİ BİLGİLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Üretici Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-sm text-slate-700">Üretici barkodu</div>
                  <Form.Item name="isManufacturerBarcode" valuePropName="checked" noStyle>
                    <Switch
                      size="small"
                      checked={isManufacturerBarcode}
                      onChange={(val) => {
                        setIsManufacturerBarcode(val);
                        form.setFieldValue('isManufacturerBarcode', val);
                      }}
                    />
                  </Form.Item>
                </div>
              </div>
              {isManufacturerBarcode && (
                <>
                  <div className="col-span-4">
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Üretici Kodu</label>
                    <Form.Item name="manufacturerCode" className="mb-0">
                      <Input
                        placeholder="Üretici firma kodu"
                        className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                      />
                    </Form.Item>
                  </div>
                  <div className="col-span-4">
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">GTIN</label>
                    <Form.Item name="gtin" className="mb-0">
                      <Input
                        placeholder="Global Trade Item Number"
                        className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                      />
                    </Form.Item>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ─────────────── GEÇERLİLİK DÖNEMİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Geçerlilik Dönemi
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Geçerlilik Başlangıcı</label>
                <Form.Item name="validFrom" className="mb-0">
                  <DatePicker
                    placeholder="Başlangıç tarihi"
                    format="DD.MM.YYYY"
                    className="!w-full !bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Geçerlilik Bitişi</label>
                <Form.Item name="validUntil" className="mb-0">
                  <DatePicker
                    placeholder="Bitiş tarihi"
                    format="DD.MM.YYYY"
                    className="!w-full !bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── AÇIKLAMA ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Açıklama
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <Form.Item name="description" className="mb-0">
                  <TextArea
                    rows={3}
                    placeholder="Barkod hakkında ek bilgiler..."
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
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
