'use client';

import React, { useState } from 'react';
import { Drawer, Form, Input, Select } from 'antd';
import {
  ThunderboltOutlined,
  CloseOutlined,
  ArrowRightOutlined,
  ClockCircleOutlined,
  PlusCircleOutlined,
  EditOutlined,
  SyncOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { WorkflowTriggerType } from '@/lib/api/services/crm.types';

const { TextArea } = Input;

interface CreateWorkflowDrawerProps {
  open: boolean;
  onClose: () => void;
  onNext: (values: Step1FormData) => void;
}

export interface Step1FormData {
  name: string;
  description: string;
  status: 'draft' | 'active' | 'inactive';
  triggerType: WorkflowTriggerType;
  entityType?: string;
}

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

// Trigger types with icons and descriptions
const triggerTypes = [
  {
    value: 'Manual',
    label: 'Manuel',
    description: 'Elle başlatılır',
    icon: <UserOutlined />,
    color: 'bg-slate-50 text-slate-600',
  },
  {
    value: 'Scheduled',
    label: 'Zamanlanmış',
    description: 'Belirli zamanlarda otomatik çalışır',
    icon: <ClockCircleOutlined />,
    color: 'bg-orange-50 text-orange-600',
  },
  {
    value: 'EntityCreated',
    label: 'Kayıt Oluşturulduğunda',
    description: 'Yeni kayıt eklendiğinde',
    icon: <PlusCircleOutlined />,
    color: 'bg-green-50 text-green-600',
  },
  {
    value: 'EntityUpdated',
    label: 'Kayıt Güncellendiğinde',
    description: 'Mevcut kayıt güncellendiğinde',
    icon: <EditOutlined />,
    color: 'bg-blue-50 text-blue-600',
  },
  {
    value: 'StatusChanged',
    label: 'Durum Değiştiğinde',
    description: 'Status alanı değiştiğinde',
    icon: <SyncOutlined />,
    color: 'bg-purple-50 text-purple-600',
  },
];

export default function CreateWorkflowDrawer({
  open,
  onClose,
  onNext,
}: CreateWorkflowDrawerProps) {
  const [form] = Form.useForm();
  const [selectedTriggerType, setSelectedTriggerType] = useState<string>('Manual');

  const handleTriggerTypeChange = (value: string) => {
    setSelectedTriggerType(value);
    // Reset entity type when trigger changes
    if (value === 'Manual' || value === 'Scheduled') {
      form.setFieldsValue({ entityType: undefined });
    }
  };

  const handleFinish = (values: Step1FormData) => {
    onNext(values);
  };

  const handleClose = () => {
    form.resetFields();
    setSelectedTriggerType('Manual');
    onClose();
  };

  const requiresEntityType = (triggerType: string) => {
    return !['Manual', 'Scheduled'].includes(triggerType);
  };

  const selectedTrigger = triggerTypes.find((t) => t.value === selectedTriggerType);

  return (
    <Drawer
      title={null}
      width={640}
      open={open}
      onClose={handleClose}
      closable={false}
      styles={{
        header: { display: 'none' },
        body: { padding: 0 },
      }}
    >
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
              <ThunderboltOutlined className="text-white text-lg" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Yeni Workflow</h2>
              <p className="text-sm text-slate-500">Adım 1/3 - Temel Bilgiler</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <CloseOutlined />
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{
            status: 'draft',
            triggerType: 'Manual',
          }}
        >
          {/* Progress Steps */}
          <div className="flex items-center gap-2 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <span className="text-sm font-medium text-slate-900">Temel Bilgiler</span>
            </div>
            <div className="flex-1 h-px bg-slate-200 mx-2"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <span className="text-sm text-slate-400">Tetikleyici</span>
            </div>
            <div className="flex-1 h-px bg-slate-200 mx-2"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <span className="text-sm text-slate-400">Aksiyonlar</span>
            </div>
          </div>

          {/* Basic Info Section */}
          <div className="mb-8">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
              Temel Bilgiler
            </h3>
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
              <Form.Item
                name="name"
                label={<span className="text-sm font-medium text-slate-700">Workflow Adı</span>}
                rules={[
                  { required: true, message: 'Workflow adı zorunludur' },
                  { min: 3, message: 'En az 3 karakter olmalı' },
                  { max: 100, message: 'En fazla 100 karakter olabilir' },
                ]}
                className="mb-4"
              >
                <Input
                  placeholder="Örn: Müşteri hoş geldin e-postası"
                  className="!bg-slate-50 !border-slate-200 hover:!border-slate-300 focus:!border-slate-900 focus:!bg-white"
                />
              </Form.Item>

              <Form.Item
                name="description"
                label={<span className="text-sm font-medium text-slate-700">Açıklama</span>}
                rules={[
                  { required: true, message: 'Açıklama zorunludur' },
                  { min: 10, message: 'En az 10 karakter olmalı' },
                  { max: 500, message: 'En fazla 500 karakter olabilir' },
                ]}
                className="mb-0"
              >
                <TextArea
                  rows={3}
                  placeholder="Workflow'un ne yaptığını açıklayın"
                  className="!bg-slate-50 !border-slate-200 hover:!border-slate-300 focus:!border-slate-900 focus:!bg-white"
                />
              </Form.Item>
            </div>
          </div>

          {/* Status Section */}
          <div className="mb-8">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
              Başlangıç Durumu
            </h3>
            <Form.Item name="status" className="mb-0">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'draft', label: 'Taslak', desc: 'Test edilebilir', recommended: true },
                  { value: 'active', label: 'Aktif', desc: 'Hemen çalışır' },
                  { value: 'inactive', label: 'Pasif', desc: 'Devre dışı' },
                ].map((status) => (
                  <label
                    key={status.value}
                    className={`relative flex flex-col p-4 border rounded-xl cursor-pointer transition-all ${
                      form.getFieldValue('status') === status.value
                        ? 'border-slate-900 bg-slate-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={status.value}
                      checked={form.getFieldValue('status') === status.value}
                      onChange={() => form.setFieldValue('status', status.value)}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium text-slate-900">{status.label}</span>
                    <span className="text-xs text-slate-500 mt-0.5">{status.desc}</span>
                    {status.recommended && (
                      <span className="absolute top-2 right-2 text-[10px] font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                        Önerilen
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </Form.Item>
          </div>

          {/* Trigger Type Section */}
          <div className="mb-8">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
              Tetikleyici Tipi
            </h3>
            <Form.Item
              name="triggerType"
              rules={[{ required: true, message: 'Tetikleyici tipi zorunludur' }]}
              className="mb-4"
            >
              <div className="space-y-2">
                {triggerTypes.map((trigger) => (
                  <label
                    key={trigger.value}
                    className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${
                      selectedTriggerType === trigger.value
                        ? 'border-slate-900 bg-slate-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                    onClick={() => {
                      form.setFieldValue('triggerType', trigger.value);
                      handleTriggerTypeChange(trigger.value);
                    }}
                  >
                    <div className={`w-10 h-10 ${trigger.color} rounded-lg flex items-center justify-center`}>
                      {trigger.icon}
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-slate-900">{trigger.label}</span>
                      <p className="text-xs text-slate-500 mt-0.5">{trigger.description}</p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedTriggerType === trigger.value
                          ? 'border-slate-900 bg-slate-900'
                          : 'border-slate-300'
                      }`}
                    >
                      {selectedTriggerType === trigger.value && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </Form.Item>

            {/* Entity Type - Only for entity-based triggers */}
            {requiresEntityType(selectedTriggerType) && (
              <Form.Item
                name="entityType"
                label={<span className="text-sm font-medium text-slate-700">Entity Tipi</span>}
                rules={[{ required: true, message: 'Entity tipi zorunludur' }]}
                className="mt-4"
              >
                <Select
                  placeholder="Workflow'un çalışacağı entity tipini seçin"
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  options={entityTypes}
                  className="[&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-200 [&_.ant-select-selector:hover]:!border-slate-300 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                />
              </Form.Item>
            )}
          </div>

          {/* Info Box */}
          {selectedTrigger && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 ${selectedTrigger.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  {selectedTrigger.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{selectedTrigger.label}</p>
                  <p className="text-xs text-slate-600 mt-1">
                    {selectedTriggerType === 'Manual' &&
                      'Bu workflow otomatik çalışmaz. Kullanıcı tarafından manuel olarak başlatılması gerekir.'}
                    {selectedTriggerType === 'Scheduled' &&
                      'Bir sonraki adımda workflow\'un ne zaman çalışacağını ayarlayacaksınız.'}
                    {selectedTriggerType === 'EntityCreated' &&
                      'Seçilen entity tipinde yeni bir kayıt oluşturulduğunda workflow çalışır.'}
                    {selectedTriggerType === 'EntityUpdated' &&
                      'Seçilen entity tipindeki bir kayıt güncellendiğinde workflow çalışır.'}
                    {selectedTriggerType === 'StatusChanged' &&
                      'Seçilen entity\'nin Status alanı değiştiğinde workflow çalışır.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </Form>
      </div>

      {/* Sticky Footer */}
      <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            İptal
          </button>
          <button
            onClick={() => form.submit()}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            İleri: Tetikleyiciyi Yapılandır
            <ArrowRightOutlined />
          </button>
        </div>
      </div>
    </Drawer>
  );
}
