'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Select, Switch } from 'antd';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import type { ProductInterestDto, InterestLevel, InterestSource, InterestStatus } from '@/lib/api/services/crm.types';
import { useCustomers, useLeads } from '@/lib/api/hooks/useCRM';

const { TextArea } = Input;

// Interest Level options
const interestLevelOptions = [
  { value: 'Low', label: 'Dusuk' },
  { value: 'Medium', label: 'Orta' },
  { value: 'High', label: 'Yuksek' },
  { value: 'VeryHigh', label: 'Cok Yuksek' },
];

// Interest Status options
const interestStatusOptions = [
  { value: 'New', label: 'Yeni' },
  { value: 'Active', label: 'Aktif' },
  { value: 'Followed', label: 'Takip Ediliyor' },
  { value: 'Purchased', label: 'Satin Alindi' },
  { value: 'Lost', label: 'Kaybedildi' },
];

// Interest Source options
const interestSourceOptions = [
  { value: 'Website', label: 'Web Sitesi' },
  { value: 'Store', label: 'Magaza' },
  { value: 'Campaign', label: 'Kampanya' },
  { value: 'Referral', label: 'Referans' },
  { value: 'SocialMedia', label: 'Sosyal Medya' },
  { value: 'Email', label: 'E-posta' },
  { value: 'Phone', label: 'Telefon' },
  { value: 'Other', label: 'Diger' },
];

interface ProductInterestFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: ProductInterestDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function ProductInterestForm({ form, initialValues, onFinish, loading }: ProductInterestFormProps) {
  const [interestLevel, setInterestLevel] = useState<string>('Medium');

  // Fetch customers for selection
  const { data: customersData, isLoading: customersLoading } = useCustomers({
    pageNumber: 1,
    pageSize: 100,
  });

  // Fetch leads for selection
  const { data: leadsData, isLoading: leadsLoading } = useLeads({
    pageNumber: 1,
    pageSize: 100,
  });

  const customerOptions = (customersData?.items || []).map((c) => ({
    value: c.id,
    label: c.companyName,
  }));

  const leadOptions = (leadsData?.items || []).map((l) => ({
    value: l.id,
    label: `${l.firstName} ${l.lastName}`,
  }));

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
      });
      setInterestLevel(initialValues.interestLevel || 'Medium');
    } else {
      form.setFieldsValue({
        interestLevel: 'Medium',
        source: 'Website',
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

        {/* Header Section */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <ShoppingBagIcon className="w-5 h-5 text-slate-500" />
              </div>
            </div>

            {/* Product Name - Title Style */}
            <div className="flex-1">
              <Form.Item
                name="productName"
                rules={[
                  { required: true, message: 'Urun adi zorunludur' },
                  { max: 200, message: 'En fazla 200 karakter olabilir' },
                ]}
                className="mb-0"
              >
                <Input
                  placeholder="Urun Adi Girin..."
                  variant="borderless"
                  className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
                />
              </Form.Item>
              <p className="text-sm text-slate-500 mt-1">
                Urun ilgisi kaydi
              </p>
            </div>

            {/* Interest Level Selector */}
            <div className="flex-shrink-0">
              <Form.Item name="interestLevel" className="mb-0" initialValue="Medium">
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  {interestLevelOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setInterestLevel(option.value);
                        form.setFieldValue('interestLevel', option.value);
                      }}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        interestLevel === option.value
                          ? 'bg-white shadow-sm text-slate-900'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </Form.Item>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="px-8 py-6">

          {/* URUN BILGILERI */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Urun Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  Urun ID <span className="text-red-500">*</span>
                </label>
                <Form.Item
                  name="productId"
                  rules={[{ required: true, message: 'Urun ID zorunludur' }]}
                  className="mb-0"
                >
                  <InputNumber
                    placeholder="Urun ID"
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                    min={1}
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Miktar</label>
                <Form.Item name="quantity" className="mb-0">
                  <InputNumber
                    placeholder="0"
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                    min={0}
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Birim</label>
                <Form.Item name="unit" className="mb-0">
                  <Input
                    placeholder="Adet, Kg, Lt..."
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Butce</label>
                <Form.Item name="budget" className="mb-0">
                  <InputNumber
                    placeholder="0.00"
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                    min={0}
                    step={0.01}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value?.replace(/,/g, '') as any}
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Kaynak</label>
                <Form.Item name="source" className="mb-0" initialValue="Website">
                  <Select
                    placeholder="Kaynak secin"
                    options={interestSourceOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              {initialValues && (
                <div className="col-span-4">
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Durum</label>
                  <Form.Item name="status" className="mb-0">
                    <Select
                      placeholder="Durum secin"
                      options={interestStatusOptions}
                      className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                    />
                  </Form.Item>
                </div>
              )}
            </div>
          </div>

          {/* MUSTERI/LEAD BILGILERI */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Musteri / Lead Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Musteri</label>
                <Form.Item name="customerId" className="mb-0">
                  <Select
                    placeholder="Musteri secin"
                    options={customerOptions}
                    loading={customersLoading}
                    showSearch
                    optionFilterProp="label"
                    allowClear
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Lead</label>
                <Form.Item name="leadId" className="mb-0">
                  <Select
                    placeholder="Lead secin"
                    options={leadOptions}
                    loading={leadsLoading}
                    showSearch
                    optionFilterProp="label"
                    allowClear
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* NOTLAR */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Notlar
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Notlar</label>
                <Form.Item name="notes" className="mb-0">
                  <TextArea
                    placeholder="Urun ilgisi hakkinda notlar..."
                    rows={3}
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
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
