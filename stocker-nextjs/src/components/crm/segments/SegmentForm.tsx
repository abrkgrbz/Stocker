'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, Switch, ColorPicker, Segmented } from 'antd';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import type { CustomerSegment } from '@/lib/api/services/crm.service';
import { RuleBuilder } from './RuleBuilder';

const { TextArea } = Input;

// Preset colors
const PRESET_COLORS = [
  '#1890ff',
  '#52c41a',
  '#faad14',
  '#f5222d',
  '#722ed1',
  '#13c2c2',
  '#eb2f96',
  '#fa8c16',
];

interface SegmentFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: CustomerSegment;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function SegmentForm({ form, initialValues, onFinish, loading }: SegmentFormProps) {
  const [isActive, setIsActive] = useState(true);
  const [segmentType, setSegmentType] = useState<'Static' | 'Dynamic'>('Static');

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
      setIsActive(initialValues.isActive ?? true);
      setSegmentType((initialValues.type as 'Static' | 'Dynamic') || 'Static');
    } else {
      form.setFieldsValue({
        type: 'Static',
        isActive: true,
        color: '#1890ff',
      });
    }
  }, [form, initialValues]);

  const handleFormFinish = (values: any) => {
    if (values.color && typeof values.color === 'object') {
      values.color = values.color.toHexString();
    }
    onFinish(values);
  };

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
            {/* Segment Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <UserGroupIcon className="w-6 h-6 text-slate-500" />
              </div>
            </div>

            {/* Segment Name - Title Style */}
            <div className="flex-1">
              <Form.Item
                name="name"
                rules={[
                  { required: true, message: 'Segment adı zorunludur' },
                  { max: 100, message: 'En fazla 100 karakter olabilir' },
                ]}
                className="mb-0"
              >
                <Input
                  placeholder="Segment Adı Girin..."
                  variant="borderless"
                  className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
                />
              </Form.Item>
              <Form.Item name="description" className="mb-0 mt-1">
                <Input
                  placeholder="Segment hakkında kısa not..."
                  variant="borderless"
                  className="!text-sm !text-slate-500 !p-0 placeholder:!text-slate-400"
                />
              </Form.Item>
            </div>

            {/* Type Selector */}
            <div className="flex-shrink-0">
              <Form.Item name="type" className="mb-0" initialValue="Static">
                <Segmented
                  options={[
                    { value: 'Static', label: 'Statik' },
                    { value: 'Dynamic', label: 'Dinamik' },
                  ]}
                  value={segmentType}
                  onChange={(val) => {
                    setSegmentType(val as 'Static' | 'Dynamic');
                    form.setFieldValue('type', val);
                  }}
                  className="!bg-slate-100"
                />
              </Form.Item>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            FORM BODY: High-Density Grid Layout
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6">

          {/* ─────────────── SEGMENT AYARLARI ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Segment Ayarları
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Segment Rengi</label>
                <Form.Item name="color" className="mb-0" initialValue="#1890ff">
                  <ColorPicker
                    showText
                    format="hex"
                    presets={[
                      {
                        label: 'Önerilen',
                        colors: PRESET_COLORS,
                      },
                    ]}
                    onChange={(color) => {
                      const hexColor = color.toHexString();
                      setSelectedColor(hexColor);
                      form.setFieldValue('color', hexColor);
                    }}
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Durum</label>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <div className="text-sm text-slate-700">
                      {isActive ? 'Segment aktif' : 'Segment pasif'}
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

          {/* ─────────────── SEGMENT KRİTERLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Segment Kriterleri
            </h3>

            {segmentType === 'Dynamic' ? (
              <>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                  <h4 className="font-medium text-blue-900 mb-1">Dinamik Segment</h4>
                  <p className="text-sm text-blue-800">
                    Kriterlere uyan müşteriler otomatik olarak eklenir/çıkarılır.
                  </p>
                </div>

                <Form.Item
                  name="criteria"
                  rules={[{ required: segmentType === 'Dynamic', message: 'Dinamik segment için kriter zorunludur' }]}
                >
                  <RuleBuilder />
                </Form.Item>
              </>
            ) : (
              <>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <h4 className="font-medium text-slate-700 mb-1">Statik Segment</h4>
                  <p className="text-sm text-slate-600">
                    Müşterileri manuel olarak ekleyeceksiniz. Segment oluşturduktan sonra müşteri listesinden
                    istediğiniz müşterileri bu segmente ekleyebilirsiniz.
                  </p>
                </div>

                <Form.Item name="criteria" initialValue="{}" hidden>
                  <Input type="hidden" />
                </Form.Item>
              </>
            )}
          </div>

          {/* ─────────────── BİLGİ NOTU ─────────────── */}
          {segmentType === 'Dynamic' && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h4 className="font-medium text-amber-900 mb-1">Güncelleme Bilgisi</h4>
              <p className="text-sm text-amber-800">
                Dinamik segmentler her gün otomatik olarak güncellenir. Kriterlere uyan yeni müşteriler
                eklenir, uymayanlar çıkarılır.
              </p>
            </div>
          )}

        </div>
      </div>

      {/* Hidden submit */}
      <Form.Item hidden>
        <button type="submit" />
      </Form.Item>
    </Form>
  );
}
