'use client';

/**
 * Create Back Order Page
 * Yeni bekleyen siparis olusturma formu - Monochrome Design System
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { Form, Input, Select, DatePicker, InputNumber } from 'antd';
import Link from 'next/link';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import { useCreateBackOrder } from '@/features/sales';
import type { CreateBackOrderDto } from '@/features/sales';

dayjs.locale('tr');

const priorityOptions = [
  { value: 'Normal', label: 'Normal' },
  { value: 'High', label: 'Yuksek' },
  { value: 'Urgent', label: 'Kritik' },
];

export default function NewBackOrderPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const createMutation = useCreateBackOrder();

  const handleSubmit = async (values: any) => {
    const payload: CreateBackOrderDto = {
      salesOrderId: values.salesOrderId,
      salesOrderNumber: values.salesOrderNumber || '',
      customerId: values.customerId,
      customerName: values.customerName,
      warehouseId: values.warehouseId,
      warehouseCode: values.warehouseCode,
      type: 'Standard',
      priority: values.priority,
      estimatedRestockDate: values.estimatedRestockDate?.format('YYYY-MM-DD'),
      notes: values.notes,
      items: [
        {
          salesOrderItemId: values.salesOrderItemId || '',
          productId: values.productId,
          productCode: values.productCode,
          productName: values.productName,
          unit: values.unitOfMeasure || 'Adet',
          orderedQuantity: values.orderedQuantity,
          availableQuantity: values.availableQuantity || 0,
          unitPrice: values.unitPrice || 0,
        },
      ],
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        router.push('/sales/backorders');
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/sales/backorders"
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">Yeni Bekleyen Siparis</h1>
                <p className="text-xs text-slate-500">Tedarik bekleyen siparis kaydi</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/sales/backorders"
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Vazgec
            </Link>
            <button
              onClick={() => form.submit()}
              disabled={createMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
            >
              {createMutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-8 py-8">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            priority: 'Normal',
          }}
        >
          {/* Section: Siparis Bilgileri */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
            <h2 className="text-base font-semibold text-slate-900 mb-1">Siparis Bilgileri</h2>
            <p className="text-sm text-slate-500 mb-6 pb-4 border-b border-slate-100">
              Iliskili siparis ve musteri bilgileri
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Form.Item
                name="salesOrderId"
                label={<span className="text-sm font-medium text-slate-700">Siparis</span>}
                rules={[{ required: true, message: 'Siparis zorunludur' }]}
              >
                <Select
                  placeholder="Siparis secin"
                  showSearch
                  className="w-full"
                  options={[]}
                  filterOption={(input, option) =>
                    ((option?.label as string) ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>

              <Form.Item
                name="customerId"
                label={<span className="text-sm font-medium text-slate-700">Musteri ID</span>}
              >
                <Input placeholder="Musteri ID" className="rounded-lg" />
              </Form.Item>

              <Form.Item
                name="customerName"
                label={<span className="text-sm font-medium text-slate-700">Musteri Adi</span>}
              >
                <Input placeholder="Musteri adi" className="rounded-lg" />
              </Form.Item>

              <Form.Item
                name="salesOrderNumber"
                label={<span className="text-sm font-medium text-slate-700">Siparis No</span>}
              >
                <Input placeholder="SO-2026-001" className="rounded-lg" />
              </Form.Item>
            </div>
          </div>

          {/* Section: Urun Bilgileri */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
            <h2 className="text-base font-semibold text-slate-900 mb-1">Urun Bilgileri</h2>
            <p className="text-sm text-slate-500 mb-6 pb-4 border-b border-slate-100">
              Bekleyen urun ve miktar bilgileri
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Form.Item
                name="productId"
                label={<span className="text-sm font-medium text-slate-700">Urun ID</span>}
              >
                <Input placeholder="Urun ID" className="rounded-lg" />
              </Form.Item>

              <Form.Item
                name="productCode"
                label={<span className="text-sm font-medium text-slate-700">Urun Kodu</span>}
                rules={[{ required: true, message: 'Urun kodu zorunludur' }]}
              >
                <Input placeholder="PRD-001" className="rounded-lg" />
              </Form.Item>

              <div className="md:col-span-2">
                <Form.Item
                  name="productName"
                  label={<span className="text-sm font-medium text-slate-700">Urun Adi</span>}
                  rules={[{ required: true, message: 'Urun adi zorunludur' }]}
                >
                  <Input placeholder="Urun adi" className="rounded-lg" size="large" />
                </Form.Item>
              </div>

              <Form.Item
                name="orderedQuantity"
                label={<span className="text-sm font-medium text-slate-700">Siparis Miktari</span>}
                rules={[{ required: true, message: 'Miktar zorunludur' }]}
              >
                <InputNumber
                  min={1}
                  className="w-full rounded-lg"
                  placeholder="0"
                />
              </Form.Item>

              <Form.Item
                name="unitOfMeasure"
                label={<span className="text-sm font-medium text-slate-700">Birim</span>}
              >
                <Select
                  placeholder="Birim"
                  className="w-full"
                  options={[
                    { value: 'Adet', label: 'Adet' },
                    { value: 'Kg', label: 'Kg' },
                    { value: 'Lt', label: 'Lt' },
                    { value: 'Mt', label: 'Mt' },
                    { value: 'Paket', label: 'Paket' },
                    { value: 'Kutu', label: 'Kutu' },
                  ]}
                />
              </Form.Item>
            </div>
          </div>

          {/* Section: Tedarik Bilgileri */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-1">Tedarik Bilgileri</h2>
            <p className="text-sm text-slate-500 mb-6 pb-4 border-b border-slate-100">
              Tahmini tedarik tarihi ve oncelik
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Form.Item
                name="estimatedRestockDate"
                label={<span className="text-sm font-medium text-slate-700">Tahmini Tedarik Tarihi</span>}
              >
                <DatePicker
                  className="w-full rounded-lg"
                  format="DD.MM.YYYY"
                  placeholder="Tarih secin"
                />
              </Form.Item>

              <Form.Item
                name="priority"
                label={<span className="text-sm font-medium text-slate-700">Oncelik</span>}
              >
                <div className="flex gap-2">
                  {priorityOptions.map((opt) => {
                    const currentValue = Form.useWatch('priority', form);
                    const isSelected = currentValue === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => form.setFieldValue('priority', opt.value)}
                        className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </Form.Item>

              <div className="md:col-span-2">
                <Form.Item
                  name="notes"
                  label={<span className="text-sm font-medium text-slate-700">Notlar</span>}
                >
                  <Input.TextArea
                    placeholder="Ek notlar (opsiyonel)"
                    rows={3}
                    className="rounded-lg"
                  />
                </Form.Item>
              </div>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
