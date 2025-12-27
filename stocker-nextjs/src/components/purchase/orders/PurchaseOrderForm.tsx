'use client';

import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Select,
  InputNumber,
  DatePicker,
  Button,
  Table,
  Tooltip,
} from 'antd';
import {
  ShoppingCartIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useSuppliers } from '@/lib/api/hooks/usePurchase';
import type { PurchaseOrderDto, PurchaseOrderType, PurchaseOrderItemDto } from '@/lib/api/services/purchase.types';
import { SupplierStatus } from '@/lib/api/services/purchase.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface PurchaseOrderFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: PurchaseOrderDto;
  onFinish: (values: any) => void;
  loading?: boolean;
}

const orderTypeOptions = [
  { value: 'Standard', label: 'Standart Sipariş' },
  { value: 'Blanket', label: 'Çerçeve Sipariş' },
  { value: 'Planned', label: 'Planlı Sipariş' },
  { value: 'Contract', label: 'Kontrat Sipariş' },
  { value: 'DropShip', label: 'Drop Ship' },
  { value: 'Consignment', label: 'Konsinye' },
];

const currencyOptions = [
  { value: 'TRY', label: '₺ TRY' },
  { value: 'USD', label: '$ USD' },
  { value: 'EUR', label: '€ EUR' },
  { value: 'GBP', label: '£ GBP' },
];

interface OrderItem {
  key: string;
  productId?: string;
  productName?: string;
  productCode?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
  lineTotal: number;
}

