'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, TimePicker, InputNumber, Switch } from 'antd';
import { ClockIcon } from '@heroicons/react/24/outline';
import type { ShiftDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface ShiftFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: ShiftDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function ShiftForm({ form, initialValues, onFinish, loading }: ShiftFormProps) {
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        startTime: initialValues.startTime ? dayjs(initialValues.startTime, 'HH:mm:ss') : undefined,
        endTime: initialValues.endTime ? dayjs(initialValues.endTime, 'HH:mm:ss') : undefined,
      });
      setIsActive(initialValues.isActive ?? true);
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
            HEADER: Icon + Name + Status Toggle
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Shift Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-slate-500" />
              </div>
            </div>

            {/* Shift Name - Title Style */}
            <div className="flex-1">
              <Form.Item
                name="name"
                rules={[
                  { required: true, message: 'Vardiya adı zorunludur' },
                  { max: 200, message: 'Vardiya adı en fazla 200 karakter olabilir' },
                ]}
                className="mb-0"
              >
                <Input
                  placeholder="Vardiya Adı Girin..."
                  variant="borderless"
                  className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
                />
              </Form.Item>
              <Form.Item name="description" className="mb-0 mt-1">
                <Input
                  placeholder="Vardiya hakkında kısa açıklama..."
                  variant="borderless"
                  className="!text-sm !text-slate-500 !p-0 placeholder:!text-slate-400"
                />
              </Form.Item>
            </div>

            {/* Status Toggle */}
            <div className="flex-shrink-0">
              <div className="flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-lg">
                <span className="text-sm font-medium text-slate-600">
                  {isActive ? 'Aktif' : 'Pasif'}
                </span>
                <Form.Item name="isActive" valuePropName="checked" noStyle initialValue={true}>
                  <Switch
                    checked={isActive}
                    onChange={(val) => {
                      setIsActive(val);
                      form.setFieldValue('isActive', val);
                    }}
                  />
                </Form.Item>
              </div>
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
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Vardiya Kodu <span className="text-red-500">*</span></label>
                <Form.Item
                  name="code"
                  rules={[{ required: true, message: 'Vardiya kodu zorunludur' }]}
                  className="mb-0"
                >
                  <Input
                    placeholder="Örn: SABAH, AKSAM, GECE"
                    disabled={!!initialValues}
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── ZAMAN AYARLARI ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Zaman Ayarları
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Başlangıç Saati <span className="text-red-500">*</span></label>
                <Form.Item
                  name="startTime"
                  rules={[{ required: true, message: 'Başlangıç saati zorunludur' }]}
                  className="mb-0"
                >
                  <TimePicker
                    format="HH:mm"
                    style={{ width: '100%' }}
                    placeholder="Saat"
                    className="[&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Bitiş Saati <span className="text-red-500">*</span></label>
                <Form.Item
                  name="endTime"
                  rules={[{ required: true, message: 'Bitiş saati zorunludur' }]}
                  className="mb-0"
                >
                  <TimePicker
                    format="HH:mm"
                    style={{ width: '100%' }}
                    placeholder="Saat"
                    className="[&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Mola Süresi (dk)</label>
                <Form.Item name="breakDurationMinutes" className="mb-0">
                  <InputNumber
                    placeholder="0"
                    style={{ width: '100%' }}
                    min={0}
                    max={180}
                    className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">Çalışma saatleri ve mola süresi</p>
          </div>

          {/* ─────────────── İSTATİSTİKLER (Düzenleme Modu) ─────────────── */}
          {initialValues && (
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                İstatistikler
              </h3>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <div className="text-2xl font-semibold text-slate-800">
                      {initialValues.employeeCount || 0}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Bu Vardiyada Çalışan</div>
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
