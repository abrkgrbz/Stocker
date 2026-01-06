'use client';

import React, { useEffect } from 'react';
import { Form, Input, Select, DatePicker, InputNumber, Switch, Row, Col } from 'antd';
import { ComputerDesktopIcon, DocumentTextIcon, RocketLaunchIcon, UserIcon } from '@heroicons/react/24/outline';
import { useEmployees } from '@/lib/api/hooks/useHR';
import type { OnboardingDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

const statusOptions = [
  { value: 'NotStarted', label: 'Başlamadı' },
  { value: 'InProgress', label: 'Devam Ediyor' },
  { value: 'Completed', label: 'Tamamlandı' },
  { value: 'OnHold', label: 'Beklemede' },
  { value: 'Cancelled', label: 'İptal' },
];

interface OnboardingFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: OnboardingDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function OnboardingForm({ form, initialValues, onFinish, loading }: OnboardingFormProps) {
  const { data: employees = [] } = useEmployees();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        startDate: initialValues.startDate ? dayjs(initialValues.startDate) : undefined,
        expectedEndDate: initialValues.plannedEndDate ? dayjs(initialValues.plannedEndDate) : undefined,
        firstDaySchedule: initialValues.firstDayOfWork ? dayjs(initialValues.firstDayOfWork) : undefined,
      });
    } else {
      form.setFieldsValue({ status: 'NotStarted', completionPercentage: 0 });
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
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
              <RocketLaunchIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">İşe Alışım</h2>
              <p className="text-sm text-slate-500">Yeni çalışan oryantasyonu</p>
            </div>
          </div>
        </div>

        <div className="px-8 py-6">
          {/* Durum & İlerleme */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Durum & İlerleme
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Durum</label>
                <Form.Item name="status" className="mb-0">
                  <Select options={statusOptions} placeholder="Durum" />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Tamamlanma %</label>
                <Form.Item name="completionPercentage" className="mb-0">
                  <InputNumber style={{ width: '100%' }} min={0} max={100} placeholder="Tamamlanma %" />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Çalışan & Mentor Bilgileri */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100 flex items-center gap-2">
              <UserIcon className="w-4 h-4" /> Çalışan & Mentor Bilgileri
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
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Mentor</label>
                <Form.Item name="mentorId" className="mb-0">
                  <Select
                    showSearch
                    placeholder="Mentor seçin"
                    optionFilterProp="label"
                    allowClear
                    options={employees.map((e: any) => ({ value: e.id, label: `${e.firstName} ${e.lastName}` }))}
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Buddy</label>
                <Form.Item name="buddyId" className="mb-0">
                  <Select
                    showSearch
                    placeholder="Buddy seçin"
                    optionFilterProp="label"
                    allowClear
                    options={employees.map((e: any) => ({ value: e.id, label: `${e.firstName} ${e.lastName}` }))}
                  />
                </Form.Item>
              </div>
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">HR Sorumlusu</label>
                <Form.Item name="hrRepresentativeId" className="mb-0">
                  <Select
                    showSearch
                    placeholder="HR Sorumlusu seçin"
                    optionFilterProp="label"
                    allowClear
                    options={employees.map((e: any) => ({ value: e.id, label: `${e.firstName} ${e.lastName}` }))}
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Başlangıç Tarihi <span className="text-red-500">*</span></label>
                <Form.Item name="startDate" rules={[{ required: true, message: 'Başlangıç tarihi zorunludur' }]} className="mb-0">
                  <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" placeholder="Başlangıç tarihi" />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Beklenen Bitiş</label>
                <Form.Item name="expectedEndDate" className="mb-0">
                  <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" placeholder="Beklenen bitiş" />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Ekipman & IT Erişimi */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100 flex items-center gap-2">
              <ComputerDesktopIcon className="w-4 h-4" /> Ekipman & IT Erişimi
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <Form.Item name="workstationAssigned" valuePropName="checked" className="mb-0">
                  <Switch checkedChildren="İş İstasyonu" unCheckedChildren="İş İstasyonu" />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <Form.Item name="computerAssigned" valuePropName="checked" className="mb-0">
                  <Switch checkedChildren="Bilgisayar" unCheckedChildren="Bilgisayar" />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <Form.Item name="phoneAssigned" valuePropName="checked" className="mb-0">
                  <Switch checkedChildren="Telefon" unCheckedChildren="Telefon" />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <Form.Item name="emailSetup" valuePropName="checked" className="mb-0">
                  <Switch checkedChildren="E-posta" unCheckedChildren="E-posta" />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <Form.Item name="networkAccess" valuePropName="checked" className="mb-0">
                  <Switch checkedChildren="Ağ Erişimi" unCheckedChildren="Ağ Erişimi" />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <Form.Item name="vpnAccess" valuePropName="checked" className="mb-0">
                  <Switch checkedChildren="VPN" unCheckedChildren="VPN" />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <Form.Item name="accessCardIssued" valuePropName="checked" className="mb-0">
                  <Switch checkedChildren="Geç Kartı" unCheckedChildren="Geç Kartı" />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <Form.Item name="softwareLicenses" valuePropName="checked" className="mb-0">
                  <Switch checkedChildren="Yazılım" unCheckedChildren="Yazılım" />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <Form.Item name="toolsProvided" valuePropName="checked" className="mb-0">
                  <Switch checkedChildren="Ekipman" unCheckedChildren="Ekipman" />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Dokümantasyon & Eğitim */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100 flex items-center gap-2">
              <DocumentTextIcon className="w-4 h-4" /> Dokümantasyon & Eğitim
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <Form.Item name="contractSigned" valuePropName="checked" className="mb-0">
                  <Switch checkedChildren="Sözleşme" unCheckedChildren="Sözleşme" />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <Form.Item name="ndaSigned" valuePropName="checked" className="mb-0">
                  <Switch checkedChildren="NDA" unCheckedChildren="NDA" />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <Form.Item name="policiesAcknowledged" valuePropName="checked" className="mb-0">
                  <Switch checkedChildren="Politikalar" unCheckedChildren="Politikalar" />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <Form.Item name="handbookProvided" valuePropName="checked" className="mb-0">
                  <Switch checkedChildren="El Kitabı" unCheckedChildren="El Kitabı" />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <Form.Item name="safetyTrainingComplete" valuePropName="checked" className="mb-0">
                  <Switch checkedChildren="İş Güvenliği" unCheckedChildren="İş Güvenliği" />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <Form.Item name="complianceTrainingComplete" valuePropName="checked" className="mb-0">
                  <Switch checkedChildren="Uyum" unCheckedChildren="Uyum" />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <Form.Item name="orientationComplete" valuePropName="checked" className="mb-0">
                  <Switch checkedChildren="Oryantasyon" unCheckedChildren="Oryantasyon" />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <Form.Item name="departmentIntroComplete" valuePropName="checked" className="mb-0">
                  <Switch checkedChildren="Dept. Tanıtım" unCheckedChildren="Dept. Tanıtım" />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <Form.Item name="systemsTrainingComplete" valuePropName="checked" className="mb-0">
                  <Switch checkedChildren="Sistem Eğitimi" unCheckedChildren="Sistem Eğitimi" />
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
