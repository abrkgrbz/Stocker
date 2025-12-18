'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, Switch } from 'antd';
import { TrademarkOutlined, LinkOutlined } from '@ant-design/icons';
import type { BrandDto } from '@/lib/api/services/inventory.types';

const { TextArea } = Input;

interface BrandFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: BrandDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function BrandForm({ form, initialValues, onFinish, loading }: BrandFormProps) {
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
      setIsActive(initialValues.isActive ?? true);
    }
  }, [form, initialValues]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      disabled={loading}
      className="w-full"
    >
      {/* Main Card */}
      <div className="bg-white border border-slate-200 rounded-xl">

        {/* ═══════════════════════════════════════════════════════════════
            HEADER: Icon + Name + Status Toggle
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Brand Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <TrademarkOutlined className="text-xl text-slate-500" />
              </div>
            </div>

            {/* Brand Name - Title Style */}
            <div className="flex-1">
              <Form.Item
                name="name"
                rules={[
                  { required: true, message: '' },
                  { max: 200, message: '' },
                ]}
                className="mb-0"
              >
                <Input
                  placeholder="Marka Adı Girin..."
                  variant="borderless"
                  className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
                />
              </Form.Item>
              <Form.Item name="description" className="mb-0 mt-1">
                <Input
                  placeholder="Marka hakkında kısa açıklama..."
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
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Marka Kodu <span className="text-red-500">*</span></label>
                <Form.Item
                  name="code"
                  rules={[{ required: true, message: '' }]}
                  className="mb-0"
                >
                  <Input
                    placeholder="BRD-001"
                    disabled={!!initialValues}
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              {initialValues && (
                <div className="col-span-6">
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Ürün Sayısı</label>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 font-medium">
                    {initialValues.productCount || 0} ürün
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ─────────────── WEB & MEDYA ─────────────── */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Web & Medya
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Web Sitesi</label>
                <Form.Item name="website" className="mb-0">
                  <Input
                    placeholder="https://www.example.com"
                    prefix={<LinkOutlined className="text-slate-400" />}
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Logo URL</label>
                <Form.Item name="logoUrl" className="mb-0">
                  <Input
                    placeholder="https://www.example.com/logo.png"
                    prefix={<LinkOutlined className="text-slate-400" />}
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
