'use client';

import React, { useEffect } from 'react';
import { Form, Input, Select, DatePicker, InputNumber, Row, Col } from 'antd';
import { ClockIcon, UserIcon } from '@heroicons/react/24/outline';
import { useEmployees } from '@/lib/api/hooks/useHR';
import type { TimeSheetDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

const statusOptions = [
  { value: 'Draft', label: 'Taslak' },
  { value: 'Submitted', label: 'Gönderildi' },
  { value: 'Approved', label: 'Onaylandı' },
  { value: 'Rejected', label: 'Reddedildi' },
  { value: 'Paid', label: 'Ödendi' },
];

interface TimeSheetFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: TimeSheetDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function TimeSheetForm({ form, initialValues, onFinish, loading }: TimeSheetFormProps) {
  const { data: employees = [] } = useEmployees();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        periodStart: initialValues.periodStart ? dayjs(initialValues.periodStart) : undefined,
        periodEnd: initialValues.periodEnd ? dayjs(initialValues.periodEnd) : undefined,
        submittedDate: initialValues.submittedDate ? dayjs(initialValues.submittedDate) : undefined,
      });
    } else {
      form.setFieldsValue({ status: 'Draft' });
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
      <div className="bg-white border border-slate-200 rounded-xl">
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-400 to-purple-400 flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Puantaj Bilgileri</h2>
              <p className="text-sm text-slate-500">Çalışma saati takibi</p>
            </div>
          </div>
        </div>

        <div className="px-8 py-6">
          {/* Çalışan & Dönem */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100 flex items-center gap-2">
              <UserIcon className="w-4 h-4" /> Çalışan & Dönem Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Çalışan <span className="text-red-500">*</span></label>
                <Form.Item name="employeeId" rules={[{ required: true, message: 'Çalışan seçimi gerekli' }]} className="mb-0">
                  <Select
                    showSearch
                    placeholder="Çalışan seçin"
                    optionFilterProp="label"
                    options={employees.map((e: any) => ({ value: e.id, label: `${e.firstName} ${e.lastName}` }))}
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Dönem Başlangıç <span className="text-red-500">*</span></label>
                <Form.Item name="periodStart" rules={[{ required: true, message: 'Başlangıç tarihi gerekli' }]} className="mb-0">
                  <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" placeholder="Dönem başlangıç" />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Dönem Bitiş <span className="text-red-500">*</span></label>
                <Form.Item name="periodEnd" rules={[{ required: true, message: 'Bitiş tarihi gerekli' }]} className="mb-0">
                  <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" placeholder="Dönem bitiş" />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Durum</label>
                <Form.Item name="status" className="mb-0">
                  <Select options={statusOptions} placeholder="Durum" />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Çalışma Saatleri */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100 flex items-center gap-2">
              <ClockIcon className="w-4 h-4" /> Çalışma Saatleri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Normal Saat</label>
                <Form.Item name="totalRegularHours" className="mb-0">
                  <InputNumber style={{ width: '100%' }} placeholder="Normal saat" min={0} />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Fazla Mesai Saat</label>
                <Form.Item name="totalOvertimeHours" className="mb-0">
                  <InputNumber style={{ width: '100%' }} placeholder="Fazla mesai saat" min={0} />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Hafta Sonu Saat</label>
                <Form.Item name="weekendHours" className="mb-0">
                  <InputNumber style={{ width: '100%' }} placeholder="Hafta sonu saat" min={0} />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Tatil Günü Saat</label>
                <Form.Item name="holidayHours" className="mb-0">
                  <InputNumber style={{ width: '100%' }} placeholder="Tatil günü saat" min={0} />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Gece Mesaisi Saat</label>
                <Form.Item name="nightShiftHours" className="mb-0">
                  <InputNumber style={{ width: '100%' }} placeholder="Gece mesaisi saat" min={0} />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Ücretli İzin Saat</label>
                <Form.Item name="paidLeaveHours" className="mb-0">
                  <InputNumber style={{ width: '100%' }} placeholder="Ücretli izin saat" min={0} />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Ücretsiz İzin Saat</label>
                <Form.Item name="unpaidLeaveHours" className="mb-0">
                  <InputNumber style={{ width: '100%' }} placeholder="Ücretsiz izin saat" min={0} />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Hastalık İzni Saat</label>
                <Form.Item name="sickLeaveHours" className="mb-0">
                  <InputNumber style={{ width: '100%' }} placeholder="Hastalık izni saat" min={0} />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Notlar */}
          <div className="mb-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Notlar
            </h3>
            <Form.Item name="notes" className="mb-0">
              <TextArea rows={3} placeholder="Ek notlar..." />
            </Form.Item>
          </div>
        </div>
      </div>

      <Form.Item hidden>
        <button type="submit" />
      </Form.Item>
    </Form>
  );
}
