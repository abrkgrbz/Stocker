'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Button,
  Table,
  Tooltip,
} from 'antd';
import {
  PlusIcon,
  TrashIcon,
  ShoppingCartIcon,
} from '@heroicons/react/24/outline';
import { useCustomers } from '@/lib/api/hooks/useCRM';
import { useProducts } from '@/lib/api/hooks/useInventory';
import type { Customer } from '@/lib/api/services/crm.service';
import type { ProductDto } from '@/lib/api/services/inventory.types';
import type { SalesOrder } from '@/lib/api/services/sales.service';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface OrderItem {
  key: string;
  productId?: string;
  productCode: string;
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  discountRate: number;
  description?: string;
}

interface SalesOrderFormProps {
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: SalesOrder;
  onFinish: (values: any) => void;
  loading?: boolean;
}

const currencyOptions = [
  { value: 'TRY', label: '₺ TRY' },
  { value: 'USD', label: '$ USD' },
  { value: 'EUR', label: '€ EUR' },
];

const vatOptions = [
  { value: 0, label: '%0' },
  { value: 1, label: '%1' },
  { value: 8, label: '%8' },
  { value: 10, label: '%10' },
  { value: 18, label: '%18' },
  { value: 20, label: '%20' },
];

const unitOptions = [
  { value: 'Adet', label: 'Adet' },
  { value: 'Kg', label: 'Kg' },
  { value: 'Lt', label: 'Lt' },
  { value: 'M', label: 'M' },
  { value: 'M2', label: 'M²' },
  { value: 'Paket', label: 'Paket' },
  { value: 'Kutu', label: 'Kutu' },
];

