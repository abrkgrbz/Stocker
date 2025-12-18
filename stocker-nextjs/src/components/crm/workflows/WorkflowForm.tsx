'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, Select, Switch, Alert } from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';
import type { WorkflowDto } from '@/lib/api/services/crm.types';

const { TextArea } = Input;

// Entity types from backend
const entityTypes = [
  { value: 'Account', label: 'Hesap' },
  { value: 'Contact', label: 'İletişim' },
  { value: 'Customer', label: 'Müşteri' },
  { value: 'Lead', label: 'Potansiyel Müşteri' },
  { value: 'Opportunity', label: 'Fırsat' },
  { value: 'Deal', label: 'Anlaşma' },
  { value: 'Quote', label: 'Teklif' },
  { value: 'Contract', label: 'Sözleşme' },
  { value: 'Ticket', label: 'Destek Talebi' },
  { value: 'Campaign', label: 'Kampanya' },
];

// Trigger type options
const triggerTypeOptions = [
  { value: 'Manual', label: 'Manuel' },
  { value: 'Scheduled', label: 'Zamanlanmış' },
  { value: 'OnCreate', label: 'Kayıt Oluşturulduğunda' },
  { value: 'OnUpdate', label: 'Kayıt Güncellendiğinde' },
  { value: 'OnStatusChange', label: 'Durum Değiştiğinde' },
];

interface WorkflowFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: WorkflowDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function WorkflowForm({ form, initialValues, onFinish, loading }: WorkflowFormProps) {
  const [isActive, setIsActive] = useState(false);
  const [selectedTriggerType, setSelectedTriggerType] = useState<string>('Manual');

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        name: initialValues.name,
        description: initialValues.description,
        triggerType: initialValues.triggerType,
        entityType: initialValues.entityType,
        isActive: initialValues.isActive,
      });
      setIsActive(initialValues.isActive ?? false);
      setSelectedTriggerType(initialValues.triggerType || 'Manual');
    } else {
      form.setFieldsValue({
        triggerType: 'Manual',
        isActive: false,
      });
    }
  }, [form, initialValues]);

  const handleTriggerTypeChange = (value: string) => {
    setSelectedTriggerType(value);
    if (value === 'Manual' || value === 'Scheduled') {
      form.setFieldsValue({ entityType: undefined });
    }
  };

  const requiresEntityType = (triggerType: string) => {
    return !['Manual', 'Scheduled'].includes(triggerType);
  };

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
            HEADER: Icon + Name + Status
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Workflow Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <ThunderboltOutlined className="text-xl text-slate-500" />
              </div>
            </div>

            {/* Workflow Name - Title Style */}
            <div className="flex-1">
              <Form.Item
                name="name"
                rules={[
                  { required: true, message: 'İş akışı adı zorunludur' },
                  { min: 3, message: 'En az 3 karakter olmalıdır' },
                  { max: 100, message: 'En fazla 100 karakter olabilir' },
                ]}
                className="mb-0"
              >
                <Input
                  placeholder="Workflow Adı Girin..."
                  variant="borderless"
                  className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
                />
              </Form.Item>
              <Form.Item
                name="description"
                rules={[
                  { required: true, message: 'Açıklama zorunludur' },
                  { min: 10, message: 'En az 10 karakter olmalıdır' },
                  { max: 500, message: 'En fazla 500 karakter olabilir' },
                ]}
                className="mb-0 mt-1"
              >
                <Input
                  placeholder="Workflow'un ne yaptığını açıklayın..."
                  variant="borderless"
                  className="!text-sm !text-slate-500 !p-0 placeholder:!text-slate-400"
                />
              </Form.Item>
            </div>

            {/* Status Toggle */}
            <div className="flex-shrink-0">
              <div className="flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-lg">
                <span className="text-sm font-medium text-slate-600">
                  {isActive ? 'Aktif' : 'Taslak'}
                </span>
                <Form.Item name="isActive" valuePropName="checked" noStyle initialValue={false}>
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

          {/* ─────────────── TETİKLEYİCİ AYARLARI ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Tetikleyici Ayarları
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Tetikleyici Tipi <span className="text-red-500">*</span></label>
                <Form.Item
                  name="triggerType"
                  rules={[{ required: true, message: 'Tetikleyici tipi seçimi zorunludur' }]}
                  className="mb-0"
                >
                  <Select
                    placeholder="Tetikleyici tipi seçin"
                    options={triggerTypeOptions}
                    onChange={handleTriggerTypeChange}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              {requiresEntityType(selectedTriggerType) && (
                <div className="col-span-6">
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Entity Tipi <span className="text-red-500">*</span></label>
                  <Form.Item
                    name="entityType"
                    rules={[{ required: true, message: 'Entity tipi seçimi zorunludur' }]}
                    className="mb-0"
                  >
                    <Select
                      placeholder="Entity tipi seçin"
                      options={entityTypes}
                      allowClear
                      showSearch
                      optionFilterProp="label"
                      className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                    />
                  </Form.Item>
                </div>
              )}
            </div>
          </div>

          {/* ─────────────── BİLGİ NOTU ─────────────── */}
          <div>
            <Alert
              type="info"
              message="Bilgi"
              description="Workflow oluşturduktan sonra detay sayfasından tetikleyici koşullarını ve aksiyonları yapılandırabilirsiniz."
              showIcon
              className="!bg-slate-50 !border-slate-200"
            />
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
