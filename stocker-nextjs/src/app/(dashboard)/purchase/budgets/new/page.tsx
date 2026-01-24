'use client';

import React from 'react';
import { Form, Input, Select, DatePicker, InputNumber, message } from 'antd';
import {
  ArrowLeftIcon,
  CheckIcon,
  WalletIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useCreatePurchaseBudget } from '@/lib/api/hooks/usePurchase';
import type { CreatePurchaseBudgetDto, BudgetType } from '@/lib/api/services/purchase.types';

const { TextArea } = Input;
const { RangePicker } = DatePicker;

const budgetTypeOptions: { value: BudgetType; label: string }[] = [
  { value: 'Department', label: 'Departman' },
  { value: 'Category', label: 'Kategori' },
  { value: 'Project', label: 'Proje' },
  { value: 'CostCenter', label: 'Maliyet Merkezi' },
  { value: 'General', label: 'Genel' },
];

export default function NewPurchaseBudgetPage() {
  const router = useRouter();
  const [form] = Form.useForm();

  const createMutation = useCreatePurchaseBudget();

  const handleSubmit = async (values: any) => {
    const [periodStart, periodEnd] = values.period || [];

    const data: CreatePurchaseBudgetDto = {
      code: values.code,
      name: values.name,
      description: values.description,
      budgetType: values.budgetType,
      departmentId: values.departmentId,
      categoryId: values.categoryId,
      totalAmount: values.totalAmount,
      currency: values.currency || 'TRY',
      periodStart: periodStart?.toISOString(),
      periodEnd: periodEnd?.toISOString(),
      alertThreshold: values.alertThreshold,
      notes: values.notes,
    };

    try {
      await createMutation.mutateAsync(data);
      message.success('Bütçe başarıyla oluşturuldu');
      router.push('/purchase/budgets');
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleCancel = () => {
    router.push('/purchase/budgets');
  };

  const isLoading = createMutation.isPending;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 text-slate-600" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <WalletIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-slate-900">Yeni Satın Alma Bütçesi</h1>
                  <p className="text-sm text-slate-500">Departman veya kategori bazlı bütçe tanımlayın</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                <XMarkIcon className="w-4 h-4" />
                İptal
              </button>
              <button
                onClick={() => form.submit()}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                <CheckIcon className="w-4 h-4" />
                {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            currency: 'TRY',
            budgetType: 'Department',
            alertThreshold: 80,
          }}
        >
          <div className="grid grid-cols-12 gap-6">
            {/* Left Panel */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              {/* Visual Card */}
              <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-8 text-white">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-4">
                    <WalletIcon className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">Satın Alma Bütçesi</h3>
                  <p className="text-sm text-white/70">Harcama limitlerini belirleyin</p>
                </div>
              </div>

              {/* Budget Amount */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h2 className="text-sm font-medium text-slate-900 mb-4">Bütçe Tutarı</h2>

                <Form.Item
                  name="totalAmount"
                  label={<span className="text-xs text-slate-500">Toplam Bütçe</span>}
                  rules={[{ required: true, message: 'Tutar zorunludur' }]}
                >
                  <InputNumber<number>
                    className="w-full"
                    min={0}
                    precision={2}
                    placeholder="0.00"
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value: string | undefined) => Number(value?.replace(/,/g, '') ?? 0)}
                    addonAfter={
                      <Form.Item name="currency" noStyle>
                        <Select style={{ width: 80 }}>
                          <Select.Option value="TRY">TRY</Select.Option>
                          <Select.Option value="USD">USD</Select.Option>
                          <Select.Option value="EUR">EUR</Select.Option>
                        </Select>
                      </Form.Item>
                    }
                  />
                </Form.Item>

                <Form.Item
                  name="alertThreshold"
                  label={<span className="text-xs text-slate-500">Uyarı Eşiği (%)</span>}
                  help="Bu yüzdeyi aştığında uyarı gönderilir"
                >
                  <InputNumber
                    className="w-full"
                    min={0}
                    max={100}
                    placeholder="80"
                    addonAfter="%"
                  />
                </Form.Item>
              </div>
            </div>

            {/* Right Panel */}
            <div className="col-span-12 lg:col-span-8">
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                {/* Name - Hero Input */}
                <Form.Item
                  name="name"
                  rules={[
                    { required: true, message: 'Bütçe adı zorunludur' },
                    { max: 200, message: 'En fazla 200 karakter' },
                  ]}
                  className="mb-4"
                >
                  <Input
                    placeholder="Bütçe adı"
                    className="!text-2xl !font-semibold !border-0 !shadow-none !px-0 placeholder:text-slate-300"
                  />
                </Form.Item>

                <Form.Item name="description" className="mb-6">
                  <TextArea
                    placeholder="Bütçe hakkında açıklama..."
                    autoSize={{ minRows: 2, maxRows: 4 }}
                    className="!border-0 !shadow-none !px-0 !text-slate-600 placeholder:text-slate-300"
                  />
                </Form.Item>

                <div className="h-px bg-slate-100 my-6" />

                <div className="grid grid-cols-2 gap-4">
                  <Form.Item
                    name="code"
                    label={<span className="text-xs text-slate-500">Bütçe Kodu</span>}
                    rules={[{ required: true, message: 'Zorunlu' }]}
                  >
                    <Input placeholder="BUD-2024-001" />
                  </Form.Item>

                  <Form.Item
                    name="budgetType"
                    label={<span className="text-xs text-slate-500">Bütçe Tipi</span>}
                    rules={[{ required: true, message: 'Zorunlu' }]}
                  >
                    <Select placeholder="Tip seçin" options={budgetTypeOptions} />
                  </Form.Item>
                </div>

                <Form.Item
                  name="period"
                  label={<span className="text-xs text-slate-500">Bütçe Dönemi</span>}
                  rules={[{ required: true, message: 'Dönem seçimi zorunludur' }]}
                >
                  <RangePicker
                    className="w-full"
                    format="DD.MM.YYYY"
                    placeholder={['Başlangıç', 'Bitiş']}
                  />
                </Form.Item>

                <div className="grid grid-cols-2 gap-4">
                  <Form.Item
                    name="departmentId"
                    label={<span className="text-xs text-slate-500">Departman</span>}
                  >
                    <Select
                      placeholder="Departman seçin"
                      allowClear
                      showSearch
                      optionFilterProp="children"
                    >
                      <Select.Option value="dept-1">Üretim</Select.Option>
                      <Select.Option value="dept-2">Pazarlama</Select.Option>
                      <Select.Option value="dept-3">İK</Select.Option>
                      <Select.Option value="dept-4">IT</Select.Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="categoryId"
                    label={<span className="text-xs text-slate-500">Kategori</span>}
                  >
                    <Select
                      placeholder="Kategori seçin"
                      allowClear
                      showSearch
                      optionFilterProp="children"
                    >
                      <Select.Option value="cat-1">Hammadde</Select.Option>
                      <Select.Option value="cat-2">Ofis Malzemeleri</Select.Option>
                      <Select.Option value="cat-3">IT Ekipmanları</Select.Option>
                    </Select>
                  </Form.Item>
                </div>

                <Form.Item
                  name="notes"
                  label={<span className="text-xs text-slate-500">Notlar</span>}
                >
                  <TextArea rows={3} placeholder="Ek notlar ve açıklamalar..." />
                </Form.Item>
              </div>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
