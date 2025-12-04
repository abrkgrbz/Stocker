'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Space,
  InputNumber,
  Typography,
  Row,
  Col,
  message,
  Table,
  AutoComplete,
  Switch,
  Divider,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  GiftOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import {
  useProducts,
  useCreateProductBundle,
} from '@/lib/api/hooks/useInventory';
import {
  BundleType,
  BundlePricingType,
  type CreateProductBundleDto,
  type CreateProductBundleItemDto,
} from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface BundleItem extends CreateProductBundleItemDto {
  key: string;
  productCode?: string;
  productName?: string;
  productPrice?: number;
}

const bundleTypes: { value: BundleType; label: string }[] = [
  { value: BundleType.Fixed, label: 'Sabit' },
  { value: BundleType.Configurable, label: 'Yapılandırılabilir' },
  { value: BundleType.Kit, label: 'Kit' },
  { value: BundleType.Package, label: 'Paket' },
  { value: BundleType.Combo, label: 'Kombo' },
];

const pricingTypes: { value: BundlePricingType; label: string }[] = [
  { value: BundlePricingType.FixedPrice, label: 'Sabit Fiyat' },
  { value: BundlePricingType.DynamicSum, label: 'Dinamik Toplam' },
  { value: BundlePricingType.DiscountedSum, label: 'İndirimli Toplam' },
  { value: BundlePricingType.PercentageDiscount, label: 'Yüzde İndirim' },
];

