'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, DatePicker, InputNumber, Switch } from 'antd';
import { BookOpenIcon } from '@heroicons/react/24/outline';
import type { TrainingDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { RangePicker } = DatePicker;

interface TrainingFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: TrainingDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

export default function TrainingForm({ form, initialValues, onFinish, loading }: TrainingFormProps) {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        dateRange: initialValues.startDate && initialValues.endDate
          ? [dayjs(initialValues.startDate), dayjs(initialValues.endDate)]
          : undefined,
      });
      setIsOnline(initialValues.isOnline || false);
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

        {/* ═══════════════════════════════════════════════════════════════
            HEADER: Icon + Name + Online Toggle
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Training Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <BookOpenIcon className="w-6 h-6 text-slate-500" />
              </div>
            </div>

            {/* Training Title - Title Style */}
            <div className="flex-1">
              <Form.Item
                name="title"
                rules={[
                  { required: true, message: 'Eğitim başlığı zorunludur' },
                  { max: 200, message: 'Eğitim başlığı en fazla 200 karakter olabilir' },
                ]}
                className="mb-0"
              >
                <Input
                  placeholder="Eğitim Başlığı Girin..."
                  variant="borderless"
                  className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
                />
              </Form.Item>
              <Form.Item name="description" className="mb-0 mt-1">
                <Input
                  placeholder="Eğitim hakkında kısa açıklama..."
                  variant="borderless"
                  className="!text-sm !text-slate-500 !p-0 placeholder:!text-slate-400"
                />
              </Form.Item>
            </div>

            {/* Online Toggle */}
            <div className="flex-shrink-0">
              <div className="flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-lg">
                <span className="text-sm font-medium text-slate-600">
                  {isOnline ? 'Online' : 'Yüz Yüze'}
                </span>
                <Form.Item name="isOnline" valuePropName="checked" noStyle initialValue={false}>
                  <Switch
                    checked={isOnline}
                    onChange={(val) => {
                      setIsOnline(val);
                      form.setFieldValue('isOnline', val);
                      if (!val) {
                        form.setFieldValue('onlineUrl', undefined);
                      }
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

          {/* ─────────────── SAĞLAYICI VE EĞİTMEN ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Sağlayıcı ve Eğitmen
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Eğitim Sağlayıcısı</label>
                <Form.Item name="provider" className="mb-0">
                  <Input
                    placeholder="Şirket adı"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Eğitmen</label>
                <Form.Item name="instructor" className="mb-0">
                  <Input
                    placeholder="Eğitmen adı"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Konum</label>
                <Form.Item name="location" className="mb-0">
                  <Input
                    placeholder="Eğitim yeri"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Eğitim Türü</label>
                <Form.Item name="trainingType" className="mb-0">
                  <Input
                    placeholder="Teknik, Davranışsal, vb."
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              {isOnline && (
                <div className="col-span-12">
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Online Eğitim URL'si <span className="text-red-500">*</span></label>
                  <Form.Item
                    name="onlineUrl"
                    className="mb-0"
                    rules={[
                      { required: isOnline, message: 'Online eğitimler için URL zorunludur' },
                      { type: 'url', message: 'Geçerli bir URL giriniz' },
                    ]}
                  >
                    <Input
                      placeholder="https://zoom.us/j/..."
                      className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                    />
                  </Form.Item>
                </div>
              )}
            </div>
          </div>

          {/* ─────────────── ZAMANLAMA ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Zamanlama
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Eğitim Tarihleri <span className="text-red-500">*</span></label>
                <Form.Item
                  name="dateRange"
                  rules={[{ required: true, message: 'Eğitim tarihleri zorunludur' }]}
                  className="mb-0"
                >
                  <RangePicker
                    format="DD.MM.YYYY"
                    style={{ width: '100%' }}
                    placeholder={['Başlangıç', 'Bitiş']}
                    className="[&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── DETAYLAR ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Detaylar
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Süre (Saat) <span className="text-red-500">*</span></label>
                <Form.Item
                  name="durationHours"
                  className="mb-0"
                  rules={[{ required: true, message: 'Süre zorunludur' }]}
                >
                  <InputNumber
                    placeholder="0"
                    style={{ width: '100%' }}
                    min={1}
                    className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Maksimum Katılımcı</label>
                <Form.Item name="maxParticipants" className="mb-0">
                  <InputNumber
                    placeholder="0"
                    style={{ width: '100%' }}
                    min={1}
                    className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Maliyet</label>
                <Form.Item name="cost" className="mb-0">
                  <InputNumber
                    placeholder="0"
                    style={{ width: '100%' }}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => parseFloat(String(value).replace(/₺\s?|(,*)/g, '')) as unknown as 0}
                    min={0}
                    addonAfter="TRY"
                    className="[&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── EĞİTİM SEÇENEKLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Eğitim Seçenekleri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-sm text-slate-700">Zorunlu Eğitim</div>
                  <Form.Item name="isMandatory" valuePropName="checked" noStyle initialValue={false}>
                    <Switch
                      checkedChildren="Evet"
                      unCheckedChildren="Hayır"
                    />
                  </Form.Item>
                </div>
              </div>
              <div className="col-span-6">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-sm text-slate-700">Sertifikalı</div>
                  <Form.Item name="hasCertification" valuePropName="checked" noStyle initialValue={false}>
                    <Switch
                      checkedChildren="Evet"
                      unCheckedChildren="Hayır"
                    />
                  </Form.Item>
                </div>
              </div>
            </div>
          </div>

          {/* ─────────────── İSTATİSTİKLER (Düzenleme Modu) ─────────────── */}
          {initialValues && (
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                İstatistikler
              </h3>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <div className="text-2xl font-semibold text-slate-800">
                      {initialValues.currentParticipants || 0}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Katılımcı</div>
                  </div>
                </div>
                <div className="col-span-6">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <div className="text-2xl font-semibold text-slate-800">
                      {initialValues.maxParticipants || '-'}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Kapasite</div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Hidden submit button */}
      <Form.Item hidden>
        <button type="submit" />
      </Form.Item>
    </Form>
  );
}
