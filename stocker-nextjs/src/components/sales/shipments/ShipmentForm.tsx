'use client';

import React, { useEffect, useState } from 'react';
import { Form, Input, Select, DatePicker, Switch } from 'antd';
import { TruckIcon } from '@heroicons/react/24/outline';
import type { FormInstance } from 'antd';
import type { SalesOrderListItem, ShipmentType, ShipmentPriority } from '@/lib/api/services/sales.service';
import dayjs from 'dayjs';

interface ShipmentFormProps {
  form: FormInstance;
  onFinish: (values: any) => void;
  loading?: boolean;
  isEdit?: boolean;
  initialValues?: any;
  orders?: SalesOrderListItem[];
  carriers?: { id: string; name: string }[];
  warehouses?: { id: string; name: string }[];
}

const shipmentTypeOptions: { value: ShipmentType; label: string }[] = [
  { value: 'Standard', label: 'Standart' },
  { value: 'Express', label: 'Ekspres' },
  { value: 'SameDay', label: 'Aynı Gün' },
  { value: 'NextDay', label: 'Ertesi Gün' },
  { value: 'Economy', label: 'Ekonomik' },
  { value: 'Freight', label: 'Yük Taşıma' },
];

const priorityOptions: { value: ShipmentPriority; label: string }[] = [
  { value: 'Low', label: 'Düşük' },
  { value: 'Normal', label: 'Normal' },
  { value: 'High', label: 'Yüksek' },
  { value: 'Urgent', label: 'Acil' },
];

