'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, Select, DatePicker, InputNumber, Switch } from 'antd';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import type { FormInstance } from 'antd';
import type { ContractType } from '@/lib/api/services/sales.service';
import dayjs from 'dayjs';

interface ContractFormProps {
  form: FormInstance;
  onFinish: (values: any) => void;
  loading?: boolean;
  isEdit?: boolean;
  initialValues?: any;
  customers?: { id: string; name: string }[];
  loadingCustomers?: boolean;
}

const contractTypeOptions: { value: ContractType; label: string }[] = [
  { value: 'Standard', label: 'Standart' },
  { value: 'Premium', label: 'Premium' },
  { value: 'Enterprise', label: 'Kurumsal' },
  { value: 'Custom', label: 'Özel' },
  { value: 'Framework', label: 'Çerçeve Sözleşme' },
  { value: 'ServiceLevel', label: 'SLA Sözleşmesi' },
];

const currencyOptions = [
  { value: 'TRY', label: '₺ TRY' },
  { value: 'USD', label: '$ USD' },
  { value: 'EUR', label: '€ EUR' },
];

export function ContractForm({
  form,
  onFinish,
  loading = false,
  isEdit = false,
  initialValues,
  customers = [],
  loadingCustomers = false,
}: ContractFormProps) {
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        startDate: initialValues.startDate ? dayjs(initialValues.startDate) : dayjs(),
        endDate: initialValues.endDate ? dayjs(initialValues.endDate) : dayjs().add(1, 'year'),
      });
      setIsActive(initialValues.isActive ?? true);
    } else {
      form.setFieldsValue({
        contractType: 'Standard',
        currency: 'TRY',
        startDate: dayjs(),
        endDate: dayjs().add(1, 'year'),
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
      scrollToFirstError={{ behavior: 'smooth', block: 'center' }}
    >
      {/* Main Card */}
      <div className="bg-white border border-slate-200 rounded-xl">

        {/* ═══════════════════════════════════════════════════════════════
            HEADER: Icon + Contract Number + Status Toggle
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Contract Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <DocumentTextIcon className="w-6 h-6 text-slate-500" />
              </div>
            </div>

            {/* Contract Number - Title Style */}
            <div className="flex-1">
              <Form.Item name="contractNumber" className="mb-0">
                <Input
                  placeholder="Sözleşme Numarası (Otomatik)"
                  variant="borderless"
                  disabled={!isEdit}
                  className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
                />
              </Form.Item>
              <p className="text-sm text-slate-500 mt-1">
                {isEdit ? 'Sözleşmeyi düzenleyin' : 'Yeni sözleşme oluşturun'}
              </p>
            </div>

            {/* Status Toggle */}
            <div className="flex-shrink-0">
              <div className="flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-lg">
                <span className="text-sm font-medium text-slate-600">
                  {isActive ? 'Aktif' : 'Pasif'}
                </span>
                <Form.Item name="isActive" valuePropName="checked" noStyle initialValue={true}>
                  <Switch
                    checked={isActive}
                    onChange={(val) => {
                      setIsActive(val);
                      form.setFieldValue('isActive', val);
                    }}
                  />
                </Form.Item>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            FORM BODY: High-Density Grid Layout
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6">

          {/* ─────────────── TEMEL BİLGİLER ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Temel Bilgiler
            </h3>
            <div className="grid grid-cols-12 gap-4">
              {!isEdit && (
                <div className="col-span-12">
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Müşteri <span className="text-red-500">*</span></label>
                  <Form.Item
                    name="customerId"
                    rules={[{ required: true, message: 'Müşteri seçiniz' }]}
                    className="mb-0"
                  >
                    <Select
                      placeholder="Müşteri seçiniz"
                      loading={loadingCustomers}
                      showSearch
                      optionFilterProp="label"
                      options={customers.map((c) => ({ value: c.id, label: c.name }))}
                      className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                    />
                  </Form.Item>
                </div>
              )}
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Sözleşme Türü <span className="text-red-500">*</span></label>
                <Form.Item
                  name="contractType"
                  rules={[{ required: true, message: 'Sözleşme türü seçiniz' }]}
                  className="mb-0"
                >
                  <Select
                    options={contractTypeOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Para Birimi</label>
                <Form.Item name="currency" className="mb-0">
                  <Select
                    options={currencyOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── SÖZLEŞME SÜRESİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Sözleşme Süresi
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Başlangıç Tarihi <span className="text-red-500">*</span></label>
                <Form.Item
                  name="startDate"
                  rules={[{ required: true, message: 'Başlangıç tarihi seçiniz' }]}
                  className="mb-0"
                >
                  <DatePicker
                    format="DD.MM.YYYY"
                    style={{ width: '100%' }}
                    placeholder="Tarih seçiniz"
                    className="[&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Bitiş Tarihi <span className="text-red-500">*</span></label>
                <Form.Item
                  name="endDate"
                  rules={[{ required: true, message: 'Bitiş tarihi seçiniz' }]}
                  className="mb-0"
                >
                  <DatePicker
                    format="DD.MM.YYYY"
                    style={{ width: '100%' }}
                    placeholder="Tarih seçiniz"
                    className="[&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── FİNANSAL BİLGİLER ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Finansal Bilgiler
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Kredi Limiti</label>
                <Form.Item name="creditLimitAmount" className="mb-0">
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="0"
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value?.replace(/,/g, '') as any}
                    className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">İndirim Oranı (%)</label>
                <Form.Item name="discountPercentage" className="mb-0">
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    max={100}
                    placeholder="0"
                    addonAfter="%"
                    className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Ödeme Vadesi (Gün)</label>
                <Form.Item name="paymentTermDays" className="mb-0">
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    placeholder="30"
                    className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── SLA BİLGİLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              SLA Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Yanıt Süresi (Saat)</label>
                <Form.Item name="responseTimeHours" className="mb-0">
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    placeholder="24"
                    className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Çözüm Süresi (Saat)</label>
                <Form.Item name="resolutionTimeHours" className="mb-0">
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    placeholder="72"
                    className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Destek Seviyesi</label>
                <Form.Item name="supportLevel" className="mb-0">
                  <Select
                    placeholder="Seçiniz"
                    options={[
                      { value: 'Basic', label: 'Temel' },
                      { value: 'Standard', label: 'Standart' },
                      { value: 'Premium', label: 'Premium' },
                      { value: 'Enterprise', label: 'Kurumsal' },
                    ]}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── NOTLAR ─────────────── */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Notlar
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Sözleşme Notları</label>
                <Form.Item name="notes" className="mb-0">
                  <Input.TextArea
                    rows={3}
                    placeholder="Sözleşme ile ilgili notlar..."
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white !resize-none"
                  />
                </Form.Item>
              </div>
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Özel Şartlar</label>
                <Form.Item name="terms" className="mb-0">
                  <Input.TextArea
                    rows={3}
                    placeholder="Özel sözleşme şartları..."
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
