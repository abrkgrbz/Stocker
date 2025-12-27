'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, DatePicker, Switch } from 'antd';
import { CalendarIcon } from '@heroicons/react/24/outline';
import type { HolidayDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface HolidayFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: HolidayDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function HolidayForm({ form, initialValues, onFinish, loading }: HolidayFormProps) {
  const [isRecurring, setIsRecurring] = useState(false);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        date: initialValues.date ? dayjs(initialValues.date) : undefined,
      });
      setIsRecurring(initialValues.isRecurring ?? false);
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
            HEADER: Icon + Name + Recurring Toggle
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Holiday Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <CalendarIcon className="w-6 h-6 text-slate-500" />
              </div>
            </div>

            {/* Holiday Name - Title Style */}
            <div className="flex-1">
              <Form.Item
                name="name"
                rules={[
                  { required: true, message: 'Tatil adı zorunludur' },
                  { max: 200, message: 'Tatil adı en fazla 200 karakter olabilir' },
                ]}
                className="mb-0"
              >
                <Input
                  placeholder="Tatil Adı Girin..."
                  variant="borderless"
                  className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
                />
              </Form.Item>
              <Form.Item name="description" className="mb-0 mt-1">
                <Input
                  placeholder="Tatil hakkında kısa açıklama..."
                  variant="borderless"
                  className="!text-sm !text-slate-500 !p-0 placeholder:!text-slate-400"
                />
              </Form.Item>
            </div>

            {/* Recurring Toggle */}
            <div className="flex-shrink-0">
              <div className="flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-lg">
                <span className="text-sm font-medium text-slate-600">
                  {isRecurring ? 'Yıllık' : 'Tek Seferlik'}
                </span>
                <Form.Item name="isRecurring" valuePropName="checked" noStyle initialValue={false}>
                  <Switch
                    checked={isRecurring}
                    onChange={(val) => {
                      setIsRecurring(val);
                      form.setFieldValue('isRecurring', val);
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

          {/* ─────────────── TARİH BİLGİSİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Tarih Bilgisi
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Tatil Tarihi <span className="text-red-500">*</span></label>
                <Form.Item
                  name="date"
                  rules={[{ required: true, message: 'Tatil tarihi zorunludur' }]}
                  className="mb-0"
                >
                  <DatePicker
                    format="DD.MM.YYYY"
                    style={{ width: '100%' }}
                    placeholder="Tarih seçin"
                    className="[&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {isRecurring
                ? 'Yıllık tekrar seçeneği ile her yıl aynı tarihte otomatik oluşturulur'
                : 'Bu tatil sadece seçilen tarihte geçerli olacaktır'}
            </p>
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
