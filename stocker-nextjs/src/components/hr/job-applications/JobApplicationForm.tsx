'use client';

import React, { useEffect } from 'react';
import { Form, Input, Select, DatePicker, InputNumber } from 'antd';
import { DocumentTextIcon, UserIcon } from '@heroicons/react/24/outline';
import { useJobPostings } from '@/lib/api/hooks/useHR';
import type { JobApplicationDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

const statusOptions = [
  { value: 'New', label: 'Yeni' },
  { value: 'Screening', label: 'Ön Eleme' },
  { value: 'Interview', label: 'Mülakat' },
  { value: 'Assessment', label: 'Değerlendirme' },
  { value: 'Reference', label: 'Referans Kontrolü' },
  { value: 'Offer', label: 'Teklif' },
  { value: 'Hired', label: 'İşe Alındı' },
  { value: 'Rejected', label: 'Reddedildi' },
  { value: 'Withdrawn', label: 'Geri Çekildi' },
  { value: 'OnHold', label: 'Beklemede' },
];

const sourceOptions = [
  { value: 'Website', label: 'Web Sitesi' },
  { value: 'LinkedIn', label: 'LinkedIn' },
  { value: 'Indeed', label: 'Indeed' },
  { value: 'Referral', label: 'Referans' },
  { value: 'Agency', label: 'Ajans' },
  { value: 'JobFair', label: 'İş Fuarı' },
  { value: 'University', label: 'Üniversite' },
  { value: 'Social', label: 'Sosyal Medya' },
  { value: 'Other', label: 'Diğer' },
];

interface JobApplicationFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: JobApplicationDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function JobApplicationForm({ form, initialValues, onFinish, loading }: JobApplicationFormProps) {
  const { data: jobPostings = [] } = useJobPostings();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        applicationDate: initialValues.applicationDate ? dayjs(initialValues.applicationDate) : undefined,
      });
    } else {
      form.setFieldsValue({ status: 'New' });
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
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-300 to-pink-300 flex items-center justify-center">
              <DocumentTextIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">İş Başvurusu</h2>
              <p className="text-sm text-slate-500">Aday değerlendirme</p>
            </div>
          </div>
        </div>

        <div className="px-8 py-6">
          {/* Durum & Kaynak */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Durum & Kaynak
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Durum</label>
                <Form.Item name="status" className="mb-0">
                  <Select options={statusOptions} placeholder="Durum" />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Kaynak</label>
                <Form.Item name="source" className="mb-0">
                  <Select options={sourceOptions} placeholder="Kaynak" />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Aday Bilgileri */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100 flex items-center gap-2">
              <UserIcon className="w-4 h-4" /> Aday Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Ad Soyad <span className="text-red-500">*</span></label>
                <Form.Item name="candidateName" rules={[{ required: true, message: 'Ad soyad zorunludur' }]} className="mb-0">
                  <Input placeholder="Ad Soyad" />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">E-posta <span className="text-red-500">*</span></label>
                <Form.Item name="candidateEmail" rules={[{ required: true, type: 'email', message: 'Geçerli e-posta adresi giriniz' }]} className="mb-0">
                  <Input placeholder="E-posta" />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Telefon</label>
                <Form.Item name="candidatePhone" className="mb-0">
                  <Input placeholder="Telefon" />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Başvuru Tarihi <span className="text-red-500">*</span></label>
                <Form.Item name="applicationDate" rules={[{ required: true, message: 'Başvuru tarihi zorunludur' }]} className="mb-0">
                  <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" placeholder="Başvuru tarihi" />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Pozisyon & Deneyim */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Pozisyon & Deneyim
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">İş İlanı <span className="text-red-500">*</span></label>
                <Form.Item name="jobPostingId" rules={[{ required: true, message: 'İş ilanı seçimi zorunludur' }]} className="mb-0">
                  <Select
                    showSearch
                    placeholder="İş ilanı seçin"
                    optionFilterProp="label"
                    options={jobPostings.map((j: any) => ({ value: j.id, label: j.title }))}
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Deneyim (Yıl)</label>
                <Form.Item name="yearsOfExperience" className="mb-0">
                  <InputNumber style={{ width: '100%' }} placeholder="Deneyim (yıl)" min={0} />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Mevcut Şirket</label>
                <Form.Item name="currentCompany" className="mb-0">
                  <Input placeholder="Mevcut şirket" />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Mevcut Pozisyon</label>
                <Form.Item name="currentPosition" className="mb-0">
                  <Input placeholder="Mevcut pozisyon" />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Beklenen Maaş</label>
                <Form.Item name="expectedSalary" className="mb-0">
                  <InputNumber style={{ width: '100%' }} placeholder="Beklenen maaş" min={0} />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Ön Yazı & Notlar */}
          <div className="mb-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Ön Yazı & Notlar
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Ön Yazı</label>
                <Form.Item name="coverLetter" className="mb-4">
                  <TextArea rows={4} placeholder="Ön yazı..." />
                </Form.Item>
              </div>
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Notlar</label>
                <Form.Item name="notes" className="mb-0">
                  <TextArea rows={3} placeholder="Notlar..." />
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
