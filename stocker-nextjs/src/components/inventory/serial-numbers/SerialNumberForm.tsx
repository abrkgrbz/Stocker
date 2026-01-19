'use client';

import React, { useEffect, useState } from 'react';
import { Form, DatePicker } from 'antd';
import { HashtagIcon } from '@heroicons/react/24/outline';
import { useProducts, useWarehouses, useLocations } from '@/lib/api/hooks/useInventory';
import { SerialNumberStatus, type SerialNumberDto, type CreateSerialNumberDto, type UpdateSerialNumberDto } from '@/lib/api/services/inventory.types';
import dayjs from 'dayjs';
import {
  FormSection,
  FormInput,
  FormTextArea,
  FormSelect,
  useUnsavedChanges,
} from '@/components/forms';

interface SerialNumberFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: SerialNumberDto;
  onFinish: (values: CreateSerialNumberDto | UpdateSerialNumberDto) => void;
  loading?: boolean;
}

const serialNumberStatuses = [
  { value: SerialNumberStatus.Available, label: 'Kullanılabilir' },
  { value: SerialNumberStatus.InStock, label: 'Stokta' },
  { value: SerialNumberStatus.Reserved, label: 'Rezerve' },
  { value: SerialNumberStatus.Sold, label: 'Satıldı' },
  { value: SerialNumberStatus.Returned, label: 'İade Edildi' },
  { value: SerialNumberStatus.Defective, label: 'Arızalı' },
  { value: SerialNumberStatus.InRepair, label: 'Tamirde' },
  { value: SerialNumberStatus.Scrapped, label: 'Hurda' },
  { value: SerialNumberStatus.Lost, label: 'Kayıp' },
  { value: SerialNumberStatus.OnLoan, label: 'Ödünç Verildi' },
  { value: SerialNumberStatus.InTransit, label: 'Transfer Sürecinde' },
];

