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
  Divider,
  Space,
  Card as AntCard,
  Table,
  Popconfirm,
} from 'antd';
import {
  PlusIcon,
  TrashIcon,
  DocumentCheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { PageContainer } from '@/components/ui/enterprise-page';
import { useCreateSalesOrder, useUpdateSalesOrder, useSalesOrder } from '../../hooks';
import { showSuccess, showError } from '@/lib/utils/sweetalert';
import type {
  CreateSalesOrderCommand,
  UpdateSalesOrderCommand,
  CreateSalesOrderItemCommand,
  SalesOrder,
} from '../../types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

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
          style={{ width: '100%' }}
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
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Birim Fiyat',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 120,
      render: (_, record) => (
        <InputNumber
          value={record.unitPrice}
          onChange={(value) => updateItem(record.key, 'unitPrice', value || 0)}
          min={0}
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value) => parseFloat(value?.replace(/,/g, '') || '0')}
          style={{ width: '100%' }}
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
          style={{ width: '100%' }}
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
          style={{ width: '100%' }}
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
        <span className="font-medium">{formatCurrency(record.lineTotal)}</span>
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
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">
          {mode === 'create' ? 'Yeni Sipariş' : 'Siparişi Düzenle'}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {mode === 'create'
            ? 'Yeni bir satış siparişi oluşturun'
            : `Sipariş #${existingOrder?.orderNumber}`}
        </p>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          currency: 'TRY',
          orderDate: dayjs(),
        }}
      >
        {/* Customer & Date Section */}
        <AntCard title="Müşteri Bilgileri" className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item
              name="customerName"
              label="Müşteri Adı"
              rules={[{ required: true, message: 'Müşteri adı zorunludur' }]}
            >
              <Input placeholder="Müşteri adını girin" />
            </Form.Item>
            <Form.Item name="customerEmail" label="E-posta">
              <Input type="email" placeholder="ornek@email.com" />
            </Form.Item>
            <Form.Item name="currency" label="Para Birimi">
              <Select
                options={[
                  { value: 'TRY', label: '₺ TRY' },
                  { value: 'USD', label: '$ USD' },
                  { value: 'EUR', label: '€ EUR' },
                ]}
              />
            </Form.Item>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item name="orderDate" label="Sipariş Tarihi">
              <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
            </Form.Item>
            <Form.Item name="deliveryDate" label="Teslim Tarihi">
              <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
            </Form.Item>
          </div>
        </AntCard>

        {/* Items Section */}
        <AntCard
          title="Sipariş Kalemleri"
          className="mb-6"
          extra={
            <Button type="primary" icon={<PlusIcon className="w-4 h-4" />} onClick={addItem}>
              Kalem Ekle
            </Button>
          }
        >
          <Table
            columns={itemColumns}
            dataSource={items}
            rowKey="key"
            pagination={false}
            scroll={{ x: 900 }}
            locale={{ emptyText: 'Henüz ürün eklenmedi' }}
          />
        </AntCard>

        {/* Summary Section */}
        <AntCard title="Özet" className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Form.Item name="shippingAddress" label="Teslimat Adresi">
                <Input.TextArea rows={3} placeholder="Teslimat adresi" />
              </Form.Item>
              <Form.Item name="notes" label="Notlar">
                <Input.TextArea rows={3} placeholder="Sipariş notları" />
              </Form.Item>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Ara Toplam:</span>
                  <span className="font-medium">{formatCurrency(totals.subTotal)}</span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-slate-600">Sipariş İskontosu (%):</span>
                  <Form.Item name="discountRate" noStyle>
                    <InputNumber
                      min={0}
                      max={100}
                      style={{ width: 80 }}
                      onChange={() => form.validateFields()}
                    />
                  </Form.Item>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">İskonto Tutarı:</span>
                  <span className="text-red-600">-{formatCurrency(totals.orderDiscount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">KDV:</span>
                  <span className="font-medium">{formatCurrency(totals.vatAmount)}</span>
                </div>
                <Divider className="my-2" />
                <div className="flex justify-between text-lg">
                  <span className="font-semibold text-slate-900">Genel Toplam:</span>
                  <span className="font-bold text-indigo-600">{formatCurrency(totals.grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </AntCard>

        {/* Actions */}
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
      </Form>
    </PageContainer>
  );
}
