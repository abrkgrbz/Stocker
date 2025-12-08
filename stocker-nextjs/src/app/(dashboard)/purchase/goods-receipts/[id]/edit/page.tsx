'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  Spin,
  Empty,
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
import { useGoodsReceipt, useUpdateGoodsReceipt, useSuppliers } from '@/lib/api/hooks/usePurchase';
import { useProducts } from '@/lib/api/hooks/useInventory';
import type { ItemCondition } from '@/lib/api/services/purchase.types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface ReceiptItem {
  key: string;
  id?: string;
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

const conditionOptions = [
  { value: 'Good', label: 'İyi' },
  { value: 'Damaged', label: 'Hasarlı' },
  { value: 'Defective', label: 'Kusurlu' },
  { value: 'Expired', label: 'Vadesi Geçmiş' },
  { value: 'Other', label: 'Diğer' },
];

export default function EditGoodsReceiptPage() {
  const params = useParams();
  const router = useRouter();
  const receiptId = params.id as string;
  const [form] = Form.useForm();

  const { data: receipt, isLoading: receiptLoading } = useGoodsReceipt(receiptId);
  const updateReceipt = useUpdateGoodsReceipt();
  const { data: suppliersData } = useSuppliers({ pageSize: 1000 });
  const { data: productsData } = useProducts({ pageSize: 1000 });

  const [items, setItems] = useState<ReceiptItem[]>([]);

  const suppliers = suppliersData?.items || [];
  const products = productsData?.items || [];

  useEffect(() => {
    if (receipt) {
      form.setFieldsValue({
        ...receipt,
        receiptDate: receipt.receiptDate ? dayjs(receipt.receiptDate) : null,
        deliveryDate: receipt.deliveryDate ? dayjs(receipt.deliveryDate) : null,
      });

      if (receipt.items) {
        setItems(receipt.items.map((item, index) => ({
          key: item.id || index.toString(),
          id: item.id,
          productId: item.productId,
          productCode: item.productCode,
          productName: item.productName,
          unit: item.unit,
          orderedQuantity: item.orderedQuantity,
          receivedQuantity: item.receivedQuantity,
          condition: item.condition as ItemCondition,
          lotNumber: item.lotNumber,
          serialNumber: item.serialNumber,
          storageLocation: item.storageLocation,
          notes: item.notes,
        })));
      }
    }
  }, [receipt, form]);

  if (receiptLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="p-8">
        <Empty description="Mal alım belgesi bulunamadı" />
        <div className="text-center mt-4">
          <Button onClick={() => router.push('/purchase/goods-receipts')}>
            Mal Alım Belgelerine Dön
          </Button>
        </div>
      </div>
    );
  }

  if (receipt.status !== 'Draft') {
    return (
      <div className="p-8">
        <Empty description="Bu belge düzenlenemez. Sadece taslak belgeler düzenlenebilir." />
        <div className="text-center mt-4">
          <Button onClick={() => router.push(`/purchase/goods-receipts/${receiptId}`)}>
            Belgeye Dön
          </Button>
        </div>
      </div>
    );
  }

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
        } : item
      ));
    }
  };

  const handleSave = async (values: any) => {
    try {
      await updateReceipt.mutateAsync({
        id: receiptId,
        data: {
          deliveryNoteNumber: values.deliveryNoteNumber,
          deliveryDate: values.deliveryDate?.toISOString(),
          carrierName: values.carrierName,
          driverName: values.driverName,
          vehiclePlate: values.vehiclePlate,
          totalPackages: values.totalPackages,
          totalWeight: values.totalWeight,
          notes: values.notes,
          internalNotes: values.internalNotes,
        },
      });
      router.push(`/purchase/goods-receipts/${receiptId}`);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleCancel = () => {
    router.push(`/purchase/goods-receipts/${receiptId}`);
  };

  const isLoading = updateReceipt.isPending;

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
                  Mal Alım Belgesi Düzenle
                </h1>
                <p className="text-sm text-gray-500 m-0">
                  {receipt.receiptNumber}
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
        >
          <Row gutter={24}>
            {/* Left Column */}
            <Col xs={24} lg={16}>
              {/* Basic Info - Read Only */}
              <Card title="Temel Bilgiler" className="mb-6">
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item label="Tedarikçi">
                      <Input value={receipt.supplierName} disabled />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label="Sipariş No">
                      <Input value={receipt.purchaseOrderNumber || '-'} disabled />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item label="Belge Tarihi">
                      <DatePicker
                        value={dayjs(receipt.receiptDate)}
                        disabled
                        className="w-full"
                        format="DD.MM.YYYY"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item label="Belge Tipi">
                      <Input value={receipt.type} disabled />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item label="Depo">
                      <Input value={receipt.warehouseName || '-'} disabled />
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
                />
              </Card>

              {/* Notes */}
              <Card title="Notlar" className="mb-6">
                <Form.Item name="notes" label="Genel Notlar">
                  <TextArea rows={3} placeholder="Genel notlar..." />
                </Form.Item>
                <Form.Item name="internalNotes" label="Dahili Notlar">
                  <TextArea rows={2} placeholder="Dahili notlar (müşteriye gösterilmez)..." />
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
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  );
}
