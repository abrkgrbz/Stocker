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
  Spin,
} from 'antd';
import { ArrowLeftOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';
import { useSalesReturn, useUpdateSalesReturn } from '@/lib/api/hooks/useSales';
import type { UpdateSalesReturnDto, SalesReturnReason } from '@/lib/api/services/sales.service';
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
  id?: string;
  orderItemId: string;
  productId: string;
  productName?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export default function EditSalesReturnPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [form] = Form.useForm();
  const [items, setItems] = useState<ReturnItem[]>([]);

  const { data: returnData, isLoading } = useSalesReturn(id);
  const updateMutation = useUpdateSalesReturn();

  useEffect(() => {
    if (returnData) {
      form.setFieldsValue({
        returnDate: dayjs(returnData.returnDate),
        reason: returnData.reason,
        notes: returnData.notes,
      });

      setItems(
        returnData.items.map((item: any) => ({
          key: item.id,
          id: item.id,
          orderItemId: item.orderItemId,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal: item.lineTotal,
        }))
      );
    }
  }, [returnData, form]);

  const handleRemoveItem = (key: string) => {
    setItems(items.filter((item) => item.key !== key));
  };

  const handleQuantityChange = (key: string, quantity: number) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.key === key) {
          return {
            ...item,
            quantity,
            lineTotal: quantity * item.unitPrice,
          };
        }
        return item;
      })
    );
  };

  const totalAmount = items.reduce((sum, item) => sum + item.lineTotal, 0);

  const handleSubmit = async (values: any) => {
    if (items.length === 0) {
      message.error('En az bir kalem bulunmalıdır');
      return;
    }

    const dto: UpdateSalesReturnDto = {
      returnDate: values.returnDate.toISOString(),
      reason: values.reason,
      notes: values.notes,
      items: items.map((item) => ({
        id: item.id,
        orderItemId: item.orderItemId,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    };

    try {
      await updateMutation.mutateAsync({ id, data: dto });
      message.success('İade güncellendi');
      router.push(`/sales/returns/${id}`);
    } catch {
      message.error('İade güncellenemedi');
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!returnData) {
    return (
      <div style={{ padding: 24 }}>
        <Text type="danger">İade bulunamadı</Text>
      </div>
    );
  }

  if (returnData.status !== 'Draft') {
    return (
      <div style={{ padding: 24 }}>
        <Text type="danger">Sadece taslak durumundaki iadeler düzenlenebilir</Text>
        <br />
        <Button onClick={() => router.push(`/sales/returns/${id}`)} style={{ marginTop: 16 }}>
          Detaya Dön
        </Button>
      </div>
    );
  }

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
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(record.key)}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push(`/sales/returns/${id}`)}>
            Geri
          </Button>
          <Title level={2} style={{ margin: 0 }}>İade Düzenle: {returnData.returnNumber}</Title>
        </Space>
      </div>

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Row gutter={24}>
          <Col span={16}>
            {/* Return Info */}
            <Card title="İade Bilgileri" style={{ marginBottom: 24 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Sipariş">
                    <Input disabled value={`${returnData.orderNumber} - ${returnData.customerName}`} />
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

            {/* Items */}
            <Card title="İade Kalemleri" style={{ marginBottom: 24 }}>
              <Table
                columns={itemColumns}
                dataSource={items}
                rowKey="key"
                pagination={false}
              />
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
                  icon={<SaveOutlined />}
                  htmlType="submit"
                  loading={updateMutation.isPending}
                  block
                >
                  Kaydet
                </Button>
                <Button block onClick={() => router.push(`/sales/returns/${id}`)}>
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
