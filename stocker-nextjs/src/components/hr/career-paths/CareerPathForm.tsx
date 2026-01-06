'use client';

import React, { useEffect } from 'react';
import { Form, Input, Select, DatePicker, InputNumber } from 'antd';
import { CalendarIcon, RocketLaunchIcon, TrophyIcon, UserIcon } from '@heroicons/react/24/outline';
import { useEmployees, usePositions } from '@/lib/api/hooks/useHR';
import type { CareerPathDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

const statusOptions = [
  { value: 'Draft', label: 'Taslak' },
  { value: 'Active', label: 'Aktif' },
  { value: 'OnTrack', label: 'Yolunda' },
  { value: 'AtRisk', label: 'Riskli' },
  { value: 'Completed', label: 'Tamamlandı' },
  { value: 'Cancelled', label: 'İptal' },
  { value: 'OnHold', label: 'Beklemede' },
];

const priorityOptions = [
  { value: 'Low', label: 'Düşük' },
  { value: 'Medium', label: 'Orta' },
  { value: 'High', label: 'Yüksek' },
  { value: 'Critical', label: 'Kritik' },
];

interface CareerPathFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: CareerPathDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function CareerPathForm({ form, initialValues, onFinish, loading }: CareerPathFormProps) {
  const { data: employees = [] } = useEmployees();
  const { data: positions = [] } = usePositions();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        startDate: initialValues.startDate ? dayjs(initialValues.startDate) : undefined,
        targetDate: initialValues.expectedTargetDate ? dayjs(initialValues.expectedTargetDate) : undefined,
      });
    } else {
      form.setFieldsValue({ status: 'Draft', priority: 'Medium', progressPercentage: 0 });
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
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-400 to-red-400 flex items-center justify-center">
              <RocketLaunchIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Kariyer Planı</h2>
              <p className="text-sm text-slate-500">Kariyer gelişim yolculuğunu planlayın</p>
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
                  <Select options={statusOptions} placeholder="Durum" />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Öncelik</label>
                <Form.Item name="priority" className="mb-0">
                  <Select options={priorityOptions} placeholder="Öncelik" />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5 flex items-center gap-1">
                  <TrophyIcon className="w-4 h-4" /> İlerleme
                </label>
                <Form.Item name="progressPercentage" className="mb-0">
                  <InputNumber min={0} max={100} style={{ width: '100%' }} addonAfter="%" />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Çalışan Bilgileri */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100 flex items-center gap-2">
              <UserIcon className="w-4 h-4" /> Çalışan Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Çalışan <span className="text-red-500">*</span></label>
                <Form.Item name="employeeId" rules={[{ required: true, message: 'Çalışan seçimi zorunludur' }]} className="mb-0">
                  <Select
                    showSearch
                    placeholder="Çalışan seçin"
                    optionFilterProp="label"
                    options={employees.map((e: any) => ({ value: e.id, label: `${e.firstName} ${e.lastName}` }))}
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Pozisyon Bilgileri */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Pozisyon Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Mevcut Pozisyon</label>
                <Form.Item name="currentPositionId" className="mb-0">
                  <Select
                    showSearch
                    placeholder="Mevcut pozisyon"
                    optionFilterProp="label"
                    allowClear
                    options={positions.map((p: any) => ({ value: p.id, label: p.title }))}
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Hedef Pozisyon <span className="text-red-500">*</span></label>
                <Form.Item name="targetPositionId" rules={[{ required: true, message: 'Hedef pozisyon zorunludur' }]} className="mb-0">
                  <Select
                    showSearch
                    placeholder="Hedef pozisyon"
                    optionFilterProp="label"
                    options={positions.map((p: any) => ({ value: p.id, label: p.title }))}
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Tarihler */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" /> Tarihler
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Başlangıç Tarihi <span className="text-red-500">*</span></label>
                <Form.Item name="startDate" rules={[{ required: true, message: 'Başlangıç tarihi zorunludur' }]} className="mb-0">
                  <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Hedef Tarih</label>
                <Form.Item name="targetDate" className="mb-0">
                  <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Mentorluk */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Mentorluk
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Mentor</label>
                <Form.Item name="mentorId" className="mb-0">
                  <Select
                    showSearch
                    allowClear
                    placeholder="Mentor seçin"
                    optionFilterProp="label"
                    options={employees.map((e: any) => ({ value: e.id, label: `${e.firstName} ${e.lastName}` }))}
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Gelişim Planı & Notlar */}
          <div className="mb-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Gelişim Planı & Notlar
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Gelişim Planı</label>
                <Form.Item name="developmentPlan" className="mb-4">
                  <TextArea rows={4} placeholder="Gelişim planı detaylarını girin..." />
                </Form.Item>
              </div>
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Notlar</label>
                <Form.Item name="notes" className="mb-0">
                  <TextArea rows={3} placeholder="Ek notlar..." />
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
