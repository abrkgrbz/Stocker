'use client';

import React, { useEffect, useState } from 'react';
import { Form, DatePicker } from 'antd';
import { CalculatorIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import { useWarehouses, useWarehouseZones, useCategories } from '@/lib/api/hooks/useInventory';
import type { CycleCountDto, CreateCycleCountDto, UpdateCycleCountDto } from '@/lib/api/services/inventory.types';
import {
  FormSection,
  FormInput,
  FormTextArea,
  FormNumber,
  FormSelect,
  FormSwitch,
  useUnsavedChanges,
  nameFieldRules,
} from '@/components/forms';

interface CycleCountFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: CycleCountDto;
  onFinish: (values: CreateCycleCountDto | UpdateCycleCountDto) => void;
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
    markAsSaved();
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

        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <CalculatorIcon className="w-6 h-6 text-slate-500" />
              </div>
            </div>

            {/* Plan Name */}
            <div className="flex-1">
              <FormInput
                name="planName"
                placeholder="Sayım Planı Adı Girin... (örn: Ocak 2024 A Sınıfı Sayım)"
                rules={nameFieldRules('Plan adı', 100)}
                formItemProps={{ className: 'mb-0' }}
                className="!text-2xl !font-bold !text-slate-900 !p-0 !bg-transparent !border-0 !shadow-none placeholder:!text-slate-400 placeholder:!font-medium focus:!ring-0"
              />
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="px-8 py-6">

          {/* Temel Bilgiler */}
          <FormSection title="Temel Bilgiler">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <FormInput
                  name="planNumber"
                  label="Plan Numarası"
                  required
                  placeholder="CC-2024-001"
                  disabled={!!initialValues}
                />
              </div>
              <div className="col-span-4">
                <FormSelect
                  name="warehouseId"
                  label="Depo"
                  required
                  placeholder="Depo seçin"
                  disabled={!!initialValues}
                  options={warehouseOptions}
                  onChange={(value) => {
                    setSelectedWarehouseId(value);
                    form.setFieldValue('zoneId', undefined);
                  }}
                />
              </div>
              <div className="col-span-4">
                <FormSelect
                  name="countType"
                  label="Sayım Tipi"
                  required
                  placeholder="Tip seçin"
                  disabled={!!initialValues}
                  options={countTypeOptions}
                  showSearch={false}
                />
              </div>
              <div className="col-span-12">
                <FormTextArea
                  name="description"
                  label="Açıklama"
                  placeholder="Sayım planı hakkında açıklama..."
                  rows={2}
                />
              </div>
            </div>
          </FormSection>

          {/* Zamanlama */}
          <FormSection title="Zamanlama">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  Başlangıç Tarihi <span className="text-red-500">*</span>
                </label>
                <Form.Item
                  name="scheduledStartDate"
                  rules={[{ required: true, message: 'Başlangıç tarihi zorunludur' }]}
                  className="mb-0"
                >
                  <DatePicker
                    format="DD.MM.YYYY"
                    placeholder="Tarih seçin"
                    className="!w-full !bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  Bitiş Tarihi <span className="text-red-500">*</span>
                </label>
                <Form.Item
                  name="scheduledEndDate"
                  rules={[{ required: true, message: 'Bitiş tarihi zorunludur' }]}
                  className="mb-0"
                >
                  <DatePicker
                    format="DD.MM.YYYY"
                    placeholder="Tarih seçin"
                    className="!w-full !bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <FormSelect
                  name="frequency"
                  label="Tekrar Sıklığı"
                  placeholder="Sıklık seçin"
                  allowClear
                  options={frequencyOptions}
                  showSearch={false}
                />
              </div>
            </div>
          </FormSection>

          {/* Filtreleme Seçenekleri */}
          <FormSection title="Filtreleme Seçenekleri">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <FormSelect
                  name="zoneId"
                  label="Bölge"
                  placeholder="Bölge seçin"
                  allowClear
                  disabled={!selectedWarehouseId}
                  options={zoneOptions}
                />
              </div>
              <div className="col-span-4">
                <FormSelect
                  name="categoryId"
                  label="Kategori"
                  placeholder="Kategori seçin"
                  allowClear
                  options={categoryOptions}
                />
              </div>
              <div className="col-span-4">
                <FormSelect
                  name="abcClassFilter"
                  label="ABC Sınıfı"
                  placeholder="ABC sınıfı seçin"
                  allowClear
                  options={abcClassOptions}
                  showSearch={false}
                />
              </div>
              <div className="col-span-6">
                <FormNumber
                  name="daysSinceLastMovement"
                  label="Son Hareketten Bu Yana (Gün)"
                  placeholder="30"
                  min={0}
                />
              </div>
              <div className="col-span-3">
                <FormSwitch
                  form={form}
                  name="onlyNegativeStocks"
                  title="Sadece Negatif Stok"
                  value={onlyNegativeStocks}
                  onChange={setOnlyNegativeStocks}
                  disabled={loading}
                />
              </div>
              <div className="col-span-3">
                <FormSwitch
                  form={form}
                  name="onlyZeroStocks"
                  title="Sadece Sıfır Stok"
                  value={onlyZeroStocks}
                  onChange={setOnlyZeroStocks}
                  disabled={loading}
                />
              </div>
            </div>
          </FormSection>

          {/* Tolerans Ayarları */}
          <FormSection title="Tolerans Ayarları">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <FormNumber
                  name="quantityTolerancePercent"
                  label="Miktar Toleransı (%)"
                  placeholder="1"
                  min={0}
                  max={100}
                  step={0.1}
                  formItemProps={{ initialValue: 1 }}
                />
              </div>
              <div className="col-span-4">
                <FormNumber
                  name="valueTolerance"
                  label="Değer Toleransı"
                  placeholder="1000"
                  min={0}
                />
              </div>
              <div className="col-span-4">
                <FormSwitch
                  form={form}
                  name="blockAutoApproveOnToleranceExceeded"
                  title="Tolerans Aşımında Onayı Engelle"
                  value={blockAutoApprove}
                  onChange={setBlockAutoApprove}
                  disabled={loading}
                />
              </div>
            </div>
          </FormSection>

          {/* Atama ve Notlar */}
          <FormSection title="Atama ve Notlar">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <FormInput
                  name="assignedTo"
                  label="Atanan Kişi"
                  placeholder="Sayımı yapacak kişi"
                />
              </div>
              <div className="col-span-6">
                <FormInput
                  name="assignedUserId"
                  label="Kullanıcı ID"
                  placeholder="Kullanıcı ID (opsiyonel)"
                />
              </div>
              <div className="col-span-12">
                <FormTextArea
                  name="planningNotes"
                  label="Planlama Notları"
                  placeholder="Planlama hakkında notlar..."
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
