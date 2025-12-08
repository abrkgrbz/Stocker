'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Form,
  Button,
  Card,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Row,
  Col,
  Typography,
  Table,
  Space,
  Divider,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  CloseOutlined,
  PlusOutlined,
  DeleteOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
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
  const { data: productsData } = useProducts({ pageSize: 1000 });

  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState('TRY');

  const suppliers = suppliersData?.items || [];
  const orders = ordersData?.items || [];
  const receipts = receiptsData?.items || [];
  const products = productsData?.items || [];

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

  const handleProductSelect = (key: string, productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setItems(items.map(item =>
        item.key === key ? {
          ...item,
          productId,
          productCode: product.code,
          productName: product.name,
          unit: product.unit || 'Adet',
          unitPrice: product.purchasePrice || 0,
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
          onChange={(value) => handleProductSelect(record.key, value)}
          style={{ width: '100%' }}
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
          icon={<DeleteOutlined />}
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
              icon={<ArrowLeftOutlined />}
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700"
            />
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}
              >
                <FileTextOutlined style={{ fontSize: 24 }} />
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
              icon={<CloseOutlined />}
              onClick={handleCancel}
              disabled={isLoading}
            >
              İptal
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
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
          <Row gutter={24}>
            {/* Left Column */}
            <Col xs={24} lg={16}>
              {/* Basic Info */}
              <Card title="Temel Bilgiler" className="mb-6">
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="supplierId"
                      label="Tedarikçi"
                      rules={[{ required: true, message: 'Tedarikçi seçin' }]}
                    >
                      <Select
                        placeholder="Tedarikçi seçin"
                        showSearch
                        optionFilterProp="children"
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
                    <Form.Item name="supplierInvoiceNumber" label="Tedarikçi Fatura No">
                      <Input placeholder="Tedarikçi fatura numarası" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item
                      name="invoiceDate"
                      label="Fatura Tarihi"
                      rules={[{ required: true, message: 'Tarih seçin' }]}
                    >
                      <DatePicker className="w-full" format="DD.MM.YYYY" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="dueDate" label="Vade Tarihi">
                      <DatePicker className="w-full" format="DD.MM.YYYY" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="type" label="Fatura Tipi">
                      <Select>
                        {typeOptions.map(opt => (
                          <Select.Option key={opt.value} value={opt.value}>{opt.label}</Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              {/* Related Documents */}
              <Card title="İlişkili Belgeler" className="mb-6">
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item name="purchaseOrderId" label="Satın Alma Siparişi">
                      <Select
                        placeholder="Sipariş seçin (opsiyonel)"
                        allowClear
                        showSearch
                        optionFilterProp="children"
                      >
                        {orders.map(order => (
                          <Select.Option key={order.id} value={order.id}>
                            {order.orderNumber} - {order.supplierName}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="goodsReceiptId" label="Mal Alım Belgesi">
                      <Select
                        placeholder="Mal alım belgesi seçin (opsiyonel)"
                        allowClear
                        showSearch
                        optionFilterProp="children"
                      >
                        {receipts.map(receipt => (
                          <Select.Option key={receipt.id} value={receipt.id}>
                            {receipt.receiptNumber} - {receipt.supplierName}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              {/* Items */}
              <Card
                title="Fatura Kalemleri"
                className="mb-6"
                extra={
                  <Button type="primary" icon={<PlusOutlined />} onClick={addItem}>
                    Kalem Ekle
                  </Button>
                }
              >
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
                      <Table.Summary.Row style={{ background: '#fafafa' }}>
                        <Table.Summary.Cell index={0} colSpan={6} align="right">
                          <Text strong style={{ fontSize: 16 }}>Genel Toplam</Text>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1} align="right">
                          <Text strong style={{ fontSize: 16, color: '#1890ff' }}>
                            {totals.total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                          </Text>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={2} />
                      </Table.Summary.Row>
                    </Table.Summary>
                  ) : null}
                />
              </Card>

              {/* Notes */}
              <Card title="Notlar" className="mb-6">
                <Form.Item name="notes" label="Genel Not">
                  <TextArea rows={3} placeholder="Fatura notu..." />
                </Form.Item>
                <Form.Item name="internalNotes" label="Dahili Not">
                  <TextArea rows={2} placeholder="Dahili not (müşteriye gösterilmez)..." />
                </Form.Item>
              </Card>
            </Col>

            {/* Right Column */}
            <Col xs={24} lg={8}>
              {/* Currency Settings */}
              <Card title="Para Birimi" className="mb-6">
                <Form.Item name="currency" label="Para Birimi">
                  <Select onChange={(value) => setSelectedCurrency(value)}>
                    {currencyOptions.map(opt => (
                      <Select.Option key={opt.value} value={opt.value}>{opt.label}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                {selectedCurrency !== 'TRY' && (
                  <Form.Item name="exchangeRate" label="Döviz Kuru">
                    <InputNumber
                      min={0}
                      step={0.0001}
                      className="w-full"
                      placeholder="1.00"
                    />
                  </Form.Item>
                )}
              </Card>

              {/* Additional Discounts */}
              <Card title="Ek İskonto ve Vergiler" className="mb-6">
                <Form.Item name="discountRate" label="Genel İskonto (%)">
                  <InputNumber min={0} max={100} className="w-full" placeholder="0" />
                </Form.Item>
                <Form.Item name="withholdingTaxAmount" label="Stopaj Tutarı">
                  <InputNumber min={0} step={0.01} className="w-full" placeholder="0.00" />
                </Form.Item>
              </Card>

              {/* E-Invoice */}
              <Card title="E-Fatura Bilgileri" className="mb-6">
                <Form.Item name="eInvoiceId" label="E-Fatura ID">
                  <Input placeholder="E-Fatura ID" />
                </Form.Item>
                <Form.Item name="eInvoiceUUID" label="E-Fatura UUID">
                  <Input placeholder="E-Fatura UUID" />
                </Form.Item>
              </Card>

              {/* Summary */}
              <Card title="Özet" className="mb-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Text type="secondary">Ara Toplam</Text>
                    <Text>{totals.subTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</Text>
                  </div>
                  {totals.totalDiscount > 0 && (
                    <div className="flex justify-between">
                      <Text type="secondary">İskonto</Text>
                      <Text type="success">-{totals.totalDiscount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</Text>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <Text type="secondary">KDV</Text>
                    <Text>{totals.totalVat.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</Text>
                  </div>
                  <Divider className="my-2" />
                  <div className="flex justify-between">
                    <Text strong style={{ fontSize: 16 }}>Genel Toplam</Text>
                    <Text strong style={{ fontSize: 16, color: '#1890ff' }}>
                      {totals.total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                    </Text>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  );
}
