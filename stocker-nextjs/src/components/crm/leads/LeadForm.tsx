'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Select } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import type { Lead } from '@/lib/api/services/crm.service';

const { TextArea } = Input;

// Lead source options
const sourceOptions = [
  { value: 'Website', label: 'Web Sitesi' },
  { value: 'Referral', label: 'Referans' },
  { value: 'SocialMedia', label: 'Sosyal Medya' },
  { value: 'Event', label: 'Etkinlik' },
  { value: 'ColdCall', label: 'Soğuk Arama' },
  { value: 'Email', label: 'E-posta' },
  { value: 'Other', label: 'Diğer' },
];

// Lead status options
const statusOptions = [
  { value: 'New', label: 'Yeni' },
  { value: 'Contacted', label: 'İletişime Geçildi' },
  { value: 'Working', label: 'Çalışılıyor' },
  { value: 'Qualified', label: 'Nitelikli' },
  { value: 'Unqualified', label: 'Niteliksiz' },
  { value: 'Converted', label: 'Dönüştürüldü' },
  { value: 'Lost', label: 'Kayıp' },
];

// Lead rating options
const ratingOptions = [
  { value: 'Hot', label: 'Sıcak' },
  { value: 'Warm', label: 'Ilık' },
  { value: 'Cold', label: 'Soğuk' },
];

interface LeadFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: Lead;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function LeadForm({ form, initialValues, onFinish, loading }: LeadFormProps) {
  const [rating, setRating] = useState<string>('Warm');

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        status: initialValues.status ?? 'New',
      });
      setRating(initialValues.rating || 'Warm');
    } else {
      form.setFieldsValue({
        status: 'New',
        score: 50,
        rating: 'Warm',
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
    >
      {/* Main Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">

        {/* ═══════════════════════════════════════════════════════════════
            HEADER: Avatar + Name Fields + Rating Selector
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-slate-400 hover:bg-slate-200 transition-all">
                <UserOutlined className="text-xl text-slate-500" />
              </div>
            </div>

            {/* Name Fields - Title Style */}
            <div className="flex-1 flex gap-4">
              <Form.Item
                name="firstName"
                rules={[{ required: true, message: '' }]}
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
                rules={[{ required: true, message: '' }]}
                className="mb-0 flex-1"
              >
                <Input
                  placeholder="Soyad"
                  variant="borderless"
                  className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
                />
              </Form.Item>
            </div>

            {/* Rating Selector */}
            <div className="flex-shrink-0">
              <Form.Item name="rating" className="mb-0" initialValue="Warm">
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  {ratingOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setRating(opt.value);
                        form.setFieldValue('rating', opt.value);
                      }}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                        rating === opt.value
                          ? 'bg-white shadow-sm text-slate-900'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </Form.Item>
            </div>
          </div>

          {/* Description under name */}
          <div className="mt-3 ml-[88px]">
            <Form.Item name="description" className="mb-0">
              <Input
                placeholder="Lead hakkında kısa not..."
                variant="borderless"
                className="!text-sm !text-slate-500 !p-0 placeholder:!text-slate-400"
              />
            </Form.Item>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            FORM BODY: High-Density Grid Layout
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6">

          {/* ─────────────── İLETİŞİM BİLGİLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              İletişim Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">E-posta <span className="text-red-500">*</span></label>
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: '' },
                    { type: 'email', message: '' },
                  ]}
                  className="mb-0"
                >
                  <Input
                    placeholder="ornek@firma.com"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Telefon</label>
                <Form.Item name="phone" className="mb-0">
                  <Input
                    placeholder="+90 (___) ___ ____"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── FİRMA BİLGİLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Firma Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Firma Adı</label>
                <Form.Item name="companyName" className="mb-0">
                  <Input
                    placeholder="ABC Teknoloji A.Ş."
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Pozisyon</label>
                <Form.Item name="jobTitle" className="mb-0">
                  <Input
                    placeholder="Satın Alma Müdürü"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── LEAD BİLGİLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Lead Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Kaynak <span className="text-red-500">*</span></label>
                <Form.Item
                  name="source"
                  rules={[{ required: true, message: '' }]}
                  className="mb-0"
                >
                  <Select
                    placeholder="Seçin"
                    options={sourceOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Durum <span className="text-red-500">*</span></label>
                <Form.Item
                  name="status"
                  rules={[{ required: true, message: '' }]}
                  className="mb-0"
                  initialValue="New"
                >
                  <Select
                    placeholder="Seçin"
                    options={statusOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Lead Puanı</label>
                <Form.Item name="score" className="mb-0" initialValue={50}>
                  <InputNumber
                    min={0}
                    max={100}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                    addonAfter="/ 100"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── NOTLAR ─────────────── */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Notlar
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <Form.Item name="notes" className="mb-0">
                  <TextArea
                    placeholder="Lead hakkında ek notlar..."
                    rows={3}
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white !resize-none"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Hidden submit */}
      <Form.Item hidden>
        <button type="submit" />
      </Form.Item>
    </Form>
  );
}
