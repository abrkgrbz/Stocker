'use client';

import React, { useEffect } from 'react';
import { Form, Input, Select, DatePicker, InputNumber } from 'antd';
import { UserGroupIcon, UserIcon } from '@heroicons/react/24/outline';
import { useEmployees, useJobApplications } from '@/lib/api/hooks/useHR';
import type { InterviewDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

const statusOptions = [
  { value: 'Scheduled', label: 'Planlandı' },
  { value: 'Confirmed', label: 'Onaylandı' },
  { value: 'InProgress', label: 'Devam Ediyor' },
  { value: 'Completed', label: 'Tamamlandı' },
  { value: 'Cancelled', label: 'İptal' },
  { value: 'NoShow', label: 'Gelmedi' },
  { value: 'Rescheduled', label: 'Yeniden Planlandı' },
];

const interviewTypeOptions = [
  { value: 'Phone', label: 'Telefon' },
  { value: 'Video', label: 'Video' },
  { value: 'InPerson', label: 'Yüz Yüze' },
  { value: 'Technical', label: 'Teknik' },
  { value: 'HR', label: 'İK' },
  { value: 'Panel', label: 'Panel' },
  { value: 'Final', label: 'Final' },
];

interface InterviewFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: InterviewDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function InterviewForm({ form, initialValues, onFinish, loading }: InterviewFormProps) {
  const { data: employees = [] } = useEmployees();
  const { data: applications = [] } = useJobApplications();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        scheduledDate: initialValues.scheduledDateTime ? dayjs(initialValues.scheduledDateTime) : undefined,
      });
    } else {
      form.setFieldsValue({ status: 'Scheduled', duration: 60 });
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
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-400 flex items-center justify-center">
              <UserGroupIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Mülakat Bilgileri</h2>
              <p className="text-sm text-slate-500">İş görüşmesi</p>
            </div>
          </div>
        </div>

        <div className="px-8 py-6">
          {/* Durum & Tür */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Durum & Tür
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Durum</label>
                <Form.Item name="status" className="mb-0">
                  <Select options={statusOptions} placeholder="Durum" className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white" />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Mülakat Türü <span className="text-red-500">*</span></label>
                <Form.Item name="interviewType" rules={[{ required: true, message: 'Mülakat türü zorunludur' }]} className="mb-0">
                  <Select options={interviewTypeOptions} placeholder="Mülakat türü" className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white" />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Başvuru & Görüşmeci */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100 flex items-center gap-2">
              <UserIcon className="w-4 h-4" /> Başvuru & Görüşmeci
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Başvuru <span className="text-red-500">*</span></label>
                <Form.Item name="applicationId" rules={[{ required: true, message: 'Başvuru seçimi zorunludur' }]} className="mb-0">
                  <Select
                    showSearch
                    placeholder="Başvuru seçin"
                    optionFilterProp="label"
                    options={applications.map((a: any) => ({ value: a.id, label: `${a.candidateName} - ${a.positionTitle}` }))}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Görüşmeci <span className="text-red-500">*</span></label>
                <Form.Item name="interviewerId" rules={[{ required: true, message: 'Görüşmeci seçimi zorunludur' }]} className="mb-0">
                  <Select
                    showSearch
                    placeholder="Görüşmeci seçin"
                    optionFilterProp="label"
                    options={employees.map((e: any) => ({ value: e.id, label: `${e.firstName} ${e.lastName}` }))}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Planlama */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Planlama
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Tarih ve Saat <span className="text-red-500">*</span></label>
                <Form.Item name="scheduledDate" rules={[{ required: true, message: 'Tarih ve saat zorunludur' }]} className="mb-0">
                  <DatePicker showTime style={{ width: '100%' }} format="DD.MM.YYYY HH:mm" placeholder="Tarih ve saat" className="[&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white" />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Süre (dakika)</label>
                <Form.Item name="duration" className="mb-0">
                  <InputNumber style={{ width: '100%' }} placeholder="Süre" min={15} addonAfter="dk" className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white" />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Konum</label>
                <Form.Item name="location" className="mb-0">
                  <Input placeholder="Konum" className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white" />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Video Link</label>
                <Form.Item name="videoLink" className="mb-0">
                  <Input placeholder="Video link (Zoom, Teams vb.)" className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white" />
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
              <TextArea rows={3} placeholder="Mülakat notları..." className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white !resize-none" />
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
