'use client';

import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Select,
  Switch,
  InputNumber,
  DatePicker,
  TimePicker,
} from 'antd';
import {
  ClockIcon,
} from '@heroicons/react/24/outline';
import { useEmployees } from '@/lib/api/hooks/useHR';
import type { OvertimeDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

// Overtime type options
const overtimeTypeOptions = [
  { value: 'Regular', label: 'Normal Mesai' },
  { value: 'Weekend', label: 'Hafta Sonu' },
  { value: 'Holiday', label: 'Tatil Gunu' },
  { value: 'Night', label: 'Gece Mesaisi' },
  { value: 'Emergency', label: 'Acil Durum' },
  { value: 'Project', label: 'Proje Bazli' },
];

// Pay multiplier options
const payMultiplierOptions = [
  { value: 1.0, label: '1.0x (Normal)' },
  { value: 1.5, label: '1.5x (Fazla Mesai)' },
  { value: 2.0, label: '2.0x (Cift)' },
  { value: 2.5, label: '2.5x (Tatil)' },
  { value: 3.0, label: '3.0x (Ozel)' },
];

interface OvertimeFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: OvertimeDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function OvertimeForm({
  form,
  initialValues,
  onFinish,
  loading,
}: OvertimeFormProps) {
  const [isCompensatoryTimeOff, setIsCompensatoryTimeOff] = useState(false);
  const [isPreApproved, setIsPreApproved] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);

  const { data: employees = [] } = useEmployees();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        date: initialValues.date ? dayjs(initialValues.date) : undefined,
        startTime: initialValues.startTime
          ? dayjs(initialValues.startTime, 'HH:mm:ss')
          : undefined,
        endTime: initialValues.endTime
          ? dayjs(initialValues.endTime, 'HH:mm:ss')
          : undefined,
      });
      setIsCompensatoryTimeOff(initialValues.isCompensatoryTimeOff ?? false);
      setIsPreApproved(initialValues.isPreApproved ?? false);
      setIsEmergency(initialValues.isEmergency ?? false);
    } else {
      form.setFieldsValue({
        overtimeType: 'Regular',
        payMultiplier: 1.5,
        breakMinutes: 0,
        isCompensatoryTimeOff: false,
        isPreApproved: false,
        isEmergency: false,
      });
    }
  }, [form, initialValues]);

  const handleFinish = (values: any) => {
    const formattedValues = {
      ...values,
      date: values.date?.format('YYYY-MM-DD'),
      startTime: values.startTime?.format('HH:mm:ss'),
      endTime: values.endTime?.format('HH:mm:ss'),
    };
    onFinish(formattedValues);
  };

  // Calculate planned hours when times change
  const calculateHours = () => {
    const startTime = form.getFieldValue('startTime');
    const endTime = form.getFieldValue('endTime');
    const breakMinutes = form.getFieldValue('breakMinutes') || 0;

    if (startTime && endTime) {
      const start = dayjs(startTime);
      const end = dayjs(endTime);
      let diff = end.diff(start, 'hour', true);
      if (diff < 0) diff += 24; // Handle overnight
      const hours = Math.max(0, diff - breakMinutes / 60);
      form.setFieldValue('plannedHours', Math.round(hours * 100) / 100);
    }
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

        {/* HEADER */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-slate-500" />
              </div>
            </div>

            {/* Title */}
            <div className="flex-1">
              <Form.Item
                name="reason"
                rules={[
                  { required: true, message: 'Sebep zorunludur' },
                  { max: 500, message: 'En fazla 500 karakter' },
                ]}
                className="mb-0"
              >
                <Input
                  placeholder="Fazla Mesai Sebebi Girin..."
                  variant="borderless"
                  className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
                />
              </Form.Item>
              <Form.Item name="description" className="mb-0 mt-1">
                <Input
                  placeholder="Detayli aciklama..."
                  variant="borderless"
                  className="!text-sm !text-slate-500 !p-0 placeholder:!text-slate-400"
                />
              </Form.Item>
            </div>

            {/* Status Toggles */}
            <div className="flex-shrink-0 flex items-center gap-3">
              <div className="flex items-center gap-2 bg-red-50 px-3 py-1.5 rounded-lg">
                <span className="text-xs font-medium text-red-600">Acil</span>
                <Form.Item name="isEmergency" valuePropName="checked" noStyle>
                  <Switch
                    size="small"
                    checked={isEmergency}
                    onChange={(val) => {
                      setIsEmergency(val);
                      form.setFieldValue('isEmergency', val);
                    }}
                  />
                </Form.Item>
              </div>
              <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg">
                <span className="text-xs font-medium text-slate-600">On Onayli</span>
                <Form.Item name="isPreApproved" valuePropName="checked" noStyle>
                  <Switch
                    size="small"
                    checked={isPreApproved}
                    onChange={(val) => {
                      setIsPreApproved(val);
                      form.setFieldValue('isPreApproved', val);
                    }}
                  />
                </Form.Item>
              </div>
            </div>
          </div>
        </div>

        {/* FORM BODY */}
        <div className="px-8 py-6">

          {/* TEMEL BILGILER */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Temel Bilgiler
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Calisan <span className="text-red-500">*</span></label>
                <Form.Item
                  name="employeeId"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-0"
                >
                  <Select
                    placeholder="Calisan secin"
                    showSearch
                    optionFilterProp="label"
                    options={employees.map((e) => ({
                      value: e.id,
                      label: e.fullName,
                    }))}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Mesai Tipi <span className="text-red-500">*</span></label>
                <Form.Item
                  name="overtimeType"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-0"
                >
                  <Select
                    placeholder="Tip secin"
                    options={overtimeTypeOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* TARIH VE SAAT */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Tarih ve Saat
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Tarih <span className="text-red-500">*</span></label>
                <Form.Item
                  name="date"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-0"
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD.MM.YYYY"
                    placeholder="Tarih secin"
                    className="!w-full [&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Baslangic <span className="text-red-500">*</span></label>
                <Form.Item
                  name="startTime"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-0"
                >
                  <TimePicker
                    style={{ width: '100%' }}
                    format="HH:mm"
                    placeholder="Saat secin"
                    onChange={calculateHours}
                    className="!w-full [&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Bitis <span className="text-red-500">*</span></label>
                <Form.Item
                  name="endTime"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-0"
                >
                  <TimePicker
                    style={{ width: '100%' }}
                    format="HH:mm"
                    placeholder="Saat secin"
                    onChange={calculateHours}
                    className="!w-full [&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Mola (dk)</label>
                <Form.Item name="breakMinutes" className="mb-0">
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    placeholder="0"
                    onChange={calculateHours}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Planlanan Saat <span className="text-red-500">*</span></label>
                <Form.Item
                  name="plannedHours"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-0"
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    step={0.5}
                    placeholder="2.5"
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Odeme Carpani</label>
                <Form.Item name="payMultiplier" className="mb-0">
                  <Select
                    options={payMultiplierOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* PROJE / GOREV BILGILERI */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Proje / Gorev Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Gorev ID</label>
                <Form.Item name="taskId" className="mb-0">
                  <Input
                    placeholder="TASK-123"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Maliyet Merkezi</label>
                <Form.Item name="costCenter" className="mb-0">
                  <Input
                    placeholder="CC-001"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Yapilan Isler</label>
                <Form.Item name="workDetails" className="mb-0">
                  <TextArea
                    rows={3}
                    placeholder="Mesai suresince yapilan islerin detaylari..."
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white !resize-none"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* TELAFI IZNI */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Telafi Izni
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-sm font-medium text-slate-700">Telafi Izni Olarak Kullan</span>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {isCompensatoryTimeOff ? 'Odeme yerine izin olarak kullanilacak' : 'Normal odeme yapilacak'}
                    </div>
                  </div>
                  <Form.Item
                    name="isCompensatoryTimeOff"
                    valuePropName="checked"
                    noStyle
                  >
                    <Switch
                      checked={isCompensatoryTimeOff}
                      onChange={(val) => {
                        setIsCompensatoryTimeOff(val);
                        form.setFieldValue('isCompensatoryTimeOff', val);
                      }}
                      checkedChildren="Evet"
                      unCheckedChildren="Hayir"
                    />
                  </Form.Item>
                </div>
              </div>
            </div>
          </div>

          {/* NOTLAR */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Notlar
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <Form.Item name="notes" className="mb-0">
                  <TextArea
                    rows={2}
                    placeholder="Ek notlar..."
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white !resize-none"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ISTATISTIKLER (Duzenleme Modu) */}
          {initialValues && (
            <div className="mb-8">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                Istatistikler
              </h3>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-4">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <div className="text-2xl font-semibold text-slate-800">
                      {initialValues.plannedHours || 0}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Planlanan Saat</div>
                  </div>
                </div>
                <div className="col-span-4">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <div className="text-2xl font-semibold text-slate-800">
                      {initialValues.actualHours || '-'}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Gerceklesen</div>
                  </div>
                </div>
                {initialValues.calculatedAmount && (
                  <div className="col-span-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-center">
                      <div className="text-2xl font-semibold text-green-600">
                        {initialValues.calculatedAmount.toLocaleString('tr-TR')}{' '}
                        {initialValues.currency}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Hesaplanan Tutar
                      </div>
                    </div>
                  </div>
                )}
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
