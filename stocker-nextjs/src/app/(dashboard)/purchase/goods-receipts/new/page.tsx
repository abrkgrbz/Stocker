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
  Switch,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  CloseOutlined,
  PlusOutlined,
  DeleteOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import { useCreateGoodsReceipt, useSuppliers, usePurchaseOrders } from '@/lib/api/hooks/usePurchase';
import { useProducts, useWarehouses } from '@/lib/api/hooks/useInventory';
import type { GoodsReceiptType, ItemCondition } from '@/lib/api/services/purchase.types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface ReceiptItem {
  key: string;
  productId?: string;
  productCode: string;
  productName: string;
  unit: string;
  orderedQuantity: number;
  receivedQuantity: number;
  condition: ItemCondition;
  lotNumber?: string;
  serialNumber?: string;
  expiryDate?: string;
  storageLocation?: string;
  notes?: string;
}

const typeOptions = [
  { value: 'Standard', label: 'Standart' },
  { value: 'PartialDelivery', label: 'Kısmi Teslimat' },
  { value: 'ReturnReceipt', label: 'İade Alımı' },
  { value: 'DirectDelivery', label: 'Doğrudan Teslimat' },
  { value: 'Consignment', label: 'Konsinye' },
];

const conditionOptions = [
  { value: 'Good', label: 'İyi' },
  { value: 'Damaged', label: 'Hasarlı' },
  { value: 'Defective', label: 'Kusurlu' },
  { value: 'Expired', label: 'Vadesi Geçmiş' },
  { value: 'Other', label: 'Diğer' },
];

