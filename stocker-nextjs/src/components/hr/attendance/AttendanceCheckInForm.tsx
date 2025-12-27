'use client';

import React, { useEffect } from 'react';
import { Form, Select, TimePicker } from 'antd';
import { ClockIcon } from '@heroicons/react/24/outline';
import { useEmployees } from '@/lib/api/hooks/useHR';
import dayjs from 'dayjs';

interface CheckInFormValues {
  employeeId: number;
  checkInTime?: ReturnType<typeof dayjs>;
}

interface AttendanceCheckInFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: CheckInFormValues;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function AttendanceCheckInForm({ form, initialValues, onFinish, loading }: AttendanceCheckInFormProps) {
  const { data: employees = [] } = useEmployees();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
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

        {/* HEADER */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Clock Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-slate-500" />
              </div>
            </div>

            {/* Title */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900">Manuel Giris Kaydi</h2>
              <p className="text-sm text-slate-500 mt-1">Calisan icin giris kaydi olusturun</p>
            </div>
          </div>
        </div>

        {/* FORM BODY */}
        <div className="px-8 py-6">

          {/* GIRIS BILGILERI */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Giris Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Calisan <span className="text-red-500">*</span></label>
                <Form.Item
                  name="employeeId"
                  rules={[{ required: true, message: 'Calisan secimi gerekli' }]}
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
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Giris Saati</label>
                <Form.Item name="checkInTime" className="mb-0">
                  <TimePicker
                    format="HH:mm"
                    placeholder="Su anki saat"
                    className="!w-full [&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* BILGI NOTU */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Bilgi
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-sm font-medium text-blue-700 mb-1">Bilgi</div>
                  <div className="text-xs text-blue-600">
                    Giris saati bos birakilirsa, su anki saat kullanilacaktir. Manuel giris kaydi olusturulduktan sonra, cikis kaydi icin yoklama detay sayfasini kullanabilirsiniz.
                  </div>
                </div>
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
