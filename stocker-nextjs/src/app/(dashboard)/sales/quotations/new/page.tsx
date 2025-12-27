'use client';

import React, { useState } from 'react';
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
} from 'antd';
import {
  ArrowLeftIcon,
  CheckIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useCreateQuotation } from '@/lib/api/hooks/useSales';
import { useCustomers } from '@/lib/api/hooks/useCRM';
import { useProducts } from '@/lib/api/hooks/useInventory';
import type { CreateQuotationDto, CreateQuotationItemDto } from '@/lib/api/services/sales.service';
import type { ProductDto } from '@/lib/api/services/inventory.types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface QuotationItem {
  key: string;
  productId: string;
  productName?: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  discountAmount: number;
  taxRate: number;
  lineTotal: number;
}

export default function NewQuotationPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [items, setItems] = useState<QuotationItem[]>([]);

  const createMutation = useCreateQuotation();
  const { data: customersData } = useCustomers({ pageSize: 100 });
  const { data: productsData } = useProducts();

  const customers = customersData?.items ?? [];
  const products: ProductDto[] = productsData ?? [];

  const calculateLineTotal = (item: QuotationItem): number => {
    const subtotal = item.quantity * item.unitPrice;
    const discount = item.discountAmount || (subtotal * (item.discountPercent || 0)) / 100;
    const afterDiscount = subtotal - discount;
    const tax = (afterDiscount * (item.taxRate || 0)) / 100;
    return afterDiscount + tax;
  };

  const handleAddItem = () => {
    const newItem: QuotationItem = {
      key: Date.now().toString(),
      productId: '',
      quantity: 1,
      unitPrice: 0,
      discountPercent: 0,
      discountAmount: 0,
      taxRate: 20,
      lineTotal: 0,
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (key: string) => {
    setItems(items.filter((item) => item.key !== key));
  };

  const handleItemChange = (key: string, field: keyof QuotationItem, value: any) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.key === key) {
          const updated = { ...item, [field]: value };
          if (field === 'productId') {
            const product = products.find((p: ProductDto) => String(p.id) === String(value));
            if (product) {
              updated.productName = product.name;
              updated.unitPrice = product.unitPrice || 0;
            }
          }
          updated.lineTotal = calculateLineTotal(updated);
          return updated;
        }
        return item;
      })
    );
  };

  const subTotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const discountTotal = items.reduce((sum, item) => {
    const subtotal = item.quantity * item.unitPrice;
    return sum + (item.discountAmount || (subtotal * (item.discountPercent || 0)) / 100);
  }, 0);
  const taxTotal = items.reduce((sum, item) => {
    const subtotal = item.quantity * item.unitPrice;
    const discount = item.discountAmount || (subtotal * (item.discountPercent || 0)) / 100;
    const afterDiscount = subtotal - discount;
    return sum + (afterDiscount * (item.taxRate || 0)) / 100;
  }, 0);
  const grandTotal = subTotal - discountTotal + taxTotal;

  const handleSubmit = async (values: any) => {
    if (items.length === 0) {
      message.error('En az bir kalem eklemelisiniz');
      return;
    }

    const dto: CreateQuotationDto = {
      customerId: values.customerId,
      customerName: customers.find((c: any) => c.id === values.customerId)?.companyName || '',
      quotationDate: values.quotationDate.toISOString(),
      validUntil: values.validUntil?.toISOString(),
      currency: values.currency || 'TRY',
      notes: values.notes,
      termsAndConditions: values.termsAndConditions,
      items: items.map((item): CreateQuotationItemDto => {
        const product = products.find((p: ProductDto) => String(p.id) === String(item.productId));
        return {
          productId: item.productId,
          productCode: product?.code || product?.sku || '',
          productName: item.productName || product?.name || '',
          unit: product?.unitName || 'Adet',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          vatRate: item.taxRate,
          discountRate: item.discountPercent,
        };
      }),
    };

    try {
      await createMutation.mutateAsync(dto);
      message.success('Teklif oluşturuldu');
      router.push('/sales/quotations');
    } catch {
      message.error('Teklif oluşturulamadı');
    }
  };

  const itemColumns = [
    {
      title: 'Ürün',
      dataIndex: 'productId',
      key: 'productId',
      width: 250,
      render: (_: any, record: QuotationItem) => (
        <Select
          style={{ width: '100%' }}
          placeholder="Ürün seçin"
          showSearch
          optionFilterProp="children"
          value={record.productId || undefined}
          onChange={(value) => handleItemChange(record.key, 'productId', value)}
          options={products.map((p: ProductDto) => ({ value: p.id, label: p.name }))}
        />
      ),
    },
    {
      title: 'Miktar',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      render: (_: any, record: QuotationItem) => (
        <InputNumber
          min={1}
          value={record.quantity}
          onChange={(value) => handleItemChange(record.key, 'quantity', value || 1)}
        />
      ),
    },
    {
      title: 'Birim Fiyat',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 120,
      render: (_: any, record: QuotationItem) => (
        <InputNumber
          min={0}
          value={record.unitPrice}
          onChange={(value) => handleItemChange(record.key, 'unitPrice', value || 0)}
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
        />
      ),
    },
    {
      title: 'İndirim %',
      dataIndex: 'discountPercent',
      key: 'discountPercent',
      width: 100,
      render: (_: any, record: QuotationItem) => (
        <InputNumber
          min={0}
          max={100}
          value={record.discountPercent}
          onChange={(value) => handleItemChange(record.key, 'discountPercent', value || 0)}
        />
      ),
    },
    {
      title: 'KDV %',
      dataIndex: 'taxRate',
      key: 'taxRate',
      width: 100,
      render: (_: any, record: QuotationItem) => (
        <InputNumber
          min={0}
          max={100}
          value={record.taxRate}
          onChange={(value) => handleItemChange(record.key, 'taxRate', value || 0)}
        />
      ),
    },
    {
      title: 'Toplam',
      dataIndex: 'lineTotal',
      key: 'lineTotal',
      width: 120,
      align: 'right' as const,
      render: (value: number) =>
        new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value),
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (_: any, record: QuotationItem) => (
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
          <Button icon={<ArrowLeftIcon className="w-4 h-4" />} onClick={() => router.push('/sales/quotations')}>
            Geri
          </Button>
          <Title level={2} style={{ margin: 0 }}>Yeni Teklif</Title>
        </Space>
      </div>

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Row gutter={24}>
          <Col span={16}>
            {/* Customer & Date Info */}
            <Card title="Teklif Bilgileri" style={{ marginBottom: 24 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="customerId"
                    label="Müşteri"
                    rules={[{ required: true, message: 'Müşteri seçiniz' }]}
                  >
                    <Select
                      placeholder="Müşteri seçin"
                      showSearch
                      optionFilterProp="children"
                      options={customers.map((c: any) => ({ value: c.id, label: c.companyName }))}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="currency" label="Para Birimi" initialValue="TRY">
                    <Select
                      options={[
                        { value: 'TRY', label: 'TRY - Türk Lirası' },
                        { value: 'USD', label: 'USD - Amerikan Doları' },
                        { value: 'EUR', label: 'EUR - Euro' },
                      ]}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="quotationDate"
                    label="Teklif Tarihi"
                    initialValue={dayjs()}
                    rules={[{ required: true, message: 'Tarih seçiniz' }]}
                  >
                    <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="validUntil" label="Geçerlilik Tarihi">
                    <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Items */}
            <Card
              title="Teklif Kalemleri"
              extra={
                <Button type="dashed" icon={<PlusIcon className="w-4 h-4" />} onClick={handleAddItem}>
                  Kalem Ekle
                </Button>
              }
              style={{ marginBottom: 24 }}
            >
              <Table
                columns={itemColumns}
                dataSource={items}
                rowKey="key"
                pagination={false}
                locale={{ emptyText: 'Henüz kalem eklenmedi' }}
              />
            </Card>

            {/* Notes */}
            <Card title="Notlar">
              <Form.Item name="notes" label="Notlar">
                <TextArea rows={3} placeholder="Teklif ile ilgili notlar..." />
              </Form.Item>
              <Form.Item name="termsAndConditions" label="Şartlar ve Koşullar">
                <TextArea rows={3} placeholder="Şartlar ve koşullar..." />
              </Form.Item>
            </Card>
          </Col>

          <Col span={8}>
            {/* Summary */}
            <Card title="Özet" style={{ position: 'sticky', top: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text>Ara Toplam:</Text>
                <Text>{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(subTotal)}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text>İndirim:</Text>
                <Text type="danger">-{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(discountTotal)}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text>KDV:</Text>
                <Text>{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(taxTotal)}</Text>
              </div>
              <Divider />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                <Text strong style={{ fontSize: 16 }}>Genel Toplam:</Text>
                <Text strong style={{ fontSize: 16, color: '#1890ff' }}>
                  {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(grandTotal)}
                </Text>
              </div>

              <Space direction="vertical" style={{ width: '100%' }}>
                <Button
                  type="primary"
                  icon={<CheckIcon className="w-4 h-4" />}
                  htmlType="submit"
                  loading={createMutation.isPending}
                  block
                >
                  Teklif Oluştur
                </Button>
                <Button block onClick={() => router.push('/sales/quotations')}>
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
