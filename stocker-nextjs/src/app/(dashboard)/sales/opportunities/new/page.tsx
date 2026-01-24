'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, InputNumber, Select, DatePicker, message, Spin } from 'antd';
import {
  LightBulbIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { useCreateOpportunity, useActivePipelines } from '@/features/sales';
import type { CreateOpportunityDto } from '@/features/sales';
import Link from 'next/link';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

const sourceOptions = [
  { value: 'Website', label: 'Web Sitesi' },
  { value: 'Referral', label: 'Referans' },
  { value: 'ColdCall', label: 'Soguk Arama' },
  { value: 'Email', label: 'E-posta' },
  { value: 'SocialMedia', label: 'Sosyal Medya' },
  { value: 'Exhibition', label: 'Fuar' },
  { value: 'Partner', label: 'Partner' },
  { value: 'Other', label: 'Diger' },
];

const priorityOptions = [
  { value: 'Low', label: 'Dusuk' },
  { value: 'Medium', label: 'Orta' },
  { value: 'High', label: 'Yuksek' },
  { value: 'Critical', label: 'Kritik' },
];

const currencyOptions = [
  { value: 'TRY', label: 'TRY - Turk Lirasi' },
  { value: 'USD', label: 'USD - Amerikan Dolari' },
  { value: 'EUR', label: 'EUR - Euro' },
];

export default function NewOpportunityPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createMutation = useCreateOpportunity();
  const { data: pipelines, isLoading: pipelinesLoading } = useActivePipelines();

  const pipelineOptions = (pipelines || []).map(p => ({
    value: p.id,
    label: p.name,
  }));

  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      const data: CreateOpportunityDto = {
        title: values.title as string,
        description: values.description as string | undefined,
        source: values.source as string | undefined,
        priority: values.priority as string | undefined,
        customerId: values.customerId as string | undefined,
        customerName: values.customerName as string | undefined,
        pipelineId: values.pipelineId as string | undefined,
        estimatedValue: values.estimatedValue as number,
        currency: (values.currency as string) || 'TRY',
        expectedCloseDate: values.expectedCloseDate
          ? (values.expectedCloseDate as dayjs.Dayjs).format('YYYY-MM-DD')
          : undefined,
        salesPersonId: values.salesPersonId as string | undefined,
        salesPersonName: values.salesPersonName as string | undefined,
        notes: values.notes as string | undefined,
      };

      await createMutation.mutateAsync(data);
      message.success('Firsat basariyla olusturuldu');
      router.push('/sales/opportunities');
    } catch {
      // Error handled by hook
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/sales/opportunities"
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
                <LightBulbIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Yeni Firsat</h1>
                <p className="text-sm text-slate-500">Yeni bir satis firsati olusturun</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/sales/opportunities"
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Vazgec
            </Link>
            <button
              onClick={() => form.submit()}
              disabled={createMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
            >
              {createMutation.isPending && <Spin size="small" />}
              Kaydet
            </button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto p-8">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ currency: 'TRY', probability: 50 }}
        >
          {/* Firsat Bilgileri */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Firsat Bilgileri</h2>
            <Form.Item
              name="title"
              label={<span className="text-slate-700 font-medium">Baslik</span>}
              rules={[{ required: true, message: 'Baslik zorunludur' }]}
            >
              <Input
                placeholder="Firsat basligini girin"
                className="h-12 text-lg"
              />
            </Form.Item>
            <Form.Item
              name="description"
              label={<span className="text-slate-700 font-medium">Aciklama</span>}
            >
              <Input.TextArea rows={3} placeholder="Firsat aciklamasi..." />
            </Form.Item>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="source"
                label={<span className="text-slate-700 font-medium">Kaynak</span>}
              >
                <Select
                  placeholder="Firsat kaynagi"
                  options={sourceOptions}
                  allowClear
                  style={{ width: '100%' }}
                />
              </Form.Item>
              <Form.Item
                name="priority"
                label={<span className="text-slate-700 font-medium">Oncelik</span>}
              >
                <Select
                  placeholder="Oncelik secin"
                  options={priorityOptions}
                  allowClear
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </div>
          </div>

          {/* Musteri & Pipeline */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Musteri ve Pipeline</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="customerId"
                label={<span className="text-slate-700 font-medium">Musteri ID</span>}
              >
                <Input placeholder="Musteri ID" />
              </Form.Item>
              <Form.Item
                name="customerName"
                label={<span className="text-slate-700 font-medium">Musteri Adi</span>}
              >
                <Input placeholder="Musteri adi" />
              </Form.Item>
            </div>
            <Form.Item
              name="pipelineId"
              label={<span className="text-slate-700 font-medium">Pipeline</span>}
            >
              <Select
                placeholder="Pipeline secin"
                options={pipelineOptions}
                loading={pipelinesLoading}
                allowClear
                style={{ width: '100%' }}
              />
            </Form.Item>
          </div>

          {/* Degerleme */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Degerleme</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Form.Item
                name="estimatedValue"
                label={<span className="text-slate-700 font-medium">Tahmini Deger</span>}
                rules={[{ required: true, message: 'Deger zorunludur' }]}
              >
                <InputNumber
                  className="w-full"
                  min={0}
                  placeholder="0"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                  parser={(value) => Number(value?.replace(/\./g, '') || 0)}
                />
              </Form.Item>
              <Form.Item
                name="currency"
                label={<span className="text-slate-700 font-medium">Para Birimi</span>}
              >
                <Select
                  options={currencyOptions}
                  style={{ width: '100%' }}
                />
              </Form.Item>
              <Form.Item
                name="probability"
                label={<span className="text-slate-700 font-medium">Olasilik (%)</span>}
              >
                <InputNumber
                  className="w-full"
                  min={0}
                  max={100}
                  placeholder="50"
                  addonAfter="%"
                />
              </Form.Item>
            </div>
            <Form.Item
              name="expectedCloseDate"
              label={<span className="text-slate-700 font-medium">Tahmini Kapanis Tarihi</span>}
            >
              <DatePicker
                className="w-full"
                format="DD/MM/YYYY"
                placeholder="Tarih secin"
              />
            </Form.Item>
          </div>

          {/* Atama */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Atama</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="salesPersonId"
                label={<span className="text-slate-700 font-medium">Satis Temsilcisi ID</span>}
              >
                <Input placeholder="Temsilci ID" />
              </Form.Item>
              <Form.Item
                name="salesPersonName"
                label={<span className="text-slate-700 font-medium">Satis Temsilcisi Adi</span>}
              >
                <Input placeholder="Temsilci adi" />
              </Form.Item>
            </div>
          </div>

          {/* Notlar */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Notlar</h2>
            <Form.Item name="notes">
              <Input.TextArea rows={4} placeholder="Ek notlar..." />
            </Form.Item>
          </div>
        </Form>
      </div>
    </div>
  );
}
