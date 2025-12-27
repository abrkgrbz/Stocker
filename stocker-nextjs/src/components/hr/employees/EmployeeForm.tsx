'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, Select, DatePicker, InputNumber, Switch } from 'antd';
import { UserIcon } from '@heroicons/react/24/outline';
import { useDepartments, usePositions, useShifts, useWorkLocations, useEmployees } from '@/lib/api/hooks/useHR';
import type { EmployeeDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface EmployeeFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: EmployeeDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function EmployeeForm({ form, initialValues, onFinish, loading }: EmployeeFormProps) {
  const [isActive, setIsActive] = useState(true);

  // Watch department to filter positions
  const selectedDepartment = Form.useWatch('departmentId', form);

  // API Hooks
  const { data: departments = [] } = useDepartments();
  const { data: positions = [] } = usePositions(selectedDepartment);
  const { data: shifts = [] } = useShifts();
  const { data: workLocations = [] } = useWorkLocations();
  const { data: employees = [] } = useEmployees();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        birthDate: initialValues.birthDate ? dayjs(initialValues.birthDate) : undefined,
        hireDate: initialValues.hireDate ? dayjs(initialValues.hireDate) : undefined,
      });
      setIsActive(initialValues.isActive ?? true);
    } else {
      form.setFieldsValue({
        country: 'Türkiye',
        employmentType: 'FullTime',
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

        {/* ═══════════════════════════════════════════════════════════════
            HEADER: Icon + Name + Status Toggle
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Employee Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-slate-500" />
              </div>
            </div>

            {/* Employee Name - Title Style */}
            <div className="flex-1 flex gap-4">
              <Form.Item
                name="firstName"
                rules={[{ required: true, message: 'Ad zorunludur' }]}
                className="mb-0 flex-1"
              >
                <Input
                  placeholder="Ad"
                  variant="borderless"
                  className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
                />
              </Form.Item>
              <Form.Item
                name="lastName"
                rules={[{ required: true, message: 'Soyad zorunludur' }]}
                className="mb-0 flex-1"
              >
                <Input
                  placeholder="Soyad"
                  variant="borderless"
                  className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
                />
              </Form.Item>
            </div>

            {/* Status Toggle */}
            <div className="flex-shrink-0">
              <div className="flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-lg">
                <span className="text-sm font-medium text-slate-600">
                  {isActive ? 'Aktif' : 'Pasif'}
                </span>
                <Form.Item name="isActive" valuePropName="checked" noStyle initialValue={true}>
                  <Switch
                    checked={isActive}
                    onChange={(val) => {
                      setIsActive(val);
                      form.setFieldValue('isActive', val);
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

          {/* ─────────────── KİŞİSEL BİLGİLER ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Kişisel Bilgiler
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">TC Kimlik No</label>
                <Form.Item name="nationalId" className="mb-0">
                  <Input
                    placeholder="TC Kimlik No"
                    maxLength={11}
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Cinsiyet</label>
                <Form.Item name="gender" className="mb-0">
                  <Select
                    placeholder="Seçin"
                    allowClear
                    options={[
                      { value: 'Male', label: 'Erkek' },
                      { value: 'Female', label: 'Kadın' },
                      { value: 'Other', label: 'Diğer' },
                    ]}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Doğum Tarihi</label>
                <Form.Item name="birthDate" className="mb-0">
                  <DatePicker
                    style={{ width: '100%' }}
                    placeholder="Tarih"
                    format="DD.MM.YYYY"
                    className="[&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Doğum Yeri</label>
                <Form.Item name="birthPlace" className="mb-0">
                  <Input
                    placeholder="Şehir"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Kan Grubu</label>
                <Form.Item name="bloodType" className="mb-0">
                  <Select
                    placeholder="Seçin"
                    allowClear
                    options={[
                      { value: 'A+', label: 'A Rh+' },
                      { value: 'A-', label: 'A Rh-' },
                      { value: 'B+', label: 'B Rh+' },
                      { value: 'B-', label: 'B Rh-' },
                      { value: 'AB+', label: 'AB Rh+' },
                      { value: 'AB-', label: 'AB Rh-' },
                      { value: 'O+', label: '0 Rh+' },
                      { value: 'O-', label: '0 Rh-' },
                    ]}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Medeni Durum</label>
                <Form.Item name="maritalStatus" className="mb-0">
                  <Select
                    placeholder="Seçin"
                    allowClear
                    options={[
                      { value: 'Bekar', label: 'Bekar' },
                      { value: 'Evli', label: 'Evli' },
                      { value: 'Boşanmış', label: 'Boşanmış' },
                      { value: 'Dul', label: 'Dul' },
                    ]}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── İLETİŞİM BİLGİLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              İletişim Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">E-posta</label>
                <Form.Item
                  name="email"
                  rules={[{ type: 'email', message: 'Geçerli e-posta girin' }]}
                  className="mb-0"
                >
                  <Input
                    placeholder="E-posta adresi"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Telefon</label>
                <Form.Item
                  name="phone"
                  rules={[
                    {
                      pattern: /^\+?[1-9]\d{1,14}$/,
                      message: 'Geçerli telefon formatı: +905551234567',
                    },
                  ]}
                  className="mb-0"
                >
                  <Input
                    placeholder="+905551234567"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Adres</label>
                <Form.Item name="street" className="mb-0">
                  <TextArea
                    rows={2}
                    placeholder="Adres"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white !resize-none"
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Şehir</label>
                <Form.Item name="city" className="mb-0">
                  <Input
                    placeholder="Şehir"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">İlçe</label>
                <Form.Item name="state" className="mb-0">
                  <Input
                    placeholder="İlçe"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Posta Kodu</label>
                <Form.Item name="postalCode" className="mb-0">
                  <Input
                    placeholder="Posta kodu"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Ülke</label>
                <Form.Item name="country" className="mb-0">
                  <Input
                    placeholder="Ülke"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── İŞ BİLGİLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              İş Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Sicil No <span className="text-red-500">*</span></label>
                <Form.Item
                  name="employeeCode"
                  rules={[{ required: true, message: 'Sicil no zorunludur' }]}
                  className="mb-0"
                >
                  <Input
                    placeholder="EMP001"
                    disabled={!!initialValues}
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">İşe Giriş Tarihi <span className="text-red-500">*</span></label>
                <Form.Item
                  name="hireDate"
                  rules={[{ required: true, message: 'İşe giriş tarihi zorunludur' }]}
                  className="mb-0"
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    placeholder="Tarih"
                    format="DD.MM.YYYY"
                    className="[&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Çalışma Tipi <span className="text-red-500">*</span></label>
                <Form.Item
                  name="employmentType"
                  rules={[{ required: true, message: 'Çalışma tipi zorunludur' }]}
                  className="mb-0"
                >
                  <Select
                    placeholder="Seçin"
                    options={[
                      { value: 'FullTime', label: 'Tam Zamanlı' },
                      { value: 'PartTime', label: 'Yarı Zamanlı' },
                      { value: 'Contract', label: 'Sözleşmeli' },
                      { value: 'Intern', label: 'Stajyer' },
                      { value: 'Temporary', label: 'Geçici' },
                    ]}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Departman <span className="text-red-500">*</span></label>
                <Form.Item
                  name="departmentId"
                  rules={[{ required: true, message: 'Departman zorunludur' }]}
                  className="mb-0"
                >
                  <Select
                    placeholder="Departman seçin"
                    showSearch
                    optionFilterProp="label"
                    options={departments.map((d) => ({ value: d.id, label: d.name }))}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Pozisyon <span className="text-red-500">*</span></label>
                <Form.Item
                  name="positionId"
                  rules={[{ required: true, message: 'Pozisyon zorunludur' }]}
                  className="mb-0"
                >
                  <Select
                    placeholder="Önce departman seçin"
                    showSearch
                    optionFilterProp="label"
                    disabled={!selectedDepartment}
                    options={positions.map((p) => ({ value: p.id, label: p.title }))}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Yönetici</label>
                <Form.Item name="managerId" className="mb-0">
                  <Select
                    placeholder="Seçin"
                    showSearch
                    allowClear
                    optionFilterProp="label"
                    options={employees
                      .filter((e) => !initialValues || e.id !== initialValues.id)
                      .map((e) => ({
                        value: e.id,
                        label: e.fullName,
                      }))}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Vardiya</label>
                <Form.Item name="shiftId" className="mb-0">
                  <Select
                    placeholder="Seçin"
                    allowClear
                    options={shifts.map((s) => ({
                      value: s.id,
                      label: `${s.name} (${s.startTime?.substring(0, 5)} - ${s.endTime?.substring(0, 5)})`,
                    }))}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Lokasyon</label>
                <Form.Item name="workLocationId" className="mb-0">
                  <Select
                    placeholder="Seçin"
                    allowClear
                    options={workLocations.map((l) => ({ value: l.id, label: l.name }))}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Brüt Maaş</label>
                <Form.Item name="baseSalary" className="mb-0">
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="0"
                    min={0}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                    addonAfter="TRY"
                    className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── ACİL DURUM İLETİŞİM ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Acil Durum İletişim
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Ad Soyad</label>
                <Form.Item name="emergencyContactName" className="mb-0">
                  <Input
                    placeholder="Acil durumda aranacak kişi"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Telefon</label>
                <Form.Item
                  name="emergencyContactPhone"
                  rules={[
                    {
                      pattern: /^\+?[1-9]\d{1,14}$/,
                      message: 'Geçerli telefon formatı: +905551234567',
                    },
                  ]}
                  className="mb-0"
                >
                  <Input
                    placeholder="+905551234567"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Yakınlık</label>
                <Form.Item name="emergencyContactRelation" className="mb-0">
                  <Input
                    placeholder="Örn: Eş, Anne, Baba"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── İSTATİSTİKLER (Düzenleme Modu) ─────────────── */}
          {initialValues && (
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                İstatistikler
              </h3>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <div className="text-2xl font-semibold text-slate-800">
                      {initialValues.yearsOfService || 0}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Kıdem Yılı</div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Hidden submit button */}
      <Form.Item hidden>
        <button type="submit" />
      </Form.Item>
    </Form>
  );
}
