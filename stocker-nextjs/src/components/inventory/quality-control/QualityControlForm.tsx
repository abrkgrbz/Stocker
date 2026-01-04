'use client';

import React, { useEffect } from 'react';
import { Form, Input, InputNumber, Select, DatePicker } from 'antd';
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import { useProducts, useSuppliers, useWarehouses } from '@/lib/api/hooks/useInventory';
import type { QualityControlDto } from '@/lib/api/services/inventory.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface QualityControlFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: QualityControlDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

const qcTypeOptions = [
  { value: 1, label: 'Giriş Kontrolü' },
  { value: 2, label: 'Çıkış Kontrolü' },
  { value: 3, label: 'Süreç İçi Kontrol' },
  { value: 4, label: 'Final Kontrol' },
  { value: 5, label: 'Periyodik Kontrol' },
  { value: 6, label: 'Müşteri Şikayeti' },
  { value: 7, label: 'İade Kontrolü' },
];

const statusOptions = [
  { value: 0, label: 'Bekliyor' },
  { value: 1, label: 'Devam Ediyor' },
  { value: 2, label: 'Tamamlandı' },
  { value: 3, label: 'İptal Edildi' },
];

const resultOptions = [
  { value: 0, label: 'Bekliyor' },
  { value: 1, label: 'Geçti' },
  { value: 2, label: 'Kaldı' },
  { value: 3, label: 'Kısmi Geçti' },
  { value: 4, label: 'Şartlı Geçti' },
];

const actionOptions = [
  { value: 0, label: 'Yok' },
  { value: 1, label: 'Kabul Et' },
  { value: 2, label: 'Reddet' },
  { value: 3, label: 'Kısmi Kabul' },
  { value: 4, label: 'Sapma ile Kabul' },
  { value: 5, label: 'Yeniden İşle' },
  { value: 6, label: 'Tedarikçiye İade' },
  { value: 7, label: 'Fire' },
  { value: 8, label: 'Karantina' },
];

const rejectionCategoryOptions = [
  { value: 1, label: 'Görsel Kusur' },
  { value: 2, label: 'Boyut Sapması' },
  { value: 3, label: 'Fonksiyonel Arıza' },
  { value: 4, label: 'Malzeme Hatası' },
  { value: 5, label: 'Ambalaj Hasarı' },
  { value: 6, label: 'Kontaminasyon' },
  { value: 7, label: 'Belge Eksikliği' },
  { value: 8, label: 'Son Kullanma Tarihi' },
  { value: 99, label: 'Diğer' },
];

