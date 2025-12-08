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
  Divider,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  CloseOutlined,
  PlusOutlined,
  DeleteOutlined,
  RollbackOutlined,
} from '@ant-design/icons';
import { useCreatePurchaseReturn, useSuppliers, usePurchaseOrders, useGoodsReceipts, usePurchaseInvoices } from '@/lib/api/hooks/usePurchase';
import { useProducts } from '@/lib/api/hooks/useInventory';
import type { PurchaseReturnType, PurchaseReturnReason, PurchaseReturnItemReason, ItemCondition, RefundMethod } from '@/lib/api/services/purchase.types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
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
  { value: 'Standard', label: 'Standart İade' },
  { value: 'Defective', label: 'Kusurlu Ürün İadesi' },
  { value: 'Warranty', label: 'Garanti İadesi' },
  { value: 'Exchange', label: 'Ürün Değişimi' },
];

const reasonOptions = [
  { value: 'Defective', label: 'Kusurlu' },
  { value: 'WrongItem', label: 'Yanlış Ürün' },
  { value: 'WrongQuantity', label: 'Yanlış Miktar' },
  { value: 'Damaged', label: 'Hasarlı' },
  { value: 'QualityIssue', label: 'Kalite Sorunu' },
  { value: 'Expired', label: 'Vadesi Geçmiş' },
  { value: 'NotAsDescribed', label: 'Tanımlandığı Gibi Değil' },
  { value: 'Other', label: 'Diğer' },
];

const refundMethodOptions = [
  { value: 'Credit', label: 'Alacak' },
  { value: 'BankTransfer', label: 'Havale/EFT' },
  { value: 'Check', label: 'Çek' },
  { value: 'Cash', label: 'Nakit' },
  { value: 'Replacement', label: 'Ürün Değişimi' },
];

const conditionOptions = [
  { value: 'Good', label: 'İyi' },
  { value: 'Damaged', label: 'Hasarlı' },
  { value: 'Defective', label: 'Kusurlu' },
  { value: 'Expired', label: 'Vadesi Geçmiş' },
  { value: 'Other', label: 'Diğer' },
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
];

