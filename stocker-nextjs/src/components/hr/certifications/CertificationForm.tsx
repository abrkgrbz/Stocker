'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, Select, Switch, InputNumber, DatePicker } from 'antd';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useEmployees } from '@/lib/api/hooks/useHR';
import type { CertificationDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

// Certification type options
const certificationTypeOptions = [
  { value: 'Professional', label: 'Profesyonel' },
  { value: 'Technical', label: 'Teknik' },
  { value: 'Industry', label: 'Sektorel' },
  { value: 'Academic', label: 'Akademik' },
  { value: 'Government', label: 'Devlet' },
  { value: 'Vendor', label: 'Vendor/Urun' },
  { value: 'Safety', label: 'Guvenlik' },
  { value: 'Quality', label: 'Kalite' },
  { value: 'Other', label: 'Diger' },
];

// Certification level options
const certificationLevelOptions = [
  { value: 'Foundation', label: 'Foundation (Temel)' },
  { value: 'Associate', label: 'Associate (Yardimci)' },
  { value: 'Professional', label: 'Professional (Profesyonel)' },
  { value: 'Expert', label: 'Expert (Uzman)' },
  { value: 'Master', label: 'Master (Usta)' },
  { value: 'Architect', label: 'Architect (Mimar)' },
];

interface CertificationFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: CertificationDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function CertificationForm({
  form,
  initialValues,
  onFinish,
  loading,
}: CertificationFormProps) {
  const [trainingRequired, setTrainingRequired] = useState(false);
  const [examRequired, setExamRequired] = useState(false);
  const [cpeRequired, setCpeRequired] = useState(false);
  const [companySponsored, setCompanySponsored] = useState(false);
  const [requiredForJob, setRequiredForJob] = useState(false);

  const { data: employees = [] } = useEmployees();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        issueDate: initialValues.issueDate ? dayjs(initialValues.issueDate) : undefined,
        expiryDate: initialValues.expiryDate ? dayjs(initialValues.expiryDate) : undefined,
        examDate: initialValues.examDate ? dayjs(initialValues.examDate) : undefined,
        trainingCompletionDate: initialValues.trainingCompletionDate
          ? dayjs(initialValues.trainingCompletionDate)
          : undefined,
      });
      setTrainingRequired(initialValues.trainingRequired ?? false);
      setExamRequired(initialValues.examRequired ?? false);
      setCpeRequired(initialValues.cpeRequired ?? false);
      setCompanySponsored(initialValues.companySponsored ?? false);
      setRequiredForJob(initialValues.requiredForJob ?? false);
    } else {
      form.setFieldsValue({
        currency: 'TRY',
        trainingRequired: false,
        examRequired: false,
        cpeRequired: false,
        companySponsored: false,
        requiredForJob: false,
      });
    }
  }, [form, initialValues]);

  const handleFinish = (values: any) => {
    const formattedValues = {
      ...values,
      issueDate: values.issueDate?.format('YYYY-MM-DD'),
      expiryDate: values.expiryDate?.format('YYYY-MM-DD'),
      examDate: values.examDate?.format('YYYY-MM-DD'),
      trainingCompletionDate: values.trainingCompletionDate?.format('YYYY-MM-DD'),
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
            {/* Certification Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <ShieldCheckIcon className="w-6 h-6 text-slate-500" />
              </div>
            </div>

            {/* Certification Name */}
            <div className="flex-1">
              <Form.Item
                name="certificationName"
                rules={[
                  { required: true, message: 'Sertifika adi zorunludur' },
                  { max: 200, message: 'En fazla 200 karakter' },
                ]}
                className="mb-0"
              >
                <Input
                  placeholder="Sertifika Adi Girin..."
                  variant="borderless"
                  className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
                />
              </Form.Item>
              <Form.Item name="description" className="mb-0 mt-1">
                <Input
                  placeholder="Sertifika aciklamasi..."
                  variant="borderless"
                  className="!text-sm !text-slate-500 !p-0 placeholder:!text-slate-400"
                />
              </Form.Item>
            </div>

            {/* Status Indicator (Edit Mode) */}
            {initialValues && (
              <div className="flex-shrink-0">
                <div className={`px-4 py-2 rounded-lg ${
                  initialValues.isExpired
                    ? 'bg-red-100 text-red-700'
                    : initialValues.isExpiringSoon
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  <span className="text-sm font-medium">
                    {initialValues.isExpired
                      ? 'Suresi Doldu'
                      : initialValues.isExpiringSoon
                      ? 'Yakinda Dolacak'
                      : 'Gecerli'}
                  </span>
                </div>
              </div>
            )}
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
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Calisan <span className="text-red-500">*</span></label>
                <Form.Item
                  name="employeeId"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-0"
                >
                  <Select
                    placeholder="Calisan secin"
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
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Sertifika Tipi <span className="text-red-500">*</span></label>
                <Form.Item
                  name="certificationType"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-0"
                >
                  <Select
                    placeholder="Tip secin"
                    options={certificationTypeOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Seviye</label>
                <Form.Item name="certificationLevel" className="mb-0">
                  <Select
                    placeholder="Seviye secin"
                    allowClear
                    options={certificationLevelOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Uzmanlik Alani</label>
                <Form.Item name="specialization" className="mb-0">
                  <Input
                    placeholder="Orn: Cloud, Security"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* VEREN KURUM */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Veren Kurum
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Kurum Adi <span className="text-red-500">*</span></label>
                <Form.Item
                  name="issuingAuthority"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-0"
                >
                  <Input
                    placeholder="Orn: Microsoft, AWS, PMI"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Ulke</label>
                <Form.Item name="issuingCountry" className="mb-0">
                  <Input
                    placeholder="ABD, Almanya, vb."
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Sertifika No</label>
                <Form.Item name="certificationNumber" className="mb-0">
                  <Input
                    placeholder="Sertifika numarasi"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Credential ID</label>
                <Form.Item name="credentialId" className="mb-0">
                  <Input
                    placeholder="Kimlik numarasi"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Dogrulama URL</label>
                <Form.Item name="verificationUrl" className="mb-0">
                  <Input
                    placeholder="https://verify.example.com/..."
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
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
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Verilme Tarihi <span className="text-red-500">*</span></label>
                <Form.Item
                  name="issueDate"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-0"
                >
                  <DatePicker
                    format="DD.MM.YYYY"
                    placeholder="Tarih secin"
                    className="!w-full [&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Gecerlilik Bitis</label>
                <Form.Item name="expiryDate" className="mb-0">
                  <DatePicker
                    format="DD.MM.YYYY"
                    placeholder="Tarih secin"
                    className="!w-full [&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* GEREKSINIMLER */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Gereksinimler
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-sm font-medium text-slate-600">Egitim Gerekli</span>
                  <Form.Item name="trainingRequired" valuePropName="checked" noStyle>
                    <Switch
                      checked={trainingRequired}
                      onChange={(val) => {
                        setTrainingRequired(val);
                        form.setFieldValue('trainingRequired', val);
                      }}
                    />
                  </Form.Item>
                </div>
              </div>
              <div className="col-span-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-sm font-medium text-slate-600">Sinav Gerekli</span>
                  <Form.Item name="examRequired" valuePropName="checked" noStyle>
                    <Switch
                      checked={examRequired}
                      onChange={(val) => {
                        setExamRequired(val);
                        form.setFieldValue('examRequired', val);
                      }}
                    />
                  </Form.Item>
                </div>
              </div>
              <div className="col-span-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-sm font-medium text-slate-600">CPE/CEU Gerekli</span>
                  <Form.Item name="cpeRequired" valuePropName="checked" noStyle>
                    <Switch
                      checked={cpeRequired}
                      onChange={(val) => {
                        setCpeRequired(val);
                        form.setFieldValue('cpeRequired', val);
                      }}
                    />
                  </Form.Item>
                </div>
              </div>
              <div className="col-span-6">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-sm font-medium text-slate-600">Sirket Sponsorlu</span>
                  <Form.Item name="companySponsored" valuePropName="checked" noStyle>
                    <Switch
                      checked={companySponsored}
                      onChange={(val) => {
                        setCompanySponsored(val);
                        form.setFieldValue('companySponsored', val);
                      }}
                    />
                  </Form.Item>
                </div>
              </div>
              <div className="col-span-6">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-sm font-medium text-slate-600">Is Icin Zorunlu</span>
                  <Form.Item name="requiredForJob" valuePropName="checked" noStyle>
                    <Switch
                      checked={requiredForJob}
                      onChange={(val) => {
                        setRequiredForJob(val);
                        form.setFieldValue('requiredForJob', val);
                      }}
                    />
                  </Form.Item>
                </div>
              </div>
            </div>
          </div>

          {/* EGITIM BILGILERI (if required) */}
          {trainingRequired && (
            <div className="mb-8">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                Egitim Bilgileri
              </h3>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Toplam Saat</label>
                  <Form.Item name="totalTrainingHours" className="mb-0">
                    <InputNumber
                      placeholder="40"
                      min={0}
                      className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                    />
                  </Form.Item>
                </div>
                <div className="col-span-6">
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Egitim Saglayici</label>
                  <Form.Item name="trainingProvider" className="mb-0">
                    <Input
                      placeholder="Egitim veren kurum"
                      className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                    />
                  </Form.Item>
                </div>
              </div>
            </div>
          )}

          {/* SINAV BILGILERI (if required) */}
          {examRequired && (
            <div className="mb-8">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                Sinav Bilgileri
              </h3>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-4">
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Sinav Tarihi</label>
                  <Form.Item name="examDate" className="mb-0">
                    <DatePicker
                      format="DD.MM.YYYY"
                      placeholder="Tarih secin"
                      className="!w-full [&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white"
                    />
                  </Form.Item>
                </div>
                <div className="col-span-4">
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Sinav Puani</label>
                  <Form.Item name="examScore" className="mb-0">
                    <InputNumber
                      min={0}
                      max={100}
                      className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                    />
                  </Form.Item>
                </div>
                <div className="col-span-4">
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Gecme Puani</label>
                  <Form.Item name="passingScore" className="mb-0">
                    <InputNumber
                      min={0}
                      max={100}
                      className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                    />
                  </Form.Item>
                </div>
              </div>
            </div>
          )}

          {/* CPE BILGILERI (if required) */}
          {cpeRequired && (
            <div className="mb-8">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                CPE/CEU Bilgileri
              </h3>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Gerekli CPE</label>
                  <Form.Item name="requiredCpeUnits" className="mb-0">
                    <InputNumber
                      min={0}
                      className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                    />
                  </Form.Item>
                </div>
                <div className="col-span-6">
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Kazanilan CPE</label>
                  <Form.Item name="earnedCpeUnits" className="mb-0">
                    <InputNumber
                      min={0}
                      className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                    />
                  </Form.Item>
                </div>
              </div>
            </div>
          )}

          {/* MALIYET BILGILERI */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Maliyet Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Sertifika Ucreti</label>
                <Form.Item name="certificationCost" className="mb-0">
                  <InputNumber
                    min={0}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                    addonAfter="TRY"
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Yenileme Ucreti</label>
                <Form.Item name="renewalCost" className="mb-0">
                  <InputNumber
                    min={0}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                    addonAfter="TRY"
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* NOTLAR */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Notlar
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <Form.Item name="notes" className="mb-0">
                  <TextArea
                    rows={3}
                    placeholder="Ek notlar..."
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
