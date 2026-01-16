'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Select, Switch } from 'antd';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import type { LoyaltyMembershipDto } from '@/lib/api/services/crm.types';
import { useLoyaltyPrograms } from '@/lib/api/hooks/useCRM';
import { useCustomers } from '@/lib/api/hooks/useCRM';

interface LoyaltyMembershipFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: LoyaltyMembershipDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function LoyaltyMembershipForm({ form, initialValues, onFinish, loading }: LoyaltyMembershipFormProps) {
  const [isActive, setIsActive] = useState(true);

  // Fetch loyalty programs for selection
  const { data: programs, isLoading: programsLoading } = useLoyaltyPrograms({
    page: 1,
    pageSize: 100,
    isActive: true,
  });

  // Fetch customers for selection
  const { data: customersData, isLoading: customersLoading } = useCustomers({
    pageNumber: 1,
    pageSize: 100,
  });

  const programOptions = (programs || []).map((p) => ({
    value: p.id,
    label: `${p.name} (${p.code})`,
  }));

  const customerOptions = (customersData?.items || []).map((c) => ({
    value: c.id,
    label: c.companyName,
  }));

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        programId: initialValues.loyaltyProgramId,
      });
      setIsActive(initialValues.isActive ?? true);
    } else {
      form.setFieldsValue({
        isActive: true,
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
                <UserGroupIcon className="w-5 h-5 text-slate-500" />
              </div>
            </div>

            {/* Membership Number - Title Style */}
            <div className="flex-1">
              <Form.Item
                name="membershipNumber"
                rules={[
                  { required: true, message: 'Uyelik numarasi zorunludur' },
                  { max: 50, message: 'En fazla 50 karakter olabilir' },
                ]}
                className="mb-0"
              >
                <Input
                  placeholder="Uyelik Numarasi Girin..."
                  variant="borderless"
                  className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
                />
              </Form.Item>
              <p className="text-sm text-slate-500 mt-1">
                Sadakat programi uyeligi
              </p>
            </div>

            {/* Status Toggle */}
            <div className="flex-shrink-0">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 min-w-[140px]">
                <div>
                  <div className="text-sm text-slate-700">
                    {isActive ? 'Aktif' : 'Pasif'}
                  </div>
                </div>
                <Form.Item name="isActive" valuePropName="checked" noStyle initialValue={true}>
                  <Switch
                    checked={isActive}
                    onChange={(val) => {
                      setIsActive(val);
                      form.setFieldValue('isActive', val);
                    }}
                    checkedChildren="Aktif"
                    unCheckedChildren="Pasif"
                  />
                </Form.Item>
              </div>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="px-8 py-6">

          {/* UYELIK BILGILERI */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Uyelik Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  Sadakat Programi <span className="text-red-500">*</span>
                </label>
                <Form.Item
                  name="programId"
                  rules={[{ required: true, message: 'Sadakat programi secimi zorunludur' }]}
                  className="mb-0"
                >
                  <Select
                    placeholder="Program secin"
                    options={programOptions}
                    loading={programsLoading}
                    showSearch
                    optionFilterProp="label"
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                    disabled={!!initialValues}
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  Musteri <span className="text-red-500">*</span>
                </label>
                <Form.Item
                  name="customerId"
                  rules={[{ required: true, message: 'Musteri secimi zorunludur' }]}
                  className="mb-0"
                >
                  <Select
                    placeholder="Musteri secin"
                    options={customerOptions}
                    loading={customersLoading}
                    showSearch
                    optionFilterProp="label"
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                    disabled={!!initialValues}
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* PUAN BILGILERI (only for edit) */}
          {initialValues && (
            <div className="mb-8">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                Puan Bilgileri
              </h3>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-3">
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Mevcut Puan</label>
                  <Form.Item name="currentPoints" className="mb-0">
                    <InputNumber
                      placeholder="0"
                      className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                      min={0}
                    />
                  </Form.Item>
                </div>
                <div className="col-span-3">
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Omur Boyu Puan</label>
                  <Form.Item name="lifetimePoints" className="mb-0">
                    <InputNumber
                      placeholder="0"
                      className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                      min={0}
                    />
                  </Form.Item>
                </div>
                <div className="col-span-3">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <div className="text-xl font-semibold text-slate-800">
                      {initialValues?.totalPointsEarned || 0}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Toplam Kazanilan</div>
                  </div>
                </div>
                <div className="col-span-3">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <div className="text-xl font-semibold text-slate-800">
                      {initialValues?.totalPointsRedeemed || 0}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Toplam Kullanilan</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* NOTLAR */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Notlar
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Notlar</label>
                <Form.Item name="notes" className="mb-0">
                  <Input.TextArea
                    placeholder="Uyelik hakkinda notlar..."
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
