'use client';

import React, { useEffect } from 'react';
import { Form, Input, Select, DatePicker } from 'antd';
import { ExclamationCircleIcon, UserIcon } from '@heroicons/react/24/outline';
import { useEmployees } from '@/lib/api/hooks/useHR';
import type { GrievanceDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

const statusOptions = [
  { value: 'Open', label: 'Açık' },
  { value: 'UnderReview', label: 'İncelemede' },
  { value: 'Investigating', label: 'Soruşturmada' },
  { value: 'PendingResolution', label: 'Çözüm Bekliyor' },
  { value: 'Resolved', label: 'Çözüldü' },
  { value: 'Closed', label: 'Kapandı' },
  { value: 'Escalated', label: 'Eskalasyon' },
  { value: 'Withdrawn', label: 'Geri Çekildi' },
];

const priorityOptions = [
  { value: 'Low', label: 'Düşük' },
  { value: 'Medium', label: 'Orta' },
  { value: 'High', label: 'Yüksek' },
  { value: 'Critical', label: 'Kritik' },
];

const grievanceTypeOptions = [
  { value: 'Harassment', label: 'Taciz' },
  { value: 'Discrimination', label: 'Ayrımcılık' },
  { value: 'WorkConditions', label: 'Çalışma Koşulları' },
  { value: 'Management', label: 'Yönetim' },
  { value: 'Compensation', label: 'Ücretlendirme' },
  { value: 'Benefits', label: 'Yan Haklar' },
  { value: 'Policy', label: 'Politika' },
  { value: 'Safety', label: 'İş Güvenliği' },
  { value: 'Other', label: 'Diğer' },
];

interface GrievanceFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: GrievanceDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function GrievanceForm({ form, initialValues, onFinish, loading }: GrievanceFormProps) {
  const { data: employees = [] } = useEmployees();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        filedDate: initialValues.filedDate ? dayjs(initialValues.filedDate) : undefined,
      });
    } else {
      form.setFieldsValue({ status: 'Open', priority: 'Medium' });
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
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
              <ExclamationCircleIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Şikayet Bilgileri</h2>
              <p className="text-sm text-slate-500">Çalışan şikayeti</p>
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
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Durum</label>
                <Form.Item name="status" className="mb-0">
                  <Select options={statusOptions} placeholder="Durum" />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Öncelik</label>
                <Form.Item name="priority" className="mb-0">
                  <Select options={priorityOptions} placeholder="Öncelik" />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Çalışan & Şikayet Bilgileri */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100 flex items-center gap-2">
              <UserIcon className="w-4 h-4" /> Çalışan & Şikayet Bilgileri
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
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Şikayet Türü <span className="text-red-500">*</span></label>
                <Form.Item name="grievanceType" rules={[{ required: true, message: 'Şikayet türü zorunludur' }]} className="mb-0">
                  <Select options={grievanceTypeOptions} placeholder="Şikayet türü" />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Başvuru Tarihi <span className="text-red-500">*</span></label>
                <Form.Item name="filedDate" rules={[{ required: true, message: 'Başvuru tarihi zorunludur' }]} className="mb-0">
                  <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" placeholder="Başvuru tarihi" />
                </Form.Item>
              </div>
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Konu <span className="text-red-500">*</span></label>
                <Form.Item name="subject" rules={[{ required: true, message: 'Konu zorunludur' }]} className="mb-0">
                  <Input placeholder="Konu" />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Açıklama */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Açıklama
            </h3>
            <Form.Item name="description" rules={[{ required: true, message: 'Açıklama zorunludur' }]} className="mb-0">
              <TextArea rows={4} placeholder="Şikayet açıklaması..." />
            </Form.Item>
          </div>

          {/* İnceleme */}
          <div className="mb-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              İnceleme
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">İncelemeye Atanacak Kişi</label>
                <Form.Item name="assignedToId" className="mb-4">
                  <Select
                    showSearch
                    allowClear
                    placeholder="İncelemeye atanacak kişi"
                    optionFilterProp="label"
                    options={employees.map((e: any) => ({ value: e.id, label: `${e.firstName} ${e.lastName}` }))}
                  />
                </Form.Item>
              </div>
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Soruşturma Notları</label>
                <Form.Item name="investigationNotes" className="mb-0">
                  <TextArea rows={3} placeholder="Soruşturma notları..." />
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
