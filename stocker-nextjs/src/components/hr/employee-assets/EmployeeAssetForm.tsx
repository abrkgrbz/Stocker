'use client';

import React, { useEffect } from 'react';
import { Form, Input, Select, DatePicker, InputNumber } from 'antd';
import { CalendarIcon, ComputerDesktopIcon, UserIcon } from '@heroicons/react/24/outline';
import { useEmployees } from '@/lib/api/hooks/useHR';
import type { EmployeeAssetDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

const statusOptions = [
  { value: 'Assigned', label: 'Atandı' },
  { value: 'Available', label: 'Mevcut' },
  { value: 'Returned', label: 'İade Edildi' },
  { value: 'UnderMaintenance', label: 'Bakımda' },
  { value: 'Lost', label: 'Kayıp' },
  { value: 'Damaged', label: 'Hasarlı' },
  { value: 'Disposed', label: 'İmha Edildi' },
];

const assetTypeOptions = [
  { value: 'Laptop', label: 'Laptop' },
  { value: 'Desktop', label: 'Masaüstü' },
  { value: 'Mobile', label: 'Cep Telefonu' },
  { value: 'Tablet', label: 'Tablet' },
  { value: 'Monitor', label: 'Monitör' },
  { value: 'Keyboard', label: 'Klavye' },
  { value: 'Mouse', label: 'Mouse' },
  { value: 'Headset', label: 'Kulaklık' },
  { value: 'Vehicle', label: 'Araç' },
  { value: 'AccessCard', label: 'Giriş Kartı' },
  { value: 'Uniform', label: 'Üniforma' },
  { value: 'Tools', label: 'Aletler' },
  { value: 'Other', label: 'Diğer' },
];

const conditionOptions = [
  { value: 'New', label: 'Yeni' },
  { value: 'Good', label: 'İyi' },
  { value: 'Fair', label: 'Orta' },
  { value: 'Poor', label: 'Kötü' },
];

interface EmployeeAssetFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: EmployeeAssetDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function EmployeeAssetForm({ form, initialValues, onFinish, loading }: EmployeeAssetFormProps) {
  const { data: employees = [] } = useEmployees();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        assignedDate: initialValues.assignmentDate ? dayjs(initialValues.assignmentDate) : undefined,
        returnDate: initialValues.returnDate ? dayjs(initialValues.returnDate) : undefined,
        purchaseDate: initialValues.purchaseDate ? dayjs(initialValues.purchaseDate) : undefined,
        warrantyExpiry: initialValues.warrantyEndDate ? dayjs(initialValues.warrantyEndDate) : undefined,
      });
    } else {
      form.setFieldsValue({ status: 'Assigned', condition: 'New', currency: 'TRY' });
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
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
              <ComputerDesktopIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Varlık Atama</h2>
              <p className="text-sm text-slate-500">Çalışan ekipman yönetimi</p>
            </div>
          </div>
        </div>

        <div className="px-8 py-6">
          {/* Durum & Kondisyon */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Durum & Kondisyon
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Durum</label>
                <Form.Item name="status" className="mb-0">
                  <Select options={statusOptions} placeholder="Durum" />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Kondisyon</label>
                <Form.Item name="condition" className="mb-0">
                  <Select options={conditionOptions} placeholder="Kondisyon" />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Çalışan & Varlık Bilgileri */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100 flex items-center gap-2">
              <UserIcon className="w-4 h-4" /> Çalışan & Varlık Bilgileri
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
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Varlık Türü <span className="text-red-500">*</span></label>
                <Form.Item name="assetType" rules={[{ required: true, message: 'Varlık türü zorunludur' }]} className="mb-0">
                  <Select options={assetTypeOptions} placeholder="Varlık türü" />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Varlık Adı <span className="text-red-500">*</span></label>
                <Form.Item name="assetName" rules={[{ required: true, message: 'Varlık adı zorunludur' }]} className="mb-0">
                  <Input placeholder="Varlık adı" />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Varlık Etiketi</label>
                <Form.Item name="assetTag" className="mb-0">
                  <Input placeholder="Varlık etiketi" />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Seri Numarası</label>
                <Form.Item name="serialNumber" className="mb-0">
                  <Input placeholder="Seri numarası" />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Marka</label>
                <Form.Item name="brand" className="mb-0">
                  <Input placeholder="Marka" />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Model</label>
                <Form.Item name="model" className="mb-0">
                  <Input placeholder="Model" />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Tarihler */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" /> Tarihler
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Atama Tarihi <span className="text-red-500">*</span></label>
                <Form.Item name="assignedDate" rules={[{ required: true, message: 'Atama tarihi zorunludur' }]} className="mb-0">
                  <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" placeholder="Atama tarihi" />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Satın Alma</label>
                <Form.Item name="purchaseDate" className="mb-0">
                  <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" placeholder="Satın alma" />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Garanti Bitiş</label>
                <Form.Item name="warrantyExpiry" className="mb-0">
                  <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" placeholder="Garanti bitiş" />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Değer Bilgileri */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Değer Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Değer</label>
                <Form.Item name="value" className="mb-0">
                  <InputNumber style={{ width: '100%' }} placeholder="Değer" min={0} />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Para Birimi</label>
                <Form.Item name="currency" className="mb-0">
                  <Select
                    options={[
                      { value: 'TRY', label: 'TRY' },
                      { value: 'USD', label: 'USD' },
                      { value: 'EUR', label: 'EUR' },
                    ]}
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
              <TextArea rows={3} placeholder="Ek notlar..." />
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
