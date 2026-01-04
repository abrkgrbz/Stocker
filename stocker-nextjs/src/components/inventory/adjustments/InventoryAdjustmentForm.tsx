'use client';

import React, { useEffect } from 'react';
import { Form, Input, Select, DatePicker } from 'antd';
import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { useWarehouses } from '@/lib/api/hooks/useInventory';
import type { InventoryAdjustmentDto } from '@/lib/api/services/inventory.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface InventoryAdjustmentFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: InventoryAdjustmentDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

const adjustmentTypeOptions = [
  { value: 1, label: 'Artırma' },
  { value: 2, label: 'Azaltma' },
  { value: 3, label: 'Düzeltme' },
  { value: 4, label: 'Fire' },
  { value: 5, label: 'Dahili Transfer' },
];

const adjustmentReasonOptions = [
  { value: 1, label: 'Stok Sayım Farkı' },
  { value: 2, label: 'Hasar' },
  { value: 3, label: 'Kayıp' },
  { value: 4, label: 'Hırsızlık' },
  { value: 5, label: 'Üretim Firesi' },
  { value: 6, label: 'Tarih Geçmiş' },
  { value: 7, label: 'Kalite Reddi' },
  { value: 8, label: 'Müşteri İadesi' },
  { value: 9, label: 'Tedarikçi İadesi' },
  { value: 10, label: 'Sistem Düzeltmesi' },
  { value: 11, label: 'Açılış Stoğu' },
  { value: 99, label: 'Diğer' },
];

const statusOptions = [
  { value: 0, label: 'Taslak' },
  { value: 1, label: 'Onay Bekliyor' },
  { value: 2, label: 'Onaylandı' },
  { value: 3, label: 'Reddedildi' },
  { value: 4, label: 'İşlendi' },
  { value: 5, label: 'İptal Edildi' },
];

export default function InventoryAdjustmentForm({ form, initialValues, onFinish, loading }: InventoryAdjustmentFormProps) {
  const { data: warehouses = [] } = useWarehouses(true);

  const warehouseOptions = warehouses.map(w => ({
    value: w.id,
    label: w.name,
  }));

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        adjustmentDate: initialValues.adjustmentDate ? dayjs(initialValues.adjustmentDate) : dayjs(),
      });
    } else {
      form.setFieldsValue({
        adjustmentDate: dayjs(),
        adjustmentType: 1,
        reason: 1,
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
            HEADER: Icon + Adjustment Number
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Adjustment Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <AdjustmentsHorizontalIcon className="w-6 h-6 text-slate-500" />
              </div>
            </div>

            {/* Adjustment Number - Title Style */}
            <div className="flex-1">
              <Form.Item
                name="adjustmentNumber"
                className="mb-0"
              >
                <Input
                  placeholder="Düzeltme Numarası (otomatik)"
                  variant="borderless"
                  disabled={!!initialValues}
                  className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
                />
              </Form.Item>
              <p className="text-sm text-slate-500 mt-1">Stok düzeltme/ayarlama kaydı</p>
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
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Düzeltme Tarihi <span className="text-red-500">*</span></label>
                <Form.Item
                  name="adjustmentDate"
                  rules={[{ required: true, message: 'Tarih zorunludur' }]}
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
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Düzeltme Tipi <span className="text-red-500">*</span></label>
                <Form.Item
                  name="adjustmentType"
                  rules={[{ required: true, message: 'Tip zorunludur' }]}
                  className="mb-0"
                  initialValue={1}
                >
                  <Select
                    placeholder="Tip seçin"
                    options={adjustmentTypeOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Neden <span className="text-red-500">*</span></label>
                <Form.Item
                  name="reason"
                  rules={[{ required: true, message: 'Neden zorunludur' }]}
                  className="mb-0"
                  initialValue={1}
                >
                  <Select
                    placeholder="Neden seçin"
                    options={adjustmentReasonOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── DEPO BİLGİLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Depo Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Depo <span className="text-red-500">*</span></label>
                <Form.Item
                  name="warehouseId"
                  rules={[{ required: true, message: 'Depo seçimi zorunludur' }]}
                  className="mb-0"
                >
                  <Select
                    placeholder="Depo seçin"
                    showSearch
                    optionFilterProp="label"
                    options={warehouseOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Referans Numarası</label>
                <Form.Item name="referenceNumber" className="mb-0">
                  <Input
                    placeholder="Sayım no, sipariş no vb."
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
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
                    placeholder="Düzeltme hakkında açıklama..."
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
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Dahili Notlar</label>
                <Form.Item name="internalNotes" className="mb-0">
                  <TextArea
                    rows={2}
                    placeholder="Sadece dahili kullanım için..."
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Muhasebe Notları</label>
                <Form.Item name="accountingNotes" className="mb-0">
                  <TextArea
                    rows={2}
                    placeholder="Muhasebe için notlar..."
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── ÖZET (Düzenleme Modu) ─────────────── */}
          {initialValues && (
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                Özet
              </h3>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-4">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <div className="text-2xl font-semibold text-slate-800">
                      {initialValues.items?.length || 0}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Kalem Sayısı</div>
                  </div>
                </div>
                <div className="col-span-4">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <div className={`text-2xl font-semibold ${(initialValues.totalCostImpact || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: initialValues.currency || 'TRY' }).format(initialValues.totalCostImpact || 0)}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Maliyet Etkisi</div>
                  </div>
                </div>
                <div className="col-span-4">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <div className="text-sm font-medium text-slate-800">
                      {initialValues.approvedBy || '-'}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Onaylayan</div>
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
