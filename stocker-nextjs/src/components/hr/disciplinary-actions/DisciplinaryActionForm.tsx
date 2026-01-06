'use client';

import React, { useEffect } from 'react';
import { Form, Input, Select, DatePicker } from 'antd';
import { CalendarIcon, ExclamationTriangleIcon, UserIcon } from '@heroicons/react/24/outline';
import { useEmployees } from '@/lib/api/hooks/useHR';
import type { DisciplinaryActionDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

const statusOptions = [
  { value: 'Draft', label: 'Taslak' },
  { value: 'UnderInvestigation', label: 'Soruşturmada' },
  { value: 'PendingReview', label: 'İncelemede' },
  { value: 'Approved', label: 'Onaylandı' },
  { value: 'Implemented', label: 'Uygulandı' },
  { value: 'Appealed', label: 'İtiraz Edildi' },
  { value: 'Overturned', label: 'İptal Edildi' },
  { value: 'Closed', label: 'Kapandı' },
];

const severityOptions = [
  { value: 'Minor', label: 'Hafif' },
  { value: 'Moderate', label: 'Orta' },
  { value: 'Major', label: 'Ağır' },
  { value: 'Critical', label: 'Kritik' },
];

const actionTypeOptions = [
  { value: 'VerbalWarning', label: 'Sözlü Uyarı' },
  { value: 'WrittenWarning', label: 'Yazılı Uyarı' },
  { value: 'FinalWarning', label: 'Son Uyarı' },
  { value: 'Suspension', label: 'Uzaklaştırma' },
  { value: 'Demotion', label: 'Kademe İndirme' },
  { value: 'Termination', label: 'İş Akdi Feshi' },
  { value: 'ProbationExtension', label: 'Deneme Süresi Uzatma' },
  { value: 'TrainingRequired', label: 'Eğitim Zorunluluğu' },
  { value: 'PerformanceImprovement', label: 'Performans İyileştirme' },
];

const violationTypeOptions = [
  { value: 'Attendance', label: 'Devamsızlık' },
  { value: 'Performance', label: 'Performans' },
  { value: 'Conduct', label: 'Davranış' },
  { value: 'Policy', label: 'Politika İhlali' },
  { value: 'Safety', label: 'İş Güvenliği' },
  { value: 'Harassment', label: 'Taciz' },
  { value: 'Theft', label: 'Hırsızlık' },
  { value: 'Fraud', label: 'Dolandırıcılık' },
  { value: 'Insubordination', label: 'İtaatsizlik' },
  { value: 'Other', label: 'Diğer' },
];

interface DisciplinaryActionFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: DisciplinaryActionDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function DisciplinaryActionForm({ form, initialValues, onFinish, loading }: DisciplinaryActionFormProps) {
  const { data: employees = [] } = useEmployees();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        incidentDate: initialValues.incidentDate ? dayjs(initialValues.incidentDate) : undefined,
        effectiveDate: initialValues.sanctionStartDate ? dayjs(initialValues.sanctionStartDate) : undefined,
        expiryDate: initialValues.sanctionEndDate ? dayjs(initialValues.sanctionEndDate) : undefined,
        investigationStartDate: initialValues.investigationStartDate ? dayjs(initialValues.investigationStartDate) : undefined,
        investigationEndDate: initialValues.investigationEndDate ? dayjs(initialValues.investigationEndDate) : undefined,
      });
    } else {
      form.setFieldsValue({ status: 'Draft', severity: 'Minor' });
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
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-400 to-orange-400 flex items-center justify-center">
              <ExclamationTriangleIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Disiplin İşlemi</h2>
              <p className="text-sm text-slate-500">Çalışan disiplin kaydı</p>
            </div>
          </div>
        </div>

        <div className="px-8 py-6">
          {/* Durum & Şiddet */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Durum & Şiddet
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Durum</label>
                <Form.Item name="status" className="mb-0">
                  <Select options={statusOptions} placeholder="Durum" className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white" />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Şiddet</label>
                <Form.Item name="severity" className="mb-0">
                  <Select options={severityOptions} placeholder="Şiddet" className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white" />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Çalışan & İşlem Bilgileri */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100 flex items-center gap-2">
              <UserIcon className="w-4 h-4" /> Çalışan & İşlem Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Çalışan <span className="text-red-500">*</span></label>
                <Form.Item name="employeeId" rules={[{ required: true, message: 'Çalışan seçimi zorunludur' }]} className="mb-0">
                  <Select
                    showSearch
                    placeholder="Çalışan seçin"
                    optionFilterProp="label"
                    options={employees.map((e: any) => ({ value: e.id, label: `${e.firstName} ${e.lastName}` }))}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">İşlem Türü <span className="text-red-500">*</span></label>
                <Form.Item name="actionType" rules={[{ required: true, message: 'İşlem türü zorunludur' }]} className="mb-0">
                  <Select options={actionTypeOptions} placeholder="İşlem türü" className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white" />
                </Form.Item>
              </div>
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">İhlal Türü</label>
                <Form.Item name="violationType" className="mb-0">
                  <Select options={violationTypeOptions} placeholder="İhlal türü" allowClear className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white" />
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
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Olay Tarihi <span className="text-red-500">*</span></label>
                <Form.Item name="incidentDate" rules={[{ required: true, message: 'Olay tarihi zorunludur' }]} className="mb-0">
                  <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" className="[&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white" />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Yürürlük Tarihi</label>
                <Form.Item name="effectiveDate" className="mb-0">
                  <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" className="[&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white" />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Bitiş Tarihi</label>
                <Form.Item name="expiryDate" className="mb-0">
                  <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" className="[&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white" />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Açıklamalar */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Açıklamalar
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Genel Açıklama</label>
                <Form.Item name="description" className="mb-4">
                  <TextArea rows={3} placeholder="Genel açıklama..." className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white !resize-none" />
                </Form.Item>
              </div>
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Olay Açıklaması</label>
                <Form.Item name="incidentDescription" className="mb-0">
                  <TextArea rows={3} placeholder="Olay açıklaması..." className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white !resize-none" />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Soruşturma */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Soruşturma
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Soruşturmacı</label>
                <Form.Item name="investigatorId" className="mb-4">
                  <Select
                    showSearch
                    allowClear
                    placeholder="Soruşturmacı seçin"
                    optionFilterProp="label"
                    options={employees.map((e: any) => ({ value: e.id, label: `${e.firstName} ${e.lastName}` }))}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Soruşturma Bulguları</label>
                <Form.Item name="investigationFindings" className="mb-0">
                  <TextArea rows={3} placeholder="Soruşturma bulguları..." className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white !resize-none" />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Çalışan Savunması & Düzeltici Eylemler */}
          <div className="mb-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Çalışan Savunması & Düzeltici Eylemler
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Çalışan Savunması</label>
                <Form.Item name="employeeResponse" className="mb-4">
                  <TextArea rows={3} placeholder="Çalışan savunması..." className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white !resize-none" />
                </Form.Item>
              </div>
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Düzeltici Eylemler</label>
                <Form.Item name="correctiveActions" className="mb-4">
                  <TextArea rows={3} placeholder="Düzeltici eylemler..." className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white !resize-none" />
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
