'use client';

/**
 * Shipment Form Component
 * Enterprise-grade design following Linear/Stripe/Vercel principles
 */

import React from 'react';
import { Form, Input, Select, DatePicker, InputNumber, Divider, Switch } from 'antd';
import type { FormInstance } from 'antd';
import type { SalesOrderListItem, ShipmentType, ShipmentPriority } from '@/lib/api/services/sales.service';

interface ShipmentFormProps {
  form: FormInstance;
  onFinish: (values: any) => void;
  loading?: boolean;
  isEdit?: boolean;
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
  orders = [],
  carriers = [],
  warehouses = [],
}: ShipmentFormProps) {
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      disabled={loading}
      initialValues={{
        shipmentType: 'Standard',
        priority: 'Normal',
        requiresSignature: false,
        shippingCountry: 'Türkiye',
      }}
    >
      {/* Order Selection */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          SİPARİŞ
        </h3>
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12">
            <Form.Item
              name="salesOrderId"
              label="Sipariş"
              rules={[{ required: true, message: 'Sipariş seçimi zorunludur' }]}
            >
              <Select
                showSearch
                placeholder="Sipariş seçin"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={orders.map((o) => ({ value: o.id, label: `${o.orderNumber} - ${o.customerName}` }))}
              />
            </Form.Item>
          </div>
        </div>
      </div>

      <Divider className="my-6" />

      {/* Shipment Details */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          SEVKİYAT DETAYLARI
        </h3>
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-6">
            <Form.Item name="shipmentType" label="Sevkiyat Tipi">
              <Select options={shipmentTypeOptions} />
            </Form.Item>
          </div>
          <div className="col-span-6">
            <Form.Item name="priority" label="Öncelik">
              <Select options={priorityOptions} />
            </Form.Item>
          </div>
          <div className="col-span-6">
            <Form.Item name="warehouseId" label="Depo">
              <Select
                showSearch
                placeholder="Depo seçin (opsiyonel)"
                optionFilterProp="children"
                allowClear
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
              />
            </Form.Item>
          </div>
          <div className="col-span-6">
            <Form.Item name="carrierId" label="Taşıyıcı">
              <Select
                showSearch
                placeholder="Taşıyıcı seçin (opsiyonel)"
                optionFilterProp="children"
                allowClear
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={carriers.map((c) => ({ value: c.id, label: c.name }))}
              />
            </Form.Item>
          </div>
          <div className="col-span-6">
            <Form.Item name="carrierName" label="Taşıyıcı Adı (Manuel)">
              <Input placeholder="Taşıyıcı firma adı" />
            </Form.Item>
          </div>
          <div className="col-span-6">
            <Form.Item name="estimatedShipDate" label="Tahmini Sevk Tarihi">
              <DatePicker className="w-full" format="DD.MM.YYYY" placeholder="Tarih seçin" />
            </Form.Item>
          </div>
          <div className="col-span-6">
            <Form.Item name="estimatedDeliveryDate" label="Tahmini Teslimat Tarihi">
              <DatePicker className="w-full" format="DD.MM.YYYY" placeholder="Tarih seçin" />
            </Form.Item>
          </div>
          <div className="col-span-6">
            <Form.Item name="requiresSignature" label="İmza Gerekli" valuePropName="checked">
              <Switch />
            </Form.Item>
          </div>
        </div>
      </div>

      <Divider className="my-6" />

      {/* Recipient & Shipping Address */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          ALICI VE TESLİMAT ADRESİ
        </h3>
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-6">
            <Form.Item
              name="recipientName"
              label="Alıcı Adı"
              rules={[{ required: true, message: 'Alıcı adı zorunludur' }]}
            >
              <Input placeholder="Alıcı adı soyadı" />
            </Form.Item>
          </div>
          <div className="col-span-6">
            <Form.Item name="recipientPhone" label="Telefon">
              <Input placeholder="Telefon numarası" />
            </Form.Item>
          </div>
          <div className="col-span-6">
            <Form.Item name="recipientEmail" label="E-posta">
              <Input placeholder="E-posta adresi" />
            </Form.Item>
          </div>
          <div className="col-span-12">
            <Form.Item
              name="shippingAddressLine1"
              label="Adres Satırı 1"
              rules={[{ required: true, message: 'Adres zorunludur' }]}
            >
              <Input placeholder="Sokak adresi" />
            </Form.Item>
          </div>
          <div className="col-span-12">
            <Form.Item name="shippingAddressLine2" label="Adres Satırı 2">
              <Input placeholder="Apartman, daire, vb." />
            </Form.Item>
          </div>
          <div className="col-span-4">
            <Form.Item
              name="shippingCity"
              label="Şehir"
              rules={[{ required: true, message: 'Şehir zorunludur' }]}
            >
              <Input placeholder="Şehir" />
            </Form.Item>
          </div>
          <div className="col-span-4">
            <Form.Item name="shippingState" label="İlçe">
              <Input placeholder="İlçe" />
            </Form.Item>
          </div>
          <div className="col-span-4">
            <Form.Item name="shippingPostalCode" label="Posta Kodu">
              <Input placeholder="Posta kodu" />
            </Form.Item>
          </div>
          <div className="col-span-6">
            <Form.Item
              name="shippingCountry"
              label="Ülke"
              rules={[{ required: true, message: 'Ülke zorunludur' }]}
            >
              <Input placeholder="Ülke" />
            </Form.Item>
          </div>
        </div>
      </div>

      <Divider className="my-6" />

      {/* Notes */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          NOTLAR
        </h3>
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12">
            <Form.Item name="deliveryInstructions" label="Teslimat Talimatları">
              <Input.TextArea rows={3} placeholder="Teslimat ile ilgili özel talimatlar..." />
            </Form.Item>
          </div>
          <div className="col-span-12">
            <Form.Item name="internalNotes" label="Dahili Notlar">
              <Input.TextArea rows={3} placeholder="Şirket içi notlar..." />
            </Form.Item>
          </div>
        </div>
      </div>
    </Form>
  );
}
