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
  Switch,
  message,
} from 'antd';
import {
  ArrowLeftIcon,
  CheckIcon,
  CurrencyDollarIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import { useCreatePriceList } from '@/lib/api/hooks/usePurchase';
import { useSuppliers } from '@/lib/api/hooks/usePurchase';
import { useProducts } from '@/lib/api/hooks/useInventory';
import type { CreatePriceListDto, CreatePriceListItemDto, PriceListType } from '@/lib/api/services/purchase.types';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface PriceListItemRow extends CreatePriceListItemDto {
  key: string;
  productName?: string;
}

export default function NewPriceListPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [items, setItems] = useState<PriceListItemRow[]>([]);
  const [isActive, setIsActive] = useState(true);

  const createMutation = useCreatePriceList();
  const { data: suppliersData, isLoading: suppliersLoading } = useSuppliers();
  const { data: productsData, isLoading: productsLoading } = useProducts();

  const handleAddItem = () => {
    const newItem: PriceListItemRow = {
      key: Date.now().toString(),
      productId: '',
      basePrice: 0,
      minQuantity: 1,
      unit: 'Adet',
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (key: string) => {
    setItems(items.filter(item => item.key !== key));
  };

  const handleItemChange = (key: string, field: keyof PriceListItemRow, value: any) => {
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

    const data: CreatePriceListDto = {
      code: values.code,
      name: values.name,
      description: values.description,
      type: 'Standard' as PriceListType,
      supplierId: values.supplierId,
      currency: values.currency || 'TRY',
      effectiveFrom: values.effectiveFrom?.toISOString() || new Date().toISOString(),
      effectiveTo: values.effectiveTo?.toISOString(),
      isDefault: values.isDefault || false,
      notes: values.notes,
      items: items.map(item => ({
        productId: item.productId,
        basePrice: item.basePrice,
        minQuantity: item.minQuantity || 1,
        unit: item.unit,
        discountPercentage: item.discountPercentage,
      })),
    };

    try {
      await createMutation.mutateAsync(data);
      router.push('/purchase/price-lists');
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
      render: (_: any, record: PriceListItemRow) => (
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
      title: 'Birim Fiyat',
      dataIndex: 'basePrice',
      key: 'basePrice',
      width: 140,
      render: (_: any, record: PriceListItemRow) => (
        <InputNumber
          min={0}
          precision={2}
          value={record.basePrice}
          onChange={(value) => handleItemChange(record.key, 'basePrice', value || 0)}
          style={{ width: '100%' }}
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value: string | undefined) => Number(value?.replace(/,/g, '') ?? 0)}
        />
      ),
    },
    {
      title: 'Min. Miktar',
      dataIndex: 'minQuantity',
      key: 'minQuantity',
      width: 100,
      render: (_: any, record: PriceListItemRow) => (
        <InputNumber
          min={1}
          value={record.minQuantity}
          onChange={(value) => handleItemChange(record.key, 'minQuantity', value || 1)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Birim',
      dataIndex: 'unit',
      key: 'unit',
      width: 100,
      render: (_: any, record: PriceListItemRow) => (
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
        </Select>
      ),
    },
    {
      title: 'İndirim %',
      dataIndex: 'discountPercentage',
      key: 'discountPercentage',
      width: 100,
      render: (_: any, record: PriceListItemRow) => (
        <InputNumber
          min={0}
          max={100}
          value={record.discountPercentage}
          onChange={(value) => handleItemChange(record.key, 'discountPercentage', value || undefined)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      render: (_: any, record: PriceListItemRow) => (
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
        <Button icon={<ArrowLeftIcon className="w-4 h-4" />} onClick={() => router.back()} />
        <div>
          <Title level={3} className="mb-1">Yeni Fiyat Listesi</Title>
          <Text type="secondary">Tedarikçi fiyat listesi oluşturun</Text>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          currency: 'TRY',
          isDefault: false,
        }}
      >
        <Row gutter={24}>
          {/* Left Panel */}
          <Col xs={24} lg={10}>
            <Card bordered={false} className="shadow-sm mb-6">
              <div
                style={{
                  background: 'linear-gradient(135deg, #52c41a 0%, #1890ff 100%)',
                  borderRadius: '12px',
                  padding: '32px 20px',
                  minHeight: '180px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CurrencyDollarIcon className="w-4 h-4" style={{ fontSize: '56px', color: 'rgba(255,255,255,0.9)' }} />
                <p className="mt-4 text-lg font-medium text-white/90">Fiyat Listesi</p>
                <p className="text-sm text-white/60">Tedarikçi fiyatlarını tanımlayın</p>
              </div>
            </Card>

            {/* Status */}
            <Card bordered={false} className="shadow-sm">
              <div className="flex items-center justify-between p-2 bg-gray-50/50 rounded-xl">
                <div>
                  <Text strong className="text-gray-700">Durum</Text>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {isActive ? 'Liste aktif ve kullanılabilir' : 'Liste pasif durumda'}
                  </div>
                </div>
                <Switch
                  checked={isActive}
                  onChange={setIsActive}
                  checkedChildren="Aktif"
                  unCheckedChildren="Pasif"
                />
              </div>

              <Divider />

              <Form.Item name="isDefault" valuePropName="checked">
                <div className="flex items-center justify-between">
                  <div>
                    <Text strong className="text-gray-700">Varsayılan Liste</Text>
                    <div className="text-xs text-gray-400 mt-0.5">
                      Bu tedarikçi için varsayılan fiyat listesi
                    </div>
                  </div>
                  <Switch />
                </div>
              </Form.Item>
            </Card>
          </Col>

          {/* Right Panel */}
          <Col xs={24} lg={14}>
            <Card bordered={false} className="shadow-sm mb-6">
              {/* Name - Hero Input */}
              <Form.Item
                name="name"
                rules={[
                  { required: true, message: 'Liste adı zorunludur' },
                  { max: 200, message: 'En fazla 200 karakter' },
                ]}
                className="mb-4"
              >
                <Input
                  placeholder="Fiyat listesi adı"
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
                  placeholder="Liste hakkında açıklama..."
                  variant="borderless"
                  autoSize={{ minRows: 2, maxRows: 4 }}
                  style={{ fontSize: '15px', padding: '0', color: '#666' }}
                  className="placeholder:text-gray-300"
                />
              </Form.Item>

              <Divider />

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="code"
                    label="Liste Kodu"
                    rules={[{ required: true, message: 'Zorunlu' }]}
                  >
                    <Input placeholder="PL-001" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="supplierId" label="Tedarikçi">
                    <Select
                      placeholder="Tedarikçi seçin"
                      allowClear
                      showSearch
                      optionFilterProp="children"
                      loading={suppliersLoading}
                    >
                      {suppliersData?.items?.map(supplier => (
                        <Select.Option key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item name="currency" label="Para Birimi">
                    <Select placeholder="Seçin">
                      <Select.Option value="TRY">TRY (₺)</Select.Option>
                      <Select.Option value="USD">USD ($)</Select.Option>
                      <Select.Option value="EUR">EUR (€)</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="effectiveFrom" label="Başlangıç Tarihi">
                    <DatePicker
                      style={{ width: '100%' }}
                      format="DD.MM.YYYY"
                      placeholder="Tarih"
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="effectiveTo" label="Bitiş Tarihi">
                    <DatePicker
                      style={{ width: '100%' }}
                      format="DD.MM.YYYY"
                      placeholder="Tarih"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="notes" label="Notlar">
                <TextArea rows={2} placeholder="Ek notlar..." />
              </Form.Item>
            </Card>

            {/* Items */}
            <Card
              title="Fiyat Kalemleri"
              bordered={false}
              className="shadow-sm"
              extra={
                <Button type="dashed" icon={<PlusIcon className="w-4 h-4" />} onClick={handleAddItem}>
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
                scroll={{ x: 750 }}
              />
              {items.length > 0 && (
                <div className="mt-4 text-right text-sm text-gray-500">
                  Toplam: {items.length} ürün
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <Button onClick={() => router.back()}>İptal</Button>
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
