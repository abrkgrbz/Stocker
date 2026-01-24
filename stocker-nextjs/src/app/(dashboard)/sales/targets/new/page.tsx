'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, InputNumber, Select, Switch, message, Spin } from 'antd';
import {
  ChartBarIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { useCreateSalesTarget } from '@/features/sales';
import type { CreateSalesTargetDto } from '@/features/sales';
import Link from 'next/link';

const targetTypeOptions = [
  { value: 'Individual', label: 'Bireysel' },
  { value: 'Team', label: 'Takim' },
  { value: 'Territory', label: 'Bolge' },
];

const periodTypeOptions = [
  { value: 'Monthly', label: 'Aylik' },
  { value: 'Quarterly', label: 'Ceyreklik' },
  { value: 'Annual', label: 'Yillik' },
];

const metricTypeOptions = [
  { value: 'Revenue', label: 'Gelir' },
  { value: 'Quantity', label: 'Miktar' },
  { value: 'OrderCount', label: 'Siparis Sayisi' },
  { value: 'NewCustomers', label: 'Yeni Musteriler' },
  { value: 'Margin', label: 'Kar Marji' },
];

const currencyOptions = [
  { value: 'TRY', label: 'TRY' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
];

export default function NewSalesTargetPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createMutation = useCreateSalesTarget();
  const [selectedTargetType, setSelectedTargetType] = useState<string>('Individual');
  const [selectedPeriodType, setSelectedPeriodType] = useState<string>('Monthly');

  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      const data: CreateSalesTargetDto = {
        name: values.name as string,
        description: values.description as string | undefined,
        targetType: selectedTargetType,
        periodType: selectedPeriodType,
        metricType: (values.metricType as string) || 'Revenue',
        year: (values.year as number) || new Date().getFullYear(),
        totalTargetAmount: values.totalTargetAmount as number,
        currency: (values.currency as string) || 'TRY',
        minimumAchievementPercentage: (values.minimumAchievementPercentage as number) || 80,
        generatePeriods: (values.generatePeriods as boolean) || false,
      };

      await createMutation.mutateAsync(data);
      message.success('Satis hedefi basariyla olusturuldu');
      router.push('/sales/targets');
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
              href="/sales/targets"
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
                <ChartBarIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Yeni Satis Hedefi</h1>
                <p className="text-sm text-slate-500">Yeni bir satis hedefi tanimlayin</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/sales/targets"
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
          initialValues={{
            currency: 'TRY',
            year: new Date().getFullYear(),
            metricType: 'Revenue',
            minimumAchievementPercentage: 80,
            generatePeriods: true,
          }}
        >
          {/* Hedef Bilgileri */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Hedef Bilgileri</h2>
            <Form.Item
              name="name"
              label={<span className="text-slate-700 font-medium">Hedef Adi</span>}
              rules={[{ required: true, message: 'Hedef adi zorunludur' }]}
            >
              <Input placeholder="Hedef adini girin" className="h-12 text-lg" />
            </Form.Item>
            <Form.Item
              name="description"
              label={<span className="text-slate-700 font-medium">Aciklama</span>}
            >
              <Input.TextArea rows={3} placeholder="Hedef aciklamasi..." />
            </Form.Item>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-3">Hedef Tipi</label>
              <div className="flex flex-wrap gap-2">
                {targetTypeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSelectedTargetType(option.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedTargetType === option.value
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Donem & Metrik */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Donem ve Metrik</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-3">Donem Tipi</label>
              <div className="flex flex-wrap gap-2">
                {periodTypeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSelectedPeriodType(option.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedPeriodType === option.value
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Form.Item
                name="metricType"
                label={<span className="text-slate-700 font-medium">Metrik Tipi</span>}
              >
                <Select
                  options={metricTypeOptions}
                  style={{ width: '100%' }}
                />
              </Form.Item>
              <Form.Item
                name="year"
                label={<span className="text-slate-700 font-medium">Yil</span>}
                rules={[{ required: true, message: 'Yil zorunludur' }]}
              >
                <InputNumber className="w-full" min={2020} max={2030} />
              </Form.Item>
              <Form.Item
                name="currency"
                label={<span className="text-slate-700 font-medium">Para Birimi</span>}
              >
                <Select options={currencyOptions} style={{ width: '100%' }} />
              </Form.Item>
            </div>
          </div>

          {/* Hedef Degerleri */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Hedef Degerleri</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="totalTargetAmount"
                label={<span className="text-slate-700 font-medium">Toplam Hedef Tutari</span>}
                rules={[{ required: true, message: 'Hedef tutari zorunludur' }]}
              >
                <InputNumber
                  className="w-full"
                  min={0}
                  placeholder="0"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                  parser={(value) => Number(value?.replace(/\./g, '') || 0)}
                  addonBefore={form.getFieldValue('currency') || 'TRY'}
                />
              </Form.Item>
              <Form.Item
                name="minimumAchievementPercentage"
                label={<span className="text-slate-700 font-medium">Min. Basari Orani</span>}
              >
                <InputNumber
                  className="w-full"
                  min={0}
                  max={100}
                  addonAfter="%"
                />
              </Form.Item>
            </div>
            <Form.Item
              name="generatePeriods"
              valuePropName="checked"
              label={<span className="text-slate-700 font-medium">Donemleri otomatik olustur</span>}
            >
              <Switch />
            </Form.Item>
            <p className="text-xs text-slate-500 -mt-3">
              Secilen donem tipine gore alt donemleri otomatik olarak olusturur.
            </p>
          </div>
        </Form>
      </div>
    </div>
  );
}
