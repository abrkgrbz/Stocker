'use client';

import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Row,
  Col,
  Typography,
  DatePicker,
  Table,
  InputNumber,
  Space,
  Divider,
  message,
} from 'antd';
import {
  ArrowLeftIcon,
  BuildingStorefrontIcon,
  CheckIcon,
  DocumentTextIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import { useCreateQuotation } from '@/lib/api/hooks/usePurchase';
import { useSuppliers } from '@/lib/api/hooks/usePurchase';
import { useProducts } from '@/lib/api/hooks/useInventory';
import type { CreateQuotationDto, CreateQuotationItemDto } from '@/lib/api/services/purchase.types';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface QuotationItemRow extends CreateQuotationItemDto {
  key: string;
  productName?: string;
}

export default function NewQuotationPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [items, setItems] = useState<QuotationItemRow[]>([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);

  const createMutation = useCreateQuotation();
  const { data: suppliersData, isLoading: suppliersLoading } = useSuppliers();
  const { data: productsData, isLoading: productsLoading } = useProducts();

  const handleAddItem = () => {
    const newItem: QuotationItemRow = {
      key: Date.now().toString(),
      productId: '',
      quantity: 1,
      unit: 'Adet',
      specifications: '',
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (key: string) => {
    setItems(items.filter(item => item.key !== key));
  };

  const handleItemChange = (key: string, field: keyof QuotationItemRow, value: any) => {
    setItems(items.map(item => {
      if (item.key === key) {
        const updated = { ...item, [field]: value };
        if (field === 'productId') {
          const product = productsData?.find((p: any) => p.id === value);
          if (product) {
            updated.productName = product.name;
            updated.unit = (product as any).unit || 'Adet';
          }
        }
        return updated;
      }
      return item;
    }));
  };

  const handleSubmit = async (values: any) => {
    if (items.length === 0) {
      message.error('En az bir ürün eklemelisiniz');
      return;
    }

    if (selectedSuppliers.length === 0) {
      message.error('En az bir tedarikçi seçmelisiniz');
      return;
    }

    const data: CreateQuotationDto = {
      title: values.title,
      description: values.description,
      responseDeadline: values.responseDeadline?.toISOString(),
      validityPeriod: values.validityPeriod,
      currency: values.currency || 'TRY',
      deliveryLocation: values.deliveryLocation,
      paymentTerms: values.paymentTerms,
      notes: values.notes,
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unit: item.unit,
        specifications: item.specifications,
      })),
      supplierIds: selectedSuppliers,
    };

    try {
      await createMutation.mutateAsync(data);
      router.push('/purchase/quotations');
    } catch (error) {
      // Error handled by hook
    }
  };

  const itemColumns = [
    {
      title: 'Ürün',
      dataIndex: 'productId',
      key: 'productId',
      width: 250,
      render: (_: any, record: QuotationItemRow) => (
        <Select
          style={{ width: '100%' }}
          placeholder="Ürün seçin"
          value={record.productId || undefined}
          onChange={(value) => handleItemChange(record.key, 'productId', value)}
          showSearch
          optionFilterProp="children"
          loading={productsLoading}
        >
          {productsData?.map((product: any) => (
            <Select.Option key={product.id} value={product.id}>
              {product.name} ({product.sku})
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Miktar',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 120,
      render: (_: any, record: QuotationItemRow) => (
        <InputNumber
          min={1}
          value={record.quantity}
          onChange={(value) => handleItemChange(record.key, 'quantity', value || 1)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Birim',
      dataIndex: 'unit',
      key: 'unit',
      width: 120,
      render: (_: any, record: QuotationItemRow) => (
        <Select
          value={record.unit}
          onChange={(value) => handleItemChange(record.key, 'unit', value)}
          style={{ width: '100%' }}
        >
          <Select.Option value="Adet">Adet</Select.Option>
          <Select.Option value="Kg">Kg</Select.Option>
          <Select.Option value="Lt">Lt</Select.Option>
          <Select.Option value="Mt">Mt</Select.Option>
          <Select.Option value="Paket">Paket</Select.Option>
          <Select.Option value="Kutu">Kutu</Select.Option>
        </Select>
      ),
    },
    {
      title: 'Özellikler',
      dataIndex: 'specifications',
      key: 'specifications',
      render: (_: any, record: QuotationItemRow) => (
        <Input
          placeholder="Ürün özellikleri..."
          value={record.specifications}
          onChange={(e) => handleItemChange(record.key, 'specifications', e.target.value)}
        />
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      render: (_: any, record: QuotationItemRow) => (
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
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          icon={<ArrowLeftIcon className="w-4 h-4" />}
          onClick={() => router.back()}
        />
        <div>
          <Title level={3} className="mb-1">Yeni Teklif Talebi</Title>
          <Text type="secondary">Tedarikçilerden teklif isteği oluşturun</Text>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          currency: 'TRY',
          validityPeriod: 30,
        }}
      >
        <Row gutter={24}>
          {/* Left Panel */}
          <Col xs={24} lg={10}>
            {/* Visual Card */}
            <Card bordered={false} className="shadow-sm mb-6">
              <div
                style={{
                  background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
                  borderRadius: '12px',
                  padding: '32px 20px',
                  minHeight: '180px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <DocumentTextIcon className="w-4 h-4" style={{ fontSize: '56px', color: 'rgba(255,255,255,0.9)' }} />
                <p className="mt-4 text-lg font-medium text-white/90">
                  Teklif Talebi (RFQ)
                </p>
                <p className="text-sm text-white/60">
                  Tedarikçilerden fiyat teklifi alın
                </p>
              </div>
            </Card>

            {/* Supplier Selection */}
            <Card
              title={
                <Space>
                  <BuildingStorefrontIcon className="w-4 h-4" />
                  <span>Tedarikçiler</span>
                </Space>
              }
              bordered={false}
              className="shadow-sm"
            >
              <Form.Item
                label="Teklif İstenen Tedarikçiler"
                required
                help="En az bir tedarikçi seçmelisiniz"
              >
                <Select
                  mode="multiple"
                  style={{ width: '100%' }}
                  placeholder="Tedarikçi seçin"
                  value={selectedSuppliers}
                  onChange={setSelectedSuppliers}
                  loading={suppliersLoading}
                  optionFilterProp="children"
                  showSearch
                >
                  {suppliersData?.items?.map(supplier => (
                    <Select.Option key={supplier.id} value={supplier.id}>
                      {supplier.name} ({supplier.code})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <div className="text-sm text-gray-500 mt-2">
                Seçilen: {selectedSuppliers.length} tedarikçi
              </div>
            </Card>
          </Col>

          {/* Right Panel */}
          <Col xs={24} lg={14}>
            <Card bordered={false} className="shadow-sm mb-6">
              {/* Title - Hero Input */}
              <Form.Item
                name="title"
                rules={[
                  { required: true, message: 'Başlık zorunludur' },
                  { max: 200, message: 'En fazla 200 karakter' },
                ]}
                className="mb-4"
              >
                <Input
                  placeholder="Teklif talebi başlığı"
                  variant="borderless"
                  style={{
                    fontSize: '24px',
                    fontWeight: 600,
                    padding: '0',
                    color: '#1a1a1a',
                  }}
                  className="placeholder:text-gray-300"
                />
              </Form.Item>

              <Form.Item name="description" className="mb-6">
                <TextArea
                  placeholder="Teklif talebi hakkında açıklama..."
                  variant="borderless"
                  autoSize={{ minRows: 2, maxRows: 4 }}
                  style={{
                    fontSize: '15px',
                    padding: '0',
                    color: '#666',
                  }}
                  className="placeholder:text-gray-300"
                />
              </Form.Item>

              <Divider />

              {/* Details */}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="responseDeadline"
                    label="Son Teklif Tarihi"
                    rules={[{ required: true, message: 'Zorunlu' }]}
                  >
                    <DatePicker
                      style={{ width: '100%' }}
                      format="DD.MM.YYYY"
                      placeholder="Tarih seçin"
                      disabledDate={(current) => current && current < dayjs().startOf('day')}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="validityPeriod"
                    label="Geçerlilik Süresi (Gün)"
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      min={1}
                      max={365}
                      placeholder="30"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="currency" label="Para Birimi">
                    <Select placeholder="Seçin">
                      <Select.Option value="TRY">TRY (₺)</Select.Option>
                      <Select.Option value="USD">USD ($)</Select.Option>
                      <Select.Option value="EUR">EUR (€)</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="paymentTerms" label="Ödeme Koşulları">
                    <Select placeholder="Seçin">
                      <Select.Option value="Prepaid">Peşin</Select.Option>
                      <Select.Option value="Net30">Net 30 Gün</Select.Option>
                      <Select.Option value="Net60">Net 60 Gün</Select.Option>
                      <Select.Option value="Net90">Net 90 Gün</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="deliveryLocation" label="Teslimat Yeri">
                <Input placeholder="Teslimat adresi veya lokasyonu" />
              </Form.Item>

              <Form.Item name="notes" label="Notlar">
                <TextArea
                  rows={3}
                  placeholder="Ek notlar ve açıklamalar..."
                />
              </Form.Item>
            </Card>

            {/* Items */}
            <Card
              title="Ürünler"
              bordered={false}
              className="shadow-sm"
              extra={
                <Button
                  type="dashed"
                  icon={<PlusIcon className="w-4 h-4" />}
                  onClick={handleAddItem}
                >
                  Ürün Ekle
                </Button>
              }
            >
              <Table
                columns={itemColumns}
                dataSource={items}
                pagination={false}
                size="small"
                locale={{ emptyText: 'Henüz ürün eklenmedi' }}
              />

              {items.length > 0 && (
                <div className="mt-4 text-right text-sm text-gray-500">
                  Toplam: {items.length} ürün
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <Button onClick={() => router.back()}>
            İptal
          </Button>
          <Button
            type="primary"
            icon={<CheckIcon className="w-4 h-4" />}
            htmlType="submit"
            loading={createMutation.isPending}
          >
            Kaydet
          </Button>
        </div>
      </Form>
    </div>
  );
}
