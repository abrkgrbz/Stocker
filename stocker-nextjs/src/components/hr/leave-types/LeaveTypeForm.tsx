'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Switch } from 'antd';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import type { LeaveTypeDto } from '@/lib/api/services/hr.types';

const { TextArea } = Input;

interface LeaveTypeFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: LeaveTypeDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function LeaveTypeForm({ form, initialValues, onFinish, loading }: LeaveTypeFormProps) {
  const [isActive, setIsActive] = useState(true);
  const [isPaid, setIsPaid] = useState(true);
  const [requiresApproval, setRequiresApproval] = useState(true);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
      setIsActive(initialValues.isActive ?? true);
      setIsPaid(initialValues.isPaid ?? true);
      setRequiresApproval(initialValues.requiresApproval ?? true);
    }
  }, [form, initialValues]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      disabled={loading}
      initialValues={{ isActive: true, isPaid: true, requiresApproval: true, defaultDays: 0 }}
      className="w-full"
      scrollToFirstError={{ behavior: 'smooth', block: 'center' }}
    >
      {/* Main Card */}
      <div className="bg-white border border-slate-200 rounded-xl">

        {/* HEADER */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <DocumentTextIcon className="w-6 h-6 text-slate-500" />
              </div>
            </div>

            {/* Title */}
            <div className="flex-1">
              <Form.Item
                name="name"
                rules={[
                  { required: true, message: 'Izin turu adi zorunludur' },
                  { max: 200, message: 'En fazla 200 karakter' },
                ]}
                className="mb-0"
              >
                <Input
                  placeholder="Izin Turu Adi Girin..."
                  variant="borderless"
                  className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
                />
              </Form.Item>
              <Form.Item name="description" className="mb-0 mt-1">
                <Input
                  placeholder="Izin turu aciklamasi..."
                  variant="borderless"
                  className="!text-sm !text-slate-500 !p-0 placeholder:!text-slate-400"
                />
              </Form.Item>
            </div>

            {/* Status Toggle */}
            <div className="flex-shrink-0">
              <div className="flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-lg">
                <span className="text-sm font-medium text-slate-600">
                  {isActive ? 'Aktif' : 'Pasif'}
                </span>
                <Form.Item name="isActive" valuePropName="checked" noStyle>
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

        {/* FORM BODY */}
        <div className="px-8 py-6">

          {/* TEMEL BILGILER */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Temel Bilgiler
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Izin Turu Kodu <span className="text-red-500">*</span></label>
                <Form.Item
                  name="code"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-0"
                >
                  <Input
                    placeholder="Orn: YILLIK, HASTALIK"
                    disabled={!!initialValues}
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Varsayilan Gun <span className="text-red-500">*</span></label>
                <Form.Item
                  name="defaultDays"
                  rules={[{ required: true, message: 'Gerekli' }]}
                  className="mb-0"
                >
                  <InputNumber
                    placeholder="0"
                    style={{ width: '100%' }}
                    min={0}
                    max={365}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Varsayilan gun sayisi, her calisana yillik olarak taninan izin hakkidir
            </p>
          </div>

          {/* AYARLAR */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Ayarlar
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-sm font-medium text-slate-700">Ucretli</span>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {isPaid ? 'Ucretli izin' : 'Ucretsiz izin'}
                    </div>
                  </div>
                  <Form.Item name="isPaid" valuePropName="checked" noStyle>
                    <Switch
                      checked={isPaid}
                      onChange={(val) => {
                        setIsPaid(val);
                        form.setFieldValue('isPaid', val);
                      }}
                      checkedChildren="Evet"
                      unCheckedChildren="Hayir"
                    />
                  </Form.Item>
                </div>
              </div>
              <div className="col-span-6">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-sm font-medium text-slate-700">Onay Gerekli</span>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {requiresApproval ? 'Onay sureci var' : 'Onay gerekmez'}
                    </div>
                  </div>
                  <Form.Item name="requiresApproval" valuePropName="checked" noStyle>
                    <Switch
                      checked={requiresApproval}
                      onChange={(val) => {
                        setRequiresApproval(val);
                        form.setFieldValue('requiresApproval', val);
                      }}
                      checkedChildren="Evet"
                      unCheckedChildren="Hayir"
                    />
                  </Form.Item>
                </div>
              </div>
            </div>
          </div>

          {/* Bilgi Kutusu */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm font-medium text-blue-700 mb-1">Bilgi</div>
            <div className="text-xs text-blue-600">
              Izin turu olusturulduktan sonra kod alani degistirilemez.
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
