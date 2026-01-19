'use client';

import React, { useEffect, useState } from 'react';
import { Form, DatePicker } from 'antd';
import { QrCodeIcon } from '@heroicons/react/24/outline';
import { useProducts, useUnits, usePackagingTypes } from '@/lib/api/hooks/useInventory';
import { BarcodeType } from '@/lib/api/services/inventory.types';
import type { BarcodeDefinitionDto, CreateBarcodeDefinitionDto, UpdateBarcodeDefinitionDto } from '@/lib/api/services/inventory.types';
import dayjs from 'dayjs';
import {
  FormSection,
  FormInput,
  FormNumber,
  FormSelect,
  FormSwitch,
  useUnsavedChanges,
} from '@/components/forms';

interface BarcodeDefinitionFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: BarcodeDefinitionDto;
  onFinish: (values: CreateBarcodeDefinitionDto | UpdateBarcodeDefinitionDto) => void;
  loading?: boolean;
}

const barcodeTypeOptions = [
  { value: BarcodeType.EAN13, label: 'EAN-13' },
  { value: BarcodeType.EAN8, label: 'EAN-8' },
  { value: BarcodeType.UPCA, label: 'UPC-A' },
  { value: BarcodeType.UPCE, label: 'UPC-E' },
  { value: BarcodeType.Code128, label: 'Code 128' },
  { value: BarcodeType.Code39, label: 'Code 39' },
  { value: BarcodeType.QRCode, label: 'QR Code' },
  { value: BarcodeType.DataMatrix, label: 'Data Matrix' },
  { value: BarcodeType.PDF417, label: 'PDF417' },
  { value: BarcodeType.ITF14, label: 'ITF-14' },
  { value: BarcodeType.GS1_128, label: 'GS1-128' },
  { value: BarcodeType.Internal, label: 'Dahili' },
];

export default function BarcodeDefinitionForm({ form, initialValues, onFinish, loading }: BarcodeDefinitionFormProps) {
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: units = [], isLoading: unitsLoading } = useUnits();
  const { data: packagingTypes = [], isLoading: packagingTypesLoading } = usePackagingTypes();

  const [isPrimary, setIsPrimary] = useState(false);
  const [isManufacturer, setIsManufacturer] = useState(false);

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
        validFrom: initialValues.validFrom ? dayjs(initialValues.validFrom) : undefined,
        validUntil: initialValues.validUntil ? dayjs(initialValues.validUntil) : undefined,
      });
      setIsPrimary(initialValues.isPrimary);
      setIsManufacturer(initialValues.isManufacturerBarcode);
    } else {
      form.setFieldsValue({
        barcodeType: BarcodeType.EAN13,
        quantityPerUnit: 1,
        isPrimary: false,
        isManufacturerBarcode: false,
      });
    }
  }, [form, initialValues]);

  const handleFinish = (values: any) => {
    markAsSaved();
    const formattedValues = {
      ...values,
      validFrom: values.validFrom?.toISOString(),
      validUntil: values.validUntil?.toISOString(),
    };
    onFinish(formattedValues);
  };

  const productOptions = products.map((p) => ({
    value: p.id,
    label: `${p.code} - ${p.name}`,
  }));

  const unitOptions = units.map((u) => ({
    value: u.id,
    label: `${u.name} (${u.symbol || u.code})`,
  }));

  const packagingTypeOptions = packagingTypes.map((p) => ({
    value: p.id,
    label: `${p.code} - ${p.name}`,
  }));

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
              <div className="w-16 h-16 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center">
                <QrCodeIcon className="w-8 h-8 text-green-600" />
              </div>
            </div>

            {/* Barcode Input */}
            <div className="flex-1">
              <FormInput
                name="barcode"
                placeholder="Barkod Numarası..."
                variant="borderless"
                disabled={!!initialValues}
                rules={[
                  { required: true, message: 'Barkod numarası zorunludur' },
                  { max: 50, message: 'Barkod en fazla 50 karakter olabilir' },
                ]}
                className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium font-mono"
              />
              <FormInput
                name="description"
                placeholder="Barkod açıklaması..."
                variant="borderless"
                className="!text-sm !text-slate-500 !p-0 placeholder:!text-slate-400 mt-1"
              />
            </div>

            {/* Barcode Type Selector */}
            <div className="flex-shrink-0 w-40">
              <FormSelect
                name="barcodeType"
                options={barcodeTypeOptions}
                formItemProps={{ initialValue: BarcodeType.EAN13 }}
                className="w-full [&_.ant-select-selector]:!bg-slate-100 [&_.ant-select-selector]:!border-0 [&_.ant-select-selector]:!rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="px-8 py-6">

          {/* Ürün Bilgileri */}
          <FormSection title="Ürün Bilgileri">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <FormSelect
                  name="productId"
                  label="Ürün"
                  required
                  placeholder="Ürün seçin"
                  loading={productsLoading}
                  disabled={!!initialValues}
                  options={productOptions}
                />
              </div>
              <div className="col-span-3">
                <FormSelect
                  name="unitId"
                  label="Birim"
                  placeholder="Birim seçin"
                  loading={unitsLoading}
                  allowClear
                  options={unitOptions}
                />
              </div>
              <div className="col-span-3">
                <FormNumber
                  name="quantityPerUnit"
                  label="Birim Başına Miktar"
                  placeholder="1"
                  min={1}
                  formItemProps={{ initialValue: 1 }}
                />
              </div>
            </div>
          </FormSection>

          {/* Ambalaj Bilgileri */}
          <FormSection title="Ambalaj Bilgileri">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <FormSelect
                  name="packagingTypeId"
                  label="Ambalaj Tipi"
                  placeholder="Ambalaj tipi seçin"
                  loading={packagingTypesLoading}
                  allowClear
                  options={packagingTypeOptions}
                />
              </div>
              <div className="col-span-6">
                <FormInput
                  name="gtin"
                  label="GTIN"
                  placeholder="00012345678905"
                  className="font-mono"
                />
              </div>
            </div>
          </FormSection>

          {/* Üretici Bilgileri */}
          <FormSection title="Üretici Bilgileri">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <FormSwitch
                  form={form}
                  name="isManufacturerBarcode"
                  title="Üretici Barkodu"
                  value={isManufacturer}
                  onChange={setIsManufacturer}
                  descriptionTrue="Üretici tarafından tanımlı"
                  descriptionFalse="Dahili barkod"
                  disabled={loading}
                />
              </div>
              {isManufacturer && (
                <div className="col-span-4">
                  <FormInput
                    name="manufacturerCode"
                    label="Üretici Kodu"
                    placeholder="MFR-001"
                  />
                </div>
              )}
            </div>
          </FormSection>

          {/* Durum ve Geçerlilik */}
          <FormSection title="Durum ve Geçerlilik">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <FormSwitch
                  form={form}
                  name="isPrimary"
                  title="Birincil Barkod"
                  value={isPrimary}
                  onChange={setIsPrimary}
                  descriptionTrue="Ana ürün barkodu"
                  descriptionFalse="İkincil barkod"
                  disabled={loading}
                />
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Geçerlilik Başlangıcı</label>
                <Form.Item name="validFrom" className="mb-0">
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                    placeholder="Başlangıç tarihi"
                    className="[&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Geçerlilik Bitişi</label>
                <Form.Item name="validUntil" className="mb-0">
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                    placeholder="Bitiş tarihi"
                    className="[&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300"
                  />
                </Form.Item>
              </div>
            </div>
          </FormSection>

        </div>
      </div>

      {/* Hidden submit button */}
      <Form.Item hidden>
        <button type="submit" />
      </Form.Item>
    </Form>
  );
}