export default function PurchaseOrderForm({ form, initialValues, onFinish, loading }: PurchaseOrderFormProps) {
  const [items, setItems] = useState<OrderItem[]>([]);
  const { data: suppliersData } = useSuppliers({ pageSize: 1000, status: SupplierStatus.Active });
  const suppliers = suppliersData?.items || [];

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        expectedDeliveryDate: initialValues.expectedDeliveryDate
          ? dayjs(initialValues.expectedDeliveryDate)
          : undefined,
        orderDate: initialValues.orderDate
          ? dayjs(initialValues.orderDate)
          : dayjs(),
      });

      // Initialize items from initial values
      if (initialValues.items && initialValues.items.length > 0) {
        setItems(initialValues.items.map((item, index) => ({
          key: `item-${index}`,
          productId: item.productId,
          productName: item.productName,
          productCode: item.productCode,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discountRate || 0,
          taxRate: item.vatRate || 18,
          lineTotal: item.totalAmount,
        })));
      }
    } else {
      form.setFieldsValue({
        orderType: 'Standard',
        currency: 'TRY',
        orderDate: dayjs(),
      });
    }
  }, [form, initialValues]);

  const handleAddItem = () => {
    const newItem: OrderItem = {
      key: `item-${Date.now()}`,
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      taxRate: 18,
      lineTotal: 0,
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (key: string) => {
    setItems(items.filter(item => item.key !== key));
  };

  const handleItemChange = (key: string, field: keyof OrderItem, value: any) => {
    setItems(items.map(item => {
      if (item.key === key) {
        const updatedItem = { ...item, [field]: value };
        // Recalculate line total
        const subtotal = updatedItem.quantity * updatedItem.unitPrice;
        const discountAmount = subtotal * (updatedItem.discount / 100);
        const afterDiscount = subtotal - discountAmount;
        const taxAmount = afterDiscount * (updatedItem.taxRate / 100);
        updatedItem.lineTotal = afterDiscount + taxAmount;
        return updatedItem;
      }
      return item;
    }));
  };

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const totalDiscount = items.reduce((sum, item) => {
    const itemSubtotal = item.quantity * item.unitPrice;
    return sum + (itemSubtotal * (item.discount / 100));
  }, 0);
  const totalTax = items.reduce((sum, item) => {
    const itemSubtotal = item.quantity * item.unitPrice;
    const afterDiscount = itemSubtotal - (itemSubtotal * (item.discount / 100));
    return sum + (afterDiscount * (item.taxRate / 100));
  }, 0);
  const grandTotal = subtotal - totalDiscount + totalTax;

  const handleSubmit = (values: any) => {
    onFinish({
      ...values,
      orderDate: values.orderDate?.toISOString(),
      expectedDeliveryDate: values.expectedDeliveryDate?.toISOString(),
      items: items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        productCode: item.productCode,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountPercent: item.discount,
        taxRate: item.taxRate,
      })),
    });
  };

  const itemColumns = [
    {
      title: 'Ürün',
      dataIndex: 'productName',
      key: 'productName',
      width: 200,
      render: (_: any, record: OrderItem) => (
        <Input
          placeholder="Ürün adı"
          value={record.productName}
          onChange={(e) => handleItemChange(record.key, 'productName', e.target.value)}
          variant="borderless"
          className="!text-slate-700"
        />
      ),
    },
    {
      title: 'Kod',
      dataIndex: 'productCode',
      key: 'productCode',
      width: 120,
      render: (_: any, record: OrderItem) => (
        <Input
          placeholder="Ürün kodu"
          value={record.productCode}
          onChange={(e) => handleItemChange(record.key, 'productCode', e.target.value)}
          variant="borderless"
          className="!text-slate-700"
        />
      ),
    },
    {
      title: 'Miktar',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      render: (_: any, record: OrderItem) => (
        <InputNumber
          min={1}
          value={record.quantity}
          onChange={(val) => handleItemChange(record.key, 'quantity', val || 1)}
          variant="borderless"
          style={{ width: '100%' }}
          className="[&_.ant-input-number-input]:!text-slate-700"
        />
      ),
    },
    {
      title: 'Birim Fiyat',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 130,
      render: (_: any, record: OrderItem) => (
        <InputNumber
          min={0}
          value={record.unitPrice}
          onChange={(val) => handleItemChange(record.key, 'unitPrice', val || 0)}
          variant="borderless"
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value) => value?.replace(/,/g, '') as unknown as number}
          style={{ width: '100%' }}
          className="[&_.ant-input-number-input]:!text-slate-700"
        />
      ),
    },
    {
      title: 'İskonto %',
      dataIndex: 'discount',
      key: 'discount',
      width: 100,
      render: (_: any, record: OrderItem) => (
        <InputNumber
          min={0}
          max={100}
          value={record.discount}
          onChange={(val) => handleItemChange(record.key, 'discount', val || 0)}
          variant="borderless"
          style={{ width: '100%' }}
          className="[&_.ant-input-number-input]:!text-slate-700"
        />
      ),
    },
    {
      title: 'KDV %',
      dataIndex: 'taxRate',
      key: 'taxRate',
      width: 80,
      render: (_: any, record: OrderItem) => (
        <Select
          value={record.taxRate}
          onChange={(val) => handleItemChange(record.key, 'taxRate', val)}
          variant="borderless"
          style={{ width: '100%' }}
          options={[
            { value: 0, label: '0%' },
            { value: 1, label: '1%' },
            { value: 8, label: '8%' },
            { value: 10, label: '10%' },
            { value: 18, label: '18%' },
            { value: 20, label: '20%' },
          ]}
          className="[&_.ant-select-selection-item]:!text-slate-700"
        />
      ),
    },
    {
      title: 'Tutar',
      dataIndex: 'lineTotal',
      key: 'lineTotal',
      width: 130,
      align: 'right' as const,
      render: (_: any, record: OrderItem) => (
        <span className="font-semibold text-slate-800">{record.lineTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (_: any, record: OrderItem) => (
        <Tooltip title="Kalemi Sil">
          <Button
            type="text"
            icon={<TrashIcon className="w-4 h-4" />}
            danger
            onClick={() => handleRemoveItem(record.key)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      disabled={loading}
      className="w-full"
      scrollToFirstError={{ behavior: 'smooth', block: 'center' }}
    >
      {/* Main Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">

        {/* ═══════════════════════════════════════════════════════════════
            HEADER: Icon + Title + Grand Total
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Order Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <ShoppingCartIcon className="w-6 h-6 text-slate-500" />
              </div>
            </div>

            {/* Title */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-900">
                {initialValues ? `Sipariş: ${initialValues.orderNumber}` : 'Yeni Satın Alma Siparişi'}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Tedarikçiden ürün siparişi oluşturun
              </p>
            </div>

            {/* Grand Total Display */}
            <div className="flex-shrink-0">
              <div className="bg-slate-100 px-6 py-3 rounded-lg text-right">
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Genel Toplam</div>
                <div className="text-2xl font-bold text-slate-900">
                  ₺{grandTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            FORM BODY: High-Density Grid Layout
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6">

          {/* ─────────────── TEDARİKÇİ BİLGİLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Tedarikçi Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Tedarikçi <span className="text-red-500">*</span></label>
                <Form.Item
                  name="supplierId"
                  rules={[{ required: true, message: 'Tedarikçi seçin' }]}
                  className="mb-0"
                >
                  <Select
                    placeholder="Tedarikçi seçin"
                    showSearch
                    optionFilterProp="label"
                    options={suppliers.map(s => ({
                      value: s.id,
                      label: `${s.name} (${s.code})`,
                    }))}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Sipariş Tipi</label>
                <Form.Item name="orderType" className="mb-0">
                  <Select
                    placeholder="Tip seçin"
                    options={orderTypeOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── TARİH VE PARA BİRİMİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Tarih ve Para Birimi
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Sipariş Tarihi</label>
                <Form.Item name="orderDate" className="mb-0">
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD.MM.YYYY"
                    placeholder="Tarih seçin"
                    className="[&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Beklenen Teslim Tarihi</label>
                <Form.Item name="expectedDeliveryDate" className="mb-0">
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD.MM.YYYY"
                    placeholder="Tarih seçin"
                    className="[&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Para Birimi</label>
                <Form.Item name="currency" className="mb-0">
                  <Select
                    options={currencyOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── SİPARİŞ KALEMLERİ ─────────────── */}
          <div className="mb-8">
            <div className="flex items-center justify-between pb-2 mb-4 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Sipariş Kalemleri
              </h3>
              <Button
                type="dashed"
                icon={<PlusIcon className="w-4 h-4" />}
                onClick={handleAddItem}
                size="small"
                className="!border-slate-300 hover:!border-slate-400 !text-slate-600"
              >
                Kalem Ekle
              </Button>
            </div>
            <Table
              dataSource={items}
              columns={itemColumns}
              pagination={false}
              size="small"
              scroll={{ x: 900 }}
              locale={{ emptyText: 'Henüz kalem eklenmedi' }}
              className="[&_.ant-table-thead>tr>th]:!bg-slate-50 [&_.ant-table-thead>tr>th]:!text-slate-600 [&_.ant-table-thead>tr>th]:!font-medium [&_.ant-table-thead>tr>th]:!border-slate-200 [&_.ant-table-tbody>tr>td]:!border-slate-100"
            />
          </div>

          {/* ─────────────── SİPARİŞ ÖZETİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Sipariş Özeti
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-3">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <div className="text-xl font-semibold text-slate-800">
                    ₺{subtotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Ara Toplam</div>
                </div>
              </div>
              <div className="col-span-3">
                <div className="p-4 bg-red-50 rounded-lg border border-red-200 text-center">
                  <div className="text-xl font-semibold text-red-600">
                    -₺{totalDiscount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">İskonto</div>
                </div>
              </div>
              <div className="col-span-3">
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 text-center">
                  <div className="text-xl font-semibold text-amber-600">
                    ₺{totalTax.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">KDV</div>
                </div>
              </div>
              <div className="col-span-3">
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 text-center">
                  <div className="text-xl font-semibold text-emerald-600">
                    ₺{grandTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Genel Toplam</div>
                </div>
              </div>
            </div>
          </div>

          {/* ─────────────── EK BİLGİLER ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Ek Bilgiler
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Tedarikçi Referans No</label>
                <Form.Item name="supplierReference" className="mb-0">
                  <Input
                    placeholder="Tedarikçi referans no"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Teslim Adresi</label>
                <Form.Item name="deliveryAddress" className="mb-0">
                  <Input
                    placeholder="Teslim adresi"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── NOTLAR ─────────────── */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Notlar
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <Form.Item name="notes" className="mb-0">
                  <TextArea
                    placeholder="Sipariş hakkında notlar..."
                    rows={3}
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
