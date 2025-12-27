'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Row,
  Col,
  Table,
  Tabs,
  message,
  Spin,
} from 'antd';
import {
  ArrowLeftIcon,
  ArrowUturnLeftIcon,
  CheckIcon,
  DocumentTextIcon,
  InformationCircleIcon,
  LinkIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useCreatePurchaseReturn, useSuppliers, usePurchaseOrders, useGoodsReceipts, usePurchaseInvoices } from '@/lib/api/hooks/usePurchase';
import { useProducts } from '@/lib/api/hooks/useInventory';
import { PurchaseReturnItemReason, ItemCondition } from '@/lib/api/services/purchase.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface ReturnItem {
  key: string;
  productId?: string;
  productCode: string;
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  reason: PurchaseReturnItemReason;
  condition: ItemCondition;
  reasonDescription?: string;
  lotNumber?: string;
  serialNumber?: string;
}

const typeOptions = [
  { value: 'Standard', label: 'Standart Iade' },
  { value: 'Defective', label: 'Kusurlu Urun Iadesi' },
  { value: 'Warranty', label: 'Garanti Iadesi' },
  { value: 'Exchange', label: 'Urun Degisimi' },
];

const reasonOptions = [
  { value: 'Defective', label: 'Kusurlu' },
  { value: 'WrongItem', label: 'Yanlis Urun' },
  { value: 'WrongQuantity', label: 'Yanlis Miktar' },
  { value: 'Damaged', label: 'Hasarli' },
  { value: 'QualityIssue', label: 'Kalite Sorunu' },
  { value: 'Expired', label: 'Vadesi Gecmis' },
  { value: 'NotAsDescribed', label: 'Tanimlandigi Gibi Degil' },
  { value: 'Other', label: 'Diger' },
];

const refundMethodOptions = [
  { value: 'Credit', label: 'Alacak' },
  { value: 'BankTransfer', label: 'Havale/EFT' },
  { value: 'Check', label: 'Cek' },
  { value: 'Cash', label: 'Nakit' },
  { value: 'Replacement', label: 'Urun Degisimi' },
];

const conditionOptions = [
  { value: 'Good', label: 'Iyi' },
  { value: 'Damaged', label: 'Hasarli' },
  { value: 'Defective', label: 'Kusurlu' },
  { value: 'Expired', label: 'Vadesi Gecmis' },
  { value: 'Other', label: 'Diger' },
];

const vatRateOptions = [
  { value: 0, label: '%0' },
  { value: 1, label: '%1' },
  { value: 10, label: '%10' },
  { value: 20, label: '%20' },
];

const currencyOptions = [
  { value: 'TRY', label: 'TRY' },
  { value: 'USD', label: '$ USD' },
  { value: 'EUR', label: 'EUR' },
];

