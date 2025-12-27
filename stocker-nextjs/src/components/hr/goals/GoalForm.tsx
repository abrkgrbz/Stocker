'use client';

import React, { useEffect, useState } from 'react';
import { Form, Select, DatePicker, Input, InputNumber, Switch, Slider } from 'antd';
import { RocketLaunchIcon } from '@heroicons/react/24/outline';
import { useEmployees } from '@/lib/api/hooks/useHR';
import type { PerformanceGoalDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

const GOAL_CATEGORIES = [
  { value: 'Professional', label: 'Profesyonel Gelişim' },
  { value: 'Technical', label: 'Teknik Beceriler' },
  { value: 'Leadership', label: 'Liderlik' },
  { value: 'Communication', label: 'İletişim' },
  { value: 'Project', label: 'Proje' },
  { value: 'Sales', label: 'Satış' },
  { value: 'Customer', label: 'Müşteri İlişkileri' },
  { value: 'Other', label: 'Diğer' },
];

const STATUS_OPTIONS = [
  { value: 'NotStarted', label: 'Başlamadı' },
  { value: 'InProgress', label: 'Devam Ediyor' },
  { value: 'Completed', label: 'Tamamlandı' },
  { value: 'Cancelled', label: 'İptal' },
];

interface GoalFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: PerformanceGoalDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function GoalForm({ form, initialValues, onFinish, loading }: GoalFormProps) {
  const { data: employees = [] } = useEmployees();
  const [status, setStatus] = useState<string>('NotStarted');

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        startDate: initialValues.startDate ? dayjs(initialValues.startDate) : undefined,
        targetDate: initialValues.targetDate ? dayjs(initialValues.targetDate) : undefined,
      });
      setStatus(initialValues.status || 'NotStarted');
    } else {
      form.setFieldsValue({
        weight: 1,
        startDate: dayjs(),
        status: 'NotStarted',
        progressPercentage: 0,
      });
    }
  }, [form, initialValues]);

  const progress = Form.useWatch('progressPercentage', form) || 0;

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
            HEADER: Icon + Title + Status Selector
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Goal Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <RocketLaunchIcon className="w-6 h-6 text-slate-500" />
              </div>
            </div>

            {/* Goal Title - Title Style */}
            <div className="flex-1">
              <Form.Item
                name="title"
                rules={[
                  { required: true, message: 'Hedef başlığı zorunludur' },
                  { max: 200, message: 'Başlık en fazla 200 karakter olabilir' },
                ]}
                className="mb-0"
              >
                <Input
                  placeholder="Hedef Başlığı Girin..."
                  variant="borderless"
                  className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
                />
              </Form.Item>
              <Form.Item name="description" className="mb-0 mt-1">
                <Input
                  placeholder="Hedef hakkında kısa açıklama..."
                  variant="borderless"
                  className="!text-sm !text-slate-500 !p-0 placeholder:!text-slate-400"
                />
              </Form.Item>
            </div>

            {/* Status Selector */}
            <div className="flex-shrink-0">
              <Form.Item name="status" className="mb-0" initialValue="NotStarted">
                <Select
                  options={STATUS_OPTIONS}
                  value={status}
                  onChange={(val) => {
                    setStatus(val);
                    form.setFieldValue('status', val);
                  }}
                  className="w-36 [&_.ant-select-selector]:!bg-slate-100 [&_.ant-select-selector]:!border-0 [&_.ant-select-selector]:!rounded-lg"
                />
              </Form.Item>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            FORM BODY: High-Density Grid Layout
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6">

          {/* ─────────────── HEDEF BİLGİLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Hedef Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Çalışan <span className="text-red-500">*</span></label>
                <Form.Item
                  name="employeeId"
                  rules={[{ required: true, message: 'Çalışan seçimi zorunludur' }]}
                  className="mb-0"
                >
                  <Select
                    placeholder="Çalışan seçin"
                    showSearch
                    optionFilterProp="label"
                    disabled={!!initialValues}
                    options={employees.map((e) => ({
                      value: e.id,
                      label: e.fullName,
                    }))}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Kategori</label>
                <Form.Item name="category" className="mb-0">
                  <Select
                    placeholder="Kategori seçin"
                    allowClear
                    options={GOAL_CATEGORIES}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── TARİHLER VE AĞIRLIK ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Tarihler ve Ağırlık
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Başlangıç Tarihi <span className="text-red-500">*</span></label>
                <Form.Item
                  name="startDate"
                  rules={[{ required: true, message: 'Başlangıç tarihi zorunludur' }]}
                  className="mb-0"
                >
                  <DatePicker
                    format="DD.MM.YYYY"
                    style={{ width: '100%' }}
                    placeholder="Başlangıç"
                    className="[&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Hedef Tarihi <span className="text-red-500">*</span></label>
                <Form.Item
                  name="targetDate"
                  rules={[{ required: true, message: 'Hedef tarihi zorunludur' }]}
                  className="mb-0"
                >
                  <DatePicker
                    format="DD.MM.YYYY"
                    style={{ width: '100%' }}
                    placeholder="Hedef tarih"
                    className="[&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Ağırlık (1-10)</label>
                <Form.Item name="weight" className="mb-0" initialValue={1}>
                  <InputNumber
                    min={1}
                    max={10}
                    style={{ width: '100%' }}
                    className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── ÖLÇÜM KRİTERLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Ölçüm Kriterleri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Ölçüm Kriteri</label>
                <Form.Item name="metrics" className="mb-0">
                  <Input
                    placeholder="Örn: Satış Adedi"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Hedef Değer</label>
                <Form.Item name="targetValue" className="mb-0">
                  <Input
                    placeholder="Örn: 100 adet"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Mevcut Değer</label>
                <Form.Item name="currentValue" className="mb-0">
                  <Input
                    placeholder="Örn: 50 adet"
                    disabled={!initialValues}
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── İLERLEME (Düzenleme Modu) ─────────────── */}
          {initialValues && (
            <div className="mb-8">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                İlerleme Durumu
              </h3>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-8">
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">İlerleme (%{progress})</label>
                  <Form.Item name="progressPercentage" className="mb-0" initialValue={0}>
                    <Slider
                      min={0}
                      max={100}
                      marks={{ 0: '0%', 25: '25%', 50: '50%', 75: '75%', 100: '100%' }}
                    />
                  </Form.Item>
                </div>
                <div className="col-span-4">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center h-full flex flex-col justify-center">
                    <div className="text-3xl font-semibold text-slate-800">
                      %{progress}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Tamamlandı</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────── DETAYLI AÇIKLAMA ─────────────── */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Detaylı Açıklama
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <Form.Item name="detailedDescription" className="mb-0">
                  <TextArea
                    rows={3}
                    placeholder="Hedef hakkında detaylı açıklama..."
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
