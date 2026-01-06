'use client';

import React, { useEffect } from 'react';
import { Form, Input, Select, DatePicker, InputNumber, Switch, Row, Col } from 'antd';
import { UserIcon, WrenchIcon } from '@heroicons/react/24/outline';
import { useEmployees } from '@/lib/api/hooks/useHR';
import type { EmployeeSkillDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

const proficiencyOptions = [
  { value: 'Beginner', label: 'Başlangıç' },
  { value: 'Elementary', label: 'Temel' },
  { value: 'Intermediate', label: 'Orta' },
  { value: 'Advanced', label: 'İleri' },
  { value: 'Expert', label: 'Uzman' },
  { value: 'Master', label: 'Usta' },
];

const categoryOptions = [
  { value: 'Technical', label: 'Teknik' },
  { value: 'Language', label: 'Dil' },
  { value: 'Soft', label: 'Yumuşak Beceri' },
  { value: 'Management', label: 'Yönetim' },
  { value: 'Tools', label: 'Araç/Yazılım' },
  { value: 'Industry', label: 'Sektör' },
  { value: 'Other', label: 'Diğer' },
];

interface EmployeeSkillFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: EmployeeSkillDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function EmployeeSkillForm({ form, initialValues, onFinish, loading }: EmployeeSkillFormProps) {
  const { data: employees = [] } = useEmployees();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        lastUsedDate: initialValues.lastUsedDate ? dayjs(initialValues.lastUsedDate) : undefined,
        certificationDate: initialValues.certificationDate ? dayjs(initialValues.certificationDate) : undefined,
        certificationExpiry: initialValues.certificationExpiryDate ? dayjs(initialValues.certificationExpiryDate) : undefined,
      });
    } else {
      form.setFieldsValue({ proficiencyLevel: 'Intermediate', isCertified: false, isVerified: false });
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
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-300 to-pink-300 flex items-center justify-center">
              <WrenchIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Yetkinlik Bilgileri</h2>
              <p className="text-sm text-slate-500">Çalışan beceri ve yetenekleri</p>
            </div>
          </div>
        </div>

        <div className="px-8 py-6">
          {/* Seviye & Doğrulama */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Seviye & Doğrulama
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Seviye</label>
                <Form.Item name="proficiencyLevel" className="mb-0">
                  <Select
                    options={proficiencyOptions}
                    placeholder="Seviye"
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Sertifikalı</label>
                <Form.Item name="isCertified" valuePropName="checked" className="mb-0">
                  <Switch checkedChildren="Evet" unCheckedChildren="Hayır" />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Doğrulanmış</label>
                <Form.Item name="isVerified" valuePropName="checked" className="mb-0">
                  <Switch checkedChildren="Evet" unCheckedChildren="Hayır" />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Çalışan & Yetkinlik Bilgileri */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100 flex items-center gap-2">
              <UserIcon className="w-4 h-4" /> Çalışan & Yetkinlik Bilgileri
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
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Yetkinlik Adı <span className="text-red-500">*</span></label>
                <Form.Item name="skillName" rules={[{ required: true, message: 'Yetkinlik adı zorunludur' }]} className="mb-0">
                  <Input
                    placeholder="Yetkinlik adı"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Kategori</label>
                <Form.Item name="skillCategory" className="mb-0">
                  <Select
                    options={categoryOptions}
                    placeholder="Kategori"
                    allowClear
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Deneyim (Yıl)</label>
                <Form.Item name="yearsOfExperience" className="mb-0">
                  <InputNumber style={{ width: '100%' }} placeholder="Deneyim (yıl)" min={0} className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white" />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Son Kullanım</label>
                <Form.Item name="lastUsedDate" className="mb-0">
                  <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" placeholder="Son kullanım" className="[&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white" />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Sertifika Bilgileri */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Sertifika Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Sertifika Adı</label>
                <Form.Item name="certificationName" className="mb-0">
                  <Input placeholder="Sertifika adı" className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white" />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Veren Kurum</label>
                <Form.Item name="issuingOrganization" className="mb-0">
                  <Input placeholder="Veren kurum" className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white" />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Sertifika Tarihi</label>
                <Form.Item name="certificationDate" className="mb-0">
                  <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" placeholder="Sertifika tarihi" className="[&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white" />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Geçerlilik Bitiş</label>
                <Form.Item name="certificationExpiry" className="mb-0">
                  <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" placeholder="Geçerlilik bitiş" className="[&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white" />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Sertifika ID</label>
                <Form.Item name="credentialId" className="mb-0">
                  <Input placeholder="Sertifika ID" className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white" />
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
              <TextArea rows={3} placeholder="Ek notlar..." className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white !resize-none" />
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