export default function NewGoodsReceiptPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [form] = Form.useForm();

  const createReceipt = useCreateGoodsReceipt();
  const { data: suppliersData } = useSuppliers({ pageSize: 1000 });
  const { data: ordersData } = usePurchaseOrders({ pageSize: 1000 });
  const { data: productsData } = useProducts();
  const { data: warehousesData } = useWarehouses();

  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | undefined>(orderId || undefined);

  const suppliers = suppliersData?.items || [];
  const orders = (ordersData?.items || []).filter(o => o.status === 'Sent' || o.status === 'PartiallyReceived');
  const products = productsData || [];
  const warehouses = warehousesData || [];

  const handleOrderSelect = (orderId: string) => {
    setSelectedOrderId(orderId);
    const order = orders.find(o => o.id === orderId);
    if (order) {
      form.setFieldsValue({
        supplierId: order.supplierName ? order.id : undefined,
        purchaseOrderId: orderId,
      });
      // Note: Order items would need to be fetched separately in real implementation
    }
  };

  const addItem = () => {
    const newItem: ReceiptItem = {
      key: Date.now().toString(),
      productCode: '',
      productName: '',
      unit: 'Adet',
      orderedQuantity: 0,
      receivedQuantity: 1,
      condition: 'Good' as ItemCondition,
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
        } : item
      ));
    }
  };

  const handleSave = async (values: any) => {
    if (items.length === 0) {
      message.error('En az bir kalem eklemelisiniz');
      return;
    }

    try {
      await createReceipt.mutateAsync({
        ...values,
        receiptDate: values.receiptDate?.toISOString(),
        deliveryDate: values.deliveryDate?.toISOString(),
        items: items.map(item => ({
          productId: item.productId,
          productCode: item.productCode,
          productName: item.productName,
          unit: item.unit,
          orderedQuantity: item.orderedQuantity,
          receivedQuantity: item.receivedQuantity,
          unitPrice: 0,
          condition: item.condition,
          lotNumber: item.lotNumber,
          serialNumber: item.serialNumber,
          expiryDate: item.expiryDate,
          storageLocation: item.storageLocation,
          notes: item.notes,
        })),
      });
      router.push('/purchase/goods-receipts');
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleCancel = () => {
    router.push('/purchase/goods-receipts');
  };

  const isLoading = createReceipt.isPending;

  const itemColumns = [
    {
      title: 'Ürün',
      key: 'product',
      width: 250,
      render: (record: ReceiptItem) => (
        <Select
          placeholder="Ürün seçin"
          showSearch
          optionFilterProp="children"
          value={record.productId}
          onChange={(value) => handleProductSelect(record.key, Number(value))}
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
      title: 'Sipariş Miktarı',
      key: 'orderedQuantity',
      width: 120,
      render: (record: ReceiptItem) => (
        <InputNumber
          min={0}
          value={record.orderedQuantity}
          onChange={(value) => updateItem(record.key, 'orderedQuantity', value || 0)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Alınan Miktar',
      key: 'receivedQuantity',
      width: 120,
      render: (record: ReceiptItem) => (
        <InputNumber
          min={0}
          value={record.receivedQuantity}
          onChange={(value) => updateItem(record.key, 'receivedQuantity', value || 0)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Durum',
      key: 'condition',
      width: 130,
      render: (record: ReceiptItem) => (
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
      title: 'Lot No',
      key: 'lotNumber',
      width: 120,
      render: (record: ReceiptItem) => (
        <Input
          value={record.lotNumber}
          onChange={(e) => updateItem(record.key, 'lotNumber', e.target.value)}
          placeholder="Lot no"
        />
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (record: ReceiptItem) => (
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
                style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
              >
                <InboxOutlined style={{ fontSize: 24 }} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 m-0">
                  Yeni Mal Alım Belgesi
                </h1>
                <p className="text-sm text-gray-500 m-0">
                  Tedarikçiden mal alımı kaydedin
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
            receiptDate: dayjs(),
            type: 'Standard',
            requiresQualityCheck: false,
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
                      name="purchaseOrderId"
                      label="Satın Alma Siparişi"
                    >
                      <Select
                        placeholder="Sipariş seçin (opsiyonel)"
                        allowClear
                        showSearch
                        optionFilterProp="children"
                        onChange={handleOrderSelect}
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
                  <Col xs={24} md={8}>
                    <Form.Item
                      name="receiptDate"
                      label="Belge Tarihi"
                      rules={[{ required: true, message: 'Tarih seçin' }]}
                    >
                      <DatePicker className="w-full" format="DD.MM.YYYY" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="type" label="Belge Tipi">
                      <Select>
                        {typeOptions.map(opt => (
                          <Select.Option key={opt.value} value={opt.value}>{opt.label}</Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item
                      name="warehouseId"
                      label="Depo"
                      rules={[{ required: true, message: 'Depo seçin' }]}
                    >
                      <Select
                        placeholder="Depo seçin"
                        showSearch
                        optionFilterProp="children"
                      >
                        {warehouses.map(warehouse => (
                          <Select.Option key={warehouse.id} value={warehouse.id.toString()}>
                            {warehouse.code} - {warehouse.name}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              {/* Items */}
              <Card
                title="Alınan Kalemler"
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
                />
              </Card>

              {/* Notes */}
              <Card title="Notlar" className="mb-6">
                <Form.Item name="notes" noStyle>
                  <TextArea rows={3} placeholder="Genel notlar..." />
                </Form.Item>
              </Card>
            </Col>

            {/* Right Column */}
            <Col xs={24} lg={8}>
              {/* Delivery Info */}
              <Card title="Teslimat Bilgileri" className="mb-6">
                <Form.Item name="deliveryNoteNumber" label="İrsaliye No">
                  <Input placeholder="İrsaliye numarası" />
                </Form.Item>
                <Form.Item name="deliveryDate" label="Teslimat Tarihi">
                  <DatePicker className="w-full" format="DD.MM.YYYY" />
                </Form.Item>
                <Divider />
                <Form.Item name="carrierName" label="Taşıyıcı">
                  <Input placeholder="Kargo/taşıyıcı firma" />
                </Form.Item>
                <Form.Item name="driverName" label="Şoför">
                  <Input placeholder="Şoför adı" />
                </Form.Item>
                <Form.Item name="vehiclePlate" label="Araç Plakası">
                  <Input placeholder="Plaka" />
                </Form.Item>
              </Card>

              {/* Package Info */}
              <Card title="Paket Bilgileri" className="mb-6">
                <Form.Item name="totalPackages" label="Toplam Paket">
                  <InputNumber min={0} className="w-full" placeholder="0" />
                </Form.Item>
                <Form.Item name="totalWeight" label="Toplam Ağırlık (kg)">
                  <InputNumber min={0} step={0.1} className="w-full" placeholder="0.00" />
                </Form.Item>
              </Card>

              {/* Quality Check */}
              <Card title="Kalite Kontrol" className="mb-6">
                <Form.Item
                  name="requiresQualityCheck"
                  label="Kalite Kontrolü Gerekli"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Card>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  );
}
