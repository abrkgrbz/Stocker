'use client';

/**
 * Create Price List Page
 * Yeni fiyat listesi olusturma formu - Monochrome Design System
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { Form, Input, Select, DatePicker, InputNumber, Switch, message } from 'antd';
import Link from 'next/link';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import { useCreatePriceList } from '@/features/sales';
import type { CreatePriceListDto } from '@/features/sales';

dayjs.locale('tr');

const { TextArea } = Input;

const typeOptions = [
  { value: 'Standard', label: 'Standart' },
  { value: 'Promotional', label: 'Promosyon' },
  { value: 'Contract', label: 'Sozlesme' },
  { value: 'Wholesale', label: 'Toptan' },
  { value: 'Retail', label: 'Perakende' },
];

const currencyOptions = [
  { value: 'TRY', label: 'TRY - Turk Lirasi' },
  { value: 'USD', label: 'USD - Amerikan Dolari' },
  { value: 'EUR', label: 'EUR - Euro' },
];

export default function NewPriceListPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createMutation = useCreatePriceList();

  const handleSubmit = async (values: any) => {
    const payload: CreatePriceListDto = {
      code: values.code,
      name: values.name,
      description: values.description,
      type: values.type,
      currencyCode: values.currencyCode,
      validFrom: values.validFrom?.format('YYYY-MM-DD') || dayjs().format('YYYY-MM-DD'),
      validTo: values.validTo?.format('YYYY-MM-DD'),
      isTaxIncluded: values.isTaxIncluded || false,
      priority: values.priority || 0,
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        router.push('/sales/pricelists');
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/sales/pricelists"
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
                <CurrencyDollarIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">Yeni Fiyat Listesi</h1>
                <p className="text-xs text-slate-500">Fiyatlandirma bilgilerini girin</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/sales/pricelists"
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Vazgec
            </Link>
            <button
              onClick={() => form.submit()}
              disabled={createMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
            >
              {createMutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-8 py-8">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            type: 'Standard',
            currencyCode: 'TRY',
            isTaxIncluded: false,
            priority: 0,
            validFrom: dayjs(),
          }}
        >
          {/* Section: Temel Bilgiler */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
            <h2 className="text-base font-semibold text-slate-900 mb-1">Temel Bilgiler</h2>
            <p className="text-sm text-slate-500 mb-6 pb-4 border-b border-slate-100">
              Fiyat listesinin temel tanimlama bilgileri
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Form.Item
                name="code"
                label={<span className="text-sm font-medium text-slate-700">Kod</span>}
                rules={[{ required: true, message: 'Kod zorunludur' }]}
              >
                <Input
                  placeholder="PL-2026-001"
                  className="rounded-lg"
                />
              </Form.Item>

              <div className="md:col-span-2">
                <Form.Item
                  name="name"
                  label={<span className="text-sm font-medium text-slate-700">Ad</span>}
                  rules={[{ required: true, message: 'Ad zorunludur' }]}
                >
                  <Input
                    placeholder="Fiyat listesi adini girin"
                    className="rounded-lg text-lg"
                    size="large"
                  />
                </Form.Item>
              </div>

              <div className="md:col-span-2">
                <Form.Item
                  name="description"
                  label={<span className="text-sm font-medium text-slate-700">Aciklama</span>}
                >
                  <TextArea
                    placeholder="Fiyat listesi hakkinda aciklama (opsiyonel)"
                    rows={3}
                    className="rounded-lg"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Section: Fiyatlandirma Ayarlari */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
            <h2 className="text-base font-semibold text-slate-900 mb-1">Fiyatlandirma Ayarlari</h2>
            <p className="text-sm text-slate-500 mb-6 pb-4 border-b border-slate-100">
              Fiyat listesi tipi ve para birimi ayarlari
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Form.Item
                  name="type"
                  label={<span className="text-sm font-medium text-slate-700">Tip</span>}
                  rules={[{ required: true }]}
                >
                  <div className="flex flex-wrap gap-2">
                    {typeOptions.map((opt) => {
                      const currentValue = Form.useWatch('type', form);
                      const isSelected = currentValue === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => form.setFieldValue('type', opt.value)}
                          className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                            isSelected
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </Form.Item>
              </div>

              <Form.Item
                name="currencyCode"
                label={<span className="text-sm font-medium text-slate-700">Para Birimi</span>}
                rules={[{ required: true }]}
              >
                <Select
                  options={currencyOptions}
                  className="w-full"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="isTaxIncluded"
                label={<span className="text-sm font-medium text-slate-700">KDV Dahil</span>}
                valuePropName="checked"
              >
                <Switch checkedChildren="Evet" unCheckedChildren="Hayir" />
              </Form.Item>
            </div>
          </div>

          {/* Section: Gecerlilik */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-1">Gecerlilik</h2>
            <p className="text-sm text-slate-500 mb-6 pb-4 border-b border-slate-100">
              Fiyat listesinin gecerlilik tarihi ve oncelik bilgileri
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Form.Item
                name="validFrom"
                label={<span className="text-sm font-medium text-slate-700">Baslangic Tarihi</span>}
                rules={[{ required: true, message: 'Baslangic tarihi zorunludur' }]}
              >
                <DatePicker
                  className="w-full rounded-lg"
                  format="DD.MM.YYYY"
                  placeholder="Tarih secin"
                />
              </Form.Item>

              <Form.Item
                name="validTo"
                label={<span className="text-sm font-medium text-slate-700">Bitis Tarihi</span>}
              >
                <DatePicker
                  className="w-full rounded-lg"
                  format="DD.MM.YYYY"
                  placeholder="Opsiyonel"
                />
              </Form.Item>

              <Form.Item
                name="priority"
                label={<span className="text-sm font-medium text-slate-700">Oncelik</span>}
              >
                <InputNumber
                  min={0}
                  max={100}
                  className="w-full rounded-lg"
                  placeholder="0"
                />
              </Form.Item>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
