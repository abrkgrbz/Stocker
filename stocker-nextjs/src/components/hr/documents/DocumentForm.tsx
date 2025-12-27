'use client';

import React, { useEffect, useState } from 'react';
import { Form, Select, DatePicker, Input, Upload, message } from 'antd';
import type { UploadProps, UploadFile } from 'antd';
import { DocumentTextIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { useEmployees } from '@/lib/api/hooks/useHR';
import type { EmployeeDocumentDto } from '@/lib/api/services/hr.types';
import { DocumentType } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Dragger } = Upload;

// Document type labels in Turkish
const documentTypeLabels: Record<number, string> = {
  [DocumentType.IdentityCard]: 'Kimlik Karti',
  [DocumentType.Passport]: 'Pasaport',
  [DocumentType.DrivingLicense]: 'Ehliyet',
  [DocumentType.Diploma]: 'Diploma',
  [DocumentType.Certificate]: 'Sertifika',
  [DocumentType.Resume]: 'Ozgecmis',
  [DocumentType.EmploymentContract]: 'Is Sozlesmesi',
  [DocumentType.MedicalReport]: 'Saglik Raporu',
  [DocumentType.CriminalRecord]: 'Sabika Kaydi',
  [DocumentType.AddressProof]: 'Adres Belgesi',
  [DocumentType.ReferenceLetter]: 'Referans Mektubu',
  [DocumentType.SocialSecurityDocument]: 'SGK Belgesi',
  [DocumentType.BankInformation]: 'Banka Bilgileri',
  [DocumentType.FamilyRegister]: 'Aile Kayit Belgesi',
  [DocumentType.MilitaryDocument]: 'Askerlik Belgesi',
  [DocumentType.Photo]: 'Fotograf',
  [DocumentType.Other]: 'Diger',
};

const documentTypeOptions = Object.entries(documentTypeLabels).map(([value, label]) => ({
  value: Number(value),
  label,
}));

interface DocumentFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: EmployeeDocumentDto;
  onFinish: (values: any) => void;
  loading?: boolean;
  onFileChange?: (file: File | null) => void;
}

export default function DocumentForm({ form, initialValues, onFinish, loading, onFileChange }: DocumentFormProps) {
  const { data: employees = [] } = useEmployees();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        issueDate: initialValues.issueDate ? dayjs(initialValues.issueDate) : undefined,
        expiryDate: initialValues.expiryDate ? dayjs(initialValues.expiryDate) : undefined,
      });
    }
  }, [form, initialValues]);

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    fileList,
    beforeUpload: (file) => {
      // Validate file size (max 10MB)
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('Dosya boyutu 10MB\'dan kucuk olmalidir!');
        return Upload.LIST_IGNORE;
      }

      // Store the file for later upload
      setFileList([file]);
      onFileChange?.(file);

      // Prevent automatic upload
      return false;
    },
    onRemove: () => {
      setFileList([]);
      onFileChange?.(null);
    },
  };

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

        {/* HEADER */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Document Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <DocumentTextIcon className="w-6 h-6 text-slate-500" />
              </div>
            </div>

            {/* Document Title */}
            <div className="flex-1">
              <Form.Item
                name="title"
                rules={[{ required: true, message: 'Belge adi zorunludur' }]}
                className="mb-0"
              >
                <Input
                  placeholder="Belge Adi Girin..."
                  variant="borderless"
                  className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
                />
              </Form.Item>
              <Form.Item name="description" className="mb-0 mt-1">
                <Input
                  placeholder="Belge hakkinda kisa aciklama..."
                  variant="borderless"
                  className="!text-sm !text-slate-500 !p-0 placeholder:!text-slate-400"
                />
              </Form.Item>
            </div>

            {/* File Info (Edit Mode) */}
            {initialValues && initialValues.fileName && (
              <div className="flex-shrink-0">
                <div className="px-4 py-2 bg-slate-100 rounded-lg">
                  <div className="text-xs text-slate-500">Mevcut Dosya</div>
                  <div className="text-sm font-medium text-slate-700">{initialValues.fileName}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FORM BODY */}
        <div className="px-8 py-6">

          {/* DOSYA YUKLEME */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Dosya Yukleme
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <Dragger
                  {...uploadProps}
                  className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 !rounded-lg"
                >
                  <p className="ant-upload-drag-icon">
                    <ArrowUpTrayIcon className="w-12 h-12 text-slate-400 mx-auto" />
                  </p>
                  <p className="ant-upload-text text-slate-700 font-medium">
                    Dosya Yukle
                  </p>
                  <p className="ant-upload-hint text-slate-500">
                    Dosyayi surukleyip birakin veya tiklayarak secin
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Maksimum dosya boyutu: 10MB
                  </p>
                </Dragger>
              </div>
            </div>
          </div>

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
                    disabled={!!initialValues}
                    options={employees.map((e) => ({
                      value: e.id,
                      label: e.fullName,
                    }))}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Belge Turu <span className="text-red-500">*</span></label>
                <Form.Item
                  name="documentType"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-0"
                >
                  <Select
                    placeholder="Belge turu secin"
                    options={documentTypeOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Belge Numarasi <span className="text-red-500">*</span></label>
                <Form.Item
                  name="documentNumber"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-0"
                >
                  <Input
                    placeholder="Orn: 12345678901"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Veren Kurum</label>
                <Form.Item name="issuingAuthority" className="mb-0">
                  <Input
                    placeholder="Orn: Nufus Mudurlugu"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* TARIH BILGILERI */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Tarih Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Duzenleme Tarihi</label>
                <Form.Item name="issueDate" className="mb-0">
                  <DatePicker
                    format="DD.MM.YYYY"
                    placeholder="Tarih secin"
                    className="!w-full [&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Son Gecerlilik Tarihi</label>
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

          {/* EK BILGILER */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Ek Bilgiler
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Notlar</label>
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
