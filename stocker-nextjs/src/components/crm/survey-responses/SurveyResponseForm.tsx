'use client';

import React from 'react';
import { Form, Input, Select, DatePicker, InputNumber, Switch } from 'antd';
import type { FormInstance } from 'antd';
import {
  UserIcon,
  ClipboardDocumentListIcon,
  StarIcon,
  ChatBubbleBottomCenterTextIcon,
} from '@heroicons/react/24/outline';
import { SurveyType, SurveyResponseStatus, SurveyResponseDto } from '@/lib/api/services/crm.types';
import { useCustomers } from '@/lib/api/hooks/useCRM';
import dayjs from 'dayjs';

const surveyTypeOptions = [
  { value: SurveyType.NPS, label: 'NPS (Net Promoter Score)', icon: '📊' },
  { value: SurveyType.CSAT, label: 'CSAT (Musteri Memnuniyeti)', icon: '😊' },
  { value: SurveyType.CES, label: 'CES (Musteri Efor Skoru)', icon: '⚡' },
  { value: SurveyType.ProductFeedback, label: 'Urun Geribildirim', icon: '📦' },
  { value: SurveyType.ServiceFeedback, label: 'Hizmet Geribildirim', icon: '⭐' },
  { value: SurveyType.General, label: 'Genel', icon: '📝' },
  { value: SurveyType.Custom, label: 'Ozel', icon: '🔧' },
];

const statusOptions = [
  { value: SurveyResponseStatus.Pending, label: 'Beklemede', color: 'bg-amber-100 text-amber-700' },
  { value: SurveyResponseStatus.Completed, label: 'Tamamlandi', color: 'bg-emerald-100 text-emerald-700' },
  { value: SurveyResponseStatus.Partial, label: 'Kismi', color: 'bg-blue-100 text-blue-700' },
  { value: SurveyResponseStatus.Expired, label: 'Suresi Doldu', color: 'bg-slate-100 text-slate-600' },
];

interface SurveyResponseFormProps {
  form: FormInstance;
  initialValues?: Partial<SurveyResponseDto>;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function SurveyResponseForm({
  form,
  initialValues,
  onFinish,
  loading,
}: SurveyResponseFormProps) {
  const { data: customersData } = useCustomers({ page: 1, pageSize: 100 });

  const customers = customersData?.items || [];

  const customerOptions = customers.map((c) => ({
    value: c.id,
    label: c.companyName,
  }));

  // Transform initial values for form
  const formattedInitialValues = initialValues
    ? {
        ...initialValues,
        submittedAt: initialValues.submittedAt
          ? dayjs(initialValues.submittedAt)
          : undefined,
      }
    : undefined;

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      disabled={loading}
      initialValues={formattedInitialValues}
      className="space-y-6"
    >
      {/* Survey Info Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardDocumentListIcon className="w-5 h-5 text-slate-600" />
          <h3 className="text-sm font-medium text-slate-900 uppercase tracking-wider">
            Anket Bilgileri
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            name="surveyType"
            label={<span className="text-slate-700 font-medium">Anket Tipi</span>}
            rules={[{ required: true, message: 'Anket tipi secimi zorunludur' }]}
          >
            <Select
              placeholder="Anket tipi seciniz"
              className="w-full"
              options={surveyTypeOptions.map((s) => ({
                value: s.value,
                label: (
                  <span className="flex items-center gap-2">
                    <span>{s.icon}</span>
                    <span>{s.label}</span>
                  </span>
                ),
              }))}
            />
          </Form.Item>

          <Form.Item
            name="surveyName"
            label={<span className="text-slate-700 font-medium">Anket Adi</span>}
            rules={[{ required: true, message: 'Anket adi zorunludur' }]}
          >
            <Input
              placeholder="Ornek: 2024 Musteri Memnuniyeti Anketi"
              className="rounded-md"
            />
          </Form.Item>

          <Form.Item
            name="status"
            label={<span className="text-slate-700 font-medium">Durum</span>}
            rules={[{ required: true, message: 'Durum secimi zorunludur' }]}
          >
            <Select
              placeholder="Durum seciniz"
              className="w-full"
              options={statusOptions.map((s) => ({
                value: s.value,
                label: s.label,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="submittedAt"
            label={<span className="text-slate-700 font-medium">Gonderim Tarihi</span>}
          >
            <DatePicker
              className="w-full rounded-md"
              format="DD/MM/YYYY HH:mm"
              showTime
              placeholder="Tarih seciniz"
            />
          </Form.Item>
        </div>
      </div>

      {/* Scoring Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <StarIcon className="w-5 h-5 text-slate-600" />
          <h3 className="text-sm font-medium text-slate-900 uppercase tracking-wider">
            Puanlama
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Form.Item
            name="overallScore"
            label={<span className="text-slate-700 font-medium">Genel Puan (1-10)</span>}
          >
            <InputNumber
              min={1}
              max={10}
              step={0.1}
              placeholder="0.0"
              className="w-full rounded-md"
            />
          </Form.Item>

          <Form.Item
            name="npsScore"
            label={<span className="text-slate-700 font-medium">NPS Puani (0-10)</span>}
          >
            <InputNumber
              min={0}
              max={10}
              placeholder="0"
              className="w-full rounded-md"
            />
          </Form.Item>

          <Form.Item
            name="csatScore"
            label={<span className="text-slate-700 font-medium">CSAT Puani (1-5)</span>}
          >
            <InputNumber
              min={1}
              max={5}
              placeholder="0"
              className="w-full rounded-md"
            />
          </Form.Item>
        </div>
      </div>

      {/* Association Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <UserIcon className="w-5 h-5 text-slate-600" />
          <h3 className="text-sm font-medium text-slate-900 uppercase tracking-wider">
            Iliskilendirme
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Form.Item
            name="customerId"
            label={<span className="text-slate-700 font-medium">Musteri</span>}
          >
            <Select
              placeholder="Musteri seciniz"
              className="w-full"
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={customerOptions}
            />
          </Form.Item>
        </div>

        <div className="mt-4">
          <Form.Item
            name="isAnonymous"
            valuePropName="checked"
            label={<span className="text-slate-700 font-medium">Anonim Yanit</span>}
          >
            <Switch />
          </Form.Item>
        </div>
      </div>

      {/* Feedback Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <ChatBubbleBottomCenterTextIcon className="w-5 h-5 text-slate-600" />
          <h3 className="text-sm font-medium text-slate-900 uppercase tracking-wider">
            Geribildirim
          </h3>
        </div>

        <Form.Item
          name="comments"
          label={<span className="text-slate-700 font-medium">Yorumlar</span>}
        >
          <Input.TextArea
            rows={4}
            placeholder="Katilimcinin yazili yorumlari..."
            className="rounded-md"
          />
        </Form.Item>
      </div>
    </Form>
  );
}
