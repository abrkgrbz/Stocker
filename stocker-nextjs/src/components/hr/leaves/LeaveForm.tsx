'use client';

import React, { useEffect } from 'react';
import { Form, Select, DatePicker, Input } from 'antd';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { useEmployees, useLeaveTypes } from '@/lib/api/hooks/useHR';
import type { LeaveDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { RangePicker } = DatePicker;

interface LeaveFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: LeaveDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function LeaveForm({ form, initialValues, onFinish, loading }: LeaveFormProps) {
  const { data: employees = [] } = useEmployees();
  const { data: leaveTypes = [] } = useLeaveTypes();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        dateRange: initialValues.startDate && initialValues.endDate
          ? [dayjs(initialValues.startDate), dayjs(initialValues.endDate)]
          : undefined,
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
            {/* Leave Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <CalendarIcon className="w-6 h-6 text-slate-500" />
              </div>
            </div>

            {/* Title */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900">
                {initialValues ? 'İzin Düzenle' : 'Yeni İzin Talebi'}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Çalışan için izin kaydı oluşturun
              </p>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            FORM BODY: High-Density Grid Layout
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6">

          {/* ─────────────── İZİN BİLGİLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              İzin Bilgileri
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
                <label className="block text-sm font-medium text-slate-600 mb-1.5">İzin Türü <span className="text-red-500">*</span></label>
                <Form.Item
                  name="leaveTypeId"
                  rules={[{ required: true, message: 'İzin türü seçimi zorunludur' }]}
                  className="mb-0"
                >
                  <Select
                    placeholder="İzin türü seçin"
                    options={leaveTypes.map((lt) => ({
                      value: lt.id,
                      label: lt.name,
                    }))}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── TARİH ARALIĞI ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Tarih Aralığı
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">İzin Tarihleri <span className="text-red-500">*</span></label>
                <Form.Item
                  name="dateRange"
                  rules={[{ required: true, message: 'İzin tarihleri zorunludur' }]}
                  className="mb-0"
                >
                  <RangePicker
                    format="DD.MM.YYYY"
                    style={{ width: '100%' }}
                    placeholder={['Başlangıç', 'Bitiş']}
                    className="[&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── İZİN NEDENİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              İzin Nedeni
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <Form.Item
                  name="reason"
                  rules={[{ required: true, message: 'İzin nedeni zorunludur' }]}
                  className="mb-0"
                >
                  <TextArea
                    rows={4}
                    placeholder="İzin talebinizin nedenini açıklayın..."
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white !resize-none"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Bilgi Kutusu */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm font-medium text-blue-700 mb-1">Bilgi</div>
            <div className="text-xs text-blue-600">
              İzin talebi oluşturulduktan sonra onay sürecine alınacaktır.
            </div>
          </div>

          {/* ─────────────── İSTATİSTİKLER (Düzenleme Modu) ─────────────── */}
          {initialValues && (
            <div className="mt-8">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                İstatistikler
              </h3>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <div className="text-2xl font-semibold text-slate-800">
                      {initialValues.totalDays || 0}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Toplam Gün</div>
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
