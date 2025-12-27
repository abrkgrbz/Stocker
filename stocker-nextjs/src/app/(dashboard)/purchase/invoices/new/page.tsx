'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Form,
  Button,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Row,
  Col,
  Typography,
  Table,
  Spin,
  Divider,
  Tabs,
  message,
} from 'antd';
import {
  ArrowLeftIcon,
  BuildingLibraryIcon,
  BuildingStorefrontIcon,
  CheckIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  LinkIcon,
  ListBulletIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useCreatePurchaseInvoice, useSuppliers, usePurchaseOrders, useGoodsReceipts } from '@/lib/api/hooks/usePurchase';
import { useProducts } from '@/lib/api/hooks/useInventory';
import type { PurchaseInvoiceType } from '@/lib/api/services/purchase.types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface InvoiceItem {
  key: string;
  productId?: string;
  productCode: string;
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  discountRate: number;
  vatRate: number;
  description?: string;
}

const typeOptions = [
  { value: 'Standard', label: 'Standart Fatura' },
  { value: 'Credit', label: 'Alacak Dekontu' },
  { value: 'Proforma', label: 'Proforma Fatura' },
  { value: 'Prepayment', label: 'Ön Ödeme Faturası' },
];

const vatRateOptions = [
  { value: 0, label: '%0' },
  { value: 1, label: '%1' },
  { value: 10, label: '%10' },
  { value: 20, label: '%20' },
];

const currencyOptions = [
  { value: 'TRY', label: '₺ TRY' },
  { value: 'USD', label: '$ USD' },
  { value: 'EUR', label: '€ EUR' },
  { value: 'GBP', label: '£ GBP' },
];

