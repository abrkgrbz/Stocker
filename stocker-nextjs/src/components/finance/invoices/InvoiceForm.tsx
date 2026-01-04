'use client';

import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Form, Input, DatePicker, InputNumber, Select, Divider, Button, Table, Modal } from 'antd';
import {
  DocumentTextIcon,
  UserIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import type { CreateInvoiceDto, UpdateInvoiceDto, InvoiceItemDto } from '@/lib/api/services/finance.types';
import { useCustomers } from '@/lib/api/hooks/useCRM';
import { useProducts } from '@/lib/api/hooks/useInventory';
import dayjs from 'dayjs';

export interface InvoiceFormRef {
  submit: () => void;
  reset: () => void;
}

export interface InvoiceFormData extends Omit<CreateInvoiceDto, 'items'> {
  items: InvoiceItemDto[];
}

interface InvoiceFormProps {
  initialValues?: Partial<InvoiceFormData>;
  onFinish: (values: InvoiceFormData) => void;
  loading?: boolean;
  mode?: 'create' | 'edit';
}

const InvoiceForm = forwardRef<InvoiceFormRef, InvoiceFormProps>(
  ({ initialValues, onFinish, loading = false, mode = 'create' }, ref) => {
    const [form] = Form.useForm();
    const [items, setItems] = useState<InvoiceItemDto[]>(initialValues?.items || []);
    const [selectedProduct, setSelectedProduct] = useState<string | undefined>(undefined);

    // Fetch customers and products
    const { data: customersData, isLoading: customersLoading } = useCustomers({ pageSize: 100 });
    const { data: productsData, isLoading: productsLoading } = useProducts(false);

    const customers = customersData?.items || [];
    const products = Array.isArray(productsData) ? productsData : [];

    useImperativeHandle(ref, () => ({
      submit: () => form.submit(),
      reset: () => {
        form.resetFields();
        setItems([]);
      },
    }));

    const handleFinish = (values: any) => {
      const formData: InvoiceFormData = {
        ...values,
        invoiceDate: values.invoiceDate?.toISOString(),
        dueDate: values.dueDate?.toISOString(),
        items,
      };
      onFinish(formData);
    };

    const handleAddProduct = () => {
      if (!selectedProduct) return;

      const product = products.find((p: any) => p.id?.toString() === selectedProduct);
      if (!product) return;

      const existingItem = items.find(item => item.productCode === (product.code || product.sku));
      if (existingItem) {
        setItems(items.map(item =>
          item.productCode === existingItem.productCode
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      } else {
        const newItem: InvoiceItemDto = {
          productCode: product.code || product.sku || '',
          productName: product.name,
          description: product.description || '',
          quantity: 1,
          unit: product.unitName || product.unitSymbol || 'Adet',
          unitPrice: product.unitPrice || 0,
          discountRate: 0,
          discountAmount: 0,
          kdvRate: 20,
          kdvAmount: (product.unitPrice || 0) * 0.2,
          lineTotal: (product.unitPrice || 0) * 1.2,
        };
        setItems([...items, newItem]);
      }
      setSelectedProduct(undefined);
    };

    const handleUpdateItem = (index: number, field: string, value: any) => {
      const newItems = [...items];
      const item = { ...newItems[index], [field]: value };

      // Recalculate line totals
      const subtotal = item.quantity * item.unitPrice;
      const discountAmount = subtotal * (item.discountRate / 100);
      const afterDiscount = subtotal - discountAmount;
      const kdvAmount = afterDiscount * (item.kdvRate / 100);
      const lineTotal = afterDiscount + kdvAmount;

      newItems[index] = {
        ...item,
        discountAmount,
        kdvAmount,
        lineTotal,
      };
      setItems(newItems);
    };

    const handleRemoveItem = (index: number) => {
      setItems(items.filter((_, i) => i !== index));
    };

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const totalDiscount = items.reduce((sum, item) => sum + (item.discountAmount || 0), 0);
    const totalKdv = items.reduce((sum, item) => sum + (item.kdvAmount || 0), 0);
    const grandTotal = items.reduce((sum, item) => sum + (item.lineTotal || 0), 0);

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
    };

    const invoiceTypeOptions = [
      { value: 'Sales', label: 'Satış Faturası' },
      { value: 'Purchase', label: 'Alış Faturası' },
      { value: 'Return', label: 'İade Faturası' },
      { value: 'Proforma', label: 'Proforma Fatura' },
    ];

    const kdvRateOptions = [
      { value: 0, label: '%0' },
      { value: 1, label: '%1' },
      { value: 10, label: '%10' },
      { value: 20, label: '%20' },
    ];

    return (
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          ...initialValues,
          invoiceDate: initialValues?.invoiceDate ? dayjs(initialValues.invoiceDate) : dayjs(),
          dueDate: initialValues?.dueDate ? dayjs(initialValues.dueDate) : dayjs().add(30, 'day'),
          invoiceType: initialValues?.invoiceType || 'Sales',
          currency: initialValues?.currency || 'TRY',
        }}
        className="space-y-6"
      >
        {/* Basic Information */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <DocumentTextIcon className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Fatura Bilgileri</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item
              name="invoiceType"
              label="Fatura Türü"
              rules={[{ required: true, message: 'Fatura türü seçiniz' }]}
            >
              <Select options={invoiceTypeOptions} placeholder="Fatura türü seçin" size="large" />
            </Form.Item>

            <Form.Item
              name="invoiceNumber"
              label="Fatura No"
            >
              <Input placeholder="Otomatik oluşturulur" size="large" disabled={mode === 'create'} />
            </Form.Item>

            <Form.Item
              name="currency"
              label="Para Birimi"
              rules={[{ required: true, message: 'Para birimi seçiniz' }]}
            >
              <Select
                options={[
                  { value: 'TRY', label: 'Türk Lirası (TRY)' },
                  { value: 'USD', label: 'Amerikan Doları (USD)' },
                  { value: 'EUR', label: 'Euro (EUR)' },
                ]}
                placeholder="Para birimi seçin"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="invoiceDate"
              label="Fatura Tarihi"
              rules={[{ required: true, message: 'Fatura tarihi seçiniz' }]}
            >
              <DatePicker className="w-full" format="DD/MM/YYYY" size="large" />
            </Form.Item>

            <Form.Item
              name="dueDate"
              label="Vade Tarihi"
              rules={[{ required: true, message: 'Vade tarihi seçiniz' }]}
            >
              <DatePicker className="w-full" format="DD/MM/YYYY" size="large" />
            </Form.Item>
          </div>
        </div>

        {/* Customer Information */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-purple-600" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Müşteri/Tedarikçi Bilgileri</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="customerId"
              label="Müşteri"
            >
              <Select
                showSearch
                placeholder="Müşteri seçin"
                optionFilterProp="label"
                loading={customersLoading}
                size="large"
                allowClear
                options={customers.map((c: any) => ({
                  value: c.id,
                  label: c.companyName || c.name,
                }))}
              />
            </Form.Item>

            <Form.Item
              name="customerName"
              label="Müşteri Adı"
            >
              <Input placeholder="Müşteri adı" size="large" />
            </Form.Item>

            <Form.Item
              name="customerTaxNumber"
              label="Vergi Numarası"
            >
              <Input placeholder="Vergi numarası" size="large" />
            </Form.Item>

            <Form.Item
              name="customerTaxOffice"
              label="Vergi Dairesi"
            >
              <Input placeholder="Vergi dairesi" size="large" />
            </Form.Item>
          </div>

          <Form.Item
            name="customerAddress"
            label="Adres"
          >
            <Input.TextArea rows={2} placeholder="Müşteri adresi" />
          </Form.Item>
        </div>

        {/* Invoice Items */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <CurrencyDollarIcon className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Fatura Kalemleri</h3>
            </div>
          </div>

          {/* Add Product */}
          <div className="flex gap-2 mb-4">
            <Select
              showSearch
              placeholder="Ürün seçin..."
              optionFilterProp="label"
              loading={productsLoading}
              className="flex-1"
              size="large"
              value={selectedProduct}
              onChange={setSelectedProduct}
              options={products.map((p: any) => ({
                value: p.id?.toString(),
                label: `${p.code || p.sku || ''} - ${p.name}`,
              }))}
            />
            <Button
              type="primary"
              icon={<PlusIcon className="w-4 h-4" />}
              onClick={handleAddProduct}
              disabled={!selectedProduct}
              size="large"
            >
              Ekle
            </Button>
          </div>

          {/* Items Table */}
          {items.length > 0 ? (
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Ürün</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Miktar</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Birim Fiyat</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">İndirim %</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">KDV %</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Toplam</th>
                    <th className="px-4 py-3 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-slate-900">{item.productName}</div>
                        <div className="text-xs text-slate-500">{item.productCode}</div>
                      </td>
                      <td className="px-4 py-3">
                        <InputNumber
                          min={1}
                          value={item.quantity}
                          onChange={(val) => handleUpdateItem(index, 'quantity', val || 1)}
                          size="small"
                          className="w-20"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <InputNumber
                          min={0}
                          value={item.unitPrice}
                          onChange={(val) => handleUpdateItem(index, 'unitPrice', val || 0)}
                          formatter={(val) => `₺ ${val}`}
                          parser={(val) => Number((val || '').replace('₺ ', '')) as any}
                          size="small"
                          className="w-28"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <InputNumber
                          min={0}
                          max={100}
                          value={item.discountRate}
                          onChange={(val) => handleUpdateItem(index, 'discountRate', val || 0)}
                          size="small"
                          className="w-16"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Select
                          value={item.kdvRate}
                          onChange={(val) => handleUpdateItem(index, 'kdvRate', val)}
                          options={kdvRateOptions}
                          size="small"
                          className="w-20"
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-semibold text-slate-900">
                          {formatCurrency(item.lineTotal || 0)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="bg-slate-50 border-t border-slate-200 p-4">
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-8">
                    <span className="text-sm text-slate-500">Ara Toplam:</span>
                    <span className="text-sm font-medium text-slate-700 w-32 text-right">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                  <div className="flex items-center gap-8">
                    <span className="text-sm text-slate-500">İndirim:</span>
                    <span className="text-sm font-medium text-red-600 w-32 text-right">
                      -{formatCurrency(totalDiscount)}
                    </span>
                  </div>
                  <div className="flex items-center gap-8">
                    <span className="text-sm text-slate-500">KDV:</span>
                    <span className="text-sm font-medium text-slate-700 w-32 text-right">
                      {formatCurrency(totalKdv)}
                    </span>
                  </div>
                  <div className="flex items-center gap-8 pt-2 border-t border-slate-200">
                    <span className="text-sm font-semibold text-slate-900">Genel Toplam:</span>
                    <span className="text-lg font-bold text-slate-900 w-32 text-right">
                      {formatCurrency(grandTotal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 bg-slate-50/50 border border-dashed border-slate-200 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <CurrencyDollarIcon className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="text-sm font-medium text-slate-900 mb-1">Kalem eklenmedi</h3>
              <p className="text-sm text-slate-500">Yukarıdan ürün seçerek fatura kalemleri ekleyin</p>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <CalendarIcon className="w-4 h-4 text-amber-600" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Ek Bilgiler</h3>
          </div>

          <Form.Item name="notes" label="Notlar">
            <Input.TextArea rows={3} placeholder="Fatura ile ilgili notlar..." />
          </Form.Item>
        </div>
      </Form>
    );
  }
);

InvoiceForm.displayName = 'InvoiceForm';

export default InvoiceForm;
