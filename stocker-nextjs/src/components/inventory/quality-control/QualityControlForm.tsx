'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Select } from 'antd';
import { ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';

const { TextArea } = Input;
import { useProducts, useWarehouses, useSuppliers, useUnits } from '@/lib/api/hooks/useInventory';
import type { QualityControlDto } from '@/lib/api/services/inventory.types';

interface QualityControlFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: QualityControlDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

const qcTypeOptions = [
  { value: 1, label: 'Giriş Denetimi' },
  { value: 2, label: 'Çıkış Denetimi' },
  { value: 3, label: 'Süreç İçi Denetim' },
  { value: 4, label: 'Final Denetimi' },
  { value: 5, label: 'Periyodik Denetim' },
  { value: 6, label: 'Müşteri Şikayeti' },
  { value: 7, label: 'İade Denetimi' },
];

export default function QualityControlForm({ form, initialValues, onFinish, loading }: QualityControlFormProps) {
  const [selectedProductId, setSelectedProductId] = useState<number | undefined>();

  const { data: products = [] } = useProducts();
  const { data: warehouses = [] } = useWarehouses();
  const { data: suppliers = [] } = useSuppliers();
  const { data: units = [] } = useUnits(true);

  const productOptions = products.map(p => ({
    value: p.id,
    label: `${p.code} - ${p.name}`,
  }));

  const warehouseOptions = warehouses.map(w => ({
    value: w.id,
    label: `${w.code} - ${w.name}`,
  }));

  const supplierOptions = suppliers.map(s => ({
    value: s.id,
    label: `${s.code} - ${s.name}`,
  }));

  const unitOptions = units.map(u => ({
    value: u.code,
    label: `${u.name} (${u.symbol || u.code})`,
  }));

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
      setSelectedProductId(initialValues.productId);
    } else {
      form.setFieldsValue({
        inspectedQuantity: 1,
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
            HEADER: Icon + Title
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* QC Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <ClipboardDocumentCheckIcon className="w-6 h-6 text-slate-500" />
              </div>
            </div>

            {/* Title */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900 m-0">
                {initialValues ? 'Kalite Kontrol Düzenle' : 'Yeni Kalite Kontrol'}
              </h2>
              <p className="text-sm text-slate-500 m-0 mt-1">
                {initialValues ? `QC No: ${initialValues.qcNumber}` : 'Ürün kalite kontrolü için yeni kayıt oluşturun'}
              </p>
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
                    showSearch
                    optionFilterProp="label"
                    options={productOptions}
                    disabled={!!initialValues}
                    onChange={(value) => setSelectedProductId(value)}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Kontrol Tipi <span className="text-red-500">*</span></label>
                <Form.Item
                  name="qcType"
                  rules={[{ required: true, message: 'Kontrol tipi zorunludur' }]}
                  className="mb-0"
                >
                  <Select
                    placeholder="Tip seçin"
                    options={qcTypeOptions}
                    disabled={!!initialValues}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Denetlenen Miktar <span className="text-red-500">*</span></label>
                <Form.Item
                  name="inspectedQuantity"
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
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Birim <span className="text-red-500">*</span></label>
                <Form.Item
                  name="unit"
                  rules={[{ required: true, message: 'Birim zorunludur' }]}
                  className="mb-0"
                >
                  <Select
                    placeholder="Birim seçin"
                    showSearch
                    optionFilterProp="label"
                    options={unitOptions}
                    disabled={!!initialValues}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Numune Miktarı</label>
                <Form.Item name="sampleQuantity" className="mb-0">
                  <InputNumber
                    placeholder="10"
                    min={0}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── LOT VE TEDARİKÇİ BİLGİLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Lot ve Tedarikçi Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Lot Numarası</label>
                <Form.Item name="lotNumber" className="mb-0">
                  <Input
                    placeholder="LOT-2024-001"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Tedarikçi</label>
                <Form.Item name="supplierId" className="mb-0">
                  <Select
                    placeholder="Tedarikçi seçin"
                    showSearch
                    allowClear
                    optionFilterProp="label"
                    options={supplierOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Satınalma Sipariş No</label>
                <Form.Item name="purchaseOrderNumber" className="mb-0">
                  <Input
                    placeholder="PO-2024-001"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── DENETİM BİLGİLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Denetim Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Depo</label>
                <Form.Item name="warehouseId" className="mb-0">
                  <Select
                    placeholder="Depo seçin"
                    showSearch
                    allowClear
                    optionFilterProp="label"
                    options={warehouseOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Denetim Yeri</label>
                <Form.Item name="inspectionLocation" className="mb-0">
                  <Input
                    placeholder="Kalite Kontrol Bölümü"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Denetim Standardı</label>
                <Form.Item name="inspectionStandard" className="mb-0">
                  <Input
                    placeholder="ISO 9001"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Denetim Notları</label>
                <Form.Item name="inspectionNotes" className="mb-0">
                  <TextArea
                    placeholder="Denetim hakkında notlar..."
                    rows={3}
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white !resize-none"
                  />
                </Form.Item>
              </div>
              {initialValues && (
                <div className="col-span-12">
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Dahili Notlar</label>
                  <Form.Item name="internalNotes" className="mb-0">
                    <TextArea
                      placeholder="Dahili notlar..."
                      rows={2}
                      className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white !resize-none"
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
