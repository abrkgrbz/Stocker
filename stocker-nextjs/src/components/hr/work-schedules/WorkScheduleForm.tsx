'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, Select, DatePicker, Switch, TimePicker } from 'antd';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import type { FormInstance } from 'antd';
import { useEmployees, useShifts } from '@/lib/api/hooks/useHR';
import type { WorkScheduleDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface WorkScheduleFormProps {
  form: FormInstance;
  initialValues?: WorkScheduleDto;
  onFinish: (values: any) => void;
  loading?: boolean;
  isEdit?: boolean;
}

export function WorkScheduleForm({
  form,
  initialValues,
  onFinish,
  loading,
  isEdit = false,
}: WorkScheduleFormProps) {
  const [isWorkDay, setIsWorkDay] = useState(true);
  const { data: employees = [] } = useEmployees();
  const { data: shifts = [] } = useShifts();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        employeeId: initialValues.employeeId,
        shiftId: initialValues.shiftId,
        date: initialValues.date ? dayjs(initialValues.date) : undefined,
        isWorkDay: initialValues.isWorkDay,
        customStartTime: initialValues.customStartTime ? dayjs(initialValues.customStartTime, 'HH:mm:ss') : undefined,
        customEndTime: initialValues.customEndTime ? dayjs(initialValues.customEndTime, 'HH:mm:ss') : undefined,
        notes: initialValues.notes,
      });
      setIsWorkDay(initialValues.isWorkDay ?? true);
    } else {
      form.setFieldsValue({
        isWorkDay: true,
      });
    }
  }, [initialValues, form]);

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

        {/* HEADER */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <CalendarDaysIcon className="w-6 h-6 text-slate-500" />
              </div>
            </div>

            {/* Title */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900">Calisma Programi</h2>
              <p className="text-sm text-slate-500 mt-1">Calisan icin vardiya ve tarih atayin</p>
            </div>

            {/* Work Day Toggle */}
            <div className="flex-shrink-0">
              <div className="flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-lg">
                <span className="text-sm font-medium text-slate-600">
                  {isWorkDay ? 'Calisma Gunu' : 'Izinli'}
                </span>
                <Form.Item name="isWorkDay" valuePropName="checked" noStyle initialValue={true}>
                  <Switch
                    checked={isWorkDay}
                    onChange={(val) => {
                      setIsWorkDay(val);
                      form.setFieldValue('isWorkDay', val);
                    }}
                  />
                </Form.Item>
              </div>
            </div>
          </div>
        </div>

        {/* FORM BODY */}
        <div className="px-8 py-6">

          {/* PROGRAM BILGILERI */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Program Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Calisan <span className="text-red-500">*</span></label>
                <Form.Item
                  name="employeeId"
                  rules={[{ required: true, message: 'Calisan secimi zorunludur' }]}
                  className="mb-0"
                >
                  <Select
                    placeholder="Calisan secin"
                    showSearch
                    optionFilterProp="label"
                    disabled={isEdit}
                    options={employees.map((e) => ({
                      value: e.id,
                      label: e.fullName,
                    }))}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Vardiya <span className="text-red-500">*</span></label>
                <Form.Item
                  name="shiftId"
                  rules={[{ required: true, message: 'Vardiya secimi zorunludur' }]}
                  className="mb-0"
                >
                  <Select
                    placeholder="Vardiya secin"
                    showSearch
                    optionFilterProp="label"
                    options={shifts.filter(s => s.isActive).map((s) => ({
                      value: s.id,
                      label: s.name,
                    }))}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Tarih <span className="text-red-500">*</span></label>
                <Form.Item
                  name="date"
                  rules={[{ required: true, message: 'Tarih zorunludur' }]}
                  className="mb-0"
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD.MM.YYYY"
                    disabled={isEdit}
                    placeholder="Tarih secin"
                    className="!w-full [&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* OZEL SAATLER */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Ozel Saatler (Opsiyonel)
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Ozel Baslangic Saati</label>
                <Form.Item name="customStartTime" className="mb-0">
                  <TimePicker
                    style={{ width: '100%' }}
                    format="HH:mm"
                    placeholder="Baslangic saati"
                    className="[&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Ozel Bitis Saati</label>
                <Form.Item name="customEndTime" className="mb-0">
                  <TimePicker
                    style={{ width: '100%' }}
                    format="HH:mm"
                    placeholder="Bitis saati"
                    className="[&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">Standart vardiya saatlerinden farkli bir saat belirtmek icin kullanin</p>
          </div>

          {/* NOTLAR */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Notlar
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Aciklama</label>
                <Form.Item name="notes" className="mb-0">
                  <TextArea
                    rows={4}
                    placeholder="Varsa eklemek istediginiz notlar..."
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
