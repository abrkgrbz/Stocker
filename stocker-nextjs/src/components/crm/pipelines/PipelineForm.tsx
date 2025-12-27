'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Select, Switch, Button, Card, Tag } from 'antd';
import {
  FunnelIcon,
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import type { Pipeline } from '@/lib/api/services/crm.service';

const { TextArea } = Input;

// Stage color options
const STAGE_COLORS = [
  { value: '#1890ff', label: 'Mavi' },
  { value: '#52c41a', label: 'Yeşil' },
  { value: '#faad14', label: 'Turuncu' },
  { value: '#f5222d', label: 'Kırmızı' },
  { value: '#722ed1', label: 'Mor' },
  { value: '#13c2c2', label: 'Cyan' },
  { value: '#eb2f96', label: 'Pembe' },
  { value: '#fa8c16', label: 'Gold' },
];

// Pipeline type options
const pipelineTypeOptions = [
  { value: 'Sales', label: 'Satış' },
  { value: 'Lead', label: 'Potansiyel Müşteri' },
  { value: 'Deal', label: 'Fırsat' },
  { value: 'Custom', label: 'Özel' },
];

// Default stages for new pipelines
const DEFAULT_STAGES = [
  { name: 'Yeni Fırsat', probability: 10, color: '#1890ff', isWon: false, isLost: false },
  { name: 'Teklif Hazırlama', probability: 30, color: '#52c41a', isWon: false, isLost: false },
  { name: 'Müzakere', probability: 60, color: '#faad14', isWon: false, isLost: false },
  { name: 'Kazanıldı', probability: 100, color: '#52c41a', isWon: true, isLost: false },
];

interface PipelineFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: Pipeline;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function PipelineForm({ form, initialValues, onFinish, loading }: PipelineFormProps) {
  const [isActive, setIsActive] = useState(true);
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
      setIsActive(initialValues.isActive ?? true);
      setIsDefault((initialValues as any).isDefault ?? false);
    } else {
      form.setFieldsValue({
        type: 'Deal',
        isActive: true,
        isDefault: false,
        stages: DEFAULT_STAGES,
      });
    }
  }, [form, initialValues]);

  const handleFormFinish = (values: any) => {
    if (values.stages) {
      values.stages = values.stages.map((stage: any, index: number) => ({
        ...stage,
        order: index + 1,
        color: stage.color || '#1890ff',
      }));
    }
    onFinish(values);
  };

  const handleUseDefaultStages = () => {
    form.setFieldsValue({ stages: DEFAULT_STAGES });
  };

  // Watch stages for statistics
  const stages = Form.useWatch('stages', form) || [];
  const stageCount = stages.length;
  const wonStage = stages.find((s: any) => s?.isWon);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFormFinish}
      disabled={loading}
      className="w-full"
      scrollToFirstError={{ behavior: 'smooth', block: 'center' }}
    >
      {/* Main Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">

        {/* ═══════════════════════════════════════════════════════════════
            HEADER: Icon + Name + Type Selector
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Pipeline Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <FunnelIcon className="w-5 h-5 text-slate-500" />
              </div>
            </div>

            {/* Pipeline Name - Title Style */}
            <div className="flex-1">
              <Form.Item
                name="name"
                rules={[
                  { required: true, message: 'Pipeline adı zorunludur' },
                  { max: 100, message: 'En fazla 100 karakter olabilir' },
                ]}
                className="mb-0"
              >
                <Input
                  placeholder="Pipeline Adı Girin..."
                  variant="borderless"
                  className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
                />
              </Form.Item>
              <Form.Item name="description" className="mb-0 mt-1">
                <Input
                  placeholder="Pipeline hakkında kısa not..."
                  variant="borderless"
                  className="!text-sm !text-slate-500 !p-0 placeholder:!text-slate-400"
                />
              </Form.Item>
            </div>

            {/* Type Selector */}
            <div className="flex-shrink-0">
              <Form.Item name="type" className="mb-0" initialValue="Deal">
                <Select
                  options={pipelineTypeOptions}
                  className="w-40 [&_.ant-select-selector]:!bg-slate-100 [&_.ant-select-selector]:!border-0 [&_.ant-select-selector]:!rounded-lg"
                />
              </Form.Item>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            FORM BODY: High-Density Grid Layout
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6">

          {/* ─────────────── DURUM AYARLARI ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Durum Ayarları
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <div className="text-sm font-medium text-slate-700">Durum</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {isActive ? 'Pipeline aktif' : 'Pipeline pasif'}
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
              <div className="col-span-6">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <div className="text-sm font-medium text-slate-700">Varsayılan</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Yeni kayıtlarda kullanılsın
                    </div>
                  </div>
                  <Form.Item name="isDefault" valuePropName="checked" noStyle initialValue={false}>
                    <Switch
                      checked={isDefault}
                      onChange={(val) => {
                        setIsDefault(val);
                        form.setFieldValue('isDefault', val);
                      }}
                      checkedChildren="Evet"
                      unCheckedChildren="Hayır"
                    />
                  </Form.Item>
                </div>
              </div>
            </div>
          </div>

          {/* ─────────────── PIPELINE AŞAMALARI ─────────────── */}
          <div className="mb-8">
            <div className="flex justify-between items-center pb-2 mb-4 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Pipeline Aşamaları ({stageCount} aşama{wonStage ? ' • Kazanıldı aşaması var' : ''})
              </h3>
              <Button size="small" type="link" onClick={handleUseDefaultStages} className="!text-slate-500 hover:!text-slate-700">
                Varsayılan Aşamaları Kullan
              </Button>
            </div>

            <Form.List
              name="stages"
              rules={[
                {
                  validator: async (_, stages) => {
                    if (!stages || stages.length === 0) {
                      return Promise.reject(new Error('En az 1 aşama eklemelisiniz'));
                    }
                  },
                },
              ]}
            >
              {(fields, { add, remove }) => (
                <>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {fields.map((field, index) => (
                      <div
                        key={field.key}
                        className="p-4 bg-slate-50 rounded-lg border border-slate-200"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <Tag color="blue" className="!m-0">#{index + 1}</Tag>
                          <span className="text-sm font-medium text-slate-700">
                            {stages[field.name]?.name || `Aşama ${index + 1}`}
                          </span>
                          {fields.length > 1 && (
                            <Button
                              type="text"
                              danger
                              size="small"
                              icon={<TrashIcon className="w-4 h-4" />}
                              onClick={() => remove(field.name)}
                              className="ml-auto"
                            />
                          )}
                        </div>

                        <div className="grid grid-cols-12 gap-3">
                          <div className="col-span-5">
                            <Form.Item
                              {...field}
                              name={[field.name, 'name']}
                              rules={[{ required: true, message: 'Aşama adı zorunludur' }]}
                              className="mb-0"
                            >
                              <Input
                                placeholder="Aşama adı"
                                className="!bg-white !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!bg-white"
                              />
                            </Form.Item>
                          </div>
                          <div className="col-span-3">
                            <Form.Item
                              {...field}
                              name={[field.name, 'probability']}
                              rules={[{ required: true, message: 'Olasılık zorunludur' }]}
                              className="mb-0"
                            >
                              <InputNumber
                                placeholder="%"
                                min={0}
                                max={100}
                                className="!w-full [&.ant-input-number]:!bg-white [&.ant-input-number]:!border-slate-300"
                                addonAfter="%"
                              />
                            </Form.Item>
                          </div>
                          <div className="col-span-4">
                            <Form.Item
                              {...field}
                              name={[field.name, 'color']}
                              initialValue="#1890ff"
                              className="mb-0"
                            >
                              <Select className="w-full [&_.ant-select-selector]:!bg-white [&_.ant-select-selector]:!border-slate-300">
                                {STAGE_COLORS.map((c) => (
                                  <Select.Option key={c.value} value={c.value}>
                                    <div className="flex items-center gap-2">
                                      <div className="w-3 h-3 rounded" style={{ backgroundColor: c.value }} />
                                      {c.label}
                                    </div>
                                  </Select.Option>
                                ))}
                              </Select>
                            </Form.Item>
                          </div>
                        </div>

                        <div className="flex gap-4 mt-3">
                          <Form.Item
                            {...field}
                            name={[field.name, 'isWon']}
                            valuePropName="checked"
                            className="mb-0"
                          >
                            <div className="flex items-center gap-2 px-3 py-1.5 border rounded-lg bg-green-50 border-green-200">
                              <Switch size="small" checked={stages[field.name]?.isWon} onChange={(val) => {
                                const newStages = [...stages];
                                newStages[field.name] = { ...newStages[field.name], isWon: val, isLost: val ? false : newStages[field.name]?.isLost };
                                form.setFieldsValue({ stages: newStages });
                              }} />
                              <span className="text-xs text-green-700">
                                <CheckCircleIcon className="w-3.5 h-3.5 inline mr-1" />
                                Kazanıldı
                              </span>
                            </div>
                          </Form.Item>

                          <Form.Item
                            {...field}
                            name={[field.name, 'isLost']}
                            valuePropName="checked"
                            className="mb-0"
                          >
                            <div className="flex items-center gap-2 px-3 py-1.5 border rounded-lg bg-red-50 border-red-200">
                              <Switch size="small" checked={stages[field.name]?.isLost} onChange={(val) => {
                                const newStages = [...stages];
                                newStages[field.name] = { ...newStages[field.name], isLost: val, isWon: val ? false : newStages[field.name]?.isWon };
                                form.setFieldsValue({ stages: newStages });
                              }} />
                              <span className="text-xs text-red-700">
                                <XCircleIcon className="w-3.5 h-3.5 inline mr-1" />
                                Kaybedildi
                              </span>
                            </div>
                          </Form.Item>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    type="dashed"
                    onClick={() => add({ name: '', probability: 50, color: '#1890ff', isWon: false, isLost: false })}
                    block
                    icon={<PlusIcon className="w-4 h-4" />}
                    className="mt-3 !border-slate-300 !text-slate-600 hover:!border-slate-400 hover:!text-slate-700"
                  >
                    Yeni Aşama Ekle
                  </Button>
                </>
              )}
            </Form.List>
          </div>

        </div>
      </div>

      {/* Hidden submit */}
      <Form.Item hidden>
        <button type="submit" />
      </Form.Item>
    </Form>
  );
}
