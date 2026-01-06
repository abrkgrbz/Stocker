'use client';

import React, { useEffect } from 'react';
import { Form, Input, Select, DatePicker, InputNumber } from 'antd';
import { StarIcon, UserGroupIcon, UserIcon } from '@heroicons/react/24/outline';
import { useEmployees, useDepartments, usePositions } from '@/lib/api/hooks/useHR';
import type { SuccessionPlanDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

const statusOptions = [
  { value: 'Draft', label: 'Taslak' },
  { value: 'Active', label: 'Aktif' },
  { value: 'UnderReview', label: 'İncelemede' },
  { value: 'Approved', label: 'Onaylandı' },
  { value: 'Implemented', label: 'Uygulandı' },
  { value: 'Archived', label: 'Arşivlendi' },
];

const priorityOptions = [
  { value: 'Critical', label: 'Kritik' },
  { value: 'High', label: 'Yüksek' },
  { value: 'Medium', label: 'Orta' },
  { value: 'Low', label: 'Düşük' },
];

interface SuccessionPlanFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: SuccessionPlanDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function SuccessionPlanForm({ form, initialValues, onFinish, loading }: SuccessionPlanFormProps) {
  const { data: employees = [] } = useEmployees();
  const { data: departments = [] } = useDepartments();
  const { data: positions = [] } = usePositions();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        targetDate: initialValues.targetDate ? dayjs(initialValues.targetDate) : undefined,
        lastReviewDate: initialValues.lastReviewDate ? dayjs(initialValues.lastReviewDate) : undefined,
        nextReviewDate: initialValues.nextReviewDate ? dayjs(initialValues.nextReviewDate) : undefined,
      });
    } else {
      form.setFieldsValue({ status: 'Draft', priority: 'Medium', readinessScore: 0 });
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
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
              <StarIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Yedekleme Planı</h2>
              <p className="text-sm text-slate-500">Kritik pozisyon planlaması</p>
            </div>
          </div>
        </div>

        <div className="px-8 py-6">
          {/* Durum & Öncelik */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Durum & Öncelik
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Durum</label>
                <Form.Item name="status" className="mb-0">
                  <Select options={statusOptions} placeholder="Durum" className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white" />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Öncelik</label>
                <Form.Item name="priority" className="mb-0">
                  <Select options={priorityOptions} placeholder="Öncelik" className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white" />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Hazırlık Skoru (%)</label>
                <Form.Item name="readinessScore" className="mb-0">
                  <InputNumber style={{ width: '100%' }} min={0} max={100} placeholder="Hazırlık skoru" className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white" />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Pozisyon Bilgileri */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100 flex items-center gap-2">
              <UserIcon className="w-4 h-4" /> Pozisyon Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Pozisyon <span className="text-red-500">*</span></label>
                <Form.Item name="positionId" rules={[{ required: true, message: 'Pozisyon seçimi zorunludur' }]} className="mb-0">
                  <Select
                    showSearch
                    placeholder="Pozisyon seçin"
                    optionFilterProp="label"
                    options={positions.map((p: any) => ({ value: p.id, label: p.title }))}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Departman</label>
                <Form.Item name="departmentId" className="mb-0">
                  <Select
                    showSearch
                    placeholder="Departman seçin"
                    optionFilterProp="label"
                    allowClear
                    options={departments.map((d: any) => ({ value: d.id, label: d.name }))}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Mevcut Pozisyon Sahibi</label>
                <Form.Item name="incumbentId" className="mb-0">
                  <Select
                    showSearch
                    placeholder="Mevcut sahip seçin"
                    optionFilterProp="label"
                    allowClear
                    options={employees.map((e: any) => ({ value: e.id, label: `${e.firstName} ${e.lastName}` }))}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Hedef Tarih</label>
                <Form.Item name="targetDate" className="mb-0">
                  <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" placeholder="Hedef tarih" className="[&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white" />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Sonraki İnceleme</label>
                <Form.Item name="nextReviewDate" className="mb-0">
                  <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" placeholder="Sonraki inceleme" className="[&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white" />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Aday Havuzu */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100 flex items-center gap-2">
              <UserGroupIcon className="w-4 h-4" /> Aday Havuzu
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-8">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Birincil Aday</label>
                <Form.Item name="primaryCandidateId" className="mb-0">
                  <Select
                    showSearch
                    placeholder="Birincil aday seçin"
                    optionFilterProp="label"
                    allowClear
                    options={employees.map((e: any) => ({ value: e.id, label: `${e.firstName} ${e.lastName}` }))}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Hazırlık %</label>
                <Form.Item name="primaryCandidateReadiness" className="mb-0">
                  <InputNumber style={{ width: '100%' }} min={0} max={100} placeholder="%" className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white" />
                </Form.Item>
              </div>
              <div className="col-span-8">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">İkincil Aday</label>
                <Form.Item name="secondaryCandidateId" className="mb-0">
                  <Select
                    showSearch
                    placeholder="İkincil aday seçin"
                    optionFilterProp="label"
                    allowClear
                    options={employees.map((e: any) => ({ value: e.id, label: `${e.firstName} ${e.lastName}` }))}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Hazırlık %</label>
                <Form.Item name="secondaryCandidateReadiness" className="mb-0">
                  <InputNumber style={{ width: '100%' }} min={0} max={100} placeholder="%" className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white" />
                </Form.Item>
              </div>
              <div className="col-span-8">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Üçüncül Aday</label>
                <Form.Item name="tertiaryCandidateId" className="mb-0">
                  <Select
                    showSearch
                    placeholder="Üçüncül aday seçin"
                    optionFilterProp="label"
                    allowClear
                    options={employees.map((e: any) => ({ value: e.id, label: `${e.firstName} ${e.lastName}` }))}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Hazırlık %</label>
                <Form.Item name="tertiaryCandidateReadiness" className="mb-0">
                  <InputNumber style={{ width: '100%' }} min={0} max={100} placeholder="%" className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white" />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Yetkinlik & Gelişim */}
          <div className="mb-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Yetkinlik & Gelişim
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Kritik Yetkinlikler</label>
                <Form.Item name="keyCompetencies" className="mb-4">
                  <TextArea rows={3} placeholder="Kritik yetkinlikler..." className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white !resize-none" />
                </Form.Item>
              </div>
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Gelişim İhtiyaçları</label>
                <Form.Item name="developmentNeeds" className="mb-4">
                  <TextArea rows={3} placeholder="Gelişim ihtiyaçları..." className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white !resize-none" />
                </Form.Item>
              </div>
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Notlar</label>
                <Form.Item name="notes" className="mb-0">
                  <TextArea rows={3} placeholder="Ek notlar..." className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white !resize-none" />
                </Form.Item>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Form.Item hidden>
        <button type="submit" />
      </Form.Item>
    </Form>
  );
}
