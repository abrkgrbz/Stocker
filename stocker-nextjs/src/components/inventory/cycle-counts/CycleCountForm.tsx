'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Select, Switch, DatePicker } from 'antd';
import { CalculatorIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';

const { TextArea } = Input;
import { useWarehouses, useWarehouseZones, useCategories } from '@/lib/api/hooks/useInventory';
import type { CycleCountDto } from '@/lib/api/services/inventory.types';

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

const frequencyOptions = [
  { value: 1, label: 'Günlük' },
  { value: 2, label: 'Haftalık' },
  { value: 3, label: 'İki Haftada Bir' },
  { value: 4, label: 'Aylık' },
  { value: 5, label: 'Üç Ayda Bir' },
  { value: 6, label: 'Altı Ayda Bir' },
  { value: 7, label: 'Yıllık' },
];

const abcClassOptions = [
  { value: 1, label: 'A Sınıfı' },
  { value: 2, label: 'B Sınıfı' },
  { value: 3, label: 'C Sınıfı' },
];

export default function CycleCountForm({ form, initialValues, onFinish, loading }: CycleCountFormProps) {
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | undefined>();
  const [onlyNegativeStocks, setOnlyNegativeStocks] = useState(false);
  const [onlyZeroStocks, setOnlyZeroStocks] = useState(false);
  const [blockAutoApprove, setBlockAutoApprove] = useState(false);

  const { data: warehouses = [] } = useWarehouses();
  const { data: zones = [] } = useWarehouseZones(selectedWarehouseId);
  const { data: categories = [] } = useCategories();

  const warehouseOptions = warehouses.map(w => ({
    value: w.id,
    label: `${w.code} - ${w.name}`,
  }));

  const zoneOptions = zones.map(z => ({
    value: z.id,
    label: `${z.code} - ${z.name}`,
  }));

  const categoryOptions = categories.map(c => ({
    value: c.id,
    label: c.name,
  }));

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        scheduledStartDate: initialValues.scheduledStartDate ? dayjs(initialValues.scheduledStartDate) : undefined,
        scheduledEndDate: initialValues.scheduledEndDate ? dayjs(initialValues.scheduledEndDate) : undefined,
      });
      setSelectedWarehouseId(initialValues.warehouseId);
      setOnlyNegativeStocks(initialValues.onlyNegativeStocks ?? false);
      setOnlyZeroStocks(initialValues.onlyZeroStocks ?? false);
      setBlockAutoApprove(initialValues.blockAutoApproveOnToleranceExceeded ?? false);
    } else {
      form.setFieldsValue({
        quantityTolerancePercent: 1,
        onlyNegativeStocks: false,
        onlyZeroStocks: false,
        blockAutoApproveOnToleranceExceeded: false,
      });
    }
  }, [form, initialValues]);

  const handleFinish = (values: any) => {
    const data = {
      ...values,
      scheduledStartDate: values.scheduledStartDate?.toISOString(),
      scheduledEndDate: values.scheduledEndDate?.toISOString(),
    };
    onFinish(data);
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

        {/* ═══════════════════════════════════════════════════════════════
            HEADER: Icon + Title
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <CalculatorIcon className="w-6 h-6 text-slate-500" />
              </div>
            </div>

            {/* Plan Name - Title Style */}
            <div className="flex-1">
              <Form.Item
                name="planName"
                rules={[
                  { required: true, message: 'Plan adı zorunludur' },
                  { max: 100, message: 'Plan adı en fazla 100 karakter olabilir' },
                ]}
                className="mb-0"
              >
                <Input
                  placeholder="Sayım Planı Adı Girin... (örn: Ocak 2024 A Sınıfı Sayım)"
                  variant="borderless"
                  className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
                />
              </Form.Item>
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
                    disabled={!!initialValues}
                    onChange={(value) => {
                      setSelectedWarehouseId(value);
                      form.setFieldValue('zoneId', undefined);
                    }}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Sayım Tipi <span className="text-red-500">*</span></label>
                <Form.Item
                  name="countType"
                  rules={[{ required: true, message: 'Sayım tipi zorunludur' }]}
                  className="mb-0"
                >
                  <Select
                    placeholder="Tip seçin"
                    options={countTypeOptions}
                    disabled={!!initialValues}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Açıklama</label>
                <Form.Item name="description" className="mb-0">
                  <TextArea
                    placeholder="Sayım planı hakkında açıklama..."
                    rows={2}
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white !resize-none"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── ZAMANLAMA ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Zamanlama
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Başlangıç Tarihi <span className="text-red-500">*</span></label>
                <Form.Item
                  name="scheduledStartDate"
                  rules={[{ required: true, message: 'Başlangıç tarihi zorunludur' }]}
                  className="mb-0"
                >
                  <DatePicker
                    format="DD.MM.YYYY"
                    placeholder="Tarih seçin"
                    className="!w-full [&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Bitiş Tarihi <span className="text-red-500">*</span></label>
                <Form.Item
                  name="scheduledEndDate"
                  rules={[{ required: true, message: 'Bitiş tarihi zorunludur' }]}
                  className="mb-0"
                >
                  <DatePicker
                    format="DD.MM.YYYY"
                    placeholder="Tarih seçin"
                    className="!w-full [&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Tekrar Sıklığı</label>
                <Form.Item name="frequency" className="mb-0">
                  <Select
                    placeholder="Sıklık seçin"
                    allowClear
                    options={frequencyOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── FİLTRELEME SEÇENEKLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Filtreleme Seçenekleri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Bölge</label>
                <Form.Item name="zoneId" className="mb-0">
                  <Select
                    placeholder="Bölge seçin"
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    options={zoneOptions}
                    disabled={!selectedWarehouseId}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Kategori</label>
                <Form.Item name="categoryId" className="mb-0">
                  <Select
                    placeholder="Kategori seçin"
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    options={categoryOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">ABC Sınıfı</label>
                <Form.Item name="abcClassFilter" className="mb-0">
                  <Select
                    placeholder="ABC sınıfı seçin"
                    allowClear
                    options={abcClassOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Son Hareketten Bu Yana (Gün)</label>
                <Form.Item name="daysSinceLastMovement" className="mb-0">
                  <InputNumber
                    placeholder="30"
                    min={0}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-lg border border-slate-200 h-full">
                  <span className="text-sm font-medium text-slate-600">Sadece Negatif Stok</span>
                  <Form.Item name="onlyNegativeStocks" valuePropName="checked" noStyle initialValue={false}>
                    <Switch
                      checked={onlyNegativeStocks}
                      onChange={(val) => {
                        setOnlyNegativeStocks(val);
                        form.setFieldValue('onlyNegativeStocks', val);
                      }}
                    />
                  </Form.Item>
                </div>
              </div>
              <div className="col-span-3">
                <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-lg border border-slate-200 h-full">
                  <span className="text-sm font-medium text-slate-600">Sadece Sıfır Stok</span>
                  <Form.Item name="onlyZeroStocks" valuePropName="checked" noStyle initialValue={false}>
                    <Switch
                      checked={onlyZeroStocks}
                      onChange={(val) => {
                        setOnlyZeroStocks(val);
                        form.setFieldValue('onlyZeroStocks', val);
                      }}
                    />
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
                <Form.Item name="quantityTolerancePercent" className="mb-0" initialValue={1}>
                  <InputNumber
                    placeholder="1"
                    min={0}
                    max={100}
                    step={0.1}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Değer Toleransı</label>
                <Form.Item name="valueTolerance" className="mb-0">
                  <InputNumber
                    placeholder="1000"
                    min={0}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-lg border border-slate-200 h-full">
                  <span className="text-sm font-medium text-slate-600">Tolerans Aşımında Onayı Engelle</span>
                  <Form.Item name="blockAutoApproveOnToleranceExceeded" valuePropName="checked" noStyle initialValue={false}>
                    <Switch
                      checked={blockAutoApprove}
                      onChange={(val) => {
                        setBlockAutoApprove(val);
                        form.setFieldValue('blockAutoApproveOnToleranceExceeded', val);
                      }}
                    />
                  </Form.Item>
                </div>
              </div>
            </div>
          </div>

          {/* ─────────────── ATAMA VE NOTLAR ─────────────── */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Atama ve Notlar
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Atanan Kişi</label>
                <Form.Item name="assignedTo" className="mb-0">
                  <Input
                    placeholder="Sayımı yapacak kişi"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Kullanıcı ID</label>
                <Form.Item name="assignedUserId" className="mb-0">
                  <Input
                    placeholder="Kullanıcı ID (opsiyonel)"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Planlama Notları</label>
                <Form.Item name="planningNotes" className="mb-0">
                  <TextArea
                    placeholder="Planlama hakkında notlar..."
                    rows={3}
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white !resize-none"
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
