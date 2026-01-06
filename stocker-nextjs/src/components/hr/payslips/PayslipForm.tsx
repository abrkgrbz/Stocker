'use client';

import React, { useEffect } from 'react';
import { Form, Input, Select, DatePicker, InputNumber } from 'antd';
import {
  CurrencyDollarIcon,
  MinusCircleIcon,
  PlusCircleIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { useEmployees } from '@/lib/api/hooks/useHR';
import type { PayslipDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

const statusOptions = [
  { value: 'Draft', label: 'Taslak' },
  { value: 'Pending', label: 'Beklemede' },
  { value: 'Approved', label: 'Onaylandı' },
  { value: 'Paid', label: 'Ödendi' },
  { value: 'Cancelled', label: 'İptal' },
];

const paymentMethodOptions = [
  { value: 'BankTransfer', label: 'Banka Havale' },
  { value: 'Cash', label: 'Nakit' },
  { value: 'Check', label: 'Çek' },
];

interface PayslipFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: PayslipDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function PayslipForm({ form, initialValues, onFinish, loading }: PayslipFormProps) {
  const { data: employees = [] } = useEmployees();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        payPeriodStart: initialValues.periodStart ? dayjs(initialValues.periodStart) : undefined,
        payPeriodEnd: initialValues.periodEnd ? dayjs(initialValues.periodEnd) : undefined,
        paymentDate: initialValues.paymentDate ? dayjs(initialValues.paymentDate) : undefined,
      });
    } else {
      form.setFieldsValue({ status: 'Draft' });
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
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
              <CurrencyDollarIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Bordro</h2>
              <p className="text-sm text-slate-500">Maaş hesaplama</p>
            </div>
          </div>
        </div>

        <div className="px-8 py-6">
          {/* Durum & Ödeme */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Durum & Ödeme
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Durum</label>
                <Form.Item name="status" className="mb-0">
                  <Select options={statusOptions} placeholder="Durum" className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white" />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Ödeme Yöntemi</label>
                <Form.Item name="paymentMethod" className="mb-0">
                  <Select options={paymentMethodOptions} placeholder="Ödeme yöntemi" allowClear className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white" />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Çalışan & Dönem Bilgileri */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100 flex items-center gap-2">
              <UserIcon className="w-4 h-4" /> Çalışan & Dönem Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Çalışan <span className="text-red-500">*</span></label>
                <Form.Item name="employeeId" rules={[{ required: true, message: 'Çalışan seçimi zorunludur' }]} className="mb-0">
                  <Select
                    showSearch
                    placeholder="Çalışan seçin"
                    optionFilterProp="label"
                    options={employees.map((e: any) => ({ value: e.id, label: `${e.firstName} ${e.lastName}` }))}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Dönem Başlangıç <span className="text-red-500">*</span></label>
                <Form.Item name="payPeriodStart" rules={[{ required: true, message: 'Dönem başlangıç zorunludur' }]} className="mb-0">
                  <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" placeholder="Dönem başlangıç" className="[&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white" />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Dönem Bitiş <span className="text-red-500">*</span></label>
                <Form.Item name="payPeriodEnd" rules={[{ required: true, message: 'Dönem bitiş zorunludur' }]} className="mb-0">
                  <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" placeholder="Dönem bitiş" className="[&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white" />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Ödeme Tarihi</label>
                <Form.Item name="paymentDate" className="mb-0">
                  <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" placeholder="Ödeme tarihi" className="[&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white" />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Kazançlar */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100 flex items-center gap-2">
              <PlusCircleIcon className="w-4 h-4" /> Kazançlar
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Temel Maaş <span className="text-red-500">*</span></label>
                <Form.Item name="basicSalary" rules={[{ required: true, message: 'Temel maaş zorunludur' }]} className="mb-0">
                  <InputNumber style={{ width: '100%' }} placeholder="Temel maaş" prefix="₺" className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white" />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Fazla Mesai</label>
                <Form.Item name="overtimePay" className="mb-0">
                  <InputNumber style={{ width: '100%' }} placeholder="Fazla mesai" prefix="₺" className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white" />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">İkramiye</label>
                <Form.Item name="bonuses" className="mb-0">
                  <InputNumber style={{ width: '100%' }} placeholder="İkramiye" prefix="₺" className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white" />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Komisyon</label>
                <Form.Item name="commission" className="mb-0">
                  <InputNumber style={{ width: '100%' }} placeholder="Komisyon" prefix="₺" className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white" />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Yemek</label>
                <Form.Item name="mealAllowance" className="mb-0">
                  <InputNumber style={{ width: '100%' }} placeholder="Yemek" prefix="₺" className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white" />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Ulaşım</label>
                <Form.Item name="transportAllowance" className="mb-0">
                  <InputNumber style={{ width: '100%' }} placeholder="Ulaşım" prefix="₺" className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white" />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Konut</label>
                <Form.Item name="housingAllowance" className="mb-0">
                  <InputNumber style={{ width: '100%' }} placeholder="Konut" prefix="₺" className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white" />
                </Form.Item>
              </div>
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Diğer Ödenekler</label>
                <Form.Item name="otherAllowances" className="mb-0">
                  <InputNumber style={{ width: '100%' }} placeholder="Diğer ödenekler" prefix="₺" className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white" />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Kesintiler */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100 flex items-center gap-2">
              <MinusCircleIcon className="w-4 h-4" /> Kesintiler
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Gelir Vergisi</label>
                <Form.Item name="incomeTax" className="mb-0">
                  <InputNumber style={{ width: '100%' }} placeholder="Gelir vergisi" prefix="₺" className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white" />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Damga Vergisi</label>
                <Form.Item name="stampTax" className="mb-0">
                  <InputNumber style={{ width: '100%' }} placeholder="Damga vergisi" prefix="₺" className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white" />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">SGK (Çalışan)</label>
                <Form.Item name="ssiEmployeeContribution" className="mb-0">
                  <InputNumber style={{ width: '100%' }} placeholder="SGK (çalışan)" prefix="₺" className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white" />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">İşsizlik (Çalışan)</label>
                <Form.Item name="unemploymentInsuranceEmployee" className="mb-0">
                  <InputNumber style={{ width: '100%' }} placeholder="İşsizlik (çalışan)" prefix="₺" className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white" />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Sağlık Sigortası</label>
                <Form.Item name="healthInsurance" className="mb-0">
                  <InputNumber style={{ width: '100%' }} placeholder="Sağlık sigortası" prefix="₺" className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white" />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Sendika Aidatı</label>
                <Form.Item name="unionDues" className="mb-0">
                  <InputNumber style={{ width: '100%' }} placeholder="Sendika aidatı" prefix="₺" className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white" />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">İcra Kesintisi</label>
                <Form.Item name="garnishments" className="mb-0">
                  <InputNumber style={{ width: '100%' }} placeholder="İcra kesintisi" prefix="₺" className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white" />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Diğer Kesintiler</label>
                <Form.Item name="otherDeductions" className="mb-0">
                  <InputNumber style={{ width: '100%' }} placeholder="Diğer kesintiler" prefix="₺" className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white" />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* İşveren Kesintileri */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              İşveren Kesintileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">SGK (İşveren)</label>
                <Form.Item name="ssiEmployerContribution" className="mb-0">
                  <InputNumber style={{ width: '100%' }} placeholder="SGK (işveren)" prefix="₺" className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white" />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">İşsizlik (İşveren)</label>
                <Form.Item name="unemploymentInsuranceEmployer" className="mb-0">
                  <InputNumber style={{ width: '100%' }} placeholder="İşsizlik (işveren)" prefix="₺" className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white" />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Notlar */}
          <div className="mb-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Notlar
            </h3>
            <Form.Item name="notes" className="mb-0">
              <TextArea rows={3} placeholder="Ek notlar..." className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white !resize-none" />
            </Form.Item>
          </div>
        </div>
      </div>

      <Form.Item hidden>
        <button type="submit" />
      </Form.Item>
    </Form>
  );
}