export default function NewPurchaseReturnPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const receiptId = searchParams.get('receiptId');
  const invoiceId = searchParams.get('invoiceId');
  const [form] = Form.useForm();

  const createReturn = useCreatePurchaseReturn();
  const { data: suppliersData } = useSuppliers({ pageSize: 1000 });
  const { data: ordersData } = usePurchaseOrders({ pageSize: 1000 });
  const { data: receiptsData } = useGoodsReceipts({ pageSize: 1000 });
  const { data: invoicesData } = usePurchaseInvoices({ pageSize: 1000 });
  const { data: productsData } = useProducts({ pageSize: 1000 });

  const [items, setItems] = useState<ReturnItem[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState('TRY');

  const suppliers = suppliersData?.items || [];
  const orders = ordersData?.items || [];
  const receipts = receiptsData?.items || [];
  const invoices = invoicesData?.items || [];
  const products = productsData?.items || [];

  const addItem = () => {
    const newItem: ReturnItem = {
      key: Date.now().toString(),
      productCode: '',
      productName: '',
      unit: 'Adet',
      quantity: 1,
      unitPrice: 0,
      vatRate: 20,
      reason: 'Defective',
      condition: 'Defective',
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
      message.success('İade talebi başarıyla oluşturuldu');
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
      title: 'Ürün',
      key: 'product',
      width: 220,
      render: (record: ReturnItem) => (
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
        />
      ),
    },
    {
      title: 'Fiyat',
      key: 'unitPrice',
      width: 100,
      render: (record: ReturnItem) => (
        <InputNumber
          min={0}
          step={0.01}
          value={record.unitPrice}
          onChange={(value) => updateItem(record.key, 'unitPrice', value || 0)}
          style={{ width: '100%' }}
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
        <Text strong className="text-red-600">
          {calculateItemTotal(record).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
        </Text>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (record: ReturnItem) => (
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
                style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}
              >
                <RollbackOutlined style={{ fontSize: 24 }} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 m-0">
                  Yeni Satın Alma İadesi
                </h1>
                <p className="text-sm text-gray-500 m-0">
                  Tedarikçiye iade talebi oluşturun
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
            returnDate: dayjs(),
            type: 'Standard',
            reason: 'Defective',
            currency: 'TRY',
            exchangeRate: 1,
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
                    <Form.Item
                      name="returnDate"
                      label="İade Tarihi"
                      rules={[{ required: true, message: 'Tarih seçin' }]}
                    >
                      <DatePicker className="w-full" format="DD.MM.YYYY" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="type" label="İade Tipi">
                      <Select>
                        {typeOptions.map(opt => (
                          <Select.Option key={opt.value} value={opt.value}>{opt.label}</Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="reason" label="İade Sebebi">
                      <Select>
                        {reasonOptions.map(opt => (
                          <Select.Option key={opt.value} value={opt.value}>{opt.label}</Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="refundMethod" label="İade Yöntemi">
                      <Select placeholder="Seçin (opsiyonel)" allowClear>
                        {refundMethodOptions.map(opt => (
                          <Select.Option key={opt.value} value={opt.value}>{opt.label}</Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item name="reasonDetails" label="Sebep Detayı">
                      <TextArea rows={2} placeholder="İade sebebini detaylı açıklayın..." />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              {/* Related Documents */}
              <Card title="İlişkili Belgeler" className="mb-6">
                <Row gutter={16}>
                  <Col xs={24} md={8}>
                    <Form.Item name="purchaseOrderId" label="Sipariş">
                      <Select placeholder="Seçin (opsiyonel)" allowClear showSearch optionFilterProp="children">
                        {orders.map(order => (
                          <Select.Option key={order.id} value={order.id}>
                            {order.orderNumber}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="goodsReceiptId" label="Mal Alım">
                      <Select placeholder="Seçin (opsiyonel)" allowClear showSearch optionFilterProp="children">
                        {receipts.map(receipt => (
                          <Select.Option key={receipt.id} value={receipt.id}>
                            {receipt.receiptNumber}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="purchaseInvoiceId" label="Fatura">
                      <Select placeholder="Seçin (opsiyonel)" allowClear showSearch optionFilterProp="children">
                        {invoices.map(invoice => (
                          <Select.Option key={invoice.id} value={invoice.id}>
                            {invoice.invoiceNumber}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              {/* Items */}
              <Card
                title="İade Kalemleri"
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
                  scroll={{ x: 900 }}
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
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0} colSpan={6} align="right">
                          <Text>Toplam KDV</Text>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1} align="right">
                          <Text>{totals.totalVat.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</Text>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={2} />
                      </Table.Summary.Row>
                      <Table.Summary.Row style={{ background: '#fef2f2' }}>
                        <Table.Summary.Cell index={0} colSpan={6} align="right">
                          <Text strong style={{ fontSize: 16 }}>İade Tutarı</Text>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1} align="right">
                          <Text strong style={{ fontSize: 16, color: '#ef4444' }}>
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
                  <TextArea rows={2} placeholder="Genel notlar..." />
                </Form.Item>
                <Form.Item name="internalNotes" label="Dahili Not">
                  <TextArea rows={2} placeholder="Dahili not (tedarikçiye gösterilmez)..." />
                </Form.Item>
              </Card>
            </Col>

            {/* Right Column - Summary */}
            <Col xs={24} lg={8}>
              <Card title="Para Birimi" className="mb-6">
                <Row gutter={16}>
                  <Col xs={12}>
                    <Form.Item name="currency" label="Para Birimi">
                      <Select onChange={(value) => setSelectedCurrency(value)}>
                        {currencyOptions.map(opt => (
                          <Select.Option key={opt.value} value={opt.value}>{opt.label}</Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  {selectedCurrency !== 'TRY' && (
                    <Col xs={12}>
                      <Form.Item name="exchangeRate" label="Döviz Kuru">
                        <InputNumber min={0} step={0.0001} className="w-full" />
                      </Form.Item>
                    </Col>
                  )}
                </Row>
              </Card>

              <Card title="Özet" className="mb-6 sticky top-28">
                <div className="space-y-4">
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">İade Tutarı</div>
                    <div className="text-3xl font-bold text-red-600">
                      {totals.total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {selectedCurrency === 'TRY' ? '₺' : selectedCurrency}
                    </div>
                  </div>

                  <Divider />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Text type="secondary">Kalem Sayısı</Text>
                      <Text strong>{items.length}</Text>
                    </div>
                    <div className="flex justify-between">
                      <Text type="secondary">Ara Toplam</Text>
                      <Text>{totals.subTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</Text>
                    </div>
                    <div className="flex justify-between">
                      <Text type="secondary">KDV</Text>
                      <Text>{totals.totalVat.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</Text>
                    </div>
                  </div>

                  <Divider />

                  <div className="text-xs text-gray-500">
                    <p className="mb-2">
                      • İade talebi kaydedildikten sonra onay sürecine gönderilecektir.
                    </p>
                    <p className="mb-2">
                      • Onaylanan iadeler tedarikçiye gönderilebilir.
                    </p>
                    <p>
                      • İade işlemi tamamlandığında para iadesi yapılabilir.
                    </p>
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
