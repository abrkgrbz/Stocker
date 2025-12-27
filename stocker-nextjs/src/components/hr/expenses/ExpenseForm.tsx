'use client';

import React, { useEffect, useState } from 'react';
import { Form, Select, DatePicker, InputNumber, Input, Switch } from 'antd';
import { WalletIcon } from '@heroicons/react/24/outline';
import { useEmployees } from '@/lib/api/hooks/useHR';
import type { ExpenseDto } from '@/lib/api/services/hr.types';
import { ExpenseType } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

// Expense type options
const expenseTypeOptions = [
  { value: ExpenseType.Transportation, label: 'Ulaşım' },
  { value: ExpenseType.Meal, label: 'Yemek' },
  { value: ExpenseType.Accommodation, label: 'Konaklama' },
  { value: ExpenseType.Communication, label: 'İletişim' },
  { value: ExpenseType.OfficeSupplies, label: 'Ofis Malzemeleri' },
  { value: ExpenseType.Training, label: 'Eğitim' },
  { value: ExpenseType.Medical, label: 'Sağlık' },
  { value: ExpenseType.Entertainment, label: 'Eğlence' },
  { value: ExpenseType.Other, label: 'Diğer' },
];

interface ExpenseFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: ExpenseDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function ExpenseForm({ form, initialValues, onFinish, loading }: ExpenseFormProps) {
  const { data: employees = [] } = useEmployees();
  const [isReimbursable, setIsReimbursable] = useState(true);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        expenseDate: initialValues.expenseDate ? dayjs(initialValues.expenseDate) : undefined,
      });
      setIsReimbursable(initialValues.isReimbursable ?? true);
    } else {
      form.setFieldsValue({
        isReimbursable: true,
        expenseDate: dayjs(),
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
            HEADER: Icon + Description + Reimbursable Toggle
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Expense Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <WalletIcon className="w-6 h-6 text-slate-500" />
              </div>
            </div>

            {/* Expense Description - Title Style */}
            <div className="flex-1">
              <Form.Item
                name="description"
                rules={[
                  { required: true, message: 'Harcama açıklaması zorunludur' },
                  { max: 200, message: 'Açıklama en fazla 200 karakter olabilir' },
                ]}
                className="mb-0"
              >
                <Input
                  placeholder="Harcama Açıklaması Girin..."
                  variant="borderless"
                  className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
                />
              </Form.Item>
              <Form.Item name="notes" className="mb-0 mt-1">
                <Input
                  placeholder="Ek notlar..."
                  variant="borderless"
                  className="!text-sm !text-slate-500 !p-0 placeholder:!text-slate-400"
                />
              </Form.Item>
            </div>

            {/* Reimbursable Toggle */}
            <div className="flex-shrink-0">
              <div className="flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-lg">
                <span className="text-sm font-medium text-slate-600">
                  {isReimbursable ? 'İade Edilebilir' : 'İade Edilemez'}
                </span>
                <Form.Item name="isReimbursable" valuePropName="checked" noStyle initialValue={true}>
                  <Switch
                    checked={isReimbursable}
                    onChange={(val) => {
                      setIsReimbursable(val);
                      form.setFieldValue('isReimbursable', val);
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

          {/* ─────────────── HARCAMA BİLGİLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Harcama Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Çalışan <span className="text-red-500">*</span></label>
                <Form.Item
                  name="employeeId"
                  rules={[{ required: true, message: 'Çalışan seçimi zorunludur' }]}
                  className="mb-0"
                >
                  <Select
                    placeholder="Çalışan seçin"
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
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Harcama Tarihi <span className="text-red-500">*</span></label>
                <Form.Item
                  name="expenseDate"
                  rules={[{ required: true, message: 'Harcama tarihi zorunludur' }]}
                  className="mb-0"
                >
                  <DatePicker
                    format="DD.MM.YYYY"
                    style={{ width: '100%' }}
                    placeholder="Tarih seçin"
                    className="[&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── TUTAR VE KATEGORİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Tutar ve Kategori
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Harcama Türü <span className="text-red-500">*</span></label>
                <Form.Item
                  name="expenseType"
                  rules={[{ required: true, message: 'Harcama türü seçimi zorunludur' }]}
                  className="mb-0"
                >
                  <Select
                    placeholder="Harcama türü seçin"
                    options={expenseTypeOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Tutar <span className="text-red-500">*</span></label>
                <Form.Item
                  name="amount"
                  rules={[{ required: true, message: 'Tutar zorunludur' }]}
                  className="mb-0"
                >
                  <InputNumber
                    placeholder="0"
                    style={{ width: '100%' }}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value!.replace(/,/g, '') as any}
                    min={0}
                    addonAfter="TRY"
                    className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── İSTATİSTİKLER (Düzenleme Modu) ─────────────── */}
          {initialValues && (
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                Harcama Durumu
              </h3>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <div className="text-2xl font-semibold text-slate-800">
                      ₺{initialValues.amount?.toLocaleString('tr-TR') || 0}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Harcama Tutarı</div>
                  </div>
                </div>
                <div className="col-span-6">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <div className={`text-lg font-semibold ${initialValues.status === 'Approved' ? 'text-green-600' : initialValues.status === 'Rejected' ? 'text-red-600' : 'text-amber-600'}`}>
                      {initialValues.status === 'Pending' && 'Beklemede'}
                      {initialValues.status === 'Approved' && 'Onaylandı'}
                      {initialValues.status === 'Rejected' && 'Reddedildi'}
                      {initialValues.status === 'Paid' && 'Ödendi'}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Durum</div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Hidden submit button */}
      <Form.Item hidden>
        <button type="submit" />
      </Form.Item>
    </Form>
  );
}
