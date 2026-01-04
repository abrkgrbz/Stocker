'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Switch, Select, DatePicker } from 'antd';
import { ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';
import { useWarehouses, useCategories } from '@/lib/api/hooks/useInventory';
import type { CycleCountDto } from '@/lib/api/services/inventory.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface CycleCountFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: CycleCountDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

const countTypeOptions = [
  { value: 1, label: 'Standart' },
  { value: 2, label: 'ABC Bazlı' },
  { value: 3, label: 'Bölge Bazlı' },
  { value: 4, label: 'Kategori Bazlı' },
  { value: 5, label: 'Rastgele' },
  { value: 6, label: 'Hareket Bazlı' },
];

const statusOptions = [
  { value: 0, label: 'Planlandı' },
  { value: 1, label: 'Devam Ediyor' },
  { value: 2, label: 'Tamamlandı' },
  { value: 3, label: 'Onaylandı' },
  { value: 4, label: 'İşlendi' },
  { value: 5, label: 'İptal Edildi' },
];

const frequencyOptions = [
  { value: 1, label: 'Günlük' },
  { value: 2, label: 'Haftalık' },
  { value: 3, label: 'İki Haftalık' },
  { value: 4, label: 'Aylık' },
  { value: 5, label: 'Üç Aylık' },
  { value: 6, label: 'Altı Aylık' },
  { value: 7, label: 'Yıllık' },
];

const abcClassOptions = [
  { value: 1, label: 'A Sınıfı - Yüksek Değer' },
  { value: 2, label: 'B Sınıfı - Orta Değer' },
  { value: 3, label: 'C Sınıfı - Düşük Değer' },
];

export default function CycleCountForm({ form, initialValues, onFinish, loading }: CycleCountFormProps) {
  const [countType, setCountType] = useState(1);

  const { data: warehouses = [] } = useWarehouses(true);
  const { data: categories = [] } = useCategories(true);

  const warehouseOptions = warehouses.map(w => ({
    value: w.id,
    label: w.name,
  }));

  const categoryOptions = categories.map(c => ({
    value: c.id,
    label: c.name,
  }));

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        scheduledStartDate: initialValues.scheduledStartDate ? dayjs(initialValues.scheduledStartDate) : null,
        scheduledEndDate: initialValues.scheduledEndDate ? dayjs(initialValues.scheduledEndDate) : null,
      });
      setCountType(initialValues.countType ?? 1);
    } else {
      form.setFieldsValue({
        countType: 1,
        status: 0,
        quantityTolerancePercent: 0,
        blockAutoApproveOnToleranceExceeded: true,
        scheduledStartDate: dayjs(),
        scheduledEndDate: dayjs().add(1, 'day'),
      });
    }
  }, [form, initialValues]);

  const showAbcFilter = countType === 2;
  const showCategoryFilter = countType === 4;

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
            HEADER: Icon + Plan Name + Status
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Count Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <ClipboardDocumentCheckIcon className="w-6 h-6 text-slate-500" />
              </div>
            </div>

            {/* Plan Name - Title Style */}
            <div className="flex-1">
              <Form.Item
                name="planName"
                rules={[
                  { required: true, message: 'Plan adı zorunludur' },
                  { max: 200, message: 'Plan adı en fazla 200 karakter olabilir' },
                ]}
                className="mb-0"
              >
                <Input
                  placeholder="Sayım Plan Adı Girin..."
                  variant="borderless"
                  className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
                />
              </Form.Item>
              <p className="text-sm text-slate-500 mt-1">Dönemsel stok sayım planı</p>
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
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Plan Numarası <span className="text-red-500">*</span></label>
                <Form.Item
                  name="planNumber"
                  rules={[{ required: true, message: 'Plan numarası zorunludur' }]}
                  className="mb-0"
                >
                  <Input
                    placeholder="CC-2024-001"
                    disabled={!!initialValues}
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Sayım Türü <span className="text-red-500">*</span></label>
                <Form.Item
                  name="countType"
                  rules={[{ required: true, message: 'Sayım türü zorunludur' }]}
                  className="mb-0"
                  initialValue={1}
                >
                  <Select
                    placeholder="Tür seçin"
                    options={countTypeOptions}
                    onChange={(val) => setCountType(val)}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
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
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Açıklama</label>
                <Form.Item name="description" className="mb-0">
                  <TextArea
                    rows={2}
                    placeholder="Sayım planı açıklaması..."
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── PLANLAMA BİLGİLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Planlama Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Planlanan Başlangıç <span className="text-red-500">*</span></label>
                <Form.Item
                  name="scheduledStartDate"
                  rules={[{ required: true, message: 'Başlangıç tarihi zorunludur' }]}
                  className="mb-0"
                >
                  <DatePicker
                    placeholder="Başlangıç tarihi"
                    format="DD.MM.YYYY"
                    className="!w-full !bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Planlanan Bitiş <span className="text-red-500">*</span></label>
                <Form.Item
                  name="scheduledEndDate"
                  rules={[{ required: true, message: 'Bitiş tarihi zorunludur' }]}
                  className="mb-0"
                >
                  <DatePicker
                    placeholder="Bitiş tarihi"
                    format="DD.MM.YYYY"
                    className="!w-full !bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Tekrarlama Sıklığı</label>
                <Form.Item name="frequency" className="mb-0">
                  <Select
                    placeholder="Sıklık seçin (opsiyonel)"
                    allowClear
                    options={frequencyOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Atanan Kişi</label>
                <Form.Item name="assignedTo" className="mb-0">
                  <Input
                    placeholder="Sayımı yapacak kişi"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── KAPSAM FİLTRELERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Kapsam Filtreleri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              {showAbcFilter && (
                <div className="col-span-4">
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">ABC Sınıfı</label>
                  <Form.Item name="abcClassFilter" className="mb-0">
                    <Select
                      placeholder="ABC sınıfı seçin"
                      allowClear
                      options={abcClassOptions}
                      className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
                    />
                  </Form.Item>
                </div>
              )}
              {showCategoryFilter && (
                <div className="col-span-4">
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Kategori</label>
                  <Form.Item name="categoryId" className="mb-0">
                    <Select
                      placeholder="Kategori seçin"
                      allowClear
                      showSearch
                      optionFilterProp="label"
                      options={categoryOptions}
                      className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
                    />
                  </Form.Item>
                </div>
              )}
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Son Hareket (gün)</label>
                <Form.Item name="daysSinceLastMovement" className="mb-0">
                  <InputNumber
                    placeholder="Örn: 30"
                    min={0}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-sm text-slate-700">Sadece negatif stoklar</div>
                  <Form.Item name="onlyNegativeStocks" valuePropName="checked" noStyle>
                    <Switch size="small" />
                  </Form.Item>
                </div>
              </div>
              <div className="col-span-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-sm text-slate-700">Sadece sıfır stoklar</div>
                  <Form.Item name="onlyZeroStocks" valuePropName="checked" noStyle>
                    <Switch size="small" />
                  </Form.Item>
                </div>
              </div>
            </div>
          </div>

          {/* ─────────────── TOLERANS AYARLARI ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Tolerans Ayarları
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Miktar Toleransı (%)</label>
                <Form.Item name="quantityTolerancePercent" className="mb-0" initialValue={0}>
                  <InputNumber
                    placeholder="0"
                    min={0}
                    max={100}
                    precision={2}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Değer Toleransı</label>
                <Form.Item name="valueTolerance" className="mb-0">
                  <InputNumber
                    placeholder="Örn: 100"
                    min={0}
                    precision={2}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 h-full">
                  <div className="text-sm text-slate-700">Tolerans aşımında otomatik onayı engelle</div>
                  <Form.Item name="blockAutoApproveOnToleranceExceeded" valuePropName="checked" noStyle initialValue={true}>
                    <Switch size="small" />
                  </Form.Item>
                </div>
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
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Planlama Notları</label>
                <Form.Item name="planningNotes" className="mb-0">
                  <TextArea
                    rows={2}
                    placeholder="Planlama ile ilgili notlar..."
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Sayım Notları</label>
                <Form.Item name="countNotes" className="mb-0">
                  <TextArea
                    rows={2}
                    placeholder="Sayım ile ilgili notlar..."
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
                Sayım İstatistikleri
              </h3>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-3">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <div className="text-2xl font-semibold text-slate-800">
                      {initialValues.totalItems || 0}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Toplam Kalem</div>
                  </div>
                </div>
                <div className="col-span-3">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <div className="text-2xl font-semibold text-green-600">
                      {initialValues.countedItems || 0}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Sayılan</div>
                  </div>
                </div>
                <div className="col-span-3">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <div className={`text-2xl font-semibold ${(initialValues.itemsWithVariance ?? 0) > 0 ? 'text-orange-600' : 'text-slate-800'}`}>
                      {initialValues.itemsWithVariance || 0}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Farklı Olan</div>
                  </div>
                </div>
                <div className="col-span-3">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <div className="text-2xl font-semibold text-blue-600">
                      %{initialValues.accuracyPercent?.toFixed(1) || '0'}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Doğruluk</div>
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
