'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, Switch, InputNumber, Select } from 'antd';
import { EnvironmentOutlined, HomeOutlined } from '@ant-design/icons';
import { useWarehouses } from '@/lib/api/hooks/useInventory';
import type { LocationDto } from '@/lib/api/services/inventory.types';

const { TextArea } = Input;

interface LocationFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: LocationDto;
  onFinish: (values: any) => void;
  loading?: boolean;
  defaultWarehouseId?: number;
}

export default function LocationForm({ form, initialValues, onFinish, loading, defaultWarehouseId }: LocationFormProps) {
  const [isActive, setIsActive] = useState(true);
  const { data: warehouses = [] } = useWarehouses();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
      setIsActive(initialValues.isActive ?? true);
    } else if (defaultWarehouseId) {
      form.setFieldValue('warehouseId', defaultWarehouseId);
    }
  }, [form, initialValues, defaultWarehouseId]);

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
            {/* Location Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <EnvironmentOutlined className="text-xl text-slate-500" />
              </div>
            </div>

            {/* Location Name - Title Style */}
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
                  placeholder="Lokasyon Adı Girin..."
                  variant="borderless"
                  className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
                />
              </Form.Item>
              <Form.Item name="description" className="mb-0 mt-1">
                <Input
                  placeholder="Lokasyon hakkında kısa açıklama..."
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
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Lokasyon Kodu <span className="text-red-500">*</span></label>
                <Form.Item
                  name="code"
                  rules={[{ required: true, message: '' }]}
                  className="mb-0"
                >
                  <Input
                    placeholder="LOC-001"
                    disabled={!!initialValues}
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Depo <span className="text-red-500">*</span></label>
                <Form.Item
                  name="warehouseId"
                  rules={[{ required: true, message: '' }]}
                  className="mb-0"
                >
                  <Select
                    placeholder="Depo seçin"
                    disabled={!!initialValues}
                    options={warehouses.map((w) => ({
                      value: w.id,
                      label: w.name,
                    }))}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── KONUM BİLGİLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Konum Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Koridor</label>
                <Form.Item name="aisle" className="mb-0">
                  <Input
                    placeholder="A"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Raf</label>
                <Form.Item name="shelf" className="mb-0">
                  <Input
                    placeholder="01"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Bölme</label>
                <Form.Item name="bin" className="mb-0">
                  <Input
                    placeholder="001"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── KAPASİTE ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Kapasite
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Toplam Kapasite <span className="text-red-500">*</span></label>
                <Form.Item
                  name="capacity"
                  rules={[{ required: true, message: '' }]}
                  className="mb-0"
                  initialValue={100}
                >
                  <InputNumber
                    placeholder="100"
                    min={1}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              {initialValues && (
                <div className="col-span-6">
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Kullanılan Kapasite</label>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 font-medium">
                    {initialValues.usedCapacity} / {initialValues.capacity}
                  </div>
                </div>
              )}
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
                      {initialValues.productCount || 0}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Ürün Sayısı</div>
                  </div>
                </div>
                <div className="col-span-6">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <div className="text-2xl font-semibold text-slate-800">
                      {initialValues.capacity > 0
                        ? Math.round((initialValues.usedCapacity / initialValues.capacity) * 100)
                        : 0}%
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Doluluk Oranı</div>
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
