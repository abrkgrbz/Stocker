'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, Select, InputNumber, Switch } from 'antd';
import { TeamOutlined, UserOutlined, MailOutlined } from '@ant-design/icons';
import type { SalesTeamDto } from '@/lib/api/services/crm.types';
import { useTerritories } from '@/lib/api/hooks/useCRM';

const { TextArea } = Input;

// Target period options
const targetPeriodOptions = [
  { value: 'Monthly', label: 'Aylık' },
  { value: 'Quarterly', label: 'Çeyreklik' },
  { value: 'Yearly', label: 'Yıllık' },
];

// Communication channel options
const communicationChannelOptions = [
  { value: 'Slack', label: 'Slack' },
  { value: 'Teams', label: 'Microsoft Teams' },
  { value: 'Email', label: 'E-posta' },
  { value: 'WhatsApp', label: 'WhatsApp' },
  { value: 'Other', label: 'Diğer' },
];

interface SalesTeamFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: SalesTeamDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function SalesTeamForm({ form, initialValues, onFinish, loading }: SalesTeamFormProps) {
  const [isActive, setIsActive] = useState(true);
  const { data: territories = [] } = useTerritories({ pageSize: 100, isActive: true });

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
      });
      setIsActive(initialValues.isActive ?? true);
    } else {
      form.setFieldsValue({
        isActive: true,
        targetPeriod: 'Monthly',
        currency: 'TRY',
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
    >
      {/* Main Card */}
      <div className="bg-white border border-slate-200 rounded-xl">

        {/* ═══════════════════════════════════════════════════════════════
            HEADER: Icon + Name + Status
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Team Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <TeamOutlined className="text-xl text-slate-500" />
              </div>
            </div>

            {/* Team Name - Title Style */}
            <div className="flex-1">
              <Form.Item
                name="name"
                rules={[
                  { required: true, message: '' },
                  { max: 100, message: '' },
                ]}
                className="mb-0"
              >
                <Input
                  placeholder="Ekip Adı Girin..."
                  variant="borderless"
                  className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
                />
              </Form.Item>
              <Form.Item name="description" className="mb-0 mt-1">
                <Input
                  placeholder="Ekip hakkında kısa not..."
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

          {/* ─────────────── EKİP BİLGİLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Ekip Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Ekip Kodu <span className="text-red-500">*</span></label>
                <Form.Item
                  name="code"
                  rules={[
                    { required: true, message: '' },
                    { max: 20, message: '' },
                  ]}
                  className="mb-0"
                >
                  <Input
                    placeholder="SALES-01"
                    maxLength={20}
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Ekip E-postası</label>
                <Form.Item name="teamEmail" className="mb-0">
                  <Input
                    placeholder="satis@firma.com"
                    prefix={<MailOutlined className="text-slate-400" />}
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── EKİP LİDERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Ekip Lideri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Lider Adı</label>
                <Form.Item name="teamLeaderName" className="mb-0">
                  <Input
                    placeholder="—"
                    prefix={<UserOutlined className="text-slate-400" />}
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── SATIŞ HEDEFLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Satış Hedefleri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Satış Hedefi (₺)</label>
                <Form.Item name="salesTarget" className="mb-0">
                  <InputNumber
                    placeholder="500.000"
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value?.replace(/,/g, '') as any}
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Hedef Periyodu</label>
                <Form.Item name="targetPeriod" className="mb-0" initialValue="Monthly">
                  <Select
                    placeholder="Periyot seçin"
                    options={targetPeriodOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── BÖLGE VE İLETİŞİM ─────────────── */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Bölge ve İletişim
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Bölge</label>
                <Form.Item name="territoryId" className="mb-0">
                  <Select
                    placeholder="Bölge seçin"
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    options={(territories || []).map(t => ({ value: t.id, label: t.name }))}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">İletişim Kanalı</label>
                <Form.Item name="communicationChannel" className="mb-0">
                  <Select
                    placeholder="Kanal seçin"
                    options={communicationChannelOptions}
                    allowClear
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
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
