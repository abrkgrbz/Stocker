'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Space,
  Table,
  InputNumber,
  Typography,
  message,
  Divider,
  Row,
  Col,
  Alert,
} from 'antd';
import { ArrowLeftIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCreateSalesReturn, useReturnableItems, useSalesOrders } from '@/lib/api/hooks/useSales';
import type { CreateSalesReturnDto, CreateSalesReturnItemDto, SalesReturnReason } from '@/lib/api/services/sales.service';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

const reasonOptions: { value: SalesReturnReason; label: string }[] = [
  { value: 'Defective', label: 'Arızalı' },
  { value: 'WrongItem', label: 'Yanlış Ürün' },
  { value: 'NotAsDescribed', label: 'Tanımlandığı Gibi Değil' },
  { value: 'DamagedInTransit', label: 'Taşıma Hasarı' },
  { value: 'ChangedMind', label: 'Vazgeçme' },
  { value: 'Other', label: 'Diğer' },
];

interface ReturnItem {
  key: string;
  orderItemId: string;
  productId: string;
  productName?: string;
  maxQuantity: number;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export default function NewSalesReturnPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedOrderId = searchParams.get('orderId');

  const [form] = Form.useForm();
  const [items, setItems] = useState<ReturnItem[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(preselectedOrderId);

  const createMutation = useCreateSalesReturn();
  const { data: ordersData } = useSalesOrders({ pageSize: 100, status: 'Completed' });
  const { data: returnableItemsData } = useReturnableItems(selectedOrderId || '');

  const orders = ordersData?.items ?? [];
  const returnableItems = returnableItemsData ?? [];

  useEffect(() => {
    if (preselectedOrderId) {
      form.setFieldValue('orderId', preselectedOrderId);
    }
  }, [preselectedOrderId, form]);

  const handleOrderChange = (orderId: string) => {
    setSelectedOrderId(orderId);
    setItems([]);
  };

  const handleAddItem = (returnableItem: any) => {
    const existingItem = items.find(i => i.orderItemId === returnableItem.orderItemId);
    if (existingItem) {
      message.warning('Bu ürün zaten iade listesinde');
      return;
    }

    const newItem: ReturnItem = {
      key: returnableItem.orderItemId,
      orderItemId: returnableItem.orderItemId,
      productId: returnableItem.productId,
      productName: returnableItem.productName,
      maxQuantity: returnableItem.returnableQuantity,
      quantity: returnableItem.returnableQuantity,
      unitPrice: returnableItem.unitPrice,
      lineTotal: returnableItem.returnableQuantity * returnableItem.unitPrice,
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (key: string) => {
    setItems(items.filter((item) => item.key !== key));
  };

  const handleQuantityChange = (key: string, quantity: number) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.key === key) {
          const newQuantity = Math.min(quantity, item.maxQuantity);
          return {
            ...item,
            quantity: newQuantity,
            lineTotal: newQuantity * item.unitPrice,
          };
        }
        return item;
      })
    );
  };

  const totalAmount = items.reduce((sum, item) => sum + item.lineTotal, 0);

  const handleSubmit = async (values: any) => {
    if (items.length === 0) {
      message.error('En az bir kalem eklemelisiniz');
      return;
    }

    const dto: CreateSalesReturnDto = {
      salesOrderId: values.orderId,
      returnDate: values.returnDate.toISOString(),
      reason: values.reason,
      notes: values.notes,
      items: items.map((item): CreateSalesReturnItemDto => ({
        salesOrderItemId: item.orderItemId,
        productId: item.productId,
        productCode: item.productName || '',
        productName: item.productName || '',
        unit: 'Adet',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        reason: values.reason,
      })),
    };

    try {
      await createMutation.mutateAsync(dto);
      message.success('İade oluşturuldu');
      router.push('/sales/returns');
    } catch {
      message.error('İade oluşturulamadı');
    }
  };

  const returnableColumns = [
    {
      title: 'Ürün',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'Sipariş Miktarı',
      dataIndex: 'orderedQuantity',
      key: 'orderedQuantity',
      align: 'right' as const,
    },
    {
      title: 'İade Edilebilir',
      dataIndex: 'returnableQuantity',
      key: 'returnableQuantity',
      align: 'right' as const,
    },
    {
      title: 'Birim Fiyat',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      align: 'right' as const,
      render: (price: number) =>
        new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price),
    },
    {
      title: '',
      key: 'actions',
      width: 100,
      render: (_: any, record: any) => (
        <Button
          type="primary"
          size="small"
          icon={<PlusIcon className="w-4 h-4" />}
          onClick={() => handleAddItem(record)}
          disabled={record.returnableQuantity <= 0}
        >
          Ekle
        </Button>
      ),
    },
  ];

  const itemColumns = [
    {
      title: 'Ürün',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'Miktar',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 150,
      render: (_: any, record: ReturnItem) => (
        <InputNumber
          min={1}
          max={record.maxQuantity}
          value={record.quantity}
          onChange={(value) => handleQuantityChange(record.key, value || 1)}
        />
      ),
    },
    {
      title: 'Birim Fiyat',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      align: 'right' as const,
      render: (price: number) =>
        new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price),
    },
    {
      title: 'Toplam',
      dataIndex: 'lineTotal',
      key: 'lineTotal',
      align: 'right' as const,
      render: (total: number) =>
        new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(total),
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (_: any, record: ReturnItem) => (
        <Button
          type="text"
          danger
          icon={<TrashIcon className="w-4 h-4" />}
          onClick={() => handleRemoveItem(record.key)}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Button icon={<ArrowLeftIcon className="w-4 h-4" />} onClick={() => router.push('/sales/returns')}>
            Geri
          </Button>
          <Title level={2} style={{ margin: 0 }}>Yeni İade</Title>
        </Space>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          returnDate: dayjs(),
          reason: 'Defective',
        }}
      >
        <Row gutter={24}>
          <Col span={16}>
            {/* Order Selection */}
            <Card title="Sipariş Seçimi" style={{ marginBottom: 24 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="orderId"
                    label="Sipariş"
                    rules={[{ required: true, message: 'Sipariş seçiniz' }]}
                  >
                    <Select
                      placeholder="Sipariş seçin"
                      showSearch
                      optionFilterProp="children"
                      onChange={handleOrderChange}
                      options={orders.map((o) => ({
                        value: o.id,
                        label: `${o.orderNumber} - ${o.customerName}`,
                      }))}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="returnDate"
                    label="İade Tarihi"
                    rules={[{ required: true, message: 'Tarih seçiniz' }]}
                  >
                    <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="reason"
                    label="İade Sebebi"
                    rules={[{ required: true, message: 'Sebep seçiniz' }]}
                  >
                    <Select options={reasonOptions} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Returnable Items */}
            {selectedOrderId && (
              <Card title="İade Edilebilir Ürünler" style={{ marginBottom: 24 }}>
                {returnableItems.length > 0 ? (
                  <Table
                    columns={returnableColumns}
                    dataSource={returnableItems}
                    rowKey="orderItemId"
                    pagination={false}
                    size="small"
                  />
                ) : (
                  <Alert
                    type="info"
                    message="Bu siparişte iade edilebilir ürün bulunmamaktadır."
                  />
                )}
              </Card>
            )}

            {/* Selected Items */}
            <Card title="İade Kalemleri" style={{ marginBottom: 24 }}>
              {items.length > 0 ? (
                <Table
                  columns={itemColumns}
                  dataSource={items}
                  rowKey="key"
                  pagination={false}
                />
              ) : (
                <Alert
                  type="warning"
                  message="Henüz iade kalemi eklenmedi. Yukarıdan ürün seçerek iade listesine ekleyin."
                />
              )}
            </Card>

            {/* Notes */}
            <Card title="Notlar">
              <Form.Item name="notes">
                <TextArea rows={3} placeholder="İade ile ilgili notlar..." />
              </Form.Item>
            </Card>
          </Col>

          <Col span={8}>
            {/* Summary */}
            <Card title="Özet" style={{ position: 'sticky', top: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text>Kalem Sayısı:</Text>
                <Text>{items.length}</Text>
              </div>
              <Divider />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                <Text strong style={{ fontSize: 16 }}>Toplam Tutar:</Text>
                <Text strong style={{ fontSize: 16, color: '#1890ff' }}>
                  {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(totalAmount)}
                </Text>
              </div>

              <Space direction="vertical" style={{ width: '100%' }}>
                <Button
                  type="primary"
                  icon={<CheckIcon className="w-4 h-4" />}
                  htmlType="submit"
                  loading={createMutation.isPending}
                  block
                  disabled={items.length === 0}
                >
                  İade Oluştur
                </Button>
                <Button block onClick={() => router.push('/sales/returns')}>
                  İptal
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
}