export default function NewPurchaseInvoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const receiptId = searchParams.get('receiptId');
  const [form] = Form.useForm();

  const createInvoice = useCreatePurchaseInvoice();
  const { data: suppliersData } = useSuppliers({ pageSize: 1000 });
  const { data: ordersData } = usePurchaseOrders({ pageSize: 1000 });
  const { data: receiptsData } = useGoodsReceipts({ pageSize: 1000 });
  const { data: productsData } = useProducts();

  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState('TRY');

  const suppliers = suppliersData?.items || [];
  const orders = ordersData?.items || [];
  const receipts = receiptsData?.items || [];
  const products = productsData || [];

  const addItem = () => {
    const newItem: InvoiceItem = {
      key: Date.now().toString(),
      productCode: '',
      productName: '',
      unit: 'Adet',
      quantity: 1,
      unitPrice: 0,
      discountRate: 0,
      vatRate: 20,
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

  const calculateItemTotal = (item: InvoiceItem) => {
    const subTotal = item.quantity * item.unitPrice;
    const discountAmount = subTotal * (item.discountRate / 100);
    const afterDiscount = subTotal - discountAmount;
    const vatAmount = afterDiscount * (item.vatRate / 100);
    return afterDiscount + vatAmount;
  };

  const calculateTotals = () => {
    let subTotal = 0;
    let totalDiscount = 0;
    let totalVat = 0;

    items.forEach(item => {
      const itemSubTotal = item.quantity * item.unitPrice;
      const itemDiscount = itemSubTotal * (item.discountRate / 100);
      const afterDiscount = itemSubTotal - itemDiscount;
      const itemVat = afterDiscount * (item.vatRate / 100);

      subTotal += itemSubTotal;
      totalDiscount += itemDiscount;
      totalVat += itemVat;
    });

    const total = subTotal - totalDiscount + totalVat;
    return { subTotal, totalDiscount, totalVat, total };
  };

  const totals = calculateTotals();

  const handleSave = async (values: any) => {
    if (items.length === 0) {
      message.error('En az bir kalem eklemelisiniz');
      return;
    }

    try {
      await createInvoice.mutateAsync({
        ...values,
        invoiceDate: values.invoiceDate?.toISOString(),
        dueDate: values.dueDate?.toISOString(),
        currency: selectedCurrency,
        items: items.map(item => ({
          productId: item.productId,
          productCode: item.productCode,
          productName: item.productName,
          unit: item.unit,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountRate: item.discountRate,
          vatRate: item.vatRate,
          description: item.description,
        })),
      });
      router.push('/purchase/invoices');
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleCancel = () => {
    router.push('/purchase/invoices');
  };

  const isLoading = createInvoice.isPending;

  const itemColumns = [
    {
      title: 'Ürün',
      key: 'product',
      width: 250,
      render: (record: InvoiceItem) => (
        <Select
          placeholder="Ürün seçin"
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
      title: 'Birim',
      dataIndex: 'unit',
      key: 'unit',
      width: 80,
    },
    {
      title: 'Miktar',
      key: 'quantity',
      width: 100,
      render: (record: InvoiceItem) => (
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
      width: 120,
      render: (record: InvoiceItem) => (
        <InputNumber
          min={0}
          step={0.01}
          value={record.unitPrice}
          onChange={(value) => updateItem(record.key, 'unitPrice', value || 0)}
          style={{ width: '100%' }}
          variant="filled"
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
        />
      ),
    },
    {
      title: 'İskonto %',
      key: 'discountRate',
      width: 90,
      render: (record: InvoiceItem) => (
        <InputNumber
          min={0}
          max={100}
          value={record.discountRate}
          onChange={(value) => updateItem(record.key, 'discountRate', value || 0)}
          style={{ width: '100%' }}
          variant="filled"
        />
      ),
    },
    {
      title: 'KDV %',
      key: 'vatRate',
      width: 90,
      render: (record: InvoiceItem) => (
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
      title: 'Toplam',
      key: 'total',
      width: 120,
      align: 'right' as const,
      render: (record: InvoiceItem) => (
        <Text strong>
          {calculateItemTotal(record).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
        </Text>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (record: InvoiceItem) => (
        <Button
          type="text"
          danger
          icon={<TrashIcon className="w-4 h-4" />}
          onClick={() => removeItem(record.key)}
        />
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/30">
      {/* Sticky Header */}
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700"
            />
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
              >
                <DocumentTextIcon className="w-4 h-4" style={{ fontSize: 24 }} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 m-0">
                  Yeni Satın Alma Faturası
                </h1>
                <p className="text-sm text-gray-500 m-0">
                  Tedarikçi faturası oluşturun
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              icon={<XMarkIcon className="w-4 h-4" />}
              onClick={handleCancel}
              disabled={isLoading}
            >
              İptal
            </Button>
            <Button
              type="primary"
              icon={<CheckIcon className="w-4 h-4" />}
              onClick={() => form.submit()}
              loading={isLoading}
              className="px-6"
            >
              Kaydet
            </Button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        <Spin spinning={isLoading}>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSave}
              initialValues={{
                invoiceDate: dayjs(),
                type: 'Standard',
                currency: 'TRY',
                exchangeRate: 1,
                discountRate: 0,
                withholdingTaxAmount: 0,
              }}
            >
              <Row gutter={48}>
                {/* Left Panel - Visual & Summary */}
                <Col xs={24} lg={10}>
                  {/* Visual Representation */}
                  <div className="mb-8">
                    <div
                      style={{
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        borderRadius: '16px',
                        padding: '40px 20px',
                        minHeight: '200px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <DocumentTextIcon className="w-4 h-4" style={{ fontSize: '64px', color: 'rgba(255,255,255,0.9)' }} />
                      <p className="mt-4 text-lg font-medium text-white/90">
                        Satın Alma Faturası
                      </p>
                      <p className="text-sm text-white/60">
                        Tedarikçi faturası kaydedin
                      </p>
                    </div>
                  </div>

                  {/* Summary Card */}
                  <div className="bg-gray-50/50 rounded-xl p-4 mb-6">
                    <div className="space-y-3">
                      <div className="flex justify-between text-gray-600">
                        <span>Ara Toplam</span>
                        <span>{totals.subTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
                      </div>
                      {totals.totalDiscount > 0 && (
                        <div className="flex justify-between text-gray-600">
                          <span>İskonto</span>
                          <span className="text-green-600">-{totals.totalDiscount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
                        </div>
                      )}
                      <div className="flex justify-between text-gray-600">
                        <span>KDV</span>
                        <span>{totals.totalVat.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
                      </div>
                      <Divider className="my-2" />
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Genel Toplam</span>
                        <span className="text-amber-600">{totals.total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-amber-50/50 rounded-xl text-center">
                      <div className="text-2xl font-semibold text-amber-600">
                        {items.length}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Toplam Kalem</div>
                    </div>
                    <div className="p-4 bg-green-50/50 rounded-xl text-center">
                      <div className="text-sm font-semibold text-green-600 truncate">
                        {totals.total.toLocaleString('tr-TR', { minimumFractionDigits: 0 })} ₺
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Fatura Tutarı</div>
                    </div>
                  </div>

                  {/* Currency & Tax Settings */}
                  <div className="mt-6 space-y-4">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      <CurrencyDollarIcon className="w-4 h-4" className="mr-1" />
                      Para Birimi ve Vergiler
                    </div>
                    <div className="bg-gray-50/50 rounded-xl p-4 space-y-4">
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Para Birimi</div>
                        <Form.Item name="currency" className="mb-0">
                          <Select onChange={(value) => setSelectedCurrency(value)} variant="filled">
                            {currencyOptions.map(opt => (
                              <Select.Option key={opt.value} value={opt.value}>{opt.label}</Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </div>
                      {selectedCurrency !== 'TRY' && (
                        <div>
                          <div className="text-xs text-gray-400 mb-1">Döviz Kuru</div>
                          <Form.Item name="exchangeRate" className="mb-0">
                            <InputNumber min={0} step={0.0001} className="w-full" placeholder="1.00" variant="filled" />
                          </Form.Item>
                        </div>
                      )}
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Genel İskonto (%)</div>
                        <Form.Item name="discountRate" className="mb-0">
                          <InputNumber min={0} max={100} className="w-full" placeholder="0" variant="filled" />
                        </Form.Item>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Stopaj Tutarı</div>
                        <Form.Item name="withholdingTaxAmount" className="mb-0">
                          <InputNumber min={0} step={0.01} className="w-full" placeholder="0.00" variant="filled" />
                        </Form.Item>
                      </div>
                    </div>
                  </div>
                </Col>

                {/* Right Panel - Form Content */}
                <Col xs={24} lg={14}>
                  <Tabs
                    defaultActiveKey="basic"
                    items={[
                      {
                        key: 'basic',
                        label: (
                          <span>
                            <BuildingStorefrontIcon className="w-4 h-4" className="mr-1" />
                            Temel Bilgiler
                          </span>
                        ),
                        children: (
                          <div className="space-y-4">
                            <Row gutter={16}>
                              <Col span={12}>
                                <div className="text-xs text-gray-400 mb-1">Tedarikçi *</div>
                                <Form.Item
                                  name="supplierId"
                                  rules={[{ required: true, message: 'Tedarikçi seçin' }]}
                                  className="mb-0"
                                >
                                  <Select placeholder="Tedarikçi seçin" showSearch optionFilterProp="children" variant="filled">
                                    {suppliers.map(supplier => (
                                      <Select.Option key={supplier.id} value={supplier.id}>
                                        {supplier.code} - {supplier.name}
                                      </Select.Option>
                                    ))}
                                  </Select>
                                </Form.Item>
                              </Col>
                              <Col span={12}>
                                <div className="text-xs text-gray-400 mb-1">Tedarikçi Fatura No</div>
                                <Form.Item name="supplierInvoiceNumber" className="mb-0">
                                  <Input placeholder="Tedarikçi fatura numarası" variant="filled" />
                                </Form.Item>
                              </Col>
                            </Row>
                            <Row gutter={16}>
                              <Col span={8}>
                                <div className="text-xs text-gray-400 mb-1">Fatura Tarihi *</div>
                                <Form.Item
                                  name="invoiceDate"
                                  rules={[{ required: true, message: 'Tarih seçin' }]}
                                  className="mb-0"
                                >
                                  <DatePicker className="w-full" format="DD.MM.YYYY" variant="filled" />
                                </Form.Item>
                              </Col>
                              <Col span={8}>
                                <div className="text-xs text-gray-400 mb-1">Vade Tarihi</div>
                                <Form.Item name="dueDate" className="mb-0">
                                  <DatePicker className="w-full" format="DD.MM.YYYY" variant="filled" />
                                </Form.Item>
                              </Col>
                              <Col span={8}>
                                <div className="text-xs text-gray-400 mb-1">Fatura Tipi</div>
                                <Form.Item name="type" className="mb-0">
                                  <Select variant="filled">
                                    {typeOptions.map(opt => (
                                      <Select.Option key={opt.value} value={opt.value}>{opt.label}</Select.Option>
                                    ))}
                                  </Select>
                                </Form.Item>
                              </Col>
                            </Row>
                          </div>
                        ),
                      },
                      {
                        key: 'related',
                        label: (
                          <span>
                            <LinkIcon className="w-4 h-4" className="mr-1" />
                            İlişkili Belgeler
                          </span>
                        ),
                        children: (
                          <div className="space-y-4">
                            <Row gutter={16}>
                              <Col span={12}>
                                <div className="text-xs text-gray-400 mb-1">Satın Alma Siparişi</div>
                                <Form.Item name="purchaseOrderId" className="mb-0">
                                  <Select placeholder="Sipariş seçin (opsiyonel)" allowClear showSearch optionFilterProp="children" variant="filled">
                                    {orders.map(order => (
                                      <Select.Option key={order.id} value={order.id}>
                                        {order.orderNumber} - {order.supplierName}
                                      </Select.Option>
                                    ))}
                                  </Select>
                                </Form.Item>
                              </Col>
                              <Col span={12}>
                                <div className="text-xs text-gray-400 mb-1">Mal Alım Belgesi</div>
                                <Form.Item name="goodsReceiptId" className="mb-0">
                                  <Select placeholder="Mal alım belgesi seçin (opsiyonel)" allowClear showSearch optionFilterProp="children" variant="filled">
                                    {receipts.map(receipt => (
                                      <Select.Option key={receipt.id} value={receipt.id}>
                                        {receipt.receiptNumber} - {receipt.supplierName}
                                      </Select.Option>
                                    ))}
                                  </Select>
                                </Form.Item>
                              </Col>
                            </Row>
                          </div>
                        ),
                      },
                      {
                        key: 'einvoice',
                        label: (
                          <span>
                            <BuildingLibraryIcon className="w-4 h-4" className="mr-1" />
                            E-Fatura
                          </span>
                        ),
                        children: (
                          <div className="space-y-4">
                            <Row gutter={16}>
                              <Col span={12}>
                                <div className="text-xs text-gray-400 mb-1">E-Fatura ID</div>
                                <Form.Item name="eInvoiceId" className="mb-0">
                                  <Input placeholder="E-Fatura ID" variant="filled" />
                                </Form.Item>
                              </Col>
                              <Col span={12}>
                                <div className="text-xs text-gray-400 mb-1">E-Fatura UUID</div>
                                <Form.Item name="eInvoiceUUID" className="mb-0">
                                  <Input placeholder="E-Fatura UUID" variant="filled" />
                                </Form.Item>
                              </Col>
                            </Row>
                          </div>
                        ),
                      },
                      {
                        key: 'notes',
                        label: (
                          <span>
                            <DocumentTextIcon className="w-4 h-4" className="mr-1" />
                            Notlar
                          </span>
                        ),
                        children: (
                          <div className="space-y-4">
                            <Row gutter={16}>
                              <Col span={24}>
                                <div className="text-xs text-gray-400 mb-1">Genel Not</div>
                                <Form.Item name="notes" className="mb-0">
                                  <TextArea rows={3} placeholder="Fatura notu..." variant="filled" />
                                </Form.Item>
                              </Col>
                            </Row>
                            <Row gutter={16}>
                              <Col span={24}>
                                <div className="text-xs text-gray-400 mb-1">Dahili Not</div>
                                <Form.Item name="internalNotes" className="mb-0">
                                  <TextArea rows={2} placeholder="Dahili not (müşteriye gösterilmez)..." variant="filled" />
                                </Form.Item>
                              </Col>
                            </Row>
                          </div>
                        ),
                      },
                    ]}
                  />

                  {/* Divider */}
                  <div className="h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent my-6" />

                  {/* Invoice Items Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <Text className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        <ListBulletIcon className="w-4 h-4" className="mr-1" />
                        Fatura Kalemleri
                      </Text>
                      <Button type="primary" icon={<PlusIcon className="w-4 h-4" />} onClick={addItem} style={{ background: '#f59e0b' }}>
                        Kalem Ekle
                      </Button>
                    </div>

                    <Table
                      dataSource={items}
                      columns={itemColumns}
                      rowKey="key"
                      pagination={false}
                      size="small"
                      scroll={{ x: 1000 }}
                      locale={{ emptyText: 'Henüz kalem eklenmedi. "Kalem Ekle" butonuna tıklayın.' }}
                      summary={() => items.length > 0 ? (
                        <Table.Summary>
                          <Table.Summary.Row>
                            <Table.Summary.Cell index={0} colSpan={6} align="right">
                              <Text>Ara Toplam</Text>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={1} align="right">
                              <Text>{totals.subTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</Text>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={2} />
                          </Table.Summary.Row>
                          {totals.totalDiscount > 0 && (
                            <Table.Summary.Row>
                              <Table.Summary.Cell index={0} colSpan={6} align="right">
                                <Text>Toplam İskonto</Text>
                              </Table.Summary.Cell>
                              <Table.Summary.Cell index={1} align="right">
                                <Text type="success">-{totals.totalDiscount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</Text>
                              </Table.Summary.Cell>
                              <Table.Summary.Cell index={2} />
                            </Table.Summary.Row>
                          )}
                          <Table.Summary.Row>
                            <Table.Summary.Cell index={0} colSpan={6} align="right">
                              <Text>Toplam KDV</Text>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={1} align="right">
                              <Text>{totals.totalVat.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</Text>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={2} />
                          </Table.Summary.Row>
                          <Table.Summary.Row style={{ background: '#fffbeb' }}>
                            <Table.Summary.Cell index={0} colSpan={6} align="right">
                              <Text strong style={{ fontSize: 16 }}>Genel Toplam</Text>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={1} align="right">
                              <Text strong style={{ fontSize: 16, color: '#f59e0b' }}>
                                {totals.total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                              </Text>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={2} />
                          </Table.Summary.Row>
                        </Table.Summary>
                      ) : null}
                    />
                  </div>
                </Col>
              </Row>
            </Form>
          </div>
        </Spin>
      </div>
    </div>
  );
}
