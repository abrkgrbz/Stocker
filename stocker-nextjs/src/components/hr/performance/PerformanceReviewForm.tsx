'use client';

import React, { useEffect } from 'react';
import { Form, Select, DatePicker, Input, Rate } from 'antd';
import { TrophyIcon } from '@heroicons/react/24/outline';
import { useEmployees } from '@/lib/api/hooks/useHR';
import type { PerformanceReviewDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface PerformanceReviewFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: PerformanceReviewDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function PerformanceReviewForm({ form, initialValues, onFinish, loading }: PerformanceReviewFormProps) {
  const { data: employees = [] } = useEmployees();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        reviewDate: initialValues.reviewDate ? dayjs(initialValues.reviewDate) : undefined,
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

        {/* HEADER */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <TrophyIcon className="w-6 h-6 text-slate-500" />
              </div>
            </div>

            {/* Period Title */}
            <div className="flex-1">
              <Form.Item
                name="reviewPeriod"
                rules={[{ required: true, message: 'Degerlendirme donemi zorunludur' }]}
                className="mb-0"
              >
                <Input
                  placeholder="Degerlendirme Donemi (Orn: 2024 Q1, Yillik 2024)..."
                  variant="borderless"
                  className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
                />
              </Form.Item>
              <p className="text-sm text-slate-500 mt-1">Performans Degerlendirmesi</p>
            </div>

            {/* Score Display for Edit Mode */}
            {initialValues && (
              <div className="flex-shrink-0">
                <div className="bg-purple-50 px-4 py-2 rounded-lg border border-purple-200 text-center">
                  <div className="text-2xl font-semibold text-purple-700">
                    {initialValues.overallScore || 0}/10
                  </div>
                  <div className="text-xs text-purple-500">Genel Puan</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FORM BODY */}
        <div className="px-8 py-6">

          {/* DEGERLENDIRME BILGILERI */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Degerlendirme Bilgileri
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
                    disabled={!!initialValues}
                    options={employees.map((e) => ({
                      value: e.id,
                      label: e.fullName,
                    }))}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Degerlendiren <span className="text-red-500">*</span></label>
                <Form.Item
                  name="reviewerId"
                  rules={[{ required: true, message: 'Degerlendiren secimi zorunludur' }]}
                  className="mb-0"
                >
                  <Select
                    placeholder="Degerlendiren secin"
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
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Tarih <span className="text-red-500">*</span></label>
                <Form.Item
                  name="reviewDate"
                  rules={[{ required: true, message: 'Tarih zorunludur' }]}
                  className="mb-0"
                >
                  <DatePicker
                    format="DD.MM.YYYY"
                    style={{ width: '100%' }}
                    placeholder="Tarih secin"
                    className="!w-full [&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* PUAN */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Genel Puan
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Puan (1-10) <span className="text-red-500">*</span></label>
                <Form.Item
                  name="overallScore"
                  rules={[{ required: true, message: 'Puan zorunludur' }]}
                  className="mb-0"
                >
                  <Rate count={10} allowHalf style={{ fontSize: 24 }} />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* GERI BILDIRIM */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Geri Bildirim
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Guclu Yonler</label>
                <Form.Item name="strengths" className="mb-4">
                  <TextArea
                    rows={3}
                    placeholder="Calisanin guclu yonleri..."
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white !resize-none"
                  />
                </Form.Item>
              </div>
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Gelisim Alanlari</label>
                <Form.Item name="areasForImprovement" className="mb-0">
                  <TextArea
                    rows={3}
                    placeholder="Gelistirilmesi gereken alanlar..."
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white !resize-none"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* GELISIM PLANI VE YORUMLAR */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Gelisim Plani ve Yorumlar
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Gelisim Plani</label>
                <Form.Item name="developmentPlan" className="mb-4">
                  <TextArea
                    rows={3}
                    placeholder="Gelisim plani..."
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white !resize-none"
                  />
                </Form.Item>
              </div>
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Yonetici Yorumlari</label>
                <Form.Item name="managerComments" className="mb-0">
                  <TextArea
                    rows={3}
                    placeholder="Yonetici yorumlari..."
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