export default function NewProductBundlePage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [items, setItems] = useState<BundleItem[]>([]);
  const [pricingType, setPricingType] = useState<BundlePricingType>(BundlePricingType.FixedPrice);

  const { data: products = [] } = useProducts();
  const createBundle = useCreateProductBundle();

  const handleAddItem = () => {
    const newItem: BundleItem = {
      key: `item-${Date.now()}`,
      productId: 0,
      quantity: 1,
      isRequired: true,
      isDefault: true,
      displayOrder: items.length + 1,
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (key: string) => {
    setItems(items.filter((item) => item.key !== key));
  };

  const handleItemChange = (key: string, field: keyof BundleItem, value: unknown) => {
    setItems(
      items.map((item) => {
        if (item.key === key) {
          if (field === 'productId' && typeof value === 'number') {
            const product = products.find((p) => p.id === value);
            return {
              ...item,
              productId: value,
              productCode: product?.code,
              productName: product?.name,
              productPrice: product?.unitPrice,
            };
          }
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (items.length === 0) {
        message.error('En az bir ürün ekleyin');
        return;
      }

      const invalidItems = items.filter((item) => !item.productId);
      if (invalidItems.length > 0) {
        message.error('Tüm ürünleri seçin');
        return;
      }

      const data: CreateProductBundleDto = {
        code: values.code,
        name: values.name,
        description: values.description,
        bundleType: values.bundleType,
        pricingType: values.pricingType,
        fixedPrice: values.fixedPrice,
        fixedPriceCurrency: 'TRY',
        discountPercentage: values.discountPercentage,
        discountAmount: values.discountAmount,
        requireAllItems: values.requireAllItems,
        minSelectableItems: values.minSelectableItems,
        maxSelectableItems: values.maxSelectableItems,
        validFrom: values.validFrom?.toISOString(),
        validTo: values.validTo?.toISOString(),
        imageUrl: values.imageUrl,
        displayOrder: values.displayOrder || 0,
        items: items.map((item, index) => ({
          productId: item.productId,
          quantity: item.quantity,
          isRequired: item.isRequired,
          isDefault: item.isDefault,
          overridePrice: item.overridePrice,
          overridePriceCurrency: item.overridePrice ? 'TRY' : undefined,
          discountPercentage: item.discountPercentage,
          displayOrder: index + 1,
          minQuantity: item.minQuantity,
          maxQuantity: item.maxQuantity,
        })),
      };

      await createBundle.mutateAsync(data);
      router.push('/inventory/product-bundles');
    } catch {
      // Validation error
    }
  };

  const calculatedTotal = items.reduce((sum, item) => {
    const price = item.overridePrice || item.productPrice || 0;
    return sum + price * (item.quantity || 1);
  }, 0);

  const itemColumns: ColumnsType<BundleItem> = [
    {
      title: 'Ürün',
      dataIndex: 'productId',
      key: 'productId',
      width: 300,
      render: (_, record) => (
        <AutoComplete
          placeholder="Ürün seçin..."
          value={record.productName || ''}
          options={products.map((p) => ({
            value: String(p.id),
            label: `${p.code} - ${p.name}`,
          }))}
          onSelect={(value) => handleItemChange(record.key, 'productId', Number(value))}
          filterOption={(input, option) =>
            option?.label?.toLowerCase().includes(input.toLowerCase()) ?? false
          }
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Miktar',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      render: (_, record) => (
        <InputNumber
          min={1}
          value={record.quantity}
          onChange={(value) => handleItemChange(record.key, 'quantity', value || 1)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Fiyat',
      key: 'price',
      width: 120,
      render: (_, record) => (
        <InputNumber
          placeholder={record.productPrice?.toString() || '0'}
          value={record.overridePrice}
          onChange={(value) => handleItemChange(record.key, 'overridePrice', value)}
          style={{ width: '100%' }}
          prefix="₺"
        />
      ),
    },
    {
      title: 'Zorunlu',
      dataIndex: 'isRequired',
      key: 'isRequired',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <Switch
          size="small"
          checked={record.isRequired}
          onChange={(checked) => handleItemChange(record.key, 'isRequired', checked)}
        />
      ),
    },
    {
      title: 'Varsayılan',
      dataIndex: 'isDefault',
      key: 'isDefault',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <Switch
          size="small"
          checked={record.isDefault}
          onChange={(checked) => handleItemChange(record.key, 'isDefault', checked)}
        />
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (_, record) => (
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
    <div className="max-w-5xl mx-auto">
      {/* Sticky Header */}
      <div
        className="sticky top-0 z-10 -mx-6 px-6 py-4 mb-6"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          marginTop: '-24px',
          paddingTop: '24px',
        }}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
              Geri
            </Button>
            <div className="h-6 w-px bg-gray-200" />
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
              >
                <GiftOutlined style={{ fontSize: 20, color: 'white' }} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 m-0">Yeni Ürün Paketi</h1>
                <p className="text-sm text-gray-500 m-0">Ürün paketi veya kombo oluşturun</p>
              </div>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.back()}>İptal</Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSubmit}
              loading={createBundle.isPending}
              style={{ background: '#f59e0b', borderColor: '#f59e0b' }}
            >
              Kaydet
            </Button>
          </Space>
        </div>
      </div>

      {/* Form */}
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          bundleType: 'Fixed',
          pricingType: 'FixedPrice',
          requireAllItems: true,
          displayOrder: 0,
        }}
      >
        <Row gutter={24}>
          <Col xs={24} md={16}>
            <Card title="Paket Bilgileri" className="mb-6">
              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Form.Item
                    name="code"
                    label="Paket Kodu"
                    rules={[{ required: true, message: 'Kod gerekli' }]}
                  >
                    <Input placeholder="BND-001" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={16}>
                  <Form.Item
                    name="name"
                    label="Paket Adı"
                    rules={[{ required: true, message: 'Ad gerekli' }]}
                  >
                    <Input placeholder="Başlangıç Paketi" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="description" label="Açıklama">
                <TextArea rows={3} placeholder="Paket açıklaması..." />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="bundleType"
                    label="Paket Tipi"
                    rules={[{ required: true, message: 'Tip seçin' }]}
                  >
                    <Select options={bundleTypes} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="pricingType"
                    label="Fiyatlandırma Tipi"
                    rules={[{ required: true, message: 'Fiyatlandırma tipi seçin' }]}
                  >
                    <Select
                      options={pricingTypes}
                      onChange={(value) => setPricingType(value)}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card
              title="Paket Ürünleri"
              className="mb-6"
              extra={
                <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddItem}>
                  Ürün Ekle
                </Button>
              }
            >
              <Table
                columns={itemColumns}
                dataSource={items}
                rowKey="key"
                pagination={false}
                size="small"
                locale={{ emptyText: 'Henüz ürün eklenmedi' }}
              />

              {items.length > 0 && (
                <>
                  <Divider />
                  <div className="flex justify-end">
                    <div className="text-right">
                      <Text type="secondary">Hesaplanan Toplam:</Text>
                      <div className="text-2xl font-bold text-orange-500">
                        {calculatedTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                      </div>
                    </div>
                  </div>
                </>
              )}
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card title="Fiyatlandırma" className="mb-6">
              {(pricingType === 'FixedPrice') && (
                <Form.Item name="fixedPrice" label="Sabit Fiyat">
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    precision={2}
                    prefix="₺"
                    placeholder="0.00"
                  />
                </Form.Item>
              )}

              {(pricingType === 'PercentageDiscount' || pricingType === 'DiscountedSum') && (
                <Form.Item name="discountPercentage" label="İndirim Yüzdesi">
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    max={100}
                    precision={2}
                    suffix="%"
                    placeholder="0"
                  />
                </Form.Item>
              )}

              {pricingType === 'DiscountedSum' && (
                <Form.Item name="discountAmount" label="İndirim Tutarı">
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    precision={2}
                    prefix="₺"
                    placeholder="0.00"
                  />
                </Form.Item>
              )}
            </Card>

            <Card title="Seçenekler" className="mb-6">
              <Form.Item name="requireAllItems" label="Tüm Ürünler Zorunlu" valuePropName="checked">
                <Switch />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="minSelectableItems" label="Min Seçim">
                    <InputNumber style={{ width: '100%' }} min={0} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="maxSelectableItems" label="Max Seçim">
                    <InputNumber style={{ width: '100%' }} min={0} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card title="Geçerlilik">
              <Form.Item name="validFrom" label="Başlangıç Tarihi">
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>

              <Form.Item name="validTo" label="Bitiş Tarihi">
                <DatePicker
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  disabledDate={(current) => {
                    const validFrom = form.getFieldValue('validFrom');
                    return validFrom && current && current < validFrom;
                  }}
                />
              </Form.Item>

              <Form.Item name="displayOrder" label="Görüntüleme Sırası">
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
}
