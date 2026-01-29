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
  ArrowUturnLeftIcon,
} from '@heroicons/react/24/outline';
import { useSalesOrders } from '@/lib/api/hooks/useSales';
import type { SalesReturn, SalesReturnReason, RefundMethod } from '@/lib/api/services/sales.service';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface ReturnItem {
  key: string;
  salesOrderItemId?: string;
  productCode: string;
  productName: string;
  unit: string;
  originalQuantity: number;
  returnQuantity: number;
  unitPrice: number;
  reason: SalesReturnReason;
  condition: string;
  description?: string;
}

interface SalesReturnFormValues {
  salesOrderId: string;
  returnDate: dayjs.Dayjs;
  type: string;
  reason: string;
  refundMethod: string;
  currency: string;
  notes?: string;
}

interface SalesReturnFormProps {
  form: ReturnType<typeof Form.useForm<SalesReturnFormValues>>[0];
  initialValues?: SalesReturn;
  onFinish: (values: any) => void;
  loading?: boolean;
  preselectedOrderId?: string;
}

const currencyOptions = [
  { value: 'TRY', label: '₺ TRY' },
  { value: 'USD', label: '$ USD' },
  { value: 'EUR', label: '€ EUR' },
];

const reasonOptions: { value: SalesReturnReason; label: string }[] = [
  { value: 'Defective', label: 'Kusurlu Ürün' },
  { value: 'WrongItem', label: 'Yanlış Ürün' },
  { value: 'NotAsDescribed', label: 'Tanıma Uygun Değil' },
  { value: 'DamagedInTransit', label: 'Taşımada Hasar' },
  { value: 'ChangedMind', label: 'Fikir Değişikliği' },
  { value: 'Other', label: 'Diğer' },
];

const conditionOptions = [
  { value: 'Good', label: 'İyi Durumda' },
  { value: 'Damaged', label: 'Hasarlı' },
  { value: 'Defective', label: 'Kusurlu' },
  { value: 'Opened', label: 'Açılmış' },
  { value: 'UsedButWorking', label: 'Kullanılmış (Çalışır)' },
];

const refundMethodOptions: { value: RefundMethod; label: string }[] = [
  { value: 'Original', label: 'Orijinal Ödeme Yöntemi' },
  { value: 'Cash', label: 'Nakit' },
  { value: 'BankTransfer', label: 'Havale/EFT' },
  { value: 'Credit', label: 'Müşteri Kredisi' },
  { value: 'Replacement', label: 'Ürün Değişimi' },
];

const returnTypeOptions = [
  { value: 'Full', label: 'Tam İade' },
  { value: 'Partial', label: 'Kısmi İade' },
];