export default function SalesOrderForm({ form, initialValues, onFinish, loading }: SalesOrderFormProps) {
  const [customerSearch, setCustomerSearch] = useState('');
  const [items, setItems] = useState<OrderItem[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState('TRY');

  // Fetch customers
  const { data: customersData, isLoading: customersLoading } = useCustomers({
    searchTerm: customerSearch,
    status: 'Active',
    pageSize: 50,
  });

  // Fetch products for selection
  const { data: productsData, isLoading: productsLoading } = useProducts(false);

  const customerOptions = useMemo(() =>
    customersData?.items?.map((customer: Customer) => ({
      value: customer.id.toString(),
      label: customer.companyName || customer.contactPerson,
      customer,
    })) || [], [customersData]);

  const productOptions = useMemo(() =>
    (productsData || []).map((product: ProductDto) => ({
      value: product.id,
      label: `${product.code} - ${product.name}`,
      product,
    })), [productsData]);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        customerId: initialValues.customerId,
        customerEmail: initialValues.customerEmail,
        orderDate: initialValues.orderDate ? dayjs(initialValues.orderDate) : dayjs(),
        deliveryDate: initialValues.deliveryDate ? dayjs(initialValues.deliveryDate) : undefined,
        currency: initialValues.currency || 'TRY',
        salesPersonName: initialValues.salesPersonName,
        shippingAddress: initialValues.shippingAddress,
        billingAddress: initialValues.billingAddress,
        notes: initialValues.notes,
        discountRate: initialValues.discountRate || 0,
      });
      setSelectedCurrency(initialValues.currency || 'TRY');
      // Convert order items to our format
      if (initialValues.items) {
        setItems(initialValues.items.map((item, index) => ({
          key: `item-${index}`,
          productId: item.productId || undefined,
          productCode: item.productCode,
          productName: item.productName,
          unit: item.unit,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          vatRate: item.vatRate,
          discountRate: item.discountRate || 0,
          description: item.description || undefined,
        })));
      }
    } else {
      form.setFieldsValue({
        orderDate: dayjs(),
        currency: 'TRY',
        discountRate: 0,
      });
      // Add one empty item by default
      setItems([{
        key: 'item-0',
        productCode: '',
        productName: '',
        unit: 'Adet',
        quantity: 1,
        unitPrice: 0,
        vatRate: 18,
        discountRate: 0,
      }]);
    }
  }, [form, initialValues]);

  const handleCustomerSelect = (value: string) => {
    const customer = customerOptions.find((opt: { value: string }) => opt.value === value)?.customer as Customer;
    if (customer) {
      form.setFieldsValue({
        customerEmail: customer.email,
        shippingAddress: customer.address,
        billingAddress: customer.address,
      });
    }
  };

  const handleProductSelect = (productId: number, itemKey: string) => {
    const product = productOptions.find((opt) => opt.value === productId)?.product as ProductDto;
    if (product) {
      setItems(prev => prev.map(item =>
        item.key === itemKey
          ? {
              ...item,
              productId: product.id.toString(),
              productCode: product.code,
              productName: product.name,
              unitPrice: product.unitPrice || 0,
              unit: 'Adet',
            }
          : item
      ));
    }
  };

  const updateItem = (key: string, field: keyof OrderItem, value: any) => {
    setItems(prev => prev.map(item =>
      item.key === key ? { ...item, [field]: value } : item
    ));
  };

  const addItem = () => {
    const newKey = `item-${Date.now()}`;
    setItems(prev => [...prev, {
      key: newKey,
      productCode: '',
      productName: '',
      unit: 'Adet',
      quantity: 1,
      unitPrice: 0,
      vatRate: 18,
      discountRate: 0,
    }]);
  };

  const removeItem = (key: string) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.key !== key));
    }
  };

  // Calculate totals
  const calculations = useMemo(() => {
    let subTotal = 0;
    let totalVat = 0;
    let totalItemDiscount = 0;

    items.forEach(item => {
      const lineTotal = item.quantity * item.unitPrice;
      const lineDiscount = lineTotal * (item.discountRate / 100);
      const lineAfterDiscount = lineTotal - lineDiscount;
      const lineVat = lineAfterDiscount * (item.vatRate / 100);

      subTotal += lineAfterDiscount;
      totalVat += lineVat;
      totalItemDiscount += lineDiscount;
    });

    const orderDiscountRate = form.getFieldValue('discountRate') || 0;
    const orderDiscount = subTotal * (orderDiscountRate / 100);
    const grandTotal = subTotal - orderDiscount + totalVat;

    return {
      subTotal,
      totalVat,
      totalItemDiscount,
      orderDiscount,
      grandTotal,
    };
  }, [items, form]);

  const handleSubmit = () => {
    form.validateFields().then((values: any) => {
      const orderData = {
        ...values,
        orderDate: values.orderDate?.toISOString(),
        deliveryDate: values.deliveryDate?.toISOString(),
        items: items.map((item, index) => ({
          lineNumber: index + 1,
          productId: item.productId,
          productCode: item.productCode,
          productName: item.productName,
          unit: item.unit,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          vatRate: item.vatRate,
          discountRate: item.discountRate,
          description: item.description,
        })),
      };
      onFinish(orderData);
    });
  };

  // Trigger form submit from parent via form.submit()
  useEffect(() => {
    const originalSubmit = form.submit;
    form.submit = () => {
      handleSubmit();
    };
    return () => {
      form.submit = originalSubmit;
    };
  }, [form, items]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: selectedCurrency
    }).format(amount);

  const itemColumns = [
    {
      title: 'Ürün',
      key: 'product',
      width: 280,
      render: (_: any, record: OrderItem) => (
        <div className="space-y-1">
          <Select
            showSearch
            placeholder="Ürün seçin"
            loading={productsLoading}
            filterOption={false}
            onChange={(value) => value && handleProductSelect(Number(value), record.key)}
            value={record.productId}
            options={productOptions}
            className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
            size="small"
            allowClear
          />
          <div className="flex gap-1">
            <Input
              placeholder="Kod"
              value={record.productCode}
              onChange={(e) => updateItem(record.key, 'productCode', e.target.value)}
              size="small"
              className="!w-[45%] !bg-slate-50 !border-slate-300"
            />
            <Input
              placeholder="Ürün adı"
              value={record.productName}
              onChange={(e) => updateItem(record.key, 'productName', e.target.value)}
              size="small"
              className="!w-[55%] !bg-slate-50 !border-slate-300"
            />
          </div>
        </div>
      ),
    },
    {
      title: 'Miktar',
      key: 'quantity',
      width: 100,
      render: (_: any, record: OrderItem) => (
        <InputNumber
          min={0.01}
          value={record.quantity}
          onChange={(value) => updateItem(record.key, 'quantity', value || 0)}
          size="small"
          className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
        />
      ),
    },
    {
      title: 'Birim',
      key: 'unit',
      width: 90,
      render: (_: any, record: OrderItem) => (
        <Select
          value={record.unit}
          onChange={(value) => updateItem(record.key, 'unit', value)}
          options={unitOptions}
          size="small"
          className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
        />
      ),
    },
    {
      title: 'Birim Fiyat',
      key: 'unitPrice',
      width: 120,
      render: (_: any, record: OrderItem) => (
        <InputNumber
          min={0}
          precision={2}
          value={record.unitPrice}
          onChange={(value) => updateItem(record.key, 'unitPrice', value || 0)}
          size="small"
          className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
          prefix={selectedCurrency === 'TRY' ? '₺' : selectedCurrency === 'USD' ? '$' : '€'}
        />
      ),
    },
    {
      title: 'İnd. %',
      key: 'discountRate',
      width: 80,
      render: (_: any, record: OrderItem) => (
        <InputNumber
          min={0}
          max={100}
          value={record.discountRate}
          onChange={(value) => updateItem(record.key, 'discountRate', value || 0)}
          size="small"
          className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
        />
      ),
    },
    {
      title: 'KDV %',
      key: 'vatRate',
      width: 80,
      render: (_: any, record: OrderItem) => (
        <Select
          value={record.vatRate}
          onChange={(value) => updateItem(record.key, 'vatRate', value)}
          options={vatOptions}
          size="small"
          className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
        />
      ),
    },
    {
      title: 'Tutar',
      key: 'total',
      width: 120,
      align: 'right' as const,
      render: (_: any, record: OrderItem) => {
        const lineTotal = record.quantity * record.unitPrice;
        const discount = lineTotal * (record.discountRate / 100);
        const afterDiscount = lineTotal - discount;
        const vat = afterDiscount * (record.vatRate / 100);
        return (
          <span className="font-medium text-slate-900">{formatCurrency(afterDiscount + vat)}</span>
        );
      },
    },
    {
      title: '',
      key: 'actions',
      width: 40,
      render: (_: any, record: OrderItem) => (
        <Tooltip title="Sil">
          <Button
            type="text"
            danger
            icon={<TrashIcon className="w-4 h-4" />}
            onClick={() => removeItem(record.key)}
            disabled={items.length === 1}
            size="small"
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <Form
      form={form}
      layout="vertical"
      disabled={loading}
      className="w-full"
      scrollToFirstError={{ behavior: 'smooth', block: 'center' }}
    >
      {/* Main Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">

        {/* ═══════════════════════════════════════════════════════════════
            HEADER: Icon + Title + Total
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Order Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <ShoppingCartIcon className="w-6 h-6 text-slate-500" />
              </div>
            </div>

            {/* Order Title */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900">
                {initialValues ? `Sipariş: ${initialValues.orderNumber}` : 'Yeni Sipariş'}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {items.length} kalem | {initialValues ? 'Siparişi düzenleyin' : 'Yeni satış siparişi oluşturun'}
              </p>
            </div>

            {/* Total Display */}
            <div className="flex-shrink-0">
              <div className="bg-slate-100 px-6 py-3 rounded-xl text-center">
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                  Genel Toplam
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {formatCurrency(calculations.grandTotal)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            FORM BODY: High-Density Grid Layout
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6">

          {/* ─────────────── MÜŞTERİ BİLGİLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Müşteri Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Müşteri <span className="text-red-500">*</span></label>
                <Form.Item
                  name="customerId"
                  rules={[{ required: true, message: 'Müşteri seçimi zorunludur' }]}
                  className="mb-0"
                >
                  <Select
                    showSearch
                    placeholder="Müşteri seçin veya arayın"
                    loading={customersLoading}
                    filterOption={false}
                    onSearch={setCustomerSearch}
                    onChange={handleCustomerSelect}
                    options={customerOptions}
                    notFoundContent={customersLoading ? 'Yükleniyor...' : 'Müşteri bulunamadı'}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">E-posta</label>
                <Form.Item name="customerEmail" className="mb-0">
                  <Input
                    placeholder="E-posta adresi"
                    type="email"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
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
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Sipariş Tarihi <span className="text-red-500">*</span></label>
                <Form.Item
                  name="orderDate"
                  rules={[{ required: true, message: 'Sipariş tarihi zorunludur' }]}
                  className="mb-0"
                >
                  <DatePicker
                    format="DD/MM/YYYY"
                    placeholder="Tarih seçin"
                    className="!w-full [&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Teslim Tarihi</label>
                <Form.Item name="deliveryDate" className="mb-0">
                  <DatePicker
                    format="DD/MM/YYYY"
                    placeholder="Tarih seçin"
                    className="!w-full [&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Para Birimi</label>
                <Form.Item name="currency" className="mb-0">
                  <Select
                    options={currencyOptions}
                    onChange={setSelectedCurrency}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Satış Temsilcisi</label>
                <Form.Item name="salesPersonName" className="mb-0">
                  <Input
                    placeholder="Satış temsilcisi adı"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── ADRESLER ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Adresler
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Teslimat Adresi</label>
                <Form.Item name="shippingAddress" className="mb-0">
                  <TextArea
                    rows={3}
                    placeholder="Teslimat adresi"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white !resize-none"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Fatura Adresi</label>
                <Form.Item name="billingAddress" className="mb-0">
                  <TextArea
                    rows={3}
                    placeholder="Fatura adresi"
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white !resize-none"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── SİPARİŞ KALEMLERİ ─────────────── */}
          <div className="mb-8">
            <div className="flex items-center justify-between pb-2 mb-4 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Sipariş Kalemleri ({items.length})
              </h3>
              <Button
                type="primary"
                size="small"
                icon={<PlusIcon className="w-4 h-4" />}
                onClick={addItem}
              >
                Kalem Ekle
              </Button>
            </div>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <Table
                columns={itemColumns}
                dataSource={items}
                rowKey="key"
                pagination={false}
                size="small"
                scroll={{ x: 900 }}
                locale={{ emptyText: 'Henüz kalem eklenmedi' }}
                className="[&_.ant-table-thead>tr>th]:!bg-slate-50 [&_.ant-table-thead>tr>th]:!text-slate-600 [&_.ant-table-thead>tr>th]:!font-medium [&_.ant-table-thead>tr>th]:!border-slate-200"
              />
            </div>
          </div>

          {/* ─────────────── SİPARİŞ ÖZETİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Sipariş Özeti
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Sipariş İndirimi (%)</label>
                <Form.Item name="discountRate" className="mb-0">
                  <InputNumber
                    min={0}
                    max={100}
                    placeholder="0"
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Ara Toplam:</span>
                    <span className="font-medium text-slate-900">{formatCurrency(calculations.subTotal)}</span>
                  </div>
                  {calculations.totalItemDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Satır İndirimi:</span>
                      <span className="text-red-600">-{formatCurrency(calculations.totalItemDiscount)}</span>
                    </div>
                  )}
                  {calculations.orderDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Sipariş İndirimi:</span>
                      <span className="text-red-600">-{formatCurrency(calculations.orderDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">KDV Toplam:</span>
                    <span className="font-medium text-slate-900">{formatCurrency(calculations.totalVat)}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-3">
                    <div className="flex justify-between text-lg">
                      <span className="font-semibold text-slate-900">Genel Toplam:</span>
                      <span className="font-bold text-slate-900">{formatCurrency(calculations.grandTotal)}</span>
                    </div>
                  </div>
                </div>
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
                    rows={3}
                    placeholder="Sipariş notlarını buraya yazın..."
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white !resize-none"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Quick Stats for Edit Mode */}
          {initialValues && (
            <div className="mt-8">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                Sipariş Bilgileri
              </h3>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-xs text-slate-500 mb-1">Sipariş Numarası</div>
                    <div className="text-sm font-semibold text-slate-900">{initialValues.orderNumber}</div>
                  </div>
                </div>
                <div className="col-span-6">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-xs text-slate-500 mb-1">Kalem Sayısı</div>
                    <div className="text-sm font-semibold text-slate-900">{initialValues.items?.length || 0}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Hidden submit button */}
      <Form.Item hidden>
        <Button htmlType="submit" />
      </Form.Item>
    </Form>
  );
}
