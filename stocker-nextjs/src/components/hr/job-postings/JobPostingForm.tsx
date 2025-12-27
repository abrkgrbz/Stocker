'use client';

import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Select,
  Switch,
  InputNumber,
  DatePicker,
} from 'antd';
import {
  BriefcaseIcon,
} from '@heroicons/react/24/outline';
import { useDepartments, usePositions, useEmployees, useWorkLocations } from '@/lib/api/hooks/useHR';
import type { JobPostingDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

// Employment type options
const employmentTypeOptions = [
  { value: 'FullTime', label: 'Tam Zamanli' },
  { value: 'PartTime', label: 'Yari Zamanli' },
  { value: 'Contract', label: 'Sozlesmeli' },
  { value: 'Intern', label: 'Stajyer' },
  { value: 'Temporary', label: 'Gecici' },
  { value: 'Freelance', label: 'Freelance' },
];

// Experience level options
const experienceLevelOptions = [
  { value: 'Entry', label: 'Giris Seviyesi' },
  { value: 'Junior', label: 'Junior (1-3 Yil)' },
  { value: 'Mid', label: 'Mid-Level (3-5 Yil)' },
  { value: 'Senior', label: 'Senior (5+ Yil)' },
  { value: 'Lead', label: 'Lead / Takim Lideri' },
  { value: 'Manager', label: 'Yonetici' },
  { value: 'Director', label: 'Direktor' },
  { value: 'Executive', label: 'Ust Duzey Yonetici' },
];

// Remote work type options
const remoteWorkTypeOptions = [
  { value: 'OnSite', label: 'Ofiste' },
  { value: 'Remote', label: 'Uzaktan' },
  { value: 'Hybrid', label: 'Hibrit' },
];

// Salary period options
const salaryPeriodOptions = [
  { value: 'Monthly', label: 'Aylik' },
  { value: 'Annual', label: 'Yillik' },
  { value: 'Hourly', label: 'Saatlik' },
];

interface JobPostingFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: JobPostingDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function JobPostingForm({
  form,
  initialValues,
  onFinish,
  loading,
}: JobPostingFormProps) {
  const [isInternal, setIsInternal] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const [showSalary, setShowSalary] = useState(true);

  const { data: departments = [] } = useDepartments();
  const { data: positions = [] } = usePositions();
  const { data: employees = [] } = useEmployees();
  const { data: workLocations = [] } = useWorkLocations();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        applicationDeadline: initialValues.applicationDeadline
          ? dayjs(initialValues.applicationDeadline)
          : undefined,
        expectedStartDate: initialValues.expectedStartDate
          ? dayjs(initialValues.expectedStartDate)
          : undefined,
      });
      setIsInternal(initialValues.isInternal ?? false);
      setIsFeatured(initialValues.isFeatured ?? false);
      setIsUrgent(initialValues.isUrgent ?? false);
      setShowSalary(initialValues.showSalary ?? true);
    } else {
      form.setFieldsValue({
        numberOfOpenings: 1,
        currency: 'TRY',
        salaryPeriod: 'Monthly',
        remoteWorkType: 'OnSite',
        employmentType: 'FullTime',
        experienceLevel: 'Mid',
        showSalary: true,
      });
    }
  }, [form, initialValues]);

  const handleFinish = (values: any) => {
    const formattedValues = {
      ...values,
      applicationDeadline: values.applicationDeadline?.format('YYYY-MM-DD'),
      expectedStartDate: values.expectedStartDate?.format('YYYY-MM-DD'),
    };
    onFinish(formattedValues);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
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
                <BriefcaseIcon className="w-6 h-6 text-slate-500" />
              </div>
            </div>

            {/* Title */}
            <div className="flex-1">
              <Form.Item
                name="title"
                rules={[
                  { required: true, message: 'Ilan basligi zorunludur' },
                  { max: 200, message: 'En fazla 200 karakter' },
                ]}
                className="mb-0"
              >
                <Input
                  placeholder="Ilan Basligi Girin..."
                  variant="borderless"
                  className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
                />
              </Form.Item>
              <Form.Item
                name="description"
                rules={[{ required: true, message: 'Aciklama zorunludur' }]}
                className="mb-0 mt-1"
              >
                <Input
                  placeholder="Is ilani aciklamasi..."
                  variant="borderless"
                  className="!text-sm !text-slate-500 !p-0 placeholder:!text-slate-400"
                />
              </Form.Item>
            </div>

            {/* Status Toggles */}
            <div className="flex-shrink-0 flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg">
                <span className="text-xs font-medium text-slate-600">Ic</span>
                <Form.Item name="isInternal" valuePropName="checked" noStyle>
                  <Switch
                    size="small"
                    checked={isInternal}
                    onChange={(val) => {
                      setIsInternal(val);
                      form.setFieldValue('isInternal', val);
                    }}
                  />
                </Form.Item>
              </div>
              <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg">
                <span className="text-xs font-medium text-slate-600">One Cikan</span>
                <Form.Item name="isFeatured" valuePropName="checked" noStyle>
                  <Switch
                    size="small"
                    checked={isFeatured}
                    onChange={(val) => {
                      setIsFeatured(val);
                      form.setFieldValue('isFeatured', val);
                    }}
                  />
                </Form.Item>
              </div>
              <div className="flex items-center gap-2 bg-red-50 px-3 py-1.5 rounded-lg">
                <span className="text-xs font-medium text-red-600">Acil</span>
                <Form.Item name="isUrgent" valuePropName="checked" noStyle>
                  <Switch
                    size="small"
                    checked={isUrgent}
                    onChange={(val) => {
                      setIsUrgent(val);
                      form.setFieldValue('isUrgent', val);
                    }}
                  />
                </Form.Item>
              </div>
            </div>
          </div>
        </div>

        {/* FORM BODY */}
        <div className="px-8 py-6">

          {/* TEMEL BILGILER */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Temel Bilgiler
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Departman <span className="text-red-500">*</span></label>
                <Form.Item
                  name="departmentId"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-0"
                >
                  <Select
                    placeholder="Departman secin"
                    showSearch
                    optionFilterProp="label"
                    options={departments.map((d) => ({
                      value: d.id,
                      label: d.name,
                    }))}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Pozisyon</label>
                <Form.Item name="positionId" className="mb-0">
                  <Select
                    placeholder="Pozisyon secin"
                    showSearch
                    optionFilterProp="label"
                    allowClear
                    options={positions.map((p) => ({
                      value: p.id,
                      label: p.title,
                    }))}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Calisma Tipi <span className="text-red-500">*</span></label>
                <Form.Item
                  name="employmentType"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-0"
                >
                  <Select
                    placeholder="Secin"
                    options={employmentTypeOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Deneyim Seviyesi <span className="text-red-500">*</span></label>
                <Form.Item
                  name="experienceLevel"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-0"
                >
                  <Select
                    placeholder="Secin"
                    options={experienceLevelOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Acik Pozisyon Sayisi <span className="text-red-500">*</span></label>
                <Form.Item
                  name="numberOfOpenings"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-0"
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={1}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Ise Alim Yoneticisi</label>
                <Form.Item name="hiringManagerId" className="mb-0">
                  <Select
                    placeholder="Secin"
                    showSearch
                    optionFilterProp="label"
                    allowClear
                    options={employees.map((e) => ({
                      value: e.id,
                      label: e.fullName,
                    }))}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Uzaktan Calisma <span className="text-red-500">*</span></label>
                <Form.Item
                  name="remoteWorkType"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-0"
                >
                  <Select
                    placeholder="Secin"
                    options={remoteWorkTypeOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* KONUM BILGILERI */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Konum Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Calisma Lokasyonu</label>
                <Form.Item name="workLocationId" className="mb-0">
                  <Select
                    placeholder="Secin"
                    showSearch
                    optionFilterProp="label"
                    allowClear
                    options={workLocations.map((l) => ({
                      value: l.id,
                      label: l.name,
                    }))}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Sehir</label>
                <Form.Item name="city" className="mb-0">
                  <Input
                    placeholder="Istanbul"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Ulke</label>
                <Form.Item name="country" className="mb-0">
                  <Input
                    placeholder="Turkiye"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* MAAS BILGILERI */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Maas Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 mb-4">
                  <div>
                    <span className="text-sm font-medium text-slate-700">Maasi Goster</span>
                    <span className="text-xs text-slate-400 ml-2">Ilanda maas bilgisini goster</span>
                  </div>
                  <Form.Item name="showSalary" valuePropName="checked" noStyle>
                    <Switch
                      checked={showSalary}
                      onChange={(val) => {
                        setShowSalary(val);
                        form.setFieldValue('showSalary', val);
                      }}
                    />
                  </Form.Item>
                </div>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Minimum Maas</label>
                <Form.Item name="salaryMin" className="mb-0">
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    }
                    parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Maksimum Maas</label>
                <Form.Item name="salaryMax" className="mb-0">
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    }
                    parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Periyot</label>
                <Form.Item name="salaryPeriod" className="mb-0">
                  <Select
                    placeholder="Secin"
                    options={salaryPeriodOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* TARIHLER */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Tarihler
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Son Basvuru Tarihi</label>
                <Form.Item name="applicationDeadline" className="mb-0">
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD.MM.YYYY"
                    placeholder="Tarih secin"
                    className="!w-full [&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Beklenen Baslangic</label>
                <Form.Item name="expectedStartDate" className="mb-0">
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD.MM.YYYY"
                    placeholder="Tarih secin"
                    className="!w-full [&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* GEREKSINIMLER VE NITELIKLER */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Gereksinimler ve Nitelikler
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Gereksinimler</label>
                <Form.Item name="requirements" className="mb-4">
                  <TextArea
                    rows={3}
                    placeholder="Pozisyon icin gerekli nitelikler"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white !resize-none"
                  />
                </Form.Item>
              </div>
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Sorumluluklar</label>
                <Form.Item name="responsibilities" className="mb-4">
                  <TextArea
                    rows={3}
                    placeholder="Pozisyonun sorumluluklari"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white !resize-none"
                  />
                </Form.Item>
              </div>
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Nitelikler</label>
                <Form.Item name="qualifications" className="mb-4">
                  <TextArea
                    rows={3}
                    placeholder="Aranan nitelikler"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white !resize-none"
                  />
                </Form.Item>
              </div>
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Tercih Edilen Nitelikler</label>
                <Form.Item name="preferredQualifications" className="mb-4">
                  <TextArea
                    rows={2}
                    placeholder="Tercih edilen ek nitelikler"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white !resize-none"
                  />
                </Form.Item>
              </div>
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Yan Haklar</label>
                <Form.Item name="benefits" className="mb-0">
                  <TextArea
                    rows={2}
                    placeholder="Sunulan yan haklar ve avantajlar"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white !resize-none"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ETIKETLER VE ANAHTAR KELIMELER */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Etiketler ve Anahtar Kelimeler
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Etiketler</label>
                <Form.Item name="tags" className="mb-0">
                  <Input
                    placeholder="yazilim, gelistirici, react"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Anahtar Kelimeler</label>
                <Form.Item name="keywords" className="mb-0">
                  <Input
                    placeholder="frontend, typescript, nextjs"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Ic Notlar</label>
                <Form.Item name="internalNotes" className="mb-0">
                  <TextArea
                    rows={2}
                    placeholder="Sadece yoneticilerin gorebilecegi notlar"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white !resize-none"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ISTATISTIKLER (Duzenleme Modu) */}
          {initialValues && (
            <div className="mb-8">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                Istatistikler
              </h3>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-4">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <div className="text-2xl font-semibold text-slate-800">
                      {initialValues.totalApplications || 0}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Basvuru</div>
                  </div>
                </div>
                <div className="col-span-4">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <div className="text-2xl font-semibold text-slate-800">
                      {initialValues.viewsCount || 0}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Goruntulenme</div>
                  </div>
                </div>
                <div className="col-span-4">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <div className="text-2xl font-semibold text-slate-800">
                      {initialValues.hiredCount || 0}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Ise Alinan</div>
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