export default function QualityControlForm({ form, initialValues, onFinish, loading }: QualityControlFormProps) {
  const { data: products = [] } = useProducts(true);
  const { data: suppliers = [] } = useSuppliers(true);
  const { data: warehouses = [] } = useWarehouses(true);

  const productOptions = products.map(p => ({
    value: p.id,
    label: `${p.code} - ${p.name}`,
  }));

  const supplierOptions = suppliers.map(s => ({
    value: s.id,
    label: s.name,
  }));

  const warehouseOptions = warehouses.map(w => ({
    value: w.id,
    label: w.name,
  }));

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        inspectionDate: initialValues.inspectionDate ? dayjs(initialValues.inspectionDate) : dayjs(),
        actionDate: initialValues.actionDate ? dayjs(initialValues.actionDate) : null,
      });
    } else {
      form.setFieldsValue({
        qcType: 1,
        status: 0,
        result: 0,
        recommendedAction: 0,
        inspectionDate: dayjs(),
        unit: 'Adet',
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
            HEADER: Icon + QC Number + Status
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* QC Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <ClipboardDocumentListIcon className="w-6 h-6 text-slate-500" />
              </div>
            </div>

            {/* QC Number - Title Style */}
            <div className="flex-1">
              <Form.Item
                name="qcNumber"
                rules={[
                  { required: true, message: 'Kalite kontrol numarası zorunludur' },
                  { max: 50, message: 'Numara en fazla 50 karakter olabilir' },
                ]}
                className="mb-0"
              >
                <Input
                  placeholder="Kalite Kontrol Numarası..."
                  variant="borderless"
                  disabled={!!initialValues}
                  className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium font-mono"
                />
              </Form.Item>
              <p className="text-sm text-slate-500 mt-1">ISO 9001, HACCP, GMP uyumlu kalite kontrol</p>
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
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Kontrol Türü <span className="text-red-500">*</span></label>
                <Form.Item
                  name="qcType"
                  rules={[{ required: true, message: 'Kontrol türü zorunludur' }]}
                  className="mb-0"
                  initialValue={1}
                >
                  <Select
                    placeholder="Tür seçin"
                    options={qcTypeOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Kontrol Tarihi <span className="text-red-500">*</span></label>
                <Form.Item
                  name="inspectionDate"
                  rules={[{ required: true, message: 'Kontrol tarihi zorunludur' }]}
                  className="mb-0"
                >
                  <DatePicker
                    placeholder="Tarih seçin"
                    format="DD.MM.YYYY"
                    className="!w-full !bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
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
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Lot Numarası</label>
                <Form.Item name="lotNumber" className="mb-0">
                  <Input
                    placeholder="LOT-001"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Tedarikçi</label>
                <Form.Item name="supplierId" className="mb-0">
                  <Select
                    placeholder="Tedarikçi seçin"
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    options={supplierOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Depo</label>
                <Form.Item name="warehouseId" className="mb-0">
                  <Select
                    placeholder="Depo seçin"
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    options={warehouseOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Satınalma Siparişi No</label>
                <Form.Item name="purchaseOrderNumber" className="mb-0">
                  <Input
                    placeholder="PO-001"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── MİKTAR BİLGİLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Miktar Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Kontrol Edilen <span className="text-red-500">*</span></label>
                <Form.Item
                  name="inspectedQuantity"
                  rules={[{ required: true, message: 'Miktar zorunludur' }]}
                  className="mb-0"
                >
                  <InputNumber
                    placeholder="100"
                    min={0}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Birim <span className="text-red-500">*</span></label>
                <Form.Item
                  name="unit"
                  rules={[{ required: true, message: 'Birim zorunludur' }]}
                  className="mb-0"
                  initialValue="Adet"
                >
                  <Input
                    placeholder="Adet"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Numune Miktarı</label>
                <Form.Item name="sampleQuantity" className="mb-0">
                  <InputNumber
                    placeholder="Örn: 10"
                    min={0}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Kabul Edilen</label>
                <Form.Item name="acceptedQuantity" className="mb-0">
                  <InputNumber
                    placeholder="0"
                    min={0}
                    disabled={!initialValues}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Reddedilen</label>
                <Form.Item name="rejectedQuantity" className="mb-0">
                  <InputNumber
                    placeholder="0"
                    min={0}
                    disabled={!initialValues}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── KONTROL DETAYLARI ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Kontrol Detayları
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Kontrol Eden</label>
                <Form.Item name="inspectorName" className="mb-0">
                  <Input
                    placeholder="Kontrolör adı"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Kontrol Lokasyonu</label>
                <Form.Item name="inspectionLocation" className="mb-0">
                  <Input
                    placeholder="Örn: Giriş Rampa-1"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Kontrol Süresi (dk)</label>
                <Form.Item name="inspectionDurationMinutes" className="mb-0">
                  <InputNumber
                    placeholder="Örn: 30"
                    min={0}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Kontrol Standardı</label>
                <Form.Item name="inspectionStandard" className="mb-0">
                  <Input
                    placeholder="Örn: ISO 9001, HACCP, GMP"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── SONUÇ BİLGİLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Sonuç Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Sonuç</label>
                <Form.Item name="result" className="mb-0" initialValue={0}>
                  <Select
                    placeholder="Sonuç seçin"
                    options={resultOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Kalite Puanı (0-100)</label>
                <Form.Item name="qualityScore" className="mb-0">
                  <InputNumber
                    placeholder="Örn: 95"
                    min={0}
                    max={100}
                    precision={2}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Kalite Seviyesi</label>
                <Form.Item name="qualityGrade" className="mb-0">
                  <Input
                    placeholder="Örn: A, B, C"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Önerilen Eylem</label>
                <Form.Item name="recommendedAction" className="mb-0" initialValue={0}>
                  <Select
                    placeholder="Eylem seçin"
                    options={actionOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Red Kategorisi</label>
                <Form.Item name="rejectionCategory" className="mb-0">
                  <Select
                    placeholder="Kategori seçin"
                    allowClear
                    options={rejectionCategoryOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
                  />
                </Form.Item>
              </div>
              <div className="col-span-8">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Red Nedeni</label>
                <Form.Item name="rejectionReason" className="mb-0">
                  <Input
                    placeholder="Red sebebini açıklayın"
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
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Kontrol Notları</label>
                <Form.Item name="inspectionNotes" className="mb-0">
                  <TextArea
                    rows={2}
                    placeholder="Kontrol sırasında yapılan gözlemler..."
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Dahili Notlar</label>
                <Form.Item name="internalNotes" className="mb-0">
                  <TextArea
                    rows={2}
                    placeholder="Dahili kullanım için notlar..."
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Tedarikçi Bildirimi</label>
                <Form.Item name="supplierNotification" className="mb-0">
                  <TextArea
                    rows={2}
                    placeholder="Tedarikçiye gönderilecek bildirim..."
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
                Kontrol Özeti
              </h3>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-3">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <div className="text-2xl font-semibold text-slate-800">
                      {initialValues.inspectedQuantity || 0}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Kontrol Edilen</div>
                  </div>
                </div>
                <div className="col-span-3">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <div className="text-2xl font-semibold text-green-600">
                      {initialValues.acceptedQuantity || 0}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Kabul Edilen</div>
                  </div>
                </div>
                <div className="col-span-3">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <div className="text-2xl font-semibold text-red-600">
                      {initialValues.rejectedQuantity || 0}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Reddedilen</div>
                  </div>
                </div>
                <div className="col-span-3">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <div className="text-2xl font-semibold text-blue-600">
                      {initialValues.qualityScore ? `%${initialValues.qualityScore}` : '-'}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Kalite Puanı</div>
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
