'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Form, Input, Select, DatePicker, InputNumber, Slider, Spin, message } from 'antd';
import { ArrowLeftIcon, CheckIcon, WalletIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePurchaseBudget, useUpdatePurchaseBudget } from '@/lib/api/hooks/usePurchase';
import { useDepartments } from '@/lib/api/hooks/useHR';
import type { PurchaseBudgetStatus } from '@/lib/api/services/purchase.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

const statusConfig: Record<PurchaseBudgetStatus, { bg: string; text: string; label: string }> = {
  Draft: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Taslak' },
  PendingApproval: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Onay Bekliyor' },
  Approved: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Onaylandı' },
  Active: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Aktif' },
  Frozen: { bg: 'bg-cyan-100', text: 'text-cyan-700', label: 'Donduruldu' },
  Exhausted: { bg: 'bg-red-100', text: 'text-red-700', label: 'Tükendi' },
  Closed: { bg: 'bg-slate-100', text: 'text-slate-500', label: 'Kapatıldı' },
  Rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Reddedildi' },
  Cancelled: { bg: 'bg-slate-100', text: 'text-slate-500', label: 'İptal Edildi' },
};

const budgetTypeOptions = [
  { value: 'Annual', label: 'Yıllık' },
  { value: 'Quarterly', label: 'Çeyreklik' },
  { value: 'Monthly', label: 'Aylık' },
  { value: 'Project', label: 'Proje' },
  { value: 'Department', label: 'Departman' },
  { value: 'Category', label: 'Kategori' },
  { value: 'CostCenter', label: 'Maliyet Merkezi' },
  { value: 'General', label: 'Genel' },
];

