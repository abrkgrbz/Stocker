'use client';

import React, { useEffect } from 'react';
import { Form, Input, Select, DatePicker } from 'antd';
import { HashtagIcon } from '@heroicons/react/24/outline';
import { useProducts, useWarehouses } from '@/lib/api/hooks/useInventory';
import type { SerialNumberDto } from '@/lib/api/services/inventory.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface SerialNumberFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: SerialNumberDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

const statusOptions = [
  { value: 0, label: 'Kullanılabilir' },
  { value: 1, label: 'Stokta' },
  { value: 2, label: 'Rezerve' },
  { value: 3, label: 'Satıldı' },
  { value: 4, label: 'İade Edildi' },
  { value: 5, label: 'Arızalı' },
  { value: 6, label: 'Tamir Bekliyor' },
  { value: 7, label: 'Hurda' },
  { value: 8, label: 'Kayıp' },
];

export default function SerialNumberForm({ form, initialValues, onFinish, loading }: SerialNumberFormProps) {
  const { data: products = [] } = useProducts(true);
  const { data: warehouses = [] } = useWarehouses(true);

  const productOptions = products.map(p => ({
    value: p.id,
    label: `${p.code} - ${p.name}`,
  }));

  const warehouseOptions = warehouses.map(w => ({
    value: w.id,
    label: w.name,
  }));

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
    } else {
      form.setFieldsValue({
        status: 0,
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
            HEADER: Icon + Serial Number
        ═══════════════════════════════════════════════════════════════ */}
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
              <Form.Item
                name="serial"
                rules={[
                  { required: true, message: 'Seri numarası zorunludur' },
                  { max: 100, message: 'Seri numarası en fazla 100 karakter olabilir' },
                ]}
                className="mb-0"
              >
                <Input
                  placeholder="Seri Numarası Girin..."
                  variant="borderless"
                  disabled={!!initialValues}
                  className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
                />
              </Form.Item>
              <p className="text-sm text-slate-500 mt-1">Ürün seri numarası takibi</p>
            </div>

            {/* Status Badge (Edit Mode) */}
            {initialValues && (
              <div className="flex-shrink-0">
                <div className="px-4 py-2 bg-slate-100 rounded-lg">
                  <span className="text-sm font-medium text-slate-600">
                    {statusOptions.find(s => s.value === initialValues.status)?.label || 'Bilinmiyor'}
                  </span>
                </div>
              </div>
            )}
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
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Durum</label>
                <Form.Item name="status" className="mb-0" initialValue={0}>
                  <Select
                    placeholder="Durum seçin"
                    options={statusOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Depo</label>
                <Form.Item name="warehouseId" className="mb-0">
                  <Select
                    placeholder="Depo seçin"
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    options={warehouseOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Konum ID</label>
                <Form.Item name="locationId" className="mb-0">
                  <Input
                    placeholder="Konum ID"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── PARTİ / TEDARİKÇİ BİLGİLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Parti / Tedarikçi Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Parti Numarası</label>
                <Form.Item name="batchNumber" className="mb-0">
                  <Input
                    placeholder="LOT-001"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Tedarikçi Seri No</label>
                <Form.Item name="supplierSerial" className="mb-0">
                  <Input
                    placeholder="Tedarikçinin verdiği seri no"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── TARİH BİLGİLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Tarih Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Üretim Tarihi</label>
                <Form.Item name="manufacturedDate" className="mb-0">
                  <DatePicker
                    placeholder="Üretim tarihi"
                    format="DD.MM.YYYY"
                    className="!w-full !bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Teslim Alma Tarihi</label>
                <Form.Item name="receivedDate" className="mb-0">
                  <DatePicker
                    placeholder="Teslim tarihi"
                    format="DD.MM.YYYY"
                    className="!w-full !bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Satış Tarihi</label>
                <Form.Item name="soldDate" className="mb-0">
                  <DatePicker
                    placeholder="Satış tarihi"
                    format="DD.MM.YYYY"
                    disabled
                    className="!w-full !bg-slate-50 !border-slate-300"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── GARANTİ BİLGİLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Garanti Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Garanti Başlangıç</label>
                <Form.Item name="warrantyStartDate" className="mb-0">
                  <DatePicker
                    placeholder="Garanti başlangıç"
                    format="DD.MM.YYYY"
                    className="!w-full !bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Garanti Bitiş</label>
                <Form.Item name="warrantyEndDate" className="mb-0">
                  <DatePicker
                    placeholder="Garanti bitiş"
                    format="DD.MM.YYYY"
                    className="!w-full !bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── NOTLAR ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Notlar
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <Form.Item name="notes" className="mb-0">
                  <TextArea
                    rows={3}
                    placeholder="Seri numarası hakkında notlar..."
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── GARANTİ DURUMU (Düzenleme Modu) ─────────────── */}
          {initialValues && (
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                Garanti Durumu
              </h3>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <div className={`text-2xl font-semibold ${initialValues.isUnderWarranty ? 'text-green-600' : 'text-red-600'}`}>
                      {initialValues.isUnderWarranty ? 'Garantili' : 'Garanti Dışı'}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Garanti Durumu</div>
                  </div>
                </div>
                <div className="col-span-6">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <div className={`text-2xl font-semibold ${(initialValues.remainingWarrantyDays ?? 0) < 30 ? 'text-orange-600' : 'text-slate-800'}`}>
                      {initialValues.remainingWarrantyDays ?? '-'}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Kalan Garanti Günü</div>
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
