'use client';

import React, { useEffect } from 'react';
import { Form, Input, Select, DatePicker, InputNumber } from 'antd';
import { CalendarIcon, GiftIcon, UserIcon } from '@heroicons/react/24/outline';
import { useEmployees } from '@/lib/api/hooks/useHR';
import type { EmployeeBenefitDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

const statusOptions = [
  { value: 'Active', label: 'Aktif' },
  { value: 'Pending', label: 'Beklemede' },
  { value: 'Expired', label: 'Süresi Doldu' },
  { value: 'Cancelled', label: 'İptal' },
  { value: 'Suspended', label: 'Askıya Alındı' },
];

const benefitTypeOptions = [
  { value: 'HealthInsurance', label: 'Sağlık Sigortası' },
  { value: 'LifeInsurance', label: 'Hayat Sigortası' },
  { value: 'DentalInsurance', label: 'Diş Sigortası' },
  { value: 'VisionInsurance', label: 'Göz Sigortası' },
  { value: 'RetirementPlan', label: 'Emeklilik Planı' },
  { value: 'MealCard', label: 'Yemek Kartı' },
  { value: 'TransportAllowance', label: 'Ulaşım Yardımı' },
  { value: 'CompanyCar', label: 'Şirket Aracı' },
  { value: 'FuelCard', label: 'Yakıt Kartı' },
  { value: 'GymMembership', label: 'Spor Salonu Üyeliği' },
  { value: 'EducationSupport', label: 'Eğitim Desteği' },
  { value: 'ChildcareSupport', label: 'Çocuk Bakımı Desteği' },
  { value: 'HousingAllowance', label: 'Konut Yardımı' },
  { value: 'PhoneAllowance', label: 'Telefon Yardımı' },
  { value: 'Other', label: 'Diğer' },
];

interface EmployeeBenefitFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: EmployeeBenefitDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function EmployeeBenefitForm({ form, initialValues, onFinish, loading }: EmployeeBenefitFormProps) {
  const { data: employees = [] } = useEmployees();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        startDate: initialValues.startDate ? dayjs(initialValues.startDate) : undefined,
        endDate: initialValues.endDate ? dayjs(initialValues.endDate) : undefined,
      });
    } else {
      form.setFieldsValue({ status: 'Active', currency: 'TRY' });
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
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-400 to-yellow-400 flex items-center justify-center">
              <GiftIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Yan Hak Bilgileri</h2>
              <p className="text-sm text-slate-500">Çalışan faydası</p>
            </div>
          </div>
        </div>

        <div className="px-8 py-6">
          {/* Durum */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Durum
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Durum</label>
                <Form.Item name="status" className="mb-0">
                  <Select options={statusOptions} placeholder="Durum" className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white" />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Çalışan & Yan Hak Bilgileri */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100 flex items-center gap-2">
              <UserIcon className="w-4 h-4" /> Çalışan & Yan Hak Bilgileri
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
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Yan Hak Türü <span className="text-red-500">*</span></label>
                <Form.Item name="benefitType" rules={[{ required: true, message: 'Yan hak türü zorunludur' }]} className="mb-0">
                  <Select options={benefitTypeOptions} placeholder="Yan hak türü" className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white" />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Yan Hak Adı <span className="text-red-500">*</span></label>
                <Form.Item name="benefitName" rules={[{ required: true, message: 'Yan hak adı zorunludur' }]} className="mb-0">
                  <Input placeholder="Yan hak adı" className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white" />
                </Form.Item>
              </div>
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Sağlayıcı</label>
                <Form.Item name="provider" className="mb-0">
                  <Input placeholder="Sağlayıcı" className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white" />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Tarihler & Değer */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" /> Tarihler & Değer
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Başlangıç <span className="text-red-500">*</span></label>
                <Form.Item name="startDate" rules={[{ required: true, message: 'Başlangıç tarihi zorunludur' }]} className="mb-0">
                  <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" placeholder="Başlangıç" className="[&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white" />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Bitiş</label>
                <Form.Item name="endDate" className="mb-0">
                  <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" placeholder="Bitiş" className="[&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white" />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Değer</label>
                <Form.Item name="value" className="mb-0">
                  <InputNumber style={{ width: '100%' }} placeholder="Değer" min={0} className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white" />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Para Birimi</label>
                <Form.Item name="currency" className="mb-0">
                  <Select
                    style={{ width: 120 }}
                    options={[
                      { value: 'TRY', label: 'TRY' },
                      { value: 'USD', label: 'USD' },
                      { value: 'EUR', label: 'EUR' },
                    ]}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
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