export default function SalesReturnForm({
  form,
  initialValues,
  onFinish,
  loading,
  preselectedOrderId
}: SalesReturnFormProps) {
  const [orderSearch, setOrderSearch] = useState('');
  const [items, setItems] = useState<ReturnItem[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState('TRY');
  const [selectedOrderId, setSelectedOrderId] = useState<string | undefined>(preselectedOrderId);

  // Fetch sales orders
  const { data: ordersData, isLoading: ordersLoading } = useSalesOrders({
    searchTerm: orderSearch,
    status: 'Delivered,Completed',
    pageSize: 50,
  });

  const orderOptions = useMemo(() =>
    ordersData?.items?.map((order) => ({
      value: order.id,
      label: `${order.orderNumber} - ${order.customerName} - ${order.totalAmount.toLocaleString('tr-TR')} ${order.currency}`,
      order,
    })) || [], [ordersData]);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        salesOrderId: initialValues.salesOrderId,
        returnDate: initialValues.returnDate ? dayjs(initialValues.returnDate) : dayjs(),
        type: initialValues.type || 'Partial',
        reason: initialValues.reason,
        refundMethod: initialValues.refundMethod || 'Original',
        currency: initialValues.currency || 'TRY',
        notes: initialValues.notes,
      });
      setSelectedCurrency(initialValues.currency || 'TRY');
      setSelectedOrderId(initialValues.salesOrderId || undefined);
      // Convert return items to our format
      if (initialValues.items) {
        setItems(initialValues.items.map((item, index) => ({
          key: `item-${index}`,
          salesOrderItemId: item.salesOrderItemId,
          productCode: item.productCode || '',
          productName: item.productName,
          unit: item.unit,
          originalQuantity: item.quantityOrdered,
          returnQuantity: item.quantityReturned,
          unitPrice: item.unitPrice,
          reason: 'Defective' as SalesReturnReason,
          condition: item.condition || 'Good',
          description: item.conditionNotes || undefined,
        })));
      }
    } else {
      form.setFieldsValue({
        returnDate: dayjs(),
        type: 'Partial',
        refundMethod: 'Original',
        currency: 'TRY',
      });
      if (preselectedOrderId) {
        form.setFieldValue('salesOrderId', preselectedOrderId);
        setSelectedOrderId(preselectedOrderId);
      }
    }
  }, [form, initialValues, preselectedOrderId]);

  const handleOrderSelect = (orderId: string) => {
    const order = orderOptions.find((opt) => opt.value === orderId)?.order;
    if (order) {
      setSelectedOrderId(orderId);
      setSelectedCurrency(order.currency);
      form.setFieldValue('currency', order.currency);
      // Note: SalesOrderListItem doesn't include items - they need to be fetched separately
      // For now, user can add items manually
      setItems([]);
    }
  };

  const updateItem = (key: string, field: keyof ReturnItem, value: any) => {
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
      originalQuantity: 0,
      returnQuantity: 1,
      unitPrice: 0,
      reason: 'Defective',
      condition: 'Good',
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
    let totalItems = 0;

    items.forEach(item => {
      if (item.returnQuantity > 0) {
        const lineTotal = item.returnQuantity * item.unitPrice;
        subTotal += lineTotal;
        totalItems += item.returnQuantity;
      }
    });

    return {
      subTotal,
      totalItems,
      refundAmount: Math.max(0, subTotal),
    };
  }, [items]);

  const handleSubmit = () => {
    form.validateFields().then((values: any) => {
      const returnData = {
        ...values,
        returnDate: values.returnDate?.toISOString(),
        items: items
          .filter(item => item.returnQuantity > 0)
          .map((item, index) => ({
            lineNumber: index + 1,
            salesOrderItemId: item.salesOrderItemId,
            productCode: item.productCode,
            productName: item.productName,
            unit: item.unit,
            originalQuantity: item.originalQuantity,
            returnQuantity: item.returnQuantity,
            unitPrice: item.unitPrice,
            reason: item.reason,
            condition: item.condition,
            description: item.description,
          })),
      };
      onFinish(returnData);
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
      width: 200,
      render: (_: any, record: ReturnItem) => (
        <div>
          <div className="text-sm font-medium text-slate-900">{record.productName || '-'}</div>
          <div className="text-xs text-slate-500">{record.productCode}</div>
        </div>
      ),
    },
    {
      title: 'Orijinal',
      key: 'originalQuantity',
      width: 80,
      align: 'center' as const,
      render: (_: any, record: ReturnItem) => (
        <span className="text-sm text-slate-600">{record.originalQuantity} {record.unit}</span>
      ),
    },
    {
      title: 'İade Miktarı',
      key: 'returnQuantity',
      width: 120,
      render: (_: any, record: ReturnItem) => (
        <InputNumber
          min={0}
          max={record.originalQuantity}
          value={record.returnQuantity}
          onChange={(value) => updateItem(record.key, 'returnQuantity', value || 0)}
          size="small"
          className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300"
        />
      ),
    },
    {
      title: 'Birim Fiyat',
      key: 'unitPrice',
      width: 100,
      align: 'right' as const,
      render: (_: any, record: ReturnItem) => (
        <span className="text-sm text-slate-900">{formatCurrency(record.unitPrice)}</span>
      ),
    },
    {
      title: 'İade Nedeni',
      key: 'reason',
      width: 150,
      render: (_: any, record: ReturnItem) => (
        <Select
          value={record.reason}
          onChange={(value) => updateItem(record.key, 'reason', value)}
          options={reasonOptions}
          size="small"
          className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
        />
      ),
    },
    {
      title: 'Durum',
      key: 'condition',
      width: 130,
      render: (_: any, record: ReturnItem) => (
        <Select
          value={record.condition}
          onChange={(value) => updateItem(record.key, 'condition', value)}
          options={conditionOptions}
          size="small"
          className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
        />
      ),
    },
    {
      title: 'Tutar',
      key: 'total',
      width: 100,
      align: 'right' as const,
      render: (_: any, record: ReturnItem) => {
        const lineTotal = record.returnQuantity * record.unitPrice;
        return (
          <span className="font-medium text-slate-900">{formatCurrency(lineTotal)}</span>
        );
      },
    },
    {
      title: '',
      key: 'actions',
      width: 40,
      render: (_: any, record: ReturnItem) => (
        <Tooltip title="Kaldır">
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
            HEADER: Icon + Title + Refund Amount
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center gap-6">
            {/* Return Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                <ArrowUturnLeftIcon className="w-6 h-6 text-slate-500" />
              </div>
            </div>

            {/* Return Title */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900">
                {initialValues ? `İade: ${initialValues.returnNumber}` : 'Yeni Satış İadesi'}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {calculations.totalItems} ürün | {initialValues ? 'İadeyi düzenleyin' : 'Yeni satış iadesi oluşturun'}
              </p>
            </div>

            {/* Refund Amount Display */}
            <div className="flex-shrink-0">
              <div className="bg-slate-100 px-6 py-3 rounded-xl text-center">
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                  İade Tutarı
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {formatCurrency(calculations.refundAmount)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            FORM BODY: High-Density Grid Layout
        ═══════════════════════════════════════════════════════════════ */}
        <div className="px-8 py-6">

          {/* ─────────────── SİPARİŞ BİLGİLERİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Sipariş Bilgileri
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Satış Siparişi <span className="text-red-500">*</span></label>
                <Form.Item
                  name="salesOrderId"
                  rules={[{ required: true, message: 'Sipariş seçimi zorunludur' }]}
                  className="mb-0"
                >
                  <Select
                    showSearch
                    placeholder="Sipariş seçin veya arayın"
                    loading={ordersLoading}
                    filterOption={false}
                    onSearch={setOrderSearch}
                    onChange={handleOrderSelect}
                    options={orderOptions}
                    notFoundContent={ordersLoading ? 'Yükleniyor...' : 'Sipariş bulunamadı'}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">İade Türü <span className="text-red-500">*</span></label>
                <Form.Item
                  name="returnType"
                  rules={[{ required: true, message: 'İade türü zorunludur' }]}
                  className="mb-0"
                >
                  <Select
                    options={returnTypeOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Para Birimi</label>
                <Form.Item name="currency" className="mb-0">
                  <Select
                    options={currencyOptions}
                    onChange={setSelectedCurrency}
                    disabled
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── TARİH VE İADE YÖNTEMİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              Tarih ve İade Yöntemi
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">İade Tarihi <span className="text-red-500">*</span></label>
                <Form.Item
                  name="returnDate"
                  rules={[{ required: true, message: 'İade tarihi zorunludur' }]}
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
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Genel İade Nedeni</label>
                <Form.Item name="reason" className="mb-0">
                  <Select
                    options={reasonOptions}
                    placeholder="Neden seçin"
                    allowClear
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">İade Yöntemi <span className="text-red-500">*</span></label>
                <Form.Item
                  name="refundMethod"
                  rules={[{ required: true, message: 'İade yöntemi zorunludur' }]}
                  className="mb-0"
                >
                  <Select
                    options={refundMethodOptions}
                    className="w-full [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector:hover]:!border-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-slate-900 [&_.ant-select-focused_.ant-select-selector]:!bg-white"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* ─────────────── İADE KALEMLERİ ─────────────── */}
          <div className="mb-8">
            <div className="flex items-center justify-between pb-2 mb-4 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                İade Kalemleri ({items.filter(i => i.returnQuantity > 0).length})
              </h3>
              <Button
                type="primary"
                size="small"
                icon={<PlusIcon className="w-4 h-4" />}
                onClick={addItem}
                className="!bg-slate-900 hover:!bg-slate-800"
              >
                Manuel Ekle
              </Button>
            </div>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <Table
                columns={itemColumns}
                dataSource={items}
                rowKey="key"
                pagination={false}
                size="small"
                scroll={{ x: 1000 }}
                locale={{ emptyText: 'Önce sipariş seçin veya manuel ekleyin' }}
                className="[&_.ant-table-thead>tr>th]:!bg-slate-50 [&_.ant-table-thead>tr>th]:!text-slate-600 [&_.ant-table-thead>tr>th]:!font-medium [&_.ant-table-thead>tr>th]:!border-slate-200"
              />
            </div>
          </div>

          {/* ─────────────── İADE ÖZETİ ─────────────── */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
              İade Özeti
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Kargo Ücreti</label>
                <Form.Item name="shippingCost" className="mb-0">
                  <InputNumber
                    min={0}
                    precision={2}
                    placeholder="0.00"
                    prefix={selectedCurrency === 'TRY' ? '₺' : selectedCurrency === 'USD' ? '$' : '€'}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Yeniden Stoklama Ücreti</label>
                <Form.Item name="restockingFee" className="mb-0">
                  <InputNumber
                    min={0}
                    precision={2}
                    placeholder="0.00"
                    prefix={selectedCurrency === 'TRY' ? '₺' : selectedCurrency === 'USD' ? '$' : '€'}
                    className="!w-full [&.ant-input-number]:!bg-slate-50 [&.ant-input-number]:!border-slate-300 [&.ant-input-number:hover]:!border-slate-400 [&.ant-input-number-focused]:!border-slate-900 [&.ant-input-number-focused]:!bg-white"
                  />
                </Form.Item>
              </div>
              <div className="col-span-4">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Ürün Toplamı:</span>
                    <span className="font-medium text-slate-900">{formatCurrency(calculations.subTotal)}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-3">
                    <div className="flex justify-between text-lg">
                      <span className="font-semibold text-slate-900">İade Tutarı:</span>
                      <span className="font-bold text-emerald-600">{formatCurrency(calculations.refundAmount)}</span>
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
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Müşteri Notu</label>
                <Form.Item name="notes" className="mb-0">
                  <TextArea
                    rows={3}
                    placeholder="Müşteriye görünür notlar..."
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white !resize-none"
                  />
                </Form.Item>
              </div>
              <div className="col-span-6">
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Dahili Not</label>
                <Form.Item name="internalNotes" className="mb-0">
                  <TextArea
                    rows={3}
                    placeholder="Sadece ekip için görünür notlar..."
                    className="!bg-slate-50 !border-slate-300 hover:!border-slate-400 focus:!border-slate-900 focus:!ring-1 focus:!ring-slate-900 focus:!bg-white !resize-none"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Edit Mode Info */}
          {initialValues && (
            <div className="mt-8">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 mb-4 border-b border-slate-100">
                İade Bilgileri
              </h3>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-4">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-xs text-slate-500 mb-1">İade Numarası</div>
                    <div className="text-sm font-semibold text-slate-900">{initialValues.returnNumber}</div>
                  </div>
                </div>
                <div className="col-span-4">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-xs text-slate-500 mb-1">Durum</div>
                    <div className="text-sm font-semibold text-slate-900">{initialValues.status}</div>
                  </div>
                </div>
                <div className="col-span-4">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-xs text-slate-500 mb-1">Ürün Sayısı</div>
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
