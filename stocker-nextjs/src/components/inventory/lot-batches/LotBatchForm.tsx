'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Select, DatePicker } from 'antd';
import { ArchiveBoxIcon } from '@heroicons/react/24/outline';
import { useProducts, useSuppliers } from '@/lib/api/hooks/useInventory';
import type { LotBatchDto } from '@/lib/api/services/inventory.types';
import { LotBatchStatus } from '@/lib/api/services/inventory.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface LotBatchFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: LotBatchDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

const statusOptions = [
  { value: LotBatchStatus.Pending, label: 'Bekliyor' },
  { value: LotBatchStatus.Received, label: 'Alındı' },
  { value: LotBatchStatus.Approved, label: 'Onaylandı' },
  { value: LotBatchStatus.Quarantined, label: 'Karantinada' },
  { value: LotBatchStatus.Rejected, label: 'Reddedildi' },
  { value: LotBatchStatus.Exhausted, label: 'Tükendi' },
];

export default function LotBatchForm({ form, initialValues, onFinish, loading }: LotBatchFormProps) {
  const { data: products = [] } = useProducts(true);
  const { data: suppliers = [] } = useSuppliers(true);

  const productOptions = products.map(p => ({
    value: p.id,
    label: `${p.code} - ${p.name}`,
  }));

  const supplierOptions = suppliers.map(s => ({
    value: s.id,
    label: s.name,
  }));

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        manufacturedDate: initialValues.manufacturedDate ? dayjs(initialValues.manufacturedDate) : null,
        expiryDate: initialValues.expiryDate ? dayjs(initialValues.expiryDate) : null,
        receivedDate: initialValues.receivedDate ? dayjs(initialValues.receivedDate) : null,
      });
    } else {
      form.setFieldsValue({
        initialQuantity: 1,
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
            HEADER: Icon + Lot Number
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Lot Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <ArchiveBoxIcon className="w-6 h-6 text-slate-500" />
              </div>
            </div>

            {/* Lot Number - Title Style */}
            <div className="flex-1">
              <Form.Item
                name="lotNumber"
                rules={[
                  { required: true, message: 'Lot numarası zorunludur' },
                  { max: 100, message: 'Lot numarası en fazla 100 karakter olabilir' },
                ]}
                className="mb-0"
              >
                <Input
                  placeholder="Lot Numarası Girin..."
                  variant="borderless"
                  disabled={!!initialValues}
                  className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
                />
              </Form.Item>
              <p className="text-sm text-slate-500 mt-1">Parti/Lot takip numarası</p>
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
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Tedarikçi</label>
                <Form.Item name="supplierId" className="mb-0">
                  <Select
                    placeholder="Tedarikçi seçin (opsiyonel)"
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    options={supplierOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Başlangıç Miktarı <span className="text-red-500">*</span></label>
                <Form.Item
                  name="initialQuantity"
                  rules={[{ required: true, message: 'Miktar zorunludur' }]}
                  className="mb-0"
                >
                  <InputNumber
                    placeholder="100"
                    min={0}
                    disabled={!!initialValues}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Tedarikçi Lot No</label>
                <Form.Item name="supplierLotNumber" className="mb-0">
                  <Input
                    placeholder="Tedarikçinin lot numarası"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Sertifika Numarası</label>
                <Form.Item name="certificateNumber" className="mb-0">
                  <Input
                    placeholder="Kalite sertifikası no"
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
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Son Kullanma Tarihi</label>
                <Form.Item name="expiryDate" className="mb-0">
                  <DatePicker
                    placeholder="SKT"
                    format="DD.MM.YYYY"
                    className="!w-full !bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Satınalma Siparişi</label>
                <Form.Item name="purchaseOrderId" className="mb-0">
                  <Input
                    placeholder="PO-001"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
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
                    placeholder="Lot hakkında ek notlar..."
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── İSTATİSTİKLER (Düzenleme Modu) ─────────────── */}
          {initialValues && (
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                Stok Durumu
              </h3>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-3">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <div className="text-2xl font-semibold text-slate-800">
                      {initialValues.currentQuantity || 0}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Mevcut Miktar</div>
                  </div>
                </div>
                <div className="col-span-3">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <div className="text-2xl font-semibold text-slate-800">
                      {initialValues.reservedQuantity || 0}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Rezerve</div>
                  </div>
                </div>
                <div className="col-span-3">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <div className="text-2xl font-semibold text-green-600">
                      {initialValues.availableQuantity || 0}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Kullanılabilir</div>
                  </div>
                </div>
                <div className="col-span-3">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <div className={`text-2xl font-semibold ${(initialValues.daysUntilExpiry ?? 0) < 30 ? 'text-red-600' : 'text-slate-800'}`}>
                      {initialValues.daysUntilExpiry ?? '-'}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">SKT'ye Kalan Gün</div>
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