export default function SerialNumberForm({ form, initialValues, onFinish, loading }: SerialNumberFormProps) {
  const [warehouseId, setWarehouseId] = useState<number | undefined>();

  const { data: products = [] } = useProducts();
  const { data: warehouses = [] } = useWarehouses();
  const { data: locations = [] } = useLocations(warehouseId);

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
        manufacturedDate: initialValues.manufacturedDate ? dayjs(initialValues.manufacturedDate) : null,
        receivedDate: initialValues.receivedDate ? dayjs(initialValues.receivedDate) : null,
        soldDate: initialValues.soldDate ? dayjs(initialValues.soldDate) : null,
        warrantyStartDate: initialValues.warrantyStartDate ? dayjs(initialValues.warrantyStartDate) : null,
        warrantyEndDate: initialValues.warrantyEndDate ? dayjs(initialValues.warrantyEndDate) : null,
      });
      setWarehouseId(initialValues.warehouseId);
    }
  }, [form, initialValues]);

  const handleFinish = (values: any) => {
    markAsSaved();
    onFinish({
      ...values,
      manufacturedDate: values.manufacturedDate?.toISOString(),
      receivedDate: values.receivedDate?.toISOString(),
      soldDate: values.soldDate?.toISOString(),
      warrantyStartDate: values.warrantyStartDate?.toISOString(),
      warrantyEndDate: values.warrantyEndDate?.toISOString(),
    });
  };

  const productOptions = products
    .filter(p => p.trackSerialNumbers)
    .map(p => ({
      value: p.id,
      label: `${p.code} - ${p.name}`,
    }));

  const warehouseOptions = warehouses.map(w => ({
    value: w.id,
    label: w.name,
  }));

  const locationOptions = locations.map(l => ({
    value: l.id,
    label: l.name,
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

        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Serial Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <HashtagIcon className="w-6 h-6 text-slate-500" />
              </div>
            </div>

            {/* Serial Number - Title Style */}
            <div className="flex-1">
              <FormInput
                name="serial"
                placeholder="Seri Numarası Girin..."
                variant="borderless"
                disabled={!!initialValues}
                rules={[{ required: true, message: 'Seri numarası zorunludur' }]}
                className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
              />
              <FormInput
                name="supplierSerial"
                placeholder="Tedarikçi seri numarası (opsiyonel)..."
                variant="borderless"
                className="!text-sm !text-slate-500 !p-0 placeholder:!text-slate-400 mt-1"
              />
            </div>

            {/* Status Badge (Edit mode) */}
            {initialValues && (
              <div className="flex-shrink-0">
                <FormSelect
                  name="status"
                  options={serialNumberStatuses}
                  className="w-44 [&_.ant-select-selector]:!bg-slate-100 [&_.ant-select-selector]:!border-slate-200"
                />
              </div>
            )}
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
                  disabled={!!initialValues}
                  options={productOptions}
                />
              </div>
              <div className="col-span-6">
                <FormInput
                  name="batchNumber"
                  label="Parti Numarası"
                  placeholder="Parti numarası..."
                />
              </div>
            </div>
          </FormSection>

          {/* Depo & Lokasyon */}
          <FormSection title="Depo & Lokasyon">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <FormSelect
                  name="warehouseId"
                  label="Depo"
                  placeholder="Depo seçin"
                  allowClear
                  options={warehouseOptions}
                  onChange={(val) => setWarehouseId(val)}
                />
              </div>
              <div className="col-span-6">
                <FormSelect
                  name="locationId"
                  label="Lokasyon"
                  placeholder={warehouseId ? 'Lokasyon seçin' : '—'}
                  allowClear
                  disabled={!warehouseId}
                  options={locationOptions}
                />
              </div>
            </div>
          </FormSection>

          {/* Tarih Bilgileri */}
          <FormSection title="Tarih Bilgileri">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Üretim Tarihi</label>
                <Form.Item name="manufacturedDate" className="mb-0">
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD.MM.YYYY"
                    placeholder="Tarih seçin"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Alım Tarihi</label>
                <Form.Item name="receivedDate" className="mb-0">
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD.MM.YYYY"
                    placeholder="Tarih seçin"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              {initialValues && (
                <div className="col-span-4">
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Satış Tarihi</label>
                  <Form.Item name="soldDate" className="mb-0">
                    <DatePicker
                      style={{ width: '100%' }}
                      format="DD.MM.YYYY"
                      placeholder="Tarih seçin"
                      className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!bg-white"
                    />
                  </Form.Item>
                </div>
              )}
            </div>
          </FormSection>

          {/* Garanti Bilgileri */}
          <FormSection title="Garanti Bilgileri">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Garanti Başlangıç</label>
                <Form.Item name="warrantyStartDate" className="mb-0">
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD.MM.YYYY"
                    placeholder="Tarih seçin"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Garanti Bitiş</label>
                <Form.Item name="warrantyEndDate" className="mb-0">
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD.MM.YYYY"
                    placeholder="Tarih seçin"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              {initialValues && (
                <div className="col-span-4">
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Garanti Durumu</label>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <div className={`text-lg font-semibold ${initialValues.isUnderWarranty ? 'text-emerald-600' : 'text-slate-500'}`}>
                      {initialValues.isUnderWarranty ? 'Garantili' : 'Garanti Dışı'}
                    </div>
                    {initialValues.remainingWarrantyDays !== undefined && initialValues.remainingWarrantyDays > 0 && (
                      <div className="text-xs text-slate-500 mt-1">
                        {initialValues.remainingWarrantyDays} gün kaldı
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </FormSection>

          {/* Referans Bilgileri (Edit Mode) */}
          {initialValues && (
            <FormSection title="Referans Bilgileri">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-4">
                  <FormInput
                    name="customerId"
                    label="Müşteri ID"
                    placeholder="Müşteri ID..."
                  />
                </div>
                <div className="col-span-4">
                  <FormInput
                    name="salesOrderId"
                    label="Satış Siparişi ID"
                    placeholder="Satış siparişi ID..."
                  />
                </div>
                <div className="col-span-4">
                  <FormInput
                    name="purchaseOrderId"
                    label="Satın Alma Siparişi ID"
                    placeholder="Satın alma siparişi ID..."
                  />
                </div>
              </div>
            </FormSection>
          )}

          {/* Notlar */}
          <FormSection title="Notlar">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <FormTextArea
                  name="notes"
                  placeholder="Seri numarası ile ilgili ek notlar..."
                  rows={3}
                />
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