export function ShipmentForm({
  form,
  onFinish,
  loading = false,
  isEdit = false,
  initialValues,
  orders = [],
  carriers = [],
  warehouses = [],
}: ShipmentFormProps) {
  const [requiresSignature, setRequiresSignature] = useState(false);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        estimatedShipDate: initialValues.estimatedShipDate ? dayjs(initialValues.estimatedShipDate) : undefined,
        estimatedDeliveryDate: initialValues.estimatedDeliveryDate ? dayjs(initialValues.estimatedDeliveryDate) : undefined,
      });
      setRequiresSignature(initialValues.requiresSignature ?? false);
    } else {
      form.setFieldsValue({
        shipmentType: 'Standard',
        priority: 'Normal',
        requiresSignature: false,
        shippingCountry: 'Türkiye',
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

        {/* ═══════════════════════════════════════════════════════════════
            HEADER: Icon + Recipient Name + Signature Toggle
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Shipment Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <TruckIcon className="w-6 h-6 text-slate-500" />
              </div>
            </div>

            {/* Recipient Name - Title Style */}
            <div className="flex-1">
              <Form.Item
                name="recipientName"
                rules={[{ required: true, message: 'Alıcı adı zorunludur' }]}
                className="mb-0"
              >
                <Input
                  placeholder="Alıcı Adı Girin..."
                  variant="borderless"
                  className="!text-2xl !font-bold !text-slate-900 !p-0 !border-transparent placeholder:!text-slate-400 placeholder:!font-medium"
                />
              </Form.Item>
              <p className="text-sm text-slate-500 mt-1">
                {isEdit ? 'Sevkiyatı düzenleyin' : 'Yeni sevkiyat oluşturun'}
              </p>
            </div>

            {/* Signature Toggle */}
            <div className="flex-shrink-0">
              <div className="flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-lg">
                <span className="text-sm font-medium text-slate-600">
                  {requiresSignature ? 'İmza Gerekli' : 'İmzasız'}
                </span>
                <Form.Item name="requiresSignature" valuePropName="checked" noStyle initialValue={false}>
                  <Switch
                    checked={requiresSignature}
                    onChange={(val) => {
                      setRequiresSignature(val);
                      form.setFieldValue('requiresSignature', val);
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

          {/* ─────────────── SİPARİŞ SEÇİMİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Sipariş
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Sipariş <span className="text-red-500">*</span></label>
                <Form.Item
                  name="salesOrderId"
                  rules={[{ required: true, message: 'Sipariş seçimi zorunludur' }]}
                  className="mb-0"
                >
                  <Select
                    showSearch
                    placeholder="Sipariş seçin"
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={orders.map((o) => ({ value: o.id, label: `${o.orderNumber} - ${o.customerName}` }))}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── SEVKİYAT DETAYLARI ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Sevkiyat Detayları
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Sevkiyat Tipi</label>
                <Form.Item name="shipmentType" className="mb-0">
                  <Select
                    options={shipmentTypeOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Öncelik</label>
                <Form.Item name="priority" className="mb-0">
                  <Select
                    options={priorityOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Depo</label>
                <Form.Item name="warehouseId" className="mb-0">
                  <Select
                    showSearch
                    placeholder="Depo seçin (opsiyonel)"
                    optionFilterProp="children"
                    allowClear
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Taşıyıcı</label>
                <Form.Item name="carrierId" className="mb-0">
                  <Select
                    showSearch
                    placeholder="Taşıyıcı seçin (opsiyonel)"
                    optionFilterProp="children"
                    allowClear
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={carriers.map((c) => ({ value: c.id, label: c.name }))}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Taşıyıcı Adı (Manuel)</label>
                <Form.Item name="carrierName" className="mb-0">
                  <Input
                    placeholder="Taşıyıcı firma adı"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Tahmini Sevk Tarihi</label>
                <Form.Item name="estimatedShipDate" className="mb-0">
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD.MM.YYYY"
                    placeholder="Tarih seçin"
                    className="[&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Tahmini Teslimat Tarihi</label>
                <Form.Item name="estimatedDeliveryDate" className="mb-0">
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD.MM.YYYY"
                    placeholder="Tarih seçin"
                    className="[&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── ALICI VE TESLİMAT ADRESİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Alıcı ve Teslimat Adresi
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Telefon</label>
                <Form.Item name="recipientPhone" className="mb-0">
                  <Input
                    placeholder="Telefon numarası"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">E-posta</label>
                <Form.Item name="recipientEmail" className="mb-0">
                  <Input
                    placeholder="E-posta adresi"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Adres Satırı 1 <span className="text-red-500">*</span></label>
                <Form.Item
                  name="shippingAddressLine1"
                  rules={[{ required: true, message: 'Adres zorunludur' }]}
                  className="mb-0"
                >
                  <Input
                    placeholder="Sokak adresi"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Adres Satırı 2</label>
                <Form.Item name="shippingAddressLine2" className="mb-0">
                  <Input
                    placeholder="Apartman, daire, vb."
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Şehir <span className="text-red-500">*</span></label>
                <Form.Item
                  name="shippingCity"
                  rules={[{ required: true, message: 'Şehir zorunludur' }]}
                  className="mb-0"
                >
                  <Input
                    placeholder="Şehir"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">İlçe</label>
                <Form.Item name="shippingState" className="mb-0">
                  <Input
                    placeholder="İlçe"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Posta Kodu</label>
                <Form.Item name="shippingPostalCode" className="mb-0">
                  <Input
                    placeholder="Posta kodu"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Ülke <span className="text-red-500">*</span></label>
                <Form.Item
                  name="shippingCountry"
                  rules={[{ required: true, message: 'Ülke zorunludur' }]}
                  className="mb-0"
                >
                  <Input
                    placeholder="Ülke"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── NOTLAR ─────────────── */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Notlar
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Teslimat Talimatları</label>
                <Form.Item name="deliveryInstructions" className="mb-0">
                  <Input.TextArea
                    rows={3}
                    placeholder="Teslimat ile ilgili özel talimatlar..."
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white !resize-none"
                  />
                </Form.Item>
              </div>
              <div className="col-span-12">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Dahili Notlar</label>
                <Form.Item name="internalNotes" className="mb-0">
                  <Input.TextArea
                    rows={3}
                    placeholder="Şirket içi notlar..."
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white !resize-none"
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
