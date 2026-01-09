'use client';

import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  DatePicker,
} from 'antd';
import {
  QrCodeIcon,
} from '@heroicons/react/24/outline';
import { useProducts, useUnits, usePackagingTypes } from '@/lib/api/hooks/useInventory';
import { BarcodeType } from '@/lib/api/services/inventory.types';
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
    const formattedValues = {
      ...values,
      validFrom: values.validFrom?.toISOString(),
      validUntil: values.validUntil?.toISOString(),
    };
    onFinish(formattedValues);
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
              <div className="w-16 h-16 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center">
                <QrCodeIcon className="w-8 h-8 text-green-600" />
              </div>
            </div>

            {/* Barcode Input */}
            <div className="flex-1">
              <Form.Item
                name="barcode"
                rules={[
                  { required: true, message: 'Barkod numarası zorunludur' },
                  { max: 50, message: 'Barkod en fazla 50 karakter olabilir' },
                ]}
                className="mb-0"
              >
                <Input
                  placeholder="Barkod Numarası..."
                  variant="borderless"
                  disabled={!!initialValues}
                  className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium font-mono"
                />
              </Form.Item>
              <Form.Item name="description" className="mb-0 mt-1">
                <Input
                  placeholder="Barkod açıklaması..."
                  variant="borderless"
                  className="!text-sm !text-slate-500 !p-0 placeholder:!text-slate-400"
                />
              </Form.Item>
            </div>

            {/* Barcode Type Selector */}
            <div className="flex-shrink-0 w-40">
              <Form.Item name="barcodeType" className="mb-0" initialValue={BarcodeType.EAN13}>
                <Select
                  options={barcodeTypeOptions}
                  className="w-full [&_.ant-select-selector]:!bg-slate-100 [&_.ant-select-selector]:!border-0 [&_.ant-select-selector]:!rounded-lg"
                />
              </Form.Item>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="px-8 py-6">

          {/* Ürün Bilgileri */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Ürün Bilgileri
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
                    loading={productsLoading}
                    showSearch
                    optionFilterProp="label"
                    disabled={!!initialValues}
                    options={products.map((p) => ({
                      value: p.id,
                      label: `${p.code} - ${p.name}`,
                    }))}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Birim</label>
                <Form.Item name="unitId" className="mb-0">
                  <Select
                    placeholder="Birim seçin"
                    loading={unitsLoading}
                    allowClear
                    options={units.map((u) => ({
                      value: u.id,
                      label: `${u.name} (${u.symbol || u.code})`,
                    }))}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Birim Başına Miktar</label>
                <Form.Item name="quantityPerUnit" className="mb-0" initialValue={1}>
                  <InputNumber
                    style={{ width: '100%' }}
                    min={1}
                    placeholder="1"
                    className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Ambalaj */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Ambalaj Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Ambalaj Tipi</label>
                <Form.Item name="packagingTypeId" className="mb-0">
                  <Select
                    placeholder="Ambalaj tipi seçin"
                    loading={packagingTypesLoading}
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    options={packagingTypes.map((p) => ({
                      value: p.id,
                      label: `${p.code} - ${p.name}`,
                    }))}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">GTIN</label>
                <Form.Item name="gtin" className="mb-0">
                  <Input
                    placeholder="00012345678905"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white font-mono"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Üretici Bilgileri */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Üretici Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <div className="text-sm font-medium text-slate-700">Üretici Barkodu</div>
                    <div className="text-xs text-slate-500 mt-0.5">Üretici tarafından tanımlı</div>
                  </div>
                  <Form.Item name="isManufacturerBarcode" valuePropName="checked" noStyle>
                    <Switch
                      checked={isManufacturer}
                      onChange={(val) => {
                        setIsManufacturer(val);
                        form.setFieldValue('isManufacturerBarcode', val);
                      }}
                    />
                  </Form.Item>
                </div>
              </div>
              {isManufacturer && (
                <div className="col-span-4">
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Üretici Kodu</label>
                  <Form.Item name="manufacturerCode" className="mb-0">
                    <Input
                      placeholder="MFR-001"
                      className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                    />
                  </Form.Item>
                </div>
              )}
            </div>
          </div>

          {/* Durum */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Durum ve Geçerlilik
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <div className="text-sm font-medium text-slate-700">Birincil Barkod</div>
                    <div className="text-xs text-slate-500 mt-0.5">Ana ürün barkodu</div>
                  </div>
                  <Form.Item name="isPrimary" valuePropName="checked" noStyle>
                    <Switch
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