export default function NewPurchaseReturnPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const receiptId = searchParams.get('receiptId');
  const invoiceId = searchParams.get('invoiceId');
  const [form] = Form.useForm();

  const createReturn = useCreatePurchaseReturn();
  const { data: suppliersData, isLoading: loadingSuppliers } = useSuppliers({ pageSize: 1000 });
  const { data: ordersData, isLoading: loadingOrders } = usePurchaseOrders({ pageSize: 1000 });
  const { data: receiptsData, isLoading: loadingReceipts } = useGoodsReceipts({ pageSize: 1000 });
  const { data: invoicesData, isLoading: loadingInvoices } = usePurchaseInvoices({ pageSize: 1000 });
  const { data: productsData, isLoading: loadingProducts } = useProducts();

  const [items, setItems] = useState<ReturnItem[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState('TRY');

  const suppliers = suppliersData?.items || [];
  const orders = ordersData?.items || [];
  const receipts = receiptsData?.items || [];
  const invoices = invoicesData?.items || [];
  const products = productsData || [];

  const isDataLoading = loadingSuppliers || loadingOrders || loadingReceipts || loadingInvoices || loadingProducts;

  const addItem = () => {
    const newItem: ReturnItem = {
      key: Date.now().toString(),
      productCode: '',
      productName: '',
      unit: 'Adet',
      quantity: 1,
      unitPrice: 0,
      vatRate: 20,
      reason: PurchaseReturnItemReason.Defective,
      condition: ItemCondition.Defective,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (key: string) => {
    setItems(items.filter(item => item.key !== key));
  };

  const updateItem = (key: string, field: string, value: any) => {
    setItems(items.map(item =>
      item.key === key ? { ...item, [field]: value } : item
    ));
  };

  const handleProductSelect = (key: string, productId: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setItems(items.map(item =>
        item.key === key ? {
          ...item,
          productId: String(productId),
          productCode: product.code,
          productName: product.name,
          unit: product.unitSymbol || product.unitName || 'Adet',
          unitPrice: product.costPrice || 0,
        } : item
      ));
    }
  };

  const calculateItemTotal = (item: ReturnItem) => {
    const subTotal = item.quantity * item.unitPrice;
    const vatAmount = subTotal * (item.vatRate / 100);
    return subTotal + vatAmount;
  };

  const calculateTotals = () => {
    let subTotal = 0;
    let totalVat = 0;

    items.forEach(item => {
      const itemSubTotal = item.quantity * item.unitPrice;
      const itemVat = itemSubTotal * (item.vatRate / 100);
      subTotal += itemSubTotal;
      totalVat += itemVat;
    });

    const total = subTotal + totalVat;
    return { subTotal, totalVat, total };
  };

  const totals = calculateTotals();

  const getCurrencySymbol = () => {
    switch (selectedCurrency) {
      case 'USD': return '$';
      case 'EUR': return '';
      default: return '';
    }
  };

  const handleSave = async (values: any) => {
    if (items.length === 0) {
      message.error('En az bir kalem eklemelisiniz');
      return;
    }

    try {
      await createReturn.mutateAsync({
        ...values,
        returnDate: values.returnDate?.toISOString(),
        currency: selectedCurrency,
        items: items.map(item => ({
          productId: item.productId,
          productCode: item.productCode,
          productName: item.productName,
          unit: item.unit,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          vatRate: item.vatRate,
          reason: item.reason,
          condition: item.condition,
          reasonDescription: item.reasonDescription,
          lotNumber: item.lotNumber,
          serialNumber: item.serialNumber,
        })),
      });
      message.success('Iade talebi basariyla olusturuldu');
      router.push('/purchase/returns');
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleCancel = () => {
    router.push('/purchase/returns');
  };

  const isLoading = createReturn.isPending;

  const itemColumns = [
    {
      title: 'Urun',
      key: 'product',
      width: 200,
      render: (record: ReturnItem) => (
        <Select
          placeholder="Urun secin"
          showSearch
          optionFilterProp="children"
          value={record.productId}
          onChange={(value) => handleProductSelect(record.key, Number(value))}
          style={{ width: '100%' }}
          variant="filled"
        >
          {products.map(product => (
            <Select.Option key={product.id} value={product.id}>
              {product.code} - {product.name}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Miktar',
      key: 'quantity',
      width: 90,
      render: (record: ReturnItem) => (
        <InputNumber
          min={0.01}
          step={1}
          value={record.quantity}
          onChange={(value) => updateItem(record.key, 'quantity', value || 0)}
          style={{ width: '100%' }}
          variant="filled"
        />
      ),
    },
    {
      title: 'Birim Fiyat',
      key: 'unitPrice',
      width: 100,
      render: (record: ReturnItem) => (
        <InputNumber
          min={0}
          step={0.01}
          value={record.unitPrice}
          onChange={(value) => updateItem(record.key, 'unitPrice', value || 0)}
          style={{ width: '100%' }}
          variant="filled"
        />
      ),
    },
    {
      title: 'KDV',
      key: 'vatRate',
      width: 80,
      render: (record: ReturnItem) => (
        <Select
          value={record.vatRate}
          onChange={(value) => updateItem(record.key, 'vatRate', value)}
          style={{ width: '100%' }}
          variant="filled"
        >
          {vatRateOptions.map(opt => (
            <Select.Option key={opt.value} value={opt.value}>{opt.label}</Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Sebep',
      key: 'reason',
      width: 130,
      render: (record: ReturnItem) => (
        <Select
          value={record.reason}
          onChange={(value) => updateItem(record.key, 'reason', value)}
          style={{ width: '100%' }}
          variant="filled"
        >
          {reasonOptions.map(opt => (
            <Select.Option key={opt.value} value={opt.value}>{opt.label}</Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Durum',
      key: 'condition',
      width: 110,
      render: (record: ReturnItem) => (
        <Select
          value={record.condition}
          onChange={(value) => updateItem(record.key, 'condition', value)}
          style={{ width: '100%' }}
          variant="filled"
        >
          {conditionOptions.map(opt => (
            <Select.Option key={opt.value} value={opt.value}>{opt.label}</Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Toplam',
      key: 'total',
      width: 100,
      align: 'right' as const,
      render: (record: ReturnItem) => (
        <span className="font-medium text-slate-900">
          {calculateItemTotal(record).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {getCurrencySymbol()}
        </span>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (record: ReturnItem) => (
        <button
          type="button"
          onClick={() => removeItem(record.key)}
          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'info',
      label: (
        <span className="flex items-center gap-1.5">
          <InformationCircleIcon className="w-4 h-4" />
          Iade Bilgileri
        </span>
      ),
      children: (
        <div className="space-y-6">
          {/* Basic Info Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 bg-slate-900 rounded-full"></div>
              <span className="text-sm font-medium text-slate-700">Temel Bilgiler</span>
            </div>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <div className="text-xs text-slate-400 mb-1">Tedarikci *</div>
                <Form.Item
                  name="supplierId"
                  className="mb-4"
                  rules={[{ required: true, message: 'Tedarikci secin' }]}
                >
                  <Select
                    placeholder="Tedarikci secin"
                    showSearch
                    optionFilterProp="children"
                    variant="filled"
                    loading={loadingSuppliers}
                  >
                    {suppliers.map(supplier => (
                      <Select.Option key={supplier.id} value={supplier.id}>
                        {supplier.code} - {supplier.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <div className="text-xs text-slate-400 mb-1">Iade Tarihi *</div>
                <Form.Item
                  name="returnDate"
                  className="mb-4"
                  rules={[{ required: true, message: 'Tarih secin' }]}
                >
                  <DatePicker className="w-full" format="DD.MM.YYYY" variant="filled" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <div className="text-xs text-slate-400 mb-1">Iade Tipi</div>
                <Form.Item name="type" className="mb-4">
                  <Select options={typeOptions} variant="filled" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <div className="text-xs text-slate-400 mb-1">Iade Sebebi</div>
                <Form.Item name="reason" className="mb-4">
                  <Select options={reasonOptions} variant="filled" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <div className="text-xs text-slate-400 mb-1">Iade Yontemi</div>
                <Form.Item name="refundMethod" className="mb-4">
                  <Select placeholder="Secin (opsiyonel)" allowClear options={refundMethodOptions} variant="filled" />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <div className="text-xs text-slate-400 mb-1">Sebep Detayi</div>
                <Form.Item name="reasonDetails" className="mb-0">
                  <TextArea rows={2} placeholder="Iade sebebini detayli aciklayin..." variant="filled" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Divider */}
          <div className="h-px bg-slate-200"></div>

          {/* Currency Settings */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 bg-slate-900 rounded-full"></div>
              <span className="text-sm font-medium text-slate-700">Para Birimi</span>
            </div>
            <Row gutter={16}>
              <Col xs={12} md={8}>
                <div className="text-xs text-slate-400 mb-1">Para Birimi</div>
                <Form.Item name="currency" className="mb-0">
                  <Select
                    options={currencyOptions}
                    variant="filled"
                    onChange={(value) => setSelectedCurrency(value)}
                  />
                </Form.Item>
              </Col>
              {selectedCurrency !== 'TRY' && (
                <Col xs={12} md={8}>
                  <div className="text-xs text-slate-400 mb-1">Doviz Kuru</div>
                  <Form.Item name="exchangeRate" className="mb-0">
                    <InputNumber min={0} step={0.0001} className="w-full" variant="filled" />
                  </Form.Item>
                </Col>
              )}
            </Row>
          </div>
        </div>
      ),
    },
    {
      key: 'documents',
      label: (
        <span className="flex items-center gap-1.5">
          <LinkIcon className="w-4 h-4" />
          Iliskili Belgeler
        </span>
      ),
      children: (
        <div className="space-y-4">
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <div className="text-xs text-slate-400 mb-1">Siparis</div>
              <Form.Item name="purchaseOrderId" className="mb-4">
                <Select
                  placeholder="Secin (opsiyonel)"
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  variant="filled"
                  loading={loadingOrders}
                >
                  {orders.map(order => (
                    <Select.Option key={order.id} value={order.id}>
                      {order.orderNumber}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <div className="text-xs text-slate-400 mb-1">Mal Alim</div>
              <Form.Item name="goodsReceiptId" className="mb-4">
                <Select
                  placeholder="Secin (opsiyonel)"
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  variant="filled"
                  loading={loadingReceipts}
                >
                  {receipts.map(receipt => (
                    <Select.Option key={receipt.id} value={receipt.id}>
                      {receipt.receiptNumber}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <div className="text-xs text-slate-400 mb-1">Fatura</div>
              <Form.Item name="purchaseInvoiceId" className="mb-4">
                <Select
                  placeholder="Secin (opsiyonel)"
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  variant="filled"
                  loading={loadingInvoices}
                >
                  {invoices.map(invoice => (
                    <Select.Option key={invoice.id} value={invoice.id}>
                      {invoice.invoiceNumber}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-500">
            <p className="mb-2">Iliskili belge secimi opsiyoneldir.</p>
            <p className="mb-2">Siparis, mal alim veya fatura ile iliskilendirme yapabilirsiniz.</p>
            <p>Bu baglanti raporlama ve takip icin kullanilir.</p>
          </div>
        </div>
      ),
    },
    {
      key: 'notes',
      label: (
        <span className="flex items-center gap-1.5">
          <DocumentTextIcon className="w-4 h-4" />
          Notlar
        </span>
      ),
      children: (
        <div className="space-y-4">
          <div>
            <div className="text-xs text-slate-400 mb-1">Genel Not</div>
            <Form.Item name="notes" className="mb-4">
              <TextArea rows={3} placeholder="Genel notlar..." variant="filled" />
            </Form.Item>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">Dahili Not (Tedarikciye gosterilmez)</div>
            <Form.Item name="internalNotes" className="mb-0">
              <TextArea rows={3} placeholder="Dahili not (sadece sirket ici gorunur)..." variant="filled" />
            </Form.Item>
          </div>
        </div>
      ),
    },
  ];

  if (isDataLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-4">
          <ArrowUturnLeftIcon className="w-8 h-8 text-white" />
        </div>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleCancel}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                  <ArrowUturnLeftIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-slate-900">
                    Yeni Satin Alma Iadesi
                  </h1>
                  <p className="text-sm text-slate-500">
                    Tedarikciye iade talebi olusturun
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                <XMarkIcon className="w-4 h-4" />
                Iptal
              </button>
              <button
                onClick={() => form.submit()}
                disabled={isLoading}
                className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                <CheckIcon className="w-4 h-4" />
                {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{
            returnDate: dayjs(),
            type: 'Standard',
            reason: 'Defective',
            currency: 'TRY',
            exchangeRate: 1,
          }}
        >
          <Row gutter={32}>
            {/* Left Panel - Visual & Summary */}
            <Col xs={24} lg={9}>
              <div className="sticky top-28 space-y-6">
                {/* Visual Card */}
                <div className="bg-white border border-slate-200 rounded-xl p-8">
                  <div className="text-center mb-6">
                    <div className="w-24 h-24 mx-auto bg-slate-900 rounded-2xl flex items-center justify-center mb-4">
                      <ArrowUturnLeftIcon className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">
                      Satin Alma Iadesi
                    </h3>
                    <p className="text-sm text-slate-500">
                      Tedarikciye iade edilecek urunler
                    </p>
                  </div>

                  {/* Summary Stats */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-500">Kalem Sayisi</span>
                      <span className="font-medium text-slate-900">{items.length}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-500">Ara Toplam</span>
                      <span className="font-medium text-slate-900">{totals.subTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {getCurrencySymbol()}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-500">KDV</span>
                      <span className="font-medium text-slate-900">{totals.totalVat.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {getCurrencySymbol()}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 bg-slate-50 rounded-lg px-3 -mx-3">
                      <span className="text-sm font-medium text-slate-700">Iade Tutari</span>
                      <span className="text-xl font-bold text-slate-900">
                        {totals.total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {getCurrencySymbol()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Info Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                  <h4 className="text-sm font-semibold text-slate-800 mb-3">Iade Islem Akisi</h4>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-700 shrink-0 mt-0.5">1</span>
                      <span>Iade talebi kaydedildikten sonra onay surecine gonderilir</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-700 shrink-0 mt-0.5">2</span>
                      <span>Onaylanan iadeler tedarikciye gonderilebilir</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-700 shrink-0 mt-0.5">3</span>
                      <span>Iade islemi tamamlandiginda para iadesi yapilir</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Col>

            {/* Right Panel - Form Content */}
            <Col xs={24} lg={15}>
              <div className="bg-white border border-slate-200 rounded-xl p-8">
                <Tabs items={tabItems} className="supplier-form-tabs" />

                {/* Divider */}
                <div className="h-px bg-slate-200 my-6"></div>

                {/* Items Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-4 bg-slate-900 rounded-full"></div>
                      <span className="text-sm font-medium text-slate-700">Iade Kalemleri</span>
                    </div>
                    <button
                      type="button"
                      onClick={addItem}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      <PlusIcon className="w-4 h-4" />
                      Kalem Ekle
                    </button>
                  </div>

                  <Table
                    dataSource={items}
                    columns={itemColumns}
                    rowKey="key"
                    pagination={false}
                    size="small"
                    scroll={{ x: 900 }}
                    className="border border-slate-200 rounded-lg overflow-hidden"
                    locale={{ emptyText: 'Henuz kalem eklenmedi. "Kalem Ekle" butonuna tiklayin.' }}
                    summary={() => items.length > 0 ? (
                      <Table.Summary>
                        <Table.Summary.Row className="bg-slate-50">
                          <Table.Summary.Cell index={0} colSpan={6} align="right">
                            <span className="text-slate-600">Ara Toplam</span>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={1} align="right">
                            <span className="font-medium text-slate-900">{totals.subTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {getCurrencySymbol()}</span>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={2} />
                        </Table.Summary.Row>
                        <Table.Summary.Row className="bg-slate-50">
                          <Table.Summary.Cell index={0} colSpan={6} align="right">
                            <span className="text-slate-600">Toplam KDV</span>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={1} align="right">
                            <span className="font-medium text-slate-900">{totals.totalVat.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {getCurrencySymbol()}</span>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={2} />
                        </Table.Summary.Row>
                        <Table.Summary.Row className="bg-slate-100">
                          <Table.Summary.Cell index={0} colSpan={6} align="right">
                            <span className="font-semibold text-slate-700">Iade Tutari</span>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={1} align="right">
                            <span className="font-bold text-lg text-slate-900">
                              {totals.total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {getCurrencySymbol()}
                            </span>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={2} />
                        </Table.Summary.Row>
                      </Table.Summary>
                    ) : null}
                  />
                </div>
              </div>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  );
}
