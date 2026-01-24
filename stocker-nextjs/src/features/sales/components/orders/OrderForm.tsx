'use client';

/**
 * OrderForm Component
 * Full page form for creating/editing sales orders
 * Feature-Based Architecture - Smart Component
 */

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Button,
  Table,
  Popconfirm,
} from 'antd';
import {
  PlusIcon,
  TrashIcon,
  DocumentCheckIcon,
  XMarkIcon,
  ShoppingCartIcon,
} from '@heroicons/react/24/outline';
import { PageContainer } from '@/components/ui/enterprise-page';
import { useCreateSalesOrder, useUpdateSalesOrder, useSalesOrder } from '../../hooks';
import { showSuccess, showError } from '@/lib/utils/sweetalert';
import type {
  CreateSalesOrderCommand,
  UpdateSalesOrderCommand,
  CreateSalesOrderItemCommand,
} from '../../types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface OrderFormProps {
  orderId?: string;
  mode: 'create' | 'edit';
}

interface OrderItemFormData {
  key: string;
  productId?: string;
  productCode: string;
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  discountRate: number;
  lineTotal: number;
}

const defaultItem: Omit<OrderItemFormData, 'key'> = {
  productCode: '',
  productName: '',
  unit: 'Adet',
  quantity: 1,
  unitPrice: 0,
  vatRate: 20,
  discountRate: 0,
  lineTotal: 0,
};

