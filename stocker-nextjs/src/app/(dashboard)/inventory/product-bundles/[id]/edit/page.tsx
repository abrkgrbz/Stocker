'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  Spin,
  Empty,
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
  useProductBundle,
  useProducts,
  useUpdateProductBundle,
} from '@/lib/api/hooks/useInventory';
import {
  BundleType,
  BundlePricingType,
  type UpdateProductBundleDto,
} from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Text } = Typography;
const { TextArea } = Input;

interface BundleItem {
  key: string;
  productId: number;
  productCode?: string;
  productName?: string;
  productPrice?: number;
  quantity: number;
  isRequired: boolean;
  isDefault: boolean;
  overridePrice?: number;
  displayOrder: number;
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

export default function EditProductBundlePage() {
  const router = useRouter();
  const params = useParams();
  const bundleId = Number(params.id);
  const [form] = Form.useForm();
  const [items, setItems] = useState<BundleItem[]>([]);
  const [pricingType, setPricingType] = useState<BundlePricingType>(BundlePricingType.FixedPrice);

  const { data: bundle, isLoading } = useProductBundle(bundleId);
  const { data: products = [] } = useProducts();
  const updateBundle = useUpdateProductBundle();

  useEffect(() => {
    if (bundle) {
      form.setFieldsValue({
        code: bundle.code,
        name: bundle.name,
        description: bundle.description,
        bundleType: bundle.bundleType,
        pricingType: bundle.pricingType,
        fixedPrice: bundle.fixedPrice,
        discountPercentage: bundle.discountPercentage,
        discountAmount: bundle.discountAmount,
        requireAllItems: bundle.requireAllItems,
        minSelectableItems: bundle.minSelectableItems,
        maxSelectableItems: bundle.maxSelectableItems,
        validFrom: bundle.validFrom ? dayjs(bundle.validFrom) : undefined,
        validTo: bundle.validTo ? dayjs(bundle.validTo) : undefined,
        displayOrder: bundle.displayOrder,
        isActive: bundle.isActive,
      });
      setPricingType(bundle.pricingType);
      if (bundle.items) {
        setItems(
          bundle.items.map((item, index) => ({
            key: `item-${item.id || index}`,
            productId: item.productId,
            productCode: item.productCode,
            productName: item.productName,
            productPrice: item.productPrice,
            quantity: item.quantity,
            isRequired: item.isRequired,
            isDefault: item.isDefault,
            overridePrice: item.overridePrice,
            displayOrder: item.displayOrder,
          }))
        );
      }
    }
  }, [bundle, form]);

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

      const data: UpdateProductBundleDto = {
        name: values.name,
        description: values.description,
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
        displayOrder: values.displayOrder || 0,
      };

      await updateBundle.mutateAsync({ id: bundleId, data });
      router.push(`/inventory/product-bundles/${bundleId}`);
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  if (!bundle) {
    return (
      <div className="flex justify-center items-center h-96">
        <Empty description="Paket bulunamadı" />
      </div>
    );
  }

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
                <h1 className="text-xl font-semibold text-gray-900 m-0">Paket Düzenle</h1>
                <p className="text-sm text-gray-500 m-0">{bundle.name}</p>
              </div>
            </div>
          </div>
          <Space>
            <Button onClick={() => router.back()}>İptal</Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSubmit}
              loading={updateBundle.isPending}
              style={{ background: '#f59e0b', borderColor: '#f59e0b' }}
            >
              Kaydet
            </Button>
          </Space>
        </div>
      </div>

      {/* Form */}
      <Form form={form} layout="vertical">
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
                  <Form.Item name="bundleType" label="Paket Tipi">
                    <Select options={bundleTypes} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="pricingType" label="Fiyatlandırma Tipi">
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
              {pricingType === BundlePricingType.FixedPrice && (
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

              {(pricingType === BundlePricingType.PercentageDiscount ||
                pricingType === BundlePricingType.DiscountedSum) && (
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

              {pricingType === BundlePricingType.DiscountedSum && (
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

            <Card title="Geçerlilik" className="mb-6">
              <Form.Item name="validFrom" label="Başlangıç Tarihi">
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>

              <Form.Item name="validTo" label="Bitiş Tarihi">
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Card>

            <Card title="Ayarlar">
              <Form.Item name="isActive" label="Aktif" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item name="requireAllItems" label="Tüm Ürünler Zorunlu" valuePropName="checked">
                <Switch />
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