const currencyOptions = [
  { value: 'TRY', label: 'TRY (₺)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
];

export default function EditPurchaseBudgetPage() {
  const params = useParams();
  const router = useRouter();
  const budgetId = params.id as string;
  const [form] = Form.useForm();

  const { data: budget, isLoading: budgetLoading } = usePurchaseBudget(budgetId);
  const updateBudget = useUpdatePurchaseBudget();
  const { data: departmentsData, isLoading: departmentsLoading } = useDepartments();

  useEffect(() => {
    if (budget) {
      form.setFieldsValue({
        code: budget.code || budget.budgetCode,
        name: budget.name,
        description: budget.description,
        budgetType: budget.budgetType || budget.type,
        year: budget.year,
        quarter: budget.quarter,
        departmentId: budget.departmentId,
        periodStart: budget.periodStart ? dayjs(budget.periodStart) : null,
        periodEnd: budget.periodEnd ? dayjs(budget.periodEnd) : null,
        totalAmount: budget.totalAmount || budget.originalAmount,
        currency: budget.currency,
        alertThreshold: budget.alertThreshold,
        notes: budget.notes,
      });
    }
  }, [budget, form]);

  if (budgetLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!budget) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <WalletIcon className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">Bütçe bulunamadı</h3>
          <Link href="/purchase/budgets">
            <button className="text-sm text-slate-600 hover:text-slate-900">← Listeye dön</button>
          </Link>
        </div>
      </div>
    );
  }

  if (budget.status !== 'Draft') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <WalletIcon className="w-6 h-6 text-amber-600" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">Bu bütçe düzenlenemez</h3>
          <p className="text-sm text-slate-500 mb-4">Sadece taslak bütçeler düzenlenebilir.</p>
          <Link href={`/purchase/budgets/${budgetId}`}>
            <button className="text-sm text-slate-600 hover:text-slate-900">← Bütçeye dön</button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSave = async (values: any) => {
    try {
      await updateBudget.mutateAsync({
        id: budgetId,
        data: {
          name: values.name,
          description: values.description,
          endDate: values.periodEnd?.toISOString(),
          warningThreshold: values.alertThreshold,
          notes: values.notes,
        },
      });
      message.success('Bütçe başarıyla güncellendi');
      router.push(`/purchase/budgets/${budgetId}`);
    } catch (error) {
      // Error handled by hook
    }
  };

  const status = statusConfig[budget.status as PurchaseBudgetStatus] || statusConfig.Draft;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/purchase/budgets/${budgetId}`}>
                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <ArrowLeftIcon className="w-5 h-5 text-slate-500" />
                </button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
                  <WalletIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-slate-900">Bütçeyi Düzenle</h1>
                  <p className="text-sm text-slate-500">{budget.code || budget.budgetCode}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link href={`/purchase/budgets/${budgetId}`}>
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                  <XMarkIcon className="w-4 h-4" />
                  İptal
                </button>
              </Link>
              <button
                onClick={() => form.submit()}
                disabled={updateBudget.isPending}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                <CheckIcon className="w-4 h-4" />
                Kaydet
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Form form={form} layout="vertical" onFinish={handleSave}>
          {/* Read-Only Info */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
            <h2 className="text-sm font-medium text-slate-900 mb-4">Bütçe Bilgileri (Salt Okunur)</h2>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <div className="text-xs text-slate-500 mb-1">Durum</div>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${status.bg} ${status.text}`}>
                  {status.label}
                </span>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Kullanılan</div>
                <div className={`text-sm font-medium ${budget.usedAmount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {(budget.usedAmount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {budget.currency}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Kalan</div>
                <div className="text-sm font-medium text-emerald-600">
                  {(budget.remainingAmount || budget.availableAmount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {budget.currency}
                </div>
              </div>
            </div>
          </div>

          {/* Editable Fields */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="text-sm font-medium text-slate-900 mb-6">Bütçe Detayları</h2>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name="code"
                label={<span className="text-xs text-slate-500">Bütçe Kodu</span>}
                rules={[{ required: true, message: 'Kod zorunludur' }]}
              >
                <Input placeholder="BTJ-2024-001" />
              </Form.Item>

              <Form.Item
                name="name"
                label={<span className="text-xs text-slate-500">Bütçe Adı</span>}
                rules={[{ required: true, message: 'Ad zorunludur' }]}
              >
                <Input placeholder="Bütçe adı" />
              </Form.Item>

              <div className="col-span-2">
                <Form.Item
                  name="description"
                  label={<span className="text-xs text-slate-500">Açıklama</span>}
                >
                  <TextArea rows={2} placeholder="Bütçe açıklaması..." />
                </Form.Item>
              </div>

              <Form.Item
                name="budgetType"
                label={<span className="text-xs text-slate-500">Bütçe Tipi</span>}
                rules={[{ required: true, message: 'Tip seçin' }]}
              >
                <Select options={budgetTypeOptions} placeholder="Tip seçin" />
              </Form.Item>

              <Form.Item
                name="year"
                label={<span className="text-xs text-slate-500">Yıl</span>}
              >
                <InputNumber className="w-full" min={2020} max={2099} placeholder="2024" />
              </Form.Item>

              <Form.Item
                name="quarter"
                label={<span className="text-xs text-slate-500">Çeyrek</span>}
              >
                <Select placeholder="Seçin" allowClear>
                  <Select.Option value={1}>Q1</Select.Option>
                  <Select.Option value={2}>Q2</Select.Option>
                  <Select.Option value={3}>Q3</Select.Option>
                  <Select.Option value={4}>Q4</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="departmentId"
                label={<span className="text-xs text-slate-500">Departman</span>}
              >
                <Select
                  placeholder="Departman seçin"
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  loading={departmentsLoading}
                >
                  {departmentsData?.map((dept: any) => (
                    <Select.Option key={dept.id} value={dept.id}>
                      {dept.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="periodStart"
                label={<span className="text-xs text-slate-500">Dönem Başlangıcı</span>}
              >
                <DatePicker className="w-full" format="DD.MM.YYYY" placeholder="Tarih" />
              </Form.Item>

              <Form.Item
                name="periodEnd"
                label={<span className="text-xs text-slate-500">Dönem Bitişi</span>}
              >
                <DatePicker className="w-full" format="DD.MM.YYYY" placeholder="Tarih" />
              </Form.Item>

              <Form.Item
                name="totalAmount"
                label={<span className="text-xs text-slate-500">Toplam Bütçe</span>}
                rules={[{ required: true, message: 'Tutar zorunludur' }]}
              >
                <InputNumber
                  className="w-full"
                  min={0}
                  precision={2}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => (parseFloat(value!.replace(/\$\s?|(,*)/g, '')) || 0) as unknown as 0}
                />
              </Form.Item>

              <Form.Item
                name="currency"
                label={<span className="text-xs text-slate-500">Para Birimi</span>}
              >
                <Select options={currencyOptions} placeholder="Seçin" />
              </Form.Item>

              <div className="col-span-2">
                <Form.Item
                  name="alertThreshold"
                  label={<span className="text-xs text-slate-500">Uyarı Eşiği (%)</span>}
                >
                  <Slider
                    min={50}
                    max={100}
                    marks={{
                      50: '50%',
                      70: '70%',
                      80: '80%',
                      90: '90%',
                      100: '100%',
                    }}
                  />
                </Form.Item>
              </div>

              <div className="col-span-2">
                <Form.Item
                  name="notes"
                  label={<span className="text-xs text-slate-500">Notlar</span>}
                >
                  <TextArea rows={3} placeholder="Ek notlar..." />
                </Form.Item>
              </div>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