export function OrderForm({ orderId, mode }: OrderFormProps) {
  const router = useRouter();
  const [form] = Form.useForm();
  const [items, setItems] = useState<OrderItemFormData[]>([]);

  const { data: existingOrder, isLoading: isLoadingOrder } = useSalesOrder(orderId || '');
  const createMutation = useCreateSalesOrder();
  const updateMutation = useUpdateSalesOrder();

  // Initialize form with existing order data
  React.useEffect(() => {
    if (mode === 'edit' && existingOrder) {
      form.setFieldsValue({
        customerName: existingOrder.customerName,
        customerEmail: existingOrder.customerEmail,
        orderDate: existingOrder.orderDate ? dayjs(existingOrder.orderDate) : undefined,
        deliveryDate: existingOrder.deliveryDate ? dayjs(existingOrder.deliveryDate) : undefined,
        currency: existingOrder.currency || 'TRY',
        shippingAddress: existingOrder.shippingAddress,
        billingAddress: existingOrder.billingAddress,
        notes: existingOrder.notes,
        discountRate: existingOrder.discountRate,
      });

      const existingItems: OrderItemFormData[] = existingOrder.items.map((item, index) => ({
        key: `${index}`,
        productId: item.productId,
        productCode: item.productCode,
        productName: item.productName,
        unit: item.unit,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        vatRate: item.vatRate,
        discountRate: item.discountRate,
        lineTotal: item.lineTotal,
      }));
      setItems(existingItems);
    }
  }, [existingOrder, mode, form]);

  const calculateLineTotal = useCallback((item: OrderItemFormData): number => {
    const subtotal = item.quantity * item.unitPrice;
    const discount = subtotal * (item.discountRate / 100);
    const afterDiscount = subtotal - discount;
    const vat = afterDiscount * (item.vatRate / 100);
    return afterDiscount + vat;
  }, []);

  const updateItem = useCallback((key: string, field: keyof OrderItemFormData, value: any) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.key !== key) return item;
        const updated = { ...item, [field]: value };
        updated.lineTotal = calculateLineTotal(updated);
        return updated;
      })
    );
  }, [calculateLineTotal]);

  const addItem = useCallback(() => {
    const newKey = `${Date.now()}`;
    setItems((prev) => [...prev, { ...defaultItem, key: newKey, lineTotal: 0 }]);
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((prev) => prev.filter((item) => item.key !== key));
  }, []);

  const totals = useMemo(() => {
    const subTotal = items.reduce((sum, item) => {
      const subtotal = item.quantity * item.unitPrice;
      const discount = subtotal * (item.discountRate / 100);
      return sum + (subtotal - discount);
    }, 0);

    const vatAmount = items.reduce((sum, item) => {
      const subtotal = item.quantity * item.unitPrice;
      const discount = subtotal * (item.discountRate / 100);
      const afterDiscount = subtotal - discount;
      return sum + afterDiscount * (item.vatRate / 100);
    }, 0);

    const discountRate = form.getFieldValue('discountRate') || 0;
    const orderDiscount = subTotal * (discountRate / 100);
    const grandTotal = subTotal - orderDiscount + vatAmount;

    return { subTotal, vatAmount, orderDiscount, grandTotal };
  }, [items, form]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: form.getFieldValue('currency') || 'TRY',
    }).format(amount);
  };

  const handleSubmit = async (values: any) => {
    if (items.length === 0) {
      showError('Lütfen en az bir ürün ekleyin');
      return;
    }

    const orderItems: CreateSalesOrderItemCommand[] = items.map((item) => ({
      productId: item.productId,
      productCode: item.productCode,
      productName: item.productName,
      unit: item.unit,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      vatRate: item.vatRate,
      discountRate: item.discountRate,
    }));

    try {
      if (mode === 'create') {
        const command: CreateSalesOrderCommand = {
          orderDate: values.orderDate?.toISOString() || new Date().toISOString(),
          customerName: values.customerName,
          customerEmail: values.customerEmail,
          currency: values.currency || 'TRY',
          shippingAddress: values.shippingAddress,
          billingAddress: values.billingAddress,
          notes: values.notes,
          deliveryDate: values.deliveryDate?.toISOString(),
          discountRate: values.discountRate,
          items: orderItems,
        };
        await createMutation.mutateAsync(command);
        showSuccess('Başarılı', 'Sipariş oluşturuldu');
        router.push('/sales/orders');
      } else if (orderId) {
        const command: UpdateSalesOrderCommand = {
          id: orderId,
          customerName: values.customerName,
          customerEmail: values.customerEmail,
          currency: values.currency,
          shippingAddress: values.shippingAddress,
          billingAddress: values.billingAddress,
          notes: values.notes,
          deliveryDate: values.deliveryDate?.toISOString(),
          discountRate: values.discountRate,
        };
        await updateMutation.mutateAsync({ id: orderId, data: command });
        showSuccess('Başarılı', 'Sipariş güncellendi');
        router.push(`/sales/orders/${orderId}`);
      }
    } catch {
      showError(mode === 'create' ? 'Sipariş oluşturulamadı' : 'Sipariş güncellenemedi');
    }
  };

  const itemColumns: ColumnsType<OrderItemFormData> = [
    {
      title: 'Ürün Kodu',
      dataIndex: 'productCode',
      key: 'productCode',
      width: 120,
      render: (_, record) => (
        <Input
          value={record.productCode}
          onChange={(e) => updateItem(record.key, 'productCode', e.target.value)}
          placeholder="Kod"
          className="!bg-slate-50 !border-slate-300"
        />
      ),
    },
    {
      title: 'Ürün Adı',
      dataIndex: 'productName',
      key: 'productName',
      render: (_, record) => (
        <Input
          value={record.productName}
          onChange={(e) => updateItem(record.key, 'productName', e.target.value)}
          placeholder="Ürün adı"
          className="!bg-slate-50 !border-slate-300"
        />
      ),
    },
    {
      title: 'Birim',
      dataIndex: 'unit',
      key: 'unit',
      width: 100,
      render: (_, record) => (
        <Select
          value={record.unit}
          onChange={(value) => updateItem(record.key, 'unit', value)}
          options={[
            { value: 'Adet', label: 'Adet' },
            { value: 'Kg', label: 'Kg' },
            { value: 'Lt', label: 'Lt' },
            { value: 'M', label: 'Metre' },
            { value: 'Kutu', label: 'Kutu' },
          ]}
          className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
        />
      ),
    },
    {
      title: 'Miktar',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      render: (_, record) => (
        <InputNumber
          value={record.quantity}
          onChange={(value) => updateItem(record.key, 'quantity', value || 0)}
          min={1}
          className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
        />
      ),
    },
    {
      title: 'Birim Fiyat',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 120,
      render: (_, record) => (
        <InputNumber<number>
          value={record.unitPrice}
          onChange={(value) => updateItem(record.key, 'unitPrice', value || 0)}
          min={0}
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value) => parseFloat(value?.replace(/,/g, '') || '0')}
          className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
        />
      ),
    },
    {
      title: 'İsk. %',
      dataIndex: 'discountRate',
      key: 'discountRate',
      width: 80,
      render: (_, record) => (
        <InputNumber
          value={record.discountRate}
          onChange={(value) => updateItem(record.key, 'discountRate', value || 0)}
          min={0}
          max={100}
          className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
        />
      ),
    },
    {
      title: 'KDV %',
      dataIndex: 'vatRate',
      key: 'vatRate',
      width: 80,
      render: (_, record) => (
        <Select
          value={record.vatRate}
          onChange={(value) => updateItem(record.key, 'vatRate', value)}
          options={[
            { value: 0, label: '0%' },
            { value: 1, label: '1%' },
            { value: 10, label: '10%' },
            { value: 20, label: '20%' },
          ]}
          className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
        />
      ),
    },
    {
      title: 'Tutar',
      dataIndex: 'lineTotal',
      key: 'lineTotal',
      width: 120,
      align: 'right',
      render: (_, record) => (
        <span className="font-medium text-slate-900">{formatCurrency(record.lineTotal)}</span>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (_, record) => (
        <Popconfirm
          title="Bu satırı silmek istediğinizden emin misiniz?"
          onConfirm={() => removeItem(record.key)}
          okText="Evet"
          cancelText="Hayır"
        >
          <Button type="text" danger icon={<TrashIcon className="w-4 h-4" />} />
        </Popconfirm>
      ),
    },
  ];

  if (mode === 'edit' && isLoadingOrder) {
    return (
      <PageContainer maxWidth="6xl">
        <div className="flex items-center justify-center py-20">
          <div className="text-slate-500">Yükleniyor...</div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="6xl">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          currency: 'TRY',
          orderDate: dayjs(),
        }}
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
                  {mode === 'create' ? 'Yeni Sipariş' : `Sipariş: ${existingOrder?.orderNumber}`}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {items.length} kalem | {mode === 'create' ? 'Yeni satış siparişi oluşturun' : 'Siparişi düzenleyin'}
                </p>
              </div>

              {/* Total Display */}
              <div className="flex-shrink-0">
                <div className="bg-slate-100 px-6 py-3 rounded-xl text-center">
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                    Genel Toplam
                  </div>
                  <div className="text-2xl font-bold text-slate-900">
                    {formatCurrency(totals.grandTotal)}
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
                <div className="col-span-4">
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Müşteri Adı <span className="text-red-500">*</span></label>
                  <Form.Item
                    name="customerName"
                    rules={[{ required: true, message: 'Müşteri adı zorunludur' }]}
                    className="mb-0"
                  >
                    <Input
                      placeholder="Müşteri adını girin"
                      className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                    />
                  </Form.Item>
                </div>
                <div className="col-span-4">
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">E-posta</label>
                  <Form.Item name="customerEmail" className="mb-0">
                    <Input
                      type="email"
                      placeholder="ornek@email.com"
                      className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white"
                    />
                  </Form.Item>
                </div>
                <div className="col-span-4">
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Para Birimi</label>
                  <Form.Item name="currency" className="mb-0">
                    <Select
                      options={[
                        { value: 'TRY', label: '₺ TRY' },
                        { value: 'USD', label: '$ USD' },
                        { value: 'EUR', label: '€ EUR' },
                      ]}
                      className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                    />
                  </Form.Item>
                </div>
              </div>
            </div>

            {/* ─────────────── TARİH BİLGİLERİ ─────────────── */}
            <div className="mb-8">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                Tarih Bilgileri
              </h3>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Sipariş Tarihi</label>
                  <Form.Item name="orderDate" className="mb-0">
                    <DatePicker
                      format="DD/MM/YYYY"
                      placeholder="Tarih seçin"
                      className="!w-full [&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white"
                    />
                  </Form.Item>
                </div>
                <div className="col-span-6">
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Teslim Tarihi</label>
                  <Form.Item name="deliveryDate" className="mb-0">
                    <DatePicker
                      format="DD/MM/YYYY"
                      placeholder="Tarih seçin"
                      className="!w-full [&.ant-picker]:!bg-slate-50 [&.ant-picker]:!border-slate-300 [&.ant-picker:hover]:!border-slate-400 [&.ant-picker-focused]:!border-slate-900 [&.ant-picker-focused]:!bg-white"
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
                  scroll={{ x: 900 }}
                  locale={{ emptyText: 'Henüz ürün eklenmedi' }}
                  className="[&_.ant-table-thead>tr>th]:!bg-slate-50 [&_.ant-table-thead>tr>th]:!text-slate-600 [&_.ant-table-thead>tr>th]:!font-medium [&_.ant-table-thead>tr>th]:!border-slate-200"
                />
              </div>
            </div>

            {/* ─────────────── ADRES VE NOTLAR ─────────────── */}
            <div className="mb-8">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                Adres ve Notlar
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
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">Notlar</label>
                  <Form.Item name="notes" className="mb-0">
                    <TextArea
                      rows={3}
                      placeholder="Sipariş notları"
                      className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white !resize-none"
                    />
                  </Form.Item>
                </div>
              </div>
            </div>

            {/* ─────────────── SİPARİŞ ÖZETİ ─────────────── */}
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                Sipariş Özeti
              </h3>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-xs text-slate-500 mb-1">Sipariş İskontosu (%)</div>
                    <Form.Item name="discountRate" className="mb-0">
                      <InputNumber
                        min={0}
                        max={100}
                        placeholder="0"
                        onChange={() => form.validateFields()}
                        className="!w-full [&.ant-input-number]:!bg-white [&.ant-input-number]:!border-slate-300"
                      />
                    </Form.Item>
                  </div>
                </div>
                <div className="col-span-6">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Ara Toplam:</span>
                      <span className="font-medium text-slate-900">{formatCurrency(totals.subTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">İskonto Tutarı:</span>
                      <span className="text-red-600">-{formatCurrency(totals.orderDiscount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">KDV:</span>
                      <span className="font-medium text-slate-900">{formatCurrency(totals.vatAmount)}</span>
                    </div>
                    <div className="border-t border-slate-200 pt-3">
                      <div className="flex justify-between text-lg">
                        <span className="font-semibold text-slate-900">Genel Toplam:</span>
                        <span className="font-bold text-slate-900">{formatCurrency(totals.grandTotal)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ═══════════════════════════════════════════════════════════════
              FOOTER: Action Buttons
          ═══════════════════════════════════════════════════════════════ */}
          <div className="px-8 py-4 border-t border-slate-200 bg-slate-50 rounded-b-xl">
            <div className="flex items-center justify-end gap-3">
              <Button
                icon={<XMarkIcon className="w-4 h-4" />}
                onClick={() => router.back()}
              >
                İptal
              </Button>
              <Button
                type="primary"
                icon={<DocumentCheckIcon className="w-4 h-4" />}
                htmlType="submit"
                loading={createMutation.isPending || updateMutation.isPending}
              >
                {mode === 'create' ? 'Sipariş Oluştur' : 'Değişiklikleri Kaydet'}
              </Button>
            </div>
          </div>

        </div>

        {/* Hidden submit */}
        <Form.Item hidden>
          <button type="submit" />
        </Form.Item>
      </Form>
    </PageContainer>
  );
}
